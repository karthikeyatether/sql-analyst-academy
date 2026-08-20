import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  ChevronRight,
  Database,
  Filter,
  Layers,
  Eye,
  ArrowDownUp,
  Scissors,
  RotateCcw,
} from "lucide-react";

interface Row {
  [col: string]: unknown;
}
interface QueryResult {
  columns: string[];
  rows: Row[];
}

interface Step {
  id: string;
  clause: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  getRows: (input: Row[]) => Row[];
  label: (rows: Row[], prev: Row[]) => string;
}

function buildSteps(result: QueryResult | null): Step[] {
  const total = result?.rows.length ?? 0;
  const cols = result?.columns ?? [];

  // Simulate a plausible pipeline based on result shape
  const sourceCount = Math.max(total * 4, 20);
  const whereCount = Math.max(total * 2, Math.ceil(sourceCount * 0.6));
  const groupCount = cols.some((c) => /count|sum|avg|max|min/i.test(c))
    ? Math.max(Math.ceil(total * 1.5), 5)
    : whereCount;
  const havingCount =
    groupCount > total ? Math.max(total + 2, total) : groupCount;

  return [
    {
      id: "from",
      clause: "FROM / JOIN",
      icon: <Database size={14} />,
      color: "#22d3ee",
      description:
        "Load all candidate rows from the source table(s). JOINs produce the cross product first.",
      getRows: () =>
        Array.from({ length: sourceCount }, (_, i) => ({
          "#": i + 1,
          status: i % 3 === 0 ? "✓" : "…",
        })),
      label: (r) => `${r.length} candidate rows loaded`,
    },
    {
      id: "where",
      clause: "WHERE",
      icon: <Filter size={14} />,
      color: "#4ade80",
      description:
        "Filter individual rows using the WHERE condition. Rows that fail are discarded.",
      getRows: (prev) => prev.slice(0, whereCount),
      label: (r, prev) =>
        `${prev.length - r.length} rows filtered out → ${r.length} remain`,
    },
    {
      id: "groupby",
      clause: "GROUP BY",
      icon: <Layers size={14} />,
      color: "#818cf8",
      description:
        "Collapse rows into groups. Each unique value (or combination) becomes one output bucket.",
      getRows: (prev) => prev.slice(0, groupCount),
      label: (r) =>
        `Collapsed into ${r.length} group${r.length !== 1 ? "s" : ""}`,
    },
    {
      id: "having",
      clause: "HAVING",
      icon: <Filter size={14} />,
      color: "#f472b6",
      description:
        "Filter groups using HAVING — applied after GROUP BY, so aggregate functions are allowed here.",
      getRows: (prev) => prev.slice(0, havingCount),
      label: (r, prev) =>
        `${prev.length - r.length} group${prev.length - r.length !== 1 ? "s" : ""} filtered → ${r.length} remain`,
    },
    {
      id: "select",
      clause: "SELECT",
      icon: <Eye size={14} />,
      color: "#fb923c",
      description:
        "Project only the requested columns. Aliases are assigned here.",
      getRows: (prev) => prev.slice(0, total),
      label: (r) =>
        `${cols.length} column${cols.length !== 1 ? "s" : ""} projected, ${r.length} rows`,
    },
    {
      id: "orderby",
      clause: "ORDER BY",
      icon: <ArrowDownUp size={14} />,
      color: "#facc15",
      description:
        "Sort the output rows. Happens near the end — aliases from SELECT are now available.",
      getRows: (prev) => [...prev].sort(() => 0),
      label: (r) => `${r.length} rows sorted`,
    },
    {
      id: "limit",
      clause: "LIMIT / OFFSET",
      icon: <Scissors size={14} />,
      color: "#94a3b8",
      description:
        "Return only the first N rows. OFFSET skips rows before applying the limit.",
      getRows: (prev) => prev.slice(0, total),
      label: (r) => `Final output: ${r.length} row${r.length !== 1 ? "s" : ""}`,
    },
  ];
}

interface QueryExecutionStudioProps {
  queryResult: QueryResult | null;
  query: string;
}

export default function QueryExecutionStudio({
  queryResult,
  query,
}: QueryExecutionStudioProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const steps = buildSteps(queryResult);

  // Build accumulated rows per step
  const stepRows: Row[][] = [];
  let prev: Row[] = [];
  for (const s of steps) {
    const cur = s.getRows(prev);
    stepRows.push(cur);
    prev = cur;
  }

  const play = () => {
    setActiveStep(0);
    setPlaying(true);
  };

  useEffect(() => {
    if (!playing) return;
    if (activeStep >= steps.length - 1) {
      setPlaying(false);
      return;
    }
    timerRef.current = setTimeout(() => setActiveStep((s) => s + 1), 900);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [playing, activeStep, steps.length]);

  useEffect(() => {
    setActiveStep(0);
    setPlaying(false);
  }, [query]);

  const cur = steps[activeStep];
  const curRows = stepRows[activeStep];
  const prevRows = activeStep > 0 ? stepRows[activeStep - 1] : curRows;

  if (!visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 14px",
          borderRadius: "9px",
          margin: "14px 0",
          background: "rgba(129,140,248,0.08)",
          border: "1px solid rgba(129,140,248,0.2)",
          color: "#818cf8",
          fontSize: "12px",
          fontWeight: 700,
          cursor: "pointer",
          transition: "all 0.15s ease",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "rgba(129,140,248,0.16)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = "rgba(129,140,248,0.08)")
        }
      >
        <Play size={13} fill="#818cf8" />
        Show Query Execution Walkthrough
      </button>
    );
  }

  return (
    <div
      style={{
        margin: "14px 0",
        borderRadius: "14px",
        overflow: "hidden",
        border: "1px solid rgba(129,140,248,0.2)",
        background: "rgba(129,140,248,0.04)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "12px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(129,140,248,0.06)",
        }}
      >
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            background: "rgba(129,140,248,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Play size={13} fill="#818cf8" style={{ color: "#818cf8" }} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: "13px", color: "#818cf8" }}>
            Query Execution Walkthrough
          </div>
          <div style={{ fontSize: "11px", color: "var(--muted)" }}>
            Step through how SQL processes your query
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
          <button
            onClick={play}
            disabled={playing}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "5px 12px",
              borderRadius: "7px",
              background: playing
                ? "rgba(255,255,255,0.05)"
                : "rgba(129,140,248,0.15)",
              border: "1px solid rgba(129,140,248,0.25)",
              color: playing ? "var(--muted)" : "#818cf8",
              fontSize: "11px",
              fontWeight: 700,
              cursor: playing ? "not-allowed" : "pointer",
            }}
          >
            <Play size={11} fill={playing ? "var(--muted)" : "#818cf8"} />
            {playing ? "Playing…" : "Auto-Play"}
          </button>
          <button
            onClick={() => {
              setActiveStep(0);
              setPlaying(false);
              setVisible(false);
            }}
            style={{
              padding: "5px 10px",
              borderRadius: "7px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "var(--muted)",
              fontSize: "11px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <RotateCcw size={11} /> Reset
          </button>
        </div>
      </div>

      {/* Step stepper */}
      <div
        style={{
          display: "flex",
          padding: "12px 16px 0",
          gap: "0",
          overflowX: "auto",
        }}
      >
        {steps.map((s, i) => (
          <React.Fragment key={s.id}>
            <button
              onClick={() => {
                setPlaying(false);
                setActiveStep(i);
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "5px",
                padding: "6px 10px",
                borderRadius: "10px",
                border: "none",
                background: i === activeStep ? `${s.color}18` : "transparent",
                cursor: "pointer",
                flexShrink: 0,
                transition: "all 0.2s ease",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background:
                    i <= activeStep ? `${s.color}22` : "rgba(255,255,255,0.05)",
                  border:
                    i === activeStep
                      ? `2px solid ${s.color}`
                      : "2px solid rgba(255,255,255,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: i <= activeStep ? s.color : "var(--muted)",
                  transition: "all 0.3s ease",
                  boxShadow:
                    i === activeStep ? `0 0 14px ${s.color}44` : "none",
                }}
              >
                {s.icon}
              </div>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.3px",
                  color:
                    i === activeStep
                      ? s.color
                      : i < activeStep
                        ? "var(--fg)"
                        : "var(--muted)",
                  whiteSpace: "nowrap",
                }}
              >
                {s.clause}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div
                style={{
                  alignSelf: "center",
                  marginBottom: "16px",
                  flexShrink: 0,
                }}
              >
                <ChevronRight
                  size={14}
                  style={{
                    color:
                      i < activeStep
                        ? steps[i + 1].color
                        : "rgba(255,255,255,0.15)",
                    transition: "color 0.3s ease",
                  }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Active step detail */}
      <div style={{ padding: "14px 16px" }}>
        <div
          style={{
            padding: "14px",
            borderRadius: "10px",
            background: `${cur.color}08`,
            border: `1px solid ${cur.color}25`,
            transition: "all 0.25s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <span style={{ color: cur.color }}>{cur.icon}</span>
            <span
              style={{ fontWeight: 800, fontSize: "14px", color: cur.color }}
            >
              {cur.clause}
            </span>
            <span
              style={{
                marginLeft: "auto",
                padding: "3px 8px",
                borderRadius: "6px",
                background: `${cur.color}18`,
                color: cur.color,
                fontSize: "11px",
                fontWeight: 700,
              }}
            >
              {cur.label(curRows, prevRows)}
            </span>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              color: "var(--fg)",
              lineHeight: 1.65,
              opacity: 0.85,
            }}
          >
            {cur.description}
          </p>
        </div>

        {/* Row count visualizer */}
        <div
          style={{
            marginTop: "10px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            style={{ fontSize: "11px", color: "var(--muted)", flexShrink: 0 }}
          >
            Row flow:
          </span>
          <div
            style={{
              flex: 1,
              height: "8px",
              borderRadius: "4px",
              background: "rgba(255,255,255,0.06)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.min(100, (curRows.length / Math.max(stepRows[0].length, 1)) * 100)}%`,
                background: `linear-gradient(90deg, ${cur.color}, ${cur.color}88)`,
                borderRadius: "4px",
                transition: "width 0.6s cubic-bezier(0.34,1.56,0.64,1)",
              }}
            />
          </div>
          <span
            style={{
              fontSize: "11px",
              color: cur.color,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {curRows.length} rows
          </span>
        </div>
      </div>
    </div>
  );
}
