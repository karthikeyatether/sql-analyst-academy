import React, { useState, useEffect } from "react";
import { missionCapstones } from "../data/missions";
import { runQuery, formatSql, QueryResult } from "../utils/sqlEngine";
import {
  Target,
  CheckCircle2,
  Play,
  ArrowLeft,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  RotateCcw,
  Sparkles,
  Award,
  Clock,
  Briefcase,
  AlertCircle,
  Code2,
  FileText,
} from "lucide-react";

interface MissionCapstoneViewProps {
  onOpenStepInPlayground?: (query: string) => void;
  onBackToRoadmap?: () => void;
}

export default function MissionCapstoneView({
  onOpenStepInPlayground,
  onBackToRoadmap,
}: MissionCapstoneViewProps) {
  const [selectedMissionId, setSelectedMissionId] = useState<string>(
    missionCapstones[0].id,
  );
  const [completedStepNumbers, setCompletedStepNumbers] = useState<number[]>(
    [],
  );
  const [stepQueries, setStepQueries] = useState<Record<number, string>>({});
  const [stepResults, setStepResults] = useState<
    Record<number, QueryResult | null>
  >({});
  const [stepLoading, setStepLoading] = useState<Record<number, boolean>>({});
  const [stepTimings, setStepTimings] = useState<Record<number, number>>({});
  const [copiedQueryStep, setCopiedQueryStep] = useState<number | null>(null);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [copiedReport, setCopiedReport] = useState(false);

  const activeMission =
    missionCapstones.find((m) => m.id === selectedMissionId) ||
    missionCapstones[0];

  // Initialize step queries with starter queries when mission changes
  useEffect(() => {
    const initial: Record<number, string> = {};
    activeMission.steps.forEach((stg) => {
      initial[stg.stepNumber] = stg.starterQuery.trim();
    });
    setStepQueries(initial);
    setStepResults({});
    setStepTimings({});
    setCompletedStepNumbers([]);
    setGeneratedReport(null);
  }, [activeMission]);

  const handleQueryChange = (stepNum: number, newSql: string) => {
    setStepQueries((prev) => ({ ...prev, [stepNum]: newSql }));
  };

  const handleFormatStepQuery = (stepNum: number) => {
    const raw = stepQueries[stepNum] || "";
    if (!raw.trim()) return;
    try {
      const formatted = formatSql(raw);
      setStepQueries((prev) => ({ ...prev, [stepNum]: formatted }));
    } catch {
      // Keep existing if format fails
    }
  };

  const handleResetStepQuery = (stepNum: number) => {
    const step = activeMission.steps.find((s) => s.stepNumber === stepNum);
    if (step) {
      setStepQueries((prev) => ({
        ...prev,
        [stepNum]: step.starterQuery.trim(),
      }));
      setStepResults((prev) => ({ ...prev, [stepNum]: null }));
      setCompletedStepNumbers((prev) => prev.filter((n) => n !== stepNum));
    }
  };

  const handleCopyStepQuery = (stepNum: number) => {
    const raw = stepQueries[stepNum] || "";
    navigator.clipboard.writeText(raw);
    setCopiedQueryStep(stepNum);
    setTimeout(() => setCopiedQueryStep(null), 1800);
  };

  const handleRunAndVerifyStep = async (stepNum: number) => {
    const sql = stepQueries[stepNum] || "";
    setStepLoading((prev) => ({ ...prev, [stepNum]: true }));
    const t0 = performance.now();
    try {
      const res = await runQuery(sql);
      const executionMs = Math.max(1, Math.round(performance.now() - t0));
      setStepTimings((prev) => ({ ...prev, [stepNum]: executionMs }));
      setStepResults((prev) => ({ ...prev, [stepNum]: res }));

      if (!res.error && res.rows && res.rows.length > 0) {
        if (!completedStepNumbers.includes(stepNum)) {
          setCompletedStepNumbers((prev) => [...prev, stepNum]);
        }
      }
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : "Execution failed";
      setStepResults((prev) => ({
        ...prev,
        [stepNum]: {
          columns: [],
          rows: [],
          error: errMsg,
          message: errMsg,
        },
      }));
    } finally {
      setStepLoading((prev) => ({ ...prev, [stepNum]: false }));
    }
  };

  const handleGenerateReport = () => {
    let report = `# Executive Briefing: ${activeMission.title}\n\n`;
    report += `**Industry Category:** ${activeMission.category} | **Difficulty Tier:** ${activeMission.difficulty}\n`;
    report += `**Simulation Objective:** ${activeMission.description}\n\n`;
    report += `## Executive Summary & Key Performance Indicators\n\n`;
    report += `${activeMission.executiveReportTemplate}\n\n`;
    report += `## Analytical Methodology & SQL Solution Artifacts\n\n`;

    activeMission.steps.forEach((stg) => {
      const sql = stepQueries[stg.stepNumber] || stg.starterQuery;
      report += `### Milestone ${stg.stepNumber}: ${stg.title}\n`;
      report += `**Business Objective:** ${stg.objective}\n\n`;
      report += "```sql\n" + sql + "\n```\n\n";
    });

    report += `## Governance & Strategic Recommendations\n`;
    report += `- Establish automated metric monitoring pipelines to detect real-time data anomalies.\n`;
    report += `- Integrate verified analytical queries into scheduled dashboard ETLs.\n`;
    report += `- Maintain strict SLA and data quality assertions across all primary source schemas.\n`;

    setGeneratedReport(report);
  };

  const handleCopyReport = () => {
    if (!generatedReport) return;
    navigator.clipboard.writeText(generatedReport);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const isAllComplete =
    completedStepNumbers.length === activeMission.steps.length;
  const completionPct = Math.round(
    (completedStepNumbers.length / activeMission.steps.length) * 100,
  );

  return (
    <div
      className="view-content mission-capstone-view"
      style={{
        padding: "20px 32px 60px 32px",
        background: "var(--bg)",
        minHeight: "100vh",
        maxWidth: "1400px",
        margin: "0 auto",
        width: "100%",
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          borderBottom: "1px solid var(--border)",
          paddingBottom: "14px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {onBackToRoadmap && (
            <button
              onClick={onBackToRoadmap}
              className="secondary-button compact"
              style={{ padding: "5px 12px", fontSize: "11.5px" }}
            >
              <ArrowLeft size={13} /> Back to Roadmap
            </button>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "color-mix(in srgb, var(--amber) 15%, transparent)",
                border:
                  "1px solid color-mix(in srgb, var(--amber) 30%, transparent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--amber)",
              }}
            >
              <Briefcase size={16} />
            </div>
            <div>
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  color: "var(--text)",
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                Executive Analyst Capstones
              </h2>
              <span style={{ fontSize: "11.5px", color: "var(--muted)" }}>
                End-to-end enterprise scenarios with live SQL validation
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "var(--panel)",
              padding: "6px 14px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
            }}
          >
            <span
              style={{
                fontSize: "11.5px",
                color: "var(--muted)",
                fontWeight: 600,
              }}
            >
              Milestones:
            </span>
            <strong
              style={{
                fontSize: "12.5px",
                color: isAllComplete ? "var(--emerald)" : "var(--cyan)",
              }}
            >
              {completedStepNumbers.length} / {activeMission.steps.length} (
              {completionPct}%)
            </strong>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: "24px",
        }}
      >
        {/* Missions Selection Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--muted)",
              marginBottom: "2px",
            }}
          >
            Select Capstone Mission
          </div>

          {missionCapstones.map((m) => {
            const isSelected = m.id === selectedMissionId;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedMissionId(m.id)}
                style={{
                  background: isSelected
                    ? "color-mix(in srgb, var(--cyan) 10%, var(--panel))"
                    : "var(--panel)",
                  border: isSelected
                    ? "1px solid var(--cyan)"
                    : "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "14px",
                  textAlign: "left",
                  cursor: "pointer",
                  color: "var(--text)",
                  transition: "all 0.15s ease",
                  boxShadow: isSelected
                    ? "0 4px 16px rgba(0,0,0,0.25)"
                    : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "4px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      color: isSelected ? "var(--cyan)" : "var(--amber)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {m.category}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                      padding: "1px 6px",
                      borderRadius: "4px",
                      color: "var(--muted)",
                    }}
                  >
                    {m.difficulty}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "var(--text)",
                    lineHeight: "1.3",
                    marginBottom: "6px",
                  }}
                >
                  {m.title}
                </div>

                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--text-secondary)",
                    lineHeight: "1.4",
                  }}
                >
                  {m.subtitle}
                </div>
              </button>
            );
          })}

          {/* Rubric Scorecard Info Box */}
          <div
            style={{
              marginTop: "8px",
              padding: "14px",
              borderRadius: "8px",
              background: "var(--panel)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "11.5px",
                fontWeight: 700,
                color: "var(--text)",
                marginBottom: "6px",
              }}
            >
              <ShieldCheck size={14} style={{ color: "var(--emerald)" }} />
              Capstone Assessment Rubric
            </div>
            <ul
              style={{
                margin: 0,
                paddingLeft: "16px",
                fontSize: "11px",
                lineHeight: "1.55",
                color: "var(--muted)",
              }}
            >
              <li>Data Accuracy & Null Safety (40%)</li>
              <li>Execution Efficiency & Joins (30%)</li>
              <li>Executive Recommendations (30%)</li>
            </ul>
          </div>
        </div>

        {/* Mission Content & Live Interactive Console */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div
            style={{
              background: "var(--panel)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              padding: "20px 24px",
            }}
          >
            <div
              style={{
                marginBottom: "18px",
                borderBottom: "1px solid var(--border)",
                paddingBottom: "14px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "4px",
                }}
              >
                <span
                  style={{
                    fontSize: "10.5px",
                    fontWeight: 800,
                    color: "var(--cyan)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Scenario Overview
                </span>
              </div>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  color: "var(--text)",
                  margin: "0 0 6px 0",
                }}
              >
                {activeMission.title}
              </h3>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  margin: 0,
                  lineHeight: 1.55,
                }}
              >
                {activeMission.description}
              </p>
            </div>

            {/* Mission Milestones List */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {activeMission.steps.map((stg) => {
                const isDone = completedStepNumbers.includes(stg.stepNumber);
                const queryVal =
                  stepQueries[stg.stepNumber] ?? stg.starterQuery;
                const result = stepResults[stg.stepNumber];
                const loading = stepLoading[stg.stepNumber];
                const execTime = stepTimings[stg.stepNumber];
                const queryLineCount = (queryVal.match(/\n/g) || []).length + 1;

                return (
                  <div
                    key={stg.stepNumber}
                    style={{
                      background: "var(--panel2, rgba(255,255,255,0.02))",
                      border: isDone
                        ? "1px solid color-mix(in srgb, var(--emerald) 40%, transparent)"
                        : "1px solid var(--border)",
                      borderRadius: "8px",
                      padding: "16px 18px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "10.5px",
                            fontWeight: 800,
                            color: isDone ? "var(--emerald)" : "var(--cyan)",
                            background: isDone
                              ? "color-mix(in srgb, var(--emerald) 12%, transparent)"
                              : "color-mix(in srgb, var(--cyan) 12%, transparent)",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            textTransform: "uppercase",
                          }}
                        >
                          Milestone {stg.stepNumber}
                        </span>
                        <strong
                          style={{ fontSize: "13.5px", color: "var(--text)" }}
                        >
                          {stg.title}
                        </strong>
                      </div>

                      {isDone ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "11.5px",
                            fontWeight: 700,
                            color: "var(--emerald)",
                          }}
                        >
                          <CheckCircle2 size={14} /> Verified
                        </span>
                      ) : (
                        <span
                          style={{ fontSize: "11px", color: "var(--muted)" }}
                        >
                          Pending Verification
                        </span>
                      )}
                    </div>

                    <p
                      style={{
                        fontSize: "12.5px",
                        color: "var(--text-secondary)",
                        marginBottom: "12px",
                        lineHeight: 1.5,
                      }}
                    >
                      {stg.objective}
                    </p>

                    {/* Step SQL Editor Box */}
                    <div
                      style={{
                        position: "relative",
                        border: "1px solid var(--border)",
                        borderRadius: "6px",
                        background: "var(--bg-editor, #0d1117)",
                        overflow: "hidden",
                        marginBottom: "10px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "5px 12px",
                          background: "rgba(255,255,255,0.02)",
                          borderBottom: "1px solid var(--border)",
                          fontSize: "10.5px",
                          color: "var(--muted)",
                          fontFamily: "var(--font-mono, monospace)",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Code2 size={12} style={{ color: "var(--cyan)" }} />{" "}
                          Milestone SQL Editor
                        </span>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <button
                            onClick={() =>
                              handleFormatStepQuery(stg.stepNumber)
                            }
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--muted)",
                              cursor: "pointer",
                              fontSize: "10.5px",
                              padding: "2px 6px",
                              borderRadius: "3px",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "3px",
                            }}
                            title="Format SQL query"
                          >
                            <Sparkles size={11} /> Format
                          </button>
                          <button
                            onClick={() => handleResetStepQuery(stg.stepNumber)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--muted)",
                              cursor: "pointer",
                              fontSize: "10.5px",
                              padding: "2px 6px",
                              borderRadius: "3px",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "3px",
                            }}
                            title="Reset to starter query"
                          >
                            <RotateCcw size={11} /> Reset
                          </button>
                          <button
                            onClick={() => handleCopyStepQuery(stg.stepNumber)}
                            style={{
                              background: "none",
                              border: "none",
                              color:
                                copiedQueryStep === stg.stepNumber
                                  ? "var(--emerald)"
                                  : "var(--muted)",
                              cursor: "pointer",
                              fontSize: "10.5px",
                              padding: "2px 6px",
                              borderRadius: "3px",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "3px",
                            }}
                            title="Copy SQL"
                          >
                            {copiedQueryStep === stg.stepNumber ? (
                              <Check size={11} />
                            ) : (
                              <Copy size={11} />
                            )}
                            {copiedQueryStep === stg.stepNumber
                              ? "Copied"
                              : "Copy"}
                          </button>
                        </div>
                      </div>

                      <textarea
                        value={queryVal}
                        onChange={(e) =>
                          handleQueryChange(stg.stepNumber, e.target.value)
                        }
                        rows={Math.min(12, Math.max(5, queryLineCount))}
                        style={{
                          width: "100%",
                          background: "transparent",
                          border: "none",
                          padding: "12px 14px",
                          color: "var(--cyan)",
                          fontFamily:
                            "var(--font-mono, 'JetBrains Mono', Consolas, monospace)",
                          fontSize: "12.5px",
                          lineHeight: 1.55,
                          resize: "vertical",
                          outline: "none",
                        }}
                        placeholder="Write your analytical SQL query here..."
                      />
                    </div>

                    {/* Step Actions Bar */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <button
                          onClick={() => handleRunAndVerifyStep(stg.stepNumber)}
                          disabled={loading}
                          className="primary-button compact"
                          style={{
                            padding: "6px 14px",
                            fontSize: "11.5px",
                            fontWeight: 700,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          <Play size={12} fill="currentColor" />
                          {loading
                            ? "Verifying Query..."
                            : "Run & Verify Milestone"}
                        </button>

                        {onOpenStepInPlayground && (
                          <button
                            onClick={() => onOpenStepInPlayground(queryVal)}
                            className="secondary-button compact"
                            style={{ padding: "5px 12px", fontSize: "11.5px" }}
                          >
                            Open in Studio
                          </button>
                        )}
                      </div>

                      {execTime !== undefined && (
                        <span
                          style={{
                            fontSize: "11px",
                            color: "var(--muted)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Clock size={11} style={{ color: "var(--cyan)" }} />
                          {execTime}ms execution
                        </span>
                      )}
                    </div>

                    {/* Step Result Output Preview */}
                    {result && (
                      <div style={{ marginTop: "12px" }}>
                        {result.error ? (
                          <div
                            style={{
                              padding: "10px 14px",
                              background:
                                "color-mix(in srgb, var(--rose) 10%, transparent)",
                              border:
                                "1px solid color-mix(in srgb, var(--rose) 25%, transparent)",
                              borderRadius: "6px",
                              color: "var(--rose)",
                              fontSize: "12px",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <AlertCircle size={14} />
                            <span>{result.error}</span>
                          </div>
                        ) : result.columns && result.columns.length > 0 ? (
                          <div
                            style={{
                              border: "1px solid var(--border)",
                              borderRadius: "6px",
                              overflow: "hidden",
                              background: "var(--bg)",
                            }}
                          >
                            <div
                              style={{
                                maxHeight: "140px",
                                overflow: "auto",
                              }}
                            >
                              <table
                                style={{
                                  width: "100%",
                                  borderCollapse: "collapse",
                                  fontSize: "11.5px",
                                }}
                              >
                                <thead>
                                  <tr
                                    style={{
                                      background: "var(--panel)",
                                      borderBottom: "1px solid var(--border)",
                                    }}
                                  >
                                    {result.columns.map((c) => (
                                      <th
                                        key={c}
                                        style={{
                                          padding: "6px 10px",
                                          textAlign: "left",
                                          color: "var(--cyan)",
                                          fontWeight: 700,
                                          fontSize: "10.5px",
                                          textTransform: "uppercase",
                                        }}
                                      >
                                        {c}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {result.rows.slice(0, 5).map((row, ri) => (
                                    <tr
                                      key={ri}
                                      style={{
                                        borderBottom: "1px solid var(--border)",
                                      }}
                                    >
                                      {result.columns.map((c) => (
                                        <td
                                          key={c}
                                          style={{
                                            padding: "5px 10px",
                                            color: "var(--text-secondary)",
                                            fontFamily:
                                              "var(--font-mono, monospace)",
                                            fontSize: "11px",
                                          }}
                                        >
                                          {String(row[c] ?? "NULL")}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <div
                              style={{
                                padding: "4px 10px",
                                fontSize: "10.5px",
                                color: "var(--muted)",
                                background: "var(--panel)",
                                borderTop: "1px solid var(--border)",
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <span>
                                Returned {result.rows.length} rows (showing
                                first 5)
                              </span>
                              <span
                                style={{
                                  color: "var(--emerald)",
                                  fontWeight: 600,
                                }}
                              >
                                ✓ Criteria Met
                              </span>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Capstone Completion & Executive Deliverable Export */}
            {isAllComplete && (
              <div
                style={{
                  marginTop: "20px",
                  background:
                    "color-mix(in srgb, var(--emerald) 8%, var(--panel))",
                  border:
                    "1px solid color-mix(in srgb, var(--emerald) 30%, transparent)",
                  borderRadius: "8px",
                  padding: "18px 20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        background:
                          "color-mix(in srgb, var(--emerald) 18%, transparent)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--emerald)",
                      }}
                    >
                      <Award size={20} />
                    </div>
                    <div>
                      <h4
                        style={{
                          fontSize: "14px",
                          fontWeight: 800,
                          color: "var(--emerald)",
                          margin: "0 0 2px 0",
                        }}
                      >
                        All Milestones Verified! (+250 XP Awarded)
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "12px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        You solved all enterprise milestone requirements for
                        this scenario.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateReport}
                    className="primary-button compact"
                    style={{
                      padding: "7px 16px",
                      fontSize: "12px",
                      fontWeight: 700,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <FileText size={14} /> Generate Executive Briefing
                  </button>
                </div>

                {generatedReport && (
                  <div style={{ marginTop: "16px" }}>
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
                          color: "var(--muted)",
                          textTransform: "uppercase",
                        }}
                      >
                        Executive Report Preview
                      </span>
                      <button
                        onClick={handleCopyReport}
                        className="secondary-button compact"
                        style={{
                          padding: "4px 10px",
                          fontSize: "11px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        {copiedReport ? (
                          <Check size={11} />
                        ) : (
                          <Copy size={11} />
                        )}
                        {copiedReport ? "Report Copied!" : "Copy Report"}
                      </button>
                    </div>
                    <pre
                      style={{
                        background: "var(--bg-editor, #0d1117)",
                        border: "1px solid var(--border)",
                        borderRadius: "6px",
                        padding: "14px 16px",
                        fontSize: "12px",
                        lineHeight: 1.5,
                        color: "var(--text-secondary)",
                        whiteSpace: "pre-wrap",
                        maxHeight: "220px",
                        overflowY: "auto",
                        margin: 0,
                      }}
                    >
                      {generatedReport}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
