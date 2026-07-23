import React, { useState } from "react";
import { BookOpen, Zap, CheckCircle2, Lock, Lightbulb, Eye, Play, Clipboard, Brain, Sparkles } from "lucide-react";
import type { RoadmapModule, PracticeProblem, Difficulty } from "../data/curriculum";
import LessonProse from "../components/LessonProse";

interface ModulesViewProps {
  activeModule: RoadmapModule;
  roadmapModules: RoadmapModule[];
  progress: {
    completedModules: number[];
    solvedProblems: string[];
  };
  selectModule: (m: RoadmapModule) => void;
  setActiveView: (view: any) => void;
  openInPlayground: (p: PracticeProblem) => void;
  markModuleDone: (id: number) => void;
  markProblemSolved: (p: PracticeProblem) => void;
  updateEditorQuery: (newVal: string, pMode?: any, targetId?: string, moveCursorToEnd?: boolean) => void;
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

export default function ModulesView({
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
  const [activeLessonTab, setActiveLessonTab] = useState("Concept");
  const lessonTabs = ["Concept", "Mistakes", "Cheat Sheet", "Practice"];
  const l = activeModule.lesson;

  function renderLessonBody() {
    switch (activeLessonTab) {
      case "Concept":
        return (
          <div className="concept-tab-container">
            <LessonProse text={l.conceptExplanation} />

            {l.realBusinessScenario && (
              <div className="concept-scenario-section" style={{ marginTop: "24px" }}>
                <h3 className="section-title-visual">
                  <Lightbulb size={15} style={{ color: "var(--yellow)", marginRight: "6px" }} />
                  Real-World Business Scenario
                </h3>
                <LessonProse text={l.realBusinessScenario} />
              </div>
            )}

            {l.visualExplanation && (
              <div className="concept-visual-section" style={{ marginTop: "24px" }}>
                <h3 className="section-title-visual">
                  <Eye size={15} style={{ color: "var(--cyan)", marginRight: "6px" }} />
                  Visual Representation
                </h3>
                <LessonProse text={l.visualExplanation} />
              </div>
            )}

            {l.examples && l.examples.length > 0 && (
              <div className="concept-examples-section" style={{ marginTop: "24px" }}>
                <h3 className="section-title-visual">
                  <BookOpen size={15} style={{ color: "var(--green)", marginRight: "6px" }} />
                  Practice Examples
                </h3>
                {l.examples.map((ex, idx) => (
                  <div key={idx} className="example-block" style={{ marginTop: "16px" }}>
                    <h3>
                      Example {idx + 1}: {ex.title}
                    </h3>
                    <pre className="sql-pre">{ex.query}</pre>
                    <p>{ex.explanation}</p>
                    <div className="example-actions">
                      <button
                        className="primary-button compact"
                        onClick={() => {
                          updateEditorQuery(ex.query);
                          setActiveView("playground");
                        }}
                      >
                        <Play size={14} /> Open in Playground
                      </button>
                      <button className="icon-button labeled" onClick={() => copyToClipboard(ex.query)}>
                        <Clipboard size={14} /> Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case "Mistakes":
        return <BulletList items={l.commonMistakes} />;
      case "Cheat Sheet":
        return (
          <div className="cheat-sheet-tab-container">
            <h4 className="cheat-section-title" style={{ marginTop: 0 }}>
              <Sparkles size={15} style={{ color: "var(--cyan)", marginRight: "6px" }} />
              Syntax Quick Reference
            </h4>
            <BulletList items={l.cheatSheet} />

            {l.revisionNotes && l.revisionNotes.length > 0 && (
              <>
                <h4 className="cheat-section-title">
                  <CheckCircle2 size={15} style={{ color: "var(--green)", marginRight: "6px" }} />
                  Key Takeaways
                </h4>
                <BulletList items={l.revisionNotes} />
              </>
            )}

            {l.interviewQuestions && l.interviewQuestions.length > 0 && (
              <>
                <h4 className="cheat-section-title">
                  <Brain size={15} style={{ color: "var(--yellow)", marginRight: "6px" }} />
                  Sample Interview Questions
                </h4>
                <BulletList items={l.interviewQuestions} />
              </>
            )}
          </div>
        );
      case "Practice":
        return (
          <div className="practice-mini-list">
            {activeModule.problems.slice(0, 5).map((p) => (
              <div key={p.id} className="problem-row">
                <span className={`difficulty-pill ${classForDiff(p.difficulty)}`}>{p.difficulty}</span>
                <span className="problem-row-title">{p.title}</span>
                <button className="icon-button" title="Open in Playground" onClick={() => openInPlayground(p)}>
                  <Zap size={14} />
                </button>
                <button
                  className={`icon-button ${progress.solvedProblems.includes(p.id) ? "solved" : ""}`}
                  title="Mark solved"
                  onClick={() => markProblemSolved(p)}
                >
                  <CheckCircle2 size={14} />
                </button>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div
      className="lesson-panel surface-panel full-height"
      style={{ width: "100%", maxWidth: "900px", margin: "0 auto", borderLeft: "none" }}
    >
      <div className="lesson-header">
        <div>
          <p className="eyebrow" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
          {activeModule.prerequisites && activeModule.prerequisites.length > 0 && (
            <div
              className="prerequisites-list"
              style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}
            >
              <span style={{ fontSize: "12px", color: "var(--text-tertiary)", lineHeight: "24px" }}>
                Prerequisites:
              </span>
              {activeModule.prerequisites.map((prereqId) => {
                const prereqModule = roadmapModules.find((m) => m.id === prereqId);
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
          <button className="secondary-button compact" onClick={() => setActiveView("roadmap")}>
            <BookOpen size={15} /> Back to Roadmap
          </button>
          <button className="icon-button labeled" onClick={() => openInPlayground(activeModule.problems[0])}>
            <Zap size={15} /> Practice
          </button>
          <button
            className={`primary-button compact ${
              progress.completedModules.includes(activeModule.id) ? "done-btn" : ""
            }`}
            onClick={() => markModuleDone(activeModule.id)}
          >
            <CheckCircle2 size={15} />
            {progress.completedModules.includes(activeModule.id) ? "Done" : "Mark Done"}
          </button>
        </div>
      </div>

      <div className="lesson-tabs">
        {lessonTabs.map((t) => (
          <button
            key={t}
            className={activeLessonTab === t ? "active" : ""}
            onClick={() => setActiveLessonTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="lesson-body">{renderLessonBody()}</div>
    </div>
  );
}
