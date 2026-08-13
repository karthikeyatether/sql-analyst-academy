import React, { useState, useMemo } from "react";
import { X, FileText, AlertCircle } from "lucide-react";
import { parseCsv, buildCsvImportSql } from "../utils/csvParser";
import { runQuery, getLiveSchema } from "../utils/sqlEngine";

interface CsvImportModalProps {
  fileName: string;
  csvText: string;
  onClose: () => void;
  onSuccess: (tableName: string) => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  fileName,
  csvText,
  onClose,
  onSuccess,
}) => {
  const parsedRows = useMemo(() => {
    try {
      return parseCsv(csvText);
    } catch {
      return [];
    }
  }, [csvText]);

  const rawHeaders = parsedRows[0] || [];
  const dataRows = parsedRows.slice(1);
  const previewRows = dataRows.slice(0, 8);

  const [columnTypes, setColumnTypes] = useState<Record<string, string>>(() => {
    if (parsedRows.length === 0) return {};
    const { headers, columnTypes: inferredTypes } = buildCsvImportSql(
      fileName,
      csvText,
    );
    const initial: Record<string, string> = {};
    headers.forEach((h, idx) => {
      initial[h] = inferredTypes[idx] || "TEXT";
    });
    return initial;
  });

  const [importing, setImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleTypeChange = (header: string, newType: string) => {
    setColumnTypes((prev) => ({ ...prev, [header]: newType }));
  };

  const handleConfirmImport = async () => {
    setImporting(true);
    setErrorMsg(null);
    try {
      const { tableName, sql } = buildCsvImportSql(fileName, csvText, {
        customColumnTypes: columnTypes,
      });

      const res = await runQuery(sql);
      if (res.error) {
        throw new Error(res.error);
      }

      await getLiveSchema();
      onSuccess(tableName);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(
        (err as Error).message || "Failed to import CSV into database.",
      );
    } finally {
      setImporting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        className="surface-panel"
        style={{
          width: "720px",
          maxWidth: "92vw",
          maxHeight: "85vh",
          padding: "24px",
          borderRadius: "12px",
          border: "1px solid var(--cyan)",
          background: "var(--panel)",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FileText size={20} style={{ color: "var(--cyan)" }} />
            <strong style={{ fontSize: "17px", color: "var(--text)" }}>
              CSV Pre-Import Preview & Schema Mapping
            </strong>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--muted)",
              cursor: "pointer",
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
            fontSize: "13px",
            color: "var(--muted)",
            flexWrap: "wrap",
          }}
        >
          <span>
            <strong>File:</strong> {fileName}
          </span>
          <span>
            <strong>Total Rows:</strong> {dataRows.length}
          </span>
          <span>
            <strong>Columns:</strong> {rawHeaders.length}
          </span>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(239,68,68,0.15)",
              border: "1px solid var(--red)",
              borderRadius: "6px",
              color: "var(--red)",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        {/* INTERACTIVE COLUMN MAPPING LIST */}
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "12px",
            background: "rgba(0,0,0,0.2)",
          }}
        >
          <strong
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Detected Columns & Type Override:
          </strong>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: "10px",
            }}
          >
            {Object.keys(columnTypes).map((h) => (
              <div
                key={h}
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                <span
                  style={{
                    fontSize: "11.5px",
                    fontWeight: 700,
                    color: "var(--cyan)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {h}
                </span>
                <select
                  value={columnTypes[h]}
                  onChange={(e) => handleTypeChange(h, e.target.value)}
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                >
                  <option value="INTEGER">INTEGER</option>
                  <option value="REAL">REAL</option>
                  <option value="TEXT">TEXT</option>
                  <option value="DATETIME">DATETIME (TEXT)</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* PREVIEW GRID */}
        <div
          style={{
            overflowX: "auto",
            border: "1px solid var(--border)",
            borderRadius: "8px",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "12px",
              textAlign: "left",
            }}
          >
            <thead>
              <tr style={{ background: "var(--border)" }}>
                {rawHeaders.map((h, i) => (
                  <th
                    key={i}
                    style={{
                      padding: "8px 12px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  {rawHeaders.map((_, cIdx) => (
                    <td
                      key={cIdx}
                      style={{ padding: "6px 12px", color: "var(--text)" }}
                    >
                      {row[cIdx] || (
                        <span
                          style={{ color: "var(--muted)", fontStyle: "italic" }}
                        >
                          NULL
                        </span>
                      )}
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
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "8px",
          }}
        >
          <button
            className="primary-button outline"
            onClick={onClose}
            disabled={importing}
          >
            Cancel
          </button>
          <button
            className="primary-button"
            onClick={handleConfirmImport}
            disabled={importing}
          >
            {importing
              ? "Importing Data..."
              : "Confirm & Import to SQL Sandbox"}
          </button>
        </div>
      </div>
    </div>
  );
};
