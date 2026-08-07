import AppWorkspace from "./AppWorkspace";

function AppLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading SQL Academy"
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        background: "var(--bg, #0b0f14)",
        color: "var(--text, #f4f7fb)",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <section style={{ width: "min(460px, 100%)", textAlign: "center" }}>
        <div
          style={{
            width: 44,
            height: 44,
            margin: "0 auto 18px",
            border: "3px solid rgba(255,255,255,.14)",
            borderTopColor: "var(--cyan, #54d6ff)",
            borderRadius: "50%",
            animation: "sql-academy-spin .8s linear infinite",
          }}
        />
        <h1 style={{ margin: 0, fontSize: 22 }}>SQL Analyst Academy</h1>
        <p style={{ margin: "10px 0 0", color: "var(--muted, #9aa8b8)" }}>
          Loading your workspace…
        </p>
      </section>
      <style>{`
        @keyframes sql-academy-spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}

export default function App() {
  return <AppWorkspace />;
}
