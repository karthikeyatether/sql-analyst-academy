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
      className={`app-shell ${state.isSidebarOpen ? "sb-open" : "sb-closed"}`}
    >
      {state.isSidebarOpen && sidebar && (
        <>
          <div className="sidebar-backdrop" onClick={() => {}} />
          {sidebar}
        </>
      )}
      <main className="main-shell">
        <div
          className="page-content scrollable-y"
          style={{ flex: 1, overflow: "auto", position: "relative" }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
