import React, { useState } from "react";
import { missionCapstones } from "../../data/missions";
import {
  Target,
  CheckCircle2,
  Play,
  Award,
  FileText,
  ArrowLeft,
} from "lucide-react";

interface MissionCapstoneViewProps {
  onOpenStepInPlayground?: (query: string) => void;
  onBackToRoadmap?: () => void;
}

export const MissionCapstoneView: React.FC<MissionCapstoneViewProps> = ({
  onOpenStepInPlayground,
  onBackToRoadmap,
}) => {
  const [selectedMissionId, setSelectedMissionId] = useState<string>(
    missionCapstones[0]?.id || "m1",
  );
  const [completedStepNumbers, setCompletedStepNumbers] = useState<number[]>(
    [],
  );
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);

  const activeMission =
    missionCapstones.find((m) => m.id === selectedMissionId) ||
    missionCapstones[0];

  const handleCompleteStep = (stepNum: number) => {
    if (!completedStepNumbers.includes(stepNum)) {
      setCompletedStepNumbers((prev) => [...prev, stepNum]);
    }
  };

  const handleGenerateReport = () => {
    if (activeMission) {
      setGeneratedReport(activeMission.executiveReportTemplate);
    }
  };

  if (!activeMission) return null;

  return (
    <div
      className="view-content mission-capstone-view"
      style={{
        padding: "24px",
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
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {onBackToRoadmap && (
            <button
              onClick={onBackToRoadmap}
              className="secondary-button"
              style={{ padding: "6px 12px", fontSize: "12px" }}
            >
              <ArrowLeft size={14} /> Back to Roadmap
            </button>
          )}
          <Target size={24} color="var(--cyan)" />
          <h2
            style={{
              fontSize: "20px",
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
            padding: "4px 14px",
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
          gridTemplateColumns: "300px 1fr",
          gap: "20px",
        }}
      >
        {/* Missions Selection Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {missionCapstones.map((m) => {
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
                    ? "var(--cyan-glow, rgba(56, 217, 255, 0.1))"
                    : "var(--panel, #0d1117)",
                  border: isSelected
                    ? "1px solid var(--cyan)"
                    : "1px solid var(--border)",
                  borderRadius: "10px",
                  padding: "16px",
                  textAlign: "left",
                  cursor: "pointer",
                  color: "var(--text)",
                  transition: "all 0.15s ease",
                }}
              >
                <span
                  style={{
                    fontSize: "10.5px",
                    color: "var(--cyan)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {m.category} • {m.difficulty}
                </span>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    marginTop: "6px",
                    marginBottom: "4px",
                  }}
                >
                  {m.title}
                </div>
                <div style={{ fontSize: "12px", color: "var(--muted)", lineHeight: "1.4" }}>
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
            padding: "24px",
          }}
        >
          <div
            style={{
              marginBottom: "20px",
              borderBottom: "1px solid var(--border)",
              paddingBottom: "16px",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "var(--cyan)",
                margin: "0 0 8px 0",
              }}
            >
              {activeMission.title}
            </h3>
            <p style={{ fontSize: "13px", color: "var(--muted)", margin: 0, lineHeight: "1.5" }}>
              {activeMission.description}
            </p>
          </div>

          {/* Mission Steps Timeline */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            {activeMission.steps.map((stg) => {
              const isDone = completedStepNumbers.includes(stg.stepNumber);
              return (
                <div
                  key={stg.stepNumber}
                  style={{
                    background: "rgba(255, 255, 255, 0.02)",
                    border: isDone
                      ? "1px solid rgba(34, 197, 94, 0.4)"
                      : "1px solid var(--border)",
                    borderRadius: "8px",
                    padding: "16px",
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
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "var(--cyan)",
                      }}
                    >
                      Step {stg.stepNumber}: {stg.title}
                    </span>
                    {isDone && <CheckCircle2 size={18} color="#22c55e" />}
                  </div>
                  <div
                    style={{
                      fontSize: "12.5px",
                      color: "var(--text)",
                      marginBottom: "12px",
                      lineHeight: "1.4",
                    }}
                  >
                    {stg.objective}
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    {onOpenStepInPlayground && (
                      <button
                        onClick={() => onOpenStepInPlayground(stg.starterQuery)}
                        className="primary-button"
                        style={{ padding: "5px 12px", fontSize: "11.5px" }}
                      >
                        <Play size={12} /> Open Step in Playground
                      </button>
                    )}
                    <button
                      onClick={() => handleCompleteStep(stg.stepNumber)}
                      className="secondary-button"
                      style={{ padding: "5px 12px", fontSize: "11.5px" }}
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
                border: "1px solid rgba(34, 197, 94, 0.25)",
                borderRadius: "8px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "10px",
                }}
              >
                <Award size={20} color="#22c55e" />
                <strong style={{ fontSize: "15px", color: "#22c55e" }}>
                  Mission Objectives Completed!
                </strong>
              </div>
              <button
                onClick={handleGenerateReport}
                className="primary-button"
                style={{
                  padding: "7px 16px",
                  fontSize: "12px",
                  marginBottom: "12px",
                }}
              >
                <FileText size={14} /> Generate Analyst Executive Report
              </button>

              {generatedReport && (
                <pre
                  style={{
                    background: "#000",
                    padding: "14px",
                    borderRadius: "6px",
                    color: "var(--cyan)",
                    fontSize: "12px",
                    fontFamily: "monospace",
                    whiteSpace: "pre-wrap",
                    margin: 0,
                    border: "1px solid var(--border)",
                  }}
                >
                  {generatedReport}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MissionCapstoneView;
