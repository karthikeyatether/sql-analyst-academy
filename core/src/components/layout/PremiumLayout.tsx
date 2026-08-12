import React from "react";
import { useV3State } from "../../contexts/V3Store";

interface PremiumLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

export function PremiumLayout({ children, sidebar }: PremiumLayoutProps) {
  const state = useV3State();

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: "var(--bg-base)",
      }}
    >
      {state.isSidebarOpen && sidebar && (
        <aside
          className="glass-panel animate-fade"
          style={{
            width: "280px",
            height: "100%",
            borderRight: "1px solid var(--border-subtle)",
            display: "flex",
            flexDirection: "column",
            zIndex: 10,
          }}
        >
          {sidebar}
        </aside>
      )}
      <main
        style={{
          flex: 1,
          height: "100%",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </main>
    </div>
  );
}
