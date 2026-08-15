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

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  // Unregister stale service workers so the browser never serves cached old assets
  void navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      void registration.unregister();
    }
  });
}

if (document.readyState === "loading") {
  window.addEventListener("load", registerServiceWorker, { once: true });
} else {
  registerServiceWorker();
}
