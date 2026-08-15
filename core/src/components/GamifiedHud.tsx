import React, { useState, useEffect, useRef } from "react";
import { Trophy, Flame, Star, TrendingUp, Target, Zap, ShieldCheck } from "lucide-react";
import {
  PROGRESSION_LEVELS,
  calculateTotalXP,
  getProgressionLevel,
  getNextProgressionLevel,
  calculateInterviewReadiness,
} from "../utils/progressionEngine";

export interface XpEvent {
  id: string;
  label: string;
  xp: number;
  ts: number;
}

interface GamifiedHudProps {
  solvedProblems: string[];
  solvedPuzzles: string[];
  streak: number;
  queryRuns: number;
  minutesStudied: number;
  completedModules?: number[];
  mockScores?: Record<string, number>;
  onXpEvent?: (e: XpEvent) => void;
}

export default function GamifiedHud({
  solvedProblems,
  solvedPuzzles,
  streak,
  queryRuns,
  minutesStudied,
  completedModules = [],
  mockScores = {},
}: GamifiedHudProps) {
  const [showDetails, setShowDetails] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalXP = calculateTotalXP({
    completedModules,
    solvedProblems,
    solvedPuzzles,
    queryRuns,
    minutesStudied,
    mockScores,
  });

  const currentLevel = getProgressionLevel(totalXP);
  const nextLevel = getNextProgressionLevel(totalXP);

  const progressPercent = nextLevel
    ? Math.min(100, Math.max(0, Math.round(((totalXP - currentLevel.minXP) / (nextLevel.minXP - currentLevel.minXP)) * 100)))
    : 100;

  const readiness = calculateInterviewReadiness({
    completedModules,
    solvedProblems,
    solvedPuzzles,
    mockScores,
  });

  // Close HUD popover on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDetails(false);
      }
    }
    if (showDetails) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDetails]);

  return (
    <div ref={containerRef} style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <button
        onClick={() => setShowDetails((v) => !v)}
        title={`${currentLevel.title} (Level ${currentLevel.level}) — ${totalXP} XP`}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          height: "32px",
          boxSizing: "border-box",
          padding: "0 12px",
          borderRadius: "16px",
          background: `color-mix(in srgb, ${currentLevel.color} 10%, transparent)`,
          border: `1px solid color-mix(in srgb, ${currentLevel.color} 25%, transparent)`,
          cursor: "pointer",
          color: currentLevel.color,
          transition: "all 0.2s ease",
          fontSize: "12px",
          fontWeight: 700,
        }}
      >
        <Trophy size={13} />
        <span style={{ letterSpacing: "0.3px" }}>{currentLevel.title}</span>

        {/* Mini progress ring */}
        <svg width="20" height="20" viewBox="0 0 20 20" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="10" cy="10" r="7" fill="none" stroke="var(--border)" strokeWidth="2.5" />
          <circle
            cx="10"
            cy="10"
            r="7"
            fill="none"
            stroke={currentLevel.color}
            strokeWidth="2.5"
            strokeDasharray={`${(progressPercent / 100) * 43.98} 43.98`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.6s ease" }}
          />
        </svg>

        <span style={{ color: "var(--text)", opacity: 0.85 }}>{totalXP} XP</span>

        {streak > 0 && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "3px",
              padding: "2px 7px",
              borderRadius: "10px",
              background: "color-mix(in srgb, var(--amber) 15%, transparent)",
              color: "var(--amber)",
              fontSize: "11px",
              fontWeight: 800,
            }}
          >
            <Flame size={11} fill="var(--amber)" />
            {streak}
          </span>
        )}
      </button>

      {showDetails && (
        <div
          className="surface-panel"
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: 0,
            width: "320px",
            padding: "16px",
            background: "var(--panel)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
            zIndex: 99999,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Trophy size={16} style={{ color: currentLevel.color }} />
              <strong style={{ fontSize: "14px", color: "var(--text)" }}>{currentLevel.title}</strong>
            </div>
            <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 700 }}>
              LVL {currentLevel.level}
            </span>
          </div>

          {/* XP Progress Bar */}
          <div
            style={{
              width: "100%",
              height: "6px",
              background: "rgba(255,255,255,0.06)",
              borderRadius: "3px",
              overflow: "hidden",
              margin: "8px 0 4px 0",
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: "100%",
                background: currentLevel.color,
                transition: "width 0.3s ease",
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--muted)", marginBottom: "14px" }}>
            <span>{totalXP} XP</span>
            <span>{nextLevel ? `Next Level: ${nextLevel.minXP} XP` : "Max Rank Achieved! 🏆"}</span>
          </div>

          {/* Stats List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Star size={13} style={{ color: "var(--emerald)" }} /> Problems Solved
              </span>
              <strong>{solvedProblems.length} / 142</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Zap size={13} style={{ color: "var(--violet)" }} /> Debug Puzzles
              </span>
              <strong>{solvedPuzzles.length} / 60</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Flame size={13} style={{ color: "var(--amber)" }} /> Day Streak
              </span>
              <strong>{streak} days</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <TrendingUp size={13} style={{ color: "var(--cyan)" }} /> Queries Run
              </span>
              <strong>{queryRuns}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Target size={13} style={{ color: "var(--rose)" }} /> Readiness Index
              </span>
              <strong style={{ color: "var(--cyan)" }}>{readiness}%</strong>
            </div>
          </div>

          {/* All Ranks Preview */}
          <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid var(--border)" }}>
            <div style={{ fontSize: "10.5px", textTransform: "uppercase", color: "var(--muted)", fontWeight: 700, marginBottom: "8px", letterSpacing: "0.04em" }}>
              Analyst Career Ranks
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
              {PROGRESSION_LEVELS.map((lvl) => {
                const isCurrent = lvl.level === currentLevel.level;
                const isUnlocked = totalXP >= lvl.minXP;
                return (
                  <span
                    key={lvl.level}
                    style={{
                      fontSize: "10px",
                      padding: "2px 7px",
                      borderRadius: "6px",
                      background: isCurrent
                        ? `color-mix(in srgb, ${lvl.color} 20%, transparent)`
                        : isUnlocked
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(255,255,255,0.02)",
                      border: `1px solid ${isCurrent ? lvl.color : "transparent"}`,
                      color: isCurrent ? lvl.color : isUnlocked ? "var(--text-secondary)" : "var(--muted)",
                      fontWeight: isCurrent ? 700 : 500,
                      opacity: isUnlocked ? 1 : 0.45,
                    }}
                  >
                    {lvl.title}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
