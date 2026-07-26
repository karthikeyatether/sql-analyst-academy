/**
 * IndexedDB Offline Learning Vault
 * Durable offline storage for user progress, query history, and database snapshots.
 */

const DB_NAME = "sql_analyst_academy_vault";
const DB_VERSION = 1;

export interface VaultProgress {
  id: string;
  completedModules: number[];
  solvedProblems: string[];
  solvedPuzzles: string[];
  completedDays: number[];
  minutesStudied: number;
  updatedAt: string;
}

export interface VaultHistoryItem {
  id: string;
  query: string;
  timestamp: string;
  status: "success" | "error";
  rowCount?: number;
  durationMs?: number;
}

function openVaultDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this environment"));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("progress")) {
        db.createObjectStore("progress", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("query_history")) {
        const historyStore = db.createObjectStore("query_history", {
          keyPath: "id",
        });
        historyStore.createIndex("timestamp", "timestamp", { unique: false });
      }
      if (!db.objectStoreNames.contains("snapshots")) {
        db.createObjectStore("snapshots", { keyPath: "name" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveProgressToVault(
  progress: VaultProgress,
): Promise<void> {
  try {
    const db = await openVaultDB();
    const tx = db.transaction("progress", "readwrite");
    tx.objectStore("progress").put(progress);
    await new Promise((res) => (tx.oncomplete = res));
  } catch (err) {
    console.warn("Failed to save progress to IndexedDB Vault:", err);
  }
}

export async function loadProgressFromVault(): Promise<VaultProgress | null> {
  try {
    const db = await openVaultDB();
    const tx = db.transaction("progress", "readonly");
    const request = tx.objectStore("progress").get("user_main_progress");
    return await new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function saveQueryHistoryToVault(
  item: VaultHistoryItem,
): Promise<void> {
  try {
    const db = await openVaultDB();
    const tx = db.transaction("query_history", "readwrite");
    tx.objectStore("query_history").put(item);
  } catch (err) {
    console.warn("Failed to save query history to IndexedDB Vault:", err);
  }
}
