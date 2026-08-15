import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

import { ErrorBoundary } from "./components/ErrorBoundary";

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
