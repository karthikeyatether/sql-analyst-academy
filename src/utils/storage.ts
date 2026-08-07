export const STORAGE_VERSION = "v2.0";

export interface SavedQueryMeta {
  id: string;
  name: string;
  sql: string;
  timestamp: number;
  tags?: string[];
}

export const StorageKeys = {
  VERSION: "sql-aa-version",
  PROGRESS_V3: "sql-aa-progress-v3",
  HISTORY: "sql-aa-history",
  SAVED: "sql-aa-saved",
  SAVED_TAGS: "sql-aa-saved-tags",
  PROBLEM_DRAFTS: "sql-aa-problem-drafts",
  PUZZLE_DRAFTS: "sql-aa-puzzle-drafts",
  FREEFORM_QUERY: "sql-aa-freeform-query",
  ACTIVE_QUERY: "sql-aa-active-query",
  FAILED_ATTEMPTS: "sql-aa-failed-attempts",
  ZOOM: "sql-aa-zoom",
  ONBOARDED: "sql-aa-onboarded",
  STREAK: "sql-aa-streak",
  LAST_ACTIVE_DATE: "sql-aa-last-active-date",
  ACTIVE_DAYS: "sql-aa-active-days",
  DENSITY: "sql-aa-dash-density",
  COLLAPSED: "sql-aa-dash-collapsed",
  DAILY_GOAL: "sql-aa-dash-daily-goal",
} as const;

export function getStorageItem<T>(key: string, fallback: T): T {
  let s: string | null = null;
  try {
    if (typeof localStorage === "undefined") return fallback;
    s = localStorage.getItem(key);
    if (!s) return fallback;
    const parsed = JSON.parse(s);
    if (Array.isArray(fallback) && !Array.isArray(parsed)) {
      return fallback;
    }
    if (
      typeof fallback === "object" &&
      fallback !== null &&
      !Array.isArray(fallback) &&
      (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))
    ) {
      return fallback;
    }
    return parsed as T;
  } catch {
    if (typeof fallback === "string" && s !== null) {
      return s as unknown as T;
    }
    return fallback;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    if (typeof localStorage === "undefined") return;
    const serialized =
      typeof value === "string" ? value : JSON.stringify(value);
    if (serialized.length > 5 * 1024 * 1024) {
      console.warn(`[storage] Key "${key}" exceeds 5MB payload limit.`);
      return;
    }
    localStorage.setItem(key, serialized);
  } catch (err: unknown) {
    const storageError = err as { name?: string; code?: number };
    if (
      storageError.name === "QuotaExceededError" ||
      storageError.code === 22
    ) {
      console.warn(
        "[storage] QuotaExceededError encountered. Pruning query history...",
      );
      try {
        localStorage.removeItem(StorageKeys.HISTORY);
        const retrySerialized =
          typeof value === "string" ? value : JSON.stringify(value);
        localStorage.setItem(key, retrySerialized);
      } catch (pruneErr) {
        console.error("[storage] Persistent Storage Write Failure:", pruneErr);
      }
    } else {
      console.error("[storage] Failed to save to localStorage:", err);
    }
  }
}

const debounceTimers = new Map<string, number>();

export function setStorageItemDebounced<T>(
  key: string,
  value: T,
  delayMs: number = 300,
): void {
  if (typeof window === "undefined") return;
  if (debounceTimers.has(key)) {
    clearTimeout(debounceTimers.get(key));
  }
  const timer = window.setTimeout(() => {
    debounceTimers.delete(key);
    setStorageItem(key, value);
  }, delayMs);
  debounceTimers.set(key, timer);
}

export function removeStorageItem(key: string): void {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(key);
    }
  } catch {
    // Storage can be unavailable in private or restricted browsing contexts.
  }
}

export function saveQueryDeduplicated(
  name: string,
  sql: string,
  tags?: string[],
): SavedQueryMeta[] {
  const current = getStorageItem<SavedQueryMeta[]>(StorageKeys.SAVED, []);
  const normalizedSql = sql.trim();

  const filtered = current.filter(
    (item) =>
      item.name.toLowerCase() !== name.toLowerCase() &&
      item.sql.trim() !== normalizedSql,
  );

  const newEntry: SavedQueryMeta = {
    id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name,
    sql: normalizedSql,
    timestamp: Date.now(),
    tags: tags || ["custom"],
  };

  const updated = [newEntry, ...filtered];
  setStorageItem(StorageKeys.SAVED, updated);
  return updated;
}

export function migrateStorageIfNeeded(): void {
  try {
    if (typeof localStorage === "undefined") return;
    const currentVer = localStorage.getItem(StorageKeys.VERSION);
    if (currentVer !== STORAGE_VERSION) {
      // Storage Migration Logic (v1 -> v2)
      localStorage.setItem(StorageKeys.VERSION, STORAGE_VERSION);
    }
  } catch (e) {
    console.warn("[storage] Migration check skipped:", e);
  }
}

export function subscribeToCrossTabSync(
  callback: (key: string, newValue: unknown) => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: StorageEvent) => {
    if (e.key) {
      try {
        const parsed = e.newValue ? JSON.parse(e.newValue) : null;
        callback(e.key, parsed);
      } catch {
        callback(e.key, e.newValue);
      }
    }
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}
