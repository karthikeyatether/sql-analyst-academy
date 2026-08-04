import React from "react";

export function EditorWorkspaceSkeleton() {
  return (
    <div className="skeleton-workspace">
      {/* Skeleton Header Toolbar */}
      <div className="skeleton-header">
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div
            className="skeleton-pulse"
            style={{ width: "130px", height: "18px" }}
          />
          <div
            className="skeleton-pulse"
            style={{ width: "80px", height: "14px" }}
          />
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div
            className="skeleton-pulse"
            style={{ width: "90px", height: "28px", borderRadius: "6px" }}
          />
          <div
            className="skeleton-pulse"
            style={{ width: "110px", height: "28px", borderRadius: "6px" }}
          />
        </div>
      </div>

      {/* Skeleton Main Split Body */}
      <div className="skeleton-body">
        {/* Left Panel Placeholder */}
        <div className="skeleton-sidebar">
          <div
            className="skeleton-pulse"
            style={{ width: "60%", height: "22px" }}
          />
          <div
            className="skeleton-pulse"
            style={{ width: "100%", height: "14px" }}
          />
          <div
            className="skeleton-pulse"
            style={{ width: "90%", height: "14px" }}
          />
          <div
            className="skeleton-pulse"
            style={{ width: "95%", height: "14px" }}
          />
          <div style={{ height: "16px" }} />
          <div
            className="skeleton-pulse"
            style={{ width: "100%", height: "70px", borderRadius: "8px" }}
          />
          <div style={{ height: "16px" }} />
          <div
            className="skeleton-pulse"
            style={{ width: "40%", height: "16px" }}
          />
          <div
            className="skeleton-pulse"
            style={{ width: "100%", height: "36px", borderRadius: "6px" }}
          />
          <div
            className="skeleton-pulse"
            style={{ width: "100%", height: "36px", borderRadius: "6px" }}
          />
          <div
            className="skeleton-pulse"
            style={{ width: "100%", height: "36px", borderRadius: "6px" }}
          />
        </div>

        {/* Right Panel Editor Area Placeholder */}
        <div className="skeleton-editor-area">
          {/* Top Code Lines */}
          <div className="skeleton-editor-top">
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <span style={{ opacity: 0.3, fontSize: "12px" }}>1</span>
              <div
                className="skeleton-pulse"
                style={{ width: "45%", height: "14px" }}
              />
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <span style={{ opacity: 0.3, fontSize: "12px" }}>2</span>
              <div
                className="skeleton-pulse"
                style={{ width: "65%", height: "14px" }}
              />
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <span style={{ opacity: 0.3, fontSize: "12px" }}>3</span>
              <div
                className="skeleton-pulse"
                style={{ width: "30%", height: "14px" }}
              />
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <span style={{ opacity: 0.3, fontSize: "12px" }}>4</span>
              <div
                className="skeleton-pulse"
                style={{ width: "55%", height: "14px" }}
              />
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <span style={{ opacity: 0.3, fontSize: "12px" }}>5</span>
              <div
                className="skeleton-pulse"
                style={{ width: "40%", height: "14px" }}
              />
            </div>
          </div>

          {/* Bottom Results Area Placeholder */}
          <div className="skeleton-editor-bottom">
            <div style={{ display: "flex", gap: "12px" }}>
              <div
                className="skeleton-pulse"
                style={{ width: "80px", height: "20px" }}
              />
              <div
                className="skeleton-pulse"
                style={{ width: "80px", height: "20px" }}
              />
            </div>
            <div
              className="skeleton-pulse"
              style={{ width: "100%", height: "100px", borderRadius: "6px" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
