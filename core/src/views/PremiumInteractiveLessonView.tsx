import { useEffect, useState } from "react";
import { SplitPane } from "../components/SplitPane";
import LessonProse from "../components/LessonProse";
import PremiumPlaygroundView from "./PremiumPlaygroundView";
import { useV3Dispatch } from "../contexts/V3Store";

const MOCK_LESSON = `
# Execution Plans & Indexing Strategy

Welcome to **Day 18** of your DA Study Roadmap! Today we cover the lifeblood of query performance: Indexes and Execution Plans.

## What is an Index?
Think of an index like a book's table of contents. Instead of scanning every single page (a **Full Table Scan**), the database looks up the index and jumps directly to the rows you need.

> [!TIP]
> **When to use an index?** On columns that are frequently used in \`WHERE\` clauses, \`JOIN\` conditions, or \`ORDER BY\`.

## B-Tree vs. Hash Indexes
- **B-Tree (Default):** Great for ranges (\`>\`, \`<\`, \`BETWEEN\`) and exact matches.
- **Hash:** Only good for exact matches (\`=\`).

## Execution Plans (EXPLAIN)
To see how a database executes a query, prefix it with \`EXPLAIN QUERY PLAN\`. 

### Interactive Exercise
Try running this in the playground on the right:
\`\`\`sql
EXPLAIN QUERY PLAN
SELECT * FROM users WHERE age > 25;
\`\`\`

If there is no index on \`age\`, you will see a \`SCAN TABLE\` (Full Scan). 
If you create an index:
\`\`\`sql
CREATE INDEX idx_user_age ON users(age);
\`\`\`
The plan will change to \`SEARCH TABLE\` using the index!

---
*Status: In Progress | DataLemur Strategy Track*
`;

export default function PremiumInteractiveLessonView() {
  const dispatch = useV3Dispatch();

  // Force the playground mode to 'free' so they can experiment, 
  // or it could be 'practice' if there is an active problem.
  useEffect(() => {
    dispatch({ type: "SET_PLAYGROUND_MODE", payload: "free" });
  }, [dispatch]);

  return (
    <div style={{ height: "100%", width: "100%", backgroundColor: "var(--bg-primary)" }}>
      <SplitPane 
        leftWidth={350} 
        onResize={() => {}} 
        left={
          <></>
        }
        right={
          <PremiumPlaygroundView />
        }
      />
    </div>
  );
}
