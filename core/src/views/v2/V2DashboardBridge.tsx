import React, { useMemo, useState } from "react";
import DashboardView from "./DashboardView";
import { useProgress } from "../../contexts/ProgressContext";
import { useCurriculum } from "../../contexts/CurriculumContext";
import { useV3Dispatch } from "../../contexts/V3Store";
// In V3, interviewQuestionBank and debugPuzzles are exposed from curriculum/puzzles
import { interviewQuestionBank } from "../../data/curriculum";
import { debugPuzzles } from "../../data/puzzles";
import type { ViewId } from "../../types";

export default function V2DashboardBridge() {
  const { progress, setProgress } = useProgress();
  const { learningRoadmap, roadmapModules } = useCurriculum();
  const totalModules = roadmapModules.length;
  const totalProblems = roadmapModules.reduce((acc, m) => acc + (m.problems?.length || 0), 0);
  const dispatch = useV3Dispatch();

  // V2 logic recreated
  const totalXP =
    progress.completedModules.length * 15 +
    progress.solvedProblems.length * 10 +
    (progress.solvedPuzzles || []).length * 20 +
    Object.keys(progress.mockScores).length * 100;

  const currentLevel = Math.floor(totalXP / 150) + 1;
  const xpForNextLevel = 150;
  const currentLevelXP = totalXP % 150;
  const xpProgressPercent = Math.min(
    100,
    Math.round((currentLevelXP / xpForNextLevel) * 100),
  );
  const xpRemaining = xpForNextLevel - currentLevelXP;

  const next = useMemo(
    () =>
      roadmapModules.find((m) => !progress.completedModules.includes(m.id)) ||
      roadmapModules[0],
    [progress.completedModules, roadmapModules],
  );

  const earnedBadges = useMemo(() => {
    return [
      {
        id: "first_query",
        title: "First Query",
        desc: "Ran your first database query",
        icon: "🎯",
        earned: progress.queryRuns > 0,
      },
      {
        id: "select_master",
        title: "Select Master",
        desc: "Solved at least 3 practice problems",
        icon: "💾",
        earned: progress.solvedProblems.length >= 3,
      },
      {
        id: "join_champion",
        title: "Join Champion",
        desc: "Solved at least 10 practice problems",
        icon: "🔗",
        earned: progress.solvedProblems.length >= 10,
      },
      {
        id: "window_wizard",
        title: "Window Wizard",
        desc: "Solved at least 25 practice problems",
        icon: "✨",
        earned: progress.solvedProblems.length >= 25,
      },
      {
        id: "bug_hunter",
        title: "Bug Hunter",
        desc: "Solved at least 3 debugging puzzles",
        icon: "🐛",
        earned: (progress.solvedPuzzles || []).length >= 3,
      },
      {
        id: "interview_ready",
        title: "Interview Ready",
        desc: "Completed at least one Mock Interview",
        icon: "🏆",
        earned: Object.keys(progress.mockScores).length >= 1,
      },
    ];
  }, [progress]);

  const [qaItems] = useState(() =>
    [...(interviewQuestionBank || [])].sort(() => 0.5 - Math.random()).slice(0, 4),
  );

  // V2 expected streak and readiness
  // Recreating simple mock readiness formula
  const readiness = Math.min(
    100,
    Math.round(
      (progress.completedModules.length / Math.max(totalModules, 1)) * 25 +
        (progress.solvedProblems.length / Math.max(totalProblems, 1)) * 40 +
        ((progress.solvedPuzzles?.length || 0) / 10) * 15 +
        (Object.keys(progress.mockScores).length > 0 ? 20 : 0),
    ),
  );

  const streak = 1; // Default stub

  return (
    <DashboardView {...({} as any)}
      progress={progress}
      learningRoadmap={learningRoadmap}
      roadmapModules={roadmapModules}
      debugPuzzles={debugPuzzles}
      streak={streak}
      setActiveView={(view: ViewId) => dispatch({ type: "SET_VIEW", payload: view })}
      setSelectedDayId={(dayId: number) => dispatch({ type: "SET_DAY", payload: dayId })}
      readiness={readiness}
      totalModules={totalModules}
      totalProblems={totalProblems}
      totalXP={totalXP}
      currentLevel={currentLevel}
      xpProgressPercent={xpProgressPercent}
      xpRemaining={xpRemaining}
      earnedBadges={earnedBadges}
      qaItems={qaItems}
      enterFreeformPlayground={() => dispatch({ type: "SET_VIEW", payload: "playground" })}
      selectModule={(m) => {
        // Dispatch setting module (not natively supported in V3 Store, usually mapped via day)
        // V3 handles modules inside interactive lesson
        dispatch({ type: "SET_DAY", payload: m.id });
        dispatch({ type: "SET_VIEW", payload: "interactive-lesson" });
      }}
      updateEditorQuery={() => {}}
      toggleChecklistItem={(itemId: string) => {
        setProgress((p) => {
          const items = p.completedChecklistItems || [];
          return {
            ...p,
            completedChecklistItems: items.includes(itemId)
              ? items.filter((id) => id !== itemId)
              : [...items, itemId],
          };
        });
      }}
      next={next}
    />
  );
}
