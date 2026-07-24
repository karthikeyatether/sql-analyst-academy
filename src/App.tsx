import type { BeforeMount, OnMount } from "@monaco-editor/react";
import {
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clipboard,
  Code2,
  Command,
  Database,
  Download,
  Lightbulb,
  Menu,
  Play,
  RefreshCcw,
  Search,
  Sparkles,
  Target,
  Timer,
  X,
  Zap,
  Bug,
  Circle,
  Star,
  Settings,
  Eye,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  AlertTriangle,
  Clock,
  TrendingUp,
  Copy,
  Lock,
  GitMerge,
  Plus,
  Minus,
  Upload,
  Trash2,
  Edit3,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState, Suspense, lazy } from "react";
import { calculateSM2, loadSM2Progress, saveSM2Progress, isProblemDueForReview, SM2ProgressMap } from "./utils/sm2Engine";
// Build hash test update v2
const APP_BUILD_HASH_MARKER = "v2.0";
import DashboardView from "./views/DashboardView";
import RoadmapView from "./views/RoadmapView";
import ModulesView from "./views/ModulesView";
import PracticeView from "./views/PracticeView";
import PlaygroundView from "./views/PlaygroundView";
import PuzzlesView from "./views/PuzzlesView";
import DayDetailsView from "./views/DayDetailsView";
import MockTestView from "./views/MockTestView";

import { loader } from "@monaco-editor/react";
const Editor = lazy(() => import("@monaco-editor/react"));
import { interviewQuestionBank, mockInterviews, roadmapModules, learningRoadmap } from "./data/curriculum";
import type { Difficulty, ModuleLevel, PracticeProblem, RoadmapModule, RoadmapDay } from "./data/curriculum";
import { debugPuzzles } from "./data/puzzles";
import type { SqlPuzzle } from "./data/puzzles";
import { datasetDomains, tableSchemas } from "./data/datasets";
import {
  initDatabase,
  resetDatabase,
  runQuery,
  formatSql,
  buildExecutionPlan,
  exportDatabaseState,
  getDatabaseSnapshot,
  generateDynamicHint,
  getQueryPlan,
  getLiveSchema,
  getOptimizationAdvice,
} from "./utils/sqlEngine";
import QueryPlanFlowchart from "./components/QueryPlanFlowchart";
import OnboardingModal from "./components/OnboardingModal";
import ShortcutsModal from "./components/ShortcutsModal";
import ColumnProfileModal from "./components/ColumnProfileModal";
import { downloadStatsReport } from "./utils/reportGenerator";
import type { QueryResult, QueryPlanStep } from "./utils/sqlEngine";
import SqlJoinVennDiagram from "./components/SqlJoinVennDiagram";
import SqlLinterAdvisor from "./components/SqlLinterAdvisor";
import { lintSqlQuery } from "./utils/sqlLinter";
import type { LintError } from "./utils/sqlLinter";
import SqlPerformanceComparer from "./components/SqlPerformanceComparer";
import { ErrorBoundary } from "./components/ErrorBoundary";

type ViewId =
  | "dashboard"
  | "roadmap"
  | "modules"
  | "practice"
  | "playground"
  | "mocks"
  | "mock-runner"
  | "mock-results"
  | "day-details"
  | "puzzles"
  | "join-visualizer";
type RightTab = "schema" | "hints" | "erd" | "linter";

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
  { id: "roadmap", label: `${learningRoadmap.length}-Day Plan`, icon: BookOpen },
  { id: "practice", label: "Practice", icon: Code2 },
  { id: "playground", label: "Playground", icon: Zap },
  { id: "puzzles", label: "SQL Puzzles", icon: Bug },
  { id: "mocks", label: "Mock Tests", icon: Timer },
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

const confettiStyles = `
  @keyframes confetti-burst {
    0% {
      transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
      opacity: 1;
    }
    100% {
      transform: translate3d(var(--x-vel), var(--y-vel), 0) rotate(720deg) scale(0.3);
      opacity: 0;
    }
  }
  .confetti-particle {
    position: fixed;
    z-index: 10000;
    pointer-events: none;
  }
`;

const confettiTimeouts: any[] = [];

function injectConfettiStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("confetti-styles")) return;
  const style = document.createElement("style");
  style.id = "confetti-styles";
  style.textContent = confettiStyles;
  document.head.appendChild(style);
}

function createConfettiParticleNode(xOrigin: number, yOrigin: number, angleDeg: number, colors: string[]) {
  const p = document.createElement("div");
  p.className = "confetti-particle";
  p.style.left = xOrigin + "vw";
  p.style.top = yOrigin + "vh";
  p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

  const size = Math.random() * 8 + 6;
  p.style.width = size + "px";
  p.style.height = size + "px";
  p.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";

  const angleRad = (angleDeg * Math.PI) / 180;
  const velocity = Math.random() * 30 + 20;
  const xVelocity = Math.cos(angleRad) * velocity;
  const yVelocity = Math.sin(angleRad) * velocity;

  p.style.setProperty("--x-vel", `${xVelocity}vw`);
  p.style.setProperty("--y-vel", `${-yVelocity}vh`);

  p.style.animation = "confetti-burst 1.5s cubic-bezier(0.25, 1, 0.5, 1) forwards";

  const timer = setTimeout(() => {
    p.remove();
    const idx = confettiTimeouts.indexOf(timer);
    if (idx !== -1) confettiTimeouts.splice(idx, 1);
  }, 1600);
  confettiTimeouts.push(timer);
  return p;
}

function triggerConfetti() {
  injectConfettiStyles();
  const colors = ["#f29b9b", "#9be1f2", "#b1f29b", "#f2df9b", "#d89bf2", "#f29be1", "#38d9ff", "#fbbf24"];
  const particleCount = 80;
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < particleCount / 2; i++) {
    fragment.appendChild(createConfettiParticleNode(0, 100, Math.random() * 45 - 15, colors));
  }
  for (let i = 0; i < particleCount / 2; i++) {
    fragment.appendChild(createConfettiParticleNode(100, 100, Math.random() * 45 + 150, colors));
  }
  document.body.appendChild(fragment);
}

function cleanupConfetti() {
  confettiTimeouts.forEach(clearTimeout);
  confettiTimeouts.length = 0;
  if (typeof document !== "undefined") {
    const particles = document.querySelectorAll(".confetti-particle");
    particles.forEach((p) => p.remove());
  }
}

/* tiny helpers */
function useLocalStorage<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const s = localStorage.getItem(key);
      return s ? (JSON.parse(s) as T) : fallback;
    } catch {
      return fallback;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue] as const;
}

function classForDiff(d: Difficulty) {
  return d.toLowerCase();
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
      localStorage.setItem(currentProgressKey, JSON.stringify(migratedProgress));
    }
  }

  /* ── navigation ─────────────────────────────────────────── */
  const [activeView, setActiveView] = useLocalStorage<ViewId>("sql-aa-active-view", "roadmap");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Collapse sidebar by default on mobile load
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  }, []);

  /* ── theme ──────────────────────────────────────────────── */
  const [theme, setTheme] = useLocalStorage<"dark" | "light" | "oled">("sql-aa-theme", "dark");
  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.classList.toggle("oled", theme === "oled");
  }, [theme]);

  // Keydown handler for WAI-ARIA tablist in sidebar
  const handleSidebarNavKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    const tabButtons = Array.from(e.currentTarget.querySelectorAll('button[role="tab"]')) as HTMLButtonElement[];
    const currentIndex = tabButtons.findIndex((btn) => btn === document.activeElement);
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
    const tabButtons = Array.from(e.currentTarget.querySelectorAll('button[role="tab"]')) as HTMLButtonElement[];
    const currentIndex = tabButtons.findIndex((btn) => btn === document.activeElement);
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
  const [activeModuleId, setActiveModuleId] = useLocalStorage<number>("sql-aa-active-module-id", 1);
  const activeModule = useMemo(
    () => roadmapModules.find((m) => m.id === activeModuleId) ?? roadmapModules[0],
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
  const [roadmapSplit, setRoadmapSplit] = useLocalStorage("sql-aa-split-roadmap", 360);
  const [practiceSplit, setPracticeSplit] = useLocalStorage("sql-aa-split-practice", 340);
  const [puzzleSplit, setPuzzleSplit] = useLocalStorage("sql-aa-split-puzzle", 340);
  const [playgroundSplit, setPlaygroundSplit] = useLocalStorage("sql-aa-split-playground", 850);

  const [puzzleCategoryFilter, setPuzzleCategoryFilter] = useState<string>("All");
  const [activePuzzleId, setActivePuzzleId] = useLocalStorage<string>(
    "sql-aa-active-puzzle-id",
    debugPuzzles[0]?.id ?? "",
  );
  const activePuzzle = useMemo(
    () => debugPuzzles.find((p) => p.id === activePuzzleId) ?? debugPuzzles[0],
    [activePuzzleId],
  );
  const [playgroundMode, setPlaygroundMode] = useLocalStorage<"practice" | "puzzle" | "free">(
    "sql-aa-playground-mode-v4",
    "practice",
  );
  const [mockTest, setMockTest] = useState<MockTestState | null>(null);
  const [mockReviewIndex, setMockReviewIndex] = useState(0);
  const [selectedDayId, setSelectedDayId] = useLocalStorage<number>("sql-aa-selected-day-id", 1);
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
  const [editorFontSize, setEditorFontSize] = useLocalStorage("sql-aa-editor-fs-v4", 14);
  const [editorWordWrap, setEditorWordWrap] = useLocalStorage("sql-aa-editor-ww-v4", true);
  const [editorMinimap, setEditorMinimap] = useLocalStorage("sql-aa-editor-mm-v4", false);
  const [editorTheme, setEditorTheme] = useLocalStorage("sql-aa-editor-theme-v4", "vs-dark");
  const [graderStrict, setGraderStrict] = useLocalStorage("sql-aa-grader-strict-v4", false);
  const [rowLimit, setRowLimit] = useLocalStorage("sql-aa-row-limit-v4", "50");
  const [historySearch, setHistorySearch] = useState("");
  const [historyFavorites, setHistoryFavorites] = useLocalStorage<string[]>("sql-aa-history-favs-v4", []);
  const [showHistoryPinned, setShowHistoryPinned] = useState(false);
  const [sqlUpperKeywords, setSqlUpperKeywords] = useLocalStorage("sql-aa-upper-kw-v4", true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [erdZoom, setErdZoom] = useState(1);

  const [compareModeOpen, setCompareModeOpen] = useState(false);
  const [queryB, setQueryB] = useLocalStorage("sql-aa-query-b-v2", "SELECT * FROM customers LIMIT 5;");
  const [resB, setResB] = useState<QueryResult | null>(null);
  const [planB, setPlanB] = useState<QueryPlanStep[]>([]);
  const [benchmarkRunCount, setBenchmarkRunCount] = useState(0);

  // Custom Confirmation & Prompt Modal States
  const [customConfirmOpen, setCustomConfirmOpen] = useState(false);
  const [customConfirmMessage, setCustomConfirmMessage] = useState("");
  const [customConfirmOnConfirm, setCustomConfirmOnConfirm] = useState<(() => void) | null>(null);

  const [customPromptOpen, setCustomPromptOpen] = useState(false);
  const [customPromptMessage, setCustomPromptMessage] = useState("");
  const [customPromptValue, setCustomPromptValue] = useState("");
  const [customPromptOnSubmit, setCustomPromptOnSubmit] = useState<((val: string) => void) | null>(null);

  const showConfirm = (msg: string, onConfirm: () => void) => {
    setCustomConfirmMessage(msg);
    setCustomConfirmOnConfirm(() => onConfirm);
    setCustomConfirmOpen(true);
  };

  const showPrompt = (msg: string, defaultVal: string, onSubmit: (val: string) => void) => {
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
  const [editorTabSize, setEditorTabSize] = useLocalStorage("sql-aa-editor-ts-v4", 2);
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
  const [mockHistory, setMockHistory] = useLocalStorage<{ id: string; company: string; score: number; date: number }[]>(
    "sql-aa-mock-history-v4",
    [],
  );
  const [streak, setStreak] = useState(0);
  const [lastSavedTime, setLastSavedTime] = useState("");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [selectedConceptFilter, setSelectedConceptFilter] = useState<string>("All");

  useEffect(() => {
    // Streak check logic
    const checkStreak = () => {
      const todayStr = new Date().toISOString().split("T")[0];
      const lastDate = localStorage.getItem("sql-aa-last-active-date");
      let currentStreak = Number(localStorage.getItem("sql-aa-streak") || "0");

      if (lastDate) {
        const lastDateParts = lastDate.split("-").map(Number);
        const todayDateParts = todayStr.split("-").map(Number);
        const lastUtc = Date.UTC(lastDateParts[0], lastDateParts[1] - 1, lastDateParts[2]);
        const todayUtc = Date.UTC(todayDateParts[0], todayDateParts[1] - 1, todayDateParts[2]);
        const diffDays = Math.round((todayUtc - lastUtc) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStreak += 1;
        } else if (diffDays > 1) {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      localStorage.setItem("sql-aa-streak", String(currentStreak));
      localStorage.setItem("sql-aa-last-active-date", todayStr);
      setStreak(currentStreak);
    };
    checkStreak();
  }, []);

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
        "temp_ " +
        file.name
          .toLowerCase()
          .replace(/\.csv$/, "")
          .replace(/[^a-z0-9_]/g, "");

      try {
        // Auto-type inference for each column
        const columnTypes = headers.map(() => "INTEGER");
        for (let i = 1; i < Math.min(lines.length, 10); i++) {
          if (!lines[i]) continue;
          const vals = lines[i].split(",").map((v) => v.trim());
          for (let j = 0; j < headers.length; j++) {
            const val = vals[j];
            if (val === undefined || val === "") continue;
            if (columnTypes[j] === "TEXT") continue;

            if (/^-?\d+$/.test(val)) {
              // keep as integer
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

  const copyTableSchemaMarkdown = (table: (typeof tableSchemas)[0]) => {
    let md = `### Table: ${table.name} (${table.domain})\n\n`;
    md += `| Column | Type | Key |\n`;
    md += `| :--- | :--- | :--- |\n`;
    table.columns.forEach((c) => {
      const isPk = table.primaryKey === c.name ? "PK" : "";
      const rel = table.relationships?.find((r) => r.endsWith("." + c.name)) ? "FK" : "";
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
        `SELECT COUNT(*), COUNT(DISTINCT ${escapedColumn}), COUNT(*) - COUNT(${escapedColumn}) FROM ${escapedTable}`,
      );
      if (countRes.error || countRes.rows.length === 0) {
        showToast("Failed to profile column: " + (countRes.error || "No data"), "error");
        return;
      }

      const total = Number(countRes.rows[0][countRes.columns[0]]);
      const distinct = Number(countRes.rows[0][countRes.columns[1]]);
      const nulls = Number(countRes.rows[0][countRes.columns[2]]);

      const tableSchema = (liveSchema.length > 0 ? liveSchema : tableSchemas).find(
        (t) => t.name.toLowerCase() === tableName.toLowerCase(),
      );
      const colSchema = tableSchema?.columns.find((c) => c.name.toLowerCase() === columnName.toLowerCase());
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
          `SELECT MIN(${escapedColumn}), MAX(${escapedColumn}), AVG(${escapedColumn}) FROM ${escapedTable}`,
        );
        if (!statsRes.error && statsRes.rows.length > 0) {
          min = statsRes.rows[0][statsRes.columns[0]];
          max = statsRes.rows[0][statsRes.columns[1]];
          avg = statsRes.rows[0][statsRes.columns[2]];
        }
      }

      const freqRes = runQuery(
        `SELECT ${escapedColumn} AS val, COUNT(*) AS count FROM ${escapedTable} GROUP BY 1 ORDER BY 2 DESC LIMIT 5`,
      );
      const topValues = freqRes.error ? [] : freqRes.rows.map((r) => ({ val: r.val, count: Number(r.count) }));

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
        prose.push(`${prefix}Searches "${tableName}" using ${indexInfo} (Index Scan). Fast and optimized.`);
      } else if (dUpper.includes("USE TEMP B-TREE FOR")) {
        const match = detail.match(/USE TEMP B-TREE FOR\s+(.+)/i);
        const reason = match ? match[1] : "sorting/grouping";
        prose.push(
          `${prefix}Creates a temporary memory index for ${reason.toLowerCase()}. Suggests index optimizations.`,
        );
      } else if (dUpper.includes("SCALAR SUBQUERY")) {
        prose.push(`${prefix}Evaluates a scalar subquery for returning an individual cell value.`);
      } else if (dUpper.includes("CORRELATED")) {
        prose.push(`${prefix}Runs a correlated nested-loop subquery for each candidate row (unoptimized).`);
      } else if (dUpper.includes("COMPOUND SUBQUERIES")) {
        prose.push(`${prefix}Combines results via set operations (UNION/INTERSECT/EXCEPT).`);
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
  const [query, setQuery] = useLocalStorage("sql-aa-active-query", defaultQuery);
  const queryRef = useRef(defaultQuery);

  // Sync query ref on initial load and whenever query state changes
  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  // Preload Monaco editor bundle on mount
  useEffect(() => {
    loader.init().catch((err) => console.error("Error preloading Monaco:", err));
  }, []);

  const [liveSchema, setLiveSchema] = useState<typeof tableSchemas>([]);
  const liveSchemaRef = useRef<typeof tableSchemas>([]);
  useEffect(() => {
    liveSchemaRef.current = liveSchema;
  }, [liveSchema]);

  const [queryResult, setQueryResult] = useState<QueryResult>({ columns: [], rows: [], message: "" });
  const [expectedResult, setExpectedResult] = useState<QueryResult | null>(null);
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
            const bracketStack: { char: string; line: number; col: number }[] = [];
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
                      message: "Mismatched closing bracket: ')' has no matching '('",
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
              if (err.severity === "error") severity = monaco.MarkerSeverity.Error;
              if (err.severity === "warning") severity = monaco.MarkerSeverity.Warning;

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
  const [activeResultTab, setActiveResultTab] = useState<"your" | "expected">("your");
  const [previewData, setPreviewData] = useState<{ [table: string]: QueryResult | null }>({});
  const [activeConsoleTab, setActiveConsoleTab] = useState<"results" | "plan" | "history" | "saved" | "benchmark">(
    "results",
  );
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

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const [schemaSearch, setSchemaSearch] = useState("");


  /* keep ref in sync without causing re-renders */
  const debounceTimerRef = useRef<number | null>(null);

  const getSavedDraftQuery = useCallback((p: PracticeProblem): string => {
    const drafts = JSON.parse(localStorage.getItem("sql-aa-problem-drafts") || "{}");
    const draftVal = drafts[p.id];
    const promptComment =
      `-- ==================================================\n` +
      `--- TASK: ${p.title}\n` +
      `--- SCENARIO: ${p.businessScenario}\n` +
      `--- GOAL: ${p.prompt}\n` +
      `-- ==================================================\n\n`;
    const defaultQueryWithComment = promptComment + p.starterQuery;

    if (!draftVal) return defaultQueryWithComment;
    if (typeof draftVal === "string") {
      if (p.id.startsWith("m1-") && draftVal.includes("LIMIT")) {
        return defaultQueryWithComment;
      }
      return draftVal;
    }
    if (draftVal.starterQueryUsed === p.starterQuery) {
      return draftVal.query;
    }
    return defaultQueryWithComment;
  }, []);

  const getSavedPuzzleQuery = useCallback((p: SqlPuzzle): string => {
    const drafts = JSON.parse(localStorage.getItem("sql-aa-puzzle-drafts") || "{}");
    const draftVal = drafts[p.id];
    const promptComment =
      `-- ==================================================\n` +
      `--- DEBUG PUZZLE: ${p.title}\n` +
      `--- SCENARIO: ${p.businessScenario}\n` +
      `--- TASK: Find the bug in the query below and fix it!\n` +
      `-- ==================================================\n\n`;
    const defaultQueryWithComment = promptComment + p.flawedQuery;

    if (!draftVal) return defaultQueryWithComment;
    if (typeof draftVal === "string") {
      return draftVal;
    }
    if (draftVal.flawedQueryUsed === p.flawedQuery) {
      return draftVal.query;
    }
    return defaultQueryWithComment;
  }, []);

  const updateEditorQuery = useCallback(
    (newVal: string, pMode?: "practice" | "puzzle", targetId?: string, moveCursorToEnd = false) => {
      isProgrammaticChangeRef.current = true;
      try {
        setQuery(newVal);
        queryRef.current = newVal;
        localStorage.setItem("sql-aa-active-query", JSON.stringify(newVal));

        const mode = pMode ?? playgroundMode;
        if (mode === "practice") {
          const id = targetId ?? selectedProblemId;
          if (id) {
            const drafts = JSON.parse(localStorage.getItem("sql-aa-problem-drafts") || "{}");
            const prob = allProblems.find((x) => x.id === id);
            drafts[id] = { query: newVal, starterQueryUsed: prob ? prob.starterQuery : "" };
            localStorage.setItem("sql-aa-problem-drafts", JSON.stringify(drafts));
          }
        } else if (mode === "puzzle") {
          const id = targetId ?? activePuzzleId;
          if (id) {
            const drafts = JSON.parse(localStorage.getItem("sql-aa-puzzle-drafts") || "{}");
            const puzzle = debugPuzzles.find((x) => x.id === id);
            drafts[id] = { query: newVal, flawedQueryUsed: puzzle ? puzzle.flawedQuery : "" };
            localStorage.setItem("sql-aa-puzzle-drafts", JSON.stringify(drafts));
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
                editor.revealPosition({ lineNumber: lastLine, column: lastCol });
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
    [setQuery, playgroundMode, selectedProblemId, activePuzzleId],
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
              editor.setPosition({ lineNumber: newPos.lineNumber, column: newPos.column });
            }
            editor.focus();

            // Sync state and storage
            const updatedValue = editor.getValue();
            setQuery(updatedValue);
            queryRef.current = updatedValue;
            localStorage.setItem("sql-aa-active-query", JSON.stringify(updatedValue));
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
    }
    setIsAutoTyping(false);
  }, []);

  const autoTypeQuery = useCallback(
    (fullText: string) => {
      stopAutoTyping();
      setIsAutoTyping(true);

      let index = 0;
      updateEditorQuery("", undefined, undefined, true);

      typingIntervalRef.current = window.setInterval(() => {
        index++;
        if (index <= fullText.length) {
          const nextText = fullText.slice(0, index);
          updateEditorQuery(nextText, undefined, undefined, true);
        } else {
          stopAutoTyping();
        }
      }, 20);
    },
    [stopAutoTyping, updateEditorQuery],
  );

  const handleEditorChange = useCallback(
    (val: string | undefined) => {
      const v = val ?? "";
      queryRef.current = v;
      setQuery(v);

      lastActiveRef.current = Date.now();

      if (!isProgrammaticChangeRef.current) {
        stopAutoTyping();
      }

      if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = window.setTimeout(() => {
        localStorage.setItem("sql-aa-active-query", JSON.stringify(v));

        if (playgroundMode === "practice" && selectedProblemId) {
          const drafts = JSON.parse(localStorage.getItem("sql-aa-problem-drafts") || "{}");
          const prob = allProblems.find((x) => x.id === selectedProblemId);
          drafts[selectedProblemId] = { query: v, starterQueryUsed: prob ? prob.starterQuery : "" };
          localStorage.setItem("sql-aa-problem-drafts", JSON.stringify(drafts));
        } else if (playgroundMode === "puzzle" && activePuzzleId) {
          const drafts = JSON.parse(localStorage.getItem("sql-aa-puzzle-drafts") || "{}");
          const puzzle = debugPuzzles.find((x) => x.id === activePuzzleId);
          drafts[activePuzzleId] = { query: v, flawedQueryUsed: puzzle ? puzzle.flawedQuery : "" };
          localStorage.setItem("sql-aa-puzzle-drafts", JSON.stringify(drafts));
        } else {
          localStorage.setItem("sql-aa-freeform-query", JSON.stringify(v));
        }

        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        setLastSavedTime(timeStr);
      }, 500);
    },
    [setQuery, playgroundMode, selectedProblemId, activePuzzleId, stopAutoTyping],
  );

  /* ── persisted state ─────────────────────────────────────── */
  const [queryHistory, setQueryHistory] = useLocalStorage<QueryHistoryItem[]>("sql-aa-history", []);
  const [savedQueries, setSavedQueries] = useLocalStorage<QueryHistoryItem[]>("sql-aa-saved", []);
  const [progress, setProgress] = useLocalStorage<ProgressState>("sql-aa-progress-v3", initialProgress);

  // Real-time active study time tracker
  const lastActiveRef = useRef(Date.now());
  useEffect(() => {
    const handleActivity = () => {
      lastActiveRef.current = Date.now();
    };
    // Use capture phase (true) to intercept events before Monaco stops propagation
    window.addEventListener("keydown", handleActivity, true);
    window.addEventListener("click", handleActivity, true);
    window.addEventListener("scroll", handleActivity, true);

    const interval = setInterval(() => {
      const idleTimeMs = Date.now() - lastActiveRef.current;
      // If user was active in the last 2 minutes, count this minute as studied
      if (idleTimeMs < 120 * 1000) {
        setProgress((p) => {
          try {
            const stored = localStorage.getItem("sql-aa-progress-v3");
            const current = stored ? { ...p, ...JSON.parse(stored) } : p;
            return { ...current, minutesStudied: (current.minutesStudied || 0) + 1 };
          } catch {
            return { ...p, minutesStudied: (p.minutesStudied || 0) + 1 };
          }
        });
      }
    }, 60000); // Check every 60 seconds

    return () => {
      window.removeEventListener("keydown", handleActivity, true);
      window.removeEventListener("click", handleActivity, true);
      window.removeEventListener("scroll", handleActivity, true);
      clearInterval(interval);
    };
  }, [setProgress]);
  const [editorHeight, setEditorHeight] = useLocalStorage("sql-aa-editor-h", 350);
  const [resultHeight, setResultHeight] = useLocalStorage("sql-aa-result-h", 250);

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
          monacoRef.current.editor.getModels().forEach((model: import("monaco-editor").editor.ITextModel) => {
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
  const allProblems = useMemo(() => roadmapModules.flatMap((m) => m.problems), []);
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
    () => allProblems.filter((p) => p.isEssential || p.difficulty === "Easy" || p.difficulty === "Medium"),
    [allProblems],
  );
  const totalEssential = essentialProblems.length;
  const solvedEssential = useMemo(
    () => progress.solvedProblems.filter((id) => essentialProblems.some((p) => p.id === id)).length,
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
        (companyFilter === "All" || (p.companyTags && p.companyTags.includes(companyFilter))) &&
        (selectedConceptFilter === "All" || (p.concepts && p.concepts.includes(selectedConceptFilter))) &&
        (!showOnlyEssential || p.isEssential || p.difficulty === "Easy" || p.difficulty === "Medium"),
    );
  }, [activeModule.problems, diffFilter, companyFilter, selectedConceptFilter, showOnlyEssential]);

  // Pick 4 random Q&As for the dashboard
  const [qaItems] = useState(() => [...interviewQuestionBank].sort(() => 0.5 - Math.random()).slice(0, 4));

  /* ── mock test logic ─────────────────────────────────────── */
  useEffect(() => {
    if (activeView === "mock-runner" && mockTest?.isActive) {
      if (mockTest.timeRemaining > 0) {
        const timerId = setInterval(() => {
          setMockTest((prev) => (prev ? { ...prev, timeRemaining: prev.timeRemaining - 1 } : null));
        }, 1000);
        return () => clearInterval(timerId);
      } else {
        finishMockTest(mockTest);
      }
    }
  }, [activeView, mockTest?.isActive, mockTest?.timeRemaining]);

  function startMockTest(
    company: string,
    minutes: number,
    difficulty: string,
    maxModuleId: number,
    numQuestions: number,
  ) {
    isMockFinishingRef.current = false;
    resetDatabase();

    const diffMap: Record<string, string[]> = {
      Beginner: ["Easy"],
      "Beginner → Intermediate": ["Easy", "Medium"],
      Intermediate: ["Medium"],
      "Intermediate → Advanced": ["Medium", "Hard"],
      Advanced: ["Hard"],
    };
    const allowedDifficulties = diffMap[difficulty] || ["Easy", "Medium", "Hard"];

    const failedMap = JSON.parse(localStorage.getItem("sql-aa-failed-attempts") || "{}");
    const candidates = allProblems.filter(
      (p) => p.moduleId <= maxModuleId && allowedDifficulties.includes(p.difficulty),
    );

    const problems = candidates
      .map((p) => ({
        problem: p,
        weight: (failedMap[p.id] || 0) + (progress.solvedProblems.includes(p.id) ? 0.1 : 1.0) * (Math.random() + 0.5),
      }))
      .sort((a, b) => b.weight - a.weight)
      .map((x) => x.problem)
      .slice(0, numQuestions);

    const finalProblems =
      problems.length === numQuestions ? problems : candidates.sort(() => 0.5 - Math.random()).slice(0, numQuestions);

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
    setQueryResult({ columns: [], rows: [], message: "Run your query to test it." });
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
      return { isCorrect: false, message: "Query Error", details: userRes.error };
    }
    if (expRes.error) {
      return { isCorrect: false, message: "System Solution Error", details: expRes.error };
    }

    // Helper utility to detect mutating DML/DDL queries
    const cleanSql = solutionSql.replace(/(--.*)|(\/\*[\s\S]*?\*\/)/g, "").trim();
    const isDmlOrDdl = /^\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|REPLACE|TRUNCATE|BEGIN)\b/i.test(cleanSql);

    if (isDmlOrDdl) {
      if (!userSnapshot || !expSnapshot) {
        return { isCorrect: false, message: "State Check Failed", details: "Unable to inspect database tables." };
      }
      const match = JSON.stringify(userSnapshot) === JSON.stringify(expSnapshot);
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
    const missing = expCols.filter((c) => !userColsLower.includes(c.toLowerCase()));
    const extra = userCols.filter((c) => !expColsLower.includes(c.toLowerCase()));

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
    const orderMismatch = userCols.some((c, i) => c.toLowerCase() !== expCols[i].toLowerCase());
    if (orderMismatch) {
      if (graderStrict) {
        return {
          isCorrect: false,
          message: "Column order mismatch (Strict Mode)",
          details: `Strict Mode is enabled. Expected columns: [${expCols.join(", ")}]. Got: [${userCols.join(", ")}].`,
        };
      } else {
        warning = `Columns match but are in a different order. ` +
                `Expected: [${expCols.join(", ")}]. Got: [${userCols.join(", ")}]. ` +
                `Graded correct anyway!`;
      }
    }

    // CTE and subquery usage warnings
    try {
      const userSql = queryRef.current;
      const userCleanSql = userSql.replace(/(--.*)|(\/\*[\s\S]*?\*\/)/g, "").trim();

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
        const cteWarning = `Warning: Unused CTE or subquery alias [${unusedList.join(", ")}] ` +
                       `detected. Please reference or remove it.`;
        warning = warning ? `${warning} ${cteWarning}` : cteWarning;
      }
    } catch (e) {
      console.warn("Grader warnings failed:", e);
    }

    // Anti-Cheat Check: Ensure the user's query is not just returning hardcoded literals
    try {
      const solClean = solutionSql.replace(/(--.*)|(\/\*[\s\S]*?\*\/)/g, "");
      const userClean = queryRef.current.replace(/(--.*)|(\/\*[\s\S]*?\*\/)/g, "");

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
            details: `Your query must reference the appropriate database tables ` +
                 `(e.g., ${referencedTables.join(", ")}).`,
          };
        }
      }

      // Hardcoded Literal Output Bypass Detection
      const selectMatch = userClean.match(/SELECT\s+([\s\S]+?)\s+\bFROM\b/i);
      if (selectMatch) {
        const selectClause = selectMatch[1].trim();
        const strLiterals = Array.from(selectClause.matchAll(/'([^']*)'/g)).map((m) => m[1]);
        const numLiterals = Array.from(selectClause.matchAll(/\b(?<!\w)(\d+(?:\.\d+)?)\b(?!\w)/g)).map((m) => m[1]);
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

        const solSelectMatch = solClean.match(/SELECT\s+([\s\S]+?)\s+\bFROM\b/i);
        const solSelect = solSelectMatch ? solSelectMatch[1].toLowerCase() : "";

        let matchingLiterals = 0;
        [...strLiterals, ...numLiterals].forEach((lit) => {
          const litStr = String(lit).trim().toLowerCase();
          if (expValuesSet.has(litStr) && !solSelect.includes(litStr)) {
            matchingLiterals++;
          }
        });

        const numExpCols = expRes?.columns?.length ?? 1;
        const hasAggFuncs = /\b(COUNT|SUM|AVG|MIN|MAX|DENSE_RANK|RANK|ROW_NUMBER|LAG|LEAD)\b/i.test(selectClause);

        const isBypass =
          matchingLiterals >= 1 &&
          (scalarSubqueries || staticCases || matchingLiterals >= numExpCols * 0.5 || !hasAggFuncs);

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

      return String(normA) === String(normB);
    };

    const uVals = userRes.rows.map((r) =>
      expCols.map((c) => {
        const actualKey = Object.keys(r).find((k) => k.toLowerCase() === c.toLowerCase()) || c;
        return normalizeVal(r[actualKey]);
      }),
    );
    const sVals = expRes.rows.map((r) => expCols.map((c) => normalizeVal(r[c])));

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

          const strA = String(valA);
          const strB = String(valB);
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

  function submitMockAnswer(q: string) {
    if (!mockTest) return;
    const currentQ = mockTest.questions[mockTest.currentIndex];

    const needsSnapshot = isModifyingQuery(q) || isModifyingQuery(currentQ.solution);

    // 1. Reset database and run solution query FIRST to ensure clean baseline
    resetDatabase();
    const solResult = runQuery(currentQ.solution, true, needsSnapshot);
    const expSnapshot = solResult.snapshot ?? null;

    // 2. Reset database again and run user query
    resetDatabase();
    const userResult = runQuery(q, true, needsSnapshot);
    const userSnapshot = userResult.snapshot ?? null;

    const isCorrect = verifyAnswer(userResult, solResult, userSnapshot, expSnapshot, currentQ.solution).isCorrect;

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
      setQueryResult({ columns: [], rows: [], message: "Run your query to test it." });
    }
  }

  function finishMockTest(finalState: MockTestState) {
    if (isMockFinishingRef.current) return;
    isMockFinishingRef.current = true;
    const score = Math.round(
      (finalState.answers.filter((a) => a.isCorrect).length / finalState.questions.length) * 100,
    );
    setProgress((p) => ({
      ...p,
      mockScores: { ...p.mockScores, [finalState.company]: Math.max(p.mockScores[finalState.company] ?? 0, score) },
    }));

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
  const modPct = Math.round((progress.completedModules.length / totalModules) * 100);
  const probPct = Math.round((progress.solvedProblems.length / totalProblems) * 100) || 0;
  const puzPct = Math.round(((progress.solvedPuzzles || []).length / debugPuzzles.length) * 100);

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
  // Calculate average of mock tests taken rather than total possible mocks
  const mockPct = mocksTaken > 0 ? Math.round(mockSum / mocksTaken) : 0;

  const readiness = Math.min(100, Math.round(modPct * 0.2 + probPct * 0.3 + puzPct * 0.2 + mockPct * 0.3));

  const totalXP =
    progress.completedModules.length * 15 +
    progress.solvedProblems.length * 10 +
    (progress.solvedPuzzles || []).length * 20 +
    Object.keys(progress.mockScores).length * 100;

  const currentLevel = Math.floor(totalXP / 150) + 1;
  const xpForNextLevel = 150;
  const currentLevelXP = totalXP % 150;
  const xpProgressPercent = Math.min(100, Math.round((currentLevelXP / xpForNextLevel) * 100));
  const xpRemaining = xpForNextLevel - currentLevelXP;
  const next = useMemo(() => roadmapModules.find((m) => !progress.completedModules.includes(m.id)) || roadmapModules[0], [progress.completedModules]);

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
      .filter((m) => `${m.title} ${m.level} ${m.track}`.toLowerCase().includes(t))
      .slice(0, 5)
      .map((m) => ({ type: "Module", label: `M${m.id}: ${m.title}`, id: m.id as string | number }));
    const probs = allProblems
      .filter((p) => `${p.title} ${p.prompt} ${p.concepts.join(" ")}`.toLowerCase().includes(t))
      .slice(0, 4)
      .map((p) => ({ type: "Problem", label: p.title, id: p.id as string | number }));
    return [...mods, ...probs];
  }, [allProblems, searchTerm]);

  const [dbReady, setDbReady] = useState(false);

  /* ── init ────────────────────────────────────────────────── */
  useEffect(() => {
    const init = async () => {
      try {
        await initDatabase();
        setDbReady(true);

        let initialQuery = query;
        if (activeView === "playground") {
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
        }

        setQuery(initialQuery);
        queryRef.current = initialQuery;
        localStorage.setItem("sql-aa-active-query", JSON.stringify(initialQuery));

        setQueryResult(runQuery(initialQuery));
        setLiveSchema(getLiveSchema());
      } catch (err) {
        console.error("Database initialization failed:", err);
        setQueryResult({
          columns: [],
          rows: [],
          message: "Database Engine Initialization Failed",
          error: "Failed to initialize SQLite WASM database engine. Please refresh the page to reload the engine.",
        });
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const latestRunQueryRef = useRef(runCurrentQuery);
  useEffect(() => {
    latestRunQueryRef.current = runCurrentQuery;
  });

  /* ── keyboard shortcuts ──────────────────────────────────── */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      const typing =
        tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement).getAttribute("contenteditable") === "true";
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
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      cleanupConfetti();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — runCurrentQuery is stable via latestRunQueryRef

  /* ── monaco setup ────────────────────────────────────────── */
  const handleBeforeMount: BeforeMount = useCallback((monaco) => {
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

        const currentSchema = liveSchemaRef.current.length > 0 ? liveSchemaRef.current : tableSchemas;

        if (dotMatch) {
          const tableNameOrAlias = dotMatch[1].toLowerCase();
          const fullText = model.getValue();
          let tableName = tableNameOrAlias;

          // Regex to parse simple aliases, e.g. "customers c" or "orders AS o" or "FROM customers   c"
          const aliasRegex = /\b([a-zA-Z0-9_]+)\s+(?:as\s+)?([a-zA-Z0-9_]+)\b/gi;
          let match;
          const aliases: Record<string, string> = {};

          while ((match = aliasRegex.exec(fullText)) !== null) {
            const table = match[1].toLowerCase();
            const alias = match[2].toLowerCase();
            const tableExists = currentSchema.some((t) => t.name.toLowerCase() === table);
            const isKeyword = [
              "select",
              "from",
              "where",
              "join",
              "left",
              "right",
              "on",
              "and",
              "or",
              "as",
              "group",
              "by",
              "order",
              "having",
              "limit",
              "union",
              "with",
            ].includes(alias);
            if (tableExists && !isKeyword) {
              aliases[alias] = table;
            }
          }

          if (aliases[tableNameOrAlias]) {
            tableName = aliases[tableNameOrAlias];
          }

          const tableSchema = currentSchema.find((t) => t.name.toLowerCase() === tableName);
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
        const tableAndCols = currentSchema.flatMap((t) => [t.name, ...t.columns.map((c) => c.name)]);
        const dynamicKeywords = [...new Set([...keywordsList, ...tableAndCols])];

        const keywordItems = dynamicKeywords.map((label) => {
          let kind = monaco.languages.CompletionItemKind.Keyword;
          let detail = "SQL Keyword";
          const isTable = currentSchema.some((t) => t.name === label);
          if (isTable) {
            kind = monaco.languages.CompletionItemKind.Class;
            detail = "Database Table";
          }
          return {
            label,
            kind,
            detail,
            insertText: label,
            range,
          };
        });

        const snippets = [
          {
            label: "SELECT template",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "SELECT\n  ${1:*}\nFROM ${2:table}\nWHERE ${3:condition};",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Create a basic SELECT template query",
            range,
          },
          {
            label: "JOIN template",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "JOIN ${1:table2} ON ${2:table1}.${3:id} = ${4:table2}.${5:foreign_id}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Create an INNER JOIN template",
            range,
          },
          {
            label: "LEFT JOIN template",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "LEFT JOIN ${1:table2} ON ${2:table1}.${3:id} = ${4:table2}.${5:foreign_id}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Create a LEFT OUTER JOIN template",
            range,
          },
          {
            label: "WITH (CTE) template",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "WITH ${1:cte_name} AS (\n  SELECT ${2:*}\n  FROM ${3:table}\n)\nSELECT * FROM ${1:cte_name};",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Create a Common Table Expression (CTE) query template",
            range,
          },
          {
            label: "CASE WHEN template",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "CASE\n  WHEN ${1:condition} THEN ${2:value}\n  ELSE ${3:default_value}\nEND",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Create a conditional CASE statement",
            range,
          },
          {
            label: "WINDOW function template",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "${1:ROW_NUMBER()} OVER (PARTITION BY ${2:column} ORDER BY ${3:sort_column} ${4:DESC})",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Create a window function OVER clause",
            range,
          },
        ];

        return { suggestions: [...keywordItems, ...snippets] };
      },
    });

    completionProviderRef.current = provider;
  }, []);

  const handleMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    monaco.editor.defineTheme("hc-oled", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#000000",
        "editorGutter.background": "#000000",
        "editor.lineHighlightBackground": "#0d0d0d",
      },
    });
  }, []);

  /* ── SQL actions ─────────────────────────────────────────── */
  // Helper utility to detect mutating queries
  function isModifyingQuery(sqlText: string) {
    const clean = sqlText.replace(/(--.*)|(\/\*[\s\S]*?\*\/)/g, ""); // Strip comments
    return /\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|REPLACE|TRUNCATE)\b/i.test(clean);
  }

  function runCurrentQuery() {
    if (editorMaximized) {
      setEditorMaximized(false);
    }
    let sql = queryRef.current;
    if (rowLimit !== "Unlimited" && /^\s*SELECT\b/i.test(sql) && !/\bLIMIT\b/i.test(sql)) {
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
    const planSteps = getQueryPlan(sql);
    setQueryPlanSteps(planSteps);

    const isMockMode = activeView === "mock-runner";
    const needsSnapshot = isModifyingQuery(sql);

    if (isMockMode) {
      resetDatabase();
      const result = runQuery(sql, true, needsSnapshot);
      setQueryResult(result);
      setLiveSchema(getLiveSchema());
      return;
    }

    if (playgroundMode === "free") {
      const result = runQuery(sql, false, needsSnapshot);
      setQueryResult(result);
      setLiveSchema(getLiveSchema());
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

    const solutionNeedsSnapshot = !!(solutionSql && isModifyingQuery(solutionSql));
    const combinedNeedsSnapshot = needsSnapshot || solutionNeedsSnapshot;

    if (solutionSql) {
      resetDatabase(); // Ensure clean state before running solution
      const res = runQuery(solutionSql, true, combinedNeedsSnapshot);
      expected = res;
      expectedSnapshot = res.snapshot ?? null;
    }

    // 2. Now run user query
    resetDatabase(); // Must reset again so user query runs on a clean DB!
    const isSandboxMode = playgroundMode === "practice" || playgroundMode === "puzzle";
    const result = runQuery(sql, isSandboxMode, combinedNeedsSnapshot);
    const userSnapshot = result.snapshot ?? null;

    const status: QueryHistoryItem["status"] = result.error ? "error" : "success";
    setQueryResult(result);

    // Dynamic Schema Sync
    setLiveSchema(getLiveSchema());

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
      const feedback = verifyAnswer(result, expected, userSnapshot, expectedSnapshot, solutionSql);
      setGraderFeedback(feedback);
      const isCorrect = feedback.isCorrect;
      if (isCorrect) {
        triggerConfetti();
        if (playgroundMode === "practice" && selectedProblem) {
          const attempts = JSON.parse(localStorage.getItem("sql-aa-failed-attempts") || "{}");
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
          const attempts = JSON.parse(localStorage.getItem("sql-aa-failed-attempts") || "{}");
          attempts[selectedProblem.id] = (attempts[selectedProblem.id] || 0) + 1;
          localStorage.setItem("sql-aa-failed-attempts", JSON.stringify(attempts));
        }
      }
    } else {
      setExpectedResult(null);
      setGraderFeedback(null);
    }
  }

  function runABBenchmark() {
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
  }

  function resetPlayground() {
    resetDatabase();
    if (selectedProblemId && playgroundMode === "practice") {
      const p = allProblems.find((x) => x.id === selectedProblemId);
      if (p) {
        const drafts = JSON.parse(localStorage.getItem("sql-aa-problem-drafts") || "{}");
        delete drafts[selectedProblemId];
        localStorage.setItem("sql-aa-problem-drafts", JSON.stringify(drafts));
        const saved = getSavedDraftQuery(p);
        updateEditorQuery(saved);
        setQueryResult(runQuery(saved, true));
        setLiveSchema(getLiveSchema());
        triggerResetStatus();
        return;
      }
    } else if (activePuzzleId && playgroundMode === "puzzle") {
      const p = debugPuzzles.find((x) => x.id === activePuzzleId);
      if (p) {
        const drafts = JSON.parse(localStorage.getItem("sql-aa-puzzle-drafts") || "{}");
        delete drafts[activePuzzleId];
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
  }

  function togglePreviewData(table: string) {
    setPreviewData((prev) => {
      if (prev[table]) {
        const next = { ...prev };
        delete next[table];
        return next;
      } else {
        return { ...prev, [table]: runQuery(`SELECT * FROM ${table} LIMIT 5`) };
      }
    });
  }

  function saveQuery() {
    const sql = queryRef.current;
    const status: QueryHistoryItem["status"] = queryResult.error ? "error" : "success";
    setSavedQueries((s) =>
      [{ id: crypto.randomUUID(), query: sql, createdAt: new Date().toISOString(), status }, ...s].slice(0, 12),
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

  function openInPlayground(p: PracticeProblem) {
    stopAutoTyping();
    setPlaygroundMode("practice");
    const saved = getSavedDraftQuery(p);
    updateEditorQuery(saved, "practice", p.id);
    setSelectedProblemId(p.id);
    setActiveModuleId(p.moduleId);
    setActiveView("playground");
    setQueryResult({ columns: [], rows: [], message: "" });
    if (p.solution) {
      resetDatabase();
      const needsSnapshot = isModifyingQuery(p.solution);
      const res = runQuery(p.solution, true, needsSnapshot);
      setExpectedResult(res);
    } else {
      setExpectedResult(null);
    }
  }

  function markModuleDone(id: number) {
    setProgress((p) => {
      const alreadyCompleted = p.completedModules.includes(id);
      const nextModules = alreadyCompleted ? p.completedModules : [...p.completedModules, id];
      let nextCompletedDays = p.completedDays ? [...p.completedDays] : [];

      const parentDay = learningRoadmap.find((d) => d.modules.includes(id));
      if (parentDay) {
        const allDayModulesCompleted = parentDay.modules.every((mId) => nextModules.includes(mId));
        if (allDayModulesCompleted && !nextCompletedDays.includes(parentDay.day)) {
          nextCompletedDays.push(parentDay.day);
        }
      }

      return {
        ...p,
        completedModules: nextModules,
        completedDays: nextCompletedDays,
        minutesStudied: alreadyCompleted ? p.minutesStudied : p.minutesStudied + 20,
      };
    });
  }

  function toggleDayComplete(day: number) {
    setProgress((p) => {
      const days = p.completedDays || [];
      return {
        ...p,
        completedDays: days.includes(day) ? days.filter((d) => d !== day) : [...days, day],
      };
    });
  }

  function toggleChecklistItem(itemId: string) {
    setProgress((p) => {
      const items = p.completedChecklistItems || [];
      return {
        ...p,
        completedChecklistItems: items.includes(itemId) ? items.filter((id) => id !== itemId) : [...items, itemId],
      };
    });
  }

  const [sm2Progress, setSm2Progress] = useState<SM2ProgressMap>(() => loadSM2Progress());

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
      const nextSolved = alreadySolved ? prev.solvedProblems : [...prev.solvedProblems, p.id];
      const minutesAdded = alreadySolved ? 0 : 8;

      let nextCompletedModules = [...prev.completedModules];
      let nextCompletedDays = prev.completedDays ? [...prev.completedDays] : [];
      let extraMinutes = 0;

      const moduleId = p.moduleId;
      const mod = roadmapModules.find((m) => m.id === moduleId);
      if (mod) {
        const allModProblemsSolved = mod.problems.every((prob) => nextSolved.includes(prob.id));
        if (allModProblemsSolved && !nextCompletedModules.includes(moduleId)) {
          nextCompletedModules.push(moduleId);
          extraMinutes += 20;

          const parentDay = learningRoadmap.find((d) => d.modules.includes(moduleId));
          if (parentDay) {
            const allDayModulesCompleted = parentDay.modules.every((mId) => nextCompletedModules.includes(mId));
            if (allDayModulesCompleted && !nextCompletedDays.includes(parentDay.day)) {
              nextCompletedDays.push(parentDay.day);
            }
          }
        }
      }

      return {
        ...prev,
        solvedProblems: nextSolved,
        completedModules: nextCompletedModules,
        completedDays: nextCompletedDays,
        minutesStudied: prev.minutesStudied + minutesAdded + extraMinutes,
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
      return {
        ...prev,
        solvedPuzzles: sp.includes(p.id) ? sp : [...sp, p.id],
        minutesStudied: prev.minutesStudied + 10,
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
        setQueryResult({ columns: [], rows: [], message: "Run your query to test it." });
        setActiveView("playground");
      }
    }
    setSearchTerm("");
  }

  /* RENDER HELPERS */
  const lessonTabs = ["Concept", "Mistakes", "Cheat Sheet", "Practice"];


  /* ── views ─────────────────────────────────────────────── */



  function openPuzzleInPlayground(p: SqlPuzzle) {
    stopAutoTyping();
    setActivePuzzleId(p.id);
    setPlaygroundMode("puzzle");
    const saved = getSavedPuzzleQuery(p);
    updateEditorQuery(saved, "puzzle", p.id);
    setActiveView("playground");
    setQueryResult({ columns: [], rows: [], message: "" });
    if (p.solutionQuery) {
      resetDatabase();
      const needsSnapshot = isModifyingQuery(p.solutionQuery);
      const res = runQuery(p.solutionQuery, true, needsSnapshot);
      setExpectedResult(res);
    } else {
      setExpectedResult(null);
    }
  }


  function getDialectNotes(moduleId: number): { title: string; notes: string } | null {
    switch (moduleId) {
      case 4: // Module 4 — Limiting Results (LIMIT)
        return {
          title: "LIMIT vs TOP / FETCH FIRST",
          notes:
            "• SQLite / PostgreSQL / MySQL: SELECT col FROM tbl LIMIT 5;\n" +
            "• SQL Server (T-SQL): SELECT TOP 5 col FROM tbl;\n" +
            "• Oracle / ANSI SQL: SELECT col FROM tbl FETCH FIRST 5 ROWS ONLY;",
        };
      case 19: // Module 19 — Full Joins (FULL OUTER JOIN)
        return {
          title: "FULL OUTER JOIN Support",
          notes:
            "• PostgreSQL / SQL Server: Supports FULL OUTER JOIN natively.\n" +
            "• SQLite / MySQL: Do not support FULL OUTER JOIN. You must simulate it using " +
      "LEFT JOIN + UNION + reverse LEFT JOIN (with IS NULL filter to exclude duplicates).",
        };
      case 25: // Module 25 — Window Functions: ROW_NUMBER
      case 26: // Module 26 — Window Functions: RANK & DENSE_RANK
      case 27: // Module 27 — Window Functions: LEAD & LAG
      case 28: // Module 28 — Running Totals (window SUM OVER)
        return {
          title: "Window Functions Dialect Support",
          notes:
            "• PostgreSQL / SQL Server (2012+): Native support for OVER (PARTITION BY ... ORDER BY ...).\n" +
            "• MySQL: Supported only in version 8.0+. Older versions require session variables " +
      "or correlated subqueries.\n" +
            "• SQLite: Supported in version 3.25.0+ (2018). In older environments, use self-joins " +
      "or correlated subqueries as workarounds.",
        };
      case 30: // Module 30 — INTERSECT & EXCEPT
        return {
          title: "Set Ops (INTERSECT & EXCEPT) Dialect Support",
          notes:
            "• SQLite (3.39+): Supports INTERSECT and EXCEPT natively.\n" +
            "• MySQL: Supported only in version 8.0.31+. Workaround for older versions:\n" +
            "  EXCEPT → LEFT JOIN with IS NULL: SELECT a.id FROM tblA a " +
      "LEFT JOIN tblB b ON a.id = b.id WHERE b.id IS NULL\n" +
            "  INTERSECT → INNER JOIN on the key column.",
        };
      case 8: // Module 8 — Range Filtering with BETWEEN (includes date range filtering)
        return {
          title: "Date Formatting & Range Filtering",
          notes:
            "• SQLite: Use strftime('%Y-%m-%d', order_date) or date(order_date) for date formatting.\n" +
            " Date comparison: order_date BETWEEN '2024-01-01' AND '2024-12-31'\n" +
            "• MySQL: DATE_FORMAT(order_date, '%Y-%m-%d') or DATE() function.\n" +
            "• PostgreSQL: TO_CHAR(order_date, 'YYYY-MM-DD') or CAST(order_date AS DATE).",
        };
      case 6: // Module 6 — Pattern Matching with LIKE (string functions)
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
      case 31: // Module 31 — Conditional Logic: CASE WHEN
        return {
          title: "CASE WHEN Compatibility",
          notes:
            "• All Dialects: CASE WHEN syntax is fully standardized and portable across MySQL, " +
      "PostgreSQL, SQL Server, SQLite, and Oracle.\n" +
            "• PostgreSQL bonus: SUM(amount) FILTER (WHERE region = 'South') is a cleaner " +
      "alternative to SUM(CASE WHEN ...).\n" +
            "• Case sensitivity: String comparisons inside CASE WHEN are case-sensitive in most default collations.",
        };
      case 32: // Module 32 — Manual Pivoting
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




  // INTERACTIVE ERD EXPLORER MODAL

  // ONBOARDING AND LESSON MODALS


  useEffect(() => {
    if (!customConfirmOpen && !customPromptOpen) return;
    const modalId = customConfirmOpen ? "custom-confirm-dialog" : "custom-prompt-dialog";
    const timer = setTimeout(() => {
      const modalElement = document.getElementById(modalId);
      if (!modalElement) return;

      const focusable = modalElement.querySelectorAll('button, input, [tabindex="0"]');
      if (focusable.length > 0) {
        const inputEl = modalElement.querySelector('input');
        if (inputEl) {
          inputEl.focus();
        } else {
          (focusable[0] as HTMLElement).focus();
        }
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setCustomConfirmOpen(false);
          setCustomPromptOpen(false);
        }
        if (e.key === "Tab" && focusable.length > 0) {
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
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, 0);
    return () => clearTimeout(timer);
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
            <button className="icon-button" onClick={() => setCustomConfirmOpen(false)} aria-label="Close modal">
              <X size={16} />
            </button>
          </div>
          <div className="custom-modal-body">
            <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.5", color: "var(--text)" }}>
              {customConfirmMessage}
            </p>
          </div>
          <div className="custom-modal-footer" style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button className="primary-button outline compact" onClick={() => setCustomConfirmOpen(false)}>
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
            <button className="icon-button" onClick={() => setCustomPromptOpen(false)} aria-label="Close modal">
              <X size={16} />
            </button>
          </div>
          <div className="custom-modal-body">
            <p style={{ margin: "0 0 10px 0", fontSize: "12px", color: "var(--text-secondary)" }}>
              {customPromptMessage}
            </p>
            <input
              type="text"
              value={customPromptValue}
              onChange={(e) => setCustomPromptValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (customPromptOnSubmit) customPromptOnSubmit(customPromptValue);
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
          <div className="custom-modal-footer" style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button className="primary-button outline compact" onClick={() => setCustomPromptOpen(false)}>
              Cancel
            </button>
            <button
              className="primary-button compact"
              onClick={() => {
                if (customPromptOnSubmit) customPromptOnSubmit(customPromptValue);
                setCustomPromptOpen(false);
              }}
              style={{ background: "var(--violet)", borderColor: "var(--violet)" }}
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
  if (!dbReady) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100vw",
          background: "#0b0f19",
          color: "#f8fafc",
          fontFamily: "system-ui, -apple-system, sans-serif",
          gap: "20px",
        }}
      >
        <div
          style={{
            width: "45px",
            height: "45px",
            border: "3.5px solid rgba(56, 217, 255, 0.08)",
            borderTop: "3.5px solid #38d9ff",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `,
          }}
        />
        <div style={{ textAlign: "center" }}>
          <strong
            style={{
              fontSize: "17px",
              color: "#38d9ff",
              display: "block",
              marginBottom: "6px",
              letterSpacing: "0.02em",
            }}
          >
            Initializing SQL Engine...
          </strong>
          <span style={{ fontSize: "12.5px", color: "#94a3b8" }}>Setting up in-browser SQLite environment</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-shell ${sidebarOpen ? "sb-open" : "sb-closed"}`}>
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
      {/* ── SIDEBAR ───────────────────────────────────── */}
      <aside className="sidebar">
        <div className="brand-row">
          <div className="brand-mark">
            <Database size={20} />
          </div>
          <div>
            <strong>SQL Analyst</strong>
            <span>Academy</span>
          </div>
          <button className="icon-button" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
            <X size={16} />
          </button>
        </div>

        <nav className="sidebar-nav" role="tablist" aria-label="Main Navigation" onKeyDown={handleSidebarNavKeyDown}>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={activeView === id ? "active" : ""}
              onClick={() => {
                if (id === "playground") {
                  enterFreeformPlayground();
                } else {
                  setActiveView(id);
                }
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
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
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
                <div style={{ width: `${xpProgressPercent}%`, height: "100%", background: "var(--cyan)" }} />
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

      {/* ── MAIN ─────────────────────────────────────── */}
      <main className="main-shell">
        {/* topbar */}
        <header className="topbar">
          <button className="icon-button tb-ham" onClick={() => setSidebarOpen((o) => !o)}>
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
                    <button key={`${item.type}-${item.id}`} onClick={() => handleSearchPick(item)}>
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
              onClick={() => {
                showConfirm(
                  "Are you sure you want to reset all your learning progress, statistics, " +
        "and drafts? This cannot be undone.",
                  () => {
                    Object.keys(localStorage).forEach((key) => {
                      if (key.startsWith("sql-aa-")) {
                        localStorage.removeItem(key);
                      }
                    });
                    window.location.reload();
                  },
                );
              }}
              title="Reset Platform Progress & Drafts"
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
              aria-label="Reset Platform Progress & Drafts"
            >
              <RefreshCcw size={15} />
            </button>
            <button
              className={`icon-button theme-toggle-btn ${theme}`}
              onClick={() => setTheme((t) => (t === "dark" ? "light" : t === "light" ? "oled" : "dark"))}
              title={`Theme: ${theme}. Click to switch theme.`}
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
              aria-label="Toggle visual theme"
            >
              {theme === "dark" && <Sun size={16} />}
              {theme === "light" && <Moon size={16} />}
              {theme === "oled" && <Zap size={16} style={{ color: "var(--violet)" }} />}
            </button>
            <span title="Readiness">
              <Target size={14} />
              {readiness}%
            </span>
            {activeView === "playground" && (
              <button
                className="icon-button"
                title="Toggle schema panel"
                onClick={() => setRightOpen((o) => !o)}
                aria-label="Toggle Schema Browser Panel"
              >
                <Database size={16} />
              </button>
            )}
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
          {(activeView === "mocks" || activeView === "mock-runner" || activeView === "mock-results") && (
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
          {activeView === "join-visualizer" && (
            <div style={{ padding: "2rem 3rem", maxWidth: "900px", margin: "0 auto", width: "100%" }}>
              <ErrorBoundary fallbackTitle="SQL Join Venn Sandbox Panel">
                <SqlJoinVennDiagram />
              </ErrorBoundary>
            </div>
          )}
        </div>
      </main>

      {showOnboarding && <OnboardingModal roadmapLength={learningRoadmap.length} onClose={completeOnboarding} />}
      {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}
      {activeColumnProfile && (
        <ColumnProfileModal profile={activeColumnProfile} onClose={() => setActiveColumnProfile(null)} />
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
    <article className={`metric-card ${accent} ${onClick ? "interactive" : ""}`} onClick={onClick}>
      <div className="metric-icon">
        <Icon size={19} />
      </div>
      <span className="metric-lbl">{label}</span>
      <strong>{value}</strong>
      {subtext && <span className="metric-sub">{subtext}</span>}
    </article>
  );
}

function SectionTitle({ icon: Icon, title, action }: { icon: LucideIcon; title: string; action?: string }) {
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
  const sqlMatch = a.match(/```sql([\s\S]*?)```/) || a.match(/```([\s\S]*?)```/);
  const tryQuery = sqlMatch ? sqlMatch[1].trim() : null;

  return (
    <div className="qa-card">
      <button className="qa-question" onClick={() => setOpen((o) => !o)}>
        <span>{q}</span>
        <ChevronRight size={14} className={open ? "rotated" : ""} />
      </button>
      {open && (
        <div className="qa-answer" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <p style={{ whiteSpace: "pre-wrap" }}>{a}</p>
          {tryQuery && onTry && (
            <button
              className="primary-button compact outline try-qa-btn"
              onClick={() => onTry(tryQuery)}
              style={{
                marginTop: "6px",
                width: "max-content",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "11px",
                padding: "4px 10px",
                height: "auto",
                background: "rgba(56, 217, 255, 0.08)",
                border: "1px solid rgba(56, 217, 255, 0.15)",
                color: "var(--cyan)",
                borderRadius: "4px",
              }}
            >
              <Zap size={11} /> Try in Playground
            </button>
          )}
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

    let safetyTimeout: ReturnType<typeof setTimeout> | null = setTimeout(onUp, 3000);

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
      <div className="split-left" style={{ width: leftWidth, minWidth: leftWidth }}>
        {left}
      </div>
      <div className="split-handle" onMouseDown={onMouseDown} title="Drag to resize">
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

    let safetyTimeout: ReturnType<typeof setTimeout> | null = setTimeout(onUp, 3000);

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
      style={{ display: "flex", flexDirection: "column", height: "100%", flex: 1, minHeight: 0 }}
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
            style={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}
          >
            {bottom}
          </div>
        </>
      )}
    </div>
  );
}
