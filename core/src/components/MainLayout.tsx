import React from "react";
import { SideNav } from "./SideNav";
import { TopBar } from "./TopBar";

/* eslint-disable @typescript-eslint/no-explicit-any */
export function MainLayout({
  sidebarOpen,
  sideNavProps,
  topBarProps,
  pageContentProps,
  children,
}: {
  sidebarOpen: boolean;
  sideNavProps: any;
  topBarProps: any;
  pageContentProps: React.HTMLAttributes<HTMLDivElement>;
  children: React.ReactNode;
}) {
  return (
    <div className={`app-shell ${sidebarOpen ? "sb-open" : "sb-closed"}`}>
      <SideNav props={sideNavProps} />
      <main className="main-shell">
        <TopBar props={topBarProps} />
        <div {...pageContentProps}>{children}</div>
      </main>
    </div>
  );
}
