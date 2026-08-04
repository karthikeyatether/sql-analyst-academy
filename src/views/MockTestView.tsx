import type { PracticeProblem, MockInterview } from "../data/curriculum";
import type { ViewId, QAItem, MockTestResult, QueryResult } from "../types";
import React from "react";
import {
  Timer,
  CheckCircle2,
  Clock,
  Play,
  AlertTriangle,
  Lightbulb,
  ChevronRight,
  Target,
  Database,
  Table,
  Code2,
  Copy,
  Check,
  X,
  Award,
  Sparkles,
} from "lucide-react";
import type { BeforeMount, OnMount } from "@monaco-editor/react";
import type { LucideIcon } from "lucide-react";
import type { TableSchema } from "../data/datasets";
import { SplitPane, VSplitPane } from "../components/SplitPane";
import { ErrorBoundary } from "../components/ErrorBoundary";
import ErdModalView from "../components/ErdModalView";

import Editor from "@monaco-editor/react";

interface MockTestState {
  company: string;
  questions: PracticeProblem[];
  currentIndex: number;
  answers: { query: string; isCorrect: boolean }[];
  timeRemaining: number;
  isActive: boolean;
}

interface MockTestViewProps {
  activeView: "mocks" | "mock-runner" | "mock-results";
  setActiveView: (view: ViewId) => void;
  progress: {
    mockScores: Record<string, number>;
  };
  mockInterviews: MockInterview[];
  mockHistory: MockTestResult[];
  interviewQuestionBank: QAItem[];
  mockTest: MockTestState | null;
  setMockTest: React.Dispatch<React.SetStateAction<MockTestState | null>>;
  mockReviewIndex: number;
  setMockReviewIndex: (idx: number) => void;
  startMockTest: (
    company: string,
    minutes: number,
    difficulty: string,
    maxModuleId: number,
    questionsCount: number,
  ) => void;
  submitMockAnswer: (sql: string) => void;
  runCurrentQuery: () => void;
  queryRef: React.MutableRefObject<string>;
  queryResult: {
    columns: string[];
    rows: Record<string, unknown>[];
    message: string;
    error?: string;
  };
  resultPage: number;
  setResultPage: React.Dispatch<React.SetStateAction<number>>;
  RESULT_PAGE_SIZE: number;
  updateEditorQuery: (sql: string) => void;
  tableSchemas?: TableSchema[];
  liveSchema?: TableSchema[];
  expectedResult?: QueryResult | null;
  graderFeedback?: {
    isCorrect: boolean;
    message: string;
    details?: string;
    warning?: string;
  } | null;

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

function SectionTitle({
  icon: Icon,
  title,
  action,
}: {
  icon: LucideIcon;
  title: string;
  action?: string;
}) {
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
  const sqlMatch =
    a.match(/```sql([\s\S]*?)```/) || a.match(/```([\s\S]*?)```/);
  const tryQuery = sqlMatch ? sqlMatch[1].trim() : null;

  return (
    <div className="qa-card">
      <button className="qa-question" onClick={() => setOpen((o) => !o)}>
        <span>{q}</span>
        <ChevronRight size={14} className={open ? "rotated" : ""} />
      </button>
      {open && (
        <div
          className="qa-answer"
          style={{ display: "flex", flexDirection: "column", gap: "8px" }}
        >
          <p style={{ whiteSpace: "pre-wrap" }}>{a}</p>
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
          {tryQuery && onTry && (
            <div style={{ marginTop: "6px" }}>
              <button
                className="secondary-button compact"
                onClick={() => onTry(tryQuery)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  padding: "6px 12px",
                }}
              >
                <Code2 size={14} /> Try SQL in Playground
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MockTestView({
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
  tableSchemas = [],
  liveSchema = [],
  expectedResult = null,
  graderFeedback = null,
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
  const resolvedTheme =
    editorTheme === "light" ? "vs" : editorTheme || "vs-dark";
  const [editorHeight, setEditorHeight] = React.useState(350);
  const [splitWidth, setSplitWidth] = React.useState(440);
  const [activeLeftTab, setActiveLeftTab] = React.useState<
    "question" | "schema"
  >("question");
  const [activeResultTab, setActiveResultTab] = React.useState<
    "output" | "expected"
  >("output");
  const [schemaSearch, setSchemaSearch] = React.useState("");
  const [erdModalOpen, setErdModalOpen] = React.useState(false);
  const [copiedTable, setCopiedTable] = React.useState<string | null>(null);
  const [expectedResultPage, setExpectedResultPage] = React.useState(0);

  const currentSchema = React.useMemo(() => {
    return liveSchema && liveSchema.length > 0 ? liveSchema : tableSchemas;
  }, [liveSchema, tableSchemas]);

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  }

  if (activeView === "mocks") {
    const getWeight = (diff: string): number => {
      const d = (diff || "").toLowerCase();
      if (d === "beginner") return 1;
      if (d.includes("beginner") && d.includes("intermediate")) return 2;
      if (d === "intermediate") return 3;
      if (d.includes("intermediate") && d.includes("advanced")) return 4;
      if (d.includes("advanced") && d.includes("expert")) return 6;
      if (d.includes("advanced")) return 5;
      if (d.includes("expert")) return 7;
      return 99;
    };

    return (
      <div className="view-content">
        <div className="surface-panel">
          <SectionTitle
            icon={Timer}
            title="Mock Interviews & Assessment Arena"
            action="Company-style SQL technical rounds"
          />
          <p
            style={{
              color: "var(--muted)",
              marginBottom: "1.5rem",
              fontSize: "13.5px",
            }}
          >
            Each mock round simulates a real-world company data analyst
            technical SQL exam. Test your proficiency under time constraints
            against actual target tables and schema definitions.
          </p>
          <div className="mock-grid">
            {[...mockInterviews]
              .sort((a, b) => {
                const wa = getWeight(a.difficulty);
                const wb = getWeight(b.difficulty);
                if (wa !== wb) return wa - wb;
                return a.company.localeCompare(b.company);
              })
              .map((m) => (
                <article
                  key={m.company}
                  className="mock-card"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div
                      className="mock-head"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "18px",
                          fontWeight: "bold",
                          margin: 0,
                          color: "var(--text)",
                        }}
                      >
                        {m.company}
                      </h3>
                      <span
                        className={`difficulty-pill ${
                          m.difficulty.includes("Expert")
                            ? "expert"
                            : m.difficulty.includes("Advanced")
                              ? "hard"
                              : m.difficulty.includes("Intermediate")
                                ? "medium"
                                : "easy"
                        }`}
                      >
                        {m.difficulty}
                      </span>
                    </div>
                    <p
                      className="mock-focus"
                      style={{
                        minHeight: "38px",
                        color: "var(--text-secondary)",
                        fontSize: "13px",
                        lineHeight: "1.4",
                        margin: "8px 0 16px 0",
                      }}
                    >
                      {m.focus}
                    </p>
                    <div
                      className="mock-stats"
                      style={{
                        display: "flex",
                        gap: "12px",
                        fontSize: "12px",
                        color: "var(--muted)",
                        marginBottom: "16px",
                        background: "rgba(255,255,255,0.02)",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Clock size={13} style={{ color: "var(--cyan)" }} />{" "}
                        {m.minutes} Min
                      </span>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Target size={13} style={{ color: "var(--cyan)" }} />{" "}
                        {m.questions} Qs
                      </span>
                    </div>
                    {progress.mockScores[m.company] !== undefined && (
                      <div style={{ marginBottom: "16px" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "12px",
                            marginBottom: "6px",
                          }}
                        >
                          <span style={{ color: "var(--muted)" }}>
                            Readiness Score
                          </span>
                          <strong style={{ color: "var(--emerald)" }}>
                            {progress.mockScores[m.company]}%
                          </strong>
                        </div>
                        <div
                          style={{
                            width: "100%",
                            height: "6px",
                            background: "rgba(255,255,255,0.1)",
                            borderRadius: "3px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${progress.mockScores[m.company]}%`,
                              background:
                                "linear-gradient(90deg, var(--cyan), var(--emerald))",
                              transition: "width 0.5s ease",
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    className="primary-button compact"
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      gap: "8px",
                      padding: "10px",
                      fontSize: "13.5px",
                      fontWeight: "bold",
                    }}
                    onClick={() =>
                      startMockTest(
                        m.company,
                        m.minutes,
                        m.difficulty,
                        m.maxModuleId,
                        m.questions,
                      )
                    }
                  >
                    <Play size={15} /> Start Timed Round
                  </button>
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
                    <h4
                      style={{
                        margin: 0,
                        fontSize: "13px",
                        color: "var(--text)",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Award size={14} style={{ color: "var(--cyan)" }} />
                      {item.company}
                    </h4>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "var(--muted)",
                        marginTop: "2px",
                        display: "block",
                      }}
                    >
                      {new Date(item.date).toLocaleDateString()} at{" "}
                      {new Date(item.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span
                      className={`difficulty-pill ${
                        item.score >= 70
                          ? "easy"
                          : item.score >= 40
                            ? "medium"
                            : "hard"
                      }`}
                      style={{ fontWeight: "bold", padding: "4px 10px" }}
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
                fontSize: "13px",
              }}
            >
              No mock interviews completed yet. Select a company round above to
              initiate your technical training!
            </div>
          )}
        </div>

        {/* Interview Q&A Bank */}
        <div className="surface-panel" style={{ marginTop: "16px" }}>
          <SectionTitle
            icon={Target}
            title="Technical Q&A Knowledge Bank"
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

    // Compute required tables for this question
    const text = `${currentQ.prompt} ${currentQ.solution || ""}`.toLowerCase();
    const relevantTables = currentSchema.filter((t) =>
      new RegExp(`\\b${t.name}\\b`, "i").test(text),
    );
    const isRelevant = (name: string) =>
      relevantTables.some((rt) => rt.name === name);
    const activeTables = currentSchema.filter((t) => isRelevant(t.name));
    const otherTables = currentSchema.filter((t) => !isRelevant(t.name));

    const leftPanelContent = (
      <div
        className="pg-right-col"
        style={{
          width: "100%",
          height: "100%",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <div className="pg-tabs" style={{ flexShrink: 0 }}>
          <button
            className={activeLeftTab === "question" ? "active" : ""}
            onClick={() => setActiveLeftTab("question")}
          >
            <Lightbulb size={14} /> Question
          </button>
          <button
            className={activeLeftTab === "schema" ? "active" : ""}
            onClick={() => setActiveLeftTab("schema")}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Database size={14} /> Required Tables
            {activeTables.length > 0 && (
              <span
                style={{
                  background: "var(--cyan)",
                  color: "black",
                  borderRadius: "12px",
                  padding: "1px 6px",
                  fontSize: "10px",
                  fontWeight: 700,
                }}
              >
                {activeTables.length}
              </span>
            )}
          </button>
        </div>
        <div
          className="pg-tab-content"
          style={{ overflowY: "auto", flex: 1, padding: "16px" }}
        >
          {activeLeftTab === "question" ? (
            <div className="hint-stack">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "6px",
                }}
              >
                <span
                  className={`difficulty-pill ${currentQ.difficulty.toLowerCase()}`}
                >
                  {currentQ.difficulty}
                </span>
                <span
                  style={{
                    fontSize: "11.5px",
                    color: "var(--muted)",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontWeight: 600,
                  }}
                >
                  <Award size={13} style={{ color: "var(--cyan)" }} />{" "}
                  {mockTest.company} Round
                </span>
              </div>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "var(--text)",
                  margin: "4px 0 10px 0",
                  lineHeight: "1.3",
                }}
              >
                {currentQ.title}
              </h3>
              <div className="hint-scenario" style={{ marginBottom: "14px" }}>
                <strong
                  style={{
                    fontSize: "11.5px",
                    color: "var(--cyan)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Business Scenario
                </strong>
                <span
                  style={{
                    fontSize: "13.5px",
                    color: "var(--text-secondary)",
                    lineHeight: "1.5",
                  }}
                >
                  {currentQ.businessScenario}
                </span>
              </div>
              <div
                className="hint-prompt-box"
                style={{
                  padding: "14px",
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  marginBottom: "16px",
                }}
              >
                <strong
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "var(--text)",
                    fontSize: "13px",
                    marginBottom: "8px",
                  }}
                >
                  <Target size={15} style={{ color: "var(--cyan)" }} /> Task
                  Requirement
                </strong>
                <p
                  style={{
                    fontSize: "14px",
                    lineHeight: "1.5",
                    color: "var(--text)",
                    margin: 0,
                    fontWeight: 500,
                  }}
                >
                  {currentQ.prompt}
                </p>
              </div>
              <div
                style={{
                  padding: "12px 14px",
                  background: "rgba(56, 217, 255, 0.04)",
                  borderRadius: "8px",
                  border: "1px solid rgba(56, 217, 255, 0.2)",
                }}
              >
                <strong
                  style={{
                    fontSize: "12px",
                    color: "var(--cyan)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Sparkles size={14} /> Assessment Tips
                </strong>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--muted)",
                    margin: "6px 0 0 0",
                    lineHeight: "1.4",
                  }}
                >
                  Switch to the <strong>Required Tables</strong> tab to inspect
                  relevant schema structures. Hit &quot;Run Query&quot; to check
                  your output against the target expectations!
                </p>
              </div>
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              <div>
                <input
                  type="text"
                  placeholder="Filter table or column name..."
                  value={schemaSearch}
                  onChange={(e) => setSchemaSearch(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    color: "var(--text)",
                    fontSize: "12.5px",
                  }}
                />
              </div>
              <div
                onClick={() => setErdModalOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  background: "rgba(56, 217, 255, 0.08)",
                  border: "1px solid rgba(56, 217, 255, 0.3)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 150ms",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <Database size={17} style={{ color: "var(--cyan)" }} />
                  <div>
                    <strong
                      style={{
                        display: "block",
                        fontSize: "13px",
                        color: "var(--text)",
                      }}
                    >
                      Interactive ERD Explorer
                    </strong>
                    <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                      Visualize database relationships and primary/foreign keys
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: "var(--cyan)" }} />
              </div>

              {/* Required Tables */}
              <div>
                <h4
                  style={{
                    fontSize: "11px",
                    textTransform: "uppercase",
                    color: "var(--cyan)",
                    letterSpacing: "0.5px",
                    marginBottom: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Table size={13} /> Required Tables ({activeTables.length})
                </h4>
                {activeTables.length === 0 ? (
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--muted)",
                      fontStyle: "italic",
                      padding: "8px 0",
                    }}
                  >
                    No explicit tables highlighted for this query; explore all
                    schema tables below.
                  </p>
                ) : (
                  activeTables
                    .filter(
                      (t) =>
                        !schemaSearch ||
                        t.name
                          .toLowerCase()
                          .includes(schemaSearch.toLowerCase()) ||
                        t.columns.some((c) =>
                          c.name
                            .toLowerCase()
                            .includes(schemaSearch.toLowerCase()),
                        ),
                    )
                    .map((table) => (
                      <div
                        key={table.name}
                        style={{
                          marginBottom: "12px",
                          background: "var(--panel2)",
                          border: "1px solid rgba(56, 217, 255, 0.25)",
                          borderRadius: "8px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            padding: "10px 14px",
                            background: "rgba(56, 217, 255, 0.06)",
                            borderBottom: "1px solid var(--border)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <strong
                            style={{
                              fontSize: "13px",
                              color: "var(--cyan)",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              fontFamily: "var(--font-mono)",
                            }}
                          >
                            <Table size={14} /> {table.name}
                          </strong>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `SELECT * FROM ${table.name} LIMIT 5;`,
                              );
                              setCopiedTable(table.name);
                              setTimeout(() => setCopiedTable(null), 2000);
                            }}
                            className="secondary-button compact"
                            style={{
                              padding: "4px 8px",
                              fontSize: "11px",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            {copiedTable === table.name ? (
                              <Check size={12} color="var(--emerald)" />
                            ) : (
                              <Copy size={12} />
                            )}
                            {copiedTable === table.name
                              ? "Copied SQL"
                              : "Query 5 Rows"}
                          </button>
                        </div>
                        <div style={{ padding: "8px 14px", fontSize: "12px" }}>
                          <table
                            style={{
                              width: "100%",
                              borderCollapse: "collapse",
                            }}
                          >
                            <tbody>
                              {table.columns.map((col) => (
                                <tr
                                  key={col.name}
                                  style={{
                                    borderBottom:
                                      "1px solid rgba(255,255,255,0.04)",
                                  }}
                                >
                                  <td
                                    style={{
                                      padding: "5px 0",
                                      fontFamily: "var(--font-mono)",
                                      color: "var(--text)",
                                      fontWeight: 500,
                                    }}
                                  >
                                    {col.name}
                                  </td>
                                  <td
                                    style={{
                                      padding: "5px 8px",
                                      color: "var(--muted)",
                                      fontSize: "11px",
                                    }}
                                  >
                                    {col.type}
                                  </td>
                                  <td
                                    style={{
                                      padding: "5px 0",
                                      textAlign: "right",
                                      fontSize: "11px",
                                      color: "var(--muted)",
                                    }}
                                  >
                                    {col.name === table.primaryKey ? (
                                      <span
                                        style={{
                                          background:
                                            "rgba(245, 158, 11, 0.15)",
                                          color: "#f59e0b",
                                          padding: "2px 6px",
                                          borderRadius: "4px",
                                          fontWeight: 600,
                                          border:
                                            "1px solid rgba(245, 158, 11, 0.3)",
                                        }}
                                      >
                                        PK
                                      </span>
                                    ) : (
                                      <span
                                        style={{
                                          fontStyle: "italic",
                                          fontSize: "11px",
                                        }}
                                      >
                                        {col.note}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))
                )}
              </div>

              {/* Other Tables */}
              {otherTables.length > 0 && (
                <div style={{ marginTop: "8px" }}>
                  <h4
                    style={{
                      fontSize: "11px",
                      textTransform: "uppercase",
                      color: "var(--muted)",
                      letterSpacing: "0.5px",
                      marginBottom: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    Other Database Tables ({otherTables.length})
                  </h4>
                  {otherTables
                    .filter(
                      (t) =>
                        !schemaSearch ||
                        t.name
                          .toLowerCase()
                          .includes(schemaSearch.toLowerCase()) ||
                        t.columns.some((c) =>
                          c.name
                            .toLowerCase()
                            .includes(schemaSearch.toLowerCase()),
                        ),
                    )
                    .map((table) => (
                      <div
                        key={table.name}
                        style={{
                          marginBottom: "8px",
                          background: "var(--bg)",
                          border: "1px solid var(--border)",
                          borderRadius: "6px",
                          padding: "8px 12px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <strong
                            style={{
                              fontSize: "12px",
                              color: "var(--text-secondary)",
                              fontFamily: "var(--font-mono)",
                            }}
                          >
                            {table.name}{" "}
                            <span
                              style={{
                                color: "var(--muted)",
                                fontWeight: "normal",
                                fontSize: "11px",
                              }}
                            >
                              ({table.columns.length} cols)
                            </span>
                          </strong>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );

    const rightPanelContent = (
      <div
        className="pg-editor-col"
        style={{
          flex: 1,
          height: "100%",
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          className="pg-toolbar mock-toolbar"
          style={{
            borderBottom: "1px solid var(--border)",
            background: "var(--panel)",
            padding: "8px 16px",
            flexShrink: 0,
          }}
        >
          <div
            className="pg-toolbar-left"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(56, 217, 255, 0.12)",
                color: "var(--cyan)",
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "12.5px",
                fontWeight: "bold",
                border: "1px solid rgba(56, 217, 255, 0.25)",
              }}
            >
              <Timer size={15} /> {mockTest.company}
            </span>
            <span
              style={{
                background: "rgba(255,255,255,0.06)",
                color: "var(--text)",
                padding: "4px 10px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 600,
                border: "1px solid var(--border)",
              }}
            >
              Question {mockTest.currentIndex + 1} of{" "}
              {mockTest.questions.length}
            </span>
            <span
              className={`mock-timer ${mockTest.timeRemaining < 300 ? "danger" : ""}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 12px",
                borderRadius: "6px",
                background:
                  mockTest.timeRemaining < 60
                    ? "rgba(239, 68, 68, 0.2)"
                    : mockTest.timeRemaining < 300
                      ? "rgba(245, 158, 11, 0.2)"
                      : "rgba(0,0,0,0.25)",
                color:
                  mockTest.timeRemaining < 60
                    ? "#ef4444"
                    : mockTest.timeRemaining < 300
                      ? "#f59e0b"
                      : "var(--text)",
                border: `1px solid ${mockTest.timeRemaining < 60 ? "#ef4444" : mockTest.timeRemaining < 300 ? "#f59e0b" : "var(--border)"}`,
                fontWeight: 700,
                fontSize: "13px",
                fontFamily: "var(--font-mono)",
              }}
            >
              <Clock size={14} /> {formatTime(mockTest.timeRemaining)}
            </span>
          </div>
          <div
            className="pg-toolbar-right"
            style={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            <button
              className="primary-button run-btn"
              onClick={runCurrentQuery}
              style={{
                padding: "6px 14px",
                fontSize: "13px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Play size={14} /> Run Query
            </button>
            <button
              className="primary-button compact"
              style={{
                background: "var(--emerald)",
                color: "#000",
                padding: "6px 16px",
                fontWeight: 700,
                fontSize: "13px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
              onClick={() => submitMockAnswer(queryRef.current)}
            >
              Submit & Next <CheckCircle2 size={15} />
            </button>
          </div>
        </div>

        {mockTest.timeRemaining <= 300 && (
          <div
            style={{
              background:
                mockTest.timeRemaining <= 60
                  ? "rgba(239, 68, 68, 0.15)"
                  : "rgba(245, 158, 11, 0.15)",
              borderBottom:
                mockTest.timeRemaining <= 60
                  ? "1px solid #ef4444"
                  : "1px solid #f59e0b",
              color: mockTest.timeRemaining <= 60 ? "#ef4444" : "#f59e0b",
              padding: "8px 16px",
              fontSize: "12.5px",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={15} />
            <span>
              {mockTest.timeRemaining <= 60
                ? "CRITICAL: Less than 1 minute remaining! Submit your answer immediately!"
                : `WARNING: Less than 5 minutes remaining (${formatTime(mockTest.timeRemaining)} left)`}
            </span>
          </div>
        )}

        <div
          style={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <VSplitPane
            topHeight={editorHeight}
            onResize={setEditorHeight}
            minTop={120}
            maxTop={800}
            top={
              <div
                className="pg-editor-wrap"
                style={{ flex: 1, height: "100%", minHeight: 0 }}
              >
                <ErrorBoundary fallbackTitle="Mock Query Editor Panel">
                  <Editor
                    height="100%"
                    defaultLanguage="sql"
                    theme={
                      theme === "oled"
                        ? "hc-oled"
                        : theme === "light"
                          ? "vs"
                          : resolvedTheme
                    }
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
                      multiCursorModifier: "alt",
                      multiCursorMergeOverlapping: true,
                      bracketPairColorization: { enabled: true },
                      autoClosingBrackets: "always",
                      autoClosingQuotes: "always",
                      tabCompletion: "on",
                      smoothScrolling: true,
                      cursorSmoothCaretAnimation: "on",
                      cursorBlinking: "smooth",
                    }}
                  />
                </ErrorBoundary>
              </div>
            }
            bottom={
              <div
                className="pg-result"
                style={{
                  flex: 1,
                  height: "100%",
                  minHeight: 0,
                  display: "flex",
                  flexDirection: "column",
                  background: "var(--panel)",
                }}
              >
                {/* Result Tab Bar & Verdict Badge */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 16px",
                    borderBottom: "1px solid var(--border)",
                    background: "rgba(0,0,0,0.2)",
                    flexWrap: "wrap",
                    gap: "10px",
                    flexShrink: 0,
                  }}
                >
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => setActiveResultTab("output")}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "6px",
                        fontSize: "12.5px",
                        fontWeight: 600,
                        background:
                          activeResultTab === "output"
                            ? "rgba(56, 217, 255, 0.15)"
                            : "transparent",
                        color:
                          activeResultTab === "output"
                            ? "var(--cyan)"
                            : "var(--text-secondary)",
                        border: `1px solid ${activeResultTab === "output" ? "rgba(56, 217, 255, 0.4)" : "transparent"}`,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Table size={13} /> Your Output (
                      {queryResult.rows ? queryResult.rows.length : 0})
                    </button>
                    <button
                      onClick={() => setActiveResultTab("expected")}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "6px",
                        fontSize: "12.5px",
                        fontWeight: 600,
                        background:
                          activeResultTab === "expected"
                            ? "rgba(56, 217, 255, 0.15)"
                            : "transparent",
                        color:
                          activeResultTab === "expected"
                            ? "var(--cyan)"
                            : "var(--text-secondary)",
                        border: `1px solid ${activeResultTab === "expected" ? "rgba(56, 217, 255, 0.4)" : "transparent"}`,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Target size={13} /> Expected Output (
                      {expectedResult
                        ? (expectedResult.rows?.length ?? 0)
                        : "?"}
                      )
                    </button>
                  </div>

                  {/* Verdict Badge */}
                  <div>
                    {graderFeedback &&
                    queryResult.rows &&
                    queryResult.message !== "Run your query to test it." ? (
                      graderFeedback.isCorrect ? (
                        <span
                          style={{
                            background: "rgba(16, 185, 129, 0.15)",
                            color: "var(--emerald)",
                            border: "1px solid rgba(16, 185, 129, 0.4)",
                            padding: "4px 12px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "bold",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <CheckCircle2 size={14} /> ✓ Output Matches Expected
                          Target!
                        </span>
                      ) : (
                        <span
                          style={{
                            background: "rgba(239, 68, 68, 0.15)",
                            color: "#ef4444",
                            border: "1px solid rgba(239, 68, 68, 0.4)",
                            padding: "4px 12px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "bold",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <X size={14} /> ✗ Mismatch: {graderFeedback.message}
                        </span>
                      )
                    ) : (
                      <span
                        style={{
                          fontSize: "12px",
                          color: "var(--muted)",
                          fontStyle: "italic",
                        }}
                      >
                        Click &quot;Run Query&quot; to verify output against
                        expected results
                      </span>
                    )}
                  </div>
                </div>

                {/* Table Body Container */}
                <div
                  style={{ flex: 1, overflow: "auto", padding: "12px 16px" }}
                >
                  {activeResultTab === "output" ? (
                    queryResult.error ? (
                      <div
                        style={{
                          padding: "16px",
                          background: "rgba(239, 68, 68, 0.1)",
                          border: "1px solid rgba(239, 68, 68, 0.4)",
                          borderRadius: "6px",
                          color: "#ef4444",
                          fontSize: "13px",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        <strong
                          style={{ display: "block", marginBottom: "4px" }}
                        >
                          SQL Execution Error:
                        </strong>
                        {queryResult.error}
                      </div>
                    ) : queryResult.columns.length > 0 ? (
                      <div className="table-wrap">
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
                              .slice(
                                resultPage * RESULT_PAGE_SIZE,
                                (resultPage + 1) * RESULT_PAGE_SIZE,
                              )
                              .map((r, i) => (
                                <tr key={i}>
                                  {queryResult.columns.map((c) => (
                                    <td key={c}>{String(r[c] ?? "NULL")}</td>
                                  ))}
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "36px",
                          color: "var(--muted)",
                          fontSize: "13.5px",
                        }}
                      >
                        {queryResult.message}
                      </div>
                    )
                  ) : /* Expected Output Tab */
                  expectedResult ? (
                    expectedResult.error ? (
                      <div style={{ color: "#ef4444", fontSize: "13px" }}>
                        Error computing expected result: {expectedResult.error}
                      </div>
                    ) : (expectedResult.columns?.length ?? 0) > 0 ? (
                      <div className="table-wrap">
                        <table>
                          <thead>
                            <tr>
                              {expectedResult.columns.map((c) => (
                                <th key={c}>{c}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {expectedResult.rows
                              .slice(
                                expectedResultPage * RESULT_PAGE_SIZE,
                                (expectedResultPage + 1) * RESULT_PAGE_SIZE,
                              )
                              .map((r, i) => (
                                <tr key={i}>
                                  {expectedResult.columns.map((c) => (
                                    <td key={c}>{String(r[c] ?? "NULL")}</td>
                                  ))}
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "36px",
                          color: "var(--muted)",
                          fontSize: "13.5px",
                        }}
                      >
                        Expected result returned zero rows or no table output.
                      </div>
                    )
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "36px",
                        color: "var(--muted)",
                        fontSize: "13.5px",
                        background: "rgba(255,255,255,0.01)",
                        border: "1px dashed var(--border)",
                        borderRadius: "8px",
                        margin: "12px 0",
                      }}
                    >
                      Run your query first to compute and display the target
                      Expected Output table!
                    </div>
                  )}
                </div>

                {/* Pagination Controls */}
                {activeResultTab === "output" &&
                  queryResult.rows.length > RESULT_PAGE_SIZE && (
                    <div
                      className="table-pagination"
                      style={{
                        padding: "8px 16px",
                        borderTop: "1px solid var(--border)",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "12px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Showing {resultPage * RESULT_PAGE_SIZE + 1}–
                        {Math.min(
                          queryResult.rows.length,
                          (resultPage + 1) * RESULT_PAGE_SIZE,
                        )}{" "}
                        of {queryResult.rows.length} rows
                      </span>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          disabled={resultPage === 0}
                          onClick={() =>
                            setResultPage((p) => Math.max(0, p - 1))
                          }
                          className="secondary-button compact"
                          style={{ padding: "4px 10px", fontSize: "11px" }}
                        >
                          Prev
                        </button>
                        <button
                          disabled={
                            resultPage >=
                            Math.ceil(
                              queryResult.rows.length / RESULT_PAGE_SIZE,
                            ) -
                              1
                          }
                          onClick={() =>
                            setResultPage((p) =>
                              Math.min(
                                Math.ceil(
                                  queryResult.rows.length / RESULT_PAGE_SIZE,
                                ) - 1,
                                p + 1,
                              ),
                            )
                          }
                          className="secondary-button compact"
                          style={{ padding: "4px 10px", fontSize: "11px" }}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                {activeResultTab === "expected" &&
                  expectedResult &&
                  (expectedResult.rows?.length ?? 0) > RESULT_PAGE_SIZE && (
                    <div
                      className="table-pagination"
                      style={{
                        padding: "8px 16px",
                        borderTop: "1px solid var(--border)",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "12px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Showing {expectedResultPage * RESULT_PAGE_SIZE + 1}–
                        {Math.min(
                          expectedResult.rows!.length,
                          (expectedResultPage + 1) * RESULT_PAGE_SIZE,
                        )}{" "}
                        of {expectedResult.rows!.length} rows
                      </span>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          disabled={expectedResultPage === 0}
                          onClick={() =>
                            setExpectedResultPage((p) => Math.max(0, p - 1))
                          }
                          className="secondary-button compact"
                          style={{ padding: "4px 10px", fontSize: "11px" }}
                        >
                          Prev
                        </button>
                        <button
                          disabled={
                            expectedResultPage >=
                            Math.ceil(
                              expectedResult.rows!.length / RESULT_PAGE_SIZE,
                            ) -
                              1
                          }
                          onClick={() =>
                            setExpectedResultPage((p) =>
                              Math.min(
                                Math.ceil(
                                  expectedResult.rows!.length /
                                    RESULT_PAGE_SIZE,
                                ) - 1,
                                p + 1,
                              ),
                            )
                          }
                          className="secondary-button compact"
                          style={{ padding: "4px 10px", fontSize: "11px" }}
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
    );

    return (
      <div
        className="playground-fullscreen mock-test-mode"
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          overflow: "hidden",
        }}
      >
        <SplitPane
          leftWidth={splitWidth}
          onResize={setSplitWidth}
          left={leftPanelContent}
          right={rightPanelContent}
        />
        {erdModalOpen && (
          <ErdModalView
            setErdModalOpen={setErdModalOpen}
            liveSchema={liveSchema}
            tableSchemas={tableSchemas}
          />
        )}
      </div>
    );
  }

  if (activeView === "mock-results") {
    if (!mockTest) return null;
    const score = Math.round(
      (mockTest.answers.filter((a) => a.isCorrect).length /
        mockTest.questions.length) *
        100,
    );
    const q = mockTest.questions[mockReviewIndex];
    const ans = mockTest.answers[mockReviewIndex];
    const isCorrect = ans?.isCorrect ?? false;

    return (
      <div
        className="view-content mock-results-view"
        style={{ display: "flex", flexDirection: "column", height: "100%" }}
      >
        <div
          className="dash-hero"
          style={{ padding: "24px 28px", flexShrink: 0 }}
        >
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
                style={{
                  color: "var(--muted)",
                  fontSize: "11.5px",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  letterSpacing: "0.5px",
                  marginBottom: "4px",
                }}
              >
                Assessment Complete &bull; Review Hall
              </p>
              <h1
                style={{
                  fontSize: "26px",
                  margin: "4px 0 6px 0",
                  fontWeight: 800,
                }}
              >
                {mockTest.company} Round Summary
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                You achieved an interview score of{" "}
                <strong style={{ color: "var(--emerald)" }}>{score}%</strong> —{" "}
                {mockTest.answers.filter((a) => a.isCorrect).length} out of{" "}
                {mockTest.questions.length} problems passed verification.
              </p>
            </div>
            <button
              className="primary-button"
              onClick={() => setActiveView("mocks")}
              style={{
                padding: "10px 18px",
                background: "var(--panel2)",
                border: "1px solid var(--border)",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13.5px",
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={16} /> Back to Interview Lobby
            </button>
          </div>
        </div>

        <div
          className="mock-review-container"
          style={{
            display: "flex",
            flex: 1,
            minHeight: 0,
            gap: "20px",
            padding: "0 24px 24px 24px",
          }}
        >
          {/* Question Sidebar */}
          <div
            className="mock-review-sidebar"
            style={{
              width: "240px",
              background: "var(--panel)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              padding: "12px",
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
                letterSpacing: "0.5px",
              }}
            >
              Attempted Questions
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
                    padding: "10px 12px",
                    borderRadius: "6px",
                    marginBottom: "6px",
                    background: active
                      ? "rgba(56, 217, 255, 0.12)"
                      : "transparent",
                    border:
                      "1px solid " +
                      (active ? "rgba(56, 217, 255, 0.35)" : "transparent"),
                    color: active ? "var(--cyan)" : "var(--text)",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: "13px",
                    fontWeight: active ? 600 : 400,
                    transition: "all 120ms",
                  }}
                >
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      marginRight: "8px",
                    }}
                  >
                    Q{idx + 1}: {item.title}
                  </span>
                  <span
                    style={{
                      color: itemCorrect ? "var(--emerald)" : "#ef4444",
                      fontSize: "13px",
                      fontWeight: "bold",
                      flexShrink: 0,
                    }}
                  >
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
              gap: "18px",
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
                    paddingBottom: "14px",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div>
                    <h2
                      style={{
                        fontSize: "20px",
                        fontWeight: 700,
                        margin: "0 0 6px 0",
                        color: "var(--text)",
                      }}
                    >
                      Q{mockReviewIndex + 1}: {q.title}
                    </h2>
                    <span
                      className={`difficulty-pill ${q.difficulty.toLowerCase()}`}
                      style={{ display: "inline-block" }}
                    >
                      {q.difficulty}
                    </span>
                  </div>
                  <span
                    style={{
                      padding: "6px 14px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      background: isCorrect
                        ? "rgba(16, 185, 129, 0.15)"
                        : "rgba(239, 68, 68, 0.15)",
                      color: isCorrect ? "var(--emerald)" : "#ef4444",
                      border:
                        "1px solid " +
                        (isCorrect
                          ? "rgba(16, 185, 129, 0.4)"
                          : "rgba(239, 68, 68, 0.4)"),
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {isCorrect ? <CheckCircle2 size={15} /> : <X size={15} />}
                    {isCorrect ? "PASSED ASSESSMENT" : "FAILED ASSESSMENT"}
                  </span>
                </div>

                <div>
                  <h4
                    style={{
                      color: "var(--cyan)",
                      fontSize: "11.5px",
                      textTransform: "uppercase",
                      marginBottom: "6px",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Business Scenario
                  </h4>
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "14px",
                      lineHeight: "1.5",
                      margin: 0,
                    }}
                  >
                    {q.businessScenario}
                  </p>
                </div>

                <div>
                  <h4
                    style={{
                      color: "var(--muted)",
                      fontSize: "11.5px",
                      textTransform: "uppercase",
                      marginBottom: "6px",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Problem Prompt
                  </h4>
                  <p
                    style={{
                      color: "var(--text)",
                      fontSize: "14.5px",
                      fontWeight: 500,
                      lineHeight: "1.5",
                      margin: 0,
                    }}
                  >
                    {q.prompt}
                  </p>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                    margin: "8px 0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <strong
                        style={{
                          fontSize: "13px",
                          color: "var(--text-secondary)",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <Code2 size={15} /> Your Submitted Query
                      </strong>
                      {ans?.query && (
                        <button
                          className="secondary-button compact"
                          onClick={() => {
                            updateEditorQuery(ans.query);
                            setActiveView("playground");
                          }}
                          style={{
                            padding: "4px 10px",
                            fontSize: "11.5px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Play size={13} /> Test in Playground
                        </button>
                      )}
                    </div>
                    <pre
                      className="sql-pre small"
                      style={{
                        flex: 1,
                        padding: "14px",
                        background: "var(--bg)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        fontSize: "12.5px",
                        fontFamily: "var(--font-mono)",
                        color: ans?.query ? "var(--text)" : "var(--muted)",
                        overflowX: "auto",
                        lineHeight: "1.5",
                        margin: 0,
                      }}
                    >
                      {ans?.query || "-- No query submitted for this question"}
                    </pre>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <strong
                        style={{
                          fontSize: "13px",
                          color: "var(--cyan)",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <Target size={15} /> Reference Optimal Solution
                      </strong>
                      <button
                        className="secondary-button compact"
                        onClick={() => {
                          updateEditorQuery(q.solution);
                          setActiveView("playground");
                        }}
                        style={{
                          padding: "4px 10px",
                          fontSize: "11.5px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Code2 size={13} /> Open in Playground
                      </button>
                    </div>
                    <pre
                      className="sql-pre small"
                      style={{
                        flex: 1,
                        padding: "14px",
                        background: "var(--bg)",
                        border: "1px solid rgba(56, 217, 255, 0.3)",
                        borderRadius: "8px",
                        fontSize: "12.5px",
                        fontFamily: "var(--font-mono)",
                        color: "var(--cyan)",
                        overflowX: "auto",
                        lineHeight: "1.5",
                        margin: 0,
                      }}
                    >
                      {q.solution}
                    </pre>
                  </div>
                </div>

                <div
                  style={{
                    borderTop: "1px solid var(--border)",
                    paddingTop: "18px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                  }}
                >
                  <div>
                    <h4
                      style={{
                        color: "var(--muted)",
                        fontSize: "11.5px",
                        textTransform: "uppercase",
                        marginBottom: "6px",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Detailed Explanation
                    </h4>
                    <p
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "13.5px",
                        lineHeight: "1.5",
                        margin: 0,
                      }}
                    >
                      {q.detailedExplanation}
                    </p>
                  </div>
                  {q.performanceNotes && (
                    <div
                      style={{
                        background: "rgba(56, 217, 255, 0.035)",
                        border: "1px solid rgba(56, 217, 255, 0.15)",
                        borderRadius: "8px",
                        padding: "14px",
                      }}
                    >
                      <h4
                        style={{
                          color: "var(--cyan)",
                          fontSize: "11.5px",
                          textTransform: "uppercase",
                          marginBottom: "6px",
                          letterSpacing: "0.5px",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <Sparkles size={14} /> Performance & Optimization Notes
                      </h4>
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "13px",
                          lineHeight: "1.5",
                          margin: 0,
                        }}
                      >
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
                  fontSize: "14px",
                }}
              >
                Select an attempted question from the sidebar to inspect
                detailed results and diffs.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default React.memo(MockTestView);
