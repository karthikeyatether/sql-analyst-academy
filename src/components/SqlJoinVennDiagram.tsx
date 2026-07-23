import React, { useState, useMemo } from "react";
import { Info, Check, X } from "lucide-react";

export type JoinType = "INNER" | "LEFT" | "RIGHT" | "FULL" | "LEFT_ANTI" | "RIGHT_ANTI";

interface MockRow {
  [key: string]: string | number | null;
}

interface MockTable {
  name: string;
  keyCol: string;
  columns: string[];
  rows: MockRow[];
}

const MOCK_DATASETS: Record<string, MockTable> = {
  customers: {
    name: "customers",
    keyCol: "customer_id",
    columns: ["customer_id", "name", "city"],
    rows: [
      { customer_id: 1, name: "Aarav Mehta", city: "Mumbai" },
      { customer_id: 2, name: "Ananya Rao", city: "Bengaluru" },
      { customer_id: 3, name: "Kabir Singh", city: "Delhi" },
    ],
  },
  orders: {
    name: "orders",
    keyCol: "customer_id",
    columns: ["order_id", "customer_id", "amount"],
    rows: [
      { order_id: 101, customer_id: 1, amount: 5799 },
      { order_id: 102, customer_id: 2, amount: 2199 },
      { order_id: 103, customer_id: 4, amount: 8499 },
    ],
  },
  employees: {
    name: "employees",
    keyCol: "dept_id",
    columns: ["emp_id", "name", "dept_id"],
    rows: [
      { emp_id: 501, name: "Sara Khan", dept_id: 10 },
      { emp_id: 502, name: "Vivaan Iyer", dept_id: 20 },
      { emp_id: 503, name: "Riya Patel", dept_id: 30 },
    ],
  },
  departments: {
    name: "departments",
    keyCol: "dept_id",
    columns: ["dept_id", "dept_name", "budget"],
    rows: [
      { dept_id: 10, dept_name: "Engineering", budget: 85 },
      { dept_id: 20, dept_name: "Marketing", budget: 40 },
      { dept_id: 99, dept_name: "Unassigned", budget: 15 },
    ],
  },
};

export default function SqlJoinVennDiagram() {
  const [leftTableKey, setLeftTableKey] = useState<string>("customers");
  const [rightTableKey, setRightTableKey] = useState<string>("orders");
  const [joinType, setJoinType] = useState<JoinType>("INNER");
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent, region: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (region === "left") setJoinType("LEFT");
      else if (region === "right") setJoinType("RIGHT");
      else if (region === "intersection") setJoinType("INNER");
    }
  };

  const leftTable = MOCK_DATASETS[leftTableKey];
  const rightTable = MOCK_DATASETS[rightTableKey];

  const joinedData = useMemo(() => {
    const output: {
      leftRow: MockRow | null;
      rightRow: MockRow | null;
      included: boolean;
      status: "both" | "left-only" | "right-only";
    }[] = [];

    const leftRows = leftTable.rows;
    const rightRows = rightTable.rows;
    const lKey = leftTable.keyCol;
    const rKey = rightTable.keyCol;

    const matchedRightIndices = new Set<number>();

    leftRows.forEach((lRow) => {
      const matchVal = lRow[lKey];
      const matches = rightRows.filter((rRow) => rRow[rKey] === matchVal);

      if (matches.length > 0) {
        matches.forEach((mRow) => {
          const idx = rightRows.indexOf(mRow);
          matchedRightIndices.add(idx);
          
          output.push({
            leftRow: lRow,
            rightRow: mRow,
            status: "both",
            included: joinType === "INNER" || joinType === "LEFT" || joinType === "RIGHT" || joinType === "FULL",
          });
        });
      } else {
        output.push({
          leftRow: lRow,
          rightRow: null,
          status: "left-only",
          included: joinType === "LEFT" || joinType === "FULL" || joinType === "LEFT_ANTI",
        });
      }
    });

    rightRows.forEach((rRow, idx) => {
      if (!matchedRightIndices.has(idx)) {
        output.push({
          leftRow: null,
          rightRow: rRow,
          status: "right-only",
          included: joinType === "RIGHT" || joinType === "FULL" || joinType === "RIGHT_ANTI",
        });
      }
    });

    return output;
  }, [leftTable, rightTable, joinType]);

  const regionDescriptions: Record<string, string> = {
    left: `Left Crescent: Rows existing ONLY in the left table (${leftTable.name}) that have no key match in the right table.`,
    right: `Right Crescent: Rows existing ONLY in the right table (${rightTable.name}) that have no key match in the left table.`,
    intersection: `Intersection: Matching records where the keys coincide in both tables (${leftTable.name}.${leftTable.keyCol} = ${rightTable.name}.${rightTable.keyCol}).`,
  };

  const isCrescentAActive = joinType === "LEFT" || joinType === "FULL" || joinType === "LEFT_ANTI";
  const isCrescentBActive = joinType === "RIGHT" || joinType === "FULL" || joinType === "RIGHT_ANTI";
  const isIntersectionActive = joinType !== "LEFT_ANTI" && joinType !== "RIGHT_ANTI";

  return (
    <div className="join-diagram-wrap">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Info size={16} style={{ color: "var(--cyan)" }} />
          <strong style={{ fontSize: "14px" }}>SQL Join Venn Sandbox</strong>
        </div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {([
            { value: "INNER", label: "INNER" },
            { value: "LEFT", label: "LEFT" },
            { value: "RIGHT", label: "RIGHT" },
            { value: "FULL", label: "FULL" },
            { value: "LEFT_ANTI", label: "LEFT ANTI" },
            { value: "RIGHT_ANTI", label: "RIGHT ANTI" }
          ] as { value: JoinType; label: string }[]).map((item) => (
            <button
              key={item.value}
              onClick={() => setJoinType(item.value)}
              className={`primary-button compact ${joinType === item.value ? "" : "outline"}`}
              style={{ fontSize: "11px", height: "26px", padding: "0 10px", textTransform: "uppercase" }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="join-controls-grid">
        <div>
          <label style={{ display: "block", fontSize: "10px", color: "var(--muted)", marginBottom: "4px" }}>Left Table (Table A)</label>
          <select
            value={leftTableKey}
            onChange={(e) => {
              setLeftTableKey(e.target.value);
              if (e.target.value === rightTableKey) {
                setRightTableKey(e.target.value === "customers" ? "orders" : "customers");
              }
            }}
            style={{ width: "100%", background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "6px", borderRadius: "4px", fontSize: "12px" }}
          >
            <option value="customers">customers (Sales key: customer_id)</option>
            <option value="employees">employees (HR key: dept_id)</option>
          </select>
        </div>

        <div style={{ textAlign: "center", fontSize: "11px", color: "var(--muted)", fontWeight: "bold" }}>
          ON A.{leftTable.keyCol} = B.{rightTable.keyCol}
        </div>

        <div>
          <label style={{ display: "block", fontSize: "10px", color: "var(--muted)", marginBottom: "4px" }}>Right Table (Table B)</label>
          <select
            value={rightTableKey}
            onChange={(e) => {
              setRightTableKey(e.target.value);
              if (e.target.value === leftTableKey) {
                setLeftTableKey(e.target.value === "orders" ? "customers" : "orders");
              }
            }}
            style={{ width: "100%", background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "6px", borderRadius: "4px", fontSize: "12px" }}
          >
            <option value="orders">orders (Sales key: customer_id)</option>
            <option value="departments">departments (HR key: dept_id)</option>
          </select>
        </div>
      </div>

      <div className="venn-svg-container">
        <svg viewBox="0 0 400 200" className="venn-svg-element">
          {/* Background full circles for clear shape definition */}
          <circle cx="135" cy="100" r="85" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.5" pointerEvents="none" />
          <circle cx="265" cy="100" r="85" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.5" pointerEvents="none" />

          <path
            d="M 200,45.2 A 85,85 0 1,0 200,154.8 A 85,85 0 0,1 200,45.2"
            fill={isCrescentAActive ? "rgba(56, 217, 255, 0.35)" : "rgba(255, 255, 255, 0.02)"}
            stroke={isCrescentAActive ? "var(--cyan)" : "rgba(255, 255, 255, 0.1)"}
            strokeWidth={isCrescentAActive ? "2.5" : "1"}
            style={{ cursor: "pointer", outline: "none" }}
            tabIndex={0}
            role="button"
            aria-label="Left table exclusive region (Table A only)"
            onClick={() => setJoinType("LEFT_ANTI")}
            onMouseEnter={() => setHoveredRegion("left")}
            onMouseLeave={() => setHoveredRegion(null)}
            onFocus={() => setHoveredRegion("left")}
            onBlur={() => setHoveredRegion(null)}
            onKeyDown={(e) => handleKeyDown(e, "left")}
          />

          <path
            d="M 200,45.2 A 85,85 0 0,1 200,154.8 A 85,85 0 1,0 200,45.2"
            fill={isCrescentBActive ? "rgba(48, 230, 149, 0.35)" : "rgba(255, 255, 255, 0.02)"}
            stroke={isCrescentBActive ? "var(--emerald)" : "rgba(255, 255, 255, 0.1)"}
            strokeWidth={isCrescentBActive ? "2.5" : "1"}
            style={{ cursor: "pointer", outline: "none" }}
            tabIndex={0}
            role="button"
            aria-label="Right table exclusive region (Table B only)"
            onClick={() => setJoinType("RIGHT_ANTI")}
            onMouseEnter={() => setHoveredRegion("right")}
            onMouseLeave={() => setHoveredRegion(null)}
            onFocus={() => setHoveredRegion("right")}
            onBlur={() => setHoveredRegion(null)}
            onKeyDown={(e) => handleKeyDown(e, "right")}
          />

          <path
            d="M 200,45.2 A 85,85 0 0,1 200,154.8 A 85,85 0 0,1 200,45.2"
            fill={isIntersectionActive && joinType !== "FULL" && joinType !== "LEFT" && joinType !== "RIGHT" 
              ? "rgba(155, 124, 255, 0.5)"
              : isIntersectionActive && (isCrescentAActive || isCrescentBActive)
              ? "rgba(155, 124, 255, 0.35)"
              : "rgba(255, 255, 255, 0.02)"
            }
            stroke={isIntersectionActive ? "var(--violet)" : "rgba(255, 255, 255, 0.1)"}
            strokeWidth={isIntersectionActive ? "2.5" : "1"}
            style={{ cursor: "pointer", outline: "none" }}
            tabIndex={0}
            role="button"
            aria-label="Intersection region (Matching keys)"
            onClick={() => setJoinType("INNER")}
            onMouseEnter={() => setHoveredRegion("intersection")}
            onMouseLeave={() => setHoveredRegion(null)}
            onFocus={() => setHoveredRegion("intersection")}
            onBlur={() => setHoveredRegion(null)}
            onKeyDown={(e) => handleKeyDown(e, "intersection")}
          />

          <text x="125" y="104" fill="#ffffff" fontSize="11" fontWeight="800" textAnchor="middle" pointerEvents="none" style={{ letterSpacing: "0.04em", textTransform: "uppercase" }}>
            {leftTable.name}
          </text>
          <text x="275" y="104" fill="#ffffff" fontSize="11" fontWeight="800" textAnchor="middle" pointerEvents="none" style={{ letterSpacing: "0.04em", textTransform: "uppercase" }}>
            {rightTable.name}
          </text>
        </svg>

        <div style={{ height: "36px", fontSize: "11.5px", color: "var(--muted)", textAlign: "center", fontStyle: hoveredRegion ? "normal" : "italic" }}>
          {hoveredRegion ? regionDescriptions[hoveredRegion] : "Hover over segments of the diagram to inspect join behavior."}
        </div>
      </div>

      <div>
        <span style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: "var(--muted)", letterSpacing: "0.04em" }}>
          Resulting Record Stream ({joinedData.filter(d => d.included).length} rows)
        </span>
        <div className="table-wrap" style={{ marginTop: "8px", maxHeight: "200px", overflowY: "auto" }}>
          <table style={{ fontSize: "11px" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                <th style={{ width: "40px", textAlign: "center" }}>Status</th>
                {leftTable.columns.map((c) => <th key={c}>{leftTable.name}.{c}</th>)}
                {rightTable.columns.map((c) => <th key={c}>{rightTable.name}.{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {joinedData.map((row, idx) => {
                const isActive = row.included;
                return (
                  <tr
                    key={idx}
                    style={{
                      opacity: isActive ? 1 : 0.28,
                      background: isActive 
                        ? row.status === "both" ? "rgba(155, 124, 255, 0.05)" : row.status === "left-only" ? "rgba(56, 217, 255, 0.04)" : "rgba(48, 230, 149, 0.04)"
                        : "transparent",
                      transition: "opacity 0.2s ease"
                    }}
                  >
                    <td style={{ textAlign: "center" }}>
                      {isActive ? (
                        <Check size={12} style={{ color: "var(--emerald)" }} />
                      ) : (
                        <X size={12} style={{ color: "var(--rose)" }} />
                      )}
                    </td>
                    {leftTable.columns.map((c) => (
                      <td key={c} style={{ color: row.leftRow ? "var(--text)" : "var(--rose)", fontWeight: row.leftRow ? "normal" : "bold" }}>
                        {row.leftRow ? String(row.leftRow[c]) : "NULL"}
                      </td>
                    ))}
                    {rightTable.columns.map((c) => (
                      <td key={c} style={{ color: row.rightRow ? "var(--text)" : "var(--rose)", fontWeight: row.rightRow ? "normal" : "bold" }}>
                        {row.rightRow ? String(row.rightRow[c]) : "NULL"}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
