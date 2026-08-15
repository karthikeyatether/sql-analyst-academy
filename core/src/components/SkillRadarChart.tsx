import React, { useMemo } from "react";
import { Radar, Award } from "lucide-react";

interface SkillRadarChartProps {
  completedModulesCount: number;
  solvedProblemsCount: number;
  solvedPuzzlesCount: number;
  totalXP: number;
}

export const SkillRadarChart: React.FC<SkillRadarChartProps> = ({
  completedModulesCount,
  solvedProblemsCount,
  solvedPuzzlesCount,
  totalXP,
}) => {
  const skills = useMemo(() => {
    const modRatio = Math.min(1, completedModulesCount / 43);
    const probRatio = Math.min(1, solvedProblemsCount / 142);
    const puzRatio = Math.min(1, solvedPuzzlesCount / 60);

    return [
      { name: "Window Functions", value: Math.min(100, Math.round(probRatio * 90 + 10)) },
      { name: "Complex Joins", value: Math.min(100, Math.round(probRatio * 85 + 15)) },
      { name: "Aggregations", value: Math.min(100, Math.round(modRatio * 95 + 5)) },
      { name: "Query Optimization", value: Math.min(100, Math.round(puzRatio * 90 + 10)) },
      { name: "Data Modeling", value: Math.min(100, Math.round(modRatio * 80 + 20)) },
      { name: "Business Analytics", value: Math.min(100, Math.round((probRatio + modRatio) * 50)) },
    ];
  }, [completedModulesCount, solvedProblemsCount, solvedPuzzlesCount]);

  // Compute SVG Polygon points
  const size = 260;
  const center = size / 2;
  const radius = center - 40;
  const numAxes = skills.length;

  const getCoordinates = (index: number, valPercent: number) => {
    const angle = (Math.PI * 2 / numAxes) * index - Math.PI / 2;
    const r = (valPercent / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const polygonPoints = skills
    .map((s, i) => {
      const { x, y } = getCoordinates(i, s.value);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div
      className="surface-panel premium-panel"
      style={{
        padding: "20px",
        borderRadius: "12px",
        background: "var(--panel)",
        border: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Radar size={16} style={{ color: "var(--violet)" }} />
          <strong
            style={{
              fontSize: "13px",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "var(--text-secondary)",
            }}
          >
            6-Axis Analyst Competency Radar
          </strong>
        </div>
      </div>

      <svg width={size} height={size} style={{ overflow: "visible" }}>
        {/* Background Grids */}
        {[0.25, 0.5, 0.75, 1].map((level, lIdx) => {
          const gridPoints = skills
            .map((_, i) => {
              const { x, y } = getCoordinates(i, level * 100);
              return `${x.toFixed(1)},${y.toFixed(1)}`;
            })
            .join(" ");
          return (
            <polygon
              key={lIdx}
              points={gridPoints}
              fill="none"
              stroke="var(--border)"
              strokeWidth="1"
              strokeDasharray={level < 1 ? "3 3" : undefined}
            />
          );
        })}

        {/* Axis Lines */}
        {skills.map((s, i) => {
          const { x, y } = getCoordinates(i, 100);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="var(--border)"
              strokeWidth="1"
            />
          );
        })}

        {/* Competency Fill Polygon */}
        <polygon
          points={polygonPoints}
          fill="color-mix(in srgb, var(--cyan) 25%, transparent)"
          stroke="var(--cyan)"
          strokeWidth="2"
        />

        {/* Value Points */}
        {skills.map((s, i) => {
          const { x, y } = getCoordinates(i, s.value);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4"
              fill="var(--cyan)"
              stroke="var(--bg)"
              strokeWidth="2"
            />
          );
        })}

        {/* Axis Labels */}
        {skills.map((s, i) => {
          const { x, y } = getCoordinates(i, 118);
          return (
            <text
              key={i}
              x={x}
              y={y}
              fontSize="9"
              fontWeight="700"
              fill="var(--text-secondary)"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {s.name} ({s.value}%)
            </text>
          );
        })}
      </svg>
    </div>
  );
};

export default SkillRadarChart;
