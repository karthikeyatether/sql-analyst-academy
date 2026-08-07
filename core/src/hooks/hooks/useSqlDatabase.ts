import { useState, useEffect } from "react";
import { QueryResult } from "../utils/sqlEngine";
import { tableSchemas } from "../data/datasets";
import { LintError } from "../utils/sqlLinter";

const loadSqlEngine = () => import("../utils/sqlEngine");
const rawInitDatabase = () => loadSqlEngine().then((engine) => engine.initDatabase());
export const resetDatabase = (force?: boolean) => loadSqlEngine().then((engine) => engine.resetDatabase(force));
export const runQuery = (...args: [string, boolean?, boolean?, number?]) => loadSqlEngine().then((engine) => engine.runQuery(...args));
export const getLiveSchema = () => loadSqlEngine().then((engine) => engine.getLiveSchema());

export function useSqlDatabase(activeView: string) {
  const [dbReady, setDbReady] = useState(false);
  const [liveSchema, setLiveSchema] = useState<typeof tableSchemas>([]);
  const [queryResult, setQueryResult] = useState<QueryResult>({
    rows: [],
    columns: [],
    error: null,
    durationMs: 0,
  });
  const [expectedResult, setExpectedResult] = useState<QueryResult | null>(null);
  const [lintErrors, setLintErrors] = useState<LintError[]>([]);

  return {
    dbReady,
    setDbReady,
    liveSchema,
    setLiveSchema,
    queryResult,
    setQueryResult,
    expectedResult,
    setExpectedResult,
    lintErrors,
    setLintErrors,
    initDatabase: rawInitDatabase,
    resetDatabase,
    runQuery,
    getLiveSchema,
  };
}
