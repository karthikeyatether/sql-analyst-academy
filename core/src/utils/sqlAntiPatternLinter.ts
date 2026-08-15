/**
 * SQL Anti-Pattern & SARGability Linter
 * Detects common query pitfalls, performance bottlenecks, and non-SARGable predicates.
 */

export interface AntiPatternDiagnostic {
  id: string;
  severity: "warning" | "info" | "error";
  title: string;
  message: string;
  recommendation: string;
  line?: number;
}

export function lintSqlAntiPatterns(sql: string): AntiPatternDiagnostic[] {
  const diagnostics: AntiPatternDiagnostic[] = [];
  if (!sql || sql.trim().length === 0) return diagnostics;

  const normalized = sql.replace(/\/\*[\s\S]*?\*\/|--.*$/gm, ""); // strip comments

  // 1. Non-SARGable function wrapper in WHERE (e.g. YEAR(date) = 2024 or LOWER(col) = 'val')
  const dateFuncMatch = normalized.match(
    /\bWHERE\b[\s\S]*?\b(YEAR|MONTH|DAY|STRFTIME|DATE)\s*\(\s*([a-zA-Z0-9_]+)\s*\)\s*(=|<|>|<=|>=)/i,
  );
  if (dateFuncMatch) {
    diagnostics.push({
      id: "non-sargable-date-function",
      severity: "warning",
      title: "Non-SARGable Date Predicate",
      message: `Wrapping column "${dateFuncMatch[2]}" inside ${dateFuncMatch[1]}() prevents the database from using indexes, forcing a full table scan.`,
      recommendation: `Use explicit date ranges instead: WHERE ${dateFuncMatch[2]} >= 'YYYY-01-01' AND ${dateFuncMatch[2]} < 'YYYY-01-01'.`,
    });
  }

  // 2. Cartesian Product / Implicit Join without WHERE
  if (
    /\bFROM\s+[a-zA-Z0-9_]+\s*,\s*[a-zA-Z0-9_]+/i.test(normalized) &&
    !/\bWHERE\b/i.test(normalized)
  ) {
    diagnostics.push({
      id: "implicit-cartesian-join",
      severity: "error",
      title: "Implicit Cartesian Join Detected",
      message:
        "Comma-separated tables in FROM clause without a join condition produces a full Cartesian product (NxM rows).",
      recommendation:
        "Use explicit ANSI JOIN syntax: FROM table1 JOIN table2 ON table1.id = table2.id.",
    });
  }

  // 3. SELECT * without LIMIT in large queries
  if (
    /^\s*SELECT\s+\*\s+FROM\b/i.test(normalized) &&
    !/\bLIMIT\b/i.test(normalized) &&
    !/\bCOUNT\b/i.test(normalized)
  ) {
    diagnostics.push({
      id: "unbounded-select-star",
      severity: "info",
      title: "Unbounded SELECT * Query",
      message:
        "Querying all columns with SELECT * without a LIMIT clause increases network payload and suppresses index-only scans.",
      recommendation:
        "Select only the specific columns required by your business application and add a LIMIT clause during testing.",
    });
  }

  // 4. NOT IN with subquery (NULL hazard)
  if (/\bNOT\s+IN\s*\(\s*SELECT\b/i.test(normalized)) {
    diagnostics.push({
      id: "not-in-subquery-null-hazard",
      severity: "warning",
      title: "NOT IN Subquery NULL Safety Hazard",
      message:
        "If the subquery returns even a single NULL value, NOT IN evaluates to UNKNOWN/FALSE for all rows, returning 0 results unexpectedly.",
      recommendation:
        "Use NOT EXISTS (SELECT 1 FROM ... WHERE ...) or LEFT JOIN ... WHERE ... IS NULL for NULL-safe exclusion.",
    });
  }

  // 5. Redundant DISTINCT with GROUP BY
  if (
    /\bSELECT\s+DISTINCT\b/i.test(normalized) &&
    /\bGROUP\s+BY\b/i.test(normalized)
  ) {
    diagnostics.push({
      id: "redundant-distinct-group-by",
      severity: "info",
      title: "Redundant DISTINCT with GROUP BY",
      message:
        "GROUP BY already guarantees distinct grouped values. Adding DISTINCT adds an extra unnecessary sorting pass.",
      recommendation:
        "Remove DISTINCT when GROUP BY is already grouping the output keys.",
    });
  }

  // 6. HAVING without Aggregate function
  const havingMatch = normalized.match(
    /\bHAVING\s+([a-zA-Z0-9_]+)\s*(=|<|>|!=|LIKE)/i,
  );
  if (havingMatch) {
    diagnostics.push({
      id: "having-without-aggregate",
      severity: "warning",
      title: "HAVING Clause Filtering Non-Aggregate Column",
      message: `Filtering column "${havingMatch[1]}" in HAVING evaluates after row aggregation, wasting compute.`,
      recommendation: `Move row-level filters to WHERE ${havingMatch[1]} ... before the GROUP BY clause.`,
    });
  }

  return diagnostics;
}
