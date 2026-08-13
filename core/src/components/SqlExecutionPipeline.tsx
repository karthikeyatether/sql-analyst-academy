import React, { useState } from "react";
import { ArrowRight, Layers, HelpCircle, CheckCircle2 } from "lucide-react";

interface PipelineStep {
  order: number;
  clause: string;
  name: string;
  description: string;
  example: string;
  dataEffect: string;
}

const PIPELINE_STEPS: PipelineStep[] = [
  {
    order: 1,
    clause: "FROM & JOIN",
    name: "Identify Data Source",
    description: "The database picks the target table(s) and joins matching rows together.",
    example: "FROM orders JOIN customers ON orders.customer_id = customers.id",
    dataEffect: "Loads raw universe of 1,000 candidate rows",
  },
  {
    order: 2,
    clause: "WHERE",
    name: "Filter Individual Rows",
    description: "Evaluates condition row-by-row before any grouping or aggregation happens.",
    example: "WHERE status = 'Completed' AND total_amount > 1000",
    dataEffect: "Filters 1,000 rows down to 250 qualifying rows",
  },
  {
    order: 3,
    clause: "GROUP BY",
    name: "Form Row Piles",
    description: "Collapses individual rows into bucketed groups based on matching column values.",
    example: "GROUP BY city, category",
    dataEffect: "Groups 250 rows into 12 summary buckets",
  },
  {
    order: 4,
    clause: "HAVING",
    name: "Filter Group Buckets",
    description: "Filters aggregated groups AFTER GROUP BY calculations are performed.",
    example: "HAVING COUNT(*) >= 5",
    dataEffect: "Filters 12 summary buckets down to 8 qualifying groups",
  },
  {
    order: 5,
    clause: "SELECT",
    name: "Choose Output Columns",
    description: "Computes expressions, aliases, and selects exact columns for output.",
    example: "SELECT city, SUM(total_amount) AS revenue",
    dataEffect: "Projects only specified 2 output columns",
  },
  {
    order: 6,
    clause: "ORDER BY",
    name: "Sort Final Rows",
    description: "Arranges output rows in ascending or descending sequence.",
    example: "ORDER BY revenue DESC",
    dataEffect: "Sorts 8 rows from highest revenue to lowest",
  },
  {
    order: 7,
    clause: "LIMIT",
    name: "Restrict Row Count",
    description: "Cuts off output at specified maximum row limit.",
    example: "LIMIT 5",
    dataEffect: "Returns top 5 rows to user screen",
  },
];

export default function SqlExecutionPipeline() {
  const [activeStep, setActiveStep] = useState<number>(1);
  const current = PIPELINE_STEPS.find((s) => s.order === activeStep) || PIPELINE_STEPS[0];

  return (
    <div
      style={{
        background: "rgba(16, 22, 34, 0.7)",
        border: "1px solid rgba(56, 217, 255, 0.2)",
        borderRadius: "12px",
        padding: "20px",
        margin: "24px 0",
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Layers size={18} style={{ color: "var(--cyan)" }} />
          <h4
            style={{
              margin: 0,
              fontSize: "14px",
              fontWeight: 700,
              color: "var(--text)",
              letterSpacing: "0.02em",
            }}
          >
            Scientific Mental Model: SQL Logical Execution Pipeline
          </h4>
        </div>
        <span
          style={{
            fontSize: "11px",
            color: "var(--cyan)",
            background: "rgba(56, 217, 255, 0.1)",
            padding: "3px 10px",
            borderRadius: "12px",
            fontWeight: 600,
          }}
        >
          Step {activeStep} of {PIPELINE_STEPS.length}
        </span>
      </div>

      <p style={{ fontSize: "12px", color: "var(--muted)", margin: "0 0 16px 0" }}>
        Unlike English which reads SELECT first, standard SQL databases process queries in this strict logical sequence:
      </p>

      {/* Pipeline Step Badges */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          paddingBottom: "8px",
          marginBottom: "16px",
        }}
      >
        {PIPELINE_STEPS.map((step) => {
          const isActive = step.order === activeStep;
          return (
            <button
              key={step.order}
              onClick={() => setActiveStep(step.order)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "20px",
                border: isActive
                  ? "1px solid var(--cyan)"
                  : "1px solid rgba(255,255,255,0.08)",
                background: isActive
                  ? "rgba(56, 217, 255, 0.15)"
                  : "rgba(255,255,255,0.02)",
                color: isActive ? "var(--cyan)" : "var(--muted)",
                fontSize: "11px",
                fontWeight: isActive ? 700 : 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease",
              }}
            >
              <span
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  background: isActive ? "var(--cyan)" : "rgba(255,255,255,0.1)",
                  color: isActive ? "#000" : "var(--text)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  fontWeight: 900,
                }}
              >
                {step.order}
              </span>
              <span>{step.clause}</span>
            </button>
          );
        })}
      </div>

      {/* Active Step Details Panel */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.025)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "8px",
          padding: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                fontSize: "14px",
                fontWeight: 800,
                color: "var(--cyan)",
                fontFamily: "var(--font-mono, monospace)",
              }}
            >
              {current.order}. {current.clause}
            </span>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>
              — {current.name}
            </span>
          </div>
          <span
            style={{
              fontSize: "11px",
              color: "var(--emerald)",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontWeight: 600,
            }}
          >
            <CheckCircle2 size={13} /> {current.dataEffect}
          </span>
        </div>

        <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "0 0 12px 0", lineHeight: 1.5 }}>
          {current.description}
        </p>

        <div
          style={{
            background: "rgba(0, 0, 0, 0.4)",
            borderLeft: "3px solid var(--cyan)",
            padding: "8px 12px",
            borderRadius: "0 6px 6px 0",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "12px",
            color: "var(--text)",
          }}
        >
          <code>{current.example}</code>
        </div>
      </div>
    </div>
  );
}
