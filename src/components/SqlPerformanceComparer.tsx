import React, { useMemo } from "react";
import { Zap, AlertTriangle, CheckCircle, XCircle, ChevronRight, BarChart3 } from "lucide-react";
import { QueryPlanStep, QueryResult } from "../utils/sqlEngine";

interface PerformanceComparerProps {
  queryA: string;
  queryB: string;
  resA: QueryResult;
  resB: QueryResult;
  planA: QueryPlanStep[];
  planB: QueryPlanStep[];
}

export default function SqlPerformanceComparer({
  queryA,
  queryB,
  resA,
  resB,
  planA,
  planB,
}: PerformanceComparerProps) {
  
  // 1. Congruence verification logic
  const checkCongruence = (): { congruent: boolean; reason: string } => {
    if (resA.error || resB.error) {
      return { congruent: false, reason: "One of the queries returned an execution error." };
    }
    
    // Check columns
    const colsA = resA.columns.map(c => c.toLowerCase()).sort();
    const colsB = resB.columns.map(c => c.toLowerCase()).sort();
    if (JSON.stringify(colsA) !== JSON.stringify(colsB)) {
      return { congruent: false, reason: `Column names or types do not match. Query A has columns: [${resA.columns.join(", ")}], Query B has: [${resB.columns.join(", ")}].` };
    }
    
    // Check rows count
    if (resA.rows.length !== resB.rows.length) {
      return { congruent: false, reason: `Row count mismatch: Query A returned ${resA.rows.length} rows, Query B returned ${resB.rows.length} rows.` };
    }
    
    // Check actual row values (order-agnostic compare)
    const normalizeVal = (v: unknown): string => {
      if (v === null || v === undefined) return "null";
      return String(v).trim().toLowerCase();
    };
    
    const serializeRow = (r: Record<string, unknown>, cols: string[]): string => {
      return cols.map(c => {
        const key = Object.keys(r).find(k => k.toLowerCase() === c.toLowerCase()) || c;
        return `${c}:${normalizeVal(r[key])}`;
      }).sort().join("|");
    };
    const hasOrderBy = /ORDER\s+BY/i.test(queryA) || /ORDER\s+BY/i.test(queryB);
    const sortedCols = resA.columns.map(c => c.toLowerCase());
    const listA = resA.rows.map(r => serializeRow(r as Record<string, unknown>, sortedCols));
    const listB = resB.rows.map(r => serializeRow(r as Record<string, unknown>, sortedCols));
    
    if (!hasOrderBy) {
      listA.sort();
      listB.sort();
    }
    
    for (let i = 0; i < listA.length; i++) {
      if (listA[i] !== listB[i]) {
        return { congruent: false, reason: "The rows returned contain different values, calculations, or ordering." };
      }
    }
    
    return { congruent: true, reason: "Queries are logic-equivalent and return the exact same data!" };
  };

  const { congruent, reason } = useMemo(() => {
    return checkCongruence();
  }, [resA, resB]);

  // 2. Performance Comparison metrics
  const tA = resA.durationMs || 0.01;
  const tB = resB.durationMs || 0.01;
  
  const speedDiff = Math.abs(tA - tB);
  const percentDiff = Math.round((speedDiff / Math.max(tA, tB)) * 100);
  const aIsFaster = tA < tB;
  
  // 3. Scan & Index Operations audit
  const auditPlan = (plan: QueryPlanStep[]) => {
    const hasScan = plan.some(s => s.detail.toUpperCase().includes("SCAN"));
    const hasIndex = plan.some(s => s.detail.toUpperCase().includes("SEARCH TABLE") && s.detail.toUpperCase().includes("USING INDEX"));
    const hasSort = plan.some(s => s.detail.toUpperCase().includes("USE TEMP B-TREE") || s.detail.toUpperCase().includes("SORT"));
    return { hasScan, hasIndex, hasSort };
  };

  const auditA = useMemo(() => auditPlan(planA), [planA]);
  const auditB = useMemo(() => auditPlan(planB), [planB]);

  return (
    <div className="perf-comparer-container">
      {/* HEADER STATEMENT */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <BarChart3 size={16} style={{ color: "var(--cyan)" }} />
          <strong style={{ fontSize: "13px" }}>A/B Performance Benchmarks</strong>
        </div>
        <span style={{ fontSize: "10.5px", color: "var(--muted)" }}>Compare speed & optimizer plans</span>
      </div>

      {/* CONGRUENCE BADGE */}
      <div className={`congruence-feedback-banner ${congruent ? "matching" : "mismatch"}`}>
        {congruent ? (
          <CheckCircle size={16} style={{ color: "var(--emerald)", flexShrink: 0 }} />
        ) : (
          <AlertTriangle size={16} style={{ color: "var(--rose)", flexShrink: 0 }} />
        )}
        <div style={{ flex: 1 }}>
          <strong style={{ fontSize: "11.5px", display: "block", color: congruent ? "var(--emerald)" : "var(--rose)" }}>
            {congruent ? "Results Match (Logic Equivalent)" : "Results Mismatch"}
          </strong>
          <span style={{ fontSize: "10.5px", color: "var(--muted)", display: "block", marginTop: "2px" }}>{reason}</span>
        </div>
      </div>

      {/* BENCHMARK SPEED COMPLEMENT */}
      {!resA.error && !resB.error && (
        <div className="benchmark-verdict-card">
          {percentDiff > 10 ? (
            <div>
              <span style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", fontWeight: 600 }}>Benchmark Verdict</span>
              <strong style={{ display: "block", fontSize: "18px", margin: "6px 0", color: aIsFaster ? "var(--cyan)" : "var(--violet)" }}>
                Query {aIsFaster ? "A" : "B"} is {percentDiff}% Faster (Avg of 5 Runs)
              </strong>
              <p style={{ margin: 0, fontSize: "11px", color: "var(--muted)", lineHeight: "1.4" }}>
                Query A: {tA.toFixed(2)} ms &middot; Query B: {tB.toFixed(2)} ms
              </p>
            </div>
          ) : (
            <div>
              <span style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", fontWeight: 600 }}>Benchmark Verdict</span>
              <strong style={{ display: "block", fontSize: "16px", margin: "6px 0", color: "var(--text)" }}>
                Queries perform identically (Avg of 5 Runs)
              </strong>
              <p style={{ margin: 0, fontSize: "11.5px", color: "var(--muted)" }}>
                Query A ({tA.toFixed(2)} ms) and Query B ({tB.toFixed(2)} ms) fall within statistical tolerance limits.
              </p>
            </div>
          )}

          {/* Speed Bars */}
          <div className="frequent-value-stream">
            <div className="benchmark-bar-row">
              <div className="benchmark-bar-labels">
                <span>Query A</span>
                <strong>{tA.toFixed(2)} ms</strong>
              </div>
              <div className="benchmark-bar-track">
                <div className="benchmark-bar-fill fill-a" style={{ width: `${(tA / Math.max(tA, tB)) * 100}%` }} />
              </div>
            </div>
            <div className="benchmark-bar-row">
              <div className="benchmark-bar-labels">
                <span>Query B</span>
                <strong>{tB.toFixed(2)} ms</strong>
              </div>
              <div className="benchmark-bar-track">
                <div className="benchmark-bar-fill fill-b" style={{ width: `${(tB / Math.max(tA, tB)) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DUAL PLAN COMPARISONS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
        {/* QUERY A PROFILE */}
        <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--border)", borderRadius: "6px", padding: "10px" }}>
          <strong style={{ fontSize: "11px", display: "block", marginBottom: "8px", color: "var(--cyan)" }}>Query A Profiler</strong>
          {resA.error ? (
            <span style={{ fontSize: "10px", color: "var(--rose)" }}>Error: {resA.error.slice(0, 50)}...</span>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10.5px" }}>
                <span style={{ color: "var(--muted)" }}>Full Table Scans:</span>
                <span style={{ fontWeight: "bold", color: auditA.hasScan ? "var(--rose)" : "var(--emerald)" }}>
                  {auditA.hasScan ? "YES ✗" : "NO ✓"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10.5px" }}>
                <span style={{ color: "var(--muted)" }}>Index Utilized:</span>
                <span style={{ fontWeight: "bold", color: auditA.hasIndex ? "var(--emerald)" : "var(--rose)" }}>
                  {auditA.hasIndex ? "YES ✓" : "NO ✗"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10.5px" }}>
                <span style={{ color: "var(--muted)" }}>Disk Sort Overhead:</span>
                <span style={{ fontWeight: "bold", color: auditA.hasSort ? "var(--amber)" : "var(--emerald)" }}>
                  {auditA.hasSort ? "YES ✗" : "NO ✓"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* QUERY B PROFILE */}
        <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--border)", borderRadius: "6px", padding: "10px" }}>
          <strong style={{ fontSize: "11px", display: "block", marginBottom: "8px", color: "var(--violet)" }}>Query B Profiler</strong>
          {resB.error ? (
            <span style={{ fontSize: "10px", color: "var(--rose)" }}>Error: {resB.error.slice(0, 50)}...</span>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10.5px" }}>
                <span style={{ color: "var(--muted)" }}>Full Table Scans:</span>
                <span style={{ fontWeight: "bold", color: auditB.hasScan ? "var(--rose)" : "var(--emerald)" }}>
                  {auditB.hasScan ? "YES ✗" : "NO ✓"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10.5px" }}>
                <span style={{ color: "var(--muted)" }}>Index Utilized:</span>
                <span style={{ fontWeight: "bold", color: auditB.hasIndex ? "var(--emerald)" : "var(--rose)" }}>
                  {auditB.hasIndex ? "YES ✓" : "NO ✗"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10.5px" }}>
                <span style={{ color: "var(--muted)" }}>Disk Sort Overhead:</span>
                <span style={{ fontWeight: "bold", color: auditB.hasSort ? "var(--amber)" : "var(--emerald)" }}>
                  {auditB.hasSort ? "YES ✗" : "NO ✓"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SIDE-BY-SIDE RESULT SNAPSHOT */}
      {!resA.error && !resB.error && (
        <div style={{ marginTop: "6px" }}>
          <strong style={{ fontSize: "11px", display: "block", marginBottom: "6px", color: "var(--muted)" }}>Result Output Snapshot (First 3 Rows)</strong>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
            {/* Query A Results table */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "6px", padding: "8px", overflowX: "auto" }}>
              <span style={{ fontSize: "9.5px", fontWeight: "bold", color: "var(--cyan)", display: "block", marginBottom: "6px" }}>Query A Results ({resA.rows.length} rows)</span>
              {resA.rows.length === 0 ? (
                <span style={{ fontSize: "10px", color: "var(--muted)" }}>No rows returned.</span>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      {resA.columns.slice(0, 3).map(c => (
                        <th key={c} style={{ padding: "4px", color: "var(--muted)", fontWeight: "normal" }}>{c}</th>
                      ))}
                      {resA.columns.length > 3 && <th style={{ padding: "4px", color: "var(--muted)" }}>...</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {resA.rows.slice(0, 3).map((r: any, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        {resA.columns.slice(0, 3).map(c => (
                          <td key={c} style={{ padding: "4px", whiteSpace: "nowrap" }}>{String(r[c] !== null && r[c] !== undefined ? r[c] : "NULL")}</td>
                        ))}
                        {resA.columns.length > 3 && <td style={{ padding: "4px", color: "var(--muted)" }}>...</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Query B Results table */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "6px", padding: "8px", overflowX: "auto" }}>
              <span style={{ fontSize: "9.5px", fontWeight: "bold", color: "var(--violet)", display: "block", marginBottom: "6px" }}>Query B Results ({resB.rows.length} rows)</span>
              {resB.rows.length === 0 ? (
                <span style={{ fontSize: "10px", color: "var(--muted)" }}>No rows returned.</span>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      {resB.columns.slice(0, 3).map(c => (
                        <th key={c} style={{ padding: "4px", color: "var(--muted)", fontWeight: "normal" }}>{c}</th>
                      ))}
                      {resB.columns.length > 3 && <th style={{ padding: "4px", color: "var(--muted)" }}>...</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {resB.rows.slice(0, 3).map((r: any, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        {resB.columns.slice(0, 3).map(c => (
                          <td key={c} style={{ padding: "4px", whiteSpace: "nowrap" }}>{String(r[c] !== null && r[c] !== undefined ? r[c] : "NULL")}</td>
                        ))}
                        {resB.columns.length > 3 && <td style={{ padding: "4px", color: "var(--muted)" }}>...</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDUCATIONAL RECOMMENDATION CODES */}
      {congruent && !resA.error && !resB.error && (
        <div style={{
          background: "rgba(155, 124, 255, 0.04)",
          border: "1px solid rgba(155, 124, 255, 0.12)",
          borderRadius: "6px",
          padding: "10px 12px",
          fontSize: "11px",
          color: "var(--text-secondary)",
          lineHeight: "1.4"
        }}>
          <span style={{ fontWeight: "bold", color: "var(--violet)", display: "block", marginBottom: "4px" }}>Performance Analyst Tip:</span>
          {auditA.hasScan && !auditB.hasScan && (
            <span>Query B utilizes indexes to search records directly, avoiding full scans of Query A. Prefer Query B's layout for large relational tables.</span>
          )}
          {!auditA.hasScan && auditB.hasScan && (
            <span>Query A avoids table scans present in Query B by using indexed column searches. Query A is more performant in production.</span>
          )}
          {auditA.hasSort && !auditB.hasSort && (
            <span>Query A triggers a temporary disk sort to resolve ordering/grouping. Query B avoids sorting overhead, reducing execution latency.</span>
          )}
          {!auditA.hasSort && auditB.hasSort && (
            <span>Query B triggers a temporary B-Tree disk sort. Query A utilizes existing indexes to sort records, which is much faster.</span>
          )}
          {!auditA.hasScan && !auditB.hasScan && !auditA.hasSort && !auditB.hasSort && (
            <span>Both queries are highly optimized and efficiently query the index fields. Choose the one with the cleaner, more readable syntax!</span>
          )}
          {auditA.hasScan && auditB.hasScan && (
            <span>Both approaches trigger full table scans. Consider building indexes on the join or filter columns to speed up query execution.</span>
          )}
        </div>
      )}
    </div>
  );
}
