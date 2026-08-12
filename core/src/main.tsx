import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

import { ErrorBoundary } from "./components/ErrorBoundary";
import { setupMonacoLoader } from "./utils/monacoConfig";

// Crucial for ultra-fast editor boot: force Monaco to use the local /vs/ directory
// instead of downloading 2MB+ from the jsdelivr CDN on every editor mount.
setupMonacoLoader();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary fallbackTitle="SQL Academy Platform">
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  void navigator.serviceWorker.register("/sw.js").catch(() => {
    // The app remains fully usable when service-worker registration is unavailable.
  });
}

if (document.readyState === "loading") {
  window.addEventListener("load", registerServiceWorker, { once: true });
} else {
  registerServiceWorker();
}
