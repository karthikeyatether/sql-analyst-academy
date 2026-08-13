/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import { Database, Menu } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ViewId } from "../types";

export function SideNav({ props }: { props: {
  sidebarOpen: boolean;
  setSidebarOpen: (val: boolean | ((v: boolean) => boolean)) => void;
  navItems: any[];
  activeView: string;
  setActiveView: any;
  enterFreeformPlayground: () => void;
  setSelectedDayId: (id: number) => void;
  activeDayWhereLeftOff: number;
  handleSidebarNavKeyDown: any;
  currentLevel: number;
  totalXP: number;
  xpProgressPercent: number;
  readiness: number;
  progress: any;
  totalModules: number;
  totalProblems: number;
} }) {
  const {
    sidebarOpen, setSidebarOpen, navItems, activeView, setActiveView,
    enterFreeformPlayground, setSelectedDayId, activeDayWhereLeftOff,
    handleSidebarNavKeyDown, currentLevel, totalXP, xpProgressPercent,
    readiness, progress, totalModules, totalProblems
  } = props;
  
  return sidebarOpen ? (
        <>
          <div
            className="sidebar-backdrop"
            onClick={() => setSidebarOpen(false)}
          />
          {/* ── SIDEBAR ───────────────────────────────────── */}
          <aside className="sidebar">
            <div
              className="brand-row"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
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
                <div>
                  <strong>SQL</strong>
                  <span>Academy</span>
                </div>
              </div>
              <button
                className="icon-button sidebar-toggle-btn"
                onClick={() => setSidebarOpen((o: boolean) => !o)}
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
              onKeyDown={handleSidebarNavKeyDown}
            >
              {navItems.map(({ id, label, icon: Icon }: any) => (
                <button
                  key={id}
                  className={activeView === id ? "active" : ""}
                  onClick={() => {
                    if (id === "playground") {
                      enterFreeformPlayground();
                    } else if (id === "roadmap" || id === "day-details") {
                      setSelectedDayId(activeDayWhereLeftOff);
                      setActiveView(id);
                    } else {
                      setActiveView(id);
                    }
                    setSidebarOpen(false); // always close sidebar after nav pick
                  }}
                  role="tab"
                  aria-selected={activeView === id}
                  tabIndex={activeView === id ? 0 : -1}
                >
                  <Icon size={17} aria-hidden="true" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>

            <div className="sidebar-footer">
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
                <div
                  style={{ display: "flex", flexDirection: "column", flex: 1 }}
                >
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
            </div>
          </aside>
        </>
      ) : null;
}