import React from "react";
import { useV3State, useV3Dispatch } from "../../contexts/V3Store";
import {
  Map,
  Terminal,
  BrainCircuit,
  Database,
  Crosshair,
  Settings,
} from "lucide-react";
import type { ViewId } from "../../types";

export function PremiumSidebar() {
  const state = useV3State();
  const dispatch = useV3Dispatch();

  const navItems: { id: ViewId; label: string; icon: React.ReactNode }[] = [
    { id: "roadmap", label: "Learning Path", icon: <Map size={20} /> },
    { id: "playground", label: "SQL Playground", icon: <Terminal size={20} /> },
    { id: "practice", label: "Target Practice", icon: <Crosshair size={20} /> },
    { id: "puzzles", label: "Logic Puzzles", icon: <BrainCircuit size={20} /> },
    { id: "mocks", label: "Mock Interviews", icon: <Database size={20} /> },
  ];

  return (
    <div
      style={{
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div style={{ padding: "0 12px 32px 12px" }}>
        <h2
          style={{
            margin: 0,
            fontSize: "20px",
            background:
              "linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 800,
            letterSpacing: "-0.03em",
          }}
        >
          SQL Academy V3
        </h2>
      </div>

      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          flex: 1,
        }}
      >
        {navItems.map((item) => {
          const isActive = state.activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                dispatch({ type: "SET_VIEW", payload: item.id });
                if (item.id === "playground") {
                  dispatch({ type: "SET_PLAYGROUND_MODE", payload: "free" });
                }
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                width: "100%",
                padding: "12px 16px",
                borderRadius: "var(--radius-md)",
                background: isActive
                  ? "hsla(190, 90%, 60%, 0.1)"
                  : "transparent",
                color: isActive
                  ? "var(--accent-cyan)"
                  : "var(--text-secondary)",
                border: isActive
                  ? "1px solid hsla(190, 90%, 60%, 0.2)"
                  : "1px solid transparent",
                fontWeight: isActive ? 600 : 500,
                transition: "all 0.2s ease",
              }}
              className="hover-glow"
            >
              <div style={{ opacity: isActive ? 1 : 0.7 }}>{item.icon}</div>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div
        style={{
          marginTop: "auto",
          paddingTop: "24px",
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            width: "100%",
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            background: "transparent",
            color: "var(--text-secondary)",
            border: "1px solid transparent",
            fontWeight: 500,
            transition: "all 0.2s ease",
          }}
          className="hover-glow"
        >
          <Settings size={20} />
          Settings
        </button>
      </div>
    </div>
  );
}
