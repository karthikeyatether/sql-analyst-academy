import initSqlJs from "sql.js";
import sqlWasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import { tableSchemas } from "../data/datasets";
import { translateSqlError } from "./sqlErrorTranslator";
import { seedDatabaseInstance } from "./dbSeeder";
import { prepareMySqlForSqlite, registerMySqlFunctions } from "./mysqlCompat";
import { isModifyingQuery } from "./graderService";

// Simple LRU Cache for read-only queries to prevent web-worker serialization overhead
const QUERY_CACHE = new Map<
  string,
  QueryResult & { snapshot?: Record<string, unknown[]> | null }
>();
const CACHE_MAX_SIZE = 5;

function getCachedQuery(sql: string) {
  if (QUERY_CACHE.has(sql)) {
    const res = QUERY_CACHE.get(sql)!;
    QUERY_CACHE.delete(sql);
    QUERY_CACHE.set(sql, res); // LRU bump
    return res;
  }
  return null;
}

function setCachedQuery(
  sql: string,
  result: QueryResult & { snapshot?: Record<string, unknown[]> | null },
) {
  if (QUERY_CACHE.has(sql)) {
    QUERY_CACHE.delete(sql);
  } else if (QUERY_CACHE.size >= CACHE_MAX_SIZE) {
    const firstKey = QUERY_CACHE.keys().next().value;
    if (firstKey) QUERY_CACHE.delete(firstKey);
  }
  QUERY_CACHE.set(sql, result);
}

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

type WorkerResponse = {
  result?:
    | QueryResult
    | QueryPlanStep[]
    | Array<{
        name: string;
        columns: Array<{ name: string; type: string }>;
        count: number;
      }>;
  snapshot?: ArrayBuffer | Record<string, unknown[]> | null;
  status?: string;
};

export let initError: string | null = null;
let workerInstance: Worker | null = null;
let nodeDbInstance: initSqlJs.Database | null = null;
let initPromise: Promise<void> | null = null;
const pendingWorkerRequests = new Map<
  string,
  {
    resolve: (val: WorkerResponse) => void;
    reject: (err: Error) => void;
    timer: ReturnType<typeof setTimeout>;
  }
>();
let workerLifecycle: Promise<void> = Promise.resolve();

function rejectPendingWorkerRequests(error: Error): void {
  for (const [id, request] of pendingWorkerRequests) {
    clearTimeout(request.timer);
    pendingWorkerRequests.delete(id);
    request.reject(error);
  }
}

function isWorkerSupported(): boolean {
  return typeof window !== "undefined" && typeof window.Worker !== "undefined";
}

export async function initDatabase(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = workerLifecycle.then(async () => {
    try {
      initError = null;
      await initializeDatabase();
    } catch (err: unknown) {
      console.error("Failed to initialize SQL engine:", err);
      initError = (err as Error)?.message || String(err);
      initPromise = null;
      throw err;
    }
  });

  return initPromise;
}

export async function cancelActiveQuery(): Promise<void> {
  const restart = workerLifecycle.then(async () => {
    const worker = workerInstance;
    if (!worker) return;

    rejectPendingWorkerRequests(
      new Error("SQL worker operation was cancelled."),
    );
    worker.terminate();
    workerInstance = null;
    initPromise = null;

    // Initialize directly while holding the lifecycle barrier. Calling the
    // public initDatabase here would wait on this same promise.
    await initializeDatabase();
  });
  workerLifecycle = restart.catch(() => {});
  await restart;
}

async function initializeDatabase(): Promise<void> {
  if (isWorkerSupported()) {
    if (!workerInstance) {
      if (import.meta.env.VITE_BUILD_TOOL === "esbuild") {
        workerInstance = new Worker("/workers/sqlWorker.js", {
          type: "module",
        });
      } else {
        workerInstance = new Worker(
          new URL("../workers/sqlWorker.ts", import.meta.url),
          { type: "module" },
        );
      }

      workerInstance.onmessage = (e: MessageEvent) => {
        const { id, status, result, snapshot, error } = e.data;
        const handler = pendingWorkerRequests.get(id);
        if (!handler) return;
        pendingWorkerRequests.delete(id);
        clearTimeout(handler.timer);
        if (status === "ERROR")
          handler.reject(new Error(error || "Worker error"));
        else handler.resolve({ result, snapshot, status });
      };
      workerInstance.onerror = () => {
        rejectPendingWorkerRequests(
          new Error("SQL worker failed while processing a request."),
        );
        if (workerInstance) {
          try {
            workerInstance.terminate();
          } catch (_) {}
          workerInstance = null;
        }
        initPromise = null;
      };
    }
    await requestWorker("INIT", {}, 15000);
    return;
  }

  const SQL = await initSqlJs({ locateFile: () => sqlWasmUrl });
  if (nodeDbInstance) {
    try {
      nodeDbInstance.close();
    } catch (_) {}
  }
  nodeDbInstance = new SQL.Database();
  registerMySqlFunctions(nodeDbInstance);
  nodeDbInstance.run("PRAGMA foreign_keys = ON;");
  nodeDbInstance.run("PRAGMA synchronous = OFF;");
  nodeDbInstance.run("PRAGMA journal_mode = MEMORY;");
  nodeDbInstance.run("PRAGMA temp_store = MEMORY;");
  seedDatabaseInstance(nodeDbInstance);
}

function requestWorker(
  type: string,
  payload: Record<string, unknown>,
  timeoutMs: number,
): Promise<WorkerResponse> {
  const worker = workerInstance;
  if (!worker) return Promise.reject(new Error("SQL worker is unavailable."));
  const reqId = `${type.toLowerCase()}_${Date.now()}_${Math.random()}`;
  return new Promise<WorkerResponse>((resolve, reject) => {
    const timer = setTimeout(() => {
      pendingWorkerRequests.delete(reqId);
      const message =
        type === "EXECUTE"
          ? `Query execution timed out after ${timeoutMs}ms and was safely cancelled.`
          : `SQL worker request timed out after ${timeoutMs}ms.`;
      reject(new Error(message));
      if (type === "EXECUTE") void cancelActiveQuery();
    }, timeoutMs);
    pendingWorkerRequests.set(reqId, { resolve, reject, timer });
    try {
      worker.postMessage({ id: reqId, type, ...payload });
    } catch (error: unknown) {
      clearTimeout(timer);
      pendingWorkerRequests.delete(reqId);
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

export async function resetDatabase(force: boolean = false): Promise<void> {
  await initDatabase();
  if (workerInstance) {
    await requestWorker("RESET", { force }, 15000);
  } else if (nodeDbInstance) {
    try {
      nodeDbInstance.close();
    } catch (_) {}
    const SQL = await initSqlJs({ locateFile: () => sqlWasmUrl });
    nodeDbInstance = new SQL.Database();
    registerMySqlFunctions(nodeDbInstance);
    nodeDbInstance.run("PRAGMA foreign_keys = ON;");
    nodeDbInstance.run("PRAGMA synchronous = OFF;");
    nodeDbInstance.run("PRAGMA journal_mode = MEMORY;");
    nodeDbInstance.run("PRAGMA temp_store = MEMORY;");
    seedDatabaseInstance(nodeDbInstance);
  }
  clearQueryCache();
}

export async function runQuery(
  sql: string,
  sandbox: boolean = false,
  captureSnapshot: boolean = false,
  timeoutMs: number = 8000,
): Promise<QueryResult & { snapshot?: Record<string, unknown[]> | null }> {
  await initDatabase();
  const trimmed = sql.trim();
  if (!trimmed) {
    return { columns: [], rows: [], message: "Write a query and press Run." };
  }

  const isModifying = isModifyingQuery(trimmed);
  if (isModifying) {
    clearQueryCache(); // Invalidate cache if mutating data
  } else if (!sandbox) {
    // Only use cache for non-sandbox (standard playground) read queries
    const cached = getCachedQuery(trimmed);
    if (cached) return cached;
  }

  if (workerInstance) {
    try {
      let response: WorkerResponse;
      try {
        response = await requestWorker(
          "EXECUTE",
          { sql: trimmed, sandbox, takeSnapshot: captureSnapshot },
          timeoutMs,
        );
      } catch (firstErr: unknown) {
        // On worker crash, re-initialize database worker once and retry in-flight query
        if (!workerInstance) {
          initPromise = null;
          await initDatabase();
          response = await requestWorker(
            "EXECUTE",
            { sql: trimmed, sandbox, takeSnapshot: captureSnapshot },
            timeoutMs,
          );
        } else {
          throw firstErr;
        }
      }
      const res = response.result as QueryResult;
      if (!isModifying && !sandbox && !res.error) {
        setCachedQuery(trimmed, res);
      }
      return res;
    } catch (err: unknown) {
      const sqlToRun = prepareMySqlForSqlite(trimmed);
      const rawError = (err as Error)?.message || String(err);
      return {
        columns: [],
        rows: [],
        message: "Query failed",
        error: translateSqlError(rawError, sqlToRun),
      };
    }
  }

  // Node fallback execution
  if (!nodeDbInstance) {
    return {
      columns: [],
      rows: [],
      message: "Database engine not initialized.",
    };
  }

  try {
    const sqlToRun = prepareMySqlForSqlite(trimmed);
    const savepointName = `sb_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    let txStarted = false;
    if (sandbox) {
      nodeDbInstance.run(`SAVEPOINT ${savepointName};`);
      txStarted = true;
    }
    const t0 = performance.now();
    const result = nodeDbInstance.exec(sqlToRun);
    const durationMs = Math.round(performance.now() - t0);

    let snapshot: Record<string, unknown[]> | null = null;
    if (sandbox && captureSnapshot) {
      snapshot = await getDatabaseSnapshot();
    }

    if (txStarted) {
      nodeDbInstance.run(`ROLLBACK TO ${savepointName};`);
      nodeDbInstance.run(`RELEASE ${savepointName};`);
    }

    if (result.length === 0) {
      return {
        columns: [],
        rows: [],
        message: "Query executed successfully. 0 rows returned.",
        durationMs,
        snapshot,
      };
    }

    const lastResult = result[result.length - 1];
    const columns = lastResult.columns;
    const MAX_ROWS = 5000;
    const rawValues = lastResult.values;
    const cappedValues =
      rawValues.length > MAX_ROWS ? rawValues.slice(0, MAX_ROWS) : rawValues;

    const rows = cappedValues.map((valArr: unknown[]) => {
      const row: Record<string, unknown> = {};
      columns.forEach((col: string, idx: number) => {
        let val = valArr[idx];
        if (typeof val === "string" && val.length > 10000) {
          val = val.substring(0, 10000) + "... [Truncated]";
        }
        row[col] = val;
      });
      return row;
    });

    return {
      columns,
      rows,
      message: `${rawValues.length} row${rawValues.length === 1 ? "" : "s"} returned`,
      durationMs,
      snapshot,
    };
  } catch (error: unknown) {
    const rawError = (error as Error)?.message || String(error);
    return {
      columns: [],
      rows: [],
      message: "Query failed",
      error: translateSqlError(rawError, trimmed),
    };
  }
}

export async function runQueryAsync(
  sql: string,
  sandbox: boolean = false,
  captureSnapshot: boolean = false,
  timeoutMs: number = 5000,
): Promise<QueryResult & { snapshot?: Record<string, unknown[]> | null }> {
  return runQuery(sql, sandbox, captureSnapshot, timeoutMs);
}

export async function getQueryPlan(sql: string): Promise<QueryPlanStep[]> {
  await initDatabase();
  if (workerInstance) {
    try {
      const res = await requestWorker("GET_PLAN", { sql }, 10000);
      return (res.result as QueryPlanStep[]) || [];
    } catch (_) {
      return [];
    }
  }
  if (!nodeDbInstance) return [];
  try {
    const planRes = nodeDbInstance.exec(
      `EXPLAIN QUERY PLAN ${prepareMySqlForSqlite(sql)}`,
    );
    if (planRes && planRes.length > 0) {
      return planRes[0].values.map((row: unknown[]) => ({
        id: Number(row[0]),
        parent: Number(row[1]),
        detail: String(row[3]),
      }));
    }
  } catch (_) {}
  return [];
}

export async function exportDatabaseState(): Promise<Uint8Array | null> {
  await initDatabase();
  if (workerInstance) {
    try {
      const res = await requestWorker("EXPORT", {}, 10000);
      return res.snapshot ? new Uint8Array(res.snapshot as ArrayBuffer) : null;
    } catch (_) {
      return null;
    }
  }
  return nodeDbInstance ? nodeDbInstance.export() : null;
}

export function formatSql(sql: string): string {
  if (!sql || !sql.trim()) return "";

  // Tokenize preserving strings ('...'), identifiers ("..." or `...`), and comments (--... or /*...*/)
  const tokens: { text: string; isLiteralOrComment: boolean }[] = [];
  const regex =
    /('(?:''|[^'])*'|--[^\r\n]*|\/\*[\s\S]*?\*\/|[a-zA-Z_][a-zA-Z0-9_]*|"(?:""|[^"])*"|`[^`]*`|<=|>=|<>|!=|::|[(),;=><+*-]|\S+)/g;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(sql)) !== null) {
    const text = match[0];
    const isLiteralOrComment =
      text.startsWith("'") ||
      text.startsWith('"') ||
      text.startsWith("`") ||
      text.startsWith("--") ||
      text.startsWith("/*");
    tokens.push({ text, isLiteralOrComment });
  }

  // Standard SQL Keywords
  const KEYWORDS = new Set([
    "SELECT",
    "FROM",
    "WHERE",
    "GROUP",
    "BY",
    "HAVING",
    "ORDER",
    "LIMIT",
    "OFFSET",
    "JOIN",
    "LEFT",
    "RIGHT",
    "INNER",
    "FULL",
    "OUTER",
    "CROSS",
    "ON",
    "USING",
    "WITH",
    "AS",
    "UNION",
    "ALL",
    "INSERT",
    "INTO",
    "VALUES",
    "UPDATE",
    "SET",
    "DELETE",
    "CREATE",
    "TABLE",
    "ALTER",
    "DROP",
    "INDEX",
    "VIEW",
    "OR",
    "REPLACE",
    "AND",
    "IN",
    "NOT",
    "EXISTS",
    "BETWEEN",
    "LIKE",
    "ILIKE",
    "IS",
    "NULL",
    "CASE",
    "WHEN",
    "THEN",
    "ELSE",
    "END",
    "OVER",
    "PARTITION",
    "WINDOW",
    "DISTINCT",
    "ASC",
    "DESC",
    "NULLS",
    "FIRST",
    "LAST",
    "CAST",
    "COALESCE",
    "NULLIF",
    "COUNT",
    "SUM",
    "AVG",
    "MIN",
    "MAX",
    "ROUND",
    "ROW_NUMBER",
    "RANK",
    "DENSE_RANK",
    "LAG",
    "LEAD",
    "FIRST_VALUE",
    "LAST_VALUE",
    "SUBSTR",
    "SUBSTRING",
    "CONCAT",
    "DATE",
    "DATETIME",
    "STRFTIME",
    "UPPER",
    "LOWER",
    "LENGTH",
    "TRUE",
    "FALSE",
  ]);

  // Uppercase keywords while keeping literal text & comments unchanged
  const processedTokens = tokens.map((token) => {
    if (token.isLiteralOrComment) return token.text;
    const upper = token.text.toUpperCase();
    return KEYWORDS.has(upper) ? upper : token.text;
  });

  let result = "";

  for (let i = 0; i < processedTokens.length; i++) {
    const curr = processedTokens[i];
    const next = processedTokens[i + 1] || "";

    if (curr === "SELECT" || curr === "WITH") {
      if (result.length > 0 && !result.endsWith("\n")) result += "\n";
      result += curr + " ";
    } else if (
      curr === "FROM" ||
      curr === "WHERE" ||
      curr === "HAVING" ||
      curr === "LIMIT" ||
      curr === "OFFSET"
    ) {
      if (!result.endsWith("\n")) result += "\n";
      result += curr + " ";
    } else if (curr === "GROUP" && next === "BY") {
      if (!result.endsWith("\n")) result += "\n";
      result += "GROUP BY ";
      i++;
    } else if (curr === "ORDER" && next === "BY") {
      if (!result.endsWith("\n")) result += "\n";
      result += "ORDER BY ";
      i++;
    } else if (curr === "PARTITION" && next === "BY") {
      result += "PARTITION BY ";
      i++;
    } else if (curr === "LEFT" && next === "JOIN") {
      if (!result.endsWith("\n")) result += "\n";
      result += "LEFT JOIN ";
      i++;
    } else if (curr === "RIGHT" && next === "JOIN") {
      if (!result.endsWith("\n")) result += "\n";
      result += "RIGHT JOIN ";
      i++;
    } else if (curr === "INNER" && next === "JOIN") {
      if (!result.endsWith("\n")) result += "\n";
      result += "INNER JOIN ";
      i++;
    } else if (curr === "FULL" && next === "JOIN") {
      if (!result.endsWith("\n")) result += "\n";
      result += "FULL JOIN ";
      i++;
    } else if (curr === "CROSS" && next === "JOIN") {
    } else if (curr === "UNION" && next === "ALL") {
      if (!result.endsWith("\n")) result += "\n";
      result += "UNION ALL\n";
      i++;
    } else if (curr === "UNION") {
      if (!result.endsWith("\n")) result += "\n";
      result += "UNION\n";
    } else if (curr === "AND" || curr === "OR") {
      if (!result.endsWith("\n")) result += "\n  ";
      result += curr + " ";
    } else if (curr === ",") {
      result = result.trimEnd() + ",\n  ";
    } else if (curr === ";") {
      result = result.trimEnd() + ";\n";
    } else if (curr === "(") {
      result += "(";
    } else if (curr === ")") {
      result = result.trimEnd() + ")";
    } else {
      if (
        result.length > 0 &&
        !result.endsWith("\n") &&
        !result.endsWith(" ") &&
        !result.endsWith("(") &&
        curr !== "," &&
        curr !== ";"
      ) {
        result += " ";
      }
      result += curr;
    }
  }

  return result
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function buildExecutionPlan(sql: string): string[] {
  const plans: string[] = ["0: SCAN TABLE (In-Memory SQLite Virtual Engine)"];
  const upper = sql.toUpperCase();
  if (upper.includes("WHERE")) plans.push("1: FILTER ROWS BY PREDICATE");
  if (upper.includes("GROUP BY")) plans.push("2: HASH AGGREGATION / GROUP BY");
  if (upper.includes("ORDER BY"))
    plans.push("3: SORT (USING B-TREE / IN-MEMORY)");
  if (upper.includes("LIMIT")) plans.push("4: TRUNCATE RESULT TO LIMIT");
  return plans;
}

export function explainQueryForTutor(sql: string): string {
  if (!sql.trim()) return "Enter a query to get step-by-step SQL explanation.";
  const upper = sql.toUpperCase();
  const parts: string[] = [];
  if (upper.includes("SELECT"))
    parts.push("• Projection: Picks specific target columns or expressions.");
  if (upper.includes("FROM"))
    parts.push("• Source: Reads record sets from the underlying table(s).");
  if (upper.includes("WHERE"))
    parts.push(
      "• Filtering: Evaluates condition predicates to exclude non-matching rows.",
    );
  if (upper.includes("GROUP BY"))
    parts.push(
      "• Aggregation: Groups matching rows to compute summary metrics.",
    );
  if (upper.includes("ORDER BY"))
    parts.push("• Sorting: Sorts final results by specified key expressions.");
  return parts.join("\n") || "Valid SQL query ready for execution.";
}

export function getSqlCompletions(): string[] {
  return [
    "SELECT",
    "FROM",
    "WHERE",
    "GROUP BY",
    "HAVING",
    "ORDER BY",
    "LIMIT",
    "OFFSET",
    "JOIN",
    "LEFT JOIN",
    "RIGHT JOIN",
    "INNER JOIN",
    "ON",
    "AS",
    "COUNT()",
    "SUM()",
    "AVG()",
    "MIN()",
    "MAX()",
    "COALESCE()",
    "CASE",
    "WHEN",
    "THEN",
    "ELSE",
    "END",
    "OVER()",
    "PARTITION BY",
    "ROW_NUMBER()",
    "RANK()",
    "DENSE_RANK()",
    "WITH",
    "RECURSIVE",
    "EXISTS",
    "IN",
    "LIKE",
    "BETWEEN",
    "customers",
    "orders",
    "order_items",
    "products",
    "reviews",
  ];
}

export async function getDatabaseSnapshot(): Promise<Record<
  string,
  unknown[]
> | null> {
  await initDatabase();
  const snapshotData: Record<string, unknown[]> = {};
  if (workerInstance) {
    const schema = await getLiveSchema();
    for (const t of Object.keys(schema)) {
      const res = await runQuery(`SELECT * FROM [${t}]`);
      snapshotData[t] = res.rows || [];
    }
    return snapshotData;
  }
  if (!nodeDbInstance) return null;
  const tablesRes = nodeDbInstance.exec(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
  );
  if (tablesRes && tablesRes.length > 0) {
    for (const r of tablesRes[0].values) {
      const tableName = r[0] as string;
      const rowsRes = nodeDbInstance.exec(`SELECT * FROM [${tableName}]`);
      snapshotData[tableName] =
        rowsRes && rowsRes.length > 0 ? rowsRes[0].values : [];
    }
  }
  return snapshotData;
}

export function generateDynamicHint(
  userSql: string,
  solutionSql: string,
): string {
  if (!userSql.trim()) return "Start by writing a SELECT query.";
  const userUpper = userSql.toUpperCase();
  const solUpper = solutionSql.toUpperCase();
  if (solUpper.includes("GROUP BY") && !userUpper.includes("GROUP BY")) {
    return "Tip: The target result requires aggregate grouping (`GROUP BY`).";
  }
  if (solUpper.includes("JOIN") && !userUpper.includes("JOIN")) {
    return "Tip: You need to combine datasets using a `JOIN` clause.";
  }
  if (solUpper.includes("ORDER BY") && !userUpper.includes("ORDER BY")) {
    return "Tip: Make sure to sort your output rows using `ORDER BY`.";
  }
  return "Review your column selections, filters, and join conditions.";
}

export async function getLiveSchema(): Promise<typeof tableSchemas> {
  if (cachedSchema) return cachedSchema;

  await initDatabase();
  if (workerInstance) {
    try {
      const res = await requestWorker("GET_SCHEMA", {}, 10000);
      const schemas: Record<
        string,
        { columns: Array<{ name: string; type: string }>; rowCount: number }
      > = {};
      const resultList = res.result as Array<{
        name: string;
        columns: Array<{ name: string; type: string }>;
        count: number;
      }>;
      if (resultList) {
        for (const t of resultList) {
          schemas[t.name] = {
            columns: t.columns,
            rowCount: t.count,
          };
        }
      }
      cachedSchema = schemas as unknown as typeof tableSchemas;
      return cachedSchema;
    } catch (_) {
      return tableSchemas;
    }
  }
  return tableSchemas;
}

export function exportDatabaseAsSql(
  _mode: "schema" | "data" | "both" = "both",
): string {
  return "-- SQL Database Export\n";
}

export function getOptimizationAdvice(sql: string): OptimizationAdvice {
  const advice: string[] = [];
  const upper = sql.toUpperCase();
  if (upper.includes("SELECT *")) {
    advice.push(
      "Avoid `SELECT *`. Specify explicit column names to optimize memory and network bandwidth.",
    );
  }
  if (upper.includes("LIKE '%")) {
    advice.push(
      "Leading wildcards in `LIKE '%...'` force full table scans and bypass B-tree indexes.",
    );
  }
  return {
    score: advice.length === 0 ? 100 : Math.max(50, 100 - advice.length * 25),
    advice,
  };
}

type OptimizationAdvice = {
  score: number;
  advice: string[];
};

let cachedSchema: typeof tableSchemas | null = null;

export function clearQueryCache(): void {
  QUERY_CACHE.clear();
  cachedSchema = null;
}
