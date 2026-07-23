import React, { useState } from "react";
import {
  Database,
  BookOpen,
  Code2,
  Zap,
  Target,
  CheckCircle2,
  TrendingUp,
  ChevronRight,
  Brain,
  Sparkles,
  BarChart3,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { RoadmapModule, PracticeProblem, RoadmapDay } from "../data/curriculum";

interface DashboardViewProps {
  progress: {
    completedModules: number[];
    solvedProblems: string[];
    solvedPuzzles: string[];
    completedDays: number[];
    queryRuns: number;
    minutesStudied: number;
    mockScores: Record<string, number>;
    completedChecklistItems: string[];
  };
  totalModules: number;
  totalProblems: number;
  streak: number;
  readiness: number;
  totalXP: number;
  currentLevel: number;
  xpProgressPercent: number;
  xpRemaining: number;
  earnedBadges: Array<{ id: string; title: string; desc: string; icon: string; earned: boolean }>;
  qaItems: Array<{ question: string; answer: string; followUp?: string; mistake?: string }>;
  roadmapModules: RoadmapModule[];
  learningRoadmap: RoadmapDay[];
  debugPuzzles: any[];
  setActiveView: (view: any) => void;
  setSelectedDayId: (dayId: number) => void;
  enterFreeformPlayground: () => void;
  selectModule: (m: RoadmapModule) => void;
  updateEditorQuery: (newVal: string, pMode?: any, targetId?: string, moveCursorToEnd?: boolean) => void;
  toggleChecklistItem: (id: string) => void;
  next: RoadmapModule;
}

function MetricCard({
  icon: Icon,
  label,
  value,
  accent,
  subtext,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  accent: string;
  subtext?: string;
  onClick?: () => void;
}) {
  return (
    <article className={`metric-card ${accent} ${onClick ? "interactive" : ""}`} onClick={onClick}>
      <div className="metric-icon">
        <Icon size={19} />
      </div>
      <span className="metric-lbl">{label}</span>
      <strong>{value}</strong>
      {subtext && <span className="metric-sub">{subtext}</span>}
    </article>
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
  const [open, setOpen] = useState(false);
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

export default function DashboardView({
  progress,
  totalModules,
  totalProblems,
  streak,
  readiness,
  totalXP,
  currentLevel,
  xpProgressPercent,
  xpRemaining,
  earnedBadges,
  qaItems,
  roadmapModules,
  learningRoadmap,
  debugPuzzles,
  setActiveView,
  setSelectedDayId,
  enterFreeformPlayground,
  selectModule,
  updateEditorQuery,
  toggleChecklistItem,
  next,
}: DashboardViewProps) {
  // SVG values for readiness radial bar
  const radius = 54;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius; // ~339.29
  const strokeDashoffset = circumference - (readiness / 100) * circumference;

  const xpForNextLevel = 150;
  const currentLevelXP = totalXP % 150;

  const modPct = Math.round((progress.completedModules.length / totalModules) * 100);
  const probPct = Math.round((progress.solvedProblems.length / totalProblems) * 100) || 0;
  const puzPct = Math.round(((progress.solvedPuzzles || []).length / debugPuzzles.length) * 100);

  const coreMocks = [
    "Blinkit Growth Analyst",
    "Zomato Growth Analyst",
    "Paytm Finance Analyst",
    "Swiggy Business Analyst",
    "CRED Risk Analyst",
    "Myntra Marketing Analyst",
    "Ola Mobility Analyst",
    "Google Performance Engineer",
    "Walmart Supply Chain Analyst",
    "Uber Rides Analyst",
    "Netflix Streaming Analyst",
    "Stripe Financial Analyst",
  ];
  let mockSum = 0;
  let mocksTaken = 0;
  coreMocks.forEach((m) => {
    if (progress.mockScores[m] !== undefined) {
      mockSum += progress.mockScores[m];
      mocksTaken++;
    }
  });
  const mockPct = mocksTaken > 0 ? Math.round(mockSum / mocksTaken) : 0;

  return (
    <div className="view-content dashboard-view">
      {/* HERO SECTION */}
      <div className="dash-hero premium-mesh">
        <div className="dash-hero-content">
          <span className="eyebrow-badge">SQL Analyst Academy</span>
          <h1>Master SQL for the Data Analyst role</h1>
          <p className="hero-subtext">
            {roadmapModules.length} modules · Beginner to Advanced · Real Indian business datasets
          </p>
          <div className="engine-badge-wrap">
            <div className="engine-badge">
              <Database size={13} style={{ color: "var(--cyan)" }} />
              <span>
                <strong>Database Dialect:</strong> SQLite (ANSI-compliant). Skills transfer 98% to PostgreSQL, MySQL,
                & SQL Server.
              </span>
            </div>
          </div>
          <div className="hero-actions">
            <button className="primary-button hero-btn-main" onClick={() => setActiveView("roadmap")}>
              <BookOpen size={16} /> Start Learning Roadmap
            </button>
            <button className="primary-button outline hero-btn-sec" onClick={() => setActiveView("practice")}>
              <Code2 size={16} /> Practice Bank
            </button>
            <button className="primary-button outline hero-btn-sec" onClick={enterFreeformPlayground}>
              <Zap size={16} /> Playground
            </button>
          </div>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="metric-grid">
        <MetricCard
          icon={Target}
          label="Interview Readiness"
          value={`${readiness}%`}
          accent="cyan"
          subtext="Calculated from your progress"
          onClick={() => {
            document.querySelector(".readiness-breakdown")?.scrollIntoView({ behavior: "smooth" });
          }}
        />
        <MetricCard
          icon={CheckCircle2}
          label="Modules Completed"
          value={`${progress.completedModules.length}/${totalModules}`}
          accent="emerald"
          subtext="Lessons fully studied"
          onClick={() => setActiveView("roadmap")}
        />
        <MetricCard
          icon={Code2}
          label="Practice Exercises"
          value={`${progress.solvedProblems.length}/${totalProblems}`}
          accent="amber"
          subtext="Core challenges solved"
          onClick={() => setActiveView("practice")}
        />
        <MetricCard
          icon={Database}
          label="Playground Runs"
          value={`${progress.queryRuns}`}
          accent="violet"
          subtext="Queries run in playground"
          onClick={enterFreeformPlayground}
        />
      </div>

      {/* ENGAGEMENT & ACADEMY METRICS */}
      <div
        className="surface-panel engagement-panel premium-panel"
        style={{ marginBottom: "24px", padding: "16px 20px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            borderBottom: "1px solid var(--border)",
            paddingBottom: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <TrendingUp size={16} style={{ color: "var(--cyan)" }} />
            <strong style={{ fontSize: "14px", letterSpacing: "0.02em" }}>Study Engagement & Streak Tracker</strong>
          </div>
          <span style={{ fontSize: "12px", color: "var(--muted)" }}>Keep your daily streak alive!</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
          {/* Streak Counter Widget */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              background: "rgba(255, 255, 255, 0.02)",
              padding: "12px 16px",
              borderRadius: "6px",
              border: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                fontSize: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(239, 68, 68, 0.08)",
                borderRadius: "50%",
                width: "50px",
                height: "50px",
                border: "1px solid rgba(239, 68, 68, 0.15)",
              }}
            >
              🔥
            </div>
            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "11px",
                  color: "var(--muted)",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                Active Streak
              </span>
              <strong style={{ fontSize: "18px", color: "var(--text)" }}>
                {streak} Day{streak !== 1 ? "s" : ""}
              </strong>
            </div>
          </div>

          {/* Time Studied Tracker */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              background: "rgba(255, 255, 255, 0.02)",
              padding: "12px 16px",
              borderRadius: "6px",
              border: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                fontSize: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(52, 211, 153, 0.08)",
                borderRadius: "50%",
                width: "50px",
                height: "50px",
                border: "1px solid rgba(52, 211, 153, 0.15)",
                color: "var(--emerald)",
              }}
            >
              ⏱️
            </div>
            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "11px",
                  color: "var(--muted)",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                Time Studied
              </span>
              <strong style={{ fontSize: "18px", color: "var(--text)" }}>
                {progress.minutesStudied || 0} Minute{progress.minutesStudied !== 1 ? "s" : ""}
              </strong>
            </div>
          </div>

          {/* Completion Checklist Tracker */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              background: "rgba(255, 255, 255, 0.02)",
              padding: "14px 20px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                fontSize: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(56, 217, 255, 0.08)",
                borderRadius: "50%",
                width: "54px",
                height: "54px",
                border: "1px solid rgba(56, 217, 255, 0.15)",
                color: "var(--cyan)",
              }}
            >
              📋
            </div>
            <div style={{ flex: 1 }}>
              <span
                style={{
                  display: "block",
                  fontSize: "12px",
                  color: "var(--text-light)",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  marginBottom: "6px",
                  letterSpacing: "0.04em",
                }}
              >
                Curriculum Checklist
              </span>
              <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.02em",
                      fontWeight: 600,
                    }}
                  >
                    Roadmap
                  </span>
                  <strong style={{ fontSize: "18px", color: "var(--cyan)", fontWeight: 800 }}>
                    {Math.round((progress.completedModules.length / totalModules) * 100)}%
                  </strong>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.02em",
                      fontWeight: 600,
                    }}
                  >
                    Problems
                  </span>
                  <strong style={{ fontSize: "18px", color: "var(--emerald)", fontWeight: 800 }}>
                    {Math.round((progress.solvedProblems.length / totalProblems) * 100) || 0}%
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* READINESS WIDGET & 30-DAY JOURNEY ROW */}
      <div className="two-col dashboard-major-row">
        {/* READINESS WIDGET */}
        <div className="surface-panel readiness-breakdown premium-panel">
          <div className="rb-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Target size={16} style={{ color: "var(--cyan)" }} />
              <strong style={{ fontSize: "14px", letterSpacing: "0.02em" }}>Interview Readiness Metric</strong>
            </div>
            <span className="rb-total-badge">{readiness}%</span>
          </div>

          <div className="readiness-gauge-container">
            {/* Circular Gauge */}
            <div className="circular-gauge-wrapper">
              <svg width="140" height="140" viewBox="0 0 140 140" className="radial-progress-svg">
                <defs>
                  <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--cyan)" />
                    <stop offset="100%" stopColor="var(--violet)" />
                  </linearGradient>
                </defs>
                {/* Background track */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  className="radial-bg"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                {/* Colored progress */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  className="radial-fill"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  stroke="url(#gaugeGradient)"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 70 70)"
                />
              </svg>
              <div className="gauge-center-text">
                <span className="gauge-val">{readiness}%</span>
                <span className="gauge-lbl">Readiness</span>
              </div>
            </div>

            {/* Progress Bars */}
            <div className="rb-bars-list">
              <div className="rb-bar-item">
                <div className="rb-bar-labels">
                  <span>Modules Completed</span>
                  <strong>{modPct}%</strong>
                </div>
                <div className="rb-bar-track">
                  <div className="rb-bar-fill fill-emerald" style={{ width: `${modPct}%` }} />
                </div>
              </div>

              <div className="rb-bar-item">
                <div className="rb-bar-labels">
                  <span>Core Practice Problems</span>
                  <strong>{probPct}%</strong>
                </div>
                <div className="rb-bar-track">
                  <div className="rb-bar-fill fill-amber" style={{ width: `${probPct}%` }} />
                </div>
              </div>

              <div className="rb-bar-item">
                <div className="rb-bar-labels">
                  <span>Debug Puzzles Solved</span>
                  <strong>{puzPct}%</strong>
                </div>
                <div className="rb-bar-track">
                  <div className="rb-bar-fill fill-cyan" style={{ width: `${puzPct}%` }} />
                </div>
              </div>

              <div className="rb-bar-item">
                <div className="rb-bar-labels">
                  <span>Milestone Mock Tests</span>
                  <strong>{mockPct}%</strong>
                </div>
                <div className="rb-bar-track">
                  <div className="rb-bar-fill fill-violet" style={{ width: `${mockPct}%` }} />
                </div>
              </div>
            </div>
          </div>

          <p
            className="rb-tip"
            style={{ borderTop: "1px solid var(--border)", paddingTop: "10px", marginTop: "4px" }}
          >
            💡 <strong>Readiness Formula:</strong> 20% Modules + 30% Problems + 20% Puzzles + 30% Mocks. Complete
            lessons, solve Core 40 exercises, debug puzzles, and score high on mocks to reach 100% readiness.
          </p>
        </div>

        {/* 30-DAY JOURNEY TRACKER */}
        <div className="surface-panel journey-tracker premium-panel">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <BarChart3 size={16} style={{ color: "var(--cyan)" }} />
            <strong style={{ fontSize: "14px", letterSpacing: "0.02em" }}>
              {learningRoadmap.length}-Day SQL Journey Tracker
            </strong>
            <span
              style={{
                marginLeft: "auto",
                fontSize: "11px",
                color: "var(--muted)",
                background: "rgba(255,255,255,0.04)",
                padding: "2px 8px",
                borderRadius: "4px",
                border: "1px solid var(--border)",
              }}
            >
              Progress:{" "}
              <strong>
                {progress.completedDays ? progress.completedDays.length : 0}/{learningRoadmap.length} Days
              </strong>
            </span>
          </div>

          <p style={{ fontSize: "12.5px", color: "var(--muted)", marginBottom: "16px", lineHeight: 1.5 }}>
            Follow the daily learning roadmap. Each grid block represents a study day containing essential concepts,
            diagrams, and exercises.
          </p>

          <div className="calendar-grid-modern">
            {Array.from({ length: learningRoadmap.length }, (_, index) => {
              const dayNum = index + 1;
              const isCompleted = (progress.completedDays || []).includes(dayNum);
              const isActive =
                !(progress.completedDays || []).includes(dayNum) &&
                ((progress.completedDays || []).length === index ||
                  (dayNum === 1 && (progress.completedDays || []).length === 0));

              const dayData = learningRoadmap.find((d) => d.day === dayNum);
              const tooltip = dayData
                ? `Day ${dayNum}: ${dayData.title}\n` +
                  `Focus: ${dayData.focus}\n` +
                  `${isCompleted ? "✓ Completed" : "○ Not Completed"}`
                : `Day ${dayNum}`;

              return (
                <div
                  key={dayNum}
                  title={tooltip}
                  onClick={() => {
                    setSelectedDayId(dayNum);
                    setActiveView("day-details");
                  }}
                  className={`calendar-cell ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""}`}
                >
                  <span className="cell-number">{dayNum}</span>
                  {isCompleted && <span className="cell-tick">✓</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* STUDY TOPICS & CONTINUATION */}
      <div className="two-col">
        <div className="surface-panel premium-panel continue-card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "14px",
              borderBottom: "1px solid var(--border)",
              paddingBottom: "10px",
            }}
          >
            <BookOpen size={15} style={{ color: "var(--cyan)" }} />
            <strong
              style={{
                fontSize: "13px",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "var(--text-secondary)",
              }}
            >
              Continue Learning Path
            </strong>
          </div>

          <div className="next-lesson-modern">
            <div className="next-lesson-info">
              <span className="lesson-badge">
                Module {next.id} · {next.level}
              </span>
              <h2>{next.title}</h2>
              <p>{next.outcome}</p>
            </div>
            <button
              className="topic-action-btn"
              onClick={() => {
                selectModule(next);
                setActiveView("modules");
              }}
              title="Resume Module"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="surface-panel premium-panel topics-card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "14px",
              borderBottom: "1px solid var(--border)",
              paddingBottom: "10px",
            }}
          >
            <Brain size={15} style={{ color: "var(--amber)" }} />
            <strong
              style={{
                fontSize: "13px",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "var(--text-secondary)",
              }}
            >
              Up Next / Recommended Modules
            </strong>
          </div>

          <div className="topic-cloud-modern">
            {roadmapModules
              .filter((m) => !progress.completedModules.includes(m.id))
              .slice(0, 8)
              .map((m, i) => (
                <button
                  key={m.id}
                  className={`topic-pill ${i < 2 ? "urgent" : ""}`}
                  onClick={() => {
                    selectModule(m);
                    setActiveView("modules");
                  }}
                >
                  <span className="pill-dot"></span>
                  <span className="pill-title">{m.title}</span>
                </button>
              ))}
            {roadmapModules.every((m) => progress.completedModules.includes(m.id)) && (
              <div className="all-completed-toast">
                <span>🎉 All modules completed! Ready for mock test simulations.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* GAMIFICATION & ACHIEVEMENTS PANEL */}
      <div className="surface-panel premium-panel achievements-panel" style={{ marginBottom: "24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "16px",
            borderBottom: "1px solid var(--border)",
            paddingBottom: "12px",
          }}
        >
          <Sparkles size={15} style={{ color: "var(--amber)" }} />
          <strong
            style={{
              fontSize: "13px",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "var(--text-secondary)",
            }}
          >
            Your Achievements & Level Progression
          </strong>
          <span
            style={{
              marginLeft: "auto",
              fontSize: "11px",
              color: "var(--muted)",
              background: "rgba(255,255,255,0.04)",
              padding: "2px 8px",
              borderRadius: "4px",
              border: "1px solid var(--border)",
            }}
          >
            Total XP: <strong>{totalXP} XP</strong>
          </span>
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px", alignItems: "center" }}
          className="achievements-content-grid"
        >
          {/* Level and XP progress */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              background: "rgba(255, 255, 255, 0.01)",
              border: "1px solid var(--border)",
              padding: "16px",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <span style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--muted)", fontWeight: "bold" }}>
              Current Level
            </span>
            <strong style={{ fontSize: "48px", color: "var(--cyan)", lineHeight: 1 }}>{currentLevel}</strong>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "8px" }}>
              <div
                style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--muted)" }}
              >
                <span>{currentLevelXP} XP</span>
                <span>{xpForNextLevel} XP</span>
              </div>
              <div style={{ height: "6px", background: "var(--border)", borderRadius: "3px", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${xpProgressPercent}%`,
                    height: "100%",
                    background: "linear-gradient(to right, var(--cyan), var(--violet))",
                    borderRadius: "3px",
                  }}
                />
              </div>
              <span style={{ fontSize: "10px", color: "var(--muted)", marginTop: "4px" }}>
                {xpForNextLevel - currentLevelXP} XP to Level {currentLevel + 1}
              </span>
            </div>
          </div>

          {/* Badges list */}
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "10px" }}
            className="badges-grid"
          >
            {earnedBadges.map((badge) => (
              <div
                key={badge.id}
                title={badge.desc}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  background: badge.earned ? "rgba(56, 217, 255, 0.03)" : "rgba(255,255,255,0.01)",
                  opacity: badge.earned ? 1 : 0.4,
                  transition: "all 0.3s ease",
                  textAlign: "center",
                  cursor: "help",
                }}
                className={`badge-card ${badge.earned ? "earned" : "locked"}`}
              >
                <span style={{ fontSize: "24px", marginBottom: "6px", display: "block" }}>
                  {badge.earned ? badge.icon : "🔒"}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "bold",
                    color: badge.earned ? "var(--text)" : "var(--muted)",
                    display: "block",
                  }}
                >
                  {badge.title}
                </span>
                <span
                  style={{
                    fontSize: "9px",
                    color: "var(--muted)",
                    display: "block",
                    marginTop: "2px",
                    lineHeight: 1.2,
                  }}
                >
                  {badge.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QUICK INTERVIEW Q&A ACCORDION */}
      <div className="surface-panel premium-panel qa-panel-wrap">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "16px",
            borderBottom: "1px solid var(--border)",
            paddingBottom: "12px",
          }}
        >
          <Target size={15} style={{ color: "var(--cyan)" }} />
          <strong
            style={{
              fontSize: "13px",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "var(--text-secondary)",
            }}
          >
            Quick Interview Prep Cards
          </strong>
          <span style={{ marginLeft: "auto", fontSize: "12px", color: "var(--muted)" }}>Click to reveal answers</span>
        </div>

        <div className="qa-list-modern">
          {qaItems.map((item) => (
            <QACard
              key={item.question}
              q={item.question}
              a={item.answer}
              followUp={item.followUp}
              mistake={item.mistake}
              onTry={updateEditorQuery}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
