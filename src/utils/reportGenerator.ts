export interface StudyProgress {
  completedModules: number[];
  solvedProblems: string[];
  solvedPuzzles?: string[];
  minutesStudied: number;
  queryRuns: number;
}

interface ReportParams {
  readiness: number;
  progress: StudyProgress;
  totalModules: number;
  totalProblems: number;
  debugPuzzles: any[];
  roadmapModules: any[];
}

export function downloadStatsReport({
  readiness,
  progress,
  totalModules,
  totalProblems,
  debugPuzzles,
  roadmapModules,
}: ReportParams) {
  let report = `==================================================\n`;
  report += `        SQL ANALYST ACADEMY STUDY PROGRESS REPORT\n`;
  report += `==================================================\n`;
  report += `Generated on: ${new Date().toLocaleDateString()}\n\n`;
  report += `Interview Readiness Score: ${readiness}%\n`;
  report += `- Modules Completed: ${progress.completedModules.length}/${totalModules}\n`;
  report += `- Practice Exercises Solved: ${progress.solvedProblems.length}/${totalProblems}\n`;
  report += `- SQL Debug Puzzles Solved: ${progress.solvedPuzzles?.length ?? 0}/${debugPuzzles.length}\n`;
  report += `- Active Study Time: ${progress.minutesStudied} minutes\n`;
  report += `- Query executions: ${progress.queryRuns} runs\n\n`;
  report += `==================================================\n`;
  report += `              COMPLETED MODULES LIST\n`;
  report += `==================================================\n`;

  roadmapModules.forEach(m => {
    const isDone = progress.completedModules.includes(m.id);
    report += `[${isDone ? "X" : " "}] M${m.id}: ${m.title}\n`;
  });

  const blob = new Blob([report], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sql-academy-study-report.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
