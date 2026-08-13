import { setStorageItem } from "./storage";
export interface SM2ProgressItem {
  id: string;
  interval: number;
  repetition: number;
  efactor: number;
  dueDate: string;
}

export type SM2ProgressMap = Record<string, SM2ProgressItem>;

export function calculateSM2(
  existing: SM2ProgressItem | undefined,
  id: string,
  quality: number = 4,
): SM2ProgressItem {
  let interval = existing?.interval || 1;
  let repetition = existing?.repetition || 0;
  let efactor = existing?.efactor || 2.5;

  if (quality >= 3) {
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * efactor);
    }
    repetition += 1;
  } else {
    repetition = 0;
    interval = 1;
  }

  efactor = efactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (efactor < 1.3) efactor = 1.3;

  const due = new Date();
  due.setDate(due.getDate() + interval);

  return {
    id,
    interval,
    repetition,
    efactor,
    dueDate: due.toISOString(),
  };
}

export function loadSM2Progress(): SM2ProgressMap {
  try {
    const saved = localStorage.getItem("sql-aa-sm2-progress");
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

export function saveSM2Progress(map: SM2ProgressMap): void {
  try {
    setStorageItem("sql-aa-sm2-progress", JSON.stringify(map));
  } catch {
    // ignore
  }
}
