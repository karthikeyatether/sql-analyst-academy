import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Search, Book, Code2, Bug, Zap, ChevronRight, Command, ArrowUp, ArrowDown,
  Target, Play, BarChart3, BookOpen, Trophy, X
} from "lucide-react";

export interface CommandItem {
  id: string;
  type: "module" | "problem" | "puzzle" | "action" | "nav";
  label: string;
  subtitle?: string;
  shortcut?: string;
  icon?: React.ReactNode;
  action: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  items: CommandItem[];
}

const TYPE_COLORS: Record<string, string> = {
  module: "#22d3ee",
  problem: "#4ade80",
  puzzle: "#f472b6",
  action: "#fb923c",
  nav: "#a78bfa",
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  module: <Book size={13} />,
  problem: <Code2 size={13} />,
  puzzle: <Bug size={13} />,
  action: <Zap size={13} />,
  nav: <Target size={13} />,
};

export default function CommandPalette({ open, onClose, items }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return items.slice(0, 12);
    const q = query.toLowerCase();
    return items
      .filter(i =>
        i.label.toLowerCase().includes(q) ||
        i.subtitle?.toLowerCase().includes(q) ||
        i.type.toLowerCase().includes(q)
      )
      .slice(0, 12);
  }, [items, query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  useEffect(() => {
    // Scroll active item into view
    const el = listRef.current?.querySelector(`[data-idx="${activeIdx}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, filtered.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
      if (e.key === "Enter") {
        e.preventDefault();
        const item = filtered[activeIdx];
        if (item) { item.action(); onClose(); }
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [open, filtered, activeIdx, onClose]);

  if (!open) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 99999,
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      paddingTop: "12vh",
    }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute", inset: 0,
          background: "rgba(0,0,0,0.72)",
          backdropFilter: "blur(6px)",
        }}
      />

      {/* Palette container */}
      <div style={{
        position: "relative", zIndex: 1,
        width: "min(640px, 92vw)",
        background: "var(--surface, #1a1a2e)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "16px",
        boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
        overflow: "hidden",
        animation: "cp-drop 0.18s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        {/* Search Header */}
        <div style={{
          display: "flex", alignItems: "center", gap: "12px",
          padding: "14px 18px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}>
          <Search size={18} style={{ color: "var(--cyan, #22d3ee)", flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search modules, problems, puzzles, actions…"
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              color: "var(--fg, #e2e8f0)", fontSize: "15px", fontWeight: 500,
              caretColor: "var(--cyan, #22d3ee)",
            }}
          />
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--muted, #64748b)", cursor: "pointer", padding: "2px", borderRadius: "4px" }}>
            <X size={15} />
          </button>
          <kbd style={{
            padding: "2px 6px", borderRadius: "5px",
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
            fontSize: "11px", color: "var(--muted, #64748b)", fontFamily: "inherit",
          }}>ESC</kbd>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          style={{ maxHeight: "420px", overflowY: "auto", padding: "6px" }}
        >
          {filtered.length === 0 && (
            <div style={{
              padding: "32px 16px", textAlign: "center",
              color: "var(--muted, #64748b)", fontSize: "13px",
            }}>
              No results for <strong style={{ color: "var(--fg)" }}>"{query}"</strong>
            </div>
          )}

          {filtered.map((item, idx) => (
            <button
              key={item.id}
              data-idx={idx}
              onClick={() => { item.action(); onClose(); }}
              onMouseEnter={() => setActiveIdx(idx)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: "12px",
                padding: "10px 12px", borderRadius: "10px",
                background: idx === activeIdx ? "rgba(255,255,255,0.07)" : "transparent",
                border: "none", cursor: "pointer",
                textAlign: "left",
                transition: "background 0.1s ease",
              }}
            >
              {/* Type icon + pill */}
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "5px",
                padding: "3px 8px", borderRadius: "6px",
                background: `${TYPE_COLORS[item.type]}18`,
                color: TYPE_COLORS[item.type],
                fontSize: "11px", fontWeight: 700, letterSpacing: "0.3px",
                flexShrink: 0,
              }}>
                {TYPE_ICONS[item.type]}
                {item.type}
              </span>

              {/* Label + subtitle */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  color: "var(--fg, #e2e8f0)", fontSize: "13px", fontWeight: 600,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>{item.label}</div>
                {item.subtitle && (
                  <div style={{
                    color: "var(--muted, #64748b)", fontSize: "11px",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>{item.subtitle}</div>
                )}
              </div>

              {/* Shortcut */}
              {item.shortcut && (
                <kbd style={{
                  padding: "2px 6px", borderRadius: "5px", flexShrink: 0,
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  fontSize: "11px", color: "var(--muted, #64748b)", fontFamily: "inherit",
                }}>{item.shortcut}</kbd>
              )}

              {idx === activeIdx && (
                <ChevronRight size={14} style={{ color: "var(--cyan, #22d3ee)", flexShrink: 0 }} />
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: "8px 16px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex", gap: "16px", alignItems: "center",
          color: "var(--muted, #64748b)", fontSize: "11px",
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <ArrowUp size={11} /><ArrowDown size={11} /> Navigate
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            ↵ Select
          </span>
          <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "4px" }}>
            <Command size={11} />K to toggle
          </span>
        </div>
      </div>

      <style>{`
        @keyframes cp-drop {
          from { opacity: 0; transform: translateY(-12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
