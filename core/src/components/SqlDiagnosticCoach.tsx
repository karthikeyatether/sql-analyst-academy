import React, { useState, useMemo } from "react";
import {
  AlertTriangle,
  Lightbulb,
  Zap,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
} from "lucide-react";
import { lintSqlAntiPatterns } from "../utils/sqlAntiPatternLinter";

interface ResultRow {
  [col: string]: unknown;
}
interface QueryResult {
  columns: string[];
  rows: ResultRow[];
  message?: string;
  error?: string;
}

interface SqlDiagnosticCoachProps {
  queryResult: QueryResult | null;
  expectedResult: QueryResult | null;
  isCorrect: boolean | null;
  feedback: { isCorrect: boolean; message: string; details?: string } | null;
  query: string;
  onApplyFix?: (sql: string) => void;
}

const COMMON_PATTERNS: Array<{
  test: (q: string, err: string) => boolean;
  title: string;
  explanation: string;
  fix: (q: string) => string;
}> = [
  {
    test: (q, err) =>
      err.toLowerCase().includes("having") ||
      (q.toLowerCase().includes("where") &&
        /where\s+\w+\s*\([^)]+\)\s*(=|>|<|!=|>=|<=)/.test(q.toLowerCase())),
    title: "Aggregate in WHERE clause",
    explanation:
      "You're filtering aggregate functions (COUNT, SUM, AVG…) inside WHERE. SQL evaluates WHERE before grouping — use HAVING instead.",
    fix: (q) =>
      q.replace(
        /\bWHERE\b(\s+\w+\s*\([^)]+\)\s*(=|>|<|!=|>=|<=)\s*\d+)/gi,
        "HAVING$1",
      ),
  },
  {
    test: (_, err) =>
      err.toLowerCase().includes("no such column") ||
      err.toLowerCase().includes("no such table"),
    title: "Column or table not found",
    explanation:
      "SQL can't find the column or table name. Check for typos, missing table aliases, or using a SELECT alias in WHERE/GROUP BY.",
    fix: (q) => q,
  },
  {
    test: (_, err) => err.toLowerCase().includes("ambiguous"),
    title: "Ambiguous column reference",
    explanation:
      "Multiple joined tables share the same column name. Prefix with the table alias (e.g. o.customer_id vs c.customer_id).",
    fix: (q) => q,
  },
  {
    test: (q, _) =>
      q.toLowerCase().includes("group by") &&
      !q.toLowerCase().includes("having") &&
      /select\s+\w+\s*\([^)]+\)/.test(q.toLowerCase()),
    title: "Missing HAVING filter",
    explanation:
      "You're grouping but filtering aggregates in WHERE. Move the aggregate condition into a HAVING clause after GROUP BY.",
    fix: (q) =>
      q.trim().replace(/;?\s*$/, "") +
      "\nHAVING -- add your aggregate condition here;",
  },
  {
    test: (q, _) =>
      q.toLowerCase().includes("select *") && q.toLowerCase().includes("join"),
    title: "SELECT * with JOIN can cause duplicates",
    explanation:
      "Using SELECT * across JOINs returns all columns from both tables, including duplicate-looking ID columns. Explicitly select only the columns you need.",
    fix: (q) => q,
  },
];

function detectPattern(query: string, error: string) {
  return COMMON_PATTERNS.find((p) => p.test(query, error)) || null;
}

function DiffTable({
  yours,
  expected,
}: {
  yours: QueryResult;
  expected: QueryResult;
}) {
  const allCols = useMemo(() => {
    const s = new Set([...yours.columns, ...expected.columns]);
    return [...s];
  }, [yours.columns, expected.columns]);

  // Find missing rows (in expected but not in yours)
  const yourKeys = new Set(yours.rows.map((r) => JSON.stringify(r)));
  const expKeys = new Set(expected.rows.map((r) => JSON.stringify(r)));

  const missingRows = expected.rows.filter(
    (r) => !yourKeys.has(JSON.stringify(r)),
  );
  const extraRows = yours.rows.filter((r) => !expKeys.has(JSON.stringify(r)));

  if (missingRows.length === 0 && extraRows.length === 0) return null;

  return (
    <div style={{ marginTop: "12px" }}>
      <div
        style={{
          fontSize: "12px",
          fontWeight: 700,
          color: "var(--muted)",
          marginBottom: "6px",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        Row Diff
      </div>
      <div
        style={{
          overflowX: "auto",
          borderRadius: "8px",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "12px",
          }}
        >
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.04)" }}>
              <th
                style={{
                  padding: "6px 10px",
                  textAlign: "left",
                  color: "var(--muted)",
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                Status
              </th>
              {allCols.map((c) => (
                <th
                  key={c}
                  style={{
                    padding: "6px 10px",
                    textAlign: "left",
                    color: "var(--muted)",
                    fontSize: "10px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {missingRows.slice(0, 8).map((row, i) => (
              <tr
                key={`miss-${i}`}
                style={{
                  background: "rgba(239,68,68,0.08)",
                  borderBottom: "1px solid rgba(239,68,68,0.15)",
                }}
              >
                <td style={{ padding: "5px 10px" }}>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      color: "#ef4444",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    <XCircle size={11} /> missing
                  </span>
                </td>
                {allCols.map((c) => (
                  <td key={c} style={{ padding: "5px 10px", color: "#fca5a5" }}>
                    {String(row[c] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
            {extraRows.slice(0, 8).map((row, i) => (
              <tr
                key={`extra-${i}`}
                style={{
                  background: "rgba(251,146,60,0.08)",
                  borderBottom: "1px solid rgba(251,146,60,0.15)",
                }}
              >
                <td style={{ padding: "5px 10px" }}>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      color: "#fb923c",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    <AlertTriangle size={11} /> extra
                  </span>
                </td>
                {allCols.map((c) => (
                  <td key={c} style={{ padding: "5px 10px", color: "#fdba74" }}>
                    {String(row[c] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div
        style={{
          display: "flex",
          gap: "16px",
          marginTop: "6px",
          fontSize: "11px",
          color: "var(--muted)",
        }}
      >
        {missingRows.length > 0 && (
          <span style={{ color: "#ef4444" }}>
            ● {missingRows.length} missing row
            {missingRows.length > 1 ? "s" : ""}
          </span>
        )}
        {extraRows.length > 0 && (
          <span style={{ color: "#fb923c" }}>
            ● {extraRows.length} extra row{extraRows.length > 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
}

export default function SqlDiagnosticCoach({
  queryResult,
  expectedResult,
  isCorrect,
  feedback,
  query,
  onApplyFix,
}: SqlDiagnosticCoachProps) {
  const [expanded, setExpanded] = useState(true);

  const error = queryResult?.error || "";
  const pattern = useMemo(() => detectPattern(query, error), [query, error]);

  // Only show when there's something wrong
  if (isCorrect === true || (!feedback && !error && isCorrect === null))
    return null;
  if (!queryResult && !feedback) return null;

  const showDiff =
    !isCorrect &&
    expectedResult &&
    queryResult &&
    !error &&
    (queryResult.rows.length > 0 || expectedResult.rows.length > 0);

  const fixedSql = pattern ? pattern.fix(query) : null;
  const antiPatterns = lintSqlAntiPatterns(query);

  return (
    <div
      style={{
        marginTop: "12px",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid rgba(239,68,68,0.25)",
        background: "rgba(239,68,68,0.04)",
      }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 14px",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            background: "rgba(239,68,68,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <AlertTriangle size={14} style={{ color: "#ef4444" }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: "13px", color: "#ef4444" }}>
            {error ? "SQL Error Detected" : "Incorrect Result"}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "var(--muted)",
              marginTop: "1px",
            }}
          >
            {pattern
              ? pattern.title
              : feedback?.message || "Your query output doesn't match expected"}
          </div>
        </div>
        {expanded ? (
          <ChevronUp size={14} style={{ color: "var(--muted)" }} />
        ) : (
          <ChevronDown size={14} style={{ color: "var(--muted)" }} />
        )}
      </button>

      {expanded && (
        <div style={{ padding: "0 14px 14px" }}>
          {/* Error message */}
          {error && (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: "8px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                fontFamily: "monospace",
                fontSize: "12px",
                color: "#fca5a5",
                marginBottom: "12px",
              }}
            >
              {error}
            </div>
          )}

          {/* Anti-pattern and SARGability warnings */}
          {antiPatterns.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              {antiPatterns.map((ap) => (
                <div
                  key={ap.id}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    background: "rgba(244, 63, 94, 0.08)",
                    border: "1px solid rgba(244, 63, 94, 0.2)",
                    fontSize: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontWeight: 700,
                      color: "var(--rose)",
                      marginBottom: "4px",
                    }}
                  >
                    <ShieldAlert size={14} /> {ap.title}
                  </div>
                  <div
                    style={{
                      color: "var(--fg)",
                      marginBottom: "4px",
                      lineHeight: 1.5,
                    }}
                  >
                    {ap.message}
                  </div>
                  <div
                    style={{
                      color: "var(--cyan)",
                      fontSize: "11.5px",
                      fontFamily: "var(--font-mono, monospace)",
                    }}
                  >
                    💡 Fix: {ap.recommendation}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pattern-based explanation */}
          {pattern && (
            <div
              style={{
                padding: "12px",
                borderRadius: "10px",
                background: "rgba(251,191,36,0.06)",
                border: "1px solid rgba(251,191,36,0.2)",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "flex-start",
                }}
              >
                <Lightbulb
                  size={14}
                  style={{ color: "#fbbf24", flexShrink: 0, marginTop: "1px" }}
                />
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "12px",
                      color: "#fbbf24",
                      marginBottom: "4px",
                    }}
                  >
                    Why this happened
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--fg)",
                      lineHeight: 1.6,
                    }}
                  >
                    {pattern.explanation}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Feedback details */}
          {feedback?.details && (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                fontSize: "12px",
                color: "var(--muted)",
                lineHeight: 1.6,
                marginBottom: "12px",
              }}
            >
              {feedback.details}
            </div>
          )}

          {/* Apply Fix button */}
          {fixedSql && fixedSql !== query && onApplyFix && (
            <button
              onClick={() => onApplyFix(fixedSql)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                padding: "8px 14px",
                borderRadius: "8px",
                background: "rgba(34,211,238,0.12)",
                border: "1px solid rgba(34,211,238,0.25)",
                color: "#22d3ee",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                marginBottom: showDiff ? "12px" : 0,
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(34,211,238,0.2)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(34,211,238,0.12)")
              }
            >
              <Zap size={13} />
              Apply Suggested Fix
              <ArrowRight size={12} />
            </button>
          )}

          {/* Row Diff */}
          {showDiff && (
            <DiffTable yours={queryResult!} expected={expectedResult!} />
          )}
        </div>
      )}
    </div>
  );
}
