export type { QueryResult } from "../utils/sqlEngine";
export type { LintError } from "../utils/sqlLinter";
export type { SqlPuzzle } from "../data/puzzles";

export type ViewId =
  | "dashboard"
  | "roadmap"
  | "practice"
  | "playground"
  | "puzzles"
  | "mocks"
  | "mock-runner"
  | "mock-test"
  | "mock-results"
  | "day-details"
  | "join-visualizer"
  | "missions"
  | "modules"
  | "interactive-lesson";

export type PlaygroundMode = "practice" | "puzzle" | "free";

export interface QAItem {
  category?: string;
  question: string;
  answer: string;
  followUp?: string;
  mistake?: string;
}

export interface MockTestResult {
  id: string;
  company: string;
  score: number;
  date: number;
}

export type RightTab = "schema" | "hints" | "erd" | "linter";

export interface UserProgressState {
  completedModules: number[];
  solvedProblems: string[];
  solvedPuzzles: string[];
  completedDays: number[];
  queryRuns: number;
  minutesStudied: number;
  mockScores: Record<string, number>;
  completedChecklistItems: string[];
}

