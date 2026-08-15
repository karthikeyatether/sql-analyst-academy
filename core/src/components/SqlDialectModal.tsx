import React, { useState, useMemo } from "react";
import { X, Copy, Check, Globe, Code2, Sparkles } from "lucide-react";
import {
  translateSqlDialect,
  SqlDialect,
} from "../utils/sqlDialectTranslator";

interface SqlDialectModalProps {
  isOpen: boolean;
  onClose: () => void;
  sqlQuery: string;
}

export const SqlDialectModal: React.FC<SqlDialectModalProps> = ({
  isOpen,
  onClose,
  sqlQuery,
}) => {
  const [selectedDialect, setSelectedDialect] = useState<SqlDialect>("postgresql");
  const [copied, setCopied] = useState(false);

  const translations = useMemo(() => {
    return translateSqlDialect(sqlQuery);
  }, [sqlQuery]);

  const activeTranslation = translations[selectedDialect];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeTranslation.translatedSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      className="custom-modal-overlay"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.78)",
        backdropFilter: "blur(6px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        className="custom-modal-window"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "840px",
          background: "var(--bg)",
          borderRadius: "12px",
          border: "1px solid var(--border)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
            background: "var(--panel2)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Globe size={18} style={{ color: "var(--cyan)" }} />
            <div>
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  color: "var(--text)",
                  margin: 0,
                }}
              >
                Multi-Dialect Translation Lens
              </h3>
              <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                Translate queries to enterprise Cloud DWH and relational engines
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="icon-button"
            style={{ padding: "4px" }}
            aria-label="Close Dialect Modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Dialect Tabs */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            padding: "12px 20px",
            background: "var(--bg2)",
            borderBottom: "1px solid var(--border)",
            overflowX: "auto",
          }}
        >
          {(
            [
              "postgresql",
              "snowflake",
              "bigquery",
              "mysql",
            ] as SqlDialect[]
          ).map((dialectKey) => {
            const d = translations[dialectKey];
            const isSelected = selectedDialect === dialectKey;
            return (
              <button
                key={dialectKey}
                onClick={() => setSelectedDialect(dialectKey)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  background: isSelected
                    ? "var(--cyan)"
                    : "var(--panel)",
                  color: isSelected ? "#000" : "var(--text)",
                  border: isSelected
                    ? "1px solid var(--cyan)"
                    : "1px solid var(--border)",
                  transition: "all 0.15s ease",
                }}
              >
                {d.displayName}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Translated SQL Code Box */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  letterSpacing: "0.04em",
                }}
              >
                Translated {activeTranslation.displayName} Query
              </span>
              <button
                onClick={handleCopy}
                className="secondary-button compact"
                style={{
                  fontSize: "11px",
                  padding: "3px 8px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "Copied!" : "Copy SQL"}
              </button>
            </div>

            <pre
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "16px",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "12.5px",
                color: "var(--cyan)",
                lineHeight: 1.6,
                margin: 0,
                maxHeight: "260px",
                overflowY: "auto",
                whiteSpace: "pre-wrap",
              }}
            >
              {activeTranslation.translatedSql || "-- Write a query to translate"}
            </pre>
          </div>

          {/* Engine Differences & Best Practices */}
          <div
            style={{
              padding: "14px",
              borderRadius: "8px",
              background: "var(--panel2)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--text)",
                marginBottom: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Dialect Notes & Optimizations
            </div>
            <ul
              style={{
                margin: 0,
                paddingLeft: "18px",
                fontSize: "12px",
                color: "var(--text-secondary)",
                lineHeight: 1.6,
              }}
            >
              {activeTranslation.notes.map((n, idx) => (
                <li key={idx}>{n}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SqlDialectModal;
