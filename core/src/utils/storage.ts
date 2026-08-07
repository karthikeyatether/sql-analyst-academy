const StorageKeys = {
  PROGRESS_V3: "sql-aa-progress-v3",
  HISTORY: "sql-aa-history",
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
