import { tableSchemas } from "../data/datasets";

function levenshtein(a: string, b: string): number {
  const tmp: number[][] = [];
  for (let i = 0; i <= a.length; i++) {
    tmp[i] = [i];
  }
  for (let j = 0; j <= b.length; j++) {
    tmp[0][j] = j;
  }
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1, // deletion
        tmp[i][j - 1] + 1, // insertion
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1), // substitution
      );
    }
  }
  return tmp[a.length][b.length];
}

function findClosestTable(name: string): string | null {
  const tables = tableSchemas.map((t) => t.name);
  let bestMatch: string | null = null;
  let bestDist = 3; // threshold
  for (const t of tables) {
    const d = levenshtein(name.toLowerCase(), t.toLowerCase());
    if (d < bestDist) {
      bestDist = d;
      bestMatch = t;
    }
  }
  return bestMatch;
}

function findClosestColumn(colName: string): string | null {
  const cleanCol = colName.includes(".") ? colName.split(".")[1] : colName;
  const allColumns = Array.from(
    new Set(tableSchemas.flatMap((t) => t.columns.map((c) => c.name))),
  );

  let bestMatch: string | null = null;
  let bestDist = 3;
  for (const c of allColumns) {
    const d = levenshtein(cleanCol.toLowerCase(), c.toLowerCase());
    if (d < bestDist) {
      bestDist = d;
      bestMatch = c;
    }
  }
  return bestMatch;
}

export function translateSqlError(rawError: string, sql?: string): string {
  // Strip Error: prefix if exists
  const cleanRaw = rawError.replace(/^Error:\s*/i, "").trim();
  let lineNum = 1;

  function findLineNumber(token: string): number {
    if (!sql || !token) return 1;
    const cleanToken = token.replace(/['"]/g, "").trim();
    if (!cleanToken) return 1;
    const lines = sql.split("\n");
    const escaped = cleanToken.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const wordRegex = new RegExp("\\b" + escaped + "\\b", "i");
    for (let i = 0; i < lines.length; i++) {
      if (wordRegex.test(lines[i])) {
        return i + 1;
      }
    }
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(cleanToken.toLowerCase())) {
        return i + 1;
      }
    }
    return 1;
  }

  type TranslationDef = {
    pattern: RegExp;
    msgCode: number; // MySQL error code
    sqlState: string; // MySQL SQLSTATE
    getToken?: (m: RegExpMatchArray) => string;
    detailed: (m: RegExpMatchArray) => string;
    getSuggestion?: (m: RegExpMatchArray) => string | null;
  };

  const translations: TranslationDef[] = [
    {
      pattern: /misuse of window function/i,
      msgCode: 3593,
      sqlState: "HY000",
      detailed: () =>
        "Windowed functions (like ROW_NUMBER(), RANK(), OVER()) can only appear in the " +
        "SELECT or ORDER BY clauses. They cannot be used in the WHERE, GROUP BY, or HAVING " +
        "clauses.",
    },
    {
      pattern:
        /(nested.*window|context of another windowed function|aggregate function.*nested|window.*nested)/i,
      msgCode: 3593,
      sqlState: "HY000",
      detailed: () =>
        "Windowed functions cannot be used in the context of another windowed function or aggregate.",
    },
    {
      pattern: /misuse of aggregate/i,
      msgCode: 1111,
      sqlState: "HY000",
      detailed: () =>
        "Aggregate functions (like SUM, COUNT, MAX) cannot appear in the WHERE clause. " +
        "Use the HAVING clause instead to filter on aggregated results.",
    },
    {
      pattern: /no such column:\s*(['"]?[a-zA-Z0-9_\.]+['"]?)/i,
      msgCode: 1054,
      sqlState: "42S22",
      getToken: (m) => m[1],
      detailed: (m) =>
        `Unknown column '${m[1].replace(/['"]/g, "")}' in 'field list'. Please check your spelling ` +
        `or verify that the column exists in the referenced tables.`,
      getSuggestion: (m) => {
        const col = m[1].replace(/['"]/g, "");
        const match = findClosestColumn(col);
        return match ? `Did you mean column \`${match}\`?` : null;
      },
    },
    {
      pattern: /no such table:\s*(['"]?[a-zA-Z0-9_]+['"]?)/i,
      msgCode: 1146,
      sqlState: "42S02",
      getToken: (m) => m[1],
      detailed: (m) =>
        `Table '${m[1].replace(/['"]/g, "")}' doesn't exist in the database.`,
      getSuggestion: (m) => {
        const tbl = m[1].replace(/['"]/g, "");
        const match = findClosestTable(tbl);
        return match ? `Did you mean table \`${match}\`?` : null;
      },
    },
    {
      pattern: /ambiguous column name:\s*(['"]?[a-zA-Z0-9_]+['"]?)/i,
      msgCode: 1052,
      sqlState: "23000",
      getToken: (m) => m[1],
      detailed: (m) =>
        `Column '${m[1].replace(/['"]/g, "")}' in field list is ambiguous. Prefix it with ` +
        `the table name or alias (e.g., table_name.${m[1].replace(/['"]/g, "")}).`,
    },
    {
      pattern: /near (['"]?.*?['"]?):\s*syntax error/i,
      msgCode: 1064,
      sqlState: "42000",
      getToken: (m) => m[1],
      detailed: (m) =>
        `You have an error in your SQL syntax; check for correct syntax near ${m[1]}. ` +
        `Verify commas, unclosed parentheses, or misspelled keywords.`,
    },
    {
      pattern: /returns ([0-9]+) columns - expected ([0-9]+)/i,
      msgCode: 1241,
      sqlState: "21000",
      detailed: (m) =>
        `Operand should contain 1 column(s), but the subquery returns ${m[1]} columns.`,
    },
    {
      pattern: /([0-9]+) values for ([0-9]+) columns/i,
      msgCode: 1136,
      sqlState: "21S01",
      detailed: (m) =>
        `Column count doesn't match value count. You supplied ${m[1]} values but the target specifies ` +
        `${m[2]} columns.`,
    },
    {
      pattern: /division by zero/i,
      msgCode: 1365,
      sqlState: "22012",
      detailed: () =>
        "Division by zero error. Consider using NULLIF(denominator, 0) to prevent evaluation crashes.",
    },
    {
      pattern: /row value misused/i,
      msgCode: 1064,
      sqlState: "42000",
      detailed: () =>
        "Incorrect use of row value. Ensure aggregate functions or subqueries are referenced correctly inside conditional operators.",
    },
    {
      pattern:
        /(more than one row returned by a subquery|cardinality violation)/i,
      msgCode: 1242,
      sqlState: "21000",
      detailed: () =>
        "Subquery returns more than 1 row. This is not permitted with comparative operators (e.g., =, !=, <, >). Use IN instead, or add LIMIT 1.",
    },
    {
      pattern: /UNIQUE constraint failed/i,
      msgCode: 1062,
      sqlState: "23000",
      detailed: () =>
        "Duplicate entry for key. The value violates a unique key or primary key constraint.",
    },
    {
      pattern: /FOREIGN KEY constraint failed/i,
      msgCode: 1452,
      sqlState: "23000",
      detailed: () =>
        "Cannot add or update child row: a foreign key constraint fails. The referenced parent ID does not exist.",
    },
    {
      pattern: /NOT NULL constraint failed:\s*(['"]?[a-zA-Z0-9_\.]+['"]?)/i,
      msgCode: 1048,
      sqlState: "23000",
      getToken: (m) => m[1],
      detailed: (m) =>
        `Column '${m[1].replace(/['"]/g, "")}' cannot be null. Please provide a valid non-null value.`,
    },
    {
      pattern: /ORDER BY term out of range - should be between 1 and (\d+)/i,
      msgCode: 1064,
      sqlState: "42000",
      detailed: (m) =>
        `Unknown column index in ORDER BY. The SELECT list only contains ${m[1]} columns.`,
    },
    {
      pattern:
        /(use of non-aggregate column|aggregated query without GROUP BY)/i,
      msgCode: 1055,
      sqlState: "42000",
      detailed: () =>
        "Expression in SELECT list is not in GROUP BY clause and contains nonaggregated column. Aggregate rules require selecting only grouped columns or columns inside aggregates.",
    },
    {
      pattern: new RegExp(
        "SELECTs to the left and right of (?:UNION|EXCEPT|INTERSECT) " +
          "do not have the same number of result columns",
        "i",
      ),
      msgCode: 1222,
      sqlState: "21000",
      detailed: () =>
        "The used SELECT statements have a different number of columns. Both sides of UNION must contain the same number of fields.",
    },
    {
      pattern: /table (['"]?[a-zA-Z0-9_]+['"]?) already exists/i,
      msgCode: 1050,
      sqlState: "42S01",
      getToken: (m) => m[1],
      detailed: (m) =>
        `Table '${m[1].replace(/['"]/g, "")}' already exists. Use 'DROP TABLE IF EXISTS' first.`,
    },
    {
      pattern: /view (['"]?[a-zA-Z0-9_]+['"]?) already exists/i,
      msgCode: 1050,
      sqlState: "42S01",
      getToken: (m) => m[1],
      detailed: (m) =>
        `View '${m[1].replace(/['"]/g, "")}' already exists. Use 'DROP VIEW IF EXISTS' first.`,
    },
    {
      pattern: /index (['"]?[a-zA-Z0-9_]+['"]?) already exists/i,
      msgCode: 1061,
      sqlState: "42000",
      getToken: (m) => m[1],
      detailed: (m) =>
        `Duplicate key name '${m[1].replace(/['"]/g, "")}'. An index with this name already exists.`,
    },
    {
      pattern: /table (['"]?[a-zA-Z0-9_]+['"]?) has more than one primary key/i,
      msgCode: 1075,
      sqlState: "42000",
      getToken: (m) => m[1],
      detailed: (m) =>
        `Multiple primary key defined for table '${m[1].replace(/['"]/g, "")}'.`,
    },
    {
      pattern: /duplicate column name:\s*(['"]?[a-zA-Z0-9_]+['"]?)/i,
      msgCode: 1060,
      sqlState: "42S21",
      getToken: (m) => m[1],
      detailed: (m) =>
        `Duplicate column name '${m[1].replace(/['"]/g, "")}' in table definition.`,
    },
    {
      pattern: /cannot modify (['"]?[a-zA-Z0-9_]+['"]?) because it is a view/i,
      msgCode: 1015,
      sqlState: "HY000",
      getToken: (m) => m[1],
      detailed: (m) =>
        `Cannot modify view '${m[1].replace(/['"]/g, "")}'. Read-only target.`,
    },
    {
      pattern: /cannot start a transaction within a transaction/i,
      msgCode: 1305,
      sqlState: "25000",
      detailed: () =>
        "Active transaction exists. Commit or Rollback the current transaction first.",
    },
    {
      pattern:
        /cannot commit - no transaction active|cannot rollback - no transaction active/i,
      msgCode: 1305,
      sqlState: "25000",
      detailed: () =>
        "No active transaction exists. Run BEGIN before committing or rolling back.",
    },
    {
      pattern: /temporary table name must be unqualified/i,
      msgCode: 1064,
      sqlState: "42000",
      detailed: () =>
        "Temporary table names cannot be qualified with schema names.",
    },
  ];

  for (const t of translations) {
    const match = cleanRaw.match(t.pattern);
    if (match) {
      if (t.getToken) {
        lineNum = findLineNumber(t.getToken(match));
      } else {
        if (cleanRaw.includes("window")) lineNum = findLineNumber("OVER");
        else if (cleanRaw.includes("aggregate"))
          lineNum = findLineNumber("WHERE");
      }

      const detailedMsg = t.detailed(match);
      const sugg = t.getSuggestion ? t.getSuggestion(match) : null;
      const suggStr = sugg ? `\nSuggestion: ${sugg}` : "";
      return `ERROR ${t.msgCode} (${t.sqlState}) at line ${lineNum}\n${detailedMsg}${suggStr}`;
    }
  }

  // Generic fallback if not matched
  return (
    `ERROR 1064 (42000) at line 1\n` +
    `Database Error: ${cleanRaw}\n\n` +
    `Please review your SQL syntax and logic.`
  );
}
