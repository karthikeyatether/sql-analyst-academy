import React, { useMemo } from "react";
import { Calendar, Flame } from "lucide-react";

interface StudyActivityHeatmapProps {
  minutesStudied: number;
  problemsSolvedCount: number;
  queryRunsCount: number;
}

export const StudyActivityHeatmap: React.FC<StudyActivityHeatmapProps> = ({
  minutesStudied,
  problemsSolvedCount,
  queryRunsCount,
}) => {
  // Generate a mock 52-week activity grid with deterministic levels based on progress
  const weeks = useMemo(() => {
    const grid: number[][] = [];
    const totalActivity = problemsSolvedCount * 3 + queryRunsCount + Math.floor(minutesStudied / 10);

    for (let w = 0; w < 52; w++) {
      const days: number[] = [];
      for (let d = 0; d < 7; d++) {
        // Higher activity in recent weeks
        const recentBonus = w > 44 ? 2 : w > 36 ? 1 : 0;
        const seed = (w * 7 + d * 13 + totalActivity) % 10;
        let level = 0;
        if (seed > 7) level = 3 + recentBonus;
        else if (seed > 4) level = 2 + recentBonus;
        else if (seed > 2) level = 1;
        days.push(Math.min(4, level));
      }
      grid.push(days);
    }
    return grid;
  }, [minutesStudied, problemsSolvedCount, queryRunsCount]);

  const levelColors = [
    "var(--panel2)",
    "color-mix(in srgb, var(--cyan) 30%, transparent)",
    "color-mix(in srgb, var(--cyan) 60%, transparent)",
    "var(--cyan)",
    "var(--emerald)",
  ];

  return (
    <div
      className="surface-panel premium-panel"
      style={{
        padding: "20px",
        borderRadius: "12px",
        background: "var(--panel)",
        border: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "14px",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Calendar size={16} style={{ color: "var(--cyan)" }} />
          <strong
            style={{
              fontSize: "13px",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "var(--text-secondary)",
            }}
          >
            365-Day Study Activity & Consistency
          </strong>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "var(--muted)" }}>
          <span>Less</span>
          {levelColors.map((c, i) => (
            <div
              key={i}
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "2px",
                background: c,
              }}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div style={{ overflowX: "auto", paddingBottom: "4px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(52, 1fr)",
            gap: "3px",
            minWidth: "680px",
          }}
        >
          {weeks.map((days, wIdx) => (
            <div key={wIdx} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              {days.map((lvl, dIdx) => (
                <div
                  key={dIdx}
                  title={`Activity Level ${lvl}`}
                  style={{
                    width: "100%",
                    aspectRatio: "1/1",
                    borderRadius: "2px",
                    background: levelColors[lvl],
                    transition: "transform 0.1s ease",
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudyActivityHeatmap;
