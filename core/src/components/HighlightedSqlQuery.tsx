import React from "react";

interface HighlightedSqlQueryProps {
  code: string;
  fontSize?: string;
  style?: React.CSSProperties;
}

/**
 * High-performance, lightweight SQL Syntax Highlighter.
 * Colorizes clauses (SELECT, FROM, WHERE, JOIN), aggregates, functions, strings, and numbers.
 */
export default function HighlightedSqlQuery({
  code,
  fontSize = "13.5px",
  style = {},
}: HighlightedSqlQueryProps) {
  if (!code) return null;

  // Clean redundant whitespace/empty lines
  const cleanCode = code
    .replace(/\r\n/g, "\n")
    .replace(/^\s*\n+/g, "")
    .replace(/\n\s*\n+/g, "\n")
    .trim();

  const lines = cleanCode.split("\n");

  const highlightLine = (line: string, lineIdx: number) => {
    // Regex tokenizer for SQL:
    // Group 1: Comments (-- comment)
    // Group 2: Strings ('string')
    // Group 3: Major Clause Keywords (SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT, JOIN, LEFT JOIN, INNER JOIN, WITH, ON)
    // Group 4: Secondary Keywords (AS, AND, OR, NOT, IN, BETWEEN, LIKE, IS NULL, IS NOT NULL, DISTINCT, CASE, WHEN, THEN, ELSE, END, ASC, DESC, UNION, ALL)
    // Group 5: Aggregate / Built-in Functions (COUNT, SUM, AVG, MIN, MAX, COALESCE, NULLIF, ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD, ROUND, CAST, UPPER, LOWER, TRIM, DATE, STRFTIME)
    // Group 6: Numbers (\b\d+\b)
    const tokenRegex = /(--.*$)|('(?:''|[^'])*')|(\b(?:SELECT|FROM|WHERE|GROUP\s+BY|HAVING|ORDER\s+BY|LIMIT|LEFT\s+JOIN|RIGHT\s+JOIN|FULL\s+JOIN|CROSS\s+JOIN|INNER\s+JOIN|JOIN|WITH|ON|INSERT\s+INTO|UPDATE|DELETE\s+FROM|CREATE\s+TABLE|ALTER\s+TABLE)\b)|(\b(?:AS|AND|OR|NOT|IN|BETWEEN|LIKE|IS\s+NULL|IS\s+NOT\s+NULL|DISTINCT|CASE|WHEN|THEN|ELSE|END|ASC|DESC|UNION|ALL|EXISTS|OVER|PARTITION\s+BY|SET|VALUES)\b)|(\b(?:COUNT|SUM|AVG|MIN|MAX|COALESCE|NULLIF|ROW_NUMBER|RANK|DENSE_RANK|LAG|LEAD|ROUND|CAST|UPPER|LOWER|TRIM|DATE|STRFTIME|SUBSTR|LENGTH|ABS|REPLACE|NOW)\b)|(\b\d+(?:\.\d+)?\b)/gi;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tokenRegex.exec(line)) !== null) {
      // Plain text before match
      if (match.index > lastIndex) {
        parts.push(line.substring(lastIndex, match.index));
      }

      const [
        fullMatch,
        comment,
        stringLiteral,
        majorClause,
        secondaryKeyword,
        func,
        numberLiteral,
      ] = match;

      if (comment) {
        parts.push(
          <span key={`${lineIdx}-${match.index}`} style={{ color: "#6e7681", fontStyle: "italic" }}>
            {comment}
          </span>
        );
      } else if (stringLiteral) {
        parts.push(
          <span key={`${lineIdx}-${match.index}`} style={{ color: "var(--emerald, #3fb950)", fontWeight: 500 }}>
            {stringLiteral}
          </span>
        );
      } else if (majorClause) {
        parts.push(
          <span
            key={`${lineIdx}-${match.index}`}
            style={{
              color: "var(--cyan, #38d9ff)",
              fontWeight: 800,
              letterSpacing: "0.02em",
            }}
          >
            {majorClause.toUpperCase()}
          </span>
        );
      } else if (secondaryKeyword) {
        parts.push(
          <span
            key={`${lineIdx}-${match.index}`}
            style={{
              color: "var(--violet, #bb86fc)",
              fontWeight: 700,
            }}
          >
            {secondaryKeyword.toUpperCase()}
          </span>
        );
      } else if (func) {
        parts.push(
          <span
            key={`${lineIdx}-${match.index}`}
            style={{
              color: "var(--amber, #f59e0b)",
              fontWeight: 700,
            }}
          >
            {func.toUpperCase()}
          </span>
        );
      } else if (numberLiteral) {
        parts.push(
          <span key={`${lineIdx}-${match.index}`} style={{ color: "#ff7b72", fontWeight: 600 }}>
            {numberLiteral}
          </span>
        );
      }

      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }

    return (
      <div key={lineIdx} style={{ minHeight: "1.4em", whiteSpace: "pre" }}>
        {parts.length > 0 ? parts : " "}
      </div>
    );
  };

  return (
    <pre
      style={{
        margin: 0,
        padding: "14px 18px",
        background: "transparent",
        fontFamily: "var(--font-mono, 'JetBrains Mono', Consolas, 'Courier New', monospace)",
        fontSize,
        lineHeight: "1.5",
        color: "var(--text, #e6edf3)",
        overflowX: "auto",
        ...style,
      }}
    >
      <code>{lines.map((l, idx) => highlightLine(l, idx))}</code>
    </pre>
  );
}
