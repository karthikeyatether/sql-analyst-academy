/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import {
  Menu,
  X,
  Search,
  Command,
  Moon,
  Sun,
  Zap,
  Palette,
  Code2,
  Flame,
  Check,
} from "lucide-react";

import { Target } from "lucide-react";
export function TopBar({
  props,
}: {
  props: {
    sidebarOpen: boolean;
    setSidebarOpen: (val: boolean | ((v: boolean) => boolean)) => void;
    searchRef: any;
    searchTerm: string;
    setSearchTerm: (s: string) => void;
    filteredSearch: any[];
    handleSearchPick: (i: any) => void;
    theme: string;
    themeMenuOpen: boolean;
    setThemeMenuOpen: (b: boolean) => void;
    cycleTheme: () => void;
    THEME_OPTIONS: any[];
    setTheme: (t: any) => void;
    readiness: number;
  };
}) {
  const {
    sidebarOpen,
    setSidebarOpen,
    searchRef,
    searchTerm,
    setSearchTerm,
    filteredSearch,
    handleSearchPick,
    theme,
    themeMenuOpen,
    setThemeMenuOpen,
    cycleTheme,
    THEME_OPTIONS,
    setTheme,
    readiness,
  } = props;

  return (
    <header className="topbar">
      <button
        className="icon-button tb-ham"
        onClick={() => setSidebarOpen((o: boolean) => !o)}
      >
        {sidebarOpen ? <X size={17} /> : <Menu size={17} />}
      </button>

      <div className="topbar-search">
        <div className="search-shell">
          <Search size={15} />
          <input
            ref={searchRef}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search modules, problems… ( / )"
          />
          <Command size={13} />
          {filteredSearch.length > 0 && (
            <div className="search-popover">
              {filteredSearch.map((item: any) => (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleSearchPick(item)}
                >
                  <span>{item.type}</span>
                  <strong>{item.label}</strong>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="topbar-right">
        <div style={{ position: "relative", display: "inline-block" }}>
          <button
            className={`icon-button theme-toggle-btn ${theme} ${themeMenuOpen ? "active" : ""}`}
            onClick={() => setThemeMenuOpen(!themeMenuOpen)}
            title={`Theme: ${theme}. Click to select theme.`}
            aria-label="Select visual theme"
          >
            {theme === "dark" && (
              <Moon size={16} style={{ color: "#38bdf8" }} />
            )}
            {theme === "light" && (
              <Sun size={16} style={{ color: "#0284c7" }} />
            )}
            {theme === "oled" && <Zap size={16} style={{ color: "#a855f7" }} />}
            {theme === "dracula" && (
              <Palette size={16} style={{ color: "#ff79c6" }} />
            )}
            {theme === "onedark" && (
              <Code2 size={16} style={{ color: "#61afef" }} />
            )}
            {theme === "ember" && (
              <Flame size={16} style={{ color: "#f97316" }} />
            )}
          </button>

          {themeMenuOpen && (
            <>
              <div
                style={{ position: "fixed", inset: 0, zIndex: 9998 }}
                onClick={() => setThemeMenuOpen(false)}
              />
              <div className="theme-popover">
                <div
                  style={{
                    padding: "6px 8px 8px 8px",
                    borderBottom: "1px solid var(--border)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      color: "var(--muted)",
                    }}
                  >
                    Color Themes
                  </span>
                  <button
                    onClick={cycleTheme}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--cyan)",
                      fontSize: "11px",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                    title="Cycle to next theme"
                  >
                    Next →
                  </button>
                </div>

                {THEME_OPTIONS.map((opt: any) => (
                  <button
                    key={opt.id}
                    className={`theme-option-item ${theme === opt.id ? "active" : ""}`}
                    onClick={() => {
                      setTheme(opt.id);
                      setThemeMenuOpen(false);
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <span
                        style={{ color: opt.color, display: "inline-flex" }}
                      >
                        {opt.id === "dark" && <Moon size={14} />}
                        {opt.id === "light" && <Sun size={14} />}
                        {opt.id === "oled" && <Zap size={14} />}
                        {opt.id === "dracula" && <Palette size={14} />}
                        {opt.id === "onedark" && <Code2 size={14} />}
                        {opt.id === "ember" && <Flame size={14} />}
                      </span>
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontWeight: 600, fontSize: "12px" }}>
                          {opt.label}
                        </div>
                        <div
                          style={{
                            fontSize: "10px",
                            color: "var(--muted)",
                          }}
                        >
                          {opt.desc}
                        </div>
                      </div>
                    </div>
                    {theme === opt.id && (
                      <Check size={14} style={{ color: "var(--cyan)" }} />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <span title="Readiness">
          <Target size={14} />
          {readiness}%
        </span>
      </div>
    </header>
  );
}
