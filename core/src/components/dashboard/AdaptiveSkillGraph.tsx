import React from "react";
import {
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Zap,
  Target,
} from "lucide-react";

type SkillNode = {
  id: string;
  name: string;
  category: string;
  prerequisites: string[];
  masteryPct: number;
  solvedCount: number;
  totalCount: number;
  recommendedDrillId?: string;
  recommendedDrillTitle?: string;
};

interface AdaptiveSkillGraphProps {
  completedProblems?: string[];
  completedPuzzles?: string[];
  onSelectDrill?: (problemId: string) => void;
}

const AdaptiveSkillGraph: React.FC<AdaptiveSkillGraphProps> = ({
  completedProblems = [],
  completedPuzzles = [],
  onSelectDrill,
}) => {
  const solvedCount = completedProblems.length + completedPuzzles.length;

  const skillGraph: SkillNode[] = [
    {
      id: "filtering",
      name: "Basic Filtering & Logic",
      category: "Foundations",
      prerequisites: [],
      masteryPct: Math.min(
        100,
        Math.round((Math.min(solvedCount, 25) / 25) * 100),
      ),
      solvedCount: Math.min(solvedCount, 25),
      totalCount: 25,
      recommendedDrillId: "p1",
      recommendedDrillTitle: "WHERE Clause & Boolean Operator Alignment",
    },
    {
      id: "aggregations",
      name: "Aggregations & GROUP BY",
      category: "Analytics",
      prerequisites: ["filtering"],
      masteryPct: Math.min(
        100,
        Math.round((Math.min(Math.max(0, solvedCount - 15), 35) / 35) * 100),
      ),
      solvedCount: Math.min(Math.max(0, solvedCount - 15), 35),
      totalCount: 35,
      recommendedDrillId: "p12",
      recommendedDrillTitle: "HAVING vs WHERE Filter Thresholds",
    },
    {
      id: "joins",
      name: "Relational Joins",
      category: "Multi-Table Data",
      prerequisites: ["filtering"],
      masteryPct: Math.min(
        100,
        Math.round((Math.min(Math.max(0, solvedCount - 30), 40) / 40) * 100),
      ),
      solvedCount: Math.min(Math.max(0, solvedCount - 30), 40),
      totalCount: 40,
      recommendedDrillId: "p45",
      recommendedDrillTitle: "Left Join Null preservation & Cardinality Safety",
    },
    {
      id: "subqueries_ctes",
      name: "Subqueries & CTEs",
      category: "Advanced Querying",
      prerequisites: ["aggregations", "joins"],
      masteryPct: Math.min(
        100,
        Math.round((Math.min(Math.max(0, solvedCount - 50), 30) / 30) * 100),
      ),
      solvedCount: Math.min(Math.max(0, solvedCount - 50), 30),
      totalCount: 30,
      recommendedDrillId: "p80",
      recommendedDrillTitle: "WITH Clause Modular Execution",
    },
    {
      id: "window_functions",
      name: "Window Functions",
      category: "Advanced Analytics",
      prerequisites: ["subqueries_ctes"],
      masteryPct: Math.min(
        100,
        Math.round((Math.min(Math.max(0, solvedCount - 70), 25) / 25) * 100),
      ),
      solvedCount: Math.min(Math.max(0, solvedCount - 70), 25),
      totalCount: 25,
      recommendedDrillId: "p110",
      recommendedDrillTitle: "OVER(PARTITION BY ... ORDER BY ...) Frame Bounds",
    },
    {
      id: "performance",
      name: "Query Tuning & Indexing",
      category: "Production Optimization",
      prerequisites: ["window_functions"],
      masteryPct: Math.min(
        100,
        Math.round((Math.min(Math.max(0, solvedCount - 90), 20) / 20) * 100),
      ),
      solvedCount: Math.min(Math.max(0, solvedCount - 90), 20),
      totalCount: 20,
      recommendedDrillId: "p130",
      recommendedDrillTitle: "Index Scan vs Index Seek Optimization",
    },
  ];

  const weakestSkill = [...skillGraph].sort(
    (a, b) => a.masteryPct - b.masteryPct,
  )[0];

  return (
    <div
      className="adaptive-skill-graph surface-panel"
      style={{
        padding: "1.25rem 1.5rem",
        borderRadius: "12px",
        border: "1px solid var(--border)",
        background: "var(--bg2, #0d1117)",
        marginBottom: "16px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "14px",
          borderBottom: "1px solid var(--border)",
          paddingBottom: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Target size={18} color="var(--cyan)" />
          <span
            style={{ fontSize: "14px", fontWeight: 700, color: "var(--cyan)" }}
          >
            ADAPTIVE SQL SKILL GRAPH & REPAIR LOOP
          </span>
        </div>
        <span
          style={{
            fontSize: "11px",
            background: "rgba(56, 217, 255, 0.1)",
            color: "var(--cyan)",
            padding: "2px 8px",
            borderRadius: "12px",
            fontWeight: 600,
          }}
        >
          Spaced Repetition & Gap Analysis
        </span>
      </div>

      {/* Recommended Repair Drill Banner */}
      {weakestSkill && weakestSkill.masteryPct < 100 && (
        <div
          style={{
            background: "var(--cyan-glow)",
            border: "1px solid var(--cyan)",
            borderRadius: "8px",
            padding: "10px 14px",
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Zap size={18} color="var(--cyan)" />
            <div>
              <div
                style={{ fontSize: "12px", fontWeight: 700, color: "var(--cyan)" }}
              >
                RECOMMENDED 3-MINUTE REPAIR DRILL:{" "}
                {weakestSkill.name.toUpperCase()} ({weakestSkill.masteryPct}%
                Mastery)
              </div>
              <div style={{ fontSize: "12px", color: "var(--text)" }}>
                {weakestSkill.recommendedDrillTitle}
              </div>
            </div>
          </div>
          {onSelectDrill && weakestSkill.recommendedDrillId && (
            <button
              onClick={() => onSelectDrill(weakestSkill.recommendedDrillId!)}
              className="primary-button"
              style={{ padding: "6px 12px", fontSize: "12px" }}
            >
              Start Drill <ArrowRight size={13} />
            </button>
          )}
        </div>
      )}

      {/* Skill Nodes Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "12px",
        }}
      >
        {skillGraph.map((node) => {
          const isMastered = node.masteryPct >= 80;
          return (
            <div
              key={node.id}
              style={{
                background: "var(--panel)",
                border: isMastered
                  ? "1px solid rgba(34, 197, 94, 0.3)"
                  : "1px solid var(--border)",
                borderRadius: "8px",
                padding: "12px",
                position: "relative",
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
                    fontSize: "10px",
                    color: "var(--muted)",
                    textTransform: "uppercase",
                    fontWeight: 700,
                  }}
                >
                  {node.category}
                </span>
                {isMastered ? (
                  <CheckCircle size={14} color="var(--emerald)" />
                ) : (
                  <AlertTriangle size={14} color="var(--amber)" />
                )}
              </div>

              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "var(--text)",
                  marginBottom: "8px",
                }}
              >
                {node.name}
              </div>

              {/* Mastery Progress Bar */}
              <div
                style={{
                  height: "6px",
                  background: "var(--border)",
                  borderRadius: "3px",
                  overflow: "hidden",
                  marginBottom: "6px",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${node.masteryPct}%`,
                    background: isMastered ? "var(--emerald)" : "var(--cyan)",
                    transition: "width 400ms ease",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "11px",
                  color: "var(--muted)",
                }}
              >
                <span>
                  {node.solvedCount} / {node.totalCount} Solved
                </span>
                <strong
                  style={{ color: isMastered ? "var(--emerald)" : "var(--cyan)" }}
                >
                  {node.masteryPct}%
                </strong>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdaptiveSkillGraph;
