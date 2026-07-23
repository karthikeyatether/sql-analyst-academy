import initSqlJs from "sql.js";
import { seedTables, tableSchemas } from "../data/datasets";

export function inferType(value: unknown): string {
  if (typeof value === "number") {
    return Number.isInteger(value) ? "INTEGER" : "REAL";
  }
  if (typeof value === "boolean") return "INTEGER";
  return "TEXT";
}

export function seedDatabaseInstance(dbInstance: initSqlJs.Database): void {
  try {
    dbInstance.run("ROLLBACK;");
  } catch (err) {
    // Ignore error if no transaction was active
  }

  try {
    const res = dbInstance.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
    if (res.length > 0) {
      const tableNames = res[0].values.map(v => v[0]);
      for (const name of tableNames) {
        dbInstance.run(`DROP TABLE IF EXISTS [${name}]`);
      }
    }
  } catch (err) {
    // Ignore error if schema doesn't exist
  }

  function getForeignKeyDefinition(col: string, tableName: string, pk: string | undefined): string | null {
    const cLower = col.toLowerCase();
    if (!cLower.endsWith("_id")) return null;
    if (pk && cLower === pk.toLowerCase()) return null;

    if (cLower === "manager_id" && tableName === "employees") {
      return `FOREIGN KEY ([manager_id]) REFERENCES [employees]([employee_id])`;
    }

    const entity = cLower.substring(0, cLower.length - 3);
    let targetTable = "";
    if (entity === "category") targetTable = "categories";
    else if (entity === "coupon") targetTable = "coupons";
    else targetTable = entity + "s";

    const exists = seedTables.some(t => t.name === targetTable);
    if (exists) {
      const targetSchema = tableSchemas.find(s => s.name === targetTable);
      const targetPk = targetSchema?.primaryKey || `${entity}_id`;
      return `FOREIGN KEY ([${col}]) REFERENCES [${targetTable}]([${targetPk}])`;
    }
    return null;
  }

  for (const table of seedTables) {
    const schema = tableSchemas.find(s => s.name === table.name);
    const pk = schema?.primaryKey;

    const firstRow = table.rows[0] ?? {};
    const columnsDef = Object.keys(firstRow).map(c => {
      const baseType = inferType(firstRow[c]);
      if (pk && c.toLowerCase() === pk.toLowerCase()) {
        return `[${c}] ${baseType} PRIMARY KEY`;
      }
      return `[${c}] ${baseType}`;
    });

    const fkDefs: string[] = [];
    Object.keys(firstRow).forEach(c => {
      const fkDef = getForeignKeyDefinition(c, table.name, pk);
      if (fkDef) {
        fkDefs.push(fkDef);
      }
    });

    const allDefs = [...columnsDef, ...fkDefs].join(", ");
    dbInstance.run(`CREATE TABLE [${table.name}] (${allDefs})`);

    if (table.rows.length > 0) {
      const colNames = Object.keys(firstRow).map(c => `[${c}]`).join(", ");
      const placeholders = Object.keys(firstRow).map(() => "?").join(", ");
      const insertSql = `INSERT INTO [${table.name}] (${colNames}) VALUES (${placeholders})`;

      let stmt: initSqlJs.Statement | null = null;
      try {
        stmt = dbInstance.prepare(insertSql);
        for (const row of table.rows) {
          const values = Object.keys(firstRow).map(c => {
            const val = row[c];
            if (val === undefined) return null;
            if (typeof val === "boolean") return val ? 1 : 0;
            return val as string | number | null;
          });
          stmt.run(values as initSqlJs.SqlValue[]);
        }
      } finally {
        if (stmt) {
          stmt.free();
        }
      }
    }

    // Automatically create indexes on foreign key columns (columns ending with _id that are not PK)
    Object.keys(firstRow).forEach(c => {
      if (c.toLowerCase().endsWith("_id") && (!pk || c.toLowerCase() !== pk.toLowerCase())) {
        const indexName = `idx_${table.name}_${c}`;
        try {
          dbInstance.run(`CREATE INDEX IF NOT EXISTS [${indexName}] ON [${table.name}] ([${c}])`);
        } catch (err) {
          console.warn(`Failed to create index ${indexName}:`, err);
        }
      }
    });
  }

  try {
    dbInstance.run("VACUUM;");
  } catch (err) {
    // Ignore
  }
}
