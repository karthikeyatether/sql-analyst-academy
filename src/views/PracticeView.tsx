import React, { useState, useMemo } from "react";
import { Code2, Zap, CheckCircle2, Lightbulb, Sparkles, Clipboard, Play, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { RoadmapModule, PracticeProblem, Difficulty } from "../data/curriculum";
import { SplitPane } from "../components/SplitPane";
import { useLocalStorage } from "../hooks/useLocalStorage"; // Wait, we should import useLocalStorage or define a simple fallback!

interface PracticeViewProps {
  progress: {
    completedModules: number[];
    solvedProblems: string[];
  };
  activeModuleId: number;
  roadmapModules: RoadmapModule[];
  selectedProblem: PracticeProblem;
  selectProblem: (p: PracticeProblem) => void;
  openInPlayground: (p: PracticeProblem) => void;
  markProblemSolved: (p: PracticeProblem) => void;
  updateEditorQuery: (newVal: string, pMode?: any, targetId?: string, moveCursorToEnd?: boolean) => void;
  copyToClipboard: (text: string) => void;
  classForDiff: (d: Difficulty) => string;
  selectModule: (m: RoadmapModule) => void;
  setActiveView: (view: any) => void;
  setPlaygroundMode: (mode: "practice" | "puzzle" | "free") => void;
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

export default function PracticeView({
  progress,
  activeModuleId,
  roadmapModules,
  selectedProblem,
  selectProblem,
  openInPlayground,
  markProblemSolved,
  updateEditorQuery,
  copyToClipboard,
  classForDiff,
  selectModule,
  setActiveView,
  setPlaygroundMode,
}: PracticeViewProps) {
  // Scoped states pushed down from App
  const [practiceSplit, setPracticeSplit] = useState(() => {
    try {
      const saved = localStorage.getItem("sql-aa-split-practice");
      return saved ? JSON.parse(saved) : 340;
    } catch {
      return 340;
    }
  });
  const handlePracticeSplitResize = (w: number) => {
    setPracticeSplit(w);
    localStorage.setItem("sql-aa-split-practice", JSON.stringify(w));
  };

  const [diffFilter, setDiffFilter] = useState<Difficulty | "All">("All");
  const [companyFilter, setCompanyFilter] = useState<string>("All");
  const [selectedConceptFilter, setSelectedConceptFilter] = useState<string>("All");
  const [showOnlyEssential, setShowOnlyEssential] = useState(false);
  const [visibleHints, setVisibleHints] = useState(0);
  const [solutionRevealed, setSolutionRevealed] = useState(false);

  // Derive static list of companies and concepts
  const activeModule = useMemo(
    () => roadmapModules.find((m) => m.id === activeModuleId) ?? roadmapModules[0],
    [activeModuleId, roadmapModules]
  );

  const allProblems = useMemo(() => roadmapModules.flatMap((m) => m.problems), [roadmapModules]);

  const availableCompanies = useMemo(() => {
    const companies = new Set<string>();
    allProblems.forEach((p) => {
      if (p.companyTags) {
        p.companyTags.forEach((tag) => {
          if (tag) companies.add(tag);
        });
      }
    });
    return Array.from(companies).sort();
  }, [allProblems]);

  const availableConcepts = useMemo(() => {
    return activeModule.problems.reduce((acc, p) => {
      if (p.concepts) {
        p.concepts.forEach((c) => {
          if (!acc.includes(c)) acc.push(c);
        });
      }
      return acc;
    }, [] as string[]);
  }, [activeModule.problems]);

  const visibleProblems = useMemo(() => {
    return activeModule.problems.filter(
      (p) =>
        (diffFilter === "All" || p.difficulty === diffFilter) &&
        (companyFilter === "All" || (p.companyTags && p.companyTags.includes(companyFilter))) &&
        (selectedConceptFilter === "All" || (p.concepts && p.concepts.includes(selectedConceptFilter))) &&
        (!showOnlyEssential || p.isEssential || p.difficulty === "Easy" || p.difficulty === "Medium")
    );
  }, [activeModule.problems, diffFilter, companyFilter, selectedConceptFilter, showOnlyEssential]);

  // Reset visual hints & answer when active problem changes
  React.useEffect(() => {
    setVisibleHints(0);
    setSolutionRevealed(false);
  }, [selectedProblem.id]);

  return (
    <SplitPane
      leftWidth={practiceSplit}
      onResize={handlePracticeSplitResize}
      minLeft={220}
      maxLeft={520}
      left={
        <div className="practice-list-panel surface-panel full-height">
          <SectionTitle icon={Code2} title="Practice Problems" action={activeModule.title} />
          <div className="segmented">
            {(["All", "Easy", "Medium", "Hard"] as const).map((d) => (
              <button
                key={d}
                className={diffFilter === d ? "active" : ""}
                onClick={() => setDiffFilter(d)}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="module-selector" style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            <select value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)} style={{ flex: 1 }}>
              <option value="All">All Companies</option>
              {availableCompanies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={selectedConceptFilter}
              onChange={(e) => setSelectedConceptFilter(e.target.value)}
              style={{ flex: 1 }}
            >
              <option value="All">All Concepts</option>
              {availableConcepts.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "0 24px",
              marginBottom: "16px",
            }}
          >
            <input
              type="checkbox"
              id="essential-toggle"
              checked={showOnlyEssential}
              onChange={(e) => setShowOnlyEssential(e.target.checked)}
            />
            <label htmlFor="essential-toggle" style={{ fontSize: "13px", color: "var(--fg-dim)" }}>
              Show only Essential Problems (Core 40)
            </label>
          </div>
          <div className="module-selector">
            <select
              value={activeModuleId}
              onChange={(e) => {
                const m = roadmapModules.find((x) => x.id === Number(e.target.value));
                if (m) selectModule(m);
              }}
            >
              {roadmapModules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.isHighWeight ? "⭐ " : ""}M{m.id}: {m.title}
                </option>
              ))}
            </select>
          </div>
          <div className="problem-list">
            {visibleProblems.map((p) => (
              <article
                key={p.id}
                className={`problem-card ${selectedProblem.id === p.id ? "selected" : ""}`}
              >
                <button className="problem-main" onClick={() => selectProblem(p)}>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <span className={`difficulty-pill ${classForDiff(p.difficulty)}`}>{p.difficulty}</span>
                    {p.companyTags?.map((tag) => (
                      <span key={tag} className="company-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3>{p.title}</h3>
                  <p>{p.prompt.slice(0, 80)}…</p>
                </button>
                <div className="problem-actions">
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
              </article>
            ))}
          </div>
        </div>
      }
      right={
        <div className="problem-detail-panel surface-panel full-height">
          <div className="problem-detail-header">
            <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
              <span className={`difficulty-pill ${classForDiff(selectedProblem.difficulty)}`}>
                {selectedProblem.difficulty}
              </span>
              {selectedProblem.companyTags?.map((tag) => (
                <span key={tag} className="company-tag">
                  {tag}
                </span>
              ))}
              {(() => {
                const parentMod = roadmapModules.find((m) => m.id === selectedProblem.moduleId);
                return parentMod?.isHighWeight ? (
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
                ) : null;
              })()}
            </div>
            <h2>{selectedProblem.title}</h2>
          </div>
          <div className="problem-scenario">
            <strong>Scenario:</strong> {selectedProblem.businessScenario}
          </div>
          <div className="problem-prompt-box">
            <strong>Task:</strong>
            <p>{selectedProblem.prompt}</p>
          </div>
          <div className="problem-concepts">
            {selectedProblem.concepts.map((c) => (
              <span key={c} className="concept-tag">
                {c}
              </span>
            ))}
          </div>
          <div className="hint-actions">
            <button className="primary-button compact" onClick={() => openInPlayground(selectedProblem)}>
              <Zap size={15} /> Open in Playground
            </button>
            <button
              className="icon-button labeled"
              onClick={() => setVisibleHints((n) => Math.min(selectedProblem.hints.length, n + 1))}
            >
              <Lightbulb size={14} /> Hint
            </button>
            <button className="icon-button labeled" onClick={() => setSolutionRevealed(true)}>
              <Sparkles size={14} /> Reveal Answer
            </button>
            <button className="icon-button labeled" onClick={() => markProblemSolved(selectedProblem)}>
              <CheckCircle2 size={14} /> Solved
            </button>
            <button
              className="icon-button labeled"
              onClick={() => copyToClipboard(`${selectedProblem.title}\n\n${selectedProblem.prompt}`)}
            >
              <Clipboard size={14} /> Copy Q
            </button>
          </div>
          <div className="hint-stack">
            {selectedProblem.hints.slice(0, visibleHints).map((h, i) => (
              <div key={i} className="hint-card">
                <Lightbulb size={13} />
                {h}
              </div>
            ))}
            {solutionRevealed && (
              <div className="solution-card">
                <h3>Solution</h3>
                <pre className="sql-pre">{selectedProblem.solution}</pre>
                <p>{selectedProblem.detailedExplanation}</p>
                <p>
                  <strong>Alternative:</strong> {selectedProblem.alternativeApproach}
                </p>
                <p>
                  <strong>Performance:</strong> {selectedProblem.performanceNotes}
                </p>
                <button
                  className="icon-button labeled"
                  onClick={() => {
                    setPlaygroundMode("practice");
                    updateEditorQuery(selectedProblem.solution);
                    setActiveView("playground");
                  }}
                >
                  <Play size={14} /> Run in Playground
                </button>
              </div>
            )}
          </div>
          {progress.solvedProblems.includes(selectedProblem.id) &&
            (() => {
              const idx = allProblems.findIndex((p) => p.id === selectedProblem.id);
              const nextProb = idx !== -1 && idx < allProblems.length - 1 ? allProblems[idx + 1] : null;
              return nextProb ? (
                <button
                  className="primary-button"
                  style={{
                    marginTop: "16px",
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    background: "var(--cyan)",
                    color: "black",
                    fontWeight: "bold",
                  }}
                  onClick={() => selectProblem(nextProb)}
                >
                  <span>Next Problem</span> <ChevronRight size={16} />
                </button>
              ) : null;
            })()}
        </div>
      }
    />
  );
}
