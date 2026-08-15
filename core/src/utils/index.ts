export {
  initDatabase,
  runQuery,
  resetDatabase,
  getLiveSchema,
  getQueryPlan,
  formatSql,
} from "./sqlEngine";

export { lintSqlQuery } from "./sqlLinter";
export { lintSqlAntiPatterns } from "./sqlAntiPatternLinter";
export { translateSqlDialect } from "./sqlDialectTranslator";
export { registerSchemaCompletions } from "./schemaIntelliSense";
export {
  calculateTotalXP,
  getProgressionLevel,
  getNextProgressionLevel,
  calculateInterviewReadiness,
} from "./progressionEngine";
export { exportWorkspaceAsJson } from "./workspaceSnapshot";
export { prepareMySqlForSqlite } from "./mysqlCompat";
export { translateSqlError } from "./sqlErrorTranslator";
export { formatStudyTime } from "./formatters";
export { downloadStatsReport } from "./reportGenerator";
export { calculateSM2 } from "./sm2Engine";
export type { QueryResult, QueryPlanStep } from "./sqlEngine";
export type { LintError } from "./sqlLinter";
