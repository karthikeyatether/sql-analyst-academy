import React, { useState, useEffect, useRef } from "react";
import { Trophy, Flame, Star, TrendingUp, Target, Zap } from "lucide-react";

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
  onXpEvent?: (e: XpEvent) => void;
}

// XP thresholds per level
const LEVELS = [
  { level: 1, title: "SQL Rookie",    min: 0,    color: "#94a3b8" },
  { level: 2, title: "Query Coder",   min: 200,  color: "#4ade80" },
  { level: 3, title: "SQL Associate", min: 500,  color: "#22d3ee" },
  { level: 4, title: "Data Analyst",  min: 1000, color: "#818cf8" },
  { level: 5, title: "SQL Engineer",  min: 2000, color: "#f472b6" },
  { level: 6, title: "Query Master",  min: 3500, color: "#fb923c" },
  { level: 7, title: "SQL Architect", min: 5500, color: "#facc15" },
];

function calcXp(solved: number, puzzles: number, runs: number, mins: number) {
  return solved * 50 + puzzles * 75 + Math.floor(runs / 5) * 10 + Math.floor(mins / 10) * 5;
}

function getLevel(xp: number) {
  let cur = LEVELS[0];
  for (const l of LEVELS) { if (xp >= l.min) cur = l; }
  return cur;
}

function getNextLevel(xp: number) {
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp < LEVELS[i].min) return LEVELS[i];
  }
  return null;
}

// Confetti burst
function spawnConfetti(container: HTMLElement) {
  const count = 48;
  const colors = ["#22d3ee","#4ade80","#f472b6","#fb923c","#facc15","#818cf8"];
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    const color = colors[i % colors.length];
    el.style.cssText = `
      position:fixed; pointer-events:none; z-index:99999;
      width:${Math.random()*8+4}px; height:${Math.random()*8+4}px;
      background:${color}; border-radius:${Math.random()>0.5?"50%":"2px"};
      left:${Math.random()*100}vw; top:${Math.random()*40+20}vh;
      opacity:1; transform:scale(1) rotate(0deg);
      transition: transform 1.2s ease-out, top 1.2s ease-out, opacity 1.2s ease-out;
    `;
    document.body.appendChild(el);
    requestAnimationFrame(() => {
      el.style.top = `${Math.random()*60+60}vh`;
      el.style.transform = `scale(0.2) rotate(${Math.random()*720}deg) translateX(${(Math.random()-0.5)*200}px)`;
      el.style.opacity = "0";
    });
    setTimeout(() => el.remove(), 1400);
  }
}

export function triggerCelebration() {
  spawnConfetti(document.body);
}

export default function GamifiedHud({
  solvedProblems,
  solvedPuzzles,
  streak,
  queryRuns,
  minutesStudied,
}: GamifiedHudProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [prevSolved, setPrevSolved] = useState(solvedProblems.length);
  const containerRef = useRef<HTMLDivElement>(null);

  const xp = calcXp(solvedProblems.length, solvedPuzzles.length, queryRuns, minutesStudied);
  const currentLevel = getLevel(xp);
  const nextLevel = getNextLevel(xp);
  const progress = nextLevel
    ? ((xp - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100
    : 100;

  // Celebrate on new solve
  useEffect(() => {
    if (solvedProblems.length > prevSolved) {
      triggerCelebration();
      setPrevSolved(solvedProblems.length);
    }
  }, [solvedProblems.length, prevSolved]);

  return (
    <div ref={containerRef} style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <button
        onClick={() => setShowDetails(v => !v)}
        title={`${currentLevel.title} — ${xp} XP`}
        style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "5px 11px", borderRadius: "20px",
          background: `${currentLevel.color}18`,
          border: `1px solid ${currentLevel.color}40`,
          cursor: "pointer", color: currentLevel.color,
          transition: "all 0.2s ease",
          fontSize: "12px", fontWeight: 700,
        }}
        onMouseEnter={e => (e.currentTarget.style.background = `${currentLevel.color}28`)}
        onMouseLeave={e => (e.currentTarget.style.background = `${currentLevel.color}18`)}
      >
        <Trophy size={13} />
        <span style={{ letterSpacing: "0.3px" }}>{currentLevel.title}</span>
        {/* Mini progress ring */}
        <svg width="20" height="20" viewBox="0 0 20 20" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="10" cy="10" r="7" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2.5" />
          <circle
            cx="10" cy="10" r="7" fill="none"
            stroke={currentLevel.color}
            strokeWidth="2.5"
            strokeDasharray={`${(progress / 100) * 43.98} 43.98`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.6s ease" }}
          />
        </svg>
        <span style={{ color: "var(--fg, #e2e8f0)", opacity: 0.7 }}>{xp} XP</span>

        {streak > 0 && (
          <span style={{
            display: "flex", alignItems: "center", gap: "3px",
            padding: "2px 7px", borderRadius: "10px",
            background: "#fb923c22", color: "#fb923c",
            fontSize: "11px", fontWeight: 800,
          }}>
            <Flame size={11} />{streak}
          </span>
        )}
      </button>

      {/* Detail dropdown */}
      {showDetails && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 9998 }} onClick={() => setShowDetails(false)} />
          <div style={{
            position: "absolute", top: "calc(100% + 10px)", right: 0,
            zIndex: 9999, width: "260px",
            background: "var(--surface, #1a1a2e)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "14px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
            overflow: "hidden",
            animation: "hud-drop 0.18s ease",
          }}>
            {/* Level header */}
            <div style={{
              padding: "14px 16px",
              background: `linear-gradient(135deg, ${currentLevel.color}18, transparent)`,
              borderBottom: "1px solid rgba(255,255,255,0.07)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <Trophy size={16} style={{ color: currentLevel.color }} />
                <span style={{ fontWeight: 800, fontSize: "14px", color: currentLevel.color }}>{currentLevel.title}</span>
                <span style={{
                  marginLeft: "auto", fontSize: "11px", fontWeight: 700,
                  color: "var(--muted)", letterSpacing: "0.5px"
                }}>LVL {currentLevel.level}</span>
              </div>

              {/* XP Bar */}
              <div style={{ position: "relative", height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{
                  position: "absolute", inset: "0 auto 0 0",
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${currentLevel.color}, ${currentLevel.color}aa)`,
                  borderRadius: "3px",
                  transition: "width 0.8s cubic-bezier(0.34,1.56,0.64,1)",
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "10px", color: "var(--muted)" }}>
                <span>{xp} XP</span>
                {nextLevel ? <span>{nextLevel.min} XP for {nextLevel.title}</span> : <span>Max Level! 🏆</span>}
              </div>
            </div>

            {/* Stats */}
            {[
              { icon: <Star size={13} />, label: "Problems Solved", value: solvedProblems.length, color: "#4ade80" },
              { icon: <Zap size={13} />, label: "Debug Puzzles", value: solvedPuzzles.length, color: "#f472b6" },
              { icon: <Flame size={13} />, label: "Day Streak", value: `${streak} days`, color: "#fb923c" },
              { icon: <TrendingUp size={13} />, label: "Queries Run", value: queryRuns, color: "#22d3ee" },
              { icon: <Target size={13} />, label: "Minutes Studied", value: `${minutesStudied}m`, color: "#818cf8" },
            ].map(stat => (
              <div key={stat.label} style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "9px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}>
                <span style={{ color: stat.color }}>{stat.icon}</span>
                <span style={{ flex: 1, fontSize: "12px", color: "var(--muted, #64748b)" }}>{stat.label}</span>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--fg, #e2e8f0)" }}>{stat.value}</span>
              </div>
            ))}

            {/* All levels */}
            <div style={{ padding: "8px 16px 12px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "var(--muted)", marginBottom: "6px" }}>Ranks</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {LEVELS.map(l => (
                  <span key={l.level} style={{
                    padding: "2px 8px", borderRadius: "10px", fontSize: "10px", fontWeight: 700,
                    background: xp >= l.min ? `${l.color}22` : "rgba(255,255,255,0.04)",
                    color: xp >= l.min ? l.color : "var(--muted)",
                    border: currentLevel.level === l.level ? `1px solid ${l.color}60` : "1px solid transparent",
                  }}>{l.title}</span>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
      <style>{`
        @keyframes hud-drop {
          from { opacity:0; transform: translateY(-8px); }
          to   { opacity:1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
