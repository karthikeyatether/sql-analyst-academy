import { loader } from "@monaco-editor/react";

let initialized = false;

export function setupMonacoLoader() {
  if (initialized) return;
  loader.config({ paths: { vs: "/vs" } });
  initialized = true;
}
