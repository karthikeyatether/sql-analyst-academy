import { useState, useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { getStorageItem as safeLocalStorageGet } from "../utils/storage";
import { calculateSM2, loadSM2Progress, saveSM2Progress, SM2ProgressMap } from "../utils/sm2Engine";

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

export function useCurriculumProgress() {
  const [progress, setProgress] = useLocalStorage<ProgressState>(
    "sql-aa-progress-v3",
    initialProgress,
  );
  const [sm2Progress, setSm2Progress] = useState<SM2ProgressMap>(() => loadSM2Progress());
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const checkStreak = () => {
      const todayStr = new Date().toISOString().split("T")[0];
      const lastDate = localStorage.getItem("sql-aa-last-active-date");
      let currentStreak = Number(localStorage.getItem("sql-aa-streak") || "0");
      let activeDays: string[] = safeLocalStorageGet("sql-aa-active-days", []);

      if (!activeDays.includes(todayStr)) {
        activeDays.push(todayStr);
      }
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

  return { progress, setProgress, sm2Progress, setSm2Progress, streak, setStreak };
}
