import type { ViewId, PlaygroundMode } from "../types";
import type { LintError } from "../types";
import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useDeferredValue,
} from "react";
import {
  Database,
  Lightbulb,
  AlertTriangle,
  Search,
  Maximize2,
  Minimize2,
  Settings,
  Download,
  Trash2,
  Plus,
  Minus,
  Copy,
  BookOpen,
  Play,
  RefreshCcw,
  Eye,
  X,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Code2,
  BarChart3,
  Upload,
  Zap,
  GitBranch,
  Layers,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { BeforeMount, OnMount } from "@monaco-editor/react";
import type {
  Difficulty,
  PracticeProblem,
  RoadmapModule,
  RoadmapDay,
} from "../data/curriculum";
import type { SqlPuzzle } from "../data/puzzles";
import SqlDiagnosticCoach from "../components/SqlDiagnosticCoach";
import QueryExecutionStudio from "../components/QueryExecutionStudio";

import type { QueryResult, QueryPlanStep } from "../utils/sqlEngine";
import {
  getQueryPlan,
  runQuery,
  resetDatabase,
  getLiveSchema,
  formatSql,
} from "../utils/sqlEngine";
import { downloadStatsReport } from "../utils/reportGenerator";
import { buildCsvImportSql } from "../utils/csvParser";
import SqlLinterAdvisor from "../components/SqlLinterAdvisor";
import SqlPerformanceComparer from "../components/SqlPerformanceComparer";
import SqlDialectModal from "../components/SqlDialectModal";
import SqlResultDiffViewer from "../components/SqlResultDiffViewer";
import ColumnProfileModal from "../components/ColumnProfileModal";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { SplitPane, VSplitPane } from "../components/SplitPane";
import ErdModalView from "../components/ErdModalView";
import LessonProse from "../components/LessonProse";
import { ResultTablePanel } from "../components/playground/ResultTablePanel";

import Editor, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

// The default Monaco loader fetches its editor files from a public CDN. That
// leaves the editor permanently on "Loading..." in offline, CSP-restricted,
// or slow-network environments. Supplying the installed package keeps the
// playground self-contained and lets Vite serve the editor assets locally.
loader.config({ monaco });

type RightTab = "hints" | "schema";

interface QueryHistoryItem {
  id: string;
  query: string;
  createdAt: string;
  status: "success" | "error";
  rowCount?: number;
  durationMs?: number;
}

import type { TableSchema } from "../data/datasets";

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
  tableSchemas: TableSchema[];
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
  theme: "dark" | "light" | "oled" | "dracula" | "onedark" | "ember";
  query: string;
  setQuery: (val: string | ((prev: string) => string)) => void;
  queryResult: QueryResult;
  setQueryResult: React.Dispatch<React.SetStateAction<QueryResult>>;
  expectedResult: QueryResult | null;
  setExpectedResult: (res: QueryResult | null) => void;
  graderFeedback: {
    isCorrect: boolean;
    message: string;
    details?: string;
    warning?: string;
  } | null;
  setGraderFeedback: (
    val: {
      isCorrect: boolean;
      message: string;
      details?: string;
      warning?: string;
    } | null,
  ) => void;
  runCurrentQuery: () => void;
  copyToClipboard: (text: string) => void;
  openInPlayground: (p: PracticeProblem) => void;
  markProblemSolved: (p: PracticeProblem, quality?: number) => void;
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
  liveSchema: TableSchema[];
  setLiveSchema: React.Dispatch<React.SetStateAction<TableSchema[]>>;

  // Saved queries
  savedQueries: {
    id: string;
    query: string;
    createdAt: string;
    status: "success" | "error";
    rowCount?: number;
    durationMs?: number;
  }[];
  setSavedQueries: React.Dispatch<
    React.SetStateAction<
      {
        id: string;
        query: string;
        createdAt: string;
        status: "success" | "error";
        rowCount?: number;
        durationMs?: number;
      }[]
    >
  >;

  // Custom dialog confirms
  showConfirm: (msg: string, onConfirm: () => void) => void;
  showPrompt: (
    msg: string,
    defaultVal: string,
    onSubmit: (val: string) => void,
  ) => void;

  // Extra settings
  graderStrict: boolean;
  setGraderStrict: (val: boolean | ((prev: boolean) => boolean)) => void;

  // Puzzle props
  activePuzzle: SqlPuzzle | null;
  setActivePuzzleId: (id: string) => void;
  debugPuzzles: SqlPuzzle[];
  getSavedPuzzleQuery: (p: SqlPuzzle) => string;
  getSavedDraftQuery: (p: PracticeProblem) => string;
  updateEditorQuery: (
    newVal: string,
    pMode?: PlaygroundMode,
    targetId?: string,
    moveCursorToEnd?: boolean,
  ) => void;
  stopAutoTyping: () => void;
  allProblems: PracticeProblem[];

  // App-level Monaco references and settings
  monacoRef: React.MutableRefObject<any>;
  insertTextAtCursor: (text: string) => void;
  lintErrors: LintError[];
  isAutoTyping: boolean;
  autoTypeQuery: (sql: string) => void;
  queryHistory: QueryHistoryItem[];
  setQueryHistory: React.Dispatch<React.SetStateAction<QueryHistoryItem[]>>;

  // Navigation / Shell props
  setSelectedDayId: (id: number) => void;
  setActiveView: (view: ViewId) => void;
  learningRoadmap: RoadmapDay[];
  readiness: number;
  totalModules: number;
  totalProblems: number;
  rightOpen?: boolean;
  setRightOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const PlaygroundView = React.memo(function PlaygroundView({
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
  totalProblems,
  rightOpen: propRightOpen,
  setRightOpen: propSetRightOpen,
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

  const [internalRightOpen, setInternalRightOpen] = useState(true);
  const rightOpen =
    propRightOpen !== undefined ? propRightOpen : internalRightOpen;
  const setRightOpen = propSetRightOpen || setInternalRightOpen;
  const [activeLeftTab, setActiveLeftTab] = useState<
    "problem" | "schema" | "hints"
  >("problem");
  const [editorMaximized, setEditorMaximized] = useState(false);
  const [activeResultTab, setActiveResultTab] = useState<
    "your" | "expected" | "plan" | "venn" | "compare" | "diff"
  >("your");
  const [previewData, setPreviewData] = useState<{
    [table: string]: QueryResult | null;
  }>({});
  const [queryPlanSteps, setQueryPlanSteps] = useState<QueryPlanStep[]>([]);

  const [computedExpectedResult, setComputedExpectedResult] =
    useState<QueryResult | null>(expectedResult || null);
  useEffect(() => {
    (async () => {
      if (playgroundMode === "practice" && selectedProblem?.solution) {
        try {
          const res = await runQuery(selectedProblem.solution, true, false);
          setComputedExpectedResult(res);
        } catch {
          setComputedExpectedResult(null);
        }
      } else if (playgroundMode === "puzzle" && activePuzzle?.solutionQuery) {
        try {
          const res = await runQuery(activePuzzle?.solutionQuery, true, false);
          setComputedExpectedResult(res);
        } catch {
          setComputedExpectedResult(null);
        }
      } else {
        setComputedExpectedResult(expectedResult || null);
      }
    })();
  }, [
    playgroundMode,
    selectedProblem?.id,
    selectedProblem?.solution,
    activePuzzle?.id,
    activePuzzle?.solutionQuery,
    expectedResult,
  ]);
  const [resetStatus, setResetStatus] = useState(false);
  const resetTimeoutRef = useRef<any>(null);
  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

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

  // Keep a one-click way to recover from an overly wide context pane without
  // losing the user's preferred expanded width.
  const [expandedContextWidth, setExpandedContextWidth] = useState<
    number | null
  >(null);
  const toggleContextWidth = () => {
    if (playgroundSplit > 520) {
      setExpandedContextWidth(playgroundSplit);
      handlePlaygroundSplitResize(380);
      return;
    }

    const restoredWidth =
      expandedContextWidth ??
      Math.min(850, Math.max(520, Math.round(window.innerWidth * 0.42)));
    handlePlaygroundSplitResize(restoredWidth);
    setExpandedContextWidth(null);
  };

  const [freeWriteMode, setFreeWriteMode] = useState(false);
  const [focusMode, setFocusMode] = useState(true);
  const [compareModeOpen, setCompareModeOpen] = useState(false);
  const [queryB, setQueryB] = useState(() => {
    try {
      const saved = localStorage.getItem("sql-aa-query-history-b") || localStorage.getItem("sql-aa-query-b-v2");
      return saved ? JSON.parse(saved) : "SELECT * FROM customers LIMIT 5;";
    } catch {
      return "SELECT * FROM customers LIMIT 5;";
    }
  });
  const handleSetQueryB = (val: string) => {
    setQueryB(val);
    localStorage.setItem("sql-aa-query-history-b", JSON.stringify(val));
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

  const currentProblemIndex = useMemo(() => {
    if (!selectedProblem?.id || !allProblems?.length) return -1;
    return allProblems.findIndex((p) => p.id === selectedProblem.id);
  }, [selectedProblem?.id, allProblems]);

  const prevProblem =
    currentProblemIndex > 0 ? allProblems[currentProblemIndex - 1] : null;
  const nextProblem =
    currentProblemIndex !== -1 && currentProblemIndex < allProblems.length - 1
      ? allProblems[currentProblemIndex + 1]
      : null;
  const handleSetHistoryFavorites = (
    val: string[] | ((prev: string[]) => string[]),
  ) => {
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
  const [activeRightTab, setActiveRightTab] = useState<RightTab>("hints");
  const [erdModalOpen, setErdModalOpen] = useState(false);
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [showInlineRefSol, setShowInlineRefSol] = useState(false);
  const [visibleHints, setVisibleHints] = useState(1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setErdModalOpen(false);
        setLessonModalOpen(false);
      }
    };
    if (erdModalOpen || lessonModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [erdModalOpen, lessonModalOpen]);

  // Keyboard shortcut listener for SQL Formatting (Alt+Shift+F or Alt+F)
  useEffect(() => {
    const handleFormatHotkey = (e: KeyboardEvent) => {
      if (
        (e.altKey && e.shiftKey && e.key.toLowerCase() === "f") ||
        (e.altKey && e.key.toLowerCase() === "f")
      ) {
        e.preventDefault();
        const f = formatSql(queryRef.current);
        updateEditorQuery(f);
      }
    };
    window.addEventListener("keydown", handleFormatHotkey);
    return () => window.removeEventListener("keydown", handleFormatHotkey);
  }, [updateEditorQuery]);

  // Derived active module check
  const activeModule = useMemo(() => {
    if (!selectedProblem?.moduleId) return null;
    return roadmapModules.find((m) => m.id === selectedProblem.moduleId);
  }, [selectedProblem, roadmapModules]);

  // Reset states on problem/puzzle switch
  useEffect(() => {
    setSolutionRevealed(false);
    setShowInlineRefSol(false);
    setVisibleHints(1);
    setGraderFeedback(null);
    setQueryResult({ columns: [], rows: [], message: "" });
    if (playgroundMode === "puzzle") {
      setActiveRightTab("hints");
    }
  }, [
    selectedProblem?.id,
    activePuzzle?.id,
    playgroundMode,
    setGraderFeedback,
    setQueryResult,
  ]);

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
      const rel = table.relationships?.find((r: string) =>
        r.endsWith("." + c.name),
      )
        ? "FK"
        : "";
      const keyType = [isPk, rel].filter(Boolean).join(", ");
      md += `| ${c.name} | ${c.type} | ${keyType} |\n`;
    });
    navigator.clipboard.writeText(md);
    showToast(`Copied schema of "${table.name}" to clipboard!`, "success");
  };

  const profileColumn = async (tableName: string, columnName: string) => {
    try {
      const escapedTable = `[${tableName}]`;
      const escapedColumn = `[${columnName}]`;
      const countRes = await runQuery(
        `SELECT COUNT(*), COUNT(DISTINCT ${escapedColumn}), COUNT(*) - COUNT(${escapedColumn}) FROM ${escapedTable}`,
      );
      if (countRes.error || countRes.rows.length === 0) {
        showToast(
          "Failed to profile column: " + (countRes.error || "No data"),
          "error",
        );
        return;
      }

      const total = Number(countRes.rows[0][countRes.columns[0]]);
      const distinct = Number(countRes.rows[0][countRes.columns[1]]);
      const nulls = Number(countRes.rows[0][countRes.columns[2]]);

      const tableSchema = (
        liveSchema.length > 0 ? liveSchema : tableSchemas
      ).find((t) => t.name.toLowerCase() === tableName.toLowerCase());
      const colSchema = tableSchema?.columns.find(
        (c: any) => c.name.toLowerCase() === columnName.toLowerCase(),
      );
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
        const statsRes = await runQuery(
          `SELECT MIN(${escapedColumn}), MAX(${escapedColumn}), AVG(${escapedColumn}) FROM ${escapedTable}`,
        );
        if (!statsRes.error && statsRes.rows.length > 0) {
          min = statsRes.rows[0][statsRes.columns[0]];
          max = statsRes.rows[0][statsRes.columns[1]];
          avg = statsRes.rows[0][statsRes.columns[2]];
        }
      }

      const freqRes = await runQuery(
        `SELECT ${escapedColumn} AS val, COUNT(*) AS count FROM ${escapedTable} GROUP BY 1 ORDER BY 2 DESC LIMIT 5`,
      );
      const topValues = freqRes.error
        ? []
        : freqRes.rows.map((r: any) => ({
            val: r.val,
            count: Number(r.count),
          }));

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

  const dropCustomTable = async (tableName: string) => {
    showConfirm(
      `Are you sure you want to delete custom table "${tableName}"?`,
      async () => {
        try {
          await runQuery(`DROP TABLE IF EXISTS [${tableName}]`);
          setLiveSchema(await getLiveSchema());
          showToast(`Dropped table "${tableName}".`, "success");
        } catch (err: unknown) {
          showToast("Error dropping table: " + (err as Error).message, "error");
        }
      },
    );
  };

  const handleExportCsv = () => {
    if (!queryResult || queryResult.error || !queryResult.rows || queryResult.rows.length === 0) {
      showToast("No data to export", "error");
      return;
    }
    try {
      const header = queryResult.columns.join(",");
      const csvRows = queryResult.rows.map(row => 
        queryResult.columns.map(col => {
          const val = row[col];
          if (val === null || val === undefined) return "";
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        }).join(",")
      ).join("\n");
      const csvContent = header + "\n" + csvRows;
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `query_result_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Result exported to CSV successfully", "success");
    } catch (err) {
      showToast("Export failed", "error");
    }
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
      progress: JSON.parse(localStorage.getItem("sql-aa-progress") || "{}"),
      history: JSON.parse(localStorage.getItem("sql-aa-history") || "[]"),
      saved: JSON.parse(localStorage.getItem("sql-aa-saved") || "[]"),
      drafts: JSON.parse(localStorage.getItem("sql-aa-problem-drafts") || "{}"),
      puzzleDrafts: JSON.parse(
        localStorage.getItem("sql-aa-puzzle-drafts") || "{}",
      ),
      freeform: JSON.parse(
        localStorage.getItem("sql-aa-freeform-query") || "null",
      ),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
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
    reader.onload = async (event) => {
      try {
        const backup = JSON.parse(event.target?.result as string);
        if (backup.progress)
          localStorage.setItem(
            "sql-aa-progress",
            JSON.stringify(backup.progress),
          );
        if (backup.history)
          localStorage.setItem(
            "sql-aa-history",
            JSON.stringify(backup.history),
          );
        if (backup.saved)
          localStorage.setItem("sql-aa-saved", JSON.stringify(backup.saved));
        if (backup.drafts)
          localStorage.setItem(
            "sql-aa-problem-drafts",
            JSON.stringify(backup.drafts),
          );
        if (backup.puzzleDrafts)
          localStorage.setItem(
            "sql-aa-puzzle-drafts",
            JSON.stringify(backup.puzzleDrafts),
          );
        if (backup.freeform)
          localStorage.setItem(
            "sql-aa-freeform-query",
            JSON.stringify(backup.freeform),
          );

        showToast(
          "Progress and query drafts imported successfully! Reloading...",
          "success",
        );
        setTimeout(() => window.location.reload(), 1500);
      } catch (err: unknown) {
        showToast(
          "Invalid backup file format: " + (err as Error).message,
          "error",
        );
      }
    };
    reader.readAsText(file);
  };

  const exportResultAsCsv = (
    cols: string[],
    rows: any[],
    filename = "query-results.csv",
  ) => {
    if (!cols.length || !rows.length) return;
    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return "";
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

  const exportResultAsJson = (
    cols: string[],
    rows: any[],
    filename = "query-results.json",
  ) => {
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
    const blob = new Blob([jsonContent], {
      type: "application/json;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Exported query results as JSON!", "success");
  };

  const exportDatabaseSql = async () => {
    try {
      let sqlDump = `-- SQL Analyst Academy Database Schema & Data Export\n`;
      sqlDump += `-- Exported on ${new Date().toISOString()}\n\n`;

      const tablesRes = await runQuery(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
      );
      const tables = tablesRes.rows.map((r) => r.name as string);

      for (const t of tables) {
        const escapedTableName = t.replace(/'/g, "''");
        const ddlRes = await runQuery(
          `SELECT sql FROM sqlite_master WHERE type='table' AND name='${escapedTableName}'`,
        );
        const ddl = ddlRes.rows[0]?.sql;
        const bracketedTable = `[${t.replace(/\]/g, "]]")}]`;
        if (ddl) {
          sqlDump += `DROP TABLE IF EXISTS ${bracketedTable};\n`;
          sqlDump += `${ddl};\n\n`;
        }

        const rowsRes = await runQuery(`SELECT * FROM ${bracketedTable}`);
        for (const row of rowsRes.rows) {
          const cols = Object.keys(row);
          const vals = cols.map((c) => {
            const val = row[c];
            if (val === null) return "NULL";
            if (typeof val === "number") return val;
            return `'${String(val).replace(/'/g, "''")}'`;
          });
          sqlDump +=
            `INSERT INTO ${bracketedTable} ` +
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
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (text) {
        updateEditorQuery(text);
        showToast("SQL script loaded into editor!", "success");
      }
    };
    reader.readAsText(file);
  };

  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;
      try {
        const { tableName, sql } = buildCsvImportSql(file.name, text);
        const importRes = await runQuery(sql);
        if (importRes.error) {
          throw new Error(importRes.error);
        }
        setLiveSchema(await getLiveSchema());
        showToast(`Imported temporary table "${tableName}"!`, "success");
      } catch (err: unknown) {
        showToast(
          "Error parsing/loading CSV: " + (err as Error).message,
          "error",
        );
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
      "select",
      "from",
      "where",
      "group by",
      "order by",
      "having",
      "join",
      "left join",
      "right join",
      "inner join",
      "full join",
      "on",
      "limit",
      "and",
      "or",
      "not",
      "insert",
      "update",
      "delete",
      "create",
      "alter",
      "drop",
      "table",
      "into",
      "values",
      "set",
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
    const match = errorStr.match(
      /Msg (\d+), Level (\d+), State (\d+), Line (\d+)/,
    );
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
        const corrected = activeQuery.replace(
          new RegExp(`\\b${typoWord}\\b`, "gi"),
          suggestionWord,
        );
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
            MySQL Error — Code {msgCode}, Level {level}, State {state}
          </span>
        </div>

        <div
          style={{
            fontSize: "13px",
            color: "var(--text)",
            fontWeight: 500,
            marginBottom: "12px",
            lineHeight: "1.5",
          }}
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
              <span
                style={{ fontSize: "12px", color: "var(--text-secondary)" }}
              >
                {suggestion}
              </span>
            </div>
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
              if (
                currentLineNum < startLine + 1 ||
                currentLineNum > endLine + 1
              )
                return null;
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    background: isErrorLine
                      ? "rgba(239, 68, 68, 0.08)"
                      : "transparent",
                    margin: "0 -12px",
                    padding: "0 12px",
                    borderLeft: isErrorLine
                      ? "3px solid var(--rose)"
                      : "3px solid transparent",
                  }}
                >
                  <span
                    style={{
                      width: "24px",
                      color: "var(--muted)",
                      userSelect: "none",
                      display: "inline-block",
                    }}
                  >
                    {currentLineNum}
                  </span>
                  <span
                    style={{
                      color: isErrorLine
                        ? "var(--text)"
                        : "var(--text-secondary)",
                      flex: 1,
                      whiteSpace: "pre",
                    }}
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
  const copyTableSchemaMarkdownLocally = (table: any) =>
    copyTableSchemaMarkdown(table);
  const profileColumnLocally = (tableName: string, columnName: string) =>
    profileColumn(tableName, columnName);
  const dropCustomTableLocally = (tableName: string) =>
    dropCustomTable(tableName);

  // Auto-typing control helpers
  const startStopAutoTyping = () => {
    if (isAutoTyping) {
      stopAutoTyping();
    } else {
      if (playgroundMode === "puzzle") {
        autoTypeQuery(activePuzzle?.solutionQuery || "");
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
    if (playgroundMode === "puzzle" && activePuzzle) {
      const text =
        `${activePuzzle.title} ${activePuzzle.businessScenario} ${activePuzzle.flawedQuery} ${activePuzzle?.solutionQuery || ""}`.toLowerCase();
      const filtered = currentSchema.filter((t) =>
        new RegExp(`\\b${t.name}\\b`, "i").test(text),
      );
      return filtered.length > 0 ? filtered : currentSchema;
    }
    if (!selectedProblem.id) return currentSchema;
    const text =
      `${selectedProblem.prompt} ${selectedProblem.starterQuery} ${selectedProblem.solution || ""}`.toLowerCase();
    const filtered = currentSchema.filter((t) =>
      new RegExp(`\\b${t.name}\\b`, "i").test(text),
    );
    return filtered.length > 0 ? filtered : currentSchema;
  })();
  const { activeTables, otherTables, relevantDomains } = useMemo(() => {
    const isRel = (name: string) => {
      if (!selectedProblem.id) return true;
      return relevantTables.some((rt) => rt.name === name);
    };
    const active = currentSchema.filter((t) => isRel(t.name));
    const other = currentSchema.filter((t) => !isRel(t.name));
    const doms = Array.from(new Set(relevantTables.map((t) => t.domain)));
    return { activeTables: active, otherTables: other, relevantDomains: doms };
  }, [currentSchema, relevantTables, selectedProblem.id]);

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

  const handleNextItemAction = () => {
    if (playgroundMode === "puzzle") {
      const parentDay = learningRoadmap.find(
        (d) => d.day === activePuzzle?.dayId,
      );
      if (
        parentDay?.mockInterview?.company &&
        (progress.mockScores?.[parentDay.mockInterview.company] ?? 0) <= 0
      ) {
        setActiveView("mocks");
        return;
      }
      const nextDayNum = (parentDay?.day || 1) + 1;
      const nextDay = learningRoadmap.find((d) => d.day === nextDayNum);
      if (nextDay && nextDay.modules.length > 0) {
        const firstMod = roadmapModules.find(
          (m) => m.id === nextDay.modules[0],
        );
        if (firstMod && firstMod.problems.length > 0) {
          openInPlayground(firstMod.problems[0]);
        }
      }
      return;
    }

    const parentDay = learningRoadmap.find((d) =>
      d.modules.includes(selectedProblem.moduleId),
    );
    const dayModules = parentDay
      ? parentDay.modules
          .map((mId) => roadmapModules.find((m) => m.id === mId))
          .filter((m): m is RoadmapModule => m !== undefined)
      : [];
    const dayProblems = dayModules.flatMap((m) => m.problems);
    const curIdx = dayProblems.findIndex((p) => p.id === selectedProblem.id);

    if (curIdx !== -1 && curIdx < dayProblems.length - 1) {
      openInPlayground(dayProblems[curIdx + 1]);
      return;
    }

    const dayPuzzles = parentDay
      ? debugPuzzles.filter((pz) => pz.dayId === parentDay.day)
      : [];
    const unsolvedPuzzle =
      dayPuzzles.find(
        (pz) => !(progress.solvedPuzzles || []).includes(pz.id),
      ) || dayPuzzles[0];
    if (unsolvedPuzzle) {
      openPuzzleInPlayground(unsolvedPuzzle.id);
      return;
    }

    if (parentDay?.mockInterview?.company) {
      setActiveView("mocks");
      return;
    }

    const nextDayNum = (parentDay?.day || 1) + 1;
    const nextDay = learningRoadmap.find((d) => d.day === nextDayNum);
    if (nextDay && nextDay.modules.length > 0) {
      const firstMod = roadmapModules.find((m) => m.id === nextDay.modules[0]);
      if (firstMod && firstMod.problems.length > 0) {
        openInPlayground(firstMod.problems[0]);
      }
    }
  };

  // Helper check for table connections
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [hoveredTable, setHoveredTable] = useState<string | null>(null);

  const activeTable = selectedTable || hoveredTable;
  const liveTablesWithDefaults = currentSchema.map((t) => ({
    ...t,
    domain:
      (t as any).domain ||
      (t.name.toLowerCase().startsWith("temp")
        ? "Temporary Data"
        : "Custom Data"),
    description:
      (t as any).description ||
      (t.name.toLowerCase().startsWith("temp")
        ? "Temporary table generated during session execution."
        : "Permanent database table created by user query."),
    primaryKey:
      (t as any).primaryKey || (t.columns[0] ? t.columns[0].name : ""),
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

    const targetTableObj = liveTablesWithDefaults.find(
      (t) => t.name === tableName,
    );
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
  function getDialectNotes(
    moduleId: number,
  ): { title: string; notes: string } | null {
    switch (moduleId) {
      case 4:
        return {
          title: "MySQL LIMIT",
          notes:
            "MySQL uses LIMIT to restrict rows: SELECT col FROM tbl LIMIT 5;\n" +
            "For pagination, use LIMIT offset, row_count or LIMIT row_count OFFSET offset.",
        };
      case 19:
        return {
          title: "FULL OUTER JOIN Support",
          notes:
            "• MySQL does not support FULL OUTER JOIN natively. Simulate it using " +
            "LEFT JOIN + UNION + reverse LEFT JOIN (with IS NULL filter to exclude duplicates).",
        };
      case 25:
      case 26:
      case 27:
      case 28:
        return {
          title: "Window Functions Dialect Support",
          notes:
            "MySQL 8.0+ supports OVER (PARTITION BY ... ORDER BY ...). Older MySQL versions require " +
            "session variables or correlated subqueries.",
        };
      case 30:
        return {
          title: "Set Ops (INTERSECT & EXCEPT) Dialect Support",
          notes:
            "• MySQL 8.0.31+ supports INTERSECT and EXCEPT. For older versions, use these workarounds:\n" +
            "  EXCEPT → LEFT JOIN with IS NULL: SELECT a.id FROM tblA a " +
            "LEFT JOIN tblB b ON a.id = b.id WHERE b.id IS NULL\n" +
            "  INTERSECT → INNER JOIN on the key column.",
        };
      case 8:
        return {
          title: "Date Formatting & Range Filtering",
          notes:
            "Use MySQL DATE_FORMAT(order_date, '%Y-%m-%d') or DATE(order_date) for formatting.\n" +
            "Date comparison: order_date BETWEEN '2024-01-01' AND '2024-12-31'.",
        };
      case 6:
        return {
          title: "String Functions & Concatenation",
          notes:
            "• LIKE wildcards: % (any chars) and _ (single char) are standard across all dialects.\n" +
            "• Concatenation: CONCAT(first_name, ' ', last_name)\n" +
            "• Case sensitivity: LIKE is commonly case-insensitive under MySQL's default collations.",
        };
      case 31:
        return {
          title: "CASE WHEN Compatibility",
          notes:
            "• All Dialects: CASE WHEN syntax is fully standardized and portable across MySQL, " +
            "CASE WHEN is fully supported and portable in MySQL 8.0.\n" +
            "Use CASE WHEN inside SUM() for conditional aggregation.",
        };
      case 32:
        return {
          title: "Pivoting Syntax — Manual vs Native",
          notes:
            "• MySQL: Use conditional aggregation: " +
            "SUM(CASE WHEN channel='App' THEN amount ELSE 0 END).\n" +
            "Native PIVOT is not available in MySQL; conditional aggregation is the standard approach.",
        };
      default:
        return null;
    }
  }

  // Reset database state and clear local drafts
  const resetPlayground = async () => {
    resetDatabase();
    if (selectedProblem?.id && playgroundMode === "practice") {
      const p = allProblems.find((x) => x.id === selectedProblem.id);
      if (p) {
        const drafts = JSON.parse(
          localStorage.getItem("sql-aa-problem-drafts") || "{}",
        );
        delete drafts[selectedProblem.id];
        localStorage.setItem("sql-aa-problem-drafts", JSON.stringify(drafts));
        const saved = getSavedDraftQuery(p);
        updateEditorQuery(saved);
        setQueryResult(await runQuery(saved, true));
        setLiveSchema(await getLiveSchema());
        triggerResetStatus();
        return;
      }
    } else if (activePuzzle?.id && playgroundMode === "puzzle") {
      const p = debugPuzzles.find((x) => x.id === activePuzzle?.id);
      if (p) {
        const drafts = JSON.parse(
          localStorage.getItem("sql-aa-puzzle-drafts") || "{}",
        );
        delete drafts[activePuzzle?.id];
        localStorage.setItem("sql-aa-puzzle-drafts", JSON.stringify(drafts));
        const saved = getSavedPuzzleQuery(p);
        updateEditorQuery(saved);
        setQueryResult(await runQuery(saved, true));
        setLiveSchema(await getLiveSchema());
        triggerResetStatus();
        return;
      }
    }
    updateEditorQuery(defaultQuery);
    setQueryResult(await runQuery(defaultQuery));
    setLiveSchema(await getLiveSchema());
    setPreviewData({});
    triggerResetStatus();
  };

  // Schema Table preview toggler
  const togglePreviewData = async (table: string) => {
    if (previewData[table]) {
      setPreviewData((prev) => {
        const next = { ...prev };
        delete next[table];
        return next;
      });
    } else {
      const res = await runQuery(`SELECT * FROM ${table} LIMIT 5`);
      setPreviewData((prev) => ({ ...prev, [table]: res }));
    }
  };

  // A/B Benchmark executor
  const runABBenchmark = async () => {
    let sqlA = queryRef.current;
    let sqlB = queryB;

    if (
      rowLimit !== "Unlimited" &&
      /^\s*SELECT\b/i.test(sqlA) &&
      !/\bLIMIT\b/i.test(sqlA)
    ) {
      sqlA = `${sqlA.trim().replace(/;+$/, "")} LIMIT ${rowLimit};`;
    }
    if (
      rowLimit !== "Unlimited" &&
      /^\s*SELECT\b/i.test(sqlB) &&
      !/\bLIMIT\b/i.test(sqlB)
    ) {
      sqlB = `${sqlB.trim().replace(/;+$/, "")} LIMIT ${rowLimit};`;
    }

    const planStepsA = await getQueryPlan(sqlA);
    const planStepsB = await getQueryPlan(sqlB);
    setQueryPlanSteps(planStepsA);
    setPlanB(planStepsB);

    resetDatabase();
    const resultA = await runQuery(sqlA, true, false);
    if (!resultA.error) {
      const runsA: number[] = [resultA.durationMs || 0];
      for (let i = 0; i < 4; i++) {
        resetDatabase();
        const r = await runQuery(sqlA, true, false);
        runsA.push(r.durationMs || 0);
      }
      runsA.sort((a, b) => a - b);
      resultA.durationMs = (runsA[1] + runsA[2] + runsA[3]) / 3;
    }
    setQueryResult(resultA);

    resetDatabase();
    const resultB = await runQuery(sqlB, true, false);
    if (!resultB.error) {
      const runsB: number[] = [resultB.durationMs || 0];
      for (let i = 0; i < 4; i++) {
        resetDatabase();
        const r = await runQuery(sqlB, true, false);
        runsB.push(r.durationMs || 0);
      }
      runsB.sort((a, b) => a - b);
      resultB.durationMs = (runsB[1] + runsB[2] + runsB[3]) / 3;
    }
    setResB(resultB);

    setBenchmarkRunCount((c) => c + 1);
  };
  const tabs: { id: RightTab; icon: LucideIcon; label: string }[] = [
    { id: "hints", icon: BookOpen, label: "Problem Specs" },
    { id: "schema", icon: Database, label: "Schema Explorer" },
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
      style={{
        width: "100%",
        height: "100%",
        minWidth: 0,
        borderRight: showSplit ? "none" : undefined,
      }}
    >
      <div className="pg-toolbar">
        <div className="pg-toolbar-left">
          <Code2 size={16} style={{ color: "var(--cyan)" }} />
          <strong style={{ fontSize: "14px", fontWeight: 700 }}>
            SQL Playground
          </strong>
          {playgroundMode === "practice" && selectedProblem?.id && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                marginLeft: "10px",
              }}
            >
              <button
                className="secondary-button compact"
                disabled={!prevProblem}
                onClick={() => prevProblem && openInPlayground(prevProblem)}
                title={
                  prevProblem
                    ? `Previous: ${prevProblem.title}`
                    : "First problem"
                }
                style={{
                  padding: "3px 10px",
                  fontSize: "11.5px",
                  borderRadius: "6px",
                  opacity: prevProblem ? 1 : 0.4,
                  cursor: prevProblem ? "pointer" : "not-allowed",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                &larr; Prev
              </button>
              <button
                className="primary-button compact"
                onClick={handleNextItemAction}
                title="Next item in Day learning sequence"
                style={{
                  padding: "3px 12px",
                  fontSize: "11.5px",
                  borderRadius: "6px",
                  background: "var(--cyan)",
                  color: "#000",
                  fontWeight: "bold",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                Next &rarr;
              </button>
            </div>
          )}
          {selectedProblem?.id &&
            (() => {
              const parentDay = learningRoadmap.find((d) =>
                d.modules.includes(selectedProblem.moduleId),
              );
              return parentDay ? (
                <button
                  className="secondary-button compact"
                  style={{
                    marginLeft: "8px",
                    fontSize: "11px",
                    padding: "2px 8px",
                    background: "rgba(56,217,255,0.1)",
                    border: "1px solid rgba(56,217,255,0.2)",
                    color: "var(--cyan)",
                  }}
                  onClick={() => {
                    setSelectedDayId(parentDay?.day);
                    setActiveView("day-details");
                  }}
                >
                  &larr; Day {parentDay?.day}
                </button>
              ) : null;
            })()}

          {resetStatus && (
            <span className="reset-toast">
              <CheckCircle2 size={10} /> Reset!
            </span>
          )}
        </div>
        <div
          className="pg-toolbar-right"
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <button
            className="format-btn"
            title="Format SQL Query (Alt + Shift + F)"
            onClick={() => {
              const f = formatSql(queryRef.current);
              updateEditorQuery(f);
            }}
            aria-label="Format SQL Query"
          >
            <Sparkles size={14} style={{ color: "var(--cyan)" }} />
            <span>Format</span>
          </button>
          <div style={{ position: "relative", display: "inline-flex" }}>
            <button
              className={`icon-button ${settingsOpen ? "active" : ""}`}
              title="Editor & System Settings"
              onClick={() => setSettingsOpen(!settingsOpen)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
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
                  boxShadow:
                    "0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)",
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
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--muted)",
                    }}
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
                    <option value="'JetBrains Mono', Consolas, monospace">
                      JetBrains Mono
                    </option>
                    <option value="'Fira Code', Monaco, monospace">
                      Fira Code
                    </option>
                    <option value="'Source Code Pro', Courier, monospace">
                      Source Code Pro
                    </option>
                    <option value="'Courier New', monospace">
                      Courier New
                    </option>
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
                  <span style={{ color: "var(--muted)" }}>
                    Tab Indentation:
                  </span>
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
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <button
                      onClick={() =>
                        setEditorFontSize((s) => Math.max(10, s - 1))
                      }
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
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "bold",
                        width: "32px",
                        textAlign: "center",
                      }}
                    >
                      {editorFontSize}px
                    </span>
                    <button
                      onClick={() =>
                        setEditorFontSize((s) => Math.min(24, s + 1))
                      }
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

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
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
                    <span title="Forces strict order matching of columns in query grader">
                      Strict Grader mode
                    </span>
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
                  Format Keywords:{" "}
                  {sqlUpperKeywords ? "UPPERCASE" : "lowercase"}
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

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "6px",
                    }}
                  >
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
                      <input
                        type="file"
                        accept=".sql"
                        onChange={importSqlScript}
                        style={{ display: "none" }}
                      />
                    </label>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "6px",
                    }}
                  >
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
                      <input
                        type="file"
                        accept=".json"
                        onChange={importProgress}
                        style={{ display: "none" }}
                      />
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
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCsvImport}
                      style={{ display: "none" }}
                    />
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
          <button
            className="primary-button run-btn"
            onClick={runCurrentQuery}
            title="Run Query (Alt+X or Ctrl+Enter)"
          >
            <Play size={15} /> Run{" "}
            <kbd style={{ marginLeft: "4px", fontSize: "10px" }}>Alt+X</kbd>
          </button>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
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
                    <span
                      style={{
                        fontSize: "9.5px",
                        color: "var(--muted)",
                        fontWeight: "normal",
                      }}
                    >
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
                        } else if (
                          playgroundMode === "puzzle" &&
                          activePuzzle
                        ) {
                          sol = activePuzzle?.solutionQuery;
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
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "var(--cyan)",
                        }}
                      ></span>
                      <span>Auto-typing... (Click to Skip)</span>
                    </div>
                  )}
                  <ErrorBoundary fallbackTitle="SQL Editor A Panel">
                    <Editor
                      height="100%"
                      defaultLanguage="sql"
                      loading={
                        <div className="pg-editor-loading" role="status">
                          <span className="pg-editor-loading-dot" />
                          Initializing SQL editor…
                        </div>
                      }
                      theme={
                        theme === "oled"
                          ? "hc-oled"
                          : theme === "light"
                            ? "vs"
                            : editorTheme || "vs-dark"
                      }
                      value={query}
                      beforeMount={handleBeforeMount}
                      onMount={handleMount}
                      onChange={handleEditorChange}
                      options={{
                        minimap: { enabled: editorMinimap },
                        fontSize: editorFontSize,
                        fontFamily: editorFontFamily,
                        tabSize: editorTabSize || 4,
                        insertSpaces: true,
                        detectIndentation: false,
                        useTabStops: true,
                        lineHeight: 28,
                        padding: { top: 12, bottom: 12 },
                        scrollBeyondLastLine: false,
                        wordWrap: editorWordWrap ? "on" : "off",
                        bracketPairColorization: { enabled: true },
                        autoClosingBrackets: "always",
                        autoClosingQuotes: "always",
                        tabCompletion: "on",
                        acceptSuggestionOnEnter: "smart",
                        acceptSuggestionOnCommitCharacter: true,
                        quickSuggestions: {
                          other: true,
                          comments: false,
                          strings: false,
                        },
                        quickSuggestionsDelay: 50,
                        suggest: {
                          filterGraceful: true,
                          localityBonus: true,
                          shareSuggestSelections: true,
                          snippetsPreventQuickSuggestions: false,
                        },
                        automaticLayout: true,
                        renderLineHighlight: "line",
                        smoothScrolling: false,
                        cursorSmoothCaretAnimation: "off",
                        cursorBlinking: "blink",
                        fastScrollSensitivity: 7,
                        renderValidationDecorations: "off",
                        selectionHighlight: false,
                        occurrencesHighlight: "off",
                        glyphMargin: false,
                        lineNumbersMinChars: 3,
                        lineDecorationsWidth: 4,
                        selectOnLineNumbers: false,
                        folding: false,
                      }}
                    />
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
                      <Editor
                        height="100%"
                        defaultLanguage="sql"
                        loading={
                          <div className="pg-editor-loading" role="status">
                            <span className="pg-editor-loading-dot" />
                            Initializing comparison editor…
                          </div>
                        }
                        theme={
                          editorTheme === "vs-dark" && theme === "oled"
                            ? "hc-oled"
                            : editorTheme
                        }
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
                          tabCompletion: "on",
                          acceptSuggestionOnEnter: "smart",
                          acceptSuggestionOnCommitCharacter: true,
                          lineNumbersMinChars: 4,
                          lineDecorationsWidth: 8,
                          renderLineHighlight: "gutter",
                        }}
                      />
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
                      style={{
                        flex: 1,
                        background: "var(--violet)",
                        borderColor: "var(--violet)",
                        fontSize: "11px",
                      }}
                    >
                      <Zap size={11} style={{ marginRight: "4px" }} /> Run A/B
                      Benchmark
                    </button>
                  </div>
                </div>
              )}
            </div>
          }
          bottom={
            <div
              className="pg-result"
              style={{
                flex: 1,
                height: "100%",
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
              }}
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
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <button
                    className={`result-tab ${activeResultTab === "your" ? "active" : ""}`}
                    onClick={() => setActiveResultTab("your")}
                  >
                    <Database size={12} style={{ marginRight: "6px" }} /> Your
                    Result
                  </button>
                  <button
                    className={`result-tab ${activeResultTab === "expected" ? "active" : ""}`}
                    onClick={() => setActiveResultTab("expected")}
                  >
                    <Eye size={12} style={{ marginRight: "6px" }} /> Expected Output
                  </button>
                  <button
                    className={`result-tab ${activeResultTab === "walkthrough" ? "active" : ""}`}
                    onClick={() => setActiveResultTab("walkthrough")}
                  >
                    <GitBranch size={12} style={{ marginRight: "6px", color: "var(--cyan)" }} /> Execution Walkthrough
                  </button>
                  {compareModeOpen && (
                    <button
                      className={`result-tab ${activeResultTab === "compare" ? "active" : ""}`}
                      onClick={() => setActiveResultTab("compare")}
                    >
                      <TrendingUp size={12} style={{ marginRight: "6px", color: "var(--amber)" }} /> Performance Compare
                    </button>
                  )}
                  {queryResult.durationMs !== undefined &&
                    !queryResult.error && (
                      <span
                        style={{
                          fontSize: "11px",
                          color: "var(--muted)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          marginLeft: "6px",
                        }}
                      >
                        <span
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background:
                              queryResult.durationMs > 100
                                ? "var(--amber)"
                                : "var(--emerald)",
                            display: "inline-block",
                          }}
                        />
                        <span>{queryResult.durationMs.toFixed(2)} ms</span>
                      </span>
                    )}
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {!queryResult.error && queryResult.rows && queryResult.rows.length > 0 && (
                    <button
                      className="secondary-button"
                      style={{ fontSize: "11px", padding: "4px 8px" }}
                      onClick={handleExportCsv}
                      title="Export Results as CSV"
                    >
                      <Download size={12} style={{ marginRight: "4px" }} /> Export CSV
                    </button>
                  )}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  minHeight: 0,
                  overflowY: "auto",
                }}
              >
                {graderFeedback && (
                  <div style={{ padding: "12px 12px 0 12px" }}>
                    <div
                      className={`grader-feedback-alert ${graderFeedback.isCorrect ? "success" : "error"}`}
                    >
                      <div className="grader-feedback-title">
                        {graderFeedback.isCorrect
                          ? "✓ Correct!"
                          : "❌ Incorrect"}
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: "normal",
                            color: "var(--text-secondary)",
                          }}
                        >
                          - {graderFeedback.message}
                        </span>
                      </div>
                      {graderFeedback.details && (
                        <div
                          style={{
                            fontSize: "11.5px",
                            opacity: 0.85,
                            marginTop: "2px",
                          }}
                        >
                          {graderFeedback.details}
                        </div>
                      )}
                      {graderFeedback.warning && (
                        <div className="grader-feedback-warning">
                          ⚠️ {graderFeedback.warning}
                        </div>
                      )}
                      {!graderFeedback.isCorrect &&
                        selectedProblem &&
                        selectedProblem.solution &&
                        (() => {
                          const attempts = JSON.parse(
                            localStorage.getItem("sql-aa-failed-attempts") ||
                              "{}",
                          );
                          const failedCount = attempts[selectedProblem.id] || 0;
                          if (failedCount >= 3) {
                            return (
                              <div
                                style={{
                                  marginTop: "8px",
                                  paddingTop: "8px",
                                  borderTop: "1px solid rgba(255,255,255,0.1)",
                                }}
                              >
                                <button
                                  className="icon-button labeled"
                                  style={{
                                    background: "rgba(56, 217, 255, 0.1)",
                                    color: "var(--cyan)",
                                    border: "1px solid rgba(56, 217, 255, 0.2)",
                                    width: "100%",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                  }}
                                  onClick={() =>
                                    setShowInlineRefSol((prev) => !prev)
                                  }
                                >
                                  <Code2 size={13} />{" "}
                                  {showInlineRefSol
                                    ? "Hide Reference Solution"
                                    : "Compare with Reference Solution (3+ attempts)"}
                                </button>
                                {showInlineRefSol && (
                                  <div
                                    style={{
                                      marginTop: "8px",
                                      background: "#0a0e14",
                                      padding: "10px",
                                      borderRadius: "6px",
                                      border: "1px solid #1f2630",
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
                                      <span
                                        style={{
                                          fontSize: "11px",
                                          fontWeight: 700,
                                          color: "var(--muted)",
                                        }}
                                      >
                                        Reference Solution SQL
                                      </span>
                                      <button
                                        className="icon-button labeled"
                                        style={{
                                          fontSize: "11px",
                                          padding: "2px 8px",
                                        }}
                                        onClick={() =>
                                          updateEditorQuery(
                                            formatSql(selectedProblem.solution),
                                          )
                                        }
                                      >
                                        <Play size={11} /> Load into Editor
                                      </button>
                                    </div>
                                    <pre
                                      className="sql-pre small"
                                      style={{ margin: 0 }}
                                    >
                                      {selectedProblem.solution}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            );
                          }
                          return null;
                        })()}
                    </div>
                  </div>
                )}
                {/* AI SQL Diagnostic Coach */}
                {(graderFeedback || queryResult?.error) && (
                  <div style={{ padding: "0 12px" }}>
                    <SqlDiagnosticCoach
                      queryResult={queryResult}
                      expectedResult={computedExpectedResult}
                      isCorrect={graderFeedback?.isCorrect ?? null}
                      feedback={graderFeedback}
                      query={query}
                      onApplyFix={(sql) => updateEditorQuery(sql)}
                    />
                  </div>
                )}

                

                <div
                  className="results-container"
                  style={{
                    display: "flex",
                    gap: "16px",
                    flex: 1,
                    minHeight: 0,
                    height: "100%",
                    overflow: "hidden",
                    padding: "12px",
                  }}
                >
                                    {activeResultTab === "diff" && expectedResult ? (
                    <SqlResultDiffViewer userResult={queryResult} expectedResult={expectedResult} />

                  ) : activeResultTab === "walkthrough" ? (
                    <div style={{ flex: 1, height: "100%", overflowY: "auto", padding: "12px", width: "100%" }}>
                      {queryResult && !queryResult.error && queryResult.rows.length > 0 ? (
                        <QueryExecutionStudio
                          queryResult={queryResult}
                          query={query}
                        />
                      ) : (
                        <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted)", background: "var(--panel)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                          <GitBranch size={32} style={{ color: "var(--cyan)", marginBottom: "12px" }} />
                          <p style={{ margin: 0, fontSize: "13px" }}>Run a successful SQL query to step through the logical execution pipeline.</p>
                        </div>
                      )}
                    </div>
                  ) : activeResultTab === "compare" ? (
                    <div style={{ flex: 1, height: "100%", overflow: "auto", padding: "12px", background: "var(--panel)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                      {resB ? (
                        <SqlPerformanceComparer
                          queryA={query}
                          queryB={queryB}
                          resA={queryResult}
                          resB={resB}
                          planA={queryPlanSteps}
                          planB={planB}
                        />
                      ) : (
                        <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted)" }}>
                          <TrendingUp size={32} style={{ color: "var(--amber)", marginBottom: "12px" }} />
                          <p style={{ margin: 0, fontSize: "13px" }}>Click "Run A/B Benchmark" in the toolbar above to compare Query A vs Query B performance.</p>
                        </div>
                      )}
                    </div>
                  ) : activeResultTab === "expected" ? (
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
                          fontWeight: 600,
                        }}
                      >
                        <span style={{ color: "var(--cyan)" }}>
                          EXPECTED OUTPUT
                        </span>
                      </div>
                      <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
                        {expectedResult ? (
                          <ResultTablePanel result={expectedResult} />
                        ) : (
                          <div
                            style={{
                              padding: "20px",
                              color: "var(--muted)",
                              fontSize: "12px",
                            }}
                          >
                            Run query or click to generate expected target
                            output.
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
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
                        <span
                          className={
                            queryResult.error
                              ? "status-dot error"
                              : "status-dot ok"
                          }
                        />
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 400,
                            color: "var(--muted)",
                            marginRight: "auto",
                          }}
                        >
                          ({queryResult.message})
                        </span>
                        {!queryResult.error &&
                          queryResult.rows &&
                          queryResult.rows.length > 0 && (
                            <div
                              style={{
                                display: "flex",
                                gap: "6px",
                                alignItems: "center",
                              }}
                            >
                              <button
                                onClick={() =>
                                  exportResultAsCsv(
                                    queryResult.columns,
                                    queryResult.rows,
                                  )
                                }
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
                                onClick={() =>
                                  exportResultAsJson(
                                    queryResult.columns,
                                    queryResult.rows,
                                  )
                                }
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
                          height: "100%",
                          overflow: "auto",
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
                                    .slice(
                                      resultPage * RESULT_PAGE_SIZE,
                                      (resultPage + 1) * RESULT_PAGE_SIZE,
                                    )
                                    .map((row, i) => (
                                      <tr key={i}>
                                        {queryResult.columns.map((c) => (
                                          <td key={c}>
                                            {String(row[c] ?? "NULL")}
                                          </td>
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
                                  {Math.min(
                                    queryResult.rows.length,
                                    (resultPage + 1) * RESULT_PAGE_SIZE,
                                  )}{" "}
                                  of {queryResult.rows.length} rows
                                </span>
                                <div style={{ display: "flex", gap: "6px" }}>
                                  <button
                                    disabled={resultPage === 0}
                                    onClick={() =>
                                      setResultPage((p) => Math.max(0, p - 1))
                                    }
                                    className="secondary-button compact"
                                    style={{
                                      padding: "2px 6px",
                                      fontSize: "10px",
                                    }}
                                  >
                                    Prev
                                  </button>
                                  <button
                                    disabled={
                                      resultPage >=
                                      Math.ceil(
                                        queryResult.rows.length /
                                          RESULT_PAGE_SIZE,
                                      ) -
                                        1
                                    }
                                    onClick={() =>
                                      setResultPage((p) =>
                                        Math.min(
                                          Math.ceil(
                                            queryResult.rows.length /
                                              RESULT_PAGE_SIZE,
                                          ) - 1,
                                          p + 1,
                                        ),
                                      )
                                    }
                                    className="secondary-button compact"
                                    style={{
                                      padding: "2px 6px",
                                      fontSize: "10px",
                                    }}
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
                  )}
                </div>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );

  const rightContent = (
    <div
      className="pg-right-col"
      style={{ width: "100%", height: "100%", minWidth: 0 }}
    >
      <div className="right-panel-header">
        <strong>Context</strong>
        <div
          className="right-tabs"
          role="tablist"
          aria-label="Context Panel Tabs"
          onKeyDown={handleRightNavKeyDown}
        >
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
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <button
            className="icon-button"
            onClick={toggleContextWidth}
            title={
              playgroundSplit > 520
                ? "Make context panel narrower"
                : "Restore context panel width"
            }
            aria-label={
              playgroundSplit > 520
                ? "Make context panel narrower"
                : "Restore context panel width"
            }
          >
            {playgroundSplit > 520 ? (
              <Minimize2 size={15} />
            ) : (
              <Maximize2 size={15} />
            )}
          </button>
          <button
            className="icon-button"
            onClick={() => setRightOpen(false)}
            title="Close context panel"
            aria-label="Close context panel"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      <div className="right-panel-body">
        {activeRightTab === "schema" && (
          <div className="schema-stack">
            <div
              style={{
                padding: "2px 0 10px 0",
                borderBottom: "1px solid var(--border)",
                marginBottom: "12px",
              }}
            >
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
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <Database size={16} style={{ color: "var(--cyan)" }} />
                <div style={{ textAlign: "left" }}>
                  <strong style={{ fontSize: "12.5px", color: "var(--text)" }}>
                    Interactive ERD Explorer
                  </strong>
                  <span
                    style={{
                      display: "block",
                      fontSize: "10px",
                      color: "var(--muted)",
                      marginTop: "1px",
                    }}
                  >
                    Visualize joins & key mappings
                  </span>
                </div>
              </div>
              <ChevronRight size={14} style={{ color: "var(--cyan)" }} />
            </div>
            {(() => {
              const s = schemaSearch.toLowerCase().trim();
              const filteredActive = activeTables.filter(
                (t) =>
                  t.name.toLowerCase().includes(s) ||
                  t.columns.some((c: any) => c.name.toLowerCase().includes(s)),
              );
              const filteredOther = otherTables.filter(
                (t) =>
                  t.name.toLowerCase().includes(s) ||
                  t.columns.some((c: any) => c.name.toLowerCase().includes(s)),
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
                            background:
                              selectedTable === t.name
                                ? "rgba(56, 217, 255, 0.04)"
                                : "transparent",
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
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <strong
                                  className="schema-insertable-item"
                                  style={{
                                    color: "var(--cyan)",
                                    cursor: "pointer",
                                  }}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    insertTextAtCursor(t.name);
                                  }}
                                  title="Click to insert table name"
                                >
                                  {t.name}
                                </strong>
                                <small
                                  style={{
                                    marginLeft: "8px",
                                    color: "var(--muted)",
                                    fontSize: "10px",
                                  }}
                                >
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
                          <p
                            style={{
                              fontSize: "12px",
                              color: "var(--text-secondary)",
                              margin: "4px 0 8px 0",
                            }}
                          >
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
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                  }}
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
                                        border:
                                          "1px solid rgba(251, 191, 36, 0.25)",
                                        fontWeight: 700,
                                        letterSpacing: "0.02em",
                                      }}
                                    >
                                      PK
                                    </span>
                                  )}
                                  {c.name.endsWith("_id") &&
                                    t.primaryKey !== c.name && (
                                      <span
                                        style={{
                                          fontSize: "8px",
                                          padding: "1px 3px",
                                          borderRadius: "3px",
                                          background: "rgba(56, 217, 255, 0.1)",
                                          color: "var(--cyan)",
                                          border:
                                            "1px solid rgba(56, 217, 255, 0.25)",
                                          fontWeight: 700,
                                          letterSpacing: "0.02em",
                                        }}
                                      >
                                        FK
                                      </span>
                                    )}
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                  }}
                                >
                                  <span
                                    style={{
                                      color: "var(--muted)",
                                      fontSize: "10px",
                                    }}
                                  >
                                    {c.type}
                                  </span>
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
                          <div
                            style={{
                              marginTop: "8px",
                              marginBottom: "4px",
                              display: "flex",
                              gap: "6px",
                            }}
                          >
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
                              <Eye size={10} />{" "}
                              {previewData[t.name]
                                ? "Hide Preview"
                                : "Preview Data"}
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
                                updateEditorQuery(
                                  `SELECT * FROM ${t.name} LIMIT 10;`,
                                );
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
                                <pre
                                  style={{
                                    margin: 0,
                                    padding: "4px",
                                    fontSize: "9px",
                                    color: "var(--rose)",
                                  }}
                                >
                                  {previewData[t.name]!.error}
                                </pre>
                              ) : (
                                <table
                                  style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    fontSize: "9px",
                                  }}
                                >
                                  <thead>
                                    <tr
                                      style={{
                                        borderBottom: "1px solid var(--border)",
                                        background: "rgba(255,255,255,0.02)",
                                      }}
                                    >
                                      {previewData[t.name]!.columns.map(
                                        (col) => (
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
                                        ),
                                      )}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {previewData[t.name]!.rows.map(
                                      (row, idx) => (
                                        <tr
                                          key={idx}
                                          style={{
                                            borderBottom:
                                              idx ===
                                              previewData[t.name]!.rows.length -
                                                1
                                                ? "none"
                                                : "1px solid rgba(255,255,255,0.03)",
                                          }}
                                        >
                                          {previewData[t.name]!.columns.map(
                                            (col) => {
                                              const rawVal = row[col];
                                              const strVal =
                                                rawVal === null ||
                                                rawVal === undefined
                                                  ? "NULL"
                                                  : String(rawVal);
                                              const isLong = strVal.length > 25;
                                              return (
                                                <td
                                                  key={col}
                                                  style={{
                                                    padding: "3px 6px",
                                                    color:
                                                      "var(--text-secondary)",
                                                    whiteSpace: "nowrap",
                                                    maxWidth: "180px",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                  }}
                                                  title={strVal}
                                                >
                                                  {isLong
                                                    ? `${strVal.slice(0, 24)}…`
                                                    : strVal}
                                                </td>
                                              );
                                            },
                                          )}
                                        </tr>
                                      ),
                                    )}
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
                            background:
                              selectedTable === t.name
                                ? "rgba(56, 217, 255, 0.04)"
                                : "transparent",
                            borderLeft:
                              selectedTable === t.name
                                ? "3px solid var(--cyan)"
                                : "none",
                            paddingLeft:
                              selectedTable === t.name ? "8px" : "0px",
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
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <strong
                                  className="schema-insertable-item"
                                  style={{
                                    color: "var(--text)",
                                    cursor: "pointer",
                                  }}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    insertTextAtCursor(t.name);
                                  }}
                                  title="Click to insert table name"
                                >
                                  {t.name}
                                </strong>
                                <small
                                  style={{
                                    marginLeft: "8px",
                                    color: "var(--muted)",
                                    fontSize: "10px",
                                  }}
                                >
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
                          <p
                            style={{
                              fontSize: "12px",
                              color: "var(--text-secondary)",
                              margin: "4px 0 8px 0",
                            }}
                          >
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
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                  }}
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
                                        border:
                                          "1px solid rgba(251, 191, 36, 0.25)",
                                        fontWeight: 700,
                                        letterSpacing: "0.02em",
                                      }}
                                    >
                                      PK
                                    </span>
                                  )}
                                  {c.name.endsWith("_id") &&
                                    t.primaryKey !== c.name && (
                                      <span
                                        style={{
                                          fontSize: "8px",
                                          padding: "1px 3px",
                                          borderRadius: "3px",
                                          background: "rgba(56, 217, 255, 0.1)",
                                          color: "var(--cyan)",
                                          border:
                                            "1px solid rgba(56, 217, 255, 0.25)",
                                          fontWeight: 700,
                                          letterSpacing: "0.02em",
                                        }}
                                      >
                                        FK
                                      </span>
                                    )}
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                  }}
                                >
                                  <span
                                    style={{
                                      color: "var(--muted)",
                                      fontSize: "10px",
                                    }}
                                  >
                                    {c.type}
                                  </span>
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
                          <div
                            style={{
                              marginTop: "8px",
                              marginBottom: "4px",
                              display: "flex",
                              gap: "6px",
                            }}
                          >
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
                              <Eye size={10} />{" "}
                              {previewData[t.name]
                                ? "Hide Preview"
                                : "Preview Data"}
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
                                updateEditorQuery(
                                  `SELECT * FROM ${t.name} LIMIT 10;`,
                                );
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
                                <pre
                                  style={{
                                    margin: 0,
                                    padding: "4px",
                                    fontSize: "9px",
                                    color: "var(--rose)",
                                  }}
                                >
                                  {previewData[t.name]!.error}
                                </pre>
                              ) : (
                                <table
                                  style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    fontSize: "9px",
                                  }}
                                >
                                  <thead>
                                    <tr
                                      style={{
                                        borderBottom: "1px solid var(--border)",
                                        background: "rgba(255,255,255,0.02)",
                                      }}
                                    >
                                      {previewData[t.name]!.columns.map(
                                        (col) => (
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
                                        ),
                                      )}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {previewData[t.name]!.rows.map(
                                      (row, idx) => (
                                        <tr
                                          key={idx}
                                          style={{
                                            borderBottom:
                                              idx ===
                                              previewData[t.name]!.rows.length -
                                                1
                                                ? "none"
                                                : "1px solid rgba(255,255,255,0.03)",
                                          }}
                                        >
                                          {previewData[t.name]!.columns.map(
                                            (col) => {
                                              const rawVal = row[col];
                                              const strVal =
                                                rawVal === null ||
                                                rawVal === undefined
                                                  ? "NULL"
                                                  : String(rawVal);
                                              const isLong = strVal.length > 25;
                                              return (
                                                <td
                                                  key={col}
                                                  style={{
                                                    padding: "3px 6px",
                                                    color:
                                                      "var(--text-secondary)",
                                                    whiteSpace: "nowrap",
                                                    maxWidth: "180px",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                  }}
                                                  title={strVal}
                                                >
                                                  {isLong
                                                    ? `${strVal.slice(0, 24)}…`
                                                    : strVal}
                                                </td>
                                              );
                                            },
                                          )}
                                        </tr>
                                      ),
                                    )}
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
                <p className="context-lead">
                  Debug Puzzle: {activePuzzle.title}
                </p>
                <div className="hint-scenario">
                  {activePuzzle.businessScenario}
                </div>
                <div className="hint-prompt-box">
                  <strong>Task</strong>
                  <p>Debug the flawed query to return the correct result.</p>
                </div>
                <div className="hint-card">
                  <Lightbulb size={13} /> {activePuzzle.hint}
                </div>

                {/* TARGET TABLES & SCHEMA CARD */}
                {relevantTables.length > 0 && (
                  <div
                    style={{
                      background: "rgba(56, 217, 255, 0.04)",
                      border: "1px solid rgba(56, 217, 255, 0.2)",
                      borderRadius: "8px",
                      padding: "10px 12px",
                      margin: "12px 0",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "var(--cyan)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: "6px",
                      }}
                    >
                      <Database size={13} /> Target Table
                      {relevantTables.length > 1 ? "s" : ""}:
                    </div>
                    {relevantTables.map((t) => (
                      <div key={t.name} style={{ marginBottom: "6px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "12px",
                            fontWeight: "bold",
                            color: "var(--text)",
                          }}
                        >
                          Table:{" "}
                          <code
                            style={{
                              background: "rgba(56, 217, 255, 0.15)",
                              color: "var(--cyan)",
                              padding: "1px 6px",
                              borderRadius: "4px",
                            }}
                          >
                            {t.name}
                          </code>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "4px",
                            marginTop: "4px",
                          }}
                        >
                          {t.columns.map((col: any) => (
                            <span
                              key={col.name}
                              style={{
                                fontSize: "10.5px",
                                fontFamily: "var(--font-mono, monospace)",
                                background: "var(--bg)",
                                color: "var(--text-muted)",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                border: "1px solid var(--border)",
                              }}
                            >
                              {col.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {computedExpectedResult &&
                  !computedExpectedResult.error &&
                  computedExpectedResult.columns.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        margin: "14px 0",
                      }}
                    >
                      <strong
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "var(--emerald)",
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <CheckCircle2 size={13} /> Expected Output Table
                      </strong>
                      <div
                        className="table-wrap"
                        style={{
                          maxHeight: "240px",
                          border: "1px solid var(--border)",
                          borderRadius: "6px",
                          background: "var(--bg2)",
                        }}
                      >
                        <table>
                          <thead>
                            <tr>
                              {computedExpectedResult.columns.map(
                                (c: string) => (
                                  <th key={c}>{c}</th>
                                ),
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {computedExpectedResult.rows
                              .slice(0, 10)
                              .map((row: any, i: number) => (
                                <tr key={i}>
                                  {computedExpectedResult.columns.map(
                                    (c: string) => (
                                      <td key={c}>
                                        {String(row[c] ?? "NULL")}
                                      </td>
                                    ),
                                  )}
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                      {computedExpectedResult.rows.length > 10 && (
                        <span
                          style={{
                            fontSize: "10px",
                            color: "var(--muted)",
                            fontStyle: "italic",
                          }}
                        >
                          Showing first 10 of{" "}
                          {computedExpectedResult.rows.length} total expected
                          rows
                        </span>
                      )}
                    </div>
                  )}

                <button
                  className="reveal-answer-btn"
                  onClick={() => setSolutionRevealed((r) => !r)}
                >
                  <Sparkles size={14} />
                  {solutionRevealed ? "Hide Solution" : "Reveal Solution"}
                </button>
                {solutionRevealed && (
                  <div className="hint-solution">
                    <pre className="sql-pre small">
                      {activePuzzle?.solutionQuery}
                    </pre>
                    <div className="sol-actions">
                      <button
                        className="icon-button labeled"
                        onClick={() => {
                          updateEditorQuery(activePuzzle?.solutionQuery);
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
                            autoTypeQuery(activePuzzle?.solutionQuery);
                          }
                        }}
                      >
                        <Sparkles size={13} />{" "}
                        {isAutoTyping ? "Stop typing" : "Auto-type"}
                      </button>
                    </div>
                    <p className="sol-explanation">
                      <strong>The Mistake:</strong>{" "}
                      {activePuzzle.mistakeExplanation}
                    </p>
                  </div>
                )}
                {progress.solvedPuzzles?.includes(activePuzzle?.id) &&
                  (() => {
                    const parentDay = learningRoadmap.find(
                      (d) => d.day === activePuzzle.dayId,
                    );
                    if (
                      parentDay?.mockInterview &&
                      parentDay.mockInterview.company &&
                      (progress.mockScores?.[parentDay.mockInterview.company] ??
                        0) <= 0
                    ) {
                      return (
                        <button
                          className="primary-button"
                          style={{
                            marginTop: "16px",
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            background: "var(--purple)",
                            color: "white",
                            fontWeight: "bold",
                          }}
                          onClick={() => setActiveView("mocks")}
                        >
                          <span>
                            Take Day {parentDay?.day} Mock Test (
                            {parentDay.mockInterview.company}) &rarr;
                          </span>
                        </button>
                      );
                    }

                    const nextPuz =
                      debugPuzzles.findIndex(
                        (x) => x.id === activePuzzle?.id,
                      ) !== -1
                        ? debugPuzzles[
                            debugPuzzles.findIndex(
                              (x) => x.id === activePuzzle?.id,
                            ) + 1
                          ]
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
                        onClick={() => openPuzzleInPlayground(nextPuz.id)}
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
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  {selectedProblem.title}
                  {(() => {
                    const parentMod = roadmapModules.find(
                      (m) => m.id === selectedProblem.moduleId,
                    );
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
                <div className="hint-scenario">
                  {selectedProblem.businessScenario}
                </div>
                <div className="hint-prompt-box">
                  <strong>Task</strong>
                  <p>{selectedProblem.prompt}</p>
                </div>

                {/* TARGET TABLES & SCHEMA CARD */}
                {relevantTables.length > 0 && (
                  <div
                    style={{
                      background: "rgba(56, 217, 255, 0.04)",
                      border: "1px solid rgba(56, 217, 255, 0.2)",
                      borderRadius: "8px",
                      padding: "10px 12px",
                      margin: "12px 0",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "var(--cyan)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: "6px",
                      }}
                    >
                      <Database size={13} /> Target Table
                      {relevantTables.length > 1 ? "s" : ""}:
                    </div>
                    {relevantTables.map((t) => (
                      <div key={t.name} style={{ marginBottom: "6px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "12px",
                            fontWeight: "bold",
                            color: "var(--text)",
                          }}
                        >
                          Table:{" "}
                          <code
                            style={{
                              background: "rgba(56, 217, 255, 0.15)",
                              color: "var(--cyan)",
                              padding: "1px 6px",
                              borderRadius: "4px",
                            }}
                          >
                            {t.name}
                          </code>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "4px",
                            marginTop: "4px",
                          }}
                        >
                          {t.columns.map((col: any) => (
                            <span
                              key={col.name}
                              style={{
                                fontSize: "10.5px",
                                fontFamily: "var(--font-mono, monospace)",
                                background: "var(--bg)",
                                color: "var(--text-muted)",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                border: "1px solid var(--border)",
                              }}
                            >
                              {col.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* EXPECTED OUTPUT TABLE (HackerRank & DataLemur Style!) */}
                {computedExpectedResult &&
                  !computedExpectedResult.error &&
                  computedExpectedResult.columns.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        margin: "14px 0",
                      }}
                    >
                      <strong
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "var(--emerald)",
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <CheckCircle2 size={13} /> Expected Output Table
                      </strong>
                      <div
                        className="table-wrap"
                        style={{
                          maxHeight: "240px",
                          border: "1px solid var(--border)",
                          borderRadius: "6px",
                          background: "var(--bg2)",
                        }}
                      >
                        <table>
                          <thead>
                            <tr>
                              {computedExpectedResult.columns.map(
                                (c: string) => (
                                  <th key={c}>{c}</th>
                                ),
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {computedExpectedResult.rows
                              .slice(0, 10)
                              .map((row: any, i: number) => (
                                <tr key={i}>
                                  {computedExpectedResult.columns.map(
                                    (c: string) => (
                                      <td key={c}>
                                        {String(row[c] ?? "NULL")}
                                      </td>
                                    ),
                                  )}
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                      {computedExpectedResult.rows.length > 10 && (
                        <span
                          style={{
                            fontSize: "10px",
                            color: "var(--muted)",
                            fontStyle: "italic",
                          }}
                        >
                          Showing first 10 of{" "}
                          {computedExpectedResult.rows.length} total expected
                          rows
                        </span>
                      )}
                    </div>
                  )}
                <div
                  style={{ display: "flex", gap: "8px", marginBottom: "14px" }}
                >
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
                    <BookOpen size={13} style={{ color: "var(--cyan)" }} />{" "}
                    Review Lesson
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
                    <RefreshCcw size={13} style={{ color: "var(--cyan)" }} />{" "}
                    Reset Starter SQL
                  </button>
                </div>
                {(() => {
                  const targetSolution =
                    playgroundMode === "puzzle" && activePuzzle
                      ? activePuzzle?.solutionQuery
                      : selectedProblem?.solution || "";

                  const problemTitle =
                    playgroundMode === "puzzle" && activePuzzle
                      ? activePuzzle.title
                      : selectedProblem?.title || "Problem";

                  const rawHints =
                    playgroundMode === "puzzle" && activePuzzle
                      ? activePuzzle.hints && activePuzzle.hints.length >= 3
                        ? activePuzzle.hints
                        : [
                            activePuzzle.hint ||
                              `Analyze the flawed query: inspect table joins, aliases, and WHERE filters.`,
                            `Identify syntax mismatches, join condition errors, or incorrect aggregate grouping.`,
                            `Compare your modified query against expected columns and target output rows.`,
                          ]
                      : selectedProblem?.hints &&
                          selectedProblem.hints.length >= 3
                        ? selectedProblem.hints
                        : [
                            `Inspect the '${problemTitle}' objective and schema in the Instructions tab.`,
                            `Draft your query: SELECT columns, FROM table, apply filters, and ORDER BY as requested.`,
                            `Format your final output columns and apply sorting as specified in the scenario.`,
                          ];

                  const displayHints = rawHints;

                  return (
                    <>
                      {displayHints
                        .slice(0, visibleHints)
                        .map((h: string, i: number) => (
                          <div key={i} className="hint-card">
                            <Lightbulb size={13} />
                            <span>
                              <strong>Hint {i + 1} of 3:</strong> {h}
                            </span>
                          </div>
                        ))}
                      {visibleHints < displayHints.length && (
                        <button
                          className="get-next-hint-btn"
                          onClick={() =>
                            setVisibleHints((n) =>
                              Math.min(displayHints.length, n + 1),
                            )
                          }
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            width: "100%",
                            padding: "9px 14px",
                            margin: "10px 0 14px 0",
                            background: "rgba(56, 217, 255, 0.08)",
                            border: "1px solid rgba(56, 217, 255, 0.25)",
                            borderRadius: "6px",
                            color: "var(--cyan)",
                            fontWeight: 600,
                            fontSize: "12.5px",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <Lightbulb size={14} /> Unlock Next Hint (
                          {displayHints.length - visibleHints} remaining)
                        </button>
                      )}
                    </>
                  );
                })()}
                <button
                  className="reveal-answer-btn"
                  onClick={() => {
                    if (!solutionRevealed) {
                      showConfirm(
                        "Are you sure you want to reveal the answer? Try using the hints first!",
                        () => {
                          setSolutionRevealed(true);
                        },
                      );
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
                    <pre className="sql-pre small">
                      {formatSql(selectedProblem.solution)}
                    </pre>
                    <div className="sol-actions">
                      <button
                        className="icon-button labeled"
                        onClick={() => {
                          updateEditorQuery(
                            formatSql(selectedProblem.solution),
                          );
                        }}
                      >
                        <Play size={13} /> Load into Editor
                      </button>
                    </div>
                    <p className="sol-explanation">
                      {selectedProblem.detailedExplanation}
                    </p>
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

                {progress.solvedProblems.includes(selectedProblem.id) && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 12px",
                      margin: "10px 0",
                      background: "rgba(48, 230, 149, 0.08)",
                      border: "1px solid rgba(48, 230, 149, 0.25)",
                      borderRadius: "6px",
                      color: "var(--emerald)",
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    <CheckCircle2 size={15} /> Solved ✓
                  </div>
                )}
                {(() => {
                  const idx = allProblems.findIndex(
                    (p) => p.id === selectedProblem.id,
                  );
                  const nextProb =
                    idx !== -1 && idx < allProblems.length - 1
                      ? allProblems[idx + 1]
                      : null;
                  return nextProb ? (
                    <button
                      className="primary-button"
                      style={{
                        marginTop: "12px",
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
                      <span>Next Problem &rarr;</span>
                    </button>
                  ) : null;
                })()}
              </>
            ) : (
              <div className="no-problem">
                <Lightbulb size={28} />
                <p>
                  Open a problem from <strong>Practice</strong> to see hints and
                  the question here.
                </p>
                <button
                  className="primary-button compact"
                  onClick={() => setActiveView("practice")}
                >
                  <Code2 size={14} /> Browse Problems
                </button>
              </div>
            )}
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
          left={rightContent}
          right={editorContent}
        />
      ) : (
        editorContent
      )}

      {!rightOpen && !editorMaximized && (
        <button
          className="pg-left-toggle"
          title="Show Context Panel"
          onClick={() => setRightOpen(true)}
        >
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
        <div
          className="custom-modal-overlay"
          onClick={() => setLessonModalOpen(false)}
        >
          <div
            className="custom-modal-window large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="custom-modal-header">
              <h2>
                <BookOpen size={18} />
                <span>
                  Lesson: {activeModule.title} (Module {activeModule.id})
                </span>
              </h2>
              <button
                className="icon-button"
                onClick={() => setLessonModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="custom-modal-body">
              <div className="concept-tab-container">
                <LessonProse text={activeModule.lesson.conceptExplanation} />

                {activeModule.lesson.realBusinessScenario && (
                  <div
                    className="concept-scenario-section"
                    style={{ marginTop: "24px" }}
                  >
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
                      <Lightbulb
                        size={15}
                        style={{ color: "var(--yellow)", marginRight: "6px" }}
                      />
                      Real-World Business Scenario
                    </h3>
                    <LessonProse
                      text={activeModule.lesson.realBusinessScenario}
                    />
                  </div>
                )}

                {activeModule.lesson.visualExplanation && (
                  <div
                    className="concept-visual-section"
                    style={{ marginTop: "24px" }}
                  >
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
                      <Eye
                        size={15}
                        style={{ color: "var(--cyan)", marginRight: "6px" }}
                      />
                      Visual Representation
                    </h3>
                    <LessonProse text={activeModule.lesson.visualExplanation} />
                  </div>
                )}
              </div>
            </div>
            <div className="custom-modal-footer">
              <button
                className="primary-button"
                onClick={() => setLessonModalOpen(false)}
              >
                Back to Practice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default PlaygroundView;
