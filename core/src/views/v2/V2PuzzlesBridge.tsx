import React from "react";
import PuzzlesView from "./PuzzlesView";
import { useProgress } from "../../contexts/ProgressContext";
import { useV3Dispatch, useV3State } from "../../contexts/V3Store";
import { debugPuzzles } from "../../data/puzzles";

export default function V2PuzzlesBridge() {
  const { progress, setProgress } = useProgress();
  const { activeProblemId } = useV3State();
  const dispatch = useV3Dispatch();

  const activePuzzle = debugPuzzles.find((p) => p.id === activeProblemId) || debugPuzzles[0];

  const classForDiff = (d: string) => {
    const lower = (d || "").toLowerCase();
    if (lower.includes("expert")) return "expert";
    if (lower.includes("advanced") || lower.includes("hard")) return "hard";
    if (lower.includes("intermediate") || lower.includes("medium")) return "medium";
    return "easy";
  };

  return (
    <PuzzlesView {...({} as any)}
      progress={progress as any}
      debugPuzzles={debugPuzzles}
      activePuzzle={activePuzzle}
      setActivePuzzleId={(id: string) => {
        dispatch({ type: "SET_PROBLEM", payload: id });
      }}
      openPuzzleInPlayground={(p: any) => {
        dispatch({ type: "SET_PROBLEM", payload: p.id });
        dispatch({ type: "SET_PLAYGROUND_MODE", payload: "puzzle" });
        dispatch({ type: "SET_VIEW", payload: "playground" });
      }}
      markPuzzleSolved={(p: any) => {
        setProgress((prev) => {
          if (!prev.solvedPuzzles) prev.solvedPuzzles = [];
          if (!prev.solvedPuzzles.includes(p.id)) {
            return { ...prev, solvedPuzzles: [...prev.solvedPuzzles, p.id] };
          }
          return prev;
        });
      }}
      updateEditorQuery={() => {}}
      setActiveView={(view: any) => {
        dispatch({ type: "SET_VIEW", payload: view });
      }}
      setPlaygroundMode={(mode: any) => {
        dispatch({ type: "SET_PLAYGROUND_MODE", payload: mode });
      }}
      classForDiff={classForDiff as any}
    />
  );
}
