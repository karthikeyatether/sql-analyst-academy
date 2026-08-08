import React, { useState } from "react";
import {
  missionCapstones,
  MissionCapstone,
  MissionStep,
} from "../data/missions";
import {
  Target,
  CheckCircle2,
  Play,
  Award,
  FileText,
  ArrowLeft,
  DownloadCloud,
} from "lucide-react";

interface MissionCapstoneViewProps {
  onOpenStepInPlayground?: (query: string) => void;
  onBackToRoadmap?: () => void;
}

const MissionCapstoneView: React.FC<MissionCapstoneViewProps> = ({
  onOpenStepInPlayground,
  onBackToRoadmap,
}) => {
  const [selectedMissionId, setSelectedMissionId] = useState<string>(
    missionCapstones[0].id,
  );
  const [completedStepNumbers, setCompletedStepNumbers] = useState<number[]>(
    [],
  );
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);

  const activeMission =
    missionCapstones.find((m: MissionCapstone) => m.id === selectedMissionId) ||
    missionCapstones[0];

  const handleCompleteStep = (stepNum: number) => {
    if (!completedStepNumbers.includes(stepNum)) {
      setCompletedStepNumbers((prev) => [...prev, stepNum]);
    }
  };

  const handleGenerateReport = () => {
    setGeneratedReport(activeMission.executiveReportTemplate);
  };

  const handleExportReport = () => {
    if (!generatedReport) return;
    const blob = new Blob([generatedReport], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const filename = activeMission.title.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    a.download = `${filename}_executive_report.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="view-content mission-capstone-view"
      style={{
        padding: "20px",
        background: "var(--bg)",
        minHeight: "100vh",
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {onBackToRoadmap && (
            <button
              onClick={onBackToRoadmap}
              className="secondary-button"
              style={{ padding: "6px 12px", fontSize: "12px" }}
            >
              <ArrowLeft size={14} /> Back to Roadmap
            </button>
          )}
          <Target size={22} color="var(--cyan)" />
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "var(--text)",
              margin: 0,
            }}
          >
            MISSION-BASED ANALYST CAPSTONES
          </h2>
        </div>
        <span
          style={{
            fontSize: "12px",
            background: "rgba(56, 217, 255, 0.12)",
            color: "var(--cyan)",
            padding: "4px 12px",
            borderRadius: "16px",
            fontWeight: 700,
          }}
        >
          Executive Decision Simulations
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: "16px",
        }}
      >
        {/* Missions Selection Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {missionCapstones.map((m: MissionCapstone) => {
            const isSelected = m.id === selectedMissionId;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedMissionId(m.id);
                  setCompletedStepNumbers([]);
                  setGeneratedReport(null);
                }}
                style={{
                  background: isSelected
                    ? "rgba(56, 217, 255, 0.1)"
                    : "var(--panel, #0d1117)",
                  border: isSelected
                    ? "1px solid var(--cyan)"
                    : "1px solid var(--border)",
                  borderRadius: "10px",
                  padding: "14px",
                  textAlign: "left",
                  cursor: "pointer",
                  color: "var(--text)",
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    color: "var(--cyan)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  {m.category} • {m.difficulty}
                </span>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    marginTop: "4px",
                    marginBottom: "4px",
                  }}
                >
                  {m.title}
                </div>
                <div style={{ fontSize: "11px", color: "var(--muted)" }}>
                  {m.subtitle}
                </div>
              </button>
            );
          })}
        </div>

        {/* Mission Content */}
        <div
          style={{
            background: "var(--panel, #0d1117)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            padding: "20px",
          }}
        >
          <div
            style={{
              marginBottom: "16px",
              borderBottom: "1px solid var(--border)",
              paddingBottom: "12px",
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "var(--cyan)",
                margin: "0 0 6px 0",
              }}
            >
              {activeMission.title}
            </h3>
            <p style={{ fontSize: "13px", color: "var(--muted)", margin: 0 }}>
              {activeMission.description}
            </p>
          </div>

          {/* Mission Steps Timeline */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              marginBottom: "20px",
            }}
          >
            {activeMission.steps.map((stg: MissionStep) => {
              const isDone = completedStepNumbers.includes(stg.stepNumber);
              return (
                <div
                  key={stg.stepNumber}
                  style={{
                    background: "var(--panel)",
                    border: isDone
                      ? "1px solid rgba(34, 197, 94, 0.3)"
                      : "1px solid var(--border)",
                    borderRadius: "8px",
                    padding: "14px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "var(--cyan)",
                      }}
                    >
                      Step {stg.stepNumber}: {stg.title}
                    </span>
                    {isDone && <CheckCircle2 size={16} color="#22c55e" />}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--text)",
                      marginBottom: "8px",
                    }}
                  >
                    {stg.objective}
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    {onOpenStepInPlayground && (
                      <button
                        onClick={() => onOpenStepInPlayground(stg.starterQuery)}
                        className="primary-button"
                        style={{ padding: "4px 10px", fontSize: "11px" }}
                      >
                        <Play size={12} /> Open Step in Playground
                      </button>
                    )}
                    <button
                      onClick={() => handleCompleteStep(stg.stepNumber)}
                      className="secondary-button"
                      style={{ padding: "4px 10px", fontSize: "11px" }}
                    >
                      {isDone ? "Step Completed ✓" : "Mark Step Solved"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Generate Executive Report Button */}
          {completedStepNumbers.length === activeMission.steps.length && (
            <div
              style={{
                background: "rgba(34, 197, 94, 0.08)",
                border: "1px solid rgba(34, 197, 94, 0.2)",
                borderRadius: "8px",
                padding: "16px",
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
                <Award size={18} color="#22c55e" />
                <strong style={{ fontSize: "14px", color: "#22c55e" }}>
                  Mission Objectives Completed!
                </strong>
              </div>
              <button
                onClick={handleGenerateReport}
                className="primary-button"
                style={{
                  padding: "6px 14px",
                  fontSize: "12px",
                  marginBottom: "10px",
                }}
              >
                <FileText size={14} /> Generate Analyst Executive Report
              </button>

              {generatedReport && (
                <>
                  <pre
                    style={{
                      background: "var(--panel)",
                      padding: "12px",
                      borderRadius: "6px",
                      color: "var(--cyan)",
                      fontSize: "12px",
                      fontFamily: "monospace",
                      whiteSpace: "pre-wrap",
                      margin: "0 0 10px 0",
                    }}
                  >
                    {generatedReport}
                  </pre>
                  <button
                    onClick={handleExportReport}
                    className="secondary-button"
                    style={{ padding: "6px 14px", fontSize: "12px" }}
                  >
                    <DownloadCloud size={14} style={{ marginRight: "6px" }} />
                    Download Report (.md)
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MissionCapstoneView;
