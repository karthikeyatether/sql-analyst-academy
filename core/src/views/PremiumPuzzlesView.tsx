import React, { useMemo, useState } from "react";
import { useCurriculum } from "../contexts/CurriculumContext";
import { useV3State, useV3Dispatch } from "../contexts/V3Store";
import { useProgress } from "../contexts/ProgressContext";
import { CheckCircle2, Bug, Code2 } from "lucide-react";

export function PremiumPuzzlesView() {
  const { debugPuzzles } = useCurriculum();
  const { progress } = useProgress();
  const dispatch = useV3Dispatch();

  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  const categories = useMemo(() => {
    const cats = new Set<string>();
    debugPuzzles?.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats).sort();
  }, [debugPuzzles]);

  const visiblePuzzles = useMemo(() => {
    if (!debugPuzzles) return [];
    if (categoryFilter === "All") return debugPuzzles;
    return debugPuzzles.filter((p) => p.category === categoryFilter);
  }, [debugPuzzles, categoryFilter]);

  return (
    <div
      style={{
        padding: "48px",
        height: "100%",
        overflowY: "auto",
        background: "var(--bg-base)",
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <header style={{ marginBottom: "48px", textAlign: "center" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "16px",
            }}
          >
            <Bug size={48} color="var(--accent-pink)" />
          </div>
          <h1
            style={{
              fontSize: "36px",
              fontWeight: 800,
              margin: "0 0 16px 0",
              color: "var(--text-primary)",
            }}
          >
            Logic Puzzles
          </h1>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "16px",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            Debug broken queries and fix edge cases. Real-world SQL isn't just
            writing from scratch—it's fixing what's broken.
          </p>
        </header>

        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "32px",
            overflowX: "auto",
            scrollBehavior: "smooth",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            paddingBottom: "8px",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => setCategoryFilter("All")}
            className={
              categoryFilter === "All"
                ? "premium-btn premium-btn-primary"
                : "premium-btn premium-btn-secondary"
            }
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={
                categoryFilter === c
                  ? "premium-btn premium-btn-primary"
                  : "premium-btn premium-btn-secondary"
              }
            >
              {c}
            </button>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "24px",
          }}
        >
          {visiblePuzzles.map((p) => {
            const isSolved = progress.solvedPuzzles?.includes(p.id);
            return (
              <div
                key={p.id}
                className="premium-panel panel-puzzle"
                style={{
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  border: isSolved ? "1px solid var(--success)" : undefined,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "12px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      padding: "4px 8px",
                      borderRadius: "4px",
                      background:
                        p.difficulty === "Easy"
                          ? "hsla(150, 80%, 30%, 0.2)"
                          : p.difficulty === "Medium"
                            ? "hsla(40, 80%, 40%, 0.2)"
                            : "hsla(0, 80%, 50%, 0.2)",
                      color:
                        p.difficulty === "Easy"
                          ? "var(--success)"
                          : p.difficulty === "Medium"
                            ? "var(--warning)"
                            : "var(--error)",
                    }}
                  >
                    {p.difficulty}
                  </span>
                  {isSolved && (
                    <CheckCircle2 size={18} color="var(--success)" />
                  )}
                </div>

                <h3
                  style={{
                    fontSize: "18px",
                    margin: "0 0 8px 0",
                    color: "var(--text-primary)",
                  }}
                >
                  {p.title}
                </h3>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "14px",
                    flex: 1,
                    marginBottom: "24px",
                  }}
                >
                  {p.businessScenario}
                </p>

                <div
                  style={{
                    padding: "12px",
                    background: "rgba(0,0,0,0.3)",
                    borderRadius: "8px",
                    marginBottom: "24px",
                    fontFamily: "monospace",
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    overflowX: "auto",
                    scrollBehavior: "smooth",
                    WebkitOverflowScrolling: "touch",
                    scrollbarWidth: "none",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {p.flawedQuery}
                </div>

                <button
                  className="premium-btn premium-btn-secondary"
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                  onClick={() => {
                    dispatch({ type: "SET_PROBLEM", payload: p.id });
                    dispatch({
                      type: "SET_PLAYGROUND_MODE",
                      payload: "puzzle",
                    });
                    dispatch({ type: "SET_VIEW", payload: "playground" });
                  }}
                >
                  <Code2 size={16} />
                  Debug in Playground
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default React.memo(PremiumPuzzlesView);
