export interface SM2Item {
  problemId: string;
  easinessFactor: number; // Defaults to 2.5
  interval: number;       // In days
  repetitions: number;    // Consecutive successful reviews
  nextReviewDate: string; // ISO date string YYYY-MM-DD
  lastReviewed: string;   // ISO date string YYYY-MM-DD
}

export type SM2ProgressMap = Record<string, SM2Item>;

const SM2_STORAGE_KEY = "sql-aa-sm2-progress-v1";

export function loadSM2Progress(): SM2ProgressMap {
  try {
    const raw = localStorage.getItem(SM2_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveSM2Progress(progress: SM2ProgressMap): void {
  try {
    localStorage.setItem(SM2_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Calculates next SM-2 interval based on review quality (0 - 5)
 * Q: 5 = Perfect first try, 4 = Correct with minor delay, 3 = Correct with hint, < 3 = Incorrect
 */
export function calculateSM2(
  existing: SM2Item | undefined,
  problemId: string,
  quality: number
): SM2Item {
  let ef = existing?.easinessFactor ?? 2.5;
  let repetitions = existing?.repetitions ?? 0;
  let interval = existing?.interval ?? 1;

  // Clamp quality between 0 and 5
  const q = Math.max(0, Math.min(5, Math.round(quality)));

  // Calculate new Easiness Factor (EF)
  // EF' = EF + (0.1 - (5 - Q) * (0.08 + (5 - Q) * 0.02))
  ef = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (ef < 1.3) ef = 1.3;

  if (q < 3) {
    // Quality < 3 means failed attempt — reset repetitions
    repetitions = 0;
    interval = 1;
  } else {
    // Quality >= 3 means successful review
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * ef);
    }
    repetitions += 1;
  }

  const now = new Date();
  const nextDate = new Date(now.getTime() + interval * 86400000);

  return {
    problemId,
    easinessFactor: Number(ef.toFixed(3)),
    interval,
    repetitions,
    nextReviewDate: nextDate.toISOString().split("T")[0],
    lastReviewed: now.toISOString().split("T")[0],
  };
}

export function isProblemDueForReview(item: SM2Item | undefined): boolean {
  if (!item) return false;
  const today = new Date().toISOString().split("T")[0];
  return item.nextReviewDate <= today;
}
