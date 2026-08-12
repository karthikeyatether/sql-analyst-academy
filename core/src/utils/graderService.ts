import type { QueryResult } from "./sqlEngine";

export interface GraderResult {
  isCorrect: boolean;
  message: string;
  details?: string;
  warning?: string;
}

export interface GraderOptions {
  userQuery: string;
  solutionSql: string;
  userResult: QueryResult;
  expectedResult: QueryResult;
  userSnapshot?: Record<string, any[]> | null;
  expectedSnapshot?: Record<string, any[]> | null;
  strictMode?: boolean;
  playgroundMode?: string;
  promptText?: string;
  isFlawedQueryUnchanged?: boolean;
}

/**
 * Robust helper utility to detect mutating DML/DDL queries anywhere in SQL.
 * Strips comments first and checks for DML keywords.
 */
export function isModifyingQuery(sqlText: string): boolean {
  if (!sqlText) return false;
  const clean = sqlText.replace(/(--.*)|(\/\*[\s\S]*?\*\/)/g, ""); // Strip comments
  return /\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|REPLACE|TRUNCATE|MERGE)\b/i.test(
    clean,
  );
}

/**
 * Normalizes SQL by stripping single-line/multi-line comments and collapsing whitespace.
 */
function cleanSqlText(sqlText: string): string {
  if (!sqlText) return "";
  return sqlText
    .replace(/(--[^\r\n]*)|(\/\*[\s\S]*?\*\/)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Encapsulates SQL query grading, technique validation, column matching,
 * row value comparison, floating-point tolerance, and anti-cheat checks.
 */
export function gradeQuery(options: GraderOptions): GraderResult {
  const {
    userQuery,
    solutionSql,
    userResult,
    expectedResult,
    userSnapshot,
    expectedSnapshot,
    strictMode = false,
    promptText = "",
    isFlawedQueryUnchanged = false,
    playgroundMode = "practice",
  } = options;

  // 0. Query Error & Unmodified Flawed Query Guards
  if (userResult.error) {
    return {
      isCorrect: false,
      message: "Query Error",
      details: userResult.error,
    };
  }
  if (expectedResult.error) {
    return {
      isCorrect: false,
      message: "System Solution Error",
      details: expectedResult.error,
    };
  }

  if (isFlawedQueryUnchanged) {
    return {
      isCorrect: false,
      message: "Unmodified Flawed Query",
      details:
        "You ran the original flawed query without making modifications. You must find the bug and edit the query to solve the puzzle!",
    };
  }

  const cleanUserSql = cleanSqlText(userQuery);
  const cleanSolSql = cleanSqlText(solutionSql);
  const promptLower = promptText.toLowerCase();

  // 1. Technique checks (enforce stated prompt constraints — required & forbidden)
  if (playgroundMode !== "puzzle") {
    try {
      // Required technique checks
      if (
        /\b(full\s+join|full\s+outer\s+join|union\s+all|union)\b/i.test(
          promptLower,
        ) &&
        !/\b(FULL\s+JOIN|FULL\s+OUTER\s+JOIN|UNION)\b/i.test(cleanUserSql)
      ) {
        return {
          isCorrect: false,
          message: "Missing Required SQL Technique",
          details:
            "Your query must explicitly use FULL JOIN or UNION to combine records as required by the prompt.",
        };
      }

      if (
        /\b(left\s+anti-join|unmatched|no\s+orders|never\s+placed)\b/i.test(
          promptLower,
        ) &&
        !/\b(IS\s+NULL|NOT\s+IN|NOT\s+EXISTS)\b/i.test(cleanUserSql)
      ) {
        return {
          isCorrect: false,
          message: "Missing Required Anti-Join Filter",
          details:
            "Your query is missing a required NULL check (IS NULL), NOT IN, or NOT EXISTS clause to filter unmatched records.",
        };
      }

      if (
        /\bhaving\b/i.test(promptLower) &&
        !/\bHAVING\b/i.test(cleanUserSql)
      ) {
        return {
          isCorrect: false,
          message: "Missing Required SQL Technique",
          details:
            "Your query must use a HAVING clause to filter aggregated values as required by the prompt.",
        };
      }

      if (
        /\b(cte|with\s+clause|common\s+table\s+expression)\b/i.test(
          promptLower,
        ) &&
        !/\bWITH\b/i.test(cleanUserSql)
      ) {
        return {
          isCorrect: false,
          message: "Missing Required SQL Technique",
          details:
            "Your query must use a Common Table Expression (WITH clause) as specified in the prompt.",
        };
      }

      if (
        /\b(window\s+function|over\s*\(|row_number|dense_rank|rank\(\)|lead\(\)|lag\(\))\b/i.test(
          promptLower,
        ) &&
        !/\bOVER\s*\(/i.test(cleanUserSql)
      ) {
        return {
          isCorrect: false,
          message: "Missing Required SQL Technique",
          details:
            "Your query must use a window function (OVER clause) as specified in the prompt.",
        };
      }

      // Forbidden technique checks
      if (
        /\b(without\s+a\s+subquery|without\s+subquery|no\s+subqueries)\b/i.test(
          promptLower,
        )
      ) {
        // Check for true subquery pattern: parenthesized SELECT statement
        const hasSubquery = /\(\s*SELECT\b/i.test(cleanUserSql);
        if (hasSubquery) {
          return {
            isCorrect: false,
            message: "Constraint Violated",
            details:
              "The prompt specifies solving this problem without using a subquery.",
          };
        }
      }

      if (
        /\b(without\s+join|without\s+using\s+join|no\s+join)\b/i.test(
          promptLower,
        ) &&
        /\bJOIN\b/i.test(cleanUserSql)
      ) {
        return {
          isCorrect: false,
          message: "Constraint Violated",
          details:
            "The prompt specifies solving this problem without using a JOIN.",
        };
      }

      if (/\b(single\s+select|only\s+one\s+select)\b/i.test(promptLower)) {
        const selectMatches = cleanUserSql.match(/\bSELECT\b/gi);
        if (selectMatches && selectMatches.length > 1) {
          return {
            isCorrect: false,
            message: "Constraint Violated",
            details: "The prompt specifies using only one SELECT statement.",
          };
        }
      }
    } catch (e) {
      console.warn("Technique verification failed:", e);
    }
  }

  // 2. DML/DDL Snapshot check
  const isDmlOrDdl = isModifyingQuery(solutionSql);

  if (isDmlOrDdl) {
    if (!userSnapshot || !expectedSnapshot) {
      return {
        isCorrect: false,
        message: "State Check Failed",
        details: "Unable to inspect database tables for state verification.",
      };
    }

    const canonicalSnapshot = (snap: Record<string, any[]>) => {
      const sortedKeys = Object.keys(snap).sort();
      const result: Record<string, any[]> = {};
      for (const k of sortedKeys) {
        const rows = snap[k] || [];
        result[k] = [...rows].sort((a, b) =>
          JSON.stringify(a).localeCompare(JSON.stringify(b)),
        );
      }
      return JSON.stringify(result);
    };

    const match =
      canonicalSnapshot(userSnapshot) === canonicalSnapshot(expectedSnapshot);
    return {
      isCorrect: match,
      message: match ? "Correct Answer!" : "Database state mismatch",
      details: match
        ? "Database tables were updated correctly."
        : "The tables do not match the expected state after your query.",
    };
  }

  // 3. Schema (Column) check
  const expCols = expectedResult.columns;
  const userCols = userResult.columns;

  if (expCols.length > 0 && userCols.length === 0) {
    return {
      isCorrect: false,
      message: "No columns returned",
      details: `Expected ${expCols.length} columns: [${expCols.join(", ")}].`,
    };
  }

  const expColsLower = expCols.map((c) => c.toLowerCase());
  const userColsLower = userCols.map((c) => c.toLowerCase());
  const missing = expCols.filter(
    (c) => !userColsLower.includes(c.toLowerCase()),
  );
  const extra = userCols.filter((c) => !expColsLower.includes(c.toLowerCase()));

  if (missing.length > 0 || extra.length > 0) {
    const unaliasedExpr = userCols.find((uCol) => /[()+\-*/]/.test(uCol));
    if (unaliasedExpr && missing.length === 1) {
      return {
        isCorrect: false,
        message: "Missing Required Column Alias",
        details: `Your query returned the unaliased expression '${unaliasedExpr}'. You must alias it as '${missing[0]}' using 'AS ${missing[0]}'.`,
      };
    }

    return {
      isCorrect: false,
      message: "Columns do not match",
      details:
        `Expected columns: [${expCols.join(", ")}]. ` +
        (missing.length ? `Missing: [${missing.join(", ")}]. ` : "") +
        (extra.length ? `Extra: [${extra.join(", ")}].` : ""),
    };
  }

  if (userCols.length !== expCols.length) {
    return {
      isCorrect: false,
      message: "Column count mismatch",
      details: `Expected ${expCols.length} columns, but got ${userCols.length}.`,
    };
  }

  let warning: string | undefined = undefined;
  const orderMismatch = userCols.some(
    (c, i) => c.toLowerCase() !== expCols[i].toLowerCase(),
  );
  if (orderMismatch) {
    if (strictMode) {
      return {
        isCorrect: false,
        message: "Column order mismatch (Strict Mode)",
        details: `Strict Mode is enabled. Expected columns: [${expCols.join(", ")}]. Got: [${userCols.join(", ")}].`,
      };
    } else {
      warning =
        `Columns match but are in a different order. ` +
        `Expected: [${expCols.join(", ")}]. Got: [${userCols.join(", ")}]. ` +
        `Graded correct anyway!`;
    }
  }

  // 4. Anti-Cheat Check: Ensure user query queries from tables if solution does
  try {
    if (/\bFROM\b/i.test(cleanSolSql) && !/\bFROM\b/i.test(cleanUserSql)) {
      return {
        isCorrect: false,
        message: "Cheat Detection Alert",
        details:
          "Your query must query data from the database using a 'FROM' clause " +
          "instead of returning hardcoded constant values.",
      };
    }

    const tablesInSchema = [
      "customers",
      "orders",
      "products",
      "employees",
      "departments",
      "projects",
      "employee_projects",
    ];
    const referencedTables = tablesInSchema.filter((tbl) => {
      const regex = new RegExp(`\\b${tbl}\\b`, "i");
      return regex.test(cleanSolSql);
    });

    if (referencedTables.length > 0) {
      const userReferencesAny = referencedTables.some((tbl) => {
        const regex = new RegExp(`\\b${tbl}\\b`, "i");
        return regex.test(cleanUserSql);
      });
      if (!userReferencesAny) {
        return {
          isCorrect: false,
          message: "Cheat Detection Alert",
          details:
            `Your query must reference the appropriate database tables ` +
            `(e.g., ${referencedTables.join(", ")}).`,
        };
      }
    }
  } catch (err) {
    console.warn("Anti-cheat validation failed:", err);
  }

  // 5. Row Count Verification
  if (userResult.rows.length !== expectedResult.rows.length) {
    return {
      isCorrect: false,
      message: "Row count mismatch",
      details: `Expected ${expectedResult.rows.length} rows, but got ${userResult.rows.length} rows.`,
      warning,
    };
  }

  // 6. Value Normalization & Comparison Helpers
  const normalizeVal = (v: unknown): unknown => {
    if (v === null || v === undefined) return null;
    if (typeof v === "string" && v.trim().toUpperCase() === "NULL") return null;
    return v;
  };

  const isNumeric = (val: unknown): val is number | string => {
    if (typeof val === "number") return true;
    if (typeof val === "string" && val.trim() !== "") {
      return !isNaN(Number(val.trim()));
    }
    return false;
  };

  const isEqualValues = (a: unknown, b: unknown): boolean => {
    const normA = normalizeVal(a);
    const normB = normalizeVal(b);
    if (normA === normB) return true;
    if (normA === null || normB === null) return false;

    if (isNumeric(normA) && isNumeric(normB)) {
      const numA = Number(normA);
      const numB = Number(normB);
      // Floating-point check with 1e-4 epsilon
      return Math.abs(numA - numB) < 1e-4;
    }

    const strA = String(normA).trim();
    const strB = String(normB).trim();
    if (strA === strB) return true;

    return strA.toLowerCase() === strB.toLowerCase();
  };

  const uVals = userResult.rows.map((r) =>
    expCols.map((c) => {
      const actualKey =
        Object.keys(r).find((k) => k.toLowerCase() === c.toLowerCase()) || c;
      return normalizeVal(r[actualKey]);
    }),
  );
  const sVals = expectedResult.rows.map((r) =>
    expCols.map((c) => normalizeVal(r[c])),
  );

  const matchesExactly = (arrA: unknown[][], arrB: unknown[][]) => {
    if (arrA.length !== arrB.length) return false;
    for (let i = 0; i < arrA.length; i++) {
      for (let j = 0; j < expCols.length; j++) {
        if (!isEqualValues(arrA[i][j], arrB[i][j])) return false;
      }
    }
    return true;
  };

  // Row sorting helper for order-agnostic comparison
  const sortRows = (arr: unknown[][]) => {
    return [...arr].sort((rowA, rowB) => {
      for (let colIdx = 0; colIdx < expCols.length; colIdx++) {
        const valA = rowA[colIdx];
        const valB = rowB[colIdx];
        if (valA === valB) continue;
        if (valA === null) return -1;
        if (valB === null) return 1;

        if (isNumeric(valA) && isNumeric(valB)) {
          const diff = Number(valA) - Number(valB);
          if (Math.abs(diff) >= 1e-4) {
            return diff;
          }
          continue;
        }

        const strA = String(valA).trim().toLowerCase();
        const strB = String(valB).trim().toLowerCase();
        if (strA < strB) return -1;
        if (strA > strB) return 1;
      }
      return 0;
    });
  };

  // Determine if ordering is explicitly requested by prompt or strictMode
  const orderKeywords =
    /\b(sort|order|top|rank|descending|ascending|highest|lowest|latest|oldest|ordered|sorted)\b/i;
  const isOrderRequired = strictMode || orderKeywords.test(promptText);

  // If order matches directly:
  if (matchesExactly(uVals, sVals)) {
    return { isCorrect: true, message: "Correct Answer!", warning };
  }

  // If order is NOT required, attempt order-agnostic comparison
  if (!isOrderRequired) {
    const sortedU = sortRows(uVals);
    const sortedS = sortRows(sVals);
    if (matchesExactly(sortedU, sortedS)) {
      return { isCorrect: true, message: "Correct Answer!", warning };
    }
  }

  return {
    isCorrect: false,
    message: "Values mismatch",
    details:
      "Your query returned the correct columns and row count, but the row values or row ordering do not match the expected solution.",
    warning,
  };
}
