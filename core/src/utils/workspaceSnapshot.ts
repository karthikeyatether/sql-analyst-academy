/**
 * Workspace Database Snapshots & Export Utility
 */

export interface WorkspaceSnapshotData {
  version: string;
  timestamp: string;
  progress: Record<string, unknown>;
  queryHistory: string[];
  customTablesSql?: string;
}

export function exportWorkspaceAsJson(): void {
  const snapshot: WorkspaceSnapshotData = {
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    progress: JSON.parse(localStorage.getItem("sql-aa-progress") || "{}"),
    queryHistory: JSON.parse(localStorage.getItem("sql-aa-query-history") || "[]"),
  };

  const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sql-analyst-academy-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importWorkspaceFromJson(jsonContent: string): boolean {
  try {
    const data = JSON.parse(jsonContent) as WorkspaceSnapshotData;
    if (data.progress) {
      localStorage.setItem("sql-aa-progress", JSON.stringify(data.progress));
    }
    if (data.queryHistory) {
      localStorage.setItem("sql-aa-query-history", JSON.stringify(data.queryHistory));
    }
    return true;
  } catch {
    return false;
  }
}
