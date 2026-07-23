import React, { useState, useMemo, useEffect, useRef, Suspense, lazy } from "react";
import {
  Database, Lightbulb, Brain, AlertTriangle, Search, Star, Maximize2, Minimize2, Settings, Download, Trash2, Edit3, Plus, Minus, Copy, Layout, Clipboard, BookOpen, Bug, Timer, Play, RefreshCcw, Eye, X, ChevronRight, CheckCircle2, Sparkles, Code2, BarChart3, Upload, Zap, Clock
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { BeforeMount, OnMount } from "@monaco-editor/react";
import type { Difficulty, PracticeProblem, RoadmapModule } from "../data/curriculum";
import type { QueryResult, QueryPlanStep } from "../utils/sqlEngine";
import { getQueryPlan, runQuery, resetDatabase, getLiveSchema, formatSql, getOptimizationAdvice, generateDynamicHint } from "../utils/sqlEngine";
import { downloadStatsReport } from "../utils/reportGenerator";
import QueryPlanFlowchart from "../components/QueryPlanFlowchart";
import SqlJoinVennDiagram from "../components/SqlJoinVennDiagram";
import SqlLinterAdvisor from "../components/SqlLinterAdvisor";
import SqlPerformanceComparer from "../components/SqlPerformanceComparer";
import ColumnProfileModal from "../components/ColumnProfileModal";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { SplitPane, VSplitPane } from "../components/SplitPane";
import ErdModalView from "../components/ErdModalView";
import LessonProse from "../components/LessonProse";

const Editor = lazy(() => import("@monaco-editor/react"));

type RightTab = "schema" | "hints" | "erd" | "linter";

interface QueryHistoryItem {
  id: string;
  query: string;
  createdAt: string;
  status: "success" | "error";
  rowCount?: number;
  durationMs?: number;
}

interface PlaygroundViewProps {
  progress: {
    completedModules: number[];
    solvedProblems: string[];
    solvedPuzzles: string[];
    completedDays: number[];
    queryRuns: number;
    minutesStudied: number;
    mockScores: Record<string, number>;
    completedChecklistItems: string[];
  };
  selectedProblem: PracticeProblem;
  playgroundMode: "practice" | "puzzle" | "free";
  setPlaygroundMode: (mode: "practice" | "puzzle" | "free") => void;
  roadmapModules: RoadmapModule[];
  tableSchemas: any[];
  datasetDomains: string[];
  rowLimit: string;
  setRowLimit: (val: string | ((prev: string) => string)) => void;
  sqlUpperKeywords: boolean;
  setSqlUpperKeywords: (val: boolean | ((prev: boolean) => boolean)) => void;
  editorFontSize: number;
  setEditorFontSize: (val: number | ((prev: number) => number)) => void;
  editorWordWrap: boolean;
  setEditorWordWrap: (val: boolean | ((prev: boolean) => boolean)) => void;
  editorMinimap: boolean;
  setEditorMinimap: (val: boolean | ((prev: boolean) => boolean)) => void;
  editorFontFamily: string;
  setEditorFontFamily: (val: string | ((prev: string) => string)) => void;
  editorTabSize: number;
  setEditorTabSize: (val: number | ((prev: number) => number)) => void;
  editorTheme: string;
  setEditorTheme: (val: string | ((prev: string) => string)) => void;
  theme: "dark" | "light" | "oled";
  query: string;
  setQuery: (val: string | ((prev: string) => string)) => void;
  queryResult: QueryResult;
  setQueryResult: React.Dispatch<React.SetStateAction<QueryResult>>;
  expectedResult: any;
  setExpectedResult: (res: any) => void;
  graderFeedback: any;
  setGraderFeedback: (val: any) => void;
  runCurrentQuery: () => void;
  copyToClipboard: (text: string) => void;
  openInPlayground: (p: PracticeProblem) => void;
  markProblemSolved: (p: PracticeProblem) => void;
  handleRightNavKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
  classForDiff: (d: Difficulty) => string;
  editorRef: React.MutableRefObject<any>;
  queryRef: React.MutableRefObject<string>;
  handleBeforeMount: BeforeMount;
  handleMount: OnMount;
  handleEditorChange: (val: string | undefined) => void;
  dbReady: boolean;
  streak: number;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
  
  // Seeding/Engine state properties
  liveSchema: any[];
  setLiveSchema: React.Dispatch<React.SetStateAction<any[]>>;
  
  // Saved queries
  savedQueries: any[];
  setSavedQueries: React.Dispatch<React.SetStateAction<any[]>>;
  
  // Custom dialog confirms
  showConfirm: (msg: string, onConfirm: () => void) => void;
  showPrompt: (msg: string, defaultVal: string, onSubmit: (val: string) => void) => void;
  
  // Extra settings
  graderStrict: boolean;
  setGraderStrict: (val: boolean | ((prev: boolean) => boolean)) => void;
  
  // Puzzle props
  activePuzzle: any;
  setActivePuzzleId: (id: string) => void;
  debugPuzzles: any[];
  getSavedPuzzleQuery: (p: any) => string;
  getSavedDraftQuery: (p: any) => string;
  updateEditorQuery: (newVal: string, pMode?: any, targetId?: string, moveCursorToEnd?: boolean) => void;
  stopAutoTyping: () => void;
  allProblems: PracticeProblem[];
  
  // App-level Monaco references and settings
  monacoRef: React.MutableRefObject<any>;
  insertTextAtCursor: (text: string) => void;
  lintErrors: any[];
  isAutoTyping: boolean;
  autoTypeQuery: (sql: string) => void;
  queryHistory: QueryHistoryItem[];
  setQueryHistory: React.Dispatch<React.SetStateAction<QueryHistoryItem[]>>;
  
  // Navigation / Shell props
  setSelectedDayId: (id: number) => void;
  setActiveView: (view: any) => void;
  learningRoadmap: any[];
  readiness: number;
  totalModules: number;
  totalProblems: number;
}

export default function PlaygroundView({
  progress,
  selectedProblem,
  playgroundMode,
  setPlaygroundMode,
  roadmapModules,
  tableSchemas,
  datasetDomains,
  rowLimit,
  setRowLimit,
  sqlUpperKeywords,
  setSqlUpperKeywords,
  editorFontSize,
  setEditorFontSize,
  editorWordWrap,
  setEditorWordWrap,
  editorMinimap,
  setEditorMinimap,
  editorFontFamily,
  setEditorFontFamily,
  editorTabSize,
  setEditorTabSize,
  editorTheme,
  setEditorTheme,
  theme,
  query,
  setQuery,
  queryResult,
  setQueryResult,
  expectedResult,
  setExpectedResult,
  graderFeedback,
  setGraderFeedback,
  runCurrentQuery,
  copyToClipboard,
  openInPlayground,
  markProblemSolved,
  handleRightNavKeyDown,
  classForDiff,
  editorRef,
  queryRef,
  handleBeforeMount,
  handleMount,
  handleEditorChange,
  dbReady,
  streak,
  showToast,
  liveSchema,
  setLiveSchema,
  savedQueries,
  setSavedQueries,
  showConfirm,
  showPrompt,
  graderStrict,
  setGraderStrict,
  activePuzzle,
  setActivePuzzleId,
  debugPuzzles,
  getSavedPuzzleQuery,
  getSavedDraftQuery,
  updateEditorQuery,
  stopAutoTyping,
  allProblems,
  monacoRef,
  insertTextAtCursor,
  lintErrors,
  isAutoTyping,
  autoTypeQuery,
  queryHistory,
  setQueryHistory,
  setSelectedDayId,
  setActiveView,
  learningRoadmap,
  readiness,
  totalModules,
  totalProblems
}: PlaygroundViewProps) {
  // Scoped states pushed down from App
  const [editorHeight, setEditorHeight] = useState(() => {
    try {
      const saved = localStorage.getItem("sql-aa-editor-h");
      return saved ? JSON.parse(saved) : 350;
    } catch {
      return 350;
    }
  });
  const handleEditorHeightResize = (h: number) => {
    setEditorHeight(h);
    localStorage.setItem("sql-aa-editor-h", JSON.stringify(h));
  };

  const [rightOpen, setRightOpen] = useState(true);
  const [editorMaximized, setEditorMaximized] = useState(false);
  const [activeResultTab, setActiveResultTab] = useState<"your" | "expected">("your");
  const [previewData, setPreviewData] = useState<{ [table: string]: QueryResult | null }>({});
  const [activeConsoleTab, setActiveConsoleTab] = useState<"results" | "plan" | "history" | "saved" | "benchmark">("results");
  const [queryPlanSteps, setQueryPlanSteps] = useState<QueryPlanStep[]>([]);
  const [resetStatus, setResetStatus] = useState(false);
  const resetTimeoutRef = useRef<any>(null);
  const triggerResetStatus = () => {
    setResetStatus(true);
    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    resetTimeoutRef.current = setTimeout(() => {
      setResetStatus(false);
      resetTimeoutRef.current = null;
    }, 2000);
  };

  const [schemaSearch, setSchemaSearch] = useState("");
  const [activeColumnProfile, setActiveColumnProfile] = useState<any>(null);
  const [activeTablePreview, setActiveTablePreview] = useState<any>(null);

  // Settings visibility state (originally settingsOpen)
  const [settingsOpen, setSettingsOpen] = useState(false);

  // A/B Benchmark & Playground Helper States
  const [playgroundSplit, setPlaygroundSplit] = useState(() => {
    try {
      const saved = localStorage.getItem("sql-aa-split-playground");
      return saved ? JSON.parse(saved) : 850;
    } catch {
      return 850;
    }
  });
  const handlePlaygroundSplitResize = (w: number) => {
    setPlaygroundSplit(w);
    localStorage.setItem("sql-aa-split-playground", JSON.stringify(w));
  };

  const [freeWriteMode, setFreeWriteMode] = useState(false);
  const [compareModeOpen, setCompareModeOpen] = useState(false);
  const [queryB, setQueryB] = useState(() => {
    try {
      const saved = localStorage.getItem("sql-aa-query-b-v2");
      return saved ? JSON.parse(saved) : "SELECT * FROM customers LIMIT 5;";
    } catch {
      return "SELECT * FROM customers LIMIT 5;";
    }
  });
  const handleSetQueryB = (val: string) => {
    setQueryB(val);
    localStorage.setItem("sql-aa-query-b-v2", JSON.stringify(val));
  };

  const [resB, setResB] = useState<QueryResult | null>(null);
  const [planB, setPlanB] = useState<QueryPlanStep[]>([]);
  const [benchmarkRunCount, setBenchmarkRunCount] = useState(0);

  // History states
  const [historySearch, setHistorySearch] = useState("");
  const [historyFavorites, setHistoryFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("sql-aa-history-favs-v4");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const handleSetHistoryFavorites = (val: string[] | ((prev: string[]) => string[])) => {
    setHistoryFavorites((prev) => {
      const next = typeof val === "function" ? val(prev) : val;
      localStorage.setItem("sql-aa-history-favs-v4", JSON.stringify(next));
      return next;
    });
  };

  const [showHistoryPinned, setShowHistoryPinned] = useState(false);

  // User manually saved queries
  const [bookmarkedQueries, setBookmarkedQueries] = useLocalStorage<
    { id: string; name: string; query: string; createdAt: number }[]
  >("sql-aa-saved-queries-v4", []);

  // Decoupled states originally defined in App
  const [activeRightTab, setActiveRightTab] = useState<RightTab>("schema");
  const [erdModalOpen, setErdModalOpen] = useState(false);
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [visibleHints, setVisibleHints] = useState(1);

  // Derived active module check
  const activeModule = useMemo(() => {
    if (!selectedProblem?.moduleId) return null;
    return roadmapModules.find((m) => m.id === selectedProblem.moduleId);
  }, [selectedProblem, roadmapModules]);

  // Reset states on problem/puzzle switch
  useEffect(() => {
    setSolutionRevealed(false);
    setVisibleHints(1);
    if (playgroundMode === "puzzle") {
      setActiveRightTab("hints");
    }
  }, [selectedProblem, activePuzzle, playgroundMode]);

  // Derived properties/helpers
  const defaultQuery = `-- Welcome! Edit this query and press Ctrl+Enter (or Run) to execute.
SELECT * FROM customers LIMIT 10;`;
  const RESULT_PAGE_SIZE = 15;
  const [resultPage, setResultPage] = useState(0);

  // Small helpers
  function fmtTime(iso: string) {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  }

  // Database helper implementations
  const copyTableSchemaMarkdown = (table: any) => {
    let md = `### Table: ${table.name} (${table.domain})\n\n`;
    md += `| Column | Type | Key |\n`;
    md += `| :--- | :--- | :--- |\n`;
    table.columns.forEach((c: any) => {
      const isPk = table.primaryKey === c.name ? "PK" : "";
      const rel = table.relationships?.find((r: string) => r.endsWith("." + c.name)) ? "FK" : "";
      const keyType = [isPk, rel].filter(Boolean).join(", ");
      md += `| ${c.name} | ${c.type} | ${keyType} |\n`;
    });
    navigator.clipboard.writeText(md);
    showToast(`Copied schema of "${table.name}" to clipboard!`, "success");
  };

  const profileColumn = (tableName: string, columnName: string) => {
    try {
      const escapedTable = `[${tableName}]`;
      const escapedColumn = `[${columnName}]`;
      const countRes = runQuery(
        `SELECT COUNT(*), COUNT(DISTINCT ${escapedColumn}), COUNT(*) - COUNT(${escapedColumn}) FROM ${escapedTable}`
      );
      if (countRes.error || countRes.rows.length === 0) {
        showToast("Failed to profile column: " + (countRes.error || "No data"), "error");
        return;
      }

      const total = Number(countRes.rows[0][countRes.columns[0]]);
      const distinct = Number(countRes.rows[0][countRes.columns[1]]);
      const nulls = Number(countRes.rows[0][countRes.columns[2]]);

      const tableSchema = (liveSchema.length > 0 ? liveSchema : tableSchemas).find(
        (t) => t.name.toLowerCase() === tableName.toLowerCase()
      );
      const colSchema = tableSchema?.columns.find((c: any) => c.name.toLowerCase() === columnName.toLowerCase());
      const isNumeric =
        colSchema?.type.toLowerCase().includes("int") ||
        colSchema?.type.toLowerCase().includes("real") ||
        colSchema?.type.toLowerCase().includes("double") ||
        colSchema?.type.toLowerCase().includes("float") ||
        colSchema?.type.toLowerCase().includes("numeric");

      let min = undefined;
      let max = undefined;
      let avg = undefined;

      if (isNumeric) {
        const statsRes = runQuery(
          `SELECT MIN(${escapedColumn}), MAX(${escapedColumn}), AVG(${escapedColumn}) FROM ${escapedTable}`
        );
        if (!statsRes.error && statsRes.rows.length > 0) {
          min = statsRes.rows[0][statsRes.columns[0]];
          max = statsRes.rows[0][statsRes.columns[1]];
          avg = statsRes.rows[0][statsRes.columns[2]];
        }
      }

      const freqRes = runQuery(
        `SELECT ${escapedColumn} AS val, COUNT(*) AS count FROM ${escapedTable} GROUP BY 1 ORDER BY 2 DESC LIMIT 5`
      );
      const topValues = freqRes.error ? [] : freqRes.rows.map((r: any) => ({ val: r.val, count: Number(r.count) }));

      setActiveColumnProfile({
        table: tableName,
        column: columnName,
        total,
        distinct,
        nulls,
        min,
        max,
        avg,
        topValues,
      });
    } catch (err: unknown) {
      showToast("Error profiling column: " + (err as Error).message, "error");
    }
  };

  const dropCustomTable = (tableName: string) => {
    showConfirm(`Are you sure you want to delete custom table "${tableName}"?`, () => {
      try {
        runQuery(`DROP TABLE IF EXISTS [${tableName}]`);
        setLiveSchema(getLiveSchema());
        showToast(`Dropped table "${tableName}".`, "success");
      } catch (err: unknown) {
        showToast("Error dropping table: " + (err as Error).message, "error");
      }
    });
  };

  const saveCurrentQuery = () => {
    showPrompt("Enter a name for this query:", "", (name) => {
      if (!name || !name.trim()) return;
      const newQuery = {
        id: "q_" + Date.now(),
        name: name.trim(),
        query: queryRef.current,
        createdAt: Date.now(),
      };
      setBookmarkedQueries((prev) => [newQuery, ...prev]);
      showToast(`Saved query as "${name.trim()}"!`, "success");
    });
  };

  const deleteSavedQuery = (id: string) => {
    showConfirm("Are you sure you want to delete this saved query?", () => {
      setBookmarkedQueries((prev) => prev.filter((q) => q.id !== id));
    });
  };

  // Settings & DB backup/restore helpers
  const exportProgress = () => {
    const backup = {
      progress: JSON.parse(localStorage.getItem("sql-aa-progress-v3") || "{}"),
      history: JSON.parse(localStorage.getItem("sql-aa-history") || "[]"),
      saved: JSON.parse(localStorage.getItem("sql-aa-saved") || "[]"),
      drafts: JSON.parse(localStorage.getItem("sql-aa-problem-drafts") || "{}"),
      puzzleDrafts: JSON.parse(localStorage.getItem("sql-aa-puzzle-drafts") || "{}"),
      freeform: JSON.parse(localStorage.getItem("sql-aa-freeform-query") || "null"),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sql-analyst-academy-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importProgress = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const backup = JSON.parse(event.target?.result as string);
        if (backup.progress) localStorage.setItem("sql-aa-progress-v3", JSON.stringify(backup.progress));
        if (backup.history) localStorage.setItem("sql-aa-history", JSON.stringify(backup.history));
        if (backup.saved) localStorage.setItem("sql-aa-saved", JSON.stringify(backup.saved));
        if (backup.drafts) localStorage.setItem("sql-aa-problem-drafts", JSON.stringify(backup.drafts));
        if (backup.puzzleDrafts) localStorage.setItem("sql-aa-puzzle-drafts", JSON.stringify(backup.puzzleDrafts));
        if (backup.freeform) localStorage.setItem("sql-aa-freeform-query", JSON.stringify(backup.freeform));

        showToast("Progress and query drafts imported successfully! Reloading...", "success");
        setTimeout(() => window.location.reload(), 1500);
      } catch (err: unknown) {
        showToast("Invalid backup file format: " + (err as Error).message, "error");
      }
    };
    reader.readAsText(file);
  };

  
  const exportResultAsCsv = (cols: string[], rows: any[], filename = "query-results.csv") => {
    if (!cols.length || !rows.length) return;
    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };
    const headerLine = cols.map(escapeCsv).join(",");
    const rowLines = rows.map((row) => {
      if (Array.isArray(row)) {
        return row.map(escapeCsv).join(",");
      }
      return cols.map((col) => escapeCsv(row[col])).join(",");
    });
    const csvContent = [headerLine, ...rowLines].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Exported query results as CSV!", "success");
  };

  const exportResultAsJson = (cols: string[], rows: any[], filename = "query-results.json") => {
    if (!cols.length || !rows.length) return;
    const jsonObjects = rows.map((row) => {
      if (Array.isArray(row)) {
        const obj: Record<string, any> = {};
        cols.forEach((col, idx) => {
          obj[col] = row[idx];
        });
        return obj;
      }
      return row;
    });
    const jsonContent = JSON.stringify(jsonObjects, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Exported query results as JSON!", "success");
  };

const exportDatabaseSql = () => {
    try {
      let sqlDump = `-- SQL Analyst Academy Database Schema & Data Export\n`;
      sqlDump += `-- Exported on ${new Date().toISOString()}\n\n`;

      const tablesRes = runQuery("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
      const tables = tablesRes.rows.map((r) => r.name as string);

      for (const t of tables) {
        const escapedTableName = t.replace(/'/g, "''");
        const ddlRes = runQuery(`SELECT sql FROM sqlite_master WHERE type='table' AND name='${escapedTableName}'`);
        const ddl = ddlRes.rows[0]?.sql;
        const bracketedTable = `[${t.replace(/\]/g, "]]")}]`;
        if (ddl) {
          sqlDump += `DROP TABLE IF EXISTS ${bracketedTable};\n`;
          sqlDump += `${ddl};\n\n`;
        }

        const rowsRes = runQuery(`SELECT * FROM ${bracketedTable}`);
        for (const row of rowsRes.rows) {
          const cols = Object.keys(row);
          const vals = cols.map((c) => {
            const val = row[c];
            if (val === null) return "NULL";
            if (typeof val === "number") return val;
            return `'${String(val).replace(/'/g, "''")}'`;
          });
          sqlDump += `INSERT INTO ${bracketedTable} ` +
            `(${cols.map((c) => `[${c}]`).join(", ")}) ` +
            `VALUES (${vals.join(", ")});\n`;
        }
        sqlDump += `\n`;
      }

      const blob = new Blob([sqlDump], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sql-academy-db-dump.sql`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Database exported successfully!", "success");
    } catch (err: unknown) {
      showToast("Error exporting database: " + (err as Error).message, "error");
    }
  };

  const importSqlScript = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        updateEditorQuery(text);
        showToast("SQL script loaded into editor!", "success");
      }
    };
    reader.readAsText(file);
  };

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;
      const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length === 0) return;
      const headers = lines[0].split(",").map((h) => h.trim().replace(/[^a-zA-Z0-9_]/g, ""));
      const tableName =
        "temp_" +
        file.name
          .toLowerCase()
          .replace(/\.csv$/, "")
          .replace(/[^a-z0-9_]/g, "");

      try {
        const columnTypes = headers.map(() => "INTEGER");
        for (let i = 1; i < Math.min(lines.length, 10); i++) {
          if (!lines[i]) continue;
          const vals = lines[i].split(",").map((v) => v.trim());
          for (let j = 0; j < headers.length; j++) {
            const val = vals[j];
            if (val === undefined || val === "") continue;
            if (columnTypes[j] === "TEXT") continue;

            if (/^-?\d+$/.test(val)) {
              // integer
            } else if (/^-?\d*\.\d+$/.test(val)) {
              columnTypes[j] = "REAL";
            } else {
              columnTypes[j] = "TEXT";
            }
          }
        }

        const colsDdl = headers.map((h, idx) => `[${h}] ${columnTypes[idx]}`).join(", ");

        let importSql = `DROP TABLE IF EXISTS [${tableName}];\n`;
        importSql += `CREATE TABLE [${tableName}] (${colsDdl});\n`;
        importSql += `BEGIN TRANSACTION;\n`;

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i]) continue;
          const rowVals = lines[i].split(",").map((v, colIdx) => {
            const val = v.trim();
            if (columnTypes[colIdx] === "TEXT") {
              return `'${val.replace(/'/g, "''")}'`;
            }
            if (val === "") return "NULL";
            return val;
          });
          if (rowVals.length === headers.length) {
            importSql += `INSERT INTO [${tableName}] ` +
              `(${headers.map((h) => `[${h}]`).join(", ")}) ` +
              `VALUES (${rowVals.join(", ")});\n`;
          }
        }
        importSql += `COMMIT;`;

        const importRes = runQuery(importSql);
        if (importRes.error) {
          throw new Error(importRes.error);
        }

        setLiveSchema(getLiveSchema());
        showToast(`Imported temporary table "${tableName}" (${lines.length - 1} rows)!`, "success");
      } catch (err: unknown) {
        showToast("Error parsing/loading CSV: " + (err as Error).message, "error");
      }
    };
    reader.readAsText(file);
  };

  const downloadStatsSummary = () => {
    downloadStatsReport({
      readiness,
      progress,
      totalModules,
      totalProblems,
      debugPuzzles,
      roadmapModules,
    });
  };

  const toggleSqlKeywordCase = () => {
    let current = queryRef.current;
    const keywords = [
      "select", "from", "where", "group by", "order by", "having", "join", "left join",
      "right join", "inner join", "full join", "on", "limit", "and", "or", "not",
      "insert", "update", "delete", "create", "alter", "drop", "table", "into", "values", "set"
    ];

    keywords.forEach((kw) => {
      const regex = new RegExp(`\\b${kw}\\b`, "gi");
      current = current.replace(regex, (match) => {
        return sqlUpperKeywords ? match.toLowerCase() : match.toUpperCase();
      });
    });

    setSqlUpperKeywords(!sqlUpperKeywords);
    updateEditorQuery(current);
  };

  // Detailed SQL engine query error helper
  const renderDetailedError = (errorStr: string, activeQuery: string) => {
    const match = errorStr.match(/Msg (\d+), Level (\d+), State (\d+), Line (\d+)/);
    if (!match) {
      return (
        <pre
          className="error-output"
          style={{
            margin: 0,
            whiteSpace: "pre-wrap",
            color: "var(--rose)",
            fontSize: "12px",
            fontFamily: "monospace",
            overflow: "auto",
            flex: 1,
          }}
        >
          {errorStr}
        </pre>
      );
    }

    const msgCode = match[1];
    const level = match[2];
    const state = match[3];
    const lineNum = parseInt(match[4], 10);

    const lines = errorStr.split("\n");
    const detailLine = lines[1] || "";

    let suggestion: string | null = null;
    let suggestionWord: string | null = null;
    let typoWord: string | null = null;

    const suggLine = lines.find((l) => l.trim().startsWith("Suggestion:"));
    if (suggLine) {
      suggestion = suggLine.replace("Suggestion:", "").trim();
      const wordMatch = suggestion.match(/`([^`]+)`/);
      if (wordMatch) {
        suggestionWord = wordMatch[1];
      }
    }

    const typoMatch = detailLine.match(/['"]([^'"]+)['"]/);
    if (typoMatch) {
      typoWord = typoMatch[1];
    }

    const queryLines = activeQuery.split("\n");
    const startLine = Math.max(0, lineNum - 2);
    const endLine = Math.min(queryLines.length - 1, lineNum + 1);

    const applyFix = () => {
      if (typoWord && suggestionWord) {
        const corrected = activeQuery.replace(new RegExp(`\\b${typoWord}\\b`, "gi"), suggestionWord);
        setQuery(corrected);
      }
    };

    return (
      <div
        className="advanced-error-card"
        style={{
          background: "rgba(239, 68, 68, 0.04)",
          border: "1px solid rgba(239, 68, 68, 0.2)",
          borderRadius: "8px",
          padding: "16px",
          margin: "12px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          flex: 1,
          overflow: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "12px",
            borderBottom: "1px solid rgba(239, 68, 68, 0.1)",
            paddingBottom: "8px",
          }}
        >
          <AlertTriangle size={18} style={{ color: "var(--rose)" }} />
          <span
            style={{
              fontSize: "11px",
              fontWeight: "bold",
              letterSpacing: "0.05em",
              color: "var(--rose)",
              textTransform: "uppercase",
            }}
          >
            SQL Server Error — Msg {msgCode}, Level {level}, State {state}
          </span>
        </div>

        <div
          style={{ fontSize: "13px", color: "var(--text)", fontWeight: 500, marginBottom: "12px", lineHeight: "1.5" }}
        >
          {detailLine}
        </div>

        {suggestion && (
          <div
            style={{
              background: "rgba(6, 182, 212, 0.06)",
              border: "1px solid rgba(6, 182, 212, 0.2)",
              borderRadius: "6px",
              padding: "10px 12px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={14} style={{ color: "var(--cyan)" }} />
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{suggestion}</span>
            </div>
            {typoWord && suggestionWord && (
              <button
                onClick={applyFix}
                className="primary-button compact"
                style={{
                  fontSize: "11px",
                  fontWeight: "bold",
                  padding: "4px 10px",
                }}
              >
                Auto-Fix
              </button>
            )}
          </div>
        )}

        <div
          style={{
            background: "var(--bg2)",
            borderRadius: "6px",
            overflow: "hidden",
            border: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              background: "var(--bg)",
              padding: "4px 10px",
              borderBottom: "1px solid var(--border)",
              fontSize: "10px",
              color: "var(--muted)",
              fontWeight: 600,
            }}
          >
            QUERY TRACE (LINE {lineNum})
          </div>
          <pre
            style={{
              margin: 0,
              padding: "12px",
              fontSize: "12px",
              fontFamily: "var(--font-mono)",
              overflowX: "auto",
              lineHeight: "1.6",
            }}
          >
            {queryLines.map((lineText, idx) => {
              const currentLineNum = idx + 1;
              const isErrorLine = currentLineNum === lineNum;
              if (currentLineNum < startLine + 1 || currentLineNum > endLine + 1) return null;
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    background: isErrorLine ? "rgba(239, 68, 68, 0.08)" : "transparent",
                    margin: "0 -12px",
                    padding: "0 12px",
                    borderLeft: isErrorLine ? "3px solid var(--rose)" : "3px solid transparent",
                  }}
                >
                  <span style={{ width: "24px", color: "var(--muted)", userSelect: "none", display: "inline-block" }}>
                    {currentLineNum}
                  </span>
                  <span
                    style={{ color: isErrorLine ? "var(--text)" : "var(--text-secondary)", flex: 1, whiteSpace: "pre" }}
                  >
                    {lineText}
                    {isErrorLine && (
                      <span
                        style={{
                          color: "var(--rose)",
                          fontSize: "10px",
                          fontWeight: "bold",
                          marginLeft: "12px",
                          opacity: 0.8,
                        }}
                      >
                        ← error location
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </pre>
        </div>
      </div>
    );
  };

  // Database and utility helpers moved down from App
  const copyTableSchemaMarkdownLocally = (table: any) => copyTableSchemaMarkdown(table);
  const profileColumnLocally = (tableName: string, columnName: string) => profileColumn(tableName, columnName);
  const dropCustomTableLocally = (tableName: string) => dropCustomTable(tableName);

  // Auto-typing control helpers
  const startStopAutoTyping = () => {
    if (isAutoTyping) {
      stopAutoTyping();
    } else {
      if (playgroundMode === "puzzle") {
        autoTypeQuery(activePuzzle.solutionQuery);
      } else if (playgroundMode === "practice") {
        autoTypeQuery(selectedProblem.solution);
      }
    }
  };

  const copyTableSchemaMarkdownOriginal = copyTableSchemaMarkdown;
  const profileColumnOriginal = profileColumn;
  const dropCustomTableOriginal = dropCustomTable;

  // React hook dependency properties
  const currentSchema = liveSchema.length > 0 ? liveSchema : tableSchemas;
  const relevantTables = (() => {
    if (!selectedProblem.id) return currentSchema;
    const text =
      `${selectedProblem.prompt} ${selectedProblem.starterQuery} ${selectedProblem.solution || ""}`.toLowerCase();
    const filtered = currentSchema.filter((t) => new RegExp(`\\b${t.name}\\b`, "i").test(text));
    return filtered.length > 0 ? filtered : currentSchema;
  })();
  const isRelevant = (name: string) => {
    if (!selectedProblem.id) return true;
    return relevantTables.some((rt) => rt.name === name);
  };
  const activeTables = currentSchema.filter((t) => isRelevant(t.name));
  const otherTables = currentSchema.filter((t) => !isRelevant(t.name));
  const relevantDomains = Array.from(new Set(relevantTables.map((t) => t.domain)));

  // View state helpers
  const openPuzzleInPlayground = (puzzleId: string) => {
    stopAutoTyping();
    setActivePuzzleId(puzzleId);
    setPlaygroundMode("puzzle");
    const puzzle = debugPuzzles.find((x) => x.id === puzzleId);
    if (puzzle) {
      const saved = getSavedPuzzleQuery(puzzle);
      updateEditorQuery(saved, "puzzle", puzzleId);
      setActiveRightTab("hints");
      setQueryResult({ columns: [], rows: [], message: "" });
      setExpectedResult(null);
    }
  };

  // Helper check for table connections
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [hoveredTable, setHoveredTable] = useState<string | null>(null);

  const activeTable = selectedTable || hoveredTable;
  const liveTablesWithDefaults = currentSchema.map((t) => ({
    ...t,
    domain: (t as any).domain || (t.name.toLowerCase().startsWith("temp") ? "Temporary Data" : "Custom Data"),
    description:
      (t as any).description ||
      (t.name.toLowerCase().startsWith("temp")
        ? "Temporary table generated during session execution."
        : "Permanent database table created by user query."),
    primaryKey: (t as any).primaryKey || (t.columns[0] ? t.columns[0].name : ""),
    relationships: (t as any).relationships || [],
  }));

  const isConnected = (tableName: string) => {
    if (!activeTable) return false;
    if (tableName === activeTable) return true;
    const tableObj = liveTablesWithDefaults.find((t) => t.name === activeTable);
    if (tableObj) {
      const forward = tableObj.relationships.some((rel: string) => {
        const parts = rel.split(".");
        return parts[0] === tableName;
      });
      if (forward) return true;
    }

    const targetTableObj = liveTablesWithDefaults.find((t) => t.name === tableName);
    if (targetTableObj) {
      const reverse = targetTableObj.relationships.some((rel: string) => {
        const parts = rel.split(".");
        return parts[0] === activeTable;
      });
      if (reverse) return true;
    }

    return false;
  };

  // Dialect specific database notes helper
  function getDialectNotes(moduleId: number): { title: string; notes: string } | null {
    switch (moduleId) {
      case 4:
        return {
          title: "LIMIT vs TOP / FETCH FIRST",
          notes:
            "• SQLite / PostgreSQL / MySQL: SELECT col FROM tbl LIMIT 5;\n" +
            "• SQL Server (T-SQL): SELECT TOP 5 col FROM tbl;\n" +
            "• Oracle / ANSI SQL: SELECT col FROM tbl FETCH FIRST 5 ROWS ONLY;",
        };
      case 19:
        return {
          title: "FULL OUTER JOIN Support",
          notes:
            "• PostgreSQL / SQL Server: Supports FULL OUTER JOIN natively.\n" +
            "• SQLite / MySQL: Do not support FULL OUTER JOIN. You must simulate it using " +
            "LEFT JOIN + UNION + reverse LEFT JOIN (with IS NULL filter to exclude duplicates).",
        };
      case 25:
      case 26:
      case 27:
      case 28:
        return {
          title: "Window Functions Dialect Support",
          notes:
            "• PostgreSQL / SQL Server (2012+): Native support for OVER (PARTITION BY ... ORDER BY ...).\n" +
            "• MySQL: Supported only in version 8.0+. Older versions require session variables " +
            "or correlated subqueries.\n" +
            "• SQLite: Supported in version 3.25.0+ (2018). In older environments, use self-joins " +
            "or correlated subqueries as workarounds.",
        };
      case 30:
        return {
          title: "Set Ops (INTERSECT & EXCEPT) Dialect Support",
          notes:
            "• SQLite (3.39+): Supports INTERSECT and EXCEPT natively.\n" +
            "• MySQL: Supported only in version 8.0.31+. Workaround for older versions:\n" +
            "  EXCEPT → LEFT JOIN with IS NULL: SELECT a.id FROM tblA a " +
            "LEFT JOIN tblB b ON a.id = b.id WHERE b.id IS NULL\n" +
            "  INTERSECT → INNER JOIN on the key column.",
        };
      case 8:
        return {
          title: "Date Formatting & Range Filtering",
          notes:
            "• SQLite: Use strftime('%Y-%m-%d', order_date) or date(order_date) for date formatting.\n" +
            " Date comparison: order_date BETWEEN '2024-01-01' AND '2024-12-31'\n" +
            "• MySQL: DATE_FORMAT(order_date, '%Y-%m-%d') or DATE() function.\n" +
            "• PostgreSQL: TO_CHAR(order_date, 'YYYY-MM-DD') or CAST(order_date AS DATE).",
        };
      case 6:
        return {
          title: "String Functions & Concatenation",
          notes:
            "• LIKE wildcards: % (any chars) and _ (single char) are standard across all dialects.\n" +
            "• Concatenation — SQLite / PostgreSQL: first_name || ' ' || last_name\n" +
            "• MySQL: CONCAT(first_name, ' ', last_name)\n" +
            "• SQL Server: first_name + ' ' + last_name\n" +
            "• Case sensitivity: LIKE is case-insensitive in MySQL by default, " +
            "case-sensitive in PostgreSQL unless using ILIKE.",
        };
      case 31:
        return {
          title: "CASE WHEN Compatibility",
          notes:
            "• All Dialects: CASE WHEN syntax is fully standardized and portable across MySQL, " +
            "PostgreSQL, SQL Server, SQLite, and Oracle.\n" +
            "• PostgreSQL bonus: SUM(amount) FILTER (WHERE region = 'South') is a cleaner " +
            "alternative to SUM(CASE WHEN ...).\n" +
            "• Case sensitivity: String comparisons inside CASE WHEN are case-sensitive in most default collations.",
        };
      case 32:
        return {
          title: "Pivoting Syntax — Manual vs Native",
          notes:
            "• SQLite / MySQL / PostgreSQL: Use conditional aggregation: " +
            "SUM(CASE WHEN channel='App' THEN amount ELSE 0 END).\n" +
            "• PostgreSQL alternative: SUM(amount) FILTER (WHERE channel='App') — more readable.\n" +
            "• SQL Server / Oracle: Support native PIVOT syntax (less portable, avoid for cross-dialect SQL).",
        };
      default:
        return null;
    }
  }

  // Reset database state and clear local drafts
  const resetPlayground = () => {
    resetDatabase();
    if (selectedProblem?.id && playgroundMode === "practice") {
      const p = allProblems.find((x) => x.id === selectedProblem.id);
      if (p) {
        const drafts = JSON.parse(localStorage.getItem("sql-aa-problem-drafts") || "{}");
        delete drafts[selectedProblem.id];
        localStorage.setItem("sql-aa-problem-drafts", JSON.stringify(drafts));
        const saved = getSavedDraftQuery(p);
        updateEditorQuery(saved);
        setQueryResult(runQuery(saved, true));
        setLiveSchema(getLiveSchema());
        triggerResetStatus();
        return;
      }
    } else if (activePuzzle?.id && playgroundMode === "puzzle") {
      const p = debugPuzzles.find((x) => x.id === activePuzzle.id);
      if (p) {
        const drafts = JSON.parse(localStorage.getItem("sql-aa-puzzle-drafts") || "{}");
        delete drafts[activePuzzle.id];
        localStorage.setItem("sql-aa-puzzle-drafts", JSON.stringify(drafts));
        const saved = getSavedPuzzleQuery(p);
        updateEditorQuery(saved);
        setQueryResult(runQuery(saved, true));
        setLiveSchema(getLiveSchema());
        triggerResetStatus();
        return;
      }
    }
    updateEditorQuery(defaultQuery);
    setQueryResult(runQuery(defaultQuery));
    setLiveSchema(getLiveSchema());
    setPreviewData({});
    triggerResetStatus();
  };

  // Schema Table preview toggler
  const togglePreviewData = (table: string) => {
    setPreviewData((prev) => {
      if (prev[table]) {
        const next = { ...prev };
        delete next[table];
        return next;
      } else {
        return { ...prev, [table]: runQuery(`SELECT * FROM ${table} LIMIT 5`) };
      }
    });
  };

  // A/B Benchmark executor
  const runABBenchmark = () => {
    let sqlA = queryRef.current;
    let sqlB = queryB;

    if (rowLimit !== "Unlimited" && /^\s*SELECT\b/i.test(sqlA) && !/\bLIMIT\b/i.test(sqlA)) {
      sqlA = `${sqlA.trim().replace(/;+$/, "")} LIMIT ${rowLimit};`;
    }
    if (rowLimit !== "Unlimited" && /^\s*SELECT\b/i.test(sqlB) && !/\bLIMIT\b/i.test(sqlB)) {
      sqlB = `${sqlB.trim().replace(/;+$/, "")} LIMIT ${rowLimit};`;
    }

    const planStepsA = getQueryPlan(sqlA);
    const planStepsB = getQueryPlan(sqlB);
    setQueryPlanSteps(planStepsA);
    setPlanB(planStepsB);

    resetDatabase();
    const resultA = runQuery(sqlA, true, false);
    if (!resultA.error) {
      const runsA: number[] = [resultA.durationMs || 0];
      for (let i = 0; i < 4; i++) {
        resetDatabase();
        const r = runQuery(sqlA, true, false);
        runsA.push(r.durationMs || 0);
      }
      runsA.sort((a, b) => a - b);
      resultA.durationMs = (runsA[1] + runsA[2] + runsA[3]) / 3;
    }
    setQueryResult(resultA);

    resetDatabase();
    const resultB = runQuery(sqlB, true, false);
    if (!resultB.error) {
      const runsB: number[] = [resultB.durationMs || 0];
      for (let i = 0; i < 4; i++) {
        resetDatabase();
        const r = runQuery(sqlB, true, false);
        runsB.push(r.durationMs || 0);
      }
      runsB.sort((a, b) => a - b);
      resultB.durationMs = (runsB[1] + runsB[2] + runsB[3]) / 3;
    }
    setResB(resultB);

    setBenchmarkRunCount((c) => c + 1);
    setActiveConsoleTab("benchmark");
  };
const tabs: { id: RightTab; icon: LucideIcon; label: string }[] = [
  { id: "schema", icon: Database, label: "Schema" },
  { id: "hints", icon: Lightbulb, label: "Hints" },
  { id: "erd", icon: Brain, label: "ERD" },
  { id: "linter", icon: AlertTriangle, label: "Linter Advice" },
];

// currentSchema referenced locally
// relevantTables referenced locally
// isRelevant referenced locally
// activeTables referenced locally
// otherTables referenced locally
// relevantDomains referenced locally

const showSplit = rightOpen && !editorMaximized;

const editorContent = (
  <div
    className="pg-editor-col"
    style={{ width: "100%", height: "100%", minWidth: 0, borderRight: showSplit ? "none" : undefined }}
  >
    <div className="pg-toolbar">
      <div className="pg-toolbar-left">
        <Code2 size={16} />
        <strong>SQL Playground</strong>
        <span className="pg-tag">Browser SQLite</span>
        {selectedProblem.id && <span className="pg-problem-label">{selectedProblem.title}</span>}
        {selectedProblem.id &&
          (() => {
            const parentDay = learningRoadmap.find((d) => d.modules.includes(selectedProblem.moduleId));
            return parentDay ? (
              <button
                className="secondary-button compact"
                style={{
                  marginLeft: "12px",
                  fontSize: "11px",
                  padding: "2px 8px",
                  background: "rgba(56,217,255,0.1)",
                  border: "1px solid rgba(56,217,255,0.2)",
                  color: "var(--cyan)",
                }}
                onClick={() => {
                  setSelectedDayId(parentDay.day);
                  setActiveView("day-details");
                }}
              >
                &larr; Back to Day {parentDay.day} Details
              </button>
            ) : null;
          })()}

        {resetStatus && (
          <span className="reset-toast">
            <CheckCircle2 size={10} /> Reset!
          </span>
        )}
      </div>
      <div className="pg-toolbar-right" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <button
          className={`icon-button ${editorMaximized ? "active" : ""}`}
          title={editorMaximized ? "Exit Fullscreen" : "Fullscreen Editor"}
          onClick={() => setEditorMaximized(!editorMaximized)}
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
          aria-label={editorMaximized ? "Exit Fullscreen Editor" : "Fullscreen Editor"}
        >
          {editorMaximized ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </button>
        <button
          className="icon-button"
          title="Reset Playground"
          onClick={resetPlayground}
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
          aria-label="Reset Playground"
        >
          <RefreshCcw size={15} />
        </button>
        <button
          className="icon-button"
          title="Format SQL"
          onClick={() => {
            const f = formatSql(queryRef.current);
            updateEditorQuery(f);
          }}
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
          aria-label="Format SQL Query"
        >
          <Sparkles size={15} />
        </button>
        <button
          className={`icon-button ${compareModeOpen ? "active" : ""}`}
          title="A/B Performance Benchmarker"
          onClick={() => {
            setCompareModeOpen(!compareModeOpen);
            if (!compareModeOpen) {
              setActiveConsoleTab("benchmark");
            } else {
              setActiveConsoleTab("results");
            }
          }}
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
          aria-label="Toggle A/B Benchmarker"
        >
          <BarChart3 size={15} />
        </button>
        <div style={{ position: "relative", display: "inline-flex" }}>
          <button
            className={`icon-button ${settingsOpen ? "active" : ""}`}
            title="Editor & System Settings"
            onClick={() => setSettingsOpen(!settingsOpen)}
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
            aria-label="Editor and System Settings"
          >
            <Settings size={15} />
          </button>
          {settingsOpen && (
            <div
              className="pg-settings-popup"
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: "8px",
                width: "280px",
                background: "var(--bg-panel, #15171e)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)",
                zIndex: 9999,
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                color: "var(--text)",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  borderBottom: "1px solid var(--border)",
                  paddingBottom: "6px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>Settings & Utilities</span>
                <button
                  onClick={() => setSettingsOpen(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}
                >
                  <X size={12} />
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "11.5px",
                }}
              >
                <span style={{ color: "var(--muted)" }}>Editor Theme:</span>
                <select
                  value={editorTheme}
                  onChange={(e) => setEditorTheme(e.target.value)}
                  style={{
                    background: "var(--bg2)",
                    border: "1px solid var(--border)",
                    borderRadius: "4px",
                    padding: "4px 8px",
                    fontSize: "11px",
                    color: "var(--text)",
                  }}
                >
                  <option value="vs-dark">VS Dark</option>
                  <option value="light">VS Light</option>
                </select>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "11.5px",
                }}
              >
                <span style={{ color: "var(--muted)" }}>Font Family:</span>
                <select
                  value={editorFontFamily}
                  onChange={(e) => setEditorFontFamily(e.target.value)}
                  style={{
                    background: "var(--bg2)",
                    border: "1px solid var(--border)",
                    borderRadius: "4px",
                    padding: "4px 8px",
                    fontSize: "11px",
                    color: "var(--text)",
                    maxWidth: "140px",
                  }}
                >
                  <option value="'JetBrains Mono', Consolas, monospace">JetBrains Mono</option>
                  <option value="'Fira Code', Monaco, monospace">Fira Code</option>
                  <option value="'Source Code Pro', Courier, monospace">Source Code Pro</option>
                  <option value="'Courier New', monospace">Courier New</option>
                </select>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "11.5px",
                }}
              >
                <span style={{ color: "var(--muted)" }}>Tab Indentation:</span>
                <select
                  value={editorTabSize}
                  onChange={(e) => setEditorTabSize(Number(e.target.value))}
                  style={{
                    background: "var(--bg2)",
                    border: "1px solid var(--border)",
                    borderRadius: "4px",
                    padding: "4px 8px",
                    fontSize: "11px",
                    color: "var(--text)",
                  }}
                >
                  <option value="2">2 spaces</option>
                  <option value="4">4 spaces</option>
                </select>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "11.5px",
                }}
              >
                <span style={{ color: "var(--muted)" }}>Font Size:</span>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <button
                    onClick={() => setEditorFontSize((s) => Math.max(10, s - 1))}
                    style={{
                      padding: "2px 6px",
                      background: "var(--bg2)",
                      border: "1px solid var(--border)",
                      borderRadius: "3px",
                      cursor: "pointer",
                      color: "var(--text)",
                    }}
                  >
                    <Minus size={10} />
                  </button>
                  <span style={{ fontSize: "11px", fontWeight: "bold", width: "32px", textAlign: "center" }}>
                    {editorFontSize}px
                  </span>
                  <button
                    onClick={() => setEditorFontSize((s) => Math.min(24, s + 1))}
                    style={{
                      padding: "2px 6px",
                      background: "var(--bg2)",
                      border: "1px solid var(--border)",
                      borderRadius: "3px",
                      cursor: "pointer",
                      color: "var(--text)",
                    }}
                  >
                    <Plus size={10} />
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "11.5px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={editorWordWrap}
                    onChange={(e) => setEditorWordWrap(e.target.checked)}
                  />
                  <span>Word Wrap code lines</span>
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "11.5px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={editorMinimap}
                    onChange={(e) => setEditorMinimap(e.target.checked)}
                  />
                  <span>Show Editor Minimap</span>
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "11.5px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={graderStrict}
                    onChange={(e) => setGraderStrict(e.target.checked)}
                  />
                  <span title="Forces strict order matching of columns in query grader">Strict Grader mode</span>
                </label>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "11.5px",
                }}
              >
                <span style={{ color: "var(--muted)" }}>Max Row Limit:</span>
                <select
                  value={rowLimit}
                  onChange={(e) => setRowLimit(e.target.value)}
                  style={{
                    background: "var(--bg2)",
                    border: "1px solid var(--border)",
                    borderRadius: "4px",
                    padding: "4px 8px",
                    fontSize: "11px",
                    color: "var(--text)",
                  }}
                >
                  <option value="10">10 rows</option>
                  <option value="50">50 rows</option>
                  <option value="100">100 rows</option>
                  <option value="500">500 rows</option>
                  <option value="Unlimited">Unlimited</option>
                </select>
              </div>

              <button
                onClick={toggleSqlKeywordCase}
                style={{
                  padding: "6px",
                  width: "100%",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--border)",
                  borderRadius: "4px",
                  fontSize: "11px",
                  cursor: "pointer",
                  color: "var(--text)",
                  textAlign: "center",
                }}
              >
                Format Keywords: {sqlUpperKeywords ? "UPPERCASE" : "lowercase"}
              </button>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  borderTop: "1px solid var(--border)",
                  paddingTop: "10px",
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: "bold",
                    color: "var(--muted)",
                    textTransform: "uppercase",
                  }}
                >
                  Local DB & Progress File Admin
                </span>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                  <button
                    onClick={exportDatabaseSql}
                    style={{
                      padding: "5px",
                      background: "var(--bg2)",
                      border: "1px solid var(--border)",
                      borderRadius: "4px",
                      fontSize: "10px",
                      cursor: "pointer",
                      color: "var(--text)",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      justifyContent: "center",
                    }}
                  >
                    <Download size={11} /> Export SQL
                  </button>

                  <label
                    style={{
                      padding: "5px",
                      background: "var(--bg2)",
                      border: "1px solid var(--border)",
                      borderRadius: "4px",
                      fontSize: "10px",
                      cursor: "pointer",
                      color: "var(--text)",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      justifyContent: "center",
                    }}
                  >
                    <Upload size={11} /> Import SQL
                    <input type="file" accept=".sql" onChange={importSqlScript} style={{ display: "none" }} />
                  </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                  <button
                    onClick={exportProgress}
                    style={{
                      padding: "5px",
                      background: "var(--bg2)",
                      border: "1px solid var(--border)",
                      borderRadius: "4px",
                      fontSize: "10px",
                      cursor: "pointer",
                      color: "var(--text)",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      justifyContent: "center",
                    }}
                  >
                    <Download size={11} /> Backup JSON
                  </button>

                  <label
                    style={{
                      padding: "5px",
                      background: "var(--bg2)",
                      border: "1px solid var(--border)",
                      borderRadius: "4px",
                      fontSize: "10px",
                      cursor: "pointer",
                      color: "var(--text)",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      justifyContent: "center",
                    }}
                  >
                    <Upload size={11} /> Restore JSON
                    <input type="file" accept=".json" onChange={importProgress} style={{ display: "none" }} />
                  </label>
                </div>

                <label
                  style={{
                    padding: "5px",
                    background: "rgba(56, 217, 255, 0.05)",
                    border: "1px solid rgba(56, 217, 255, 0.15)",
                    borderRadius: "4px",
                    fontSize: "10.5px",
                    cursor: "pointer",
                    color: "var(--cyan)",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    justifyContent: "center",
                    fontWeight: "bold",
                  }}
                >
                  <Upload size={11} /> Load CSV Table
                  <input type="file" accept=".csv" onChange={handleCsvImport} style={{ display: "none" }} />
                </label>

                <button
                  onClick={downloadStatsSummary}
                  style={{
                    padding: "5px",
                    background: "var(--bg2)",
                    border: "1px solid var(--border)",
                    borderRadius: "4px",
                    fontSize: "10px",
                    cursor: "pointer",
                    color: "var(--text)",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    justifyContent: "center",
                  }}
                >
                  <Download size={11} /> Study Report
                </button>
              </div>
            </div>
          )}
        </div>
        <button className="primary-button run-btn" onClick={runCurrentQuery}>
          <Play size={15} /> Run <kbd>&#8629;</kbd>
        </button>
      </div>
    </div>

    <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <VSplitPane
        maximized={editorMaximized}
        topHeight={editorHeight}
        onResize={handleEditorHeightResize}
        minTop={100}
        maxTop={1000}
        top={
          <div
            className="pg-editor-wrap"
            style={{
              flex: 1,
              height: "100%",
              minHeight: 0,
              position: "relative",
              display: "flex",
              flexDirection: "row",
            }}
          >
            {/* Query A Column */}
            <div
              style={{
                flex: 1,
                height: "100%",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
              }}
            >
              {compareModeOpen && (
                <div
                  style={{
                    padding: "6px 12px",
                    background: "rgba(56, 217, 255, 0.05)",
                    borderBottom: "1px solid var(--border)",
                    fontSize: "11px",
                    fontWeight: "bold",
                    color: "var(--cyan)",
                    display: "flex",
                    justifyContent: "space-between",
                    flexShrink: 0,
                  }}
                >
                  <span>QUERY A (Main Editor)</span>
                  <span style={{ fontSize: "9.5px", color: "var(--muted)", fontWeight: "normal" }}>
                    Runs standard query validations
                  </span>
                </div>
              )}
              <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
                {isAutoTyping && (
                  <div
                    className="auto-typing-indicator"
                    onClick={() => {
                      stopAutoTyping();
                      let sol = "";
                      if (playgroundMode === "practice" && selectedProblem) {
                        sol = selectedProblem.solution;
                      } else if (playgroundMode === "puzzle" && activePuzzle) {
                        sol = activePuzzle.solutionQuery;
                      }
                      if (sol) {
                        updateEditorQuery(sol);
                      }
                    }}
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "18px",
                      background: "rgba(56, 217, 255, 0.12)",
                      border: "1px solid rgba(56, 217, 255, 0.25)",
                      color: "var(--cyan)",
                      fontSize: "11px",
                      fontWeight: 600,
                      padding: "4px 10px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      pointerEvents: "auto",
                      zIndex: 20,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      backdropFilter: "blur(4px)",
                      animation: "pulse 1.5s infinite alternate",
                    }}
                    title="Click to skip typing animation and show full solution"
                  >
                    <span
                      className="dot"
                      style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--cyan)" }}
                    ></span>
                    <span>Auto-typing... (Click to Skip)</span>
                  </div>
                )}
                <ErrorBoundary fallbackTitle="SQL Editor A Panel">
                  <Suspense
                    fallback={
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          height: "100%",
                          color: "var(--muted)",
                          fontSize: "14px",
                        }}
                      >
                        Loading Editor...
                      </div>
                    }
                  >
                    <Editor
                      height="100%"
                      defaultLanguage="sql"
                      theme={editorTheme === "vs-dark" && theme === "oled" ? "hc-oled" : editorTheme}
                      defaultValue={query}
                      beforeMount={handleBeforeMount}
                      onMount={handleMount}
                      onChange={handleEditorChange}
                      options={{
                        minimap: { enabled: editorMinimap },
                        fontSize: editorFontSize,
                        fontFamily: editorFontFamily,
                        tabSize: editorTabSize,
                        insertSpaces: true,
                        lineHeight: 24,
                        padding: { top: 16, bottom: 16 },
                        scrollBeyondLastLine: false,
                        wordWrap: editorWordWrap ? "on" : "off",
                        autoClosingBrackets: "always",
                        autoClosingQuotes: "always",
                        tabCompletion: "on",
                        quickSuggestions: true,
                        quickSuggestionsDelay: 250,
                        suggest: {
                          filterGraceful: true,
                          localityBonus: true,
                          shareSuggestSelections: true,
                        },
                        automaticLayout: true,
                        renderLineHighlight: "gutter",
                        smoothScrolling: true,
                        cursorSmoothCaretAnimation: "on",
                      }}
                    />
                  </Suspense>
                </ErrorBoundary>
              </div>
            </div>

            {/* Query B Column */}
            {compareModeOpen && (
              <div
                style={{
                  width: "35%",
                  height: "100%",
                  background: "var(--bg)",
                  borderLeft: "1px solid var(--border)",
                  display: "flex",
                  flexDirection: "column",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    padding: "6px 12px",
                    background: "rgba(155, 124, 255, 0.05)",
                    borderBottom: "1px solid var(--border)",
                    fontSize: "11px",
                    fontWeight: "bold",
                    color: "var(--violet)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <span>QUERY B (Benchmark)</span>
                  <button
                    onClick={() => setCompareModeOpen(false)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--muted)",
                      fontSize: "10px",
                    }}
                    aria-label="Close Benchmark Editor"
                  >
                    Close
                  </button>
                </div>
                <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
                  <ErrorBoundary fallbackTitle="SQL Editor B Panel">
                    <Suspense
                      fallback={
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "100%",
                            color: "var(--muted)",
                            fontSize: "12px",
                          }}
                        >
                          Loading Editor...
                        </div>
                      }
                    >
                      <Editor
                        height="100%"
                        defaultLanguage="sql"
                        theme={editorTheme === "vs-dark" && theme === "oled" ? "hc-oled" : editorTheme}
                        value={queryB}
                        onChange={(val) => handleSetQueryB(val || "")}
                        options={{
                          minimap: { enabled: false },
                          fontSize: editorFontSize - 1,
                          fontFamily: editorFontFamily,
                          tabSize: editorTabSize,
                          insertSpaces: true,
                          lineHeight: 20,
                          padding: { top: 8, bottom: 8 },
                          scrollBeyondLastLine: false,
                          wordWrap: "on",
                          autoClosingBrackets: "always",
                          autoClosingQuotes: "always",
                          automaticLayout: true,
                          renderLineHighlight: "gutter",
                        }}
                      />
                    </Suspense>
                  </ErrorBoundary>
                </div>
                <div
                  style={{
                    padding: "10px",
                    borderTop: "1px solid var(--border)",
                    display: "flex",
                    background: "var(--bg2)",
                    flexShrink: 0,
                  }}
                >
                  <button
                    onClick={runABBenchmark}
                    className="primary-button compact"
                    style={{ flex: 1, background: "var(--violet)", borderColor: "var(--violet)", fontSize: "11px" }}
                  >
                    <Zap size={11} style={{ marginRight: "4px" }} /> Run A/B Benchmark
                  </button>
                </div>
              </div>
            )}
          </div>
        }
        bottom={
          <div
            className="pg-result"
            style={{ flex: 1, height: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}
          >
            <div
              className="result-toolbar"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 16px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  className={`result-tab ${activeConsoleTab === "results" ? "active" : ""}`}
                  onClick={() => setActiveConsoleTab("results")}
                >
                  <Database size={12} style={{ marginRight: "6px" }} /> Results Comparison
                </button>
                <button
                  className={`result-tab ${activeConsoleTab === "plan" ? "active" : ""}`}
                  onClick={() => setActiveConsoleTab("plan")}
                >
                  <Zap size={12} style={{ marginRight: "6px" }} /> Plan & Profiler
                </button>
                <button
                  className={`result-tab ${activeConsoleTab === "history" ? "active" : ""}`}
                  onClick={() => setActiveConsoleTab("history")}
                >
                  <Clock size={12} style={{ marginRight: "6px" }} /> History & Bookmarks
                </button>
                <button
                  className={`result-tab ${activeConsoleTab === "saved" ? "active" : ""}`}
                  onClick={() => setActiveConsoleTab("saved")}
                >
                  <Star size={12} style={{ marginRight: "6px" }} /> Saved Queries
                </button>
                {compareModeOpen && (
                  <button
                    className={`result-tab ${activeConsoleTab === "benchmark" ? "active" : ""}`}
                    onClick={() => setActiveConsoleTab("benchmark")}
                  >
                    <BarChart3 size={12} style={{ marginRight: "6px" }} /> A/B Benchmark
                  </button>
                )}
                {queryResult.durationMs !== undefined && !queryResult.error && (
                  <span
                    className="timing-badge"
                    style={{
                      fontSize: "11px",
                      color: "var(--muted)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      background: "rgba(255, 255, 255, 0.02)",
                      padding: "3px 8px",
                      borderRadius: "4px",
                      border: "1px solid var(--border)",
                      marginLeft: "12px",
                    }}
                    title="Query execution time on client engine"
                  >
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background:
                          queryResult.durationMs > 100
                            ? "var(--rose)"
                            : queryResult.durationMs > 20
                              ? "var(--amber)"
                              : "var(--emerald)",
                        display: "inline-block",
                      }}
                    />
                    <span>{queryResult.durationMs.toFixed(2)} ms</span>
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: "8px" }}></div>
            </div>

            {activeConsoleTab === "plan" && (
              <div className="plan-tab-content" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <ErrorBoundary fallbackTitle="Query Plan Flowchart Panel">
                  <QueryPlanFlowchart planSteps={queryPlanSteps} />
                </ErrorBoundary>
                <div className="profile-grid">
                  <div className="profile-card cyan">
                    <span>Execution Speed</span>
                    <strong>
                      {queryResult.durationMs !== undefined ? `${queryResult.durationMs.toFixed(2)} ms` : "0.00 ms"}
                    </strong>
                  </div>
                  <div className="profile-card emerald">
                    <span>Rows Returned</span>
                    <strong>{queryResult.error ? "0" : queryResult.rows.length}</strong>
                  </div>
                  <div className="profile-card amber">
                    <span>Columns Returned</span>
                    <strong>{queryResult.error ? "0" : queryResult.columns.length}</strong>
                  </div>
                </div>

                {(() => {
                  const upQuery = query.toUpperCase();
                  const steps = [
                    {
                      key: "FROM",
                      label: "FROM",
                      active: true,
                      desc: "Load data from source table",
                      isFirst: true,
                    },
                    {
                      key: "JOIN",
                      label: "JOIN",
                      active: upQuery.includes("JOIN"),
                      desc: "Combine rows from another table",
                    },
                    {
                      key: "WHERE",
                      label: "WHERE",
                      active: upQuery.includes("WHERE"),
                      desc: "Filter individual rows",
                    },
                    {
                      key: "GROUP BY",
                      label: "GROUP BY",
                      active: upQuery.includes("GROUP BY"),
                      desc: "Group rows together",
                    },
                    {
                      key: "HAVING",
                      label: "HAVING",
                      active: upQuery.includes("HAVING"),
                      desc: "Filter aggregated groups",
                    },
                    {
                      key: "OVER",
                      label: "WINDOW",
                      active: upQuery.includes("OVER"),
                      desc: "Evaluate partition functions",
                    },
                    { key: "SELECT", label: "SELECT", active: true, desc: "Retrieve selected columns" },
                    {
                      key: "DISTINCT",
                      label: "DISTINCT",
                      active: upQuery.includes("DISTINCT"),
                      desc: "Remove duplicates",
                    },
                    {
                      key: "ORDER BY",
                      label: "ORDER BY",
                      active: upQuery.includes("ORDER BY"),
                      desc: "Sort final results",
                    },
                    {
                      key: "LIMIT",
                      label: "LIMIT",
                      active: upQuery.includes("LIMIT"),
                      desc: "Cap number of output rows",
                      isLast: true,
                    },
                  ];
                  const activeSteps = steps.filter((s) => s.active);
                  return (
                    <div className="logical-timeline-container">
                      <div className="logical-timeline-title">
                        <Zap size={12} style={{ color: "var(--cyan)" }} /> Logical SQL Execution Order
                      </div>
                      <div className="logical-timeline-flow">
                        {activeSteps.map((step, idx) => (
                          <React.Fragment key={step.key}>
                            {idx > 0 && <span className="logical-connector">→</span>}
                            <div
                              className={`logical-step-node active ${
                step.isFirst ? "first" : ""
              } ${step.isLast ? "last" : ""}`}
                              title={`${step.label}: ${step.desc}`}
                            >
                              {step.label}
                            </div>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                <div className="physical-tree-container">
                  <div className="physical-tree-title">
                    <Database size={12} style={{ color: "var(--violet)" }} /> SQLite Optimizer Physical Plan
                  </div>
                  {queryPlanSteps.length === 0 ? (
                    <div style={{ fontSize: "12px", color: "var(--muted)", textAlign: "center", padding: "16px" }}>
                      {query.trim()
                        ? "No physical plan generated. Make sure your query executes successfully."
                        : "Run your query to generate a physical plan."}
                    </div>
                  ) : (
                    <div className="physical-tree-list" style={{ position: "relative" }}>
                      {queryPlanSteps.map((step, idx) => {
                        // Compute depth based on ancestor parent chain
                        let depth = 0;
                        let p = step.parent;
                        const visited = new Set<number>();
                        while (p > 0 && !visited.has(p)) {
                          visited.add(p);
                          const parentNode = queryPlanSteps.find((s) => s.id === p);
                          if (!parentNode) break;
                          depth++;
                          p = parentNode.parent;
                        }

                        const detail = step.detail;
                        const dUpper = detail.toUpperCase();
                        let badge = "other";
                        let badgeLabel = "OPERATION";
                        let explanation = "Executes subqueries, combinations, or base operations.";

                        if (dUpper.includes("SCAN")) {
                          badge = "scan";
                          badgeLabel = "SCAN (Slow)";
                          explanation =
                            "Scans the entire table row-by-row. If this table grows large, a scan " +
  "will become highly inefficient. Consider indexing query filters.";
                        } else if (dUpper.includes("SEARCH")) {
                          badge = "search";
                          badgeLabel = "SEARCH (Fast)";
                          explanation =
                            "Performs a direct look-up using a primary key or index search structure. " +
  "Highly efficient and fast.";
                        } else if (dUpper.includes("USE TEMP B-TREE") || dUpper.includes("SORT")) {
                          badge = "sort";
                          badgeLabel = "TEMP SORT";
                          explanation =
                            "Creates a temporary index or B-Tree to sort rows. Requires extra " +
  "computational overhead and temporary memory.";
                        }

                        return (
                          <div
                            key={idx}
                            className="physical-step-item"
                            style={{
                              paddingLeft: `${16 + depth * 24}px`,
                              position: "relative",
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "12px",
                              marginBottom: "10px",
                            }}
                          >
                            {depth > 0 && (
                              <div
                                style={{
                                  position: "absolute",
                                  left: `${16 + (depth - 1) * 24 + 10}px`,
                                  top: "-6px",
                                  bottom: "16px",
                                  width: "12px",
                                  borderLeft: "1.5px dashed var(--border)",
                                  borderBottom: "1.5px dashed var(--border)",
                                  borderBottomLeftRadius: "4px",
                                  pointerEvents: "none",
                                }}
                              />
                            )}
                            <span className={`physical-step-badge ${badge}`} style={{ flexShrink: 0 }}>
                              {badgeLabel}
                            </span>
                            <div className="physical-step-detail" style={{ flex: 1 }}>
                              <code style={{ fontSize: "11.5px", fontFamily: "var(--font-mono)" }}>{detail}</code>
                              <div
                                className="physical-step-explain"
                                style={{ fontSize: "10px", color: "var(--muted)", marginTop: "2px" }}
                              >
                                {explanation}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Indexing & Optimization Advisor Section */}
                {query.trim() && !queryResult.error && (
                  <div
                    className="optimization-advisor-container"
                    style={{ marginTop: "20px", borderTop: "1px solid var(--border)", paddingTop: "16px" }}
                  >
                    <div
                      className="optimization-advisor-title"
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "var(--amber)",
                        marginBottom: "12px",
                      }}
                    >
                      <Sparkles size={13} /> Indexing & Optimization Advisor
                    </div>
                    {(() => {
                      const adviceList = getOptimizationAdvice(queryPlanSteps, query);
                      if (adviceList.length === 0) return null;

                      return (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {adviceList.map((adv, idx) => (
                            <div
                              key={idx}
                              style={{
                                padding: "12px",
                                borderRadius: "6px",
                                background:
                                  adv.type === "warning"
                                    ? "rgba(244, 63, 94, 0.04)"
                                    : adv.type === "success"
                                      ? "rgba(52, 211, 153, 0.04)"
                                      : "rgba(56, 189, 248, 0.04)",
                                border: `1px solid ${
                    adv.type === "warning"
                      ? "rgba(244, 63, 94, 0.15)"
                      : adv.type === "success"
                        ? "rgba(52, 211, 153, 0.15)"
                        : "rgba(56, 189, 248, 0.15)"
                  }`,
                                display: "flex",
                                flexDirection: "column",
                                gap: "6px",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span
                                  style={{
                                    fontSize: "9px",
                                    fontWeight: 800,
                                    textTransform: "uppercase",
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    background:
                                      adv.type === "warning"
                                        ? "rgba(244, 63, 94, 0.1)"
                                        : adv.type === "success"
                                          ? "rgba(52, 211, 153, 0.1)"
                                          : "rgba(56, 189, 248, 0.1)",
                                    color:
                                      adv.type === "warning"
                                        ? "var(--rose)"
                                        : adv.type === "success"
                                          ? "var(--emerald)"
                                          : "var(--cyan)",
                                  }}
                                >
                                  {adv.type === "warning"
                                    ? "Warning"
                                    : adv.type === "success"
                                      ? "Fully Optimized"
                                      : "Notice"}
                                </span>
                                <strong style={{ fontSize: "12px", color: "var(--text)" }}>{adv.title}</strong>
                              </div>
                              <p
                                style={{ margin: 0, fontSize: "11.5px", color: "var(--muted)", lineHeight: "1.4" }}
                              >
                                {adv.message}
                              </p>
                              {adv.recommendation && (
                                <div
                                  style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}
                                >
                                  <span style={{ fontSize: "9px", color: "var(--muted)", fontWeight: 600 }}>
                                    RECOMMENDED INDEX DESIGN:
                                  </span>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      background: "var(--bg2)",
                                      padding: "6px 10px",
                                      borderRadius: "4px",
                                      border: "1px solid var(--border)",
                                    }}
                                  >
                                    <code
                                      style={{
                                        fontSize: "10.5px",
                                        fontFamily: "var(--font-mono)",
                                        color: "var(--cyan)",
                                      }}
                                    >
                                      {adv.recommendation}
                                    </code>
                                    <button
                                      className="icon-button small labeled"
                                      title="Copy Index Command"
                                      style={{
                                        padding: "2px 6px",
                                        fontSize: "9px",
                                        background: "rgba(255,255,255,0.03)",
                                        border: "1px solid var(--border)",
                                        borderRadius: "3px",
                                        cursor: "pointer",
                                        color: "var(--text)",
                                      }}
                                      onClick={() => copyToClipboard(adv.recommendation!)}
                                    >
                                      Copy
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
            {activeConsoleTab === "benchmark" && (
              <div
                className="benchmark-tab-content"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  padding: "16px",
                  overflowY: "auto",
                  height: "100%",
                  width: "100%",
                }}
              >
                {resB ? (
                  <ErrorBoundary fallbackTitle="A/B Performance Comparison Panel">
                    <SqlPerformanceComparer
                      queryA={query}
                      queryB={queryB}
                      resA={queryResult}
                      resB={resB}
                      planA={queryPlanSteps}
                      planB={planB}
                    />
                  </ErrorBoundary>
                ) : (
                  <div style={{ textAlign: "center", padding: "30px", color: "var(--muted)", fontSize: "12px" }}>
                    No benchmark run loaded. Write Query B in the benchmark editor and click "Run A/B Benchmark"!
                  </div>
                )}
              </div>
            )}
            {activeConsoleTab === "results" && (
              <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
                {graderFeedback && (
                  <div style={{ padding: "12px 12px 0 12px" }}>
                    <div className={`grader-feedback-alert ${graderFeedback.isCorrect ? "success" : "error"}`}>
                      <div className="grader-feedback-title">
                        {graderFeedback.isCorrect ? "🎉 Correct!" : "❌ Incorrect"}
                        <span style={{ fontSize: "12px", fontWeight: "normal", color: "var(--text-secondary)" }}>
                          - {graderFeedback.message}
                        </span>
                      </div>
                      {graderFeedback.details && (
                        <div style={{ fontSize: "11.5px", opacity: 0.85, marginTop: "2px" }}>
                          {graderFeedback.details}
                        </div>
                      )}
                      {graderFeedback.warning && (
                        <div className="grader-feedback-warning">⚠️ {graderFeedback.warning}</div>
                      )}
                    </div>
                  </div>
                )}
                <div
                  className="results-container"
                  style={{ display: "flex", gap: "16px", flex: 1, overflow: "hidden", padding: "12px" }}
                >
                  {/* Your Result */}
                  <div
                    className="result-half"
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      minWidth: 0,
                      height: "100%",
                      background: "rgba(255,255,255,0.01)",
                      borderRadius: "6px",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      className="half-header"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 12px",
                        borderBottom: "1px solid var(--border)",
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                        color: "var(--text-secondary)",
                        background: "rgba(255,255,255,0.02)",
                      }}
                    >
                      <span>YOUR RESULT</span>
                      <span className={queryResult.error ? "status-dot error" : "status-dot ok"} />
                      <span style={{ fontSize: "10px", fontWeight: 400, color: "var(--muted)", marginRight: "auto" }}>
                        ({queryResult.message})
                      </span>
                      {!queryResult.error && queryResult.rows && queryResult.rows.length > 0 && (
                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                          <button
                            onClick={() => exportResultAsCsv(queryResult.columns, queryResult.rows)}
                            title="Export query results as CSV"
                            style={{
                              background: "rgba(56, 217, 255, 0.08)",
                              border: "1px solid rgba(56, 217, 255, 0.2)",
                              borderRadius: "4px",
                              color: "var(--cyan)",
                              fontSize: "10px",
                              fontWeight: 600,
                              padding: "2px 6px",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "3px",
                            }}
                          >
                            <Download size={10} /> CSV
                          </button>
                          <button
                            onClick={() => exportResultAsJson(queryResult.columns, queryResult.rows)}
                            title="Export query results as JSON"
                            style={{
                              background: "rgba(48, 230, 149, 0.08)",
                              border: "1px solid rgba(48, 230, 149, 0.2)",
                              borderRadius: "4px",
                              color: "var(--emerald)",
                              fontSize: "10px",
                              fontWeight: 600,
                              padding: "2px 6px",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "3px",
                            }}
                          >
                            <Download size={10} /> JSON
                          </button>
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        minHeight: 0,
                        overflow: "hidden",
                        padding: "8px",
                      }}
                    >
                      {queryResult.error ? (
                        renderDetailedError(queryResult.error, query)
                      ) : queryResult.columns.length > 0 ? (
                        <>
                          <div className="table-wrap">
                            <table>
                              <thead>
                                <tr>
                                  {queryResult.columns.map((c) => (
                                    <th key={c}>{c}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {queryResult.rows
                                  .slice(resultPage * RESULT_PAGE_SIZE, (resultPage + 1) * RESULT_PAGE_SIZE)
                                  .map((row, i) => (
                                    <tr key={i}>
                                      {queryResult.columns.map((c) => (
                                        <td key={c}>{String(row[c] ?? "NULL")}</td>
                                      ))}
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                          {queryResult.rows.length > RESULT_PAGE_SIZE && (
                            <div className="table-pagination">
                              <span>
                                Showing {resultPage * RESULT_PAGE_SIZE + 1}–
                                {Math.min(queryResult.rows.length, (resultPage + 1) * RESULT_PAGE_SIZE)} of{" "}
                                {queryResult.rows.length} rows
                              </span>
                              <div style={{ display: "flex", gap: "6px" }}>
                                <button
                                  disabled={resultPage === 0}
                                  onClick={() => setResultPage((p) => Math.max(0, p - 1))}
                                  className="secondary-button compact"
                                  style={{ padding: "2px 6px", fontSize: "10px" }}
                                >
                                  Prev
                                </button>
                                <button
                                  disabled={resultPage >= Math.ceil(queryResult.rows.length / RESULT_PAGE_SIZE) - 1}
                                  onClick={() =>
                                    setResultPage((p) =>
                                      Math.min(Math.ceil(queryResult.rows.length / RESULT_PAGE_SIZE) - 1, p + 1),
                                    )
                                  }
                                  className="secondary-button compact"
                                  style={{ padding: "2px 6px", fontSize: "10px" }}
                                >
                                  Next
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "100%",
                            color: "var(--muted)",
                            fontSize: "12px",
                          }}
                        >
                          Run your query to see results
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expected Result */}
                  {expectedResult && (
                    <div
                      className="result-half"
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        minWidth: 0,
                        height: "100%",
                        background: "rgba(255,255,255,0.01)",
                        borderRadius: "6px",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div
                        className="half-header"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "8px 12px",
                          borderBottom: "1px solid var(--border)",
                          fontSize: "11px",
                          fontWeight: 700,
                          letterSpacing: "0.05em",
                          color: "var(--text-secondary)",
                          background: "rgba(255,255,255,0.02)",
                        }}
                      >
                        <span>EXPECTED OUTPUT</span>
                        <span className={expectedResult.error ? "status-dot error" : "status-dot ok"} />
                        <span style={{ fontSize: "10px", fontWeight: 400, color: "var(--muted)" }}>
                          ({expectedResult.message})
                        </span>
                      </div>
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          minHeight: 0,
                          overflow: "hidden",
                          padding: "8px",
                        }}
                      >
                        {expectedResult.error ? (
                          <pre
                            className="error-output"
                            style={{
                              margin: 0,
                              whiteSpace: "pre-wrap",
                              color: "var(--rose)",
                              fontSize: "12px",
                              fontFamily: "monospace",
                              overflow: "auto",
                              flex: 1,
                            }}
                          >
                            {expectedResult.error}
                          </pre>
                        ) : expectedResult.columns.length > 0 ? (
                          <>
                            <div className="table-wrap">
                              <table>
                                <thead>
                                  <tr>
                                    {expectedResult.columns.map((c: any) => (
                                      <th key={c}>{c}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {expectedResult.rows
                                    .slice(resultPage * RESULT_PAGE_SIZE, (resultPage + 1) * RESULT_PAGE_SIZE)
                                    .map((row: any, i: number) => (
                                      <tr key={i}>
                                        {expectedResult.columns.map((c: any) => (
                                          <td key={c}>{String(row[c] ?? "NULL")}</td>
                                        ))}
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>
                            {expectedResult.rows.length > RESULT_PAGE_SIZE && (
                              <div className="table-pagination">
                                <span>
                                  Showing {resultPage * RESULT_PAGE_SIZE + 1}–
                                  {Math.min(
                expectedResult.rows.length,
                (resultPage + 1) * RESULT_PAGE_SIZE
              )}{" "}
              of{" "}
                                  {expectedResult.rows.length} rows
                                </span>
                                <div style={{ display: "flex", gap: "6px" }}>
                                  <button
                                    disabled={resultPage === 0}
                                    onClick={() => setResultPage((p) => Math.max(0, p - 1))}
                                    className="secondary-button compact"
                                    style={{ padding: "2px 6px", fontSize: "10px" }}
                                  >
                                    Prev
                                  </button>
                                  <button
                                    disabled={
                                      resultPage >= Math.ceil(expectedResult.rows.length / RESULT_PAGE_SIZE) - 1
                                    }
                                    onClick={() =>
                                      setResultPage((p) =>
                                        Math.min(
                                          Math.ceil(expectedResult.rows.length / RESULT_PAGE_SIZE) - 1,
                                          p + 1,
                                        ),
                                      )
                                    }
                                    className="secondary-button compact"
                                    style={{ padding: "2px 6px", fontSize: "10px" }}
                                  >
                                    Next
                                  </button>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              height: "100%",
                              color: "var(--muted)",
                              fontSize: "12px",
                            }}
                          >
                            No expected output loaded
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeConsoleTab === "history" && (
              <div
                className="history-tab-content"
                style={{
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  height: "100%",
                  overflow: "hidden",
                }}
              >
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Search history query text..."
                    style={{
                      flex: 1,
                      background: "var(--input-bg)",
                      border: "1px solid var(--border)",
                      borderRadius: "4px",
                      padding: "6px 10px",
                      fontSize: "12px",
                      outline: "none",
                      color: "var(--text)",
                    }}
                  />
                  <button
                    className={`icon-button labeled ${showHistoryPinned ? "active" : ""}`}
                    onClick={() => setShowHistoryPinned(!showHistoryPinned)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "6px 10px",
                      fontSize: "11px",
                      background: showHistoryPinned ? "rgba(255, 215, 0, 0.1)" : "rgba(255,255,255,0.03)",
                      border: "1px solid var(--border)",
                      borderRadius: "4px",
                      cursor: "pointer",
                      color: showHistoryPinned ? "gold" : "var(--text)",
                    }}
                  >
                    <Star
                      size={12}
                      fill={showHistoryPinned ? "gold" : "none"}
                      style={{ color: showHistoryPinned ? "gold" : "var(--muted)" }}
                    />{" "}
                    Pinned
                  </button>
                  <button
                    onClick={() => {
                      showConfirm("Clear all query history?", () => {
                        setQueryHistory([]);
                        handleSetHistoryFavorites([]);
                      });
                    }}
                    style={{
                      padding: "6px 10px",
                      fontSize: "11px",
                      background: "rgba(239, 68, 68, 0.08)",
                      border: "1px solid rgba(239, 68, 68, 0.15)",
                      borderRadius: "4px",
                      cursor: "pointer",
                      color: "#ef4444",
                    }}
                  >
                    Clear
                  </button>
                </div>

                <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {(() => {
                    const s = historySearch.toLowerCase().trim();
                    const list = queryHistory.filter((h) => {
                      const matchesSearch = h.query.toLowerCase().includes(s);
                      const matchesPinned = !showHistoryPinned || historyFavorites.includes(h.id);
                      return matchesSearch && matchesPinned;
                    });

                    if (list.length === 0) {
                      return (
                        <div
                          style={{ textAlign: "center", color: "var(--muted)", padding: "16px", fontSize: "12px" }}
                        >
                          No history records found.
                        </div>
                      );
                    }

                    return list.map((item) => {
                      const isFav = historyFavorites.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "8px 12px",
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid var(--border)",
                            borderRadius: "4px",
                          }}
                        >
                          <button
                            className="icon-button"
                            onClick={() => {
                              handleSetHistoryFavorites((favs) =>
                                favs.includes(item.id) ? favs.filter((id) => id !== item.id) : [...favs, item.id],
                              );
                            }}
                            style={{ cursor: "pointer", padding: "4px" }}
                          >
                            <Star
                              size={13}
                              fill={isFav ? "gold" : "none"}
                              style={{ color: isFav ? "gold" : "var(--muted)" }}
                            />
                          </button>
                          <span
                            style={{
                              fontSize: "10px",
                              textTransform: "uppercase",
                              padding: "2px 4px",
                              borderRadius: "3px",
                              background:
                                item.status === "success" ? "rgba(52, 211, 153, 0.1)" : "rgba(244, 63, 94, 0.1)",
                              color: item.status === "success" ? "var(--emerald)" : "var(--rose)",
                              fontWeight: "bold",
                            }}
                          >
                            {item.status}
                          </span>
                          <code
                            style={{
                              flex: 1,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              fontSize: "11.5px",
                              color: "var(--text-secondary)",
                              fontFamily: "var(--font-mono)",
                            }}
                          >
                            {item.query.trim().replace(/\n+/g, " ")}
                          </code>
                          <span style={{ fontSize: "10px", color: "var(--muted)" }}>{fmtTime(item.createdAt)}</span>
                          <button
                            className="secondary-button compact"
                            onClick={() => updateEditorQuery(item.query)}
                            style={{
                              padding: "3px 8px",
                              fontSize: "10px",
                              background: "rgba(255,255,255,0.03)",
                              border: "1px solid var(--border)",
                              borderRadius: "3px",
                              cursor: "pointer",
                              color: "var(--text)",
                            }}
                          >
                            Load
                          </button>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {activeConsoleTab === "saved" && (
              <div
                className="saved-tab-content"
                style={{
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  height: "100%",
                  overflow: "hidden",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--muted)",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                    }}
                  >
                    Saved Snippets ({bookmarkedQueries.length})
                  </span>
                  <button
                    className="primary-button compact"
                    onClick={saveCurrentQuery}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "3px 8px",
                      fontSize: "10px",
                      height: "22px",
                      background: "rgba(56, 217, 255, 0.08)",
                      border: "1px solid rgba(56, 217, 255, 0.2)",
                      borderRadius: "3px",
                      cursor: "pointer",
                      color: "var(--cyan)",
                    }}
                  >
                    <Star size={10} fill="var(--cyan)" /> Save Current Query
                  </button>
                </div>

                <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {bookmarkedQueries.length === 0 ? (
                    <div style={{ textAlign: "center", color: "var(--muted)", padding: "16px", fontSize: "12px" }}>
                      No saved queries yet. Click "Save Current Query" to save snippets here.
                    </div>
                  ) : (
                    bookmarkedQueries.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "8px 12px",
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid var(--border)",
                          borderRadius: "4px",
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <strong
                            style={{
                              fontSize: "12px",
                              color: "var(--text)",
                              display: "block",
                              textOverflow: "ellipsis",
                              overflow: "hidden",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.name}
                          </strong>
                          <code
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              fontSize: "10.5px",
                              color: "var(--muted)",
                              fontFamily: "var(--font-mono)",
                              display: "block",
                              marginTop: "2px",
                            }}
                          >
                            {item.query.trim().replace(/\n+/g, " ")}
                          </code>
                        </div>
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button
                            className="secondary-button compact"
                            onClick={() => updateEditorQuery(item.query)}
                            style={{
                              padding: "3px 8px",
                              fontSize: "10px",
                              background: "rgba(255,255,255,0.03)",
                              border: "1px solid var(--border)",
                              borderRadius: "3px",
                              cursor: "pointer",
                              color: "var(--text)",
                            }}
                          >
                            Load
                          </button>
                          <button
                            className="secondary-button compact"
                            onClick={() => deleteSavedQuery(item.id)}
                            style={{
                              padding: "3px 8px",
                              fontSize: "10px",
                              background: "rgba(244, 63, 94, 0.08)",
                              border: "1px solid rgba(244, 63, 94, 0.15)",
                              borderRadius: "3px",
                              cursor: "pointer",
                              color: "var(--rose)",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        }
      />
    </div>
  </div>
);

const rightContent = (
  <div className="pg-right-col" style={{ width: "100%", height: "100%", minWidth: 0 }}>
    <div className="right-panel-header">
      <strong>Context</strong>
      <div className="right-tabs" role="tablist" aria-label="Context Panel Tabs" onKeyDown={handleRightNavKeyDown}>
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            className={activeRightTab === id ? "active" : ""}
            title={label}
            onClick={() => setActiveRightTab(id)}
            role="tab"
            aria-selected={activeRightTab === id}
            tabIndex={activeRightTab === id ? 0 : -1}
            aria-label={label}
            style={{ position: "relative" }}
          >
            <Icon size={15} aria-hidden="true" />
          </button>
        ))}
      </div>
      <button className="icon-button" onClick={() => setRightOpen(false)}>
        <X size={15} />
      </button>
    </div>

    <div className="right-panel-body">
      {activeRightTab === "schema" && (
        <div className="schema-stack">
          <div style={{ padding: "2px 0 10px 0", borderBottom: "1px solid var(--border)", marginBottom: "12px" }}>
            <input
              value={schemaSearch}
              onChange={(e) => setSchemaSearch(e.target.value)}
              placeholder="Search tables or columns..."
              style={{
                width: "100%",
                background: "var(--input-bg)",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                padding: "6px 10px",
                fontSize: "11.5px",
                outline: "none",
                color: "var(--text)",
              }}
            />
          </div>

          <div
            onClick={() => setErdModalOpen(true)}
            style={{
              background: "rgba(56, 217, 255, 0.05)",
              border: "1px solid rgba(56, 217, 255, 0.15)",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "16px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              transition: "all 0.2s ease",
            }}
            className="erd-launcher-card"
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Database size={16} style={{ color: "var(--cyan)" }} />
              <div style={{ textAlign: "left" }}>
                <strong style={{ fontSize: "12.5px", color: "var(--text)" }}>Interactive ERD Explorer</strong>
                <span style={{ display: "block", fontSize: "10px", color: "var(--muted)", marginTop: "1px" }}>
                  Visualize joins & key mappings
                </span>
              </div>
            </div>
            <ChevronRight size={14} style={{ color: "var(--cyan)" }} />
          </div>
          {(() => {
            const s = schemaSearch.toLowerCase().trim();
            const filteredActive = activeTables.filter(
              (t) => t.name.toLowerCase().includes(s) || t.columns.some((c: any) => c.name.toLowerCase().includes(s)),
            );
            const filteredOther = otherTables.filter(
              (t) => t.name.toLowerCase().includes(s) || t.columns.some((c: any) => c.name.toLowerCase().includes(s)),
            );

            return (
              <>
                {/* Required Tables */}
                {filteredActive.length > 0 && (
                  <>
                    <div
                      className="schema-section-title"
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        color: "var(--cyan)",
                        marginTop: "16px",
                        marginBottom: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <CheckCircle2 size={11} /> Required Tables
                    </div>
                    {filteredActive.map((t) => (
                      <details
                        key={t.name}
                        id={`schema-table-${t.name}`}
                        open={selectedTable === t.name || undefined}
                        style={{
                          borderLeft:
                            selectedTable === t.name
                              ? "3px solid var(--cyan-bright, #38d9ff)"
                              : "3px solid var(--cyan)",
                          background: selectedTable === t.name ? "rgba(56, 217, 255, 0.04)" : "transparent",
                          paddingLeft: "8px",
                          marginBottom: "12px",
                          borderRadius: "4px",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <summary style={{ listStyle: "none" }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              width: "100%",
                              cursor: "pointer",
                            }}
                          >
                            <span style={{ display: "flex", alignItems: "center" }}>
                              <strong
                                className="schema-insertable-item"
                                style={{ color: "var(--cyan)", cursor: "pointer" }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  insertTextAtCursor(t.name);
                                }}
                                title="Click to insert table name"
                              >
                                {t.name}
                              </strong>
                              <small style={{ marginLeft: "8px", color: "var(--muted)", fontSize: "10px" }}>
                                {t.domain}
                              </small>
                              {t.name.startsWith("temp_") && (
                                <button
                                  title="Delete custom table"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    dropCustomTableLocally(t.name);
                                  }}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    color: "var(--rose)",
                                    marginLeft: "8px",
                                    padding: "2px",
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <Trash2 size={11} />
                                </button>
                              )}
                            </span>
                          </div>
                        </summary>
                        <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "4px 0 8px 0" }}>
                          {t.description}
                        </p>
                        <div className="column-list">
                          {t.columns.map((c: any) => (
                            <div
                              key={c.name}
                              className="schema-insertable-col"
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                cursor: "pointer",
                              }}
                            >
                              <div
                                style={{ display: "flex", alignItems: "center", gap: "6px" }}
                                onClick={() => insertTextAtCursor(c.name)}
                                title="Click to insert column name"
                              >
                                <code>{c.name}</code>
                                {t.primaryKey === c.name && (
                                  <span
                                    style={{
                                      fontSize: "8px",
                                      padding: "1px 3px",
                                      borderRadius: "3px",
                                      background: "rgba(251, 191, 36, 0.1)",
                                      color: "var(--amber)",
                                      border: "1px solid rgba(251, 191, 36, 0.25)",
                                      fontWeight: 700,
                                      letterSpacing: "0.02em",
                                    }}
                                  >
                                    PK
                                  </span>
                                )}
                                {c.name.endsWith("_id") && t.primaryKey !== c.name && (
                                  <span
                                    style={{
                                      fontSize: "8px",
                                      padding: "1px 3px",
                                      borderRadius: "3px",
                                      background: "rgba(56, 217, 255, 0.1)",
                                      color: "var(--cyan)",
                                      border: "1px solid rgba(56, 217, 255, 0.25)",
                                      fontWeight: 700,
                                      letterSpacing: "0.02em",
                                    }}
                                  >
                                    FK
                                  </span>
                                )}
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <span style={{ color: "var(--muted)", fontSize: "10px" }}>{c.type}</span>
                                <button
                                  title="Profile Column Stats"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    profileColumnLocally(t.name, c.name);
                                  }}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    color: "var(--cyan)",
                                    padding: "2px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <BarChart3 size={11} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div style={{ marginTop: "8px", marginBottom: "4px", display: "flex", gap: "6px" }}>
                          <button
                            className="primary-button outline compact"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "3px 8px",
                              fontSize: "10px",
                              height: "22px",
                              cursor: "pointer",
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              togglePreviewData(t.name);
                            }}
                          >
                            <Eye size={10} /> {previewData[t.name] ? "Hide Preview" : "Preview Data"}
                          </button>
                          <button
                            className="primary-button outline compact"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "3px 8px",
                              fontSize: "10px",
                              height: "22px",
                              cursor: "pointer",
                              color: "var(--amber)",
                              borderColor: "rgba(255,190,61,0.2)",
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              updateEditorQuery(`SELECT * FROM ${t.name} LIMIT 10;`);
                            }}
                          >
                            <Code2 size={10} /> Query Table
                          </button>
                          <button
                            className="primary-button outline compact"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "3px 8px",
                              fontSize: "10px",
                              height: "22px",
                              cursor: "pointer",
                              color: "var(--cyan)",
                              borderColor: "rgba(56, 217, 255, 0.2)",
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              copyTableSchemaMarkdownLocally(t);
                            }}
                          >
                            <Copy size={10} /> Copy Schema
                          </button>
                        </div>
                        {previewData[t.name] && (
                          <div
                            className="mini-preview-table-wrap"
                            style={{
                              marginTop: "6px",
                              overflowX: "auto",
                              border: "1px solid var(--border)",
                              borderRadius: "4px",
                              background: "var(--bg-dark)",
                            }}
                          >
                            {previewData[t.name]!.error ? (
                              <pre style={{ margin: 0, padding: "4px", fontSize: "9px", color: "var(--rose)" }}>
                                {previewData[t.name]!.error}
                              </pre>
                            ) : (
                              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9px" }}>
                                <thead>
                                  <tr
                                    style={{
                                      borderBottom: "1px solid var(--border)",
                                      background: "rgba(255,255,255,0.02)",
                                    }}
                                  >
                                    {previewData[t.name]!.columns.map((col) => (
                                      <th
                                        key={col}
                                        style={{
                                          padding: "3px 6px",
                                          textAlign: "left",
                                          fontWeight: 600,
                                          color: "var(--muted)",
                                        }}
                                      >
                                        {col}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {previewData[t.name]!.rows.map((row, idx) => (
                                    <tr
                                      key={idx}
                                      style={{
                                        borderBottom:
                                          idx === previewData[t.name]!.rows.length - 1
                                            ? "none"
                                            : "1px solid rgba(255,255,255,0.03)",
                                      }}
                                    >
                                      {previewData[t.name]!.columns.map((col) => (
                                        <td
                                          key={col}
                                          style={{ padding: "3px 6px", color: "var(--text-secondary)" }}
                                        >
                                          {String(row[col] ?? "NULL")}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        )}
                      </details>
                    ))}
                  </>
                )}

                {/* Other tables */}
                {filteredOther.length > 0 && (
                  <>
                    <div
                      className="schema-section-title"
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        color: "var(--text-secondary)",
                        marginTop: "24px",
                        marginBottom: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Database size={11} /> Other Tables
                    </div>
                    {filteredOther.map((t) => (
                      <details
                        key={t.name}
                        id={`schema-table-${t.name}`}
                        open={selectedTable === t.name || undefined}
                        style={{
                          opacity: 0.7,
                          marginBottom: "12px",
                          background: selectedTable === t.name ? "rgba(56, 217, 255, 0.04)" : "transparent",
                          borderLeft: selectedTable === t.name ? "3px solid var(--cyan)" : "none",
                          paddingLeft: selectedTable === t.name ? "8px" : "0px",
                          borderRadius: "4px",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <summary style={{ listStyle: "none" }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              width: "100%",
                              cursor: "pointer",
                            }}
                          >
                            <span style={{ display: "flex", alignItems: "center" }}>
                              <strong
                                className="schema-insertable-item"
                                style={{ color: "var(--text)", cursor: "pointer" }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  insertTextAtCursor(t.name);
                                }}
                                title="Click to insert table name"
                              >
                                {t.name}
                              </strong>
                              <small style={{ marginLeft: "8px", color: "var(--muted)", fontSize: "10px" }}>
                                {t.domain}
                              </small>
                              {t.name.startsWith("temp_") && (
                                <button
                                  title="Delete custom table"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    dropCustomTableLocally(t.name);
                                  }}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    color: "var(--rose)",
                                    marginLeft: "8px",
                                    padding: "2px",
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <Trash2 size={11} />
                                </button>
                              )}
                            </span>
                          </div>
                        </summary>
                        <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "4px 0 8px 0" }}>
                          {t.description}
                        </p>
                        <div className="column-list">
                          {t.columns.map((c: any) => (
                            <div
                              key={c.name}
                              className="schema-insertable-col"
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                cursor: "pointer",
                              }}
                            >
                              <div
                                style={{ display: "flex", alignItems: "center", gap: "6px" }}
                                onClick={() => insertTextAtCursor(c.name)}
                                title="Click to insert column name"
                              >
                                <code>{c.name}</code>
                                {t.primaryKey === c.name && (
                                  <span
                                    style={{
                                      fontSize: "8px",
                                      padding: "1px 3px",
                                      borderRadius: "3px",
                                      background: "rgba(251, 191, 36, 0.1)",
                                      color: "var(--amber)",
                                      border: "1px solid rgba(251, 191, 36, 0.25)",
                                      fontWeight: 700,
                                      letterSpacing: "0.02em",
                                    }}
                                  >
                                    PK
                                  </span>
                                )}
                                {c.name.endsWith("_id") && t.primaryKey !== c.name && (
                                  <span
                                    style={{
                                      fontSize: "8px",
                                      padding: "1px 3px",
                                      borderRadius: "3px",
                                      background: "rgba(56, 217, 255, 0.1)",
                                      color: "var(--cyan)",
                                      border: "1px solid rgba(56, 217, 255, 0.25)",
                                      fontWeight: 700,
                                      letterSpacing: "0.02em",
                                    }}
                                  >
                                    FK
                                  </span>
                                )}
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <span style={{ color: "var(--muted)", fontSize: "10px" }}>{c.type}</span>
                                <button
                                  title="Profile Column Stats"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    profileColumnLocally(t.name, c.name);
                                  }}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    color: "var(--cyan)",
                                    padding: "2px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <BarChart3 size={11} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div style={{ marginTop: "8px", marginBottom: "4px", display: "flex", gap: "6px" }}>
                          <button
                            className="primary-button outline compact"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "3px 8px",
                              fontSize: "10px",
                              height: "22px",
                              cursor: "pointer",
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              togglePreviewData(t.name);
                            }}
                          >
                            <Eye size={10} /> {previewData[t.name] ? "Hide Preview" : "Preview Data"}
                          </button>
                          <button
                            className="primary-button outline compact"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "3px 8px",
                              fontSize: "10px",
                              height: "22px",
                              cursor: "pointer",
                              color: "var(--amber)",
                              borderColor: "rgba(255,190,61,0.2)",
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              updateEditorQuery(`SELECT * FROM ${t.name} LIMIT 10;`);
                            }}
                          >
                            <Code2 size={10} /> Query Table
                          </button>
                          <button
                            className="primary-button outline compact"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "3px 8px",
                              fontSize: "10px",
                              height: "22px",
                              cursor: "pointer",
                              color: "var(--cyan)",
                              borderColor: "rgba(56, 217, 255, 0.2)",
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              copyTableSchemaMarkdownLocally(t);
                            }}
                          >
                            <Copy size={10} /> Copy Schema
                          </button>
                        </div>
                        {previewData[t.name] && (
                          <div
                            className="mini-preview-table-wrap"
                            style={{
                              marginTop: "6px",
                              overflowX: "auto",
                              border: "1px solid var(--border)",
                              borderRadius: "4px",
                              background: "var(--bg-dark)",
                            }}
                          >
                            {previewData[t.name]!.error ? (
                              <pre style={{ margin: 0, padding: "4px", fontSize: "9px", color: "var(--rose)" }}>
                                {previewData[t.name]!.error}
                              </pre>
                            ) : (
                              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9px" }}>
                                <thead>
                                  <tr
                                    style={{
                                      borderBottom: "1px solid var(--border)",
                                      background: "rgba(255,255,255,0.02)",
                                    }}
                                  >
                                    {previewData[t.name]!.columns.map((col) => (
                                      <th
                                        key={col}
                                        style={{
                                          padding: "3px 6px",
                                          textAlign: "left",
                                          fontWeight: 600,
                                          color: "var(--muted)",
                                        }}
                                      >
                                        {col}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {previewData[t.name]!.rows.map((row, idx) => (
                                    <tr
                                      key={idx}
                                      style={{
                                        borderBottom:
                                          idx === previewData[t.name]!.rows.length - 1
                                            ? "none"
                                            : "1px solid rgba(255,255,255,0.03)",
                                      }}
                                    >
                                      {previewData[t.name]!.columns.map((col) => (
                                        <td
                                          key={col}
                                          style={{ padding: "3px 6px", color: "var(--text-secondary)" }}
                                        >
                                          {String(row[col] ?? "NULL")}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        )}
                      </details>
                    ))}
                  </>
                )}
              </>
            );
          })()}
        </div>
      )}

      {activeRightTab === "hints" && (
        <div className="hints-panel">
          {playgroundMode === "puzzle" && activePuzzle ? (
            <>
              <p className="context-lead">Debug Puzzle: {activePuzzle.title}</p>
              <div className="hint-scenario">{activePuzzle.businessScenario}</div>
              <div className="hint-prompt-box">
                <strong>Task</strong>
                <p>Debug the flawed query to return the correct result.</p>
              </div>
              <div className="hint-card">
                <Lightbulb size={13} /> {activePuzzle.hint}
              </div>

              <button className="reveal-answer-btn" onClick={() => setSolutionRevealed((r) => !r)}>
                <Sparkles size={14} />
                {solutionRevealed ? "Hide Solution" : "Reveal Solution"}
              </button>
              {solutionRevealed && (
                <div className="hint-solution">
                  <pre className="sql-pre small">{activePuzzle.solutionQuery}</pre>
                  <div className="sol-actions">
                    <button
                      className="icon-button labeled"
                      onClick={() => {
                        updateEditorQuery(activePuzzle.solutionQuery);
                      }}
                    >
                      <Play size={13} /> Load Solution
                    </button>
                    <button
                      className={`icon-button labeled ${isAutoTyping ? "typing-active" : ""}`}
                      onClick={() => {
                        if (isAutoTyping) {
                          stopAutoTyping();
                        } else {
                          autoTypeQuery(activePuzzle.solutionQuery);
                        }
                      }}
                    >
                      <Sparkles size={13} /> {isAutoTyping ? "Stop typing" : "Auto-type"}
                    </button>
                  </div>
                  <p className="sol-explanation">
                    <strong>The Mistake:</strong> {activePuzzle.mistakeExplanation}
                  </p>
                </div>
              )}
              {progress.solvedPuzzles?.includes(activePuzzle.id) &&
                (() => {
                  const nextPuz =
                    debugPuzzles.findIndex((x) => x.id === activePuzzle.id) !== -1
                      ? debugPuzzles[debugPuzzles.findIndex((x) => x.id === activePuzzle.id) + 1]
                      : null;
                  return nextPuz ? (
                    <button
                      className="primary-button"
                      style={{
                        marginTop: "16px",
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        background: "var(--cyan)",
                        color: "black",
                        fontWeight: "bold",
                      }}
                      onClick={() => openPuzzleInPlayground(nextPuz)}
                    >
                      <span>Next Puzzle</span> <ChevronRight size={16} />
                    </button>
                  ) : null;
                })()}
            </>
          ) : selectedProblem.id ? (
            <>
              <p
                className="context-lead"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}
              >
                {selectedProblem.title}
                {(() => {
                  const parentMod = roadmapModules.find((m) => m.id === selectedProblem.moduleId);
                  return parentMod?.isHighWeight ? (
                    <span
                      style={{
                        fontSize: "9px",
                        background: "rgba(255,190,61,0.08)",
                        color: "var(--amber)",
                        padding: "1px 6px",
                        borderRadius: "3px",
                        border: "1px solid rgba(255,190,61,0.15)",
                        textTransform: "uppercase",
                        fontWeight: 700,
                        letterSpacing: "normal",
                      }}
                    >
                      ⭐ High Weight
                    </span>
                  ) : null;
                })()}
              </p>
              <div className="hint-scenario">{selectedProblem.businessScenario}</div>
              <div className="hint-prompt-box">
                <strong>Task</strong>
                <p>{selectedProblem.prompt}</p>
              </div>
              <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
                <button
                  className="secondary-button compact"
                  style={{
                    flex: 1,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    padding: "6px 12px",
                    fontSize: "11px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--border)",
                    borderRadius: "4px",
                    cursor: "pointer",
                    color: "var(--text)",
                  }}
                  onClick={() => setLessonModalOpen(true)}
                >
                  <BookOpen size={13} style={{ color: "var(--cyan)" }} /> Review Lesson
                </button>
                <button
                  className="secondary-button compact"
                  style={{
                    flex: 1,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    padding: "6px 12px",
                    fontSize: "11px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--border)",
                    borderRadius: "4px",
                    cursor: "pointer",
                    color: "var(--text)",
                  }}
                  onClick={resetPlayground}
                >
                  <RefreshCcw size={13} style={{ color: "var(--cyan)" }} /> Reset Starter SQL
                </button>
              </div>
              {(() => {
                const dyn = generateDynamicHint(query, selectedProblem.solution, queryResult, expectedResult);
                const displayHints = dyn
                  ? [{ text: dyn, smart: true }, ...selectedProblem.hints.map((h) => ({ text: h, smart: false }))]
                  : selectedProblem.hints.map((h) => ({ text: h, smart: false }));
                return (
                  <>
                    <div className="pg-hint-actions">
                      <button
                        className="icon-button labeled"
                        disabled={visibleHints >= displayHints.length}
                        onClick={() => setVisibleHints((n) => Math.min(displayHints.length, n + 1))}
                      >
                        <Lightbulb size={13} /> {visibleHints === 0 ? "Get Hint" : "Next Hint"}
                      </button>
                    </div>
                    {displayHints.slice(0, visibleHints).map((h, i) => (
                      <div key={i} className={`hint-card ${h.smart ? "smart-hint" : ""}`}>
                        <Lightbulb size={13} />
                        {h.smart ? <strong>Smart Hint: </strong> : null}
                        {h.text}
                      </div>
                    ))}
                    {visibleHints < displayHints.length && (
                      <p className="hint-remaining">{displayHints.length - visibleHints} more hint(s) available</p>
                    )}
                  </>
                );
              })()}
              <button
                className="reveal-answer-btn"
                onClick={() => {
                  if (!solutionRevealed) {
                    showConfirm("Are you sure you want to reveal the answer? Try using the hints first!", () => {
                      setSolutionRevealed(true);
                    });
                  } else {
                    setSolutionRevealed(false);
                  }
                }}
              >
                <Sparkles size={14} />
                {solutionRevealed ? "Hide Answer" : "Reveal Answer"}
              </button>
              {solutionRevealed && (
                <div className="hint-solution">
                  <pre className="sql-pre small">{selectedProblem.solution}</pre>
                  <div className="sol-actions">
                    <button
                      className="icon-button labeled"
                      onClick={() => {
                        updateEditorQuery(selectedProblem.solution);
                      }}
                    >
                      <Play size={13} /> Load into Editor
                    </button>
                    <button
                      className={`icon-button labeled ${isAutoTyping ? "typing-active" : ""}`}
                      onClick={() => {
                        if (isAutoTyping) {
                          stopAutoTyping();
                        } else {
                          autoTypeQuery(selectedProblem.solution);
                        }
                      }}
                    >
                      <Sparkles size={13} /> {isAutoTyping ? "Stop typing" : "Auto-type"}
                    </button>
                    <button
                      className="icon-button labeled"
                      onClick={() => copyToClipboard(selectedProblem.solution)}
                    >
                      <Clipboard size={13} /> Copy
                    </button>
                  </div>
                  <p className="sol-explanation">{selectedProblem.detailedExplanation}</p>
                </div>
              )}

              {(() => {
                const dialect = getDialectNotes(selectedProblem.moduleId);
                if (!dialect) return null;
                return (
                  <details
                    style={{
                      marginTop: "16px",
                      background: "var(--panel)",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      padding: "8px 12px",
                    }}
                  >
                    <summary
                      style={{
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "11px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "var(--cyan)",
                        textTransform: "uppercase",
                      }}
                    >
                      <Database size={13} /> Dialect Notes ({dialect.title})
                    </summary>
                    <pre
                      style={{
                        marginTop: "8px",
                        whiteSpace: "pre-wrap",
                        fontSize: "11px",
                        lineHeight: "1.4",
                        color: "var(--text-secondary)",
                        fontFamily: "var(--font-mono)",
                        margin: 0,
                      }}
                    >
                      {dialect.notes}
                    </pre>
                  </details>
                );
              })()}

              <button
                className={`mark-solved-btn ${
                progress.solvedProblems.includes(selectedProblem.id)
                  ? "solved"
                  : ""
              }`}
                onClick={() => markProblemSolved(selectedProblem)}
              >
                <CheckCircle2 size={14} />
                {progress.solvedProblems.includes(selectedProblem.id) ? "Solved ✓" : "Mark as Solved"}
              </button>
              {progress.solvedProblems.includes(selectedProblem.id) &&
                (() => {
                  const idx = allProblems.findIndex((p) => p.id === selectedProblem.id);
                  const nextProb = idx !== -1 && idx < allProblems.length - 1 ? allProblems[idx + 1] : null;
                  return nextProb ? (
                    <button
                      className="primary-button"
                      style={{
                        marginTop: "16px",
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        background: "var(--cyan)",
                        color: "black",
                        fontWeight: "bold",
                      }}
                      onClick={() => openInPlayground(nextProb)}
                    >
                      <span>Next Problem</span> <ChevronRight size={16} />
                    </button>
                  ) : null;
                })()}
            </>
          ) : (
            <div className="no-problem">
              <Lightbulb size={28} />
              <p>
                Open a problem from <strong>Practice</strong> to see hints and the question here.
              </p>
              <button className="primary-button compact" onClick={() => setActiveView("practice")}>
                <Code2 size={14} /> Browse Problems
              </button>
            </div>
          )}
        </div>
      )}

      {activeRightTab === "linter" && (
        <div
          className="linter-panel"
          style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "4px" }}
        >
          <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
            <span
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                color: "var(--amber)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <AlertTriangle size={14} /> SQL Hygiene & Linter Advice
            </span>
          </div>
          <div style={{ maxHeight: "calc(100vh - 220px)", overflowY: "auto", paddingRight: "4px" }}>
            <SqlLinterAdvisor
              errors={lintErrors}
              queryText={query}
              editorRef={editorRef}
              monacoRef={monacoRef}
              onApplyFix={(fixedText) => {
                updateEditorQuery(fixedText);
              }}
            />
          </div>
        </div>
      )}

      {activeRightTab === "erd" && (
        <div
          className="erd-panel"
          style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "4px" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid var(--border)",
              paddingBottom: "8px",
            }}
          >
            <span style={{ fontSize: "12px", fontWeight: "bold", color: "var(--cyan)" }}>
              Database Entity Relations
            </span>
            <button
              className="primary-button compact"
              onClick={() => setErdModalOpen(true)}
              style={{ fontSize: "10px", padding: "2px 8px" }}
            >
              Visual Map
            </button>
          </div>

          <div
            className="erd-text-list"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              maxHeight: "calc(100vh - 220px)",
              overflowY: "auto",
              paddingRight: "4px",
            }}
          >
            {(liveSchema.length > 0 ? liveSchema : tableSchemas)
              .map((t) => ({
                ...t,
                domain:
                  (t as any).domain || (t.name.toLowerCase().startsWith("temp") ? "Temporary Data" : "Custom Data"),
                primaryKey: (t as any).primaryKey || (t.columns[0] ? t.columns[0].name : ""),
                relationships: (t as any).relationships || [],
              }))
              .map((table) => (
                <div
                  key={table.name}
                  className={`schema-table-card ${selectedTable === table.name ? "selected" : ""}`}
                  onClick={() => setSelectedTable(selectedTable === table.name ? null : table.name)}
                  style={{
                    background: "var(--panel)",
                    border: `1px solid ${selectedTable === table.name ? "var(--cyan)" : "var(--border)"}`,
                    borderRadius: "6px",
                    padding: "10px 12px",
                    cursor: "pointer",
                    transition: "border-color 0.2s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "6px",
                    }}
                  >
                    <span style={{ fontWeight: "bold", fontSize: "13px", color: "var(--text)" }}>{table.name}</span>
                    <span
                      style={{
                        fontSize: "10px",
                        color: "var(--muted)",
                        background: "var(--bg2)",
                        padding: "2px 6px",
                        borderRadius: "3px",
                      }}
                    >
                      {table.domain}
                    </span>
                  </div>

                  <div style={{ fontSize: "11px", color: "var(--muted)", marginBottom: "8px" }}>
                    PK:{" "}
                    <code style={{ color: "var(--amber)", fontFamily: "var(--font-mono)" }}>
                      {table.primaryKey}
                    </code>
                  </div>

                  {table.relationships && table.relationships.length > 0 && (
                    <div style={{ borderTop: "1px dashed var(--border)", paddingTop: "6px", marginTop: "6px" }}>
                      <span
                        style={{
                          fontSize: "10.5px",
                          fontWeight: "bold",
                          color: "var(--muted)",
                          display: "block",
                          marginBottom: "4px",
                        }}
                      >
                        JOINS / CONNECTIONS:
                      </span>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {table.relationships.map((rel: string, idx: number) => {
                          const [targetTable, targetCol] = rel.split(".");
                          return (
                            <div
                              key={idx}
                              style={{
                                fontSize: "11px",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                flexWrap: "wrap",
                              }}
                            >
                              <code
                                style={{
                                  background: "var(--bg2)",
                                  padding: "1px 4px",
                                  borderRadius: "3px",
                                  color: "var(--text)",
                                }}
                              >
                                {table.name}.{targetCol || table.primaryKey}
                              </code>
                              <span style={{ color: "var(--cyan)" }}>➔</span>
                              <code
                                style={{
                                  background: "var(--bg2)",
                                  padding: "1px 4px",
                                  borderRadius: "3px",
                                  color: "var(--cyan)",
                                  fontWeight: "bold",
                                }}
                              >
                                {targetTable}.{targetCol}
                              </code>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

return (
  <div className="playground-fullscreen">
    {showSplit ? (
      <SplitPane
        leftWidth={playgroundSplit}
        onResize={handlePlaygroundSplitResize}
        minLeft={400}
        maxLeft={1600}
        left={editorContent}
        right={rightContent}
      />
    ) : (
      editorContent
    )}

    {!rightOpen && !editorMaximized && (
      <button className="pg-right-toggle" title="Show schema / hints" onClick={() => setRightOpen(true)}>
        <Database size={16} />
      </button>
    )}

    {erdModalOpen && (
      <ErdModalView
        setErdModalOpen={setErdModalOpen}
        tableSchemas={tableSchemas}
        liveSchema={liveSchema}
      />
    )}

    {lessonModalOpen && activeModule && (
      <div className="custom-modal-overlay" onClick={() => setLessonModalOpen(false)}>
        <div className="custom-modal-window large" onClick={(e) => e.stopPropagation()}>
          <div className="custom-modal-header">
            <h2>
              <BookOpen size={18} />
              <span>
                Lesson: {activeModule.title} (Module {activeModule.id})
              </span>
            </h2>
            <button className="icon-button" onClick={() => setLessonModalOpen(false)}>
              <X size={16} />
            </button>
          </div>
          <div className="custom-modal-body">
            <div className="concept-tab-container">
              <LessonProse text={activeModule.lesson.conceptExplanation} />

              {activeModule.lesson.realBusinessScenario && (
                <div className="concept-scenario-section" style={{ marginTop: "24px" }}>
                  <h3
                    className="section-title-visual"
                    style={{
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontWeight: 700,
                      color: "var(--text)",
                      marginBottom: "8px",
                    }}
                  >
                    <Lightbulb size={15} style={{ color: "var(--yellow)", marginRight: "6px" }} />
                    Real-World Business Scenario
                  </h3>
                  <LessonProse text={activeModule.lesson.realBusinessScenario} />
                </div>
              )}

              {activeModule.lesson.visualExplanation && (
                <div className="concept-visual-section" style={{ marginTop: "24px" }}>
                  <h3
                    className="section-title-visual"
                    style={{
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontWeight: 700,
                      color: "var(--text)",
                      marginBottom: "8px",
                    }}
                  >
                    <Eye size={15} style={{ color: "var(--cyan)", marginRight: "6px" }} />
                    Visual Representation
                  </h3>
                  <LessonProse text={activeModule.lesson.visualExplanation} />
                </div>
              )}
            </div>
          </div>
          <div className="custom-modal-footer">
            <button className="primary-button" onClick={() => setLessonModalOpen(false)}>
              Back to Practice
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
}
