import React, { useState } from "react";

interface TooltipDefinition {
  title: string;
  description: string;
  order?: string;
  tip?: string;
}

const DICTIONARY: Record<string, TooltipDefinition> = {
  select: {
    title: "SELECT clause",
    description: "Specifies which columns or computed fields the query should return.",
    order: "Evaluated 5th (after WHERE/GROUP BY/HAVING, before ORDER BY/LIMIT)",
    tip: "Tip: Keep SELECT specific. Avoid 'SELECT *' in production code to save bandwidth."
  },
  from: {
    title: "FROM / JOIN clause",
    description: "Identifies the source tables and matches tables using JOIN criteria.",
    order: "Evaluated 1st",
    tip: "Tip: Ensure correct JOIN keys are used to avoid unwanted Cartesian products."
  },
  where: {
    title: "WHERE clause",
    description: "Filters individual rows based on a boolean condition before grouping.",
    order: "Evaluated 2nd",
    tip: "Important: You cannot use aggregate functions (like SUM or COUNT) directly in WHERE."
  },
  "group by": {
    title: "GROUP BY clause",
    description: "Groups rows that have the same values into summary rows.",
    order: "Evaluated 3rd",
    tip: "Tip: All non-aggregated columns in SELECT must be listed in GROUP BY."
  },
  having: {
    title: "HAVING clause",
    description: "Filters grouped rows and aggregates. Evaluated after GROUP BY.",
    order: "Evaluated 4th",
    tip: "Tip: Use HAVING for filtering aggregates (like HAVING COUNT(*) > 5)."
  },
  "order by": {
    title: "ORDER BY clause",
    description: "Sorts the final result set by one or more columns (ASC or DESC).",
    order: "Evaluated 6th",
    tip: "Tip: Can reference aliases defined in the SELECT clause."
  },
  limit: {
    title: "LIMIT clause",
    description: "Restricts the maximum number of rows returned in the final output.",
    order: "Evaluated 7th (Last)",
    tip: "Tip: Pair with ORDER BY to get deterministic results (e.g. top 5 highest earners)."
  },
  join: {
    title: "JOIN clause",
    description: "Combines records from multiple tables based on matching values.",
    order: "Evaluated as part of FROM",
    tip: "Tip: By default, JOIN performs an INNER JOIN."
  },
  "left join": {
    title: "LEFT JOIN",
    description: "Returns all rows from the left table, and matching rows from the right table.",
    order: "Evaluated as part of FROM",
    tip: "Note: Missing matches in the right table result in NULL values."
  },
  "inner join": {
    title: "INNER JOIN",
    description: "Returns only the rows where there is a match in both tables.",
    order: "Evaluated as part of FROM",
    tip: "Note: Rows with no corresponding match in either table are completely excluded."
  },
  cte: {
    title: "Common Table Expression (WITH)",
    description: "Defines a temporary named result set to simplify complex queries.",
    order: "Evaluated before main SELECT",
    tip: "Tip: Excellent for replacing nested subqueries and improving readability."
  },
  with: {
    title: "WITH clause (CTE)",
    description: "Defines a temporary named result set to simplify complex queries.",
    order: "Evaluated before main SELECT",
    tip: "Tip: Excellent for replacing nested subqueries and improving readability."
  }
};

interface SqlSyntaxTooltipProps {
  keyword: string;
  children: React.ReactNode;
}

export default function SqlSyntaxTooltip({ keyword, children }: SqlSyntaxTooltipProps) {
  const [visible, setVisible] = useState(false);
  const def = DICTIONARY[keyword.toLowerCase().trim()];

  if (!def) return <>{children}</>;

  return (
    <span
      className="sql-tooltip-trigger"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      style={{
        position: "relative",
        textDecoration: "underline dotted var(--cyan)",
        cursor: "help",
        display: "inline-block"
      }}
    >
      {children}
      {visible && (
        <span
          className="sql-tooltip-popover"
          style={{
            position: "absolute",
            bottom: "125%",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--surface, #1e1e2e)",
            border: "1px solid rgba(56, 217, 255, 0.3)",
            borderRadius: "8px",
            padding: "10px 12px",
            width: "250px",
            boxShadow: "0 10px 20px rgba(0,0,0,0.5)",
            zIndex: 9999,
            display: "block",
            fontSize: "12px",
            color: "var(--text, #e2e8f0)",
            lineHeight: "1.4",
            pointerEvents: "none",
            textAlign: "left"
          }}
        >
          <strong style={{ display: "block", color: "var(--cyan, #38bdf8)", fontSize: "13px", marginBottom: "4px" }}>
            {def.title}
          </strong>
          <span style={{ display: "block", marginBottom: "6px", opacity: 0.9 }}>
            {def.description}
          </span>
          {def.order && (
            <span style={{ display: "block", color: "var(--violet, #c084fc)", fontSize: "11px", marginBottom: "4px", fontWeight: "600" }}>
              {def.order}
            </span>
          )}
          {def.tip && (
            <span style={{ display: "block", color: "var(--amber, #fbbf24)", fontSize: "10.5px", fontStyle: "italic", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "4px" }}>
              {def.tip}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
