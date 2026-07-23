import React, { useEffect, useRef } from "react";
import { Keyboard, X } from "lucide-react";

interface ShortcutsModalProps {
  onClose: () => void;
}

export default function ShortcutsModal({ onClose }: ShortcutsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Focus the 'Got it' button or close button
    const closeBtn = modalRef.current?.querySelector(".icon-button");
    (closeBtn as HTMLElement)?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      if (e.key === "Tab") {
        const focusables = modalRef.current?.querySelectorAll("button, [tabindex]");
        if (focusables && focusables.length > 0) {
          const first = focusables[0] as HTMLElement;
          const last = focusables[focusables.length - 1] as HTMLElement;
          if (e.shiftKey) {
            if (document.activeElement === first) {
              last.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === last) {
              first.focus();
              e.preventDefault();
            }
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const list = [
    { key: "Ctrl + Enter", desc: "Run current SQL query" },
    { key: "/", desc: "Focus search bar" },
    { key: "?", desc: "Toggle keyboard shortcuts help" },
    { key: "Escape", desc: "Close modal / Clear search" },
    { key: "Tab", desc: "Navigate interactive controls" },
    { key: "Arrow keys", desc: "Navigate tabs / menu lists" },
  ];

  return (
    <div className="custom-modal-overlay" onClick={onClose}>
      <div
        className="custom-modal-window"
        ref={modalRef}
        style={{ maxWidth: '400px' }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
      >
        <div className="custom-modal-header">
          <h2 id="shortcuts-title">
            <Keyboard size={18} />
            <span>Keyboard Shortcuts</span>
          </h2>
          <button className="icon-button" onClick={onClose} aria-label="Close shortcuts modal">
            <X size={16} />
          </button>
        </div>
        <div className="custom-modal-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {list.map(item => (
              <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <span style={{ color: 'var(--muted)' }}>{item.desc}</span>
                <kbd style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: '4px', padding: '3px 6px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--cyan)', fontWeight: 'bold' }}>{item.key}</kbd>
              </div>
            ))}
          </div>
        </div>
        <div className="custom-modal-footer">
          <button className="primary-button" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
