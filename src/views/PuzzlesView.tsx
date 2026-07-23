import React, { useState, useMemo, useEffect } from "react";
import { Bug, CheckCircle2, Lightbulb, Sparkles, Play } from "lucide-react";
import type { Difficulty } from "../data/curriculum";
import { SplitPane } from "../components/SplitPane";

interface PuzzlesViewProps {
  progress: {
    completedModules: number[];
    solvedProblems: string[];
    solvedPuzzles: string[];
  };
  debugPuzzles: any[];
  activePuzzle: any;
  setActivePuzzleId: (id: string) => void;
  openPuzzleInPlayground: (p: any) => void;
  markPuzzleSolved: (p: any) => void;
  updateEditorQuery: (newVal: string, pMode?: any, targetId?: string, moveCursorToEnd?: boolean) => void;
  setActiveView: (view: any) => void;
  setPlaygroundMode: (mode: "practice" | "puzzle" | "free") => void;
  classForDiff: (d: Difficulty) => string;
}

export default function PuzzlesView({
  progress,
  debugPuzzles,
  activePuzzle,
  setActivePuzzleId,
  openPuzzleInPlayground,
  markPuzzleSolved,
  updateEditorQuery,
  setActiveView,
  setPlaygroundMode,
  classForDiff,
}: PuzzlesViewProps) {
  // Scoped states pushed down from App
  const [puzzleSplit, setPuzzleSplit] = useState(() => {
    try {
      const saved = localStorage.getItem("sql-aa-split-puzzle");
      return saved ? JSON.parse(saved) : 340;
    } catch {
      return 340;
    }
  });
  const handlePuzzleSplitResize = (w: number) => {
    setPuzzleSplit(w);
    localStorage.setItem("sql-aa-split-puzzle", JSON.stringify(w));
  };

  const [puzzleCategoryFilter, setPuzzleCategoryFilter] = useState("All");
  const [solutionRevealed, setSolutionRevealed] = useState(false);

  const visiblePuzzles = useMemo(() => {
    return debugPuzzles.filter(
      (p) => puzzleCategoryFilter === "All" || p.category === puzzleCategoryFilter
    );
  }, [debugPuzzles, puzzleCategoryFilter]);

  // Reset answer revealed state when active puzzle changes
  useEffect(() => {
    setSolutionRevealed(false);
  }, [activePuzzle.id]);

  return (
    <SplitPane
      leftWidth={puzzleSplit}
      onResize={handlePuzzleSplitResize}
      left={
        <div className="practice-list-panel surface-panel full-height">
          <div className="band-label">
            <h3>Debug Puzzles</h3>
            <span>
              {visiblePuzzles.length} Filtered / {debugPuzzles.length} Total
            </span>
          </div>
          <div
            style={{
              padding: "0 24px 12px 24px",
              borderBottom: "1px solid var(--border)",
              marginBottom: "16px",
            }}
          >
            <select
              value={puzzleCategoryFilter}
              onChange={(e) => {
                setPuzzleCategoryFilter(e.target.value);
                const firstFiltered = debugPuzzles.find(
                  (x) => e.target.value === "All" || x.category === e.target.value
                );
                if (firstFiltered) setActivePuzzleId(firstFiltered.id);
              }}
              style={{
                width: "100%",
                background: "var(--input-bg)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                padding: "6px",
                borderRadius: "4px",
                fontSize: "12px",
                outline: "none",
              }}
            >
              <option value="All">All Categories</option>
              <option value="Aggregation">Aggregation & Group By</option>
              <option value="JOINs & Subqueries">JOINs & Subqueries</option>
              <option value="Window Functions">Window Functions & Analytics</option>
              <option value="Syntax & Logic">Syntax & Logic Hazards</option>
            </select>
          </div>
          <div className="problem-list">
            {visiblePuzzles.map((p) => {
              const isSolved = progress.solvedPuzzles?.includes(p.id);
              return (
                <article
                  key={p.id}
                  className={`problem-card ${
                    activePuzzle.id === p.id ? "selected" : ""
                  } ${isSolved ? "solved" : ""}`}
                  onClick={() => setActivePuzzleId(p.id)}
                >
                  <div className="problem-main">
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                      <span className={`difficulty-pill ${classForDiff(p.difficulty)}`}>{p.difficulty}</span>
                      {isSolved && (
                        <span
                          style={{
                            color: "var(--emerald)",
                            display: "inline-flex",
                            alignItems: "center",
                            fontSize: "11px",
                            fontWeight: 600,
                          }}
                        >
                          <CheckCircle2 size={11} style={{ marginRight: "2px" }} /> Solved
                        </span>
                      )}
                    </div>
                    <h3>{p.title}</h3>
                    <p>{p.category}</p>
                  </div>
                  <div className="problem-actions">
                    <button
                      className="icon-button animate-trigger"
                      title="Debug in Playground"
                      onClick={(e) => {
                        e.stopPropagation();
                        openPuzzleInPlayground(p);
                      }}
                    >
                      <Bug size={14} />
                    </button>
                    <button
                      className={`icon-button ${isSolved ? "solved" : ""}`}
                      title={isSolved ? "Solved" : "Mark as Solved"}
                      onClick={(e) => {
                        e.stopPropagation();
                        markPuzzleSolved(p);
                      }}
                    >
                      <CheckCircle2 size={14} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      }
      right={
        <div className="problem-detail-panel surface-panel full-height">
          <div className="problem-detail-header">
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <span className={`difficulty-pill ${classForDiff(activePuzzle.difficulty)}`}>
                {activePuzzle.difficulty}
              </span>
              <span className="concept-tag">{activePuzzle.category}</span>
              {progress.solvedPuzzles?.includes(activePuzzle.id) && (
                <span
                  className="solved-badge"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    background: "rgba(16, 185, 129, 0.1)",
                    color: "var(--emerald)",
                    fontSize: "11px",
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: "12px",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                  }}
                >
                  <CheckCircle2 size={11} /> Solved
                </span>
              )}
            </div>
            <h2>{activePuzzle.title}</h2>
          </div>

          <div className="problem-scenario">
            <strong>Scenario:</strong> {activePuzzle.businessScenario}
          </div>

          <div className="problem-prompt-box">
            <p>
              <strong>Your Task:</strong> Debug the following query. It has a logical flaw or syntax error.
            </p>
            <pre className="sql-pre">{activePuzzle.flawedQuery}</pre>
          </div>

          <div
            className="hint-card"
            style={{
              marginTop: "16px",
              background: "rgba(245, 158, 11, 0.05)",
              border: "1px solid rgba(245, 158, 11, 0.15)",
              borderRadius: "6px",
              padding: "10px 14px",
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
            }}
          >
            <Lightbulb size={14} style={{ marginTop: "2px", color: "var(--amber)", flexShrink: 0 }} />
            <div style={{ fontSize: "12.5px", color: "var(--text)" }}>
              <strong>Hint:</strong> {activePuzzle.hint}
            </div>
          </div>

          <div className="hint-actions" style={{ marginTop: "24px" }}>
            <button className="primary-button" onClick={() => openPuzzleInPlayground(activePuzzle)}>
              <Bug size={14} /> Debug in Playground
            </button>
            <button className="icon-button labeled" onClick={() => setSolutionRevealed((r) => !r)}>
              <Sparkles size={14} /> {solutionRevealed ? "Hide Solution" : "Reveal Solution"}
            </button>
            <button
              className={`icon-button labeled ${
                progress.solvedPuzzles?.includes(activePuzzle.id) ? "solved" : ""
              }`}
              onClick={() => markPuzzleSolved(activePuzzle)}
            >
              <CheckCircle2 size={14} />{" "}
              {progress.solvedPuzzles?.includes(activePuzzle.id) ? "Solved ✓" : "Mark as Solved"}
            </button>
          </div>

          {solutionRevealed && (
            <div className="solution-card animate-fade-in" style={{ marginTop: "20px" }}>
              <h3>Correct Solution</h3>
              <pre className="sql-pre">{activePuzzle.solutionQuery}</pre>
              <p style={{ marginTop: "12px" }}>
                <strong>The Mistake:</strong> {activePuzzle.mistakeExplanation}
              </p>
              <button
                className="icon-button labeled"
                style={{ marginTop: "8px" }}
                onClick={() => {
                  setPlaygroundMode("puzzle");
                  updateEditorQuery(activePuzzle.solutionQuery);
                  setActiveView("playground");
                }}
              >
                <Play size={14} /> Load Solution in Playground
              </button>
            </div>
          )}
        </div>
      }
    />
  );
}
