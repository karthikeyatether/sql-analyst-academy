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
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1) // substitution
      );
    }
  }
  return tmp[a.length][b.length];
}

function findClosestTable(name: string): string | null {
  const tables = tableSchemas.map(t => t.name);
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
    new Set(tableSchemas.flatMap(t => t.columns.map(c => c.name)))
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
    const escaped = cleanToken.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const wordRegex = new RegExp('\\b' + escaped + '\\b', 'i');
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
    msgCode: number;
    level: number;
    getToken?: (m: RegExpMatchArray) => string;
    detailed: (m: RegExpMatchArray) => string;
    getSuggestion?: (m: RegExpMatchArray) => string | null;
  };

  const translations: TranslationDef[] = [
    {
      pattern: /misuse of window function/i,
      msgCode: 4108,
      level: 15,
            detailed: () => "Windowed functions (like ROW_NUMBER(), RANK(), OVER()) can only appear in the" +
                            "SELECT or ORDER BY clauses. They cannot be used in the WHERE, GROUP BY, or HAVING" +
                            "clauses."
    },
    {
      pattern: /(nested.*window|context of another windowed function|aggregate function.*nested|window.*nested)/i,
      msgCode: 4109,
      level: 15,
      detailed: () => "Windowed functions cannot be used in the context of another windowed function or aggregate."
    },
    {
      pattern: /misuse of aggregate/i,
      msgCode: 147,
      level: 15,
            detailed: () => "Aggregate functions (like SUM, COUNT, MAX) cannot appear in the WHERE clause." +
                            "Use the HAVING clause instead to filter on aggregated results."
    },
    {
      pattern: /no such column:\s*(['"]?[a-zA-Z0-9_\.]+['"]?)/i,
      msgCode: 207,
      level: 16,
      getToken: (m) => m[1],
            detailed: (m) => `Invalid column name '${m[1].replace(/['"]/g, "")}'. Please check your spelling` +
                             `or verify that the column exists in the referenced tables.`,
      getSuggestion: (m) => {
        const col = m[1].replace(/['"]/g, "");
        const match = findClosestColumn(col);
        return match ? `Did you mean column \`${match}\`?` : null;
      }
    },
    {
      pattern: /no such table:\s*(['"]?[a-zA-Z0-9_]+['"]?)/i,
      msgCode: 208,
      level: 16,
      getToken: (m) => m[1],
            detailed: (m) => `Invalid object name '${m[1].replace(/['"]/g, "")}'. The table or view does not` +
                             `exist in the database.`,
      getSuggestion: (m) => {
        const tbl = m[1].replace(/['"]/g, "");
        const match = findClosestTable(tbl);
        return match ? `Did you mean table \`${match}\`?` : null;
      }
    },
    {
      pattern: /ambiguous column name:\s*(['"]?[a-zA-Z0-9_]+['"]?)/i,
      msgCode: 209,
      level: 16,
      getToken: (m) => m[1],
            detailed: (m) => `Ambiguous column name '${m[1].replace(/['"]/g, "")}'. This column exists in` +
                             `multiple tables in your query. Prefix it with the table alias (e.g.,` +
                             `table_name.${m[1].replace(/['"]/g, "")}).`
    },
    {
      pattern: /near (['"]?.*?['"]?):\s*syntax error/i,
      msgCode: 102,
      level: 15,
      getToken: (m) => m[1],
            detailed: (m) => `Incorrect syntax near ${m[1]}. Please check for missing commas, unclosed` +
                             `parentheses, or misspelled keywords.`
    },
    {
      pattern: /returns ([0-9]+) columns - expected ([0-9]+)/i,
      msgCode: 116,
      level: 16,
            detailed: (m) => `Subqueries used as expressions must return exactly 1 column, but your subquery` +
                             `returns ${m[1]} columns.`
    },
    {
      pattern: /([0-9]+) values for ([0-9]+) columns/i,
      msgCode: 213,
      level: 16,
            detailed: (m) => `Insert Error: You supplied ${m[1]} values but the table/statement specifies` +
                             `${m[2]} columns. They must match exactly.`
    },
    {
      pattern: /division by zero/i,
      msgCode: 8134,
      level: 16,
            detailed: () => "Divide by zero error encountered. Consider using NULLIF(denominator, 0) to" +
                            "return NULL instead of failing."
    },
    {
      pattern: /row value misused/i,
      msgCode: 4145,
      level: 15,
            detailed: () => "An expression of non-boolean type specified in a context where a condition is" +
                            "expected. Ensure you are using operators like '=', '>', or 'IN' correctly."
    },
    {
      pattern: /(more than one row returned by a subquery|cardinality violation)/i,
      msgCode: 512,
      level: 16,
            detailed: () => "Subquery returned more than 1 value. This is not permitted when the subquery" +
                            "follows =, !=, <, <=, >, >= or when the subquery is used as an expression." +
                            "Consider using the IN operator instead of '=' to match multiple values, or add" +
                            "LIMIT 1 to the subquery."
    },
    {
      pattern: /UNIQUE constraint failed/i,
      msgCode: 2627,
      level: 14,
            detailed: () => "Violation of UNIQUE KEY constraint. Cannot insert duplicate key in object. The" +
                            "duplicate key value violates the unique index or primary key constraint."
    },
    {
      pattern: /FOREIGN KEY constraint failed/i,
      msgCode: 547,
      level: 16,
            detailed: () => "The INSERT or UPDATE statement conflicted with the FOREIGN KEY constraint. The" +
                            "query references a parent ID that does not exist in the parent table."
    },
    {
      pattern: /NOT NULL constraint failed:\s*(['"]?[a-zA-Z0-9_\.]+['"]?)/i,
      msgCode: 515,
      level: 16,
      getToken: (m) => m[1],
            detailed: (m) => `Cannot insert the value NULL into column '${m[1].replace(/['"]/g, "")}'. The` +
                             `column does not allow NULL values. Consider providing a default value or` +
                             `updating your query to insert a non-null value.`
    },
    {
      pattern: /ORDER BY term out of range - should be between 1 and (\d+)/i,
      msgCode: 108,
      level: 15,
            detailed: (m) => `The ORDER BY position number is out of range. The SELECT list only contains` +
                             `${m[1]} columns. Ensure your position index is between 1 and the number of` +
                             `selected columns.`
    },
    {
      pattern: /(use of non-aggregate column|aggregated query without GROUP BY)/i,
      msgCode: 8120,
      level: 16,
            detailed: () => "Column is invalid in the select list because it is not contained in either an" +
                            "aggregate function or the GROUP BY clause. When using aggregate functions like" +
                            "SUM, COUNT, or AVG, any non-aggregated column in the SELECT list must be included" +
                            "in the GROUP BY clause."
    },
    {
      pattern: new RegExp(
        "SELECTs to the left and right of (?:UNION|EXCEPT|INTERSECT) " +
        "do not have the same number of result columns",
        "i"
      ),
      msgCode: 205,
      level: 16,
            detailed: () => "All queries combined using a UNION, INTERSECT or EXCEPT operator must have an" +
                            "equal number of expressions in their target lists. The select statement on the" +
                            "left returns a different number of columns than the select statement on the" +
                            "right."
    },
    {
      pattern: /table (['"]?[a-zA-Z0-9_]+['"]?) already exists/i,
      msgCode: 2714,
      level: 16,
      getToken: (m) => m[1],
            detailed: (m) => `There is already an object named '${m[1].replace(/['"]/g, "")}' in the` +
                             `database. Choose a unique name or drop the existing table first using 'DROP` +
                             `TABLE IF EXISTS'.`
    },
    {
      pattern: /view (['"]?[a-zA-Z0-9_]+['"]?) already exists/i,
      msgCode: 2714,
      level: 16,
      getToken: (m) => m[1],
            detailed: (m) => `There is already a view named '${m[1].replace(/['"]/g, "")}' in the database.` +
                             `Choose a unique name or drop the existing view first using 'DROP VIEW IF` +
                             `EXISTS'.`
    },
    {
      pattern: /index (['"]?[a-zA-Z0-9_]+['"]?) already exists/i,
      msgCode: 1913,
      level: 16,
      getToken: (m) => m[1],
            detailed: (m) => `The index '${m[1].replace(/['"]/g, "")}' already exists on the table. Use a` +
                             `unique index name or drop the existing index first.`
    },
    {
      pattern: /table (['"]?[a-zA-Z0-9_]+['"]?) has more than one primary key/i,
      msgCode: 8106,
      level: 16,
      getToken: (m) => m[1],
            detailed: (m) => `Table '${m[1].replace(/['"]/g, "")}' has more than one primary key defined. A` +
                             `table can only have a single primary key constraint. If you need a composite` +
                             `primary key, define it at the table level: PRIMARY KEY (col1, col2).`
    },
    {
      pattern: /duplicate column name:\s*(['"]?[a-zA-Z0-9_]+['"]?)/i,
      msgCode: 2705,
      level: 16,
      getToken: (m) => m[1],
            detailed: (m) => `Column names in each table must be unique. The column name` +
                             `'${m[1].replace(/['"]/g, "")}' is specified more than once in the table` +
                             `definition.`
    },
    {
      pattern: /cannot modify (['"]?[a-zA-Z0-9_]+['"]?) because it is a view/i,
      msgCode: 4405,
      level: 16,
      getToken: (m) => m[1],
            detailed: (m) => `View '${m[1].replace(/['"]/g, "")}' is not updatable because modifications` +
                             `affect multiple tables or the view is read-only. Run your mutation commands` +
                             `(INSERT/UPDATE/DELETE) on the underlying tables instead.`
    },
    {
      pattern: /cannot start a transaction within a transaction/i,
      msgCode: 3902,
      level: 16,
            detailed: () => "Cannot start a transaction within an already active transaction. Commit or" +
                            "Rollback the current transaction before starting a new one."
    },
    {
      pattern: /cannot commit - no transaction active|cannot rollback - no transaction active/i,
      msgCode: 3903,
      level: 16,
            detailed: () => "The COMMIT or ROLLBACK TRANSACTION request has no corresponding BEGIN" +
                            "TRANSACTION. Ensure a transaction has been started with BEGIN before committing" +
                            "or rolling back."
    },
    {
      pattern: /temporary table name must be unqualified/i,
      msgCode: 156,
      level: 15,
            detailed: () => "Temporary table names cannot be qualified with a database/schema prefix (like" +
                            "database_name.table_name). Define the temporary table name directly (e.g." +
                            "temp_table_name)."
    }
  ];

  for (const t of translations) {
    const match = cleanRaw.match(t.pattern);
    if (match) {
      if (t.getToken) {
        lineNum = findLineNumber(t.getToken(match));
      } else {
        // Fallback: try to find keywords like OVER, SELECT, WHERE if we can't extract a specific token
        if (cleanRaw.includes("window")) lineNum = findLineNumber("OVER");
        else if (cleanRaw.includes("aggregate")) lineNum = findLineNumber("WHERE");
      }

      const detailedMsg = t.detailed(match);
      const sugg = t.getSuggestion ? t.getSuggestion(match) : null;
      const suggStr = sugg ? `\nSuggestion: ${sugg}` : "";
      return `Msg ${t.msgCode}, Level ${t.level}, State 1, Line ${lineNum}\n${detailedMsg}${suggStr}`;
    }
  }

  // Generic fallback if not matched
  return `Msg 50000, Level 16, State 1, Line 1\n` +
         `Database Error: ${cleanRaw}\n\n` +
         `Please review your SQL syntax and logic.`;
}
