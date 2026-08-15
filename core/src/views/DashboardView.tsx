import React, { useState, useEffect, useMemo } from "react";
import { formatStudyTime } from "../utils/formatters";
import {
  Database,
  BookOpen,
  Code2,
  Target,
  CheckCircle2,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Trophy,
  ChevronDown,
  ChevronUp,
  X,
  RotateCcw,
  Download,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import AdaptiveSkillGraph from "../components/dashboard/AdaptiveSkillGraph";
import type {
  RoadmapModule,
  PracticeProblem,
  RoadmapDay,
} from "../data/curriculum";
import type { SqlPuzzle } from "../data/puzzles";
import type { ViewId, PlaygroundMode } from "../types";
import { exportWorkspaceAsJson } from "../utils/workspaceSnapshot";

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
  earnedBadges: Array<{
    id: string;
    title: string;
    desc: string;
    icon: string;
    earned: boolean;
  }>;
  qaItems: Array<{
    question: string;
    answer: string;
    followUp?: string;
    mistake?: string;
  }>;
  roadmapModules: RoadmapModule[];
  learningRoadmap: RoadmapDay[];
  debugPuzzles: SqlPuzzle[];
  setActiveView: (view: ViewId) => void;
  setSelectedDayId: (dayId: number) => void;
  enterFreeformPlayground: () => void;
  selectModule: (m: RoadmapModule) => void;
  updateEditorQuery: (
    newVal: string,
    pMode?: PlaygroundMode,
    targetId?: string,
    moveCursorToEnd?: boolean,
  ) => void;
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
  compact = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  accent: string;
  subtext?: string;
  onClick?: () => void;
  compact?: boolean;
}) {
  return (
    <article
      className={`metric-card ${accent} ${onClick ? "interactive" : ""}`}
      onClick={onClick}
      style={compact ? { padding: "10px 14px" } : {}}
    >
      <div className="metric-icon">
        <Icon size={compact ? 16 : 19} />
      </div>
      <span className="metric-lbl" style={compact ? { fontSize: "11px" } : {}}>
        {label}
      </span>
      <strong style={compact ? { fontSize: "18px" } : {}}>{value}</strong>
      {subtext && !compact && <span className="metric-sub">{subtext}</span>}
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
  const sqlMatch =
    a.match(/```sql([\s\S]*?)```/) || a.match(/```([\s\S]*?)```/);

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
        </div>
      )}
    </div>
  );
}

function DashboardView({
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
  // Density and Collapsible widget states
  const [density, setDensity] = useState<"compact" | "spacious">(() => {
    return (
      (localStorage.getItem("sql-aa-dash-density") as "compact" | "spacious") ||
      "compact"
    );
  });

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem("sql-aa-dash-collapsed") || "{}");
    } catch {
      return {};
    }
  });

  const [dailyGoalMinutes, setDailyGoalMinutes] = useState<number>(() => {
    return Number(localStorage.getItem("sql-aa-dash-daily-goal")) || 30;
  });

  const [showGoalModal, setShowGoalModal] = useState(false);

  const toggleWidgetCollapse = (key: string) => {
    setCollapsed((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem("sql-aa-dash-collapsed", JSON.stringify(next));
      return next;
    });
  };

  const handleDensityChange = (newDensity: "compact" | "spacious") => {
    setDensity(newDensity);
    localStorage.setItem("sql-aa-dash-density", newDensity);
  };

  const handleDailyGoalChange = (mins: number) => {
    setDailyGoalMinutes(mins);
    localStorage.setItem("sql-aa-dash-daily-goal", String(mins));
    setShowGoalModal(false);
  };

  const isCompact = true;

  // SVG values for readiness radial bar
  const radius = 54;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius; // ~339.29
  const strokeDashoffset = circumference - (readiness / 100) * circumference;

  const xpForNextLevel = 150;
  const currentLevelXP = totalXP % 150;

  const { modPct, probPct, puzPct, mockPct, currentDay, mocksTaken, coreMocksTotal } = useMemo(() => {
    const mod = Math.round(
      (progress.completedModules.length / totalModules) * 100,
    );
    const prob =
      Math.round((progress.solvedProblems.length / totalProblems) * 100) || 0;
    const puz = Math.round(
      ((progress.solvedPuzzles || []).length / debugPuzzles.length) * 100,
    );

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
    const mockAvgScore = mocksTaken > 0 ? mockSum / mocksTaken : 0;
    const mockCoveragePct = (mocksTaken / coreMocks.length) * 100;
    const mock = Math.round(mockCoveragePct * (mockAvgScore / 100));

    const currentDayId = Math.min(
      learningRoadmap.length,
      (progress.completedDays || []).length + 1,
    );
    const day =
      learningRoadmap.find((d) => d.day === currentDayId) || learningRoadmap[0];

    return {
      modPct: mod,
      probPct: prob,
      puzPct: puz,
      mockPct: mock,
      currentDay: day,
      mocksTaken,
      coreMocksTotal: coreMocks.length,
    };
  }, [
    progress.completedModules.length,
    totalModules,
    progress.solvedProblems.length,
    totalProblems,
    progress.solvedPuzzles,
    debugPuzzles.length,
    progress.mockScores,
    progress.completedDays,
    learningRoadmap,
  ]);

  const lastQuery = localStorage.getItem("sql-aa-last-query") || "";
  const actualMinutesStudied = Math.max(
    progress.minutesStudied || 0,
    Number(localStorage.getItem("sql-aa-study-minutes")) || 0,
  );
  const goalProgressPct = Math.min(
    100,
    Math.round((actualMinutesStudied / dailyGoalMinutes) * 100),
  );

  return (
    <div
      className={`view-content dashboard-view ${isCompact ? "compact-mode" : ""}`}
    >
      {/* DASHBOARD HEADER BAR: DENSITY TOGGLE & QUICK CONTROLS */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "14px",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <div />

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() => setShowGoalModal(true)}
            className="secondary-button"
            style={{
              fontSize: "12px",
              padding: "4px 10px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Target size={14} style={{ color: "var(--amber)" }} />
            Goal: {dailyGoalMinutes}m/day ({goalProgressPct}%)
          </button>
        </div>
      </div>

      {/* DOMINANT HERO ACTION: CONTINUE LEARNING */}
      <div
        className="surface-panel premium-mesh"
        style={{
          padding: isCompact ? "16px 20px" : "22px 26px",
          marginBottom: "16px",
          borderRadius: "10px",
          border: "1px solid rgba(56, 217, 255, 0.4)",
          background:
            "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.92))",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <span
            className="eyebrow-badge"
            style={{
              background: "rgba(56,217,255,0.18)",
              color: "var(--cyan)",
              fontWeight: 800,
            }}
          >
            ⚡ Dominant Action · Day {currentDay.day} of{" "}
            {learningRoadmap.length}
          </span>
          <h2
            style={{
              fontSize: isCompact ? "18px" : "22px",
              margin: "8px 0 6px 0",
              color: "var(--text)",
            }}
          >
            {currentDay.title}
          </h2>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: "13px" }}>
            <strong>Current Focus:</strong> {currentDay.focus}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {lastQuery && (
            <button
              className="primary-button outline"
              onClick={() => {
                updateEditorQuery(lastQuery, "free", undefined, true);
                setActiveView("playground");
              }}
              style={{
                padding: "8px 14px",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              <RotateCcw size={14} /> Resume Last Query
            </button>
          )}

          <button
            className="primary-button"
            onClick={() => {
              setSelectedDayId(currentDay.day);
              setActiveView("day-details");
            }}
            style={{
              padding: "9px 20px",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            <BookOpen size={16} /> Continue Day {currentDay.day} &rarr;
          </button>
        </div>
      </div>

      {/* METRICS ROW (TOP 3 KPIs PRIMARY) */}
      <div className="metric-grid" style={{ marginBottom: "16px" }}>
        <MetricCard
          icon={Target}
          label="Interview Readiness"
          value={`${readiness}%`}
          accent="cyan"
          subtext="Calculated readiness score"
          compact={isCompact}
          onClick={() => {
            document
              .querySelector(".readiness-breakdown")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        />
        <MetricCard
          icon={CheckCircle2}
          label="Modules Completed"
          value={`${progress.completedModules.length}/${totalModules}`}
          accent="emerald"
          subtext="Roadmap lessons finished"
          compact={isCompact}
          onClick={() => setActiveView("roadmap")}
        />
        <MetricCard
          icon={Code2}
          label="Practice Exercises"
          value={`${progress.solvedProblems.length}/${totalProblems}`}
          accent="amber"
          subtext="Core challenges solved"
          compact={isCompact}
          onClick={() => setActiveView("practice")}
        />
        <MetricCard
          icon={Database}
          label="Playground Runs"
          value={`${progress.queryRuns}`}
          accent="violet"
          subtext="Queries run in playground"
          compact={isCompact}
          onClick={enterFreeformPlayground}
        />
      </div>

      {/* COLLAPSIBLE ENGAGEMENT & STREAK TRACKER */}
      <div
        className="surface-panel engagement-panel premium-panel"
        style={{
          marginBottom: "16px",
          padding: isCompact ? "12px 16px" : "16px 20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: collapsed["engagement"] ? "0" : "12px",
            borderBottom: collapsed["engagement"]
              ? "none"
              : "1px solid var(--border)",
            paddingBottom: collapsed["engagement"] ? "0" : "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <TrendingUp size={16} style={{ color: "var(--cyan)" }} />
            <strong style={{ fontSize: "14px" }}>
              Study Engagement & Streak Tracker
            </strong>
          </div>
          <button
            onClick={() => toggleWidgetCollapse("engagement")}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--muted)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {collapsed["engagement"] ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronUp size={16} />
            )}
          </button>
        </div>

        {!collapsed["engagement"] && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "14px",
            }}
          >
            {/* Streak Counter Widget */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                background: "rgba(255, 255, 255, 0.02)",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  fontSize: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(249, 115, 22, 0.12)",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  border: "1px solid rgba(249, 115, 22, 0.25)",
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
                <strong style={{ fontSize: "16px", color: "var(--text)" }}>
                  {streak} Day{streak !== 1 ? "s" : ""}
                </strong>
              </div>
            </div>

            {/* Time Studied Tracker */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                background: "rgba(255, 255, 255, 0.02)",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  fontSize: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(52, 211, 153, 0.08)",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
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
                <strong style={{ fontSize: "16px", color: "var(--text)" }}>
                  {formatStudyTime(progress.minutesStudied || 0)}
                </strong>
              </div>
            </div>

            {/* Daily Goal Target */}
            <div
              onClick={() => setShowGoalModal(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                background: "rgba(255, 255, 255, 0.02)",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                cursor: "pointer",
              }}
              title="Click to set daily study goal target"
            >
              <div
                style={{
                  fontSize: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(56, 217, 255, 0.08)",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  border: "1px solid rgba(56, 217, 255, 0.15)",
                  color: "var(--cyan)",
                }}
              >
                🎯
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
                  Daily Goal ({dailyGoalMinutes}m)
                </span>
                <strong style={{ fontSize: "16px", color: "var(--cyan)" }}>
                  {goalProgressPct}% Complete
                </strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ADAPTIVE SKILL GRAPH & REPAIR LOOP */}
      <AdaptiveSkillGraph
        completedProblems={progress.solvedProblems}
        completedPuzzles={progress.solvedPuzzles}
        onSelectDrill={() => {
          setActiveView("practice");
        }}
      />

      {/* READINESS WIDGET & 30-DAY JOURNEY ROW */}
      <div
        className="dashboard-major-row"
        style={{ marginBottom: "16px" }}
      >
        {/* READINESS WIDGET */}
        <div
          className="surface-panel readiness-breakdown premium-panel"
          style={{
            padding: isCompact ? "1rem 1.25rem" : "1.25rem 1.5rem",
            borderRadius: "12px",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="rb-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.75rem",
              borderBottom: "1px solid var(--border)",
              paddingBottom: "0.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Target size={16} style={{ color: "var(--cyan)" }} />
              <strong style={{ fontSize: "0.95rem" }}>
                Interview Readiness Breakdown
              </strong>
            </div>
            <button
              onClick={() => toggleWidgetCollapse("readiness")}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--muted)",
                cursor: "pointer",
              }}
            >
              {collapsed["readiness"] ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronUp size={16} />
              )}
            </button>
          </div>

          {!collapsed["readiness"] && (
            <>
              <div
                className="readiness-gauge-container"
                style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}
              >
                {/* Circular Gauge — SVG donut ring */}
                {(() => {
                  const r = 45;
                  const circ = 2 * Math.PI * r;
                  const activeDash = (readiness / 100) * circ;
                  return (
                    <div
                      style={{
                        position: "relative",
                        width: "110px",
                        height: "110px",
                        flexShrink: 0,
                      }}
                    >
                      <svg
                        width="110"
                        height="110"
                        viewBox="0 0 110 110"
                        style={{ display: "block", overflow: "visible" }}
                      >
                        <defs>
                          <linearGradient
                            id="gaugeArcGrad"
                            x1="5"
                            y1="5"
                            x2="105"
                            y2="105"
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop offset="0%" stopColor="#38d9ff" />
                            <stop offset="100%" stopColor="#00a8ff" />
                          </linearGradient>
                        </defs>
                        {/* Background Track */}
                        <circle
                          cx="55"
                          cy="55"
                          r={r}
                          fill="none"
                          stroke="rgba(56,217,255,0.12)"
                          strokeWidth="10"
                        />
                        {/* Active Progress Arc */}
                        <circle
                          cx="55"
                          cy="55"
                          r={r}
                          fill="none"
                          stroke="url(#gaugeArcGrad)"
                          strokeWidth="10"
                          strokeLinecap="round"
                          strokeDasharray={`${activeDash} ${circ}`}
                          strokeDashoffset={0}
                          transform="rotate(-90 55 55)"
                          style={{
                            transition:
                              "stroke-dasharray 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                          }}
                        />
                      </svg>
                      {/* Centre text */}
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "1.2rem",
                            fontWeight: 800,
                            color: "var(--cyan)",
                            lineHeight: 1.1,
                          }}
                        >
                          {readiness}%
                        </span>
                        <span
                          style={{
                            fontSize: "9px",
                            color: "var(--muted)",
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            marginTop: "2px",
                          }}
                        >
                          READINESS
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Premium 2x2 Bento Grid for Readiness Breakdown */}
                <div
                  className="readiness-bento-grid"
                  style={{
                    flex: 1,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.5rem",
                  }}
                >
                  {/* Modules Card */}
                  <div
                    style={{
                      background: "color-mix(in srgb, var(--emerald) 8%, transparent)",
                      border: "1px solid color-mix(in srgb, var(--emerald) 20%, transparent)",
                      borderRadius: "8px",
                      padding: "0.6rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text)", fontWeight: 600 }}>Modules</span>
                      <strong style={{ fontSize: "0.85rem", color: "var(--emerald)" }}>{modPct}%</strong>
                    </div>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-secondary)", marginBottom: "2px" }}>
                      {progress.completedModules.length} / {totalModules} completed
                    </div>
                    <div style={{ height: "4px", background: "color-mix(in srgb, var(--emerald) 15%, transparent)", borderRadius: "2px", overflow: "hidden" }}>
                      <div style={{ width: `${modPct}%`, height: "100%", background: "var(--emerald)", borderRadius: "2px" }} />
                    </div>
                  </div>

                  {/* Problems Card */}
                  <div
                    style={{
                      background: "color-mix(in srgb, var(--amber) 8%, transparent)",
                      border: "1px solid color-mix(in srgb, var(--amber) 20%, transparent)",
                      borderRadius: "8px",
                      padding: "0.6rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text)", fontWeight: 600 }}>Problems</span>
                      <strong style={{ fontSize: "0.85rem", color: "var(--amber)" }}>{probPct}%</strong>
                    </div>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-secondary)", marginBottom: "2px" }}>
                      {progress.solvedProblems.length} / {totalProblems} solved
                    </div>
                    <div style={{ height: "4px", background: "color-mix(in srgb, var(--amber) 15%, transparent)", borderRadius: "2px", overflow: "hidden" }}>
                      <div style={{ width: `${probPct}%`, height: "100%", background: "var(--amber)", borderRadius: "2px" }} />
                    </div>
                  </div>

                  {/* Puzzles Card */}
                  <div
                    style={{
                      background: "color-mix(in srgb, var(--cyan) 8%, transparent)",
                      border: "1px solid color-mix(in srgb, var(--cyan) 20%, transparent)",
                      borderRadius: "8px",
                      padding: "0.6rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text)", fontWeight: 600 }}>Puzzles</span>
                      <strong style={{ fontSize: "0.85rem", color: "var(--cyan)" }}>{puzPct}%</strong>
                    </div>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-secondary)", marginBottom: "2px" }}>
                      {(progress.solvedPuzzles || []).length} / {debugPuzzles.length} debugged
                    </div>
                    <div style={{ height: "4px", background: "color-mix(in srgb, var(--cyan) 15%, transparent)", borderRadius: "2px", overflow: "hidden" }}>
                      <div style={{ width: `${puzPct}%`, height: "100%", background: "var(--cyan)", borderRadius: "2px" }} />
                    </div>
                  </div>

                  {/* Mock Tests Card */}
                  <div
                    style={{
                      background: "color-mix(in srgb, var(--violet) 8%, transparent)",
                      border: "1px solid color-mix(in srgb, var(--violet) 20%, transparent)",
                      borderRadius: "8px",
                      padding: "0.6rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text)", fontWeight: 600 }}>Mocks</span>
                      <strong style={{ fontSize: "0.85rem", color: "var(--violet)" }}>{mockPct}%</strong>
                    </div>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-secondary)", marginBottom: "2px" }}>
                      {mocksTaken} / {coreMocksTotal} taken
                    </div>
                    <div style={{ height: "4px", background: "color-mix(in srgb, var(--violet) 15%, transparent)", borderRadius: "2px", overflow: "hidden" }}>
                      <div style={{ width: `${mockPct}%`, height: "100%", background: "var(--violet)", borderRadius: "2px" }} />
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  marginTop: "0.85rem",
                }}
              >
                <button
                  className="primary-button"
                  onClick={() => setActiveView("mock-runner")}
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    fontSize: "0.8rem",
                    padding: "0.4rem 0.8rem",
                  }}
                >
                  <Trophy size={14} /> Boost Readiness: Take Mock Test
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* COLLAPSIBLE INSIGHTS DRAWER FOR ACHIEVEMENTS & INTERVIEW PREP */}
      <CollapsibleInsightsSection
        totalXP={totalXP}
        currentLevel={currentLevel}
        currentLevelXP={currentLevelXP}
        xpForNextLevel={xpForNextLevel}
        xpProgressPercent={xpProgressPercent}
        earnedBadges={earnedBadges}
        qaItems={qaItems}
        updateEditorQuery={updateEditorQuery}
      />

      {/* DAILY GOAL MODAL */}
      {showGoalModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            className="surface-panel"
            style={{
              width: "360px",
              padding: "20px",
              borderRadius: "10px",
              border: "1px solid var(--cyan)",
              background: "var(--panel)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "14px",
              }}
            >
              <strong style={{ fontSize: "15px", color: "var(--text)" }}>
                Set Daily Study Goal
              </strong>
              <button
                onClick={() => setShowGoalModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--muted)",
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>
            <p
              style={{
                fontSize: "12.5px",
                color: "var(--muted)",
                marginBottom: "16px",
              }}
            >
              Choose your target study duration per day:
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleDailyGoalChange(mins)}
                  className={`primary-button ${dailyGoalMinutes === mins ? "" : "outline"}`}
                  style={{
                    justifyContent: "center",
                    padding: "8px",
                    fontSize: "13px",
                  }}
                >
                  {mins} Minutes / Day
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CollapsibleInsightsSection({
  totalXP,
  currentLevel,
  currentLevelXP,
  xpForNextLevel,
  xpProgressPercent,
  earnedBadges,
  qaItems,
  updateEditorQuery,
}: {
  totalXP: number;
  currentLevel: number;
  currentLevelXP: number;
  xpForNextLevel: number;
  xpProgressPercent: number;
  earnedBadges: any[];
  qaItems: any[];
  updateEditorQuery: (newVal: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginTop: "0.5rem" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="secondary-button"
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          padding: "0.6rem 1rem",
          fontSize: "0.82rem",
          color: "var(--text-muted)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          background: "var(--panel)",
          cursor: "pointer",
        }}
      >
        <Sparkles size={15} style={{ color: "var(--cyan)" }} />
        {open
          ? "Hide Achievements, XP Badges & Interview Q&A"
          : "View Secondary Insights, Badges & Interview Q&A"}
        <ChevronRight
          size={15}
          style={{
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        />
      </button>

      {open && (
        <div
          style={{
            marginTop: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          {/* ACHIEVEMENTS AND BADGES */}
          <div className="surface-panel premium-panel achievements-panel">
            {/* Header row */}
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
              <button
                onClick={exportWorkspaceAsJson}
                className="secondary-button compact"
                style={{
                  fontSize: "11px",
                  padding: "3px 8px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  marginLeft: "8px",
                }}
                title="Backup your progress and query history as JSON"
              >
                <Download size={12} /> Backup Progress
              </button>
            </div>

            {/* Level card */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                background: "rgba(255, 255, 255, 0.01)",
                border: "1px solid var(--border)",
                padding: "14px",
                borderRadius: "8px",
                textAlign: "center",
                marginBottom: "14px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  fontWeight: "bold",
                }}
              >
                Current Level
              </span>
              <strong
                style={{
                  fontSize: "42px",
                  color: "var(--cyan)",
                  lineHeight: 1,
                }}
              >
                {currentLevel}
              </strong>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  marginTop: "6px",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "10px",
                    color: "var(--muted)",
                  }}
                >
                  <span>{currentLevelXP} XP</span>
                  <span>{xpForNextLevel} XP</span>
                </div>
                <div
                  style={{
                    height: "5px",
                    background: "var(--border)",
                    borderRadius: "3px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${xpProgressPercent}%`,
                      height: "100%",
                      background:
                        "linear-gradient(to right, var(--cyan), var(--violet))",
                      borderRadius: "3px",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Badges list */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap: "8px",
              }}
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
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    background: badge.earned
                      ? "rgba(56, 217, 255, 0.03)"
                      : "rgba(255,255,255,0.01)",
                    opacity: badge.earned ? 1 : 0.4,
                    transition: "all 0.3s ease",
                    textAlign: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "20px",
                      marginBottom: "4px",
                      display: "block",
                    }}
                  >
                    {badge.earned ? badge.icon : "🔒"}
                  </span>
                  <span
                    style={{
                      fontSize: "10.5px",
                      fontWeight: "bold",
                      color: badge.earned ? "var(--text)" : "var(--muted)",
                    }}
                  >
                    {badge.title}
                  </span>
                </div>
              ))}
            </div>
          </div>


          {/* QUICK INTERVIEW Q&A ACCORDION */}
          <div className="surface-panel premium-panel qa-panel-wrap">
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
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: "11px",
                  color: "var(--muted)",
                }}
              >
                Click to reveal answers
              </span>
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
      )}
    </div>
  );
}

export default React.memo(DashboardView);
