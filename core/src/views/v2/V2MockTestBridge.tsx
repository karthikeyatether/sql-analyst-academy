import { setStorageItem } from "../../utils/storage";
import React, { useState, useRef } from "react";
import MockTestView from "./MockTestView";
import { useProgress } from "../../contexts/ProgressContext";
import { useCurriculum } from "../../contexts/CurriculumContext";
import { useV3Dispatch } from "../../contexts/V3Store";
import { mockInterviews, interviewQuestionBank } from "../../data/curriculum";
import { runQuery } from "../../utils/sqlEngine";
import { gradeQuery } from "../../utils/graderService";
import { useLocalStorage } from "../../hooks/useLocalStorage";

export default function V2MockTestBridge() {
  const { progress, setProgress } = useProgress();
  const { allProblems } = useCurriculum();
  const dispatch = useV3Dispatch();

  // Local state for mock test runner
  const [activeSubView, setActiveSubView] = useState<
    "mocks" | "mock-runner" | "mock-results"
  >("mocks");
  const [mockTest, setMockTest] = useState<any | null>(null);
  const [mockReviewIndex, setMockReviewIndex] = useState(0);
  const [mockHistory, setMockHistory] = useLocalStorage<any[]>(
    "sql-aa-mock-history",
    [],
  );

  const [query, setQuery] = useState("");
  const queryRef = useRef("");
  const [queryResult, setQueryResult] = useState<any>({
    columns: [],
    rows: [],
    message: "",
  });
  const [resultPage, setResultPage] = useState(1);

  // Editor settings via useLocalStorage
  const [sqlUpperKeywords, setSqlUpperKeywords] = useLocalStorage(
    "sql-aa-upper-keywords",
    true,
  );
  const [editorFontSize, setEditorFontSize] = useLocalStorage(
    "sql-aa-font-size",
    14,
  );
  const [editorWordWrap, setEditorWordWrap] = useLocalStorage(
    "sql-aa-word-wrap",
    false,
  );
  const [editorMinimap, setEditorMinimap] = useLocalStorage(
    "sql-aa-minimap",
    false,
  );
  const [editorFontFamily, setEditorFontFamily] = useLocalStorage(
    "sql-aa-font-family",
    "Fira Code",
  );
  const [editorTabSize, setEditorTabSize] = useLocalStorage(
    "sql-aa-tab-size",
    2,
  );
  const [editorTheme, setEditorTheme] = useLocalStorage(
    "sql-aa-theme",
    "vs-dark",
  );

  const startMockTest = (
    company: string,
    minutes: number,
    diff: string,
    maxMod: number,
    qCount: number,
  ) => {
    const diffMap: Record<string, string[]> = {
      Beginner: ["Easy"],
      "Beginner → Intermediate": ["Easy", "Medium"],
      Intermediate: ["Medium"],
      "Intermediate → Advanced": ["Medium", "Hard"],
      Advanced: ["Hard"],
    };
    const allowedDifficulties = diffMap[diff] || ["Easy", "Medium", "Hard"];

    const failedMap = JSON.parse(
      localStorage.getItem("sql-aa-failed-attempts") || "{}",
    );
    const candidates = allProblems.filter(
      (p) => p.moduleId <= maxMod && allowedDifficulties.includes(p.difficulty),
    );

    const problems = candidates
      .map((p) => ({
        problem: p,
        weight:
          (failedMap[p.id] || 0) +
          (progress.solvedProblems.includes(p.id) ? 0.1 : 1.0) *
            (Math.random() + 0.5),
      }))
      .sort((a, b) => b.weight - a.weight)
      .map((x) => x.problem)
      .slice(0, qCount);

    const finalProblems =
      problems.length === qCount
        ? problems
        : candidates.sort(() => 0.5 - Math.random()).slice(0, qCount);

    setMockTest({
      company,
      questions: finalProblems,
      currentIndex: 0,
      answers: [],
      timeRemaining: minutes * 60,
      isActive: true,
    });
    setQuery("");
    queryRef.current = "";
    setQueryResult({ columns: [], rows: [], message: "" });
    setActiveSubView("mock-runner");
  };

  const finishMockTest = (finalState: any) => {
    finalState.isActive = false;
    setMockTest(finalState);
    setActiveSubView("mock-results");
    setMockReviewIndex(0);

    const score = Math.round(
      (finalState.answers.filter((a: any) => a.isCorrect).length /
        finalState.questions.length) *
        100,
    );

    const histEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      company: finalState.company,
      score,
      timeSpent: finalState.timeRemaining, // V2 logic assumed time remaining tracking was handled elsewhere, we'll store raw score
    };
    setMockHistory([histEntry, ...mockHistory]);

    // Update global progress context with mock score
    setProgress({
      ...progress,
      mockScores: {
        ...progress.mockScores,
        [histEntry.id]: score,
      },
    });

    // Update failed attempts
    const failedMap = JSON.parse(
      localStorage.getItem("sql-aa-failed-attempts") || "{}",
    );
    finalState.answers.forEach((ans: any, idx: number) => {
      const q = finalState.questions[idx];
      if (!ans.isCorrect) {
        failedMap[q.id] = (failedMap[q.id] || 0) + 1;
      }
    });
    setStorageItem("sql-aa-failed-attempts", JSON.stringify(failedMap));
  };

  const submitMockAnswer = async (sql: string) => {
    if (!mockTest) return;
    const currentQ = mockTest.questions[mockTest.currentIndex];

    try {
      const userRes = await runQuery(sql);
      const expectedRes = await runQuery(currentQ.solution);

      const graderRes = gradeQuery({
        userQuery: sql,
        solutionSql: currentQ.solution,
        userResult: userRes,
        expectedResult: expectedRes,
        userSnapshot: null,
        expectedSnapshot: null,
        playgroundMode: "practice",
      });

      const newAnswers = [
        ...mockTest.answers,
        { query: sql, isCorrect: graderRes.isCorrect },
      ];

      if (mockTest.currentIndex === mockTest.questions.length - 1) {
        finishMockTest({ ...mockTest, answers: newAnswers });
      } else {
        setMockTest({
          ...mockTest,
          answers: newAnswers,
          currentIndex: mockTest.currentIndex + 1,
        });
        setQuery("");
        queryRef.current = "";
        setQueryResult({
          columns: [],
          rows: [],
          message: "Run your query to test it.",
        });
      }
    } catch (e: any) {
      setQueryResult({ columns: [], rows: [], message: "", error: e.message });
    }
  };

  const runCurrentQuery = async () => {
    try {
      const res = await runQuery(query);
      setQueryResult({
        columns: res.columns || [],
        rows: res.rows || [],
        message: "Success",
      });
    } catch (e: any) {
      setQueryResult({ columns: [], rows: [], message: "", error: e.message });
    }
  };

  return (
    <MockTestView
      {...({} as any)}
      activeView={activeSubView}
      setActiveView={(v: any) => {
        if (v === "mocks" || v === "mock-runner" || v === "mock-results") {
          setActiveSubView(v);
        } else {
          dispatch({ type: "SET_VIEW", payload: v });
        }
      }}
      progress={progress as any}
      mockInterviews={mockInterviews}
      mockHistory={mockHistory}
      interviewQuestionBank={allProblems as any}
      mockTest={mockTest}
      setMockTest={setMockTest}
      mockReviewIndex={mockReviewIndex}
      setMockReviewIndex={setMockReviewIndex}
      startMockTest={startMockTest}
      submitMockAnswer={submitMockAnswer}
      runCurrentQuery={runCurrentQuery}
      queryRef={queryRef}
      queryResult={queryResult}
      resultPage={resultPage}
      setResultPage={setResultPage}
      RESULT_PAGE_SIZE={10}
      updateEditorQuery={(sql) => {
        setQuery(sql);
        queryRef.current = sql;
      }}
      editorTheme={editorTheme}
      theme="dark"
      query={query}
      handleBeforeMount={() => {}}
      handleMount={() => {}}
      handleEditorChange={(val) => {
        setQuery(val || "");
        queryRef.current = val || "";
      }}
      editorFontSize={editorFontSize}
      editorWordWrap={editorWordWrap}
      editorMinimap={editorMinimap}
      editorFontFamily={editorFontFamily}
      editorTabSize={editorTabSize}
    />
  );
}
