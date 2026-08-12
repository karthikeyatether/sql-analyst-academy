import React, { useMemo, useState } from "react";
import { useCurriculum } from "../contexts/CurriculumContext";
import { useV3State, useV3Dispatch } from "../contexts/V3Store";
import { useProgress } from "../contexts/ProgressContext";
import { CheckCircle2, Zap, Target } from "lucide-react";

export function PremiumPracticeView() {
  const { roadmapModules, allProblems } = useCurriculum();
  const { progress } = useProgress();
  const state = useV3State();
  const dispatch = useV3Dispatch();

  const [activeModuleId, setActiveModuleId] = useState<number>(
    state.activeModuleId || roadmapModules[0]?.id || 1,
  );

  const activeModule = useMemo(
    () =>
      roadmapModules.find((m) => m.id === activeModuleId) || roadmapModules[0],
    [roadmapModules, activeModuleId],
  );
  const problems = activeModule?.problems || [];

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
            <Target size={48} color="var(--accent-cyan)" />
          </div>
          <h1
            style={{
              fontSize: "36px",
              fontWeight: 800,
              margin: "0 0 16px 0",
              color: "var(--text-primary)",
            }}
          >
            Target Practice
          </h1>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "16px",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            Hone your skills on real-world business scenarios. Select a module
            below to start practicing.
          </p>
        </header>

        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "32px",
            overflowX: "auto",
            paddingBottom: "8px",
          }}
        >
          {roadmapModules.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveModuleId(m.id)}
              className={
                activeModuleId === m.id
                  ? "premium-btn premium-btn-primary"
                  : "premium-btn premium-btn-secondary"
              }
              style={{ whiteSpace: "nowrap" }}
            >
              M{m.id}: {m.title}
            </button>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "24px",
          }}
        >
          {problems.map((p) => {
            const isSolved = progress.solvedProblems.includes(p.id);
            return (
              <div
                key={p.id}
                className="premium-panel panel-practice"
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
                      payload: "practice",
                    });
                    dispatch({ type: "SET_VIEW", payload: "playground" });
                  }}
                >
                  <Zap size={16} />
                  Solve in Playground
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default React.memo(PremiumPracticeView);
