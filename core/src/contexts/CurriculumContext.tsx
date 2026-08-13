import React, { createContext, useContext, useState, useEffect } from "react";
import type {
  RoadmapModule,
  MockInterview,
  PracticeProblem,
  RoadmapDay,
} from "../data/curriculumMetadata";
import type { TableSchema } from "../data/datasets";
import type { SqlPuzzle } from "../data/puzzles";

export type CurriculumData = {
  realProblems: Record<number, PracticeProblem[]>;
  allProblems: PracticeProblem[];
  allModules: RoadmapModule[];
  mockInterviews: MockInterview[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interviewQuestionBank: any[]; // Or proper type if it exists
  datasets: TableSchema[];
  debugPuzzles: SqlPuzzle[];
  learningRoadmap: RoadmapDay[];
  roadmapModules: RoadmapModule[];
};

const CurriculumContext = createContext<CurriculumData | null>(null);

export function CurriculumProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [data, setData] = useState<CurriculumData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [currRes, dataRes, puzzRes] = await Promise.all([
          fetch("/data/curriculum.json"),
          fetch("/data/datasets.json"),
          fetch("/data/puzzles.json"),
        ]);

        if (!currRes.ok || !dataRes.ok || !puzzRes.ok) {
          throw new Error("Failed to load curriculum data.");
        }

        const curr = await currRes.json();
        const dsets = await dataRes.json();
        const puzz = await puzzRes.json();
        const modules = Array.isArray(curr.roadmapModules)
          ? curr.roadmapModules
          : [];
        const problems = modules.flatMap((module: RoadmapModule) =>
          Array.isArray(module.problems) ? module.problems : [],
        );

        setData({
          ...curr,
          allProblems: problems,
          realProblems: problems.reduce(
            (
              grouped: Record<number, PracticeProblem[]>,
              problem: PracticeProblem,
            ) => {
              (grouped[problem.moduleId] ??= []).push(problem);
              return grouped;
            },
            {},
          ),
          datasets: dsets,
          debugPuzzles: puzz,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message || "Failed to load data.");
      }
    }
    loadData();
  }, []);

  if (error) {
    return (
      <div style={{ color: "var(--red)", padding: 20 }}>Error: {error}</div>
    );
  }

  const DEFAULT_DATA: CurriculumData = {
    realProblems: {},
    allProblems: [],
    allModules: [],
    mockInterviews: [],
    interviewQuestionBank: [],
    datasets: [],
    debugPuzzles: [],
    learningRoadmap: [],
    roadmapModules: [],
  };

  return (
    <CurriculumContext.Provider value={data || DEFAULT_DATA}>
      {children}
      {!data && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: "var(--theme-practice)",
            zIndex: 9999,
            transition: "width 0.2s",
          }}
          className="animate-pulse"
        />
      )}
    </CurriculumContext.Provider>
  );
}

export function useCurriculum() {
  const ctx = useContext(CurriculumContext);
  if (!ctx)
    throw new Error("useCurriculum must be used within CurriculumProvider");
  return ctx;
}
