import type { SqlPuzzle } from "../../types";
import React from "react";
import { BookOpen, Code2, CheckCircle2, Circle, Timer } from "lucide-react";
import type {
  RoadmapModule,
  PracticeProblem,
  RoadmapDay,
} from "../../data/curriculum";
import type { ViewId, PlaygroundMode } from "../../types";

interface RoadmapViewProps {
  progress: {
    completedModules: number[];
    solvedProblems: string[];
    solvedPuzzles: string[];
    completedDays: number[];
    mockScores?: Record<string, number>;
  };
  learningRoadmap: RoadmapDay[];
  roadmapModules: RoadmapModule[];
  setSelectedDayId: (dayId: number) => void;
  setActiveView: (view: ViewId) => void;
  toggleDayComplete: (day: number) => void;
  selectModule: (m: RoadmapModule) => void;
  openInPlayground: (p: PracticeProblem) => void;
  debugPuzzles: SqlPuzzle[];
  setActivePuzzleId: (id: string) => void;
  setPlaygroundMode: (mode: "practice" | "puzzle" | "free") => void;
  getSavedPuzzleQuery: (p: SqlPuzzle) => string;
  updateEditorQuery: (
    newVal: string,
    pMode?: PlaygroundMode,
    targetId?: string,
    moveCursorToEnd?: boolean,
  ) => void;
  stopAutoTyping: () => void;
}

function RoadmapView({
  progress,
  learningRoadmap,
  roadmapModules,
  setSelectedDayId,
  setActiveView,
  toggleDayComplete,
  selectModule,
  openInPlayground,
  debugPuzzles,
  setActivePuzzleId,
  setPlaygroundMode,
  getSavedPuzzleQuery,
  updateEditorQuery,
  stopAutoTyping,
}: RoadmapViewProps) {
  const days = progress.completedDays || [];
  const totalCompleted = days.length;
  const progressPct = Math.round(
    (totalCompleted / learningRoadmap.length) * 100,
  );

  return (
    <div className="view-content roadmap-timeline-view">
      <div
        className="dash-hero roadmap-hero"
        style={{
          padding: "2rem 3rem",
          background: "var(--brand-surface)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <h1 style={{ margin: "0 0 0.5rem 0", fontSize: "2rem" }}>
          {learningRoadmap.length}-Day SQL Roadmap
        </h1>
        <p style={{ margin: 0, opacity: 0.8 }}>
          Follow this step-by-step guide to become job-ready in{" "}
          {learningRoadmap.length} days. You are free to move at your own pace.
        </p>
        <div
          style={{
            marginTop: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div
            style={{
              flex: 1,
              background: "var(--bg)",
              height: 8,
              borderRadius: 4,
              overflow: "hidden",
              border: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                width: `${progressPct}%`,
                background: "var(--primary)",
                height: "100%",
                transition: "width 0.3s ease",
              }}
            />
          </div>
          <span style={{ fontSize: "0.9rem", fontWeight: "bold" }}>
            {progressPct}% Complete
          </span>
        </div>
      </div>

      <div
        style={{
          padding: "2rem 3rem",
          maxWidth: 900,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        {learningRoadmap.map((day) => {
          const isDone = (progress.completedDays || []).includes(day.day);
          const dayModules = day.modules
            .map((id) => roadmapModules.find((m) => m.id === id))
            .filter((m) => m !== undefined);
          const dayProblems = dayModules.flatMap((m) => m!.problems);
          const totalDayProblems = dayProblems.length;
          const solvedDayProblems = dayProblems.filter((p) =>
            progress.solvedProblems.includes(p.id),
          ).length;
          const dayPuzzles = debugPuzzles.filter((pz) => pz.dayId === day.day);
          const totalDayItems =
            dayProblems.length +
            dayPuzzles.length +
            (day.mockInterview && day.mockInterview.company ? 1 : 0);
          const solvedPuzzlesCount = dayPuzzles.filter((pz) =>
            (progress.solvedPuzzles || []).includes(pz.id),
          ).length;
          const mockScore =
            day.mockInterview && day.mockInterview.company
              ? (progress.mockScores?.[day.mockInterview.company] ?? 0)
              : 0;
          const solvedMockCount = mockScore > 0 ? 1 : 0;
          const solvedDayItems =
            solvedDayProblems + solvedPuzzlesCount + solvedMockCount;
          const problemProgressPct =
            totalDayItems > 0
              ? Math.round((solvedDayItems / totalDayItems) * 100)
              : 100;

          return (
            <div
              key={day.day}
              className={`roadmap-day-card ${isDone ? "done" : ""}`}
              onClick={(e) => {
                if (
                  (e.target as HTMLElement).closest("button") ||
                  (e.target as HTMLElement).closest("a")
                )
                  return;
                setSelectedDayId(day.day);
                setActiveView("day-details");
              }}
              style={{
                background: "var(--panel)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "1.5rem",
                display: "flex",
                gap: "1.5rem",
                position: "relative",
                opacity: isDone ? 0.85 : 1,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isDone ? "var(--emerald)" : "var(--bg)",
                  color: isDone ? "var(--hex-color-040d12)" : "inherit",
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontSize: "0.8rem",
                    opacity: 0.8,
                    textTransform: "uppercase",
                  }}
                >
                  Day
                </span>
                <span style={{ fontSize: "1.5rem", fontWeight: 900 }}>
                  {day.day}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "0.5rem",
                  }}
                >
                  <div>
                    <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.2rem" }}>
                      {day.title}
                    </h3>
                    <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.7 }}>
                      Focus: {day.focus}
                    </p>

                    {(() => {
                      const uniqueConcepts = Array.from(
                        new Set(dayProblems.flatMap((p) => p.concepts)),
                      );
                      const estDurationMin =
                        dayModules.length * 15 +
                        totalDayProblems * 10 +
                        dayPuzzles.length * 10 +
                        (day.mockInterview && day.mockInterview.company
                          ? 30
                          : 0);
                      const statusLabel = isDone
                        ? "Completed"
                        : solvedDayItems > 0
                          ? "In Progress"
                          : "Not Started";
                      const statusClass = isDone
                        ? "done"
                        : solvedDayItems > 0
                          ? "progress"
                          : "todo";

                      return (
                        <div
                          className="day-stats-row"
                          style={{
                            display: "flex",
                            gap: "12px",
                            alignItems: "center",
                            marginTop: "6px",
                            fontSize: "11px",
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            className={`status-badge ${statusClass}`}
                            style={{
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontWeight: 700,
                              fontSize: "10px",
                              textTransform: "uppercase",
                              background:
                                statusClass === "done"
                                  ? "rgba(48,230,149,0.1)"
                                  : statusClass === "progress"
                                    ? "rgba(56,217,255,0.1)"
                                    : "rgba(255,255,255,0.03)",
                              color:
                                statusClass === "done"
                                  ? "var(--emerald)"
                                  : statusClass === "progress"
                                    ? "var(--cyan)"
                                    : "var(--muted)",
                              border:
                                "1px solid " +
                                (statusClass === "done"
                                  ? "rgba(48,230,149,0.15)"
                                  : statusClass === "progress"
                                    ? "rgba(56,217,255,0.2)"
                                    : "var(--border)"),
                            }}
                          >
                            {statusLabel}
                          </span>
                          <span style={{ color: "var(--muted)" }}>
                            ⏱️ {estDurationMin} mins
                          </span>
                          {uniqueConcepts.length > 0 ? (
                            <span style={{ color: "var(--muted)" }}>
                              🧠 {uniqueConcepts.length} concepts
                            </span>
                          ) : null}
                          <span style={{ color: "var(--muted)" }}>
                            📝 {totalDayItems}{" "}
                            {totalDayItems === 1 ? "exercise" : "exercises"}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                  <button
                    className={`icon-button ${isDone ? "primary" : ""}`}
                    onClick={() => toggleDayComplete(day.day)}
                    title={isDone ? "Mark incomplete" : "Mark as done"}
                  >
                    {isDone ? (
                      <CheckCircle2 size={24} color="#30e695" />
                    ) : (
                      <Circle size={24} />
                    )}
                  </button>
                </div>

                {totalDayItems > 0 && (
                  <div
                    style={{
                      marginTop: "0.75rem",
                      marginBottom: "0.5rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      fontSize: "0.85rem",
                    }}
                  >
                    <span style={{ color: "var(--muted)", width: "130px" }}>
                      Day Progress:
                    </span>
                    <div
                      style={{
                        flex: 1,
                        background: "var(--bg)",
                        height: 6,
                        borderRadius: 3,
                        overflow: "hidden",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div
                        style={{
                          width: `${problemProgressPct}%`,
                          background:
                            problemProgressPct === 100
                              ? "var(--emerald)"
                              : "var(--cyan)",
                          height: "100%",
                          transition: "width 0.3s",
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontWeight: "bold",
                        color:
                          problemProgressPct === 100
                            ? "var(--emerald)"
                            : "inherit",
                      }}
                    >
                      {solvedDayItems} / {totalDayItems}
                    </span>
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    marginTop: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  {dayModules.map((mod) => (
                    <button
                      key={mod!.id}
                      className="secondary-button compact"
                      onClick={() => {
                        selectModule(mod!);
                        setActiveView("modules");
                      }}
                      style={
                        mod!.isHighWeight
                          ? {
                              borderColor: "rgba(56, 217, 255, 0.3)",
                              background: "transparent",
                            }
                          : undefined
                      }
                    >
                      <BookOpen
                        size={14}
                        style={
                          mod!.isHighWeight
                            ? { color: "var(--cyan)" }
                            : undefined
                        }
                      />{" "}
                      Read: {mod!.title}{" "}
                      {mod!.isHighWeight && (
                        <span
                          style={{
                            color: "var(--cyan)",
                            marginLeft: "4px",
                            fontWeight: "bold",
                          }}
                        >
                          ⭐
                        </span>
                      )}
                    </button>
                  ))}
                  {dayProblems.map((p) => {
                    const isHigh = roadmapModules.find(
                      (m) => m.id === p.moduleId,
                    )?.isHighWeight;
                    return (
                      <button
                        key={p.id}
                        className="secondary-button compact outline"
                        onClick={() => openInPlayground(p)}
                        style={
                          isHigh
                            ? {
                                borderColor: "rgba(56, 217, 255, 0.3)",
                                background: "transparent",
                              }
                            : undefined
                        }
                        title={`Solve: ${p.title}`}
                      >
                        <Code2
                          size={14}
                          style={isHigh ? { color: "var(--cyan)" } : undefined}
                        />{" "}
                        Solve: {p.title}{" "}
                        {isHigh && (
                          <span
                            style={{
                              color: "var(--cyan)",
                              marginLeft: "4px",
                              fontWeight: "bold",
                            }}
                          >
                            ⭐
                          </span>
                        )}
                      </button>
                    );
                  })}
                  {debugPuzzles
                    .filter((p) => p.dayId === day.day)
                    .map((puzzle) => (
                      <button
                        key={puzzle.id}
                        className="secondary-button compact outline"
                        onClick={() => {
                          stopAutoTyping();
                          setActivePuzzleId(puzzle.id);
                          setPlaygroundMode("puzzle");
                          const saved = getSavedPuzzleQuery(puzzle);
                          updateEditorQuery(saved, "puzzle", puzzle.id);
                          setActiveView("playground");
                        }}
                        title={`Debug: ${puzzle.title}`}
                      >
                        🧩 Debug: {puzzle.title}
                      </button>
                    ))}
                  {day.mockInterview && (
                    <button
                      className="primary-button compact"
                      onClick={() => {
                        setActiveView("mocks");
                      }}
                    >
                      <Timer size={14} /> Mock: {day.mockInterview.company}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default React.memo(RoadmapView);
