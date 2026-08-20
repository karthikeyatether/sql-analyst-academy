export const STORAGE_VERSION = "2.0";

export interface SavedQueryMeta {
  id: string;
  name: string;
  sql: string;
  timestamp: number;
  tags?: string[];
}

export const StorageKeys = {
  VERSION: "sql-aa-version",
  PROGRESS: "sql-aa-progress",
  PROGRESS_LEGACY: "sql-aa-progress-v3",
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
    // Automatic fallback for canonical keys if primary key not present
    if (!s && key === StorageKeys.PROGRESS) {
      s =
        localStorage.getItem(StorageKeys.PROGRESS_LEGACY) ||
        localStorage.getItem("sql-aa-progress-v2");
    } else if (!s && key === "sql-aa-query-history-b") {
      s = localStorage.getItem("sql-aa-query-b-v2");
    }
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

export function getStorageItemWithFallback<T>(keys: string[], fallback: T): T {
  if (typeof localStorage === "undefined") return fallback;
  for (const key of keys) {
    const val = getStorageItem<T | null>(key, null);
    if (val !== null && val !== undefined) {
      return val;
    }
  }
  return fallback;
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
  } catch (err: any) {
    if (err?.name === "QuotaExceededError" || err?.code === 22) {
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

export function subscribeToCrossTabSync(
  callback: (key: string, newValue: any) => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: StorageEvent) => {
    if (e.key) {
      try {
        const parsed = e.newValue ? JSON.parse(e.newValue) : null;
        callback(e.key, parsed);
      } catch (_) {
        callback(e.key, e.newValue);
      }
    }
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}
