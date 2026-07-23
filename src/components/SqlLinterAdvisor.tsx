import React from "react";
import { AlertTriangle, AlertCircle, Sparkles, CheckCircle } from "lucide-react";
import { LintError } from "../utils/sqlLinter";

interface LinterAdvisorProps {
  errors: LintError[];
  queryText: string;
  editorRef: React.MutableRefObject<any>;
  monacoRef: React.MutableRefObject<any>;
  onApplyFix: (fixedText: string) => void;
}

export default function SqlLinterAdvisor({ errors, queryText, editorRef, monacoRef, onApplyFix }: LinterAdvisorProps) {


  if (errors.length === 0) {
    return (
      <div className="linter-pass-card">
        <CheckCircle size={28} style={{ margin: "0 auto 8px auto", display: "block" }} />
        <strong style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>SQL Hygiene Check Passed</strong>
        <span style={{ fontSize: "10.5px", color: "var(--muted)" }}>No index-missing patterns, invalid aggregates, or bad quotes detected.</span>
      </div>
    );
  }

  return (
    <div className="linter-advisor-wrap">
      {errors.map((err, idx) => (
        <div
          key={idx}
          className={`linter-error-card ${err.severity === "error" ? "error" : "warning"}`}
        >
          <div className="linter-error-header">
            {err.severity === "error" ? (
              <AlertCircle size={14} style={{ color: "var(--rose)" }} />
            ) : (
              <AlertTriangle size={14} style={{ color: "var(--amber)" }} />
            )}
            <strong style={{ fontSize: "11.5px", color: err.severity === "error" ? "var(--rose)" : "var(--amber)" }}>
              {err.severity.toUpperCase()}: L{err.line}
            </strong>
            <span style={{ fontSize: "11px", fontWeight: "bold", color: "var(--text)" }}>{err.message}</span>
          </div>

          <p className="linter-error-desc">
            {err.suggestion}
          </p>

          {err.fixText && (
            <button
              onClick={() => {
                const lines = queryText.split("\n");
                if (err.line - 1 >= 0 && err.line - 1 < lines.length) {
                  const targetLine = lines[err.line - 1];
                  if (targetLine && err.column - 1 >= 0 && err.column - 1 <= targetLine.length) {
                    const fixedLine = 
                      targetLine.substring(0, err.column - 1) + 
                      err.fixText + 
                      targetLine.substring(err.column - 1 + err.length);
                    lines[err.line - 1] = fixedLine;
                    onApplyFix(lines.join("\n"));
                  }
                }
              }}
              className="primary-button outline compact"
              style={{ width: "max-content", fontSize: "9.5px", padding: "2px 8px", height: "auto", display: "inline-flex", gap: "4px", alignSelf: "flex-end" }}
            >
              <Sparkles size={10} /> {err.id === "double_quote_string" ? "Quick Fix: Convert Quotes" : "Quick Fix"}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
