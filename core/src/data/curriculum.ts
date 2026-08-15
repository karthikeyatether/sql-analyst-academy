import { problemsBasic } from "./problemsBasic";
import { problemsIntermediate } from "./problemsIntermediate";
import { problemsAdvanced } from "./problemsAdvanced";

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
  ...problemsBasic,
  1: [
    {
      id: "m1-p1",
      moduleId: 1,
      difficulty: "Easy",

      title: "Select customer details for a report",

      businessScenario:
        "You are preparing a city-wise customer report for Flipkart's operations team.",

      prompt:
        "Write a query to retrieve customer_id, full_name, city, and segment from the customers table.",

      starterQuery:
        "SELECT\n  -- list the 4 required columns here\nFROM customers;",

      solution:
        "SELECT\n  customer_id,\n  full_name,\n  city,\n  segment\nFROM customers;",

      hints: [
        "List each column name separated by commas after SELECT.",
        "The table name goes after FROM.",
        "Structure your query using clauses similar to: SELECT\n  customer_id,\n  full_name,\n  city,\n  segment\nFROM customers;.",
      ],

      detailedExplanation:
        "SELECT names specific columns — never use SELECT * in reports.",

      alternativeApproach:
        "You could order the columns differently in the SELECT list to match the " +
        "report's structure.",

      performanceNotes:
        "Selecting fewer columns reduces I/O compared to SELECT *.",

      concepts: ["SELECT"],
    },

    {
      id: "m1-p2",
      moduleId: 1,
      difficulty: "Medium",

      title: "Compute net order value",

      businessScenario:
        "You need to show net revenue (after discounts) for each order in the orders table.",

      prompt:
        "Write a query that returns order_id, customer_id, total_amount, " +
        "discount_amount, and a computed column net_amount (= total_amount minus " +
        "discount_amount). Also include order_date and status.",

      starterQuery:
        "SELECT\n  order_id,\n  customer_id,\n  total_amount,\n  discount_amount,\n " +
        "total_amount - ??? AS net_amount,\n  order_date,\n  status\nFROM orders;",

      solution:
        "SELECT\n  order_id,\n  customer_id,\n  total_amount,\n  discount_amount,\n " +
        "total_amount - discount_amount AS net_amount,\n  order_date,\n  status\nFROM " +
        "orders;",

      hints: [
        "Arithmetic in SELECT: total_amount - discount_amount.",
        "Use AS net_amount to give it a readable name.",
        "Structure your query using clauses similar to: SELECT\n  order_id,\n  customer_id,\n  total_amount,\n  discount_amount,\n.",
      ],

      detailedExplanation:
        "Computed columns in SELECT let you derive new metrics from existing data " +
        "without modifying the table. The AS keyword gives it a column header name.",

      alternativeApproach:
        "You could also write this as ROUND(total_amount - discount_amount, 2) AS " +
        "net_amount for cleaner decimal output.",

      performanceNotes:
        "Arithmetic in SELECT is computed row-by-row and adds minimal overhead.",

      concepts: ["SELECT", "computed columns", "aliases"],
    },

    {
      id: "m1-p3",
      moduleId: 1,
      difficulty: "Hard",

      title: "Discount percentage per order",

      businessScenario:
        "A pricing analyst at Myntra wants to see the discount percentage for each order.",

      prompt:
        "Write a query that returns order_id, total_amount, discount_amount, and a " +
        "computed column discount_pct (= (discount_amount * 1.0 / total_amount) * 100) " +
        "from the orders table.",

      starterQuery:
        "SELECT\n  -- calculate discount_pct and retrieve other columns here\nFROM orders;",

      solution:
        "SELECT\n  order_id,\n  total_amount,\n  discount_amount,\n  (discount_amount * " +
        "1.0 / total_amount) * 100 AS discount_pct\nFROM orders;",

      hints: [
        "Discount % = (discount_amount / total_amount) * 100.",
        "Multiply by 1.0 to avoid integer division.",
        "Structure your query using clauses similar to: SELECT\n  order_id,\n  total_amount,\n  discount_amount,\n  (discount_amount *.",
      ],

      detailedExplanation:
        "This uses computed columns and arithmetic operators. Always scale integers by a " +
        "decimal (like 1.0) when dividing in MySQL to avoid integer division truncation.",

      alternativeApproach:
        "Use CAST(discount_amount AS REAL) instead of multiplying by 1.0.",

      performanceNotes:
        "The arithmetic is calculated dynamically for each row returned.",

      concepts: ["SELECT", "computed columns", "aliases"],
    },
  ],

  2: [
    {
      id: "m2-p1",
      moduleId: 2,
      difficulty: "Easy",

      title: "Filter high-value delivered orders",

      businessScenario:
        "Swiggy's operations manager needs a list of high-value delivered orders to " +
        "audit premium shipping handling.",

      prompt:
        "Find all delivered orders with a total amount greater than 5000. Return " +
        "order_id, customer_id, channel, total_amount, and order_date.",

      starterQuery:
        "SELECT\n  order_id,\n  customer_id,\n  channel,\n  total_amount,\n " +
        "order_date\nFROM orders\nWHERE status = ???\n  AND total_amount > ???;",

      solution:
        "SELECT\n  order_id,\n  customer_id,\n  channel,\n  total_amount,\n " +
        "order_date\nFROM orders\nWHERE status = 'Delivered'\n  AND total_amount > 5000;",

      hints: [
        "Identify target tables and primary columns for Filter high-value delivered orders.",
        "Filter rows using appropriate WHERE or JOIN clauses as required by the business prompt.",
        "Format target result columns and apply sorting as specified.",
      ],

      detailedExplanation:
        "Combining filters with AND limits results to records satisfying all conditions. " +
        "No JOIN is needed since all order status and amount columns exist directly in " +
        "the orders table.",

      alternativeApproach:
        "Could use: WHERE status = 'Delivered' AND total_amount >= 5001.",

      performanceNotes:
        "Filtering on status and total_amount helps the query planner avoid full-table " +
        "scans if indexes exist.",

      concepts: ["WHERE", "AND"],
    },

    {
      id: "m2-p2",
      moduleId: 2,
      difficulty: "Medium",

      title: "High-value cancelled orders",

      businessScenario:
        "The finance team at CRED needs to identify cancelled orders above ₹3000 for " +
        "refund processing.",

      prompt:
        "Find all cancelled orders where total_amount is between 3000 and 10000. Return " +
        "order_id, customer_id, total_amount, discount_amount, and order_date.",

      starterQuery:
        "SELECT\n  order_id,\n  customer_id,\n  total_amount,\n  discount_amount,\n " +
        "order_date\nFROM orders\nWHERE status = ???\n  AND total_amount BETWEEN ??? AND " +
        "???;",

      solution:
        "SELECT\n  order_id,\n  customer_id,\n  total_amount,\n  discount_amount,\n " +
        "order_date\nFROM orders\nWHERE status = 'Cancelled'\n  AND total_amount BETWEEN " +
        "3000 AND 10000;",

      hints: [
        "Identify target tables and primary columns for High-value cancelled orders.",
        "Filter rows using appropriate WHERE or JOIN clauses as required by the business prompt.",
        "Format target result columns and apply sorting as specified.",
      ],

      detailedExplanation:
        "BETWEEN is a clean way to express range filters. It is inclusive, meaning 3000 " +
        "and 10000 are included in the result.",

      alternativeApproach:
        "WHERE total_amount >= 3000 AND total_amount <= 10000 is equivalent but more verbose.",

      performanceNotes:
        "BETWEEN can use an index if one exists on total_amount.",

      concepts: ["WHERE", "BETWEEN", "AND"],
    },

    {
      id: "m2-p3",
      moduleId: 2,
      difficulty: "Hard",

      title: "Premium customers from specific regions",

      businessScenario:
        "Identify Premium segment customers who signed up after 2023 and are located in " +
        "the South or West region.",

      prompt:
        "Write a query to find customer_id, full_name, city, region, segment, and " +
        "signup_date for Premium customers in the South or West region who signed up " +
        "after '2023-01-01'.",

      starterQuery:
        "SELECT\n  customer_id,\n  full_name,\n  city,\n  region,\n  segment,\n " +
        "signup_date\nFROM customers\nWHERE segment = ???\n  AND region IN (???)\n  AND " +
        "signup_date > ???;",

      solution:
        "SELECT\n  customer_id,\n  full_name,\n  city,\n  region,\n  segment,\n " +
        "signup_date\nFROM customers\nWHERE segment = 'Premium'\n  AND region IN " +
        "('South', 'West')\n  AND signup_date > '2023-01-01';",

      hints: [
        "Three conditions combined with AND.",

        "segment = 'Premium' — exact string match.",

        "Date comparison: signup_date > '2023-01-01' works because YYYY-MM-DD sorts correctly as text.",
      ],

      detailedExplanation:
        "Combining multiple WHERE conditions with AND is the standard way to narrow down " +
        "a dataset. Each condition reduces the row count further.",

      alternativeApproach:
        "You could use BETWEEN for the date range if you also have an end date.",

      performanceNotes:
        "The most selective filter (highest cardinality) should ideally come first — " +
        "segment is more selective than region.",

      concepts: ["WHERE", "AND", "IN", "date comparison"],
    },
  ],

  5: [
    {
      id: "m5-p1",
      moduleId: 5,
      difficulty: "Easy",

      title: "Find orders with missing discount data",

      businessScenario:
        "The finance team needs to audit orders where discount information was not captured.",

      prompt:
        "Write a query to find all orders where discount_amount is NULL or 0. Return " +
        "order_id, customer_id, total_amount, discount_amount, and status. Order by " +
        "total_amount descending.",

      starterQuery:
        "SELECT order_id, customer_id, total_amount, discount_amount, status\nFROM " +
        "orders\nWHERE discount_amount ??? OR discount_amount = ???\nORDER BY " +
        "total_amount DESC;",

      solution:
        "SELECT order_id, customer_id, total_amount, discount_amount, status\nFROM " +
        "orders\nWHERE discount_amount IS NULL OR discount_amount = 0\nORDER BY " +
        "total_amount DESC;",

      hints: [
        "You cannot use = NULL. Use IS NULL instead.",

        "Combine two conditions with OR.",

        "IS NULL checks for missing values. = 0 checks for zero discount.",
      ],

      detailedExplanation:
        "NULL means unknown/missing — it cannot be compared with = or !=. The only " +
        "correct operators are IS NULL and IS NOT NULL. This is one of the most common " +
        "mistakes in SQL.",

      alternativeApproach:
        "COALESCE(discount_amount, 0) = 0 also works — COALESCE replaces NULL with 0, " +
        "then compares to 0.",

      performanceNotes:
        "IS NULL check is fast when the column is indexed with null values tracked.",

      concepts: ["NULL", "IS NULL", "OR", "WHERE"],
    },

    {
      id: "m5-p2",
      moduleId: 5,
      difficulty: "Medium",

      title: "Replace NULL discounts and compute net amount",

      businessScenario:
        "The reporting team wants net revenue, treating NULL discounts as 0.",

      prompt:
        "Write a query on the orders table. Return order_id, total_amount, " +
        "discount_amount (replacing NULL with 0), and net_amount (total minus discount). " +
        "Filter to delivered orders. Order by net_amount descending. Show top 10.",

      starterQuery:
        "SELECT\n  order_id,\n  total_amount,\n  COALESCE(???, 0) AS discount_amount,\n " +
        "total_amount - COALESCE(???, 0) AS net_amount\nFROM orders\nWHERE status = " +
        "'Delivered'\nORDER BY net_amount DESC\nLIMIT 10;",

      solution:
        "SELECT\n  order_id,\n  total_amount,\n  COALESCE(discount_amount, 0) AS " +
        "discount_amount,\n  total_amount - COALESCE(discount_amount, 0) AS " +
        "net_amount\nFROM orders\nWHERE status = 'Delivered'\nORDER BY net_amount " +
        "DESC\nLIMIT 10;",

      hints: [
        "COALESCE(col, default) returns the first non-NULL value.",

        "COALESCE(discount_amount, 0) treats NULL discount as 0.",

        "Reuse the same COALESCE expression in both columns.",
      ],

      detailedExplanation:
        "COALESCE is the standard way to replace NULLs with a default value. It accepts " +
        "multiple arguments and returns the first non-NULL one. Very common in revenue " +
        "calculations.",

      alternativeApproach:
        "IFNULL(discount_amount, 0) is MySQL-specific equivalent of COALESCE with 2 args.",

      performanceNotes:
        "COALESCE adds minimal overhead. More important: always handle NULLs in " +
        "financial calculations to avoid silent errors.",

      concepts: ["COALESCE", "NULL handling", "computed columns"],
    },

    {
      id: "m5-p3",
      moduleId: 5,
      difficulty: "Hard",

      title: "Clean subscription end status",

      businessScenario:
        "The reporting team wants a cleaned list of active subscriptions, returning " +
        "'Active' when the end_date is NULL.",

      prompt:
        "Write a query to retrieve subscription_id, customer_id, plan_name, and a " +
        "computed column end_status. If end_date is NULL (meaning the customer is still " +
        "active), return the text 'Active'. Otherwise, return the end_date. Order by " +
        "subscription_id.",

      starterQuery: `SELECT

  subscription_id,

  customer_id,

  plan_name,

  COALESCE(end_date, 'Active') AS end_status

FROM subscriptions

ORDER BY subscription_id;`,

      solution: `SELECT

  subscription_id,

  customer_id,

  plan_name,

  COALESCE(end_date, 'Active') AS end_status

FROM subscriptions

ORDER BY subscription_id;`,

      hints: [
        "Use COALESCE to handle the NULL end_date case.",

        "COALESCE(end_date, 'Active') will return 'Active' if end_date is NULL.",

        "Order by subscription_id.",
      ],

      detailedExplanation:
        "This demonstrates standard NULL handling using COALESCE. For active " +
        "subscribers, end_date is NULL, which we cleanly default to the string 'Active'.",

      alternativeApproach:
        "You could also use CASE WHEN end_date IS NULL THEN 'Active' ELSE end_date END, " +
        "but CASE is taught later.",

      performanceNotes:
        "Calculations run per row, practically instantaneous for typical dimensions.",
      concepts: ["COALESCE", "NULL", "ORDER BY"],
    },
    {
      id: "m5-p4",
      moduleId: 5,
      difficulty: "Hard",
      title: "Safe average customer discount to avoid division by zero",
      businessScenario:
        "The finance team wants to calculate average order discount percentage, ensuring " +
        "they do not run into division-by-zero errors when total_amount is zero.",
      prompt:
        "Write a query to calculate the average discount percentage for each order. " +
        "Calculate discount percentage as discount_amount * 100.0 / NULLIF(total_amount, " +
        "0). Return order_id, total_amount, discount_amount, and discount_pct. Order by " +
        "order_id.",
      starterQuery:
        "SELECT order_id, total_amount, discount_amount, discount_amount * 100.0 / " +
        "NULLIF(total_amount, 0) AS discount_pct FROM orders ORDER BY order_id;",
      solution:
        "SELECT order_id, total_amount, discount_amount, discount_amount * 100.0 / " +
        "NULLIF(total_amount, 0) AS discount_pct FROM orders ORDER BY order_id;",
      hints: [
        "Use NULLIF(total_amount, 0) in the denominator.",
        "Sort the final output by order_id.",
        "Structure your query using clauses similar to: SELECT order_id, total_amount, discount_amount, discount_amount * 100.0 /.",
      ],
      detailedExplanation:
        "If total_amount is 0, NULLIF(total_amount, 0) returns NULL. Any division by " +
        "NULL propagates as NULL instead of throwing a division by zero exception.",
      alternativeApproach: "None.",
      performanceNotes:
        "Runs per row. Minimizes runtime errors on dirty database records.",
      concepts: ["NULLIF", "NULL handling", "arithmetic"],
    },
  ],

  9: [
    {
      id: "m9-p1",
      moduleId: 9,
      difficulty: "Easy",

      title: "Count orders per channel",

      businessScenario:
        "The growth team needs to know which channels (App, Web, Marketplace) drive the most orders.",

      prompt:
        "Count the number of orders per channel. Return channel and order_count. Order " +
        "by order_count descending.",

      starterQuery:
        "SELECT\n  channel,\n  COUNT(???) AS order_count\nFROM orders\nGROUP BY " +
        "???\nORDER BY order_count DESC;",

      solution:
        "SELECT\n  channel,\n  COUNT(*) AS order_count\nFROM orders\nGROUP BY " +
        "channel\nORDER BY order_count DESC;",

      hints: [
        "COUNT(*) counts all rows in each group.",

        "GROUP BY channel creates one row per channel.",

        "ORDER BY the alias (works in ORDER BY).",
      ],

      detailedExplanation:
        "This is the simplest GROUP BY pattern. COUNT(*) counts all rows per channel " +
        "group. Note: no WHERE filter here — the question asks for all orders, not just " +
        "delivered ones.",

      alternativeApproach:
        "COUNT(order_id) is equivalent here since order_id is never NULL.",

      performanceNotes:
        "COUNT(*) is the fastest count — no column evaluation needed.",

      concepts: ["COUNT", "GROUP BY", "ORDER BY"],
    },

    {
      id: "m9-p2",
      moduleId: 9,
      difficulty: "Medium",

      title: "Unique cities per region",

      businessScenario:
        "Marketing wants to know how geographically spread out our customers are by " +
        "counting the number of distinct cities in each region.",

      prompt:
        "Count the number of unique cities in each region from the customers table. " +
        "Return region and unique_cities. Order by unique_cities descending.",

      starterQuery:
        "SELECT\n  region,\n  COUNT(DISTINCT ???) AS unique_cities\nFROM " +
        "customers\nGROUP BY ???\nORDER BY unique_cities DESC;",

      solution:
        "SELECT\n  region,\n  COUNT(DISTINCT city) AS unique_cities\nFROM " +
        "customers\nGROUP BY region\nORDER BY unique_cities DESC;",

      hints: [
        "No JOINs are needed — region and city are columns in the customers table.",

        "COUNT(DISTINCT city) counts only unique city names, ignoring duplicate occurrences.",

        "Group by region so that the count is computed separately for each region.",
      ],

      detailedExplanation:
        "COUNT(DISTINCT col) counts the unique values within a group. Grouping by region " +
        "collapses customers into their respective regions and calculates how many " +
        "distinct cities exist in each.",

      alternativeApproach:
        "You could achieve this with subqueries, but COUNT(DISTINCT) with GROUP BY is " +
        "the standard approach.",

      performanceNotes:
        "Distinct counts require sorting/hashing columns to locate unique entries, " +
        "adding slightly more cost than COUNT(*).",

      concepts: ["COUNT DISTINCT", "GROUP BY", "WHERE"],
    },

    {
      id: "m9-p3",
      moduleId: 9,
      difficulty: "Hard",

      title: "Count active customer profiles",

      businessScenario:
        "The product manager wants to count how many unique customer accounts have " +
        "actually placed a successful delivered order.",

      prompt:
        "Write a query to count the number of unique customer_id values in the orders " +
        "table that have a status of 'Delivered'. Alias the count as active_buyers.",

      starterQuery: `SELECT

  COUNT(DISTINCT customer_id) AS active_buyers

FROM orders

WHERE status = 'Delivered';`,

      solution: `SELECT

  COUNT(DISTINCT customer_id) AS active_buyers

FROM orders

WHERE status = 'Delivered';`,

      hints: [
        "Filter for status = 'Delivered' in the WHERE clause.",

        "Use COUNT(DISTINCT customer_id) to count only unique customers.",

        "Do NOT use GROUP BY since we want a single total count.",
      ],

      detailedExplanation:
        "This query combines COUNT with DISTINCT inside it. It filters for delivered " +
        "orders first, and then calculates the number of unique buyers that placed those " +
        "orders.",

      alternativeApproach:
        "Without DISTINCT, COUNT(customer_id) would count all orders (including " +
        "duplicates per customer).",

      performanceNotes:
        "Uses indexes on status and customer_id to quickly group unique keys.",

      concepts: ["COUNT", "DISTINCT", "WHERE"],
    },
  ],

  10: [
    {
      id: "m10-p1",
      moduleId: 10,
      difficulty: "Easy",

      title: "Total revenue per payment mode",

      businessScenario:
        "The finance team at Paytm wants to see total settled revenue by payment mode.",

      prompt:
        "Calculate total payment amount per payment mode. Filter to successful payments " +
        "only. Return payment_mode and total_amount. Order by total_amount descending.",

      starterQuery:
        "SELECT\n  payment_mode,\n  SUM(???) AS total_amount\nFROM payments\nWHERE " +
        "payment_status = ???\nGROUP BY ???\nORDER BY total_amount DESC;",

      solution:
        "SELECT\n  payment_mode,\n  ROUND(SUM(amount), 2) AS total_amount\nFROM " +
        "payments\nWHERE payment_status = 'Success'\nGROUP BY payment_mode\nORDER BY " +
        "total_amount DESC;",

      hints: [
        "SUM(amount) adds up all amounts in each group.",

        "Filter to successful payments before summing.",

        "ROUND(SUM(amount), 2) for clean decimal output.",
      ],

      detailedExplanation:
        "This combines WHERE (filter before aggregating) with SUM + GROUP BY. Always " +
        "filter before aggregating — it's more efficient and more accurate.",

      alternativeApproach:
        "Could use HAVING SUM(amount) > 0 instead of WHERE — but WHERE is faster here " +
        "since it's a non-aggregate condition.",

      performanceNotes:
        "WHERE filters rows before aggregation — much faster than HAVING for non-aggregate conditions.",

      concepts: ["SUM", "GROUP BY", "WHERE", "ROUND"],
    },

    {
      id: "m10-p2",
      moduleId: 10,
      difficulty: "Medium",

      title: "Net revenue vs gross revenue by channel",

      businessScenario:
        "The CFO wants to compare gross vs net revenue per sales channel to understand " +
        "the discount impact of different acquisition channels.",

      prompt:
        "Write a query showing channel, gross_revenue (sum of total_amount), " +
        "total_discount (sum of discount_amount), net_revenue (gross minus discount), and " +
        "discount_rate (discount as % of gross, rounded to 1 decimal). Filter to " +
        "delivered orders. Group by channel. Order by net_revenue descending.",

      starterQuery:
        "SELECT\n  channel,\n  ROUND(SUM(total_amount), 2) AS gross_revenue,\n " +
        "ROUND(SUM(???), 2) AS total_discount,\n  ROUND(SUM(??? - ???), 2) AS " +
        "net_revenue,\n  ROUND(SUM(???) * 1.0 / SUM(???) * 100, 1) AS discount_rate\nFROM " +
        "orders\nWHERE status = 'Delivered'\nGROUP BY channel\nORDER BY net_revenue DESC;",

      solution:
        "SELECT\n  channel,\n  ROUND(SUM(total_amount), 2) AS gross_revenue,\n " +
        "ROUND(SUM(discount_amount), 2) AS total_discount,\n  ROUND(SUM(total_amount - " +
        "discount_amount), 2) AS net_revenue,\n  ROUND(SUM(discount_amount) * 1.0 / " +
        "SUM(total_amount) * 100, 1) AS discount_rate\nFROM orders\nWHERE status = " +
        "'Delivered'\nGROUP BY channel\nORDER BY net_revenue DESC;",

      hints: [
        "No JOINs are needed — all order sales and discounts exist directly in the orders table.",

        "Net revenue = SUM(total_amount - discount_amount).",

        "Discount rate = (SUM(discount_amount) / SUM(total_amount)) * 100.",
      ],

      detailedExplanation:
        "This query aggregates multiple transactional fields per sales channel. We " +
        "calculate both gross and net sums and compute the effective discount percentage " +
        "by dividing sum of discounts by sum of gross totals.",

      alternativeApproach:
        "You could use CAST(SUM(discount_amount) AS REAL) instead of *1.0 to enforce " +
        "decimal division.",

      performanceNotes:
        "Grouping on a single table evaluates rows in a single pass without loading " +
        "relational lookup tables.",

      concepts: ["SUM", "GROUP BY", "computed rates", "WHERE"],
    },

    {
      id: "m10-p3",
      moduleId: 10,
      difficulty: "Hard",

      title: "Financial net value summary in 2024",

      businessScenario:
        "The finance lead wants a high-level summary of total net revenue and total " +
        "discounts applied across all completed purchases in 2024.",

      prompt:
        "Write a query on the orders table. Calculate the total net revenue (SUM of " +
        "total_amount minus discount_amount) as total_net_revenue, and the total " +
        "discounts given (SUM of discount_amount) as total_discounts. Only include " +
        "delivered orders placed in the year 2024.",

      starterQuery: `SELECT

  SUM(total_amount - discount_amount) AS total_net_revenue,

  SUM(discount_amount) AS total_discounts

FROM orders

WHERE status = 'Delivered'

  AND order_date LIKE '2024%';`,

      solution: `SELECT

  SUM(total_amount - discount_amount) AS total_net_revenue,

  SUM(discount_amount) AS total_discounts

FROM orders

WHERE status = 'Delivered'

  AND order_date LIKE '2024%';`,

      hints: [
        "Filter WHERE status = 'Delivered' and order_date starts with '2024'.",

        "Use SUM(total_amount - discount_amount) to calculate net revenue.",

        "Use SUM(discount_amount) to calculate the sum of all discounts.",
      ],

      detailedExplanation:
        "We perform aggregation on the entire table after applying a WHERE filter. SUM " +
        "computes the total of the expression (total_amount - discount_amount) across all " +
        "matched rows.",

      alternativeApproach:
        "None — simple SUM without GROUP BY returns exactly one row representing the global sums.",

      performanceNotes:
        "Highly performant as it aggregates in a single scan of the filtered orders table.",

      concepts: ["SUM", "Operators", "WHERE"],
    },
  ],

  41: [
    {
      id: "m41-p1",
      moduleId: 41,
      difficulty: "Hard",

      title: "2nd Highest Order Value per City",

      businessScenario:
        "The operations team wants to identify the runner-up high-value purchase in each " +
        "city to understand mid-tier customer transactions.",

      prompt:
        "Write a query to find the runner-up (2nd highest) order total_amount for each city to assist the operations team in establishing mid-tier purchasing benchmarks. Return city, full_name (of the customer), and total_amount. Order the final output by city ascending.",

      starterQuery:
        "WITH ranked_orders AS (\n  SELECT\n    c.city,\n    c.full_name,\n   " +
        "o.total_amount,\n    DENSE_RANK() OVER (PARTITION BY c.city ORDER BY " +
        "o.total_amount DESC) as rnk\n  FROM customers c\n  JOIN orders o ON " +
        "c.customer_id = o.customer_id\n)\nSELECT\n  city,\n  full_name,\n " +
        "total_amount\nFROM ranked_orders\nWHERE rnk = 2\nORDER BY city;",

      solution:
        "WITH ranked_orders AS (\n  SELECT\n    c.city,\n    c.full_name,\n   " +
        "o.total_amount,\n    DENSE_RANK() OVER (PARTITION BY c.city ORDER BY " +
        "o.total_amount DESC) as rnk\n  FROM customers c\n  JOIN orders o ON " +
        "c.customer_id = o.customer_id\n)\nSELECT city, full_name, total_amount\nFROM " +
        "ranked_orders\nWHERE rnk = 2\nORDER BY city;",

      hints: [
        "Use DENSE_RANK() OVER (PARTITION BY city ORDER BY total_amount DESC) inside a CTE.",

        "Filter for rnk = 2 in the outer query.",

        "Ensure you JOIN customers and orders tables on customer_id.",
      ],

      detailedExplanation:
        "This query finds the runner-up highest purchase per city. DENSE_RANK() is " +
        "useful here because if multiple orders tie for first place, the next distinct " +
        "price still gets rank 2.",

      alternativeApproach:
        "Could use ROW_NUMBER() instead of DENSE_RANK() if ties don't need to be grouped together.",

      performanceNotes:
        "Partitioning and ranking require sorting city partitions. An index on " +
        "orders(customer_id) is beneficial.",

      concepts: ["DENSE_RANK", "PARTITION BY", "CTE", "JOIN"],
    },

    {
      id: "m41-p2",
      moduleId: 41,
      difficulty: "Hard",

      title: "Month-over-Month Revenue Growth Rate",

      businessScenario:
        "The finance team needs to track monthly business scaling by monitoring the " +
        "month-over-month revenue growth rate.",

      prompt:
        "Finance needs a revenue velocity report tracking month-over-month percentage scaling for delivered orders. For each month (YYYY-MM format), compute net revenue (total_amount minus discount_amount), previous month net revenue, and mom_growth_pct rounded to 2 decimal places. Order output by month ascending.",

      starterQuery:
        "WITH monthly_revenue AS (\n  SELECT\n    SUBSTR(order_date, 1, 7) AS month,\n  " +
        " SUM(total_amount - discount_amount) AS current_month_revenue\n  FROM orders\n " +
        "WHERE status = 'Delivered'\n  GROUP BY 1\n),\nlagged_revenue AS (\n  SELECT\n   " +
        "month,\n    current_month_revenue,\n    LAG(current_month_revenue, 1) OVER " +
        "(ORDER BY month) AS previous_month_revenue\n  FROM monthly_revenue\n)\nSELECT\n " +
        "month,\n  ROUND(current_month_revenue, 2) AS current_month_revenue,\n " +
        "ROUND(previous_month_revenue, 2) AS previous_month_revenue,\n " +
        "ROUND((current_month_revenue - previous_month_revenue) / previous_month_revenue " +
        "* 100.0, 2) AS mom_growth_pct\nFROM lagged_revenue\nORDER BY month;",

      solution:
        "WITH monthly_revenue AS (\n  SELECT\n    SUBSTR(order_date, 1, 7) AS month,\n  " +
        " SUM(total_amount - discount_amount) AS current_month_revenue\n  FROM orders\n " +
        "WHERE status = 'Delivered'\n  GROUP BY 1\n),\nlagged_revenue AS (\n  SELECT\n   " +
        "month,\n    current_month_revenue,\n    LAG(current_month_revenue, 1) OVER " +
        "(ORDER BY month) AS previous_month_revenue\n  FROM monthly_revenue\n)\nSELECT\n " +
        "month,\n  ROUND(current_month_revenue, 2) AS current_month_revenue,\n " +
        "ROUND(previous_month_revenue, 2) AS previous_month_revenue,\n " +
        "ROUND((current_month_revenue - previous_month_revenue) / previous_month_revenue " +
        "* 100.0, 2) AS mom_growth_pct\nFROM lagged_revenue\nORDER BY month;",

      hints: [
        "First calculate total net revenue per month using SUM(total_amount - discount_amount).",

        "Use LAG(current_month_revenue, 1) OVER (ORDER BY month) to fetch the previous month's revenue.",

        "Calculate the percentage difference: (curr - prev) / prev * 100.0.",
      ],

      detailedExplanation:
        "This query calculates month-over-month revenue growth. It leverages LAG to look " +
        "back at the previous row's revenue inside a CTE.",

      alternativeApproach:
        "Could do a self-join of the monthly aggregate CTE on month differences, but LAG " +
        "is cleaner and faster.",

      performanceNotes:
        "The aggregation is quick. The window function runs on the aggregated 12-row " +
        "monthly dataset, which is tiny and fast.",

      concepts: ["LAG", "OVER", "CTE", "arithmetic"],
    },

    {
      id: "m41-p3",
      moduleId: 41,
      difficulty: "Hard",

      title: "Customers with Consecutive Daily Orders",

      businessScenario:
        "The growth team wants to identify highly engaged customers who made purchases " +
        "on at least 2 consecutive days.",

      prompt:
        "Growth analytics needs to detect power users with daily purchasing velocity. Find customers who placed orders on at least 2 consecutive days, returning customer_id, full_name, start_date (first day of streak), and consecutive_days. Order results by consecutive_days descending, then customer_id.",

      starterQuery:
        "WITH distinct_dates AS (\n  SELECT DISTINCT customer_id, SUBSTR(order_date, 1, " +
        "10) as o_date\n  FROM orders\n),\nislands AS (\n  SELECT\n    customer_id,\n   " +
        "o_date,\n    TO_DAYS(o_date) - DENSE_RANK() OVER (PARTITION BY customer_id " +
        "ORDER BY o_date) as group_id\n  FROM distinct_dates\n),\nconsecutive_counts AS " +
        "(\n  SELECT\n    customer_id,\n    MIN(o_date) as start_date,\n    COUNT(*) as " +
        "consecutive_days\n  FROM islands\n  GROUP BY customer_id, group_id\n)\nSELECT " +
        "c.customer_id, c.full_name, cc.start_date, cc.consecutive_days\nFROM " +
        "consecutive_counts cc\nJOIN customers c ON cc.customer_id = c.customer_id\nWHERE " +
        "cc.consecutive_days >= 2\nORDER BY cc.consecutive_days DESC, c.customer_id;",

      solution:
        "WITH distinct_dates AS (\n  SELECT DISTINCT customer_id, SUBSTR(order_date, 1, " +
        "10) as o_date\n  FROM orders\n),\nislands AS (\n  SELECT\n    customer_id,\n   " +
        "o_date,\n    TO_DAYS(o_date) - DENSE_RANK() OVER (PARTITION BY customer_id " +
        "ORDER BY o_date) as group_id\n  FROM distinct_dates\n),\nconsecutive_counts AS " +
        "(\n  SELECT\n    customer_id,\n    MIN(o_date) as start_date,\n    COUNT(*) as " +
        "consecutive_days\n  FROM islands\n  GROUP BY customer_id, group_id\n)\nSELECT " +
        "c.customer_id, c.full_name, cc.start_date, cc.consecutive_days\nFROM " +
        "consecutive_counts cc\nJOIN customers c ON cc.customer_id = c.customer_id\nWHERE " +
        "cc.consecutive_days >= 2\nORDER BY cc.consecutive_days DESC, c.customer_id;",

      hints: [
        "The subtraction of DENSE_RANK() from TO_DAYS(o_date) creates a constant value " +
          "(group_id) for consecutive date runs.",

        "Aggregate by customer_id and group_id to count consecutive days.",

        "Filter for streaks WHERE consecutive_days >= 2.",
      ],

      detailedExplanation:
        "This is the classic Gaps & Islands pattern. By subtracting DENSE_RANK from the " +
        "sequence of dates, consecutive days will decrement at the same rate, resulting " +
        "in a constant group identifier.",

      alternativeApproach:
        "Can be solved using self-joins or LAG/LEAD with date comparisons, but " +
        "group-state identifiers scale better.",

      performanceNotes: "Uses DENSE_RANK on distinct customer order dates.",

      concepts: ["Gaps and Islands", "DENSE_RANK", "TO_DAYS", "date math"],
    },

    {
      id: "m41-p4",
      moduleId: 41,
      difficulty: "Hard",

      title: "Two-Month Customer Cohort Retention",

      businessScenario:
        "Inspect product stickiness by tracking what percentage of monthly signup " +
        "cohorts return to make purchases in the subsequent two months.",

      prompt:
        "Measure product stickiness across customer signup cohorts. For each signup cohort_month, calculate cohort_size, the percentage of users ordering in month 1 post-signup (retention_month_1), and percentage ordering in month 2 (retention_month_2). Order output by cohort_month.",

      starterQuery:
        "WITH cohort_sizes AS (\n  SELECT SUBSTR(signup_date, 1, 7) as cohort_month, " +
        "COUNT(*) as cohort_size\n  FROM customers\n  GROUP BY 1\n),\norder_diffs AS (\n " +
        "SELECT\n    c.customer_id,\n    SUBSTR(c.signup_date, 1, 7) as cohort_month,\n  " +
        " o.order_date,\n    TIMESTAMPDIFF(MONTH, c.signup_date, o.order_date) AS months_diff\n  FROM customers c\n  JOIN orders o ON " +
        "c.customer_id = o.customer_id\n)\nSELECT\n  cs.cohort_month,\n " +
        "cs.cohort_size,\n  ROUND(COUNT(DISTINCT CASE WHEN od.months_diff = 1 THEN " +
        "od.customer_id END) * 100.0 / cs.cohort_size, 2) as retention_month_1,\n " +
        "ROUND(COUNT(DISTINCT CASE WHEN od.months_diff = 2 THEN od.customer_id END) * " +
        "100.0 / cs.cohort_size, 2) as retention_month_2\nFROM cohort_sizes cs\nLEFT JOIN " +
        "order_diffs od ON cs.cohort_month = od.cohort_month\nGROUP BY cs.cohort_month, " +
        "cs.cohort_size\nORDER BY cs.cohort_month;",

      solution:
        "WITH cohort_sizes AS (\n  SELECT SUBSTR(signup_date, 1, 7) as cohort_month, " +
        "COUNT(*) as cohort_size\n  FROM customers\n  GROUP BY 1\n),\norder_diffs AS (\n " +
        "SELECT\n    c.customer_id,\n    SUBSTR(c.signup_date, 1, 7) as cohort_month,\n  " +
        " o.order_date,\n    TIMESTAMPDIFF(MONTH, c.signup_date, o.order_date) AS months_diff\n  FROM customers c\n  JOIN orders o ON " +
        "c.customer_id = o.customer_id\n)\nSELECT\n  cs.cohort_month,\n " +
        "cs.cohort_size,\n  ROUND(COUNT(DISTINCT CASE WHEN od.months_diff = 1 THEN " +
        "od.customer_id END) * 100.0 / cs.cohort_size, 2) as retention_month_1,\n " +
        "ROUND(COUNT(DISTINCT CASE WHEN od.months_diff = 2 THEN od.customer_id END) * " +
        "100.0 / cs.cohort_size, 2) as retention_month_2\nFROM cohort_sizes cs\nLEFT JOIN " +
        "order_diffs od ON cs.cohort_month = od.cohort_month\nGROUP BY cs.cohort_month, " +
        "cs.cohort_size\nORDER BY cs.cohort_month;",

      hints: [
        "First build a cohort_sizes CTE to get the count of signups per cohort_month.",

        "Calculate months_diff with MySQL TIMESTAMPDIFF(MONTH, signup_date, order_date).",

        "Use conditional DISTINCT customer counts to calculate retention rates.",
      ],

      detailedExplanation:
        "Cohort retention analysis measures buyer stickiness over time. We establish a " +
        "signup cohort sizing baseline and track active customers in subsequent months.",

      alternativeApproach:
        "TIMESTAMPDIFF(MONTH, start_date, end_date) is clearer than manually subtracting year and month parts.",

      performanceNotes:
        "Performs left joins to ensure cohorts with 0 retention are still returned in the output.",

      concepts: [
        "cohort analysis",
        "conditional aggregation",
        "LEFT JOIN",
        "date math",
      ],
    },

    {
      id: "m41-p5",
      moduleId: 41,
      difficulty: "Hard",

      title: "Order to Payment Funnel Conversion",

      businessScenario:
        "Audit checkout flow friction by tracking the drop-off rates from order " +
        "placement to payment success and refund states.",

      prompt:
        "Audit checkout drop-off rates across payment states. Return total_orders, payment_success_rate_pct (percentage of orders with payment_status 'Success'), and refund_rate_pct (percentage of successful payments with status 'Refunded').",

      starterQuery:
        "SELECT\n  COUNT(o.order_id) AS total_orders,\n  ROUND(COUNT(CASE WHEN " +
        "p.payment_status = 'Success' THEN 1 END) * 100.0 / COUNT(o.order_id), 2) AS " +
        "payment_success_rate_pct,\n  ROUND(COUNT(CASE WHEN p.payment_status = 'Refunded' " +
        "THEN 1 END) * 100.0 / NULLIF(COUNT(CASE WHEN p.payment_status = 'Success' OR " +
        "p.payment_status = 'Refunded' THEN 1 END), 0), 2) AS refund_rate_pct\nFROM " +
        "orders o\nLEFT JOIN payments p ON o.order_id = p.order_id;",

      solution:
        "SELECT\n  COUNT(o.order_id) AS total_orders,\n  ROUND(COUNT(CASE WHEN " +
        "p.payment_status = 'Success' THEN 1 END) * 100.0 / COUNT(o.order_id), 2) AS " +
        "payment_success_rate_pct,\n  ROUND(COUNT(CASE WHEN p.payment_status = 'Refunded' " +
        "THEN 1 END) * 100.0 / NULLIF(COUNT(CASE WHEN p.payment_status = 'Success' OR " +
        "p.payment_status = 'Refunded' THEN 1 END), 0), 2) AS refund_rate_pct\nFROM " +
        "orders o\nLEFT JOIN payments p ON o.order_id = p.order_id;",

      hints: [
        "Join orders and payments on order_id.",

        "Use CASE WHEN with payment_status values to count successes and refunds.",

        "Use NULLIF to handle divisions by zero safely.",
      ],

      detailedExplanation:
        "Funnel queries map drop-off points in user activation flows. The NULLIF " +
        "function ensures that if a step has zero entries, the math fails safely to null " +
        "rather than division by zero errors.",

      alternativeApproach:
        "Can also write using separate CTEs for each funnel step, but conditional " +
        "aggregates are more performant.",

      performanceNotes: "Runs in a single scan of matched order-payment rows.",

      concepts: ["funnel analysis", "CASE WHEN", "conditional count", "NULLIF"],
    },

    {
      id: "m41-p6",
      moduleId: 41,
      difficulty: "Hard",

      title: "Deduplicate customer contacts",

      businessScenario:
        "The CRM platform database occasionally creates duplicate records. We need to " +
        "identify duplicates and keep only the earliest record.",

      prompt:
        "Clean up duplicate customer CRM profiles. Delete duplicate records sharing the same full_name and city combinations, preserving only the earliest record (lowest customer_id).",

      starterQuery:
        "DELETE FROM customers\nWHERE customer_id NOT IN (\n  SELECT MIN(customer_id)\n " +
        "FROM customers\n  GROUP BY full_name, city\n);",

      solution:
        "DELETE FROM customers\nWHERE customer_id NOT IN (\n  SELECT MIN(customer_id)\n " +
        "FROM customers\n  GROUP BY full_name, city\n);",

      hints: [
        "Group by full_name and city to find duplicate groups.",

        "Find the MIN(customer_id) for each group.",

        "Delete all rows whose customer_id is NOT in that list.",
      ],

      detailedExplanation:
        "This query deduplicates contacts. It groups by duplicate identifier columns, " +
        "extracts the original key (MIN), and purges the rest.",

      alternativeApproach:
        "Could join the table to a duplicate-finding subquery, but NOT IN is direct and readable.",

      performanceNotes:
        "DML operations mutate the table. The grader compares the resulting snapshots.",

      concepts: ["deduplication", "DELETE", "subquery", "GROUP BY"],
    },

    {
      id: "m41-p7",
      moduleId: 41,
      difficulty: "Hard",

      title: "Median order amount calculation",

      businessScenario:
        "Averages are skewed by high-value outliers. The marketing team requires the " +
        "median order total_amount to design discounts.",

      prompt:
        "Compute the unskewed median order total_amount to establish spending baselines for marketing promotions. Output a single column median_amount rounded to 2 decimal places.",

      starterQuery:
        "WITH ranked_orders AS (\n  SELECT\n    total_amount,\n    ROW_NUMBER() OVER " +
        "(ORDER BY total_amount) AS row_num,\n    COUNT(*) OVER () AS total_count\n  FROM " +
        "orders\n)\nSELECT\n  ROUND(AVG(total_amount), 2) AS median_amount\nFROM " +
        "ranked_orders\nWHERE row_num IN (total_count / 2 + 1, (total_count + 1) / 2);",

      solution:
        "WITH ranked_orders AS (\n  SELECT\n    total_amount,\n    ROW_NUMBER() OVER " +
        "(ORDER BY total_amount) AS row_num,\n    COUNT(*) OVER () AS total_count\n  FROM " +
        "orders\n)\nSELECT\n  ROUND(AVG(total_amount), 2) AS median_amount\nFROM " +
        "ranked_orders\nWHERE row_num IN (total_count / 2 + 1, (total_count + 1) / 2);",

      hints: [
        "Sort order_amount ascending using ROW_NUMBER().",

        "Use COUNT(*) OVER () to get the total rows.",

        "Select and average the middle row indices using integer division rules.",
      ],

      detailedExplanation:
        "Median calculations require sorting values and picking the middle index. By " +
        "averaging the two middle indices for even counts and targeting the single middle " +
        "index for odd counts, we compute a mathematically correct median.",

      alternativeApproach:
        "Can be solved with subquery offsets or percentile functions depending on engine support.",

      performanceNotes:
        "Sorts the orders table by total_amount. An index on orders(total_amount) would " +
        "bypass this sort.",

      concepts: ["median", "ROW_NUMBER", "window function", "COUNT OVER"],
    },

    {
      id: "m41-p8",
      moduleId: 41,
      difficulty: "Hard",

      title: "Payment Reconciliation Discrepancy check",

      businessScenario:
        "The financial operations team wants to run a referential integrity audit to " +
        "identify orphaned records between orders and payments.",

      prompt:
        "Execute a financial integrity audit identifying orphaned records between orders and payments. Return source_mismatch ('Order Without Payment' or 'Payment Without Order'), order_id, and amount_discrepancy (total_amount from orders or amount from payments). Order by source_mismatch, then order_id.",

      starterQuery:
        "WITH unmatched_orders AS (\n  SELECT\n    'Order Without Payment' AS " +
        "source_mismatch,\n    o.order_id,\n    o.total_amount AS amount_discrepancy\n " +
        "FROM orders o\n  LEFT JOIN payments p ON o.order_id = p.order_id\n  WHERE " +
        "p.order_id IS NULL\n),\nunmatched_payments AS (\n  SELECT\n    'Payment Without " +
        "Order' AS source_mismatch,\n    p.order_id,\n    p.amount AS " +
        "amount_discrepancy\n  FROM payments p\n  LEFT JOIN orders o ON p.order_id = " +
        "o.order_id\n  WHERE o.order_id IS NULL\n)\nSELECT source_mismatch, order_id, " +
        "amount_discrepancy\nFROM unmatched_orders\nUNION ALL\nSELECT source_mismatch, " +
        "order_id, amount_discrepancy\nFROM unmatched_payments\nORDER BY source_mismatch, " +
        "order_id;",

      solution:
        "WITH unmatched_orders AS (\n  SELECT\n    'Order Without Payment' AS " +
        "source_mismatch,\n    o.order_id,\n    o.total_amount AS amount_discrepancy\n " +
        "FROM orders o\n  LEFT JOIN payments p ON o.order_id = p.order_id\n  WHERE " +
        "p.order_id IS NULL\n),\nunmatched_payments AS (\n  SELECT\n    'Payment Without " +
        "Order' AS source_mismatch,\n    p.order_id,\n    p.amount AS " +
        "amount_discrepancy\n  FROM payments p\n  LEFT JOIN orders o ON p.order_id = " +
        "o.order_id\n  WHERE o.order_id IS NULL\n)\nSELECT source_mismatch, order_id, " +
        "amount_discrepancy\nFROM unmatched_orders\nUNION ALL\nSELECT source_mismatch, " +
        "order_id, amount_discrepancy\nFROM unmatched_payments\nORDER BY source_mismatch, " +
        "order_id;",

      hints: [
        "Build a LEFT JOIN orders with payments to find missing payments.",

        "Build a LEFT JOIN payments with orders to find missing orders.",

        "Combine results using UNION ALL and ORDER BY source_mismatch, order_id.",
      ],

      detailedExplanation:
        "Referential integrity audits verify database relationships. This query " +
        "identifies orphans on both sides of a relationship key using outer joins and " +
        "union combinations.",

      alternativeApproach:
        "Could perform a FULL OUTER JOIN if natively supported, filtering where either " +
        "side's join key is null.",

      performanceNotes: "Uses left joins and filters. Fast on small tables.",

      concepts: ["data quality", "LEFT JOIN", "UNION ALL", "IS NULL"],
    },
    {
      id: "m41-p9",
      moduleId: 41,
      difficulty: "Medium",
      title: "Extract JSON device info",
      businessScenario:
        "The mobile product team wants to segment customers by their device type " +
        "recorded in the metadata JSON column to analyze app adoption.",
      prompt:
        "Extract device types stored in customer metadata JSON strings for mobile adoption analysis. Return customer_id, full_name, and device_type. Sort by customer_id.",
      starterQuery:
        "SELECT customer_id, full_name, json_extract(metadata, '$.device') AS " +
        "device_type FROM customers ORDER BY customer_id;",
      solution:
        "SELECT customer_id, full_name, json_extract(metadata, '$.device') AS " +
        "device_type FROM customers ORDER BY customer_id;",
      hints: [
        "Identify target tables and primary columns for Extract JSON device info.",
        "Filter rows using appropriate WHERE or JOIN clauses as required by the business prompt.",
        "Format target result columns and apply sorting as specified.",
      ],
      detailedExplanation:
        "In MySQL and modern SQL engines (like Postgres/BigQuery), JSON data can be " +
        "queried inline using extraction paths like $.device. This avoids needing " +
        "separate columns for sparse attributes.",
      alternativeApproach: "None.",
      performanceNotes:
        "Runs per row. Indexes on JSON keys are not supported natively in MySQL unless " +
        "generated columns are used, so a full table scan is performed.",
      concepts: ["JSON", "json_extract", "string functions"],
      companyTags: ["Myntra"],
    },
  ],

  ...problemsIntermediate,
  42: [
    {
      id: "m42-p1",
      moduleId: 42,
      difficulty: "Medium",
      title: "Persist High-Value Customer Summaries (CTAS)",
      businessScenario:
        "The CRM team wants a fast, pre-aggregated database table containing total spending of high-value customers (spending more than 5000) so they can query it instantly without running expensive joins.",
      prompt:
        "Write a query using CREATE TABLE AS SELECT to create a permanent table named 'high_value_customers'. The table should contain customer_id, full_name, and total_spend (the sum of total_amount from orders). Join customers and orders on customer_id, group by customer_id and full_name, and filter for total spend greater than 5000.",
      starterQuery:
        "CREATE TABLE high_value_customers AS\nSELECT\n  c.customer_id,\n  c.full_name,\n  SUM(o.total_amount) AS total_spend\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nGROUP BY c.customer_id, c.full_name\nHAVING SUM(o.total_amount) > 5000;",
      solution:
        "CREATE TABLE high_value_customers AS\nSELECT c.customer_id, c.full_name, SUM(o.total_amount) AS total_spend\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nGROUP BY c.customer_id, c.full_name\nHAVING SUM(o.total_amount) > 5000;",
      hints: [
        "Use CREATE TABLE table_name AS SELECT ... syntax.",
        "Join customers and orders on customer_id, GROUP BY customer_id and full_name.",
        "Use HAVING to filter aggregated total_spend > 5000.",
      ],
      detailedExplanation:
        "The CREATE TABLE AS SELECT (CTAS) statement is used to create a new database table and populate it with the query results.",
      alternativeApproach:
        "You could run a separate CREATE TABLE statement followed by an INSERT INTO SELECT statement.",
      performanceNotes: "CTAS writes data physically to disk.",
      concepts: ["CTAS", "DDL", "data staging", "aggregation"],
    },
    {
      id: "m42-p2",
      moduleId: 42,
      difficulty: "Easy",
      title: "Stage Product Category Price Ranges",
      businessScenario:
        "Create a reference table containing category price statistics.",
      prompt:
        "Write a query using CREATE TABLE AS SELECT to create a permanent table named 'category_prices'. The table should contain category, min_price (the minimum list_price of products), and max_price (the maximum list_price of products) grouped by category.",
      starterQuery:
        "CREATE TABLE category_prices AS\nSELECT category, MIN(list_price) AS min_price, MAX(list_price) AS max_price\nFROM products\nGROUP BY category;",
      solution:
        "CREATE TABLE category_prices AS SELECT category, MIN(list_price) AS min_price, MAX(list_price) AS max_price FROM products GROUP BY category;",
      hints: [
        "Use CREATE TABLE table_name AS SELECT.",
        "GROUP BY category.",
        "Select MIN(list_price) and MAX(list_price).",
      ],
      detailedExplanation: "CTAS can be used to stage aggregated lookups.",
      alternativeApproach: "None.",
      performanceNotes: "Runs aggregation and creates table in one pass.",
      concepts: ["CTAS", "DDL", "GROUP BY", "aggregation"],
    },
    {
      id: "m42-p3",
      moduleId: 42,
      difficulty: "Hard",
      title: "Active Customer Signups by Region",
      businessScenario: "CRM wants to stage customer distribution data.",
      prompt:
        "Write a query using CREATE TABLE AS SELECT to create a permanent table named 'regional_signup_summary'. The table should contain region, city, and active_customer_count (count of customers). Join customers and subscriptions on customer_id, filter for status = 'Active', group by region and city, and order by region, active_customer_count descending.",
      starterQuery:
        "CREATE TABLE regional_signup_summary AS\nSELECT c.region, c.city, COUNT(DISTINCT c.customer_id) AS active_customer_count\nFROM customers c\nINNER JOIN subscriptions s ON c.customer_id = s.customer_id\nWHERE s.status = 'Active'\nGROUP BY c.region, c.city\nORDER BY c.region, active_customer_count DESC;",
      solution:
        "CREATE TABLE regional_signup_summary AS SELECT c.region, c.city, COUNT(DISTINCT c.customer_id) AS active_customer_count FROM customers c INNER JOIN subscriptions s ON c.customer_id = s.customer_id WHERE s.status = 'Active' GROUP BY c.region, c.city ORDER BY c.region, active_customer_count DESC;",
      hints: [
        "Join customers and subscriptions.",
        "Filter status = 'Active'.",
        "Order by region and active_customer_count DESC.",
      ],
      detailedExplanation: "CTAS creates regional data snapshots.",
      alternativeApproach: "None.",
      performanceNotes:
        "Requires sorting for ORDER BY inside the CTAS statement.",
      concepts: ["CTAS", "DDL", "INNER JOIN", "GROUP BY"],
    },
  ],
  43: [
    {
      id: "m43-p1",
      moduleId: 43,
      difficulty: "Medium",
      title: "Active Subscriptions Staging Table",
      businessScenario:
        "To run a complex multi-step subscription dashboard audit, we need to temporarily stage all active subscription records.",
      prompt:
        "Write a script to: (1) Create a temporary table named 'temp_active_subs' containing subscription_id, customer_id, and monthly_fee from subscriptions where status is 'Active'. (2) Write a SELECT query to retrieve all rows from 'temp_active_subs' ordered by monthly_fee descending.",
      starterQuery:
        "CREATE TEMPORARY TABLE temp_active_subs AS\nSELECT\n  subscription_id,\n  customer_id,\n  monthly_fee\nFROM subscriptions\nWHERE status = 'Active';\n\nSELECT *\nFROM temp_active_subs\nORDER BY monthly_fee DESC;",
      solution:
        "CREATE TEMPORARY TABLE temp_active_subs AS\nSELECT subscription_id, customer_id, monthly_fee\nFROM subscriptions\nWHERE status = 'Active';\n\nSELECT * FROM temp_active_subs ORDER BY monthly_fee DESC;",
      hints: [
        "Use CREATE TEMPORARY TABLE temp_active_subs AS SELECT ... syntax.",
        "Select subscription_id, customer_id, and monthly_fee WHERE status = 'Active'.",
        "Write a separate SELECT * FROM temp_active_subs ORDER BY monthly_fee DESC; query.",
      ],
      detailedExplanation:
        "Temporary tables are private to the current connection and automatically deleted when the session ends.",
      alternativeApproach: "You could use a CTE.",
      performanceNotes: "MySQL stores temporary tables in a separate database.",
      concepts: ["temporary tables", "session data", "data staging", "DML"],
    },
    {
      id: "m43-p2",
      moduleId: 43,
      difficulty: "Easy",
      title: "Filter Low Inventory Products",
      businessScenario: "Inventory staging table.",
      prompt:
        "Write a script to: (1) Create a temporary table named 'temp_high_cost_products' containing product_id, product_name, and cost_price from products where cost_price > 500. (2) Select all rows from 'temp_high_cost_products' ordered by cost_price descending.",
      starterQuery:
        "CREATE TEMPORARY TABLE temp_high_cost_products AS\nSELECT product_id, product_name, cost_price\nFROM products\nWHERE cost_price > 500;\n\nSELECT * FROM temp_high_cost_products ORDER BY cost_price DESC;",
      solution:
        "CREATE TEMPORARY TABLE temp_high_cost_products AS SELECT product_id, product_name, cost_price FROM products WHERE cost_price > 500;\nSELECT * FROM temp_high_cost_products ORDER BY cost_price DESC;",
      hints: [
        "Create temporary table for cost_price > 500.",
        "Select all rows ordered by cost_price DESC.",
        "Structure your query using clauses similar to: CREATE TEMPORARY TABLE temp_high_cost_products AS SELECT product_id, product_name, cost_price FROM products WHERE cost_price > 500;\nSELECT * FROM temp_high_cost_products ORDER BY cost_price DESC;.",
      ],
      detailedExplanation: "Creates a session-specific lookup staging table.",
      alternativeApproach: "None.",
      performanceNotes: "Runs simple scan filter.",
      concepts: ["temporary tables", "DML", "WHERE"],
    },
    {
      id: "m43-p3",
      moduleId: 43,
      difficulty: "Hard",
      title: "Active Premium Subscriptions Staging",
      businessScenario: "Target cohort staging.",
      prompt:
        "Write a script to: (1) Create a temporary table named 'temp_premium_cohort' containing customer_id and monthly_fee from subscriptions where monthly_fee > 1000 and status = 'Active'. (2) Write a SELECT query to join 'temp_premium_cohort' with customers on customer_id and return customer_id, full_name, and monthly_fee ordered by monthly_fee descending.",
      starterQuery:
        "CREATE TEMPORARY TABLE temp_premium_cohort AS\nSELECT customer_id, monthly_fee\nFROM subscriptions\nWHERE monthly_fee > 1000 AND status = 'Active';\n\nSELECT t.customer_id, c.full_name, t.monthly_fee\nFROM temp_premium_cohort t\nINNER JOIN customers c ON t.customer_id = c.customer_id\nORDER BY t.monthly_fee DESC;",
      solution:
        "CREATE TEMPORARY TABLE temp_premium_cohort AS SELECT customer_id, monthly_fee FROM subscriptions WHERE monthly_fee > 1000 AND status = 'Active';\nSELECT t.customer_id, c.full_name, t.monthly_fee FROM temp_premium_cohort t INNER JOIN customers c ON t.customer_id = c.customer_id ORDER BY t.monthly_fee DESC;",
      hints: [
        "Create temporary table for monthly_fee > 1000 and active status.",
        "Join temp_premium_cohort with customers.",
        "Structure your query using clauses similar to: CREATE TEMPORARY TABLE temp_premium_cohort AS SELECT customer_id, monthly_fee FROM subscriptions WHERE monthly_fee > 1000 AND status =.",
      ],
      detailedExplanation:
        "Integrates temporary table data with primary schema relations.",
      alternativeApproach: "None.",
      performanceNotes: "Speeds up sub-query joins.",
      concepts: ["temporary tables", "DML", "INNER JOIN"],
    },
  ],
  ...problemsAdvanced,
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
    title: "Table Creation From Queries",
    focus: "CTAS syntax & tables",
    modules: [42],
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
      maxModuleId: 36,
    },
  },
  {
    day: 32,
    title: "Staging Data with Temp Tables",
    focus: "Temporary tables & query flow",
    modules: [43],
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
