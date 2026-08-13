/**
 * MySQL 8-compatible helpers for the embedded sql.js runner.
 *
 * The browser sandbox uses SQLite internally, so these functions bridge the
 * small set of MySQL functions used by the lessons without changing the SQL
 * students learn and submit.
 */
export function registerMySqlFunctions(db: {
  create_function: (
    name: string,
    fn: (...args: unknown[]) => unknown,
  ) => unknown;
}) {
  db.create_function("CONCAT", (...args: unknown[]) =>
    args.some((value) => value === null || value === undefined)
      ? null
      : args.map((value) => String(value)).join(""),
  );
  db.create_function("CONCAT_WS", (separator: unknown, ...args: unknown[]) =>
    separator === null || separator === undefined
      ? null
      : args
          .filter((value) => value !== null && value !== undefined)
          .join(String(separator)),
  );
  db.create_function(
    "SUBSTRING_INDEX",
    (value: unknown, delimiter: unknown, count: unknown) => {
      if (value === null || delimiter === null || count === null) return null;
      const text = String(value);
      const separator = String(delimiter);
      const parts = separator === "" ? [text] : text.split(separator);
      const n = Number(count);
      if (!Number.isFinite(n) || n === 0) return "";
      return n > 0
        ? parts.slice(0, n).join(separator)
        : parts.slice(n).join(separator);
    },
  );
  db.create_function("YEAR", (value: unknown) => extractDatePart(value, 0));
  db.create_function("MONTH", (value: unknown) => extractDatePart(value, 1));
  db.create_function("DAY", (value: unknown) => extractDatePart(value, 2));
  db.create_function("DAYOFWEEK", (value: unknown) => {
    const date = new Date(String(value));
    return Number.isNaN(date.getTime()) ? null : date.getUTCDay() + 1;
  });
  db.create_function(
    "DATEDIFF",
    (end: unknown, start: unknown) => dateOnly(end) - dateOnly(start),
  );
  db.create_function("TO_DAYS", (value: unknown) => dateOnly(value));
  db.create_function(
    "TIMESTAMPDIFF",
    (unit: unknown, start: unknown, end: unknown) => {
      if (String(unit).toUpperCase() !== "MONTH") return null;
      const startDate = new Date(String(start));
      const endDate = new Date(String(end));
      if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()))
        return null;
      return (
        (endDate.getUTCFullYear() - startDate.getUTCFullYear()) * 12 +
        endDate.getUTCMonth() -
        startDate.getUTCMonth()
      );
    },
  );
  db.create_function("DATE_FORMAT", (value: unknown, format: unknown) =>
    formatDate(value, format),
  );
  db.create_function("CURDATE", () => new Date().toISOString().slice(0, 10));
  db.create_function("NOW", () =>
    new Date().toISOString().slice(0, 19).replace("T", " "),
  );
  db.create_function(
    "IF",
    (condition: unknown, whenTrue: unknown, whenFalse: unknown) =>
      condition ? whenTrue : whenFalse,
  );
}

/** Translate MySQL's GROUP_CONCAT(... SEPARATOR '...') into SQLite's equivalent. */
export function prepareMySqlForSqlite(sql: string): string {
  return sql
    .replace(/TIMESTAMPDIFF\(\s*MONTH\s*,/gi, "TIMESTAMPDIFF('MONTH',")
    .replace(
      /GROUP_CONCAT\(\s*([^()]+?)\s+SEPARATOR\s+('[^']*'|"[^"]*")\s*\)/gi,
      "GROUP_CONCAT($1, $2)",
    );
}

function dateOnly(value: unknown): number {
  const time = Date.parse(String(value));
  return Number.isNaN(time) ? NaN : Math.floor(time / 86400000);
}

function extractDatePart(value: unknown, part: number): number | null {
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  return [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()][
    part
  ];
}

function formatDate(value: unknown, format: unknown): string | null {
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  const tokens: Record<string, string> = {
    "%Y": String(date.getUTCFullYear()),
    "%m": pad(date.getUTCMonth() + 1),
    "%d": pad(date.getUTCDate()),
    "%H": pad(date.getUTCHours()),
    "%i": pad(date.getUTCMinutes()),
    "%s": pad(date.getUTCSeconds()),
  };
  return String(format).replace(
    /%[YmdHis]/g,
    (token) => tokens[token] ?? token,
  );
}
