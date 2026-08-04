import { PracticeProblem } from "./curriculum";

export const problemsBatch1: Record<number, PracticeProblem[]> = {
  // MODULE 1: Introduction to SQL & SELECT
  1: [
    {
      id: "m1-p1",
      moduleId: 1,
      difficulty: "Easy",
      title: "Explore the customers table",
      businessScenario:
        "You just joined Flipkart as a data analyst intern. Your manager asks you to " +
        "look at the customers table to understand its structure.",
      prompt:
        "Click Run to retrieve ALL columns from the customers table and inspect its structure.",
      starterQuery: "SELECT ??? FROM customers;",
      solution: "SELECT * FROM customers;",
      hints: [
        "SELECT * means",
        "— useful for exploring a new table.",
        "Structure your query using clauses similar to: SELECT * FROM customers;.",
      ],
      detailedExplanation:
        "SELECT * FROM table is the first query any analyst runs. The * wildcard returns " +
        "every column.",
      alternativeApproach: "None.",
      performanceNotes: "Avoid SELECT * in production on wide tables.",
      concepts: ["SELECT *", "table exploration"],
      companyTags: ["Flipkart"],
    },
    {
      id: "m1-p2",
      moduleId: 1,
      difficulty: "Medium",
      title: "Preview the products catalog",
      businessScenario:
        "The data engineering lead at Swiggy asks you to verify the structure and sample " +
        "records of the products catalog.",
      prompt:
        "Click Run to retrieve all columns from the products table and preview its structure.",
      starterQuery: "SELECT ???\nFROM ???\nWHERE ???;",
      solution: "SELECT * FROM products;",
      hints: [
        "Use SELECT * to fetch all columns from the products table.",
        "Apply standard filtering and analytical clauses to isolate the exact target dataset.",
        "Structure your query using clauses similar to: SELECT * FROM products;.",
      ],
      detailedExplanation: "SELECT * returns all columns of a table.",
      alternativeApproach: "None.",
      performanceNotes: "Selecting all columns is fine for exploration.",
      concepts: ["SELECT *", "table exploration"],
      companyTags: ["Swiggy"],
    },
    {
      id: "m1-p3",
      moduleId: 1,
      difficulty: "Hard",
      title: "Pinpoint high-value delivered orders from the top channel",
      businessScenario:
        "A finance analyst at Myntra needs a concise snapshot: show only the 5 " +
        "highest-value delivered orders that came through the App channel, including a " +
        "computed net_amount column.",
      prompt:
        "Write a query to return order_id, order_date, channel, total_amount, " +
        "discount_amount, and a computed column net_amount (total_amount minus " +
        "discount_amount) from the orders table. Filter to rows where status = " +
        "'Delivered' AND channel = 'App'. Sort by net_amount descending and return only " +
        "the top 5.",
      starterQuery:
        "SELECT order_id, order_date, channel, total_amount, discount_amount, ??? - ??? AS net_amount FROM orders WHERE status = '???' AND channel = '???' ORDER BY ??? DESC LIMIT ???;",
      solution:
        "SELECT order_id, order_date, channel, total_amount, discount_amount, " +
        "total_amount - discount_amount AS net_amount FROM orders WHERE status = " +
        "'Delivered' AND channel = 'App' ORDER BY net_amount DESC LIMIT 5;",
      hints: [
        "Construct a SELECT query returning order columns and a subtracted column total_amount - discount_amount AS net_amount.",
        "Filter for status = 'Delivered' AND channel = 'App'.",
        "Structure your query: SELECT order_id, order_date, channel, total_amount, discount_amount, total_amount - discount_amount AS net_amount FROM orders WHERE status = 'Delivered' AND channel = 'App' ORDER BY net_amount DESC LIMIT 5;",
      ],
      detailedExplanation:
        "This combines explicit column selection, derived column arithmetic, " +
        "multi-condition WHERE filtering, ORDER BY on a computed column, and LIMIT into " +
        "one statement — the building blocks used in every production dashboard query.",
      alternativeApproach:
        "You can alias the subtraction in SELECT and reference the alias in ORDER BY " +
        "because MySQL evaluates aliases before ORDER BY.",
      performanceNotes:
        "The WHERE filter on status and channel reduces the scanned rows before sorting, " +
        "which makes ORDER BY + LIMIT very fast.",
      concepts: [
        "SELECT",
        "computed columns",
        "WHERE",
        "AND",
        "ORDER BY",
        "LIMIT",
      ],
      companyTags: ["Myntra"],
    },
  ],

  // MODULE 2: Filtering with WHERE
  2: [
    {
      id: "m2-p1",
      moduleId: 2,
      difficulty: "Easy",
      title: "Find delivered orders",
      businessScenario:
        "The fulfillment team at Flipkart needs a list of all successfully delivered orders.",
      prompt:
        "Write a query to retrieve all columns from the orders table where the status is 'Delivered'.",
      starterQuery: "SELECT * FROM orders WHERE status = '???';",
      solution: "SELECT * FROM orders WHERE status = 'Delivered';",
      hints: [
        "Query the orders table to inspect the delivery status of each transaction.",
        "Add a WHERE clause to filter rows: WHERE status = 'Delivered'.",
        "Structure your query: SELECT * FROM orders WHERE status = 'Delivered';",
      ],
      detailedExplanation:
        "The WHERE clause filters table records based on row values, returning only rows where status exactly equals 'Delivered'.",
      alternativeApproach: "None.",
      performanceNotes: "Index on status column speeds this query.",
      concepts: ["WHERE", "filtering"],
      companyTags: ["Flipkart"],
    },
    {
      id: "m2-p2",
      moduleId: 2,
      difficulty: "Medium",
      title: "High-value delivered orders",
      businessScenario:
        "Finance needs all delivered orders exceeding ₹5000 for premium segment analysis.",
      prompt:
        "Write a query to retrieve order_id, customer_id, total_amount, and status from " +
        "the orders table where status = 'Delivered' AND total_amount > 5000. Order by " +
        "total_amount descending.",
      starterQuery: "SELECT ???\nFROM ???\nWHERE ???;",
      solution:
        "SELECT order_id, customer_id, total_amount, status FROM orders WHERE status = " +
        "'Delivered' AND total_amount > 5000 ORDER BY total_amount DESC;",
      hints: [
        "Select order_id, customer_id, total_amount, and status from the orders table.",
        "Combine two conditions using AND: status = 'Delivered' AND total_amount > 5000.",
        "Structure your query: SELECT order_id, customer_id, total_amount, status FROM orders WHERE status = 'Delivered' AND total_amount > 5000 ORDER BY total_amount DESC;",
      ],
      detailedExplanation:
        "Multiple WHERE conditions are chained using the AND keyword, requiring every matching row to satisfy both the status constraint and the price threshold.",
      alternativeApproach: "None.",
      performanceNotes: "Compound index on (status, total_amount) would help.",
      concepts: ["WHERE", "AND", "ORDER BY"],
      companyTags: ["Flipkart"],
    },
    {
      id: "m2-p3",
      moduleId: 2,
      difficulty: "Hard",
      title: "Delivered large orders in 2024",
      businessScenario:
        "Marketing wants a list of high-value delivered transactions in 2024 for a revenue report.",
      prompt:
        "Write a query to retrieve order_id, customer_id, total_amount, and order_date from " +
        "the orders table for orders where status = 'Delivered', total_amount > 3000, and " +
        "order_date >= '2024-01-01'. Order by order_date descending, then total_amount descending.",
      starterQuery: "SELECT ???\nFROM ???\nWHERE ???;",
      solution:
        "SELECT order_id, customer_id, total_amount, order_date FROM orders WHERE status = " +
        "'Delivered' AND total_amount > 3000 AND order_date >= '2024-01-01' ORDER BY " +
        "order_date DESC, total_amount DESC;",
      hints: [
        "Select order_id, customer_id, total_amount, order_date from orders.",
        "Combine status = 'Delivered', total_amount > 3000, and order_date >= '2024-01-01'.",
        "Structure your query: SELECT order_id, customer_id, total_amount, order_date FROM orders WHERE status = 'Delivered' AND total_amount > 3000 AND order_date >= '2024-01-01' ORDER BY order_date DESC, total_amount DESC;",
      ],
      detailedExplanation:
        "Evaluates single-table WHERE filtering with multiple conditions across string, numeric, and date data types.",
      alternativeApproach: "None.",
      performanceNotes:
        "An index on (status, order_date, total_amount) ensures optimal performance.",
      concepts: ["WHERE", "AND", "ORDER BY", "multi-condition filter"],
      companyTags: ["Amazon"],
    },
  ],

  // MODULE 3: Sorting Results with ORDER BY
  3: [
    {
      id: "m3-p1",
      moduleId: 3,
      difficulty: "Easy",
      title: "Sort customers by signup date",
      businessScenario:
        "The growth team wants to see customer signup details ordered chronologically.",
      prompt:
        "Write a query to retrieve customer_id, full_name, city, and signup_date from the customers table, sorted by signup_date ascending.",
      starterQuery:
        "SELECT customer_id, full_name, city, signup_date FROM customers ORDER BY ???;",
      solution:
        "SELECT customer_id, full_name, city, signup_date FROM customers ORDER BY signup_date ASC;",
      hints: [
        "Select customer_id, full_name, city, and signup_date from the customers table.",
        "Order rows chronologically by signup_date ascending using ORDER BY signup_date ASC.",
        "Structure your query: SELECT customer_id, full_name, city, signup_date FROM customers ORDER BY signup_date ASC;",
      ],
      detailedExplanation:
        "ORDER BY signup_date ASC sorts the output rows chronologically, placing the earliest acquisition dates at the top of the result set.",
      alternativeApproach: "None.",
      performanceNotes: "Index on signup_date speeds sorting.",
      concepts: ["ORDER BY", "ASC"],
      companyTags: ["Flipkart"],
    },
    {
      id: "m3-p2",
      moduleId: 3,
      difficulty: "Medium",
      title: "Top orders by value",
      businessScenario:
        "The finance team needs orders ranked from highest to lowest value.",
      prompt:
        "Write a query to retrieve order_id, customer_id, total_amount, and status from " +
        "the orders table, sorted by total_amount descending, then order_id ascending.",
      starterQuery: "SELECT ???\nFROM ???\nWHERE ???;",
      solution:
        "SELECT order_id, customer_id, total_amount, status FROM orders ORDER BY " +
        "total_amount DESC, order_id ASC;",
      hints: [
        "Use multiple columns in ORDER BY separated by commas.",
        "Apply standard filtering and analytical clauses to isolate the exact target dataset.",
        "Structure your query using clauses similar to: SELECT order_id, customer_id, total_amount, status FROM orders ORDER BY.",
      ],
      detailedExplanation:
        "Multi-column ORDER BY sorts by the first column, then breaks ties using the second.",
      alternativeApproach: "None.",
      performanceNotes:
        "Compound index on (total_amount, order_id) speeds sorting.",
      concepts: ["ORDER BY", "DESC", "multi-column sort"],
      companyTags: ["Zomato"],
    },
    {
      id: "m3-p3",
      moduleId: 3,
      difficulty: "Hard",
      title: "Employee salary & department directory sorting",
      businessScenario:
        "HR operations needs a sorted employee directory categorized by department and salary tier for performance evaluations.",
      prompt:
        "Write a query to retrieve employee_id, employee_name, department_id, and salary_lpa from the employees table. Sort the results primarily by department_id ascending, then by salary_lpa descending, and finally by employee_id ascending.",
      starterQuery:
        "SELECT employee_id, employee_name, department_id, salary_lpa\nFROM employees\nORDER BY ???;",
      solution:
        "SELECT employee_id, employee_name, department_id, salary_lpa FROM employees ORDER BY department_id ASC, salary_lpa DESC, employee_id ASC;",
      hints: [
        "Select the required columns: employee_id, employee_name, department_id, salary_lpa from the employees table.",
        "Apply multi-column sorting tiers sequentially: department_id ASC, salary_lpa DESC, employee_id ASC.",
        "Structure your query: SELECT employee_id, employee_name, department_id, salary_lpa FROM employees ORDER BY department_id ASC, salary_lpa DESC, employee_id ASC;",
      ],
      detailedExplanation:
        "Multi-column ORDER BY applies sorting criteria in order. It groups employees by department_id ascending, ranks employees within each department by salary_lpa descending, and breaks any salary ties by employee_id ascending.",
      alternativeApproach: "None.",
      performanceNotes:
        "Compound index on employees(department_id, salary_lpa) optimizes execution.",
      concepts: ["ORDER BY", "DESC", "ASC", "multi-column sort"],
      companyTags: ["TCS"],
    },
  ],

  // MODULE 4: Limiting Results
  4: [
    {
      id: "m4-p1",
      moduleId: 4,
      difficulty: "Easy",
      title: "Get the first 10 orders",
      businessScenario:
        "For a dashboard preview on Flipkart, fetch a sample of the first 10 orders placed.",
      prompt:
        "Write a query to select all columns from the orders table, sorted by order_date " +
        "ascending, and limit the results to the first 10 rows.",
      starterQuery:
        "SELECT *\nFROM orders\nORDER BY order_date ASC\nLIMIT ???;",
      solution: "SELECT *\nFROM orders\nORDER BY order_date ASC\nLIMIT 10;",
      hints: [
        "Use LIMIT followed by the number of rows: LIMIT 10.",
        "Apply standard filtering and analytical clauses to isolate the exact target dataset.",
        "Structure your query using clauses similar to: SELECT *\nFROM orders\nORDER BY order_date ASC\nLIMIT 10;.",
      ],
      detailedExplanation:
        "LIMIT restricts the maximum number of rows returned.",
      alternativeApproach: "None.",
      performanceNotes:
        "Highly performant as MySQL stops execution once 10 rows are found.",
      concepts: ["LIMIT", "ORDER BY"],
      companyTags: ["Flipkart"],
    },
    {
      id: "m4-p2",
      moduleId: 4,
      difficulty: "Medium",
      title: "Paginate orders: get rows 11 to 20",
      businessScenario:
        "Flipkart's transaction list page supports pagination. Implement a query to load " +
        "the second page of orders.",
      prompt:
        "Write a query to retrieve all columns from the orders table, sorted by " +
        "order_date ascending, returning 10 rows starting from row 11 (skip the first 10 " +
        "rows using OFFSET).",
      starterQuery:
        "SELECT *\nFROM orders\nORDER BY order_date ASC\nLIMIT ??? OFFSET ???;",
      solution:
        "SELECT *\nFROM orders\nORDER BY order_date ASC\nLIMIT 10 OFFSET 10;",
      hints: [
        "Use LIMIT 10 OFFSET 10 to skip the first 10 rows and return the next 10.",
        "Apply standard filtering and analytical clauses to isolate the exact target dataset.",
        "Structure your query using clauses similar to: SELECT *\nFROM orders\nORDER BY order_date ASC\nLIMIT 10 OFFSET 10;.",
      ],
      detailedExplanation:
        "OFFSET skips a specified number of rows before returning the limited rows.",
      alternativeApproach:
        "Use LIMIT 10, 10 (MySQL comma syntax: LIMIT offset, limit).",
      performanceNotes:
        "OFFSET still scans the skipped rows; high offsets can be slow.",
      concepts: ["LIMIT", "OFFSET"],
      companyTags: ["Flipkart"],
    },
    {
      id: "m4-p3",
      moduleId: 4,
      difficulty: "Hard",
      title: "Find the 3rd most expensive product",
      businessScenario:
        "Croma needs to retrieve the single product that has the 3rd highest list price " +
        "in the product catalog for a budget feature.",
      prompt:
        "Write a query to find the product_name and list_price of the product with the " +
        "3rd highest list_price. Order by list_price descending, and use LIMIT and OFFSET " +
        "to get exactly the 3rd product.",
      starterQuery:
        "SELECT product_name, list_price FROM products ORDER BY list_price ??? LIMIT ??? OFFSET ???;",
      solution:
        "SELECT product_name, list_price\nFROM products\nORDER BY list_price DESC\nLIMIT 1 OFFSET 2;",
      hints: [
        "To get the 3rd item, sort DESC, then use LIMIT 1 (return 1 row) and OFFSET 2 (skip the top 2).",
        "Apply standard filtering and analytical clauses to isolate the exact target dataset.",
        "Structure your query using clauses similar to: SELECT product_name, list_price\nFROM products\nORDER BY list_price DESC\nLIMIT 1 OFFSET 2;.",
      ],
      detailedExplanation:
        "Combining ORDER BY, LIMIT 1, and OFFSET 2 allows you to target any specific row rank.",
      alternativeApproach: "None.",
      performanceNotes:
        "Scanning and sorting the entire products catalog is fast for normal size tables.",
      concepts: ["LIMIT", "OFFSET", "ORDER BY"],
      companyTags: ["Croma"],
    },
  ],

  // MODULE 5: NULL Handling
  5: [
    {
      id: "m5-p1",
      moduleId: 5,
      difficulty: "Easy",
      title: "Find active subscriptions",
      businessScenario:
        "Hotstar wants to identify active subscribers. Active subscriptions do not have an end_date.",
      prompt:
        "Write a query to retrieve all columns from the subscriptions table where end_date IS NULL.",
      starterQuery: "SELECT *\nFROM subscriptions\nWHERE end_date IS ???;",
      solution: "SELECT * FROM subscriptions WHERE end_date IS NULL;",
      hints: [
        "Use IS NULL to test for NULL values. Do NOT use = NULL.",
        "Filter your result set using WHERE conditions to isolate the target criteria.",
        "Structure your query using clauses similar to: SELECT * FROM subscriptions WHERE end_date IS NULL;.",
      ],
      detailedExplanation:
        "NULL represents a missing or unknown value. It cannot be compared using normal operators.",
      alternativeApproach: "None.",
      performanceNotes: "Unindexed IS NULL checks result in full table scans.",
      concepts: ["IS NULL", "NULL"],
      companyTags: ["Hotstar"],
    },
    {
      id: "m5-p2",
      moduleId: 5,
      difficulty: "Medium",
      title: "Customers with missing region",
      businessScenario:
        "The operations team at Blinkit wants to audit active customer records to " +
        "identify accounts missing region information.",
      prompt:
        "Write a query to retrieve customer_id and full_name from the customers table " +
        "where region is NULL or empty (in MySQL: region IS NULL OR region = ''). Order by " +
        "customer_id ascending.",
      starterQuery: "SELECT ???\nFROM ???\nWHERE ???;",
      solution:
        "SELECT customer_id, full_name FROM customers WHERE region IS NULL OR region = '' ORDER BY customer_id;",
      hints: [
        "Audit customer records for missing region values.",
        "Use IS NULL OR region = '' in the WHERE clause.",
        "Structure your query: SELECT customer_id, full_name FROM customers WHERE region IS NULL OR region = '' ORDER BY customer_id;",
      ],
      detailedExplanation:
        "NULL represents missing data; empty string represents initialized but empty values. Both must be audited.",
      alternativeApproach: "None.",
      performanceNotes:
        "Checking both conditions ensures 100% data audit coverage.",
      concepts: ["NULL", "IS NULL", "empty strings"],
      companyTags: ["Blinkit"],
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
        "subscription_id ascending.",
      starterQuery:
        "SELECT subscription_id, COALESCE(???, '???') as end_status FROM subscriptions;",
      solution:
        "SELECT subscription_id, customer_id, plan_name, COALESCE(end_date, 'Active') AS " +
        "end_status FROM subscriptions ORDER BY subscription_id;",
      hints: [
        "Replace NULL values in end_date with a fallback status label.",
        "Use COALESCE(end_date, 'Active') AS end_status in your SELECT projection.",
        "Structure your query: SELECT subscription_id, customer_id, plan_name, COALESCE(end_date, 'Active') AS end_status FROM subscriptions ORDER BY subscription_id;",
      ],
      detailedExplanation:
        "COALESCE evaluates arguments in order and returns the first non-NULL value.",
      alternativeApproach:
        "Use CASE WHEN end_date IS NULL THEN 'Active' ELSE end_date END.",
      performanceNotes: "Calculations run per row, practically instantaneous.",
      concepts: ["COALESCE", "NULL", "ORDER BY"],
      companyTags: ["Hotstar"],
    },
  ],

  // MODULE 6: Pattern Matching with LIKE
  6: [
    {
      id: "m6-p1",
      moduleId: 6,
      difficulty: "Easy",
      title: "Standardise customer names to uppercase",
      businessScenario:
        "Ensure all customer names are capitalized consistently in marketing email outputs.",
      prompt:
        "Write a query on the customers table to return customer_id, full_name, and an " +
        "uppercase name (aliased as 'upper_name'). Order by customer_id ascending.",
      starterQuery:
        "SELECT customer_id, full_name, UPPER(full_name) AS upper_name FROM customers ORDER BY ???;",
      solution:
        "SELECT customer_id, full_name, UPPER(full_name) AS upper_name FROM customers ORDER BY customer_id;",
      hints: [
        "Use UPPER(column) to convert a string to uppercase.",
        "Alias the result as upper_name.",
        "Structure your query using clauses similar to: SELECT customer_id, full_name, UPPER(full_name) AS upper_name FROM customers ORDER BY customer_id;.",
      ],
      detailedExplanation:
        "UPPER converts string input to uppercase. Highly standard across SQL dialects.",
      alternativeApproach: "None.",
      performanceNotes: "Runs per row in SELECT, very fast.",
      concepts: ["UPPER", "string functions"],
      companyTags: ["Flipkart"],
    },
    {
      id: "m6-p2",
      moduleId: 6,
      difficulty: "Medium",
      title: "Extract first name of customers",
      businessScenario:
        "The personalized marketing team wants to address customers by their first name " +
        "in email templates.",
      prompt:
        "Write a MySQL query on the customers table to extract the first name from the " +
        "full_name column. Use MySQL's SUBSTRING_INDEX() function to return the text " +
        "before the first space. Return customer_id, full_name, and first_name " +
        "(aliased as 'first_name'). Order by customer_id ascending.",
      starterQuery:
        "SELECT customer_id, full_name, SUBSTRING_INDEX(full_name, ' ', ???) AS first_name\nFROM customers\nORDER BY customer_id;",
      solution:
        "SELECT customer_id, full_name, SUBSTRING_INDEX(full_name, ' ', 1) " +
        "AS first_name FROM customers ORDER BY customer_id;",
      hints: [
        "Use SUBSTRING_INDEX(full_name, ' ', 1) to extract text prior to the first space character.",
        "Alias the extracted column as first_name.",
        "Structure your query: SELECT customer_id, full_name, SUBSTRING_INDEX(full_name, ' ', 1) AS first_name FROM customers ORDER BY customer_id;",
      ],
      detailedExplanation:
        "SUBSTRING_INDEX(full_name, ' ', 1) extracts the substring preceding the first delimiter match (a space character), effectively returning the customer's first name.",
      alternativeApproach: "None.",
      performanceNotes: "Highly optimized string operations.",
      concepts: ["SUBSTRING_INDEX", "string functions", "MySQL"],
      companyTags: ["Swiggy"],
    },
    {
      id: "m6-p3",
      moduleId: 6,
      difficulty: "Hard",
      title: "Build a customer initial + city code",
      businessScenario:
        "Marketing wants a unique tracking code for each customer: the uppercase first " +
        "letter of their name, followed by a hyphen, and the first 3 letters of their " +
        "city in uppercase.",
      prompt:
        "Write a query to retrieve customer_id, full_name, city, and a computed column " +
        "tracking_code. tracking_code is: uppercase first character of full_name, a " +
        "hyphen '-', and the first 3 characters of city in uppercase. Order by " +
        "customer_id ascending.",
      starterQuery:
        "SELECT full_name, CONCAT(SUBSTR(???, 1, 1), '-', UPPER(???)) as c_code FROM customers;",
      solution:
        "SELECT customer_id, full_name, city, CONCAT(UPPER(SUBSTR(full_name, 1, 1)), '-', " +
        "UPPER(SUBSTR(city, 1, 3))) AS tracking_code FROM customers ORDER BY customer_id;",
      hints: [
        "Use SUBSTR to get character slices.",
        "Use MySQL CONCAT() to join the string pieces.",
        "Use UPPER to make it uppercase.",
      ],
      detailedExplanation:
        "We extract segments using SUBSTR, uppercase them with UPPER, and stitch them " +
        "with MySQL CONCAT().",
      alternativeApproach: "None.",
      performanceNotes: "Computed entirely in CPU during output projection.",
      concepts: ["SUBSTR", "UPPER", "CONCAT", "string composition"],
      companyTags: ["Flipkart"],
    },
  ],

  // MODULE 7: Set Membership with IN
  7: [
    {
      id: "m7-p1",
      moduleId: 7,
      difficulty: "Easy",
      title: "Filter customers by segment using IN",
      businessScenario:
        "Identify specific segments of customers for loyalty programs.",
      prompt:
        "Write a query to find customers who belong to the 'Premium' or 'Student' " +
        "segment. Return customer_id, full_name, and segment. Order by customer_id ascending.",
      starterQuery:
        "SELECT customer_id, full_name, segment FROM customers WHERE segment IN ('???', " +
        "'???') ORDER BY customer_id;",
      solution:
        "SELECT customer_id, full_name, segment FROM customers WHERE segment IN " +
        "('Premium', 'Student') ORDER BY customer_id;",
      hints: [
        "Use the IN operator to filter rows matching a set of target strings.",
        "Filter for segment IN ('Premium', 'Student').",
        "Structure your query: SELECT customer_id, full_name, segment FROM customers WHERE segment IN ('Premium', 'Student') ORDER BY customer_id;",
      ],
      detailedExplanation:
        "The IN operator tests set membership, matching rows where the segment column equals either 'Premium' or 'Student'.",
      alternativeApproach:
        "Use OR: segment = 'Premium' OR segment = 'Student'.",
      performanceNotes: "Uses segment indexes where available.",
      concepts: ["IN", "WHERE", "ORDER BY"],
      companyTags: ["Flipkart"],
    },
    {
      id: "m7-p2",
      moduleId: 7,
      difficulty: "Medium",
      title: "Active buyers in primary hubs",
      businessScenario:
        "The logistics manager wants to filter orders placed in the primary hubs: Delhi, " +
        "Mumbai, and Bengaluru.",
      prompt:
        "Write a query to retrieve customer_id, full_name, and city from the customers " +
        "table where the city is either 'Delhi', 'Mumbai', or 'Bengaluru'. Order by city " +
        "alphabetically.",
      starterQuery:
        "SELECT customer_id, full_name, city\nFROM customers\nWHERE city IN ('???', '???', '???')\nORDER BY city ASC;",
      solution:
        "SELECT customer_id, full_name, city FROM customers WHERE city IN ('Delhi', " +
        "'Mumbai', 'Bengaluru') ORDER BY city ASC;",
      hints: [
        "Select customer_id, full_name, and city from the customers table.",
        "Filter for cities in Delhi, Mumbai, or Bengaluru using WHERE city IN ('Delhi', 'Mumbai', 'Bengaluru').",
        "Structure your query: SELECT customer_id, full_name, city FROM customers WHERE city IN ('Delhi', 'Mumbai', 'Bengaluru') ORDER BY city ASC;",
      ],
      detailedExplanation:
        "Using IN ('Delhi', 'Mumbai', 'Bengaluru') allows concise set membership filtering across multiple city values.",
      alternativeApproach:
        "WHERE city = 'Delhi' OR city = 'Mumbai' OR city = 'Bengaluru'.",
      performanceNotes: "IN is highly optimized.",
      concepts: ["IN", "WHERE"],
      companyTags: ["Swiggy"],
    },
    {
      id: "m7-p3",
      moduleId: 7,
      difficulty: "Hard",
      title: "Unresolved payments from premium channels",
      businessScenario:
        "Finance wants to audit successful payments that did not originate from the most " +
        "common automated modes: 'Cash', 'Cheque'.",
      prompt:
        "Write a query to retrieve payment_id, order_id, payment_mode, and amount from " +
        "payments where payment_status = 'Success' and payment_mode NOT IN ('Cash', " +
        "'Cheque'). Order by amount descending.",
      starterQuery:
        "SELECT payment_id, order_id, payment_mode, amount\nFROM payments\nWHERE payment_status = 'Success' AND payment_mode NOT IN ('???', '???')\nORDER BY amount DESC;",
      solution:
        "SELECT payment_id, order_id, payment_mode, amount FROM payments WHERE " +
        "payment_status = 'Success' AND payment_mode NOT IN ('Cash', 'Cheque') ORDER BY " +
        "amount DESC;",
      hints: [
        "Filter payments where payment_status = 'Success'.",
        "Exclude payment modes Cash and Cheque using payment_mode NOT IN ('Cash', 'Cheque').",
        "Structure your query: SELECT payment_id, order_id, payment_mode, amount FROM payments WHERE payment_status = 'Success' AND payment_mode NOT IN ('Cash', 'Cheque') ORDER BY amount DESC;",
      ],
      detailedExplanation:
        "NOT IN checks that a column value does not match any item in the specified exclusion set.",
      alternativeApproach: "None.",
      performanceNotes: "Ensure payment_mode is indexed.",
      concepts: ["NOT IN", "WHERE", "ORDER BY"],
      companyTags: ["Paytm"],
    },
  ],

  // MODULE 8: Range Filtering with BETWEEN
  8: [
    {
      id: "m8-p1",
      moduleId: 8,
      difficulty: "Easy",
      title: "Filter orders within a date range using BETWEEN",
      businessScenario:
        "Flipkart's marketing team wants to audit order transactions placed during the " +
        "first quarter (Q1) of 2024.",
      prompt:
        "Write a query to retrieve order_id, customer_id, order_date, and total_amount " +
        "from the orders table where order_date is between '2024-01-01' and '2024-03-31' " +
        "inclusive. Order by order_date ascending.",
      starterQuery:
        "SELECT order_id, customer_id, order_date, total_amount FROM orders WHERE " +
        "order_date BETWEEN '???' AND '???' ORDER BY order_date;",
      solution:
        "SELECT order_id, customer_id, order_date, total_amount FROM orders WHERE " +
        "order_date BETWEEN '2024-01-01' AND '2024-03-31' ORDER BY order_date;",
      hints: [
        "Select order_id, customer_id, order_date, and total_amount from the orders table.",
        "Filter dates within Q1 using BETWEEN '2024-01-01' AND '2024-03-31'.",
        "Structure your query: SELECT order_id, customer_id, order_date, total_amount FROM orders WHERE order_date BETWEEN '2024-01-01' AND '2024-03-31' ORDER BY order_date;",
      ],
      detailedExplanation:
        "The BETWEEN operator performs an inclusive range check on dates, evaluating rows where order_date falls on or between the specified bounds.",
      alternativeApproach: "Use >= and <= operators.",
      performanceNotes: "Uses the order_date index.",
      concepts: ["BETWEEN", "WHERE", "date filtering"],
      companyTags: ["Flipkart"],
    },
    {
      id: "m8-p2",
      moduleId: 8,
      difficulty: "Medium",
      title: "Extract month from order dates",
      businessScenario:
        "The revenue team needs to group orders by month for sales trends.",
      prompt:
        "Write a query on the orders table to select order_id, customer_id, order_date, " +
        "and a computed column order_month (using SUBSTR(order_date, 1, 7)). Filter to " +
        "orders placed between '2024-01-01' and '2024-06-30'. Order by order_date ascending.",
      starterQuery:
        "SELECT order_id, customer_id, order_date, SUBSTR(order_date, 1, 7) AS order_month\nFROM orders\nWHERE order_date BETWEEN '???' AND '???'\nORDER BY order_date;",
      solution:
        "SELECT order_id, customer_id, order_date, SUBSTR(order_date, 1, 7) AS " +
        "order_month FROM orders WHERE order_date BETWEEN '2024-01-01' AND '2024-06-30' " +
        "ORDER BY order_date;",
      hints: [
        "Use SUBSTR(order_date, 1, 7) to extract the 'YYYY-MM' month prefix.",
        "Filter the date range using order_date BETWEEN '2024-01-01' AND '2024-06-30'.",
        "Structure your query: SELECT order_id, customer_id, order_date, SUBSTR(order_date, 1, 7) AS order_month FROM orders WHERE order_date BETWEEN '2024-01-01' AND '2024-06-30' ORDER BY order_date;",
      ],
      detailedExplanation:
        "SUBSTR(order_date, 1, 7) extracts the 7-character year-month string segment while BETWEEN filters records chronologically.",
      alternativeApproach: "None.",
      performanceNotes: "Fast date extraction using range checks.",
      concepts: ["SUBSTR", "BETWEEN", "Date Extraction"],
      companyTags: ["Flipkart"],
    },
    {
      id: "m8-p3",
      moduleId: 8,
      difficulty: "Hard",
      title: "Weekend order volume by city in 2024",
      businessScenario:
        "The growth team at Blinkit wants to understand which cities generate the most " +
        "weekend transaction volume — to decide where to run weekend flash sales in 2024.",
      prompt:
        "Write a query joining orders and customers on customer_id. Filter to orders " +
        "placed in 2024 (order_date BETWEEN '2024-01-01' AND '2024-12-31') AND on a " +
        "weekend (DAYOFWEEK(order_date) IN (1, 7)). Group by city. Return city, " +
        "weekend_orders (COUNT of order_id), and total_weekend_revenue (SUM of " +
        "total_amount, rounded to 2 decimal places). Order by weekend_orders descending.",
      starterQuery:
        "SELECT c.city, COUNT(???) as weekend_orders FROM customers c JOIN orders o ON c.customer_id = o.customer_id WHERE strftime('???', o.order_date) IN (???) AND SUBSTR(o.order_date, 1, 4) = '???' GROUP BY ??? ORDER BY weekend_orders DESC;",
      solution:
        "SELECT c.city, COUNT(o.order_id) AS weekend_orders, ROUND(SUM(o.total_amount), " +
        "2) AS total_weekend_revenue FROM orders o INNER JOIN customers c ON " +
        "o.customer_id = c.customer_id WHERE o.order_date BETWEEN '2024-01-01' AND " +
        "'2024-12-31' AND DAYOFWEEK(o.order_date) IN (1, 7) GROUP BY c.city " +
        "ORDER BY weekend_orders DESC;",
      hints: [
        "Filter 2024 weekend transactions using BETWEEN '2024-01-01' AND '2024-12-31' AND DAYOFWEEK(order_date) IN (1, 7).",
        "JOIN customers ON customer_id and GROUP BY city to aggregate COUNT(order_id) and ROUND(SUM(total_amount), 2).",
        "Structure your query: SELECT c.city, COUNT(o.order_id) AS weekend_orders, ROUND(SUM(o.total_amount), 2) AS total_weekend_revenue FROM orders o INNER JOIN customers c ON o.customer_id = c.customer_id WHERE o.order_date BETWEEN '2024-01-01' AND '2024-12-31' AND DAYOFWEEK(o.order_date) IN (1, 7) GROUP BY c.city ORDER BY weekend_orders DESC;",
      ],
      detailedExplanation:
        "This combines date range filtering (BETWEEN), MySQL date extraction " +
        "(DAYOFWEEK), INNER JOIN across tables, GROUP BY aggregation, COUNT, SUM, ROUND, " +
        "and ORDER BY — a genuine multi-skill analytical query that a data analyst would " +
        "write for a city-level campaign planning task.",
      alternativeApproach:
        "Can also write the date filter as order_date LIKE '2024%' but BETWEEN is more " +
        "explicit and index-friendly.",
      performanceNotes:
        "An index on orders(order_date) speeds the range filter. GROUP BY city runs on a " +
        "small distinct set.",
      concepts: [
        "DAYOFWEEK",
        "date functions",
        "BETWEEN",
        "INNER JOIN",
        "GROUP BY",
        "COUNT",
        "SUM",
        "ORDER BY",
      ],
      companyTags: ["Blinkit"],
    },
  ],

  // MODULE 9: Basic Aggregates - COUNT
  9: [
    {
      id: "m9-p1",
      moduleId: 9,
      difficulty: "Easy",
      title: "Count all orders",
      businessScenario:
        "The operations lead at Flipkart wants a quick total count of all orders in the system.",
      prompt:
        "Write a query to count the total number of rows in the orders table. Alias the result as total_orders.",
      starterQuery: "SELECT ??? FROM orders;",
      solution: "SELECT COUNT(*) AS total_orders FROM orders;",
      hints: [
        "Use COUNT(*) to count all rows, including NULLs.",
        "Apply standard filtering and analytical clauses to isolate the exact target dataset.",
        "Structure your query using clauses similar to: SELECT COUNT(*) AS total_orders FROM orders;.",
      ],
      detailedExplanation:
        "COUNT(*) counts every row in the table regardless of NULL values. It is the " +
        "most common starting point for any aggregate analysis.",
      alternativeApproach:
        "COUNT(order_id) would also work since order_id is never NULL, but COUNT(*) is " +
        "idiomatic for row counts.",
      performanceNotes:
        "COUNT(*) is highly optimized in most databases and only requires a single table scan.",
      concepts: ["COUNT", "aggregation"],
      companyTags: ["Flipkart"],
    },
    {
      id: "m9-p2",
      moduleId: 9,
      difficulty: "Medium",
      title: "Count orders per status",
      businessScenario:
        "The operations team at Swiggy wants to see how many orders exist in each status category.",
      prompt:
        "Write a query to count the number of orders grouped by status. Return status " +
        "and order_count (aliased). Order by order_count descending.",
      starterQuery: "SELECT ???\nFROM ???\nGROUP BY ???\nHAVING ???;",
      solution:
        "SELECT status, COUNT(*) AS order_count FROM orders GROUP BY status ORDER BY order_count DESC;",
      hints: [
        "Use GROUP BY status to aggregate per status.",
        "COUNT(*) counts rows in each group.",
        "Structure your query using clauses similar to: SELECT status, COUNT(*) AS order_count FROM orders GROUP BY status ORDER BY order_count DESC;.",
      ],
      detailedExplanation:
        "Grouping COUNT(*) by a categorical column produces a frequency table — one of " +
        "the most common analytical patterns in SQL.",
      alternativeApproach:
        "You could use COUNT(order_id) since order_id is never NULL; the result would be identical.",
      performanceNotes:
        "GROUP BY requires sorting or hashing. An index on status can speed this up.",
      concepts: ["COUNT", "GROUP BY", "ORDER BY"],
      companyTags: ["Swiggy"],
    },
    {
      id: "m9-p3",
      moduleId: 9,
      difficulty: "Hard",
      title: "Order status volume and buyer coverage",
      businessScenario:
        "The customer analytics team at Zomato wants order volume and customer coverage " +
        "broken down by order status.",
      prompt:
        "Write a query on the orders table grouped by status. Return status, total_orders " +
        "(COUNT of order_id), unique_buyers (COUNT DISTINCT of customer_id), and " +
        "avg_order_value (ROUND of AVG(total_amount) to 2 decimal places). Order by total_orders descending.",
      starterQuery:
        "SELECT status, COUNT(???) as orders_count, COUNT(DISTINCT ???) as unique_buyers FROM orders GROUP BY ???;",
      solution:
        "SELECT status, COUNT(order_id) AS total_orders, COUNT(DISTINCT customer_id) AS " +
        "unique_buyers, ROUND(AVG(total_amount), 2) AS avg_order_value FROM orders GROUP BY " +
        "status ORDER BY total_orders DESC;",
      hints: [
        "GROUP BY status.",
        "COUNT(order_id) for volume; COUNT(DISTINCT customer_id) for unique buyers.",
        "AVG(total_amount) for average order value.",
      ],
      detailedExplanation:
        "Combines COUNT, COUNT DISTINCT, and AVG aggregations grouped by status.",
      alternativeApproach: "None.",
      performanceNotes: "Single pass aggregation over orders table.",
      concepts: ["COUNT", "COUNT DISTINCT", "AVG", "GROUP BY"],
      companyTags: ["Zomato"],
    },
  ],

  // MODULE 10: Summing Data - SUM
  10: [
    {
      id: "m10-p1",
      moduleId: 10,
      difficulty: "Easy",
      title: "Total gross revenue",
      businessScenario:
        "The finance lead at Zomato wants a grand total of gross revenue from all orders.",
      prompt:
        "Write a query to sum total_amount across all orders in the orders table. Alias " +
        "the sum as total_gross_revenue.",
      starterQuery: "SELECT ??? FROM orders;",
      solution: "SELECT SUM(total_amount) AS total_gross_revenue FROM orders;",
      hints: [
        "Use SUM(total_amount).",
        "Apply standard filtering and analytical clauses to isolate the exact target dataset.",
        "Structure your query using clauses similar to: SELECT SUM(total_amount) AS total_gross_revenue FROM orders;.",
      ],
      detailedExplanation: "SUM calculates the total sum of a column.",
      alternativeApproach: "None.",
      performanceNotes: "Single scan on orders table.",
      concepts: ["SUM"],
      companyTags: ["Zomato"],
    },
    {
      id: "m10-p2",
      moduleId: 10,
      difficulty: "Medium",
      title: "Total net revenue for completed orders",
      businessScenario:
        "Calculate the net revenue (total_amount minus discount_amount) from successful transactions.",
      prompt:
        "Write a query to calculate the total net revenue (SUM of total_amount minus " +
        "discount_amount) for orders with a status of 'Delivered'. Alias the result as " +
        "total_net_revenue.",
      starterQuery: "SELECT ???\nFROM ???\nWHERE ???;",
      solution:
        "SELECT SUM(total_amount - discount_amount) AS total_net_revenue FROM orders " +
        "WHERE status = 'Delivered';",
      hints: [
        "Subtract discount_amount inside the SUM function.",
        "Apply standard filtering and analytical clauses to isolate the exact target dataset.",
        "Structure your query using clauses similar to: SELECT SUM(total_amount - discount_amount) AS total_net_revenue FROM orders.",
      ],
      detailedExplanation:
        "SUM evaluates mathematical expressions per row and aggregates.",
      alternativeApproach: "None.",
      performanceNotes: "Fast scan on filtered rows.",
      concepts: ["SUM", "WHERE"],
      companyTags: ["Flipkart"],
    },
    {
      id: "m10-p3",
      moduleId: 10,
      difficulty: "Hard",
      title: "Financial net value summary in 2024",
      businessScenario:
        "The finance lead wants a high-level summary of total net revenue and total " +
        "discounts applied in 2024.",
      prompt:
        "Write a query on the orders table. Calculate the total net revenue (SUM of " +
        "total_amount minus discount_amount) as total_net_revenue, and the total " +
        "discounts given (SUM of discount_amount) as total_discounts. Only include " +
        "delivered orders placed in the year 2024.",
      starterQuery:
        "SELECT SUM(total_amount - COALESCE(???, 0)) as net_revenue FROM orders WHERE SUBSTR(???, 1, 4) = '???';",
      solution:
        "SELECT SUM(total_amount - discount_amount) AS total_net_revenue, " +
        "SUM(discount_amount) AS total_discounts FROM orders WHERE status = 'Delivered' " +
        "AND order_date LIKE '2024%';",
      hints: [
        "Aggregate financial metrics for delivered orders placed in 2024.",
        "Calculate SUM(total_amount - discount_amount) AS total_net_revenue and SUM(discount_amount) AS total_discounts.",
        "Structure your query: SELECT SUM(total_amount - discount_amount) AS total_net_revenue, SUM(discount_amount) AS total_discounts FROM orders WHERE status = 'Delivered' AND order_date LIKE '2024%';",
      ],
      detailedExplanation:
        "Aggregates sums over filtered subset of order transactions.",
      alternativeApproach: "None.",
      performanceNotes: "Aggregates in a single scan.",
      concepts: ["SUM", "Operators", "WHERE"],
      companyTags: ["Zomato"],
    },
  ],
};
