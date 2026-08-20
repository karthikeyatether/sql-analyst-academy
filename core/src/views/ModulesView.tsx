import React, { useState, useEffect, useMemo, useRef } from "react";
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
  Clock,
  Type,
  Maximize2,
  Minimize2,
  Check,
  Share2,
} from "lucide-react";
import type {
  RoadmapModule,
  PracticeProblem,
  Difficulty,
} from "../data/curriculum";
import LessonProse from "../components/LessonProse";
import HighlightedSqlQuery from "../components/HighlightedSqlQuery";
import type { ViewId, PlaygroundMode } from "../types";

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
  updateEditorQuery,
  copyToClipboard,
  classForDiff,
}: ModulesViewProps) {
  const l = activeModule.lesson;

  const [activeSection, setActiveSection] = useState("sec-concept");
  const [fontSize, setFontSize] = useState<"normal" | "relaxed" | "large">(
    "normal",
  );
  const [focusMode, setFocusMode] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copiedNotes, setCopiedNotes] = useState(false);
  const narrativeRef = useRef<HTMLDivElement>(null);

  const estimatedReadingMinutes = useMemo(() => {
    const allText = `${l.conceptExplanation} ${l.visualExplanation || ""} ${l.realBusinessScenario || ""} ${(l.cheatSheet || []).join(" ")} ${(l.commonMistakes || []).join(" ")}`;
    const wordCount = allText.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(wordCount / 180));
  }, [l]);

  const handleScroll = () => {
    if (!narrativeRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = narrativeRef.current;
    const max = scrollHeight - clientHeight;
    setScrollProgress(max > 0 ? (scrollTop / max) * 100 : 0);
  };

  const copyLessonNotes = () => {
    let md = `# Module ${activeModule.id}: ${activeModule.title}\n\n`;
    md += `**Level:** ${activeModule.level} | **Estimated Read:** ${estimatedReadingMinutes} min\n\n`;
    md += `## Core Concept\n${l.conceptExplanation}\n\n`;
    if (l.visualExplanation)
      md += `## Visual Representation\n${l.visualExplanation}\n\n`;
    if (l.realBusinessScenario)
      md += `## Business Scenario\n${l.realBusinessScenario}\n\n`;
    if (l.cheatSheet && l.cheatSheet.length > 0) {
      md +=
        `## Key Syntax Takeaways\n` +
        l.cheatSheet.map((c) => `- ${c}`).join("\n") +
        "\n\n";
    }
    if (l.commonMistakes && l.commonMistakes.length > 0) {
      md +=
        `## Common Pitfalls\n` +
        l.commonMistakes.map((m) => `- ${m}`).join("\n") +
        "\n\n";
    }
    copyToClipboard(md);
    setCopiedNotes(true);
    setTimeout(() => setCopiedNotes(false), 2000);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-10% 0px -75% 0px" },
    );

    const sectionIds = [
      "sec-concept",
      "sec-visuals",
      "sec-scenario",
      "sec-examples",
      "sec-cheatsheet",
      "sec-pitfalls",
      "sec-interview",
      "sec-practice",
    ];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [activeModule.id]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div
      className="lesson-panel surface-panel full-height"
      style={{
        width: "100%",
        height: "100%",
        margin: "0 auto",
        borderLeft: "none",
        borderRight: "none",
        borderRadius: 0,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg)",
      }}
    >
      {/* Ultra-Compact Unified Header & Toolbar */}
      {!focusMode && (
        <div
          className="lesson-header-compact"
          style={{
            padding: "8px 24px",
            borderBottom: "1px solid var(--border)",
            background: "var(--panel)",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            flexShrink: 0,
          }}
        >
          {/* Main Line: Module ID, Title, Badges, Study Time, and Primary Actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            {/* Left: Module Tag & Title */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--cyan)",
                  background:
                    "color-mix(in srgb, var(--cyan) 12%, transparent)",
                  border:
                    "1px solid color-mix(in srgb, var(--cyan) 25%, transparent)",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Module {activeModule.id} · {activeModule.level}
              </span>

              <h2
                style={{
                  fontSize: "17px",
                  fontWeight: 800,
                  margin: 0,
                  color: "var(--text)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {activeModule.title}
              </h2>

              {activeModule.isHighWeight && (
                <span
                  style={{
                    fontSize: "10px",
                    background: "rgba(255,190,61,0.12)",
                    color: "var(--amber)",
                    padding: "1px 6px",
                    borderRadius: "4px",
                    border: "1px solid rgba(255,190,61,0.25)",
                    fontWeight: 700,
                  }}
                >
                  ⭐ High Interview Weight
                </span>
              )}
            </div>

            {/* Right: Tools & Action Buttons */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                flexWrap: "wrap",
              }}
            >
              {/* Study Time */}
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--text-muted, var(--muted))",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  marginRight: "2px",
                }}
              >
                <Clock size={12} style={{ color: "var(--cyan)" }} />
                {estimatedReadingMinutes}m
              </span>

              {/* Font Size Switcher */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "5px",
                  padding: "1px",
                }}
              >
                <button
                  onClick={() => setFontSize("normal")}
                  style={{
                    background:
                      fontSize === "normal"
                        ? "color-mix(in srgb, var(--cyan) 18%, transparent)"
                        : "transparent",
                    border: "none",
                    color:
                      fontSize === "normal" ? "var(--cyan)" : "var(--muted)",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontSize: "10.5px",
                    cursor: "pointer",
                    fontWeight: fontSize === "normal" ? 700 : 500,
                  }}
                  title="Default font size"
                >
                  Default
                </button>
                <button
                  onClick={() => setFontSize("relaxed")}
                  style={{
                    background:
                      fontSize === "relaxed"
                        ? "color-mix(in srgb, var(--cyan) 18%, transparent)"
                        : "transparent",
                    border: "none",
                    color:
                      fontSize === "relaxed" ? "var(--cyan)" : "var(--muted)",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontSize: "10.5px",
                    cursor: "pointer",
                    fontWeight: fontSize === "relaxed" ? 700 : 500,
                  }}
                  title="Relaxed font size"
                >
                  Relaxed
                </button>
                <button
                  onClick={() => setFontSize("large")}
                  style={{
                    background:
                      fontSize === "large"
                        ? "color-mix(in srgb, var(--cyan) 18%, transparent)"
                        : "transparent",
                    border: "none",
                    color:
                      fontSize === "large" ? "var(--cyan)" : "var(--muted)",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontSize: "10.5px",
                    cursor: "pointer",
                    fontWeight: fontSize === "large" ? 700 : 500,
                  }}
                  title="Large font size"
                >
                  Large
                </button>
              </div>

              {/* Export Notes */}
              <button
                onClick={copyLessonNotes}
                style={{
                  background: copiedNotes
                    ? "color-mix(in srgb, var(--emerald) 15%, transparent)"
                    : "var(--bg)",
                  border:
                    "1px solid " +
                    (copiedNotes ? "var(--emerald)" : "var(--border)"),
                  color: copiedNotes
                    ? "var(--emerald)"
                    : "var(--text-secondary)",
                  padding: "3px 8px",
                  borderRadius: "5px",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
                title="Export notes"
              >
                {copiedNotes ? <Check size={11} /> : <Share2 size={11} />}
                {copiedNotes ? "Copied!" : "Notes"}
              </button>

              {/* Focus Mode */}
              <button
                onClick={() => setFocusMode(!focusMode)}
                style={{
                  background: focusMode
                    ? "color-mix(in srgb, var(--cyan) 15%, transparent)"
                    : "var(--bg)",
                  border:
                    "1px solid " +
                    (focusMode ? "var(--cyan)" : "var(--border)"),
                  color: focusMode ? "var(--cyan)" : "var(--text-secondary)",
                  padding: "3px 8px",
                  borderRadius: "5px",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
                title="Focus Mode"
              >
                <Maximize2 size={11} /> Focus
              </button>

              <span style={{ color: "var(--border)", margin: "0 2px" }}>|</span>

              {/* Roadmap */}
              <button
                className="secondary-button compact"
                onClick={() => setActiveView("roadmap")}
                style={{
                  padding: "3px 9px",
                  fontSize: "11.5px",
                  height: "26px",
                }}
              >
                <BookOpen size={12} /> Roadmap
              </button>

              {/* Practice */}
              <button
                className="icon-button labeled"
                onClick={() => {
                  if (activeModule.problems.length > 0)
                    openInPlayground(activeModule.problems[0]);
                }}
                style={{
                  padding: "3px 9px",
                  fontSize: "11.5px",
                  height: "26px",
                }}
              >
                <Zap size={12} /> Practice
              </button>

              {/* Done */}
              <button
                className={`primary-button compact ${
                  progress.completedModules.includes(activeModule.id)
                    ? "done-btn"
                    : ""
                }`}
                onClick={() => markModuleDone(activeModule.id)}
                style={{
                  padding: "3px 10px",
                  fontSize: "11.5px",
                  height: "26px",
                  background: progress.completedModules.includes(
                    activeModule.id,
                  )
                    ? "color-mix(in srgb, var(--emerald) 15%, transparent)"
                    : "",
                  color: progress.completedModules.includes(activeModule.id)
                    ? "var(--emerald)"
                    : "",
                  border: progress.completedModules.includes(activeModule.id)
                    ? "1px solid color-mix(in srgb, var(--emerald) 30%, transparent)"
                    : "",
                }}
              >
                <CheckCircle2 size={12} />
                {progress.completedModules.includes(activeModule.id)
                  ? "Done"
                  : "Mark Done"}
              </button>
            </div>
          </div>

          {/* Inline Prerequisites if any */}
          {activeModule.prerequisites &&
            activeModule.prerequisites.length > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: "10.5px",
                    color: "var(--muted)",
                    fontWeight: 600,
                  }}
                >
                  Prerequisites:
                </span>
                {activeModule.prerequisites.map((prereqId) => {
                  const prereqModule = roadmapModules.find(
                    (m) => m.id === prereqId,
                  );
                  const isCompleted = prereqModule
                    ? progress.completedModules.includes(prereqModule.id)
                    : false;
                  return prereqModule ? (
                    <span
                      key={prereqId}
                      style={{
                        fontSize: "10.5px",
                        padding: "1px 7px",
                        borderRadius: "10px",
                        backgroundColor: isCompleted
                          ? "color-mix(in srgb, var(--emerald) 12%, transparent)"
                          : "var(--bg)",
                        color: isCompleted
                          ? "var(--emerald)"
                          : "var(--text-secondary)",
                        border: `1px solid ${
                          isCompleted
                            ? "color-mix(in srgb, var(--emerald) 30%, transparent)"
                            : "var(--border)"
                        }`,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "3px",
                      }}
                      onClick={() => {
                        selectModule(prereqModule);
                        setActiveView("modules");
                      }}
                    >
                      {isCompleted ? (
                        <CheckCircle2
                          size={10}
                          style={{ color: "var(--emerald)" }}
                        />
                      ) : (
                        <Lock size={10} style={{ color: "var(--muted)" }} />
                      )}
                      {prereqModule.title}
                    </span>
                  ) : null;
                })}
              </div>
            )}
        </div>
      )}

      {/* Floating Exit Button in Focus Mode */}
      {focusMode && (
        <div
          style={{ position: "fixed", top: "16px", right: "24px", zIndex: 100 }}
        >
          <button
            onClick={() => setFocusMode(false)}
            style={{
              background: "var(--panel)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
          >
            <Minimize2 size={13} /> Exit Focus Mode
          </button>
        </div>
      )}

      {/* Reading Progress Indicator */}
      <div
        className="reader-progress-bar"
        style={{ width: `${scrollProgress}%` }}
      />

      <div
        style={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
          width: "100%",
          transition: "all 0.2s ease",
        }}
      >
        {/* Main Narrative Body */}
        <div
          ref={narrativeRef}
          onScroll={handleScroll}
          className="narrative-body"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: focusMode ? "36px 80px" : "32px 48px",
            maxWidth: focusMode ? "960px" : "none",
            margin: focusMode ? "0 auto" : "0",
            scrollBehavior: "smooth",
          }}
        >
          <section id="sec-concept" style={{ marginBottom: "50px" }}>
            <LessonProse
              text={l.conceptExplanation}
              fontSize={fontSize}
              onRunCode={(sql) => {
                updateEditorQuery(sql);
                setActiveView("playground");
              }}
            />
          </section>

          {l.visualExplanation && (
            <section
              id="sec-visuals"
              style={{
                marginBottom: "50px",
                padding: "24px 28px",
                background: "color-mix(in srgb, var(--cyan) 5%, transparent)",
                borderLeft: "4px solid var(--cyan)",
                borderRadius: "0 12px 12px 0",
              }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  margin: "0 0 16px 0",
                  color: "var(--cyan)",
                }}
              >
                <Eye size={18} /> Visual Representation
              </h3>
              <LessonProse
                text={l.visualExplanation}
                fontSize={fontSize}
                onRunCode={(sql) => {
                  updateEditorQuery(sql);
                  setActiveView("playground");
                }}
              />
            </section>
          )}

          {l.realBusinessScenario && (
            <section
              id="sec-scenario"
              style={{
                marginBottom: "50px",
                padding: "28px",
                background: "color-mix(in srgb, var(--amber) 6%, transparent)",
                borderRadius: "12px",
                border:
                  "1px solid color-mix(in srgb, var(--amber) 20%, transparent)",
              }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  margin: "0 0 16px 0",
                  color: "var(--amber)",
                }}
              >
                <Lightbulb size={18} /> Real-World Business Scenario
              </h3>
              <LessonProse
                text={l.realBusinessScenario}
                fontSize={fontSize}
                onRunCode={(sql) => {
                  updateEditorQuery(sql);
                  setActiveView("playground");
                }}
              />
            </section>
          )}

          {l.examples && l.examples.length > 0 && (
            <section id="sec-examples" style={{ marginBottom: "50px" }}>
              <h2
                style={{
                  fontSize: "20px",
                  borderBottom: "1px solid var(--border)",
                  paddingBottom: "12px",
                  marginBottom: "24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <BookOpen size={20} style={{ color: "var(--emerald)" }} />{" "}
                Practice Examples
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                }}
              >
                {l.examples.map((ex, idx) => (
                  <div
                    key={idx}
                    className="example-block"
                    style={{
                      background: "var(--panel)",
                      padding: "24px",
                      borderRadius: "12px",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <h3
                      style={{
                        margin: "0 0 16px 0",
                        fontSize: "15px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      <span
                        style={{
                          background: "var(--bg-elevated)",
                          color: "var(--text)",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                      >
                        Ex {idx + 1}
                      </span>
                      {ex.title}
                    </h3>
                    <div
                      style={{
                        margin: "16px 0",
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                        background: "var(--bg-editor, #0d1117)",
                        overflow: "hidden",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                      }}
                    >
                      <HighlightedSqlQuery code={ex.query} />
                    </div>
                    <p
                      style={{
                        margin: "0 0 20px 0",
                        color: "var(--text)",
                        lineHeight: 1.6,
                      }}
                    >
                      {ex.explanation}
                    </p>
                    <div
                      className="example-actions"
                      style={{ display: "flex", gap: "12px" }}
                    >
                      <button
                        className="primary-button compact"
                        onClick={() => {
                          updateEditorQuery(ex.query);
                          setActiveView("playground");
                        }}
                      >
                        <Play size={14} /> Open in Playground
                      </button>
                      <button
                        className="icon-button labeled"
                        onClick={() => copyToClipboard(ex.query)}
                      >
                        <Clipboard size={14} /> Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {(l.cheatSheet?.length > 0 || l.revisionNotes?.length > 0) && (
            <section id="sec-cheatsheet" style={{ marginBottom: "50px" }}>
              <h2
                style={{
                  fontSize: "20px",
                  borderBottom: "1px solid var(--border)",
                  paddingBottom: "12px",
                  marginBottom: "24px",
                }}
              >
                Syntax & Key Takeaways
              </h2>

              {l.cheatSheet?.length > 0 && (
                <div
                  style={{
                    padding: "24px",
                    background: "var(--panel2)",
                    borderRadius: "12px",
                    border: "1px solid var(--border)",
                    marginBottom: "20px",
                  }}
                >
                  <h4
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "var(--cyan)",
                      margin: "0 0 16px 0",
                      fontSize: "13px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    <Sparkles size={16} /> Syntax Quick Reference
                  </h4>
                  <BulletList items={l.cheatSheet} />
                </div>
              )}

              {l.revisionNotes?.length > 0 && (
                <div
                  style={{
                    padding: "24px",
                    background:
                      "color-mix(in srgb, var(--emerald) 5%, transparent)",
                    borderRadius: "12px",
                    border:
                      "1px solid color-mix(in srgb, var(--emerald) 20%, transparent)",
                  }}
                >
                  <h4
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "var(--emerald)",
                      margin: "0 0 16px 0",
                      fontSize: "13px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    <CheckCircle2 size={16} /> Pro Tips
                  </h4>
                  <BulletList items={l.revisionNotes} />
                </div>
              )}
            </section>
          )}

          {l.commonMistakes?.length > 0 && (
            <section id="sec-pitfalls" style={{ marginBottom: "50px" }}>
              <h2
                style={{
                  fontSize: "20px",
                  borderBottom:
                    "1px solid color-mix(in srgb, var(--rose) 20%, transparent)",
                  paddingBottom: "12px",
                  marginBottom: "24px",
                  color: "var(--rose)",
                }}
              >
                Common Pitfalls
              </h2>
              <div
                style={{
                  padding: "24px",
                  background: "color-mix(in srgb, var(--rose) 6%, transparent)",
                  borderRadius: "12px",
                  border:
                    "1px solid color-mix(in srgb, var(--rose) 25%, transparent)",
                }}
              >
                <BulletList items={l.commonMistakes} />
              </div>
            </section>
          )}

          {l.interviewQuestions?.length > 0 && (
            <section id="sec-interview" style={{ marginBottom: "50px" }}>
              <h2
                style={{
                  fontSize: "20px",
                  borderBottom: "1px solid var(--border)",
                  paddingBottom: "12px",
                  marginBottom: "24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Brain size={20} style={{ color: "var(--violet)" }} /> Interview
                Readiness
              </h2>
              <div
                style={{
                  padding: "24px",
                  background: "var(--panel)",
                  borderRadius: "12px",
                  border: "1px solid var(--border)",
                }}
              >
                <BulletList items={l.interviewQuestions} />
              </div>
            </section>
          )}

          <section id="sec-practice" style={{ marginBottom: "80px" }}>
            <h2
              style={{
                fontSize: "20px",
                borderBottom: "1px solid var(--border)",
                paddingBottom: "12px",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Zap size={20} style={{ color: "var(--amber)" }} /> Put it into
              Practice
            </h2>
            <div
              className="practice-mini-list"
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {activeModule.problems.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="problem-row"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "16px",
                    background: "var(--panel)",
                    borderRadius: "12px",
                    border: "1px solid var(--border)",
                    transition: "all 0.2s",
                  }}
                >
                  <span
                    className={`difficulty-pill ${classForDiff(p.difficulty)}`}
                    style={{
                      fontSize: "12px",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontWeight: 700,
                    }}
                  >
                    {p.difficulty}
                  </span>
                  <span
                    className="problem-row-title"
                    style={{ flex: 1, fontWeight: 500, fontSize: "14px" }}
                  >
                    {p.title}
                  </span>
                  <button
                    className="primary-button compact"
                    title="Open in Playground"
                    onClick={() => openInPlayground(p)}
                    style={{ padding: "8px 16px", fontSize: "13px" }}
                  >
                    <Play size={14} style={{ fill: "currentColor" }} /> Solve
                    Problem
                  </button>
                  <span
                    className={`status-icon ${progress.solvedProblems.includes(p.id) ? "solved" : ""}`}
                    title={
                      progress.solvedProblems.includes(p.id)
                        ? "Solved"
                        : "Unsolved"
                    }
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: progress.solvedProblems.includes(p.id)
                        ? "var(--emerald)"
                        : "var(--muted)",
                    }}
                  >
                    <CheckCircle2 size={18} />
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sticky Table of Contents Sidebar */}
        {!focusMode && (
          <div
            className="toc-sidebar"
            style={{
              width: "220px",
              flexShrink: 0,
              padding: "28px 16px 40px 16px",
              borderLeft: "1px solid var(--border)",
              background: "var(--panel)",
            }}
          >
            <div className="toc-sticky-container">
              <h4 className="toc-heading">On this page</h4>
              <ul className="toc-list">
                <li
                  className={`toc-link ${activeSection === "sec-concept" ? "active" : ""}`}
                  onClick={() => scrollToSection("sec-concept")}
                >
                  Core Concept
                </li>
                {l.visualExplanation && (
                  <li
                    className={`toc-link ${activeSection === "sec-visuals" ? "active" : ""}`}
                    onClick={() => scrollToSection("sec-visuals")}
                  >
                    Visuals
                  </li>
                )}
                {l.realBusinessScenario && (
                  <li
                    className={`toc-link ${activeSection === "sec-scenario" ? "active" : ""}`}
                    onClick={() => scrollToSection("sec-scenario")}
                  >
                    Business Scenario
                  </li>
                )}
                {l.examples?.length > 0 && (
                  <li
                    className={`toc-link ${activeSection === "sec-examples" ? "active" : ""}`}
                    onClick={() => scrollToSection("sec-examples")}
                  >
                    Examples
                  </li>
                )}
                {(l.cheatSheet?.length > 0 || l.revisionNotes?.length > 0) && (
                  <li
                    className={`toc-link ${activeSection === "sec-cheatsheet" ? "active" : ""}`}
                    onClick={() => scrollToSection("sec-cheatsheet")}
                  >
                    Syntax & Pro Tips
                  </li>
                )}
                {l.commonMistakes?.length > 0 && (
                  <li
                    className={`toc-link ${activeSection === "sec-pitfalls" ? "active" : ""}`}
                    style={
                      {
                        "--toc-highlight": "var(--rose)",
                      } as React.CSSProperties
                    }
                    onClick={() => scrollToSection("sec-pitfalls")}
                  >
                    Common Pitfalls
                  </li>
                )}
                {l.interviewQuestions?.length > 0 && (
                  <li
                    className={`toc-link ${activeSection === "sec-interview" ? "active" : ""}`}
                    onClick={() => scrollToSection("sec-interview")}
                  >
                    Interview Readiness
                  </li>
                )}
                <li
                  className={`toc-link ${activeSection === "sec-practice" ? "active" : ""}`}
                  style={
                    { "--toc-highlight": "var(--amber)" } as React.CSSProperties
                  }
                  onClick={() => scrollToSection("sec-practice")}
                >
                  <Zap size={12} /> Practice
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(ModulesView);
