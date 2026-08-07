import { problemsBatch1 } from "./problems_batch1";
import { batch2Problems } from "./problems_batch2";
import { problemsBatch3 } from "./problems_batch3";

import {
  Difficulty,
  PracticeProblem,
  RoadmapModule,
  RoadmapDay,
  MockInterview,
  realLessons,
  moduleTitles,
  tracks,
  moduleOutcomes,
  modulePrerequisites,
  getLevel,
  buildFallbackLesson,
  validateUniqueProblemIds,
} from "./curriculumMetadata";

export * from "./curriculumMetadata";

const realProblems: Record<number, PracticeProblem[]> = {
  ...problemsBatch1,
  ...batch2Problems,
  ...problemsBatch3,
};

function buildFallbackProblem(
  moduleId: number,
  title: string,
  index: number,
  difficulty: Difficulty,
): PracticeProblem {
  const t = title.toUpperCase();

  let query = "";

  let promptText = "";

  let concepts = [title];

  if (t.includes("JOIN")) {
    query =
      `SELECT c.customer_id, c.full_name, o.order_id, o.total_amount\n` +
      `FROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nLIMIT 10;`;

    promptText =
      `Write a query to retrieve customer_id, full_name, order_id, and total_amount ` +
      `by joining the customers and orders tables.`;

    concepts.push("JOIN", "Foreign Key");
  } else if (
    t.includes("WINDOW") ||
    t.includes("RANK") ||
    t.includes("ROW_NUMBER") ||
    t.includes("LEAD") ||
    t.includes("LAG")
  ) {
    query =
      `SELECT customer_id, order_id, total_amount, ` +
      `RANK() OVER(PARTITION BY customer_id ORDER BY total_amount DESC) as rank_amount\n` +
      `FROM orders\nWHERE status = 'Delivered';`;

    promptText =
      `Write a window function query to rank the delivered orders for each customer ` +
      `based on their total_amount (highest first).`;

    concepts.push("Window Function", "RANK", "PARTITION BY");
  } else if (
    t.includes("GROUP BY") ||
    t.includes("HAVING") ||
    t.includes("COUNT") ||
    t.includes("SUM") ||
    t.includes("AVG") ||
    t.includes("MIN") ||
    t.includes("MAX")
  ) {
    query =
      `SELECT status, COUNT(order_id) as total_orders, SUM(total_amount) as revenue\n` +
      `FROM orders\nGROUP BY status;`;

    promptText = `Write a query to calculate the total number of orders and the total revenue for each order status.`;

    concepts.push("Aggregation", "GROUP BY");
  } else if (
    t.includes("WHERE") ||
    t.includes("FILTER") ||
    t.includes("IN") ||
    t.includes("LIKE") ||
    t.includes("NULL") ||
    t.includes("OPERATOR")
  ) {
    query =
      `SELECT order_id, customer_id, total_amount\n` +
      `FROM orders\nWHERE status = 'Delivered' AND total_amount > 1000;`;

    promptText =
      `Retrieve the order_id, customer_id, and total_amount for all 'Delivered' orders ` +
      `WHERE the total_amount is greater than 1000.`;

    concepts.push("Filtering", "WHERE", "AND");
  } else if (
    t.includes("ORDER BY") ||
    t.includes("LIMIT") ||
    t.includes("SORT")
  ) {
    query = `SELECT product_id, product_name, list_price\nFROM products\nORDER BY list_price DESC\nLIMIT 5;`;

    promptText = `Retrieve the product_id, product_name, and list_price of the top 5 most expensive products.`;

    concepts.push("Sorting", "ORDER BY", "LIMIT");
  } else if (
    t.includes("CTE") ||
    t.includes("WITH") ||
    t.includes("SUBQUERY") ||
    t.includes("SUBQUERIES")
  ) {
    query =
      `WITH high_value AS (\n  SELECT * FROM orders WHERE total_amount > 5000\n)\n` +
      `SELECT customer_id, COUNT(order_id) as big_orders\n` +
      `FROM high_value\nGROUP BY customer_id;`;

    promptText =
      `Use a CTE (or subquery) named 'high_value' to filter orders > 5000, ` +
      `then query it to count how many big orders each customer has.`;

    concepts.push("CTE", "Subqueries");
  } else if (t.includes("UNION")) {
    query = `SELECT city, 'Customer' as source FROM customers\nUNION ALL\nSELECT 'N/A', 'Dummy' as source\nLIMIT 10;`;

    promptText = `Write a query using UNION ALL to combine cities FROM customers and a dummy row.`;

    concepts.push("UNION", "Set Operations");
  } else if (t.includes("CASE")) {
    query =
      `SELECT order_id, total_amount,\n` +
      `CASE WHEN total_amount > 5000 THEN 'High'\n` +
      `     WHEN total_amount > 1000 THEN 'Medium'\n` +
      `     ELSE 'Low' END as value_tier\nFROM orders;`;

    promptText =
      `Write a query using CASE WHEN to classify orders into 'High' (> 5000), ` +
      `'Medium' (> 1000), and 'Low' tiers based on total_amount.`;

    concepts.push("CASE WHEN", "Conditional Logic");
  } else if (
    t.includes("DATE") ||
    t.includes("STRING") ||
    t.includes("ALIAS") ||
    t.includes("DISTINCT")
  ) {
    query = `SELECT DISTINCT UPPER(city) as city_upper\nFROM customers\nWHERE city LIKE 'M%';`;

    promptText =
      `Retrieve unique customer cities in uppercase for cities starting with 'M'. ` +
      `Use an alias 'city_upper'.`;

    concepts.push("String Functions", "UPPER", "DISTINCT");
  } else {
    query = `SELECT customer_id, full_name, city, segment\nFROM customers\nLIMIT 10;`;

    promptText = `Write a basic SELECT query to retrieve the first 10 rows FROM the customers TABLE.`;

    concepts.push("SELECT", "LIMIT");
  }

  if (index === 1) {
    query = query.replace("LIMIT 10", "LIMIT 15").replace("LIMIT 5", "LIMIT 3");

    promptText += " (Variation B)";
  } else if (index === 2) {
    query = query.replace("DESC", "ASC");

    promptText += " (Variation C - Try sorting ascending if applicable)";
  } else if (index === 3) {
    promptText += " (Variation D)";
  } else if (index === 4) {
    promptText += " (Variation E)";
  }

  return {
    id: `m${moduleId}-p${index + 1}`,

    moduleId,

    difficulty,

    title: `${difficulty}: ${title} — Problem ${index + 1}`,

    businessScenario: `You are a Data Analyst at an Indian e-commerce company. Apply your knowledge of
      ${title} to solve this business requirement.`,

    prompt: promptText,

    starterQuery: `-- ${title} practice\n-- Goal: ${promptText}\n\nSELECT * \nFROM orders \nLIMIT 5;`,

    solution: query,

    hints: [
      `Identify the tables needed: customers, orders, or products?`,

      `Build the query step by step: FROM → WHERE → GROUP BY → SELECT.`,

      `Ensure your syntax matches the required concept: ${title}.`,
    ],

    detailedExplanation: `This problem specifically targets ${title}. By analyzing the query structure,
      you can see how the SQL engine processes this logic.`,

    alternativeApproach: `For complex queries, start by selecting * to understand the raw data, then
      progressively add filters, joins, and aggregates.`,

    performanceNotes: `Filtering early with WHERE (before joins or grouping) is the #1 way to optimize
      query performance.`,

    concepts,

    companyTags: [
      [
        "Google",
        "Amazon",
        "Flipkart",
        "Swiggy",
        "Zomato",
        "Myntra",
        "Uber",
        "CRED",
      ][Math.floor(Math.random() * 8)],
    ],
  };
}

function buildProblems(moduleId: number, title: string): PracticeProblem[] {
  if (realProblems[moduleId]) {
    return realProblems[moduleId].map((p, i) => ({
      ...p,

      isEssential: i === 0,

      companyTags: p.companyTags || [
        [
          "Google",
          "Amazon",
          "Flipkart",
          "Swiggy",
          "Zomato",
          "Myntra",
          "Uber",
          "CRED",
        ][Math.floor(Math.random() * 8)],
      ],
    }));
  }

  const difficulties: Difficulty[] = [
    "Easy",
    "Easy",
    "Medium",
    "Medium",
    "Hard",
  ];

  return difficulties.map((d, i) => ({
    ...buildFallbackProblem(moduleId, title, i, d),

    isEssential: i === 0,
  }));
}

export const roadmapModules: RoadmapModule[] = moduleTitles.map(
  (title, index) => {
    const id = index + 1;

    const level = getLevel(id);

    const track = tracks[index] ?? "SQL Analytics";

    const lesson = realLessons[id] ?? buildFallbackLesson(id, title, track);

    let outcome = moduleOutcomes[id];
    if (!outcome) {
      outcome =
        level === "Beginner"
          ? "Write clean first queries — filter, sort, and compute basic metrics."
          : level === "Intermediate"
            ? "Turn raw tables into interview-ready summaries using joins and aggregations."
            : "Solve multi-table business problems with window functions, CTEs, and optimisation.";
    }

    return {
      id,

      title,

      level,

      track,

      outcome,

      lesson,

      problems: buildProblems(id, title),

      prerequisites: modulePrerequisites[id] || [],

      isHighWeight: [17, 21, 22, 23, 24, 25, 26, 27, 28, 41].includes(id),
    };
  },
);

export const learningRoadmap: RoadmapDay[] = [
  {
    day: 1,
    title: "SQL Fundamentals",
    focus: "Databases, SELECT",
    modules: [1],
    mockInterview: null,
  },
  {
    day: 2,
    title: "Filtering & Sorting",
    focus: "WHERE, ORDER BY",
    modules: [2, 3],
    mockInterview: null,
  },
  {
    day: 3,
    title: "Result Control",
    focus: "LIMIT, DISTINCT",
    modules: [4],
    mockInterview: null,
  },
  {
    day: 4,
    title: "NULL & Data Quality",
    focus: "NULL Handling, COALESCE",
    modules: [5],
    mockInterview: null,
  },
  {
    day: 5,
    title: "Text & Patterns",
    focus: "String Functions, LIKE patterns",
    modules: [6],
    mockInterview: null,
  },
  {
    day: 6,
    title: "IN, Sets & Dates",
    focus: "IN operator, Date Functions",
    modules: [7, 8],
    mockInterview: null,
  },
  {
    day: 7,
    title: "Milestone Day",
    focus: "Blinkit Analyst Prep",
    modules: [],
    mockInterview: {
      company: "Blinkit Growth Analyst",
      minutes: 30,
      questions: 8,
      difficulty: "Beginner",
      maxModuleId: 8,
    },
  },
  {
    day: 8,
    title: "Basic Metrics",
    focus: "COUNT, SUM",
    modules: [9, 10],
    mockInterview: null,
  },
  {
    day: 9,
    title: "Averages & Ranges",
    focus: "AVG, MIN & MAX",
    modules: [11, 12],
    mockInterview: null,
  },
  {
    day: 10,
    title: "Group summaries",
    focus: "GROUP BY, HAVING",
    modules: [13, 14],
    mockInterview: null,
  },
  {
    day: 11,
    title: "Aggregation logic",
    focus: "HAVING vs WHERE",
    modules: [15],
    mockInterview: null,
  },
  {
    day: 12,
    title: "Milestone Day",
    focus: "Zomato Growth Analyst Prep",
    modules: [],
    mockInterview: {
      company: "Zomato Growth Analyst",
      minutes: 40,
      questions: 20,
      difficulty: "Beginner - Intermediate",
      maxModuleId: 15,
    },
  },
  {
    day: 13,
    title: "Relational Joins",
    focus: "Inner, Left Joins",
    modules: [16, 17],
    mockInterview: null,
  },
  {
    day: 14,
    title: "Outer Joins",
    focus: "Right, Full Joins",
    modules: [18, 19],
    mockInterview: null,
  },
  {
    day: 15,
    title: "Hierarchy Analysis",
    focus: "Self Joins",
    modules: [20],
    mockInterview: null,
  },
  {
    day: 16,
    title: "Milestone Day",
    focus: "Paytm Finance Analyst Prep",
    modules: [],
    mockInterview: {
      company: "Paytm Finance Analyst",
      minutes: 45,
      questions: 20,
      difficulty: "Intermediate",
      maxModuleId: 20,
    },
  },
  {
    day: 17,
    title: "Milestone Day",
    focus: "Swiggy Growth Analyst Prep",
    modules: [],
    mockInterview: {
      company: "Swiggy Business Analyst",
      minutes: 45,
      questions: 15,
      difficulty: "Intermediate",
      maxModuleId: 20,
    },
  },
  {
    day: 18,
    title: "Subqueries",
    focus: "WHERE, Correlated subqueries",
    modules: [21, 22],
    mockInterview: null,
  },
  {
    day: 19,
    title: "Query Architecture",
    focus: "Derived Tables, CTEs",
    modules: [23, 24],
    mockInterview: null,
  },
  {
    day: 20,
    title: "Milestone Day",
    focus: "CRED Risk Analyst Prep",
    modules: [],
    mockInterview: {
      company: "CRED Risk Analyst",
      minutes: 50,
      questions: 20,
      difficulty: "Intermediate - Advanced",
      maxModuleId: 24,
    },
  },
  {
    day: 21,
    title: "Window Functions 1",
    focus: "ROW_NUMBER, RANK",
    modules: [25, 26],
    mockInterview: null,
  },
  {
    day: 22,
    title: "Window Functions 2",
    focus: "LEAD & LAG, Running Totals",
    modules: [27, 28],
    mockInterview: null,
  },
  {
    day: 23,
    title: "Milestone Day",
    focus: "Myntra Growth Analyst Prep",
    modules: [],
    mockInterview: {
      company: "Myntra Marketing Analyst",
      minutes: 50,
      questions: 22,
      difficulty: "Advanced",
      maxModuleId: 28,
    },
  },
  {
    day: 24,
    title: "Dataset operations",
    focus: "UNION, Set Operations",
    modules: [29, 30],
    mockInterview: null,
  },
  {
    day: 25,
    title: "Business Analytics",
    focus: "CASE WHEN, Pivoting & NTILE",
    modules: [31, 32],
    mockInterview: null,
  },
  {
    day: 26,
    title: "Milestone Day",
    focus: "Ola Mobility Analyst Prep",
    modules: [],
    mockInterview: {
      company: "Ola Mobility Analyst",
      minutes: 60,
      questions: 28,
      difficulty: "Advanced",
      maxModuleId: 32,
    },
  },
  {
    day: 27,
    title: "Database Foundations",
    focus: "CREATE, ALTER TABLE",
    modules: [33, 34],
    mockInterview: null,
  },
  {
    day: 28,
    title: "Milestone Day",
    focus: "Walmart Supply Chain Prep",
    modules: [],
    mockInterview: {
      company: "Walmart Supply Chain Analyst",
      minutes: 50,
      questions: 20,
      difficulty: "Intermediate → Advanced",
      maxModuleId: 32,
    },
  },
  {
    day: 29,
    title: "Data Manipulation & Views",
    focus: "DML commands, Views",
    modules: [35, 36],
    mockInterview: null,
  },
  {
    day: 30,
    title: "Table Creation & Advanced Schema",
    focus: "CTAS syntax, ALTER TABLE & Indexing",
    modules: [37, 38, 42],
    mockInterview: null,
  },
  {
    day: 31,
    title: "Milestone Day",
    focus: "Uber Rides Analyst Prep",
    modules: [],
    mockInterview: {
      company: "Uber Rides Analyst",
      minutes: 55,
      questions: 22,
      difficulty: "Advanced",
      maxModuleId: 38,
    },
  },
  {
    day: 32,
    title: "Staging Data & Complex Pipelines",
    focus: "Temporary tables, Staging & Query Flow",
    modules: [39, 40, 43],
    mockInterview: null,
  },
  {
    day: 33,
    title: "Performance & Execution Plans",
    focus: "Indexes, EXPLAIN plan",
    modules: [37, 38],
    mockInterview: null,
  },
  {
    day: 34,
    title: "Transactions & Tuning",
    focus: "Transactions, Query optimization",
    modules: [39, 40],
    mockInterview: null,
  },
  {
    day: 35,
    title: "Interview Pattern Library",
    focus: "Common SQL interview patterns",
    modules: [41],
    mockInterview: null,
  },
  {
    day: 36,
    title: "Milestone Day",
    focus: "Netflix Streaming Analyst Prep",
    modules: [],
    mockInterview: {
      company: "Netflix Streaming Analyst",
      minutes: 60,
      questions: 25,
      difficulty: "Advanced → Expert",
      maxModuleId: 41,
    },
  },
  {
    day: 37,
    title: "Milestone Day",
    focus: "Stripe Financial Analyst Prep",
    modules: [],
    mockInterview: {
      company: "Stripe Financial Analyst",
      minutes: 60,
      questions: 12,
      difficulty: "Expert",
      maxModuleId: 43,
    },
  },
  {
    day: 38,
    title: "Final Milestone Day",
    focus: "Google Performance Engineer Prep",
    modules: [],
    mockInterview: {
      company: "Google Performance Engineer",
      minutes: 60,
      questions: 12,
      difficulty: "Expert",
      maxModuleId: 43,
    },
  },
];

export const mockInterviews: MockInterview[] = [
  {
    company: "Blinkit Growth Analyst",
    minutes: 30,
    questions: 8,
    difficulty: "Beginner",
    focus: "Basic retrieval, WHERE, ORDER BY, LIMIT, DISTINCT, LIKE, IN",
    maxModuleId: 8,
  },
  {
    company: "Zomato Growth Analyst",
    minutes: 40,
    questions: 20,
    difficulty: "Beginner → Intermediate",
    focus: "Restaurant ratings, delivery times, aggregations, GROUP BY, HAVING",
    maxModuleId: 15,
  },
  {
    company: "Paytm Finance Analyst",
    minutes: 45,
    questions: 20,
    difficulty: "Intermediate",
    focus:
      "Financial summaries, joins, self joins, CASE WHEN, and aggregations",
    maxModuleId: 20,
  },
  {
    company: "Swiggy Business Analyst",
    minutes: 45,
    questions: 15,
    difficulty: "Intermediate",
    focus:
      "Delivery cohorts, SLA breaches, relational joins, and retention stats",
    maxModuleId: 20,
  },
  {
    company: "CRED Risk Analyst",
    minutes: 50,
    questions: 20,
    difficulty: "Intermediate → Advanced",
    focus: "Subqueries, CTE chains, transaction audits, and complex metrics",
    maxModuleId: 24,
  },
  {
    company: "Walmart Supply Chain Analyst",
    minutes: 50,
    questions: 20,
    difficulty: "Intermediate → Advanced",
    focus: "Retail KPIs, inventories, replenishment rate, cumulative sales",
    maxModuleId: 32,
  },
  {
    company: "Myntra Marketing Analyst",
    minutes: 50,
    questions: 22,
    difficulty: "Advanced",
    focus: "Campaign performance, user ranking, LAG/LEAD, cohort retention",
    maxModuleId: 28,
  },
  {
    company: "Ola Mobility Analyst",
    minutes: 60,
    questions: 28,
    difficulty: "Advanced",
    focus: "Ride statistics, running totals, Union operations, set differences",
    maxModuleId: 32,
  },
  {
    company: "Uber Rides Analyst",
    minutes: 55,
    questions: 22,
    difficulty: "Advanced",
    focus:
      "Dynamic pricing, supply-demand matching, spatial surge metrics, partition logic",
    maxModuleId: 36,
  },
  {
    company: "Netflix Streaming Analyst",
    minutes: 60,
    questions: 25,
    difficulty: "Advanced → Expert",
    focus:
      "User engagement, retention curves, content performance ranks, LEAD/LAG watch trends",
    maxModuleId: 41,
  },
  {
    company: "Google Performance Engineer",
    minutes: 60,
    questions: 12,
    difficulty: "Expert",
    focus:
      "DDL/DML transactions, EXPLAIN execution plans, CTAS performance, tuning",
    maxModuleId: 43,
  },
  {
    company: "Stripe Financial Analyst",
    minutes: 60,
    questions: 12,
    difficulty: "Expert",
    focus:
      "Fraud detection, rolling 30-day merchant volume, ledger aggregation, index performance",
    maxModuleId: 43,
  },
];

export const interviewQuestionBank = [
  {
    category: "Fundamentals",

    question: "What is the difference between WHERE and HAVING?",

    answer:
      "WHERE filters individual rows before grouping. HAVING filters groups after " +
      "aggregation. You cannot use aggregate functions in WHERE.",

    followUp:
      "Write a query that uses both WHERE and HAVING in the same statement.",

    mistake:
      "Using HAVING for simple row filters — it works but forces the database to group " +
      "all rows first, which is slower than WHERE.",
  },

  {
    category: "Fundamentals",

    question: "In what order does SQL logically execute a query?",

    answer:
      "FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT. " +
      "This is why you cannot use a SELECT alias in WHERE.",

    followUp: "Can you use a SELECT alias in ORDER BY? Why?",

    mistake:
      "Writing queries in the order you think them (SELECT first) without understanding execution order.",
  },

  {
    category: "Aggregation",

    question:
      "What is the difference between COUNT(*), COUNT(col), and COUNT(DISTINCT col)?",

    answer:
      "COUNT(*) = all rows including NULLs. COUNT(col) = non-NULL values in col. " +
      "COUNT(DISTINCT col) = unique non-NULL values.",

    followUp: "A customer placed 3 orders. How would each COUNT behave?",

    mistake:
      "Assuming COUNT(*) and COUNT(primary_key) are always equal — they are, but COUNT(nullable_col) can differ.",
  },

  {
    category: "Aggregation",

    question: "How do you calculate AOV (Average Order Value)?",

    answer:
      "AOV = SUM(total_amount - discount_amount) / COUNT(DISTINCT order_id) on " +
      "delivered orders only. Do NOT use AVG(total_amount) — that gives gross value " +
      "before discounts.",

    followUp:
      "How would AOV change if you forgot to filter for delivered orders?",

    mistake:
      "Using AVG(total_amount) which includes cancelled/returned orders and ignores discounts.",
  },

  {
    category: "JOINs",

    question: "What is the difference between INNER JOIN and LEFT JOIN?",

    answer:
      "INNER JOIN returns only matching rows from both tables. LEFT JOIN returns all " +
      "rows from the left table plus matching rows from the right; non-matching right " +
      "rows appear as NULL.",

    followUp: "How do you find customers who have never placed an order?",

    mistake:
      "Using INNER JOIN when you need to include all rows from one table — causes silent data loss.",
  },

  {
    category: "JOINs",

    question: "How do you find customers with no orders?",

    answer:
      "LEFT JOIN customers to orders ON customer_id. Then filter WHERE orders.order_id " +
      "IS NULL. This is the anti-join pattern.",

    followUp: "Could you solve this with a subquery instead of a LEFT JOIN?",

    mistake:
      "Putting a WHERE filter on the right table's column (not IS NULL check) — this " +
      "converts LEFT JOIN to INNER JOIN.",
  },

  {
    category: "Window Functions",

    question: "What is the difference between GROUP BY and window functions?",

    answer:
      "GROUP BY collapses rows into one row per group. Window functions add a " +
      "calculated value to each row WITHOUT collapsing them. The row count is preserved " +
      "with window functions.",

    followUp: "Write a query to rank each customer by their lifetime value.",

    mistake:
      "Trying to use a window function result in a WHERE clause in the same query — " +
      "must wrap in CTE or subquery.",
  },

  {
    category: "Window Functions",

    question:
      "What is the difference between RANK, DENSE_RANK, and ROW_NUMBER?",

    answer:
      "ROW_NUMBER: always unique (1,2,3,4). RANK: tied rows get same rank with gaps " +
      "(1,1,3). DENSE_RANK: tied rows get same rank without gaps (1,1,2).",

    followUp:
      "If two products have the same revenue, which function gives you exactly 3 " +
      "results when you filter to top 3?",

    mistake:
      "Using ROW_NUMBER when ties should share a rank — or RANK when you need exactly N results.",
  },

  {
    category: "NULL Handling",

    question: "Why does WHERE col = NULL return no rows?",

    answer:
      "NULL is unknown. Comparing anything to NULL with = returns NULL (not TRUE). You " +
      "must use IS NULL or IS NOT NULL.",

    followUp: "What does COALESCE do and when would you use it?",

    mistake:
      "Writing WHERE discount_amount = NULL — returns 0 rows every time.",
  },

  {
    category: "CTEs",

    question: "When would you use a CTE instead of a subquery?",

    answer:
      "Use CTEs when: (1) the same subquery is referenced more than once, (2) the " +
      "logic has 3+ nesting levels, (3) you want named steps for readability and " +
      "debugging.",

    followUp:
      "Can a CTE reference another CTE defined before it in the same WITH block?",

    mistake:
      "Using deeply nested subqueries that are hard to debug — CTEs make each step independently testable.",
  },

  {
    category: "Business SQL",

    question: "How would you calculate month-over-month revenue growth?",

    answer:
      "Use LAG(revenue, 1) OVER (ORDER BY month) to get previous month's revenue. " +
      "Then: (current - previous) / previous * 100 for growth %. Use a CTE to first " +
      "aggregate monthly revenue.",

    followUp: "How would you handle the first month where LAG returns NULL?",

    mistake:
      "Dividing by LAG without NULLIF protection — causes a division by zero error on the first month.",
  },

  {
    category: "Business SQL",

    question: "How do you identify churned customers in SQL?",

    answer:
      "Find customers whose MAX(order_date) is more than N days ago (e.g., 90 days) " +
      "using DATEDIFF(CURDATE(), MAX(order_date)) > 90 in a GROUP BY query.",

    followUp: "How would you calculate the churn rate as a percentage?",

    mistake:
      "Not filtering by order status — including cancelled orders makes a customer " +
      "appear active when they are not.",
  },

  {
    category: "Fundamentals",

    question: "What is the difference between DELETE, TRUNCATE, and DROP?",

    answer:
      "DELETE removes specific rows (can use WHERE, can rollback). TRUNCATE removes " +
      "all rows fast (cannot rollback, resets auto-increment). DROP removes the entire " +
      "table and its structure. For DA interviews, knowing these shows DDL awareness.",

    followUp:
      "If you accidentally deleted the wrong rows, how would you recover them?",

    mistake:
      "Using DROP when you only wanted to clear data — you'd lose the table structure entirely.",
  },

  {
    category: "Fundamentals",

    question: "What is the difference between a PRIMARY KEY and a FOREIGN KEY?",

    answer:
      "PRIMARY KEY uniquely identifies each row in its own table. FOREIGN KEY is a " +
      "column that references the PRIMARY KEY of another table — it creates the " +
      "relationship between tables. An order's customer_id (FK) references " +
      "customers.customer_id (PK).",

    followUp:
      "What happens if you try to insert an order with a customer_id that doesn't " +
      "exist in the customers table?",

    mistake:
      "Confusing PK and FK — the PK is in the parent table, the FK is in the child table.",
  },

  {
    category: "JOINs",

    question: "What happens if you JOIN on a column that has duplicate values?",

    answer:
      "Each row from table A matches with EVERY row from table B that has the same " +
      "value — creating a multiplicative result (fan-out). If a customer has 5 orders " +
      "and you join on customer_id, each customer attribute is repeated 5 times. Always " +
      "verify row count before and after a join.",

    followUp: "How would you detect and handle duplicate join keys?",

    mistake:
      "Not checking for duplicates before joining — causes inflated aggregates (double/triple-counting).",
  },

  {
    category: "JOINs",

    question: "What is a SELF JOIN and when would you use it?",

    answer:
      "A SELF JOIN joins a table to itself using two different aliases. Most common " +
      "use: employee-manager hierarchy where manager_id references employee_id in the " +
      "same table. Always use LEFT JOIN for hierarchies (top-level managers have NULL " +
      "manager_id).",

    followUp:
      "Write a query showing each employee's name and their manager's name.",

    mistake:
      "Using INNER JOIN in a SELF JOIN for a hierarchy — this excludes top-level managers who have no manager.",
  },

  {
    category: "Aggregation",

    question:
      "What is the difference between SUM and COUNT? When would you use each?",

    answer:
      "COUNT counts rows (or non-null values). SUM adds numeric values. COUNT(*) = how " +
      "many orders. SUM(amount) = total revenue. Both ignore NULLs except COUNT(*). " +
      "Common mistake: using COUNT(amount) when you want SUM(amount) — COUNT gives the " +
      "number of rows with a non-null amount, not the total value.",

    followUp: "How would you count orders AND sum revenue in the same query?",

    mistake:
      "Using COUNT(amount) thinking it returns the total value — it counts non-null rows.",
  },

  {
    category: "Aggregation",

    question: "How do you handle NULL values in SUM and AVG?",

    answer:
      "Both SUM and AVG ignore NULLs automatically. AVG([100, NULL, 200]) = 150 (not " +
      "100). If you want NULLs treated as 0: COALESCE(col, 0) before aggregating. For " +
      "percentages, this matters: SUM(COALESCE(discount, 0)) / SUM(total) gives true " +
      "discount rate including zero-discount orders.",

    followUp: "What is COALESCE and how is it different from IFNULL?",

    mistake:
      "Assuming AVG skips NULLs from both numerator and denominator — it does, which can be misleading.",
  },

  {
    category: "Window Functions",

    question: "What is PARTITION BY in a window function?",

    answer:
      "PARTITION BY divides rows into groups for the window function — similar to " +
      "GROUP BY but without collapsing rows. Each partition gets its own window. " +
      "Example: RANK() OVER (PARTITION BY city ORDER BY revenue DESC) assigns ranks " +
      "independently within each city. Without PARTITION BY, the window spans the " +
      "entire result set.",

    followUp: "What is the difference between PARTITION BY and GROUP BY?",

    mistake:
      "Confusing PARTITION BY (preserves all rows) with GROUP BY (collapses rows into one per group).",
  },

  {
    category: "Window Functions",

    question: "What is a running total and how do you compute it in SQL?",

    answer:
      "A running total (cumulative sum) adds each row's value to all previous rows. In " +
      "SQL: SUM(col) OVER (ORDER BY date). The ORDER BY in OVER defines the running " +
      "direction. ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW is the default " +
      "frame.",

    followUp: "How would you compute a 7-day moving average?",

    mistake:
      "Using SUM() OVER () (no ORDER BY) which computes the grand total on every row, not a running total.",
  },

  {
    category: "NULL Handling",

    question: "What does NULLIF do and when would you use it?",

    answer:
      "NULLIF(a, b) returns NULL if a equals b, otherwise returns a. Most common use: " +
      "prevent division by zero. NULLIF(denominator, 0) returns NULL when the " +
      "denominator is 0, making the division return NULL instead of an error. Better " +
      "than a CASE WHEN for this specific case.",

    followUp: "How is NULLIF different from COALESCE?",

    mistake:
      "Dividing by a column without NULLIF protection — causes a division by zero " +
      "error when the denominator is 0.",
  },

  {
    category: "CTEs",

    question: "Can a CTE reference another CTE defined in the same WITH block?",

    answer:
      "Yes. In a WITH block, each CTE can reference all CTEs defined before it in the " +
      "same block. Example: WITH a AS (...), b AS (SELECT * FROM a WHERE ...) — b can " +
      "reference a. This enables step-by-step query building.",

    followUp: "What is the difference between a CTE and a VIEW?",

    mistake:
      "Defining CTEs in the wrong order — you cannot reference a CTE that is defined after the current one.",
  },

  {
    category: "Business SQL",

    question: "How would you find the top-N products per category in SQL?",

    answer:
      "Use the two-CTE pattern: (1) aggregate revenue per product+category, (2) apply " +
      "ROW_NUMBER() OVER (PARTITION BY category ORDER BY revenue DESC), (3) in the " +
      "outer query, WHERE rn <= N. Use ROW_NUMBER for exactly N per category. Use RANK " +
      "if ties should get the same rank.",

    followUp: "What changes if you want top-N allowing ties?",

    mistake:
      "Trying to filter WHERE ROW_NUMBER() <= N in the same SELECT — you must wrap it in a CTE or subquery.",
  },

  {
    category: "Business SQL",

    question:
      "What is a cohort analysis and how would you implement it in SQL?",

    answer:
      "Cohort analysis groups users by a defining event (e.g., signup month) and " +
      "tracks their behaviour over time. SQL approach: (1) Find each user's cohort " +
      "month (MIN(signup_date)), (2) For each transaction, compute 'months since " +
      "signup', (3) GROUP BY cohort + months_since to compute retention or revenue per " +
      "cohort-period.",

    followUp: "How would you calculate the 1-month retention rate?",

    mistake:
      "Not anchoring to the cohort month — comparing absolute months instead of " +
      "relative months since the defining event.",
  },

  {
    category: "Fundamentals",
    question:
      "Why does SELECT * FROM customers WHERE customer_id NOT IN (SELECT customer_id " +
      "FROM orders) return zero rows if even a single order has a NULL customer_id?",
    answer:
      "In SQL, x NOT IN (a, b, NULL) evaluates as x != a AND x != b AND x != NULL. " +
      "Because any comparison to NULL results in UNKNOWN, the entire condition " +
      "evaluates to UNKNOWN, causing the filter to reject all rows. To prevent this " +
      "NULL trap, use NOT EXISTS or filter out NULLs in the subquery: WHERE customer_id " +
      "IS NOT NULL.",
    followUp: "Does the IN operator suffer from the same NULL trap? Why?",
    mistake:
      "Using NOT IN with a subquery on a column that can contain NULLs, resulting in " +
      "an unexpectedly empty result set.",
  },

  {
    category: "Performance",
    question:
      "What does it mean for a query to be SARGable, and why does writing WHERE " +
      "YEAR(order_date) = 2026 cause performance issues?",
    answer:
      "SARGable stands for Search Argument Able. A query is SARGable if the database " +
      "engine can utilize an index to find rows. Using functions like YEAR(order_date) " +
      "on a column in the WHERE clause prevents index usage (index suppression) because " +
      "the database must evaluate the function for every single row (full table scan). " +
      "Instead, write: WHERE order_date >= '2026-01-01' AND order_date < '2027-01-01' " +
      "to enable index range scans.",
    followUp:
      "How does index usage change when using LIKE '%suffix' vs LIKE 'prefix%'?",
    mistake:
      "Wrapping index columns in functions (like DATE, LOWER, or UPPER) inside the " +
      "WHERE clause, which completely disables database indexes.",
  },

  {
    category: "Aggregation",
    question:
      "Does GROUP BY include NULL values, and how does COUNT(*) behave compared to " +
      "COUNT(column) when a group is all NULL?",
    answer:
      "Yes, GROUP BY treats all NULL values as a single group. If you GROUP BY a " +
      "column containing NULLs, a group for NULL will appear in the result set. In that " +
      "NULL group, COUNT(*) will count the number of rows in the group, whereas " +
      "COUNT(column_name) will return 0 because it ignores NULLs.",
    followUp:
      "What does SUM(column) return if all values in the column (or a group) are NULL?",
    mistake:
      "Assuming NULL values are excluded from GROUP BY results, or that COUNT(column) counts the NULL rows.",
  },

  {
    category: "JOINs",
    question:
      "How do you find the status change events for a customer (e.g., from 'Pending' " +
      "to 'Active') when the history is stored as chronological log rows?",
    answer:
      "You can solve this using either a Self-Join or LEAD/LAG window functions. The " +
      "LEAD/LAG approach is cleaner and faster: use LAG(status) OVER (PARTITION BY " +
      "customer_id ORDER BY log_date) to fetch the previous status on each row, then " +
      "wrap this in a CTE and query where status != prev_status to find the exact " +
      "transitions.",
    followUp:
      "How would you write this using a Self-Join if window functions were not supported?",
    mistake:
      "Trying to do WHERE status != status or doing simple joins without sorting or " +
      "partitioning keys, leading to random row matchups.",
  },

  {
    category: "Database Design",
    question:
      "When should you choose a Temporary Table over a Common Table Expression (CTE) " +
      "in a complex analytics pipeline?",
    answer:
      "Use a CTE for single-query readability and simple recursion. Choose a Temporary " +
      "Table when: (1) You need to reference the intermediate dataset multiple times " +
      "across separate queries (avoiding recalculation), (2) The intermediate dataset " +
      "is very large and needs an index created on it for downstream join performance, " +
      "or (3) You need to perform update/delete mutations on the staged data.",
    followUp: "Do temporary tables persist on disk, and who can see them?",
    mistake:
      "Using a CTE multiple times in the same query thinking it caches the result — " +
      "most database engines re-run the CTE query every time it is referenced, whereas " +
      "a temp table is materialized once.",
  },
];

validateUniqueProblemIds(roadmapModules);
