import React, { useState, useMemo, useEffect } from "react";
import PlaygroundView from "./PlaygroundView";
import { debugPuzzles } from "../../data/puzzles";
import { useProgress } from "../../contexts/ProgressContext";
import { useCurriculum } from "../../contexts/CurriculumContext";
import { useV3State, useV3Dispatch } from "../../contexts/V3Store";
import { runQuery, QueryResult } from "../../utils/sqlEngine";
import { tableSchemas, datasetDomains } from "../../data/datasets";
import { gradeQuery } from "../../utils/graderService";
import { useLocalStorage } from "../../hooks/useLocalStorage";

export default function V2PlaygroundBridge() {
  const { progress, setProgress } = useProgress();
  const { roadmapModules, allProblems } = useCurriculum();
  const { activeView, playgroundMode, activeProblemId } = useV3State();
  const dispatch = useV3Dispatch();

  // Local state for the playground editor settings via useLocalStorage
  const [rowLimit, setRowLimit] = useLocalStorage("sql-aa-row-limit", "100");
  const [sqlUpperKeywords, setSqlUpperKeywords] = useLocalStorage("sql-aa-upper-keywords", true);
  const [editorFontSize, setEditorFontSize] = useLocalStorage("sql-aa-font-size", 14);
  const [editorWordWrap, setEditorWordWrap] = useLocalStorage("sql-aa-word-wrap", false);
  const [editorMinimap, setEditorMinimap] = useLocalStorage("sql-aa-minimap", false);
  const [editorFontFamily, setEditorFontFamily] = useLocalStorage("sql-aa-font-family", "Fira Code");
  const [editorTabSize, setEditorTabSize] = useLocalStorage("sql-aa-tab-size", 2);
  const [editorTheme, setEditorTheme] = useLocalStorage("sql-aa-theme", "vs-dark");

  const [query, setQuery] = useState("");
  const [queryResult, setQueryResult] = useState<QueryResult>({ columns: [], rows: [], message: "" });
  const [expectedResult, setExpectedResult] = useState<QueryResult | null>(null);
  const [graderFeedback, setGraderFeedback] = useState<any>(null);

  const activeProblem = useMemo(() => {
    if (playgroundMode === "practice") {
      return allProblems.find((p) => p.id === activeProblemId) || null;
    } else if (playgroundMode === "puzzle") {
      return debugPuzzles.find((p) => p.id === activeProblemId) || null;
    }
    return null;
  }, [allProblems, playgroundMode, activeProblemId]);

  useEffect(() => {
    if (activeProblem && playgroundMode === "practice") {
      setQuery((activeProblem as any).starterCode || (activeProblem as any).starterQuery || "");
    } else if (activeProblem && playgroundMode === "puzzle") {
      setQuery((activeProblem as any).flawedQuery || "");
    } else {
      setQuery("");
    }
    setQueryResult({ columns: [], rows: [], message: "" });
    setExpectedResult(null);
    setGraderFeedback(null);
  }, [activeProblem, playgroundMode]);

  const handleRunQuery = async () => {
    try {
      const res = await runQuery(query);
      setQueryResult(res);
      setExpectedResult(null);
      setGraderFeedback(null);

      if (activeProblem && (playgroundMode === "practice" || playgroundMode === "puzzle")) {
        const solutionSql = playgroundMode === "practice" 
          ? (activeProblem as any).solution 
          : (activeProblem as any).solutionQuery;
          
        if (solutionSql) {
          const expectedRes = await runQuery(solutionSql);
          setExpectedResult(expectedRes);

          const isFlawedQueryUnchanged = playgroundMode === "puzzle" 
            ? query.trim().toLowerCase() === (activeProblem as any).flawedQuery?.trim().toLowerCase()
            : false;

          const graderRes = gradeQuery({
            userQuery: query,
            solutionSql,
            userResult: res,
            expectedResult: expectedRes,
            userSnapshot: null,
            expectedSnapshot: null,
            playgroundMode: playgroundMode,
            isFlawedQueryUnchanged
          });

          setGraderFeedback(graderRes);

          if (graderRes.isCorrect) {
            if (playgroundMode === "practice") {
              if (!progress.solvedProblems.includes(activeProblem.id)) {
                setProgress({
                  ...progress,
                  solvedProblems: [...progress.solvedProblems, activeProblem.id],
                });
              }
            } else if (playgroundMode === "puzzle") {
              if (!progress.solvedPuzzles?.includes(activeProblem.id)) {
                setProgress({
                  ...progress,
                  solvedPuzzles: [...(progress.solvedPuzzles || []), activeProblem.id],
                });
              }
            }
          }
        }
      }
    } catch (e: any) {
      setQueryResult({ columns: [], rows: [], message: "", error: e.message || "Error running query" });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <PlaygroundView {...({} as any)}
      progress={progress}
      selectedProblem={activeProblem as any}
      playgroundMode={playgroundMode as any}
      setPlaygroundMode={(mode: "practice" | "puzzle" | "free") => dispatch({ type: "SET_PLAYGROUND_MODE", payload: mode })}
      roadmapModules={roadmapModules}
      tableSchemas={tableSchemas}
      datasetDomains={datasetDomains}
      rowLimit={rowLimit}
      setRowLimit={setRowLimit}
      sqlUpperKeywords={sqlUpperKeywords}
      setSqlUpperKeywords={setSqlUpperKeywords}
      editorFontSize={editorFontSize}
      setEditorFontSize={setEditorFontSize}
      editorWordWrap={editorWordWrap}
      setEditorWordWrap={setEditorWordWrap}
      editorMinimap={editorMinimap}
      setEditorMinimap={setEditorMinimap}
      editorFontFamily={editorFontFamily}
      setEditorFontFamily={setEditorFontFamily}
      editorTabSize={editorTabSize}
      setEditorTabSize={setEditorTabSize}
      editorTheme={editorTheme}
      setEditorTheme={setEditorTheme}
      theme="dark"
      query={query}
      setQuery={setQuery}
      queryResult={queryResult as any}
      setQueryResult={setQueryResult}
      expectedResult={expectedResult as any}
      setExpectedResult={setExpectedResult}
      graderFeedback={graderFeedback}
      setGraderFeedback={setGraderFeedback}
      runCurrentQuery={handleRunQuery}
      copyToClipboard={copyToClipboard}
      allProblems={allProblems}
      liveSchema={[]}
      setLiveSchema={() => {}}
      savedQueries={[]}
      setSavedQueries={() => {}}
      debugPuzzles={debugPuzzles}
      activePuzzle={activeProblem as any}
      setActivePuzzleId={(id: string) => dispatch({ type: "SET_PROBLEM", payload: id })}
      getSavedPuzzleQuery={() => ""}
      getSavedDraftQuery={() => ""}
      updateEditorQuery={(val: string) => setQuery(val)}
      stopAutoTyping={() => {}}
      editorRef={{ current: null }}
      queryRef={{ current: query }}
      showToast={() => {}}
      showConfirm={() => {}}
      showPrompt={() => {}}
      graderStrict={false}
      setGraderStrict={() => {}}
      learningRoadmap={[]}
      readiness={100}
      totalModules={roadmapModules.length}
      totalProblems={allProblems.length}
    />
  );
}
