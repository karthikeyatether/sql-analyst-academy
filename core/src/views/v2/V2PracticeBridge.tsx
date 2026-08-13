import React from "react";
import PracticeView from "./PracticeView";
import { useProgress } from "../../contexts/ProgressContext";
import { useCurriculum } from "../../contexts/CurriculumContext";
import { useV3Dispatch, useV3State } from "../../contexts/V3Store";

export default function V2PracticeBridge() {
  const { progress, setProgress } = useProgress();
  const { roadmapModules } = useCurriculum();
  const { activeProblemId, activeModuleId: v3ModuleId } = useV3State();
  const dispatch = useV3Dispatch();

  const activeModuleId = v3ModuleId || 1;
  const activeModule =
    roadmapModules.find((m) => m.id === activeModuleId) || roadmapModules[0];
  const selectedProblem =
    activeModule.problems.find((p) => p.id === activeProblemId) ||
    activeModule.problems[0];

  const classForDiff = (d: string) => {
    const lower = (d || "").toLowerCase();
    if (lower.includes("expert")) return "expert";
    if (lower.includes("advanced") || lower.includes("hard")) return "hard";
    if (lower.includes("intermediate") || lower.includes("medium"))
      return "medium";
    return "easy";
  };

  return (
    <PracticeView
      {...({} as any)}
      progress={progress}
      activeModuleId={activeModuleId}
      roadmapModules={roadmapModules}
      selectedProblem={selectedProblem as any}
      selectProblem={(p) => {
        dispatch({ type: "SET_PROBLEM", payload: p.id });
      }}
      openInPlayground={(p) => {
        dispatch({ type: "SET_PROBLEM", payload: p.id });
        dispatch({ type: "SET_VIEW", payload: "playground" });
      }}
      markProblemSolved={(p, quality) => {
        setProgress((prev) => {
          if (!prev.solvedProblems.includes(p.id)) {
            return { ...prev, solvedProblems: [...prev.solvedProblems, p.id] };
          }
          return prev;
        });
      }}
      updateEditorQuery={() => {}}
      copyToClipboard={(text) => navigator.clipboard.writeText(text)}
      classForDiff={classForDiff as any}
      selectModule={(m) => {
        dispatch({ type: "SET_DAY", payload: m.id });
      }}
      setActiveView={(view) =>
        dispatch({ type: "SET_VIEW", payload: view as any })
      }
      setPlaygroundMode={(mode) =>
        dispatch({ type: "SET_PLAYGROUND_MODE", payload: mode as any })
      }
    />
  );
}
