import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in boundary:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: "16px",
          border: "1px solid var(--border)",
          borderRadius: "6px",
          background: "var(--bg2)",
          color: "var(--text)",
          fontFamily: "system-ui, sans-serif"
        }}>
          <h4 style={{ margin: "0 0 8px 0", color: "var(--rose)", fontSize: "14px" }}>
            {this.props.fallbackTitle || "Component Render Failed"}
          </h4>
          <p style={{ margin: 0, fontSize: "12px", color: "var(--muted)", lineHeight: "1.4" }}>
            An unexpected rendering crash occurred in this layout pane. Please try resetting or refreshing the page.
          </p>
          {this.state.error && (
            <>
              <pre style={{
                marginTop: "12px",
                padding: "8px",
                background: "rgba(0, 0, 0, 0.2)",
                borderRadius: "4px",
                fontSize: "10px",
                overflowX: "auto",
                color: "var(--muted)",
                border: "1px solid rgba(255, 255, 255, 0.05)"
              }}>
                {this.state.error.stack || this.state.error.message}
              </pre>
              <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                <button
                  style={{
                    padding: "4px 10px",
                    fontSize: "11px",
                    borderRadius: "4px",
                    background: "rgba(56, 217, 255, 0.1)",
                    border: "1px solid rgba(56, 217, 255, 0.3)",
                    color: "var(--cyan)",
                    cursor: "pointer"
                  }}
                  onClick={() => {
                    navigator.clipboard.writeText(this.state.error?.stack || this.state.error?.message || "");
                    alert("Error details copied to clipboard!");
                  }}
                >
                  Copy Error Details
                </button>
                <button
                  style={{
                    padding: "4px 10px",
                    fontSize: "11px",
                    borderRadius: "4px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                    cursor: "pointer"
                  }}
                  onClick={() => window.location.reload()}
                >
                  Reload Page
                </button>
              </div>
            </>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
