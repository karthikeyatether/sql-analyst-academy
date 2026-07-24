export interface LintError {
  id: string;
  severity: "warning" | "error" | "info";
  message: string;
  line: number;
  column: number;
  length: number;
  fixText?: string;
  suggestion: string;
}

function maskStringLiterals(text: string): string {
  let result = "";
  let inSingleQuote = false;
  let inDoubleQuote = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      result += "'";
    } else if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      result += '"';
    } else {
      if (inSingleQuote || inDoubleQuote) {
        result += " ";
      } else {
        result += char;
      }
    }
  }
  return result;
}

function maskParentheses(text: string): string {
  let result = "";
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === "(") {
      depth++;
      result += "(";
    } else if (char === ")") {
      depth = Math.max(0, depth - 1);
      result += ")";
    } else {
      result += depth > 0 ? " " : char;
    }
  }
  return result;
}

function splitColumnsByOuterCommas(text: string): string[] {
  const result: string[] = [];
  let current = "";
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === "(") {
      depth++;
      current += char;
    } else if (char === ")") {
      depth = Math.max(0, depth - 1);
      current += char;
    } else if (char === "," && depth === 0) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  if (current.trim()) {
    result.push(current.trim());
  }
  return result;
}

function getNormalizedColumn(expr: string): string {
  let clean = expr.split(/\bAS\b/i)[0].trim();
  if (clean.includes(" ") && !clean.includes("(") && !clean.includes(")")) {
    const parts = clean.split(/\s+/);
    if (parts.length > 1) {
      const last = parts[parts.length - 1];
      if (/^[a-zA-Z0-9_]+$/.test(last)) {
        clean = parts.slice(0, -1).join(" ").trim();
      }
    }
  }
  return clean.toLowerCase();
}

export function lintSqlQuery(sql: string): LintError[] {
  const errors: LintError[] = [];
  if (!sql.trim()) return errors;

  const maskedStringSql = maskStringLiterals(sql);
  const maskedSql = maskParentheses(maskedStringSql);

  // Rule 1: Catch SELECT * in query
  const selectAllRegex = /\bSELECT\s+(\*)(?=\s|,|$)/gi;
  let match;
  while ((match = selectAllRegex.exec(maskedStringSql)) !== null) {
    const offset = match.index;
    const { line, col } = getLineAndColFromOffset(sql, offset + match[0].indexOf("*"));
    errors.push({
      id: "select_all",
      severity: "warning",
      message: "Avoid using SELECT * in production or analytical queries.",
      line,
      column: col,
      length: 1,
            suggestion: "Explicitly name the columns you require. This improves execution performance and" +
                        "makes the query robust to schema modifications.",
    });
  }

  // Rule 2: Aggregate function in WHERE clause
  const aggWhereRegex = /\bWHERE\s+(?:(?!\bSELECT\b)[\s\S])*?\b(COUNT|SUM|AVG|MIN|MAX)\s*\(/gi;
  while ((match = aggWhereRegex.exec(maskedStringSql)) !== null) {
    const offset = match.index;
    const { line, col } = getLineAndColFromOffset(sql, offset);
    errors.push({
      id: "aggregate_where",
      severity: "error",
      message: `Aggregate function ${match[1]}() is not allowed in WHERE.`,
      line,
      column: col,
      length: match[0].length,
            suggestion: "Filter raw rows in WHERE. To filter grouped aggregates, place the condition inside a" +
                        "HAVING clause after GROUP BY.",
    });
  }

  // Rule 3: Text string double quote verification
  const doubleQuoteStringRegex = /\b(WHERE|JOIN|AND|OR)\s+[a-zA-Z0-9_.]+\s*=\s*("[^"\n]*")/gi;
  while ((match = doubleQuoteStringRegex.exec(maskedStringSql)) !== null) {
    const valString = match[2];
    const offset = match.index + match[0].indexOf(valString);
    const { line, col } = getLineAndColFromOffset(sql, offset);
    errors.push({
      id: "double_quote_string",
      severity: "info",
      message: "Double quotes used for string literal values.",
      line,
      column: col,
      length: valString.length,
      fixText: valString.replace(/"/g, "'"),
            suggestion: "In SQL, single quotes denote text literals (e.g. 'Mumbai'). Double quotes are" +
                        "reserved for column/table identifiers with spaces or special characters.",
    });
  }

  // Rule 4: Leading wildcard in LIKE (Performance issue)
  const leadingWildcardRegex = /\bLIKE\s+(['"]%[^'"]+['"])/gi;
  while ((match = leadingWildcardRegex.exec(maskedStringSql)) !== null) {
    const literal = match[1];
    const offset = match.index;
    const { line, col } = getLineAndColFromOffset(sql, offset);
    errors.push({
      id: "leading_wildcard",
      severity: "warning",
      message: "Leading wildcard in LIKE clause disables index structures.",
      line,
      column: col,
      length: match[0].length,
            suggestion: "Beginning a search term with '%' (e.g. '%Mumbai') forces a full table scan. If" +
                        "possible, use trailing wildcards ('Mumbai%') or full-text indexing.",
    });
  }

  // Rule 5: GROUP BY missing non-aggregate columns
  const hasAgg = /\b(COUNT|SUM|AVG|MIN|MAX)\b\(/i.test(maskedStringSql);
  const hasGroupBy = /\bGROUP\s+BY\b/i.test(maskedStringSql);

  if (hasAgg && !hasGroupBy) {
    // If standard fields and aggregates are mixed in SELECT without GROUP BY
    const selectFields = maskedStringSql.match(/\bSELECT\s+([\s\S]*?)\bFROM\b/i);
    if (selectFields) {
      const fields = splitColumnsByOuterCommas(selectFields[1]);
      const hasNonAgg = fields.some(f => {
        const trimmedField = f.trim();
        return !/(COUNT|SUM|AVG|MIN|MAX)\(/i.test(trimmedField) && 
               trimmedField !== "*" && 
               !/^(NULL|\d+(\.\d+)?|'[^']*'|"[^"]*")$/i.test(trimmedField);
      });
      if (hasNonAgg) {
        errors.push({
          id: "missing_group_by",
          severity: "error",
          message: "Mixed scalar and aggregate columns in SELECT with no GROUP BY clause.",
          line: 1,
          column: 1,
          length: 6,
                    suggestion: "Add a GROUP BY clause specifying all columns in the SELECT that are not" +
                                "wrapped in aggregate functions.",
        });
      }
    }
  }

  // Rule 11: SELECT columns not in GROUP BY clause when GROUP BY is present
  if (hasGroupBy) {
    const selectMatch = maskedStringSql.match(/\bSELECT\s+([\s\S]*?)\bFROM\b/i);
    const groupByMatch = maskedStringSql.match(/\bGROUP\s+BY\s+([\s\S]*?)(?:\bHAVING\b|\bORDER\s+BY\b|\bLIMIT\b|$)/i);
    if (selectMatch && groupByMatch) {
      const selectFields = splitColumnsByOuterCommas(selectMatch[1]);
      const groupByFields = splitColumnsByOuterCommas(groupByMatch[1]).map(f => getNormalizedColumn(f));

      // Bypass if using positional grouping (e.g. GROUP BY 1, 2)
      const hasPositionalGroupBy = groupByFields.some(f => /^\d+$/.test(f));

      if (!hasPositionalGroupBy) {
        selectFields.forEach(field => {
          const trimmed = field.trim();
          const isAggregate = /(COUNT|SUM|AVG|MIN|MAX)\b\(/i.test(maskStringLiterals(trimmed));
          if (isAggregate) return;

          if (/^(NULL|\d+|'[^']*'|"[^"]*")$/i.test(trimmed)) return;

          const normSelect = getNormalizedColumn(trimmed);
          if (!normSelect) return;

          const selectBase = normSelect.includes(".") ? normSelect.split(".")[1] : normSelect;
          const isGrouped = groupByFields.some(g => {
            const gBase = g.includes(".") ? g.split(".")[1] : g;
            return g === normSelect || gBase === selectBase;
          });

          if (!isGrouped) {
            const offset = maskedStringSql.indexOf(trimmed);
            const { line, col } = getLineAndColFromOffset(sql, offset !== -1 ? offset : 0);
            errors.push({
              id: "unaggregated_column_missing_group_by",
              severity: "error",
              message: `Column '${trimmed}' must appear in the GROUP BY clause or be used in an aggregate function.`,
              line,
              column: col,
              length: trimmed.length,
                        suggestion: "In standard SQL, any non-aggregated column in the SELECT list must be" +
                                    "included in the GROUP BY clause. Add this column to your GROUP BY list or" +
                                    "wrap it in an aggregate function (like MAX or MIN) if appropriate."
            });
          }
        });
      }
    }
  }

  // Rule 6: HAVING clause without GROUP BY
  const hasHaving = /\bHAVING\b/i.test(maskedStringSql);
  if (hasHaving && !hasGroupBy) {
    const matchHaving = maskedStringSql.match(/\bHAVING\b/i);
    const offset = matchHaving ? matchHaving.index || 0 : 0;
    const { line, col } = getLineAndColFromOffset(sql, offset);
    errors.push({
      id: "having_without_group_by",
      severity: "error",
      message: "HAVING clause used without a GROUP BY clause.",
      line,
      column: col,
      length: 6,
            suggestion: "A HAVING clause filters aggregated groups. It requires a GROUP BY clause to define" +
                        "those groups. If you want to filter raw rows, use WHERE instead."
    });
  }

  // Rule 7: Non-aggregate condition in HAVING
  const havingRegex = /\bHAVING\s+([\s\S]*?)(?:\bGROUP\s+BY\b|\bORDER\s+BY\b|\bLIMIT\b|$)/i;
  const havingMatch = maskedSql.match(havingRegex);
  if (havingMatch) {
    const havingClause = havingMatch[1];
    const havingIndex = havingMatch.index || 0;
    const conditions = havingClause.split(/\b(?:AND|OR)\b/i);
    for (const cond of conditions) {
      const trimmedCond = cond.trim();
      if (trimmedCond && !/(COUNT|SUM|AVG|MIN|MAX)\b/i.test(trimmedCond)) {
        const offset = sql.indexOf(trimmedCond, havingIndex);
        if (offset !== -1) {
          const { line, col } = getLineAndColFromOffset(sql, offset);
          errors.push({
            id: "non_aggregate_having",
            severity: "warning",
            message: "Non-aggregate condition placed in HAVING instead of WHERE.",
            line,
            column: col,
            length: trimmedCond.length,
                        suggestion: "Filtering non-aggregate columns in HAVING runs after the database" +
                                    "performs grouping. Move this filter to the WHERE clause to discard rows" +
                                    "early, which dramatically speeds up the query."
          });
        }
      }
    }
  }

  // Rule 8: NOT IN used with subquery
  const notInSubqueryRegex = /\bNOT\s+IN\s*\(\s*SELECT\b/gi;
  while ((match = notInSubqueryRegex.exec(maskedStringSql)) !== null) {
    const offset = match.index;
    const { line, col } = getLineAndColFromOffset(sql, offset);
    errors.push({
      id: "not_in_nullable_subquery",
      severity: "warning",
      message: "NOT IN used with a subquery — risk of NULL trap.",
      line,
      column: col,
      length: match[0].length,
            suggestion: "If the subquery returns even a single NULL, NOT IN will evaluate to UNKNOWN and" +
                        "return zero rows. Consider using NOT EXISTS or ensuring the subquery filters out" +
                        "NULLs (e.g., WHERE col IS NOT NULL)."
    });
  }

  // Rule 9: Comma Join (implicit join) syntax
  const implicitJoinRegex = /\bFROM\s+[a-zA-Z0-9_]+(?:\s+(?:AS\s+)?[a-zA-Z0-9_]+)?\s*,\s*[a-zA-Z0-9_]+/gi;
  while ((match = implicitJoinRegex.exec(maskedSql)) !== null) {
    const offset = match.index;
    const { line, col } = getLineAndColFromOffset(sql, offset);
    errors.push({
      id: "implicit_join_comma",
      severity: "warning",
      message: "Implicit join syntax (comma-separated tables) used.",
      line,
      column: col,
      length: match[0].length,
            suggestion: "Use explicit JOIN syntax (e.g. INNER JOIN ... ON ...) instead of comma joins." +
                        "Explicit joins are easier to read, prevent accidental Cartesian products, and make" +
                        "join conditions clear."
    });
  }

  // Rule 10: JOIN without ON/USING
  const joinRegex = new RegExp(
    "\\bJOIN\\s+([a-zA-Z0-9_]+)(?:\\s+AS\\s+)?\\s*" +
    "(?!ON\\b|USING\\b)([a-zA-Z0-9_]+)?\\s*([\\s\\S]*?)" +
    "(?=\\bJOIN\\b|\\bWHERE\\b|\\bGROUP\\b|\\bORDER\\b|\\bLIMIT\\b|$)",
    "gi"
  );
  while ((match = joinRegex.exec(maskedSql)) !== null) {
    const clauseBody = match[3];
    if (!/\bON\b|\bUSING\b/i.test(clauseBody)) {
      const offset = match.index;
      const { line, col } = getLineAndColFromOffset(sql, offset);
      errors.push({
        id: "missing_join_on",
        severity: "error",
        message: `JOIN clause for '${match[1]}' is missing an ON join condition.`,
        line,
        column: col,
        length: Math.max(1, match[0].length - clauseBody.length),
                suggestion: "Specify an ON clause (e.g., JOIN orders ON customers.id = orders.customer_id) to" +
                            "define how the tables relate. Otherwise, the database cannot resolve the join."
      });
    }
  }

  // Rule 11: UPDATE/DELETE without WHERE clause (Unbounded Mutation Warning)
  const mutationNoWhereRegex = /\b(UPDATE\s+[a-zA-Z0-9_]+|DELETE\s+FROM\s+[a-zA-Z0-9_]+)\s*(?![\s\S]*?\bWHERE\b)[\s\S]*?$/gi;
  while ((match = mutationNoWhereRegex.exec(maskedSql)) !== null) {
    if (!/\bWHERE\b/i.test(maskedSql)) {
      const offset = match.index;
      const { line, col } = getLineAndColFromOffset(sql, offset);
      errors.push({
        id: "unbounded_mutation_no_where",
        severity: "warning",
        message: "UPDATE or DELETE statement without a WHERE clause will affect ALL rows in the table.",
        line,
        column: col,
        length: match[1].length,
        suggestion: "Add a WHERE clause (e.g., WHERE id = 10) to target specific rows and avoid accidentally modifying or deleting the entire dataset."
      });
    }
  }

  // Rule 12: Deeply Nested Subquery Complexity (Recommend CTE)
  const nestedSubqueryRegex = /\(\s*SELECT[\s\S]*?\(\s*SELECT[\s\S]*?\(\s*SELECT/gi;
  while ((match = nestedSubqueryRegex.exec(maskedSql)) !== null) {
    const offset = match.index;
    const { line, col } = getLineAndColFromOffset(sql, offset);
    errors.push({
      id: "deeply_nested_subquery_use_cte",
      severity: "info",
      message: "Deeply nested subqueries detected (3+ levels deep).",
      line,
      column: col,
      length: match[0].length,
      suggestion: "Refactor deeply nested subqueries into Common Table Expressions (CTEs using WITH) to improve query readability and modularity."
    });
  }

  return errors;
}

function getLineAndColFromOffset(text: string, offset: number) {
  const prefix = text.substring(0, offset);
  const lines = prefix.split("\n");
  return {
    line: lines.length,
    col: lines[lines.length - 1].length + 1,
  };
}
