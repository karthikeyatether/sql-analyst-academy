import React, { useState } from "react";
import {
  BookOpen,
  Zap,
  CheckCircle2,
  Lock,
  Lightbulb,
  Eye,
  Play,
  Clipboard,
  Brain,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import type {
  RoadmapModule,
  PracticeProblem,
  Difficulty,
} from "../../data/curriculum";
import LessonProse from "../../components/LessonProse";
import { DoVsDontCard } from "../../components/DoVsDontCard";
import type { ViewId, PlaygroundMode } from "../../types";

interface ModulesViewProps {
  activeModule: RoadmapModule;
  roadmapModules: RoadmapModule[];
  progress: {
    completedModules: number[];
    solvedProblems: string[];
  };
  selectModule: (m: RoadmapModule) => void;
  setActiveView: (view: ViewId) => void;
  openInPlayground: (p: PracticeProblem) => void;
  markModuleDone: (id: number) => void;
  markProblemSolved: (p: PracticeProblem, quality?: number) => void;
  updateEditorQuery: (
    newVal: string,
    pMode?: PlaygroundMode,
    targetId?: string,
    moveCursorToEnd?: boolean,
  ) => void;
  copyToClipboard: (text: string) => void;
  classForDiff: (d: Difficulty) => string;
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="bullet-list">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

function ModulesView({
  activeModule,
  roadmapModules,
  progress,
  selectModule,
  setActiveView,
  openInPlayground,
  markModuleDone,
  markProblemSolved,
  updateEditorQuery,
  copyToClipboard,
  classForDiff,
}: ModulesViewProps) {
  const l = activeModule.lesson;

  function renderLessonBody() {
    const handleRunCode = (sql: string) => {
      updateEditorQuery(sql);
      setActiveView("playground");
    };

    return (
      <div className="unified-master-storyboard" style={{ display: "flex", flexDirection: "column", gap: "32px", paddingBottom: "40px" }}>
        {/* SECTION 1: CONCEPT & SCENARIO */}
        <section id="section-concept" className="storyboard-section">
          <div className="section-header-pill" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", background: "rgba(56, 217, 255, 0.1)", border: "1px solid rgba(56, 217, 255, 0.25)", borderRadius: "20px", fontSize: "11px", fontWeight: 700, color: "var(--cyan)", textTransform: "uppercase", marginBottom: "12px" }}>
            <Lightbulb size={13} />
            <span>Core Concept & Business Story</span>
          </div>

          <LessonProse text={l.conceptExplanation} onRunCode={handleRunCode} />

          {l.realBusinessScenario && (
            <div className="concept-scenario-section" style={{ marginTop: "20px", background: "rgba(255, 190, 61, 0.04)", border: "1px solid rgba(255, 190, 61, 0.2)", borderRadius: "10px", padding: "16px" }}>
              <h4 style={{ margin: "0 0 10px 0", color: "#fbbf24", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: 700 }}>
                <Lightbulb size={16} /> Real-World Analytics Scenario
              </h4>
              <LessonProse text={l.realBusinessScenario} onRunCode={handleRunCode} />
            </div>
          )}

          {l.visualExplanation && (
            <div className="concept-visual-section" style={{ marginTop: "20px", background: "rgba(56, 217, 255, 0.04)", border: "1px solid rgba(56, 217, 255, 0.2)", borderRadius: "10px", padding: "16px" }}>
              <h4 style={{ margin: "0 0 10px 0", color: "var(--cyan)", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: 700 }}>
                <Eye size={16} /> Visual Representation
              </h4>
              <LessonProse text={l.visualExplanation} onRunCode={handleRunCode} />
            </div>
          )}
        </section>

        {/* SECTION 2: COMMON PITFALLS & DO VS DON'T */}
        {l.commonMistakes && l.commonMistakes.length > 0 && (
          <section id="section-pitfalls" className="storyboard-section" style={{ borderTop: "1px solid var(--border)", paddingTop: "24px" }}>
            <div className="section-header-pill" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", background: "rgba(244, 63, 94, 0.1)", border: "1px solid rgba(244, 63, 94, 0.25)", borderRadius: "20px", fontSize: "11px", fontWeight: 700, color: "#f43f5e", textTransform: "uppercase", marginBottom: "12px" }}>
              <AlertTriangle size={13} />
              <span>Common Pitfalls & Mistakes</span>
            </div>

            <DoVsDontCard
              dontCode={{
                sql: "WHERE city = Mumbai",
                explanation: "Unquoted strings cause SQL syntax errors because SQL treats unquoted words as column names.",
              }}
              doCode={{
                sql: "WHERE city = 'Mumbai'",
                explanation: "Text literals must always be enclosed in single quotes. Numbers do not need quotes.",
              }}
              onRunCode={handleRunCode}
            />

            <BulletList items={l.commonMistakes} />
          </section>
        )}

        {/* SECTION 3: CHEAT SHEET & SYNTAX REFERENCE */}
        <section id="section-cheatsheet" className="storyboard-section" style={{ borderTop: "1px solid var(--border)", paddingTop: "24px" }}>
          <div className="section-header-pill" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", background: "rgba(155, 124, 255, 0.1)", border: "1px solid rgba(155, 124, 255, 0.25)", borderRadius: "20px", fontSize: "11px", fontWeight: 700, color: "var(--violet)", textTransform: "uppercase", marginBottom: "12px" }}>
            <Sparkles size={13} />
            <span>Syntax Quick Reference</span>
          </div>

          <BulletList items={l.cheatSheet} />

          {l.revisionNotes && l.revisionNotes.length > 0 && (
            <div style={{ marginTop: "16px" }}>
              <h4 style={{ color: "var(--text)", fontSize: "13px", fontWeight: 700, margin: "0 0 10px 0" }}>Key Takeaways</h4>
              <BulletList items={l.revisionNotes} />
            </div>
          )}
        </section>

        {/* SECTION 4: PRACTICE EXERCISES */}
        <section id="section-practice" className="storyboard-section" style={{ borderTop: "1px solid var(--border)", paddingTop: "24px" }}>
          <div className="section-header-pill" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", background: "rgba(52, 211, 153, 0.1)", border: "1px solid rgba(52, 211, 153, 0.25)", borderRadius: "20px", fontSize: "11px", fontWeight: 700, color: "#34d399", textTransform: "uppercase", marginBottom: "12px" }}>
            <Brain size={13} />
            <span>Practice Challenges ({activeModule.problems.length})</span>
          </div>

          <div className="problems-list" style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
            {activeModule.problems.map((p) => {
              const solved = progress.solvedProblems.includes(p.id);
              return (
                <div
                  key={p.id}
                  className={`problem-card ${solved ? "solved" : ""}`}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "var(--panel)", border: "1px solid var(--border)", borderRadius: "8px" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {solved ? (
                      <CheckCircle2 size={16} style={{ color: "#34d399" }} />
                    ) : (
                      <Zap size={16} style={{ color: "var(--muted)" }} />
                    )}
                    <div>
                      <strong style={{ fontSize: "13px", display: "block" }}>{p.title}</strong>
                      <span className={`difficulty-pill ${p.difficulty}`} style={{ fontSize: "10px", marginTop: "2px" }}>{p.difficulty}</span>
                    </div>
                  </div>
                  <button
                    className="primary-button compact"
                    onClick={() => openInPlayground(p)}
                  >
                    <Play size={13} /> Solve Problem
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div
      className="lesson-panel surface-panel full-height"
      style={{
        width: "100%",
        maxWidth: "900px",
        margin: "0 auto",
        borderLeft: "none",
      }}
    >
      <div className="lesson-header">
        <div>
          <p
            className="eyebrow"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <span>
              Module {activeModule.id} - {activeModule.level}
            </span>
            {activeModule.isHighWeight && (
              <span
                style={{
                  fontSize: "9px",
                  background: "rgba(255,190,61,0.08)",
                  color: "var(--amber)",
                  padding: "1px 6px",
                  borderRadius: "3px",
                  border: "1px solid rgba(255,190,61,0.15)",
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                ⭐ High Interview Weight
              </span>
            )}
          </p>
          <h2>{activeModule.title}</h2>
          {activeModule.prerequisites &&
            activeModule.prerequisites.length > 0 && (
              <div
                className="prerequisites-list"
                style={{
                  display: "flex",
                  gap: "8px",
                  marginTop: "8px",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--text-tertiary)",
                    lineHeight: "24px",
                  }}
                >
                  Prerequisites:
                </span>
                {activeModule.prerequisites.map((prereqId) => {
                  const prereqModule = roadmapModules.find(
                    (m) => m.id === prereqId,
                  );
                  return prereqModule ? (
                    <span
                      key={prereqId}
                      className="prerequisite-badge"
                      style={{
                        fontSize: "12px",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        backgroundColor: "var(--bg-tertiary)",
                        color: "var(--text-secondary)",
                        border: "1px solid var(--border-color)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                      onClick={() => {
                        selectModule(prereqModule);
                        setActiveView("modules");
                      }}
                    >
                      <Lock size={12} /> {prereqModule.title}
                    </span>
                  ) : null;
                })}
              </div>
            )}
        </div>
        <div className="lesson-header-actions">
          <button
            className="secondary-button compact"
            onClick={() => setActiveView("roadmap")}
          >
            <BookOpen size={15} /> Back to Roadmap
          </button>
          <button
            className="icon-button labeled"
            onClick={() => openInPlayground(activeModule.problems[0])}
          >
            <Zap size={15} /> Practice
          </button>
          <button
            className={`primary-button compact ${
              progress.completedModules.includes(activeModule.id)
                ? "done-btn"
                : ""
            }`}
            onClick={() => markModuleDone(activeModule.id)}
          >
            <CheckCircle2 size={15} />
            {progress.completedModules.includes(activeModule.id)
              ? "Done"
              : "Mark Done"}
          </button>
        </div>
      </div>

      <div className="storyboard-sticky-nav" style={{ position: "sticky", top: 0, zIndex: 10, background: "var(--bg)", backdropFilter: "blur(8px)", padding: "10px 0", borderBottom: "1px solid var(--border)", display: "flex", gap: "8px", overflowX: "auto", marginBottom: "24px" }}>
        <a href="#section-concept" className="storyboard-nav-pill" style={{ textDecoration: "none", padding: "6px 14px", borderRadius: "20px", background: "rgba(56, 217, 255, 0.08)", border: "1px solid rgba(56, 217, 255, 0.2)", color: "var(--cyan)", fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}>
          <Lightbulb size={13} /> Concept & Story
        </a>
        {l.commonMistakes && l.commonMistakes.length > 0 && (
          <a href="#section-pitfalls" className="storyboard-nav-pill" style={{ textDecoration: "none", padding: "6px 14px", borderRadius: "20px", background: "rgba(244, 63, 94, 0.08)", border: "1px solid rgba(244, 63, 94, 0.2)", color: "#f43f5e", fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}>
            <AlertTriangle size={13} /> Common Pitfalls
          </a>
        )}
        <a href="#section-cheatsheet" className="storyboard-nav-pill" style={{ textDecoration: "none", padding: "6px 14px", borderRadius: "20px", background: "rgba(155, 124, 255, 0.08)", border: "1px solid rgba(155, 124, 255, 0.2)", color: "var(--violet)", fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}>
          <Sparkles size={13} /> Cheat Sheet
        </a>
        <a href="#section-practice" className="storyboard-nav-pill" style={{ textDecoration: "none", padding: "6px 14px", borderRadius: "20px", background: "rgba(52, 211, 153, 0.08)", border: "1px solid rgba(52, 211, 153, 0.2)", color: "#34d399", fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}>
          <Brain size={13} /> Practice ({activeModule.problems.length})
        </a>
      </div>

      <div className="lesson-body">{renderLessonBody()}</div>
    </div>
  );
}

export default React.memo(ModulesView);
