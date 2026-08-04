import initSqlJs from "sql.js";
import sqlWasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import {
  registerMySqlFunctions,
  prepareMySqlForSqlite,
} from "../utils/mysqlCompat";
import { seedDatabaseInstance } from "../utils/dbSeeder";

let SQL: initSqlJs.SqlJsStatic | null = null;
let dbInstance: initSqlJs.Database | null = null;

export interface WorkerMessageData {
  id: string;
  type:
    | "INIT"
    | "EXECUTE"
    | "RESET"
    | "GET_SCHEMA"
    | "GET_PLAN"
    | "CANCEL"
    | "EXPORT"
    | "IMPORT_CSV";
  sql?: string;
  snapshot?: ArrayBuffer;
  sandbox?: boolean;
  takeSnapshot?: boolean;
  csvData?: { tableName: string; ddl: string; insertStatements: string[] };
}

self.onmessage = async (e: MessageEvent<WorkerMessageData>) => {
  const {
    id,
    type,
    sql = "",
    snapshot,
    sandbox = false,
    takeSnapshot = false,
    csvData,
  } = e.data;

  if (type === "CANCEL") {
    if (dbInstance) {
      try {
        dbInstance.run("ROLLBACK;");
      } catch (_) {}
    }
    self.postMessage({
      id,
      status: "SUCCESS",
      message: "Worker operation cancelled",
    });
    return;
  }

  if (type === "INIT") {
    try {
      if (!SQL) {
        SQL = await initSqlJs({
          locateFile: () => sqlWasmUrl,
        });
      }
      dbInstance = new SQL.Database(
        snapshot ? new Uint8Array(snapshot) : undefined,
      );
      registerMySqlFunctions(dbInstance);
      dbInstance.run("PRAGMA foreign_keys = ON;");
      dbInstance.run("PRAGMA synchronous = OFF;");
      dbInstance.run("PRAGMA journal_mode = MEMORY;");
      dbInstance.run("PRAGMA temp_store = MEMORY;");
      if (!snapshot) {
        seedDatabaseInstance(dbInstance);
      }
      self.postMessage({ id, status: "READY" });
    } catch (err: unknown) {
      self.postMessage({ id, status: "ERROR", error: String(err) });
    }
    return;
  }

  if (type === "RESET") {
    try {
      if (!SQL) {
        SQL = await initSqlJs({
          locateFile: () => sqlWasmUrl,
        });
      }
      dbInstance = new SQL.Database();
      registerMySqlFunctions(dbInstance);
      dbInstance.run("PRAGMA foreign_keys = ON;");
      dbInstance.run("PRAGMA synchronous = OFF;");
      dbInstance.run("PRAGMA journal_mode = MEMORY;");
      dbInstance.run("PRAGMA temp_store = MEMORY;");
      seedDatabaseInstance(dbInstance);
      self.postMessage({ id, status: "READY" });
    } catch (err: unknown) {
      self.postMessage({ id, status: "ERROR", error: String(err) });
    }
    return;
  }

  if (type === "EXPORT") {
    if (!dbInstance) {
      self.postMessage({
        id,
        status: "ERROR",
        error: "Database not initialized",
      });
      return;
    }
    try {
      const binary = dbInstance.export();
      (
        self as unknown as {
          postMessage: (msg: unknown, transfer?: Transferable[]) => void;
        }
      ).postMessage({ id, status: "SUCCESS", snapshot: binary.buffer }, [
        binary.buffer,
      ]);
    } catch (err: unknown) {
      self.postMessage({ id, status: "ERROR", error: String(err) });
    }
    return;
  }

  if (type === "GET_SCHEMA") {
    if (!dbInstance) {
      self.postMessage({ id, status: "SUCCESS", result: [] });
      return;
    }
    try {
      const tablesRes = dbInstance.exec(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
      );
      const schemas: Array<{
        name: string;
        columns: Array<{ name: string; type: string }>;
        count: number;
      }> = [];

      if (tablesRes && tablesRes.length > 0) {
        const tableNames = tablesRes[0].values.map(
          (r: unknown[]) => r[0] as string,
        );
        for (const t of tableNames) {
          const infoRes = dbInstance.exec(`PRAGMA table_info([${t}])`);
          const countRes = dbInstance.exec(`SELECT COUNT(*) FROM [${t}]`);
          const columns =
            infoRes[0]?.values.map((r: unknown[]) => ({
              name: r[1] as string,
              type: (r[2] as string) || "TEXT",
            })) || [];
          const count = Number(countRes[0]?.values[0]?.[0] || 0);
          schemas.push({ name: t, columns, count });
        }
      }
      self.postMessage({ id, status: "SUCCESS", result: schemas });
    } catch (err: unknown) {
      self.postMessage({ id, status: "ERROR", error: String(err) });
    }
    return;
  }

  if (type === "GET_PLAN") {
    if (!dbInstance || !sql.trim()) {
      self.postMessage({ id, status: "SUCCESS", result: [] });
      return;
    }
    try {
      const sqlToRun = prepareMySqlForSqlite(sql);
      const planRes = dbInstance.exec(`EXPLAIN QUERY PLAN ${sqlToRun}`);
      const steps: Array<{ id: number; parent: number; detail: string }> = [];
      if (planRes && planRes.length > 0) {
        for (const row of planRes[0].values) {
          steps.push({
            id: Number(row[0]),
            parent: Number(row[1]),
            detail: String(row[3]),
          });
        }
      }
      self.postMessage({ id, status: "SUCCESS", result: steps });
    } catch (err: unknown) {
      self.postMessage({ id, status: "SUCCESS", result: [] });
    }
    return;
  }

  if (type === "IMPORT_CSV") {
    if (!dbInstance || !csvData) {
      self.postMessage({
        id,
        status: "ERROR",
        error: "Missing database or CSV data",
      });
      return;
    }
    try {
      dbInstance.run("BEGIN TRANSACTION;");
      dbInstance.run(csvData.ddl);
      let insertedRows = 0;
      for (const stmt of csvData.insertStatements) {
        dbInstance.run(stmt);
        insertedRows++;
      }
      dbInstance.run("COMMIT;");
      self.postMessage({
        id,
        status: "SUCCESS",
        result: {
          message: `Successfully imported table [${csvData.tableName}] with ${insertedRows} batch operations.`,
        },
      });
    } catch (err: unknown) {
      try {
        dbInstance.run("ROLLBACK;");
      } catch (_) {}
      self.postMessage({
        id,
        status: "ERROR",
        error: `CSV Import failed: ${String(err)}`,
      });
    }
    return;
  }

  if (type === "EXECUTE") {
    if (!dbInstance) {
      self.postMessage({
        id,
        status: "ERROR",
        error: "Worker database not initialized",
      });
      return;
    }

    const savepointName = `sb_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    let savepointActive = false;

    const t0 = performance.now();
    try {
      if (sandbox) {
        dbInstance.run(`SAVEPOINT ${savepointName};`);
        savepointActive = true;
      }

      const sqlToRun = prepareMySqlForSqlite(sql);
      const res = dbInstance.exec(sqlToRun);
      const durationMs = Math.round(performance.now() - t0);

      let columns: string[] = [];
      let rowObjects: Record<string, unknown>[] = [];

      if (res && res.length > 0) {
        const lastResult = res[res.length - 1];
        columns = lastResult.columns;
        const MAX_ROWS = 5000;
        const rawValues = lastResult.values;
        const cappedValues =
          rawValues.length > MAX_ROWS
            ? rawValues.slice(0, MAX_ROWS)
            : rawValues;

        rowObjects = cappedValues.map((rowArr: unknown[]) => {
          const obj: Record<string, unknown> = {};
          columns.forEach((col, idx) => {
            let val = rowArr[idx];
            if (typeof val === "string" && val.length > 10000) {
              val = val.substring(0, 10000) + "... [Truncated]";
            }
            obj[col] = val;
          });
          return obj;
        });
      }

      let snapshotData: Record<string, unknown[]> | null = null;
      if (takeSnapshot) {
        snapshotData = {};
        const tablesRes = dbInstance.exec(
          "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
        );
        if (tablesRes && tablesRes.length > 0) {
          for (const r of tablesRes[0].values) {
            const tableName = r[0] as string;
            const rowsRes = dbInstance.exec(`SELECT * FROM [${tableName}]`);
            snapshotData[tableName] =
              rowsRes && rowsRes.length > 0 ? rowsRes[0].values : [];
          }
        }
      }

      if (savepointActive) {
        try {
          dbInstance.run(`ROLLBACK TO ${savepointName};`);
          dbInstance.run(`RELEASE ${savepointName};`);
        } catch (_) {
          // If user query issued explicit COMMIT/ROLLBACK, SQLite released savepoint automatically
          try {
            dbInstance.run("ROLLBACK;");
          } catch (_) {}
        }
      }

      self.postMessage({
        id,
        status: "SUCCESS",
        result: {
          columns,
          rows: rowObjects,
          message: `Query executed successfully (${rowObjects.length} row${rowObjects.length !== 1 ? "s" : ""})`,
          durationMs,
          snapshot: snapshotData,
        },
      });
    } catch (err: unknown) {
      if (savepointActive) {
        try {
          dbInstance.run(`ROLLBACK TO ${savepointName};`);
          dbInstance.run(`RELEASE ${savepointName};`);
        } catch (_) {
          try {
            dbInstance.run("ROLLBACK;");
          } catch (_) {}
        }
      }
      self.postMessage({
        id,
        status: "ERROR",
        error:
          (err as Error)?.message || String(err) || "Query execution failed",
      });
    }
  }
};
