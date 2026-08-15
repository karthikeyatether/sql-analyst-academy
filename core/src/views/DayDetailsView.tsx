import React from "react";
import { formatStudyTime } from "../utils/formatters";
import { CheckCircle2, Sparkles } from "lucide-react";
import type {
  RoadmapModule,
  PracticeProblem,
  RoadmapDay,
  Difficulty,
} from "../data/curriculum";
import type { SqlPuzzle, QueryResult } from "../types";
import type { ViewId, PlaygroundMode, RightTab } from "../types";

interface DayDetailsViewProps {
  selectedDayId: number;
  progress: {
    completedModules: number[];
    solvedProblems: string[];
    solvedPuzzles: string[];
    completedDays: number[];
    completedChecklistItems: string[];
    mockScores: Record<string, number>;
  };
  learningRoadmap: RoadmapDay[];
  roadmapModules: RoadmapModule[];
  debugPuzzles: SqlPuzzle[];
  setActiveView: (view: ViewId) => void;
  setSelectedDayId: (id: number) => void;
  toggleDayComplete: (day: number) => void;
  toggleChecklistItem: (id: string) => void;
  selectModule: (m: RoadmapModule) => void;
  openInPlayground: (p: PracticeProblem) => void;
  markProblemSolved: (p: PracticeProblem, quality?: number) => void;
  markPuzzleSolved: (p: SqlPuzzle) => void;
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
  setActiveRightTab?: (tab: RightTab) => void;
  setQueryResult: React.Dispatch<React.SetStateAction<QueryResult>>;
  setExpectedResult: (res: QueryResult | null) => void;
}

function DayDetailsView({
  selectedDayId,
  progress,
  learningRoadmap,
  roadmapModules,
  debugPuzzles,
  setActiveView,
  setSelectedDayId,
  toggleDayComplete,
  toggleChecklistItem,
  selectModule,
  openInPlayground,
  markProblemSolved,
  markPuzzleSolved,
  setActivePuzzleId,
  setPlaygroundMode,
  getSavedPuzzleQuery,
  updateEditorQuery,
  stopAutoTyping,
  setActiveRightTab,
  setQueryResult,
  setExpectedResult,
}: DayDetailsViewProps) {
  const day = learningRoadmap.find((d) => d.day === selectedDayId);
  if (!day) return <div className="p-8">Day not found</div>;

  const isDone = (progress.completedDays || []).includes(day.day);
  const dayModules = day.modules
    .map((id) => roadmapModules.find((m) => m.id === id))
    .filter((m) => m !== undefined);
  const dayProblemsRaw = dayModules.flatMap((m) => m!.problems);
  const diffOrder: Record<string, number> = {
    easy: 1,
    beginner: 1,
    medium: 2,
    intermediate: 2,
    hard: 3,
    advanced: 3,
    expert: 4,
  };
  const dayProblems = [...dayProblemsRaw].sort((a, b) => {
    const orderA = diffOrder[a.difficulty?.toLowerCase()] || 2;
    const orderB = diffOrder[b.difficulty?.toLowerCase()] || 2;
    return orderA - orderB;
  });
  const totalDayProblems = dayProblems.length;
  const solvedDayProblems = dayProblems.filter((p) =>
    progress.solvedProblems.includes(p.id),
  ).length;
  const problemProgressPct =
    totalDayProblems > 0
      ? Math.round((solvedDayProblems / totalDayProblems) * 100)
      : 100;

  const dayPuzzles = debugPuzzles.filter((p) => p.dayId === day.day);
  const totalDayPuzzles = dayPuzzles.length;
  const solvedDayPuzzles = dayPuzzles.filter((p) =>
    (progress.solvedPuzzles || []).includes(p.id),
  ).length;

  const classForDiff = (d: string) => {
    const lower = (d || "").toLowerCase();
    if (lower.includes("expert")) return "expert";
    if (lower.includes("advanced") || lower.includes("hard")) return "hard";
    if (lower.includes("intermediate") || lower.includes("medium"))
      return "medium";
    return "easy";
  };

  return (
    <div
      className="view-content day-details-view"
      style={{
        padding: "1.5rem 1.5rem",
        maxWidth: "900px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}
    >
      {/* Breadcrumbs / Header back button */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <button
          className="secondary-button compact"
          onClick={() => setActiveView("roadmap")}
        >
          &larr; Back to Roadmap
        </button>
        <span style={{ color: "var(--muted)" }}>/</span>
        <span style={{ fontSize: "13px", color: "var(--muted)" }}>
          Day {day.day} Details
        </span>
      </div>

      {/* Main Day Header card */}
      <div
        className="surface-panel"
        style={{
          padding: "2rem",
          borderRadius: "8px",
          border: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <span
              className="eyebrow-badge"
              style={{
                background: "rgba(56,217,255,0.08)",
                color: "var(--cyan)",
                padding: "3px 8px",
                borderRadius: "4px",
                fontSize: "10px",
                fontWeight: 700,
              }}
            >
              DAY {day.day} OF {learningRoadmap.length}
            </span>
            <h1
              style={{
                fontSize: "2rem",
                marginTop: "0.5rem",
                marginBottom: "0.5rem",
              }}
            >
              {day.title}
            </h1>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "14.5px",
                margin: 0,
              }}
            >
              <strong>Topic Focus:</strong> {day.focus}
            </p>
          </div>

          <button
            className={`primary-button ${isDone ? "outline" : ""}`}
            onClick={() => toggleDayComplete(day.day)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: isDone ? "rgba(48,230,149,0.1)" : undefined,
              borderColor: isDone ? "var(--emerald)" : undefined,
              color: isDone ? "var(--emerald)" : undefined,
            }}
          >
            <CheckCircle2 size={16} />
            {isDone ? "Completed" : "Mark Day Complete"}
          </button>
        </div>

        {/* Day Stats Grid */}
        <div
          style={{
            display: "flex",
            gap: "2.5rem",
            marginTop: "1.5rem",
            borderTop: "1px solid var(--border)",
            paddingTop: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "11px",
                color: "var(--muted)",
                display: "block",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Estimated Time
            </span>
            <strong style={{ fontSize: "17px" }}>
              {formatStudyTime(dayModules.length * 15 + totalDayProblems * 10)}
            </strong>
          </div>
          <div>
            <span
              style={{
                fontSize: "11px",
                color: "var(--muted)",
                display: "block",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Modules
            </span>
            <strong style={{ fontSize: "17px" }}>
              {dayModules.length} lessons
            </strong>
          </div>
          <div>
            <span
              style={{
                fontSize: "11px",
                color: "var(--muted)",
                display: "block",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Exercises
            </span>
            <strong style={{ fontSize: "17px" }}>
              {solvedDayProblems} / {totalDayProblems} solved
            </strong>
          </div>
          {totalDayPuzzles > 0 && (
            <div>
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--muted)",
                  display: "block",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Puzzles
              </span>
              <strong style={{ fontSize: "17px" }}>
                {solvedDayPuzzles} / {totalDayPuzzles} solved
              </strong>
            </div>
          )}
          {day.mockInterview && day.mockInterview.company && (
            <div>
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--muted)",
                  display: "block",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Mock Interview
              </span>
              <strong
                style={{
                  fontSize: "17px",
                  color:
                    (progress.mockScores?.[day.mockInterview.company] ?? 0) > 0
                      ? "var(--emerald)"
                      : "var(--amber)",
                }}
              >
                {(progress.mockScores?.[day.mockInterview.company] ?? 0) > 0
                  ? `Passed (${progress.mockScores[day.mockInterview.company]}%)`
                  : "Pending"}
              </strong>
            </div>
          )}
        </div>
      </div>

      {/* Day Progress Checklist */}
      <div
        className="surface-panel"
        style={{
          padding: "1.5rem",
          borderRadius: "8px",
          border: "1px solid var(--border)",
        }}
      >
        <h2
          style={{
            fontSize: "16px",
            margin: "0 0 1.25rem 0",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Sparkles size={16} style={{ color: "var(--cyan)" }} /> Day {day.day}{" "}
          Tasks Checklist
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Lessons Checklist */}
          {dayModules.map((mod) => {
            const itemId = `day-${day.day}-lesson-${mod!.id}`;
            const checked = progress.completedChecklistItems?.includes(itemId);
            return (
              <div
                key={itemId}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                  padding: "12px 16px",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                  background: checked
                    ? "rgba(48,230,149,0.02)"
                    : "rgba(255,255,255,0.01)",
                  transition: "all 0.2s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    height: "20px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleChecklistItem(itemId)}
                    style={{
                      cursor: "pointer",
                      width: "16px",
                      height: "16px",
                      accentColor: "var(--emerald)",
                    }}
                  />
                </div>
                <div
                  style={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "10px",
                        color: "var(--muted)",
                        textTransform: "uppercase",
                        fontWeight: 600,
                      }}
                    >
                      Module {mod!.id} &bull; {mod!.level}
                    </span>
                    {mod!.isHighWeight && (
                      <span
                        style={{
                          fontSize: "9px",
                          background: "rgba(56,217,255,0.08)",
                          color: "var(--cyan)",
                          padding: "1px 6px",
                          borderRadius: "3px",
                          border: "1px solid rgba(56,217,255,0.2)",
                          textTransform: "uppercase",
                          fontWeight: 700,
                        }}
                      >
                        ⭐ High Interview Weight
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      textDecoration: checked ? "line-through" : "none",
                      color: checked ? "var(--muted)" : "var(--text)",
                    }}
                  >
                    Read Lesson: {mod!.title}
                  </span>
                  <span
                    style={{
                      fontSize: "12.5px",
                      color: "var(--text-secondary)",
                      lineHeight: "1.4",
                    }}
                  >
                    {mod!.outcome}
                  </span>
                </div>
                <button
                  className="secondary-button compact outline"
                  onClick={() => {
                    selectModule(mod!);
                    setActiveView("modules");
                  }}
                  style={{ flexShrink: 0, marginTop: "2px" }}
                >
                  Read Lesson
                </button>
              </div>
            );
          })}

          {/* Practice Exercises Checklist */}
          {dayProblems.map((p) => {
            const solved = progress.solvedProblems.includes(p.id);
            return (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                  padding: "12px 16px",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                  background: solved
                    ? "rgba(48,230,149,0.02)"
                    : "rgba(255,255,255,0.01)",
                  transition: "all 0.2s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    height: "20px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={solved}
                    readOnly
                    style={{
                      cursor: "not-allowed",
                      width: "16px",
                      height: "16px",
                      accentColor: "var(--emerald)",
                    }}
                  />
                </div>
                <div
                  style={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      className={`difficulty-pill ${classForDiff(p.difficulty)}`}
                    >
                      {p.difficulty}
                    </span>
                    {p.isEssential && (
                      <span
                        style={{
                          fontSize: "9px",
                          background: "rgba(56,217,255,0.08)",
                          color: "var(--cyan)",
                          padding: "1px 6px",
                          borderRadius: "3px",
                          border: "1px solid rgba(56,217,255,0.2)",
                        }}
                      >
                        Core 40
                      </span>
                    )}
                    {roadmapModules.find((m) => m.id === p.moduleId)
                      ?.isHighWeight && (
                      <span
                        style={{
                          fontSize: "9px",
                          background: "rgba(56,217,255,0.08)",
                          color: "var(--cyan)",
                          padding: "1px 6px",
                          borderRadius: "3px",
                          border: "1px solid rgba(56,217,255,0.2)",
                        }}
                      >
                        ⭐ High Weight
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      textDecoration: solved ? "line-through" : "none",
                      color: solved ? "var(--muted)" : "var(--text)",
                    }}
                  >
                    Solve Practice: {p.title}
                  </span>
                  <span
                    style={{
                      fontSize: "12.5px",
                      color: "var(--text-secondary)",
                      lineHeight: "1.4",
                    }}
                  >
                    {p.prompt.slice(0, 140)}...
                  </span>
                </div>
                <button
                  className="primary-button compact"
                  onClick={() => openInPlayground(p)}
                  style={{ flexShrink: 0, marginTop: "2px" }}
                >
                  Solve
                </button>
              </div>
            );
          })}

          {/* Puzzles Checklist */}
          {dayPuzzles.map((p) => {
            const solved = progress.solvedPuzzles?.includes(p.id);
            return (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                  padding: "12px 16px",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                  background: solved
                    ? "rgba(48,230,149,0.02)"
                    : "rgba(255,255,255,0.01)",
                  transition: "all 0.2s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    height: "20px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={solved}
                    readOnly
                    style={{
                      cursor: "not-allowed",
                      width: "16px",
                      height: "16px",
                      accentColor: "var(--emerald)",
                    }}
                  />
                </div>
                <div
                  style={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      className={`difficulty-pill ${classForDiff(p.difficulty)}`}
                    >
                      {p.difficulty}
                    </span>
                    <span className="concept-tag">{p.category}</span>
                  </div>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      textDecoration: solved ? "line-through" : "none",
                      color: solved ? "var(--muted)" : "var(--text)",
                    }}
                  >
                    Solve Debug Puzzle: {p.title}
                  </span>
                  <span
                    style={{
                      fontSize: "12.5px",
                      color: "var(--text-secondary)",
                      lineHeight: "1.4",
                    }}
                  >
                    {p.businessScenario}
                  </span>
                </div>
                <button
                  className="primary-button compact"
                  onClick={() => {
                    stopAutoTyping();
                    setActivePuzzleId(p.id);
                    setPlaygroundMode("puzzle");
                    const saved = getSavedPuzzleQuery(p);
                    updateEditorQuery(saved, "puzzle", p.id);
                    setActiveRightTab?.("hints");
                    setActiveView("playground");
                    setQueryResult({ columns: [], rows: [], message: "" });
                    setExpectedResult(null);
                  }}
                  style={{ flexShrink: 0, marginTop: "2px" }}
                >
                  Debug
                </button>
              </div>
            );
          })}

          {/* Mock Test Checklist */}
          {day.mockInterview &&
            (() => {
              const company = day.mockInterview.company;
              const hasScore =
                progress.mockScores &&
                progress.mockScores[company] !== undefined;
              const itemId = `day-${day.day}-mock-${company}`;
              const checked =
                hasScore || progress.completedChecklistItems?.includes(itemId);
              return (
                <div
                  key={itemId}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "14px",
                    padding: "12px 16px",
                    borderRadius: "6px",
                    border: "1px solid rgba(56,217,255,0.2)",
                    background: checked
                      ? "rgba(48,230,149,0.02)"
                      : "linear-gradient(135deg, rgba(56,217,255,0.02) 0%, rgba(0,0,0,0) 100%)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      height: "20px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleChecklistItem(itemId)}
                      style={{
                        cursor: "pointer",
                        width: "16px",
                        height: "16px",
                        accentColor: "var(--emerald)",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "6px",
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "10px",
                          color: "var(--cyan)",
                          textTransform: "uppercase",
                          fontWeight: 600,
                        }}
                      >
                        Milestone Mock Test
                      </span>
                      {hasScore && (
                        <span
                          className="mock-score"
                          style={{ fontSize: "10px", fontWeight: "bold" }}
                        >
                          Score: {progress.mockScores[company]}%
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        textDecoration: checked ? "line-through" : "none",
                        color: checked ? "var(--muted)" : "var(--text)",
                      }}
                    >
                      Complete Milestone: {company} Mock Interview
                    </span>
                    <span
                      style={{
                        fontSize: "12.5px",
                        color: "var(--text-secondary)",
                        lineHeight: "1.4",
                      }}
                    >
                      This day concludes with a mock interview simulation for{" "}
                      {company}. Make sure to complete the study lessons and
                      practice exercises before attempting the test.
                    </span>
                  </div>
                  <button
                    className="primary-button compact"
                    onClick={() => {
                      setActiveView("mocks");
                    }}
                    style={{ flexShrink: 0, marginTop: "2px" }}
                  >
                    Start Mock Test
                  </button>
                </div>
              );
            })()}
        </div>
      </div>

      {/* Prev / Next Footer Nav */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "2rem",
          borderTop: "1px solid var(--border)",
          paddingTop: "1.5rem",
        }}
      >
        <button
          className="secondary-button compact"
          disabled={day.day === 1}
          onClick={() => setSelectedDayId(day.day - 1)}
          style={{ opacity: day.day === 1 ? 0.3 : 1 }}
        >
          &larr; Day {day.day - 1}
        </button>
        <button
          className="secondary-button compact"
          disabled={day.day === learningRoadmap.length}
          onClick={() => setSelectedDayId(day.day + 1)}
          style={{ opacity: day.day === learningRoadmap.length ? 0.3 : 1 }}
        >
          Day {day.day + 1} &rarr;
        </button>
      </div>
    </div>
  );
}

export default React.memo(DayDetailsView);
