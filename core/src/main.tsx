import React from "react";
import ReactDOM from "react-dom/client";
import { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import App from "./App";
import "./styles.css";

import { ErrorBoundary } from "./components/ErrorBoundary";

// Pre-configure Monaco loader globally with local bundled instance for offline/CSP resilience
loader.config({ monaco });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary fallbackTitle="SQL Academy Platform">
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);

function cleanupStaleCaches() {
  if (typeof window === "undefined") return;

  // 1. Unregister all service workers immediately
  if ("serviceWorker" in navigator) {
    void navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        void registration.unregister();
      }
    });
  }

  // 2. Wipe CacheStorage keys to prevent disk cache loops
  if ("caches" in window) {
    void caches.keys().then((keys) => {
      for (const key of keys) {
        void caches.delete(key);
      }
    });
  }
}

cleanupStaleCaches();
