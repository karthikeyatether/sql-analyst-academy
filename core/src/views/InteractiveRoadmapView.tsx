import React from "react";
import { useCurriculum } from "../contexts/CurriculumContext";
import { useV3Dispatch } from "../contexts/V3Store";
import { BookOpen, CheckCircle, Lock, Play } from "lucide-react";

export function InteractiveRoadmapView() {
  const { learningRoadmap, roadmapModules } = useCurriculum();
  const dispatch = useV3Dispatch();

  // Mock progress for now. In reality, pull from useProgress()
  const completedDays = [1, 2];
  const unlockedDays = [1, 2, 3];

  return (
    <div
      className="bg-grid"
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "64px 24px",
        background: "var(--bg-base)",
        position: "relative",
      }}
    >
      <div
        style={{ maxWidth: "800px", margin: "0 auto", position: "relative" }}
      >
        <header style={{ marginBottom: "80px", textAlign: "center" }}>
          <div
            style={{
              display: "inline-block",
              padding: "8px 16px",
              background: "var(--bg-elevated)",
              borderRadius: "100px",
              border: "1px solid var(--border-subtle)",
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--text-secondary)",
              letterSpacing: "0.05em",
              marginBottom: "24px",
            }}
          >
            STRUCTURED LEARNING PATH
          </div>
          <h1
            style={{
              fontSize: "56px",
              fontWeight: 900,
              letterSpacing: "-0.05em",
              margin: "0 0 16px 0",
              color: "#ffffff",
            }}
          >
            SQL Analyst Journey
          </h1>
          <p
            style={{
              fontSize: "18px",
              color: "var(--text-secondary)",
              maxWidth: "500px",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            Master SQL from basics to advanced analytics. Follow the path,
            complete missions, and become job-ready.
          </p>
        </header>

        {/* The Vertical Spine */}
        <div style={{ position: "relative", paddingLeft: "48px" }}>
          <div
            style={{
              position: "absolute",
              left: "15px",
              top: 0,
              bottom: 0,
              width: "2px",
              background:
                "linear-gradient(to bottom, var(--success) 0%, var(--success) 30%, var(--border-subtle) 30%, var(--border-subtle) 100%)",
            }}
          />

          <div
            style={{ display: "flex", flexDirection: "column", gap: "48px" }}
          >
            {learningRoadmap?.map((day, index) => {
              const isCompleted = completedDays.includes(day.day);
              const isUnlocked = unlockedDays.includes(day.day);
              const isCurrent = isUnlocked && !isCompleted;

              return (
                <div key={day.day} style={{ position: "relative" }}>
                  {/* Spine Node */}
                  <div
                    style={{
                      position: "absolute",
                      left: "-41px" /* 48px padding - 15px line - 8px radius */,
                      top: "24px",
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      background: isCompleted
                        ? "var(--success)"
                        : isCurrent
                          ? "var(--theme-practice)"
                          : "var(--bg-panel)",
                      border: "4px solid var(--bg-base)",
                      boxShadow: isCurrent
                        ? "0 0 0 4px rgba(0, 229, 255, 0.2)"
                        : "none",
                      zIndex: 2,
                    }}
                  />

                  {/* Data Card */}
                  <div
                    className="premium-panel"
                    style={{
                      padding: "32px",
                      opacity: isUnlocked ? 1 : 0.4,
                      transition:
                        "opacity 0.2s, transform 0.2s, border-color 0.2s",
                      transform: isCurrent ? "scale(1.02)" : "scale(1)",
                      borderColor: isCurrent
                        ? "var(--theme-practice)"
                        : "var(--border-subtle)",
                      boxShadow: isCurrent
                        ? "var(--shadow-glow-practice)"
                        : "none",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "16px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            color: isCurrent
                              ? "var(--theme-practice)"
                              : "var(--text-secondary)",
                            letterSpacing: "0.05em",
                          }}
                        >
                          DAY {day.day}
                        </span>
                        {isCompleted && (
                          <CheckCircle size={16} color="var(--success)" />
                        )}
                      </div>

                      <div style={{ color: "var(--text-muted)" }}>
                        {isUnlocked ? (
                          <BookOpen size={18} />
                        ) : (
                          <Lock size={18} />
                        )}
                      </div>
                    </div>

                    <h2
                      style={{
                        fontSize: "24px",
                        margin: "0 0 12px 0",
                        color: "#ffffff",
                      }}
                    >
                      {day.title}
                    </h2>

                    <p
                      style={{
                        color: "var(--text-secondary)",
                        lineHeight: 1.6,
                        margin: "0 0 32px 0",
                      }}
                    >
                      {day.focus}
                    </p>

                    <div style={{ display: "flex", gap: "16px" }}>
                      <button
                        disabled={!isUnlocked}
                        onClick={() => {
                          dispatch({ type: "SET_DAY", payload: day.day });
                          dispatch({
                            type: "SET_VIEW",
                            payload: "day-details",
                          });
                        }}
                        style={{
                          background: isCurrent
                            ? "var(--text-primary)"
                            : "transparent",
                          color: isCurrent ? "#000" : "var(--text-primary)",
                          border: isCurrent
                            ? "none"
                            : "1px solid var(--border-subtle)",
                          padding: "12px 24px",
                          borderRadius: "var(--radius-sm)",
                          fontSize: "14px",
                          fontWeight: 600,
                          cursor: isUnlocked ? "pointer" : "not-allowed",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          transition: "all 0.2s",
                        }}
                        onMouseOver={(e) => {
                          if (isUnlocked && !isCurrent) {
                            e.currentTarget.style.background =
                              "var(--bg-elevated)";
                          }
                        }}
                        onMouseOut={(e) => {
                          if (isUnlocked && !isCurrent) {
                            e.currentTarget.style.background = "transparent";
                          }
                        }}
                      >
                        {isCompleted ? (
                          "Review Mission"
                        ) : isUnlocked ? (
                          <>
                            <Play size={14} fill="currentColor" /> Start Mission
                          </>
                        ) : (
                          "Locked"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(InteractiveRoadmapView);
