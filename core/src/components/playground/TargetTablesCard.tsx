import { Database } from "lucide-react";

export function TargetTablesCard({
  relevantTables,
}: {
  relevantTables: { name: string; columns: any[] }[];
}) {
  if (!relevantTables || relevantTables.length === 0) return null;
  return (
    <div
      style={{
        background: "rgba(56, 217, 255, 0.04)",
        border: "1px solid rgba(56, 217, 255, 0.2)",
        borderRadius: "8px",
        padding: "10px 12px",
        margin: "12px 0",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "11px",
          fontWeight: 700,
          color: "var(--cyan)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: "6px",
        }}
      >
        <Database size={13} /> Target Table
        {relevantTables.length > 1 ? "s" : ""}:
      </div>
      {relevantTables.map((t) => (
        <div key={t.name} style={{ marginBottom: "6px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              fontWeight: "bold",
              color: "var(--text)",
            }}
          >
            Table:{" "}
            <code
              style={{
                background: "rgba(56, 217, 255, 0.15)",
                color: "var(--cyan)",
                padding: "1px 6px",
                borderRadius: "4px",
              }}
            >
              {t.name}
            </code>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "4px",
              marginTop: "4px",
            }}
          >
            {t.columns.map((col: any) => (
              <span
                key={col.name}
                style={{
                  fontSize: "10.5px",
                  fontFamily: "var(--font-mono, monospace)",
                  background: "var(--bg)",
                  color: "var(--text-muted)",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  border: "1px solid var(--border)",
                }}
              >
                {col.name}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
