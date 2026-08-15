// Comprehensive Curriculum & System Test Runner
import initSqlJs from "sql.js";
import { roadmapModules } from "./src/data/curriculum.ts";
import { seedDatabaseInstance } from "./src/utils/dbSeeder.ts";
import { prepareMySqlForSqlite, registerMySqlFunctions } from "./src/utils/mysqlCompat.ts";

interface ValidationFailure {
  type: string;
  moduleId: number | string;
  moduleTitle: string;
  problemId: string;
  problemTitle: string;
  solution: string;
  error: string;
}

async function runValidation() {
  console.log("==================================================");
  console.log("    SQL ANALYST ACADEMY SYSTEM TEST RUNNER");
  console.log("==================================================");

  const SQL = await initSqlJs();

  // Create single seeded database template and export as binary snapshot for instant cloning
  const templateDb = new SQL.Database();
  registerMySqlFunctions(templateDb);
  seedDatabaseInstance(templateDb);
  const dbSnapshot = templateDb.export();
  templateDb.close();

  const getFreshDb = () => {
    const db = new SQL.Database(dbSnapshot);
    registerMySqlFunctions(db);
    return db;
  };

  let practicePass = 0, practiceFail = 0;
  let puzzlePass = 0, puzzleFail = 0;
  let unitPass = 0, unitFail = 0;
  let sysPass = 0, sysFail = 0;
  const failures: ValidationFailure[] = [];

  // 1. Validate Roadmap Module Practice Problems
  console.log("\n[1/5] Validating Practice Problems...");
  for (const m of roadmapModules) {
    for (const p of m.problems) {
      const db = getFreshDb();
      try {
        db.exec(prepareMySqlForSqlite(p.solution));
        practicePass++;
      } catch (err: unknown) {
        practiceFail++;
        failures.push({
          type: "Practice Problem",
          moduleId: m.id,
          moduleTitle: m.title,
          problemId: p.id,
          problemTitle: p.title,
          solution: p.solution,
          error: (err as Error).message
        });
      } finally {
        db.close();
      }
    }
  }
  console.log(`  ✓ ${practicePass} practice problems validated (${practiceFail} failed)`);

  // 2. Validate Debug Puzzles
  console.log("\n[2/5] Validating Debug Puzzles...");
  const { debugPuzzles } = await import("./src/data/puzzles.ts");
  for (const p of debugPuzzles) {
    const db = getFreshDb();
    try {
      db.exec(prepareMySqlForSqlite(p.solutionQuery));
      puzzlePass++;
    } catch (err: unknown) {
      puzzleFail++;
      failures.push({
        type: `Debug Puzzle - ${p.category}`,
        moduleId: p.category,
        moduleTitle: p.category,
        problemId: p.id,
        problemTitle: p.title,
        solution: p.solutionQuery,
        error: (err as Error).message
      });
    } finally {
      db.close();
    }
  }
  console.log(`  ✓ ${puzzlePass} debug puzzles validated (${puzzleFail} failed)`);

  // 3. Unit Test: RFC 4180 CSV Parser
  console.log("\n[3/5] Running Unit Tests: RFC 4180 CSV Parser...");
  try {
    const { buildCsvImportSql } = await import("./src/utils/csvParser.ts");
    const testCsv = 'id,name,city\n1,"Doe, John","Mumbai"\n2,"Jane ""Boss"" Smith","Delhi\nIndia"';
    const { sql, rowCount, headers } = buildCsvImportSql("test_users.csv", testCsv);
    if (rowCount !== 2) throw new Error(`Expected 2 data rows, got ${rowCount}`);
    if (headers.length !== 3) throw new Error(`Expected 3 headers, got ${headers.length}`);
    if (!sql.includes("CREATE TABLE `temp_test_users`")) throw new Error("CSV DDL generation failed");
    console.log("  ✓ RFC 4180 CSV parser & SQL builder unit tests passed!");
    unitPass++;
  } catch (err: unknown) {
    unitFail++;
    failures.push({
      type: "Unit Test - CSV Parser",
      moduleId: "UTILS",
      moduleTitle: "csvParser",
      problemId: "csv_unit_test",
      problemTitle: "RFC 4180 CSV Parsing",
      solution: "buildCsvImportSql",
      error: (err as Error).message
    });
  }

  // 4. Unit Test: Transaction State & Rollback Recovery
  console.log("\n[4/5] Running Unit Tests: Transaction Recovery...");
  const dbTx = getFreshDb();
  try {
    try {
      dbTx.exec("BEGIN TRANSACTION; INSERT INTO customers VALUES (9999, 'Test', 'City', 'Reg', '2026-01-01', 'Seg', '{}'); INVALID_SQL;");
    } catch (_) {
      try {
        dbTx.exec("ROLLBACK;");
      } catch (_) {}
    }
    const checkRes = dbTx.exec("SELECT * FROM customers WHERE customer_id = 9999;");
    if (checkRes.length > 0 && checkRes[0].values.length > 0) {
      throw new Error("Transaction rollback failed: failed transaction left mutated state!");
    }
    console.log("  ✓ Transaction rollback & safety recovery test passed!");
    unitPass++;
  } catch (err: unknown) {
    unitFail++;
    failures.push({
      type: "Unit Test - Transaction Recovery",
      moduleId: "UTILS",
      moduleTitle: "sqlEngine",
      problemId: "tx_rollback_test",
      problemTitle: "Transaction Rollback Isolation",
      solution: "ROLLBACK recovery",
      error: (err as Error).message
    });
  } finally {
    dbTx.close();
  }

  // 5. System Verification Smoke Tests
  console.log("\n[5/5] Running System Verification Smoke Tests...");
  try {
    const { datasetDomains, tableSchemas } = await import("./src/data/datasets.ts");
    if (!datasetDomains || datasetDomains.length === 0) throw new Error("Dataset domains missing");
    if (!tableSchemas || Object.keys(tableSchemas).length === 0) throw new Error("Table schemas missing");
    console.log("  ✓ Relational Schemas & Domain Datasets Integrity Check");
    sysPass++;

    const { learningRoadmap } = await import("./src/data/curriculum.ts");
    if (!learningRoadmap || learningRoadmap.length !== 38) throw new Error(`Expected 38 roadmap days, found ${learningRoadmap?.length}`);
    console.log("  ✓ 38-Day Structured Curriculum Integrity Check");
    sysPass++;
  } catch (err: unknown) {
    sysFail++;
    failures.push({
      type: "System Verification Suite",
      moduleId: "E2E",
      moduleTitle: "System Integrity",
      problemId: "system_integrity",
      problemTitle: "System Verification",
      solution: "datasets / curriculum",
      error: (err as Error).message
    });
  }

  const totalSuccess = practicePass + puzzlePass + unitPass + sysPass;
  const totalFailures = practiceFail + puzzleFail + unitFail + sysFail;

  console.log("\n==================================================");
  console.log("               SUMMARY OF RESULTS");
  console.log("==================================================");
  console.log(`- Practice Problems:          ${practicePass} Passed, ${practiceFail} Failed`);
  console.log(`- Debug Puzzles:              ${puzzlePass} Passed, ${puzzleFail} Failed`);
  console.log(`- Utility Unit Tests:         ${unitPass} Passed, ${unitFail} Failed`);
  console.log(`- System E2E Verifications:   ${sysPass} Passed, ${sysFail} Failed`);
  console.log(`--------------------------------------------------`);
  console.log(`TOTAL SUCCEEDED: ${totalSuccess} | TOTAL FAILED: ${totalFailures}`);
  console.log("==================================================");

  if (totalFailures > 0) {
    console.error("\n❌ Failures detected:");
    failures.forEach((f: ValidationFailure, index: number) => {
      console.error(`\n[${index + 1}] ${f.type}`);
      console.error(`  Module: M${f.moduleId} - ${f.moduleTitle}`);
      console.error(`  Problem ID: ${f.problemId} (${f.problemTitle})`);
      console.error(`  Error: ${f.error}`);
    });
    process.exit(1);
  } else {
    console.log("\n✅ All test suites passed cleanly with 0 errors!");
    process.exit(0);
  }
}

runValidation().catch((err) => {
  console.error("Runner crashed:", err);
  process.exit(1);
});
