import React from "react";
import DayDetailsView from "./DayDetailsView";
import { useProgress } from "../../contexts/ProgressContext";
import { useCurriculum } from "../../contexts/CurriculumContext";
import { useV3Dispatch, useV3State } from "../../contexts/V3Store";
import { debugPuzzles } from "../../data/puzzles";

export default function V2DayDetailsBridge() {
  const { progress, setProgress } = useProgress();
  const { learningRoadmap, roadmapModules } = useCurriculum();
  const { selectedDayId } = useV3State();
  const dispatch = useV3Dispatch();

  return (
    <DayDetailsView
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...({} as any)}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      selectedDayId={selectedDayId || 1}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      progress={progress as any}
      learningRoadmap={learningRoadmap}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      roadmapModules={roadmapModules}
      debugPuzzles={debugPuzzles}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setActiveView={(view: any) =>
        dispatch({ type: "SET_VIEW", payload: view })
      }
      setSelectedDayId={(id: number) =>
        dispatch({ type: "SET_DAY", payload: id })
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
      toggleChecklistItem={(id: string) => {
        setProgress((prev) => {
          if (!prev.completedChecklistItems) prev.completedChecklistItems = [];
          if (prev.completedChecklistItems.includes(id)) {
            return {
              ...prev,
              completedChecklistItems: prev.completedChecklistItems.filter(
                (i) => i !== id,
              ),
            };
          }
          return {
            ...prev,
            completedChecklistItems: [...prev.completedChecklistItems, id],
          };
        });
      }}
      selectModule={(m) => {
        dispatch({ type: "SET_DAY", payload: m.id });
      }}
      openInPlayground={(p) => {
        dispatch({ type: "SET_PROBLEM", payload: p.id });
        dispatch({ type: "SET_VIEW", payload: "playground" });
      }}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setActivePuzzleId={(id: string) => {
        dispatch({ type: "SET_PROBLEM", payload: id });
      }}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setPlaygroundMode={(mode: any) => {
        dispatch({ type: "SET_PLAYGROUND_MODE", payload: mode });
      }}
    />
  );
}
