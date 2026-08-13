import React, { useState, useEffect } from "react";
import { Edit3, Trash2, Plus, Bookmark, Highlighter, Download, FileText } from "lucide-react";

export interface StudyNote {
  id: string;
  moduleId: number;
  selectedText?: string;
  noteText: string;
  color?: string; // highlight color
  createdAt: number;
}

interface StoryboardNoteTakerProps {
  moduleId: number;
  moduleTitle: string;
}

export default function StoryboardNoteTaker({ moduleId, moduleTitle }: StoryboardNoteTakerProps) {
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [activeColor, setActiveColor] = useState("rgba(255, 190, 61, 0.2)"); // yellow default

  // Load notes
  useEffect(() => {
    try {
      const stored = localStorage.getItem("sql-aa-study-notes");
      if (stored) {
        setNotes(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load study notes:", e);
    }
  }, []);

  // Listen to selection changes inside storyboard
  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      const text = selection ? selection.toString().trim() : "";
      if (text.length > 2 && text.length < 500) {
        setSelectedText(text);
      } else {
        setSelectedText("");
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const saveNotes = (updated: StudyNote[]) => {
    setNotes(updated);
    localStorage.setItem("sql-aa-study-notes", JSON.stringify(updated));
  };

  const handleAddNote = () => {
    if (!newNote.trim() && !selectedText.trim()) return;

    const note: StudyNote = {
      id: Math.random().toString(36).substring(2, 9),
      moduleId,
      selectedText: selectedText || undefined,
      noteText: newNote.trim() || (selectedText ? "Highlighted concept" : ""),
      color: selectedText ? activeColor : undefined,
      createdAt: Date.now()
    };

    saveNotes([note, ...notes]);
    setNewNote("");
    setSelectedText("");
    // Clear browser selection
    window.getSelection()?.removeAllRanges();
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    saveNotes(updated);
  };

  const exportNotes = () => {
    const filtered = notes.filter(n => n.moduleId === moduleId);
    if (filtered.length === 0) return;

    let content = `# Study Notes: ${moduleTitle} (Module ${moduleId})\n\n`;
    filtered.forEach(n => {
      if (n.selectedText) {
        content += `> **Highlight**: ${n.selectedText}\n\n`;
      }
      content += `* **Note**: ${n.noteText}\n`;
      content += `  *(Created on: ${new Date(n.createdAt).toLocaleDateString()})*\n\n---\n\n`;
    });

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sql-notes-module-${moduleId}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentModuleNotes = notes.filter(n => n.moduleId === moduleId);

  return (
    <div
      className="note-taker-panel"
      style={{
        background: "var(--panel, #1e1e2f)",
        border: "1px solid var(--border, #2e2e3f)",
        borderRadius: "12px",
        padding: "16px",
        marginTop: "20px"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <h4 style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px", color: "var(--text, #fff)", fontSize: "14px", fontWeight: 700 }}>
          <Bookmark size={16} style={{ color: "var(--cyan)" }} />
          <span>My Interactive Study Notes</span>
        </h4>
        {currentModuleNotes.length > 0 && (
          <button
            onClick={exportNotes}
            style={{
              background: "rgba(56, 217, 255, 0.1)",
              border: "1px solid rgba(56, 217, 255, 0.3)",
              color: "var(--cyan)",
              borderRadius: "4px",
              padding: "2px 8px",
              fontSize: "11px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
            title="Export notes as Markdown file"
          >
            <Download size={12} /> Export
          </button>
        )}
      </div>

      {/* Selected text highlight builder */}
      {selectedText && (
        <div
          style={{
            background: "rgba(56, 217, 255, 0.05)",
            border: "1px solid rgba(56, 217, 255, 0.2)",
            borderRadius: "8px",
            padding: "10px",
            marginBottom: "12px"
          }}
        >
          <span style={{ fontSize: "11px", color: "var(--text-secondary, #94a3b8)", display: "block", marginBottom: "6px" }}>
            Selected Text to Highlight:
          </span>
          <blockquote style={{ margin: "0 0 10px 0", paddingLeft: "10px", borderLeft: "3px solid var(--cyan)", fontSize: "12px", fontStyle: "italic", opacity: 0.85 }}>
            "{selectedText}"
          </blockquote>

          {/* Highlight Color Pickers */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Color:</span>
            {[
              { val: "rgba(255, 190, 61, 0.25)", label: "Yellow" },
              { val: "rgba(52, 211, 153, 0.25)", label: "Green" },
              { val: "rgba(167, 139, 250, 0.25)", label: "Violet" }
            ].map(c => (
              <button
                key={c.val}
                onClick={() => setActiveColor(c.val)}
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  backgroundColor: c.val.replace("0.25", "0.8"),
                  border: activeColor === c.val ? "2px solid #fff" : "1px solid transparent",
                  cursor: "pointer",
                  padding: 0
                }}
                title={c.label}
              />
            ))}
          </div>
        </div>
      )}

      {/* Add note input form */}
      <div style={{ display: "flex", gap: "8px" }}>
        <input
          type="text"
          placeholder={selectedText ? "Add a note to this highlight..." : "Type a study note..."}
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
          style={{
            flex: 1,
            background: "var(--input-bg, #0f0f1b)",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            padding: "8px 10px",
            color: "var(--text)",
            fontSize: "12px"
          }}
          onKeyDown={e => {
            if (e.key === "Enter") handleAddNote();
          }}
        />
        <button
          onClick={handleAddNote}
          style={{
            background: "var(--cyan)",
            border: "none",
            borderRadius: "6px",
            padding: "8px 12px",
            color: "#000",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}
        >
          <Plus size={14} /> Add
        </button>
      </div>

      {/* List of current module notes */}
      {currentModuleNotes.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px", maxHeight: "250px", overflowY: "auto" }}>
          {currentModuleNotes.map(n => (
            <div
              key={n.id}
              style={{
                background: "var(--bg-tertiary, #151525)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "10px",
                position: "relative"
              }}
            >
              <button
                onClick={() => handleDeleteNote(n.id)}
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  background: "none",
                  border: "none",
                  color: "var(--muted)",
                  cursor: "pointer",
                  padding: "2px"
                }}
                title="Delete note"
              >
                <Trash2 size={12} />
              </button>

              {n.selectedText && (
                <div
                  style={{
                    backgroundColor: n.color,
                    padding: "4px 6px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontStyle: "italic",
                    marginBottom: "6px",
                    display: "inline-block",
                    borderLeft: "2px solid rgba(255,255,255,0.3)"
                  }}
                >
                  "{n.selectedText}"
                </div>
              )}
              <div style={{ fontSize: "12px", color: "var(--text)" }}>{n.noteText}</div>
              <div style={{ fontSize: "9px", color: "var(--text-tertiary)", marginTop: "4px" }}>
                {new Date(n.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-tertiary)", fontSize: "11px" }}>
          Select any text inside the lesson to highlight and save notes instantly!
        </div>
      )}
    </div>
  );
}
