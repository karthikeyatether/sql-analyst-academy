import React, { useState } from "react";
import { ArrowDown, Filter, Table, Play, RotateCcw } from "lucide-react";

interface Row {
  id: number;
  customer: string;
  amount: number;
  status: string;
  passesFilter: boolean;
}

const SAMPLE_ROWS: Row[] = [
  { id: 101, customer: "Aarav", amount: 1500, status: "Completed", passesFilter: true },
  { id: 102, customer: "Diya", amount: 450, status: "Completed", passesFilter: false },
  { id: 103, customer: "Vivaan", amount: 2800, status: "Pending", passesFilter: false },
  { id: 104, customer: "Ananya", amount: 1200, status: "Completed", passesFilter: true },
];

export default function DataFlowVisualizer() {
  const [filterActive, setFilterActive] = useState(false);

  return (
    <div
      style={{
        background: "rgba(10, 15, 26, 0.8)",
        border: "1px solid rgba(56, 217, 255, 0.2)",
        borderRadius: "12px",
        padding: "20px",
        margin: "24px 0",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Table size={18} style={{ color: "var(--cyan)" }} />
          <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>
            Dual Coding Visual Schema: Interactive Row Filtering Engine
          </h4>
        </div>
        <button
          onClick={() => setFilterActive((p) => !p)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "5px 12px",
            borderRadius: "16px",
            background: filterActive ? "rgba(56, 217, 255, 0.2)" : "var(--cyan)",
            color: filterActive ? "var(--cyan)" : "#000",
            border: "none",
            fontSize: "11px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {filterActive ? <RotateCcw size={13} /> : <Play size={13} />}
          <span>{filterActive ? "Reset Input Table" : "Execute WHERE Filter"}</span>
        </button>
      </div>

      <p style={{ fontSize: "12px", color: "var(--muted)", margin: "0 0 16px 0" }}>
        Watch how <code>WHERE status = 'Completed' AND amount &gt; 1000</code> evaluates row-by-row:
      </p>

      {/* Input Table */}
      <div
        style={{
          background: "var(--bg2)",
          borderRadius: "8px",
          border: "1px solid var(--border)",
          overflow: "hidden",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            padding: "6px 12px",
            background: "rgba(255,255,255,0.03)",
            borderBottom: "1px solid var(--border)",
            fontSize: "11px",
            fontWeight: 700,
            color: "var(--muted)",
            textTransform: "uppercase",
          }}
        >
          Raw Input Table: <code>orders</code> (4 Rows)
        </div>
        <table style={{ width: "100%", fontSize: "12px", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(0,0,0,0.2)", textAlign: "left", color: "var(--muted)" }}>
              <th style={{ padding: "6px 12px" }}>order_id</th>
              <th style={{ padding: "6px 12px" }}>customer</th>
              <th style={{ padding: "6px 12px" }}>amount</th>
              <th style={{ padding: "6px 12px" }}>status</th>
              <th style={{ padding: "6px 12px" }}>Evaluation Verdict</th>
            </tr>
          </thead>
          <tbody>
            {SAMPLE_ROWS.map((row) => {
              const matches = row.passesFilter;
              return (
                <tr
                  key={row.id}
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.03)",
                    background: filterActive
                      ? matches
                        ? "rgba(52, 211, 153, 0.08)"
                        : "rgba(244, 63, 94, 0.06)"
                      : "transparent",
                    transition: "all 0.3s ease",
                  }}
                >
                  <td style={{ padding: "6px 12px", fontFamily: "monospace" }}>{row.id}</td>
                  <td style={{ padding: "6px 12px" }}>{row.customer}</td>
                  <td style={{ padding: "6px 12px", fontFamily: "monospace" }}>₹{row.amount}</td>
                  <td style={{ padding: "6px 12px" }}>{row.status}</td>
                  <td style={{ padding: "6px 12px", fontWeight: 700, fontSize: "11px" }}>
                    {!filterActive ? (
                      <span style={{ color: "var(--muted)" }}>Pending evaluation</span>
                    ) : matches ? (
                      <span style={{ color: "#34d399" }}>✅ PASS (Included)</span>
                    ) : (
                      <span style={{ color: "#f43f5e" }}>❌ DISCARDED</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Filter Arrow Divider */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "8px",
          margin: "12px 0",
          color: filterActive ? "var(--cyan)" : "var(--muted)",
        }}
      >
        <Filter size={16} />
        <span style={{ fontSize: "11px", fontWeight: 700 }}>
          WHERE status = 'Completed' AND amount &gt; 1000
        </span>
        <ArrowDown size={16} />
      </div>

      {/* Output Table */}
      {filterActive && (
        <div
          style={{
            background: "rgba(52, 211, 153, 0.04)",
            borderRadius: "8px",
            border: "1px solid rgba(52, 211, 153, 0.2)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "6px 12px",
              background: "rgba(52, 211, 153, 0.1)",
              borderBottom: "1px solid rgba(52, 211, 153, 0.2)",
              fontSize: "11px",
              fontWeight: 700,
              color: "#34d399",
              textTransform: "uppercase",
            }}
          >
            Filtered Output Result Table (2 Rows Let Through)
          </div>
          <table style={{ width: "100%", fontSize: "12px", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(0,0,0,0.2)", textAlign: "left", color: "var(--muted)" }}>
                <th style={{ padding: "6px 12px" }}>order_id</th>
                <th style={{ padding: "6px 12px" }}>customer</th>
                <th style={{ padding: "6px 12px" }}>amount</th>
                <th style={{ padding: "6px 12px" }}>status</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_ROWS.filter((r) => r.passesFilter).map((row) => (
                <tr key={row.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <td style={{ padding: "6px 12px", fontFamily: "monospace" }}>{row.id}</td>
                  <td style={{ padding: "6px 12px" }}>{row.customer}</td>
                  <td style={{ padding: "6px 12px", fontFamily: "monospace" }}>₹{row.amount}</td>
                  <td style={{ padding: "6px 12px" }}>{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
