import React, { useRef } from "react";

interface SplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
  leftWidth: number;
  onResize: (w: number) => void;
  minLeft?: number;
  maxLeft?: number;
}

export function SplitPane({
  left,
  right,
  leftWidth,
  onResize,
  minLeft = 180,
  maxLeft = 700,
}: SplitPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  function onMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const style = document.createElement("style");
    style.id = "h-split-drag-pointer-events-override";
    style.innerHTML =
      "* { pointer-events: none !important; } .split-handle, .split-handle * { pointer-events: auto !important; }";
    document.head.appendChild(style);

    function onMove(ev: MouseEvent) {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newW = Math.min(maxLeft, Math.max(minLeft, ev.clientX - rect.left));
      onResize(newW);
    }

    let safetyTimeout: ReturnType<typeof setTimeout> | null = setTimeout(
      onUp,
      3000,
    );

    function onUp() {
      if (safetyTimeout) {
        clearTimeout(safetyTimeout);
        safetyTimeout = null;
      }
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      const s = document.getElementById("h-split-drag-pointer-events-override");
      if (s) s.remove();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  return (
    <div className="split-pane" ref={containerRef}>
      <div className="split-left" style={{ width: leftWidth }}>
        {left}
      </div>
      <div
        className="split-handle"
        onMouseDown={onMouseDown}
        title="Drag to resize"
      >
        <div className="split-handle-bar" />
      </div>
      <div className="split-right">{right}</div>
    </div>
  );
}

interface VSplitPaneProps {
  top: React.ReactNode;
  bottom: React.ReactNode;
  topHeight: number;
  onResize: (h: number) => void;
  minTop?: number;
  maxTop?: number;
  minBottom?: number;
  maximized?: boolean;
}

export function VSplitPane({
  top,
  bottom,
  topHeight,
  onResize,
  minTop = 140,
  maxTop = 900,
  minBottom = 160,
  maximized = false,
}: VSplitPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  // Auto-clamp topHeight so output pane never disappears on window resize / load
  React.useEffect(() => {
    if (!containerRef.current) return;
    const containerH = containerRef.current.clientHeight;
    if (containerH > 0) {
      const maxAllowed = Math.max(minTop, containerH - minBottom);
      if (topHeight > maxAllowed) {
        onResize(maxAllowed);
      }
    }
  }, [topHeight, minTop, minBottom, onResize]);

  function handleReset() {
    if (!containerRef.current) {
      onResize(340);
      return;
    }
    const containerH = containerRef.current.clientHeight;
    const half = Math.round(containerH * 0.45);
    onResize(Math.max(minTop, Math.min(half, containerH - minBottom)));
  }

  function onMouseDown(e: React.MouseEvent) {
    if (maximized) return;
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";

    const style = document.createElement("style");
    style.id = "v-split-drag-pointer-events-override";
    style.innerHTML =
      "* { pointer-events: none !important; } .v-split-handle, .v-split-handle * { pointer-events: auto !important; }";
    document.head.appendChild(style);

    function onMove(ev: MouseEvent) {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const containerH = rect.height;
      const effectiveMaxTop = Math.min(
        maxTop,
        Math.max(minTop, containerH - minBottom),
      );
      const newH = Math.min(effectiveMaxTop, Math.max(minTop, ev.clientY - rect.top));
      onResize(newH);
    }

    let safetyTimeout: ReturnType<typeof setTimeout> | null = setTimeout(
      onUp,
      3000,
    );

    function onUp() {
      if (safetyTimeout) {
        clearTimeout(safetyTimeout);
        safetyTimeout = null;
      }
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      const s = document.getElementById("v-split-drag-pointer-events-override");
      if (s) s.remove();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  return (
    <div className="v-split-pane" ref={containerRef}>
      <div
        className="split-top"
        style={{ height: topHeight, minHeight: topHeight }}
      >
        {top}
      </div>
      {!maximized && (
        <div
          className="v-split-handle"
          onMouseDown={onMouseDown}
          onDoubleClick={handleReset}
          title="Drag to resize (Double-click to reset height)"
        >
          <div className="v-split-handle-bar" />
        </div>
      )}
      <div className="split-bottom">{bottom}</div>
    </div>
  );
}
