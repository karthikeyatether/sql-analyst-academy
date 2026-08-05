import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

import { ErrorBoundary } from "./components/ErrorBoundary";

import { initDatabase } from "./utils/sqlEngine";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary fallbackTitle="SQL Academy Platform">
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);

if (typeof window !== "undefined") {
  const prewarm = () => {
    initDatabase().catch((err) =>
      console.warn("Background SQL Engine pre-warm notice:", err),
    );
  };
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(prewarm, { timeout: 500 });
  } else {
    setTimeout(prewarm, 100);
  }
}

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.warn("ServiceWorker registration failed:", err);
    });
  });
}
