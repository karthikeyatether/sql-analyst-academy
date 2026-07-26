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
 * Encapsulates SQL query grading, technique validation, column matching, and anti-cheat checks.
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
  } = options;

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

  // Technique checks
  try {
    const promptLower = promptText.toLowerCase();
    const solCleanText = solutionSql
      .replace(/(--.*)|(\/\*[\s\S]*?\*\/)/g, "")
      .toLowerCase();
    const userSqlText = userQuery.replace(/(--.*)|(\/\*[\s\S]*?\*\/)/g, "");

    if (
      (/\b(full\s+join|full\s+outer\s+join|union)\b/i.test(promptLower) ||
        /\bunion\b/i.test(solCleanText)) &&
      !/\b(FULL\s+JOIN|FULL\s+OUTER\s+JOIN|UNION)\b/i.test(userSqlText)
    ) {
      return {
        isCorrect: false,
        message: "Missing Required SQL Technique",
        details:
          "Your query must explicitly use FULL JOIN or UNION to combine records as required.",
      };
    }

    if (
      (/\b(no\s+orders|placed\s+no|unmatched|left\s+anti-join|has\s+no|never\b)\b/i.test(
        promptLower,
      ) ||
        /\bis\s+null\b/i.test(solCleanText)) &&
      !/\b(IS\s+NULL|NOT\s+IN|NOT\s+EXISTS)\b/i.test(userSqlText)
    ) {
      return {
        isCorrect: false,
        message: "Missing Required Anti-Join Filter",
        details:
          "Your query is missing a required NULL check (IS NULL), NOT IN, or NOT EXISTS clause to filter unmatched records.",
      };
    }

    if (/\b(having)\b/i.test(promptLower) && !/\bHAVING\b/i.test(userSqlText)) {
      return {
        isCorrect: false,
        message: "Missing Required SQL Technique",
        details:
          "Your query must use a HAVING clause to filter aggregated values as required by the prompt.",
      };
    }

    if (
      /\b(cte|with\s+clause)\b/i.test(promptLower) &&
      !/\bWITH\b/i.test(userSqlText)
    ) {
      return {
        isCorrect: false,
        message: "Missing Required SQL Technique",
        details:
          "Your query must use a Common Table Expression (WITH clause) as specified in the prompt.",
      };
    }
  } catch (e) {
    console.warn("Technique verification failed:", e);
  }

  // DML/DDL check
  const cleanSql = solutionSql.replace(/(--.*)|(\/\*[\s\S]*?\*\/)/g, "").trim();
  const isDmlOrDdl =
    /^\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|REPLACE|TRUNCATE|BEGIN)\b/i.test(
      cleanSql,
    );

  if (isDmlOrDdl) {
    if (!userSnapshot || !expectedSnapshot) {
      return {
        isCorrect: false,
        message: "State Check Failed",
        details: "Unable to inspect database tables.",
      };
    }
    const match =
      JSON.stringify(userSnapshot) === JSON.stringify(expectedSnapshot);
    return {
      isCorrect: match,
      message: match ? "Correct Answer!" : "Database state mismatch",
      details: match
        ? "Database tables were updated correctly."
        : "The tables do not match the expected state after your query.",
    };
  }

  const expCols = expectedResult.columns;
  const userCols = userResult.columns;

  const expColsLower = expCols.map((c) => c.toLowerCase());
  const userColsLower = userCols.map((c) => c.toLowerCase());
  const missing = expCols.filter(
    (c) => !userColsLower.includes(c.toLowerCase()),
  );
  const extra = userCols.filter((c) => !expColsLower.includes(c.toLowerCase()));

  if (missing.length > 0 || extra.length > 0) {
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

  // Row contents check
  if (userResult.rows.length !== expectedResult.rows.length) {
    return {
      isCorrect: false,
      message: "Row count mismatch",
      details: `Expected ${expectedResult.rows.length} rows, but got ${userResult.rows.length} rows.`,
      warning,
    };
  }

  return {
    isCorrect: true,
    message: "Correct Answer!",
    details: "Your query returned the exact expected result set and schema!",
    warning,
  };
}
