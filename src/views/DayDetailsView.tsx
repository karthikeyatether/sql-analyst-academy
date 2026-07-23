import React from "react";
import { BookOpen, CheckCircle2, Code2, Sparkles, Timer, Target } from "lucide-react";
import type { RoadmapModule, PracticeProblem, RoadmapDay, Difficulty } from "../data/curriculum";

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
  debugPuzzles: any[];
  setActiveView: (view: any) => void;
  setSelectedDayId: (id: number) => void;
  toggleDayComplete: (day: number) => void;
  toggleChecklistItem: (id: string) => void;
  selectModule: (m: RoadmapModule) => void;
  openInPlayground: (p: PracticeProblem) => void;
  markProblemSolved: (p: PracticeProblem, quality?: number) => void;
  markPuzzleSolved: (p: any) => void;
  setActivePuzzleId: (id: string) => void;
  setPlaygroundMode: (mode: "practice" | "puzzle" | "free") => void;
  getSavedPuzzleQuery: (p: any) => string;
  updateEditorQuery: (newVal: string, pMode?: any, targetId?: string, moveCursorToEnd?: boolean) => void;
  stopAutoTyping: () => void;
  setActiveRightTab?: (tab: any) => void;
  setQueryResult: (res: any) => void;
  setExpectedResult: (res: any) => void;
}

export default function DayDetailsView({
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
  const dayProblems = dayModules.flatMap((m) => m!.problems);
  const totalDayProblems = dayProblems.length;
  const solvedDayProblems = dayProblems.filter((p) => progress.solvedProblems.includes(p.id)).length;
  const problemProgressPct = totalDayProblems > 0 ? Math.round((solvedDayProblems / totalDayProblems) * 100) : 100;

  const dayPuzzles = debugPuzzles.filter((p) => p.dayId === day.day);
  const totalDayPuzzles = dayPuzzles.length;
  const solvedDayPuzzles = dayPuzzles.filter((p) => (progress.solvedPuzzles || []).includes(p.id)).length;

  const classForDiff = (d: Difficulty) => {
    return d.toLowerCase();
  };

  return (
    <div
      className="view-content day-details-view"
      style={{
        padding: "2rem 3rem",
        maxWidth: "900px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}
    >
      {/* Breadcrumbs / Header back button */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <button className="secondary-button compact" onClick={() => setActiveView("roadmap")}>
          &larr; Back to Roadmap
        </button>
        <span style={{ color: "var(--muted)" }}>/</span>
        <span style={{ fontSize: "13px", color: "var(--muted)" }}>Day {day.day} Details</span>
      </div>

      {/* Main Day Header card */}
      <div
        className="surface-panel"
        style={{ padding: "2rem", borderRadius: "8px", border: "1px solid var(--border)" }}
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
            <h1 style={{ fontSize: "2rem", marginTop: "0.5rem", marginBottom: "0.5rem" }}>{day.title}</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "14.5px", margin: 0 }}>
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
              {dayModules.length * 15 + totalDayProblems * 10} mins
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
            <strong style={{ fontSize: "17px" }}>{dayModules.length} lessons</strong>
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
        </div>
      </div>

      {/* Day Progress Checklist */}
      <div
        className="surface-panel"
        style={{
          padding: "1.5rem",
          borderRadius: "8px",
          border: "1px solid var(--border)",
          background: "rgba(56,217,255,0.02)",
        }}
      >
        <h2 style={{ fontSize: "16px", margin: "0 0 1rem 0", display: "flex", alignItems: "center", gap: "8px" }}>
          <Sparkles size={16} style={{ color: "var(--cyan)" }} /> Day {day.day} Tasks Checklist
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* Lessons Checklist */}
          {dayModules.map((mod) => {
            const itemId = `day-${day.day}-lesson-${mod!.id}`;
            const checked = progress.completedChecklistItems?.includes(itemId);
            return (
              <div
                key={itemId}
                style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", padding: "4px 0" }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleChecklistItem(itemId)}
                  style={{ cursor: "pointer", width: "16px", height: "16px", accentColor: "var(--cyan)" }}
                />
                <span
                  style={{
                    textDecoration: checked ? "line-through" : "none",
                    color: checked ? "var(--muted)" : "var(--text)",
                  }}
                >
                  Read Lesson: <strong>{mod!.title}</strong>{" "}
                  {mod!.isHighWeight && (
                    <span style={{ color: "var(--amber)", marginLeft: "4px", fontWeight: "bold" }}>⭐</span>
                  )}
                </span>
                <button
                  onClick={() => {
                    selectModule(mod!);
                    setActiveView("modules");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--cyan)",
                    cursor: "pointer",
                    fontSize: "12px",
                    textDecoration: "underline",
                    marginLeft: "auto",
                    padding: 0,
                  }}
                >
                  Read
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
                style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", padding: "4px 0" }}
              >
                <input
                  type="checkbox"
                  checked={solved}
                  readOnly
                  style={{ cursor: "not-allowed", width: "16px", height: "16px", accentColor: "var(--emerald)" }}
                />
                <span
                  style={{
                    textDecoration: solved ? "line-through" : "none",
                    color: solved ? "var(--muted)" : "var(--text)",
                  }}
                >
                  Solve Practice: <strong>{p.title}</strong>{" "}
                  {roadmapModules.find((m) => m.id === p.moduleId)?.isHighWeight && (
                    <span style={{ color: "var(--amber)", marginLeft: "4px", fontWeight: "bold" }}>⭐</span>
                  )}
                </span>
                <button
                  onClick={() => openInPlayground(p)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--cyan)",
                    cursor: "pointer",
                    fontSize: "12px",
                    textDecoration: "underline",
                    marginLeft: "auto",
                    padding: 0,
                  }}
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
                style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", padding: "4px 0" }}
              >
                <input
                  type="checkbox"
                  checked={solved}
                  readOnly
                  style={{ cursor: "not-allowed", width: "16px", height: "16px", accentColor: "var(--cyan)" }}
                />
                <span
                  style={{
                    textDecoration: solved ? "line-through" : "none",
                    color: solved ? "var(--muted)" : "var(--text)",
                  }}
                >
                  Solve Debug Puzzle: <strong>{p.title}</strong>
                </span>
                <button
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
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--cyan)",
                    cursor: "pointer",
                    fontSize: "12px",
                    textDecoration: "underline",
                    marginLeft: "auto",
                    padding: 0,
                  }}
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
              const hasScore = progress.mockScores && progress.mockScores[company] !== undefined;
              const itemId = `day-${day.day}-mock-${company}`;
              const checked = hasScore || progress.completedChecklistItems?.includes(itemId);
              return (
                <div
                  key={itemId}
                  style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", padding: "4px 0" }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleChecklistItem(itemId)}
                    style={{ cursor: "pointer", width: "16px", height: "16px", accentColor: "var(--cyan)" }}
                  />
                  <span
                    style={{
                      textDecoration: checked ? "line-through" : "none",
                      color: checked ? "var(--muted)" : "var(--text)",
                    }}
                  >
                    Complete Milestone: <strong>{company} Mock Interview</strong>{" "}
                    {hasScore && `(Score: ${progress.mockScores[company]}%)`}
                  </span>
                  <button
                    onClick={() => {
                      setActiveView("mocks");
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--cyan)",
                      cursor: "pointer",
                      fontSize: "12px",
                      textDecoration: "underline",
                      marginLeft: "auto",
                      padding: 0,
                    }}
                  >
                    Start Test
                  </button>
                </div>
              );
            })()}
        </div>
      </div>

      {/* Modules/Lessons List */}
      <div
        className="surface-panel"
        style={{ padding: "1.5rem", borderRadius: "8px", border: "1px solid var(--border)" }}
      >
        <h2 style={{ fontSize: "16px", margin: "0 0 1rem 0", display: "flex", alignItems: "center", gap: "8px" }}>
          <BookOpen size={16} style={{ color: "var(--cyan)" }} /> Conceptual Lessons
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {dayModules.map((mod) => (
            <div
              key={mod!.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1rem",
                background: "rgba(255,255,255,0.01)",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                gap: "16px",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "10px",
                    color: "var(--muted)",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  Module {mod!.id} &bull; {mod!.level}
                  {mod!.isHighWeight && (
                    <span
                      style={{
                        fontSize: "9px",
                        background: "rgba(255,190,61,0.08)",
                        color: "var(--amber)",
                        padding: "1px 6px",
                        borderRadius: "3px",
                        border: "1px solid rgba(255,190,61,0.15)",
                        marginLeft: "8px",
                        textTransform: "uppercase",
                        fontWeight: 700,
                      }}
                    >
                      ⭐ High Interview Weight
                    </span>
                  )}
                </span>
                <h3 style={{ fontSize: "14.5px", marginTop: "2px", marginBottom: "4px" }}>{mod!.title}</h3>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>{mod!.outcome}</p>
              </div>
              <button
                className="secondary-button compact outline"
                onClick={() => {
                  selectModule(mod!);
                  setActiveView("modules");
                }}
                style={{ flexShrink: 0 }}
              >
                Read Lesson
              </button>
            </div>
          ))}
          {dayModules.length === 0 && (
            <p style={{ color: "var(--muted)", margin: 0, fontSize: "13.5px" }}>
              No conceptual modules assigned for today. Move straight to practice or milestone mocks.
            </p>
          )}
        </div>
      </div>

      {/* Problems List */}
      {totalDayProblems > 0 && (
        <div
          className="surface-panel"
          style={{ padding: "1.5rem", borderRadius: "8px", border: "1px solid var(--border)" }}
        >
          <div
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}
          >
            <h2 style={{ fontSize: "16px", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <Code2 size={16} style={{ color: "var(--amber)" }} /> Practice Exercises
            </h2>
            <span style={{ fontSize: "12px", color: "var(--muted)" }}>
              Progress:{" "}
              <strong>
                {solvedDayProblems} / {totalDayProblems} solved
              </strong>
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {dayProblems.map((p) => {
              const solved = progress.solvedProblems.includes(p.id);
              return (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "1rem",
                    background: "rgba(255,255,255,0.01)",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                    gap: "16px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <span className={`difficulty-pill ${classForDiff(p.difficulty)}`}>{p.difficulty}</span>
                      {p.isEssential && (
                        <span
                          style={{
                            fontSize: "9px",
                            background: "rgba(255,190,61,0.08)",
                            color: "var(--amber)",
                            padding: "1px 6px",
                            borderRadius: "3px",
                            border: "1px solid rgba(255,190,61,0.15)",
                          }}
                        >
                          Core 40
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: "14.5px", marginTop: "6px", marginBottom: "4px" }}>{p.title}</h3>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
                      {p.prompt.slice(0, 120)}...
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
                    <button className="primary-button compact" onClick={() => openInPlayground(p)}>
                      Solve
                    </button>
                    <button
                      className={`icon-button ${solved ? "solved" : ""}`}
                      onClick={() => markProblemSolved(p)}
                      title={solved ? "Solved!" : "Mark as Solved"}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: solved ? "1px solid var(--emerald)" : undefined,
                        color: solved ? "var(--emerald)" : undefined,
                      }}
                    >
                      <CheckCircle2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Debug Puzzles List */}
      {dayPuzzles.length > 0 && (
        <div
          className="surface-panel"
          style={{ padding: "1.5rem", borderRadius: "8px", border: "1px solid var(--border)" }}
        >
          <div
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}
          >
            <h2 style={{ fontSize: "16px", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <Target size={16} style={{ color: "var(--cyan)" }} /> SQL Debug Puzzles
            </h2>
            <span style={{ fontSize: "12px", color: "var(--muted)" }}>
              Progress:{" "}
              <strong>
                {solvedDayPuzzles} / {totalDayPuzzles} solved
              </strong>
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {dayPuzzles.map((p) => {
              const solved = progress.solvedPuzzles?.includes(p.id);
              return (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "1rem",
                    background: "rgba(255,255,255,0.01)",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                    gap: "16px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <span className={`difficulty-pill ${classForDiff(p.difficulty)}`}>{p.difficulty}</span>
                      <span className="concept-tag">{p.category}</span>
                    </div>
                    <h3 style={{ fontSize: "14.5px", marginTop: "6px", marginBottom: "4px" }}>{p.title}</h3>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
                      {p.businessScenario}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
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
                    >
                      Debug
                    </button>
                    <button
                      className={`icon-button ${solved ? "solved" : ""}`}
                      onClick={() => markPuzzleSolved(p)}
                      title={solved ? "Solved!" : "Mark as Solved"}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: solved ? "1px solid var(--emerald)" : undefined,
                        color: solved ? "var(--emerald)" : undefined,
                      }}
                    >
                      <CheckCircle2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Milestone Mock Test Panel */}
      {day.mockInterview && (
        <div
          className="surface-panel"
          style={{
            padding: "1.5rem",
            borderRadius: "8px",
            border: "1px solid rgba(56,217,255,0.2)",
            background: "linear-gradient(135deg, rgba(56,217,255,0.02) 0%, rgba(0,0,0,0) 100%)",
          }}
        >
          <h2
            style={{
              fontSize: "16px",
              color: "var(--cyan)",
              margin: "0 0 0.5rem 0",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Timer size={16} /> 🎯 Milestone Mock Test
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "13.5px", margin: "0 0 1rem 0", lineHeight: 1.5 }}>
            This day concludes with a mock interview simulation for <strong>{day.mockInterview.company}</strong>. Make
            sure to complete the study lessons and practice exercises before attempting the test.
          </p>
          <button
            className="primary-button compact"
            onClick={() => {
              setActiveView("mocks");
            }}
          >
            Start Mock Test
          </button>
        </div>
      )}

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
