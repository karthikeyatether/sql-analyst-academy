import type { PracticeProblem } from "../data/curriculumMetadata";

/**
 * Dynamic async loader for curriculum module problems and lesson contents.
 * Split into on-demand chunks to minimize initial bundle footprint.
 */

const problemBatchCache = new Map<number, PracticeProblem[]>();

export async function loadModuleProblems(
  moduleId: number,
): Promise<PracticeProblem[]> {
  if (problemBatchCache.has(moduleId)) {
    return problemBatchCache.get(moduleId)!;
  }

  try {
    let problems: PracticeProblem[] = [];
    if (moduleId <= 10) {
      const b1 = await import("../data/problems_batch1");
      problems =
        (b1.problemsBatch1 as Record<number, PracticeProblem[]>)[moduleId] ||
        [];
    } else if (moduleId <= 25) {
      const b2 = await import("../data/problems_batch2");
      problems =
        (b2.batch2Problems as Record<number, PracticeProblem[]>)[moduleId] ||
        [];
    } else {
      const b3 = await import("../data/problems_batch3");
      problems =
        (b3.problemsBatch3 as Record<number, PracticeProblem[]>)[moduleId] ||
        [];
    }

    problemBatchCache.set(moduleId, problems);
    return problems;
  } catch (err) {
    console.error(`Failed to lazy load problems for module ${moduleId}:`, err);
    return [];
  }
}

export async function loadPuzzleCategory(category: string): Promise<any[]> {
  try {
    const puzzleModule = await import("../data/puzzles");
    return puzzleModule.debugPuzzles.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase(),
    );
  } catch (err) {
    console.error(`Failed to lazy load puzzles for category ${category}:`, err);
    return [];
  }
}
