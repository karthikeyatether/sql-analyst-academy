import React, { useMemo } from "react";
import { useV3State, useV3Dispatch } from "../../contexts/V3Store";
import { useProgress } from "../../contexts/ProgressContext";
import { useCurriculum } from "../../contexts/CurriculumContext";
import {
  Map,
  Terminal,
  BrainCircuit,
  Database,
  Crosshair,
  Settings,
  BookOpen,
  Menu,
  BarChart3,
  Code2,
  Zap,
  Bug,
  Timer,
  Target,
  GitMerge
} from "lucide-react";
import type { ViewId } from "../../types";

export function PremiumSidebar() {
  const state = useV3State();
  const dispatch = useV3Dispatch();
  const { progress } = useProgress();
  const { learningRoadmap, roadmapModules } = useCurriculum();
  const totalModules = roadmapModules.length;
  const totalProblems = roadmapModules.reduce((acc, m) => acc + (m.problems?.length || 0), 0);

  const navItems: { id: ViewId; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <BarChart3 size={17} /> },
    {
      id: "roadmap",
      label: `${learningRoadmap.length}-Day Plan`,
      icon: <BookOpen size={17} />,
    },
    { id: "practice", label: "Practice", icon: <Code2 size={17} /> },
    { id: "playground", label: "Playground", icon: <Zap size={17} /> },
    { id: "puzzles", label: "SQL Puzzles", icon: <Bug size={17} /> },
    { id: "mocks", label: "Mock Tests", icon: <Timer size={17} /> },
    { id: "interactive-lesson", label: "Document Learning", icon: <BookOpen size={17} /> },
  ];

  const totalXP =
    progress.completedModules.length * 15 +
    progress.solvedProblems.length * 10 +
    (progress.solvedPuzzles || []).length * 20 +
    Object.keys(progress.mockScores).length * 100;

  const currentLevel = Math.floor(totalXP / 150) + 1;
  const xpForNextLevel = 150;
  const currentLevelXP = totalXP % 150;
  const xpProgressPercent = Math.min(
    100,
    Math.round((currentLevelXP / xpForNextLevel) * 100)
  );

  const readiness = Math.min(
    100,
    Math.round(
      (progress.completedModules.length / Math.max(totalModules, 1)) * 25 +
        (progress.solvedProblems.length / Math.max(totalProblems, 1)) * 40 +
        ((progress.solvedPuzzles?.length || 0) / 10) * 15 +
        (Object.keys(progress.mockScores).length > 0 ? 20 : 0)
    )
  );

  return (
    <aside className="sidebar">
      <div
        className="brand-row"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          padding: "24px 16px 16px 16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            className="brand-mark"
            style={{
              background: "rgba(56, 217, 255, 0.12)",
              border: "1px solid rgba(56, 217, 255, 0.3)",
              borderRadius: "8px",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--cyan)",
            }}
          >
            <Database size={17} />
          </div>
          <div style={{ color: "var(--text)", fontSize: "16px" }}>
            <strong>SQL</strong>
            <span>Academy</span>
          </div>
        </div>
        <button
          className="icon-button sidebar-toggle-btn"
          onClick={() => dispatch({ type: "TOGGLE_SIDEBAR" })}
          title="Toggle Sidebar"
          aria-label="Toggle Sidebar"
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-secondary)",
            cursor: "pointer",
            padding: "6px",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Menu size={18} />
        </button>
      </div>

      <nav
        className="sidebar-nav"
        role="tablist"
        aria-label="Main Navigation"
        style={{ padding: "0 16px", flex: 1 }}
      >
        {navItems.map((item) => {
          const isActive = state.activeView === item.id;
          return (
            <button
              key={item.id}
              className={isActive ? "active" : ""}
              onClick={() => {
                dispatch({ type: "SET_VIEW", payload: item.id });
                if (item.id === "playground") {
                  dispatch({ type: "SET_PLAYGROUND_MODE", payload: "free" });
                }
              }}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer" style={{ padding: "16px" }}>
        <div
          className="sidebar-user-xp"
          style={{
            padding: "10px 12px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              background: "rgba(56, 217, 255, 0.1)",
              border: "1px solid rgba(56, 217, 255, 0.2)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "bold",
              color: "var(--cyan)",
            }}
          >
            L{currentLevel}
          </div>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "10px",
                color: "var(--text-secondary)",
              }}
            >
              <span>SQL Apprentice</span>
              <span>{totalXP} XP</span>
            </div>
            <div
              style={{
                height: "4px",
                background: "var(--border)",
                borderRadius: "2px",
                overflow: "hidden",
                marginTop: "4px",
              }}
            >
              <div
                style={{
                  width: `${xpProgressPercent}%`,
                  height: "100%",
                  background: "var(--cyan)",
                }}
              />
            </div>
          </div>
        </div>

        <div className="readiness-card">
          <div className="rc-top">
            <span>Interview Readiness</span>
            <strong>{readiness}%</strong>
          </div>
          <div className="progress-track">
            <span style={{ width: `${readiness}%` }} />
          </div>
          <div className="rc-sub">
            <span>
              {progress.completedModules.length}/{totalModules} modules
            </span>
            <span>
              {progress.solvedProblems.length}/{totalProblems} problems
            </span>
          </div>
        </div>

        <button className="" style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "10px", 
            background: "transparent",
            border: "none",
            color: "var(--muted)",
            cursor: "pointer",
            padding: "8px 12px",
            width: "100%",
            borderRadius: "6px",
            marginTop: "16px"
        }}>
          <Settings size={17} />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
