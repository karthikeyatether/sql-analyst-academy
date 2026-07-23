

const problemsBatch1: Record<number, PracticeProblem[]> = {
  // MODULE 1: Introduction to SQL & SELECT
  1: [
    {
      id: "m1-p1", moduleId: 1, difficulty: "Easy",
      title: "Explore the customers table",
            businessScenario: "You just joined Flipkart as a data analyst intern. Your manager asks you to " +
                              "look at the customers table to understand its structure.",
      prompt: "Click Run to retrieve ALL columns from the customers table and inspect its structure.",
      starterQuery: "SELECT ??? FROM customers;",
      solution: "SELECT * FROM customers;",
      hints: ["SELECT * means 'all columns' — useful for exploring a new table."],
            detailedExplanation: "SELECT * FROM table is the first query any analyst runs. The * wildcard returns " +
                                 "every column.",
      alternativeApproach: "None.",
      performanceNotes: "Avoid SELECT * in production on wide tables.",
      concepts: ["SELECT *", "table exploration"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m1-p2", moduleId: 1, difficulty: "Medium",
      title: "Preview the products catalog",
            businessScenario: "The data engineering lead at Swiggy asks you to verify the structure and sample " +
                              "records of the products catalog.",
      prompt: "Click Run to retrieve all columns from the products table and preview its structure.",
      starterQuery: "SELECT ???\nFROM ???\nWHERE ???;",
      solution: "SELECT * FROM products;",
      hints: ["Use SELECT * to fetch all columns from the products table."],
      detailedExplanation: "SELECT * returns all columns of a table.",
      alternativeApproach: "None.",
      performanceNotes: "Selecting all columns is fine for exploration.",
      concepts: ["SELECT *", "table exploration"],
      companyTags: ["Swiggy"]
    },
    {
      id: "m1-p3", moduleId: 1, difficulty: "Hard",
      title: "Pinpoint high-value delivered orders from the top channel",
            businessScenario: "A finance analyst at Myntra needs a concise snapshot: show only the 5 " +
                              "highest-value delivered orders that came through the App channel, including a " +
                              "computed net_amount column.",
            prompt: "Write a query to return order_id, order_date, channel, total_amount, " +
                    "discount_amount, and a computed column net_amount (total_amount minus " +
                    "discount_amount) from the orders table. Filter to rows where status = " +
                    "'Delivered' AND channel = 'App'. Sort by net_amount descending and return only " +
                    "the top 5.",
      starterQuery: "-- Write your SQL query here\n",
            solution: "SELECT order_id, order_date, channel, total_amount, discount_amount, " +
                      "total_amount - discount_amount AS net_amount FROM orders WHERE status = " +
                      "'Delivered' AND channel = 'App' ORDER BY net_amount DESC LIMIT 5;",
      hints: [
        "SELECT: list all required columns plus the computed one.",
        "Compute net_amount directly in SELECT: total_amount - discount_amount AS net_amount.",
        "WHERE: filter status = 'Delivered' AND channel = 'App'.",
        "Sort by the computed column using ORDER BY net_amount DESC.",
        "Use LIMIT 5 to cap results."
      ],
            detailedExplanation: "This combines explicit column selection, derived column arithmetic, " +
                                 "multi-condition WHERE filtering, ORDER BY on a computed column, and LIMIT into " +
                                 "one statement — the building blocks used in every production dashboard query.",
            alternativeApproach: "You can alias the subtraction in SELECT and reference the alias in ORDER BY " +
                                 "because SQLite evaluates aliases before ORDER BY.",
            performanceNotes: "The WHERE filter on status and channel reduces the scanned rows before sorting, " +
                              "which makes ORDER BY + LIMIT very fast.",
      concepts: ["SELECT", "computed columns", "WHERE", "AND", "ORDER BY", "LIMIT"],
      companyTags: ["Myntra"]
    }
  ],

  // MODULE 2: Filtering with WHERE
  2: [
    {
      id: "m2-p1", moduleId: 2, difficulty: "Easy",
      title: "Find delivered orders",
      businessScenario: "The fulfillment team at Flipkart needs a list of all successfully delivered orders.",
      prompt: "Write a query to retrieve all columns from the orders table where the status is 'Delivered'.",
      starterQuery: "SELECT * FROM orders WHERE status = '???';",
      solution: "SELECT * FROM orders WHERE status = 'Delivered';",
      hints: ["Use WHERE status = 'Delivered' with single quotes."],
      detailedExplanation: "WHERE filters rows based on conditions.",
      alternativeApproach: "None.",
      performanceNotes: "Index on status column speeds this query.",
      concepts: ["WHERE", "filtering"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m2-p2", moduleId: 2, difficulty: "Medium",
      title: "High-value delivered orders",
      businessScenario: "Finance needs all delivered orders exceeding ₹5000 for premium segment analysis.",
            prompt: "Write a query to retrieve order_id, customer_id, total_amount, and status from " +
                    "the orders table where status = 'Delivered' AND total_amount > 5000. Order by " +
                    "total_amount descending.",
      starterQuery: "SELECT ???\nFROM ???\nWHERE ???;",
            solution: "SELECT order_id, customer_id, total_amount, status FROM orders WHERE status = " +
                      "'Delivered' AND total_amount > 5000 ORDER BY total_amount DESC;",
      hints: ["Combine two conditions using AND.", "Use > 5000 for the numeric comparison."],
      detailedExplanation: "Multiple WHERE conditions are chained with AND.",
      alternativeApproach: "None.",
      performanceNotes: "Compound index on (status, total_amount) would help.",
      concepts: ["WHERE", "AND", "ORDER BY"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m2-p3", moduleId: 2, difficulty: "Hard",
      title: "Premium customers with recent large orders",
            businessScenario: "Marketing at Myntra wants to target premium customers who placed high-value " +
                              "orders in 2024 for a loyalty campaign.",
            prompt: "Write a query joining customers and orders on customer_id. Return customer_id, " +
                    "full_name, segment, order_id, total_amount, and order_date. Filter to: segment = " +
                    "'Premium', total_amount > 3000, order_date BETWEEN '2024-01-01' AND " +
                    "'2024-12-31'. Order by total_amount descending.",
      starterQuery: "-- Write your SQL query here\n",
            solution: "SELECT c.customer_id, c.full_name, c.segment, o.order_id, o.total_amount, " +
                      "o.order_date FROM customers c INNER JOIN orders o ON c.customer_id = " +
                      "o.customer_id WHERE c.segment = 'Premium' AND o.total_amount > 3000 AND " +
                      "o.order_date BETWEEN '2024-01-01' AND '2024-12-31' ORDER BY o.total_amount DESC;",
      hints: [
        "JOIN customers and orders on customer_id.",
        "Filter segment = 'Premium' from the customers table.",
        "Filter total_amount > 3000 and date range from orders.",
        "Order results by total_amount DESC."
      ],
      detailedExplanation: "Combines INNER JOIN with multi-condition WHERE filtering across two tables.",
      alternativeApproach: "None.",
      performanceNotes: "Index on customers(segment) and orders(customer_id, total_amount) helps.",
      concepts: ["WHERE", "AND", "BETWEEN", "INNER JOIN", "ORDER BY"],
      companyTags: ["Myntra"]
    }
  ],

  // MODULE 3: Sorting with ORDER BY
  3: [
    {
      id: "m3-p1", moduleId: 3, difficulty: "Easy",
      title: "Sort customers by signup date",
      businessScenario: "The growth team wants to see customers in the order they joined.",
      prompt: "Write a query to retrieve all columns from the customers table, sorted by signup_date ascending.",
      starterQuery: "SELECT * FROM customers ORDER BY ???;",
      solution: "SELECT * FROM customers ORDER BY signup_date ASC;",
      hints: ["Use ORDER BY signup_date ASC."],
      detailedExplanation: "ORDER BY sorts results in ascending (ASC) or descending (DESC) order.",
      alternativeApproach: "None.",
      performanceNotes: "Index on signup_date speeds sorting.",
      concepts: ["ORDER BY", "ASC"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m3-p2", moduleId: 3, difficulty: "Medium",
      title: "Top orders by value",
      businessScenario: "The finance team needs orders ranked from highest to lowest value.",
            prompt: "Write a query to retrieve order_id, customer_id, total_amount, and status from " +
                    "the orders table, sorted by total_amount descending, then order_id ascending.",
      starterQuery: "SELECT ???\nFROM ???\nWHERE ???;",
            solution: "SELECT order_id, customer_id, total_amount, status FROM orders ORDER BY " +
                      "total_amount DESC, order_id ASC;",
      hints: ["Use multiple columns in ORDER BY separated by commas."],
      detailedExplanation: "Multi-column ORDER BY sorts by the first column, then breaks ties using the second.",
      alternativeApproach: "None.",
      performanceNotes: "Compound index on (total_amount, order_id) speeds sorting.",
      concepts: ["ORDER BY", "DESC", "multi-column sort"],
      companyTags: ["Zomato"]
    },
    {
      id: "m3-p3", moduleId: 3, difficulty: "Hard",
      title: "Rank products by net revenue within each city",
            businessScenario: "Croma wants a sorted breakdown of products by their net contribution (quantity " +
                              "* unit_price) grouped by customer city, to identify which cities drive product " +
                              "revenue.",
            prompt: "Join customers, orders, order_items, and products. Return city, product_name, " +
                    "and total_net_revenue (SUM of oi.quantity * oi.unit_price). Filter to delivered " +
                    "orders only. Sort by city ascending, then total_net_revenue descending.",
      starterQuery: "-- Write your SQL query here\n",
            solution: "SELECT c.city, p.product_name, SUM(oi.quantity * oi.unit_price) AS " +
                      "total_net_revenue FROM customers c INNER JOIN orders o ON c.customer_id = " +
                      "o.customer_id INNER JOIN order_items oi ON o.order_id = oi.order_id INNER JOIN " +
                      "products p ON oi.product_id = p.product_id WHERE o.status = 'Delivered' GROUP BY " +
                      "c.city, p.product_name ORDER BY c.city ASC, total_net_revenue DESC;",
      hints: [
        "You need 4 joins: customers → orders → order_items → products.",
        "SUM(oi.quantity * oi.unit_price) for net revenue.",
        "GROUP BY c.city, p.product_name.",
        "ORDER BY city ASC, total_net_revenue DESC."
      ],
            detailedExplanation: "Multi-table joins combined with GROUP BY and multi-column ORDER BY is the " +
                                 "standard pattern for regional product performance reports.",
      alternativeApproach: "None.",
      performanceNotes: "Indexes on join keys (customer_id, order_id, product_id) are critical.",
      concepts: ["ORDER BY", "INNER JOIN", "GROUP BY", "SUM", "multi-column sort"],
      companyTags: ["Croma"]
    }
  ],

  // MODULE 4: Limiting Results
  4: [
    {
      id: "m4-p1", moduleId: 4, difficulty: "Easy",
      title: "Get the first 10 orders",
      businessScenario: "For a dashboard preview on Flipkart, fetch a sample of the first 10 orders placed.",
            prompt: "Write a query to select all columns from the orders table, sorted by order_date " +
                    "ascending, and limit the results to the first 10 rows.",
      starterQuery: "SELECT *\nFROM orders\nORDER BY order_date ASC\nLIMIT ???;",
      solution: "SELECT *\nFROM orders\nORDER BY order_date ASC\nLIMIT 10;",
      hints: ["Use LIMIT followed by the number of rows: LIMIT 10."],
      detailedExplanation: "LIMIT restricts the maximum number of rows returned.",
      alternativeApproach: "None.",
      performanceNotes: "Highly performant as SQLite stops execution once 10 rows are found.",
      concepts: ["LIMIT", "ORDER BY"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m4-p2", moduleId: 4, difficulty: "Medium",
      title: "Paginate orders: get rows 11 to 20",
            businessScenario: "Flipkart's transaction list page supports pagination. Implement a query to load " +
                              "the second page of orders.",
            prompt: "Write a query to retrieve all columns from the orders table, sorted by " +
                    "order_date ascending, returning 10 rows starting from row 11 (skip the first 10 " +
                    "rows using OFFSET).",
      starterQuery: "SELECT *\nFROM orders\nORDER BY order_date ASC\nLIMIT ??? OFFSET ???;",
      solution: "SELECT *\nFROM orders\nORDER BY order_date ASC\nLIMIT 10 OFFSET 10;",
      hints: ["Use LIMIT 10 OFFSET 10 to skip the first 10 rows and return the next 10."],
      detailedExplanation: "OFFSET skips a specified number of rows before returning the limited rows.",
      alternativeApproach: "Use LIMIT 10, 10 (SQLite comma syntax: LIMIT offset, limit).",
      performanceNotes: "OFFSET still scans the skipped rows; high offsets can be slow.",
      concepts: ["LIMIT", "OFFSET"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m4-p3", moduleId: 4, difficulty: "Hard",
      title: "Find the 3rd most expensive product",
            businessScenario: "Croma needs to retrieve the single product that has the 3rd highest list price " +
                              "in the product catalog for a budget feature.",
            prompt: "Write a query to find the product_name and list_price of the product with the " +
                    "3rd highest list_price. Order by list_price descending, and use LIMIT and OFFSET " +
                    "to get exactly the 3rd product.",
      starterQuery: "-- Write your SQL query here\n",
      solution: "SELECT product_name, list_price\nFROM products\nORDER BY list_price DESC\nLIMIT 1 OFFSET 2;",
      hints: ["To get the 3rd item, sort DESC, then use LIMIT 1 (return 1 row) and OFFSET 2 (skip the top 2)."],
      detailedExplanation: "Combining ORDER BY, LIMIT 1, and OFFSET 2 allows you to target any specific row rank.",
      alternativeApproach: "None.",
      performanceNotes: "Scanning and sorting the entire products catalog is fast for normal size tables.",
      concepts: ["LIMIT", "OFFSET", "ORDER BY"],
      companyTags: ["Croma"]
    }
  ],

  // MODULE 5: NULL Handling
  5: [
    {
      id: "m5-p1", moduleId: 5, difficulty: "Easy",
      title: "Find active subscriptions",
      businessScenario: "Hotstar wants to identify active subscribers. Active subscriptions do not have an end_date.",
      prompt: "Write a query to retrieve all columns from the subscriptions table where end_date IS NULL.",
      starterQuery: "SELECT *\nFROM subscriptions\nWHERE end_date IS ???;",
      solution: "SELECT * FROM subscriptions WHERE end_date IS NULL;",
      hints: ["Use IS NULL to test for NULL values. Do NOT use = NULL."],
      detailedExplanation: "NULL represents a missing or unknown value. It cannot be compared using normal operators.",
      alternativeApproach: "None.",
      performanceNotes: "Unindexed IS NULL checks result in full table scans.",
      concepts: ["IS NULL", "NULL"],
      companyTags: ["Hotstar"]
    },
    {
      id: "m5-p2", moduleId: 5, difficulty: "Medium",
      title: "Customers with no phone numbers",
            businessScenario: "The operations team at Blinkit wants to audit active customer records to " +
                              "identify accounts missing phone numbers.",
            prompt: "Write a query to retrieve customer_id and full_name from the customers table " +
                    "where phone is NULL or empty (in SQLite: phone IS NULL OR phone = ''). Order by " +
                    "customer_id.",
      starterQuery: "SELECT ???\nFROM ???\nWHERE ???;",
      solution: "SELECT customer_id, full_name FROM customers WHERE phone IS NULL OR phone = '' ORDER BY customer_id;",
      hints: ["Handle both NULL and empty string cases using OR.", "Order by customer_id."],
            detailedExplanation: "NULL represents missing data; empty string represent initialized but empty " +
                                 "values. Both must be audited.",
      alternativeApproach: "None.",
      performanceNotes: "Checking both conditions ensures 100% data audit coverage.",
      concepts: ["NULL", "IS NULL", "empty strings"],
      companyTags: ["Blinkit"]
    },
    {
      id: "m5-p3", moduleId: 5, difficulty: "Hard",
      title: "Clean subscription end status",
            businessScenario: "The reporting team wants a cleaned list of active subscriptions, returning " +
                              "'Active' when the end_date is NULL.",
            prompt: "Write a query to retrieve subscription_id, customer_id, plan_name, and a " +
                    "computed column end_status. If end_date is NULL (meaning the customer is still " +
                    "active), return the text 'Active'. Otherwise, return the end_date. Order by " +
                    "subscription_id.",
      starterQuery: "-- Write your SQL query here\n",
            solution: "SELECT subscription_id, customer_id, plan_name, COALESCE(end_date, 'Active') AS " +
                      "end_status FROM subscriptions ORDER BY subscription_id;",
            hints: ["Use COALESCE to handle the NULL end_date case.", "COALESCE(end_date, 'Active') " +
                    "will return 'Active' if end_date is NULL." ],
      detailedExplanation: "COALESCE evaluates arguments in order and returns the first non-NULL value.",
      alternativeApproach: "Use CASE WHEN end_date IS NULL THEN 'Active' ELSE end_date END.",
      performanceNotes: "Calculations run per row, practically instantaneous.",
      concepts: ["COALESCE", "NULL", "ORDER BY"],
      companyTags: ["Hotstar"]
    }
  ],

  // MODULE 6: Pattern Matching with LIKE
  6: [
    {
      id: "m6-p1", moduleId: 6, difficulty: "Easy",
      title: "Standardise customer names to uppercase",
      businessScenario: "Ensure all customer names are capitalized consistently in marketing email outputs.",
            prompt: "Write a query on the customers table to return customer_id, full_name, and an " +
                    "uppercase name (aliased as 'upper_name'). Order by customer_id.",
      starterQuery: "SELECT customer_id, full_name, UPPER(full_name) AS upper_name FROM customers ORDER BY ???;",
      solution: "SELECT customer_id, full_name, UPPER(full_name) AS upper_name FROM customers ORDER BY customer_id;",
      hints: ["Use UPPER(column) to convert a string to uppercase.", "Alias the result as upper_name."],
      detailedExplanation: "UPPER converts string input to uppercase. Highly standard across SQL dialects.",
      alternativeApproach: "None.",
      performanceNotes: "Runs per row in SELECT, very fast.",
      concepts: ["UPPER", "string functions"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m6-p2", moduleId: 6, difficulty: "Medium",
      title: "Extract first name of customers",
            businessScenario: "The personalized marketing team wants to address customers by their first name " +
                              "in email templates.",
            prompt: "Write a query on the customers table to extract the first name from the " +
                    "full_name column. Use INSTR to find the first space character, and SUBSTR to " +
                    "extract the characters before it. Return customer_id, full_name, and first_name " +
                    "(aliased as 'first_name'). Order by customer_id.",
      starterQuery: "SELECT ???\nFROM ???\nWHERE ???;",
            solution: "SELECT customer_id, full_name, SUBSTR(full_name, 1, INSTR(full_name, ' ') - 1) " +
                      "AS first_name FROM customers ORDER BY customer_id;",
      hints: ["Use INSTR(full_name, ' ') to find the space.", "Use SUBSTR(full_name, 1, space_index - 1) to extract."],
      detailedExplanation: "INSTR locates the space character separating names, and SUBSTR extracts the prefix.",
      alternativeApproach: "None.",
      performanceNotes: "Highly optimized string operations.",
      concepts: ["SUBSTR", "INSTR", "string functions"],
      companyTags: ["Swiggy"]
    },
    {
      id: "m6-p3", moduleId: 6, difficulty: "Hard",
      title: "Build a customer initial + city code",
            businessScenario: "Marketing wants a unique tracking code for each customer: the uppercase first " +
                              "letter of their name, followed by a hyphen, and the first 3 letters of their " +
                              "city in uppercase.",
            prompt: "Write a query to retrieve customer_id, full_name, city, and a computed column " +
                    "tracking_code. tracking_code is: uppercase first character of full_name, a " +
                    "hyphen '-', and the first 3 characters of city in uppercase. Order by " +
                    "customer_id.",
      starterQuery: "-- Write your SQL query here\n",
            solution: "SELECT customer_id, full_name, city, UPPER(SUBSTR(full_name, 1, 1)) || '-' || " +
                      "UPPER(SUBSTR(city, 1, 3)) AS tracking_code FROM customers ORDER BY customer_id;",
            hints: ["Use SUBSTR to get character slices.", "Concatenate strings using the || " +
                    "operator in SQLite.", "Use UPPER to make it uppercase." ],
            detailedExplanation: "We extract segments using SUBSTR, uppercase them with UPPER, and stitch them " +
                                 "with the concatenation operator ||.",
      alternativeApproach: "None.",
      performanceNotes: "Computed entirely in CPU during output projection.",
      concepts: ["SUBSTR", "UPPER", "|| concatenation", "string composition"],
      companyTags: ["Flipkart"]
    }
  ],

  // MODULE 7: Set Membership with IN
  7: [
    {
      id: "m7-p1", moduleId: 7, difficulty: "Easy",
      title: "Filter customers by segment using IN",
      businessScenario: "Identify specific segments of customers for loyalty programs.",
            prompt: "Write a query to find customers who belong to the 'Premium' or 'Student' " +
                    "segment. Return customer_id, full_name, and segment. Order by customer_id.",
            starterQuery: "SELECT customer_id, full_name, segment FROM customers WHERE segment IN ('???', " +
                          "'???') ORDER BY customer_id;",
            solution: "SELECT customer_id, full_name, segment FROM customers WHERE segment IN " +
                      "('Premium', 'Student') ORDER BY customer_id;",
      hints: ["Use WHERE column IN ('val1', 'val2') syntax.", "Wrap strings in single quotes."],
      detailedExplanation: "IN evaluates if a column value matches any item in a list of values.",
      alternativeApproach: "Use OR: segment = 'Premium' OR segment = 'Student'.",
      performanceNotes: "Uses segment indexes where available.",
      concepts: ["IN", "WHERE", "ORDER BY"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m7-p2", moduleId: 7, difficulty: "Medium",
      title: "Active buyers in primary hubs",
            businessScenario: "The logistics manager wants to filter orders placed in the primary hubs: Delhi, " +
                              "Mumbai, and Bengaluru.",
            prompt: "Write a query to retrieve customer_id, full_name, and city from the customers " +
                    "table where the city is either 'Delhi', 'Mumbai', or 'Bengaluru'. Order by city " +
                    "alphabetically.",
      starterQuery: "SELECT ???\nFROM ???\nWHERE ???;",
            solution: "SELECT customer_id, full_name, city FROM customers WHERE city IN ('Delhi', " +
                      "'Mumbai', 'Bengaluru') ORDER BY city ASC;",
      hints: ["Use the IN operator with the three city strings."],
      detailedExplanation: "Filter membership checks can easily be written with IN.",
      alternativeApproach: "WHERE city = 'Delhi' OR city = 'Mumbai' OR city = 'Bengaluru'.",
      performanceNotes: "IN is highly optimized.",
      concepts: ["IN", "WHERE"],
      companyTags: ["Swiggy"]
    },
    {
      id: "m7-p3", moduleId: 7, difficulty: "Hard",
      title: "Unresolved payments from premium channels",
            businessScenario: "Finance wants to audit successful payments that did not originate from the most " +
                              "common automated modes: 'Cash', 'Cheque'.",
            prompt: "Write a query to retrieve payment_id, order_id, payment_mode, and amount from " +
                    "payments where payment_status = 'Success' and payment_mode NOT IN ('Cash', " +
                    "'Cheque'). Order by amount descending.",
      starterQuery: "-- Write your SQL query here\n",
            solution: "SELECT payment_id, order_id, payment_mode, amount FROM payments WHERE " +
                      "payment_status = 'Success' AND payment_mode NOT IN ('Cash', 'Cheque') ORDER BY " +
                      "amount DESC;",
      hints: ["Use NOT IN to exclude values from a set.", "Filter where status = 'Success'."],
      detailedExplanation: "NOT IN checks that a column value is not in the specified list.",
      alternativeApproach: "None.",
      performanceNotes: "Ensure payment_mode is indexed.",
      concepts: ["NOT IN", "WHERE", "ORDER BY"],
      companyTags: ["Paytm"]
    }
  ],

  // MODULE 8: Range Filtering with BETWEEN
  8: [
    {
      id: "m8-p1", moduleId: 8, difficulty: "Easy",
      title: "Filter orders within a date range using BETWEEN",
            businessScenario: "Flipkart's marketing team wants to audit order transactions placed during the " +
                              "first quarter (Q1) of 2024.",
            prompt: "Write a query to retrieve order_id, customer_id, order_date, and total_amount " +
                    "from the orders table where order_date is between '2024-01-01' and '2024-03-31' " +
                    "inclusive. Order by order_date.",
            starterQuery: "SELECT order_id, customer_id, order_date, total_amount FROM orders WHERE " +
                          "order_date BETWEEN '???' AND '???' ORDER BY order_date;",
            solution: "SELECT order_id, customer_id, order_date, total_amount FROM orders WHERE " +
                      "order_date BETWEEN '2024-01-01' AND '2024-03-31' ORDER BY order_date;",
      hints: ["BETWEEN includes the start and end values.", "Wrap dates in single quotes."],
      detailedExplanation: "BETWEEN simplifies date and range queries.",
      alternativeApproach: "Use >= and <= operators.",
      performanceNotes: "Uses the order_date index.",
      concepts: ["BETWEEN", "WHERE", "date filtering"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m8-p2", moduleId: 8, difficulty: "Medium",
      title: "Extract month from order dates",
      businessScenario: "The revenue team needs to group orders by month for sales trends.",
            prompt: "Write a query on the orders table to select order_id, customer_id, order_date, " +
                    "and a computed column order_month (using SUBSTR(order_date, 1, 7)). Filter to " +
                    "orders placed between '2024-01-01' and '2024-06-30'. Order by order_date.",
      starterQuery: "SELECT ???\nFROM ???\nWHERE ???;",
            solution: "SELECT order_id, customer_id, order_date, SUBSTR(order_date, 1, 7) AS " +
                      "order_month FROM orders WHERE order_date BETWEEN '2024-01-01' AND '2024-06-30' " +
                      "ORDER BY order_date;",
      hints: ["Use SUBSTR(order_date, 1, 7) to extract YYYY-MM."],
      detailedExplanation: "Extracts month text segments while range filtering on the order date.",
      alternativeApproach: "None.",
      performanceNotes: "Fast date extraction using range checks.",
      concepts: ["SUBSTR", "BETWEEN", "Date Extraction"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m8-p3", moduleId: 8, difficulty: "Hard",
      title: "Weekend order volume by city in 2024",
            businessScenario: "The growth team at Blinkit wants to understand which cities generate the most " +
                              "weekend transaction volume — to decide where to run weekend flash sales in 2024.",
            prompt: "Write a query joining orders and customers on customer_id. Filter to orders " +
                    "placed in 2024 (order_date BETWEEN '2024-01-01' AND '2024-12-31') AND on a " +
                    "weekend (strftime('%w', order_date) IN ('0', '6')). Group by city. Return city, " +
                    "weekend_orders (COUNT of order_id), and total_weekend_revenue (SUM of " +
                    "total_amount, rounded to 2 decimal places). Order by weekend_orders descending.",
      starterQuery: "-- Write your SQL query here\n",
            solution: "SELECT c.city, COUNT(o.order_id) AS weekend_orders, ROUND(SUM(o.total_amount), " +
                      "2) AS total_weekend_revenue FROM orders o INNER JOIN customers c ON " +
                      "o.customer_id = c.customer_id WHERE o.order_date BETWEEN '2024-01-01' AND " +
                      "'2024-12-31' AND strftime('%w', o.order_date) IN ('0', '6') GROUP BY c.city " +
                      "ORDER BY weekend_orders DESC;",
      hints: [
        "Use strftime('%w', order_date) IN ('0', '6') to filter weekends ('0'=Sunday, '6'=Saturday).",
        "BETWEEN '2024-01-01' AND '2024-12-31' handles the year filter.",
        "INNER JOIN customers on customer_id to get city data.",
        "GROUP BY c.city with COUNT and SUM for the aggregates.",
        "ORDER BY weekend_orders DESC to rank cities."
      ],
            detailedExplanation: "This combines date range filtering (BETWEEN), date function extraction " +
                                 "(strftime), INNER JOIN across tables, GROUP BY aggregation, COUNT, SUM, ROUND, " +
                                 "and ORDER BY — a genuine multi-skill analytical query that a data analyst would " +
                                 "write for a city-level campaign planning task.",
            alternativeApproach: "Can also write the date filter as order_date LIKE '2024%' but BETWEEN is more " +
                                 "explicit and index-friendly.",
            performanceNotes: "An index on orders(order_date) speeds the range filter. GROUP BY city runs on a " +
                              "small distinct set.",
      concepts: ["strftime", "date functions", "BETWEEN", "INNER JOIN", "GROUP BY", "COUNT", "SUM", "ORDER BY"],
      companyTags: ["Blinkit"]
    }
  ],

  // MODULE 9: Basic Aggregates - COUNT
  9: [
    {
      id: "m9-p1", moduleId: 9, difficulty: "Easy",
      title: "Count all orders",
      businessScenario: "The operations lead at Flipkart wants a quick total count of all orders in the system.",
      prompt: "Write a query to count the total number of rows in the orders table. Alias the result as total_orders.",
      starterQuery: "SELECT ??? FROM orders;",
      solution: "SELECT COUNT(*) AS total_orders FROM orders;",
      hints: ["Use COUNT(*) to count all rows, including NULLs."],
            detailedExplanation: "COUNT(*) counts every row in the table regardless of NULL values. It is the " +
                                 "most common starting point for any aggregate analysis.",
            alternativeApproach: "COUNT(order_id) would also work since order_id is never NULL, but COUNT(*) is " +
                                 "idiomatic for row counts.",
      performanceNotes: "COUNT(*) is highly optimized in most databases and only requires a single table scan.",
      concepts: ["COUNT", "aggregation"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m9-p2", moduleId: 9, difficulty: "Medium",
      title: "Count orders per status",
      businessScenario: "The operations team at Swiggy wants to see how many orders exist in each status category.",
            prompt: "Write a query to count the number of orders grouped by status. Return status " +
                    "and order_count (aliased). Order by order_count descending.",
      starterQuery: "SELECT ???\nFROM ???\nGROUP BY ???\nHAVING ???;",
      solution: "SELECT status, COUNT(*) AS order_count FROM orders GROUP BY status ORDER BY order_count DESC;",
      hints: ["Use GROUP BY status to aggregate per status.", "COUNT(*) counts rows in each group."],
            detailedExplanation: "Grouping COUNT(*) by a categorical column produces a frequency table — one of " +
                                 "the most common analytical patterns in SQL.",
      alternativeApproach: "You could use COUNT(order_id) since order_id is never NULL; the result would be identical.",
      performanceNotes: "GROUP BY requires sorting or hashing. An index on status can speed this up.",
      concepts: ["COUNT", "GROUP BY", "ORDER BY"],
      companyTags: ["Swiggy"]
    },
    {
      id: "m9-p3", moduleId: 9, difficulty: "Hard",
      title: "Segment order volume and buyer coverage",
            businessScenario: "The customer analytics team at Zomato wants order volume and customer coverage " +
                              "broken down by customer segment (joining customers and orders).",
            prompt: "Write a query joining customers and orders on customer_id. Group by customer " +
                    "segment. Return segment, total_orders (COUNT of order_id), unique_customers " +
                    "(COUNT DISTINCT of customer_id from orders), and avg_order_value (ROUND of " +
                    "AVG(total_amount) to 2 decimal places). Order by total_orders descending.",
      starterQuery: "-- Write your SQL query here\n",
            solution: "SELECT c.segment, COUNT(o.order_id) AS total_orders, COUNT(DISTINCT " +
                      "o.customer_id) AS unique_customers, ROUND(AVG(o.total_amount), 2) AS " +
                      "avg_order_value FROM customers c INNER JOIN orders o ON c.customer_id = " +
                      "o.customer_id GROUP BY c.segment ORDER BY total_orders DESC;",
      hints: [
        "JOIN customers and orders on customer_id.",
        "GROUP BY c.segment.",
        "COUNT(o.order_id) for volume; COUNT(DISTINCT o.customer_id) for unique buyers.",
        "AVG(total_amount) for average order value."
      ],
            detailedExplanation: "This combines INNER JOIN, GROUP BY, COUNT, COUNT DISTINCT, AVG, and ORDER BY — " +
                                 "the standard analyst pattern for segment-level performance reporting.",
      alternativeApproach: "Pre-aggregate orders in a CTE, then join to customers for segment lookups.",
            performanceNotes: "An index on orders(customer_id) speeds up the join. GROUP BY on segment runs on " +
                              "a small set of distinct values.",
      concepts: ["COUNT", "COUNT DISTINCT", "AVG", "INNER JOIN", "GROUP BY", "ORDER BY"],
      companyTags: ["Zomato"]
    }
  ],

  // MODULE 10: Summing Data - SUM
  10: [
    {
      id: "m10-p1", moduleId: 10, difficulty: "Easy",
      title: "Total gross revenue",
      businessScenario: "The finance lead at Zomato wants a grand total of gross revenue from all orders.",
            prompt: "Write a query to sum total_amount across all orders in the orders table. Alias " +
                    "the sum as total_gross_revenue.",
      starterQuery: "SELECT ??? FROM orders;",
      solution: "SELECT SUM(total_amount) AS total_gross_revenue FROM orders;",
      hints: ["Use SUM(total_amount)."],
      detailedExplanation: "SUM calculates the total sum of a column.",
      alternativeApproach: "None.",
      performanceNotes: "Single scan on orders table.",
      concepts: ["SUM"],
      companyTags: ["Zomato"]
    },
    {
      id: "m10-p2", moduleId: 10, difficulty: "Medium",
      title: "Total net revenue for completed orders",
      businessScenario: "Calculate the net revenue (total_amount minus discount_amount) from successful transactions.",
            prompt: "Write a query to calculate the total net revenue (SUM of total_amount minus " +
                    "discount_amount) for orders with a status of 'Delivered'. Alias the result as " +
                    "total_net_revenue.",
      starterQuery: "SELECT ???\nFROM ???\nWHERE ???;",
            solution: "SELECT SUM(total_amount - discount_amount) AS total_net_revenue FROM orders " +
                      "WHERE status = 'Delivered';",
      hints: ["Subtract discount_amount inside the SUM function."],
      detailedExplanation: "SUM evaluates mathematical expressions per row and aggregates.",
      alternativeApproach: "None.",
      performanceNotes: "Fast scan on filtered rows.",
      concepts: ["SUM", "WHERE"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m10-p3", moduleId: 10, difficulty: "Hard",
      title: "Financial net value summary in 2024",
            businessScenario: "The finance lead wants a high-level summary of total net revenue and total " +
                              "discounts applied in 2024.",
            prompt: "Write a query on the orders table. Calculate the total net revenue (SUM of " +
                    "total_amount minus discount_amount) as total_net_revenue, and the total " +
                    "discounts given (SUM of discount_amount) as total_discounts. Only include " +
                    "delivered orders placed in the year 2024.",
      starterQuery: "-- Write your SQL query here\n",
            solution: "SELECT SUM(total_amount - discount_amount) AS total_net_revenue, " +
                      "SUM(discount_amount) AS total_discounts FROM orders WHERE status = 'Delivered' " +
                      "AND order_date LIKE '2024%';",
      hints: ["Filter for status = 'Delivered' and date starts with '2024%'."],
      detailedExplanation: "Aggregates sums over filtered subset of order transactions.",
      alternativeApproach: "None.",
      performanceNotes: "Aggregates in a single scan.",
      concepts: ["SUM", "Operators", "WHERE"],
      companyTags: ["Zomato"]
    }
  ]
};



const batch2Problems: Record<number, PracticeProblem[]> = {
  // MODULE 11: Finding Averages - AVG
  11: [
    {
      id: "m11-p1", moduleId: 11, difficulty: "Easy",
      title: "Average order total",
            businessScenario: "Croma's finance lead needs to calculate the average transaction value across " +
                              "all completed orders.",
            prompt: "Write a query to calculate the average total_amount from the orders table. " +
                    "Alias the output as avg_order_amount.",
      starterQuery: "SELECT ??? FROM orders;",
      solution: "SELECT AVG(total_amount) AS avg_order_amount FROM orders;",
      hints: ["Use the AVG() aggregate function on total_amount."],
      detailedExplanation: "AVG calculates the mean value of a numeric column.",
      alternativeApproach: "None.",
      performanceNotes: "Runs in a single scan of the orders table.",
      concepts: ["AVG"],
      companyTags: ["Croma"]
    },
    {
      id: "m11-p2", moduleId: 11, difficulty: "Medium",
      title: "Average list price for premium brands",
      businessScenario: "Find the average list price of Samsung or Apple products to audit merchandising margins.",
            prompt: "Write a query to calculate the average list_price of products where the brand " +
                    "is 'Samsung' or 'Apple'. Alias the result as avg_brand_price.",
      starterQuery: "SELECT ???\nFROM ???\nWHERE ???;",
      solution: "SELECT AVG(list_price) AS avg_brand_price FROM products WHERE brand = 'Samsung' OR brand = 'Apple';",
      hints: ["Filter brand using OR or IN, then apply AVG."],
      detailedExplanation: "Filters rows first, and then calculates the mean list price of premium products.",
      alternativeApproach: "WHERE brand IN ('Samsung', 'Apple').",
      performanceNotes: "Uses brand index for speed.",
      concepts: ["AVG", "WHERE"],
      companyTags: ["Croma"]
    },
    {
      id: "m11-p3", moduleId: 11, difficulty: "Hard",
      title: "Average cost price for budget electronics",
      businessScenario: "The finance team wants to inspect catalog margins for budget electronics.",
            prompt: "Write a query to calculate the average cost_price and average list_price for " +
                    "products in the 'Electronics' category with a list_price under 20000. Alias the " +
                    "results as avg_cost and avg_list.",
      starterQuery: "-- Write your SQL query here\n",
            solution: "SELECT AVG(cost_price) AS avg_cost, AVG(list_price) AS avg_list FROM products " +
                      "WHERE category = 'Electronics' AND list_price < 20000;",
      hints: ["Compute both averages in the same SELECT statement."],
      detailedExplanation: "Performs two AVG aggregations in a single scan.",
      alternativeApproach: "None.",
      performanceNotes: "Aggregates in a single scan.",
      concepts: ["AVG", "WHERE", "AND"],
      companyTags: ["Croma"]
    }
  ],

  // MODULE 12: Extremes - MIN & MAX
  12: [
    {
      id: "m12-p1", moduleId: 12, difficulty: "Easy",
      title: "Price Extremes",
      businessScenario: "MERCHANDISING wants to find catalog bounds.",
            prompt: "Find the minimum list_price as cheapest_product and maximum list_price as " +
                    "dearest_product from the products table.",
      starterQuery: "SELECT ??? FROM products;",
      solution: "SELECT MIN(list_price) AS cheapest_product, MAX(list_price) AS dearest_product FROM products;",
      hints: ["Use MIN and MAX on list_price."],
      detailedExplanation: "MIN returns smallest, MAX returns largest.",
      alternativeApproach: "None.",
      performanceNotes: "Extremely fast.",
      concepts: ["MIN", "MAX"],
      companyTags: ["Croma"]
    },
    {
      id: "m12-p2", moduleId: 12, difficulty: "Medium",
      title: "Product catalog price range",
      businessScenario: "Merkle wants pricing bounds for Electronics category.",
            prompt: "Write a query to find the minimum list_price as cheapest_electronics and " +
                    "maximum list_price as most_expensive_electronics for 'Electronics' category.",
      starterQuery: "SELECT ???\nFROM ???\nWHERE ???;",
            solution: "SELECT MIN(list_price) AS cheapest_electronics, MAX(list_price) AS " +
                      "most_expensive_electronics FROM products WHERE category = 'Electronics';",
      hints: ["Use MIN and MAX with WHERE category = 'Electronics'."],
      detailedExplanation: "MIN/MAX aggregation over filtered rows.",
      alternativeApproach: "None.",
      performanceNotes: "Uses category index.",
      concepts: ["MIN", "MAX", "WHERE"],
      companyTags: ["Croma"]
    },
    {
      id: "m12-p3", moduleId: 12, difficulty: "Hard",
      title: "Extreme order amounts in 2024",
      businessScenario: "Identify largest transaction and smallest non-zero total in 2024.",
            prompt: "Write a query to find the maximum total_amount as highest_order and minimum " +
                    "total_amount as lowest_order from orders where order_date starts with '2024' and " +
                    "total_amount > 0.",
      starterQuery: "-- Write your SQL query here\n",
            solution: "SELECT MAX(total_amount) AS highest_order, MIN(total_amount) AS lowest_order " +
                      "FROM orders WHERE order_date LIKE '2024%' AND total_amount > 0;",
      hints: ["Use MAX and MIN with LIKE and numeric filter."],
      detailedExplanation: "Finds extremes on filtered subset.",
      alternativeApproach: "None.",
      performanceNotes: "Fast scan.",
      concepts: ["MAX", "MIN", "WHERE"],
      companyTags: ["Flipkart"]
    }
  ],

  // MODULE 13: Grouping Rows - GROUP BY
  13: [
    {
      id: "m13-p1", moduleId: 13, difficulty: "Easy",
      title: "Orders by status",
      businessScenario: "Check orders split by status.",
      prompt: "Write a query to get status and order count (as order_count) from orders, grouped by status.",
      starterQuery: "SELECT ??? FROM orders;",
      solution: "SELECT status, COUNT(*) AS order_count FROM orders GROUP BY status;",
      hints: ["Group by status, count all rows."],
      detailedExplanation: "GROUP BY partitions data into groups based on status.",
      alternativeApproach: "None.",
      performanceNotes: "Single scan aggregation.",
      concepts: ["GROUP BY", "COUNT"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m13-p2", moduleId: 13, difficulty: "Medium",
      title: "Orders by channel and status",
      businessScenario: "Understand order delivery across channels.",
      prompt: "Write a query to count orders by channel and status. Return channel, status, and order_count.",
      starterQuery: "SELECT ???\nFROM ???\nGROUP BY ???\nHAVING ???;",
      solution: "SELECT channel, status, COUNT(*) AS order_count FROM orders GROUP BY channel, status;",
      hints: ["List both columns in GROUP BY and SELECT."],
      detailedExplanation: "Groups by combinations of channel and status.",
      alternativeApproach: "None.",
      performanceNotes: "Composite sort aggregation.",
      concepts: ["GROUP BY", "COUNT"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m13-p3", moduleId: 13, difficulty: "Hard",
      title: "Monthly channel revenue trend",
      businessScenario: "Analyze revenue trajectories per channel per month.",
            prompt: "Write a query to get order_month (using SUBSTR(order_date, 1, 7)), channel, and " +
                    "total_revenue (SUM of total_amount). Group by order_month, channel, and sort by " +
                    "order_month desc, total_revenue desc.",
            starterQuery: "SELECT SUBSTR(order_date, 1, 7) AS order_month, channel, SUM(total_amount) AS " +
                          "total_revenue\nFROM orders\nGROUP BY order_month, channel\nORDER BY order_month " +
                          "DESC, total_revenue DESC;",
            solution: "SELECT SUBSTR(order_date, 1, 7) AS order_month, channel, SUM(total_amount) AS " +
                      "total_revenue FROM orders GROUP BY SUBSTR(order_date, 1, 7), channel ORDER BY " +
                      "order_month DESC, total_revenue DESC;",
      hints: ["Group by the SUBSTR expression and channel."],
      detailedExplanation: "Uses string operations in grouping keys for month partitions.",
      alternativeApproach: "None.",
      performanceNotes: "Computes per row and aggregates.",
      concepts: ["GROUP BY", "SUM", "SUBSTR"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m13-p4", moduleId: 13, difficulty: "Hard",
      title: "Concatenate ordered product list per order",
            businessScenario: "The logistics team wants to see a consolidated text list of all product names " +
                              "ordered in each transaction for invoice logs.",
            prompt: "Write a query on order_items joined to products. Return order_id and a " +
                    "comma-separated list of all ordered product names (aliased as 'product_list') " +
                    "using GROUP_CONCAT(product_name, ', '). Group by order_id. Order by order_id.",
            starterQuery: "SELECT order_id, GROUP_CONCAT(product_name, ', ') AS product_list FROM " +
                          "order_items oi JOIN products p ON oi.product_id = p.product_id GROUP BY order_id " +
                          "ORDER BY order_id;",
            solution: "SELECT oi.order_id, GROUP_CONCAT(p.product_name, ', ') AS product_list FROM " +
                      "order_items oi JOIN products p ON oi.product_id = p.product_id GROUP BY " +
                      "oi.order_id ORDER BY oi.order_id;",
            hints: ["Join order_items and products tables on product_id.", "Use " +
                    "GROUP_CONCAT(product_name, ', ') to stitch strings.", "Group by order_id." ],
            detailedExplanation: "GROUP_CONCAT aggregates multiple strings within a group into a single delimited " +
                                 "text value. Perfect for invoice summaries and CSV exports.",
      alternativeApproach: "None.",
      performanceNotes: "Requires joining two tables and then aggregating strings. Indexed joins are fast.",
      concepts: ["GROUP BY", "GROUP_CONCAT", "joins"],
      companyTags: ["Swiggy"]
    }
  ],

  // MODULE 14: Filtered Groups - HAVING
  14: [
    {
      id: "m14-p1", moduleId: 14, difficulty: "Easy",
      title: "Channels with more than 3 delivered orders",
      businessScenario: "Identify transaction active channels.",
            prompt: "Retrieve channel and order_count. Filter for 'Delivered' orders, group by " +
                    "channel, and only include channels with more than 3 orders.",
            starterQuery: "SELECT channel, COUNT(*) AS order_count FROM orders WHERE status = '???' GROUP " +
                          "BY channel HAVING COUNT(*) > ???;",
            solution: "SELECT channel, COUNT(*) AS order_count FROM orders WHERE status = 'Delivered' " +
                      "GROUP BY channel HAVING COUNT(*) > 3;",
      hints: ["Filter WHERE status = 'Delivered', aggregate, then use HAVING count > 3."],
      detailedExplanation: "WHERE filters rows before GROUP BY; HAVING filters grouped sums after.",
      alternativeApproach: "None.",
      performanceNotes: "Filters early with WHERE, reducing HAVING comparisons.",
      concepts: ["HAVING", "GROUP BY", "WHERE"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m14-p2", moduleId: 14, difficulty: "Medium",
      title: "High-spending customers",
      businessScenario: "Loyalty program needs customers who spent more than ₹10,000.",
            prompt: "Find customer_id and total_spent. Only sum total_amount. Group by customer_id, " +
                    "filter to total_spent > 10000.",
      starterQuery: "SELECT ???\nFROM ???\nGROUP BY ???\nHAVING ???;",
            solution: "SELECT customer_id, SUM(total_amount) AS total_spent FROM orders GROUP BY " +
                      "customer_id HAVING SUM(total_amount) > 10000;",
      hints: ["Group by customer_id, filter using HAVING SUM(total_amount) > 10000."],
      detailedExplanation: "HAVING allows filtering on grouped aggregates.",
      alternativeApproach: "None.",
      performanceNotes: "Scans and aggregates before filtering groups.",
      concepts: ["HAVING", "GROUP BY", "SUM"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m14-p3", moduleId: 14, difficulty: "Hard",
      title: "High-volume categories with premium list prices",
      businessScenario: "Find product categories with high inventory price peaks.",
            prompt: "Write a query to find product categories with more than 2 products AND a " +
                    "maximum catalog list_price of at least ₹15,000. Return category, product_count, " +
                    "and max_price.",
      starterQuery: "-- Write your SQL query here\n",
            solution: "SELECT category, COUNT(*) AS product_count, MAX(list_price) AS max_price FROM " +
                      "products GROUP BY category HAVING COUNT(*) > 2 AND MAX(list_price) >= 15000;",
      hints: ["Use multiple conditions inside HAVING combined with AND."],
      detailedExplanation: "Demonstrates compound aggregate filtering in HAVING.",
      alternativeApproach: "None.",
      performanceNotes: "Groups catalog before discarding candidates.",
      concepts: ["HAVING", "COUNT", "MAX", "GROUP BY"],
      companyTags: ["Croma"]
    }
  ],

  // MODULE 15: HAVING vs WHERE
  15: [
    {
      id: "m15-p1", moduleId: 15, difficulty: "Easy",
      title: "Filter individual transactions vs aggregate counts",
      businessScenario: "Audit orders placed via specific channels to separate raw filters from grouped summaries.",
            prompt: "Write a query to get channel and total_orders for 'Delivered' orders, grouped " +
                    "by channel, where the channel has more than 2 total orders. Return channel and " +
                    "total_orders.",
            starterQuery: "SELECT channel, COUNT(*) AS total_orders FROM orders WHERE status = '???' GROUP " +
                          "BY channel HAVING COUNT(*) > ???;",
            solution: "SELECT channel, COUNT(*) AS total_orders FROM orders WHERE status = 'Delivered' " +
                      "GROUP BY channel HAVING COUNT(*) > 2;",
      hints: ["WHERE filters individual rows (status), HAVING filters groups (count)."],
      detailedExplanation: "Shows clear difference: WHERE filters input, HAVING filters aggregated results.",
      alternativeApproach: "None.",
      performanceNotes: "Combining WHERE and HAVING is standard best practice.",
      concepts: ["WHERE", "HAVING", "GROUP BY"],
      companyTags: ["Swiggy"]
    },
    {
      id: "m15-p2", moduleId: 15, difficulty: "Medium",
      title: "High value items count by brand",
      businessScenario: "Marketing wants to find brands with multiple premium products costing over ₹10,000.",
            prompt: "Write a query to return brand and product_count. Only evaluate products where " +
                    "list_price > 10000. Group by brand, and only include brands that have more than " +
                    "1 such product.",
      starterQuery: "SELECT ???\nFROM ???\nGROUP BY ???\nHAVING ???;",
            solution: "SELECT brand, COUNT(*) AS product_count FROM products WHERE list_price > 10000 " +
                      "GROUP BY brand HAVING COUNT(*) > 1;",
      hints: ["WHERE filters individual items, HAVING filters aggregated brand count."],
      detailedExplanation: "WHERE discards cheap products; HAVING filters out brands with only one premium product.",
      alternativeApproach: "None.",
      performanceNotes: "Extremely fast when indexed on price and brand.",
      concepts: ["WHERE", "HAVING", "GROUP BY"],
      companyTags: ["Croma"]
    },
    {
      id: "m15-p3", moduleId: 15, difficulty: "Hard",
      title: "Total sales volume with group constraints",
      businessScenario: "Audit customers who place multiple large orders, filtering individual order sizes early.",
            prompt: "For each customer, calculate total spent on orders where individual order " +
                    "amount exceeds ₹3,000. Only return customers whose total spent on those large " +
                    "orders exceeds ₹10,000.",
            starterQuery: "SELECT customer_id, SUM(total_amount) AS total_spent\nFROM orders\nWHERE " +
                          "total_amount > 3000\nGROUP BY customer_id\nHAVING SUM(total_amount) > 10000;",
            solution: "SELECT customer_id, SUM(total_spent) AS total_spent FROM (SELECT customer_id, " +
                      "total_amount AS total_spent FROM orders WHERE total_amount > 3000) GROUP BY " +
                      "customer_id HAVING SUM(total_spent) > 10000;",
      hints: ["Filter raw orders WHERE total_amount > 3000, then apply HAVING SUM(total_amount) > 10000."],
      detailedExplanation: "Tests advanced composition of WHERE (individual bounds) and HAVING (group sums).",
      alternativeApproach: "None.",
      performanceNotes: "Filters raw inputs first to reduce records grouped.",
      concepts: ["WHERE", "HAVING", "GROUP BY", "SUM"],
      companyTags: ["Flipkart"]
    }
  ],

  // MODULE 16: Inner Joins
  16: [
    {
      id: "m16-p1", moduleId: 16, difficulty: "Easy",
      title: "Order details with customer city",
      businessScenario: "Operations wants order totals paired with the buyer's region.",
            prompt: "Write a query to retrieve order_id, total_amount, order_date, full_name, and " +
                    "city by joining orders and customers.",
      starterQuery: "SELECT ??? FROM orders;",
            solution: "SELECT o.order_id, o.total_amount, o.order_date, c.full_name, c.city FROM " +
                      "orders o INNER JOIN customers c ON o.customer_id = c.customer_id;",
      hints: ["Join on customer_id."],
      detailedExplanation: "INNER JOIN returns matching records in both tables.",
      alternativeApproach: "None.",
      performanceNotes: "Uses foreign key indexes.",
      concepts: ["INNER JOIN"],
      companyTags: ["Swiggy"]
    },
    {
      id: "m16-p2", moduleId: 16, difficulty: "Medium",
      title: "Product revenue with category join",
      businessScenario: "Merchandising wants to see sales paired with product metadata.",
            prompt: "Write a query to retrieve order_id, product_name, category, and line_total " +
                    "(quantity * unit_price) from order_items joined with products.",
      starterQuery: "SELECT ???\nFROM ???\nJOIN ??? ON ???\nWHERE ???;",
            solution: "SELECT oi.order_id, p.product_name, p.category, (oi.quantity * oi.unit_price) " +
                      "AS line_total FROM order_items oi INNER JOIN products p ON oi.product_id = " +
                      "p.product_id;",
      hints: ["Join order_items and products on product_id."],
      detailedExplanation: "Pairs transaction items with catalog names.",
      alternativeApproach: "None.",
      performanceNotes: "Uses product_id keys.",
      concepts: ["INNER JOIN", "computed columns"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m16-p3", moduleId: 16, difficulty: "Hard",
      title: "Top revenue generating customers by product category",
      businessScenario: "Loyalty audit: find total electronics spending by customer.",
            prompt: "Find total spend (quantity * unit_price) on 'Electronics' products for each " +
                    "customer. Return customer_id, full_name, and total_electronics_spend. Include " +
                    "only delivered orders. Sort desc.",
      starterQuery: "-- Write your SQL query here\n",
            solution: "SELECT c.customer_id, c.full_name, SUM(oi.quantity * oi.unit_price) AS " +
                      "total_electronics_spend FROM customers c INNER JOIN orders o ON c.customer_id = " +
                      "o.customer_id INNER JOIN order_items oi ON o.order_id = oi.order_id INNER JOIN " +
                      "products p ON oi.product_id = p.product_id WHERE p.category = 'Electronics' AND " +
                      "o.status = 'Delivered' GROUP BY c.customer_id, c.full_name ORDER BY " +
                      "total_electronics_spend DESC;",
      hints: ["Join customers, orders, order_items, and products in sequence."],
      detailedExplanation: "A 4-table inner join aggregating line item totals.",
      alternativeApproach: "None.",
      performanceNotes: "Requires primary key/foreign key indexes.",
      concepts: ["INNER JOIN", "multi-table join", "GROUP BY", "SUM"],
      companyTags: ["Flipkart"]
    }
  ],

  // MODULE 17: Left Joins
  17: [
    {
      id: "m17-p1", moduleId: 17, difficulty: "Easy",
      title: "All customers, with their order count",
      businessScenario: "Count orders per customer, including those with zero orders.",
            prompt: "Write a query to retrieve customer_id, full_name, and order_count " +
                    "(COUNT(o.order_id)) by LEFT JOINing customers with orders.",
      starterQuery: "SELECT ??? FROM customers;",
            solution: "SELECT c.customer_id, c.full_name, COUNT(o.order_id) AS order_count FROM " +
                      "customers c LEFT JOIN orders o ON c.customer_id = o.customer_id GROUP BY " +
                      "c.customer_id, c.full_name;",
      hints: ["Use LEFT JOIN, group by customer, and count o.order_id (not COUNT(*))."],
            detailedExplanation: "LEFT JOIN retains all left rows. COUNT(o.order_id) ignores NULLs, returning 0 " +
                                 "for orderless customers.",
      alternativeApproach: "None.",
      performanceNotes: "Fast scan grouping.",
      concepts: ["LEFT JOIN", "COUNT"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m17-p2", moduleId: 17, difficulty: "Medium",
      title: "Anti-join: customers who never placed a delivered order",
      businessScenario: "Marketing wants to find inactive signups.",
      prompt: "Find customer_id and full_name of customers who have never placed a 'Delivered' order.",
      starterQuery: "SELECT ???\nFROM ???\nJOIN ??? ON ???\nWHERE ???;",
            solution: "SELECT c.customer_id, c.full_name FROM customers c LEFT JOIN orders o ON " +
                      "c.customer_id = o.customer_id AND o.status = 'Delivered' WHERE o.order_id IS " +
                      "NULL ORDER BY c.customer_id ASC;",
      hints: ["Filter LEFT JOIN matches using AND o.status = 'Delivered' in the ON clause, check IS NULL in WHERE."],
      detailedExplanation: "Left joins with NULL filters act as an anti-join.",
      alternativeApproach: "Use NOT IN or NOT EXISTS.",
      performanceNotes: "Optimized index scan.",
      concepts: ["LEFT JOIN", "anti-join", "IS NULL"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m17-p3", moduleId: 17, difficulty: "Hard",
      title: "Identify customers with no orders",
      businessScenario: "Find accounts that have placed zero orders of any status.",
            prompt: "Find all customers who have never placed an order. Return customer_id and " +
                    "full_name. Order by customer_id.",
      starterQuery: "-- Write your SQL query here\n",
            solution: "SELECT c.customer_id, c.full_name FROM customers c LEFT JOIN orders o ON " +
                      "c.customer_id = o.customer_id WHERE o.order_id IS NULL ORDER BY c.customer_id " +
                      "ASC;",
      hints: ["Join customers to orders, filter where orders.order_id IS NULL."],
      detailedExplanation: "Standard left-join check to isolate unmatched rows.",
      alternativeApproach: "None.",
      performanceNotes: "Uses customer indexes.",
      concepts: ["LEFT JOIN", "anti-join", "IS NULL"],
      companyTags: ["Swiggy"]
    },
    {
      id: "m17-p4", moduleId: 17, difficulty: "Hard",
      title: "Year-over-Year Inactive Buyers",
            businessScenario: "The marketing team wants a target list: find customers who purchased something " +
                              "in 2023, but have placed zero orders in 2024. This indicates churn.",
            prompt: "Write a query using LEFT JOIN to find all customers who placed an order in 2023 " +
                    "(order_date between '2023-01-01' and '2023-12-31') but have placed NO orders in " +
                    "2024 (order_date between '2024-01-01' and '2024-12-31'). Return customer_id, " +
                    "full_name, and segment. Order by customer_id.",
      starterQuery: "-- Write your SQL query here\n",
            solution: "SELECT DISTINCT c.customer_id, c.full_name, c.segment FROM customers c INNER " +
                      "JOIN orders o23 ON c.customer_id = o23.customer_id AND o23.order_date BETWEEN " +
                      "'2023-01-01' AND '2023-12-31' LEFT JOIN orders o24 ON c.customer_id = " +
                      "o24.customer_id AND o24.order_date BETWEEN '2024-01-01' AND '2024-12-31' WHERE " +
                      "o24.order_id IS NULL ORDER BY c.customer_id;",
      hints: [
        "First, join customers with orders for 2023 orders (use INNER JOIN or LEFT JOIN).",
        "Second, LEFT JOIN with orders again for 2024 orders (alias o24).",
        "Third, filter where o24.order_id IS NULL in the WHERE clause."
      ],
            detailedExplanation: "This demonstrates how to use multiple joins on the same table (orders) with " +
                                 "different filtering conditions in the ON clause to perform cohort exclusion.",
      alternativeApproach: "Using subqueries with NOT IN or EXISTS.",
      performanceNotes: "Joining with filtered date ranges in ON clauses is highly performant.",
      concepts: ["LEFT JOIN", "anti-join", "date filtering", "cohort analysis"],
      companyTags: ["Myntra", "Flipkart"]
    }
  ],

  // MODULE 18: Right Joins
  18: [
    {
      id: "m18-p1", moduleId: 18, difficulty: "Easy",
      title: "Order and Customer Pairing",
      businessScenario: "Audit customer details associated with orders using a RIGHT JOIN perspective.",
            prompt: "Pair all orders with customer details. In SQLite (which doesn't support RIGHT " +
                    "JOIN natively), simulate it by writing a LEFT JOIN with the tables reversed: " +
                    "customers LEFT JOIN orders.",
            starterQuery: "SELECT o.order_id, c.full_name\nFROM customers c\nLEFT JOIN orders o ON " +
                          "c.customer_id = o.customer_id;\n-- Note: This returns all customers (right " +
                          "table) and their orders.",
      solution: "SELECT o.order_id, c.full_name FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id;",
            hints: ["Reverse tables: SELECT order_id, full_name FROM customers LEFT JOIN orders ON " +
                    "customers.customer_id = orders.customer_id." ],
      detailedExplanation: "Simulates RIGHT JOIN by swapping left and right operands.",
      alternativeApproach: "None.",
      performanceNotes: "Equivalent to LEFT JOIN performance.",
      concepts: ["RIGHT JOIN simulation", "LEFT JOIN"],
      companyTags: ["Ola"]
    },
    {
      id: "m18-p2", moduleId: 18, difficulty: "Medium",
      title: "Unsold Inventory",
      businessScenario: "Identify products that have never been ordered.",
            prompt: "Write a query to find products that have never been ordered. Simulate a RIGHT " +
                    "JOIN by starting with the products table on the right side of a LEFT JOIN (or " +
                    "LEFT JOIN order_items onto products). Return product_id and product_name.",
            starterQuery: "SELECT p.product_id, p.product_name\nFROM order_items oi\nRIGHT JOIN products p " +
                          "ON oi.product_id = p.product_id\nWHERE oi.order_item_id IS NULL;\n-- Wait, " +
                          "SQLite does not support RIGHT JOIN. Let's rewrite as LEFT JOIN starting with " +
                          "products!",
            solution: "SELECT p.product_id, p.product_name FROM products p LEFT JOIN order_items oi ON " +
                      "p.product_id = oi.product_id WHERE oi.order_item_id IS NULL;",
      hints: ["Write: SELECT ... FROM products LEFT JOIN order_items ON ... WHERE order_item_id IS NULL."],
      detailedExplanation: "Finds products missing corresponding order items.",
      alternativeApproach: "None.",
      performanceNotes: "Fast anti-join.",
      concepts: ["LEFT JOIN", "anti-join", "RIGHT JOIN simulation"],
      companyTags: ["Croma"]
    },
    {
      id: "m18-p3", moduleId: 18, difficulty: "Hard",
      title: "Missing Payments",
      businessScenario: "Reconcile orders and payments to identify unpaid delivered orders.",
            prompt: "Find all delivered orders that have no corresponding payment. Return order_id, " +
                    "order_date, and total_amount. Simulate a RIGHT JOIN of orders with payments " +
                    "using LEFT JOIN.",
      starterQuery: "-- Write your SQL query here\n",
            solution: "SELECT o.order_id, o.order_date, o.total_amount FROM orders o LEFT JOIN " +
                      "payments p ON o.order_id = p.order_id WHERE o.status = 'Delivered' AND " +
                      "p.payment_id IS NULL;",
      hints: ["LEFT JOIN payments onto orders, filter where payment_id IS NULL and status = 'Delivered'."],
      detailedExplanation: "Audit reconciliation query using left anti-join.",
      alternativeApproach: "None.",
      performanceNotes: "Uses order_id primary/foreign keys.",
      concepts: ["LEFT JOIN", "anti-join", "RIGHT JOIN simulation"],
      companyTags: ["Paytm"]
    }
  ],

  // MODULE 19: Full Joins
  19: [
    {
      id: "m19-p1", moduleId: 19, difficulty: "Easy",
      title: "All Users and Subs",
      businessScenario: "Combine customer and subscription logs completely.",
            prompt: "Write a query to fully combine customers and subscriptions on customer_id. " +
                    "Since SQLite does not support FULL JOIN, simulate it using: LEFT JOIN ... UNION " +
                    "... LEFT JOIN (with right side NULL check).",
            starterQuery: "SELECT c.customer_id AS c_id, s.subscription_id FROM customers c LEFT JOIN " +
                          "subscriptions s ON c.customer_id = s.customer_id UNION SELECT s.customer_id AS " +
                          "c_id, s.subscription_id FROM subscriptions s LEFT JOIN customers c ON " +
                          "s.customer_id = c.customer_id WHERE ???",
            solution: "SELECT c.customer_id AS c_id, s.subscription_id FROM customers c LEFT JOIN " +
                      "subscriptions s ON c.customer_id = s.customer_id UNION SELECT s.customer_id AS " +
                      "c_id, s.subscription_id FROM subscriptions s LEFT JOIN customers c ON " +
                      "s.customer_id = c.customer_id WHERE c.customer_id IS NULL;",
      hints: ["UNION removes duplicates. The second query isolates right-only records."],
      detailedExplanation: "Simulates FULL OUTER JOIN in SQLite using UNION of left and right exclusion queries.",
      alternativeApproach: "None.",
      performanceNotes: "Requires sorting for UNION deduplication.",
      concepts: ["FULL JOIN simulation", "UNION", "LEFT JOIN"],
      companyTags: ["Hotstar"]
    },
    {
      id: "m19-p2", moduleId: 19, difficulty: "Medium",
      title: "Segment Isolation",
      businessScenario: "Reconcile customer segments and subscriptions.",
            prompt: "Find all combinations of customer segments and plans. Use FULL JOIN simulation " +
                    "to combine customer segment and subscription plan_name, return distinct segment " +
                    "and plan_name.",
      starterQuery: "SELECT ???\nFROM ???\nJOIN ??? ON ???\nWHERE ???;",
            solution: "SELECT DISTINCT c.segment, s.plan_name FROM customers c LEFT JOIN subscriptions " +
                      "s ON c.customer_id = s.customer_id UNION SELECT DISTINCT c.segment, s.plan_name " +
                      "FROM subscriptions s LEFT JOIN customers c ON s.customer_id = c.customer_id;",
      hints: ["UNION combines left and right queries."],
      detailedExplanation: "Evaluates connections between buyer segment attributes and subscription plans.",
      alternativeApproach: "None.",
      performanceNotes: "De-duplicates results.",
      concepts: ["FULL JOIN simulation", "UNION"],
      companyTags: ["Hotstar"]
    },
    {
      id: "m19-p3", moduleId: 19, difficulty: "Hard",
      title: "Order & Payment Ledger",
      businessScenario: "Reconcile orders and payments ledger completely.",
            prompt: "Reconcile all orders and payments. Return order_id (from orders), payment_id, " +
                    "total_amount, and amount (from payments). Use FULL JOIN simulation. Order by " +
                    "order_id.",
      starterQuery: "-- Write your SQL query here\n",
            solution: "SELECT o.order_id, p.payment_id, o.total_amount, p.amount FROM orders o LEFT " +
                      "JOIN payments p ON o.order_id = p.order_id UNION SELECT p.order_id, " +
                      "p.payment_id, o.total_amount, p.amount FROM payments p LEFT JOIN orders o ON " +
                      "p.order_id = o.order_id WHERE o.order_id IS NULL ORDER BY 1;",
      hints: ["Write left join, then UNION, then right join with WHERE left key IS NULL."],
      detailedExplanation: "Audit Ledger compilation using FULL JOIN simulation.",
      alternativeApproach: "None.",
      performanceNotes: "Requires sorting for UNION.",
      concepts: ["FULL JOIN simulation", "UNION", "anti-join"],
      companyTags: ["Paytm"]
    }
  ],

  // MODULE 20: Self Joins
  20: [
    {
      id: "m20-p1", moduleId: 20, difficulty: "Easy",
      title: "Employees and Managers",
      businessScenario: "Corporate chart review.",
            prompt: "Write a query to list all employee names along with their manager's name. Join " +
                    "the employees table to itself. Return employee_name and manager_name.",
            starterQuery: "SELECT\n  e.employee_name AS employee_name,\n  m.employee_name AS " +
                          "manager_name\nFROM employees e\nINNER JOIN employees m ON e.manager_id = " +
                          "m.employee_id;",
            solution: "SELECT e.employee_name AS employee_name, m.employee_name AS manager_name FROM " +
                      "employees e INNER JOIN employees m ON e.manager_id = m.employee_id;",
      hints: ["Join employees aliased as e (employee) and m (manager) on e.manager_id = m.employee_id."],
      detailedExplanation: "Self join associates rows within the same table.",
      alternativeApproach: "None.",
      performanceNotes: "Fast pk-fk join.",
      concepts: ["SELF JOIN"],
      companyTags: ["Ola"]
    },
    {
      id: "m20-p2", moduleId: 20, difficulty: "Medium",
      title: "Earning More Than Managers",
      businessScenario: "Audit salary hierarchies.",
            prompt: "Find employees who earn more than their manager. Return employee_name, " +
                    "employee_salary, manager_name, and manager_salary.",
            starterQuery: "SELECT\n  e.employee_name AS employee_name,\n  e.salary_lpa AS " +
                          "employee_salary,\n  m.employee_name AS manager_name,\n  m.salary_lpa AS " +
                          "manager_salary\nFROM employees e\nINNER JOIN employees m ON e.manager_id = " +
                          "m.employee_id\nWHERE e.salary_lpa > m.salary_lpa;",
            solution: "SELECT e.employee_name AS employee_name, e.salary_lpa AS employee_salary, " +
                      "m.employee_name AS manager_name, m.salary_lpa AS manager_salary FROM employees e " +
                      "INNER JOIN employees m ON e.manager_id = m.employee_id WHERE e.salary_lpa > " +
                      "m.salary_lpa;",
      hints: ["Add a WHERE clause comparing e.salary_lpa > m.salary_lpa."],
      detailedExplanation: "SELF JOIN with a value filter.",
      alternativeApproach: "None.",
      performanceNotes: "Sort compares local records.",
      concepts: ["SELF JOIN", "WHERE"],
      companyTags: ["Ola"]
    },
    {
      id: "m20-p3", moduleId: 20, difficulty: "Hard",
      title: "Cities with multiple same-segment customers — spend comparison",
            businessScenario: "The marketing team at Ola wants to target cities that have at least 2 Premium " +
                              "customers, and for those cities, wants to compare premium customer pairs by " +
                              "total lifetime spend to identify the top buyer in each pairing.",
            prompt: "Write a query using a SELF JOIN on customers where both customers are 'Premium' " +
                    "segment and share the same city (c1.customer_id < c2.customer_id to avoid " +
                    "duplicates). JOIN both aliases to the orders table to compute each customer's " +
                    "total spend. Return c1.full_name as customer1, c2.full_name as customer2, the " +
                    "city, c1_total_spend (rounded SUM of c1's orders), and c2_total_spend (rounded " +
                    "SUM of c2's orders). Order by city, c1_total_spend descending.",
      starterQuery: "-- Write your SQL query here\n",
            solution: "SELECT c1.full_name AS customer1, c2.full_name AS customer2, c1.city, " +
                      "ROUND(SUM(o1.total_amount), 2) AS c1_total_spend, ROUND(SUM(o2.total_amount), 2) " +
                      "AS c2_total_spend FROM customers c1 INNER JOIN customers c2 ON c1.city = c2.city " +
                      "AND c1.segment = 'Premium' AND c2.segment = 'Premium' AND c1.customer_id < " +
                      "c2.customer_id LEFT JOIN orders o1 ON o1.customer_id = c1.customer_id LEFT JOIN " +
                      "orders o2 ON o2.customer_id = c2.customer_id GROUP BY c1.customer_id, " +
                      "c2.customer_id, c1.city ORDER BY c1.city ASC, c1_total_spend DESC;",
      hints: [
        "SELF JOIN customers c1 and c2 on city = city AND segment = 'Premium' AND c1.customer_id < c2.customer_id.",
        "LEFT JOIN orders o1 on o1.customer_id = c1.customer_id to compute c1's spend.",
        "LEFT JOIN orders o2 on o2.customer_id = c2.customer_id to compute c2's spend.",
        "SUM(o1.total_amount) for c1_total_spend, SUM(o2.total_amount) for c2_total_spend.",
        "GROUP BY c1.customer_id, c2.customer_id, c1.city to aggregate per pair."
      ],
            detailedExplanation: "This problem combines SELF JOIN (Module 20's core concept) with multi-table " +
                                 "LEFT JOINs, GROUP BY, SUM, ROUND, and ORDER BY — the full multi-concept " +
                                 "composition expected at Hard difficulty. The inequality c1.customer_id < " +
                                 "c2.customer_id eliminates both self-pairs and symmetric duplicates.",
            alternativeApproach: "Could pre-aggregate spend per customer in a CTE, then do the self-join on the " +
                                 "CTE to simplify the GROUP BY.",
            performanceNotes: "SELF JOIN is O(n²) on customers; filtering to 'Premium' segment first reduces " +
                              "the working set significantly.",
      concepts: ["SELF JOIN", "multi-table JOIN", "GROUP BY", "SUM", "ROUND", "ORDER BY", "segment filter"],
      companyTags: ["Ola"]
    }
  ],

  // MODULE 21: Subqueries in WHERE
  21: [
    {
      id: "m21-p1", moduleId: 21, difficulty: "Easy",
      title: "Orders above the overall average",
      businessScenario: "Identify high-value orders.",
            prompt: "Write a query to find all orders with a total_amount strictly greater than the " +
                    "overall average total_amount. Return order_id and total_amount. Sort desc.",
            starterQuery: "SELECT order_id, total_amount FROM orders WHERE total_amount > (SELECT " +
                          "AVG(total_amount) FROM orders) ORDER BY ???;",
            solution: "SELECT order_id, total_amount FROM orders WHERE total_amount > (SELECT " +
                      "AVG(total_amount) FROM orders) ORDER BY total_amount DESC;",
      hints: ["Compute average in subquery inside WHERE clause."],
      detailedExplanation: "Uncorrelated subquery evaluated once.",
      alternativeApproach: "None.",
      performanceNotes: "Highly performant.",
      concepts: ["subquery", "WHERE"],
      companyTags: ["Zomato"]
    },
    {
      id: "m21-p2", moduleId: 21, difficulty: "Medium",
      title: "Customers with above-average total spend",
      businessScenario: "Target premium loyalty tier candidates.",
            prompt: "Find customer_id and total_spent. Group by customer, return only those whose " +
                    "total sum of total_amount exceeds the average customer lifetime spend.",
            starterQuery: "SELECT customer_id, SUM(total_amount) AS total_spent\nFROM orders\nGROUP BY " +
                          "customer_id\nHAVING SUM(total_amount) > (\n  SELECT AVG(customer_spent)\n  FROM " +
                          "(SELECT SUM(total_amount) AS customer_spent FROM orders GROUP BY " +
                          "customer_id)\n);",
            solution: "SELECT customer_id, SUM(total_amount) AS total_spent FROM orders GROUP BY " +
                      "customer_id HAVING SUM(total_amount) > (SELECT AVG(customer_spent) FROM (SELECT " +
                      "SUM(total_amount) AS customer_spent FROM orders GROUP BY customer_id));",
      hints: ["Use HAVING with subquery computing average customer spend."],
      detailedExplanation: "Filters groups using a nested scalar aggregate subquery.",
      alternativeApproach: "None.",
      performanceNotes: "Requires aggregating orders.",
      concepts: ["subquery", "HAVING", "GROUP BY"],
      companyTags: ["Zomato"]
    },
    {
      id: "m21-p3", moduleId: 21, difficulty: "Hard",
      title: "Find orders above average value",
      businessScenario: "Operational audit of transaction values.",
            prompt: "Write a query to retrieve order_id and total_amount for orders exceeding the " +
                    "average total_amount of all orders. Order by total_amount descending.",
            starterQuery: "SELECT order_id, total_amount\nFROM orders\nWHERE total_amount > (\n  SELECT " +
                          "AVG(total_amount)\n  FROM orders\n)\nORDER BY total_amount DESC;",
            solution: "SELECT order_id, total_amount FROM orders WHERE total_amount > (SELECT " +
                      "AVG(total_amount) FROM orders) ORDER BY total_amount DESC;",
      hints: ["Basic subquery check inside WHERE."],
      detailedExplanation: "Filters using overall average scalar value.",
      alternativeApproach: "None.",
      performanceNotes: "Very efficient.",
      concepts: ["subquery", "AVG"],
      companyTags: ["Zomato"]
    }
  ],

  // MODULE 22: Correlated Subqueries
  22: [
    {
      id: "m22-p1", moduleId: 22, difficulty: "Easy",
      title: "Above Channel Average",
      businessScenario: "Check transaction deviations.",
            prompt: "Find orders exceeding their booking channel's average total_amount. Return " +
                    "order_id, channel, and total_amount.",
            starterQuery: "SELECT o1.order_id, o1.channel, o1.total_amount\nFROM orders o1\nWHERE " +
                          "o1.total_amount > (\n  SELECT AVG(o2.total_amount)\n  FROM orders o2\n  WHERE " +
                          "o2.channel = o1.channel\n);",
            solution: "SELECT o1.order_id, o1.channel, o1.total_amount FROM orders o1 WHERE " +
                      "o1.total_amount > (SELECT AVG(o2.total_amount) FROM orders o2 WHERE o2.channel = " +
                      "o1.channel);",
      hints: ["Inside the subquery, link o2.channel = o1.channel."],
      detailedExplanation: "Correlated subquery runs once per outer order row.",
      alternativeApproach: "JOIN with grouped channel averages CTE.",
      performanceNotes: "Runs N times; slower than CTE JOIN on large tables.",
      concepts: ["correlated subquery", "AVG"],
      companyTags: ["Zomato"]
    },
    {
      id: "m22-p2", moduleId: 22, difficulty: "Medium",
      title: "Above-average department salaries",
            businessScenario: "The corporate finance team is conducting a compensation parity review to " +
                              "identify employees who are paid significantly more than their immediate peers. " +
                              "Your task is to query the employee records to find individuals whose current " +
                              "salary exceeds the average salary of their respective department.",
            prompt: "Find employees who earn more than their department's average salary. Return " +
                    "name (employee's name), dept_name (department name), and salary.",
            starterQuery: "SELECT\n  e1.employee_name AS name,\n  d1.department_name AS dept_name,\n " +
                          "e1.salary_lpa AS salary\nFROM employees e1\nJOIN departments d1 ON " +
                          "e1.department_id = d1.department_id\nWHERE e1.salary_lpa > (\n  SELECT " +
                          "AVG(e2.salary_lpa)\n  FROM employees e2\n  WHERE e2.department_id = " +
                          "e1.department_id\n);",
            solution: "SELECT e1.employee_name AS name, d1.department_name AS dept_name, e1.salary_lpa " +
                      "AS salary FROM employees e1 JOIN departments d1 ON e1.department_id = " +
                      "d1.department_id WHERE e1.salary_lpa > (SELECT AVG(e2.salary_lpa) FROM employees " +
                      "e2 WHERE e2.department_id = e1.department_id);",
      hints: ["Correlate on department_id inside the subquery."],
      detailedExplanation: "Compares employee to their department peers.",
      alternativeApproach: "None.",
      performanceNotes: "Fast on indexed tables.",
      concepts: ["correlated subquery"],
      companyTags: ["Ola"]
    },
    {
      id: "m22-p3", moduleId: 22, difficulty: "Hard",
      title: "Slow city deliveries",
      businessScenario: "Operations wants food orders with above-average delivery times for their city.",
            prompt: "Find food orders that have a delivery time strictly greater than the average " +
                    "delivery time of their own city. Return food_order_id, restaurant, city, and " +
                    "delivery_minutes.",
            starterQuery: "SELECT f1.food_order_id, f1.restaurant, f1.city, f1.delivery_minutes\nFROM " +
                          "food_orders f1\nWHERE f1.delivery_minutes > (\n  SELECT " +
                          "AVG(f2.delivery_minutes)\n  FROM food_orders f2\n  WHERE f2.city = f1.city\n);",
            solution: "SELECT f1.food_order_id, f1.restaurant, f1.city, f1.delivery_minutes FROM " +
                      "food_orders f1 WHERE f1.delivery_minutes > (SELECT AVG(f2.delivery_minutes) FROM " +
                      "food_orders f2 WHERE f2.city = f1.city);",
      hints: ["Correlate subquery on f2.city = f1.city."],
      detailedExplanation: "Compares delivery speed with city baseline.",
      alternativeApproach: "JOIN with city aggregates.",
      performanceNotes: "Highly CPU bound.",
      concepts: ["correlated subquery", "AVG"],
      companyTags: ["Zomato"]
    }
  ],

  // MODULE 23: Subqueries in FROM (Derived Tables)
  23: [
    {
      id: "m23-p1", moduleId: 23, difficulty: "Easy",
      title: "Average of customer order counts derived table",
      businessScenario: "Operational benchmark: how many orders does a customer place on average?",
            prompt: "Write a query to calculate the average number of orders placed by customers. " +
                    "First, write a subquery in FROM that counts orders grouped by customer_id. Then, " +
                    "in the outer query, calculate the average of those counts. Alias the result as " +
                    "avg_orders_per_customer.",
            starterQuery: "SELECT AVG(order_count) AS avg_orders_per_customer\nFROM (\n  SELECT " +
                          "customer_id, COUNT(*) AS order_count\n  FROM orders\n  GROUP BY customer_id\n);",
            solution: "SELECT AVG(order_count) AS avg_orders_per_customer FROM (SELECT customer_id, " +
                      "COUNT(*) AS order_count FROM orders GROUP BY customer_id);",
      hints: ["Wrap the GROUP BY query inside parentheses in FROM clause."],
      detailedExplanation: "Derived table is evaluated first, then aggregated.",
      alternativeApproach: "CTE.",
      performanceNotes: "Extremely performant.",
      concepts: ["derived table", "AVG", "GROUP BY"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m23-p2", moduleId: 23, difficulty: "Medium",
      title: "Max of average city transaction amounts",
      businessScenario: "Identify spending peaks across regions.",
            prompt: "Write a query to find the highest average order total amount across all cities. " +
                    "Use a derived table that calculates average total_amount grouped by customer " +
                    "city (joining orders and customers). Then, select the maximum average value as " +
                    "max_city_average.",
            starterQuery: "SELECT MAX(avg_amount) AS max_city_average\nFROM (\n  SELECT c.city, " +
                          "AVG(o.total_amount) AS avg_amount\n  FROM orders o\n  INNER JOIN customers c ON " +
                          "o.customer_id = c.customer_id\n  GROUP BY c.city\n);",
            solution: "SELECT MAX(avg_amount) AS max_city_average FROM (SELECT c.city, " +
                      "AVG(o.total_amount) AS avg_amount FROM orders o INNER JOIN customers c ON " +
                      "o.customer_id = c.customer_id GROUP BY c.city);",
      hints: ["The subquery joins tables, groups by city, and aggregates AVG(total_amount)."],
      detailedExplanation: "Computes intermediate averages before finding the global peak.",
      alternativeApproach: "None.",
      performanceNotes: "Scans and groups orders.",
      concepts: ["derived table", "MAX", "INNER JOIN"],
      companyTags: ["Swiggy"]
    },
    {
      id: "m23-p3", moduleId: 23, difficulty: "Hard",
      title: "Active month counts per plan derived table",
      businessScenario: "Audits subscription plan retention peaks.",
            prompt: "Find the maximum active months duration recorded for subscriptions in each plan " +
                    "category, using a derived table that calculates active months (in SQLite: " +
                    "(julianday(end_date) - julianday(start_date))/30.0). Return plan_name and " +
                    "max_duration (rounded to 1 decimal place). If end_date is NULL, assume a default " +
                    "duration of 12.0.",
            starterQuery: "SELECT plan_name, MAX(active_months) AS max_duration\nFROM (\n  SELECT " +
                          "plan_name, ROUND(COALESCE((julianday(end_date) - julianday(start_date))/30.0, " +
                          "12.0), 1) AS active_months\n  FROM subscriptions\n)\nGROUP BY plan_name;",
            solution: "SELECT plan_name, MAX(active_months) AS max_duration FROM (SELECT plan_name, " +
                      "ROUND(COALESCE((julianday(end_date) - julianday(start_date))/30.0, 12.0), 1) AS " +
                      "active_months FROM subscriptions) GROUP BY plan_name;",
      hints: ["Calculate months inside derived table, then aggregate in outer query."],
      detailedExplanation: "Combines derived tables with advanced NULL coalescing and date arithmetic.",
      alternativeApproach: "None.",
      performanceNotes: "Performs calculations on small dimensions.",
      concepts: ["derived table", "MAX", "COALESCE", "julianday"],
      companyTags: ["Hotstar"]
    }
  ],

  // MODULE 24: Common Table Expressions (CTEs)
  24: [
    {
      id: "m24-p1", moduleId: 24, difficulty: "Easy",
      title: "Clean customer records via CTE",
      businessScenario: "Re-usable query pipelines.",
            prompt: "Write a query using a Common Table Expression (CTE) named customer_summary to " +
                    "retrieve all columns from customers. Select all columns from the CTE where the " +
                    "city is 'Bengaluru'.",
            starterQuery: "WITH customer_summary AS (\n  SELECT * FROM customers\n)\nSELECT *\nFROM " +
                          "customer_summary\nWHERE city = 'Bengaluru';",
            solution: "WITH customer_summary AS (SELECT * FROM customers) SELECT * FROM " +
                      "customer_summary WHERE city = 'Bengaluru';",
      hints: ["Use WITH customer_summary AS (...) syntax."],
      detailedExplanation: "CTE acts as a temporary named result set.",
      alternativeApproach: "Subquery.",
      performanceNotes: "Inlined in query optimizer.",
      concepts: ["CTE", "WITH"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m24-p2", moduleId: 24, difficulty: "Medium",
      title: "Monthly revenue trend using CTE",
            businessScenario: "The leadership team at Flipkart wants to analyze revenue growth over time to " +
                              "detect seasonal purchasing patterns. You need to write a query that compiles " +
                              "total sales volume into monthly time buckets using a clean Common Table " +
                              "Expression (CTE) format.",
            prompt: "Create a CTE named monthly_sales that aggregates order total_amount into " +
                    "monthly buckets. Select order_month (as YYYY-MM) and total_revenue from the CTE, " +
                    "sorted chronologically.",
            starterQuery: "WITH monthly_sales AS (\n  SELECT SUBSTR(order_date, 1, 7) AS sales_month, " +
                          "SUM(total_amount) AS revenue\n  FROM orders\n  GROUP BY sales_month\n)\nSELECT " +
                          "sales_month, revenue\nFROM monthly_sales\nORDER BY sales_month ASC;",
            solution: "WITH monthly_sales AS (SELECT SUBSTR(order_date, 1, 7) AS sales_month, " +
                      "SUM(total_amount) AS revenue FROM orders GROUP BY SUBSTR(order_date, 1, 7)) " +
                      "SELECT sales_month, revenue FROM monthly_sales ORDER BY sales_month ASC;",
      hints: ["Compute SUM grouped by month inside CTE."],
      detailedExplanation: "Averages revenue over structured time buckets.",
      alternativeApproach: "None.",
      performanceNotes: "Fast aggregation.",
      concepts: ["CTE", "GROUP BY", "SUM"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m24-p3", moduleId: 24, difficulty: "Hard",
      title: "Hierarchical Org Chart via Recursive CTE",
      businessScenario: "Construct hierarchy org tree.",
            prompt: "Write a recursive CTE named org_hierarchy that builds the employee hierarchy " +
                    "reporting path starting with the top manager (where manager_id IS NULL). For " +
                    "each employee, return emp_id, name, manager_id, level (starting at 1), and path " +
                    "(concatenated names like 'Priya Menon > ...'). Order by level, path.",
            starterQuery: "WITH RECURSIVE org_hierarchy AS (\n  -- Anchor Member\n  SELECT employee_id AS " +
                          "emp_id, employee_name AS name, manager_id, 1 AS level, CAST(employee_name AS " +
                          "TEXT) AS path\n  FROM employees\n  WHERE manager_id IS NULL\n  UNION ALL\n  -- " +
                          "Recursive Member\n  SELECT e.employee_id, e.employee_name, e.manager_id, " +
                          "oh.level + 1, oh.path || ' > ' || e.employee_name\n  FROM employees e\n  INNER " +
                          "JOIN org_hierarchy oh ON e.manager_id = oh.emp_id\n)\nSELECT emp_id, name, " +
                          "manager_id, level, path\nFROM org_hierarchy\nORDER BY level, path;",
            solution: "WITH RECURSIVE org_hierarchy AS (SELECT employee_id AS emp_id, employee_name AS " +
                      "name, manager_id, 1 AS level, CAST(employee_name AS TEXT) AS path FROM employees " +
                      "WHERE manager_id IS NULL UNION ALL SELECT e.employee_id, e.employee_name, " +
                      "e.manager_id, oh.level + 1, oh.path || ' > ' || e.employee_name FROM employees e " +
                      "INNER JOIN org_hierarchy oh ON e.manager_id = oh.emp_id) SELECT emp_id, name, " +
                      "manager_id, level, path FROM org_hierarchy ORDER BY level, path;",
      hints: ["Use WITH RECURSIVE org_hierarchy AS (anchor UNION ALL recursive)."],
      detailedExplanation: "Recursive CTE matches reports to managers sequentially, building levels.",
      alternativeApproach: "None.",
      performanceNotes: "Runs iteratively until leaf nodes are resolved.",
      concepts: ["recursive CTE", "SELF JOIN", "UNION ALL"],
      companyTags: ["Ola"]
    },
    {
      id: "m24-p4", moduleId: 24, difficulty: "Hard",
      title: "Category Revenue Contribution via CTE",
            businessScenario: "The Chief Merchandising Officer at Flipkart wants to see how much each product " +
                              "category contributes to the total revenue of the company. Break this down by " +
                              "category and calculate the percentage contribution.",
            prompt: "Write a query using CTEs. First, create a CTE that calculates the total revenue " +
                    "of the company (all order items quantity * unit_price). Second, create a CTE " +
                    "that aggregates revenue by product category. Finally, query these CTEs to return " +
                    "category, category_revenue, and contribution_pct (calculated as category_revenue " +
                    "divided by total company revenue multiplied by 100). Round contribution_pct to 2 " +
                    "decimal places. Sort by contribution_pct descending.",
      starterQuery: "-- Write your SQL query here\n",
            solution: "WITH total_rev AS (SELECT SUM(quantity * unit_price) AS global_total FROM " +
                      "order_items), cat_rev AS (SELECT p.category, SUM(oi.quantity * oi.unit_price) AS " +
                      "category_revenue FROM order_items oi INNER JOIN products p ON oi.product_id = " +
                      "p.product_id GROUP BY p.category) SELECT cr.category, cr.category_revenue, " +
                      "ROUND((cr.category_revenue * 100.0) / tr.global_total, 2) AS contribution_pct " +
                      "FROM cat_rev cr CROSS JOIN total_rev tr ORDER BY contribution_pct DESC;",
      hints: [
        "Create a single-row CTE for total company revenue.",
        "Create another CTE for product category revenue by joining order_items and products.",
        "Cross join the two CTEs in your final SELECT to calculate the percentage: " +
        "(category_revenue * 100.0) / global_total."
      ],
            detailedExplanation: "This demonstrates how to combine aggregations of different grains (global vs " +
                                 "category) by referencing multiple CTEs in the same query.",
      alternativeApproach: "Using nested scalar subqueries in the SELECT clause.",
            performanceNotes: "CTEs are cleaner and allow the database to optimize the global total " +
                              "calculation once instead of running a subquery for every row.",
      concepts: ["CTE", "CROSS JOIN", "aggregation", "percentage contribution"],
      companyTags: ["Flipkart", "Amazon"]
    }
  ],

  // MODULE 25: Window Functions - ROW_NUMBER
  25: [
    {
      id: "m25-p1", moduleId: 25, difficulty: "Easy",
      title: "Chronological Order Numbering",
      businessScenario: "Assign unique order sequence markers.",
            prompt: "Write a query to assign a unique sequential row number to all orders. Return " +
                    "order_id, customer_id, order_date, total_amount, and order_seq (using " +
                    "ROW_NUMBER() OVER(ORDER BY order_date ASC)).",
            starterQuery: "SELECT order_id, customer_id, order_date, total_amount, ROW_NUMBER() OVER " +
                          "(ORDER BY ???) AS order_seq FROM orders;",
            solution: "SELECT order_id, customer_id, order_date, total_amount, ROW_NUMBER() OVER " +
                      "(ORDER BY order_date ASC) AS order_seq FROM orders;",
      hints: ["Use ROW_NUMBER() OVER (ORDER BY order_date ASC)."],
      detailedExplanation: "Assigns sequential integers starting from 1.",
      alternativeApproach: "None.",
      performanceNotes: "Requires sorting orders.",
      concepts: ["ROW_NUMBER", "window function"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m25-p2", moduleId: 25, difficulty: "Medium",
      title: "Customer's most recent order",
      businessScenario: "Locate latest buyer transactions.",
            prompt: "Find each customer's most recent order. Use ROW_NUMBER() partitioned by " +
                    "customer_id and ordered by order_date desc. Wrap in a CTE and select rows with " +
                    "sequence = 1.",
            starterQuery: "WITH ranked_orders AS (\n  SELECT order_id, customer_id, order_date, " +
                          "total_amount,\n         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY " +
                          "order_date DESC) AS rn\n  FROM orders\n)\nSELECT order_id, customer_id, " +
                          "order_date, total_amount\nFROM ranked_orders\nWHERE rn = 1;",
            solution: "WITH ranked_orders AS (SELECT order_id, customer_id, order_date, total_amount, " +
                      "ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC) AS rn FROM " +
                      "orders) SELECT order_id, customer_id, order_date, total_amount FROM " +
                      "ranked_orders WHERE rn = 1;",
      hints: ["Partition by customer_id, sort by order_date DESC inside window."],
      detailedExplanation: "Combines partition mapping with row sequence filters in CTE.",
      alternativeApproach: "None.",
      performanceNotes: "Window partition sorts are optimized.",
      concepts: ["ROW_NUMBER", "PARTITION BY", "CTE"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m25-p3", moduleId: 25, difficulty: "Hard",
      title: "Top 2 Products per Category",
      businessScenario: "Identify category leaders.",
            prompt: "Find the top 2 products with the highest list price in each product category. " +
                    "Use ROW_NUMBER() partitioned by category and ordered by list_price desc. Return " +
                    "category, product_name, list_price, and price_rank.",
            starterQuery: "WITH ranked_products AS (\n  SELECT category, product_name, list_price,\n      " +
                          "  ROW_NUMBER() OVER (PARTITION BY category ORDER BY list_price DESC) AS " +
                          "price_rank\n  FROM products\n)\nSELECT category, product_name, list_price, " +
                          "price_rank\nFROM ranked_products\nWHERE price_rank <= 2\nORDER BY category, " +
                          "price_rank;",
            solution: "WITH ranked_products AS (SELECT category, product_name, list_price, " +
                      "ROW_NUMBER() OVER (PARTITION BY category ORDER BY list_price DESC) AS price_rank " +
                      "FROM products) SELECT category, product_name, list_price, price_rank FROM " +
                      "ranked_products WHERE price_rank <= 2 ORDER BY category, price_rank;",
      hints: ["Use PARTITION BY category ORDER BY list_price DESC."],
      detailedExplanation: "Ranks catalog rows per category partition.",
      alternativeApproach: "None.",
      performanceNotes: "Sort partition runs per category.",
      concepts: ["ROW_NUMBER", "PARTITION BY", "CTE"],
      companyTags: ["Croma"]
    }
  ]
};



const problemsBatch3: Record<number, PracticeProblem[]> = {
  // MODULE 26: Window Functions - RANK & DENSE_RANK
  26: [
    {
      id: "m26-p1", moduleId: 26, difficulty: "Easy",
      title: "Rank customers by signup date",
      businessScenario: "Review signup cohorts chronologically.",
            prompt: "Write a query using DENSE_RANK() to rank customers based on their signup_date " +
                    "ascending. Return customer_id, full_name, signup_date, and signup_rank.",
            starterQuery: "SELECT customer_id, full_name, signup_date, DENSE_RANK() OVER (ORDER BY ???) AS " +
                          "signup_rank FROM customers;",
            solution: "SELECT customer_id, full_name, signup_date, DENSE_RANK() OVER (ORDER BY " +
                      "signup_date ASC) AS signup_rank FROM customers;",
      hints: ["Use DENSE_RANK() OVER (ORDER BY signup_date ASC)."],
      detailedExplanation: "DENSE_RANK doesn't skip rank numbers in case of ties.",
      alternativeApproach: "None.",
      performanceNotes: "Requires sorting signup_date.",
      concepts: ["DENSE_RANK", "window function"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m26-p2", moduleId: 26, difficulty: "Medium",
      title: "Rank products by revenue within category",
      businessScenario: "Identify high-performing products within their own category.",
            prompt: "Write a query to calculate total revenue per product (sum of quantity * " +
                    "unit_price) and rank them within their category using DENSE_RANK(). Return " +
                    "category, product_name, total_revenue, and revenue_rank. Only include delivered " +
                    "orders. Sort by category, revenue_rank.",
            starterQuery: "WITH product_revenue AS (\n  SELECT p.category, p.product_name, SUM(oi.quantity " +
                          "* oi.unit_price) AS total_revenue\n  FROM order_items oi\n  INNER JOIN products " +
                          "p ON oi.product_id = p.product_id\n  INNER JOIN orders o ON oi.order_id = " +
                          "o.order_id\n  WHERE o.status = 'Delivered'\n  GROUP BY p.category, " +
                          "p.product_name\n)\nSELECT category, product_name, total_revenue,\n      " +
                          "DENSE_RANK() OVER (PARTITION BY category ORDER BY total_revenue DESC) AS " +
                          "revenue_rank\nFROM product_revenue\nORDER BY category, revenue_rank;",
            solution: "WITH product_revenue AS (SELECT p.category, p.product_name, SUM(oi.quantity * " +
                      "oi.unit_price) AS total_revenue FROM order_items oi INNER JOIN products p ON " +
                      "oi.product_id = p.product_id INNER JOIN orders o ON oi.order_id = o.order_id " +
                      "WHERE o.status = 'Delivered' GROUP BY p.category, p.product_name) SELECT " +
                      "category, product_name, total_revenue, DENSE_RANK() OVER (PARTITION BY category " +
                      "ORDER BY total_revenue DESC) AS revenue_rank FROM product_revenue ORDER BY " +
                      "category, revenue_rank;",
      hints: ["Use DENSE_RANK() partitioned by category and sorted by total_revenue DESC."],
      detailedExplanation: "Ranks sales performance relative to category peers.",
      alternativeApproach: "None.",
      performanceNotes: "Requires multi-way join and window sorting.",
      concepts: ["DENSE_RANK", "PARTITION BY", "CTE"],
      companyTags: ["Croma"]
    },
    {
      id: "m26-p3", moduleId: 26, difficulty: "Hard",
      title: "Find the 2nd highest revenue product per category",
            businessScenario: "The category management team at Croma wants to see the runner-up revenue " +
                              "product in each category \u2014 the product that almost won the top spot. This " +
                              "tests whether you can combine CTEs, joins, aggregation, and DENSE_RANK " +
                              "filtering.",
            prompt: "Write a query using a CTE that: (1) joins order_items and products to compute " +
                    "total_revenue per product (SUM of quantity * unit_price), (2) applies " +
                    "DENSE_RANK() partitioned by category ordered by total_revenue descending, (3) in " +
                    "the outer query returns category, product_name, total_revenue, and revenue_rank " +
                    "WHERE revenue_rank = 2. Only include delivered orders. Order by category, " +
                    "total_revenue descending.",
            starterQuery: "WITH ranked_products AS (\n  SELECT\n    p.category,\n    p.product_name,\n   " +
                          "SUM(oi.quantity * oi.unit_price) AS total_revenue,\n    DENSE_RANK() OVER " +
                          "(PARTITION BY p.category ORDER BY SUM(oi.quantity * oi.unit_price) DESC) AS " +
                          "revenue_rank\n  FROM order_items oi\n  INNER JOIN products p ON oi.product_id = " +
                          "p.product_id\n  INNER JOIN orders o ON oi.order_id = o.order_id\n  WHERE " +
                          "o.status = 'Delivered'\n  GROUP BY p.category, p.product_name\n)\nSELECT " +
                          "category, product_name, total_revenue, revenue_rank\nFROM ranked_products\nWHERE " +
                          "revenue_rank = 2\nORDER BY category, total_revenue DESC;",
            solution: "WITH ranked_products AS (SELECT p.category, p.product_name, SUM(oi.quantity * " +
                      "oi.unit_price) AS total_revenue, DENSE_RANK() OVER (PARTITION BY p.category " +
                      "ORDER BY SUM(oi.quantity * oi.unit_price) DESC) AS revenue_rank FROM order_items " +
                      "oi INNER JOIN products p ON oi.product_id = p.product_id INNER JOIN orders o ON " +
                      "oi.order_id = o.order_id WHERE o.status = 'Delivered' GROUP BY p.category, " +
                      "p.product_name) SELECT category, product_name, total_revenue, revenue_rank FROM " +
                      "ranked_products WHERE revenue_rank = 2 ORDER BY category, total_revenue DESC;",
      hints: [
        "Build a CTE that groups by category and product_name with SUM(oi.quantity * oi.unit_price).",
        "Apply DENSE_RANK() inside the CTE, partitioned by category.",
        "Filter WHERE revenue_rank = 2 in the outer query.",
        "You need INNER JOINs to both products and orders tables."
      ],
            detailedExplanation: "This pattern \u2014 CTE + window rank + outer filter \u2014 is the canonical " +
                                 "SQL solution for 'top-N per group' problems. DENSE_RANK ensures tied ranks don't " +
                                 "skip rank 2.",
      alternativeApproach: "Could use ROW_NUMBER instead if ties should each be distinct.",
            performanceNotes: "Aggregation runs before the window function, which then sorts partitions. An " +
                              "index on order_items(order_id, product_id) helps.",
      concepts: ["DENSE_RANK", "PARTITION BY", "CTE", "INNER JOIN", "GROUP BY", "SUM", "window filter"],
      companyTags: ["Croma"]
    },
    {
      id: "m26-p4", moduleId: 26, difficulty: "Medium",
      title: "Quartile revenue segmentation",
      businessScenario: "The marketing team wants to segment customers into four spending quartiles (Q1 = highest spending, Q4 = lowest spending) to send targeted promotions.",
      prompt: "Retrieve customer_id, total_spend, and spending_quartile (calculated using NTILE(4) OVER (ORDER BY SUM(total_amount) DESC)). Only include delivered orders. Group by customer_id. Sort by customer_id.",
      starterQuery: "SELECT customer_id, SUM(total_amount) AS total_spend,\n  NTILE(4) OVER (ORDER BY SUM(total_amount) DESC) AS spending_quartile\nFROM orders\nWHERE status = 'Delivered'\nGROUP BY customer_id\nORDER BY customer_id;",
      solution: "SELECT customer_id, SUM(total_amount) AS total_spend, NTILE(4) OVER (ORDER BY SUM(total_amount) DESC) AS spending_quartile FROM orders WHERE status = 'Delivered' GROUP BY customer_id ORDER BY customer_id;",
      hints: ["Use NTILE(4) OVER (ORDER BY SUM(total_amount) DESC).", "Filter status = 'Delivered'.", "Group by customer_id and sort by customer_id."],
      detailedExplanation: "NTILE(n) divides ordered rows into n buckets. NTILE(4) partitions the sorted customer spends into 4 equal-sized groups (quartiles), making it easy to identify top-spending tiers.",
      alternativeApproach: "None.",
      performanceNotes: "Requires aggregating order totals per customer and then sorting the aggregates to divide them into buckets.",
      concepts: ["NTILE", "window function", "segmentation", "GROUP BY"],
      companyTags: ["Hotstar"]
    }
  ],

  // MODULE 27: Window Functions - LEAD & LAG
  27: [
    {
      id: "m27-p1", moduleId: 27, difficulty: "Easy",
      title: "Previous order dates for customers",
      businessScenario: "Cohort delta analysis.",
            prompt: "Write a query to show each order's date along with the customer's previous " +
                    "order date. Return customer_id, order_id, order_date, and prev_order_date. " +
                    "Partition by customer_id, order by order_date.",
            starterQuery: "SELECT customer_id, order_id, order_date, LAG(order_date) OVER (PARTITION BY " +
                          "customer_id ORDER BY ???) AS prev_order_date FROM orders;",
            solution: "SELECT customer_id, order_id, order_date, LAG(order_date) OVER (PARTITION BY " +
                      "customer_id ORDER BY order_date ASC) AS prev_order_date FROM orders;",
      hints: ["Use LAG(order_date) partitioned by customer_id and sorted by order_date ASC."],
      detailedExplanation: "LAG retrieves values from the previous row.",
      alternativeApproach: "None.",
      performanceNotes: "Partitioned order history sort.",
      concepts: ["LAG", "window function"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m27-p2", moduleId: 27, difficulty: "Medium",
      title: "Month-over-month revenue growth",
      businessScenario: "Assess business revenue trajectories.",
            prompt: "Write a query to calculate month-over-month growth. Use a CTE to calculate " +
                    "total monthly revenue. Then, in the outer query, use LAG() to fetch the previous " +
                    "month's revenue and calculate: current_revenue - prev_revenue as revenue_growth. " +
                    "Order by month.",
            starterQuery: "WITH monthly_revenue AS (\n  SELECT SUBSTR(order_date, 1, 7) AS order_month, " +
                          "SUM(total_amount) AS revenue\n  FROM orders\n  GROUP BY order_month\n)\nSELECT " +
                          "order_month, revenue,\n       LAG(revenue) OVER (ORDER BY order_month ASC) AS " +
                          "prev_month_revenue,\n       revenue - LAG(revenue) OVER (ORDER BY order_month " +
                          "ASC) AS revenue_growth\nFROM monthly_revenue\nORDER BY order_month ASC;",
            solution: "WITH monthly_revenue AS (SELECT SUBSTR(order_date, 1, 7) AS order_month, " +
                      "SUM(total_amount) AS revenue FROM orders GROUP BY SUBSTR(order_date, 1, 7)) " +
                      "SELECT order_month, revenue, LAG(revenue) OVER (ORDER BY order_month ASC) AS " +
                      "prev_month_revenue, revenue - LAG(revenue) OVER (ORDER BY order_month ASC) AS " +
                      "revenue_growth FROM monthly_revenue ORDER BY order_month ASC;",
      hints: ["LAG(revenue) OVER (ORDER BY order_month ASC) gets the previous row's monthly sum."],
      detailedExplanation: "Performs cohort growth audits using lead/lag indicators.",
      alternativeApproach: "None.",
      performanceNotes: "Extremely fast since it groups first.",
      concepts: ["LAG", "MoM growth", "CTE"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m27-p3", moduleId: 27, difficulty: "Hard",
      title: "Flag customers with declining order values",
            businessScenario: "The retention team at Flipkart wants to identify customers whose most recent " +
                              "order was lower than their previous one — a potential churn signal that warrants " +
                              "a proactive discount offer.",
            prompt: "Write a query using a CTE that: (1) uses LAG() partitioned by customer_id and " +
                    "ordered by order_date to get the previous order's total_amount for each order, " +
                    "and (2) computes amount_change (total_amount - prev_amount). In the outer query, " +
                    "filter to only the most recent order per customer (using ROW_NUMBER() = 1 in a " +
                    "nested CTE or WHERE), and return only rows where amount_change < 0 (value " +
                    "declined). Return customer_id, order_id, order_date, total_amount, prev_amount, " +
                    "and amount_change. Order by amount_change ascending (biggest decline first).",
            starterQuery: "WITH order_changes AS (\n  SELECT\n    customer_id, order_id, order_date, " +
                          "total_amount,\n    LAG(total_amount) OVER (PARTITION BY customer_id ORDER BY " +
                          "order_date ASC) AS prev_amount,\n    total_amount - LAG(total_amount) OVER " +
                          "(PARTITION BY customer_id ORDER BY order_date ASC) AS amount_change,\n   " +
                          "ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC) AS rn\n " +
                          "FROM orders\n)\nSELECT customer_id, order_id, order_date, total_amount, " +
                          "prev_amount, amount_change\nFROM order_changes\nWHERE rn = 1 AND prev_amount IS " +
                          "NOT NULL AND amount_change < 0\nORDER BY amount_change ASC;",
            solution: "WITH order_changes AS (SELECT customer_id, order_id, order_date, total_amount, " +
                      "LAG(total_amount) OVER (PARTITION BY customer_id ORDER BY order_date ASC) AS " +
                      "prev_amount, total_amount - LAG(total_amount) OVER (PARTITION BY customer_id " +
                      "ORDER BY order_date ASC) AS amount_change, ROW_NUMBER() OVER (PARTITION BY " +
                      "customer_id ORDER BY order_date DESC) AS rn FROM orders) SELECT customer_id, " +
                      "order_id, order_date, total_amount, prev_amount, amount_change FROM " +
                      "order_changes WHERE rn = 1 AND prev_amount IS NOT NULL AND amount_change < 0 " +
                      "ORDER BY amount_change ASC;",
      hints: [
        "Use LAG(total_amount) OVER (PARTITION BY customer_id ORDER BY order_date ASC) for prev_amount.",
        "Compute amount_change = total_amount - prev_amount inside the CTE.",
        "Add ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC) AS rn " +
        "to find the most recent order.",
        "In the outer query: WHERE rn = 1 AND prev_amount IS NOT NULL AND amount_change < 0.",
        "ORDER BY amount_change ASC puts the biggest declines first."
      ],
            detailedExplanation: "This chains three window functions (LAG, ROW_NUMBER) inside a CTE, then applies " +
                                 "multi-condition WHERE filtering in the outer query. The IS NOT NULL guard " +
                                 "prevents false positives for customers with only one order (their LAG is NULL).",
      alternativeApproach: "Could use two separate CTEs: one for LAG calculation, one for ROW_NUMBER filtering.",
            performanceNotes: "Window functions require sorting. An index on orders(customer_id, order_date) " +
                              "helps both the LAG and ROW_NUMBER partitions.",
      concepts: ["LAG", "ROW_NUMBER", "CTE", "PARTITION BY", "WHERE", "IS NOT NULL", "ORDER BY"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m27-p4", moduleId: 27, difficulty: "Hard",
      title: "Customer Active Streak Detection",
            businessScenario: "The retention cohort team at Swiggy wants to reward loyal buyers. Find " +
                              "customers who have made purchases in consecutive months (separated by exactly 1 " +
                              "month or less) to trace user streaks.",
            prompt: "Write a query using LAG() to calculate the difference in months between a " +
                    "customer's current order and their previous order. First, write a CTE that " +
                    "retrieves unique customer_id and the year-month of their orders (e.g. " +
                    "SUBSTR(order_date, 1, 7)). Second, write a CTE that uses LAG() to retrieve the " +
                    "customer's previous order month. Finally, select customer_id, order_month, and " +
                    "prev_month, and check if they are consecutive (i.e. if the difference is exactly " +
                    "1 month). Return rows where they are consecutive, ordered by customer_id.",
      starterQuery: "-- Write your SQL query here\n",
            solution: "WITH user_months AS (SELECT DISTINCT customer_id, SUBSTR(order_date, 1, 7) AS " +
                      "order_month FROM orders), month_lags AS (SELECT customer_id, order_month, " +
                      "LAG(order_month) OVER (PARTITION BY customer_id ORDER BY order_month ASC) AS " +
                      "prev_month FROM user_months) SELECT customer_id, order_month, prev_month FROM " +
                      "month_lags WHERE prev_month IS NOT NULL AND (CAST(SUBSTR(order_month, 1, 4) AS " +
                      "INT)*12 + CAST(SUBSTR(order_month, 6, 2) AS INT)) - (CAST(SUBSTR(prev_month, 1, " +
                      "4) AS INT)*12 + CAST(SUBSTR(prev_month, 6, 2) AS INT)) = 1 ORDER BY customer_id, " +
                      "order_month;",
      hints: [
        "Use SELECT DISTINCT customer_id, SUBSTR(order_date, 1, 7) as order_month to " +
        "aggregate orders into monthly buckets.",
        "Use LAG(order_month) OVER (PARTITION BY customer_id ORDER BY order_month ASC) " +
        "to get the previous month for each customer.",
        "Calculate month differences using integer multiplication: (year * 12 + month) " +
        "of current minus previous. Filter where this difference is 1."
      ],
            detailedExplanation: "Consecutive month streaks are calculated by partitioning unique customer active " +
                                 "months and comparing consecutive months with LAG offsets.",
      alternativeApproach: "Using self-join or window functions with lead/lag.",
            performanceNotes: "Grouping distinct customer-months first reduces the window partition sort " +
                              "payload size significantly.",
      concepts: ["LAG", "window function", "streaks", "retention cohort"],
      companyTags: ["Swiggy", "Zomato"]
    }
  ],

  // MODULE 28: Running Totals
  28: [
    {
      id: "m28-p1", moduleId: 28, difficulty: "Easy",
      title: "Running Revenue",
      businessScenario: "Visualise transaction build-up.",
            prompt: "Write a query to calculate a running total of order amounts sorted by " +
                    "order_date. Return order_id, order_date, total_amount, and running_total (using " +
                    "SUM(total_amount) OVER(ORDER BY order_date ASC)).",
            starterQuery: "SELECT order_id, order_date, total_amount, SUM(total_amount) OVER (ORDER BY " +
                          "???) AS running_total FROM orders;",
            solution: "SELECT order_id, order_date, total_amount, SUM(total_amount) OVER (ORDER BY " +
                      "order_date ASC) AS running_total FROM orders;",
      hints: ["Use SUM(column) OVER (ORDER BY column) for a running total."],
      detailedExplanation: "Cumulative sum evaluated sequentially.",
      alternativeApproach: "None.",
      performanceNotes: "Sort is required.",
      concepts: ["SUM OVER", "running total"],
      companyTags: ["Zomato"]
    },
    {
      id: "m28-p2", moduleId: 28, difficulty: "Medium",
      title: "7-Day moving average revenue",
            businessScenario: "The finance team wants to visualize trends by calculating a rolling 7-day " +
                              "average of daily revenue to smooth out weekday fluctuations.",
            prompt: "Calculate the rolling 7-day average of daily net revenue (defined as " +
                    "total_amount - discount_amount). First, write a CTE to aggregate total net " +
                    "revenue by order_date. Then, apply a window function to calculate the 7-day " +
                    "moving average (using AVG(revenue) OVER(ORDER BY order_date ROWS BETWEEN 6 " +
                    "PRECEDING AND CURRENT ROW)). Return order_date, daily_revenue (net), and " +
                    "moving_avg_revenue (rounded to 2 decimal places). Order by order_date.",
            starterQuery: "WITH daily_sales AS (\n  SELECT order_date, SUM(total_amount - discount_amount) " +
                          "AS revenue\n  FROM orders\n  GROUP BY order_date\n)\nSELECT order_date, " +
                          "revenue,\n  ROUND(AVG(revenue) OVER (ORDER BY order_date ROWS BETWEEN 6 " +
                          "PRECEDING AND CURRENT ROW), 2) AS moving_avg_revenue\nFROM daily_sales\nORDER BY " +
                          "order_date;",
            solution: "WITH daily_sales AS (SELECT order_date, SUM(total_amount - discount_amount) AS " +
                      "revenue FROM orders GROUP BY order_date) SELECT order_date, revenue, " +
                      "ROUND(AVG(revenue) OVER (ORDER BY order_date ROWS BETWEEN 6 PRECEDING AND " +
                      "CURRENT ROW), 2) AS moving_avg_revenue FROM daily_sales ORDER BY order_date;",
            hints: ["Aggregate daily net revenue first in a CTE.", "Use AVG(revenue) OVER (ORDER BY " +
                    "order_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) in the outer query." ],
            detailedExplanation: "By specifying ROWS BETWEEN 6 PRECEDING AND CURRENT ROW, the window frame " +
                                 "restricts the AVG calculation to a sliding window of the current day and the 6 " +
                                 "preceding days.",
      alternativeApproach: "None.",
            performanceNotes: "The aggregation groups 15 orders into daily points. The window function then " +
                              "runs on this small grouped dataset, which is highly efficient.",
      concepts: ["window function", "moving average", "ROWS BETWEEN", "sliding window", "CTE"],
      companyTags: ["Zomato"]
    },
    {
      id: "m28-p3", moduleId: 28, difficulty: "Hard",
      title: "Order Share of Wallet",
            businessScenario: "The marketing team at Zomato is launching a high-value customer loyalty " +
                              "initiative. To identify highly engaged users, they want to measure each order's " +
                              "percentage contribution to a customer's total lifetime expenditure on the " +
                              "platform.",
            prompt: "Calculate each order's percentage share of the customer's total lifetime spend. " +
                    "Return customer_id, order_id, total_amount, and spend_percentage (rounded to 2 " +
                    "decimal places, calculated as: total_amount * 100.0 / SUM(total_amount) " +
                    "OVER(PARTITION BY customer_id)).",
      starterQuery: "-- Write your SQL query here\n",
            solution: "SELECT customer_id, order_id, total_amount, ROUND(total_amount * 100.0 / " +
                      "SUM(total_amount) OVER (PARTITION BY customer_id), 2) AS spend_percentage FROM " +
                      "orders;",
      hints: ["Combine raw total_amount with SUM(total_amount) OVER (PARTITION BY customer_id)."],
      detailedExplanation: "Compares individual value to the overall partitioned sum.",
      alternativeApproach: "None.",
      performanceNotes: "Calculates cumulative partition sum.",
      concepts: ["SUM OVER", "PARTITION BY", "computed columns"],
      companyTags: ["Zomato"]
    }
  ],

  // MODULE 29: UNION & UNION ALL
  29: [
    {
      id: "m29-p1", moduleId: 29, difficulty: "Easy",
      title: "Stack Order Status Counts",
      businessScenario: "Compiles total summaries.",
            prompt: "Combine counts of 'Delivered' and 'Returned' orders. Return order_status and " +
                    "status_count. Use UNION ALL.",
            starterQuery: "SELECT '???' AS order_status, COUNT(*) AS status_count FROM orders WHERE status " +
                          "= '???' UNION ALL SELECT '???' AS order_status, COUNT(*) AS status_count FROM " +
                          "orders WHERE status = '???';",
            solution: "SELECT 'Delivered' AS order_status, COUNT(*) AS status_count FROM orders WHERE " +
                      "status = 'Delivered' UNION ALL SELECT 'Returned' AS order_status, COUNT(*) AS " +
                      "status_count FROM orders WHERE status = 'Returned';",
      hints: ["UNION ALL stacks results without deduplication."],
      detailedExplanation: "Combines two aggregate rows quickly.",
      alternativeApproach: "None.",
      performanceNotes: "No sort check.",
      concepts: ["UNION ALL", "COUNT"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m29-p2", moduleId: 29, difficulty: "Medium",
      title: "Combine Customer and Office Cities",
      businessScenario: "Audit target regions.",
            prompt: "Get a list of all cities where customers exist OR department offices are " +
                    "located. Return a unified distinct list of city names.",
      starterQuery: "SELECT ???\nFROM ???\nWHERE ???;",
      solution: "SELECT city FROM customers UNION SELECT office_city AS city FROM departments;",
      hints: ["UNION deduplicates cities automatically."],
      detailedExplanation: "Collects unique cities across profiles and corporate offices.",
      alternativeApproach: "None.",
      performanceNotes: "Requires sorting.",
      concepts: ["UNION"],
      companyTags: ["Ola"]
    },
    {
      id: "m29-p3", moduleId: 29, difficulty: "Hard",
      title: "Order fulfillment executive summary",
            businessScenario: "The COO at Flipkart wants a single-row executive dashboard with 5 KPIs: total " +
                              "orders, delivered orders, total gross revenue, total discounts, and average " +
                              "order value. Build it using UNION ALL to stack individual aggregations into " +
                              "labelled metric rows.",
            prompt: "Write a query using UNION ALL to return 5 rows: 'Total Orders' (COUNT(*)), " +
                    "'Delivered Orders' (COUNT WHERE status='Delivered'), 'Gross Revenue' (ROUND SUM " +
                    "of total_amount, 2), 'Total Discounts' (ROUND SUM of discount_amount, 2), 'Avg " +
                    "Order Value' (ROUND AVG of total_amount, 2). Columns: metric_name (TEXT), " +
                    "metric_value (REAL, rounded to 1 decimal).",
      starterQuery: "-- Write your SQL query here\n",
            solution: "SELECT 'Total Orders' AS metric_name, ROUND(COUNT(*) * 1.0, 1) AS metric_value " +
                      "FROM orders UNION ALL SELECT 'Delivered Orders', ROUND(COUNT(*) * 1.0, 1) FROM " +
                      "orders WHERE status = 'Delivered' UNION ALL SELECT 'Gross Revenue', " +
                      "ROUND(SUM(total_amount), 1) FROM orders UNION ALL SELECT 'Total Discounts', " +
                      "ROUND(SUM(discount_amount), 1) FROM orders UNION ALL SELECT 'Avg Order Value', " +
                      "ROUND(AVG(total_amount), 1) FROM orders;",
      hints: [
        "Each UNION ALL leg must return exactly 2 columns: a string label and a numeric metric.",
        "Use ROUND(..., 1) consistently to match the column type.",
        "COUNT(*) * 1.0 converts integer to float so the column type is compatible with ROUND SUM results.",
        "The 'Delivered Orders' leg needs a WHERE clause inside that SELECT."
      ],
            detailedExplanation: "UNION ALL stacks heterogeneous aggregates into a single column pair. The mental " +
                                 "model is: each SELECT returns one labeled metric row, and UNION ALL glues them " +
                                 "vertically. This is the canonical pattern for building pivot-style summary " +
                                 "dashboards without a native PIVOT function.",
            alternativeApproach: "Could write all 5 aggregates in a single SELECT without UNION ALL using 5 " +
                                 "separate aggregate expressions.",
            performanceNotes: "Each UNION ALL leg requires one full table scan of orders. In production, a CTE " +
                              "that scans once then computes all 5 metrics avoids repeated scans.",
      concepts: ["UNION ALL", "COUNT", "SUM", "AVG", "ROUND", "conditional aggregation"],
      companyTags: ["Flipkart"]
    }
  ],

  // MODULE 30: INTERSECT & EXCEPT
  30: [
    {
      id: "m30-p1", moduleId: 30, difficulty: "Easy",
      title: "Active Subscribers with Orders",
      businessScenario: "Audit segment overlap.",
            prompt: "Find customer_id values that exist in both customers table (filtered to " +
                    "'Premium' segment) and subscriptions table (status = 'Active'). Use INTERSECT.",
            starterQuery: "SELECT customer_id FROM customers WHERE segment = '???' INTERSECT SELECT " +
                          "customer_id FROM subscriptions WHERE status = '???';",
            solution: "SELECT customer_id FROM customers WHERE segment = 'Premium' INTERSECT SELECT " +
                      "customer_id FROM subscriptions WHERE status = 'Active';",
      hints: ["Use INTERSECT to find intersection."],
      detailedExplanation: "INTERSECT returns common rows.",
      alternativeApproach: "INNER JOIN.",
      performanceNotes: "Fast sorted intersection.",
      concepts: ["INTERSECT"],
      companyTags: ["Hotstar"]
    },
    {
      id: "m30-p2", moduleId: 30, difficulty: "Medium",
      title: "Untapped Markets",
      businessScenario: "Identify customer regions without department offices.",
      prompt: "Find all cities that have customers but do NOT contain any department offices. Use EXCEPT.",
      starterQuery: "SELECT ???\nFROM ???\nWHERE ???;",
      solution: "SELECT city FROM customers EXCEPT SELECT office_city FROM departments;",
      hints: ["Use EXCEPT to subtract right result from left."],
      detailedExplanation: "EXCEPT returns rows unique to the left query.",
      alternativeApproach: "LEFT JOIN with IS NULL.",
      performanceNotes: "Sort subtracts keys.",
      concepts: ["EXCEPT"],
      companyTags: ["Ola"]
    },
    {
      id: "m30-p3", moduleId: 30, difficulty: "Hard",
      title: "High-volume reliable payment modes",
            businessScenario: "The finance risk team at Paytm wants payment modes that are both high-volume " +
                              "(used in at least 3 successful transactions) AND have never experienced a failed " +
                              "transaction. This combines set operations with aggregation to answer a two-sided " +
                              "question.",
            prompt: "Write a query to find payment_mode values that: (1) appear at least 3 times " +
                    "with payment_status = 'Success' (use GROUP BY + HAVING to filter by count), AND " +
                    "(2) have NEVER appeared with payment_status = 'Failed' (use EXCEPT to subtract " +
                    "modes that have failed). Return payment_mode and success_count, ordered by " +
                    "success_count descending.",
            starterQuery: "SELECT payment_mode, COUNT(*) AS success_count\nFROM payments\nWHERE " +
                          "payment_status = 'Success'\nGROUP BY payment_mode\nHAVING COUNT(*) >= " +
                          "3\nEXCEPT\nSELECT payment_mode, COUNT(*) AS success_count\nFROM payments\nWHERE " +
                          "payment_status = 'Success' AND payment_mode IN (\n  SELECT payment_mode FROM " +
                          "payments WHERE payment_status = 'Failed'\n)\nGROUP BY payment_mode\nHAVING " +
                          "COUNT(*) >= 3\nORDER BY success_count DESC;",
            solution: "SELECT payment_mode, COUNT(*) AS success_count FROM payments WHERE " +
                      "payment_status = 'Success' GROUP BY payment_mode HAVING COUNT(*) >= 3 EXCEPT " +
                      "SELECT payment_mode, COUNT(*) AS success_count FROM payments WHERE " +
                      "payment_status = 'Success' AND payment_mode IN (SELECT payment_mode FROM " +
                      "payments WHERE payment_status = 'Failed') GROUP BY payment_mode HAVING COUNT(*) " +
                      ">= 3 ORDER BY success_count DESC;",
      hints: [
        "First leg: SELECT payment_mode, COUNT(*) FROM payments WHERE status='Success' " +
        "GROUP BY payment_mode HAVING COUNT(*) >= 3.",
        "Second leg (to subtract): same query but also add AND payment_mode IN (SELECT " +
        "payment_mode FROM payments WHERE status='Failed').",
        "EXCEPT removes modes from the left side that appear in the right side.",
        "ORDER BY success_count DESC at the end applies to the final combined result."
      ],
            detailedExplanation: "EXCEPT operates on full row equality. By keeping the same two columns " +
                                 "(payment_mode, success_count) on both sides, EXCEPT correctly removes any mode " +
                                 "that also appears in the failed set. Combining HAVING (to enforce volume " +
                                 "threshold) with EXCEPT (to enforce zero-failure constraint) is a concise " +
                                 "interview pattern.",
            alternativeApproach: "Could solve with a single query using GROUP BY HAVING COUNT(CASE WHEN " +
                                 "status='Success') >= 3 AND COUNT(CASE WHEN status='Failed') = 0.",
            performanceNotes: "EXCEPT requires sorting both result sets on (payment_mode, success_count). For " +
                              "small payment datasets this is fast.",
      concepts: ["EXCEPT", "GROUP BY", "HAVING", "COUNT", "subquery"],
      companyTags: ["Paytm"]
    }
  ],

  // MODULE 31: Conditional Logic - CASE WHEN
  31: [
    {
      id: "m31-p1", moduleId: 31, difficulty: "Easy",
      title: "Categorise orders by value tier",
      businessScenario: "Revenue segmentation.",
            prompt: "Write a query to label orders based on total_amount: 'High Value' if " +
                    "total_amount is strictly greater than 5000; and 'Standard Value' otherwise. " +
                    "Return order_id, total_amount, and value_tier.",
            starterQuery: "SELECT order_id, total_amount, CASE WHEN total_amount > ??? THEN '???' ELSE " +
                          "'???' END AS value_tier FROM orders;",
            solution: "SELECT order_id, total_amount, CASE WHEN total_amount > 5000 THEN 'High Value' " +
                      "ELSE 'Standard Value' END AS value_tier FROM orders;",
      hints: ["Use CASE WHEN condition THEN 'High' ELSE 'Standard' END."],
      detailedExplanation: "Conditional logic evaluated row by row.",
      alternativeApproach: "None.",
      performanceNotes: "O(N) CPU evaluation.",
      concepts: ["CASE WHEN"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m31-p2", moduleId: 31, difficulty: "Medium",
      title: "Conditional revenue aggregation",
      businessScenario: "Operations wants channel breakdown.",
            prompt: "Write a query to sum total_amount for 'App' orders (as app_revenue) and 'Web' " +
                    "orders (as web_revenue) in the same query using CASE WHEN inside SUM.",
      starterQuery: "SELECT ???\nFROM ???\nWHERE ???;",
            solution: "SELECT SUM(CASE WHEN channel = 'App' THEN total_amount ELSE 0 END) AS " +
                      "app_revenue, SUM(CASE WHEN channel = 'Web' THEN total_amount ELSE 0 END) AS " +
                      "web_revenue FROM orders;",
      hints: ["Use SUM(CASE WHEN channel = 'App' THEN total_amount ELSE 0 END)."],
      detailedExplanation: "Pivots and sums values conditionally.",
      alternativeApproach: "None.",
      performanceNotes: "Single scan aggregation.",
      concepts: ["CASE WHEN", "SUM"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m31-p3", moduleId: 31, difficulty: "Hard",
      title: "Customer order tier and revenue contribution",
            businessScenario: "The analytics team at Flipkart wants to categorize each customer's total spend " +
                              "into spend tiers, count customers per tier, and calculate how much each tier " +
                              "contributes to overall revenue.",
            prompt: "Write a query using a CTE that: (1) computes total_spent per customer_id (SUM " +
                    "of total_amount from orders). (2) In the outer query, classify each customer " +
                    "using CASE WHEN into: 'High' (total_spent >= 10000), 'Medium' (>= 3000), or " +
                    "'Low' otherwise. Then GROUP BY tier to return tier, customer_count (COUNT), " +
                    "total_tier_revenue (SUM of total_spent), and revenue_pct (rounded to 1 decimal " +
                    "place: total_tier_revenue * 100.0 / SUM(total_spent) over all customers). Order " +
                    "by total_tier_revenue descending.",
            starterQuery: "WITH customer_spend AS (\n  SELECT customer_id, SUM(total_amount) AS " +
                          "total_spent\n  FROM orders\n  GROUP BY customer_id\n),\ntiered AS (\n  SELECT " +
                          "customer_id, total_spent,\n    CASE\n      WHEN total_spent >= 10000 THEN " +
                          "'High'\n      WHEN total_spent >= 3000 THEN 'Medium'\n      ELSE 'Low'\n    END " +
                          "AS tier\n  FROM customer_spend\n)\nSELECT tier,\n  COUNT(*) AS customer_count,\n" +
                          " SUM(total_spent) AS total_tier_revenue,\n  ROUND(SUM(total_spent) * 100.0 / " +
                          "(SELECT SUM(total_spent) FROM customer_spend), 1) AS revenue_pct\nFROM " +
                          "tiered\nGROUP BY tier\nORDER BY total_tier_revenue DESC;",
            solution: "WITH customer_spend AS (SELECT customer_id, SUM(total_amount) AS total_spent " +
                      "FROM orders GROUP BY customer_id), tiered AS (SELECT customer_id, total_spent, " +
                      "CASE WHEN total_spent >= 10000 THEN 'High' WHEN total_spent >= 3000 THEN " +
                      "'Medium' ELSE 'Low' END AS tier FROM customer_spend) SELECT tier, COUNT(*) AS " +
                      "customer_count, SUM(total_spent) AS total_tier_revenue, ROUND(SUM(total_spent) * " +
                      "100.0 / (SELECT SUM(total_spent) FROM customer_spend), 1) AS revenue_pct FROM " +
                      "tiered GROUP BY tier ORDER BY total_tier_revenue DESC;",
      hints: [
        "CTE 1 (customer_spend): GROUP BY customer_id, SUM(total_amount) as total_spent.",
        "CTE 2 (tiered): Apply CASE WHEN on total_spent to assign tier.",
        "Outer query: GROUP BY tier, COUNT(*), SUM(total_spent).",
        "revenue_pct: SUM(total_spent) * 100.0 / (SELECT SUM(total_spent) FROM customer_spend).",
        "ORDER BY total_tier_revenue DESC."
      ],
            detailedExplanation: "This problem chains two CTEs, uses CASE WHEN for classification, applies GROUP " +
                                 "BY + COUNT + SUM for tier rollups, and computes a percentage via a correlated " +
                                 "scalar subquery. It is a genuine multi-concept composition spanning Modules 13, " +
                                 "24, 31.",
      alternativeApproach: "Could use a single CTE and compute tiers inline in the outer GROUP BY query.",
      performanceNotes: "Two aggregation passes: once per customer, once per tier. Both are fast on the orders table.",
      concepts: ["CASE WHEN", "CTE", "GROUP BY", "COUNT", "SUM", "subquery", "ROUND"],
      companyTags: ["Flipkart"]
    }
  ],

  // MODULE 32: Manual Pivoting
  32: [
    {
      id: "m32-p1", moduleId: 32, difficulty: "Medium",
      title: "Pivot orders count by channel",
      businessScenario: "The operations team wants to compare order volumes between App and Web channels for each customer to understand booking preferences.",
      prompt: "Retrieve customer_id, app_orders_count (count of orders where channel = 'App'), and web_orders_count (count of orders where channel = 'Web') grouped by customer_id. Only include orders where status = 'Delivered'. Sort by customer_id.",
      starterQuery: "SELECT customer_id, COUNT(CASE WHEN channel = 'App' THEN 1 END) AS app_orders_count,\n  COUNT(CASE WHEN channel = 'Web' THEN 1 END) AS web_orders_count\nFROM orders\nWHERE status = 'Delivered'\nGROUP BY customer_id\nORDER BY customer_id;",
      solution: "SELECT customer_id, COUNT(CASE WHEN channel = 'App' THEN 1 END) AS app_orders_count, COUNT(CASE WHEN channel = 'Web' THEN 1 END) AS web_orders_count FROM orders WHERE status = 'Delivered' GROUP BY customer_id ORDER BY customer_id;",
      hints: ["Use COUNT(CASE WHEN channel = 'App' THEN 1 END) for pivoting.", "Filter status = 'Delivered'.", "Group and sort by customer_id."],
      detailedExplanation: "By nesting CASE WHEN inside aggregate functions like COUNT or SUM, you can pivot row-level values (channels) into distinct columns.",
      alternativeApproach: "None.",
      performanceNotes: "Runs efficiently in a single pass aggregation.",
      concepts: ["COUNT", "CASE WHEN", "pivoting", "GROUP BY"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m32-p2", moduleId: 32, difficulty: "Medium",
      title: "Subscription churn rate by plan",
      businessScenario: "Analyze plan health.",
            prompt: "Calculate active counts, churned counts, and churn rate (churned * 100.0 / " +
                    "total, rounded to 1 decimal place) grouped by plan_name.",
      starterQuery: "SELECT ???\nFROM ???\nGROUP BY ???\nHAVING ???;",
            solution: "SELECT plan_name, COUNT(CASE WHEN status = 'Active' THEN 1 END) AS " +
                      "active_count, COUNT(CASE WHEN status = 'Churned' THEN 1 END) AS churned_count, " +
                      "ROUND(COUNT(CASE WHEN status = 'Churned' THEN 1 END) * 100.0 / COUNT(*), 1) AS " +
                      "churn_rate FROM subscriptions GROUP BY plan_name;",
      hints: ["Use conditional counts to pivot status counters."],
      detailedExplanation: "Pivots subscriber statuses into side-by-side totals.",
      alternativeApproach: "None.",
      performanceNotes: "Single scan.",
      concepts: ["COUNT", "CASE WHEN", "GROUP BY"],
      companyTags: ["Hotstar"]
    },
    {
      id: "m32-p3", moduleId: 32, difficulty: "Hard",
      title: "Complete revenue scorecard",
      businessScenario: "Corporate dashboard compilation.",
            prompt: "Compile a pivot scorecard. Group by customer city (joining customers and " +
                    "orders), return city, app_revenue (sum of total_amount for App orders), " +
                    "web_revenue (sum of total_amount for Web orders), and app_ratio (app_revenue * " +
                    "100.0 / total, rounded to 1 decimal place). Sort by city.",
      starterQuery: "-- Write your SQL query here\n",
            solution: "SELECT c.city, SUM(CASE WHEN o.channel = 'App' THEN o.total_amount ELSE 0 END) " +
                      "AS app_revenue, SUM(CASE WHEN o.channel = 'Web' THEN o.total_amount ELSE 0 END) " +
                      "AS web_revenue, ROUND(SUM(CASE WHEN o.channel = 'App' THEN o.total_amount ELSE 0 " +
                      "END) * 100.0 / SUM(o.total_amount), 1) AS app_ratio FROM customers c INNER JOIN " +
                      "orders o ON c.customer_id = o.customer_id GROUP BY c.city ORDER BY c.city ASC;",
      hints: ["Combine inner joins, CASE WHEN sum, and mathematical ratios."],
      detailedExplanation: "Produces a multi-channel pivot scorecard per city.",
      alternativeApproach: "None.",
      performanceNotes: "Aggregates joined sets.",
      concepts: ["INNER JOIN", "CASE WHEN", "GROUP BY", "SUM"],
      companyTags: ["Flipkart"]
    }
  ],

  // MODULE 33: CREATE TABLE & Constraints
  33: [
    {
      id: "m33-p1", moduleId: 33, difficulty: "Easy",
      title: "Create simple customer feedback table",
      businessScenario: "Store raw survey records.",
            prompt: "Write a query to create a table named customer_feedback with three columns: " +
                    "feedback_id (INTEGER PRIMARY KEY), customer_id (INTEGER NOT NULL), and comments " +
                    "(TEXT).",
            starterQuery: "CREATE TABLE customer_feedback (\n  feedback_id INTEGER PRIMARY KEY,\n " +
                          "customer_id INTEGER NOT NULL,\n  comments TEXT\n);",
            solution: "CREATE TABLE customer_feedback (feedback_id INTEGER PRIMARY KEY, customer_id " +
                      "INTEGER NOT NULL, comments TEXT);",
      hints: ["Use CREATE TABLE table_name (column type constraint, ...)."],
      detailedExplanation: "Defines schemas and primary keys.",
      alternativeApproach: "None.",
      performanceNotes: "DDL operation.",
      concepts: ["CREATE TABLE", "Constraints"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m33-p2", moduleId: 33, difficulty: "Medium",
      title: "Create reviews table with constraints",
      businessScenario: "Capture product review catalogs.",
            prompt: "Create a reviews table. Columns: review_id (INTEGER PRIMARY KEY), product_id " +
                    "(INTEGER NOT NULL), score (INTEGER CHECK(score BETWEEN 1 AND 5)), and " +
                    "review_text (TEXT DEFAULT 'No comments').",
            starterQuery: "CREATE TABLE reviews (\n  review_id INTEGER PRIMARY KEY,\n  product_id INTEGER " +
                          "NOT NULL,\n  score INTEGER CHECK(score BETWEEN 1 AND 5),\n  review_text TEXT " +
                          "DEFAULT 'No comments'\n);",
            solution: "CREATE TABLE reviews (review_id INTEGER PRIMARY KEY, product_id INTEGER NOT " +
                      "NULL, score INTEGER CHECK(score BETWEEN 1 AND 5), review_text TEXT DEFAULT 'No " +
                      "comments');",
      hints: ["Define CHECK and DEFAULT constraints inline."],
      detailedExplanation: "Restricts value ranges and injects default fallbacks.",
      alternativeApproach: "None.",
      performanceNotes: "DDL schema check.",
      concepts: ["CREATE TABLE", "CHECK", "DEFAULT"],
      companyTags: ["Croma"]
    },
    {
      id: "m33-p3", moduleId: 33, difficulty: "Hard",
      title: "Create, populate, and verify a constrained ledger table",
            businessScenario: "The warehouse team at Croma needs a new inventory_ledger table with strict " +
                              "constraints, needs to seed it with initial records, and then verify the data " +
                              "with a query. All three steps must work sequentially.",
            prompt: "Run this 3-step sequence: (1) CREATE TABLE inventory_ledger with columns: " +
                    "ledger_id INTEGER PRIMARY KEY, product_id INTEGER NOT NULL, quantity INTEGER " +
                    "CHECK(quantity != 0), transaction_type TEXT CHECK(transaction_type IN ('IN', " +
                    "'OUT')), and FOREIGN KEY (product_id) REFERENCES products(product_id). (2) " +
                    "INSERT two rows: (1, 1, 50, 'IN') and (2, 2, -30, 'OUT'). (3) SELECT * FROM " +
                    "inventory_ledger to verify both rows are present. Write all 3 statements " +
                    "separated by semicolons.",
            starterQuery: "-- Step 1: Create the constrained table\nCREATE TABLE inventory_ledger (\n " +
                          "ledger_id INTEGER PRIMARY KEY,\n  product_id INTEGER NOT NULL,\n  quantity " +
                          "INTEGER CHECK(quantity != 0),\n  transaction_type TEXT CHECK(transaction_type IN " +
                          "('IN', 'OUT')),\n  FOREIGN KEY (product_id) REFERENCES " +
                          "products(product_id)\n);\n\n-- Step 2: Seed with two records\nINSERT INTO " +
                          "inventory_ledger VALUES (1, 1, 50, 'IN');\nINSERT INTO inventory_ledger VALUES " +
                          "(2, 2, -30, 'OUT');\n\n-- Step 3: Verify\nSELECT * FROM inventory_ledger;",
            solution: "CREATE TABLE inventory_ledger (ledger_id INTEGER PRIMARY KEY, product_id " +
                      "INTEGER NOT NULL, quantity INTEGER CHECK(quantity != 0), transaction_type TEXT " +
                      "CHECK(transaction_type IN ('IN', 'OUT')), FOREIGN KEY (product_id) REFERENCES " +
                      "products(product_id)); INSERT INTO inventory_ledger VALUES (1, 1, 50, 'IN'); " +
                      "INSERT INTO inventory_ledger VALUES (2, 2, -30, 'OUT'); SELECT * FROM " +
                      "inventory_ledger;",
      hints: [
        "CREATE TABLE first with all 4 columns plus the FOREIGN KEY constraint.",
        "INSERT uses VALUES (ledger_id, product_id, quantity, type).",
        "The CHECK constraint rejects quantity = 0 — use non-zero values.",
        "The final SELECT * confirms both rows were inserted successfully."
      ],
            detailedExplanation: "This sequences CREATE TABLE (DDL) → INSERT (DML) → SELECT (DQL). The CHECK " +
                                 "constraint enforces non-zero quantity at the DB level; inserting quantity=0 " +
                                 "would throw an error. Sequencing DDL then DML is the standard migration pattern.",
            alternativeApproach: "In production, use PRAGMA foreign_keys = ON; to enforce FOREIGN KEY checks in " +
                                 "SQLite (off by default).",
            performanceNotes: "DDL and two single-row INSERTs are all O(1). The final SELECT is a full-table " +
                              "scan of a 2-row table.",
      concepts: ["CREATE TABLE", "FOREIGN KEY", "CHECK", "INSERT", "SELECT", "DDL + DML sequence"],
      companyTags: ["Croma"]
    },
    {
      id: "m33-p4", moduleId: 33, difficulty: "Hard",
      title: "Create slowly changing dimension product history table",
            businessScenario: "The data warehousing team needs to track price changes over time using a Slowly " +
                              "Changing Dimension (SCD Type 2) schema for products.",
            prompt: "Create a table named dim_products_scd with the following columns: product_key " +
                    "INTEGER PRIMARY KEY AUTOINCREMENT, product_id INTEGER NOT NULL, product_name " +
                    "TEXT NOT NULL, list_price DECIMAL NOT NULL, start_date DATE NOT NULL, end_date " +
                    "DATE, is_current INTEGER DEFAULT 1 CHECK(is_current IN (0, 1)).",
            starterQuery: "CREATE TABLE dim_products_scd (\n  product_key INTEGER PRIMARY KEY " +
                          "AUTOINCREMENT,\n  product_id INTEGER NOT NULL,\n  product_name TEXT NOT NULL,\n " +
                          "list_price DECIMAL NOT NULL,\n  start_date DATE NOT NULL,\n  end_date DATE,\n " +
                          "is_current INTEGER DEFAULT 1 CHECK(is_current IN (0, 1))\n);",
            solution: "CREATE TABLE dim_products_scd (product_key INTEGER PRIMARY KEY AUTOINCREMENT, " +
                      "product_id INTEGER NOT NULL, product_name TEXT NOT NULL, list_price DECIMAL NOT " +
                      "NULL, start_date DATE NOT NULL, end_date DATE, is_current INTEGER DEFAULT 1 " +
                      "CHECK(is_current IN (0, 1)));",
            hints: ["Define product_key as INTEGER PRIMARY KEY AUTOINCREMENT.", "For is_current, set " +
                    "a DEFAULT 1 and a CHECK constraint matching IN (0, 1)." ],
            detailedExplanation: "SCD Type 2 is the standard dimensional design pattern used to track historical " +
                                 "data over time by creating multiple records for a single business key, " +
                                 "demarcated by start_date, end_date, and a boolean flag (is_current).",
      alternativeApproach: "None.",
            performanceNotes: "DDL statement. In production, adding an index on (product_id, is_current) " +
                              "speeds up looking up current products.",
      concepts: ["CREATE TABLE", "SCD Type 2", "Slowly Changing Dimensions", "Constraints"],
      companyTags: ["Amazon"]
    }
  ],

  // MODULE 34: ALTER TABLE & Schema Updates
  34: [
    {
      id: "m34-p1", moduleId: 34, difficulty: "Easy",
      title: "Add column status to a feedback table",
      businessScenario: "Extend schema to track progress.",
            prompt: "Write a query to alter the customer_feedback table (which you created earlier) " +
                    "by adding a new column named status of type TEXT with a default value of 'New'.",
      starterQuery: "ALTER TABLE customer_feedback ADD COLUMN status TEXT DEFAULT '???';",
            solution: "CREATE TABLE customer_feedback (feedback_id INTEGER PRIMARY KEY, customer_id " +
                      "INTEGER NOT NULL, comments TEXT); ALTER TABLE customer_feedback ADD COLUMN " +
                      "status TEXT DEFAULT 'New';",
      hints: ["Use ALTER TABLE table_name ADD COLUMN column_name type DEFAULT ..."],
      detailedExplanation: "Modifies live catalog definitions.",
      alternativeApproach: "None.",
      performanceNotes: "Fast metadata alter.",
      concepts: ["ALTER TABLE", "ADD COLUMN"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m34-p2", moduleId: 34, difficulty: "Medium",
      title: "Rename column in a table",
      businessScenario: "Update field terminology.",
      prompt: "Write a query to rename the column `comments` in `customer_feedback` table to `user_comments`.",
      starterQuery: "SELECT ???\nFROM ???\nWHERE ???;",
            solution: "CREATE TABLE customer_feedback (feedback_id INTEGER PRIMARY KEY, customer_id " +
                      "INTEGER NOT NULL, comments TEXT); ALTER TABLE customer_feedback RENAME COLUMN " +
                      "comments TO user_comments;",
      hints: ["Use ALTER TABLE table RENAME COLUMN old TO new;"],
      detailedExplanation: "Renames column metadata.",
      alternativeApproach: "None.",
      performanceNotes: "Metadata alteration.",
      concepts: ["ALTER TABLE", "RENAME COLUMN"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m34-p3", moduleId: 34, difficulty: "Hard",
      title: "Full schema lifecycle on a new reporting table",
            businessScenario: "The analytics team at Flipkart is setting up a new feedback pipeline. You need " +
                              "to create a table, extend it with a new column, rename a column for clarity, and " +
                              "verify the table is queryable. Each statement must execute in the correct " +
                              "sequence.",
            prompt: "Run this multi-step DDL sequence in order: (1) CREATE TABLE feedback_staging " +
                    "with columns: staging_id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL, " +
                    "raw_comment TEXT. (2) ALTER TABLE feedback_staging ADD COLUMN status TEXT " +
                    "DEFAULT 'New'. (3) ALTER TABLE feedback_staging RENAME COLUMN raw_comment TO " +
                    "comment. (4) SELECT * FROM feedback_staging to verify the schema is correct. " +
                    "Write all 4 statements separated by semicolons.",
            starterQuery: "-- Step 1: Create the staging table\nCREATE TABLE feedback_staging (\n " +
                          "staging_id INTEGER PRIMARY KEY,\n  customer_id INTEGER NOT NULL,\n  raw_comment " +
                          "TEXT\n);\n\n-- Step 2: Add status column\nALTER TABLE feedback_staging ADD " +
                          "COLUMN status TEXT DEFAULT 'New';\n\n-- Step 3: Rename column for clarity\nALTER " +
                          "TABLE feedback_staging RENAME COLUMN raw_comment TO comment;\n\n-- Step 4: " +
                          "Verify the table structure\nSELECT * FROM feedback_staging;",
            solution: "CREATE TABLE feedback_staging (staging_id INTEGER PRIMARY KEY, customer_id " +
                      "INTEGER NOT NULL, raw_comment TEXT); ALTER TABLE feedback_staging ADD COLUMN " +
                      "status TEXT DEFAULT 'New'; ALTER TABLE feedback_staging RENAME COLUMN " +
                      "raw_comment TO comment; SELECT * FROM feedback_staging;",
      hints: [
        "Execute CREATE TABLE first.",
        "ADD COLUMN must reference the existing table name.",
        "RENAME COLUMN uses the OLD column name as source.",
        "The final SELECT * confirms the schema has 4 columns."
      ],
            detailedExplanation: "Real schema evolution happens in steps: create, extend, rename. Each DDL " +
                                 "statement is atomic. Running them in order tests your understanding of " +
                                 "sequential schema mutations and column naming.",
            alternativeApproach: "In production, you'd run each statement in a separate migration script and " +
                                 "validate with PRAGMA table_info(feedback_staging).",
      performanceNotes: "DDL operations are metadata-only in SQLite and complete in microseconds.",
      concepts: ["CREATE TABLE", "ALTER TABLE", "ADD COLUMN", "RENAME COLUMN", "schema evolution"],
      companyTags: ["Flipkart"]
    }
  ],

  // MODULE 35: Data Modification - INSERT, UPDATE, DELETE
  35: [
    {
      id: "m35-p1", moduleId: 35, difficulty: "Easy",
      title: "Onboard a New Customer",
      businessScenario: "Register new user profiles.",
            prompt: "Write a query to insert a new customer into the customers table. customer_id: " +
                    "99, full_name: 'Amit Sharma', city: 'Mumbai', region: 'West', signup_date: " +
                    "'2026-06-01', segment: 'Premium'.",
            starterQuery: "INSERT INTO customers (customer_id, full_name, city, region, signup_date, " +
                          "segment) VALUES (99, '???', '???', '???', '???', '???');",
            solution: "INSERT INTO customers (customer_id, full_name, city, region, signup_date, " +
                      "segment) VALUES (99, 'Amit Sharma', 'Mumbai', 'West', '2026-06-01', 'Premium');",
      hints: ["Match columns to values in order."],
      detailedExplanation: "Appends a new record to the table.",
      alternativeApproach: "None.",
      performanceNotes: "Inserts a single row.",
      concepts: ["INSERT"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m35-p2", moduleId: 35, difficulty: "Medium",
      title: "Bulk Update Order Status",
      businessScenario: "Manage order delivery failures.",
            prompt: "Update the status of all orders where order_date is '2024-03-15' and status is " +
                    "'Pending' to 'Cancelled'.",
      starterQuery: "SELECT ???\nFROM ???\nWHERE ???;",
      solution: "UPDATE orders SET status = 'Cancelled' WHERE order_date = '2024-03-15' AND status = 'Pending';",
      hints: ["Use UPDATE table SET column = value WHERE filters."],
      detailedExplanation: "Modifies existing rows matching the filter.",
      alternativeApproach: "None.",
      performanceNotes: "Highly optimized when filtered on indexes.",
      concepts: ["UPDATE", "WHERE"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m35-p3", moduleId: 35, difficulty: "Hard",
      title: "Purge customers with no lifetime spend",
            businessScenario: "Data hygiene: remove customer accounts that have zero orders from the customers " +
                              "table to reduce storage and ensure downstream analytics exclude ghost accounts.",
            prompt: "Write a DELETE query to remove all customers from the customers table whose " +
                    "customer_id does NOT appear in any row of the orders table (i.e., customers with " +
                    "zero orders). Use a NOT IN subquery.",
            starterQuery: "DELETE FROM customers\nWHERE customer_id NOT IN (\n  SELECT DISTINCT " +
                          "customer_id\n  FROM orders\n);",
      solution: "DELETE FROM customers WHERE customer_id NOT IN (SELECT DISTINCT customer_id FROM orders);",
      hints: [
        "The subquery collects all customer_ids that have at least one order.",
        "NOT IN excludes those from the DELETE's scope, so only zero-order customers are deleted.",
        "Use SELECT DISTINCT customer_id FROM orders to avoid duplicates in the list."
      ],
            detailedExplanation: "Subquery-based DELETE is a multi-concept pattern: DELETE + NOT IN + correlated " +
                                 "subquery. It is the standard way to perform anti-join deletions when you don't " +
                                 "know which rows to delete directly.",
            alternativeApproach: "Can also write: DELETE FROM customers WHERE customer_id NOT IN (SELECT DISTINCT " +
                                 "customer_id FROM orders WHERE customer_id IS NOT NULL) to guard against NULL " +
                                 "propagation in NOT IN.",
            performanceNotes: "Ensure orders(customer_id) is indexed. The NOT IN subquery can be slow on large " +
                              "tables; a NOT EXISTS correlated subquery is often faster.",
      concepts: ["DELETE", "NOT IN", "subquery", "DISTINCT", "anti-join"],
      companyTags: ["Flipkart"]
    }
  ],

  // MODULE 36: Views Creation
  36: [
    {
      id: "m36-p1", moduleId: 36, difficulty: "Easy",
      title: "Create Delivered Orders View",
      businessScenario: "Simplify reporting filters.",
            prompt: "Create a view named delivered_orders_view that returns order_id, customer_id, " +
                    "and total_amount for orders with status = 'Delivered'.",
            starterQuery: "CREATE VIEW delivered_orders_view AS SELECT order_id, customer_id, total_amount " +
                          "FROM orders WHERE status = '???';",
            solution: "CREATE VIEW delivered_orders_view AS SELECT order_id, customer_id, total_amount " +
                      "FROM orders WHERE status = 'Delivered';",
      hints: ["Use CREATE VIEW name AS SELECT ..."],
      detailedExplanation: "Views store queries as reusable references.",
      alternativeApproach: "None.",
      performanceNotes: "No data is stored; runs underlying query.",
      concepts: ["Views"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m36-p2", moduleId: 36, difficulty: "Medium",
      title: "Customer Lifetime Value View",
      businessScenario: "Sales profile analysis.",
            prompt: "Create a view named customer_ltv_view that returns customer_id and total_spend " +
                    "(sum of total_amount). Group by customer_id.",
      starterQuery: "SELECT ???\nFROM ???\nGROUP BY ???\nHAVING ???;",
            solution: "CREATE VIEW customer_ltv_view AS SELECT customer_id, SUM(total_amount) AS " +
                      "total_spend FROM orders GROUP BY customer_id;",
      hints: ["Aggregate using SUM and GROUP BY inside view definition."],
      detailedExplanation: "Encapsulates grouped aggregate logic.",
      alternativeApproach: "None.",
      performanceNotes: "Aggregates underlying table on invocation.",
      concepts: ["Views", "GROUP BY"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m36-p3", moduleId: 36, difficulty: "Hard",
      title: "Executive Dashboard View",
      businessScenario: "Reconcile corporate datasets.",
            prompt: "Create a view named executive_dashboard_view that joins customers (customer_id, " +
                    "full_name, city) and orders (order_id, total_amount, status) on customer_id.",
      starterQuery: "-- Write your SQL query here\n",
            solution: "CREATE VIEW executive_dashboard_view AS SELECT c.customer_id, c.full_name, " +
                      "c.city, o.order_id, o.total_amount, o.status FROM customers c INNER JOIN orders " +
                      "o ON c.customer_id = o.customer_id;",
      hints: ["Join tables inside AS select."],
      detailedExplanation: "Simplifies multi-table join calls for analysts.",
      alternativeApproach: "None.",
      performanceNotes: "Resolves join links on execution.",
      concepts: ["Views", "INNER JOIN"],
      companyTags: ["Flipkart"]
    }
  ],

  // MODULE 37: Indexing Concepts
  37: [
    {
      id: "m37-p1", moduleId: 37, difficulty: "Easy",
      title: "Index Customer Queries",
      businessScenario: "Accelerate profile searches.",
            prompt: "Write a query to create an index named idx_customers_city on the `city` column " +
                    "of the `customers` table.",
      starterQuery: "SELECT ??? FROM ???;",
      solution: "CREATE INDEX idx_customers_city ON customers(city);",
      hints: ["Use CREATE INDEX index_name ON table_name(column_name)."],
      detailedExplanation: "Speeds up equality searches on city.",
      alternativeApproach: "None.",
      performanceNotes: "DDL operation; consumes index storage.",
      concepts: ["Indexes"],
      companyTags: ["Swiggy"]
    },
    {
      id: "m37-p2", moduleId: 37, difficulty: "Medium",
      title: "Composite Index for Order Lookups",
      businessScenario: "Optimize compound operational filters.",
            prompt: "Create a composite index named idx_orders_date_status on columns `order_date` " +
                    "and `status` of the `orders` table.",
      starterQuery: "SELECT ???\nFROM ???\nWHERE ???;",
      solution: "CREATE INDEX idx_orders_date_status ON orders(order_date, status);",
      hints: ["Specify multiple columns in parentheses separated by commas."],
      detailedExplanation: "Optimizes queries filtering by both order_date and status.",
      alternativeApproach: "None.",
      performanceNotes: "Index order matters; left column should match prefix filters.",
      concepts: ["Indexes", "composite index"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m37-p3", moduleId: 37, difficulty: "Hard",
      title: "Diagnose a slow query with index creation and verification",
            businessScenario: "A slow dashboard query on orders is causing timeouts at Flipkart. The DBA " +
                              "suspects a missing index on the (status, order_date) combination and asks you to " +
                              "prove the index helps using EXPLAIN QUERY PLAN.",
            prompt: "Run this 3-step sequence: (1) Use EXPLAIN QUERY PLAN on 'SELECT * FROM orders " +
                    "WHERE status = \'Delivered\' AND order_date >= \'2024-01-01\'' to see the " +
                    "baseline plan. (2) Create a composite index named idx_orders_status_date on " +
                    "orders(status, order_date). (3) Run the same EXPLAIN QUERY PLAN query again to " +
                    "confirm the index is now used. Write all 3 statements separated by semicolons.",
            starterQuery: "-- Step 1: Baseline plan (no index yet)\nEXPLAIN QUERY PLAN\nSELECT * FROM " +
                          "orders WHERE status = 'Delivered' AND order_date >= '2024-01-01';\n\n-- Step 2: " +
                          "Create the composite index\nCREATE INDEX idx_orders_status_date ON " +
                          "orders(status, order_date);\n\n-- Step 3: Re-check plan (should show INDEX " +
                          "SEARCH now)\nEXPLAIN QUERY PLAN\nSELECT * FROM orders WHERE status = 'Delivered' " +
                          "AND order_date >= '2024-01-01';",
            solution: "EXPLAIN QUERY PLAN SELECT * FROM orders WHERE status = 'Delivered' AND " +
                      "order_date >= '2024-01-01'; CREATE INDEX idx_orders_status_date ON " +
                      "orders(status, order_date); EXPLAIN QUERY PLAN SELECT * FROM orders WHERE status " +
                      "= 'Delivered' AND order_date >= '2024-01-01';",
      hints: [
        "Step 1: EXPLAIN QUERY PLAN before the index will show SCAN TABLE orders.",
        "Step 2: CREATE INDEX idx_orders_status_date ON orders(status, order_date).",
        "Step 3: After the index, EXPLAIN QUERY PLAN should show SEARCH TABLE orders USING INDEX.",
        "The composite index order matters: put the equality column (status) first, the " +
        "range column (order_date) second."
      ],
            detailedExplanation: "Composite indexes accelerate queries that filter on the leading column(s) " +
                                 "first. By placing status first (equality filter) and order_date second (range " +
                                 "filter), the optimizer can use the index for both conditions. EXPLAIN QUERY PLAN " +
                                 "before and after the index creation proves the impact.",
            alternativeApproach: "CREATE UNIQUE INDEX is only appropriate if you want to enforce uniqueness. For " +
                                 "performance without uniqueness, use CREATE INDEX.",
            performanceNotes: "Indexes add write overhead (every INSERT/UPDATE must update the index), so " +
                              "create them only for frequently-queried filter columns.",
      concepts: ["Indexes", "composite index", "EXPLAIN QUERY PLAN", "query optimization"],
      companyTags: ["Flipkart"]
    }
  ],

  // MODULE 38: Execution Plans - EXPLAIN
  38: [
    {
      id: "m38-p1", moduleId: 38, difficulty: "Easy",
      title: "Explain basic select",
      businessScenario: "Audit raw execution metrics.",
            prompt: "Prep the command to inspect the query plan for: `SELECT * FROM customers`. " +
                    "Prefix the query with EXPLAIN QUERY PLAN.",
      starterQuery: "SELECT ??? FROM customers;",
      solution: "EXPLAIN QUERY PLAN SELECT * FROM customers;",
      hints: ["Write: EXPLAIN QUERY PLAN SELECT ..."],
      detailedExplanation: "Shows SQLite optimizer search routes.",
      alternativeApproach: "EXPLAIN.",
      performanceNotes: "No query is executed; outputs metadata plan.",
      concepts: ["EXPLAIN"],
      companyTags: ["Swiggy"]
    },
    {
      id: "m38-p2", moduleId: 38, difficulty: "Medium",
      title: "Explain query plan index check",
            businessScenario: "A high-traffic dashboard at Myntra is experiencing latency due to customer " +
                              "order lookup queries. As a performance engineer, you need to verify whether the " +
                              "SQL engine is correctly utilizing the database index on customer_id rather than " +
                              "performing a full table scan.",
            prompt: "Write the explain command to check if the index on customer_id is used in " +
                    "orders lookup: `SELECT * FROM orders WHERE customer_id = 5`.",
      starterQuery: "SELECT ???\nFROM ???\nWHERE ???;",
      solution: "EXPLAIN QUERY PLAN SELECT * FROM orders WHERE customer_id = 5;",
      hints: ["Prefix query with EXPLAIN QUERY PLAN."],
      detailedExplanation: "Shows if the optimizer does an INDEX SEARCH or TABLE SCAN.",
      alternativeApproach: "None.",
      performanceNotes: "Used for query optimization.",
      concepts: ["EXPLAIN", "Indexes"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m38-p3", moduleId: 38, difficulty: "Hard",
      title: "Explain join plan check",
      businessScenario: "Optimize relational loops.",
            prompt: "Write the explain command to inspect join order execution: `SELECT * FROM " +
                    "orders o JOIN customers c ON o.customer_id = c.customer_id`.",
      starterQuery: "-- Write your SQL query here\n",
      solution: "EXPLAIN QUERY PLAN SELECT * FROM orders o INNER JOIN customers c ON o.customer_id = c.customer_id;",
      hints: ["Prefix inner join select with EXPLAIN QUERY PLAN."],
      detailedExplanation: "Inspects join search algorithms.",
      alternativeApproach: "None.",
      performanceNotes: "Indicates scan bounds.",
      concepts: ["EXPLAIN", "INNER JOIN"],
      companyTags: ["Swiggy"]
    }
  ],

  // MODULE 39: Transactions (ACID)
  39: [
    {
      id: "m39-p1", moduleId: 39, difficulty: "Easy",
      title: "Basic Transaction",
      businessScenario: "Commit individual signups atomically.",
      prompt: "Write a query to wrap a customer insert in a transaction block. Use BEGIN TRANSACTION and COMMIT.",
            starterQuery: "BEGIN TRANSACTION; INSERT INTO customers (customer_id, full_name, city, region, " +
                          "signup_date, segment) VALUES (102, '???', '???', '???', '???', '???'); COMMIT;",
            solution: "BEGIN TRANSACTION; INSERT INTO customers (customer_id, full_name, city, region, " +
                      "signup_date, segment) VALUES (102, 'Rohan Das', 'Kolkata', 'East', '2026-06-01', " +
                      "'Student'); COMMIT;",
      hints: ["Write BEGIN TRANSACTION; followed by insert, then COMMIT;"],
      detailedExplanation: "Transactions isolate state writes.",
      alternativeApproach: "None.",
      performanceNotes: "Guarantees atomic commit.",
      concepts: ["Transactions", "INSERT"],
      companyTags: ["Paytm"]
    },
    {
      id: "m39-p2", moduleId: 39, difficulty: "Medium",
      title: "Refund Transaction",
      businessScenario: "Manage balance sheets atomically.",
            prompt: "Write a transaction block to record a refund. Update orders.status to " +
                    "'Returned' for order_id = 1, and insert a new payment with amount = -3500.0, " +
                    "payment_mode = 'UPI', payment_status = 'Success', order_id = 1, and payment_id = " +
                    "101.",
      starterQuery: "SELECT ???\nFROM ???\nWHERE ???;",
            solution: "BEGIN TRANSACTION; UPDATE orders SET status = 'Returned' WHERE order_id = 1; " +
                      "INSERT INTO payments (payment_id, order_id, payment_mode, payment_status, " +
                      "amount) VALUES (101, 1, 'UPI', 'Success', -3500.0); COMMIT;",
      hints: ["Ensure both update and insert execute inside BEGIN and COMMIT."],
      detailedExplanation: "Atomicity ensures updates and ledger inserts commit together.",
      alternativeApproach: "None.",
      performanceNotes: "Locks rows during commit phase.",
      concepts: ["Transactions", "UPDATE", "INSERT"],
      companyTags: ["Paytm"]
    },
    {
      id: "m39-p3", moduleId: 39, difficulty: "Hard",
      title: "Atomic order cancellation and inventory credit",
            businessScenario: "When a customer cancels an order at Paytm Commerce, two things must happen " +
                              "atomically: (1) the order status changes to 'Cancelled', and (2) a refund " +
                              "payment record is inserted. If either step fails, neither should commit. Write " +
                              "the full transactional block.",
            prompt: "Write a transaction block that: (1) Updates orders SET status = 'Cancelled' " +
                    "WHERE order_id = 3 AND status = 'Pending'. (2) Inserts a payment record with " +
                    "payment_id = 201, order_id = 3, payment_mode = 'UPI', payment_status = " +
                    "'Refunded', amount = -2800.0. Wrap both in BEGIN TRANSACTION ... COMMIT. Then " +
                    "verify by selecting order_id, status from orders WHERE order_id = 3.",
            starterQuery: "BEGIN TRANSACTION;\n\n-- Step 1: Cancel the order\nUPDATE orders\nSET status = " +
                          "'Cancelled'\nWHERE order_id = 3 AND status = 'Pending';\n\n-- Step 2: Insert " +
                          "refund payment record\nINSERT INTO payments (payment_id, order_id, payment_mode, " +
                          "payment_status, amount)\nVALUES (201, 3, 'UPI', 'Refunded', " +
                          "-2800.0);\n\nCOMMIT;\n\n-- Verify\nSELECT order_id, status FROM orders WHERE " +
                          "order_id = 3;",
            solution: "BEGIN TRANSACTION; UPDATE orders SET status = 'Cancelled' WHERE order_id = 3 " +
                      "AND status = 'Pending'; INSERT INTO payments (payment_id, order_id, " +
                      "payment_mode, payment_status, amount) VALUES (201, 3, 'UPI', 'Refunded', " +
                      "-2800.0); COMMIT; SELECT order_id, status FROM orders WHERE order_id = 3;",
      hints: [
        "BEGIN TRANSACTION starts the atomic block.",
        "UPDATE must come before INSERT since the payment references the order.",
        "COMMIT makes both changes permanent only if both succeeded.",
        "The final SELECT verifies atomicity by checking the updated row."
      ],
            detailedExplanation: "Atomicity means both the UPDATE and the INSERT succeed or both are rolled back. " +
                                 "If you omit the transaction and the INSERT fails after the UPDATE commits, you'd " +
                                 "have a cancelled order with no refund record \u2014 a data integrity violation. " +
                                 "ACID transactions prevent this.",
      alternativeApproach: "In production you'd use SAVEPOINT for nested sub-transactions within a larger workflow.",
            performanceNotes: "Transactions add a lock on modified rows until COMMIT. Short transactions " +
                              "minimize contention.",
      concepts: ["Transactions", "UPDATE", "INSERT", "atomicity", "ACID"],
      companyTags: ["Paytm"]
    }
  ],

  // MODULE 40: Advanced Optimization Tricks
  40: [
    {
      id: "m40-p1", moduleId: 40, difficulty: "Easy",
      title: "Optimize SELECT *",
      businessScenario: "Avoid reading excess disk bytes.",
            prompt: "Rewrite this slow wide-table query to select only customer name and signup " +
                    "date: `SELECT * FROM customers`.",
      starterQuery: "SELECT ??? FROM customers;",
      solution: "SELECT full_name, signup_date FROM customers;",
      hints: ["Replace * with explicit column names."],
      detailedExplanation: "Minimizes output projection footprint.",
      alternativeApproach: "None.",
      performanceNotes: "Saves network/disk payload.",
      concepts: ["Query Optimization"],
      companyTags: ["Swiggy"]
    },
    {
      id: "m40-p2", moduleId: 40, difficulty: "Medium",
      title: "Pre-filter Before Joining",
      businessScenario: "Reduce size of joined records.",
            prompt: "Optimise the query to filter for active subscriptions before joining with " +
                    "customers. Join customers (c) and active subscriptions (s) on customer_id, " +
                    "select c.full_name, s.plan_name, s.status.",
      starterQuery: "SELECT ???\nFROM ???\nJOIN ??? ON ???\nWHERE ???;",
            solution: "SELECT c.full_name, s.plan_name, s.status FROM customers c INNER JOIN " +
                      "subscriptions s ON c.customer_id = s.customer_id WHERE s.status = 'Active';",
      hints: ["SQLite joins tables first, but filtering early reduces record sets."],
      detailedExplanation: "Ensures optimizer uses status filters early.",
      alternativeApproach: "None.",
      performanceNotes: "Dramatically reduces join overhead.",
      concepts: ["Query Optimization", "INNER JOIN"],
      companyTags: ["Flipkart"]
    },
    {
      id: "m40-p3", moduleId: 40, difficulty: "Hard",
      title: "Correlated Subquery to JOIN",
      businessScenario: "Eliminate N+1 query patterns.",
            prompt: "Optimize this correlated subquery as a JOIN to avoid running it N times: " +
                    "`SELECT o.order_id, o.total_amount, (SELECT full_name FROM customers WHERE " +
                    "customer_id = o.customer_id) FROM orders o`. Return order_id, total_amount, and " +
                    "customer full name (as customer_name).",
            starterQuery: "SELECT\n  o.order_id,\n  o.total_amount,\n  c.full_name AS customer_name\nFROM " +
                          "orders o\nLEFT JOIN customers c ON ??? = ???;",
            solution: "SELECT o.order_id, o.total_amount, c.full_name AS customer_name FROM orders o " +
                      "LEFT JOIN customers c ON o.customer_id = c.customer_id;",
      hints: ["Use a LEFT JOIN instead of the subquery in SELECT."],
      detailedExplanation: "Converts row-by-row subquery calls into a set-level hash/index join.",
      alternativeApproach: "None.",
      performanceNotes: "Changes complexity from O(N^2) to O(N).",
      concepts: ["Query Optimization", "LEFT JOIN"],
      companyTags: ["Swiggy"]
    }
  ]
};

export const allProbs = [...batch1Problems, ...batch2Problems, ...batch3Problems];