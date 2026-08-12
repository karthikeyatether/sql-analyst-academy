import React, { createContext, useContext, useCallback } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

export type ProgressState = {
  completedModules: number[];
  solvedProblems: string[];
  solvedPuzzles: string[];
  completedDays: number[];
  queryRuns: number;
  minutesStudied: number;
  mockScores: Record<string, number>;
  completedChecklistItems: string[];
};

export const initialProgress: ProgressState = {
  completedModules: [],
  solvedProblems: [],
  solvedPuzzles: [],
  completedDays: [],
  queryRuns: 0,
  minutesStudied: 0,
  mockScores: {},
  completedChecklistItems: [],
};

type ProgressContextType = {
  progress: ProgressState;
  setProgress: React.Dispatch<React.SetStateAction<ProgressState>>;
};

const ProgressContext = createContext<ProgressContextType | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  // Migrate progress schema if older versions exist
  const currentProgressKey = "sql-aa-progress-v3";
  if (
    typeof window !== "undefined" &&
    !localStorage.getItem(currentProgressKey)
  ) {
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
      } catch (e) {}
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
      } catch (e) {}
    }
    if (migratedProgress) {
      localStorage.setItem(
        currentProgressKey,
        JSON.stringify(migratedProgress),
      );
    }
  }

  const [progress, setProgress] = useLocalStorage<ProgressState>(
    currentProgressKey,
    initialProgress,
  );

  return (
    <ProgressContext.Provider value={{ progress, setProgress }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return ctx;
}
