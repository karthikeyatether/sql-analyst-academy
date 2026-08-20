/**
 * Multi-Dialect SQL Translation Lens
 * Translates standard SQLite SQL to PostgreSQL, MySQL, Snowflake, and BigQuery dialects.
 */

export type SqlDialect = "postgresql" | "mysql" | "snowflake" | "bigquery";

export interface DialectTranslation {
  dialect: SqlDialect;
  displayName: string;
  translatedSql: string;
  notes: string[];
}

export function translateSqlDialect(
  sql: string,
): Record<SqlDialect, DialectTranslation> {
  const cleanSql = sql.trim();

  // PostgreSQL translation
  let pgSql = cleanSql
    .replace(/\bIFNULL\s*\(/gi, "COALESCE(")
    .replace(
      /\bstrftime\s*\(\s*['"]%Y['"]\s*,\s*([^)]+)\)/gi,
      "EXTRACT(YEAR FROM $1)",
    )
    .replace(
      /\bstrftime\s*\(\s*['"]%m['"]\s*,\s*([^)]+)\)/gi,
      "EXTRACT(MONTH FROM $1)",
    )
    .replace(
      /\bstrftime\s*\(\s*['"]%Y-%m['"]\s*,\s*([^)]+)\)/gi,
      "TO_CHAR($1, 'YYYY-MM')",
    );

  // MySQL translation
  let mysqlSql = cleanSql
    .replace(/\bstrftime\s*\(\s*['"]%Y['"]\s*,\s*([^)]+)\)/gi, "YEAR($1)")
    .replace(/\bstrftime\s*\(\s*['"]%m['"]\s*,\s*([^)]+)\)/gi, "MONTH($1)")
    .replace(
      /\bstrftime\s*\(\s*['"]%Y-%m['"]\s*,\s*([^)]+)\)/gi,
      "DATE_FORMAT($1, '%Y-%m')",
    );

  // Snowflake translation
  let sfSql = cleanSql
    .replace(/\bIFNULL\s*\(/gi, "NVL(")
    .replace(
      /\bstrftime\s*\(\s*['"]%Y['"]\s*,\s*([^)]+)\)/gi,
      "DATE_PART('year', $1)",
    )
    .replace(
      /\bstrftime\s*\(\s*['"]%m['"]\s*,\s*([^)]+)\)/gi,
      "DATE_PART('month', $1)",
    )
    .replace(
      /\bstrftime\s*\(\s*['"]%Y-%m['"]\s*,\s*([^)]+)\)/gi,
      "TO_VARCHAR($1, 'YYYY-MM')",
    );

  // BigQuery translation
  let bqSql = cleanSql
    .replace(/\bIFNULL\s*\(/gi, "IFNULL(")
    .replace(
      /\bstrftime\s*\(\s*['"]%Y['"]\s*,\s*([^)]+)\)/gi,
      "EXTRACT(YEAR FROM $1)",
    )
    .replace(
      /\bstrftime\s*\(\s*['"]%m['"]\s*,\s*([^)]+)\)/gi,
      "EXTRACT(MONTH FROM $1)",
    )
    .replace(
      /\bstrftime\s*\(\s*['"]%Y-%m['"]\s*,\s*([^)]+)\)/gi,
      "FORMAT_DATE('%Y-%m', $1)",
    );

  return {
    postgresql: {
      dialect: "postgresql",
      displayName: "PostgreSQL",
      translatedSql: pgSql,
      notes: [
        "Uses standard ANSI SQL syntax with COALESCE for NULL coalescing.",
        "Date parsing utilizes EXTRACT() and TO_CHAR() functions.",
        "Supports ILIKE for case-insensitive string matching.",
      ],
    },
    mysql: {
      dialect: "mysql",
      displayName: "MySQL 8.0+",
      translatedSql: mysqlSql,
      notes: [
        "Uses YEAR(), MONTH(), and DATE_FORMAT() for temporal extraction.",
        "Default string comparisons are case-insensitive depending on collation.",
        "Supports IFNULL() and standard LIMIT clause syntax.",
      ],
    },
    snowflake: {
      dialect: "snowflake",
      displayName: "Snowflake Cloud DWH",
      translatedSql: sfSql,
      notes: [
        "Supports NVL() as well as ANSI COALESCE().",
        "Date parsing utilizes DATE_PART() and TO_VARCHAR().",
        "Supports QUALIFY clause to filter window function results without CTE subqueries.",
      ],
    },
    bigquery: {
      dialect: "bigquery",
      displayName: "Google BigQuery",
      translatedSql: bqSql,
      notes: [
        "Standard SQL uses EXTRACT(YEAR FROM ...) and FORMAT_DATE().",
        "Supports SAFE_CAST() and SAFE_DIVIDE() to avoid query execution crashes on divide-by-zero.",
        "Fully supports QUALIFY filtering directly on windowed aggregations.",
      ],
    },
  };
}
