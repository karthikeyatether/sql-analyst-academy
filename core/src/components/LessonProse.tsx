import React, { useState } from "react";
import SqlSyntaxTooltip from "./SqlSyntaxTooltip";
import { runQuery, QueryResult } from "../utils/sqlEngine";
import { Play, EyeOff, AlertCircle } from "lucide-react";

interface LessonProseProps {
  text: string;
  onRunCode?: (sql: string) => void;
}

function formatProseText(text: string): React.ReactNode {
  // Matches SQL clauses and keywords (case-insensitive)
  const regex = /\b(SELECT|FROM|WHERE|GROUP\s+BY|HAVING|ORDER\s+BY|LIMIT|LEFT\s+JOIN|INNER\s+JOIN|\bJOIN\b|WITH|CTE)\b/gi;
  const parts = text.split(regex);
  if (parts.length === 1) return text;

  return parts.map((part, i) => {
    if (part.toUpperCase().match(/^(SELECT|FROM|WHERE|GROUP\s+BY|HAVING|ORDER\s+BY|LIMIT|LEFT\s+JOIN|INNER\s+JOIN|JOIN|WITH|CTE)$/)) {
      return (
        <SqlSyntaxTooltip key={i} keyword={part}>
          <strong>{part.toUpperCase()}</strong>
        </SqlSyntaxTooltip>
      );
    }
    return part;
  });
}

function InlineSqlRunner({ codeText, onRunCode }: { codeText: string; onRunCode?: (sql: string) => void }) {
  const [result, setResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRunInline = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await runQuery(codeText);
      if (res.error) {
        setError(res.error);
        setResult(null);
      } else {
        setResult(res);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "An error occurred");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lp-code-wrapper" style={{ position: "relative", margin: "14px 0", border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", padding: "6px 12px", background: "var(--bg-tertiary, #151525)", borderBottom: "1px solid var(--border)" }}>
        {onRunCode && (
          <button
            onClick={() => onRunCode(codeText)}
            style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid var(--border)", color: "var(--text-secondary)", borderRadius: "4px", padding: "3px 8px", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}
            title="Copy snippet and run inside main editor sandbox"
          >
            Copy to Editor
          </button>
        )}
        <button
          onClick={handleRunInline}
          disabled={loading}
          style={{
            background: "rgba(56, 217, 255, 0.12)",
            border: "1px solid rgba(56, 217, 255, 0.3)",
            color: "var(--cyan)",
            borderRadius: "4px",
            padding: "3px 10px",
            fontSize: "11px",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}
        >
          <Play size={10} fill="var(--cyan)" />
          {loading ? "Running..." : "Run Inline"}
        </button>
        {result && (
          <button
            onClick={() => setResult(null)}
            style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", display: "flex", alignItems: "center", gap: "2px", fontSize: "11px" }}
          >
            <EyeOff size={11} /> Hide Output
          </button>
        )}
      </div>

      <pre className="lp-code" style={{ margin: 0, border: "none", borderRadius: 0 }}>
        {codeText}
      </pre>

      {/* Render error if any */}
      {error && (
        <div style={{ padding: "10px 12px", background: "rgba(239, 68, 68, 0.08)", borderTop: "1px solid rgba(239, 68, 68, 0.15)", display: "flex", gap: "8px", alignItems: "center", fontSize: "12px", color: "#fca5a5" }}>
          <AlertCircle size={14} style={{ color: "#ef4444", flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Render output table inline */}
      {result && result.columns && (
        <div style={{ maxHeight: "200px", overflow: "auto", borderTop: "1px solid var(--border)", background: "var(--panel)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
            <thead>
              <tr style={{ background: "rgba(255, 255, 255, 0.03)", borderBottom: "1px solid var(--border)" }}>
                {result.columns.map((col, i) => (
                  <th key={i} style={{ padding: "6px 10px", textAlign: "left", color: "var(--text-secondary)", fontWeight: 700 }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.rows.length > 0 ? (
                result.rows.slice(0, 10).map((row, ri) => (
                  <tr key={ri} style={{ borderBottom: ri < 9 ? "1px solid rgba(255,255,255,0.02)" : "none" }}>
                    {result.columns.map((col, ci) => (
                      <td key={ci} style={{ padding: "6px 10px", color: "var(--text)" }}>
                        {String(row[col] ?? "NULL")}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={result.columns.length} style={{ padding: "12px", textAlign: "center", color: "var(--text-tertiary)" }}>
                    No rows returned
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {result.rows.length > 10 && (
            <div style={{ padding: "6px 10px", fontSize: "10px", color: "var(--text-tertiary)", borderTop: "1px solid rgba(255,255,255,0.03)", textAlign: "right" }}>
              Showing first 10 rows (Total: {result.rows.length})
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function LessonProse({ text, onRunCode }: LessonProseProps) {
  const lines = text.split("\n");
  const elements: JSX.Element[] = [];
  let codeBuffer: string[] = [];
  let paraBuffer: string[] = [];

  function flushCode() {
    if (codeBuffer.length === 0) return;
    const codeText = codeBuffer.join("\n");
    elements.push(
      <InlineSqlRunner
        key={`code-shell-${elements.length}`}
        codeText={codeText}
        onRunCode={onRunCode}
      />
    );
    codeBuffer = [];
  }

  function flushPara() {
    if (paraBuffer.length === 0) return;
    const joined = paraBuffer.join(" ").trim();
    if (joined) {
      elements.push(<p key={`para-${elements.length}`}>{formatProseText(joined)}</p>);
    }
    paraBuffer = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();

    // blank line
    if (!trimmed) {
      flushCode();
      flushPara();
      continue;
    }

    // SQL code line
    if (SQL_KEYWORDS.test(trimmed) || trimmed.startsWith("`")) {
      flushPara();
      const isSuccess = /✓|\bcorrect\b/i.test(trimmed);
      const isError = /✗|\b(error|incorrect)\b/i.test(trimmed) || /\bX\s+error\b/i.test(trimmed);

      if (isSuccess || isError) {
        flushCode();
        elements.push(
          <pre
            key={`code-${elements.length}`}
            className={`lp-code ${isSuccess ? "lp-code-success" : "lp-code-error"}`}
          >
            {trimmed}
          </pre>,
        );
        continue;
      }
      codeBuffer.push(raw.trimStart());
      continue;
    }

    // flush code if we're no longer in a SQL block
    flushCode();

    // bullet line
    if (BULLET_PREFIXES.test(raw)) {
      flushPara();
      const content = trimmed.replace(BULLET_PREFIXES, "");
      const colonIdx = content.indexOf(":");
      if (colonIdx > 0 && colonIdx < 50) {
        const label = content.slice(0, colonIdx);
        const rest = content.slice(colonIdx + 1);
        elements.push(
          <div key={`b-${elements.length}`} className="lp-bullet">
            <span>
              <strong>{label}</strong>
              {formatProseText(rest)}
            </span>
          </div>,
        );
      } else {
        elements.push(
          <div key={`b-${elements.length}`} className="lp-bullet">
            {formatProseText(content)}
          </div>,
        );
      }
      continue;
    }

    // heading-like line
    if (HEADING_RE.test(trimmed) && trimmed.length < 80) {
      flushPara();
      elements.push(
        <div key={`h-${elements.length}`} className="lp-heading">
          {trimmed.replace(/:$/, "")}
        </div>,
      );
      continue;
    }

    // regular prose
    paraBuffer.push(trimmed);
  }

  flushCode();
  flushPara();

  return <div className="lesson-prose">{elements}</div>;
}

const SQL_KEYWORDS =
  /^\s*(SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING|JOIN|LEFT|INNER|WITH|INSERT|UPDATE|DELETE|CREATE|DROP|EXPLAIN|--)/i;
const BULLET_PREFIXES = /^\s*[-•✓✗→▸*]\s+/;
const HEADING_RE = /^[A-Z][A-Z0-9 _/:&-]{3,}:?\s*$|^[A-Z].{0,60}:$/;
