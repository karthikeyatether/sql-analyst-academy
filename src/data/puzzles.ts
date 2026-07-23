import type { Difficulty } from "./curriculum";

export type SqlPuzzle = {
  id: string;
  dayId: number;
  title: string;
  difficulty: Difficulty;
  category: "Aggregation" | "JOINs & Subqueries" | "Window Functions" | "Syntax & Logic";
  businessScenario: string;
  flawedQuery: string;
  solutionQuery: string;
  mistakeExplanation: string;
  hint: string;
};

export const debugPuzzles: SqlPuzzle[] = [
  
  // CATEGORY 1: Aggregation (10 Puzzles)
  
  {
    id: "pz-1",
    dayId: 10,
    title: "The WHERE vs HAVING Trap",
    difficulty: "Easy",
    category: "Aggregation",
    businessScenario: "Find all customers who have placed more than 2 orders. The junior analyst wrote this query, but it crashes.",
    flawedQuery: `-- Fix the error so this query runs!
SELECT customer_id, COUNT(order_id) as total_orders
FROM orders
WHERE COUNT(order_id) > 2
GROUP BY customer_id;`,
    solutionQuery: `SELECT customer_id, COUNT(order_id) as total_orders
FROM orders
GROUP BY customer_id
HAVING COUNT(order_id) > 2;`,
    hint: "WHERE filters rows BEFORE grouping. Where do you put conditions for aggregated values?",
    mistakeExplanation: "You cannot use aggregate functions like COUNT() in a WHERE clause. WHERE filters individual rows before they are grouped. To filter groups based on an aggregate, you must use the HAVING clause AFTER the GROUP BY."
  },
  {
    id: "pz-2",
    dayId: 8,
    title: "The COUNT Confusion",
    difficulty: "Easy",
    category: "Aggregation",
    businessScenario: "Count how many discount coupons were actually applied (where discount_amount is not null). Right now, the count returns the total order count.",
    flawedQuery: `-- This counts all orders instead of just discounted ones!
SELECT COUNT(*) as discounts_applied
FROM orders;`,
    solutionQuery: `SELECT COUNT(discount_amount) as discounts_applied
FROM orders;`,
    hint: "COUNT(*) counts every row. How do you count only non-null values in a specific column?",
    mistakeExplanation: "COUNT(*) counts every row in the dataset. To count only the rows where a specific column contains a non-NULL value, pass that column name to the COUNT function (e.g. COUNT(discount_amount))."
  },
  {
    id: "pz-3",
    dayId: 2,
    title: "The GROUP BY Ghost",
    difficulty: "Easy",
    category: "Aggregation",
    businessScenario: "We want to see the total revenue for each customer segment. But the database is throwing an error about unaggregated columns.",
    flawedQuery: `-- Why won't this query run?
SELECT segment, city, SUM(total_amount)
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
GROUP BY segment;`,
    solutionQuery: `SELECT segment, city, SUM(total_amount)
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
GROUP BY segment, city;`,
    hint: "Look at your SELECT list. You selected 'segment' and 'city'. Now look at your GROUP BY.",
    mistakeExplanation: "Every non-aggregated column in your SELECT clause MUST be included in your GROUP BY clause. Since you selected 'city' but didn't group by it, the database doesn't know which city to display for the segment."
  },
  {
    id: "pz-4",
    dayId: 8,
    title: "The Double Aggregation Disaster",
    difficulty: "Medium",
    category: "Aggregation",
    businessScenario: "We need the maximum average cart value across all customers. The query crashes with a nested aggregate error.",
    flawedQuery: `-- SQL does not allow nested aggregate functions directly
SELECT MAX(AVG(total_amount)) as max_average_order
FROM orders
GROUP BY customer_id;`,
    solutionQuery: `SELECT MAX(avg_amount) as max_average_order
FROM (
  SELECT AVG(total_amount) as avg_amount
  FROM orders
  GROUP BY customer_id
) sub;`,
    hint: "You cannot nest MAX(AVG(...)) directly. Try running the inner query as a subquery.",
    mistakeExplanation: "SQL does not support nested aggregate functions (like MAX(AVG(...))) directly. You must compute the average per customer in a subquery first, and then apply the MAX aggregate function in the outer query."
  },
  {
    id: "pz-5",
    dayId: 8,
    title: "The Unique Customers Illusion",
    difficulty: "Easy",
    category: "Aggregation",
    businessScenario: "Find how many unique customers placed orders on each date. Right now, it returns the total order count for each date instead.",
    flawedQuery: `-- This shows total order counts, not unique customer counts
SELECT order_date, COUNT(customer_id) as active_customers
FROM orders
GROUP BY order_date;`,
    solutionQuery: `SELECT order_date, COUNT(DISTINCT customer_id) as active_customers
FROM orders
GROUP BY order_date;`,
    hint: "If a customer places multiple orders on the same day, how do you prevent them from being counted twice?",
    mistakeExplanation: "COUNT(customer_id) counts every customer ID occurrence, including duplicates. To find unique customers, you must add the DISTINCT keyword inside the count function: COUNT(DISTINCT customer_id)."
  },
  {
    id: "pz-6",
    dayId: 9,
    title: "The Sum of Nulls Hazard",
    difficulty: "Medium",
    category: "Aggregation",
    businessScenario: "We want to sum salaries per department, but departments with no employees should show 0 instead of NULL.",
    flawedQuery: `-- We want 0 instead of NULL for empty departments
SELECT d.department_name, SUM(e.salary_lpa) as total_salaries
FROM departments d
LEFT JOIN employees e ON d.department_id = e.department_id
GROUP BY d.department_name;`,
    solutionQuery: `SELECT d.department_name, COALESCE(SUM(e.salary_lpa), 0) as total_salaries
FROM departments d
LEFT JOIN employees e ON d.department_id = e.department_id
GROUP BY d.department_name;`,
    hint: "If a department has no matching employees, LEFT JOIN outputs NULL. How do you convert NULL to 0 in SQL?",
    mistakeExplanation: "When running a SUM on columns populated with NULL (due to a LEFT JOIN with no matches), the result is NULL. Use the COALESCE(SUM(...), 0) function to replace any NULL outputs with 0."
  },
  {
    id: "pz-7",
    dayId: 9,
    title: "Average Calculation Loophole",
    difficulty: "Medium",
    category: "Aggregation",
    businessScenario: "We want to find the overall average rating of food orders. The current math calculates it manually but ignores null ratings incorrectly.",
    flawedQuery: `-- Manual average returns the wrong value when rating is null
SELECT SUM(rating) / COUNT(*) as manual_average
FROM food_orders;`,
    solutionQuery: `SELECT AVG(rating) as manual_average
FROM food_orders;`,
    hint: "What happens to COUNT(*) when a rating is NULL? What does AVG() do with NULL values?",
    mistakeExplanation: "COUNT(*) counts all rows, including those where rating is NULL, resulting in a denominator that is too large. AVG(rating) automatically ignores NULL values in both the sum and the row count, matching the correct mathematical average."
  },
  {
    id: "pz-8",
    dayId: 9,
    title: "The Over-Grouping Leak",
    difficulty: "Medium",
    category: "Aggregation",
    businessScenario: "Find the maximum product list price in each product category. Right now, it outputs a row for every single product instead of summarizing by category.",
    flawedQuery: `-- Why are we seeing every product details instead of a summary?
SELECT category, product_name, MAX(list_price) as max_price
FROM products
GROUP BY category;`,
    solutionQuery: `SELECT category, MAX(list_price) as max_price
FROM products
GROUP BY category;`,
    hint: "If you group by category but select product_name, what does the database do? Remove the unaggregated product_name.",
    mistakeExplanation: "Including product_name in the SELECT clause without an aggregate function or grouping by it violates grouping rules (or returns arbitrary values in some SQL versions). Grouping should only select the grouped keys and their aggregates."
  },
  {
    id: "pz-9",
    dayId: 10,
    title: "The Conditional Sum Muddle",
    difficulty: "Medium",
    category: "Aggregation",
    businessScenario: "We want to count how many orders were successfully delivered versus returned. The query crashes.",
    flawedQuery: `-- Syntax error in conditional counts
SELECT
  COUNT(CASE WHEN status = 'Delivered' THEN 1) as delivered_count,
  COUNT(CASE WHEN status = 'Returned' THEN 1) as returned_count
FROM orders;`,
    solutionQuery: `SELECT
  COUNT(CASE WHEN status = 'Delivered' THEN 1 END) as delivered_count,
  COUNT(CASE WHEN status = 'Returned' THEN 1 END) as returned_count
FROM orders;`,
    hint: "Every CASE statement must be closed. What keyword is missing inside the CASE blocks?",
    mistakeExplanation: "Every CASE expression must terminate with the END keyword. Without it, the SQL compiler cannot parse where the condition evaluation finishes."
  },
  {
    id: "pz-10",
    dayId: 10,
    title: "The Multi-Column Aggregation",
    difficulty: "Hard",
    category: "Aggregation",
    businessScenario: "We want to find the overall ratio of total discounts applied to total orders. The junior analyst tries to divide aggregates directly inside SUM, which fails.",
    flawedQuery: `-- Cannot divide fields before aggregating them in this context
SELECT SUM(discount_amount / total_amount) as discount_ratio
FROM orders;`,
    solutionQuery: `SELECT SUM(discount_amount) / SUM(total_amount) as discount_ratio
FROM orders;`,
    hint: "Calculate the sum of all discounts first, then divide it by the sum of all total amounts.",
    mistakeExplanation: "SUM(discount_amount / total_amount) calculates the ratio for each row and then sums them up, which is mathematically incorrect for an overall ratio. You must divide the sum of all discounts by the sum of all revenues: `SUM(discount) / SUM(total)`."
  },

  
  // CATEGORY 2: JOINs & Subqueries (10 Puzzles)
  
  {
    id: "pz-11",
    dayId: 13,
    title: "The Phantom Inner Join",
    difficulty: "Medium",
    category: "JOINs & Subqueries",
    businessScenario: "We want a list of ALL customers, along with their order IDs (if they have any). If they haven't ordered, order_id should be NULL. The current query only returns customers who HAVE ordered.",
    flawedQuery: `-- Why are customers without orders missing?
SELECT c.full_name, o.order_id
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
WHERE o.status = 'Delivered';`,
    solutionQuery: `SELECT c.full_name, o.order_id
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id AND o.status = 'Delivered';`,
    hint: "Think about when the WHERE clause is evaluated. If a customer has no orders, what is o.status? How does WHERE handle that?",
    mistakeExplanation: "Putting a condition on the right table (orders) in the WHERE clause filters out all rows where that table's columns are NULL (because NULL = 'Delivered' is not true). This turns the LEFT JOIN into an INNER JOIN. Move the condition into the ON clause."
  },
  {
    id: "pz-12",
    dayId: 13,
    title: "The Cross Join Catastrophe",
    difficulty: "Medium",
    category: "JOINs & Subqueries",
    businessScenario: "We want to see each product category and its total revenue. But the numbers are in the trillions and the query took forever!",
    flawedQuery: `-- Why are the revenue numbers insanely high?
SELECT p.category, SUM(o.total_amount) as rev
FROM products p, orders o
GROUP BY p.category;`,
    solutionQuery: `SELECT p.category, SUM(oi.quantity * oi.unit_price) as rev
FROM products p
JOIN order_items oi ON p.product_id = oi.product_id
GROUP BY p.category;`,
    hint: "Look at the FROM clause. There is no JOIN condition between products and orders!",
    mistakeExplanation: "Selecting from two tables separated by a comma without a JOIN condition creates a CROSS JOIN (Cartesian product). Every product is joined with every order, causing exponential row growth. Always use explicit JOIN ... ON syntax."
  },
  {
    id: "pz-13",
    dayId: 13,
    title: "The Missing Subquery Alias",
    difficulty: "Medium",
    category: "JOINs & Subqueries",
    businessScenario: "Find the average of order counts per customer. The subquery is correct, but the outer query fails.",
    flawedQuery: `-- Syntax error near ")"
SELECT AVG(order_count)
FROM (
  SELECT customer_id, COUNT(*) as order_count
  FROM orders
  GROUP BY customer_id
);`,
    solutionQuery: `SELECT AVG(order_count)
FROM (
  SELECT customer_id, COUNT(*) as order_count
  FROM orders
  GROUP BY customer_id
) sub;`,
    hint: "Every derived table (a subquery in the FROM clause) needs a name.",
    mistakeExplanation: "In SQL, a subquery used in a FROM clause represents a temporary table. Standard SQL requires every derived table to have an alias name (e.g. `) sub;`), even if it is not explicitly referenced."
  },
  {
    id: "pz-14",
    dayId: 14,
    title: "The NOT IN Null Trap",
    difficulty: "Hard",
    category: "JOINs & Subqueries",
    businessScenario: "We want to find all customers who have NEVER placed an order. The subquery returns customer IDs, but the query yields 0 rows.",
    flawedQuery: `-- Why is this returning zero rows?
SELECT customer_id, full_name
FROM customers
WHERE customer_id NOT IN (
  SELECT DISTINCT customer_id FROM orders WHERE status = 'Cancelled' OR customer_id IS NULL
);`,
    solutionQuery: `SELECT customer_id, full_name
FROM customers
WHERE customer_id NOT IN (
  SELECT DISTINCT customer_id FROM orders WHERE customer_id IS NOT NULL
);`,
    hint: "If a NOT IN list contains even a single NULL value, the entire check evaluates to false or unknown. Filter out NULLs first.",
    mistakeExplanation: "In SQL, if a subquery in a NOT IN clause returns a NULL, the overall expression evaluates to UNKNOWN, causing the parent query to return empty results. You must filter out NULLs in the subquery or use NOT EXISTS."
  },
  {
    id: "pz-15",
    dayId: 14,
    title: "The Duplicating JOIN Multiplier",
    difficulty: "Medium",
    category: "JOINs & Subqueries",
    businessScenario: "We want to see the count of orders for each customer. The query below shows inflated, incorrect counts.",
    flawedQuery: `-- Counts are much higher than they should be
SELECT c.full_name, COUNT(o.order_id) as order_count
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
LEFT JOIN order_items oi ON o.order_id = oi.order_id
GROUP BY c.full_name;`,
    solutionQuery: `SELECT c.full_name, COUNT(DISTINCT o.order_id) as order_count
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.full_name;`,
    hint: "Joining order_items duplicates the order rows because one order has multiple items. Do we need order_items to count orders?",
    mistakeExplanation: "Joining `order_items` multiplies the rows for each order (one row per item). Thus, COUNT(o.order_id) counts each order once per item. Remove the redundant join or use COUNT(DISTINCT o.order_id)."
  },
  {
    id: "pz-16",
    dayId: 14,
    title: "The Ambiguous Column Ambush",
    difficulty: "Easy",
    category: "JOINs & Subqueries",
    businessScenario: "Find customers who ordered, but the compiler complains about an ambiguous column ID.",
    flawedQuery: `-- Column customer_id is ambiguous!
SELECT customer_id, full_name, order_date
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id;`,
    solutionQuery: `SELECT c.customer_id, c.full_name, o.order_date
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id;`,
    hint: "Both tables (customers and orders) have a customer_id column. Which one do you want to select?",
    mistakeExplanation: "When two tables in a JOIN contain columns with identical names, you must prefix the column with the table name or alias (e.g. `c.customer_id`) so the SQL engine knows which column to return."
  },
  {
    id: "pz-17",
    dayId: 14,
    title: "The Left Join Null Comparison",
    difficulty: "Easy",
    category: "JOINs & Subqueries",
    businessScenario: "Find all customers who have never placed an order using a LEFT JOIN. The query runs but returns no rows.",
    flawedQuery: `-- Why are customers who haven't ordered not showing up?
SELECT c.customer_id, c.full_name
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
WHERE o.order_id = NULL;`,
    solutionQuery: `SELECT c.customer_id, c.full_name
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
WHERE o.order_id IS NULL;`,
    hint: "In SQL, you cannot use '=' to check for NULL values. What operator should you use?",
    mistakeExplanation: "In SQL, comparisons with NULL using '=' or '!=' always return false/unknown. You must use the `IS NULL` or `IS NOT NULL` operators to check for null values."
  },
  {
    id: "pz-18",
    dayId: 15,
    title: "The HR Reporting Loop",
    difficulty: "Medium",
    category: "JOINs & Subqueries",
    businessScenario: "We want to see employee names along with their manager names. But right now it is returning managers' IDs instead of manager names.",
    flawedQuery: `-- This shows managers' employee IDs, not manager names!
SELECT e.employee_name, e.manager_id as manager_name
FROM employees e;`,
    solutionQuery: `SELECT e.employee_name, m.employee_name as manager_name
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.employee_id;`,
    hint: "You need to join the employees table to itself. Match the employee's manager_id to the manager's employee_id.",
    mistakeExplanation: "To find employee relationships in a single hierarchy table, you must perform a self-join. Join the table to itself using different aliases (e.g. `employees e` and `employees m`) on `e.manager_id = m.employee_id`."
  },
  {
    id: "pz-19",
    dayId: 18,
    title: "The Inefficient Subquery Check",
    difficulty: "Hard",
    category: "JOINs & Subqueries",
    businessScenario: "We want to check if a customer has placed an order with gross value > 10000. The subquery tries to select all customer records, making it extremely slow and incorrect.",
    flawedQuery: `-- This query returns customer details incorrectly
SELECT c.full_name
FROM customers c
WHERE EXISTS (
  SELECT * FROM orders o WHERE o.total_amount > 10000
);`,
    solutionQuery: `SELECT c.full_name
FROM customers c
WHERE EXISTS (
  SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id AND o.total_amount > 10000
);`,
    hint: "EXISTS needs a correlation condition. How do you link the orders subquery to the outer customers table?",
    mistakeExplanation: "A standard EXISTS subquery must be 'correlated' to the outer query. Without linking `o.customer_id = c.customer_id`, the EXISTS block returns true for everyone if *any* customer has placed an order > 10000."
  },
  {
    id: "pz-20",
    dayId: 18,
    title: "The Union Structural Crash",
    difficulty: "Easy",
    category: "JOINs & Subqueries",
    businessScenario: "We want to combine city locations of our customers and offices. The query fails due to column count mismatch.",
    flawedQuery: `-- Columns mismatch in set operations
SELECT city, region FROM customers
UNION
SELECT office_city FROM departments;`,
    solutionQuery: `SELECT city FROM customers
UNION
SELECT office_city FROM departments;`,
    hint: "UNION requires all queries to have the exact same number of columns in the same order.",
    mistakeExplanation: "Set operations like UNION and UNION ALL require all queries to return the exact same number of columns with compatible data types. You cannot union a 2-column query with a 1-column query."
  },

  
  // CATEGORY 3: Window Functions (10 Puzzles)
  
  {
    id: "pz-21",
    dayId: 21,
    title: "The Window Function Wipeout",
    difficulty: "Hard",
    category: "Window Functions",
    businessScenario: "We want to rank the highest-value orders PER REGION. But right now, it's just ranking all orders globally from 1 to 50.",
    flawedQuery: `-- Fix the window function so rank resets for each region
SELECT c.region, o.order_id, o.total_amount,
  RANK() OVER(ORDER BY o.total_amount DESC) as region_rank
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id;`,
    solutionQuery: `SELECT c.region, o.order_id, o.total_amount,
  RANK() OVER(PARTITION BY c.region ORDER BY o.total_amount DESC) as region_rank
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id;`,
    hint: "How do you tell the OVER() clause to group the ranking by a specific column?",
    mistakeExplanation: "Without a PARTITION BY clause, the window function treats the entire result set as a single group. To calculate metrics 'per group' (like per region), you must use PARTITION BY inside the OVER() clause."
  },
  {
    id: "pz-22",
    dayId: 21,
    title: "The Running Total Tie Trap",
    difficulty: "Medium",
    category: "Window Functions",
    businessScenario: "We want to calculate a running total of payments over time. However, payments on the same date are being added together in a lump sum instead of step-by-step.",
    flawedQuery: `-- Payments on duplicate dates are summing together in a single step
SELECT payment_id, payment_date, amount,
  SUM(amount) OVER (ORDER BY payment_date) as running_total
FROM payments;`,
    solutionQuery: `SELECT payment_id, payment_date, amount,
  SUM(amount) OVER (ORDER BY payment_date, payment_id) as running_total
FROM payments;`,
    hint: "If the ORDER BY column has duplicates, SUM() OVER combines them. Add a unique identifier (like payment_id) to the ORDER BY to force sequential evaluation.",
    mistakeExplanation: "When duplicate values exist in the window ORDER BY clause, the engine groups them and sums them in a single step. To get a true cumulative sum, append a unique column (e.g. payment_id) to make the sorting key unique."
  },
  {
    id: "pz-23",
    dayId: 21,
    title: "The Filtering Windows Trap",
    difficulty: "Hard",
    category: "Window Functions",
    businessScenario: "We want to find only the highest-paying employee per department. The query crashes.",
    flawedQuery: `-- Cannot filter on window function results in WHERE!
SELECT employee_name, department_id, salary_lpa
FROM employees
WHERE RANK() OVER (PARTITION BY department_id ORDER BY salary_lpa DESC) = 1;`,
    solutionQuery: `SELECT employee_name, department_id, salary_lpa
FROM (
  SELECT employee_name, department_id, salary_lpa,
    RANK() OVER (PARTITION BY department_id ORDER BY salary_lpa DESC) as rnk
  FROM employees
) sub
WHERE rnk = 1;`,
    hint: "Window functions are executed after the WHERE clause. You must wrap the query in a subquery or CTE to filter by rank.",
    mistakeExplanation: "Because of SQL execution order, window functions are evaluated in the SELECT phase, which happens after the WHERE clause. Thus, you cannot filter on rank inside the same query's WHERE clause. Wrap it in a subquery/CTE."
  },
  {
    id: "pz-24",
    dayId: 22,
    title: "The Range Default Loophole",
    difficulty: "Hard",
    category: "Window Functions",
    businessScenario: "We want a running average of payment amounts over time. We want it row-by-row, but duplicates cause incorrect averages.",
    flawedQuery: `-- By default, ORDER BY uses RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
SELECT payment_date, amount,
  AVG(amount) OVER (ORDER BY payment_date) as running_avg
FROM payments;`,
    solutionQuery: `SELECT payment_date, amount,
  AVG(amount) OVER (ORDER BY payment_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) as running_avg
FROM payments;`,
    hint: "Change the window framing from the default RANGE to ROWS.",
    mistakeExplanation: "By default, an ORDER BY clause in a window function uses the RANGE frame, which aggregates all duplicate values of the sorting key together. Specifying ROWS BETWEEN makes the aggregation row-by-row."
  },
  {
    id: "pz-25",
    dayId: 22,
    title: "The Lag of Chaos",
    difficulty: "Medium",
    category: "Window Functions",
    businessScenario: "Find the difference in revenue between the current order and the previous order. The lag amounts are random.",
    flawedQuery: `-- Why are the lag calculations incorrect?
SELECT order_id, total_amount,
  LAG(total_amount, 1) OVER () as prev_amount
FROM orders;`,
    solutionQuery: `SELECT order_id, total_amount,
  LAG(total_amount, 1) OVER (ORDER BY order_date, order_id) as prev_amount
FROM orders;`,
    hint: "Window functions like LAG require an ORDER BY clause inside OVER() to determine what 'previous' means.",
    mistakeExplanation: "LAG and LEAD require an ordered sequence to identify preceding/following rows. Without an ORDER BY clause inside the OVER() container, the row ordering is arbitrary and values will be incorrect."
  },
  {
    id: "pz-26",
    dayId: 22,
    title: "The Rank Gap Hazard",
    difficulty: "Medium",
    category: "Window Functions",
    businessScenario: "We want to assign ranks to employee salaries. If two employees share rank 2, the next rank assigned should be 3 (no gaps). The query currently outputs rank 4 instead.",
    flawedQuery: `-- This assigns ranks with gaps (e.g. 1, 2, 2, 4)
SELECT employee_name, salary_lpa,
  RANK() OVER (ORDER BY salary_lpa DESC) as sal_rank
FROM employees;`,
    solutionQuery: `SELECT employee_name, salary_lpa,
  DENSE_RANK() OVER (ORDER BY salary_lpa DESC) as sal_rank
FROM employees;`,
    hint: "Which window ranking function assigns ranks without leaving gaps when duplicate values exist?",
    mistakeExplanation: "RANK() leaves gaps in the ranking sequence if there are duplicate ties. To assign consecutive ranks without gaps (e.g. 1, 2, 2, 3), use DENSE_RANK() instead."
  },
  {
    id: "pz-27",
    dayId: 22,
    title: "The First Value Freeze",
    difficulty: "Hard",
    category: "Window Functions",
    businessScenario: "Find the first order date for each customer segment. But the first_value result is changing on every row.",
    flawedQuery: `-- FIRST_VALUE is returning the current row's date instead of the first
SELECT customer_id, segment, signup_date,
  FIRST_VALUE(signup_date) OVER (PARTITION BY segment ORDER BY signup_date) as first_signup
FROM customers;`,
    solutionQuery: `SELECT customer_id, segment, signup_date,
  FIRST_VALUE(signup_date) OVER (PARTITION BY segment ORDER BY signup_date ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) as first_signup
FROM customers;`,
    hint: "By default, the window frame stops at the CURRENT ROW. Expand the frame to search the entire partition.",
    mistakeExplanation: "By default, the window frame is `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`. This prevents FIRST_VALUE from seeing past the current row when evaluating later items. Expand it to `UNBOUNDED FOLLOWING`."
  },
  {
    id: "pz-28",
    dayId: 24,
    title: "The Partition Sort Mismatch",
    difficulty: "Hard",
    category: "Window Functions",
    businessScenario: "Rank products by cost price within their category. The query crashes due to syntax placement error.",
    flawedQuery: `-- Compiler error inside OVER clause
SELECT category, product_name, cost_price,
  RANK() OVER (ORDER BY cost_price DESC PARTITION BY category) as rnk
FROM products;`,
    solutionQuery: `SELECT category, product_name, cost_price,
  RANK() OVER (PARTITION BY category ORDER BY cost_price DESC) as rnk
FROM products;`,
    hint: "Inside the OVER clause, PARTITION BY must always be specified before the ORDER BY clause.",
    mistakeExplanation: "The SQL syntax requires PARTITION BY to precede the ORDER BY clause inside the OVER(...) container. Inverting their order results in a compiler syntax error."
  },
  {
    id: "pz-29",
    dayId: 24,
    title: "The NTile Division Gap",
    difficulty: "Hard",
    category: "Window Functions",
    businessScenario: "Distribute employee salaries into 4 equal quartiles. But the ranks are scrambled because of sorting omission.",
    flawedQuery: `-- Employees are randomly assigned to buckets
SELECT employee_name, salary_lpa,
  NTILE(4) OVER (PARTITION BY department_id) as salary_quartile
FROM employees;`,
    solutionQuery: `SELECT employee_name, salary_lpa,
  NTILE(4) OVER (PARTITION BY department_id ORDER BY salary_lpa DESC) as salary_quartile
FROM employees;`,
    hint: "NTILE needs to know how to sort values before placing them in buckets.",
    mistakeExplanation: "NTILE(N) requires an ORDER BY clause inside the window definition to group elements progressively. Without sorting, rows are assigned to buckets in arbitrary order."
  },
  {
    id: "pz-30",
    dayId: 24,
    title: "The Churn Date Difference",
    difficulty: "Hard",
    category: "Window Functions",
    businessScenario: "We want to see the date difference between the start of a subscription and the previous subscription's end date. The query crashes.",
    flawedQuery: `-- Cannot nest LAG inside Date functions directly without sorting
SELECT subscription_id, start_date,
  start_date - LAG(end_date) OVER () as days_between
FROM subscriptions;`,
    solutionQuery: `SELECT subscription_id, start_date,
  julianday(start_date) - julianday(LAG(end_date) OVER (ORDER BY start_date)) as days_between
FROM subscriptions;`,
    hint: "In SQLite, use julianday() to subtract dates, and remember to sort inside the OVER clause.",
    mistakeExplanation: "Date subtraction in SQLite requires the julianday() helper. Furthermore, all offset functions like LAG() require sorting inside the OVER clause to establish preceding rows."
  },

  
  // CATEGORY 4: Syntax & Logic (10 Puzzles)
  
  {
    id: "pz-31",
    dayId: 1,
    title: "The Alias Ambush",
    difficulty: "Easy",
    category: "Syntax & Logic",
    businessScenario: "We want to find all orders where the calculated net revenue is greater than 1000. The query crashes.",
    flawedQuery: `-- The database says "no such column: net_revenue"
SELECT order_id,
  (total_amount - discount_amount) AS net_revenue
FROM orders
WHERE net_revenue > 1000;`,
    solutionQuery: `SELECT order_id,
  (total_amount - discount_amount) AS net_revenue
FROM orders
WHERE (total_amount - discount_amount) > 1000;`,
    hint: "Remember the SQL execution order. Which is evaluated first: SELECT or WHERE?",
    mistakeExplanation: "In SQL, the WHERE clause is evaluated BEFORE the SELECT clause. Therefore, the alias 'net_revenue' doesn't exist yet when filtering rows. You must repeat the mathematical expression in the WHERE clause."
  },
  {
    id: "pz-32",
    dayId: 1,
    title: "The Date Format Hazard",
    difficulty: "Easy",
    category: "Syntax & Logic",
    businessScenario: "Find customers who signed up in 2023. The query executes but returns 0 rows.",
    flawedQuery: `-- Why are 2023 signups missing?
SELECT customer_id, full_name, signup_date
FROM customers
WHERE signup_date = '18-01-2023';`,
    solutionQuery: `SELECT customer_id, full_name, signup_date
FROM customers
WHERE signup_date = '2023-01-18';`,
    hint: "SQL databases expect dates in the ISO standard format: YYYY-MM-DD.",
    mistakeExplanation: "SQLite and most relational databases require date literals in the ISO YYYY-MM-DD format. Querying with DD-MM-YYYY fails to match standard date fields."
  },
  {
    id: "pz-33",
    dayId: 11,
    title: "The Division By Zero Trap",
    difficulty: "Medium",
    category: "Syntax & Logic",
    businessScenario: "We want to calculate the cost-to-list-price ratio of products. But the query crashes when list_price is zero.",
    flawedQuery: `-- Query crashes when list_price is zero
SELECT product_name,
  (cost_price / list_price) as price_ratio
FROM products;`,
    solutionQuery: `SELECT product_name,
  (cost_price / NULLIF(list_price, 0)) as price_ratio
FROM products;`,
    hint: "Use the NULLIF(value, 0) function to safely turn list_price to NULL when it is zero, preventing crash.",
    mistakeExplanation: "Dividing by zero causes database engine crashes. The SQL function NULLIF(col, 0) returns NULL if the column is 0, and dividing by NULL safely yields NULL instead of crashing."
  },
  {
    id: "pz-34",
    dayId: 25,
    title: "The Bad Wildcard Matcher",
    difficulty: "Easy",
    category: "Syntax & Logic",
    businessScenario: "We want to find all customers whose segment name starts with 'Pr'. The query runs but returns no rows.",
    flawedQuery: `-- Why is this returning 0 rows?
SELECT customer_id, full_name, segment
FROM customers
WHERE segment LIKE 'Pr_';`,
    solutionQuery: `SELECT customer_id, full_name, segment
FROM customers
WHERE segment LIKE 'Pr%';`,
    hint: "In SQL, the '_' wildcard represents exactly one character. What wildcard represents any number of characters?",
    mistakeExplanation: "In SQL LIKE clauses, '_' matches exactly one character (e.g. 'Pr_' matches 'Pro' but not 'Premium'). The '%' wildcard matches zero or more characters."
  },
  {
    id: "pz-35",
    dayId: 25,
    title: "The Case Statement Override",
    difficulty: "Medium",
    category: "Syntax & Logic",
    businessScenario: "Categorize employee salaries: 'High' if > 80 LPA, 'Medium' if > 40 LPA, 'Low' otherwise. But right now, everyone > 80 LPA is categorized as 'Medium'.",
    flawedQuery: `-- High salary category is never assigned!
SELECT employee_name, salary_lpa,
  CASE
    WHEN salary_lpa > 40 THEN 'Medium'
    WHEN salary_lpa > 80 THEN 'High'
    ELSE 'Low'
  END as sal_tier
FROM employees;`,
    solutionQuery: `SELECT employee_name, salary_lpa,
  CASE
    WHEN salary_lpa > 80 THEN 'High'
    WHEN salary_lpa > 40 THEN 'Medium'
    ELSE 'Low'
  END as sal_tier
FROM employees;`,
    hint: "CASE statements execute sequentially and stop at the first true condition. Order your conditions from most restrictive to least restrictive.",
    mistakeExplanation: "CASE statements evaluate sequentially. Since a salary of 90 is > 40, it triggers the first WHEN branch ('Medium') and exits. Arrange ranges from highest to lowest."
  },
  {
    id: "pz-36",
    dayId: 27,
    title: "The Null Revenue Leak",
    difficulty: "Medium",
    category: "Syntax & Logic",
    businessScenario: "We want to calculate the actual amount paid (total_amount minus discount_amount). But if there is no discount (discount_amount is NULL), the calculation returns NULL instead of the total_amount.",
    flawedQuery: `-- Orders with no discount are returning NULL paid_amount!
SELECT order_id,
  (total_amount - discount_amount) as paid_amount
FROM orders;`,
    solutionQuery: `SELECT order_id,
  (total_amount - COALESCE(discount_amount, 0)) as paid_amount
FROM orders;`,
    hint: "In SQL, any mathematical operation with NULL yields NULL. How do you convert a NULL discount to 0?",
    mistakeExplanation: "Performing subtraction with NULL (e.g. `1000 - NULL`) returns NULL. Wrap the nullable column in COALESCE(discount_amount, 0) to treat NULL as 0."
  },
  {
    id: "pz-37",
    dayId: 27,
    title: "The Plus Concatenation Trap",
    difficulty: "Easy",
    category: "Syntax & Logic",
    businessScenario: "We want to merge name and city into a label (e.g., 'Aarav Mehta (Mumbai)'). The query returns numbers or zeros.",
    flawedQuery: `-- This returns 0 or numbers in SQLite!
SELECT (full_name + ' (' + city + ')') as display_label
FROM customers;`,
    solutionQuery: `SELECT (full_name || ' (' || city || ')') as display_label
FROM customers;`,
    hint: "In SQLite and Postgres, the '+' operator is strictly for math. What operator is used to concatenate strings?",
    mistakeExplanation: "SQLite uses the double-pipe `||` operator to concatenate strings. Using the `+` operator attempts to cast the string to numbers, yielding 0."
  },
  {
    id: "pz-38",
    dayId: 28,
    title: "The Logic Operator Priority",
    difficulty: "Medium",
    category: "Syntax & Logic",
    businessScenario: "Find customers from 'Mumbai' or 'Delhi' who are in the 'Premium' segment. But the query is returning 'Student' and 'Value' customers from Delhi.",
    flawedQuery: `-- Why are non-Premium Delhi customers showing up?
SELECT full_name, city, segment
FROM customers
WHERE city = 'Mumbai' OR city = 'Delhi' AND segment = 'Premium';`,
    solutionQuery: `SELECT full_name, city, segment
FROM customers
WHERE (city = 'Mumbai' OR city = 'Delhi') AND segment = 'Premium';`,
    hint: "In SQL logic, AND has higher precedence than OR. Use parentheses to group your OR conditions together.",
    mistakeExplanation: "The logical AND operator is evaluated before OR. So, the query reads as: '(Mumbai customers) OR (Delhi customers who are Premium)'. Group OR conditions in brackets."
  },
  {
    id: "pz-39",
    dayId: 28,
    title: "The Boolean String Hazard",
    difficulty: "Easy",
    category: "Syntax & Logic",
    businessScenario: "We want to find active subscriptions. The query crashes or returns 0 rows.",
    flawedQuery: `-- Syntax error checking boolean values
SELECT subscription_id, status
FROM subscriptions
WHERE status = TRUE;`,
    solutionQuery: `SELECT subscription_id, status
FROM subscriptions
WHERE status = 'Active';`,
    hint: "Look at the columns of the subscriptions table. Is 'status' a boolean or text field?",
    mistakeExplanation: "The status column stores text values ('Active', 'Paused', 'Churned') rather than Boolean flags. Compare it to the string value `'Active'`."
  },
  {
    id: "pz-40",
    dayId: 4,
    title: "The Inverted Null Compare",
    difficulty: "Easy",
    category: "Syntax & Logic",
    businessScenario: "We want to find all subscriptions that have ended (end_date is not null). The query returns no rows.",
    flawedQuery: `-- Why is this returning 0 rows?
SELECT subscription_id, end_date
FROM subscriptions
WHERE end_date != NULL;`,
    solutionQuery: `SELECT subscription_id, end_date
FROM subscriptions
WHERE end_date IS NOT NULL;`,
    hint: "In SQL, comparisons with NULL using standard equality operators (!= or <>) fail. What operator checks for non-null values?",
    mistakeExplanation: "Null represents the absence of a value, so it cannot be compared using standard comparison operators. Always check for non-null values using `IS NOT NULL`."
  },
  {
    id: "pz-41",
    dayId: 8,
    title: "The Conditional Count DISTINCT Trap",
    difficulty: "Hard",
    category: "Aggregation",
    businessScenario: "We want to find the number of unique customers who placed successful orders vs. cancelled orders. But the conditional counts are returning incorrect values because of a common DISTINCT syntax oversight.",
    flawedQuery: `-- Fix the syntax error so this runs!
SELECT
  COUNT(CASE WHEN status = 'Delivered' THEN DISTINCT customer_id END) as delivered_buyers,
  COUNT(CASE WHEN status = 'Cancelled' THEN DISTINCT customer_id END) as cancelled_buyers
FROM orders;`,
    solutionQuery: `SELECT
  COUNT(DISTINCT CASE WHEN status = 'Delivered' THEN customer_id END) as delivered_buyers,
  COUNT(DISTINCT CASE WHEN status = 'Cancelled' THEN customer_id END) as cancelled_buyers
FROM orders;`,
    hint: "DISTINCT must go directly inside the COUNT(...) function, not inside the CASE WHEN clause.",
    mistakeExplanation: "COUNT(DISTINCT case_expression) is the correct syntax. Putting DISTINCT inside the CASE WHEN ... THEN block is invalid SQL syntax."
  },
  {
    id: "pz-42",
    dayId: 8,
    title: "The Aggregate Filter Leak",
    difficulty: "Medium",
    category: "Aggregation",
    businessScenario: "We want a single report showing the total revenue from 'App' orders alongside the total revenue from 'Web' orders. The query returns 0 for Web sales.",
    flawedQuery: `-- Why are web sales summing to zero?
SELECT
  SUM(CASE WHEN channel = 'App' THEN total_amount ELSE 0 END) as app_sales,
  SUM(CASE WHEN channel = 'Web' THEN total_amount ELSE 0 END) as web_sales
FROM orders
WHERE channel = 'App';`,
    solutionQuery: `SELECT
  SUM(CASE WHEN channel = 'App' THEN total_amount ELSE 0 END) as app_sales,
  SUM(CASE WHEN channel = 'Web' THEN total_amount ELSE 0 END) as web_sales
FROM orders;`,
    hint: "Look at the WHERE clause. If you filter the whole query to 'App', what happens to the 'Web' sales sum?",
    mistakeExplanation: "By putting WHERE channel = 'App' at the end, the query filters out all Web orders before the SELECT clause runs, causing web_sales to evaluate to 0. Remove the WHERE filter so the conditional CASE WHEN can aggregate both channels correctly."
  },
  {
    id: "pz-43",
    dayId: 19,
    title: "The Aggregated Join Inflater",
    difficulty: "Hard",
    category: "JOINs & Subqueries",
    businessScenario: "We want to see each customer's details alongside their total lifetime order amount and total payments. But the current query returns duplicate-multiplied inflated values.",
    flawedQuery: `-- Values are multiplied and incorrect
SELECT c.customer_id, c.full_name,
  SUM(o.total_amount) as total_ordered,
  SUM(p.amount) as total_paid
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
LEFT JOIN payments p ON o.order_id = p.order_id
GROUP BY c.customer_id, c.full_name;`,
    solutionQuery: `WITH order_summary AS (
  SELECT customer_id, SUM(total_amount) as total_ordered
  FROM orders
  GROUP BY customer_id
),
payment_summary AS (
  SELECT o.customer_id, SUM(p.amount) as total_paid
  FROM orders o
  JOIN payments p ON o.order_id = p.order_id
  GROUP BY o.customer_id
)
SELECT c.customer_id, c.full_name,
  COALESCE(os.total_ordered, 0) as total_ordered,
  COALESCE(ps.total_paid, 0) as total_paid
FROM customers c
LEFT JOIN order_summary os ON c.customer_id = os.customer_id
LEFT JOIN payment_summary ps ON c.customer_id = ps.customer_id;`,
    hint: "Joining one customer to multiple orders, and then joining those to multiple payments, creates a Cartesian duplication per customer. Pre-aggregate in CTEs first.",
    mistakeExplanation: "When you join a table to multiple child tables (orders and payments), rows are multiplied, causing aggregates like SUM() to double-count. The solution is to calculate totals inside separate CTEs first, and then join those summarized results back to the customer table."
  },
  {
    id: "pz-44",
    dayId: 18,
    title: "The Correlated Subquery Trap",
    difficulty: "Hard",
    category: "JOINs & Subqueries",
    businessScenario: "Find all products whose list price is greater than the average list price of products in their own category. The current query returns only products above the global average.",
    flawedQuery: `-- Compare each product to its own category average instead of overall average
SELECT product_name, category, list_price
FROM products p1
WHERE list_price > (
  SELECT AVG(list_price)
  FROM products p2
)
ORDER BY category;`,
    solutionQuery: `SELECT product_name, category, list_price
FROM products p1
WHERE list_price > (
  SELECT AVG(list_price)
  FROM products p2
  WHERE p2.category = p1.category
)
ORDER BY category;`,
    hint: "How do you connect the inner subquery's average calculation to the outer product's category?",
    mistakeExplanation: "The flawed query compares each product to the overall database average. To make it a correlated subquery that compares each product to its own category average, you must add WHERE p2.category = p1.category inside the subquery."
  },
  {
    id: "pz-45",
    dayId: 22,
    title: "The LAST_VALUE Frame Trap",
    difficulty: "Hard",
    category: "Window Functions",
    businessScenario: "Find the latest signup date for each customer segment. The analyst used LAST_VALUE() sorted by signup_date, but it returns the current row's date.",
    flawedQuery: `-- LAST_VALUE is returning current row instead of actual last row
SELECT customer_id, segment, signup_date,
  LAST_VALUE(signup_date) OVER (PARTITION BY segment ORDER BY signup_date) as last_signup
FROM customers;`,
    solutionQuery: `SELECT customer_id, segment, signup_date,
  LAST_VALUE(signup_date) OVER (
    PARTITION BY segment
    ORDER BY signup_date
    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
  ) as last_signup
FROM customers;`,
    hint: "By default, ORDER BY limits the window frame from UNBOUNDED PRECEDING to CURRENT ROW, which freezes LAST_VALUE to the current row. Expand the frame.",
    mistakeExplanation: "By default, using ORDER BY sets the window frame to RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW. This means LAST_VALUE can never see past the current row. To fix it, you must explicitly define the frame to search all the way to UNBOUNDED FOLLOWING."
  },
  {
    id: "pz-46",
    dayId: 22,
    title: "The Aggregated Window Crash",
    difficulty: "Medium",
    category: "Window Functions",
    businessScenario: "We want to see the total sales per city, along with the percentage contribution of each customer. The query crashes.",
    flawedQuery: `-- Unaggregated columns in group by query
SELECT city, customer_id,
  SUM(total_amount) as customer_sales,
  SUM(total_amount) / SUM(SUM(total_amount)) OVER (PARTITION BY city) * 100 as pct_of_city
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
GROUP BY customer_id;`,
    solutionQuery: `SELECT c.city, c.customer_id,
  SUM(o.total_amount) as customer_sales,
  SUM(o.total_amount) / SUM(SUM(o.total_amount)) OVER (PARTITION BY c.city) * 100 as pct_of_city
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.city, c.customer_id;`,
    hint: "Look at your GROUP BY. You selected 'city' but did not group by it.",
    mistakeExplanation: "The query selects city but only groups by customer_id. Because city is not aggregated, this violates standard grouping rules. You must group by both c.city and c.customer_id for the window aggregation to execute correctly."
  },
  {
    id: "pz-47",
    dayId: 30,
    title: "The Integer Division Zero Leak",
    difficulty: "Medium",
    category: "Syntax & Logic",
    businessScenario: "Calculate the refund rate for each payment mode (refunded amount divided by total amount * 100). The query executes, but it returns 0.0 for all payment modes instead of the decimal percentage!",
    flawedQuery: `-- Integer division yields 0
SELECT payment_mode,
  (SUM(CASE WHEN payment_status = 'Refunded' THEN amount ELSE 0 END) / SUM(amount)) * 100 as refund_rate
FROM payments
GROUP BY payment_mode;`,
    solutionQuery: `SELECT payment_mode,
  (SUM(CASE WHEN payment_status = 'Refunded' THEN amount ELSE 0.0 END) * 100.0 / SUM(amount)) as refund_rate
FROM payments
GROUP BY payment_mode;`,
    hint: "In many database engines, dividing two integers results in an integer (e.g. 5 / 10 = 0). Multiply by 100.0 or cast to float before dividing.",
    mistakeExplanation: "Because both columns are integers, the division operator performs integer division, truncating the fractional part to 0 before multiplying by 100. Multiplying the numerator by 100.0 first converts it to a floating-point number, ensuring decimal accuracy."
  },
  {
    id: "pz-48",
    dayId: 4,
    title: "The NULL Concatenation Hazard",
    difficulty: "Medium",
    category: "Syntax & Logic",
    businessScenario: "Generate a full address label: city followed by the region in parentheses. But for customers where region is missing (NULL), the entire label evaluates to NULL!",
    flawedQuery: `-- Null region wipes out the entire label
SELECT full_name,
  city || ' (' || region || ')' as location_label
FROM customers;`,
    solutionQuery: `SELECT full_name,
  city || ' (' || COALESCE(region, 'Unknown') || ')' as location_label
FROM customers;`,
    hint: "In SQL, any string concatenation with a NULL value evaluates to NULL. How do you substitute a default value for NULL?",
    mistakeExplanation: "Concatenating any string with NULL yields NULL (e.g. 'Mumbai' || NULL results in NULL). To protect against this, wrap the nullable region column in COALESCE(region, 'Unknown') so it defaults to a fallback string instead of destroying the entire label."
  },
  {
    id: "pz-49",
    dayId: 10,
    title: "Timestamp Truncation Grouping",
    difficulty: "Medium",
    category: "Aggregation",
    businessScenario: "We want to see daily transaction summaries from our food delivery operations. However, grouping by order_date (which represents raw dates) should still be cleaned and aggregated daily.",
    flawedQuery: `-- Clean and aggregate food orders count by date
SELECT order_date, COUNT(*) as orders_count
FROM food_orders
GROUP BY order_date;`,
    solutionQuery: `SELECT DATE(order_date) as order_date, COUNT(*) as orders_count
FROM food_orders
GROUP BY DATE(order_date);`,
    hint: "Use the DATE() function to normalize the date format before grouping.",
    mistakeExplanation: "To aggregate daily metrics robustly, wrap the order_date in the DATE() function in both the SELECT list and the GROUP BY clause to normalize values."
  },
  {
    id: "pz-50",
    dayId: 29,
    title: "The FLOAT Equality Precision Bug",
    difficulty: "Medium",
    category: "Syntax & Logic",
    businessScenario: "A finance analyst wants to audit transactions that are exactly ₹99.99. But comparing float columns using '=' fails or behaves unpredictably due to floating-point precision.",
    flawedQuery: `-- Equality on floating point columns is unreliable
SELECT payment_id, amount
FROM payments
WHERE amount = 99.99;`,
    solutionQuery: `SELECT payment_id, amount
FROM payments
WHERE ROUND(amount, 2) = 99.99;`,
    hint: "Use the ROUND() function to round the floating point column to 2 decimal places before performing equality checks.",
    mistakeExplanation: "Floating-point numbers (REAL/FLOAT) represent fractional values using binary approximations, which can cause tiny precision mismatches. Directly comparing floats using '=' can result in missed records. Wrap the column in ROUND(col, 2) to perform a safe comparison."
  },
  {
    id: "pz-51",
    dayId: 22,
    title: "The Accidental Running Sum",
    difficulty: "Medium",
    category: "Window Functions",
    businessScenario: "We want to see each employee's name and salary alongside the total salary budget for their department. But the department total column behaves like a running sum instead of a static total.",
    flawedQuery: `-- This computes a running total instead of a static department total
SELECT employee_name, salary_lpa,
  SUM(salary_lpa) OVER (PARTITION BY department_id ORDER BY salary_lpa) as dept_total
FROM employees;`,
    solutionQuery: `SELECT employee_name, salary_lpa,
  SUM(salary_lpa) OVER (PARTITION BY department_id) as dept_total
FROM employees;`,
    hint: "Look at the window specification. Does a static group total require sorting with ORDER BY?",
    mistakeExplanation: "In a window function, adding an ORDER BY clause inside the OVER() block alters the default frame to compute a cumulative (running) total. To get a static group total, omit the ORDER BY clause."
  },
  {
    id: "pz-52",
    dayId: 19,
    title: "The LEFT JOIN ON Filter Trap",
    difficulty: "Hard",
    category: "JOINs & Subqueries",
    businessScenario: "We want to see only premium customers alongside their order details. The current query still lists all value and student customers in the output.",
    flawedQuery: `-- Value and Student customers are still appearing with NULLs
SELECT c.customer_id, c.full_name, o.order_id
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id AND c.segment = 'Premium';`,
    solutionQuery: `SELECT c.customer_id, c.full_name, o.order_id
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
WHERE c.segment = 'Premium';`,
    hint: "In a LEFT JOIN, putting a filter for the left table in the ON clause doesn't filter the left table rows. Move it to the WHERE clause.",
    mistakeExplanation: "Adding a filter for the left table (customers) in the LEFT JOIN's ON clause only controls which right-table records (orders) get matched. It doesn't filter the left table, so non-premium rows still appear in the output. Use the WHERE clause to filter the left table."
  },
  {
    id: "pz-53",
    dayId: 13,
    title: "The Anti-Join NULL Filter Trap",
    difficulty: "Hard",
    category: "JOINs & Subqueries",
    businessScenario: "Find all customers who have never placed an order. However, the query runs but returns zero rows.",
    flawedQuery: `-- This NOT IN subquery returns zero rows if any customer_id is NULL
SELECT customer_id, full_name
FROM customers
WHERE customer_id NOT IN (SELECT customer_id FROM orders);`,
    solutionQuery: `SELECT customer_id, full_name
FROM customers
WHERE customer_id NOT IN (SELECT customer_id FROM orders WHERE customer_id IS NOT NULL);`,
    hint: "If the subquery returns even a single NULL, NOT IN evaluates to UNKNOWN for all rows, returning empty results.",
    mistakeExplanation: "In SQL, comparing any value with NULL yields UNKNOWN. When NOT IN queries a list that contains a NULL, the overall expression evaluates to UNKNOWN, causing zero rows to be returned. Always filter out NULLs in NOT IN subqueries, or use LEFT JOIN with IS NULL."
  },
  {
    id: "pz-54",
    dayId: 24,
    title: "UNION Column Alignment Bug",
    difficulty: "Medium",
    category: "Syntax & Logic",
    businessScenario: "Combine customer cities with department cities. The analyst tried to stack them, but mapped name columns to city columns incorrectly.",
    flawedQuery: `-- Columns are matched by position, not by name!
SELECT customer_id, city FROM customers
UNION
SELECT office_city, department_id FROM departments;`,
    solutionQuery: `SELECT city FROM customers
UNION
SELECT office_city FROM departments;`,
    hint: "UNION matches columns by position. Ensure your SELECT clauses have the same number of columns in the same order and compatible types.",
    mistakeExplanation: "UNION merges datasets by column position rather than name. Merging customer_id (integer) with office_city (text) and city (text) with department_id (integer) causes type coercion and semantic bugs. The lists must be aligned."
  },
  {
    id: "pz-55",
    dayId: 10,
    title: "HAVING without GROUP BY",
    difficulty: "Medium",
    category: "Aggregation",
    businessScenario: "We want to check if the total company payroll exceeds ₹50 Lakhs. The query executes but returns a single employee name.",
    flawedQuery: `-- Using HAVING without GROUP BY collapses all rows to one
SELECT employee_name, SUM(salary_lpa)
FROM employees
HAVING SUM(salary_lpa) > 50;`,
    solutionQuery: `SELECT SUM(salary_lpa) as total_payroll
FROM employees
HAVING SUM(salary_lpa) > 50;`,
    hint: "If you aggregate without GROUP BY, you cannot select unaggregated columns like employee_name.",
    mistakeExplanation: "Using HAVING without a GROUP BY aggregates the entire table into a single row. Selecting a non-aggregate field like employee_name returns an arbitrary value from the table. To check the total payroll, select only the aggregate."
  },
  {
    id: "pz-56",
    dayId: 22,
    title: "The Zero-Offset LAG",
    difficulty: "Easy",
    category: "Window Functions",
    businessScenario: "Find the previous employee's salary when sorted by salary. The query returns the current row's salary.",
    flawedQuery: `-- Offset of 0 returns the current row
SELECT employee_name, salary_lpa,
  LAG(salary_lpa, 0) OVER (ORDER BY salary_lpa) as prev_salary
FROM employees;`,
    solutionQuery: `SELECT employee_name, salary_lpa,
  LAG(salary_lpa, 1) OVER (ORDER BY salary_lpa) as prev_salary
FROM employees;`,
    hint: "An offset of 0 references the current row. Change the offset parameter.",
    mistakeExplanation: "The LAG(col, offset) function defaults to offset=1. Specifying an offset of 0 queries the current row itself. To retrieve the previous row's value, set the offset to 1."
  },
  {
    id: "pz-57",
    dayId: 5,
    title: "Case-Sensitive String Matches",
    difficulty: "Easy",
    category: "Syntax & Logic",
    businessScenario: "Find all customers living in 'mumbai' (lowercase). The query returns 0 rows even though we have customers in Mumbai.",
    flawedQuery: `-- SQLite string equality is case-sensitive
SELECT full_name
FROM customers
WHERE city = 'mumbai';`,
    solutionQuery: `SELECT full_name
FROM customers
WHERE LOWER(city) = 'mumbai';`,
    hint: "In SQLite, text comparison with '=' is case-sensitive. Convert the column to lowercase first.",
    mistakeExplanation: "Unlike MySQL, SQLite text comparisons using '=' are case-sensitive by default. Mumbai is stored with a capital 'M', so checking for 'mumbai' yields no results. Use LOWER() or LIKE for case-insensitive matches."
  },
  {
    id: "pz-58",
    dayId: 21,
    title: "ROW_NUMBER vs DENSE_RANK Ties",
    difficulty: "Medium",
    category: "Window Functions",
    businessScenario: "Rank products by price. Tied prices should receive the same rank, but the query assigns different ranks to identical prices.",
    flawedQuery: `-- ROW_NUMBER always generates unique sequential numbers
SELECT product_name, list_price,
  ROW_NUMBER() OVER (ORDER BY list_price DESC) as price_rank
FROM products;`,
    solutionQuery: `SELECT product_name, list_price,
  DENSE_RANK() OVER (ORDER BY list_price DESC) as price_rank
FROM products;`,
    hint: "ROW_NUMBER assigns a unique sequence number. What function assigns the same rank to duplicate values without leaving gaps?",
    mistakeExplanation: "ROW_NUMBER() is strict and always increments sequentially, ignoring ties. To assign identical ranks to identical values without skipping numbers, DENSE_RANK() should be used."
  },
  {
    id: "pz-59",
    dayId: 8,
    title: "COUNT Null Value Trap",
    difficulty: "Medium",
    category: "Aggregation",
    businessScenario: "Count how many orders received a discount. The query returns all orders even if they had a discount of 0.0.",
    flawedQuery: `-- This counts the row if discount_amount is 0.0
SELECT COUNT(discount_amount) as discounted_orders
FROM orders;`,
    solutionQuery: `SELECT COUNT(CASE WHEN discount_amount > 0 THEN 1 END) as discounted_orders
FROM orders;`,
    hint: "COUNT(col) counts all non-null values. A value of 0.0 is not null. Use conditional aggregation.",
    mistakeExplanation: "COUNT(column) counts every row where the column is not NULL. Because 0.0 is a non-null number, it gets counted. To count only orders with actual discounts, use a CASE WHEN clause to filter values greater than 0."
  },
  {
    id: "pz-60",
    dayId: 10,
    title: "Grouping By Unaggregated Field",
    difficulty: "Medium",
    category: "Syntax & Logic",
    businessScenario: "Count the number of signups per year. The query displays identical years in separate rows.",
    flawedQuery: `-- Grouping by the raw column instead of the extracted year
SELECT SUBSTR(signup_date, 1, 4) as signup_year, COUNT(*) as count
FROM customers
GROUP BY signup_date;`,
    solutionQuery: `SELECT SUBSTR(signup_date, 1, 4) as signup_year, COUNT(*) as count
FROM customers
GROUP BY SUBSTR(signup_date, 1, 4);`,
    hint: "You are grouping by the full signup_date, but selecting only the year. You must group by the same expression you selected.",
    mistakeExplanation: "Grouping by the daily signup_date creates groups at the day grain, but since you only select the year, the output has duplicate year rows. You must group by the exact year expression or its alias."
  }
];
