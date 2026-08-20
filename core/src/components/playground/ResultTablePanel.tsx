import React from "react";
import { Download, AlertCircle, CheckCircle2 } from "lucide-react";
import type { QueryResult } from "../../utils/sqlEngine";

interface ResultTablePanelProps {
  result: QueryResult | null;
  expectedResult?: QueryResult | null;
  onExportCsv?: () => void;
  onExportJson?: () => void;
}

export const ResultTablePanel: React.FC<ResultTablePanelProps> = ({
  result,
  expectedResult,
  onExportCsv,
  onExportJson,
}) => {
  if (!result) {
    return (
      <div
        style={{ padding: "24px", color: "var(--muted)", textAlign: "center" }}
      >
        Run your query to see results.
      </div>
    );
  }

  if (result.error) {
    return (
      <div
        className="error-output"
        style={{
          padding: "16px",
          color: "var(--red)",
          background: "rgba(239, 68, 68, 0.1)",
          borderRadius: "8px",
          margin: "12px",
          border: "1px solid var(--red)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: 700,
            marginBottom: "6px",
          }}
        >
          <AlertCircle size={16} /> Query Error
        </div>
        <pre
          style={{
            whiteSpace: "pre-wrap",
            fontFamily: "monospace",
            fontSize: "12px",
          }}
        >
          {result.error}
        </pre>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 14px",
          background: "var(--panel-header)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            color: "var(--cyan)",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <CheckCircle2 size={14} /> {result.message}{" "}
          {result.durationMs !== undefined && `(${result.durationMs}ms)`}
        </span>
        <div style={{ display: "flex", gap: "6px" }}>
          {onExportCsv && (
            <button
              onClick={onExportCsv}
              className="secondary-button"
              style={{ fontSize: "11px", padding: "3px 8px" }}
            >
              <Download size={12} /> CSV
            </button>
          )}
          {onExportJson && (
            <button
              onClick={onExportJson}
              className="secondary-button"
              style={{ fontSize: "11px", padding: "3px 8px" }}
            >
              <Download size={12} /> JSON
            </button>
          )}
        </div>
      </div>

      <div className="table-wrap" style={{ flex: 1, overflow: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "12px",
            textAlign: "left",
          }}
        >
          <thead>
            <tr
              style={{
                background: "var(--panel2)",
                borderBottom: "1px solid var(--border)",
                position: "sticky",
                top: 0,
                zIndex: 2,
              }}
            >
              {result.columns.map((c, idx) => (
                <th
                  key={idx}
                  style={{
                    padding: "8px 12px",
                    color: "var(--muted)",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row, rIdx) => (
              <tr
                key={rIdx}
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                {result.columns.map((c, cIdx) => (
                  <td
                    key={cIdx}
                    style={{
                      padding: "7px 12px",
                      color: "var(--text)",
                      fontFamily:
                        typeof row[c] === "number"
                          ? "var(--font-mono, monospace)"
                          : "inherit",
                    }}
                  >
                    {row[c] === null ? (
                      <span
                        style={{
                          color: "var(--faint)",
                          fontStyle: "italic",
                          fontSize: "11px",
                          opacity: 0.7,
                        }}
                      >
                        NULL
                      </span>
                    ) : (
                      String(row[c])
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
