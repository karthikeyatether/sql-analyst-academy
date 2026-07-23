import React, { Suspense, lazy } from "react";
import { Timer, CheckCircle2, Clock, Play, AlertTriangle, Lightbulb, ChevronRight, Clipboard, Zap, Target } from "lucide-react";
import type { BeforeMount, OnMount } from "@monaco-editor/react";
import type { LucideIcon } from "lucide-react";
import type { Difficulty } from "../data/curriculum";
import { VSplitPane } from "../components/SplitPane";
import { ErrorBoundary } from "../components/ErrorBoundary";

const Editor = lazy(() => import("@monaco-editor/react"));

interface MockTestState {
  company: string;
  questions: any[];
  currentIndex: number;
  answers: { query: string; isCorrect: boolean }[];
  timeRemaining: number;
  isActive: boolean;
}

interface MockTestViewProps {
  activeView: "mocks" | "mock-runner" | "mock-results";
  setActiveView: (view: any) => void;
  progress: {
    mockScores: Record<string, number>;
  };
  mockInterviews: any[];
  mockHistory: any[];
  interviewQuestionBank: any[];
  mockTest: MockTestState | null;
  setMockTest: React.Dispatch<React.SetStateAction<MockTestState | null>>;
  mockReviewIndex: number;
  setMockReviewIndex: (idx: number) => void;
  startMockTest: (
    company: string,
    minutes: number,
    difficulty: string,
    maxModuleId: number,
    questionsCount: number
  ) => void;
  submitMockAnswer: (sql: string) => void;
  runCurrentQuery: () => void;
  queryRef: React.MutableRefObject<string>;
  queryResult: { columns: string[]; rows: any[]; message: string; error?: any };
  resultPage: number;
  setResultPage: React.Dispatch<React.SetStateAction<number>>;
  RESULT_PAGE_SIZE: number;
  updateEditorQuery: (sql: string) => void;

  // Monaco and settings props
  editorTheme: string;
  theme: string;
  query: string;
  handleBeforeMount: BeforeMount;
  handleMount: OnMount;
  handleEditorChange: (val: string | undefined) => void;
  editorMinimap: boolean;
  editorFontSize: number;
  editorFontFamily: string;
  editorTabSize: number;
  editorWordWrap: boolean;
}

function SectionTitle({ icon: Icon, title, action }: { icon: LucideIcon; title: string; action?: string }) {
  return (
    <div className="section-title">
      <div>
        <Icon size={17} />
        <h2>{title}</h2>
      </div>
      {action && <span>{action}</span>}
    </div>
  );
}

function QACard({
  q,
  a,
  followUp,
  mistake,
  onTry,
}: {
  q: string;
  a: string;
  followUp?: string;
  mistake?: string;
  onTry?: (sql: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const sqlMatch = a.match(/```sql([\s\S]*?)```/) || a.match(/```([\s\S]*?)```/);
  const tryQuery = sqlMatch ? sqlMatch[1].trim() : null;

  return (
    <div className="qa-card">
      <button className="qa-question" onClick={() => setOpen((o) => !o)}>
        <span>{q}</span>
        <ChevronRight size={14} className={open ? "rotated" : ""} />
      </button>
      {open && (
        <div className="qa-answer" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <p style={{ whiteSpace: "pre-wrap" }}>{a}</p>
          {tryQuery && onTry && (
            <button
              className="primary-button compact outline try-qa-btn"
              onClick={() => onTry(tryQuery)}
              style={{
                marginTop: "6px",
                width: "max-content",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "11px",
                padding: "4px 10px",
                height: "auto",
                background: "rgba(56, 217, 255, 0.08)",
                border: "1px solid rgba(56, 217, 255, 0.15)",
                color: "var(--cyan)",
                borderRadius: "4px",
              }}
            >
              <Zap size={11} /> Try in Playground
            </button>
          )}
          {followUp && (
            <p className="qa-followup">
              <strong>Follow-up:</strong> {followUp}
            </p>
          )}
          {mistake && (
            <p className="qa-mistake">
              <strong>Common mistake:</strong> {mistake}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function MockTestView({
  activeView,
  setActiveView,
  progress,
  mockInterviews,
  mockHistory,
  interviewQuestionBank,
  mockTest,
  setMockTest,
  mockReviewIndex,
  setMockReviewIndex,
  startMockTest,
  submitMockAnswer,
  runCurrentQuery,
  queryRef,
  queryResult,
  resultPage,
  setResultPage,
  RESULT_PAGE_SIZE,
  updateEditorQuery,
  editorTheme,
  theme,
  query,
  handleBeforeMount,
  handleMount,
  handleEditorChange,
  editorMinimap,
  editorFontSize,
  editorFontFamily,
  editorTabSize,
  editorWordWrap,
}: MockTestViewProps) {
  const [editorHeight, setEditorHeight] = React.useState(350);

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  }

  if (activeView === "mocks") {
    return (
      <div className="view-content">
        <div className="surface-panel">
          <SectionTitle icon={Timer} title="Mock Interviews" action="Company-style SQL rounds" />
          <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
            Each mock simulates a real company's DA SQL interview. Study the focus areas in the roadmap, then use the
            playground to attempt the round.
          </p>
          <div className="mock-grid">
            {mockInterviews.map((m) => (
              <article key={m.company} className="mock-card">
                <div className="mock-head">
                  <h3>{m.company}</h3>
                  <Timer size={17} />
                </div>
                <p className="mock-focus">{m.focus}</p>
                <div className="mock-stats">
                  <span>{m.minutes} min</span>
                  <span>{m.questions} Qs</span>
                  <span
                    className={`difficulty-pill ${
                      m.difficulty.includes("Advanced")
                        ? "hard"
                        : m.difficulty.includes("Intermediate")
                          ? "medium"
                          : "easy"
                    }`}
                  >
                    {m.difficulty}
                  </span>
                </div>
                <button
                  className="primary-button compact"
                  onClick={() => startMockTest(m.company, m.minutes, m.difficulty, m.maxModuleId, m.questions)}
                >
                  <Timer size={14} /> Start Test
                </button>
                {progress.mockScores[m.company] !== undefined && (
                  <p className="mock-score">Last score: {progress.mockScores[m.company]}% readiness</p>
                )}
              </article>
            ))}
          </div>
        </div>

        {/* Mock Interview History Log */}
        <div className="surface-panel" style={{ marginTop: "16px" }}>
          <SectionTitle
            icon={Clock}
            title="Mock Interview Attempt History"
            action={`${mockHistory.length} attempts`}
          />
          {mockHistory.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "12px",
                marginTop: "12px",
              }}
            >
              {mockHistory.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: "12px 16px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <h4 style={{ margin: 0, fontSize: "13px", color: "var(--text)" }}>{item.company}</h4>
                    <span style={{ fontSize: "10.5px", color: "var(--muted)" }}>
                      {new Date(item.date).toLocaleDateString()} at{" "}
                      {new Date(item.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span
                      className={`difficulty-pill ${
                        item.score >= 70 ? "easy" : item.score >= 40 ? "medium" : "hard"
                      }`}
                      style={{ fontWeight: "bold" }}
                    >
                      {item.score}% Score
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: "24px",
                textAlign: "center",
                background: "rgba(255, 255, 255, 0.01)",
                border: "1px dashed var(--border)",
                borderRadius: "6px",
                marginTop: "12px",
                color: "var(--muted)",
                fontSize: "12.5px"
              }}
            >
              No mock interviews completed yet. Choose a company above to begin your training!
            </div>
          )}
        </div>

        {/* Interview Q&A Bank */}
        <div className="surface-panel" style={{ marginTop: "16px" }}>
          <SectionTitle
            icon={Target}
            title="Interview Q&A Bank"
            action={`${interviewQuestionBank.length} questions`}
          />
          <div className="qa-list">
            {interviewQuestionBank.map((item) => (
              <QACard
                key={item.question}
                q={item.question}
                a={item.answer}
                followUp={item.followUp}
                mistake={item.mistake}
                onTry={(sql) => {
                  updateEditorQuery(sql);
                  setActiveView("playground");
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeView === "mock-runner") {
    if (!mockTest || !mockTest.isActive) return null;
    const currentQ = mockTest.questions[mockTest.currentIndex];

    return (
      <div className="playground-fullscreen mock-test-mode">
        {/* Editor column */}
        <div className="pg-editor-col">
          <div className="pg-toolbar mock-toolbar">
            <div className="pg-toolbar-left">
              <Timer size={16} />
              <strong>{mockTest.company}</strong>
              <span className="pg-tag">
                Question {mockTest.currentIndex + 1} of {mockTest.questions.length}
              </span>
              <span className={`mock-timer ${mockTest.timeRemaining < 300 ? "danger" : ""}`}>
                {formatTime(mockTest.timeRemaining)}
              </span>
            </div>
            <div className="pg-toolbar-right">
              <button className="primary-button run-btn" onClick={runCurrentQuery}>
                <Play size={15} /> Run Query
              </button>
              <button
                className="primary-button compact"
                style={{ background: "var(--emerald)", color: "black" }}
                onClick={() => submitMockAnswer(queryRef.current)}
              >
                Submit & Next <CheckCircle2 size={15} />
              </button>
            </div>
          </div>
          {mockTest.timeRemaining <= 300 && (
            <div
              className={`mock-time-warning-banner ${mockTest.timeRemaining <= 60 ? "critical" : "warning"}`}
              style={{
                background: mockTest.timeRemaining <= 60 ? "rgba(239, 68, 68, 0.15)" : "rgba(245, 158, 11, 0.15)",
                borderBottom: mockTest.timeRemaining <= 60 ? "1px solid #ef4444" : "1px solid #f59e0b",
                color: mockTest.timeRemaining <= 60 ? "#ef4444" : "#f59e0b",
                padding: "8px 16px",
                fontSize: "12px",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <AlertTriangle size={14} />
              <span>
                {mockTest.timeRemaining <= 60
                  ? "CRITICAL: Less than 1 minute remaining! Submit your answer immediately!"
                  : `WARNING: Less than 5 minutes remaining (${formatTime(mockTest.timeRemaining)} left)`}
              </span>
            </div>
          )}

          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <VSplitPane
              topHeight={editorHeight}
              onResize={setEditorHeight}
              minTop={100}
              maxTop={1000}
              top={
                <div className="pg-editor-wrap" style={{ flex: 1, height: "100%", minHeight: 0 }}>
                  <ErrorBoundary fallbackTitle="Mock Query Editor Panel">
                    <Suspense
                      fallback={
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "100%",
                            color: "var(--muted)",
                            fontSize: "14px",
                          }}
                        >
                          Loading Editor...
                        </div>
                      }
                    >
                      <Editor
                        height="100%"
                        defaultLanguage="sql"
                        theme={editorTheme === "vs-dark" && theme === "oled" ? "hc-oled" : editorTheme}
                        defaultValue={query}
                        beforeMount={handleBeforeMount}
                        onMount={handleMount}
                        onChange={handleEditorChange}
                        options={{
                          minimap: { enabled: editorMinimap },
                          fontSize: editorFontSize,
                          fontFamily: editorFontFamily,
                          tabSize: editorTabSize,
                          insertSpaces: true,
                          padding: { top: 16, bottom: 16 },
                          wordWrap: editorWordWrap ? "on" : "off",
                          autoClosingBrackets: "always",
                          autoClosingQuotes: "always",
                          tabCompletion: "on",
                        }}
                      />
                    </Suspense>
                  </ErrorBoundary>
                </div>
              }
              bottom={
                <div className="pg-result" style={{ flex: 1, height: "100%", minHeight: 0 }}>
                  <div className="result-toolbar">
                    <span className={queryResult.error ? "status-dot error" : "status-dot ok"} />
                    <strong>{queryResult.message}</strong>
                  </div>
                  <div className="table-wrap">
                    {queryResult.columns.length > 0 && (
                      <table>
                        <thead>
                          <tr>
                            {queryResult.columns.map((c) => (
                              <th key={c}>{c}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {queryResult.rows
                            .slice(resultPage * RESULT_PAGE_SIZE, (resultPage + 1) * RESULT_PAGE_SIZE)
                            .map((r, i) => (
                              <tr key={i}>
                                {queryResult.columns.map((c) => (
                                  <td key={c}>{String(r[c] ?? "NULL")}</td>
                                ))}
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                  {queryResult.rows.length > RESULT_PAGE_SIZE && (
                    <div className="table-pagination">
                      <span>
                        Showing {resultPage * RESULT_PAGE_SIZE + 1}–
                        {Math.min(queryResult.rows.length, (resultPage + 1) * RESULT_PAGE_SIZE)} of{" "}
                        {queryResult.rows.length} rows
                      </span>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          disabled={resultPage === 0}
                          onClick={() => setResultPage((p) => Math.max(0, p - 1))}
                          className="secondary-button compact"
                          style={{ padding: "2px 6px", fontSize: "10px" }}
                        >
                          Prev
                        </button>
                        <button
                          disabled={resultPage >= Math.ceil(queryResult.rows.length / RESULT_PAGE_SIZE) - 1}
                          onClick={() =>
                            setResultPage((p) =>
                              Math.min(Math.ceil(queryResult.rows.length / RESULT_PAGE_SIZE) - 1, p + 1)
                            )
                          }
                          className="secondary-button compact"
                          style={{ padding: "2px 6px", fontSize: "10px" }}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              }
            />
          </div>
        </div>

        {/* Right side locked to Question prompt */}
        <div className="pg-right-col" style={{ width: 450 }}>
          <div className="pg-tabs">
            <button className="active">
              <Lightbulb size={14} /> Question
            </button>
          </div>
          <div className="pg-tab-content">
            <div className="hint-stack">
              <p className="context-lead">{currentQ.title}</p>
              <div className="hint-scenario">{currentQ.businessScenario}</div>
              <div className="hint-prompt-box">
                <strong>Task</strong>
                <p>{currentQ.prompt}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeView === "mock-results") {
    if (!mockTest) return null;
    const score = Math.round((mockTest.answers.filter((a) => a.isCorrect).length / mockTest.questions.length) * 100);
    const q = mockTest.questions[mockReviewIndex];
    const ans = mockTest.answers[mockReviewIndex];
    const isCorrect = ans?.isCorrect ?? false;

    return (
      <div
        className="view-content mock-results-view"
        style={{ display: "flex", flexDirection: "column", height: "100%" }}
      >
        <div className="dash-hero" style={{ padding: "20px 24px", flexShrink: 0 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <p
                className="eyebrow"
                style={{ color: "var(--muted)", fontSize: "11px", textTransform: "uppercase", fontWeight: 600 }}
              >
                Mock Test Summary
              </p>
              <h1 style={{ fontSize: "24px", margin: "4px 0" }}>{mockTest.company} Results</h1>
              <p style={{ color: "var(--text-secondary)" }}>
                You scored {score}% — {mockTest.answers.filter((a) => a.isCorrect).length} out of{" "}
                {mockTest.questions.length} correct.
              </p>
            </div>
            <button
              className="primary-button"
              onClick={() => setActiveView("mocks")}
              style={{
                padding: "8px 16px",
                background: "var(--panel2)",
                border: "1px solid var(--border)",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <CheckCircle2 size={16} /> Back to Mock Tests
            </button>
          </div>
        </div>

        <div
          className="mock-review-container"
          style={{ display: "flex", flex: 1, minHeight: 0, gap: "20px", padding: "0 24px 24px 24px" }}
        >
          {/* Question Sidebar */}
          <div
            className="mock-review-sidebar"
            style={{
              width: "220px",
              background: "var(--panel)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              padding: "10px",
            }}
          >
            <h3
              style={{
                fontSize: "11px",
                textTransform: "uppercase",
                color: "var(--muted)",
                padding: "6px 8px",
                borderBottom: "1px solid var(--border)",
                marginBottom: "8px",
              }}
            >
              Questions
            </h3>
            {mockTest.questions.map((item, idx) => {
              const itemCorrect = mockTest.answers[idx]?.isCorrect ?? false;
              const active = mockReviewIndex === idx;
              return (
                <button
                  key={item.id}
                  onClick={() => setMockReviewIndex(idx)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    marginBottom: "6px",
                    background: active ? "rgba(56, 217, 255, 0.1)" : "transparent",
                    border: "1px solid " + (active ? "rgba(56, 217, 255, 0.3)" : "transparent"),
                    color: active ? "var(--cyan)" : "var(--text)",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: "13px",
                    transition: "all 120ms",
                  }}
                >
                  <span>
                    Q{idx + 1}: {item.title.slice(0, 16)}...
                  </span>
                  <span style={{ color: itemCorrect ? "var(--emerald)" : "var(--rose)", fontSize: "12px" }}>
                    {itemCorrect ? "✓" : "✗"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Details Panel */}
          <div
            className="mock-review-detail"
            style={{
              flex: 1,
              background: "var(--panel)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "24px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {q ? (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid var(--border)",
                    paddingBottom: "12px",
                  }}
                >
                  <div>
                    <h2 style={{ fontSize: "18px", fontWeight: 700 }}>
                      Q{mockReviewIndex + 1}: {q.title}
                    </h2>
                    <span
                      className={`difficulty-pill ${q.difficulty.toLowerCase()}`}
                      style={{ marginTop: "4px", display: "inline-block" }}
                    >
                      {q.difficulty}
                    </span>
                  </div>
                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      background: isCorrect ? "rgba(48, 230, 149, 0.12)" : "rgba(255, 96, 133, 0.12)",
                      color: isCorrect ? "var(--emerald)" : "var(--rose)",
                      border: "1px solid " + (isCorrect ? "rgba(48, 230, 149, 0.2)" : "rgba(255, 96, 133, 0.2)"),
                    }}
                  >
                    {isCorrect ? "PASSED" : "FAILED"}
                  </span>
                </div>

                <div>
                  <h4
                    style={{
                      color: "var(--muted)",
                      fontSize: "11px",
                      textTransform: "uppercase",
                      marginBottom: "4px",
                    }}
                  >
                    Business Scenario
                  </h4>
                  <p style={{ color: "var(--text-secondary)", fontSize: "13.5px", lineHeight: "1.5" }}>
                    {q.businessScenario}
                  </p>
                </div>

                <div>
                  <h4
                    style={{
                      color: "var(--muted)",
                      fontSize: "11px",
                      textTransform: "uppercase",
                      marginBottom: "4px",
                    }}
                  >
                    Problem Prompt
                  </h4>
                  <p style={{ color: "var(--text)", fontSize: "14px", fontWeight: 500, lineHeight: "1.5" }}>
                    {q.prompt}
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", margin: "8px 0" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <strong style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Your Answer</strong>
                    <pre
                      className="sql-pre small"
                      style={{
                        flex: 1,
                        padding: "12px",
                        background: "var(--bg)",
                        border: "1px solid var(--border)",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {ans?.query || "-- No query submitted"}
                    </pre>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <strong style={{ fontSize: "12px", color: "var(--cyan)" }}>Expected Solution</strong>
                    <pre
                      className="sql-pre small"
                      style={{
                        flex: 1,
                        padding: "12px",
                        background: "var(--bg)",
                        border: "1px solid var(--border)",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontFamily: "var(--font-mono)",
                        color: "var(--text)",
                      }}
                    >
                      {q.solution}
                    </pre>
                  </div>
                </div>

                <div
                  style={{
                    borderTop: "1px solid var(--border)",
                    paddingTop: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div>
                    <h4
                      style={{
                        color: "var(--muted)",
                        fontSize: "11px",
                        textTransform: "uppercase",
                        marginBottom: "4px",
                      }}
                    >
                      Detailed Explanation
                    </h4>
                    <p style={{ color: "var(--text-secondary)", fontSize: "13px", lineHeight: "1.5" }}>
                      {q.detailedExplanation}
                    </p>
                  </div>
                  {q.performanceNotes && (
                    <div
                      style={{
                        background: "rgba(56, 217, 255, 0.03)",
                        border: "1px solid rgba(56, 217, 255, 0.08)",
                        borderRadius: "6px",
                        padding: "12px",
                      }}
                    >
                      <h4
                        style={{
                          color: "var(--cyan)",
                          fontSize: "11px",
                          textTransform: "uppercase",
                          marginBottom: "4px",
                        }}
                      >
                        Performance Notes
                      </h4>
                      <p style={{ color: "var(--text-secondary)", fontSize: "12.5px", lineHeight: "1.4" }}>
                        {q.performanceNotes}
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  color: "var(--muted)",
                }}
              >
                Select a question to inspect details.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
