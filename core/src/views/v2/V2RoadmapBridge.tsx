import React from "react";
import RoadmapView from "./RoadmapView";
import { useProgress } from "../../contexts/ProgressContext";
import { useCurriculum } from "../../contexts/CurriculumContext";
import { useV3Dispatch } from "../../contexts/V3Store";
import { debugPuzzles } from "../../data/puzzles";
import type { ViewId, PlaygroundMode } from "../../types";

export default function V2RoadmapBridge() {
  const { progress, setProgress } = useProgress();
  const { learningRoadmap, roadmapModules } = useCurriculum();
  const dispatch = useV3Dispatch();

  return (
    <RoadmapView
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...({} as any)}
      progress={progress}
      learningRoadmap={learningRoadmap}
      roadmapModules={roadmapModules}
      setSelectedDayId={(dayId: number) =>
        dispatch({ type: "SET_DAY", payload: dayId })
      }
      setActiveView={(view: ViewId) =>
        dispatch({ type: "SET_VIEW", payload: view })
      }
      toggleDayComplete={(day: number) => {
        setProgress((prev) => {
          if (prev.completedDays.includes(day)) {
            return {
              ...prev,
              completedDays: prev.completedDays.filter((d) => d !== day),
            };
          }
          return { ...prev, completedDays: [...prev.completedDays, day] };
        });
      }}
      selectModule={(m) => {
        dispatch({ type: "SET_DAY", payload: m.id });
        dispatch({ type: "SET_VIEW", payload: "interactive-lesson" });
      }}
      openInPlayground={(p) => {
        // Mock behavior for V3
        dispatch({ type: "SET_VIEW", payload: "playground" });
      }}
      debugPuzzles={debugPuzzles}
      setActivePuzzleId={(id: string) => {
        // Map to playground or puzzles
        dispatch({ type: "SET_VIEW", payload: "puzzles" });
      }}
      setPlaygroundMode={(mode: "practice" | "puzzle" | "free") => {}}
      getSavedPuzzleQuery={(p) => ""}
      updateEditorQuery={(newVal, pMode, targetId, moveCursorToEnd) => {}}
      stopAutoTyping={() => {}}
    />
  );
}
