export interface ProgressionLevel {
  level: number;
  title: string;
  minXP: number;
  maxXP: number;
  color: string;
}

export const PROGRESSION_LEVELS: ProgressionLevel[] = [
  { level: 1, title: "SQL Novice", minXP: 0, maxXP: 400, color: "var(--muted)" },
  { level: 2, title: "Query Coder", minXP: 400, maxXP: 900, color: "var(--emerald)" },
  { level: 3, title: "SQL Associate", minXP: 900, maxXP: 1600, color: "var(--cyan)" },
  { level: 4, title: "Junior Analyst", minXP: 1600, maxXP: 2600, color: "var(--blue)" },
  { level: 5, title: "SQL Engineer", minXP: 2600, maxXP: 4000, color: "var(--violet)" },
  { level: 6, title: "Senior Data Analyst", minXP: 4000, maxXP: 5800, color: "var(--rose)" },
  { level: 7, title: "Analytics Specialist", minXP: 5800, maxXP: 8000, color: "var(--amber)" },
  { level: 8, title: "Lead SQL Engineer", minXP: 8000, maxXP: 11000, color: "var(--amber)" },
  { level: 9, title: "Principal Data Architect", minXP: 11000, maxXP: 15000, color: "var(--cyan)" },
  { level: 10, title: "Staff SQL Architect", minXP: 15000, maxXP: Infinity, color: "var(--cyan)" },
];

export interface UserStatsInput {
  completedModules?: number[];
  solvedProblems?: string[];
  solvedPuzzles?: string[];
  completedDays?: number[];
  queryRuns?: number;
  minutesStudied?: number;
  mockScores?: Record<string, number>;
}

export function calculateTotalXP(stats: UserStatsInput): number {
  const modCount = stats.completedModules?.length || 0;
  const probCount = stats.solvedProblems?.length || 0;
  const puzCount = stats.solvedPuzzles?.length || 0;
  const runs = stats.queryRuns || 0;
  const mins = stats.minutesStudied || 0;
  const mockCount = Object.keys(stats.mockScores || {}).length;

  return (
    modCount * 25 +
    probCount * 50 +
    puzCount * 40 +
    mockCount * 150 +
    Math.floor(runs / 5) * 5 +
    Math.floor(mins / 10) * 5
  );
}

export function getProgressionLevel(totalXP: number): ProgressionLevel {
  for (let i = PROGRESSION_LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= PROGRESSION_LEVELS[i].minXP) {
      return PROGRESSION_LEVELS[i];
    }
  }
  return PROGRESSION_LEVELS[0];
}

export function getNextProgressionLevel(totalXP: number): ProgressionLevel | null {
  for (let i = 0; i < PROGRESSION_LEVELS.length; i++) {
    if (totalXP < PROGRESSION_LEVELS[i].minXP) {
      return PROGRESSION_LEVELS[i];
    }
  }
  return null;
}

export function calculateInterviewReadiness(stats: UserStatsInput): number {
  const modPct = Math.min(1, (stats.completedModules?.length || 0) / 43);
  const probPct = Math.min(1, (stats.solvedProblems?.length || 0) / 142);
  const puzPct = Math.min(1, (stats.solvedPuzzles?.length || 0) / 60);
  const mocksTaken = Object.keys(stats.mockScores || {}).length;
  const mockPct = Math.min(1, mocksTaken / 6);

  // Weighted formula: Modules 30%, Practice Problems 40%, Debug Puzzles 15%, Mock Exams 15%
  const score = Math.round(
    modPct * 30 +
    probPct * 40 +
    puzPct * 15 +
    mockPct * 15
  );

  return Math.min(100, Math.max(0, score));
}
