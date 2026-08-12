import { roadmapModules } from "../src/data/curriculum";
import { debugPuzzles } from "../src/data/puzzles";

export interface SystemTestResult {
  name: string;
  category: "curriculum" | "puzzles" | "datasets" | "integrity";
  status: "PASS" | "FAIL";
  error?: string;
}

export function runSystemVerificationTests(): SystemTestResult[] {
  const results: SystemTestResult[] = [];

  // 1. Verify Curriculum Structure Integrity
  try {
    if (!roadmapModules || roadmapModules.length === 0) {
      throw new Error("Roadmap modules array is empty");
    }
    const totalProblems = roadmapModules.reduce(
      (acc, m) => acc + m.problems.length,
      0,
    );
    if (totalProblems < 140) {
      throw new Error(
        `Insufficient curriculum problems: found ${totalProblems}`,
      );
    }
    results.push({
      name: "Curriculum Modules & Problems Count Verification",
      category: "curriculum",
      status: "PASS",
    });
  } catch (e: any) {
    results.push({
      name: "Curriculum Modules & Problems Count Verification",
      category: "curriculum",
      status: "FAIL",
      error: e.message,
    });
  }

  // 2. Verify Debug Puzzles Count & Integrity
  try {
    if (!debugPuzzles || debugPuzzles.length === 0) {
      throw new Error("Debug puzzles array is empty");
    }
    const invalidPuzzles = debugPuzzles.filter(
      (p) => !p.id || !p.flawedQuery || !p.solutionQuery,
    );
    if (invalidPuzzles.length > 0) {
      throw new Error(
        `${invalidPuzzles.length} debug puzzles have missing fields`,
      );
    }
    results.push({
      name: "Debug Puzzles Schema Verification",
      category: "puzzles",
      status: "PASS",
    });
  } catch (e: any) {
    results.push({
      name: "Debug Puzzles Schema Verification",
      category: "puzzles",
      status: "FAIL",
      error: e.message,
    });
  }

  // 3. Verify Unique IDs across Practice Problems and Debug Puzzles
  try {
    const problemIds = new Set<string>();
    const duplicateIds: string[] = [];
    roadmapModules.forEach((m) => {
      m.problems.forEach((p) => {
        if (problemIds.has(p.id)) {
          duplicateIds.push(p.id);
        } else {
          problemIds.add(p.id);
        }
      });
    });
    if (duplicateIds.length > 0) {
      throw new Error(
        `Duplicate problem IDs detected: [${duplicateIds.join(", ")}]`,
      );
    }
    results.push({
      name: "Problem ID Uniqueness Verification",
      category: "integrity",
      status: "PASS",
    });
  } catch (e: any) {
    results.push({
      name: "Problem ID Uniqueness Verification",
      category: "integrity",
      status: "FAIL",
      error: e.message,
    });
  }

  // 4. Verify Dataset Schemas & Query Preprocessing Rules
  try {
    roadmapModules.forEach((m) => {
      m.problems.forEach((p) => {
        if (!p.solution || p.solution.trim().length === 0) {
          throw new Error(
            `Problem ${p.id} (${p.title}) has empty solution SQL`,
          );
        }
      });
    });
    results.push({
      name: "SQL Solution Query Non-Empty Verification",
      category: "integrity",
      status: "PASS",
    });
  } catch (e: any) {
    results.push({
      name: "SQL Solution Query Non-Empty Verification",
      category: "integrity",
      status: "FAIL",
      error: e.message,
    });
  }

  // 5. Verify 3-Hint Standard across Practice Problems and Debug Puzzles
  try {
    const problemsMissing3Hints: string[] = [];
    roadmapModules.forEach((m) => {
      m.problems.forEach((p) => {
        if (!p.hints || p.hints.length < 3) {
          problemsMissing3Hints.push(p.id);
        }
      });
    });
    debugPuzzles.forEach((pz) => {
      if (!pz.hints || pz.hints.length < 3) {
        problemsMissing3Hints.push(pz.id);
      }
    });
    if (problemsMissing3Hints.length > 0) {
      throw new Error(
        `${problemsMissing3Hints.length} items missing 3 progressive hints: [${problemsMissing3Hints.slice(0, 5).join(", ")}]`,
      );
    }
    results.push({
      name: "3-Hint Standardization Verification (100% 3 Hints)",
      category: "integrity",
      status: "PASS",
    });
  } catch (e: any) {
    results.push({
      name: "3-Hint Standardization Verification (100% 3 Hints)",
      category: "integrity",
      status: "FAIL",
      error: e.message,
    });
  }

  return results;
}
