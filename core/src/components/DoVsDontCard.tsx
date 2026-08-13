import React from "react";
import { CheckCircle2, AlertTriangle, Play, Copy, Check } from "lucide-react";

interface DoVsDontCardProps {
  dontCode: {
    sql: string;
    explanation: string;
  };
  doCode: {
    sql: string;
    explanation: string;
  };
  onRunCode?: (sql: string) => void;
}

export function DoVsDontCard({ dontCode, doCode, onRunCode }: DoVsDontCardProps) {
  const [copiedDont, setCopiedDont] = React.useState(false);
  const [copiedDo, setCopiedDo] = React.useState(false);

  const handleCopy = (text: string, isDo: boolean) => {
    navigator.clipboard.writeText(text);
    if (isDo) {
      setCopiedDo(true);
      setTimeout(() => setCopiedDo(false), 2000);
    } else {
      setCopiedDont(true);
      setTimeout(() => setCopiedDont(false), 2000);
    }
  };

  return (
    <div className="dovsdont-container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", margin: "16px 0" }}>
      {/* DON'T CARD */}
      <div className="dovsdont-card dont-card" style={{ background: "rgba(244, 63, 94, 0.05)", border: "1px solid rgba(244, 63, 94, 0.25)", borderRadius: "10px", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#f43f5e", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            <AlertTriangle size={15} />
            <span>Common Mistake</span>
          </div>
          {onRunCode && (
            <button
              onClick={() => onRunCode(dontCode.sql)}
              style={{ background: "rgba(244, 63, 94, 0.12)", border: "1px solid rgba(244, 63, 94, 0.3)", color: "#fecdd3", borderRadius: "6px", padding: "4px 8px", fontSize: "11px", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}
              title="Test this query in editor"
            >
              <Play size={12} />
              <span>Run in Editor</span>
            </button>
          )}
        </div>

        <pre style={{ margin: 0, padding: "10px 12px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(244, 63, 94, 0.2)", borderRadius: "6px", color: "#fecdd3", fontFamily: "var(--font-mono, monospace)", fontSize: "12.5px", lineHeight: "1.5", overflowX: "auto" }}>
          {dontCode.sql}
        </pre>

        <div style={{ fontSize: "12px", color: "var(--muted, #cbd5e1)", lineHeight: "1.4" }}>
          <strong style={{ color: "#f43f5e" }}>Why it fails: </strong>
          {dontCode.explanation}
        </div>
      </div>

      {/* DO CARD */}
      <div className="dovsdont-card do-card" style={{ background: "rgba(52, 211, 153, 0.05)", border: "1px solid rgba(52, 211, 153, 0.25)", borderRadius: "10px", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#34d399", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            <CheckCircle2 size={15} />
            <span>Correct Syntax</span>
          </div>
          {onRunCode && (
            <button
              onClick={() => onRunCode(doCode.sql)}
              style={{ background: "rgba(52, 211, 153, 0.12)", border: "1px solid rgba(52, 211, 153, 0.3)", color: "#a7f3d0", borderRadius: "6px", padding: "4px 8px", fontSize: "11px", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}
              title="Run correct query in editor"
            >
              <Play size={12} />
              <span>Run in Editor</span>
            </button>
          )}
        </div>

        <pre style={{ margin: 0, padding: "10px 12px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(52, 211, 153, 0.2)", borderRadius: "6px", color: "#a7f3d0", fontFamily: "var(--font-mono, monospace)", fontSize: "12.5px", lineHeight: "1.5", overflowX: "auto" }}>
          {doCode.sql}
        </pre>

        <div style={{ fontSize: "12px", color: "var(--muted, #cbd5e1)", lineHeight: "1.4" }}>
          <strong style={{ color: "#34d399" }}>Correct approach: </strong>
          {doCode.explanation}
        </div>
      </div>
    </div>
  );
}
