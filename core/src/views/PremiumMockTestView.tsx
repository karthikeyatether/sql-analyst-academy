import React from "react";
import { useCurriculum } from "../contexts/CurriculumContext";
import { useProgress } from "../contexts/ProgressContext";
import { useV3Dispatch } from "../contexts/V3Store";
import { Timer, Briefcase, Award, ArrowRight } from "lucide-react";

export function PremiumMockTestView() {
  const { mockInterviews } = useCurriculum();
  const { progress } = useProgress();
  const dispatch = useV3Dispatch();

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
            <Timer size={48} color="var(--accent-purple)" />
          </div>
          <h1
            style={{
              fontSize: "36px",
              fontWeight: 800,
              margin: "0 0 16px 0",
              color: "var(--text-primary)",
            }}
          >
            Mock Interviews
          </h1>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "16px",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            Simulate high-stakes technical interviews. Complete these timed
            challenges to prove you're job ready.
          </p>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "24px",
          }}
        >
          {mockInterviews?.map((mock) => {
            const bestScore = progress.mockScores?.[mock.company];

            return (
              <div
                key={mock.company}
                className="premium-panel panel-mock"
                style={{
                  padding: "32px 24px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  border:
                    bestScore && bestScore >= 80
                      ? "1px solid var(--success)"
                      : undefined,
                }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "16px",
                    background: "var(--bg-elevated)",
                    display: "grid",
                    placeItems: "center",
                    marginBottom: "24px",
                  }}
                >
                  <Briefcase size={32} color="var(--accent-cyan)" />
                </div>

                <h3
                  style={{
                    fontSize: "20px",
                    margin: "0 0 12px 0",
                    color: "var(--text-primary)",
                  }}
                >
                  {mock.company} Mock Test
                </h3>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "14px",
                    marginBottom: "24px",
                  }}
                >
                  Focus: {mock.focus} (Difficulty: {mock.difficulty})
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    marginBottom: "32px",
                    fontSize: "14px",
                    color: "var(--text-secondary)",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Timer size={16} /> {mock.minutes} min
                  </span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Award size={16} /> {mock.questions} questions
                  </span>
                </div>

                <button
                  className="premium-btn premium-btn-primary"
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                  onClick={() => {
                    alert(
                      "The full mock exam runner is being upgraded to V3! Please practice in the main playground for now.",
                    );
                  }}
                >
                  Start Interview <ArrowRight size={16} />
                </button>

                {bestScore !== undefined && (
                  <div
                    style={{
                      marginTop: "16px",
                      fontSize: "14px",
                      color:
                        bestScore >= 80 ? "var(--success)" : "var(--warning)",
                    }}
                  >
                    Best Score: {bestScore}%
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default React.memo(PremiumMockTestView);
