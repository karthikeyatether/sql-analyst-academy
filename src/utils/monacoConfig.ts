import type { Monaco } from "@monaco-editor/react";
import { loader } from "@monaco-editor/react";
import * as monacoCore from "monaco-editor/esm/vs/editor/editor.api.js";

// Core editor widgets & styling (excluding DiffEditor & heavy IDE subsystems)
import "monaco-editor/esm/vs/editor/browser/coreCommands.js";
import "monaco-editor/esm/vs/editor/browser/widget/codeEditor/codeEditorWidget.js";
import "monaco-editor/esm/vs/base/browser/ui/codicons/codiconStyles.js";

// Essential SQL editing contributions
import "monaco-editor/esm/vs/editor/contrib/bracketMatching/browser/bracketMatching.js";
import "monaco-editor/esm/vs/editor/contrib/caretOperations/browser/caretOperations.js";
import "monaco-editor/esm/vs/editor/contrib/clipboard/browser/clipboard.js";
import "monaco-editor/esm/vs/editor/contrib/comment/browser/comment.js";
import "monaco-editor/esm/vs/editor/contrib/contextmenu/browser/contextmenu.js";
import "monaco-editor/esm/vs/editor/contrib/cursorUndo/browser/cursorUndo.js";
import "monaco-editor/esm/vs/editor/contrib/find/browser/findController.js";
import "monaco-editor/esm/vs/editor/contrib/folding/browser/folding.js";
import "monaco-editor/esm/vs/editor/contrib/hover/browser/hoverContribution.js";
import "monaco-editor/esm/vs/editor/contrib/indentation/browser/indentation.js";
import "monaco-editor/esm/vs/editor/contrib/linesOperations/browser/linesOperations.js";
import "monaco-editor/esm/vs/editor/contrib/multicursor/browser/multicursor.js";
import "monaco-editor/esm/vs/editor/contrib/parameterHints/browser/parameterHints.js";
import "monaco-editor/esm/vs/editor/contrib/snippet/browser/snippetController2.js";
import "monaco-editor/esm/vs/editor/contrib/suggest/browser/suggestController.js";
import "monaco-editor/esm/vs/editor/contrib/tokenization/browser/tokenization.js";
import "monaco-editor/esm/vs/editor/contrib/wordHighlighter/browser/wordHighlighter.js";
import "monaco-editor/esm/vs/editor/contrib/wordOperations/browser/wordOperations.js";

// Exclusively load SQL basic language contribution
import "monaco-editor/esm/vs/basic-languages/sql/sql.contribution";

loader.config({ monaco: monacoCore as any });

export function configureMonacoThemes(monaco: Monaco): void {
  monaco.editor.defineTheme("hc-oled", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "38bdf8", fontStyle: "bold" },
      { token: "keyword.sql", foreground: "38bdf8", fontStyle: "bold" },
      { token: "predefined", foreground: "c084fc", fontStyle: "bold" },
      { token: "predefined.sql", foreground: "c084fc", fontStyle: "bold" },
      { token: "type", foreground: "f59e0b", fontStyle: "bold" },
      { token: "type.sql", foreground: "f59e0b", fontStyle: "bold" },
      { token: "string", foreground: "34d399" },
      { token: "string.sql", foreground: "34d399" },
      { token: "number", foreground: "fb923c" },
      { token: "number.sql", foreground: "fb923c" },
      { token: "comment", foreground: "64748b", fontStyle: "italic" },
      { token: "comment.sql", foreground: "64748b", fontStyle: "italic" },
      { token: "operator", foreground: "f472b6" },
      { token: "operator.sql", foreground: "f472b6" },
      { token: "delimiter", foreground: "facc15" },
      { token: "delimiter.parenthesis", foreground: "ffd700" },
      { token: "identifier", foreground: "f8fafc" },
      { token: "identifier.sql", foreground: "f8fafc" },
    ],
    colors: {
      "editor.background": "#000000",
      "editorGutter.background": "#000000",
      "editor.lineHighlightBackground": "#050505",
      "editorLineNumber.foreground": "#475569",
      "editorLineNumber.activeForeground": "#38bdf8",
      "editorBracketMatch.background": "#1e293b",
      "editorBracketMatch.border": "#38bdf8",
      "editorBracketHighlight.foreground1": "#ffd700",
      "editorBracketHighlight.foreground2": "#38bdf8",
      "editorBracketHighlight.foreground3": "#f472b6",
      "editorBracketHighlight.foreground4": "#34d399",
      "editorBracketHighlight.foreground5": "#c084fc",
      "editorBracketHighlight.foreground6": "#fb923c",
      "editorBracketHighlight.unexpectedBracket.foreground": "#ef4444",
    },
  });
}

export const MONACO_DEFAULT_OPTIONS = {
  fontSize: 13,
  fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  wordWrap: "on" as const,
  lineNumbers: "on" as const,
  glyphMargin: false,
  folding: true,
  lineDecorationsWidth: 10,
  lineNumbersMinChars: 3,
  automaticLayout: true,
  tabSize: 2,
  cursorBlinking: "smooth" as const,
  cursorSmoothCaretAnimation: "on" as const,
  smoothScrolling: true,
  renderLineHighlight: "all" as const,
  suggestOnTriggerCharacters: true,
  quickSuggestions: { other: true, comments: false, strings: true },
  multiCursorModifier: "alt" as const,
  multiCursorMergeOverlapping: true,
};
