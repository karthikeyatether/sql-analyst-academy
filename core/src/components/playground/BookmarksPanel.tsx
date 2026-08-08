import React from "react";
import { BookmarkItem } from "../../AppWorkspace";
import { Bookmark, Copy, Play, Trash2 } from "lucide-react";

interface BookmarksPanelProps {
  bookmarks: BookmarkItem[];
  setBookmarks: React.Dispatch<React.SetStateAction<BookmarkItem[]>>;
  updateEditorQuery: (
    val: string,
    mode: "practice" | "puzzle" | "free",
    id?: string,
  ) => void;
  copyToClipboard: (text: string, label: string) => void;
  playgroundMode: "practice" | "puzzle" | "free";
  activeId?: string;
}

const BookmarksPanel: React.FC<BookmarksPanelProps> = ({
  bookmarks,
  setBookmarks,
  updateEditorQuery,
  copyToClipboard,
  playgroundMode,
  activeId,
}) => {
  const handleDelete = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleInsert = (query: string) => {
    updateEditorQuery(query, playgroundMode, activeId);
  };

  if (bookmarks.length === 0) {
    return (
      <div
        style={{
          padding: "24px",
          textAlign: "center",
          color: "var(--muted)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <Bookmark size={32} style={{ opacity: 0.5 }} />
        <p style={{ fontSize: "14px" }}>No bookmarks saved yet.</p>
        <p style={{ fontSize: "12px", maxWidth: "200px" }}>
          Queries are automatically saved here when you solve a problem, or you
          can save them manually from the editor.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "12px" }}
    >
      {bookmarks.map((bookmark) => (
        <div
          key={bookmark.id}
          style={{
            background: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--text)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Bookmark size={14} color="var(--cyan)" />
              {bookmark.title}
            </div>
            <div style={{ display: "flex", gap: "4px" }}>
              <button
                onClick={() => handleInsert(bookmark.query)}
                className="icon-button"
                title="Insert into Editor"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text)",
                  padding: "4px",
                }}
              >
                <Play size={14} />
              </button>
              <button
                onClick={() =>
                  copyToClipboard(bookmark.query, "Bookmarked Query")
                }
                className="icon-button"
                title="Copy to Clipboard"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text)",
                  padding: "4px",
                }}
              >
                <Copy size={14} />
              </button>
              <button
                onClick={() => handleDelete(bookmark.id)}
                className="icon-button"
                title="Delete Bookmark"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--rose, #f43f5e)",
                  padding: "4px",
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          <pre
            style={{
              margin: 0,
              padding: "8px",
              background: "var(--panel)",
              borderRadius: "4px",
              fontSize: "11px",
              color: "var(--text-secondary)",
              overflowX: "auto",
              fontFamily: "monospace",
              maxHeight: "150px",
            }}
          >
            {bookmark.query}
          </pre>
          <div
            style={{ fontSize: "10px", color: "var(--muted)", textAlign: "right" }}
          >
            {new Date(bookmark.timestamp).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookmarksPanel;
