import initSqlJs from "sql.js";
// @ts-ignore
import sqlWasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import { seedTables, tableSchemas } from "../data/datasets";
import { translateSqlError } from "./sqlErrorTranslator";
import { seedDatabaseInstance, inferType } from "./dbSeeder";

export type QueryResult = {
  columns: string[];
  rows: Record<string, unknown>[];
  message: string;
  error?: string;
  durationMs?: number;
};

export type QueryPlanStep = {
  id: number;
  parent: number;
  detail: string;
};

let db: initSqlJs.Database | null = null;
let initPromise: Promise<void> | null = null;
let dbIsDirty = true; // Track if database mutations have run
let cachedSchema: typeof tableSchemas | null = null;
let schemaIsDirty = true;
export let initError: string | null = null;

export async function initDatabase(): Promise<void> {
  if (db) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      initError = null;
      const SQL = await initSqlJs({
        locateFile: () => sqlWasmUrl
      });
      db = new SQL.Database();
      db.run("PRAGMA foreign_keys = ON;");
      resetDatabase(true); // Initial seed forced
    } catch (err: unknown) {
      console.error("Failed to initialize sql.js:", err);
      initError = (err as Error)?.message || String(err);
      initPromise = null;
      throw err;
    }
  })();

  return initPromise;
}

// Eagerly pre-initialize WASM engine on module evaluation
if (typeof window !== "undefined") {
  initDatabase().catch(() => {});
}



export function resetDatabase(force: boolean = false): void {
  if (!db) return;
  if (!dbIsDirty && !force) {
    return; // Seeding bypass: database is clean, skip recreation
  }
  seedDatabaseInstance(db);
  dbIsDirty = false; // Database is now clean
  schemaIsDirty = true; // Mark schema as dirty
}
function stripComments(sql: string): string {
  let result = "";
  let inSingleQuote = false;
  let inDoubleQuote = false;
  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      result += char;
    } else if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      result += char;
    } else if (inSingleQuote || inDoubleQuote) {
      result += char;
    } else {
      if (char === "-" && sql[i + 1] === "-") {
        while (i < sql.length && sql[i] !== "\n") {
          i++;
        }
        if (i < sql.length) {
          result += sql[i];
        }
      } else if (char === "/" && sql[i + 1] === "*") {
        i += 2;
        while (i < sql.length && !(sql[i] === "*" && sql[i + 1] === "/")) {
          i++;
        }
        i++;
      } else {
        result += char;
      }
    }
  }
  return result;
}

function stripTransactionKeywords(sql: string): string {
  let result = "";
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let currentToken = "";
  const flushToken = () => {
    if (currentToken) {
      const up = currentToken.toUpperCase();
      if (
        up === "BEGIN" ||
        up === "COMMIT" ||
        up === "ROLLBACK" ||
        up === "TRANSACTION" ||
        up === "END"
      ) {
        result += "";
      } else {
        result += currentToken;
      }
      currentToken = "";
    }
  };
  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    if (char === "'" && !inDoubleQuote) {
      flushToken();
      inSingleQuote = !inSingleQuote;
      result += char;
    } else if (char === '"' && !inSingleQuote) {
      flushToken();
      inDoubleQuote = !inDoubleQuote;
      result += char;
    } else if (inSingleQuote || inDoubleQuote) {
      result += char;
    } else {
      if (/[a-zA-Z0-9_]/.test(char)) {
        currentToken += char;
      } else {
        flushToken();
        result += char;
      }
    }
  }
  flushToken();
  return result;
}

export function runQuery(
  sql: string,
  sandbox: boolean = false,
  captureSnapshot: boolean = false
): QueryResult & { snapshot?: Record<string, any> | null } {
  if (!db) {
    return {
      columns: [],
      rows: [],
      message: initError
        ? `Database initialization failed: ${initError}`
        : "Database engine is initializing, please wait..."
    };
  }
  const trimmed = sql.trim();
  if (!trimmed) return { columns: [], rows: [], message: "Write a query and press Run." };

  const cleanSql = stripComments(trimmed);
  const isMutating = /\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|REPLACE|TRUNCATE)\b/i.test(cleanSql);
  const isDDL = /\b(DROP|CREATE|ALTER)\b/i.test(cleanSql);

  const hasManualTx = /\b(BEGIN|COMMIT|ROLLBACK|TRANSACTION)\b/i.test(cleanSql);
  let txStarted = false;
  const savepointName = `sb_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  const sqlToRun = trimmed;

  try {
    if (sandbox) {
      // Use SAVEPOINT in sandbox to isolate query writes
      // the SAVEPOINT rollback correctly isolates all student writes.
      db.run(`SAVEPOINT ${savepointName};`);
      txStarted = true;
    } else if (!hasManualTx) {
      db.run("BEGIN TRANSACTION;");
      txStarted = true;
    }

    const t0 = performance.now();
    const result = db.exec(sqlToRun);
    const t1 = performance.now();
    const durationMs = t1 - t0;

    let snapshot: Record<string, any> | null = null;
    if (sandbox && captureSnapshot) {
      snapshot = getDatabaseSnapshot();
    }

    if (txStarted) {
      if (sandbox) {
        db.run(`ROLLBACK TO ${savepointName};`);
        db.run(`RELEASE ${savepointName};`);
      } else {
        db.run("COMMIT;");
      }
    }

    if (isMutating && !sandbox) {
      dbIsDirty = true;
    }
    if (isDDL && !sandbox) {
      schemaIsDirty = true;
    }

    if (result.length === 0) {
      return { columns: [], rows: [], message: "Query executed successfully. 0 rows returned.", durationMs, snapshot };
    }
    const lastResult = result[result.length - 1];
    const columns = lastResult.columns;
    const rows = lastResult.values.map(valArr => {
      const row: Record<string, unknown> = {};
      columns.forEach((col: string, idx: number) => {
        row[col] = valArr[idx];
      });
      return row;
    });
    return {
      columns,
      rows,
      message: `${rows.length} row${rows.length === 1 ? "" : "s"} returned`,
      durationMs,
      snapshot
    };
  } catch (error) {
    if (txStarted) {
      try {
        if (sandbox) {
          db.run(`ROLLBACK TO ${savepointName};`);
          db.run(`RELEASE ${savepointName};`);
        } else {
          db.run("ROLLBACK;");
        }
      } catch (e) {
        console.warn("Rollback failed:", e);
      }
    }
    if (isMutating && !sandbox) {
      dbIsDirty = true;
    }
    if (isDDL && !sandbox) {
      schemaIsDirty = true;
    }
    const rawError = error instanceof Error ? error.message : String(error);
    return { columns: [], rows: [], message: "Query failed", error: translateSqlError(rawError, sqlToRun) };
  }
}

export function getQueryPlan(sql: string): QueryPlanStep[] {
  if (!db) return [];
  try {
    const trimmed = sql.trim();
    if (!trimmed) return [];

    // Only analyze statements that start with SELECT/WITH/EXPLAIN
    const up = trimmed.toUpperCase();
    if (!up.startsWith("SELECT") && !up.startsWith("WITH") && !up.startsWith("EXPLAIN")) {
      return [];
    }

    const cleanForPlan = trimmed.replace(/^EXPLAIN\s+(QUERY\s+PLAN\s+)?/i, "");
    const plan = db.exec(`EXPLAIN QUERY PLAN ${cleanForPlan}`);
    if (plan.length === 0) return [];

    const columns = plan[0].columns;
    const values = plan[0].values;

    const idIdx = columns.indexOf("id");
    const parentIdx = columns.indexOf("parent");
    const detailIdx = columns.indexOf("detail");

    return values.map(val => ({
      id: val[idIdx !== -1 ? idIdx : 0] as number,
      parent: val[parentIdx !== -1 ? parentIdx : 1] as number,
      detail: val[detailIdx !== -1 ? detailIdx : 3] as string
    }));
  } catch (err) {
    return [];
  }
}

export function exportDatabaseState(): Uint8Array | null {
  if (!db) return null;
  return db.export();
}

export function formatSql(sql: string): string {
  const keywords = ["SELECT", "FROM", "WHERE", "JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL JOIN",
    "INNER JOIN", "GROUP BY", "HAVING", "ORDER BY", "LIMIT", "WITH", "UNION ALL", "UNION", "ON"];
  let f = sql.replace(/\s+/g, " ").trim();
  for (const kw of keywords.sort((a, b) => b.length - a.length)) {
    f = f.replace(new RegExp(`\\b${kw}\\b`, "gi"), `\n${kw}`);
  }
  return f.replace(/^\n/, "").replace(/,\s*/g, ",\n  ");
}

export function buildExecutionPlan(sql: string): string[] {
  const up = sql.toUpperCase();
  const plan: string[] = [];
  const tables = tableSchemas.map(t => t.name).filter(n => new RegExp(`\\b${n}\\b`, "i").test(sql));
  plan.push(`FROM — load ${tables.length ? tables.join(", ") : "table"} into memory`);
  if (up.includes("JOIN"))     plan.push("JOIN — combine rows from multiple tables using ON condition");
  if (up.includes("WHERE"))    plan.push("WHERE — filter individual rows (before grouping)");
  if (up.includes("GROUP BY")) plan.push("GROUP BY — collapse rows into groups");
  if (up.includes("HAVING"))   plan.push("HAVING — filter groups (after GROUP BY)");
  if (up.includes("OVER"))     plan.push("OVER() — compute window function without collapsing rows");
  plan.push("SELECT — choose which columns to output");
  if (up.includes("DISTINCT")) plan.push("DISTINCT — remove duplicate rows from output");
  if (up.includes("ORDER BY")) plan.push("ORDER BY — sort the final result set");
  if (up.includes("LIMIT"))    plan.push("LIMIT — return only N rows");
  return plan;
}

// SQL KNOWLEDGE BASE & DETAILED EXPLAINER
// A local structured knowledge base returning detailed explanations
// and tips for core SQL concepts and execution patterns.

const KB: Record<string, string> = {
  // ── Execution order ──
  "execution order": `SQL Logical Execution Order (memorise this for interviews):
1. FROM — identify the base table(s)
2. JOIN — combine tables using ON condition
3. WHERE — filter individual rows (no aggregates yet)
4. GROUP BY — collapse rows into groups
5. HAVING — filter groups (aggregates exist here)
6. SELECT — pick and compute output columns
7. DISTINCT — remove duplicates
8. ORDER BY — sort the result (SELECT aliases available here)
9. LIMIT — cap the number of rows

Key interview implication: you CANNOT use a SELECT alias in WHERE (WHERE runs before SELECT). ` +
      `You CAN use it in ORDER BY (ORDER BY runs after SELECT).`,

  "order of": `SQL executes in this logical order — not the order you type it:
FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT

This explains:
• WHERE COUNT(*) > 5 is ILLEGAL — WHERE runs before GROUP BY, aggregates don't exist yet. Use HAVING instead.
• You can use a SELECT alias in ORDER BY — ORDER BY runs after SELECT.
• You CANNOT use a SELECT alias in WHERE or HAVING — those run before SELECT.`,

  // ── WHERE vs HAVING ──
  "where vs having": `WHERE vs HAVING — the most-asked SQL interview question:

WHERE: filters individual ROWS before GROUP BY. Can use any column value.
HAVING: filters GROUPS after GROUP BY. Must use aggregate functions or GROUP BY columns.

Example:
  -- WHERE: filter raw rows first
  WHERE status = 'Delivered'          ← row-level filter ✓
  WHERE COUNT(*) > 5                  ← WRONG — aggregate in WHERE ✗

  -- HAVING: filter aggregated groups
  HAVING COUNT(*) > 5                 ← group-level filter ✓
  HAVING status = 'Delivered'         ← works but wrong practice ✗ (use WHERE)

Use WHERE first to reduce data, HAVING second to filter groups. Both can be in the same query.`,

  "having": `HAVING filters GROUPS after GROUP BY. Think of it as WHERE for aggregates.

Syntax: GROUP BY col HAVING aggregate_condition

Examples:
  HAVING COUNT(*) > 5                              -- groups with more than 5 rows
  HAVING SUM(total_amount) > 10000                 -- groups with total > 10k
  HAVING AVG(total_amount) > (SELECT AVG(total_amount) FROM orders)  -- above average

Cannot use: HAVING status = 'Delivered' as a row filter — put that in WHERE (faster).
Rule: non-aggregate conditions → WHERE. Aggregate conditions → HAVING.`,

  // ── JOINs ──
  "inner join": `INNER JOIN — returns only rows where BOTH tables have a matching value.

Syntax: FROM t1 JOIN t2 ON t1.key = t2.foreign_key
(INNER is optional — JOIN alone means INNER JOIN)

Example: customers JOIN orders ON customer_id
• Customer with no orders → EXCLUDED
• Order with no customer → EXCLUDED (data integrity issue)

When to check: if your row count drops unexpectedly after joining, you may need LEFT JOIN ` +
      `instead of INNER JOIN. Always verify row counts before and after.`,

  "left join": `LEFT JOIN — returns ALL rows from the left table, plus matching rows from the right.
Non-matching right-table rows show as NULL.

Syntax: FROM left_table LEFT JOIN right_table ON key

Key patterns:
1. Include all rows: SELECT c.*, COUNT(o.order_id) FROM customers c LEFT JOIN orders o ON ...
2. Anti-join (find rows with NO match):
   LEFT JOIN orders o ON c.customer_id = o.customer_id
   WHERE o.order_id IS NULL  -- customers with no orders

CRITICAL: putting a WHERE filter on the right table's columns converts LEFT JOIN to INNER JOIN.
  Wrong: LEFT JOIN orders o ... WHERE o.status = 'Delivered'  -- becomes INNER JOIN!
  Right: LEFT JOIN orders o ON c.id = o.id AND o.status = 'Delivered'  -- stays LEFT JOIN`,

  "right join": `RIGHT JOIN — returns ALL rows from the right table, plus matching rows from the left.
Non-matching left-table rows show as NULL.

RIGHT JOIN is just LEFT JOIN with tables swapped. Most teams avoid RIGHT JOIN and use LEFT JOIN instead for consistency:
  FROM orders o RIGHT JOIN customers c ON ...
  is identical to:
  FROM customers c LEFT JOIN orders o ON ...

Interview answer: "I prefer LEFT JOIN for consistency; I swap the table order rather than use RIGHT JOIN."`,

  "full join": `FULL JOIN (FULL OUTER JOIN) — returns ALL rows from BOTH tables.
Non-matching rows from either side show as NULL.

Use case: find rows that exist in either table but don't have a match in the other.

Note: SQLite does not support FULL JOIN natively. In SQLite, simulate it:
  SELECT ... FROM t1 LEFT JOIN t2 ON ...
  UNION ALL
  SELECT ... FROM t2 LEFT JOIN t1 ON ... WHERE t1.id IS NULL

In PostgreSQL/BigQuery: FULL OUTER JOIN works directly.`,

  "self join": `SELF JOIN — a table joined to ITSELF using table aliases.
Used to compare rows within the same table.

Most common use: employee-manager hierarchy
  FROM employees e1
  JOIN employees e2 ON e1.manager_id = e2.employee_id
  -- e1 = employee, e2 = their manager

Other uses: find pairs of customers in same city, detect order sequences, date comparisons within same table.

Always use different aliases (e1, e2) so SQL knows which copy you're referring to.`,

  "cross join": `CROSS JOIN — returns every combination of rows from both tables (Cartesian product).
Rows = table1_rows × table2_rows

Use cases:
• Generate a grid of all combinations (segments × months)
• Create test datasets
• Pair every customer with every product for recommendation scoring

Be careful: 1000 rows × 1000 rows = 1,000,000 rows. Always add a WHERE/LIMIT.

Syntax: FROM t1 CROSS JOIN t2  — or — FROM t1, t2 (old-style, implicit cross join)`,

  // ── Aggregates ──
  "count": `COUNT — counts rows or non-null values.

COUNT(*) → counts ALL rows, including NULLs
COUNT(col) → counts non-NULL values in col
COUNT(DISTINCT col) → counts unique non-NULL values

Examples:
  COUNT(*) = 100           -- 100 total rows
  COUNT(discount_amount) = 75   -- only 75 rows have non-null discount
  COUNT(DISTINCT customer_id) = 40  -- 40 unique customers

Interview pattern: "How many unique customers placed delivered orders?"
  COUNT(DISTINCT customer_id) WHERE status = 'Delivered'`,

  "sum": `SUM — adds non-NULL numeric values in a group.
SUM ignores NULLs. SUM of an empty set = NULL (use COALESCE(SUM(...), 0)).

Key patterns:
  SUM(total_amount - discount_amount) AS net_revenue   -- net GMV
  SUM(CASE WHEN status='Delivered' THEN amount ELSE 0 END)  -- conditional sum (pivot)
  COALESCE(SUM(col), 0)  -- treat NULL sum as zero

Never sum total_amount without filtering status — includes cancelled orders.`,

  "avg": `AVG — arithmetic mean of non-NULL values.
AVG skips NULLs in BOTH numerator and denominator.

AVG([100, NULL, 200]) = 150 (not 100)  ← NULL excluded from count too

For AOV (Average Order Value): use SUM/COUNT, not AVG(total_amount):
  SUM(total_amount - discount_amount) / COUNT(order_id) AS net_aov

This gives you control over exactly what goes in numerator and denominator.

ROUND(AVG(col), 2) — always round for readable output.`,

  "min max": `MIN and MAX return the smallest / largest value in a group.
Both ignore NULLs.

With dates stored as 'YYYY-MM-DD': MIN = earliest, MAX = most recent (alphabetic = chronological for this format).

Classic pattern — customer order history:
  MIN(order_date) AS first_order
  MAX(order_date) AS last_order
  JULIANDAY(MAX(order_date)) - JULIANDAY(MIN(order_date)) AS active_days`,

  // ── GROUP BY ──
  "group by": `GROUP BY — collapses rows into groups and applies aggregate functions to each group.

Rules:
1. Every column in SELECT must be either in GROUP BY or inside an aggregate
2. You cannot use SELECT aliases in GROUP BY (GROUP BY runs before SELECT)
3. Can GROUP BY expressions: GROUP BY SUBSTR(order_date, 1, 7)

Multi-column: GROUP BY region, segment → one row per unique region+segment pair.
Monthly grouping in SQLite: GROUP BY SUBSTR(order_date, 1, 7) — extracts 'YYYY-MM'.`,

  // ── Window functions ──
  "window function": `Window functions compute values across related rows WITHOUT collapsing them.
Unlike GROUP BY: all original rows are preserved in the output.

Syntax: function() OVER (PARTITION BY col ORDER BY col2 [ROWS/RANGE frame])

PARTITION BY: divide rows into groups (like GROUP BY but rows stay)
ORDER BY in OVER: ordering within each partition
No PARTITION BY: window is the entire result set

Functions: ROW_NUMBER, RANK, DENSE_RANK, LEAD, LAG, SUM, AVG, NTILE
Cannot filter on window result in same query — wrap in CTE: WITH r AS (...) SELECT * FROM r WHERE rank_col = 1`,

  "row_number": `ROW_NUMBER() — assigns a unique sequential integer to each row within a partition.
Ties get different numbers (arbitrary order for ties unless you add more ORDER BY cols).

Classic use — top 1 row per group:
  WITH ranked AS (
    SELECT *, ROW_NUMBER() OVER (PARTITION BY category ORDER BY revenue DESC) AS rn
    FROM product_revenue
  )
  SELECT * FROM ranked WHERE rn = 1;

Always filter on ROW_NUMBER in a CTE or subquery, not the same SELECT.`,

  "rank": `RANK vs DENSE_RANK vs ROW_NUMBER:
  Values:  [100, 100, 80, 70]
  ROW_NUMBER:  1, 2, 3, 4   (always unique, arbitrary for ties)
  RANK:        1, 1, 3, 4   (ties get same rank, then SKIPS — gap after tie)
  DENSE_RANK:  1, 1, 2, 3   (ties get same rank, NO gap)

When to use each:
  ROW_NUMBER → need exactly N results per group (top-1 per category)
  RANK → sports leaderboard (tied 1st place, then 3rd — no 2nd)
  DENSE_RANK → sales tiers, employee grades (tied 1st, then 2nd — no skip)`,

  "lag": `LAG(col, n, default) — returns value from n rows BEHIND the current row.
LEAD(col, n, default) — returns value from n rows AHEAD.

Both require ORDER BY in OVER. The n-th row from the start/end returns NULL by default.

Month-over-month growth:
  WITH monthly AS (
    SELECT SUBSTR(order_date,1,7) AS month, SUM(revenue) AS rev
    FROM orders WHERE status='Delivered' GROUP BY 1
  )
  SELECT month, rev,
    LAG(rev, 1) OVER (ORDER BY month) AS prev_month,
    ROUND((rev - LAG(rev,1) OVER (ORDER BY month)) /
      NULLIF(LAG(rev,1) OVER (ORDER BY month), 0) * 100, 1) AS mom_pct
  FROM monthly;`,

  "lead": `LEAD(col, n) returns the value n rows AHEAD. Use it to compare current to future periods.
Returns NULL for the last n rows (no future rows).

Example — next month's revenue:
  LEAD(revenue, 1) OVER (ORDER BY month) AS next_month_revenue

For safely computing growth rate where LEAD/LAG can be NULL:
  Use NULLIF to avoid division by zero:
  (current - LEAD(rev,1) OVER (...)) / NULLIF(LEAD(rev,1) OVER (...), 0) * 100`,

  // ── CTE ──
  "cte": `CTE (Common Table Expression) — WITH keyword creates a named temporary result.

Syntax:
  WITH step1 AS (
    SELECT ... FROM ...
  ),
  step2 AS (
    SELECT ... FROM step1  -- can reference previous CTEs
  )
  SELECT * FROM step2;

Benefits over subqueries:
  • Each step is named and self-documenting
  • Can reference the same CTE multiple times in the main query
  • Each CTE can be tested in isolation during development
  • Easier to debug than 3-level nested subqueries

Interview tip: use CTEs to show structured thinking — aggregate → rank → filter.`,

  // ── NULL ──
  "null": `NULL = unknown. It is NOT zero, NOT empty string, NOT false.

Rules:
  NULL = NULL → FALSE (never true!)
  NULL + 5 → NULL
  NULL AND TRUE → NULL
  COUNT(*) counts NULLs. COUNT(col) skips them.
  AVG, SUM, MIN, MAX all skip NULLs.

Handling NULLs:
  IS NULL / IS NOT NULL → the only correct way to check for NULL
  COALESCE(col, 0) → replace NULL with default
  NULLIF(a, b) → return NULL if a=b (use to prevent ÷ by zero)
  IFNULL(col, 0) → MySQL/SQLite alias for COALESCE with 2 args`,

  // ── Subquery ──
  "subquery": `Subquery — a SELECT nested inside another query.

Types:
1. In WHERE: WHERE col > (SELECT AVG(col) FROM t)
   → Use IN for multiple rows: WHERE id IN (SELECT id FROM t WHERE ...)
2. In FROM (derived table): FROM (SELECT ...) AS alias   ← must alias!
3. In SELECT (scalar): SELECT col, (SELECT MAX(rev) FROM t) AS global_max
4. Correlated: references the outer query (runs once per outer row)

When subquery returns multiple rows, use IN not =:
  WHERE customer_id = (SELECT ...) ← error if subquery returns >1 row
  WHERE customer_id IN (SELECT ...) ← correct`,

  "correlated subquery": `Correlated subquery — references a column from the outer query.
Runs once per outer row — can be slow on large tables.

Example: find customers with above-average spend for THEIR city:
  SELECT * FROM customers c
  WHERE lifetime_value > (
    SELECT AVG(lifetime_value) FROM customers
    WHERE city = c.city  -- references outer query's city
  )

For performance, consider rewriting as a JOIN with a CTE:
  WITH city_avg AS (SELECT city, AVG(ltv) AS avg FROM customers GROUP BY city)
  SELECT * FROM customers c JOIN city_avg a ON c.city = a.city WHERE c.ltv > a.avg`,

  // ── CASE WHEN ──
  "case when": `CASE WHEN — SQL's if-else for creating conditional columns.

Syntax:
  CASE
    WHEN condition1 THEN value1
    WHEN condition2 THEN value2
    ELSE default_value   -- omit = NULL for unmatched rows
  END AS alias

Use cases:
  1. Categorise: CASE WHEN amount > 5000 THEN 'Premium' ELSE 'Standard' END
  2. Conditional sum: SUM(CASE WHEN status='Delivered' THEN amount ELSE 0 END)
  3. Pivot: one column per status in separate columns
  4. NULL handling: CASE WHEN col IS NULL THEN 'Unknown' ELSE col END

First matching WHEN wins. Order matters for overlapping conditions.`,

  // ── DISTINCT ──
  "distinct": `DISTINCT removes duplicate rows from output. Applies to ALL selected columns combined.

  SELECT DISTINCT city → unique cities
  SELECT DISTINCT city, segment → unique city+segment combinations (not just cities!)

  COUNT(DISTINCT col) → unique count inside aggregate (very different from SELECT DISTINCT)

DISTINCT is expensive — requires sorting or hashing all rows.
If you find yourself needing DISTINCT in a JOIN result, check your join condition
- you may be creating unintended duplicates.`,

  // ── UNION ──
  "union": `UNION vs UNION ALL:

UNION: combines results from two queries, removes duplicates (expensive — sorts both result sets)
UNION ALL: combines results, keeps ALL rows including duplicates (faster — skip dedup step)

Both require: same number of columns + compatible data types

Use UNION ALL unless you explicitly need deduplication:
  SELECT 'Delivered' AS status, COUNT(*) FROM orders WHERE status='Delivered'
  UNION ALL
  SELECT 'Returned',  COUNT(*) FROM orders WHERE status='Returned'
  UNION ALL
  SELECT 'Cancelled', COUNT(*) FROM orders WHERE status='Cancelled'

This pivot-style pattern avoids GROUP BY and is readable for executives.`,

  // ── String/Date ──
  "substr": `SUBSTR(string, start, length) — extract substring. 1-indexed.

Date manipulation in SQLite (no YEAR/MONTH functions):
  SUBSTR(order_date, 1, 4) → '2024'     (year)
  SUBSTR(order_date, 1, 7) → '2024-03'  (year-month for monthly grouping)
  SUBSTR(order_date, 6, 2) → '03'       (month number)
  SUBSTR(order_date, 9, 2) → '15'       (day)

In BigQuery: DATE_TRUNC(date, MONTH) or FORMAT_DATE('%Y-%m', date)
In PostgreSQL: TO_CHAR(date, 'YYYY-MM') or DATE_TRUNC('month', date)`,

  "date function": `Date functions vary by database:

SQLite (this course):
  DATE('now') → today
  SUBSTR(col, 1, 7) → 'YYYY-MM' monthly grouping
  JULIANDAY(d2) - JULIANDAY(d1) → days between dates

MySQL:
  YEAR(col), MONTH(col), DATE_FORMAT(col, '%Y-%m')
  DATEDIFF(d2, d1)

PostgreSQL:
  DATE_TRUNC('month', col), EXTRACT(YEAR FROM col)
  AGE(d2, d1), col::date

BigQuery:
  DATE_TRUNC(col, MONTH), EXTRACT(YEAR FROM col)
  DATE_DIFF(d2, d1, DAY)

Interview tip: always say "In [database], I would use..." — shows you know the differences.`,

  // ── Optimization ──
  "optim": `Query optimisation — key principles for DA interviews:

1. Filter early: add WHERE before joins to reduce rows scanned
2. Avoid SELECT *: name only the columns you need
3. Join on indexed keys: primary/foreign keys are usually indexed
4. Filter in JOIN condition (not WHERE) for LEFT JOIN to preserve all rows
5. Avoid functions on filtered columns: WHERE YEAR(date) = 2024 → index miss
   Better: WHERE date >= '2024-01-01' AND date < '2025-01-01'
6. Use LIMIT when exploring
7. CTEs don't hurt performance — they're usually optimised the same as subqueries
8. UNION ALL is faster than UNION (skip dedup sort)`,

  "slow query": `If a query is slow, check these in order:
1. Missing WHERE — are you scanning the whole table unnecessarily?
2. JOIN on non-key column — joins on full_name (not an id) = full table scan
3. LIKE '%value%' — leading wildcard prevents index use
4. SELECT * — reading all columns when you need 3
5. Subquery in WHERE that runs once per outer row (correlated subquery)
6. Missing filter before JOIN — push WHERE conditions as early as possible
7. DISTINCT when GROUP BY would do the same job faster`,

  // ── General ──
  "what is": `SQL (Structured Query Language) is the language for querying relational databases.
A relational database stores data in tables. Tables have rows (records) and columns (attributes).
Tables are linked by keys: primary key (unique identifier) and foreign key (reference to another table's primary key).

Key SQL categories:
  DQL — Data Query Language: SELECT (read data)
  DML — Data Manipulation Language: INSERT, UPDATE, DELETE
  DDL — Data Definition Language: CREATE, ALTER, DROP
  DCL — Data Control Language: GRANT, REVOKE

For Data Analyst roles, you primarily need DQL (SELECT) mastery.`,

  "aov": `AOV = Average Order Value. Calculated as:
  Total Net Revenue / Number of Orders

In SQL:
  SUM(total_amount - discount_amount) / COUNT(DISTINCT order_id) AS aov

Do NOT use AVG(total_amount) for AOV — it gives gross value before discounts.
Always filter to delivered orders: WHERE status = 'Delivered'

Why? Including cancelled/returned orders in AOV inflates the metric and misleads stakeholders.`,

  "churn": `Churn analysis in SQL — find customers who stopped purchasing:

  SELECT customer_id,
    MAX(order_date) AS last_order,
    ROUND(JULIANDAY('now') - JULIANDAY(MAX(order_date))) AS days_inactive
  FROM orders
  WHERE status = 'Delivered'
  GROUP BY customer_id
  HAVING JULIANDAY('now') - JULIANDAY(MAX(order_date)) > 90
  ORDER BY days_inactive DESC;

This finds customers with no delivered order in the last 90 days.
For churn rate: churned_customers / total_customers * 100`,

  "retention": `Retention analysis — what % of customers from month X are still active in month X+1:

Step 1: Find each customer's first order month (cohort)
Step 2: Find all months each customer was active
Step 3: For each cohort, calculate % still active in subsequent months

Simplified: active customers last month who also placed an order this month:
  WITH last_month AS (
    SELECT DISTINCT customer_id FROM orders
    WHERE SUBSTR(order_date,1,7) = '2024-04' AND status='Delivered'
  ),
  this_month AS (
    SELECT DISTINCT customer_id FROM orders
    WHERE SUBSTR(order_date,1,7) = '2024-05' AND status='Delivered'
  )
  SELECT COUNT(t.customer_id) * 100.0 / COUNT(l.customer_id) AS retention_pct
  FROM last_month l LEFT JOIN this_month t ON l.customer_id = t.customer_id;`,

  "explain": `To explain a SQL query step-by-step (interview approach):
1. State the business question it answers
2. Identify the grain: one row = one WHAT?
3. Walk through each clause:
   - FROM: which table(s)
   - WHERE: what rows are filtered
   - GROUP BY: what level of aggregation
   - SELECT: what metrics are computed
   - ORDER BY: how the result is sorted
4. Mention edge cases: NULLs, status filters, duplicate prevention

Example: "This query answers 'which region had the highest net revenue'. The grain is one row ` +
      `per region. We filter to delivered orders in WHERE, group by region, sum the net revenue, ` +
      `and sort descending."`,
};

export function explainQueryForTutor(sql: string, question: string, lastError?: string): string {
  const q = question.toLowerCase().trim();
  const up = sql.toUpperCase();

  // ── 1. Direct knowledge-base lookup (longest match wins) ──
  const sortedKeys = Object.keys(KB).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (q.includes(key)) return KB[key];
  }

  // ── 2. Detect query shape ──
  const hasWhere   = up.includes("WHERE");
  const hasJoin    = up.includes("JOIN");
  const hasGroupBy = up.includes("GROUP BY");
  const hasHaving  = up.includes("HAVING");
  const hasOver    = up.includes("OVER");
  const hasCase    = up.includes("CASE");
  const hasSubQ    = sql.includes("(SELECT");
  const hasWith    = up.trimStart().startsWith("WITH");
  const hasOrderBy = up.includes("ORDER BY");
  const hasLimit   = up.includes("LIMIT");
  const hasDistinct = up.includes("DISTINCT");
  const usedTables = tableSchemas.map(t => t.name).filter(n => up.includes(n.toUpperCase()));

  // ── 3. Error / debug questions ──
  if (q.includes("error") || q.includes("wrong") || q.includes("broken") || q.includes("fail") || lastError) {
    if (lastError) {
      return `Your query failed with the following error:\n\n${lastError}`;
    }
    const tips: string[] = [];
    if (hasGroupBy && !hasHaving && up.includes("COUNT(") && up.includes("WHERE"))
      tips.push("You might be filtering an aggregate in WHERE — move it to HAVING.");
    if (sql.includes('"') && (up.includes("WHERE") || up.includes("LIKE")))
      tips.push("SQL strings use single quotes: WHERE city = 'Mumbai', not double quotes.");
    if (hasJoin && !up.includes(" ON "))
      tips.push("JOIN requires an ON clause: JOIN table ON t1.id = t2.foreign_id.");
    if (tips.length === 0)
      tips.push(
        "Check: (1) column names match the schema exactly, " +
        "(2) strings use single quotes, " +
        "(3) aggregate functions (COUNT/SUM) go in HAVING not WHERE, " +
        "(4) every non-aggregate SELECT column must be in GROUP BY."
      );
    return "Debug checklist:\n" + tips.map(t => "• " + t).join("\n");
  }

  // ── 4. "What does this query do?" ──
  if (q.includes("what does") || q.includes("explain this") || q.includes("what is this")) {
    const parts: string[] = [];
    if (usedTables.length) parts.push(`reads from ${usedTables.join(", ")}`);
    if (hasJoin)    parts.push("joins tables");
    if (hasWhere)   parts.push("filters rows with WHERE");
    if (hasGroupBy) parts.push("groups by one or more columns");
    if (hasHaving)  parts.push("filters groups with HAVING");
    if (hasOver)    parts.push("computes window function(s) without collapsing rows");
    if (hasCase)    parts.push("applies conditional logic with CASE WHEN");
    if (hasSubQ)    parts.push("uses a subquery");
    if (hasDistinct) parts.push("removes duplicates with DISTINCT");
    if (hasOrderBy) parts.push("sorts the result");
    if (hasLimit)   parts.push("limits output rows");
    const flow = [
      hasWith    ? "WITH (CTE)" : null,
      "FROM",
      hasJoin    ? "JOIN" : null,
      hasWhere   ? "WHERE" : null,
      hasGroupBy ? "GROUP BY" : null,
      hasHaving  ? "HAVING" : null,
      hasOver    ? "OVER()" : null,
      "SELECT",
      hasOrderBy ? "ORDER BY" : null,
      hasLimit   ? "LIMIT" : null,
    ].filter(Boolean).join(" → ");
    return `This query ${parts.length ? parts.join(", ") : "selects data"}.\n\n` +
             `Execution flow: ${flow}\n\n` +
             `To understand it fully: identify the grain (one row = one WHAT?), then trace each clause.`;
  }

  // ── 5. Improve / rewrite questions ──
  if (q.includes("improve") || q.includes("better") || q.includes("refactor") || q.includes("rewrite")) {
    const suggestions: string[] = [];
    if (sql.includes("SELECT *")) suggestions.push("Replace SELECT * with named columns for clarity and performance.");
    if (!hasWith && hasSubQ)     suggestions.push("Convert nested subqueries to CTEs (WITH) for readability.");
    if (!hasWhere && hasGroupBy)  suggestions.push("Add a WHERE to filter early — reduces rows before grouping.");
    if (!hasLimit && !hasGroupBy && !hasOver) {
      suggestions.push("Add LIMIT 10 when exploring - avoids loading thousands of rows.");
    }
    if (hasJoin && !hasWhere)     suggestions.push("Filter with WHERE before joining to reduce the join size.");
    if (suggestions.length === 0) {
      return "The query structure looks good. Make sure: column aliases are descriptive, " +
             "status is filtered (WHERE status = 'Delivered'), and ORDER BY is present for deterministic results.";
    }
    return "Improvement suggestions:\n" + suggestions.map(s => "• " + s).join("\n");
  }

  // ── 6. "How do I…" questions ──
  if (q.includes("how do i") || q.includes("how to") || q.includes("how would")) {
    if (q.includes("month")) return KB["substr"];
    if (q.includes("rank") || q.includes("top")) return KB["rank"];
    if (q.includes("null")) return KB["null"];
    if (q.includes("join")) return KB["inner join"];
    if (q.includes("average") || q.includes("aov")) return KB["avg"];
    if (q.includes("count")) return KB["count"];
    if (q.includes("group")) return KB["group by"];
    if (q.includes("cte") || q.includes("with")) return KB["cte"];
    if (q.includes("window")) return KB["window function"];
  }

  // ── 7. Fallback: describe the query shape ──
  const shape: string[] = [];
  if (hasWith) shape.push("CTE");
  if (hasJoin) shape.push("JOIN");
  if (hasWhere) shape.push("WHERE");
  if (hasGroupBy) shape.push("GROUP BY");
  if (hasHaving) shape.push("HAVING");
  if (hasOver) shape.push("Window Function (OVER)");
  if (hasCase) shape.push("CASE WHEN");
  if (hasSubQ) shape.push("Subquery");
  if (hasOrderBy) shape.push("ORDER BY");

  return `Your query uses: ${shape.length ? shape.join(", ") : "basic SELECT"}.

Try asking me something specific like:
• "What does this query do?"
• "Explain GROUP BY"
• "Why does HAVING exist?"
• "What is the execution order?"
• "How do I rank results within each group?"
• "Explain LAG and LEAD"
• "How to calculate month-over-month growth?"`;
}

export function getSqlCompletions(): string[] {
  const keywords = [
    "SELECT", "FROM", "WHERE", "JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL JOIN",
    "INNER JOIN", "GROUP BY", "HAVING", "ORDER BY", "CASE", "WHEN", "THEN",
    "ELSE", "END", "COUNT", "SUM", "AVG", "MIN", "MAX", "DISTINCT",
    "ROW_NUMBER", "RANK", "DENSE_RANK", "LEAD", "LAG", "PARTITION BY",
    "WITH", "UNION", "UNION ALL", "LIMIT", "OFFSET", "COALESCE", "NULLIF",
    "CAST", "SUBSTR", "TRIM", "UPPER", "LOWER", "ROUND", "DATE", "JULIANDAY",
    "IS NULL", "IS NOT NULL", "BETWEEN", "IN", "LIKE", "NOT IN", "ASC", "DESC",
    "OVER", "AS", "ON", "AND", "OR", "NOT", "NULL"
  ];
  const tableAndCols = tableSchemas.flatMap(t => [t.name, ...t.columns.map(c => c.name)]);
  return [...new Set([...keywords, ...tableAndCols])];
}

export function getDatabaseSnapshot(): Record<string, { columns: unknown[]; rows: Record<string, unknown>[] }> | null {
  if (!db) return null;
  try {
    const res = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
    if (res.length === 0) return {};
    const tableNames = res[0].values.map(v => v[0] as string);
    const snapshot: Record<string, { columns: unknown[]; rows: Record<string, unknown>[] }> = {};
    for (const name of tableNames) {
      // 1. Capture columns schema using PRAGMA table_info
      const infoRes = db.exec(`PRAGMA table_info([${name}])`);
      const schemaCols = infoRes.length > 0 ? infoRes[0].values.map(v => ({
        name: v[1],
        type: v[2],
        notnull: v[3],
        pk: v[5]
      })) : [];

      // 2. Capture rows
      const tableRes = db.exec(`SELECT * FROM [${name}]`);
      let rows: Record<string, unknown>[] = [];
      if (tableRes.length > 0) {
        const columns = tableRes[0].columns;
        rows = tableRes[0].values.map(valArr => {
          const row: Record<string, unknown> = {};
          columns.forEach((col: string, idx: number) => {
            row[col] = valArr[idx];
          });
          return row;
        });
        // Sort rows deterministically so order of inserts doesn't break comparison
        rows.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
      }

      snapshot[name] = {
        columns: schemaCols,
        rows: rows
      };
    }
    return snapshot;
  } catch (err) {
    console.error("Failed to get database snapshot:", err);
    return null;
  }
}

export function generateDynamicHint(
  userSql: string,
  solutionSql: string,
  userResult?: QueryResult | null,
  expectedResult?: QueryResult | null
): string | null {
  const userUp = userSql.toUpperCase();
  const solUp = solutionSql.toUpperCase();

  // 1. If there's an error in the user's query, help debug it
  if (userResult && userResult.error) {
    return userResult.error;
  }

  // 2. If the user has run a query and both queries succeeded, compare structure
  if (userResult && expectedResult && !userResult.error && !expectedResult.error) {
    const uCols = userResult.columns || [];
    const eCols = expectedResult.columns || [];

    // Check column count mismatch
    if (uCols.length !== eCols.length) {
      return `Output mismatch: Your query returns ${uCols.length} column(s), ` +
             `but the expected output requires ${eCols.length} column(s).`;
    }

    // Check casing and exact column names
    for (let i = 0; i < uCols.length; i++) {
      if (uCols[i] !== eCols[i]) {
        if (uCols[i].toLowerCase() === eCols[i].toLowerCase()) {
          return `Column casing mismatch: Column ${i+1} is returned as '${uCols[i]}', ` +
             `but the grader expected exactly '${eCols[i]}'.`;
        } else {
          return `Column name mismatch at position ${i+1}: got '${uCols[i]}', expected '${eCols[i]}'.`;
        }
      }
    }

    // Check column primitive type mismatch (if values exist)
    if (userResult.rows.length > 0 && expectedResult.rows.length > 0) {
      const firstURow = userResult.rows[0];
      const firstERow = expectedResult.rows[0];
      for (const col of eCols) {
        const uType = typeof firstURow[col];
        const eType = typeof firstERow[col];
        if (uType !== eType && firstURow[col] !== null && firstERow[col] !== null) {
          return `Column type mismatch for '${col}': expected ${eType.toUpperCase()} values ` +
             `but received ${uType.toUpperCase()}.`;
        }
      }
    }

    // Check if column names are different
    const uColsLower = uCols.map(c => c.toLowerCase());
    const eColsLower = eCols.map(c => c.toLowerCase());
    const missingCols = eColsLower.filter(c => !uColsLower.includes(c));
    if (missingCols.length > 0) {
      return `Missing column: Your query is missing expected column(s) like '${missingCols.join("', '")}'.`;
    }

    // Check row count mismatch
    const uRows = userResult.rows.length;
    const eRows = expectedResult.rows.length;
    if (uRows !== eRows) {
      if (uRows > eRows) {
        if (solUp.includes("WHERE") && !userUp.includes("WHERE")) {
          return `Row count mismatch: Returned ${uRows} rows instead of ${eRows}. ` +
             `You likely need to add a WHERE clause to filter rows.`;
        }
        if (solUp.includes("LIMIT") && !userUp.includes("LIMIT")) {
          return `Row count mismatch: Returned ${uRows} rows instead of ${eRows}. ` +
             `Try using a LIMIT clause to cap results.`;
        }
        return `Row count mismatch: Returned ${uRows} rows instead of ${eRows}. ` +
             `Check your filtering or join conditions for duplicates.`;
      } else {
        if (solUp.includes("LEFT JOIN") && userUp.includes("JOIN") && !userUp.includes("LEFT")) {
          return `Row count mismatch: Returned ${uRows} rows instead of ${eRows}. ` +
             `You used INNER JOIN, but may need LEFT JOIN to preserve unmatched rows.`;
        }
        return `Row count mismatch: Returned ${uRows} rows instead of ${eRows}. ` +
             `Your filters (WHERE) might be too strict, or JOIN conditions incorrect.`;
      }
    }

    // Check sorting (order mismatch)
    const uVals = userResult.rows.map(r => Object.values(r));
    const sVals = expectedResult.rows.map(r => Object.values(r));
    const sortedU = uVals.map(r => JSON.stringify(r)).sort();
    const sortedS = sVals.map(r => JSON.stringify(r)).sort();
    if (JSON.stringify(sortedU) === JSON.stringify(sortedS)) {
      // Data is correct, but order differs!
      if (solUp.includes("ORDER BY") && !userUp.includes("ORDER BY")) {
        return "Almost there! Your values are correct, but the sorting order is incorrect. " +
             "Add the correct ORDER BY clause.";
      }
      return "Almost there! Your values are correct, but check your ORDER BY sorting direction " +
             "(ASC vs DESC) or sorting columns.";
    }
  }

  // 3. Keyword/structural fallback hints (when the user hasn't run the query yet,
  // or results didn't catch the difference)
  if (userUp.length < 10 || !userUp.includes("SELECT")) {
    const fromMatch = solutionSql.match(/FROM\s+([a-zA-Z0-9_]+)/i);
    if (fromMatch) {
      return `Start by writing a SELECT statement querying the '${fromMatch[1]}' table.`;
    }
    return "Start with a basic SELECT statement.";
  }

  const solJoinCount = (solUp.match(/JOIN/g) || []).length;
  const userJoinCount = (userUp.match(/JOIN/g) || []).length;
  if (solJoinCount > userJoinCount) {
    if (userJoinCount === 0) {
      return "You need to combine data from multiple tables. Try using a JOIN.";
    }
    return `You need to join more tables. You have ${userJoinCount} join(s), but you likely need ${solJoinCount}.`;
  }

  if (solUp.includes("WHERE") && !userUp.includes("WHERE")) {
    return "You need to filter the rows. Try using a WHERE clause.";
  }

  if (solUp.includes("GROUP BY") && !userUp.includes("GROUP BY")) {
    return "You need to aggregate your results. Don't forget to use a GROUP BY clause.";
  }

  if (solUp.includes("HAVING") && !userUp.includes("HAVING")) {
    return "You need to filter your grouped data. Use a HAVING clause instead of WHERE for aggregates.";
  }

  if (solUp.includes("ORDER BY") && !userUp.includes("ORDER BY")) {
    return "The results should be sorted. Add an ORDER BY clause.";
  }

  if (solUp.includes("LIMIT") && !userUp.includes("LIMIT")) {
    return "You only need to return a specific number of rows. Try using a LIMIT clause.";
  }

  const aggregates = ["COUNT", "SUM", "AVG", "MIN", "MAX"];
  for (const agg of aggregates) {
    if (solUp.includes(agg) && !userUp.includes(agg)) {
      return `You need to calculate an aggregate value. Try using the ${agg}() function.`;
    }
  }

  if (solUp.includes("DISTINCT") && !userUp.includes("DISTINCT")) {
    return "You have duplicate rows in your output. Try using DISTINCT to return unique values.";
  }

  if (solUp.includes("OVER") && !userUp.includes("OVER")) {
    return "This problem requires a Window Function. Use the OVER() clause.";
  }

  return null;
}

export function getLiveSchema(): typeof tableSchemas {
  const activeDb = db;
  if (!activeDb) return [];
  if (!schemaIsDirty && cachedSchema) {
    return cachedSchema;
  }
  try {
    const res = activeDb.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
    if (res.length === 0) {
      cachedSchema = [];
      schemaIsDirty = false;
      return [];
    }
    const tableNames = res[0].values.map(v => v[0] as string);
    const schema = tableNames.map((name: string) => {
      const infoRes = activeDb.exec(`PRAGMA table_info([${name}])`);
      const columns = infoRes.length > 0 ? infoRes[0].values.map(v => ({
        name: v[1] as string,
        type: v[2] as string,
        note: ""
      })) : [];
      const orig = tableSchemas.find(t => t.name.toLowerCase() === name.toLowerCase());
      return {
        name,
        domain: orig?.domain ?? "Dynamic Schema",
        description: orig?.description ?? "Table created during active session",
        primaryKey: orig?.primaryKey ?? (columns[0]?.name ?? ""),
        relationships: orig?.relationships ?? [],
        columns
      };
    });
    cachedSchema = schema;
    schemaIsDirty = false;
    return schema;
  } catch (err) {
    return [];
  }
}

/**
 * Generates a full .sql script dump of the current SQLite database state.
 */
export function exportDatabaseAsSql(mode: 'schema' | 'data' | 'both'): string {
  if (!db) return "-- Database is not initialized\n";

  let sqlDump = `-- SQL Analyst Academy Database Export\n`;
  sqlDump += `-- Exported on: ${new Date().toISOString()}\n`;
  sqlDump += `-- Mode: ${mode.toUpperCase()}\n\n`;
  sqlDump += `PRAGMA foreign_keys=OFF;\n\n`;

  try {
    // 1. Fetch all user tables
    const res = db.exec("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
    if (res.length === 0) return sqlDump + "-- No tables found\n";

    const tables = res[0].values.map(v => ({ name: v[0] as string, sql: v[1] as string }));

    for (const table of tables) {
      if (mode === 'schema' || mode === 'both') {
        sqlDump += `-- Table structure for table \`${table.name}\`\n`;
        sqlDump += `DROP TABLE IF EXISTS \`${table.name}\`;\n`;
        sqlDump += `${table.sql};\n\n`;
      }

      if (mode === 'data' || mode === 'both') {
        // Fetch all rows for the table
        const tableData = db.exec(`SELECT * FROM \`${table.name}\``);
        if (tableData.length > 0) {
          sqlDump += `-- Dumping data for table \`${table.name}\`\n`;
          const columns = tableData[0].columns;
          const rows = tableData[0].values;

          for (const row of rows) {
            const valuesStr = row.map(val => {
              if (val === null) return "NULL";
              if (typeof val === "number") return val.toString();
              if (typeof val === "boolean") return val ? "1" : "0";
              // Escape single quotes for SQL compatibility
              const escaped = val.toString().replace(/'/g, "''");
              return `'${escaped}'`;
            }).join(", ");

            sqlDump += `INSERT INTO \`${table.name}\` ` +
                 `(${columns.map((c: string) => `\`${c}\``).join(", ")}) VALUES (${valuesStr});\n`;
          }
          sqlDump += `\n`;
        }
      }
    }

    // 2. Fetch all user indexes
    if (mode === 'schema' || mode === 'both') {
      const indexRes = db.exec(
        "SELECT name, sql FROM sqlite_master WHERE type='index' " +
        "AND name NOT LIKE 'sqlite_%' AND sql IS NOT NULL"
      );
      if (indexRes.length > 0) {
        sqlDump += `-- Table indexes\n`;
        const indexes = indexRes[0].values.map(v => ({ name: v[0] as string, sql: v[1] as string }));
        for (const idx of indexes) {
          sqlDump += `DROP INDEX IF EXISTS \`${idx.name}\`;\n`;
          sqlDump += `${idx.sql};\n`;
        }
        sqlDump += `\n`;
      }
    }

    sqlDump += `PRAGMA foreign_keys=ON;\n`;
    return sqlDump;
  } catch (err) {
    console.error("SQL Export failed:", err);
    return `-- SQL Export failed: ${err instanceof Error ? err.message : String(err)}\n`;
  }
}

export type OptimizationAdvice = {
  type: 'warning' | 'info' | 'success';
  title: string;
  message: string;
  recommendation?: string;
};

export function getOptimizationAdvice(planSteps: QueryPlanStep[], sql: string): OptimizationAdvice[] {
  const advice: OptimizationAdvice[] = [];

  if (planSteps.length === 0) return advice;

  // 1. Check for Table Scans (SCAN)
  const scans = planSteps.filter(s => s.detail.toUpperCase().includes("SCAN"));

  if (scans.length > 0) {
    for (const scan of scans) {
      const match = scan.detail.match(/SCAN TABLE\s+([a-zA-Z0-9_]+)/i);
      const tableName = match ? match[1] : null;

      if (tableName) {
        let recommendCol = "";
        const tableSchema = tableSchemas.find(t => t.name.toLowerCase() === tableName.toLowerCase());

        if (tableSchema) {
          for (const col of tableSchema.columns) {
            const colPattern = new RegExp(`\\b(${tableName}\\.)?${col.name}\\b`, "i");
            if (colPattern.test(sql)) {
              recommendCol = col.name;
              break;
            }
          }
        }

        const recommendation = recommendCol
          ? `CREATE INDEX idx_${tableName.toLowerCase()}_${recommendCol.toLowerCase()} ` +
        `ON ${tableName}(${recommendCol});`
          : `CREATE INDEX idx_${tableName.toLowerCase()}_filter ON ${tableName}(filter_column);`;

        advice.push({
          type: 'warning',
          title: `Full Table Scan on \`${tableName}\``,
          message: `SQLite is scanning all rows of the table \`${tableName}\` to evaluate this query step ` +
               `(\`${scan.detail}\`). This will become extremely slow as the table grows.`,
          recommendation: recommendation
        });
      }
    }
  } else {
    advice.push({
      type: 'success',
      title: "Fully Optimized Query Plan",
      message: "Excellent! Your query execution plan is fully indexed. Every data retrieval step " +
               "is using a fast key lookup or B-Tree search index structure (SEARCH)."
    });
  }

  // 2. Temp table sort warning (SORT / TEMP B-TREE)
  const tempSorts = planSteps.filter(
        s => s.detail.toUpperCase().includes("USE TEMP B-TREE") || s.detail.toUpperCase().includes("SORT")
      );
  if (tempSorts.length > 0) {
    advice.push({
      type: 'info',
      title: "Temporary Sort Operations",
      message: "SQLite is generating a temporary B-Tree index or performing a temporary sorting operation. " +
               "This happens because of an ORDER BY, GROUP BY, or DISTINCT clause that cannot use an existing index.",
      recommendation: "If this query is executed frequently, consider adding an index that " +
                      "matches the ORDER BY columns to avoid the runtime sort overhead."
    });
  }

  // 3. SARGable Query checks
  const upSql = sql.toUpperCase();
  const whereIndex = upSql.indexOf("WHERE");
  if (whereIndex !== -1) {
    const whereClause = sql.substring(whereIndex);

    // Check for date/time functions on columns in WHERE
    if (/strftime\s*\(\s*['"]%Y['"]\s*,\s*([a-zA-Z0-9_\.]+)\)/i.test(whereClause)) {
      const match = whereClause.match(/strftime\s*\(\s*['"]%Y['"]\s*,\s*([a-zA-Z0-9_\.]+)\)/i);
      const colName = match ? match[1] : "date_column";
      advice.push({
        type: 'warning',
        title: "Non-Sargable Date Function in WHERE",
        message: `You are applying the \`strftime\` function on \`${colName}\` in your WHERE clause. ` +
               `This prevents SQLite from using any index on \`${colName}\`, forcing a full scan of all table rows.`,
        recommendation: `Rewrite to: ${colName} >= '2024-01-01' AND ${colName} < '2025-01-01'`
      });
    }

    // Check for other functions like UPPER or LOWER on columns in WHERE
    if (/(upper|lower)\s*\(\s*([a-zA-Z0-9_\.]+)\s*\)/i.test(whereClause)) {
      const match = whereClause.match(/(upper|lower)\s*\(\s*([a-zA-Z0-9_\.]+)\s*\)/i);
      const func = match ? match[1].toUpperCase() : "FUNCTION";
      const colName = match ? match[2] : "column";
      advice.push({
        type: 'warning',
        title: `Non-Sargable ${func} function in WHERE`,
        message: `Applying \`${func}()\` directly to the column \`${colName}\` ignores any indexes on that column.`,
        recommendation: `Consider storing data in a consistent casing or using case-insensitive collation: ` +
                      `WHERE ${colName} = 'value' COLLATE NOCASE`
      });
    }

    // Check for leading wildcards
    if (/like\s*['"]%[^'"]+['"]/i.test(whereClause)) {
      advice.push({
        type: 'warning',
        title: "Leading Wildcard in LIKE Search",
        message: "Your query uses a leading wildcard (e.g. LIKE '%pattern'). The database engine " +
                 "cannot use an index seek for leading wildcards because it doesn't know where " +
                 "the string starts, forcing a Full Scan.",
        recommendation: "Try to avoid leading wildcards: WHERE column LIKE 'pattern%' " +
                      "(this is sargable and uses indexes)."
      });
    }

    // Check for math on columns in WHERE (e.g. price * 1.1 > 100)
    if (/([a-zA-Z0-9_\.]+)\s*[\*\/\+\-]\s*[0-9\.]+\s*(>|<|=|>=|<=)/i.test(whereClause)) {
      const match = whereClause.match(/([a-zA-Z0-9_\.]+)\s*([\*\/\+\-])\s*([0-9\.]+)\s*(>|<|=|>=|<=)\s*([0-9\.]+)/i);
      if (match) {
        const col = match[1];
        const op = match[2];
        const val1 = parseFloat(match[3]);
        const comp = match[4];
        const val2 = parseFloat(match[5]);
        let calculated = val2;
        if (op === '*') calculated = val2 / val1;
        else if (op === '/') calculated = val2 * val1;
        else if (op === '+') calculated = val2 - val1;
        else if (op === '-') calculated = val2 + val1;

        advice.push({
          type: 'warning',
          title: "Mathematical Expression on Column in WHERE",
          message: `Applying math \`${col} ${op} ${val1}\` prevents the database from using an index on ` +
               `\`${col}\`. Keep the column isolated on one side of the comparison.`,
          recommendation: `Isolate the column: WHERE ${col} ${comp} ${calculated.toFixed(2)}`
        });
      }
    }
  }

  return advice;
}
