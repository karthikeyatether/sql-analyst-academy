import React, { useState, useEffect, useRef, useMemo } from "react";
import Editor from "@monaco-editor/react";
import { Play, Database, Table as TableIcon, Activity } from "lucide-react";
import { runQuery, QueryResult, getLiveSchema, formatSql } from "../utils/sqlEngine";
import { useV3State, useV3Dispatch } from "../contexts/V3Store";
import { useCurriculum } from "../contexts/CurriculumContext";
import { gradeQuery } from "../utils/graderService";

export function PremiumPlaygroundView() {
  const state = useV3State();
  const dispatch = useV3Dispatch();
  const { allProblems } = useCurriculum();
  
  const [query, setQuery] = useState(
    "-- Write your SQL query here\nSELECT * FROM customers LIMIT 10;",
  );
  const [result, setResult] = useState<QueryResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [schema, setSchema] = useState<any>(null);
  const [gradeMsg, setGradeMsg] = useState<{isCorrect: boolean, message: string, details?: string} | null>(null);

  const activeProblem = useMemo(() => {
    return allProblems.find(p => p.id === state.activeProblemId);
  }, [allProblems, state.activeProblemId]);

  useEffect(() => {
    getLiveSchema().then(setSchema).catch(console.error);
    if (activeProblem && query.includes("SELECT * FROM customers")) {
      setQuery(activeProblem.starterQuery || `-- Solve: ${activeProblem.title}\n\n`);
    }
  }, [activeProblem]);

  const handleRun = async () => {
    setIsRunning(true);
    setGradeMsg(null);
    const res = await runQuery(query);
    setResult(res);
    setIsRunning(false);
  };

  const handleSubmit = async () => {
    if (!activeProblem) return;
    setIsRunning(true);
    setGradeMsg(null);
    
    const userRes = await runQuery(query);
    setResult(userRes);
    
    const solRes = await runQuery(activeProblem.solution);
    
    const grade = gradeQuery({
      userQuery: query,
      solutionSql: activeProblem.solution,
      userResult: userRes,
      expectedResult: solRes,
      promptText: activeProblem.businessScenario,
      playgroundMode: state.playgroundMode
    });
    
    setGradeMsg(grade);
    setIsRunning(false);
  };

  const handleFormat = () => {
    setQuery(formatSql(query));
  };

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: "var(--bg-base)",
      }}
    >
      {/* Left Panel: Schema Explorer */}
      <div
        className="glass-panel"
        style={{
          width: "280px",
          height: "100%",
          borderRight: "1px solid var(--border-subtle)",
          display: "flex",
          flexDirection: "column",
          borderRadius: 0,
          borderTop: "none",
          borderBottom: "none",
          borderLeft: "none",
        }}
      >
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Database size={18} color="var(--accent-cyan)" />
          <h3
            style={{
              margin: 0,
              fontSize: "14px",
              color: "var(--text-secondary)",
            }}
          >
            Database Schema
          </h3>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
          {schema &&
            Object.entries(schema).map(([tableName, tableData]: any) => (
              <div key={tableName} style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "8px",
                  }}
                >
                  <TableIcon size={14} color="var(--accent-purple)" />
                  <span
                    style={{
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      fontSize: "14px",
                    }}
                  >
                    {tableName}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--text-muted)",
                      marginLeft: "auto",
                    }}
                  >
                    {tableData.rowCount} rows
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    paddingLeft: "22px",
                  }}
                >
                  {tableData.columns.map((c: any) => (
                    <div
                      key={c.name}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "12px",
                      }}
                    >
                      <span style={{ color: "var(--text-secondary)" }}>
                        {c.name}
                      </span>
                      <span
                        style={{
                          color: "var(--text-muted)",
                          fontFamily: "monospace",
                        }}
                      >
                        {c.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Main Panel: Editor & Results */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Editor Toolbar */}
        <div
          style={{
            padding: "12px 24px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>
              SQL Playground
            </h2>
            {state.playgroundMode !== "free" && (
              <span
                style={{
                  background: "hsla(270, 80%, 70%, 0.1)",
                  color: "var(--accent-purple)",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                {state.playgroundMode.toUpperCase()} MODE
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              className="premium-btn premium-btn-secondary"
              onClick={handleFormat}
              style={{ padding: "8px 16px" }}
            >
              Format SQL
            </button>
            <button
              className="premium-btn premium-btn-secondary"
              onClick={handleRun}
              disabled={isRunning}
              style={{ padding: "8px 24px" }}
            >
              {isRunning ? (
                <Activity size={18} className="animate-spin" />
              ) : (
                <Play size={18} />
              )}
              Run Code
            </button>
            {activeProblem && state.playgroundMode !== "free" && (
              <button
                className="premium-btn premium-btn-primary"
                onClick={handleSubmit}
                disabled={isRunning}
                style={{ padding: "8px 24px" }}
              >
                Submit Answer
              </button>
            )}
          </div>
        </div>
        
        {activeProblem && (
          <div style={{ padding: "16px 24px", background: "var(--bg-elevated)", borderBottom: "1px solid var(--border-subtle)" }}>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", color: "var(--text-primary)" }}>{activeProblem.title}</h3>
            <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "14px" }}>{activeProblem.businessScenario}</p>
          </div>
        )}

        {/* Editor */}
        <div style={{ flex: 1, minHeight: "300px" }}>
          <Editor
            height="100%"
            language="sql"
            theme="vs-dark"
            value={query}
            onChange={(val) => setQuery(val || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 16,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              padding: { top: 24, bottom: 24 },
              scrollbar: { 
                vertical: "auto", 
                horizontal: "auto",
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10
              },
              overviewRulerBorder: false,
              hideCursorInOverviewRuler: true,
              mouseWheelScrollSensitivity: 2,
              fastScrollSensitivity: 7,
              smoothScrolling: true,
              scrollBeyondLastLine: false,
            }}
          />
        </div>

        {/* Results Panel */}
        <div
          className="glass-panel"
          style={{
            height: "300px",
            borderTop: "1px solid var(--border-subtle)",
            borderRadius: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "8px 24px",
              borderBottom: "1px solid var(--border-subtle)",
              display: "flex",
              justifyContent: "space-between",
              background: "var(--bg-elevated)",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--text-secondary)",
              }}
            >
              OUTPUT TERMINAL
            </span>
            {result?.durationMs !== undefined && (
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Execution time: {result.durationMs}ms
              </span>
            )}
          </div>

          <div style={{ flex: 1, overflow: "auto", padding: "16px 24px" }}>
            {gradeMsg && (
              <div
                style={{
                  padding: "16px",
                  marginBottom: "16px",
                  borderRadius: "var(--radius-sm)",
                  background: gradeMsg.isCorrect ? "hsla(150, 80%, 30%, 0.1)" : "hsla(0, 70%, 60%, 0.1)",
                  border: gradeMsg.isCorrect ? "1px solid var(--success)" : "1px solid var(--error)",
                }}
              >
                <h4 style={{ margin: "0 0 8px 0", color: gradeMsg.isCorrect ? "var(--success)" : "var(--error)" }}>
                  {gradeMsg.message}
                </h4>
                {gradeMsg.details && (
                  <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "14px" }}>
                    {gradeMsg.details}
                  </p>
                )}
              </div>
            )}
            {result?.error ? (
              <div
                style={{
                  color: "var(--error)",
                  fontFamily: "monospace",
                  padding: "16px",
                  background: "hsla(0, 70%, 60%, 0.1)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                {result.error}
              </div>
            ) : result?.rows && result.rows.length > 0 ? (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "left",
                  fontSize: "13px",
                }}
              >
                <thead>
                  <tr>
                    {result.columns.map((c) => (
                      <th
                        key={c}
                        style={{
                          padding: "8px 12px",
                          borderBottom: "2px solid var(--border-subtle)",
                          color: "var(--text-secondary)",
                          fontWeight: 600,
                        }}
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((r, i) => (
                    <tr
                      key={i}
                      style={{
                        borderBottom: "1px solid var(--border-subtle)",
                        transition: "background 0.2s",
                      }}
                      className="hover:bg-[var(--bg-elevated)]"
                    >
                      {result.columns.map((c) => (
                        <td
                          key={c}
                          style={{
                            padding: "8px 12px",
                            color: "var(--text-primary)",
                          }}
                        >
                          {String(r[c])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div
                style={{ color: "var(--text-muted)", fontFamily: "monospace" }}
              >
                {result?.message || "Run a query to see results..."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(PremiumPlaygroundView);
