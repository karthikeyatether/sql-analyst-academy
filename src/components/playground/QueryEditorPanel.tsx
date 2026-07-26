import React from "react";
import Editor from "@monaco-editor/react";
import { Play, Copy, RotateCcw, Sparkles } from "lucide-react";
import type { BeforeMount, OnMount } from "@monaco-editor/react";

interface QueryEditorPanelProps {
  query: string;
  onChange: (val: string) => void;
  onRun: () => void;
  onReset: () => void;
  onFormat: () => void;
  isExecuting: boolean;
  monacoBeforeMount: BeforeMount;
  monacoOnMount: OnMount;
}

export const QueryEditorPanel: React.FC<QueryEditorPanelProps> = ({
  query,
  onChange,
  onRun,
  onReset,
  onFormat,
  isExecuting,
  monacoBeforeMount,
  monacoOnMount,
}) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(query);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
      }}
    >
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
          style={{ fontSize: "12px", fontWeight: 700, color: "var(--cyan)" }}
        >
          SQL EDITOR (Monaco)
        </span>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={onFormat}
            className="secondary-button"
            style={{ fontSize: "11px", padding: "4px 8px" }}
            title="Format SQL Query"
          >
            <Sparkles size={13} /> Format
          </button>
          <button
            onClick={handleCopy}
            className="secondary-button"
            style={{ fontSize: "11px", padding: "4px 8px" }}
            title="Copy SQL to Clipboard"
          >
            <Copy size={13} /> Copy
          </button>
          <button
            onClick={onReset}
            className="secondary-button"
            style={{ fontSize: "11px", padding: "4px 8px" }}
            title="Reset Starter Query"
          >
            <RotateCcw size={13} /> Reset
          </button>
          <button
            onClick={onRun}
            disabled={isExecuting}
            className="primary-button run-btn"
            style={{ fontSize: "12px", padding: "4px 14px" }}
          >
            <Play size={14} /> {isExecuting ? "Executing..." : "Run (F5)"}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
        <Editor
          height="100%"
          defaultLanguage="sql"
          theme="sql-dark-oled"
          value={query}
          onChange={(v) => onChange(v || "")}
          beforeMount={monacoBeforeMount}
          onMount={monacoOnMount}
          loading={
            <div
              style={{
                padding: "16px",
                color: "var(--cyan)",
                fontFamily: "monospace",
                fontSize: "13px",
              }}
            >
              Initializing SQL Code Editor...
            </div>
          }
          options={{
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            minimap: { enabled: false },
            automaticLayout: true,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            padding: { top: 10, bottom: 10 },
          }}
        />
      </div>
    </div>
  );
};
