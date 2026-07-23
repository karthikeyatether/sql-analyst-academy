// Curriculum Test Runner
import initSqlJs from "sql.js";
import { roadmapModules } from "./src/data/curriculum.ts";
import { seedDatabaseInstance } from "./src/utils/dbSeeder.ts";

function resetDatabase(db: initSqlJs.Database) {
  seedDatabaseInstance(db);
}

async function runValidation() {
  console.log("Starting curriculum SQL validation...");
  
  const SQL = await initSqlJs();
  const db = new SQL.Database();

  let successCount = 0;
  let failureCount = 0;
  const failures: any[] = [];

  // Validate Roadmap Module Practice Problems
  console.log("\nValidating Practice Problems...");
  for (const m of roadmapModules) {
    for (const p of m.problems) {
      try {
        resetDatabase(db);
        db.exec(p.solution);
        successCount++;
      } catch (err: any) {
        failureCount++;
        failures.push({
          type: "Practice Problem",
          moduleId: m.id,
          moduleTitle: m.title,
          problemId: p.id,
          problemTitle: p.title,
          solution: p.solution,
          error: err.message
        });
      }
    }
  }

  // Validate Debug Puzzles
  console.log("\nValidating Debug Puzzles...");
  const { debugPuzzles } = await import("./src/data/puzzles.ts");
  for (const p of debugPuzzles) {
    try {
      resetDatabase(db);
      db.exec(p.solutionQuery);
      successCount++;
    } catch (err: any) {
      failureCount++;
      failures.push({
        type: `Debug Puzzle - ${p.category}`,
        moduleId: p.category,
        moduleTitle: p.category,
        problemId: p.id,
        problemTitle: p.title,
        solution: p.solutionQuery,
        error: err.message
      });
    }
  }

  console.log(`\nValidation complete: ${successCount} queries succeeded, ${failureCount} failed.`);
  if (failureCount > 0) {
    console.error("\n❌ Failures detected:");
    failures.forEach((f, index) => {
      console.error(`\n[${index + 1}] ${f.type}`);
      console.error(`  Module: M${f.moduleId} - ${f.moduleTitle}`);
      console.error(`  Problem ID: ${f.problemId} (${f.problemTitle})`);
      console.error(`  Error: ${f.error}`);
      console.error(`  SQL: ${f.solution.trim().replace(/\n/g, "\n       ")}`);
    });
  } else {
    console.log("\n✅ All SQL solutions execute successfully without errors!");
  }
}

runValidation().catch(err => {
  console.error("Runner crashed:", err);
});
