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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...({} as any)}
      progress={progress}
      activeModuleId={activeModuleId}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      roadmapModules={roadmapModules}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateEditorQuery={() => {}}
      copyToClipboard={(text) => navigator.clipboard.writeText(text)}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      classForDiff={classForDiff as any}
      selectModule={(m) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dispatch({ type: "SET_DAY", payload: m.id });
      }}
      setActiveView={(view) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dispatch({ type: "SET_VIEW", payload: view as any })
      }
      setPlaygroundMode={(mode) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dispatch({ type: "SET_PLAYGROUND_MODE", payload: mode as any })
      }
    />
  );
}
