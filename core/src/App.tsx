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
  Palette,
  Flame,
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
import CommandPalette from "./components/CommandPalette";
import type { CommandItem } from "./components/CommandPalette";
import GamifiedHud from "./components/GamifiedHud";
import { buildCsvImportSql } from "./utils/csvParser";
import { stripLineNumbersFromQuery } from "./utils/formatters";
import {
  calculateSM2,
  loadSM2Progress,
  saveSM2Progress,
  SM2ProgressMap,
} from "./utils/sm2Engine";
// Build hash test update v2
const APP_BUILD_HASH_MARKER = "v2.0";
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
  ModuleLevel,
  PracticeProblem,
  RoadmapModule,
  RoadmapDay,
} from "./data/curriculum";
import { debugPuzzles } from "./data/puzzles";
import type { SqlPuzzle } from "./data/puzzles";
import { datasetDomains, tableSchemas } from "./data/datasets";
import {
  initDatabase,
  resetDatabase,
  runQuery,
  getQueryPlan,
  getLiveSchema,
  formatSql,
} from "./utils/sqlEngine";
import OnboardingModal from "./components/OnboardingModal";
import ShortcutsModal from "./components/ShortcutsModal";
import ColumnProfileModal from "./components/ColumnProfileModal";
import { downloadStatsReport } from "./utils/reportGenerator";
import type { QueryResult, QueryPlanStep } from "./utils/sqlEngine";
import SqlLinterAdvisor from "./components/SqlLinterAdvisor";
import { lintSqlQuery } from "./utils/sqlLinter";
import type { LintError } from "./utils/sqlLinter";
const SqlPerformanceComparer = lazy(
  () => import("./components/SqlPerformanceComparer"),
);
import { ErrorBoundary } from "./components/ErrorBoundary";
import type {
  QAItem,
  ViewId,
  PlaygroundMode,
  RightTab,
  UserProgressState,
} from "./types";

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

function triggerConfetti() {}
function cleanupConfetti() {}

/* tiny helpers */

function classForDiff(d: string) {
  const lower = (d || "").toLowerCase();
  if (lower.includes("expert")) return "expert";
  if (lower.includes("advanced") || lower.includes("hard")) return "hard";
  if (lower.includes("intermediate") || lower.includes("medium"))
    return "medium";
  return "easy";
}
function diffScore(d: Difficulty) {
  return d === "Easy" ? 1 : d === "Medium" ? 2 : 3;
}
function fmtTime(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
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
  const [theme, setTheme] = useLocalStorage<
    "dark" | "light" | "oled" | "dracula" | "onedark" | "ember"
  >("sql-aa-theme", "dark");
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "oled", "dracula", "onedark", "ember");
    if (theme && theme !== "dark") {
      root.classList.add(theme);
    }
  }, [theme]);

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

  const [diffFilter, setDiffFilter] = useState<Difficulty | "All">("All");
  const [companyFilter, setCompanyFilter] = useState<string>("All");
  const [showOnlyEssential, setShowOnlyEssential] = useState(false);
  const [visibleHints, setVisibleHints] = useState(0);
  const [roadmapSplit, setRoadmapSplit] = useLocalStorage(
    "sql-aa-split-roadmap",
    360,
  );
  const [practiceSplit, setPracticeSplit] = useLocalStorage(
    "sql-aa-split-practice",
    340,
  );
  const [puzzleSplit, setPuzzleSplit] = useLocalStorage(
    "sql-aa-split-puzzle",
    340,
  );
  const [playgroundSplit, setPlaygroundSplit] = useLocalStorage(
    "sql-aa-split-playground",
    850,
  );

  const [puzzleCategoryFilter, setPuzzleCategoryFilter] =
    useState<string>("All");
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

  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [hoveredTable, setHoveredTable] = useState<string | null>(null);

  // UX Improvements states
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [graderFeedback, setGraderFeedback] = useState<{
    isCorrect: boolean;
    message: string;
    details?: string;
    warning?: string;
  } | null>(null);
  const [freeWriteMode, setFreeWriteMode] = useState(false);

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
  const [historySearch, setHistorySearch] = useState("");
  const [historyFavorites, setHistoryFavorites] = useLocalStorage<string[]>(
    "sql-aa-history-favs-v4",
    [],
  );
  const [showHistoryPinned, setShowHistoryPinned] = useState(false);
  const [sqlUpperKeywords, setSqlUpperKeywords] = useLocalStorage(
    "sql-aa-upper-kw-v4",
    true,
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [erdZoom, setErdZoom] = useState(1);

  const [compareModeOpen, setCompareModeOpen] = useState(false);
  const [queryB, setQueryB] = useLocalStorage(
    "sql-aa-query-b-v2",
    "SELECT * FROM customers LIMIT 5;",
  );
  const [resB, setResB] = useState<QueryResult | null>(null);
  const [planB, setPlanB] = useState<QueryPlanStep[]>([]);
  const [benchmarkRunCount, setBenchmarkRunCount] = useState(0);

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
  const [bookmarkedQueries, setBookmarkedQueries] = useLocalStorage<
    { id: string; name: string; query: string; createdAt: number }[]
  >("sql-aa-saved-queries-v4", []);
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
  const [lastSavedTime, setLastSavedTime] = useState("");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [selectedConceptFilter, setSelectedConceptFilter] =
    useState<string>("All");

  useEffect(() => {
    // Gamified streak check logic with 7-day tracking & 1-day grace protection
    const checkStreak = () => {
      const todayStr = new Date().toISOString().split("T")[0];
      const lastDate = localStorage.getItem("sql-aa-last-active-date");
      let currentStreak = Number(localStorage.getItem("sql-aa-streak") || "0");
      let activeDays: string[] = JSON.parse(
        localStorage.getItem("sql-aa-active-days") || "[]",
      );

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
        } else if (diffDays === 2) {
          // 1-Day Grace Period Protection: Preserve streak if only 1 day was missed
          console.log("[Streak] Grace period applied for 1 missed day.");
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
      progress: JSON.parse(localStorage.getItem("sql-aa-progress-v3") || "{}"),
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

  const translatePlanToProse = (steps: QueryPlanStep[]): string[] => {
    if (steps.length === 0) return ["No execution plan steps to translate."];
    const prose: string[] = [];
    steps.forEach((step, idx) => {
      const detail = step.detail;
      const dUpper = detail.toUpperCase();
      let prefix = `Step ${idx + 1}: `;

      if (dUpper.includes("SCAN TABLE")) {
        const match = detail.match(/SCAN TABLE\s+(\S+)(?:\s+AS\s+(\S+))?/i);
        const tableName = match ? match[1] : "the target table";
        prose.push(
          `${prefix}Reads the entire "${tableName}" table row-by-row (Full Table Scan). Slow for large tables.`,
        );
      } else if (dUpper.includes("SEARCH TABLE")) {
        const match = detail.match(/SEARCH TABLE\s+(\S+)\s+USING\s+(.+)/i);
        const tableName = match ? match[1] : "the target table";
        const indexInfo = match ? match[2] : "an index";
        prose.push(
          `${prefix}Searches "${tableName}" using ${indexInfo} (Index Scan). Fast and optimized.`,
        );
      } else if (dUpper.includes("USE TEMP B-TREE FOR")) {
        const match = detail.match(/USE TEMP B-TREE FOR\s+(.+)/i);
        const reason = match ? match[1] : "sorting/grouping";
        prose.push(
          `${prefix}Creates a temporary memory index for ${reason.toLowerCase()}. Suggests index optimizations.`,
        );
      } else if (dUpper.includes("SCALAR SUBQUERY")) {
        prose.push(
          `${prefix}Evaluates a scalar subquery for returning an individual cell value.`,
        );
      } else if (dUpper.includes("CORRELATED")) {
        prose.push(
          `${prefix}Runs a correlated nested-loop subquery for each candidate row (unoptimized).`,
        );
      } else if (dUpper.includes("COMPOUND SUBQUERIES")) {
        prose.push(
          `${prefix}Combines results via set operations (UNION/INTERSECT/EXCEPT).`,
        );
      } else {
        prose.push(`${prefix}Executes helper operation: "${detail}".`);
      }
    });
    return prose;
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

  // Scroll selected ERD table into view in the sidebar schema accordion
  useEffect(() => {
    if (selectedTable) {
      const element = document.getElementById(`schema-table-${selectedTable}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [selectedTable]);

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
  const RESULT_PAGE_SIZE = 50;

  useEffect(() => {
    setResultPage(0);
  }, [queryResult]);
  const [activeResultTab, setActiveResultTab] = useState<"your" | "expected">(
    "your",
  );
  const [previewData, setPreviewData] = useState<{
    [table: string]: QueryResult | null;
  }>({});
  const [activeConsoleTab, setActiveConsoleTab] = useState<
    "results" | "plan" | "history" | "saved" | "benchmark"
  >("results");
  const [queryPlanSteps, setQueryPlanSteps] = useState<QueryPlanStep[]>([]);
  const [resetStatus, setResetStatus] = useState(false);
  const resetTimeoutRef = useRef<any>(null);
  const triggerResetStatus = useCallback(() => {
    setResetStatus(true);
    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    resetTimeoutRef.current = setTimeout(() => {
      setResetStatus(false);
      resetTimeoutRef.current = null;
    }, 2000);
  }, []);

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

  const [schemaSearch, setSchemaSearch] = useState("");

  /* keep ref in sync without causing re-renders */
  const debounceTimerRef = useRef<number | null>(null);
  const queryStateDebounceRef = useRef<number | null>(null);

  const getSavedDraftQuery = useCallback(
    (p: PracticeProblem): string => {
      const drafts = JSON.parse(
        localStorage.getItem("sql-aa-problem-drafts") || "{}",
      );
      const draftVal = drafts[p.id];
      const defaultQuery = `-- Write your SQL query here\n`;

      if (!draftVal) return defaultQuery;
      let stored = typeof draftVal === "string" ? draftVal : draftVal.query;
      if (!stored) return defaultQuery;
      stored = stripLineNumbersFromQuery(stored);

      // Ignore drafts that contain placeholders or are identical to ANY problem's starterQuery
      const isStarter = allProblems.some(
        (prob) =>
          prob.starterQuery &&
          stored.replace(/\s+/g, "").toLowerCase() ===
            prob.starterQuery.replace(/\s+/g, "").toLowerCase(),
      );
      if (stored.includes("???") || isStarter) {
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
    [allProblems],
  );

  const getSavedPuzzleQuery = useCallback((p: SqlPuzzle): string => {
    const drafts = JSON.parse(
      localStorage.getItem("sql-aa-puzzle-drafts") || "{}",
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

    return stored || defaultQuery;
  }, []);

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
            const drafts = JSON.parse(
              localStorage.getItem("sql-aa-problem-drafts") || "{}",
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
            const drafts = JSON.parse(
              localStorage.getItem("sql-aa-puzzle-drafts") || "{}",
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

        if (debounceTimerRef.current)
          window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = window.setTimeout(() => {
          localStorage.setItem("sql-aa-active-query", JSON.stringify(v));

          if (playgroundMode === "practice" && selectedProblemId) {
            const drafts = JSON.parse(
              localStorage.getItem("sql-aa-problem-drafts") || "{}",
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
            const drafts = JSON.parse(
              localStorage.getItem("sql-aa-puzzle-drafts") || "{}",
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

          const now = new Date();
          const timeStr = now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
          setLastSavedTime(timeStr);
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
  const [progress, setProgress] = useLocalStorage<ProgressState>(
    "sql-aa-progress-v3",
    initialProgress,
  );

  // Auto-resume to active day where user left off
  const activeDayWhereLeftOff = useMemo(() => {
    const completed = progress.completedDays || [];
    for (const day of learningRoadmap) {
      if (!completed.includes(day.day)) {
        return day.day;
      }
    }
    return learningRoadmap[learningRoadmap.length - 1]?.day || 1;
  }, [learningRoadmap, progress.completedDays]);

  useEffect(() => {
    const stored = localStorage.getItem("sql-aa-selected-day-id");
    if (!stored || (progress.completedDays || []).includes(Number(stored))) {
      setSelectedDayId(activeDayWhereLeftOff);
    }
  }, [activeDayWhereLeftOff, progress.completedDays, setSelectedDayId]);

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
  const [editorHeight, setEditorHeight] = useLocalStorage(
    "sql-aa-editor-h",
    350,
  );
  const [resultHeight, setResultHeight] = useLocalStorage(
    "sql-aa-result-h",
    250,
  );

  /* ── UI state ────────────────────────────────────────────── */
  const [searchTerm, setSearchTerm] = useState("");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
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
          monacoRef.current.editor
            .getModels()
            .forEach((model: import("monaco-editor").editor.ITextModel) => {
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
      if (resetTimeoutRef.current !== null) {
        window.clearTimeout(resetTimeoutRef.current);
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
  const availableCompanies = useMemo(() => {
    const companies = new Set<string>();
    allProblems.forEach((p) => {
      if (p.companyTags) {
        p.companyTags.forEach((tag) => {
          if (tag) companies.add(tag);
        });
      }
    });
    return Array.from(companies).sort();
  }, [allProblems]);
  const totalModules = roadmapModules.length;
  const totalProblems = allProblems.length;

  const essentialProblems = useMemo(
    () =>
      allProblems.filter(
        (p) =>
          p.isEssential || p.difficulty === "Easy" || p.difficulty === "Medium",
      ),
    [allProblems],
  );
  const totalEssential = essentialProblems.length;
  const solvedEssential = useMemo(
    () =>
      progress.solvedProblems.filter((id) =>
        essentialProblems.some((p) => p.id === id),
      ).length,
    [progress.solvedProblems, essentialProblems],
  );

  const availableConcepts = useMemo(() => {
    return activeModule.problems.reduce((acc, p) => {
      if (p.concepts) {
        p.concepts.forEach((c) => {
          if (!acc.includes(c)) acc.push(c);
        });
      }
      return acc;
    }, [] as string[]);
  }, [activeModule.problems]);

  const visibleProblems = useMemo(() => {
    return activeModule.problems.filter(
      (p) =>
        (diffFilter === "All" || p.difficulty === diffFilter) &&
        (companyFilter === "All" ||
          (p.companyTags && p.companyTags.includes(companyFilter))) &&
        (selectedConceptFilter === "All" ||
          (p.concepts && p.concepts.includes(selectedConceptFilter))) &&
        (!showOnlyEssential ||
          p.isEssential ||
          p.difficulty === "Easy" ||
          p.difficulty === "Medium"),
    );
  }, [
    activeModule.problems,
    diffFilter,
    companyFilter,
    selectedConceptFilter,
    showOnlyEssential,
  ]);

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

    const failedMap = JSON.parse(
      localStorage.getItem("sql-aa-failed-attempts") || "{}",
    );
    const candidates = allProblems.filter(
      (p) =>
        p.moduleId <= maxModuleId && allowedDifficulties.includes(p.difficulty),
    );

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
  ): GraderResult {
    if (userRes.error) {
      return {
        isCorrect: false,
        message: "Query Error",
        details: userRes.error,
      };
    }
    if (expRes.error) {
      return {
        isCorrect: false,
        message: "System Solution Error",
        details: expRes.error,
      };
    }

    if (playgroundMode === "puzzle" && activePuzzle) {
      const cleanUser = queryRef.current
        .replace(/(--.*)|(\/\*[\s\S]*?\*\/)/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
      const cleanFlawed = activePuzzle.flawedQuery
        .replace(/(--.*)|(\/\*[\s\S]*?\*\/)/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
      if (cleanUser === cleanFlawed) {
        return {
          isCorrect: false,
          message: "Unmodified Flawed Query",
          details:
            "You ran the original flawed query without making modifications. You must find the bug and edit the query to solve the puzzle!",
        };
      }
    }

    // Strict Technique Requirement Enforcement
    try {
      const activeProb = playgroundMode === "practice" ? selectedProblem : null;
      const promptText = (activeProb ? activeProb.prompt : "").toLowerCase();
      const solCleanText = solutionSql
        .replace(/(--.*)|(\/\*[\s\S]*?\*\/)/g, "")
        .toLowerCase();
      const userSqlText = queryRef.current.replace(
        /(--.*)|(\/\*[\s\S]*?\*\/)/g,
        "",
      );

      // 1. FULL JOIN / UNION requirement
      if (
        (/\b(full\s+join|full\s+outer\s+join|union)\b/i.test(promptText) ||
          /\bunion\b/i.test(solCleanText)) &&
        !/\b(FULL\s+JOIN|FULL\s+OUTER\s+JOIN|UNION)\b/i.test(userSqlText)
      ) {
        return {
          isCorrect: false,
          message: "Missing Required SQL Technique",
          details:
            "Your query must explicitly use FULL JOIN or UNION to combine records as required.",
        };
      }

      // 2. Anti-join / NULL check requirement for churn / unmatched queries
      if (
        (/\b(no\s+orders|placed\s+no|unmatched|left\s+anti-join|has\s+no|never\b)\b/i.test(
          promptText,
        ) ||
          /\bis\s+null\b/i.test(solCleanText)) &&
        !/\b(IS\s+NULL|NOT\s+IN|NOT\s+EXISTS)\b/i.test(userSqlText)
      ) {
        return {
          isCorrect: false,
          message: "Missing Required Anti-Join Filter",
          details:
            "Your query is missing a required NULL check (IS NULL), NOT IN, or NOT EXISTS clause to filter unmatched records.",
        };
      }

      // 3. HAVING requirement
      if (
        /\b(having)\b/i.test(promptText) &&
        !/\bHAVING\b/i.test(userSqlText)
      ) {
        return {
          isCorrect: false,
          message: "Missing Required SQL Technique",
          details:
            "Your query must use a HAVING clause to filter aggregated values as required by the prompt.",
        };
      }

      // 4. WITH / CTE requirement
      if (
        /\b(cte|with\s+clause)\b/i.test(promptText) &&
        !/\bWITH\b/i.test(userSqlText)
      ) {
        return {
          isCorrect: false,
          message: "Missing Required SQL Technique",
          details:
            "Your query must use a Common Table Expression (WITH clause) as specified in the prompt.",
        };
      }
    } catch (e) {
      console.warn("Strict technique verification failed:", e);
    }

    // Helper utility to detect mutating DML/DDL queries
    const cleanSql = solutionSql
      .replace(/(--.*)|(\/\*[\s\S]*?\*\/)/g, "")
      .trim();
    const isDmlOrDdl =
      /^\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|REPLACE|TRUNCATE|BEGIN)\b/i.test(
        cleanSql,
      );

    if (isDmlOrDdl) {
      if (!userSnapshot || !expSnapshot) {
        return {
          isCorrect: false,
          message: "State Check Failed",
          details: "Unable to inspect database tables.",
        };
      }
      const match =
        JSON.stringify(userSnapshot) === JSON.stringify(expSnapshot);
      return {
        isCorrect: match,
        message: match ? "Correct Answer!" : "Database state mismatch",
        details: match
          ? "Database tables were updated correctly."
          : "The tables do not match the expected state after your query.",
      };
    }

    const expCols = expRes.columns;
    const userCols = userRes.columns;

    // Check if column counts or names are wrong
    const expColsLower = expCols.map((c) => c.toLowerCase());
    const userColsLower = userCols.map((c) => c.toLowerCase());
    const missing = expCols.filter(
      (c) => !userColsLower.includes(c.toLowerCase()),
    );
    const extra = userCols.filter(
      (c) => !expColsLower.includes(c.toLowerCase()),
    );

    if (missing.length > 0 || extra.length > 0) {
      return {
        isCorrect: false,
        message: "Columns do not match",
        details:
          `Expected columns: [${expCols.join(", ")}]. ` +
          (missing.length ? `Missing: [${missing.join(", ")}]. ` : "") +
          (extra.length ? `Extra: [${extra.join(", ")}].` : ""),
      };
    }

    if (userCols.length !== expCols.length) {
      return {
        isCorrect: false,
        message: "Column count mismatch",
        details: `Expected ${expCols.length} columns, but got ${userCols.length}.`,
      };
    }

    let warning: string | undefined = undefined;
    const orderMismatch = userCols.some(
      (c, i) => c.toLowerCase() !== expCols[i].toLowerCase(),
    );
    if (orderMismatch) {
      if (graderStrict) {
        return {
          isCorrect: false,
          message: "Column order mismatch (Strict Mode)",
          details: `Strict Mode is enabled. Expected columns: [${expCols.join(", ")}]. Got: [${userCols.join(", ")}].`,
        };
      } else {
        warning =
          `Columns match but are in a different order. ` +
          `Expected: [${expCols.join(", ")}]. Got: [${userCols.join(", ")}]. ` +
          `Graded correct anyway!`;
      }
    }

    // CTE and subquery usage warnings
    try {
      const userSql = queryRef.current;
      const userCleanSql = userSql
        .replace(/(--.*)|(\/\*[\s\S]*?\*\/)/g, "")
        .trim();

      const cteRegex = /\bWITH\s+([a-zA-Z0-9_]+)\s+AS\s*\(/gi;
      let cteMatch;
      const unusedCtes: string[] = [];
      while ((cteMatch = cteRegex.exec(userCleanSql)) !== null) {
        const cteName = cteMatch[1];
        const afterCteIndex = cteMatch.index + cteMatch[0].length;
        const queryAfter = userCleanSql.substring(afterCteIndex);
        const refRegex = new RegExp(`\\b${cteName}\\b`, "i");
        if (!refRegex.test(queryAfter)) {
          unusedCtes.push(cteName);
        }
      }

      const subqueryRegex = /\)\s*(?:AS\s+)?([a-zA-Z0-9_]+)\b/gi;
      let subqueryMatch;
      const unusedSubqueries: string[] = [];
      while ((subqueryMatch = subqueryRegex.exec(userCleanSql)) !== null) {
        const alias = subqueryMatch[1];
        if (
          [
            "SELECT",
            "FROM",
            "WHERE",
            "JOIN",
            "LEFT",
            "RIGHT",
            "ON",
            "AND",
            "OR",
            "GROUP",
            "ORDER",
            "LIMIT",
            "UNION",
            "HAVING",
          ].includes(alias.toUpperCase())
        )
          continue;

        const afterSubIndex = subqueryMatch.index + subqueryMatch[0].length;
        const queryAfter = userCleanSql.substring(afterSubIndex);
        const refRegex = new RegExp(`\\b${alias}\\b`, "i");
        if (!refRegex.test(queryAfter)) {
          unusedSubqueries.push(alias);
        }
      }

      if (unusedCtes.length > 0 || unusedSubqueries.length > 0) {
        const unusedList = [...unusedCtes, ...unusedSubqueries];
        const cteWarning =
          `Warning: Unused CTE or subquery alias [${unusedList.join(", ")}] ` +
          `detected. Please reference or remove it.`;
        warning = warning ? `${warning} ${cteWarning}` : cteWarning;
      }
    } catch (e) {
      console.warn("Grader warnings failed:", e);
    }

    // Anti-Cheat Check: Ensure the user's query is not just returning hardcoded literals
    try {
      const solClean = solutionSql.replace(/(--.*)|(\/\*[\s\S]*?\*\/)/g, "");
      const userClean = queryRef.current.replace(
        /(--.*)|(\/\*[\s\S]*?\*\/)/g,
        "",
      );

      // If the solution query queries a table, the user query must contain a FROM clause
      if (/\bFROM\b/i.test(solClean) && !/\bFROM\b/i.test(userClean)) {
        return {
          isCorrect: false,
          message: "Cheat Detection Alert",
          details:
            "Your query must query data from the database using a 'FROM' clause " +
            "instead of returning hardcoded constant values.",
        };
      }

      // Extract referenced table names from the solution query
      const tablesInSchema = [
        "customers",
        "orders",
        "products",
        "employees",
        "departments",
        "projects",
        "employee_projects",
      ];
      const referencedTables = tablesInSchema.filter((tbl) => {
        const regex = new RegExp(`\\b${tbl}\\b`, "i");
        return regex.test(solClean);
      });

      if (referencedTables.length > 0) {
        const userReferencesAny = referencedTables.some((tbl) => {
          const regex = new RegExp(`\\b${tbl}\\b`, "i");
          return regex.test(userClean);
        });
        if (!userReferencesAny) {
          return {
            isCorrect: false,
            message: "Cheat Detection Alert",
            details:
              `Your query must reference the appropriate database tables ` +
              `(e.g., ${referencedTables.join(", ")}).`,
          };
        }
      }

      // Hardcoded Literal Output Bypass Detection
      const selectMatch = userClean.match(/SELECT\s+([\s\S]+?)\s+\bFROM\b/i);
      if (selectMatch) {
        const selectClause = selectMatch[1].trim();
        const strLiterals = Array.from(selectClause.matchAll(/'([^']*)'/g)).map(
          (m) => m[1],
        );
        const numLiterals = Array.from(
          selectClause.matchAll(/\b(?<!\w)(\d+(?:\.\d+)?)\b(?!\w)/g),
        ).map((m) => m[1]);
        const scalarSubqueries = /\(\s*SELECT\s+[^)]+\)/i.test(selectClause);
        const staticCases = /\bCASE\b[\s\S]+?\bEND\b/i.test(selectClause);

        const expValuesSet = new Set<string>();
        if (expRes && expRes.rows) {
          expRes.rows.forEach((row: Record<string, unknown>) => {
            Object.values(row).forEach((val) => {
              if (val !== null && val !== undefined) {
                expValuesSet.add(String(val).trim().toLowerCase());
              }
            });
          });
        }

        const solSelectMatch = solClean.match(
          /SELECT\s+([\s\S]+?)\s+\bFROM\b/i,
        );
        const solSelect = solSelectMatch ? solSelectMatch[1].toLowerCase() : "";

        let matchingLiterals = 0;
        [...strLiterals, ...numLiterals].forEach((lit) => {
          const litStr = String(lit).trim().toLowerCase();
          if (expValuesSet.has(litStr) && !solSelect.includes(litStr)) {
            matchingLiterals++;
          }
        });

        const numExpCols = expRes?.columns?.length ?? 1;
        const hasAggFuncs =
          /\b(COUNT|SUM|AVG|MIN|MAX|DENSE_RANK|RANK|ROW_NUMBER|LAG|LEAD)\b/i.test(
            selectClause,
          );

        const isBypass =
          matchingLiterals >= 1 &&
          (scalarSubqueries ||
            staticCases ||
            matchingLiterals >= numExpCols * 0.5 ||
            !hasAggFuncs);

        if (isBypass) {
          return {
            isCorrect: false,
            message: "Cheat Detection Alert",
            details:
              "Hardcoded literal output values detected in SELECT projection matching expected output. " +
              "Write a query that computes values dynamically from column data.",
          };
        }
      }
    } catch (err) {
      console.warn("Anti-cheat validation failed:", err);
    }

    // Standard SELECT verification
    if (userRes.rows.length !== expRes.rows.length) {
      return {
        isCorrect: false,
        message: "Row count mismatch",
        details: `Expected ${expRes.rows.length} rows, but your query returned ${userRes.rows.length} rows.`,
      };
    }

    // Normalization helper
    const normalizeVal = (v: unknown): unknown => {
      if (v === null || v === undefined) return null;
      if (typeof v === "string" && v.toUpperCase() === "NULL") return null;
      return v;
    };

    // Numeric check helper
    const isNumeric = (val: unknown): val is number | string => {
      if (typeof val === "number") return true;
      if (typeof val === "string" && val.trim() !== "") {
        return !isNaN(Number(val));
      }
      return false;
    };

    // Precision-aware numerical equality comparison
    const getDecimalPrecision = (val: unknown): number => {
      const str = String(val).trim();
      if (str.includes(".")) {
        return str.split(".")[1].length;
      }
      return 0;
    };

    const isEqualValues = (a: unknown, b: unknown): boolean => {
      const normA = normalizeVal(a);
      const normB = normalizeVal(b);
      if (normA === normB) return true;
      if (normA === null || normB === null) return false;

      if (isNumeric(normA) && isNumeric(normB)) {
        const numA = Number(normA);
        const numB = Number(normB);
        const precision = Math.min(10, getDecimalPrecision(normA));
        const factor = Math.pow(10, precision);
        const roundedA = Math.round(numA * factor) / factor;
        const roundedB = Math.round(numB * factor) / factor;
        return Math.abs(roundedA - roundedB) < 1e-9;
      }

      const strA = String(normA).trim();
      const strB = String(normB).trim();
      if (strA === strB) return true;

      // Case-insensitive string comparison: accepts lowercase, uppercase, and mixed-case letters
      return strA.toLowerCase() === strB.toLowerCase();
    };

    const uVals = userRes.rows.map((r) =>
      expCols.map((c) => {
        const actualKey =
          Object.keys(r).find((k) => k.toLowerCase() === c.toLowerCase()) || c;
        return normalizeVal(r[actualKey]);
      }),
    );
    const sVals = expRes.rows.map((r) =>
      expCols.map((c) => normalizeVal(r[c])),
    );

    const matchesExactly = (arrA: unknown[][], arrB: unknown[][]) => {
      if (arrA.length !== arrB.length) return false;
      for (let i = 0; i < arrA.length; i++) {
        for (let j = 0; j < expCols.length; j++) {
          if (!isEqualValues(arrA[i][j], arrB[i][j])) return false;
        }
      }
      return true;
    };

    if (matchesExactly(uVals, sVals)) {
      if (uVals.length === 0 && sVals.length === 0) {
        const solJoinCount = (solutionSql.toUpperCase().match(/JOIN/g) || [])
          .length;
        const userJoinCount = (
          queryRef.current.toUpperCase().match(/JOIN/g) || []
        ).length;
        if (solJoinCount > userJoinCount) {
          return {
            isCorrect: false,
            message: "Incomplete Query Structure",
            details: `Your query returned 0 rows and is missing required table joins (found ${userJoinCount}, expected ${solJoinCount}).`,
          };
        }
        if (
          solutionSql.toUpperCase().includes("WHERE") &&
          !queryRef.current.toUpperCase().includes("WHERE")
        ) {
          return {
            isCorrect: false,
            message: "Incomplete Query Structure",
            details:
              "Your query returned 0 rows and is missing the required WHERE filtering clause.",
          };
        }
      }
      return { isCorrect: true, message: "Correct Answer!", warning };
    }

    // Sort helper using numeric tolerance and values comparison
    const sortRows = (arr: unknown[][]) => {
      return [...arr].sort((rowA, rowB) => {
        for (let colIdx = 0; colIdx < expCols.length; colIdx++) {
          const valA = rowA[colIdx];
          const valB = rowB[colIdx];
          if (valA === valB) continue;
          if (valA === null) return -1;
          if (valB === null) return 1;

          if (isNumeric(valA) && isNumeric(valB)) {
            const diff = Number(valA) - Number(valB);
            if (Math.abs(diff) >= 0.01) {
              return diff;
            }
            continue;
          }

          const strA = String(valA).trim().toLowerCase();
          const strB = String(valB).trim().toLowerCase();
          if (strA < strB) return -1;
          if (strA > strB) return 1;
        }
        return 0;
      });
    };

    // Order-agnostic fallback if no ORDER BY in solution
    if (!solutionSql.toUpperCase().includes("ORDER BY")) {
      const sortedU = sortRows(uVals);
      const sortedS = sortRows(sVals);
      if (matchesExactly(sortedU, sortedS)) {
        return { isCorrect: true, message: "Correct Answer!", warning };
      }
    }

    return {
      isCorrect: false,
      message: "Values mismatch",
      details:
        "The rows or values returned by your query do not match the expected solution. " +
        "Double check your aggregate calculations or filters.",
    };
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

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  }

  // Interview Readiness: completely integrated metric
  // 20% Modules, 30% Problems, 20% Puzzles, 30% Mocks
  const modPct = Math.round(
    (progress.completedModules.length / totalModules) * 100,
  );
  const probPct =
    Math.round((progress.solvedProblems.length / totalProblems) * 100) || 0;
  const puzPct = Math.round(
    ((progress.solvedPuzzles || []).length / debugPuzzles.length) * 100,
  );

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
  const mockPct = Math.round(mockCoveragePct * (mockAvgScore / 100));

  // Robust weighted algorithm: Modules 25%, Core Problems 40%, Debug Puzzles 15%, Mock Coverage & Performance 20%
  const readiness = Math.min(
    100,
    Math.round(modPct * 0.25 + probPct * 0.4 + puzPct * 0.15 + mockPct * 0.2),
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

  // Command palette items
  const commandItems = useMemo<CommandItem[]>(() => {
    const moduleItems: CommandItem[] = roadmapModules.slice(0, 20).map((m) => ({
      id: `mod-${m.id}`,
      type: "module" as const,
      label: `M${m.id}: ${m.title}`,
      subtitle: `${m.level} · ${m.track}`,
      action: () => {
        setActiveModuleId(m.id);
        setActiveView("modules");
      },
    }));
    const problemItems: CommandItem[] = allProblems.slice(0, 40).map((p) => ({
      id: `prob-${p.id}`,
      type: "problem" as const,
      label: p.title,
      subtitle: `${p.difficulty} · Module ${p.moduleId}`,
      action: () => {
        setSelectedProblemId(p.id);
        setPlaygroundMode("practice");
        setActiveView("playground");
      },
    }));
    const puzzleItems: CommandItem[] = debugPuzzles.slice(0, 15).map((pz) => ({
      id: `puz-${pz.id}`,
      type: "puzzle" as const,
      label: pz.title,
      subtitle: pz.category,
      action: () => {
        setActivePuzzleId(pz.id);
        setPlaygroundMode("puzzle");
        setActiveView("playground");
      },
    }));
    const actionItems: CommandItem[] = [
      {
        id: "action-playground",
        type: "action" as const,
        label: "Open Freeform Playground",
        shortcut: "F",
        action: enterFreeformPlayground,
      },
      {
        id: "action-roadmap",
        type: "nav" as const,
        label: "Go to Learning Roadmap",
        shortcut: "R",
        action: () => setActiveView("roadmap"),
      },
      {
        id: "action-practice",
        type: "nav" as const,
        label: "Go to Practice Problems",
        shortcut: "P",
        action: () => setActiveView("practice"),
      },
      {
        id: "action-puzzles",
        type: "nav" as const,
        label: "Go to Debug Puzzles",
        shortcut: "D",
        action: () => setActiveView("puzzles"),
      },
      {
        id: "action-mocks",
        type: "nav" as const,
        label: "Go to Mock Tests",
        shortcut: "M",
        action: () => setActiveView("mocks"),
      },
      {
        id: "action-dashboard",
        type: "nav" as const,
        label: "Go to Dashboard",
        shortcut: "H",
        action: () => setActiveView("dashboard"),
      },
    ];
    return [...actionItems, ...moduleItems, ...problemItems, ...puzzleItems];
  }, [
    allProblems,
    roadmapModules,
    debugPuzzles,
    setActiveView,
    setActiveModuleId,
    setSelectedProblemId,
    setPlaygroundMode,
    setActivePuzzleId,
    enterFreeformPlayground,
  ]);

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

        setQueryResult(await runQuery(initialQuery));
        setLiveSchema(await getLiveSchema());
      } catch (err) {
        console.error("Database initialization failed:", err);
        setQueryResult({
          columns: [],
          rows: [],
          message: "Database Engine Initialization Failed",
          error:
            "Failed to initialize the MySQL-compatible database engine. Please refresh the page to reload the engine.",
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
      if (
        (e.key === "/" ||
          ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) &&
        !typing
      ) {
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
      cleanupConfetti();
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
        ];

        // 1. Keywords
        const keywordItems = keywordsList.map((label) => ({
          label,
          kind: monaco.languages.CompletionItemKind.Keyword,
          detail: "SQL Keyword",
          insertText: label,
          range,
        }));

        // 2. Tables
        const tableItems = currentSchema.map((t) => ({
          label: t.name,
          kind: monaco.languages.CompletionItemKind.Class,
          detail: `Database Table (${t.columns.length} columns)`,
          insertText: t.name,
          range,
        }));

        // 3. Columns
        const columnItems = currentSchema.flatMap((t) =>
          t.columns.map((c) => ({
            label: c.name,
            kind: monaco.languages.CompletionItemKind.Field,
            detail: `${c.type} — ${t.name} column`,
            insertText: c.name,
            range,
          })),
        );

        // 4. Aliases
        const aliasItems = Object.entries(globalAliases).map(
          ([alias, targetTable]) => ({
            label: alias,
            kind: monaco.languages.CompletionItemKind.Variable,
            detail: `Table Alias (${targetTable})`,
            insertText: alias,
            range,
          }),
        );

        // Deduplicate suggestions by label
        const suggestionsMap = new Map<string, any>();
        [...aliasItems, ...tableItems, ...columnItems, ...keywordItems].forEach(
          (item) => {
            if (!suggestionsMap.has(item.label.toLowerCase())) {
              suggestionsMap.set(item.label.toLowerCase(), item);
            }
          },
        );

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

    // Bind Shift+Alt+F to format SQL
    editor.addAction({
      id: "format-sql-action",
      label: "Format SQL (Shift+Alt+F)",
      keybindings: [
        monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF,
      ],
      run: (ed) => {
        const val = ed.getValue();
        if (val) {
          const formatted = formatSql(val);
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
  // Helper utility to detect mutating queries
  function isModifyingQuery(sqlText: string) {
    const clean = sqlText.replace(/(--.*)|(\/\*[\s\S]*?\*\/)/g, ""); // Strip comments
    return /\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|REPLACE|TRUNCATE)\b/i.test(
      clean,
    );
  }

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

    // Retrieve SQLite Query Plan
    const planSteps = await getQueryPlan(sql);
    setQueryPlanSteps(planSteps);

    const isMockMode = activeView === "mock-runner";
    const needsSnapshot = isModifyingQuery(sql);

    if (isMockMode) {
      await resetDatabase();
      const result = await runQuery(sql, true, needsSnapshot);
      setQueryResult(result);
      setLiveSchema(await getLiveSchema());
      return;
    }

    if (playgroundMode === "free") {
      const result = await runQuery(sql, false, needsSnapshot);
      setQueryResult(result);
      setLiveSchema(await getLiveSchema());
      return;
    }

    // 1. Evaluate Expected Result on current DB state FIRST
    let expected: QueryResult | null = null;
    let expectedSnapshot: Record<string, any[]> | null = null;
    let solutionSql = "";

    if (playgroundMode === "practice" && selectedProblem?.solution) {
      solutionSql = selectedProblem.solution;
    } else if (playgroundMode === "puzzle" && activePuzzle?.solutionQuery) {
      solutionSql = activePuzzle.solutionQuery;
    }

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
      );
      setGraderFeedback(feedback);
      const isCorrect = feedback.isCorrect;
      if (isCorrect) {
        triggerConfetti();
        if (playgroundMode === "practice" && selectedProblem) {
          const attempts = JSON.parse(
            localStorage.getItem("sql-aa-failed-attempts") || "{}",
          );
          const failedCount = attempts[selectedProblem.id] || 0;
          const hintsCount = Math.max(0, visibleHints);
          let quality = 5;
          if (failedCount > 0 || hintsCount >= 2) {
            quality = 3;
          } else if (hintsCount === 1) {
            quality = 4;
          }
          markProblemSolved(selectedProblem, quality);
        } else if (playgroundMode === "puzzle" && activePuzzle) {
          markPuzzleSolved(activePuzzle);
        }
      } else {
        if (playgroundMode === "practice" && selectedProblem) {
          const attempts = JSON.parse(
            localStorage.getItem("sql-aa-failed-attempts") || "{}",
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

  async function runABBenchmark() {
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

    await resetDatabase();
    const resultA = await runQuery(sqlA, true, false);
    if (!resultA.error) {
      const runsA: number[] = [resultA.durationMs || 0];
      for (let i = 0; i < 4; i++) {
        await resetDatabase();
        const r = await runQuery(sqlA, true, false);
        runsA.push(r.durationMs || 0);
      }
      runsA.sort((a, b) => a - b);
      resultA.durationMs = (runsA[1] + runsA[2] + runsA[3]) / 3;
    }
    setQueryResult(resultA);

    await resetDatabase();
    const resultB = await runQuery(sqlB, true, false);
    if (!resultB.error) {
      const runsB: number[] = [resultB.durationMs || 0];
      for (let i = 0; i < 4; i++) {
        await resetDatabase();
        const r = await runQuery(sqlB, true, false);
        runsB.push(r.durationMs || 0);
      }
      runsB.sort((a, b) => a - b);
      resultB.durationMs = (runsB[1] + runsB[2] + runsB[3]) / 3;
    }
    setResB(resultB);

    setBenchmarkRunCount((c) => c + 1);
    setActiveConsoleTab("benchmark");
  }

  async function resetPlayground() {
    await resetDatabase();
    if (selectedProblemId && playgroundMode === "practice") {
      const p = allProblems.find((x) => x.id === selectedProblemId);
      if (p) {
        const drafts = JSON.parse(
          localStorage.getItem("sql-aa-problem-drafts") || "{}",
        );
        delete drafts[selectedProblemId];
        localStorage.setItem("sql-aa-problem-drafts", JSON.stringify(drafts));
        const saved = getSavedDraftQuery(p);
        updateEditorQuery(saved);
        setQueryResult(await runQuery(saved, true));
        setLiveSchema(await getLiveSchema());
        triggerResetStatus();
        return;
      }
    } else if (activePuzzleId && playgroundMode === "puzzle") {
      const p = debugPuzzles.find((x) => x.id === activePuzzleId);
      if (p) {
        const drafts = JSON.parse(
          localStorage.getItem("sql-aa-puzzle-drafts") || "{}",
        );
        delete drafts[activePuzzleId];
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
  }

  async function togglePreviewData(table: string) {
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
  }

  function saveQuery() {
    const sql = queryRef.current;
    const status: QueryHistoryItem["status"] = queryResult.error
      ? "error"
      : "success";
    setSavedQueries((s) =>
      [
        {
          id: crypto.randomUUID(),
          query: sql,
          createdAt: new Date().toISOString(),
          status,
        },
        ...s,
      ].slice(0, 12),
    );
  }

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
  }

  async function openInPlayground(p: PracticeProblem) {
    stopAutoTyping();
    setPlaygroundMode("practice");
    const saved = getSavedDraftQuery(p);
    updateEditorQuery(saved, "practice", p.id);
    setSelectedProblemId(p.id);
    setActiveModuleId(p.moduleId);
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
      triggerConfetti();
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
      triggerConfetti();
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
        setActivePuzzleId(pz.id);
        setPlaygroundMode("puzzle");
        const saved = getSavedPuzzleQuery(pz);
        updateEditorQuery(saved, "puzzle", pz.id);
        setQueryResult({
          columns: [],
          rows: [],
          message: "Run your query to test it.",
        });
        setActiveView("playground");
      }
    }
    setSearchTerm("");
  }

  /* RENDER HELPERS */
  const lessonTabs = ["Concept", "Mistakes", "Cheat Sheet", "Practice"];

  /* ── views ─────────────────────────────────────────────── */

  async function openPuzzleInPlayground(p: SqlPuzzle) {
    stopAutoTyping();
    setActivePuzzleId(p.id);
    setPlaygroundMode("puzzle");
    const saved = getSavedPuzzleQuery(p);
    updateEditorQuery(saved, "puzzle", p.id);
    setActiveView("playground");
    setQueryResult({ columns: [], rows: [], message: "" });
    if (p.solutionQuery) {
      await resetDatabase();
      const needsSnapshot = isModifyingQuery(p.solutionQuery);
      const res = await runQuery(p.solutionQuery, true, needsSnapshot);
      setExpectedResult(res);
    } else {
      setExpectedResult(null);
    }
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

  // Ctrl+K command palette handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        items={commandItems}
      />
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
                        setSelectedDayId(activeDayWhereLeftOff);
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
                    background: "rgba(255,255,255,0.02)",
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
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                    }}
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
              <div
                className="search-shell"
                onClick={() => searchRef.current?.focus()}
              >
                <Search size={14} />
                <input
                  ref={searchRef}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search modules, problems…"
                />
                <kbd className="search-kbd-shortcut">Ctrl+K</kbd>
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
              <GamifiedHud
                solvedProblems={progress.solvedProblems}
                solvedPuzzles={progress.solvedPuzzles}
                streak={streak}
                queryRuns={progress.queryRuns}
                minutesStudied={progress.minutesStudied}
              />
              <button
                className={`icon-button theme-toggle-btn ${theme}`}
                onClick={() =>
                  setTheme((t) => {
                    if (t === "dark") return "light";
                    if (t === "light") return "oled";
                    if (t === "oled") return "dracula";
                    if (t === "dracula") return "onedark";
                    if (t === "onedark") return "ember";
                    return "dark"; // fallback to dark
                  })
                }
                title={`Theme: ${theme}. Click to switch theme.`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-label="Toggle visual theme"
              >
                {theme === "light" && (
                  <Sun size={16} style={{ color: "var(--amber)" }} />
                )}
                {theme === "oled" && (
                  <Zap size={16} style={{ color: "var(--violet)" }} />
                )}
                {theme === "dracula" && (
                  <Palette size={16} style={{ color: "var(--rose)" }} />
                )}
                {theme === "onedark" && (
                  <Code2 size={16} style={{ color: "var(--cyan)" }} />
                )}
                {theme === "ember" && (
                  <Flame size={16} style={{ color: "var(--amber)" }} />
                )}
                {!["light", "oled", "dracula", "onedark", "ember"].includes(
                  theme,
                ) && <Moon size={16} style={{ color: "var(--cyan)" }} />}
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
            <Suspense
              fallback={
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    width: "100%",
                    flexDirection: "column",
                    gap: "1rem",
                    color: "var(--muted)",
                  }}
                >
                  <div className="spinner"></div>
                  <p>Loading module...</p>
                </div>
              }
            >
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
                  onOpenStepInPlayground={(sql: string) => {
                    updateEditorQuery(sql, "free");
                    setActiveView("playground");
                  }}
                  onBackToRoadmap={() => setActiveView("roadmap")}
                />
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
                    : "rgba(31, 41, 55, 0.95)",
              color: "#fff",
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
                    : "1px solid rgba(255, 255, 255, 0.1)",
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
    </>
  );
}

/* SUB-COMPONENTS */
function MetricCard({
  icon: Icon,
  label,
  value,
  accent,
  subtext,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  accent: string;
  subtext?: string;
  onClick?: () => void;
}) {
  return (
    <article
      className={`metric-card ${accent} ${onClick ? "interactive" : ""}`}
      onClick={onClick}
    >
      <div className="metric-icon">
        <Icon size={19} />
      </div>
      <span className="metric-lbl">{label}</span>
      <strong>{value}</strong>
      {subtext && <span className="metric-sub">{subtext}</span>}
    </article>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  action,
}: {
  icon: LucideIcon;
  title: string;
  action?: string;
}) {
  return (
    <div className="section-title">
      <div>
        <Icon size={17} />
        <h2>{title}</h2>
      </div>
      {action && <span>{action}</span>}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="bullet-list">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

function QACard({
  q,
  a,
  followUp,
  mistake,
  onTry,
}: {
  q: string;
  a: string;
  followUp?: string;
  mistake?: string;
  onTry?: (sql: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const sqlMatch =
    a.match(/```sql([\s\S]*?)```/) || a.match(/```([\s\S]*?)```/);
  const tryQuery = sqlMatch ? sqlMatch[1].trim() : null;

  return (
    <div className="qa-card">
      <button className="qa-question" onClick={() => setOpen((o) => !o)}>
        <span>{q}</span>
        <ChevronRight size={14} className={open ? "rotated" : ""} />
      </button>
      {open && (
        <div
          className="qa-answer"
          style={{ display: "flex", flexDirection: "column", gap: "8px" }}
        >
          <p style={{ whiteSpace: "pre-wrap" }}>{a}</p>
          {followUp && (
            <p className="qa-followup">
              <strong>Follow-up:</strong> {followUp}
            </p>
          )}
          {mistake && (
            <p className="qa-mistake">
              <strong>Common mistake:</strong> {mistake}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* LESSON PROSE RENDERER 
   Turns raw text content into readable, styled prose.
   Detects bullets, SQL code blocks, headings, and paragraphs. */
const SQL_KEYWORDS =
  /^\s*(SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING|JOIN|LEFT|INNER|WITH|INSERT|UPDATE|DELETE|CREATE|DROP|EXPLAIN|--)/i;
const BULLET_PREFIXES = /^\s*[-•✓✗→▸*]\s+/;
const HEADING_RE = /^[A-Z][A-Z0-9 _/:&-]{3,}:?\s*$|^[A-Z].{0,60}:$/;

function LessonProse({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: JSX.Element[] = [];
  let codeBuffer: string[] = [];
  let paraBuffer: string[] = [];

  function flushCode() {
    if (codeBuffer.length === 0) return;
    elements.push(
      <pre key={`code-${elements.length}`} className="lp-code">
        {codeBuffer.join("\n")}
      </pre>,
    );
    codeBuffer = [];
  }

  function flushPara() {
    if (paraBuffer.length === 0) return;
    const joined = paraBuffer.join(" ").trim();
    if (joined) {
      elements.push(<p key={`para-${elements.length}`}>{joined}</p>);
    }
    paraBuffer = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();

    // blank line
    if (!trimmed) {
      flushCode();
      flushPara();
      continue;
    }

    // SQL code line
    if (SQL_KEYWORDS.test(trimmed) || trimmed.startsWith("`")) {
      flushPara();
      codeBuffer.push(raw.trimStart());
      continue;
    }

    // flush code if we're no longer in a SQL block
    flushCode();

    // bullet line
    if (BULLET_PREFIXES.test(raw)) {
      flushPara();
      const content = trimmed.replace(BULLET_PREFIXES, "");
      // Bold the part before first colon if any
      const colonIdx = content.indexOf(":");
      if (colonIdx > 0 && colonIdx < 50) {
        const label = content.slice(0, colonIdx);
        const rest = content.slice(colonIdx + 1);
        elements.push(
          <div key={`b-${elements.length}`} className="lp-bullet">
            <span>
              <strong>{label}</strong>
              {rest}
            </span>
          </div>,
        );
      } else {
        elements.push(
          <div key={`b-${elements.length}`} className="lp-bullet">
            {content}
          </div>,
        );
      }
      continue;
    }

    // heading-like line (short, all caps or ends with colon)
    if (HEADING_RE.test(trimmed) && trimmed.length < 80) {
      flushPara();
      elements.push(
        <div key={`h-${elements.length}`} className="lp-heading">
          {trimmed.replace(/:$/, "")}
        </div>,
      );
      continue;
    }

    // regular prose — accumulate into paragraph
    paraBuffer.push(trimmed);
  }

  flushCode();
  flushPara();

  return <div className="lesson-prose">{elements}</div>;
}

function QueryList({
  title,
  items,
  onLoad,
}: {
  title: string;
  items: QueryHistoryItem[];
  onLoad: (item: QueryHistoryItem) => void;
}) {
  return (
    <div className="query-list">
      <div className="query-list-head">
        <strong>{title}</strong>
        <span>{items.length}</span>
      </div>
      <div className="query-list-body">
        {items.length === 0 && <p>No queries yet.</p>}
        {items.slice(0, 5).map((item) => (
          <button key={item.id} onClick={() => onLoad(item)}>
            <span className={item.status}>{item.status}</span>
            <code>
              {item.query
                .split("\n")
                .find((l) => l.trim() && !l.trim().startsWith("--"))
                ?.trim()
                .slice(0, 60)}
            </code>
            <small>{fmtTime(item.createdAt)}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

/* SPLIT PANE 
   Drag the divider between left and right to resize. */
function SplitPane({
  left,
  right,
  leftWidth,
  onResize,
  minLeft = 180,
  maxLeft = 700,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
  leftWidth: number;
  onResize: (w: number) => void;
  minLeft?: number;
  maxLeft?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  function onMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const style = document.createElement("style");
    style.id = "h-split-drag-pointer-events-override";
    style.innerHTML =
      "* { pointer-events: none !important; } .split-handle, .split-handle * { pointer-events: auto !important; }";
    document.head.appendChild(style);

    function onMove(ev: MouseEvent) {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newW = Math.min(maxLeft, Math.max(minLeft, ev.clientX - rect.left));
      onResize(newW);
    }

    let safetyTimeout: ReturnType<typeof setTimeout> | null = setTimeout(
      onUp,
      3000,
    );

    function onUp() {
      if (safetyTimeout) {
        clearTimeout(safetyTimeout);
        safetyTimeout = null;
      }
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      const s = document.getElementById("h-split-drag-pointer-events-override");
      if (s) s.remove();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  return (
    <div className="split-pane" ref={containerRef}>
      <div
        className="split-left"
        style={{ width: leftWidth, minWidth: leftWidth }}
      >
        {left}
      </div>
      <div
        className="split-handle"
        onMouseDown={onMouseDown}
        title="Drag to resize"
      >
        <div className="split-handle-bar" />
      </div>
      <div className="split-right">{right}</div>
    </div>
  );
}

function VSplitPane({
  top,
  bottom,
  topHeight,
  onResize,
  minTop = 100,
  maxTop = 1200,
  maximized = false,
}: {
  top: React.ReactNode;
  bottom: React.ReactNode;
  topHeight: number;
  onResize: (h: number) => void;
  minTop?: number;
  maxTop?: number;
  maximized?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  function onMouseDown(e: React.MouseEvent) {
    if (maximized) return;
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";

    const style = document.createElement("style");
    style.id = "v-split-drag-pointer-events-override";
    style.innerHTML =
      "* { pointer-events: none !important; } .v-split-handle, .v-split-handle * { pointer-events: auto !important; }";
    document.head.appendChild(style);

    function onMove(ev: MouseEvent) {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newH = Math.min(maxTop, Math.max(minTop, ev.clientY - rect.top));
      onResize(newH);
    }

    let safetyTimeout: ReturnType<typeof setTimeout> | null = setTimeout(
      onUp,
      3000,
    );

    function onUp() {
      if (safetyTimeout) {
        clearTimeout(safetyTimeout);
        safetyTimeout = null;
      }
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      const s = document.getElementById("v-split-drag-pointer-events-override");
      if (s) s.remove();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  return (
    <div
      className="v-split-pane"
      ref={containerRef}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        flex: 1,
        minHeight: 0,
      }}
    >
      <div
        className="v-split-top"
        style={{
          height: maximized ? "100%" : topHeight,
          minHeight: maximized ? "100%" : topHeight,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          flex: maximized ? 1 : "unset",
        }}
      >
        {top}
      </div>
      {!maximized && (
        <>
          <div
            className="v-split-handle"
            onMouseDown={onMouseDown}
            title="Drag to resize"
            style={{
              height: "6px",
              cursor: "row-resize",
              background: "transparent",
              flexShrink: 0,
              position: "relative",
              zIndex: 10,
              margin: "-3px 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              className="v-split-handle-bar"
              style={{
                width: "40px",
                height: "4px",
                background: "var(--border)",
                borderRadius: "2px",
                transition: "background 0.2s",
              }}
            />
          </div>
          <div
            className="v-split-bottom"
            style={{
              flex: 1,
              minHeight: 0,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {bottom}
          </div>
        </>
      )}
    </div>
  );
}
