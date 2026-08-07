import type { BeforeMount, OnMount } from "@monaco-editor/react";
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Code2,
  Command,
  Database,
  Lightbulb,
  Menu,
  Search,
  Target,
  Timer,
  X,
  Zap,
  Bug,
  Sun,
  Moon,
  AlertTriangle,
  GitMerge,
  Edit3,
  Download,
  Monitor,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  Suspense,
  lazy,
} from "react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { getStorageItem as safeLocalStorageGet } from "./utils/storage";
import { buildCsvImportSql } from "./utils/csvParser";
import { stripLineNumbersFromQuery } from "./utils/formatters";
import {
  calculateSM2,
  loadSM2Progress,
  saveSM2Progress,
  SM2ProgressMap,
} from "./utils/sm2Engine";
import { gradeQuery, isModifyingQuery } from "./utils/graderService";
import { deduplicateQuestions } from "./utils/curriculumLoader";
const DashboardView = lazy(() => import("./views/DashboardView"));
const RoadmapView = lazy(() => import("./views/RoadmapView"));
const ModulesView = lazy(() => import("./views/ModulesView"));
const PracticeView = lazy(() => import("./views/PracticeView"));
const PlaygroundView = lazy(() => import("./views/PlaygroundView"));
const PuzzlesView = lazy(() => import("./views/PuzzlesView"));
const DayDetailsView = lazy(() => import("./views/DayDetailsView"));
const MockTestView = lazy(() => import("./views/MockTestView"));
const MissionCapstoneView = lazy(() => import("./views/MissionCapstoneView"));
import {
  interviewQuestionBank,
  mockInterviews,
  roadmapModules,
  learningRoadmap,
} from "./data/curriculum";
import type {
  Difficulty,
  PracticeProblem,
  RoadmapModule,
} from "./data/curriculum";
import { debugPuzzles } from "./data/puzzles";
import type { SqlPuzzle } from "./data/puzzles";
import { datasetDomains, tableSchemas } from "./data/datasets";
import OnboardingModal from "./components/OnboardingModal";
import ShortcutsModal from "./components/ShortcutsModal";
import ColumnProfileModal from "./components/ColumnProfileModal";
import { EditorWorkspaceSkeleton } from "./components/EditorWorkspaceSkeleton";
import type { QueryResult } from "./utils/sqlEngine";
const SqlJoinVennDiagram = lazy(
  () => import("./components/SqlJoinVennDiagram"),
);
import { lintSqlQuery } from "./utils/sqlLinter";
import type { LintError } from "./utils/sqlLinter";
import { ErrorBoundary } from "./components/ErrorBoundary";
import type { ViewId, PlaygroundMode } from "./types";

const loadSqlEngine = () => import("./utils/sqlEngine");
const initDatabase = () =>
  loadSqlEngine().then((engine) => engine.initDatabase());
const resetDatabase = (force?: boolean) =>
  loadSqlEngine().then((engine) => engine.resetDatabase(force));
const runQuery = (...args: [string, boolean?, boolean?, number?]) =>
  loadSqlEngine().then((engine) => engine.runQuery(...args));
const getLiveSchema = () =>
  loadSqlEngine().then((engine) => engine.getLiveSchema());

type ProgressState = {
  completedModules: number[];
  solvedProblems: string[];
  solvedPuzzles: string[];
  completedDays: number[];
  queryRuns: number;
  minutesStudied: number;
  mockScores: Record<string, number>;
  completedChecklistItems: string[];
};

type QueryHistoryItem = {
  id: string;
  query: string;
  createdAt: string;
  status: "success" | "error";
  rowCount?: number;
  durationMs?: number;
};

type MockTestState = {
  company: string;
  questions: PracticeProblem[];
  currentIndex: number;
  answers: { query: string; isCorrect: boolean }[];
  timeRemaining: number; // in seconds
  isActive: boolean;
};

const navItems: { id: ViewId; label: string; icon: LucideIcon }[] = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  {
    id: "roadmap",
    label: `${learningRoadmap.length}-Day Plan`,
    icon: BookOpen,
  },
  { id: "practice", label: "Practice", icon: Code2 },
  { id: "playground", label: "Playground", icon: Zap },
  { id: "puzzles", label: "SQL Puzzles", icon: Bug },
  { id: "mocks", label: "Mock Tests", icon: Timer },
  { id: "missions", label: "Capstones", icon: Target },
  { id: "join-visualizer", label: "Join Visualizer", icon: GitMerge },
];

const initialProgress: ProgressState = {
  completedModules: [],
  solvedProblems: [],
  solvedPuzzles: [],
  completedDays: [],
  queryRuns: 0,
  minutesStudied: 0,
  mockScores: {},
  completedChecklistItems: [],
};

const defaultQuery = `-- Welcome! Edit this query and press Ctrl+Enter (or Run) to execute.
SELECT * FROM customers LIMIT 10;`;

/* tiny helpers */

function classForDiff(d: string) {
  const lower = (d || "").toLowerCase();
  if (lower.includes("expert")) return "expert";
  if (lower.includes("advanced") || lower.includes("hard")) return "hard";
  if (lower.includes("intermediate") || lower.includes("medium"))
    return "medium";
  return "easy";
}
/* APP */
export default function App() {
  // Migrate progress schema if older versions exist
  const currentProgressKey = "sql-aa-progress-v3";
  if (!localStorage.getItem(currentProgressKey)) {
    const v2Data = localStorage.getItem("sql-aa-progress-v2");
    const v1Data = localStorage.getItem("sql-aa-progress");
    let migratedProgress: ProgressState | null = null;
    if (v2Data) {
      try {
        const parsed = JSON.parse(v2Data);
        migratedProgress = {
          completedModules: parsed.completedModules ?? [],
          solvedProblems: parsed.solvedProblems ?? [],
          solvedPuzzles: parsed.solvedPuzzles ?? [],
          completedDays: parsed.completedDays ?? [],
          queryRuns: parsed.queryRuns ?? 0,
          minutesStudied: parsed.minutesStudied ?? 0,
          mockScores: parsed.mockScores ?? {},
          completedChecklistItems: parsed.completedChecklistItems ?? [],
        };
        localStorage.setItem("sql-aa-progress-v2-backup", v2Data);
      } catch (e) {
        console.warn("Failed to parse v2 progress data:", e);
      }
    } else if (v1Data) {
      try {
        const parsed = JSON.parse(v1Data);
        migratedProgress = {
          completedModules: parsed.completedModules ?? [],
          solvedProblems: parsed.solvedProblems ?? [],
          solvedPuzzles: [],
          completedDays: [],
          queryRuns: parsed.queryRuns ?? 0,
          minutesStudied: parsed.minutesStudied ?? 0,
          mockScores: {},
          completedChecklistItems: [],
        };
        localStorage.setItem("sql-aa-progress-v1-backup", v1Data);
      } catch (e) {
        console.warn("Failed to parse v1 progress data:", e);
      }
    }
    if (migratedProgress) {
      localStorage.setItem(
        currentProgressKey,
        JSON.stringify(migratedProgress),
      );
    }
  }

  /* ── navigation ─────────────────────────────────────────── */
  const [activeView, setActiveView] = useLocalStorage<ViewId>(
    "sql-aa-active-view",
    "roadmap",
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ── theme ──────────────────────────────────────────────── */
  const [theme, setTheme] = useLocalStorage<"dark" | "light" | "oled">(
    "sql-aa-theme",
    "dark",
  );
  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.classList.toggle("oled", theme === "oled");
  }, [theme]);

  /* ── PWA & Desktop Shortcut Installation ─────────────────── */
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      (window as any).deferredInstallPrompt = e;
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallApp = useCallback(() => {
    if ((window as any).deferredInstallPrompt) {
      (window as any).deferredInstallPrompt.prompt();
      (window as any).deferredInstallPrompt.userChoice.then(
        (choiceResult: any) => {
          if (choiceResult.outcome === "accepted") {
            (window as any).deferredInstallPrompt = null;
          }
        },
      );
      return;
    }
    
    alert("The application is already installed or your browser does not support automatic installation.");
  }, []);

  // Keydown handler for WAI-ARIA tablist in sidebar
  const handleSidebarNavKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    const tabButtons = Array.from(
      e.currentTarget.querySelectorAll('button[role="tab"]'),
    ) as HTMLButtonElement[];
    const currentIndex = tabButtons.findIndex(
      (btn) => btn === document.activeElement,
    );
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % tabButtons.length;
      tabButtons[nextIndex].focus();
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
      tabButtons[nextIndex].focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      tabButtons[0].focus();
    } else if (e.key === "End") {
      e.preventDefault();
      tabButtons[tabButtons.length - 1].focus();
    }
  };

  // Keydown handler for WAI-ARIA tablist in right panel
  const handleRightNavKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    const tabButtons = Array.from(
      e.currentTarget.querySelectorAll('button[role="tab"]'),
    ) as HTMLButtonElement[];
    const currentIndex = tabButtons.findIndex(
      (btn) => btn === document.activeElement,
    );
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % tabButtons.length;
      tabButtons[nextIndex].focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
      tabButtons[nextIndex].focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      tabButtons[0].focus();
    } else if (e.key === "End") {
      e.preventDefault();
      tabButtons[tabButtons.length - 1].focus();
    }
  };

  /* ── learning state ─────────────────────────────────────── */
  const [activeModuleId, setActiveModuleId] = useLocalStorage<number>(
    "sql-aa-active-module-id",
    1,
  );
  const allProblems = useMemo(
    () => roadmapModules.flatMap((m) => m.problems),
    [],
  );

  const activeModule = useMemo(
    () =>
      roadmapModules.find((m) => m.id === activeModuleId) ?? roadmapModules[0],
    [activeModuleId],
  );
  const [selectedProblemId, setSelectedProblemId] = useLocalStorage<string>(
    "sql-aa-selected-problem-id",
    activeModule.problems[0]?.id ?? "",
  );
  const selectedProblem = useMemo(() => {
    const all = roadmapModules.flatMap((m) => m.problems);
    return (
      all.find((p) => p.id === selectedProblemId) ??
      activeModule.problems[0] ?? {
        id: "",
        moduleId: 1,
        difficulty: "Easy" as Difficulty,
        title: "No problem",
        businessScenario: "",
        prompt: "",
        starterQuery: "",
        solution: "",
        hints: [],
        detailedExplanation: "",
        alternativeApproach: "",
        performanceNotes: "",
        concepts: [],
      }
    );
  }, [selectedProblemId, activeModule]);

  const [activePuzzleId, setActivePuzzleId] = useLocalStorage<string>(
    "sql-aa-active-puzzle-id",
    debugPuzzles[0]?.id ?? "",
  );
  const activePuzzle = useMemo(
    () => debugPuzzles.find((p) => p.id === activePuzzleId) ?? debugPuzzles[0],
    [activePuzzleId],
  );
  const [playgroundMode, setPlaygroundMode] = useLocalStorage<
    "practice" | "puzzle" | "free"
  >("sql-aa-playground-mode-v4", "practice");
  const [mockTest, setMockTest] = useState<MockTestState | null>(null);
  const [mockReviewIndex, setMockReviewIndex] = useState(0);
  const [selectedDayId, setSelectedDayId] = useLocalStorage<number>(
    "sql-aa-selected-day-id",
    1,
  );

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [graderFeedback, setGraderFeedback] = useState<{
    isCorrect: boolean;
    message: string;
    details?: string;
    warning?: string;
  } | null>(null);
  useEffect(() => {
    if (!localStorage.getItem("sql-aa-onboarded")) {
      setShowOnboarding(true);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem("sql-aa-onboarded", "true");
    setShowOnboarding(false);
  };

  /* tiny helpers */

  const enterFreeformPlayground = () => {
    stopAutoTyping();
    setPlaygroundMode("free");
    let saved = "";
    try {
      const stored = localStorage.getItem("sql-aa-freeform-query");
      saved = stored ? JSON.parse(stored) : "";
    } catch {
      saved = "";
    }
    const queryToLoad = saved || "SELECT * FROM customers LIMIT 10;";
    updateEditorQuery(queryToLoad, undefined, undefined, true);
    setActiveView("playground");
  };

  // Local settings & UI states
  const [editorFontSize, setEditorFontSize] = useLocalStorage(
    "sql-aa-editor-fs-v5",
    16,
  );
  const [editorWordWrap, setEditorWordWrap] = useLocalStorage(
    "sql-aa-editor-ww-v4",
    true,
  );
  const [editorMinimap, setEditorMinimap] = useLocalStorage(
    "sql-aa-editor-mm-v4",
    false,
  );
  const [editorTheme, setEditorTheme] = useLocalStorage(
    "sql-aa-editor-theme-v4",
    "vs-dark",
  );
  const [graderStrict, setGraderStrict] = useLocalStorage(
    "sql-aa-grader-strict-v4",
    false,
  );
  const [rowLimit, setRowLimit] = useLocalStorage("sql-aa-row-limit-v4", "50");
  const [sqlUpperKeywords, setSqlUpperKeywords] = useLocalStorage(
    "sql-aa-upper-kw-v4",
    true,
  );

  // Custom Confirmation & Prompt Modal States
  const [customConfirmOpen, setCustomConfirmOpen] = useState(false);
  const [customConfirmMessage, setCustomConfirmMessage] = useState("");
  const [customConfirmOnConfirm, setCustomConfirmOnConfirm] = useState<
    (() => void) | null
  >(null);

  const [customPromptOpen, setCustomPromptOpen] = useState(false);
  const [customPromptMessage, setCustomPromptMessage] = useState("");
  const [customPromptValue, setCustomPromptValue] = useState("");
  const [customPromptOnSubmit, setCustomPromptOnSubmit] = useState<
    ((val: string) => void) | null
  >(null);

  const showConfirm = (msg: string, onConfirm: () => void) => {
    setCustomConfirmMessage(msg);
    setCustomConfirmOnConfirm(() => onConfirm);
    setCustomConfirmOpen(true);
  };

  const showPrompt = (
    msg: string,
    defaultVal: string,
    onSubmit: (val: string) => void,
  ) => {
    setCustomPromptMessage(msg);
    setCustomPromptValue(defaultVal);
    setCustomPromptOnSubmit(() => onSubmit);
    setCustomPromptOpen(true);
  };

  // Additional UI states
  const [editorFontFamily, setEditorFontFamily] = useLocalStorage(
    "sql-aa-editor-ff-v4",
    "'JetBrains Mono', Consolas, monospace",
  );
  const [editorTabSize, setEditorTabSize] = useLocalStorage(
    "sql-aa-editor-ts-v5",
    4,
  );
  const [activeColumnProfile, setActiveColumnProfile] = useState<{
    table: string;
    column: string;
    total: number;
    distinct: number;
    nulls: number;
    min?: unknown;
    max?: unknown;
    avg?: unknown;
    topValues?: { val: unknown; count: number }[];
  } | null>(null);
  const [mockHistory, setMockHistory] = useLocalStorage<
    { id: string; company: string; score: number; date: number }[]
  >("sql-aa-mock-history-v4", []);
  const [streak, setStreak] = useState(0);
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    // Streak calculation logic with 7-day tracking and 1-day allowance.
    const checkStreak = () => {
      const todayStr = new Date().toISOString().split("T")[0];
      const lastDate = localStorage.getItem("sql-aa-last-active-date");
      let currentStreak = Number(localStorage.getItem("sql-aa-streak") || "0");
      let activeDays: string[] = safeLocalStorageGet("sql-aa-active-days", []);

      if (!activeDays.includes(todayStr)) {
        activeDays.push(todayStr);
      }
      // Keep only last 14 days of activity history
      const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      activeDays = activeDays.filter((d) => d >= cutoff);

      if (lastDate && lastDate !== todayStr) {
        const lastDateParts = lastDate.split("-").map(Number);
        const todayDateParts = todayStr.split("-").map(Number);
        const lastUtc = Date.UTC(
          lastDateParts[0],
          lastDateParts[1] - 1,
          lastDateParts[2],
        );
        const todayUtc = Date.UTC(
          todayDateParts[0],
          todayDateParts[1] - 1,
          todayDateParts[2],
        );
        const diffDays = Math.round(
          (todayUtc - lastUtc) / (1000 * 60 * 60 * 24),
        );

        if (diffDays === 1) {
          currentStreak += 1;
          // 1-Day Allowance: Preserve streak if 1 day was missed.
        } else if (diffDays > 2) {
          currentStreak = 1;
        }
      } else if (!lastDate) {
        currentStreak = 1;
      }

      localStorage.setItem("sql-aa-streak", String(currentStreak));
      localStorage.setItem("sql-aa-last-active-date", todayStr);
      localStorage.setItem("sql-aa-active-days", JSON.stringify(activeDays));
      setStreak(currentStreak);
    };
    checkStreak();
  }, []);

  const exportProgress = () => {
    const backup = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      progress: safeLocalStorageGet("sql-aa-progress-v3", {}),
      history: safeLocalStorageGet("sql-aa-history", []),
      saved: safeLocalStorageGet("sql-aa-saved", []),
      drafts: safeLocalStorageGet("sql-aa-problem-drafts", {}),
      puzzleDrafts: safeLocalStorageGet("sql-aa-puzzle-drafts", {}),
      freeform: safeLocalStorageGet("sql-aa-freeform-query", null),
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

    const MAX_BACKUP_SIZE = 10 * 1024 * 1024; // 10MB limit
    if (file.size > MAX_BACKUP_SIZE) {
      showToast("Backup file exceeds 10MB size limit.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawText = event.target?.result as string;
        if (!rawText) throw new Error("File is empty.");

        const backup = JSON.parse(rawText);
        if (
          typeof backup !== "object" ||
          backup === null ||
          Array.isArray(backup)
        ) {
          throw new Error("Backup root must be a valid JSON object.");
        }

        // Snapshot current state for atomic rollback
        const backupKeys = [
          "sql-aa-progress-v3",
          "sql-aa-history",
          "sql-aa-saved",
          "sql-aa-problem-drafts",
          "sql-aa-puzzle-drafts",
          "sql-aa-freeform-query",
        ];
        const lastKnownGood: Record<string, string | null> = {};
        backupKeys.forEach((key) => {
          lastKnownGood[key] = localStorage.getItem(key);
        });

        try {
          if (backup.progress && typeof backup.progress === "object") {
            localStorage.setItem(
              "sql-aa-progress-v3",
              JSON.stringify(backup.progress),
            );
          }
          if (backup.history && Array.isArray(backup.history)) {
            localStorage.setItem(
              "sql-aa-history",
              JSON.stringify(backup.history),
            );
          }
          if (backup.saved && Array.isArray(backup.saved)) {
            localStorage.setItem("sql-aa-saved", JSON.stringify(backup.saved));
          }
          if (backup.drafts && typeof backup.drafts === "object") {
            localStorage.setItem(
              "sql-aa-problem-drafts",
              JSON.stringify(backup.drafts),
            );
          }
          if (backup.puzzleDrafts && typeof backup.puzzleDrafts === "object") {
            localStorage.setItem(
              "sql-aa-puzzle-drafts",
              JSON.stringify(backup.puzzleDrafts),
            );
          }
          if (backup.freeform !== undefined) {
            localStorage.setItem(
              "sql-aa-freeform-query",
              JSON.stringify(backup.freeform),
            );
          }

          showToast(
            "Progress and query drafts imported successfully! Reloading...",
            "success",
          );
          setTimeout(() => window.location.reload(), 1500);
        } catch (writeErr) {
          // Rollback to last known good state
          backupKeys.forEach((key) => {
            if (lastKnownGood[key] !== null) {
              localStorage.setItem(key, lastKnownGood[key]!);
            } else {
              localStorage.removeItem(key);
            }
          });
          throw new Error(
            "Storage write failed during restoration: " +
              (writeErr as Error).message,
          );
        }
      } catch (err: unknown) {
        showToast(
          "Invalid backup file format: " + (err as Error).message,
          "error",
        );
      }
    };
    reader.readAsText(file);
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
      showToast("Database export complete.", "success");
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
        showToast("SQL script loaded.", "success");
      }
    };
    reader.readAsText(file);
  };

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        showToast(`Imported temporary table "${tableName}".`, "success");
      } catch (err: unknown) {
        showToast(
          "Error parsing/loading CSV: " + (err as Error).message,
          "error",
        );
      }
    };
    reader.readAsText(file);
  };

  const copyTableSchemaMarkdown = (table: (typeof tableSchemas)[0]) => {
    let md = `### Table: ${table.name} (${table.domain})\n\n`;
    md += `| Column | Type | Key |\n`;
    md += `| :--- | :--- | :--- |\n`;
    table.columns.forEach((c) => {
      const isPk = table.primaryKey === c.name ? "PK" : "";
      const rel = table.relationships?.find((r) => r.endsWith("." + c.name))
        ? "FK"
        : "";
      const keyType = [isPk, rel].filter(Boolean).join(", ");
      md += `| ${c.name} | ${c.type} | ${keyType} |\n`;
    });
    navigator.clipboard.writeText(md);
    showToast(`Schema copied to clipboard.`, "success");
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
        (c) => c.name.toLowerCase() === columnName.toLowerCase(),
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
        : freqRes.rows.map((r) => ({ val: r.val, count: Number(r.count) }));

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

  /* ── SQL engine ─────────────────────────────────────────── */
  const [query, setQuery] = useLocalStorage(
    "sql-aa-active-query",
    defaultQuery,
  );
  const queryRef = useRef(defaultQuery);

  // Sync query ref on initial load and whenever query state changes
  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  const [liveSchema, setLiveSchema] = useState<typeof tableSchemas>([]);
  const liveSchemaRef = useRef<typeof tableSchemas>([]);
  useEffect(() => {
    liveSchemaRef.current = liveSchema;
  }, [liveSchema]);

  const sqlUpperKeywordsRef = useRef(sqlUpperKeywords);
  useEffect(() => {
    sqlUpperKeywordsRef.current = sqlUpperKeywords;
  }, [sqlUpperKeywords]);

  const [queryResult, setQueryResult] = useState<QueryResult>({
    columns: [],
    rows: [],
    message: "",
  });
  const [expectedResult, setExpectedResult] = useState<QueryResult | null>(
    null,
  );
  const [lintErrors, setLintErrors] = useState<LintError[]>([]);

  useEffect(() => {
    const handler = setTimeout(() => {
      const errors = lintSqlQuery(query);
      setLintErrors(errors);

      if (monacoRef.current) {
        const monaco = monacoRef.current;
        const models = monaco.editor.getModels();
        models.forEach((model: any) => {
          if (model.getLanguageId() === "sql" && model.getValue() === query) {
            const markers: any[] = [];
            const bracketStack: { char: string; line: number; col: number }[] =
              [];
            const lines = query.split("\n");

            lines.forEach((lineText, lineIdx) => {
              for (let c = 0; c < lineText.length; c++) {
                const char = lineText[c];
                if (char === "(") {
                  bracketStack.push({ char, line: lineIdx + 1, col: c + 1 });
                } else if (char === ")") {
                  if (bracketStack.length === 0) {
                    markers.push({
                      severity: monaco.MarkerSeverity.Error,
                      message:
                        "Mismatched closing bracket: ')' has no matching '('",
                      startLineNumber: lineIdx + 1,
                      startColumn: c + 1,
                      endLineNumber: lineIdx + 1,
                      endColumn: c + 2,
                    });
                  } else {
                    bracketStack.pop();
                  }
                }
              }
            });

            bracketStack.forEach((bracket) => {
              markers.push({
                severity: monaco.MarkerSeverity.Error,
                message: "Unclosed open bracket: '(' is never closed",
                startLineNumber: bracket.line,
                startColumn: bracket.col,
                endLineNumber: bracket.line,
                endColumn: bracket.col + 1,
              });
            });

            errors.forEach((err) => {
              let severity = monaco.MarkerSeverity.Info;
              if (err.severity === "error")
                severity = monaco.MarkerSeverity.Error;
              if (err.severity === "warning")
                severity = monaco.MarkerSeverity.Warning;

              markers.push({
                startLineNumber: err.line,
                startColumn: err.column,
                endLineNumber: err.line,
                endColumn: err.column + err.length,
                message: err.message,
                severity: severity,
              });
            });

            monaco.editor.setModelMarkers(model, "sql-syntax-linter", markers);
          }
        });
      }
    }, 250);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  const [resultPage, setResultPage] = useState(0);
  useEffect(() => {
    setResultPage(0);
  }, [queryResult]);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      setToast({ message, type });
    },
    [],
  );

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const [progress, setProgress] = useLocalStorage<ProgressState>(
    "sql-aa-progress-v3",
    initialProgress,
  );

  /* keep ref in sync without causing re-renders */
  const debounceTimerRef = useRef<number | null>(null);

  const getSavedDraftQuery = useCallback(
    (p: PracticeProblem): string => {
      const drafts = safeLocalStorageGet<Record<string, any>>(
        "sql-aa-problem-drafts",
        {},
      );
      const draftVal = drafts[p.id];
      const defaultQuery =
        p.starterQuery && p.starterQuery.trim() !== ""
          ? p.starterQuery
          : `-- Write your SQL query here\n`;

      if (!draftVal) return defaultQuery;
      let stored = typeof draftVal === "string" ? draftVal : draftVal.query;
      if (!stored) return defaultQuery;
      stored = stripLineNumbersFromQuery(stored);

      // Ignore drafts that contain placeholders, are identical to ANY problem's starterQuery,
      // or exactly match the current problem's solution (a side effect of a previous bug)
      // EXCEPT when the problem has already been solved by the user.
      const isStarter = allProblems.some(
        (prob) =>
          prob.starterQuery &&
          stored.replace(/\s+/g, "").toLowerCase() ===
            prob.starterQuery.replace(/\s+/g, "").toLowerCase(),
      );
      const isSolution =
        p.solution &&
        stored.replace(/\s+/g, "").toLowerCase() ===
          p.solution.replace(/\s+/g, "").toLowerCase();
      const isSolved = progress.solvedProblems.includes(p.id);
      if (!isSolved && (stored.includes("???") || isStarter || isSolution)) {
        return defaultQuery;
      }

      // Strip legacy comment header if present
      stored = stored.replace(/^(--[^\n]*\n)+(\s*\n)*/, (match: string) => {
        if (
          match.includes("TASK:") ||
          match.includes("SCENARIO:") ||
          match.includes("GOAL:") ||
          match.includes("Task:") ||
          match.includes("========")
        ) {
          return "";
        }
        return match;
      });

      return stored || defaultQuery;
    },
    [allProblems, progress.solvedProblems],
  );

  const getSavedPuzzleQuery = useCallback(
    (p: SqlPuzzle): string => {
      const drafts = safeLocalStorageGet<Record<string, any>>(
        "sql-aa-puzzle-drafts",
        {},
      );
      const draftVal = drafts[p.id];
      const defaultQuery = p.flawedQuery;

      if (!draftVal) return defaultQuery;
      let stored = typeof draftVal === "string" ? draftVal : draftVal.query;
      if (!stored) return defaultQuery;

      // Strip legacy comment header if present
      stored = stored.replace(/^(--[^\n]*\n)+(\s*\n)*/, (match: string) => {
        if (
          match.includes("Debug Puzzle:") ||
          match.includes("TASK:") ||
          match.includes("SCENARIO:") ||
          match.includes("========")
        ) {
          return "";
        }
        return match;
      });

      const isSolution =
        p.solutionQuery &&
        stored.replace(/\s+/g, "").toLowerCase() ===
          p.solutionQuery.replace(/\s+/g, "").toLowerCase();
      const isSolved = (progress.solvedPuzzles || []).includes(p.id);
      if (!isSolved && isSolution) {
        return defaultQuery;
      }

      return stored || defaultQuery;
    },
    [progress.solvedPuzzles],
  );

  const updateEditorQuery = useCallback(
    (
      rawVal: string,
      pMode?: PlaygroundMode,
      targetId?: string,
      moveCursorToEnd = false,
    ) => {
      const newVal = stripLineNumbersFromQuery(rawVal);
      isProgrammaticChangeRef.current = true;
      try {
        setQuery(newVal);
        queryRef.current = newVal;
        localStorage.setItem("sql-aa-active-query", JSON.stringify(newVal));

        const mode = pMode ?? playgroundMode;
        if (mode === "practice") {
          const id = targetId ?? selectedProblemId;
          if (id) {
            const drafts = safeLocalStorageGet<Record<string, any>>(
              "sql-aa-problem-drafts",
              {},
            );
            const prob = allProblems.find((x) => x.id === id);
            drafts[id] = {
              query: newVal,
              starterQueryUsed: prob ? prob.starterQuery : "",
            };
            localStorage.setItem(
              "sql-aa-problem-drafts",
              JSON.stringify(drafts),
            );
          }
        } else if (mode === "puzzle") {
          const id = targetId ?? activePuzzleId;
          if (id) {
            const drafts = safeLocalStorageGet<Record<string, any>>(
              "sql-aa-puzzle-drafts",
              {},
            );
            const puzzle = debugPuzzles.find((x) => x.id === id);
            drafts[id] = {
              query: newVal,
              flawedQueryUsed: puzzle ? puzzle.flawedQuery : "",
            };
            localStorage.setItem(
              "sql-aa-puzzle-drafts",
              JSON.stringify(drafts),
            );
          }
        }

        if (editorRef.current) {
          try {
            const editor = editorRef.current as any;
            const model = editor.getModel();
            if (model) {
              const range = model.getFullModelRange();
              editor.executeEdits("auto-type", [
                {
                  range: range,
                  text: newVal,
                  forceMoveMarkers: true,
                },
              ]);
              if (moveCursorToEnd) {
                const lastLine = model.getLineCount();
                const lastCol = model.getLineMaxColumn(lastLine);
                editor.setPosition({ lineNumber: lastLine, column: lastCol });
                editor.revealPosition({
                  lineNumber: lastLine,
                  column: lastCol,
                });
              }
            } else {
              editor.setValue(newVal);
            }
          } catch (err) {
            // Fallback
          }
        }
      } finally {
        isProgrammaticChangeRef.current = false;
      }
    },
    [setQuery, playgroundMode, selectedProblemId, activePuzzleId, allProblems],
  );

  const insertTextAtCursor = useCallback(
    (text: string) => {
      isProgrammaticChangeRef.current = true;
      try {
        if (editorRef.current && monacoRef.current) {
          const editor = editorRef.current as any;
          const monaco = monacoRef.current as any;
          const selection = editor.getSelection();
          const model = editor.getModel();

          if (selection && model) {
            const range = new monaco.Range(
              selection.startLineNumber,
              selection.startColumn,
              selection.endLineNumber,
              selection.endColumn,
            );
            editor.executeEdits("schema-helper", [
              {
                range: range,
                text: text,
                forceMoveMarkers: true,
              },
            ]);

            // Move cursor right after the inserted text
            const newPos = editor.getPosition();
            if (newPos) {
              editor.setPosition({
                lineNumber: newPos.lineNumber,
                column: newPos.column,
              });
            }
            editor.focus();

            // Sync state and storage
            const updatedValue = editor.getValue();
            setQuery(updatedValue);
            queryRef.current = updatedValue;
            localStorage.setItem(
              "sql-aa-active-query",
              JSON.stringify(updatedValue),
            );
          } else {
            setQuery((q) => q + text);
          }
        } else {
          setQuery((q) => q + text);
        }
      } catch (e) {
        setQuery((q) => q + text);
      } finally {
        isProgrammaticChangeRef.current = false;
      }
    },
    [setQuery],
  );

  const stopAutoTyping = useCallback(() => {
    if (typingIntervalRef.current !== null) {
      window.clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
      setQuery(queryRef.current);
    }
    setIsAutoTyping(false);
  }, [setQuery]);

  const autoTypeQuery = useCallback(
    (fullText: string) => {
      stopAutoTyping();
      setIsAutoTyping(true);

      let index = 0;
      const step = Math.max(2, Math.floor(fullText.length / 35));

      isProgrammaticChangeRef.current = true;
      if (editorRef.current) {
        (editorRef.current as any).setValue("");
      }
      queryRef.current = "";

      typingIntervalRef.current = window.setInterval(() => {
        index = Math.min(fullText.length, index + step);
        const nextText = fullText.slice(0, index);

        isProgrammaticChangeRef.current = true;
        queryRef.current = nextText;
        if (editorRef.current) {
          (editorRef.current as any).setValue(nextText);
        }

        if (index >= fullText.length) {
          stopAutoTyping();
          isProgrammaticChangeRef.current = true;
          setQuery(fullText);
          localStorage.setItem("sql-aa-active-query", JSON.stringify(fullText));
          setTimeout(() => {
            isProgrammaticChangeRef.current = false;
          }, 50);
        }
      }, 16);
    },
    [stopAutoTyping, setQuery],
  );

  const handleEditorChange = useCallback(
    (val: string | undefined) => {
      const v = val ?? "";
      queryRef.current = v;

      lastActivityAtRef.current = Date.now();

      if (!isProgrammaticChangeRef.current) {
        stopAutoTyping();
        setQuery(v);
        setGraderFeedback(null);

        if (debounceTimerRef.current)
          window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = window.setTimeout(() => {
          localStorage.setItem("sql-aa-active-query", JSON.stringify(v));

          if (playgroundMode === "practice" && selectedProblemId) {
            const drafts = safeLocalStorageGet<Record<string, any>>(
              "sql-aa-problem-drafts",
              {},
            );
            const prob = allProblems.find((x) => x.id === selectedProblemId);
            drafts[selectedProblemId] = {
              query: v,
              starterQueryUsed: prob ? prob.starterQuery : "",
            };
            localStorage.setItem(
              "sql-aa-problem-drafts",
              JSON.stringify(drafts),
            );
          } else if (playgroundMode === "puzzle" && activePuzzleId) {
            const drafts = safeLocalStorageGet<Record<string, any>>(
              "sql-aa-puzzle-drafts",
              {},
            );
            const puzzle = debugPuzzles.find((x) => x.id === activePuzzleId);
            drafts[activePuzzleId] = {
              query: v,
              flawedQueryUsed: puzzle ? puzzle.flawedQuery : "",
            };
            localStorage.setItem(
              "sql-aa-puzzle-drafts",
              JSON.stringify(drafts),
            );
          } else {
            localStorage.setItem("sql-aa-freeform-query", JSON.stringify(v));
          }
        }, 500);
      }
    },
    [
      setQuery,
      playgroundMode,
      selectedProblemId,
      activePuzzleId,
      allProblems,
      stopAutoTyping,
    ],
  );

  /* ── persisted state ─────────────────────────────────────── */
  const [queryHistory, setQueryHistory] = useLocalStorage<QueryHistoryItem[]>(
    "sql-aa-history",
    [],
  );
  const [savedQueries, setSavedQueries] = useLocalStorage<QueryHistoryItem[]>(
    "sql-aa-saved",
    [],
  );

  // Auto-resume to active day where user left off
  const activeDayWhereLeftOff = useMemo(() => {
    const completedDays = progress.completedDays || [];
    const solvedProblems = progress.solvedProblems || [];
    const solvedPuzzles = progress.solvedPuzzles || [];
    const mockScores = progress.mockScores || {};

    for (const day of learningRoadmap) {
      if (completedDays.includes(day.day)) continue;

      const dayModules = day.modules
        .map((mid) => roadmapModules.find((m) => m.id === mid))
        .filter((m): m is RoadmapModule => m !== undefined);
      const dayProblems = dayModules.flatMap((m) => m.problems);
      const dayPuzzles = debugPuzzles.filter((pz) => pz.dayId === day.day);
      const totalDayItems =
        dayProblems.length +
        dayPuzzles.length +
        (day.mockInterview && day.mockInterview.company ? 1 : 0);

      const solvedProblemsCount = dayProblems.filter((p) =>
        solvedProblems.includes(p.id),
      ).length;
      const solvedPuzzlesCount = dayPuzzles.filter((pz) =>
        solvedPuzzles.includes(pz.id),
      ).length;
      const mockScore =
        day.mockInterview && day.mockInterview.company
          ? (mockScores[day.mockInterview.company] ?? 0)
          : 0;
      const solvedMockCount = mockScore > 0 ? 1 : 0;
      const solvedDayItems =
        solvedProblemsCount + solvedPuzzlesCount + solvedMockCount;

      if (totalDayItems === 0 || solvedDayItems < totalDayItems) {
        return day.day;
      }
    }
    return learningRoadmap[learningRoadmap.length - 1]?.day || 1;
  }, [
    learningRoadmap,
    progress.completedDays,
    progress.solvedProblems,
    progress.solvedPuzzles,
    progress.mockScores,
  ]);

  useEffect(() => {
    const stored = localStorage.getItem("sql-aa-selected-day-id");
    if (!stored) {
      setSelectedDayId(activeDayWhereLeftOff);
    }
  }, [activeDayWhereLeftOff, setSelectedDayId]);

  // Synchronize selectedDayId with the active puzzle or problem so returning to Roadmap maintains exact location where user exited
  useEffect(() => {
    if (
      activeView === "puzzles" ||
      (activeView === "playground" && playgroundMode === "puzzle")
    ) {
      const puz = debugPuzzles.find((p) => p.id === activePuzzleId);
      if (puz && puz.dayId) {
        setSelectedDayId(puz.dayId);
      }
    }
  }, [activePuzzleId, activeView, playgroundMode, setSelectedDayId]);

  useEffect(() => {
    if (
      activeView === "practice" ||
      (activeView === "playground" && playgroundMode === "practice")
    ) {
      const prob = allProblems.find((p) => p.id === selectedProblemId);
      if (prob) {
        const parentDay = learningRoadmap.find((d) =>
          d.modules.includes(prob.moduleId),
        );
        if (parentDay) {
          setSelectedDayId(parentDay.day);
        }
      }
    }
  }, [
    selectedProblemId,
    activeView,
    playgroundMode,
    allProblems,
    learningRoadmap,
    setSelectedDayId,
  ]);

  // Real-time active study time tracker. Only visible, non-idle time is counted.
  const lastActivityAtRef = useRef(Date.now());
  const lastCountedAtRef = useRef(Date.now());
  const activeSecondsRef = useRef(0);

  useEffect(() => {
    let lastEventTime = 0;
    const IDLE_TIMEOUT_MS = 60 * 1000;
    let trackingVisible = document.visibilityState === "visible";
    lastCountedAtRef.current = Date.now();

    const handleActivity = () => {
      const now = Date.now();
      // Throttle activity events while still treating typing, clicks, movement, and scrolling as engagement.
      if (now - lastEventTime > 3000) {
        lastEventTime = now;
        lastActivityAtRef.current = now;
      }
    };

    const accrueActiveTime = (now: number) => {
      if (!trackingVisible) return;
      const activeUntil = Math.min(
        now,
        lastActivityAtRef.current + IDLE_TIMEOUT_MS,
      );
      if (activeUntil > lastCountedAtRef.current) {
        activeSecondsRef.current +=
          (activeUntil - lastCountedAtRef.current) / 1000;
      }
      lastCountedAtRef.current = now;
    };

    // Use passive event listeners for zero input/scroll overhead
    const options: AddEventListenerOptions = { capture: true, passive: true };
    window.addEventListener("keydown", handleActivity, options);
    window.addEventListener("click", handleActivity, options);
    window.addEventListener("mousemove", handleActivity, options);
    window.addEventListener("scroll", handleActivity, options);

    // Flush accumulated study time to React state & localStorage
    const flushStudyTime = () => {
      accrueActiveTime(Date.now());
      if (activeSecondsRef.current >= 60) {
        const addedMinutes = Math.floor(activeSecondsRef.current / 60);
        activeSecondsRef.current %= 60;

        setProgress((p) => ({
          ...p,
          minutesStudied: (p.minutesStudied || 0) + addedMinutes,
        }));
      }
    };

    // Tick every 10 seconds to accumulate actual elapsed active time without triggering re-renders.
    const interval = setInterval(() => {
      accrueActiveTime(Date.now());
      if (activeSecondsRef.current >= 60) {
        flushStudyTime();
      }
    }, 10000);

    const handleVisibilityChange = () => {
      const now = Date.now();
      if (document.visibilityState === "hidden") {
        accrueActiveTime(now);
        trackingVisible = false;
        lastCountedAtRef.current = now;
        flushStudyTime();
      } else {
        trackingVisible = true;
        lastActivityAtRef.current = now;
        lastCountedAtRef.current = now;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", flushStudyTime);

    return () => {
      window.removeEventListener("keydown", handleActivity, options);
      window.removeEventListener("click", handleActivity, options);
      window.removeEventListener("mousemove", handleActivity, options);
      window.removeEventListener("scroll", handleActivity, options);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", flushStudyTime);
      clearInterval(interval);
      flushStudyTime();
    };
  }, [setProgress]);
  /* ── UI state ────────────────────────────────────────────── */
  const [searchTerm, setSearchTerm] = useState("");
  const [rightOpen, setRightOpen] = useState(true);
  const searchRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<unknown>(null);
  const monacoRef = useRef<any>(null);
  const completionProviderRef = useRef<any>(null);

  // Monaco Resource Garbage Collection on View Shifts
  useEffect(() => {
    if (activeView !== "playground" && activeView !== "mock-runner") {
      if (completionProviderRef.current) {
        try {
          completionProviderRef.current.dispose();
          completionProviderRef.current = null;
        } catch (err) {
          console.warn("Failed to dispose completion provider:", err);
        }
      }
      if (monacoRef.current) {
        try {
          monacoRef.current.editor.getModels().forEach((model: any) => {
            model.dispose();
          });
        } catch (err) {
          console.warn("Failed to dispose Monaco models:", err);
        }
      }
      editorRef.current = null;
      monacoRef.current = null;
    }
  }, [activeView]);

  useEffect(() => {
    return () => {
      if (completionProviderRef.current) {
        completionProviderRef.current.dispose();
      }
      if (typingIntervalRef.current !== null) {
        window.clearInterval(typingIntervalRef.current);
      }
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  /* ── auto-typing & fullscreen state ──────────────────────── */
  const [editorMaximized, setEditorMaximized] = useState(false);
  const [isAutoTyping, setIsAutoTyping] = useState(false);
  const typingIntervalRef = useRef<number | null>(null);
  const isProgrammaticChangeRef = useRef(false);
  const isMockFinishingRef = useRef(false);

  /* ── derived metrics ─────────────────────────────────────── */
  const totalModules = roadmapModules.length;
  const totalProblems = allProblems.length;

  // Pick 4 random Q&As for the dashboard
  const [qaItems] = useState(() =>
    [...interviewQuestionBank].sort(() => 0.5 - Math.random()).slice(0, 4),
  );

  /* ── mock test logic ─────────────────────────────────────── */
  useEffect(() => {
    if (activeView === "mock-runner" && mockTest?.isActive) {
      const timerId = setInterval(() => {
        setMockTest((prev) =>
          prev && prev.timeRemaining > 0
            ? { ...prev, timeRemaining: prev.timeRemaining - 1 }
            : prev,
        );
      }, 1000);
      return () => clearInterval(timerId);
    }
  }, [activeView, mockTest?.isActive]);

  useEffect(() => {
    if (
      activeView === "mock-runner" &&
      mockTest?.isActive &&
      mockTest.timeRemaining <= 0
    ) {
      finishMockTest(mockTest);
    }
  }, [activeView, mockTest?.isActive, mockTest?.timeRemaining]);

  async function startMockTest(
    company: string,
    minutes: number,
    difficulty: string,
    maxModuleId: number,
    numQuestions: number,
  ) {
    isMockFinishingRef.current = false;
    await resetDatabase();

    const diffMap: Record<string, string[]> = {
      Beginner: ["Easy"],
      "Beginner → Intermediate": ["Easy", "Medium"],
      Intermediate: ["Medium"],
      "Intermediate → Advanced": ["Medium", "Hard"],
      Advanced: ["Hard"],
    };
    const allowedDifficulties = diffMap[difficulty] || [
      "Easy",
      "Medium",
      "Hard",
    ];

    const failedMap = safeLocalStorageGet<Record<string, any>>(
      "sql-aa-failed-attempts",
      {},
    );
    const rawCandidates = allProblems.filter(
      (p) =>
        p.moduleId <= maxModuleId && allowedDifficulties.includes(p.difficulty),
    );
    const candidates = deduplicateQuestions(rawCandidates);

    const problems = candidates
      .map((p) => ({
        problem: p,
        weight:
          (failedMap[p.id] || 0) +
          (progress.solvedProblems.includes(p.id) ? 0.1 : 1.0) *
            (Math.random() + 0.5),
      }))
      .sort((a, b) => b.weight - a.weight)
      .map((x) => x.problem)
      .slice(0, numQuestions);

    const finalProblems =
      problems.length === numQuestions
        ? problems
        : candidates.sort(() => 0.5 - Math.random()).slice(0, numQuestions);

    setMockTest({
      company,
      questions: finalProblems,
      currentIndex: 0,
      answers: [],
      timeRemaining: minutes * 60,
      isActive: true,
    });
    setMockReviewIndex(0);
    updateEditorQuery("");
    setExpectedResult(null);
    setGraderFeedback(null);
    setQueryResult({
      columns: [],
      rows: [],
      message: "Run your query to test it.",
    });
    setActiveView("mock-runner");
  }

  // Robust Grader Function
  interface GraderResult {
    isCorrect: boolean;
    message: string;
    details?: string;
    warning?: string;
  }

  function verifyAnswer(
    userRes: QueryResult,
    expRes: QueryResult,
    userSnapshot: Record<string, any[]> | null,
    expSnapshot: Record<string, any[]> | null,
    solutionSql: string,
    executedUserSql?: string,
  ): GraderResult {
    const userSql = executedUserSql ?? queryRef.current;
    const cleanUser = userSql
      .replace(/(--[^\r\n]*)|(\/\*[\s\S]*?\*\/)/g, " ")
      .replace(/\s+/g, "")
      .toLowerCase();
    const cleanFlawed = (activePuzzle?.flawedQuery || "")
      .replace(/(--[^\r\n]*)|(\/\*[\s\S]*?\*\/)/g, " ")
      .replace(/\s+/g, "")
      .toLowerCase();
    const isFlawedQueryUnchanged =
      playgroundMode === "puzzle" && !!cleanFlawed && cleanUser === cleanFlawed;

    return gradeQuery({
      userQuery: userSql,
      solutionSql,
      userResult: userRes,
      expectedResult: expRes,
      userSnapshot,
      expectedSnapshot: expSnapshot,
      strictMode: graderStrict,
      playgroundMode,
      promptText:
        playgroundMode === "puzzle" && activePuzzle
          ? `${activePuzzle.businessScenario} ${activePuzzle.hint}`
          : selectedProblem?.prompt || "",
      isFlawedQueryUnchanged,
    });
  }

  async function submitMockAnswer(q: string) {
    if (!mockTest) return;
    const currentQ = mockTest.questions[mockTest.currentIndex];

    const needsSnapshot =
      isModifyingQuery(q) || isModifyingQuery(currentQ.solution);

    // 1. Reset database and run solution query FIRST to ensure clean baseline
    await resetDatabase();
    const solResult = await runQuery(currentQ.solution, true, needsSnapshot);
    const expSnapshot = solResult.snapshot ?? null;

    // 2. Reset database again and run user query
    await resetDatabase();
    const userResult = await runQuery(q, true, needsSnapshot);
    const userSnapshot = userResult.snapshot ?? null;

    const isCorrect = verifyAnswer(
      userResult,
      solResult,
      userSnapshot,
      expSnapshot,
      currentQ.solution,
      q,
    ).isCorrect;

    const newAnswers = [...mockTest.answers, { query: q, isCorrect }];

    if (mockTest.currentIndex === mockTest.questions.length - 1) {
      finishMockTest({ ...mockTest, answers: newAnswers });
    } else {
      setMockTest({
        ...mockTest,
        answers: newAnswers,
        currentIndex: mockTest.currentIndex + 1,
      });
      updateEditorQuery("");
      setExpectedResult(null);
      setGraderFeedback(null);
      setQueryResult({
        columns: [],
        rows: [],
        message: "Run your query to test it.",
      });
    }
  }

  function finishMockTest(finalState: MockTestState) {
    if (isMockFinishingRef.current) return;
    isMockFinishingRef.current = true;
    const score = Math.round(
      (finalState.answers.filter((a) => a.isCorrect).length /
        finalState.questions.length) *
        100,
    );
    setProgress((p) => {
      const nextMockScores = {
        ...p.mockScores,
        [finalState.company]: Math.max(
          p.mockScores[finalState.company] ?? 0,
          score,
        ),
      };
      let nextCompletedDays = p.completedDays ? [...p.completedDays] : [];

      const matchingDays = learningRoadmap.filter(
        (d) =>
          d.mockInterview && d.mockInterview.company === finalState.company,
      );
      for (const day of matchingDays) {
        if (
          isDayFullyComplete(
            day.day,
            p.solvedProblems,
            p.solvedPuzzles || [],
            nextMockScores,
            p.completedModules || [],
          ) &&
          !nextCompletedDays.includes(day.day)
        ) {
          nextCompletedDays.push(day.day);
        }
      }

      return {
        ...p,
        mockScores: nextMockScores,
        completedDays: nextCompletedDays,
      };
    });

    const newHistoryItem = {
      id: "mock_" + Date.now(),
      company: finalState.company,
      score,
      date: Date.now(),
    };
    setMockHistory((prev) => [newHistoryItem, ...prev]);

    setMockTest({ ...finalState, isActive: false });
    setActiveView("mock-results");
  }

  // Interview readiness combines progress across the core activities.
  // 20% Modules, 30% Problems, 20% Puzzles, 30% Mocks
  const coreMocks = [
    "Blinkit Growth Analyst",
    "Zomato Growth Analyst",
    "Paytm Finance Analyst",
    "Swiggy Business Analyst",
    "CRED Risk Analyst",
    "Myntra Marketing Analyst",
    "Ola Mobility Analyst",
    "Google Performance Engineer",
    "Walmart Supply Chain Analyst",
    "Uber Rides Analyst",
    "Netflix Streaming Analyst",
    "Stripe Financial Analyst",
  ];
  let mockSum = 0;
  let mocksTaken = 0;
  coreMocks.forEach((m) => {
    if (progress.mockScores[m] !== undefined) {
      mockSum += progress.mockScores[m];
      mocksTaken++;
    }
  });
  const mockAvgScore = mocksTaken > 0 ? mockSum / mocksTaken : 0;
  const mockCoveragePct = (mocksTaken / coreMocks.length) * 100;
  // Use raw floats to avoid double-rounding artifacts that block early progress increments
  const modPctRaw =
    totalModules > 0
      ? (progress.completedModules.length / totalModules) * 100
      : 0;
  const probPctRaw =
    totalProblems > 0
      ? (progress.solvedProblems.length / totalProblems) * 100
      : 0;
  const puzPctRaw =
    debugPuzzles.length > 0
      ? ((progress.solvedPuzzles || []).length / debugPuzzles.length) * 100
      : 0;
  const mockPctRaw = mockCoveragePct * (mockAvgScore / 100);

  const rawScore =
    modPctRaw * 0.25 + probPctRaw * 0.4 + puzPctRaw * 0.15 + mockPctRaw * 0.2;
  const hasStarted =
    progress.completedModules.length > 0 ||
    progress.solvedProblems.length > 0 ||
    (progress.solvedPuzzles || []).length > 0 ||
    mocksTaken > 0;

  // Robust weighted algorithm: Modules 25%, Core Problems 40%, Debug Puzzles 15%, Mock Coverage & Performance 20%
  const readiness = Math.min(
    100,
    hasStarted ? Math.max(1, Math.round(rawScore)) : 0,
  );

  const totalXP =
    progress.completedModules.length * 15 +
    progress.solvedProblems.length * 10 +
    (progress.solvedPuzzles || []).length * 20 +
    Object.keys(progress.mockScores).length * 100;

  const currentLevel = Math.floor(totalXP / 150) + 1;
  const xpForNextLevel = 150;
  const currentLevelXP = totalXP % 150;
  const xpProgressPercent = Math.min(
    100,
    Math.round((currentLevelXP / xpForNextLevel) * 100),
  );
  const xpRemaining = xpForNextLevel - currentLevelXP;
  const next = useMemo(
    () =>
      roadmapModules.find((m) => !progress.completedModules.includes(m.id)) ||
      roadmapModules[0],
    [progress.completedModules],
  );

  const earnedBadges = useMemo(() => {
    const list = [
      {
        id: "first_query",
        title: "First Query",
        desc: "Ran your first database query",
        icon: "🎯",
        earned: progress.queryRuns > 0,
      },
      {
        id: "select_master",
        title: "Select Master",
        desc: "Solved at least 3 practice problems",
        icon: "💾",
        earned: progress.solvedProblems.length >= 3,
      },
      {
        id: "join_champion",
        title: "Join Champion",
        desc: "Solved at least 10 practice problems",
        icon: "🔗",
        earned: progress.solvedProblems.length >= 10,
      },
      {
        id: "window_wizard",
        title: "Window Wizard",
        desc: "Solved at least 25 practice problems",
        icon: "✨",
        earned: progress.solvedProblems.length >= 25,
      },
      {
        id: "bug_hunter",
        title: "Bug Hunter",
        desc: "Solved at least 3 debugging puzzles",
        icon: "🐛",
        earned: (progress.solvedPuzzles || []).length >= 3,
      },
      {
        id: "interview_ready",
        title: "Interview Ready",
        desc: "Completed at least one Mock Interview",
        icon: "🏆",
        earned: Object.keys(progress.mockScores).length >= 1,
      },
    ];
    return list;
  }, [progress]);

  /* ── search ──────────────────────────────────────────────── */
  const filteredSearch = useMemo(() => {
    const t = searchTerm.trim().toLowerCase();
    if (!t) return [];
    const mods = roadmapModules
      .filter((m) =>
        `${m.title} ${m.level} ${m.track}`.toLowerCase().includes(t),
      )
      .slice(0, 5)
      .map((m) => ({
        type: "Module",
        label: `M${m.id}: ${m.title}`,
        id: m.id as string | number,
      }));
    const probs = allProblems
      .filter((p) =>
        `${p.title} ${p.prompt} ${p.concepts.join(" ")}`
          .toLowerCase()
          .includes(t),
      )
      .slice(0, 4)
      .map((p) => ({
        type: "Problem",
        label: p.title,
        id: p.id as string | number,
      }));
    return [...mods, ...probs];
  }, [allProblems, searchTerm]);

  const [dbReady, setDbReady] = useState(false);

  /* ── init ────────────────────────────────────────────────── */
  useEffect(() => {
    const isInteractiveSqlView = [
      "playground",
      "practice",
      "puzzles",
      "mocks",
      "mock-runner",
      "day-details",
    ].includes(activeView);

    if (!isInteractiveSqlView) return;

    const init = async () => {
      try {
        await initDatabase();
        setDbReady(true);

        let initialQuery = query;
        if (playgroundMode === "practice" && selectedProblemId) {
          const p = allProblems.find((x) => x.id === selectedProblemId);
          if (p) {
            initialQuery = getSavedDraftQuery(p);
          }
        } else if (playgroundMode === "puzzle" && activePuzzleId) {
          const p = debugPuzzles.find((x) => x.id === activePuzzleId);
          if (p) {
            initialQuery = getSavedPuzzleQuery(p);
          }
        }

        setQuery(initialQuery);
        queryRef.current = initialQuery;
        localStorage.setItem(
          "sql-aa-active-query",
          JSON.stringify(initialQuery),
        );

        setQueryResult({ columns: [], rows: [], message: "" });
        setLiveSchema(await getLiveSchema());
      } catch (err) {
        console.error("Database initialization failed:", err);
        setQueryResult({
          columns: [],
          rows: [],
          message: "Database Engine Initialization Failed",
          error:
            "Failed to initialize the SQLite database engine. Please refresh the page to reload the engine.",
        });
      }
    };
    init();
  }, [activeView]);

  const latestRunQueryRef = useRef(runCurrentQuery);
  useEffect(() => {
    latestRunQueryRef.current = runCurrentQuery;
  });

  /* ── keyboard shortcuts ──────────────────────────────────── */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      const typing =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        (e.target as HTMLElement).getAttribute("contenteditable") === "true";
      if (e.key === "/" && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "?" && !typing) {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        latestRunQueryRef.current();
      }
      if (e.key === "Escape") {
        setSearchTerm("");
        setSidebarOpen(false);
        setShowShortcuts(false);
      }
    }
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, []); // intentionally empty — runCurrentQuery is stable via latestRunQueryRef

  /* ── monaco setup ────────────────────────────────────────── */
  const handleBeforeMount: BeforeMount = useCallback((monaco) => {
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

    monaco.editor.defineTheme("dracula", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "keyword", foreground: "ff79c6", fontStyle: "bold" },
        { token: "keyword.sql", foreground: "ff79c6", fontStyle: "bold" },
        { token: "predefined", foreground: "8be9fd", fontStyle: "italic" },
        { token: "predefined.sql", foreground: "8be9fd", fontStyle: "italic" },
        { token: "type", foreground: "8be9fd" },
        { token: "type.sql", foreground: "8be9fd" },
        { token: "string", foreground: "f1fa8c" },
        { token: "string.sql", foreground: "f1fa8c" },
        { token: "number", foreground: "bd93f9" },
        { token: "number.sql", foreground: "bd93f9" },
        { token: "comment", foreground: "6272a4" },
        { token: "comment.sql", foreground: "6272a4" },
        { token: "operator", foreground: "ff79c6" },
        { token: "operator.sql", foreground: "ff79c6" },
        { token: "delimiter", foreground: "f8f8f2" },
        { token: "identifier", foreground: "f8f8f2" },
        { token: "identifier.sql", foreground: "f8f8f2" },
      ],
      colors: {
        "editor.background": "#282a36",
        "editorGutter.background": "#282a36",
        "editor.lineHighlightBackground": "#44475a",
        "editorLineNumber.foreground": "#6272a4",
        "editorLineNumber.activeForeground": "#f8f8f2",
        "editorBracketMatch.background": "#44475a",
        "editorBracketMatch.border": "#bd93f9",
      },
    });

    monaco.editor.defineTheme("one-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "keyword", foreground: "c678dd", fontStyle: "bold" },
        { token: "keyword.sql", foreground: "c678dd", fontStyle: "bold" },
        { token: "predefined", foreground: "56b6c2", fontStyle: "italic" },
        { token: "predefined.sql", foreground: "56b6c2", fontStyle: "italic" },
        { token: "type", foreground: "e5c07b" },
        { token: "type.sql", foreground: "e5c07b" },
        { token: "string", foreground: "98c379" },
        { token: "string.sql", foreground: "98c379" },
        { token: "number", foreground: "d19a66" },
        { token: "number.sql", foreground: "d19a66" },
        { token: "comment", foreground: "5c6370", fontStyle: "italic" },
        { token: "comment.sql", foreground: "5c6370", fontStyle: "italic" },
        { token: "operator", foreground: "56b6c2" },
        { token: "operator.sql", foreground: "56b6c2" },
        { token: "identifier", foreground: "abb2bf" },
        { token: "identifier.sql", foreground: "abb2bf" },
      ],
      colors: {
        "editor.background": "#282c34",
        "editorGutter.background": "#282c34",
        "editor.lineHighlightBackground": "#2c313a",
        "editorLineNumber.foreground": "#4b5263",
        "editorLineNumber.activeForeground": "#abb2bf",
        "editorBracketMatch.background": "#515a6b",
        "editorBracketMatch.border": "#c678dd",
      },
    });

    if (completionProviderRef.current) {
      try {
        completionProviderRef.current.dispose();
      } catch (err) {
        console.warn("Disposal failed:", err);
      }
    }

    const provider = monaco.languages.registerCompletionItemProvider("sql", {
      triggerCharacters: ["."],
      provideCompletionItems: (model, position) => {
        const lineContent = model.getLineContent(position.lineNumber);
        const textBeforeCursor = lineContent.substring(0, position.column - 1);

        // Match table or alias prefix before dot: e.g. "c." or "customers."
        const dotMatch = textBeforeCursor.match(/\b([a-zA-Z0-9_]+)\.$/);

        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const currentSchema =
          liveSchemaRef.current.length > 0
            ? liveSchemaRef.current
            : tableSchemas;

        if (dotMatch) {
          const tableNameOrAlias = dotMatch[1].toLowerCase();
          const fullText = model.getValue();
          let tableName = tableNameOrAlias;

          // Enhanced multi-line alias extractor (handles FROM customers c, JOIN orders o, WITH cte AS (...))
          const aliases: Record<string, string> = {};

          // 1. CTE Aliases
          const cteRegex = /\bWITH\s+([a-zA-Z0-9_]+)\s+AS\s*\(/gi;
          let cteMatch;
          while ((cteMatch = cteRegex.exec(fullText)) !== null) {
            aliases[cteMatch[1].toLowerCase()] = cteMatch[1];
          }

          // 2. Table Aliases: FROM/JOIN/LEFT JOIN/RIGHT JOIN/etc. table_name [AS] alias_name
          const tableAliasRegex =
            /\b(?:FROM|(?:LEFT\s+|RIGHT\s+|INNER\s+|FULL\s+|CROSS\s+)?JOIN)\s+([a-zA-Z0-9_]+)(?:\s+AS)?\s+([a-zA-Z0-9_]+)\b/gi;
          let match;
          while ((match = tableAliasRegex.exec(fullText)) !== null) {
            const table = match[1].toLowerCase();
            const alias = match[2].toLowerCase();
            const reserved = [
              "where",
              "join",
              "left",
              "right",
              "inner",
              "outer",
              "on",
              "group",
              "by",
              "order",
              "having",
              "limit",
              "union",
              "as",
              "select",
              "from",
              "with",
              "and",
              "or",
              "set",
              "into",
              "values",
            ];
            const tableExists = currentSchema.some(
              (t) => t.name.toLowerCase() === table,
            );
            if ((tableExists || aliases[table]) && !reserved.includes(alias)) {
              aliases[alias] = tableExists ? table : aliases[table] || table;
            }
          }

          if (aliases[tableNameOrAlias]) {
            tableName = aliases[tableNameOrAlias];
          }

          const tableSchema = currentSchema.find(
            (t) => t.name.toLowerCase() === tableName,
          );
          if (tableSchema) {
            const columnSuggestions = tableSchema.columns.map((col) => ({
              label: col.name,
              kind: monaco.languages.CompletionItemKind.Field,
              detail: `${col.type} — ${tableSchema.name} column`,
              insertText: col.name,
              range,
            }));
            return { suggestions: columnSuggestions };
          }
        }

        // --- General Autocomplete (No dot typed) ---
        const fullTextForAliases = model.getValue();
        const globalAliases: Record<string, string> = {};

        // 1. CTE Aliases
        const cteRegexGlobal = /\bWITH\s+([a-zA-Z0-9_]+)\s+AS\s*\(/gi;
        let cteMatchGlobal;
        while (
          (cteMatchGlobal = cteRegexGlobal.exec(fullTextForAliases)) !== null
        ) {
          globalAliases[cteMatchGlobal[1].toLowerCase()] = cteMatchGlobal[1];
        }

        // 2. Table Aliases
        const tableAliasRegexGlobal =
          /\b(?:FROM|(?:LEFT\s+|RIGHT\s+|INNER\s+|FULL\s+|CROSS\s+)?JOIN)\s+([a-zA-Z0-9_]+)(?:\s+AS)?\s+([a-zA-Z0-9_]+)\b/gi;
        let matchGlobal;
        while (
          (matchGlobal = tableAliasRegexGlobal.exec(fullTextForAliases)) !==
          null
        ) {
          const table = matchGlobal[1].toLowerCase();
          const alias = matchGlobal[2].toLowerCase();
          const reserved = [
            "where",
            "join",
            "left",
            "right",
            "inner",
            "outer",
            "on",
            "group",
            "by",
            "order",
            "having",
            "limit",
            "union",
            "as",
            "select",
            "from",
            "with",
            "and",
            "or",
            "set",
            "into",
            "values",
          ];
          const tableExists = currentSchema.some(
            (t) => t.name.toLowerCase() === table,
          );
          if (
            (tableExists || globalAliases[table]) &&
            !reserved.includes(alias)
          ) {
            globalAliases[alias] = tableExists
              ? table
              : globalAliases[table] || table;
          }
        }

        const useUpper = sqlUpperKeywordsRef.current;
        const keywordsList = [
          "SELECT",
          "FROM",
          "WHERE",
          "JOIN",
          "LEFT JOIN",
          "RIGHT JOIN",
          "FULL JOIN",
          "INNER JOIN",
          "GROUP BY",
          "HAVING",
          "ORDER BY",
          "CASE",
          "WHEN",
          "THEN",
          "ELSE",
          "END",
          "COUNT",
          "SUM",
          "AVG",
          "MIN",
          "MAX",
          "DISTINCT",
          "ROW_NUMBER",
          "RANK",
          "DENSE_RANK",
          "LEAD",
          "LAG",
          "PARTITION BY",
          "WITH",
          "UNION",
          "UNION ALL",
          "LIMIT",
          "OFFSET",
          "COALESCE",
          "NULLIF",
          "CAST",
          "SUBSTR",
          "TRIM",
          "UPPER",
          "LOWER",
          "ROUND",
          "DATE",
          "JULIANDAY",
          "IS NULL",
          "IS NOT NULL",
          "BETWEEN",
          "IN",
          "LIKE",
          "NOT IN",
          "ASC",
          "DESC",
          "OVER",
          "AS",
          "ON",
          "AND",
          "OR",
          "NOT",
          "NULL",
        ].map((k) => (useUpper ? k.toUpperCase() : k.toLowerCase()));

        // Check which tables are active in the current query
        const queryWords = new Set(
          fullTextForAliases.toLowerCase().split(/[^a-zA-Z0-9_]+/),
        );
        const activeTableNames = new Set(
          currentSchema
            .map((t) => t.name.toLowerCase())
            .filter((name) => queryWords.has(name)),
        );

        // 1. Keywords
        const keywordItems = keywordsList.map((label) => ({
          label,
          kind: monaco.languages.CompletionItemKind.Keyword,
          detail: "SQL Keyword",
          insertText: label,
          range,
          sortText: `05_${label.toLowerCase()}`,
        }));

        // 2. Tables
        const tableItems = currentSchema.map((t) => {
          const isTableActive = activeTableNames.has(t.name.toLowerCase());
          return {
            label: t.name,
            kind: monaco.languages.CompletionItemKind.Class,
            detail: `Database Table (${t.columns.length} columns)${isTableActive ? " (active)" : ""}`,
            insertText: t.name,
            range,
            sortText: isTableActive ? `02_${t.name}` : `03_${t.name}`,
          };
        });

        // 3. Columns
        const columnItems = currentSchema.flatMap((t) => {
          const isTableActive = activeTableNames.has(t.name.toLowerCase());
          return t.columns.map((c) => ({
            label: c.name,
            kind: monaco.languages.CompletionItemKind.Field,
            detail: `${c.type} — ${t.name} column${isTableActive ? " (active)" : ""}`,
            insertText: c.name,
            range,
            sortText: isTableActive ? `01_${c.name}` : `04_${c.name}`,
          }));
        });

        // 4. Aliases
        const aliasItems = Object.entries(globalAliases).map(
          ([alias, targetTable]) => ({
            label: alias,
            kind: monaco.languages.CompletionItemKind.Variable,
            detail: `Table Alias (${targetTable})`,
            insertText: alias,
            range,
            sortText: `00_${alias}`,
          }),
        );

        // 5. User-defined Aliases (e.g. column aliases via AS)
        const userAliases: Set<string> = new Set();
        const asRegex = /\bAS\s+([a-zA-Z0-9_]+)\b/gi;
        let asMatch;
        while ((asMatch = asRegex.exec(fullTextForAliases)) !== null) {
          const alias = asMatch[1];
          const lowerAlias = alias.toLowerCase();
          const isKeyword = keywordsList.some(
            (k) => k.toLowerCase() === lowerAlias,
          );
          const isTable = currentSchema.some(
            (t) => t.name.toLowerCase() === lowerAlias,
          );
          const commonTypes = [
            "int",
            "integer",
            "real",
            "text",
            "numeric",
            "varchar",
            "double",
            "float",
            "date",
            "julianday",
            "timestamp",
            "boolean",
            "char",
            "json",
            "blob",
          ];
          const isType = commonTypes.includes(lowerAlias);
          if (!isKeyword && !isTable && !isType) {
            userAliases.add(alias);
          }
        }

        const userAliasItems = Array.from(userAliases).map((alias) => ({
          label: alias,
          kind: monaco.languages.CompletionItemKind.Variable,
          detail: `Query Alias`,
          insertText: alias,
          range,
          sortText: `00_${alias}`,
        }));

        // Deduplicate suggestions by label
        const suggestionsMap = new Map<string, any>();
        [
          ...aliasItems,
          ...userAliasItems,
          ...tableItems,
          ...columnItems,
          ...keywordItems,
        ].forEach((item) => {
          if (!suggestionsMap.has(item.label.toLowerCase())) {
            suggestionsMap.set(item.label.toLowerCase(), item);
          }
        });

        const snippets = [
          {
            label: "SELECT template",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText:
              "SELECT\n  ${1:*}\nFROM ${2:table}\nWHERE ${3:condition};",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Create a basic SELECT template query",
            range,
            sortText: "06_select_template",
          },
          {
            label: "JOIN template",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText:
              "JOIN ${1:table2} ON ${2:table1}.${3:id} = ${4:table2}.${5:foreign_id}",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Create an INNER JOIN template",
            range,
            sortText: "06_join_template",
          },
          {
            label: "LEFT JOIN template",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText:
              "LEFT JOIN ${1:table2} ON ${2:table1}.${3:id} = ${4:table2}.${5:foreign_id}",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Create a LEFT OUTER JOIN template",
            range,
            sortText: "06_left_join_template",
          },
          {
            label: "WITH (CTE) template",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText:
              "WITH ${1:cte_name} AS (\n  SELECT ${2:*}\n  FROM ${3:table}\n)\nSELECT * FROM ${1:cte_name};",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation:
              "Create a Common Table Expression (CTE) query template",
            range,
            sortText: "06_cte_template",
          },
          {
            label: "CASE WHEN template",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText:
              "CASE\n  WHEN ${1:condition} THEN ${2:value}\n  ELSE ${3:default_value}\nEND",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Create a conditional CASE statement",
            range,
            sortText: "06_case_when_template",
          },
          {
            label: "WINDOW function template",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText:
              "${1:ROW_NUMBER()} OVER (PARTITION BY ${2:column} ORDER BY ${3:sort_column} ${4:DESC})",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Create a window function OVER clause",
            range,
            sortText: "06_window_template",
          },
        ];

        return {
          suggestions: [...Array.from(suggestionsMap.values()), ...snippets],
        };
      },
    });

    completionProviderRef.current = provider;
  }, []);

  const runCurrentQueryRef = useRef<() => void>(() => {});

  const handleMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Remeasure fonts when browser fonts are ready (prevents cursor click offset bug)
    if (typeof document !== "undefined" && (document as any).fonts) {
      (document as any).fonts.ready.then(() => {
        try {
          monaco.editor.remeasureFonts();
          editor.layout();
        } catch {}
        [100, 500].forEach((delay) => {
          setTimeout(() => {
            try {
              monaco.editor.remeasureFonts();
              editor.layout();
            } catch {}
          }, delay);
        });
      });
    }

    // Bind Alt+X to run query
    editor.addAction({
      id: "run-sql-query-alt-x",
      label: "Run SQL Query (Alt+X)",
      keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.KeyX],
      run: () => {
        runCurrentQueryRef.current();
      },
    });

    // Bind Alt+Enter to run query
    editor.addAction({
      id: "run-sql-query-alt-enter",
      label: "Run SQL Query (Alt+Enter)",
      keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.Enter],
      run: () => {
        runCurrentQueryRef.current();
      },
    });

    // Bind Ctrl+Enter / Cmd+Enter to run query
    editor.addAction({
      id: "run-sql-query-ctrl-enter",
      label: "Run SQL Query (Ctrl+Enter)",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => {
        runCurrentQueryRef.current();
      },
    });

    // Bind F5 to run query
    editor.addAction({
      id: "run-sql-query-f5",
      label: "Run SQL Query (F5)",
      keybindings: [monaco.KeyCode.F5],
      run: () => {
        runCurrentQueryRef.current();
      },
    });

    // Bind Ctrl+Y to Redo in Monaco Editor
    editor.addAction({
      id: "redo-action-ctrl-y",
      label: "Redo (Ctrl+Y)",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyY],
      run: (ed) => {
        ed.trigger("keyboard", "redo", null);
      },
    });

    // Bind Ctrl+Z to Undo in Monaco Editor
    editor.addAction({
      id: "undo-action-ctrl-z",
      label: "Undo (Ctrl+Z)",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyZ],
      run: (ed) => {
        ed.trigger("keyboard", "undo", null);
      },
    });

    // Direct Clipboard Paste action to eliminate double-click browser prompts
    editor.addAction({
      id: "direct-clipboard-paste",
      label: "Direct Paste from Clipboard",
      contextMenuGroupId: "9_cutcopypaste",
      contextMenuOrder: 3,
      run: async (ed) => {
        try {
          const text = await navigator.clipboard.readText();
          if (text) {
            const selection = ed.getSelection();
            if (selection) {
              ed.executeEdits("direct-paste", [
                {
                  range: selection,
                  text: text,
                  forceMoveMarkers: true,
                },
              ]);
            }
          }
        } catch {
          ed.trigger("keyboard", "paste", null);
        }
      },
    });

    // Bind Shift+Alt+F to format SQL
    editor.addAction({
      id: "format-sql-action",
      label: "Format SQL (Shift+Alt+F)",
      keybindings: [
        monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF,
      ],
      run: async (ed) => {
        const val = ed.getValue();
        if (val) {
          const formatted = (await loadSqlEngine()).formatSql(val);
          ed.executeEdits("format", [
            {
              range: ed.getModel()!.getFullModelRange(),
              text: formatted,
            },
          ]);
        }
      },
    });

    editor.onMouseDown((e: any) => {
      if (
        e.target &&
        (e.target.type === monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS ||
          e.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN ||
          e.target.type ===
            monaco.editor.MouseTargetType.GUTTER_LINE_DECORATIONS)
      ) {
        const line = e.target.position?.lineNumber;
        if (line) {
          editor.setPosition({ lineNumber: line, column: 1 });
          editor.focus();
        }
      }
    });
  }, []);

  /* ── SQL actions ─────────────────────────────────────────── */

  async function runCurrentQuery() {
    if (editorMaximized) {
      setEditorMaximized(false);
    }
    let sql = queryRef.current;
    if (
      rowLimit !== "Unlimited" &&
      /^\s*SELECT\b/i.test(sql) &&
      !/\bLIMIT\b/i.test(sql)
    ) {
      sql = `${sql.trim().replace(/;+$/, "")} LIMIT ${rowLimit};`;
    }

    // Block modifying queries on read-only challenges
    if (playgroundMode === "practice" && selectedProblem) {
      const solutionIsReadOnly = !isModifyingQuery(selectedProblem.solution);
      if (solutionIsReadOnly && isModifyingQuery(sql)) {
        setQueryResult({
          columns: [],
          rows: [],
          message: "Query Blocked",
          error:
            "Data modification (DML/DDL) is blocked on read-only SELECT challenges. " +
            "Please rewrite your query using SELECT.",
        });
        setExpectedResult(null);
        return;
      }
    }

    const isMockMode = activeView === "mock-runner";
    const needsSnapshot = isModifyingQuery(sql);

    if (isMockMode) {
      const currentQ = mockTest
        ? mockTest.questions[mockTest.currentIndex]
        : null;
      const solutionSql = currentQ?.solution || "";
      const solutionNeedsSnapshot = !!(
        solutionSql && isModifyingQuery(solutionSql)
      );
      const combinedNeedsSnapshot = needsSnapshot || solutionNeedsSnapshot;

      let expected: QueryResult | null = null;
      let expectedSnapshot: Record<string, any[]> | null = null;

      if (solutionSql) {
        await resetDatabase();
        const res = await runQuery(solutionSql, true, combinedNeedsSnapshot);
        expected = res;
        expectedSnapshot = res.snapshot ?? null;
      }

      await resetDatabase();
      const result = await runQuery(sql, true, combinedNeedsSnapshot);
      const userSnapshot = result.snapshot ?? null;
      setQueryResult(result);
      setLiveSchema(await getLiveSchema());

      if (expected) {
        setExpectedResult(expected);
        const feedback = verifyAnswer(
          result,
          expected,
          userSnapshot,
          expectedSnapshot,
          solutionSql,
          sql,
        );
        setGraderFeedback(feedback);
      }
      return;
    }

    let solutionSql = "";
    if (playgroundMode === "puzzle" && activePuzzle?.solutionQuery) {
      solutionSql = activePuzzle.solutionQuery;
    } else if (selectedProblem?.solution) {
      solutionSql = selectedProblem.solution;
    }

    const isFreeformMode = playgroundMode === "free" && !solutionSql;
    if (isFreeformMode) {
      const result = await runQuery(sql, false, needsSnapshot);
      setQueryResult(result);
      setLiveSchema(await getLiveSchema());
      setGraderFeedback(null);
      return;
    }

    let expected: QueryResult | null = null;
    let expectedSnapshot: Record<string, any[]> | null = null;

    const solutionNeedsSnapshot = !!(
      solutionSql && isModifyingQuery(solutionSql)
    );
    const combinedNeedsSnapshot = needsSnapshot || solutionNeedsSnapshot;

    if (solutionSql) {
      await resetDatabase(); // Ensure clean state before running solution
      const res = await runQuery(solutionSql, true, combinedNeedsSnapshot);
      expected = res;
      expectedSnapshot = res.snapshot ?? null;
    }

    // 2. Now run user query
    await resetDatabase(); // Must reset again so user query runs on a clean DB!
    const isSandboxMode =
      playgroundMode === "practice" || playgroundMode === "puzzle";
    const result = await runQuery(sql, isSandboxMode, combinedNeedsSnapshot);
    const userSnapshot = result.snapshot ?? null;

    const status: QueryHistoryItem["status"] = result.error
      ? "error"
      : "success";
    setQueryResult(result);

    // Dynamic Schema Sync
    setLiveSchema(await getLiveSchema());

    setQueryHistory((h) =>
      [
        {
          id: crypto.randomUUID(),
          query: sql,
          createdAt: new Date().toISOString(),
          status,
          rowCount: result.rows?.length ?? 0,
          durationMs: result.durationMs ?? 0,
        },
        ...h,
      ].slice(0, 50),
    );
    setProgress((p) => ({ ...p, queryRuns: p.queryRuns + 1 }));

    // 3. Compare values
    if (expected) {
      setExpectedResult(expected);
      const feedback = verifyAnswer(
        result,
        expected,
        userSnapshot,
        expectedSnapshot,
        solutionSql,
        sql,
      );
      setGraderFeedback(feedback);
      const isCorrect = feedback.isCorrect;
      if (isCorrect) {
        if (playgroundMode === "practice" && selectedProblem) {
          const attempts = safeLocalStorageGet<Record<string, any>>(
            "sql-aa-failed-attempts",
            {},
          );
          const failedCount = attempts[selectedProblem.id] || 0;
          const quality = failedCount > 0 ? 3 : 5;
          markProblemSolved(selectedProblem, quality);
        } else if (playgroundMode === "puzzle" && activePuzzle) {
          markPuzzleSolved(activePuzzle);
        }
      } else {
        if (playgroundMode === "practice" && selectedProblem) {
          const attempts = safeLocalStorageGet<Record<string, any>>(
            "sql-aa-failed-attempts",
            {},
          );
          attempts[selectedProblem.id] =
            (attempts[selectedProblem.id] || 0) + 1;
          localStorage.setItem(
            "sql-aa-failed-attempts",
            JSON.stringify(attempts),
          );
        }
      }
    } else {
      setExpectedResult(null);
      setGraderFeedback(null);
    }
  }

  runCurrentQueryRef.current = runCurrentQuery;

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Alt + X or Alt + x
      if (e.altKey && (e.key === "x" || e.key === "X" || e.code === "KeyX")) {
        e.preventDefault();
        runCurrentQueryRef.current();
      }
      // Alt + Enter
      if (e.altKey && e.key === "Enter") {
        e.preventDefault();
        runCurrentQueryRef.current();
      }
      // Ctrl + Enter or Cmd + Enter
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        runCurrentQueryRef.current();
      }
      // F5
      if (e.key === "F5") {
        e.preventDefault();
        runCurrentQueryRef.current();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
  }

  /* ── learning actions ────────────────────────────────────── */
  function selectModule(m: RoadmapModule) {
    stopAutoTyping();
    setActiveModuleId(m.id);
    setSelectedProblemId(m.problems[0]?.id ?? "");
  }

  function selectProblem(p: PracticeProblem) {
    stopAutoTyping();
    setSelectedProblemId(p.id);
    setActiveModuleId(p.moduleId);
    const saved = getSavedDraftQuery(p);
    updateEditorQuery(saved, "practice", p.id);
  }

  async function openInPlayground(p: PracticeProblem) {
    stopAutoTyping();
    setPlaygroundMode("practice");
    const saved = getSavedDraftQuery(p);
    updateEditorQuery(saved, "practice", p.id);
    setSelectedProblemId(p.id);
    setActiveModuleId(p.moduleId);
    const parentDay = learningRoadmap.find((d) =>
      d.modules.includes(p.moduleId),
    );
    if (parentDay) {
      setSelectedDayId(parentDay.day);
    }
    setActiveView("playground");
    setQueryResult({ columns: [], rows: [], message: "" });
    setGraderFeedback(null);
    if (p.solution) {
      await resetDatabase();
      const needsSnapshot = isModifyingQuery(p.solution);
      const res = await runQuery(p.solution, true, needsSnapshot);
      setExpectedResult(res);
    } else {
      setExpectedResult(null);
    }
  }

  function isDayFullyComplete(
    dayNum: number,
    solvedProbs: string[],
    solvedPuzs: string[],
    mockScrs: Record<string, number>,
    completedMods: number[] = [],
  ): boolean {
    const parentDay = learningRoadmap.find((d) => d.day === dayNum);
    if (!parentDay) return false;

    // 1. All day modules (lessons) must be completed/read
    const allModulesCompleted = parentDay.modules.every((mId) =>
      completedMods.includes(mId),
    );
    if (!allModulesCompleted) return false;

    // 2. All practice problems in day modules must be solved
    const dayModules = parentDay.modules
      .map((mId) => roadmapModules.find((m) => m.id === mId))
      .filter((m): m is RoadmapModule => m !== undefined);
    const dayProblems = dayModules.flatMap((m) => m.problems);
    const allProbsSolved =
      dayProblems.length === 0 ||
      dayProblems.every((p) => solvedProbs.includes(p.id));
    if (!allProbsSolved) return false;

    // 3. All debug puzzles assigned to this day must be solved
    const dayPuzzles = debugPuzzles.filter((pz) => pz.dayId === dayNum);
    const allPuzzlesSolved =
      dayPuzzles.length === 0 ||
      dayPuzzles.every((pz) => solvedPuzs.includes(pz.id));
    if (!allPuzzlesSolved) return false;

    // 4. If day features a mock interview, mock score must be > 0
    if (parentDay.mockInterview && parentDay.mockInterview.company) {
      const score = mockScrs[parentDay.mockInterview.company] ?? 0;
      if (score <= 0) return false;
    }

    return true;
  }

  // Repair legacy/manual completion flags. A day is complete only when its
  // actual learning requirements are complete; opening a lesson or revealing
  // its answer must never mark it as finished.
  useEffect(() => {
    setProgress((prev) => {
      const validCompletedModules = (prev.completedModules || []).filter(
        (moduleId) => {
          const module = roadmapModules.find((m) => m.id === moduleId);
          return Boolean(
            module &&
            (module.problems.length === 0 ||
              module.problems.every((problem) =>
                prev.solvedProblems.includes(problem.id),
              )),
          );
        },
      );
      const validCompletedDays = (prev.completedDays || []).filter((day) =>
        isDayFullyComplete(
          day,
          prev.solvedProblems,
          prev.solvedPuzzles || [],
          prev.mockScores || {},
          prev.completedModules || [],
        ),
      );

      const modulesChanged =
        validCompletedModules.length !== (prev.completedModules || []).length;
      const daysChanged =
        validCompletedDays.length !== (prev.completedDays || []).length;

      return modulesChanged || daysChanged
        ? {
            ...prev,
            completedModules: validCompletedModules,
            completedDays: validCompletedDays,
          }
        : prev;
    });
  }, [debugPuzzles, learningRoadmap, roadmapModules]);

  function markModuleDone(id: number) {
    setProgress((p) => {
      const module = roadmapModules.find((m) => m.id === id);
      const requirementsComplete = Boolean(
        module &&
        (module.problems.length === 0 ||
          module.problems.every((problem) =>
            p.solvedProblems.includes(problem.id),
          )),
      );
      if (!requirementsComplete) {
        showToast(
          "Solve all problems in this module before completing it.",
          "info",
        );
        return p;
      }

      const alreadyCompleted = p.completedModules.includes(id);
      const nextModules = alreadyCompleted
        ? p.completedModules
        : [...p.completedModules, id];
      let nextCompletedDays = p.completedDays ? [...p.completedDays] : [];

      const parentDay = learningRoadmap.find((d) => d.modules.includes(id));
      if (parentDay) {
        if (
          isDayFullyComplete(
            parentDay.day,
            p.solvedProblems,
            p.solvedPuzzles || [],
            p.mockScores || {},
            nextModules,
          ) &&
          !nextCompletedDays.includes(parentDay.day)
        ) {
          nextCompletedDays.push(parentDay.day);
        }
      }

      return {
        ...p,
        completedModules: nextModules,
        completedDays: nextCompletedDays,
      };
    });
  }

  function toggleDayComplete(day: number) {
    setProgress((p) => {
      const days = p.completedDays || [];
      if (days.includes(day)) {
        return { ...p, completedDays: days.filter((d) => d !== day) };
      }

      if (
        !isDayFullyComplete(
          day,
          p.solvedProblems,
          p.solvedPuzzles || [],
          p.mockScores || {},
          p.completedModules || [],
        )
      ) {
        showToast("Complete the day’s learning requirements first.", "info");
        return p;
      }

      return { ...p, completedDays: [...days, day] };
    });
  }

  function toggleChecklistItem(itemId: string) {
    setProgress((p) => {
      const items = p.completedChecklistItems || [];
      return {
        ...p,
        completedChecklistItems: items.includes(itemId)
          ? items.filter((id) => id !== itemId)
          : [...items, itemId],
      };
    });
  }

  const [sm2Progress, setSm2Progress] = useState<SM2ProgressMap>(() =>
    loadSM2Progress(),
  );

  function markProblemSolved(p: PracticeProblem, quality = 4) {
    if (!progress.solvedProblems.includes(p.id)) {
    }
    const updatedSM2 = calculateSM2(sm2Progress[p.id], p.id, quality);
    setSm2Progress((prev) => {
      const next = { ...prev, [p.id]: updatedSM2 };
      saveSM2Progress(next);
      return next;
    });
    setProgress((prev) => {
      const alreadySolved = prev.solvedProblems.includes(p.id);
      const nextSolved = alreadySolved
        ? prev.solvedProblems
        : [...prev.solvedProblems, p.id];

      let nextCompletedModules = [...prev.completedModules];
      let nextCompletedDays = prev.completedDays ? [...prev.completedDays] : [];

      const moduleId = p.moduleId;
      const mod = roadmapModules.find((m) => m.id === moduleId);
      if (mod) {
        const allModProblemsSolved = mod.problems.every((prob) =>
          nextSolved.includes(prob.id),
        );
        if (allModProblemsSolved && !nextCompletedModules.includes(moduleId)) {
          nextCompletedModules.push(moduleId);
        }
      }

      const parentDay = learningRoadmap.find((d) =>
        d.modules.includes(moduleId),
      );
      if (parentDay) {
        if (
          isDayFullyComplete(
            parentDay.day,
            nextSolved,
            prev.solvedPuzzles || [],
            prev.mockScores || {},
            nextCompletedModules,
          ) &&
          !nextCompletedDays.includes(parentDay.day)
        ) {
          nextCompletedDays.push(parentDay.day);
        }
      }

      return {
        ...prev,
        solvedProblems: nextSolved,
        completedModules: nextCompletedModules,
        completedDays: nextCompletedDays,
      };
    });
  }

  function markPuzzleSolved(p: SqlPuzzle) {
    const sp = progress.solvedPuzzles || [];
    if (!sp.includes(p.id)) {
    }
    setProgress((prev) => {
      const sp = prev.solvedPuzzles || [];
      const nextSolvedPuzzles = sp.includes(p.id) ? sp : [...sp, p.id];

      let nextCompletedDays = prev.completedDays ? [...prev.completedDays] : [];
      if (p.dayId) {
        if (
          isDayFullyComplete(
            p.dayId,
            prev.solvedProblems,
            nextSolvedPuzzles,
            prev.mockScores || {},
            prev.completedModules || [],
          ) &&
          !nextCompletedDays.includes(p.dayId)
        ) {
          nextCompletedDays.push(p.dayId);
        }
      }

      return {
        ...prev,
        solvedPuzzles: nextSolvedPuzzles,
        completedDays: nextCompletedDays,
      };
    });
  }

  function handleSearchPick(item: { type: string; id: string | number }) {
    if (item.type === "Module" && typeof item.id === "number") {
      const m = roadmapModules.find((x) => x.id === item.id);
      if (m) {
        selectModule(m);
        setActiveView("modules");
      }
    }
    if (item.type === "Problem" && typeof item.id === "string") {
      const p = allProblems.find((x) => x.id === item.id);
      if (p) {
        selectProblem(p);
        setActiveView("practice");
      }
    }
    if (item.type === "Puzzle" && typeof item.id === "string") {
      const pz = debugPuzzles.find((x) => x.id === item.id);
      if (pz) {
        openPuzzleInPlayground(pz);
      }
    }
    setSearchTerm("");
  }

  /* RENDER HELPERS */

  /* ── views ─────────────────────────────────────────────── */

  async function openPuzzleInPlayground(p: SqlPuzzle) {
    stopAutoTyping();
    setActivePuzzleId(p.id);
    setPlaygroundMode("puzzle");

    let saved = getSavedPuzzleQuery(p);

    if (p.dayId) {
      setSelectedDayId(p.dayId);
    }
    setActiveView("playground");
    setQueryResult({ columns: [], rows: [], message: "" });
    setGraderFeedback(null);

    let expectedRes: QueryResult | null = null;
    if (p.solutionQuery) {
      await resetDatabase();
      const needsSnapshot = isModifyingQuery(p.solutionQuery);
      expectedRes = await runQuery(p.solutionQuery, true, needsSnapshot);
      setExpectedResult(expectedRes);
    } else {
      setExpectedResult(null);
    }

    // Solve at core: If the puzzle is unsolved, but the loaded draft query is correct,
    // discard the draft and reset to the original flawed query.
    const isSolved = progress.solvedPuzzles?.includes(p.id);
    if (!isSolved && saved && saved !== p.flawedQuery && expectedRes) {
      await resetDatabase();
      const userRes = await runQuery(saved, true, isModifyingQuery(saved));
      const grade = verifyAnswer(
        userRes,
        expectedRes,
        (userRes as any).snapshot ?? null,
        (expectedRes as any).snapshot ?? null,
        p.solutionQuery,
        saved,
      );
      if (grade.isCorrect) {
        saved = p.flawedQuery;
        const drafts = safeLocalStorageGet<Record<string, any>>(
          "sql-aa-puzzle-drafts",
          {},
        );
        delete drafts[p.id];
        localStorage.setItem("sql-aa-puzzle-drafts", JSON.stringify(drafts));
      }
    }

    updateEditorQuery(saved, "puzzle", p.id);
  }

  function getDialectNotes(
    moduleId: number,
  ): { title: string; notes: string } | null {
    switch (moduleId) {
      case 4: // Module 4 — Limiting Results (LIMIT)
        return {
          title: "MySQL LIMIT",
          notes:
            "MySQL uses LIMIT to restrict rows: SELECT col FROM tbl LIMIT 5;\n" +
            "For pagination, use LIMIT offset, row_count or LIMIT row_count OFFSET offset.",
        };
      case 19: // Module 19 — Full Joins (FULL OUTER JOIN)
        return {
          title: "FULL OUTER JOIN Support",
          notes:
            "• MySQL does not support FULL OUTER JOIN natively. Simulate it using " +
            "LEFT JOIN + UNION + reverse LEFT JOIN (with IS NULL filter to exclude duplicates).",
        };
      case 25: // Module 25 — Window Functions: ROW_NUMBER
      case 26: // Module 26 — Window Functions: RANK & DENSE_RANK
      case 27: // Module 27 — Window Functions: LEAD & LAG
      case 28: // Module 28 — Running Totals (window SUM OVER)
        return {
          title: "Window Functions Dialect Support",
          notes:
            "MySQL 8.0+ supports OVER (PARTITION BY ... ORDER BY ...). Older MySQL versions require " +
            "session variables or correlated subqueries.",
        };
      case 30: // Module 30 — INTERSECT & EXCEPT
        return {
          title: "Set Ops (INTERSECT & EXCEPT) Dialect Support",
          notes:
            "• MySQL 8.0.31+ supports INTERSECT and EXCEPT. For older versions, use these workarounds:\n" +
            "  EXCEPT → LEFT JOIN with IS NULL: SELECT a.id FROM tblA a " +
            "LEFT JOIN tblB b ON a.id = b.id WHERE b.id IS NULL\n" +
            "  INTERSECT → INNER JOIN on the key column.",
        };
      case 8: // Module 8 — Range Filtering with BETWEEN (includes date range filtering)
        return {
          title: "Date Formatting & Range Filtering",
          notes:
            "Use MySQL DATE_FORMAT(order_date, '%Y-%m-%d') or DATE(order_date) for formatting.\n" +
            "Date comparison: order_date BETWEEN '2024-01-01' AND '2024-12-31'.",
        };
      case 6: // Module 6 — Pattern Matching with LIKE (string functions)
        return {
          title: "String Functions & Concatenation",
          notes:
            "• LIKE wildcards: % (any chars) and _ (single char) are standard across all dialects.\n" +
            "• Concatenation: CONCAT(first_name, ' ', last_name)\n" +
            "• Case sensitivity: LIKE is commonly case-insensitive under MySQL's default collations.",
        };
      case 31: // Module 31 — Conditional Logic: CASE WHEN
        return {
          title: "CASE WHEN Compatibility",
          notes:
            "• All Dialects: CASE WHEN syntax is fully standardized and portable across MySQL, " +
            "CASE WHEN is fully supported and portable in MySQL 8.0.\n" +
            "Use CASE WHEN inside SUM() for conditional aggregation.",
        };
      case 32: // Module 32 — Manual Pivoting
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

  // INTERACTIVE ERD EXPLORER MODAL

  // ONBOARDING AND LESSON MODALS

  useEffect(() => {
    if (!customConfirmOpen && !customPromptOpen) return;
    const modalId = customConfirmOpen
      ? "custom-confirm-dialog"
      : "custom-prompt-dialog";
    const timer = setTimeout(() => {
      const modalElement = document.getElementById(modalId);
      if (!modalElement) return;

      const focusable = modalElement.querySelectorAll(
        'button, input, [tabindex="0"]',
      );
      if (focusable.length > 0) {
        const inputEl = modalElement.querySelector("input");
        if (inputEl) {
          inputEl.focus();
        } else {
          (focusable[0] as HTMLElement).focus();
        }
      }
    }, 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCustomConfirmOpen(false);
        setCustomPromptOpen(false);
      }
      if (e.key === "Tab") {
        const modalElement =
          document.getElementById("custom-confirm-dialog") ||
          document.getElementById("custom-prompt-dialog");
        if (!modalElement) return;
        const focusable = modalElement.querySelectorAll(
          'button, input, [tabindex="0"]',
        );
        if (focusable.length > 0) {
          const first = focusable[0] as HTMLElement;
          const last = focusable[focusable.length - 1] as HTMLElement;
          if (e.shiftKey) {
            if (document.activeElement === first) {
              last.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === last) {
              first.focus();
              e.preventDefault();
            }
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [customConfirmOpen, customPromptOpen]);

  function renderCustomConfirmModal() {
    if (!customConfirmOpen) return null;
    return (
      <div className="custom-modal-overlay" style={{ zIndex: 10000 }}>
        <div
          id="custom-confirm-dialog"
          className="custom-modal-window"
          style={{ maxWidth: "400px" }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
        >
          <div className="custom-modal-header">
            <h2 id="confirm-modal-title">
              <AlertTriangle size={18} style={{ color: "var(--amber)" }} />
              <span>Confirm Action</span>
            </h2>
            <button
              className="icon-button"
              onClick={() => setCustomConfirmOpen(false)}
              aria-label="Close modal"
            >
              <X size={16} />
            </button>
          </div>
          <div className="custom-modal-body">
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                lineHeight: "1.5",
                color: "var(--text)",
              }}
            >
              {customConfirmMessage}
            </p>
          </div>
          <div
            className="custom-modal-footer"
            style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}
          >
            <button
              className="primary-button outline compact"
              onClick={() => setCustomConfirmOpen(false)}
            >
              Cancel
            </button>
            <button
              className="primary-button compact"
              onClick={() => {
                if (customConfirmOnConfirm) customConfirmOnConfirm();
                setCustomConfirmOpen(false);
              }}
              style={{ background: "var(--rose)", borderColor: "var(--rose)" }}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderCustomPromptModal() {
    if (!customPromptOpen) return null;
    return (
      <div className="custom-modal-overlay" style={{ zIndex: 10000 }}>
        <div
          id="custom-prompt-dialog"
          className="custom-modal-window"
          style={{ maxWidth: "400px" }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="prompt-modal-title"
        >
          <div className="custom-modal-header">
            <h2 id="prompt-modal-title">
              <Edit3 size={18} style={{ color: "var(--violet)" }} />
              <span>Input Required</span>
            </h2>
            <button
              className="icon-button"
              onClick={() => setCustomPromptOpen(false)}
              aria-label="Close modal"
            >
              <X size={16} />
            </button>
          </div>
          <div className="custom-modal-body">
            <p
              style={{
                margin: "0 0 10px 0",
                fontSize: "12px",
                color: "var(--text-secondary)",
              }}
            >
              {customPromptMessage}
            </p>
            <input
              type="text"
              value={customPromptValue}
              onChange={(e) => setCustomPromptValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (customPromptOnSubmit)
                    customPromptOnSubmit(customPromptValue);
                  setCustomPromptOpen(false);
                }
              }}
              autoFocus
              style={{
                width: "100%",
                background: "var(--input-bg)",
                border: "1px solid var(--border)",
                fontSize: "12px",
                color: "var(--text)",
                padding: "6px 10px",
                borderRadius: "4px",
              }}
            />
          </div>
          <div
            className="custom-modal-footer"
            style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}
          >
            <button
              className="primary-button outline compact"
              onClick={() => setCustomPromptOpen(false)}
            >
              Cancel
            </button>
            <button
              className="primary-button compact"
              onClick={() => {
                if (customPromptOnSubmit)
                  customPromptOnSubmit(customPromptValue);
                setCustomPromptOpen(false);
              }}
              style={{
                background: "var(--violet)",
                borderColor: "var(--violet)",
              }}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ROADMAP DAY DETAILS VIEW

  /* SHELL */

  return (
    <div className={`app-shell ${sidebarOpen ? "sb-open" : "sb-closed"}`}>
      {sidebarOpen && (
        <>
          <div
            className="sidebar-backdrop"
            onClick={() => setSidebarOpen(false)}
          />
          {/* ── SIDEBAR ───────────────────────────────────── */}
          <aside className="sidebar">
            <div
              className="brand-row"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <div
                  className="brand-mark"
                  style={{
                    background: "rgba(56, 217, 255, 0.12)",
                    border: "1px solid rgba(56, 217, 255, 0.3)",
                    borderRadius: "8px",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--cyan)",
                  }}
                >
                  <Database size={17} />
                </div>
                <div>
                  <strong>SQL</strong>
                  <span>Academy</span>
                </div>
              </div>
              <button
                className="icon-button sidebar-toggle-btn"
                onClick={() => setSidebarOpen((o) => !o)}
                title="Toggle Sidebar"
                aria-label="Toggle Sidebar"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  padding: "6px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Menu size={18} />
              </button>
            </div>

            <nav
              className="sidebar-nav"
              role="tablist"
              aria-label="Main Navigation"
              onKeyDown={handleSidebarNavKeyDown}
            >
              {navItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  className={activeView === id ? "active" : ""}
                  onClick={() => {
                    if (id === "playground") {
                      enterFreeformPlayground();
                    } else if (id === "roadmap" || id === "day-details") {
                      if (!selectedDayId) {
                        setSelectedDayId(activeDayWhereLeftOff);
                      }
                      setActiveView(id);
                    } else {
                      setActiveView(id);
                    }
                    setSidebarOpen(false); // always close sidebar after nav pick
                  }}
                  role="tab"
                  aria-selected={activeView === id}
                  tabIndex={activeView === id ? 0 : -1}
                >
                  <Icon size={17} aria-hidden="true" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>

            <div className="sidebar-footer">
              <div
                className="sidebar-user-xp"
                style={{
                  padding: "10px 12px",
                  background: "var(--panel)",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  marginBottom: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    background: "rgba(56, 217, 255, 0.1)",
                    border: "1px solid rgba(56, 217, 255, 0.2)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "var(--cyan)",
                  }}
                >
                  L{currentLevel}
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", flex: 1 }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "10px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <span>SQL Apprentice</span>
                    <span>{totalXP} XP</span>
                  </div>
                  <div
                    style={{
                      height: "4px",
                      background: "var(--border)",
                      borderRadius: "2px",
                      overflow: "hidden",
                      marginTop: "4px",
                    }}
                  >
                    <div
                      style={{
                        width: `${xpProgressPercent}%`,
                        height: "100%",
                        background: "var(--cyan)",
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="readiness-card">
                <div className="rc-top">
                  <span>Interview Readiness</span>
                  <strong>{readiness}%</strong>
                </div>
                <div className="progress-track">
                  <span style={{ width: `${readiness}%` }} />
                </div>
                <div className="rc-sub">
                  <span>
                    {progress.completedModules.length}/{totalModules} modules
                  </span>
                  <span>
                    {progress.solvedProblems.length}/{totalProblems} problems
                  </span>
                </div>
              </div>

              <button
                onClick={handleInstallApp}
                className="button secondary"
                style={{
                  width: "100%",
                  marginTop: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "8px",
                  fontSize: "12px",
                  background: "rgba(56, 217, 255, 0.08)",
                  borderColor: "rgba(56, 217, 255, 0.25)",
                }}
                title="Install Desktop Application or download Desktop Shortcut with official logo"
                aria-label="Install Desktop Application or download Desktop Shortcut"
              >
                <Monitor size={14} style={{ color: "var(--cyan)" }} />
                <span style={{ fontWeight: 600, color: "var(--cyan)" }}>
                  Install Desktop App
                </span>
                <Download
                  size={13}
                  style={{
                    opacity: 0.7,
                    color: "var(--cyan)",
                    marginLeft: "auto",
                  }}
                />
              </button>
            </div>
          </aside>
        </>
      )}

      {/* ── MAIN ─────────────────────────────────────── */}
      <main className="main-shell">
        {/* topbar */}
        <header className="topbar">
          <button
            className="icon-button tb-ham"
            onClick={() => setSidebarOpen((o) => !o)}
          >
            {sidebarOpen ? <X size={17} /> : <Menu size={17} />}
          </button>

          <div className="topbar-search">
            <div className="search-shell">
              <Search size={15} />
              <input
                ref={searchRef}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search modules, problems… ( / )"
              />
              <Command size={13} />
              {filteredSearch.length > 0 && (
                <div className="search-popover">
                  {filteredSearch.map((item) => (
                    <button
                      key={`${item.type}-${item.id}`}
                      onClick={() => handleSearchPick(item)}
                    >
                      <span>{item.type}</span>
                      <strong>{item.label}</strong>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="topbar-right">
            <button
              className="icon-button"
              onClick={handleInstallApp}
              title="Install Desktop Application / Shortcut with Logo"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--cyan)",
              }}
              aria-label="Install Desktop Application or Shortcut"
            >
              <Monitor size={16} />
            </button>
            <button
              className={`icon-button theme-toggle-btn ${theme}`}
              onClick={() =>
                setTheme((t) =>
                  t === "dark" ? "light" : t === "light" ? "oled" : "dark",
                )
              }
              title={`Theme: ${theme}. Click to switch theme.`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="Toggle visual theme"
            >
              {theme === "dark" && <Sun size={16} />}
              {theme === "light" && <Moon size={16} />}
              {theme === "oled" && (
                <Zap size={16} style={{ color: "var(--violet)" }} />
              )}
            </button>
            <span title="Readiness">
              <Target size={14} />
              {readiness}%
            </span>
          </div>
        </header>

        {/* content */}
        <div
          className={`page-content ${
            [
              "dashboard",
              "roadmap",
              "mocks",
              "mock-results",
              "day-details",
              "join-visualizer",
            ].includes(activeView)
              ? "scrollable-y"
              : ""
          }`}
          style={{
            flex: 1,
            overflow: "auto",
            position: "relative",
          }}
          id="main-scroll-container"
        >
          <Suspense fallback={<EditorWorkspaceSkeleton />}>
            {activeView === "dashboard" && (
              <DashboardView
                progress={progress}
                learningRoadmap={learningRoadmap}
                roadmapModules={roadmapModules}
                debugPuzzles={debugPuzzles}
                streak={streak}
                setActiveView={setActiveView}
                setSelectedDayId={setSelectedDayId}
                readiness={readiness}
                totalModules={totalModules}
                totalProblems={totalProblems}
                totalXP={totalXP}
                currentLevel={currentLevel}
                xpProgressPercent={xpProgressPercent}
                xpRemaining={xpRemaining}
                earnedBadges={earnedBadges}
                qaItems={qaItems}
                enterFreeformPlayground={enterFreeformPlayground}
                selectModule={selectModule}
                updateEditorQuery={updateEditorQuery}
                toggleChecklistItem={toggleChecklistItem}
                next={next}
              />
            )}
            {activeView === "roadmap" && (
              <RoadmapView
                progress={progress}
                learningRoadmap={learningRoadmap}
                roadmapModules={roadmapModules}
                selectedDayId={selectedDayId}
                setSelectedDayId={setSelectedDayId}
                setActiveView={setActiveView}
                toggleDayComplete={toggleDayComplete}
                selectModule={selectModule}
                openInPlayground={openInPlayground}
                debugPuzzles={debugPuzzles}
                setActivePuzzleId={setActivePuzzleId}
                setPlaygroundMode={setPlaygroundMode}
                getSavedPuzzleQuery={getSavedPuzzleQuery}
                updateEditorQuery={updateEditorQuery}
                stopAutoTyping={stopAutoTyping}
              />
            )}
            {activeView === "modules" && (
              <ModulesView
                activeModule={activeModule}
                roadmapModules={roadmapModules}
                progress={progress}
                selectModule={selectModule}
                setActiveView={setActiveView}
                openInPlayground={openInPlayground}
                markModuleDone={markModuleDone}
                markProblemSolved={markProblemSolved}
                updateEditorQuery={updateEditorQuery}
                copyToClipboard={copyToClipboard}
                classForDiff={classForDiff}
              />
            )}
            {activeView === "practice" && (
              <PracticeView
                progress={progress}
                activeModuleId={activeModuleId}
                roadmapModules={roadmapModules}
                selectedProblem={selectedProblem}
                selectProblem={selectProblem}
                openInPlayground={openInPlayground}
                markProblemSolved={markProblemSolved}
                updateEditorQuery={updateEditorQuery}
                copyToClipboard={copyToClipboard}
                classForDiff={classForDiff}
                selectModule={selectModule}
                setActiveView={setActiveView}
                setPlaygroundMode={setPlaygroundMode}
              />
            )}
            {activeView === "playground" && (
              <PlaygroundView
                progress={progress}
                selectedProblem={selectedProblem}
                playgroundMode={playgroundMode}
                setPlaygroundMode={setPlaygroundMode}
                roadmapModules={roadmapModules}
                tableSchemas={tableSchemas}
                datasetDomains={datasetDomains}
                rowLimit={rowLimit}
                setRowLimit={setRowLimit}
                sqlUpperKeywords={sqlUpperKeywords}
                setSqlUpperKeywords={setSqlUpperKeywords}
                editorFontSize={editorFontSize}
                setEditorFontSize={setEditorFontSize}
                editorWordWrap={editorWordWrap}
                setEditorWordWrap={setEditorWordWrap}
                editorMinimap={editorMinimap}
                setEditorMinimap={setEditorMinimap}
                editorFontFamily={editorFontFamily}
                setEditorFontFamily={setEditorFontFamily}
                editorTabSize={editorTabSize}
                setEditorTabSize={setEditorTabSize}
                editorTheme={editorTheme}
                setEditorTheme={setEditorTheme}
                theme={theme}
                rightOpen={rightOpen}
                setRightOpen={setRightOpen}
                query={query}
                setQuery={setQuery}
                queryResult={queryResult}
                setQueryResult={setQueryResult}
                expectedResult={expectedResult}
                setExpectedResult={setExpectedResult}
                graderFeedback={graderFeedback}
                setGraderFeedback={setGraderFeedback}
                runCurrentQuery={runCurrentQuery}
                copyToClipboard={copyToClipboard}
                openInPlayground={openInPlayground}
                markProblemSolved={markProblemSolved}
                handleRightNavKeyDown={handleRightNavKeyDown}
                classForDiff={classForDiff}
                editorRef={editorRef}
                queryRef={queryRef}
                handleBeforeMount={handleBeforeMount}
                handleMount={handleMount}
                handleEditorChange={handleEditorChange}
                dbReady={dbReady}
                streak={streak}
                showToast={showToast}
                liveSchema={liveSchema}
                setLiveSchema={setLiveSchema}
                savedQueries={savedQueries}
                setSavedQueries={setSavedQueries}
                showConfirm={showConfirm}
                showPrompt={showPrompt}
                graderStrict={graderStrict}
                setGraderStrict={setGraderStrict}
                activePuzzle={activePuzzle}
                setActivePuzzleId={setActivePuzzleId}
                debugPuzzles={debugPuzzles}
                getSavedPuzzleQuery={getSavedPuzzleQuery}
                openPuzzleInPlayground={openPuzzleInPlayground}
                getSavedDraftQuery={getSavedDraftQuery}
                updateEditorQuery={updateEditorQuery}
                stopAutoTyping={stopAutoTyping}
                allProblems={allProblems}
                monacoRef={monacoRef}
                insertTextAtCursor={insertTextAtCursor}
                lintErrors={lintErrors}
                isAutoTyping={isAutoTyping}
                autoTypeQuery={autoTypeQuery}
                queryHistory={queryHistory}
                setQueryHistory={setQueryHistory}
                setSelectedDayId={setSelectedDayId}
                setActiveView={setActiveView}
                learningRoadmap={learningRoadmap}
                readiness={readiness}
                totalModules={totalModules}
                totalProblems={totalProblems}
              />
            )}
            {activeView === "puzzles" && (
              <PuzzlesView
                progress={progress}
                debugPuzzles={debugPuzzles}
                activePuzzle={activePuzzle}
                setActivePuzzleId={setActivePuzzleId}
                openPuzzleInPlayground={openPuzzleInPlayground}
                markPuzzleSolved={markPuzzleSolved}
                updateEditorQuery={updateEditorQuery}
                setActiveView={setActiveView}
                setPlaygroundMode={setPlaygroundMode}
                classForDiff={classForDiff}
              />
            )}
            {(activeView === "mocks" ||
              activeView === "mock-runner" ||
              activeView === "mock-results") && (
              <MockTestView
                activeView={activeView}
                setActiveView={setActiveView}
                progress={progress}
                mockInterviews={mockInterviews}
                mockHistory={mockHistory}
                interviewQuestionBank={interviewQuestionBank}
                mockTest={mockTest}
                setMockTest={setMockTest}
                mockReviewIndex={mockReviewIndex}
                setMockReviewIndex={setMockReviewIndex}
                startMockTest={startMockTest}
                submitMockAnswer={submitMockAnswer}
                runCurrentQuery={runCurrentQuery}
                queryRef={queryRef}
                queryResult={queryResult}
                resultPage={resultPage}
                setResultPage={setResultPage}
                RESULT_PAGE_SIZE={15}
                updateEditorQuery={updateEditorQuery}
                tableSchemas={tableSchemas}
                liveSchema={liveSchema}
                expectedResult={expectedResult}
                graderFeedback={graderFeedback}
                editorTheme={editorTheme}
                theme={theme}
                query={query}
                handleBeforeMount={handleBeforeMount}
                handleMount={handleMount}
                handleEditorChange={handleEditorChange}
                editorMinimap={editorMinimap}
                editorFontSize={editorFontSize}
                editorFontFamily={editorFontFamily}
                editorTabSize={editorTabSize}
                editorWordWrap={editorWordWrap}
              />
            )}
            {activeView === "day-details" && (
              <DayDetailsView
                selectedDayId={selectedDayId}
                progress={progress}
                learningRoadmap={learningRoadmap}
                roadmapModules={roadmapModules}
                debugPuzzles={debugPuzzles}
                setActiveView={setActiveView}
                setSelectedDayId={setSelectedDayId}
                toggleDayComplete={toggleDayComplete}
                toggleChecklistItem={toggleChecklistItem}
                selectModule={selectModule}
                openInPlayground={openInPlayground}
                markProblemSolved={markProblemSolved}
                markPuzzleSolved={markPuzzleSolved}
                setActivePuzzleId={setActivePuzzleId}
                setPlaygroundMode={setPlaygroundMode}
                getSavedPuzzleQuery={getSavedPuzzleQuery}
                updateEditorQuery={updateEditorQuery}
                stopAutoTyping={stopAutoTyping}
                setQueryResult={setQueryResult}
                setExpectedResult={setExpectedResult}
              />
            )}
            {activeView === "missions" && (
              <MissionCapstoneView
                onOpenStepInPlayground={(sql) => {
                  updateEditorQuery(sql, "free");
                  setActiveView("playground");
                }}
                onBackToRoadmap={() => setActiveView("roadmap")}
              />
            )}
            {activeView === "join-visualizer" && (
              <div
                style={{
                  padding: "2rem 3rem",
                  maxWidth: "900px",
                  margin: "0 auto",
                  width: "100%",
                }}
              >
                <ErrorBoundary fallbackTitle="SQL Join Venn Sandbox Panel">
                  <SqlJoinVennDiagram />
                </ErrorBoundary>
              </div>
            )}
          </Suspense>
        </div>
      </main>

      {showOnboarding && (
        <OnboardingModal
          roadmapLength={learningRoadmap.length}
          onClose={completeOnboarding}
        />
      )}
      {showShortcuts && (
        <ShortcutsModal onClose={() => setShowShortcuts(false)} />
      )}
      {activeColumnProfile && (
        <ColumnProfileModal
          profile={activeColumnProfile}
          onClose={() => setActiveColumnProfile(null)}
        />
      )}
      {customConfirmOpen && renderCustomConfirmModal()}
      {customPromptOpen && renderCustomPromptModal()}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 9999,
            background:
              toast.type === "error"
                ? "rgba(239, 68, 68, 0.95)"
                : toast.type === "success"
                  ? "rgba(16, 185, 129, 0.95)"
                  : "var(--glass-panel-bg)",
            color: "var(--text)",
            padding: "12px 24px",
            borderRadius: "8px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "13px",
            fontWeight: 500,
            border:
              toast.type === "error"
                ? "1px solid rgba(239, 68, 68, 0.5)"
                : toast.type === "success"
                  ? "1px solid rgba(16, 185, 129, 0.5)"
                  : "1px solid var(--border)",
            backdropFilter: "blur(8px)",
            animation: "slideIn 0.2s ease-out forwards",
          }}
        >
          {toast.type === "success" && <CheckCircle2 size={16} />}
          {toast.type === "error" && <AlertTriangle size={16} />}
          {toast.type === "info" && <Lightbulb size={16} />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
