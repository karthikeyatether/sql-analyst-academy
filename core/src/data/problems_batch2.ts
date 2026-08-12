import type { PracticeProblem } from "./curriculumMetadata";

export const batch2Problems: Record<number, PracticeProblem[]> = {
  // MODULE 11: Finding Averages - AVG
  11: [
    {
      id: "m11-p1",
      moduleId: 11,
      difficulty: "Easy",
      title: "Average order total",
      businessScenario:
        "Croma's finance lead needs to calculate the average transaction value across " +
        "all completed orders.",
      prompt:
        "Write a query to calculate the average total_amount from the orders table. " +
        "Alias the output as avg_order_amount.",
      starterQuery: "SELECT ??? FROM orders;",
      solution: "SELECT AVG(total_amount) AS avg_order_amount FROM orders;",
      hints: [
        "Use the AVG() aggregate function on total_amount.",
        "Apply standard filtering and analytical clauses to isolate the exact target dataset.",
        "Structure your query using clauses similar to: SELECT AVG(total_amount) AS avg_order_amount FROM orders;.",
      ],
      detailedExplanation: "AVG calculates the mean value of a numeric column.",
      alternativeApproach: "None.",
      performanceNotes: "Runs in a single scan of the orders table.",
      concepts: ["AVG"],
      companyTags: ["Croma"],
    },
    {
      id: "m11-p2",
      moduleId: 11,
      difficulty: "Medium",
      title: "Average list price for premium brands",
      businessScenario:
        "Find the average list price of Samsung or Apple products to audit merchandising margins.",
      prompt:
        "Write a query to calculate the average list_price of products where the brand " +
        "is 'Samsung' or 'Apple'. Alias the result as avg_brand_price.",
      starterQuery: "SELECT ???\nFROM ???\nWHERE ???;",
      solution:
        "SELECT AVG(list_price) AS avg_brand_price FROM products WHERE brand = 'Samsung' OR brand = 'Apple';",
      hints: [
        "Filter brand using OR or IN, then apply AVG.",
        "Filter your result set using WHERE conditions to isolate the target criteria.",
        "Structure your query using clauses similar to: SELECT AVG(list_price) AS avg_brand_price FROM products WHERE brand =.",
      ],
      detailedExplanation:
        "Filters rows first, and then calculates the mean list price of premium products.",
      alternativeApproach: "WHERE brand IN ('Samsung', 'Apple').",
      performanceNotes: "Uses brand index for speed.",
      concepts: ["AVG", "WHERE"],
      companyTags: ["Croma"],
    },
    {
      id: "m11-p3",
      moduleId: 11,
      difficulty: "Hard",
      title: "Average cost price for budget electronics",
      businessScenario:
        "The finance team wants to inspect catalog margins for budget electronics.",
      prompt:
        "Write a query to calculate the average cost_price and average list_price for " +
        "products in the 'Electronics' category with a list_price under 20000. Alias the " +
        "results as avg_cost and avg_list.",
      starterQuery:
        "SELECT AVG(???) as avg_cost FROM products WHERE category = '???' AND list_price < ???;",
      solution:
        "SELECT AVG(cost_price) AS avg_cost, AVG(list_price) AS avg_list FROM products " +
        "WHERE category = 'Electronics' AND list_price < 20000;",
      hints: [
        "Compute both averages in the same SELECT statement.",
        "Apply standard filtering and analytical clauses to isolate the exact target dataset.",
        "Structure your query using clauses similar to: SELECT AVG(cost_price) AS avg_cost, AVG(list_price) AS avg_list FROM products.",
      ],
      detailedExplanation: "Performs two AVG aggregations in a single scan.",
      alternativeApproach: "None.",
      performanceNotes: "Aggregates in a single scan.",
      concepts: ["AVG", "WHERE", "AND"],
      companyTags: ["Croma"],
    },
  ],

  // MODULE 12: Extremes - MIN & MAX
  12: [
    {
      id: "m12-p1",
      moduleId: 12,
      difficulty: "Easy",
      title: "Price Extremes",
      businessScenario: "MERCHANDISING wants to find catalog bounds.",
      prompt:
        "Find the minimum list_price as cheapest_product and maximum list_price as " +
        "dearest_product from the products table.",
      starterQuery: "SELECT ??? FROM products;",
      solution:
        "SELECT MIN(list_price) AS cheapest_product, MAX(list_price) AS dearest_product FROM products;",
      hints: [
        "Use MIN and MAX on list_price.",
        "Apply standard filtering and analytical clauses to isolate the exact target dataset.",
        "Structure your query using clauses similar to: SELECT MIN(list_price) AS cheapest_product, MAX(list_price) AS dearest_product FROM products;.",
      ],
      detailedExplanation: "MIN returns smallest, MAX returns largest.",
      alternativeApproach: "None.",
      performanceNotes: "Extremely fast.",
      concepts: ["MIN", "MAX"],
      companyTags: ["Croma"],
    },
    {
      id: "m12-p2",
      moduleId: 12,
      difficulty: "Medium",
      title: "Category Price Spread & Margin Ratio",
      businessScenario:
        "Flipkart's merchandising analytics team needs a comprehensive price spread assessment across product categories to optimize catalog pricing.",
      prompt:
        "Write a query to retrieve category, minimum list_price AS min_price, maximum list_price AS max_price, average list_price rounded to 2 decimal places AS avg_price, and price spread AS price_spread (MAX(list_price) minus MIN(list_price)) from the products table. Group by category and order by price_spread DESC.",
      starterQuery: "SELECT ???\nFROM products\nGROUP BY ???\nORDER BY ???;",
      solution:
        "SELECT category, MIN(list_price) AS min_price, MAX(list_price) AS max_price, ROUND(AVG(list_price), 2) AS avg_price, (MAX(list_price) - MIN(list_price)) AS price_spread FROM products GROUP BY category ORDER BY price_spread DESC;",
      hints: [
        "Calculate MIN, MAX, ROUND(AVG, 2), and (MAX - MIN) for each category.",
        "Group output rows by category using GROUP BY.",
        "Structure your query: SELECT category, MIN(list_price) AS min_price, MAX(list_price) AS max_price, ROUND(AVG(list_price), 2) AS avg_price, (MAX(list_price) - MIN(list_price)) AS price_spread FROM products GROUP BY category ORDER BY price_spread DESC;",
      ],
      detailedExplanation:
        "Combines multiple MIN/MAX/AVG aggregates with derived group calculations.",
      alternativeApproach: "None.",
      performanceNotes: "Efficient single scan with category aggregation.",
      concepts: ["MIN", "MAX", "AVG", "GROUP BY", "ORDER BY"],
      companyTags: ["Flipkart"],
    },
    {
      id: "m12-p3",
      moduleId: 12,
      difficulty: "Hard",
      title: "Extreme order amounts in 2024",
      businessScenario:
        "Identify largest transaction and smallest non-zero total in 2024.",
      prompt:
        "Write a query to find the maximum total_amount as highest_order and minimum " +
        "total_amount as lowest_order from orders where order_date starts with '2024' and " +
        "total_amount > 0.",
      starterQuery:
        "SELECT MIN(???) as min_amt, MAX(???) as max_amt FROM orders WHERE SUBSTR(???, 1, 4) = '???';",
      solution:
        "SELECT MAX(total_amount) AS highest_order, MIN(total_amount) AS lowest_order " +
        "FROM orders WHERE order_date LIKE '2024%' AND total_amount > 0;",
      hints: [
        "Use MAX and MIN with LIKE and numeric filter.",
        "Apply standard filtering and analytical clauses to isolate the exact target dataset.",
        "Structure your query using clauses similar to: SELECT MAX(total_amount) AS highest_order, MIN(total_amount) AS lowest_order.",
      ],
      detailedExplanation: "Finds extremes on filtered subset.",
      alternativeApproach: "None.",
      performanceNotes: "Fast scan.",
      concepts: ["MAX", "MIN", "WHERE"],
      companyTags: ["Flipkart"],
    },
  ],

  // MODULE 13: Grouping Rows - GROUP BY
  13: [
    {
      id: "m13-p1",
      moduleId: 13,
      difficulty: "Easy",
      title: "Customer demographics by city",
      businessScenario:
        "The expansion team wants to analyze customer distribution across cities to plan new regional fulfillment hubs.",
      prompt:
        "Write a query to retrieve city and customer_count (COUNT of customer_id) from the customers table, grouped by city. Order by customer_count descending, city ascending.",
      starterQuery:
        "SELECT city, COUNT(customer_id) AS customer_count\nFROM customers\nGROUP BY ???\nORDER BY ???;",
      solution:
        "SELECT city, COUNT(customer_id) AS customer_count FROM customers GROUP BY city ORDER BY customer_count DESC, city ASC;",
      hints: [
        "Select city and COUNT(customer_id) AS customer_count from the customers table.",
        "Group rows by city using GROUP BY city.",
        "Structure your query: SELECT city, COUNT(customer_id) AS customer_count FROM customers GROUP BY city ORDER BY customer_count DESC, city ASC;",
      ],
      detailedExplanation:
        "This query aggregates customer records by city using GROUP BY city and computes the total customer count per city, ordering the output to highlight top markets.",
      alternativeApproach: "None.",
      performanceNotes: "Single scan aggregation on customers table.",
      concepts: ["GROUP BY", "COUNT"],
      companyTags: ["Flipkart"],
    },
    {
      id: "m13-p2",
      moduleId: 13,
      difficulty: "Medium",
      title: "Orders by channel and status",
      businessScenario: "Understand order delivery across channels.",
      prompt:
        "Write a query to count orders by channel and status. Return channel, status, and order_count.",
      starterQuery: "SELECT ???\nFROM ???\nGROUP BY ???\nHAVING ???;",
      solution:
        "SELECT channel, status, COUNT(*) AS order_count FROM orders GROUP BY channel, status;",
      hints: [
        "List both columns in GROUP BY and SELECT.",
        "Group your output rows using GROUP BY and apply aggregate functions like COUNT(), SUM(), or AVG().",
        "Structure your query using clauses similar to: SELECT channel, status, COUNT(*) AS order_count FROM orders GROUP BY channel, status;.",
      ],
      detailedExplanation: "Groups by combinations of channel and status.",
      alternativeApproach: "None.",
      performanceNotes: "Composite sort aggregation.",
      concepts: ["GROUP BY", "COUNT"],
      companyTags: ["Flipkart"],
    },
    {
      id: "m13-p3",
      moduleId: 13,
      difficulty: "Hard",
      title: "Monthly channel revenue trend",
      businessScenario: "Analyze revenue trajectories per channel per month.",
      prompt:
        "Write a query to get order_month (using SUBSTR(order_date, 1, 7)), channel, and " +
        "total_revenue (SUM of total_amount). Group by order_month, channel, and sort by " +
        "order_month desc, total_revenue desc.",
      starterQuery:
        "SELECT ???\nFROM ???;" +
        "total_revenue\nFROM orders\nGROUP BY order_month, channel\nORDER BY order_month " +
        "DESC, total_revenue DESC;",
      solution:
        "SELECT SUBSTR(order_date, 1, 7) AS order_month, channel, SUM(total_amount) AS " +
        "total_revenue FROM orders GROUP BY SUBSTR(order_date, 1, 7), channel ORDER BY " +
        "order_month DESC, total_revenue DESC;",
      hints: [
        "Group by the SUBSTR expression and channel.",
        "Apply standard filtering and analytical clauses to isolate the exact target dataset.",
        "Structure your query using clauses similar to: SELECT SUBSTR(order_date, 1, 7) AS order_month, channel, SUM(total_amount) AS.",
      ],
      detailedExplanation:
        "Uses string operations in grouping keys for month partitions.",
      alternativeApproach: "None.",
      performanceNotes: "Computes per row and aggregates.",
      concepts: ["GROUP BY", "SUM", "SUBSTR"],
      companyTags: ["Flipkart"],
    },
    {
      id: "m13-p4",
      moduleId: 13,
      difficulty: "Hard",
      title: "Concatenate product IDs per order",
      businessScenario:
        "The logistics team wants to see a consolidated text list of all product IDs ordered in each transaction.",
      prompt:
        "Write a query on order_items grouped by order_id. Return order_id, total_items (COUNT of product_id), and a comma-separated list of distinct product IDs (aliased as 'product_ids') using MySQL GROUP_CONCAT(DISTINCT product_id). Group by order_id. Order by order_id ascending.",
      starterQuery:
        "SELECT order_id, COUNT(product_id) AS total_items, GROUP_CONCAT(DISTINCT product_id) AS product_ids\nFROM order_items\nGROUP BY ???\nORDER BY ???;",
      solution:
        "SELECT order_id, COUNT(product_id) AS total_items, GROUP_CONCAT(DISTINCT product_id) AS product_ids FROM order_items GROUP BY order_id ORDER BY order_id ASC;",
      hints: [
        "Select order_id, COUNT(product_id) AS total_items, and GROUP_CONCAT(DISTINCT product_id) AS product_ids.",
        "Group the result set by order_id using GROUP BY order_id.",
        "Structure your query: SELECT order_id, COUNT(product_id) AS total_items, GROUP_CONCAT(DISTINCT product_id) AS product_ids FROM order_items GROUP BY order_id ORDER BY order_id ASC;",
      ],
      detailedExplanation:
        "GROUP_CONCAT aggregates multiple column values within a group into a single delimited string.",
      alternativeApproach: "None.",
      performanceNotes: "Fast single-table aggregation.",
      concepts: ["GROUP BY", "GROUP_CONCAT", "COUNT"],
      companyTags: ["Swiggy"],
    },
  ],

  // MODULE 14: Filtered Groups - HAVING
  14: [
    {
      id: "m14-p1",
      moduleId: 14,
      difficulty: "Easy",
      title: "Channels with more than 3 delivered orders",
      businessScenario: "Identify transaction active channels.",
      prompt:
        "Retrieve channel and order_count. Filter for 'Delivered' orders, group by " +
        "channel, and only include channels with more than 3 orders.",
      starterQuery:
        "SELECT channel, COUNT(*) AS order_count FROM orders WHERE status = '???' GROUP " +
        "BY channel HAVING COUNT(*) > ???;",
      solution:
        "SELECT channel, COUNT(*) AS order_count FROM orders WHERE status = 'Delivered' " +
        "GROUP BY channel HAVING COUNT(*) > 3;",
      hints: [
        "Filter WHERE status =",
        ", aggregate, then use HAVING count > 3.",
        "Structure your query using clauses similar to: SELECT channel, COUNT(*) AS order_count FROM orders WHERE status =.",
      ],
      detailedExplanation:
        "WHERE filters rows before GROUP BY; HAVING filters grouped sums after.",
      alternativeApproach: "None.",
      performanceNotes:
        "Filters early with WHERE, reducing HAVING comparisons.",
      concepts: ["HAVING", "GROUP BY", "WHERE"],
      companyTags: ["Flipkart"],
    },
    {
      id: "m14-p2",
      moduleId: 14,
      difficulty: "Medium",
      title: "High-spending customers",
      businessScenario:
        "Loyalty program needs customers who spent more than ₹10,000.",
      prompt:
        "Find customer_id and total_spent. Only sum total_amount. Group by customer_id, " +
        "filter to total_spent > 10000.",
      starterQuery: "SELECT ???\nFROM ???\nGROUP BY ???\nHAVING ???;",
      solution:
        "SELECT customer_id, SUM(total_amount) AS total_spent FROM orders GROUP BY " +
        "customer_id HAVING SUM(total_amount) > 10000;",
      hints: [
        "Group by customer_id, filter using HAVING SUM(total_amount) > 10000.",
        "Group your output rows using GROUP BY and apply aggregate functions like COUNT(), SUM(), or AVG().",
        "Structure your query using clauses similar to: SELECT customer_id, SUM(total_amount) AS total_spent FROM orders GROUP BY.",
      ],
      detailedExplanation: "HAVING allows filtering on grouped aggregates.",
      alternativeApproach: "None.",
      performanceNotes: "Scans and aggregates before filtering groups.",
      concepts: ["HAVING", "GROUP BY", "SUM"],
      companyTags: ["Flipkart"],
    },
    {
      id: "m14-p3",
      moduleId: 14,
      difficulty: "Hard",
      title: "High-volume categories with premium list prices",
      businessScenario:
        "Find product categories with high inventory price peaks.",
      prompt:
        "Write a query to find product categories with more than 2 products AND a " +
        "maximum catalog list_price of at least ₹15,000. Return category, product_count, " +
        "and max_price.",
      starterQuery:
        "SELECT category, COUNT(*) as product_count, MAX(???) as max_price FROM products GROUP BY ??? HAVING COUNT(*) > ??? AND MAX(list_price) >= ???;",
      solution:
        "SELECT category, COUNT(*) AS product_count, MAX(list_price) AS max_price FROM " +
        "products GROUP BY category HAVING COUNT(*) > 2 AND MAX(list_price) >= 15000;",
      hints: [
        "Use multiple conditions inside HAVING combined with AND.",
        "Apply standard filtering and analytical clauses to isolate the exact target dataset.",
        "Structure your query using clauses similar to: SELECT category, COUNT(*) AS product_count, MAX(list_price) AS max_price FROM.",
      ],
      detailedExplanation:
        "Demonstrates compound aggregate filtering in HAVING.",
      alternativeApproach: "None.",
      performanceNotes: "Groups catalog before discarding candidates.",
      concepts: ["HAVING", "COUNT", "MAX", "GROUP BY"],
      companyTags: ["Croma"],
    },
  ],

  // MODULE 15: HAVING vs WHERE
  15: [
    {
      id: "m15-p1",
      moduleId: 15,
      difficulty: "Easy",
      title: "Average catalog pricing by brand",
      businessScenario:
        "Merchandising wants to evaluate average list price for premium products priced over ₹2,000 across major brands.",
      prompt:
        "Write a query on the products table to return brand and avg_price (AVG of list_price). Filter to products with list_price > 2000 in the WHERE clause, group by brand, and use HAVING to include only brands where avg_price is greater than 5000. Order by avg_price descending.",
      starterQuery:
        "SELECT brand, AVG(list_price) AS avg_price\nFROM products\nWHERE list_price > 2000\nGROUP BY brand\nHAVING ???\nORDER BY avg_price DESC;",
      solution:
        "SELECT brand, AVG(list_price) AS avg_price FROM products WHERE list_price > 2000 GROUP BY brand HAVING AVG(list_price) > 5000 ORDER BY avg_price DESC;",
      hints: [
        "Filter individual products with WHERE list_price > 2000 before grouping.",
        "Group by brand and filter aggregated brand average with HAVING AVG(list_price) > 5000.",
        "Structure your query: SELECT brand, AVG(list_price) AS avg_price FROM products WHERE list_price > 2000 GROUP BY brand HAVING AVG(list_price) > 5000 ORDER BY avg_price DESC;",
      ],
      detailedExplanation:
        "Demonstrates the fundamental difference between WHERE and HAVING: WHERE filters individual product rows (list_price > 2000) prior to grouping, while HAVING filters the computed aggregate group averages (avg_price > 5000).",
      alternativeApproach: "None.",
      performanceNotes:
        "Filter on list_price reduces candidate rows aggregated.",
      concepts: ["WHERE", "HAVING", "GROUP BY", "AVG"],
      companyTags: ["Croma"],
    },
    {
      id: "m15-p2",
      moduleId: 15,
      difficulty: "Medium",
      title: "High value items count by brand",
      businessScenario:
        "Marketing wants to find brands with multiple premium products costing over ₹10,000.",
      prompt:
        "Write a query to return brand and product_count. Only evaluate products where " +
        "list_price > 10000. Group by brand, and only include brands that have more than " +
        "1 such product.",
      starterQuery: "SELECT ???\nFROM ???\nGROUP BY ???\nHAVING ???;",
      solution:
        "SELECT brand, COUNT(*) AS product_count FROM products WHERE list_price > 10000 " +
        "GROUP BY brand HAVING COUNT(*) > 1;",
      hints: [
        "WHERE filters individual items, HAVING filters aggregated brand count.",
        "Filter your result set using WHERE conditions to isolate the target criteria.",
        "Structure your query using clauses similar to: SELECT brand, COUNT(*) AS product_count FROM products WHERE list_price > 10000.",
      ],
      detailedExplanation:
        "WHERE discards cheap products; HAVING filters out brands with only one premium product.",
      alternativeApproach: "None.",
      performanceNotes: "Extremely fast when indexed on price and brand.",
      concepts: ["WHERE", "HAVING", "GROUP BY"],
      companyTags: ["Croma"],
    },
    {
      id: "m15-p3",
      moduleId: 15,
      difficulty: "Hard",
      title: "Department payroll budget for senior staff",
      businessScenario:
        "HR finance wants to audit department payroll allocated to high-earning senior team members.",
      prompt:
        "Write a query on the employees table to calculate total_senior_payroll (SUM of salary_lpa) for employees earning more than ₹15 LPA. Group by department_id, and use HAVING to return only departments where total_senior_payroll exceeds ₹50 LPA. Order by total_senior_payroll descending.",
      starterQuery:
        "SELECT department_id, SUM(salary_lpa) AS total_senior_payroll\nFROM employees\nWHERE salary_lpa > 15\nGROUP BY department_id\nHAVING ???\nORDER BY total_senior_payroll DESC;",
      solution:
        "SELECT department_id, SUM(salary_lpa) AS total_senior_payroll FROM employees WHERE salary_lpa > 15 GROUP BY department_id HAVING SUM(salary_lpa) > 50 ORDER BY total_senior_payroll DESC;",
      hints: [
        "Filter raw employee records first using WHERE salary_lpa > 15.",
        "Group by department_id and filter aggregated payroll using HAVING SUM(salary_lpa) > 50.",
        "Structure your query: SELECT department_id, SUM(salary_lpa) AS total_senior_payroll FROM employees WHERE salary_lpa > 15 GROUP BY department_id HAVING SUM(salary_lpa) > 50 ORDER BY total_senior_payroll DESC;",
      ],
      detailedExplanation:
        "Combines row-level filtering (WHERE salary_lpa > 15) to isolate senior staff, followed by group aggregation (GROUP BY department_id) and group-level thresholding (HAVING SUM(salary_lpa) > 50).",
      alternativeApproach: "None.",
      performanceNotes:
        "Filters individual employee records before department aggregation.",
      concepts: ["WHERE", "HAVING", "GROUP BY", "SUM"],
      companyTags: ["TCS"],
    },
  ],

  // MODULE 16: Inner Joins
  16: [
    {
      id: "m16-p1",
      moduleId: 16,
      difficulty: "Easy",
      title: "Order details with customer city",
      businessScenario:
        "Operations wants order totals paired with the buyer's region.",
      prompt:
        "Write a query to retrieve order_id, total_amount, order_date, full_name, and " +
        "city by joining orders and customers.",
      starterQuery: "SELECT ??? FROM orders;",
      solution:
        "SELECT o.order_id, o.total_amount, o.order_date, c.full_name, c.city FROM " +
        "orders o INNER JOIN customers c ON o.customer_id = c.customer_id;",
      hints: [
        "Join on customer_id.",
        "Apply standard filtering and analytical clauses to isolate the exact target dataset.",
        "Structure your query using clauses similar to: SELECT o.order_id, o.total_amount, o.order_date, c.full_name, c.city FROM.",
      ],
      detailedExplanation:
        "INNER JOIN returns matching records in both tables.",
      alternativeApproach: "None.",
      performanceNotes: "Uses foreign key indexes.",
      concepts: ["INNER JOIN"],
      companyTags: ["Swiggy"],
    },
    {
      id: "m16-p2",
      moduleId: 16,
      difficulty: "Medium",
      title: "Product revenue with category join",
      businessScenario:
        "Merchandising wants to see sales paired with product metadata.",
      prompt:
        "Write a query to retrieve order_id, product_name, category, and line_total " +
        "(quantity * unit_price) from order_items joined with products.",
      starterQuery: "SELECT ???\nFROM ???\nJOIN ??? ON ???\nWHERE ???;",
      solution:
        "SELECT oi.order_id, p.product_name, p.category, (oi.quantity * oi.unit_price) " +
        "AS line_total FROM order_items oi INNER JOIN products p ON oi.product_id = " +
        "p.product_id;",
      hints: [
        "Join order_items and products on product_id.",
        "Apply standard filtering and analytical clauses to isolate the exact target dataset.",
        "Structure your query using clauses similar to: SELECT oi.order_id, p.product_name, p.category, (oi.quantity * oi.unit_price).",
      ],
      detailedExplanation: "Pairs transaction items with catalog names.",
      alternativeApproach: "None.",
      performanceNotes: "Uses product_id keys.",
      concepts: ["INNER JOIN", "computed columns"],
      companyTags: ["Flipkart"],
    },
    {
      id: "m16-p3",
      moduleId: 16,
      difficulty: "Hard",
      title: "Top revenue generating customers by product category",
      businessScenario:
        "Loyalty audit: find total electronics spending by customer.",
      prompt:
        "Find total spend (quantity * unit_price) on 'Electronics' products for each " +
        "customer. Return customer_id, full_name, and total_electronics_spend. Include " +
        "only delivered orders (status = 'Delivered'). Order by total_electronics_spend DESC.",
      starterQuery:
        "SELECT c.customer_id, c.full_name, p.category, SUM(???) as category_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id JOIN products p ON oi.product_id = p.product_id GROUP BY ??? HAVING SUM(oi.quantity * oi.unit_price) > ??? ORDER BY ??? DESC;",
      solution:
        "SELECT c.customer_id, c.full_name, SUM(oi.quantity * oi.unit_price) AS " +
        "total_electronics_spend FROM customers c INNER JOIN orders o ON c.customer_id = " +
        "o.customer_id INNER JOIN order_items oi ON o.order_id = oi.order_id INNER JOIN " +
        "products p ON oi.product_id = p.product_id WHERE p.category = 'Electronics' AND " +
        "o.status = 'Delivered' GROUP BY c.customer_id, c.full_name ORDER BY " +
        "total_electronics_spend DESC;",
      hints: [
        "Join customers, orders, order_items, and products in sequence.",
        "Apply standard filtering and analytical clauses to isolate the exact target dataset.",
        "Structure your query using clauses similar to: SELECT c.customer_id, c.full_name, SUM(oi.quantity * oi.unit_price) AS.",
      ],
      detailedExplanation: "A 4-table inner join aggregating line item totals.",
      alternativeApproach: "None.",
      performanceNotes: "Requires primary key/foreign key indexes.",
      concepts: ["INNER JOIN", "multi-table join", "GROUP BY", "SUM"],
      companyTags: ["Flipkart"],
    },
  ],

  // MODULE 17: Left Joins
  17: [
    {
      id: "m17-p1",
      moduleId: 17,
      difficulty: "Easy",
      title: "All customers, with their order count",
      businessScenario:
        "Count orders per customer, including those with zero orders.",
      prompt:
        "Write a query to retrieve customer_id, full_name, and order_count " +
        "(COUNT(o.order_id)) by LEFT JOINing customers with orders.",
      starterQuery: "SELECT ??? FROM customers;",
      solution:
        "SELECT c.customer_id, c.full_name, COUNT(o.order_id) AS order_count FROM " +
        "customers c LEFT JOIN orders o ON c.customer_id = o.customer_id GROUP BY " +
        "c.customer_id, c.full_name;",
      hints: [
        "Use LEFT JOIN, group by customer, and count o.order_id (not COUNT(*)).",
        "Apply standard filtering and analytical clauses to isolate the exact target dataset.",
        "Structure your query using clauses similar to: SELECT c.customer_id, c.full_name, COUNT(o.order_id) AS order_count FROM.",
      ],
      detailedExplanation:
        "LEFT JOIN retains all left rows. COUNT(o.order_id) ignores NULLs, returning 0 " +
        "for orderless customers.",
      alternativeApproach: "None.",
      performanceNotes: "Fast scan grouping.",
      concepts: ["LEFT JOIN", "COUNT"],
      companyTags: ["Flipkart"],
    },
    {
      id: "m17-p2",
      moduleId: 17,
      difficulty: "Medium",
      title: "Anti-join: customers who never placed a delivered order",
      businessScenario: "Marketing wants to find inactive signups.",
      prompt:
        "Find customer_id and full_name of customers who have never placed a 'Delivered' order.",
      starterQuery: "SELECT ???\nFROM ???\nJOIN ??? ON ???\nWHERE ???;",
      solution:
        "SELECT c.customer_id, c.full_name FROM customers c LEFT JOIN orders o ON " +
        "c.customer_id = o.customer_id AND o.status = 'Delivered' WHERE o.order_id IS " +
        "NULL ORDER BY c.customer_id ASC;",
      hints: [
        "Filter LEFT JOIN matches using AND o.status =",
        "in the ON clause, check IS NULL in WHERE.",
        "Structure your query using clauses similar to: SELECT c.customer_id, c.full_name FROM customers c LEFT JOIN orders o ON.",
      ],
      detailedExplanation: "Left joins with NULL filters act as an anti-join.",
      alternativeApproach: "Use NOT IN or NOT EXISTS.",
      performanceNotes: "Optimized index scan.",
      concepts: ["LEFT JOIN", "anti-join", "IS NULL"],
      companyTags: ["Flipkart"],
    },
    {
      id: "m17-p3",
      moduleId: 17,
      difficulty: "Hard",
      title: "High-Value Churned Buyers Analysis",
      businessScenario:
        "Swiggy's growth team needs to identify Premium segment customers who signed up in 2023 but have zero order activity in 2024 to trigger re-engagement campaigns.",
      prompt:
        "Write a query to retrieve customer_id, full_name, city, and segment from customers where segment = 'Premium' and signup_date < '2024-01-01' and customer_id NOT IN (SELECT customer_id FROM orders WHERE order_date >= '2024-01-01'). Order by customer_id ASC.",
      starterQuery:
        "SELECT c.customer_id, c.full_name, SUM(???) as total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id WHERE c.customer_id NOT IN (SELECT ??? FROM subscriptions) GROUP BY ??? HAVING SUM(o.total_amount) > ???;",
      solution:
        "SELECT c.customer_id, c.full_name, c.city, c.segment FROM customers c WHERE c.segment = 'Premium' AND c.signup_date < '2024-01-01' AND c.customer_id NOT IN (SELECT customer_id FROM orders WHERE order_date >= '2024-01-01') ORDER BY c.customer_id ASC;",
      hints: [
        "Select customer details for Premium customers signed up before 2024.",
        "Filter customer_id NOT IN (SELECT customer_id FROM orders WHERE order_date >= '2024-01-01').",
        "Structure your query: SELECT c.customer_id, c.full_name, c.city, c.segment FROM customers c WHERE c.segment = 'Premium' AND c.signup_date < '2024-01-01' AND c.customer_id NOT IN (SELECT customer_id FROM orders WHERE order_date >= '2024-01-01') ORDER BY c.customer_id ASC;",
      ],
      detailedExplanation:
        "Isolates inactive high-value historical customers using uncorrelated NOT IN subqueries.",
      alternativeApproach: "Use LEFT JOIN with NULL check on 2024 orders.",
      performanceNotes: "Subquery on indexed customer_id.",
      concepts: ["NOT IN", "subqueries", "segmentation"],
      companyTags: ["Swiggy"],
    },
    {
      id: "m17-p4",
      moduleId: 17,
      difficulty: "Hard",
      title: "Year-over-Year Inactive Buyers",
      businessScenario:
        "The marketing team wants a target list: find customers who purchased something " +
        "in 2023, but have placed zero orders in 2024. This indicates churn.",
      prompt:
        "Write a query using LEFT JOIN to find all customers who placed an order in 2023 " +
        "(order_date between '2023-01-01' and '2023-12-31') but have placed NO orders in " +
        "2024 (order_date between '2024-01-01' and '2024-12-31'). Return customer_id, " +
        "full_name, and segment. Order by customer_id.",
      starterQuery:
        "SELECT DISTINCT c.customer_id, c.full_name, c.segment FROM customers c INNER JOIN orders o23 ON c.customer_id = o23.customer_id AND o23.order_date BETWEEN '???' AND '???' LEFT JOIN orders o24 ON c.customer_id = o24.customer_id AND o24.order_date BETWEEN '???' AND '???' WHERE o24.order_id IS ??? ORDER BY c.customer_id;",
      solution:
        "SELECT DISTINCT c.customer_id, c.full_name, c.segment FROM customers c INNER " +
        "JOIN orders o23 ON c.customer_id = o23.customer_id AND o23.order_date BETWEEN " +
        "'2023-01-01' AND '2023-12-31' LEFT JOIN orders o24 ON c.customer_id = " +
        "o24.customer_id AND o24.order_date BETWEEN '2024-01-01' AND '2024-12-31' WHERE " +
        "o24.order_id IS NULL ORDER BY c.customer_id;",
      hints: [
        "First, join customers with orders for 2023 orders (use INNER JOIN or LEFT JOIN).",
        "Second, LEFT JOIN with orders again for 2024 orders (alias o24).",
        "Third, filter where o24.order_id IS NULL in the WHERE clause.",
      ],
      detailedExplanation:
        "This demonstrates how to use multiple joins on the same table (orders) with " +
        "different filtering conditions in the ON clause to perform cohort exclusion.",
      alternativeApproach: "Using subqueries with NOT IN or EXISTS.",
      performanceNotes:
        "Joining with filtered date ranges in ON clauses is highly performant.",
      concepts: ["LEFT JOIN", "anti-join", "date filtering", "cohort analysis"],
      companyTags: ["Myntra", "Flipkart"],
    },
  ],

  // MODULE 18: Right Joins
  18: [
    {
      id: "m18-p1",
      moduleId: 18,
      difficulty: "Easy",
      title: "Order and Customer Pairing",
      businessScenario:
        "Audit customer details associated with orders using a RIGHT JOIN perspective.",
      prompt:
        "Pair all orders with customer details. In MySQL (which doesn't support RIGHT " +
        "JOIN natively), simulate it by writing a LEFT JOIN with the tables reversed: " +
        "customers LEFT JOIN orders.",
      starterQuery:
        "SELECT o.order_id, c.full_name FROM customers c LEFT JOIN orders o ON c.customer_id = ???;",
      solution:
        "SELECT o.order_id, c.full_name FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id;",
      hints: [
        "Reverse tables: SELECT order_id, full_name FROM customers LEFT JOIN orders ON",
        "customers.customer_id = orders.customer_id.",
        "Structure your query using clauses similar to: SELECT o.order_id, c.full_name FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id;.",
      ],
      detailedExplanation:
        "Simulates RIGHT JOIN by swapping left and right operands.",
      alternativeApproach: "None.",
      performanceNotes: "Equivalent to LEFT JOIN performance.",
      concepts: ["RIGHT JOIN simulation", "LEFT JOIN"],
      companyTags: ["Ola"],
    },
    {
      id: "m18-p2",
      moduleId: 18,
      difficulty: "Medium",
      title: "Unsold Inventory",
      businessScenario: "Identify products that have never been ordered.",
      prompt:
        "Write a query to find products that have never been ordered. Simulate a RIGHT " +
        "JOIN by starting with the products table on the right side of a LEFT JOIN (or " +
        "LEFT JOIN order_items onto products). Return product_id and product_name.",
      starterQuery:
        "SELECT p.product_id, p.product_name FROM products p LEFT JOIN order_items oi ON p.product_id = ??? WHERE oi.order_item_id IS ???;",
      solution:
        "SELECT p.product_id, p.product_name FROM products p LEFT JOIN order_items oi ON " +
        "p.product_id = oi.product_id WHERE oi.order_item_id IS NULL;",
      hints: [
        "Write: SELECT ... FROM products LEFT JOIN order_items ON ... WHERE order_item_id IS NULL.",
        "Connect the primary table with related foreign key tables using INNER JOIN or LEFT JOIN.",
        "Structure your query using clauses similar to: SELECT p.product_id, p.product_name FROM products p LEFT JOIN order_items oi ON.",
      ],
      detailedExplanation: "Finds products missing corresponding order items.",
      alternativeApproach: "None.",
      performanceNotes: "Fast anti-join.",
      concepts: ["LEFT JOIN", "anti-join", "RIGHT JOIN simulation"],
      companyTags: ["Croma"],
    },
    {
      id: "m18-p3",
      moduleId: 18,
      difficulty: "Hard",
      title: "Missing Payments",
      businessScenario:
        "Reconcile orders and payments to identify unpaid delivered orders.",
      prompt:
        "Find all delivered orders (status = 'Delivered') that have no corresponding payment record. " +
        "Return order_id, order_date, and total_amount. Order by order_id ASC.",
      starterQuery:
        "SELECT o.order_id, o.total_amount, o.order_date FROM orders o LEFT JOIN payments p ON o.order_id = ??? WHERE p.payment_id IS ???;",
      solution:
        "SELECT o.order_id, o.order_date, o.total_amount FROM orders o LEFT JOIN " +
        "payments p ON o.order_id = p.order_id WHERE o.status = 'Delivered' AND " +
        "p.payment_id IS NULL;",
      hints: [
        "LEFT JOIN payments onto orders, filter where payment_id IS NULL and status =",
        ".",
        "Structure your query using clauses similar to: SELECT o.order_id, o.order_date, o.total_amount FROM orders o LEFT JOIN.",
      ],
      detailedExplanation: "Audit reconciliation query using left anti-join.",
      alternativeApproach: "None.",
      performanceNotes: "Uses order_id primary/foreign keys.",
      concepts: ["LEFT JOIN", "anti-join", "RIGHT JOIN simulation"],
      companyTags: ["Paytm"],
    },
  ],

  // MODULE 19: Full Joins
  19: [
    {
      id: "m19-p1",
      moduleId: 19,
      difficulty: "Easy",
      title: "All Users and Subs",
      businessScenario: "Combine customer and subscription logs completely.",
      prompt:
        "Write a query to fully combine all customer records and subscription records on customer_id, " +
        "retaining unmatched records from both tables. Return customer_id (as c_id) and subscription_id. " +
        "Order by c_id ASC.",
      starterQuery:
        "SELECT ???\nFROM ???;" +
        "subscriptions s ON c.customer_id = s.customer_id UNION SELECT s.customer_id AS " +
        "c_id, s.subscription_id FROM subscriptions s LEFT JOIN customers c ON " +
        "s.customer_id = c.customer_id WHERE ???",
      solution:
        "SELECT c.customer_id AS c_id, s.subscription_id FROM customers c LEFT JOIN " +
        "subscriptions s ON c.customer_id = s.customer_id UNION SELECT s.customer_id AS " +
        "c_id, s.subscription_id FROM subscriptions s LEFT JOIN customers c ON " +
        "s.customer_id = c.customer_id WHERE c.customer_id IS NULL;",
      hints: [
        "UNION removes duplicates. The second query isolates right-only records.",
        "Connect the primary table with related foreign key tables using INNER JOIN or LEFT JOIN.",
        "Structure your query using clauses similar to: SELECT c.customer_id AS c_id, s.subscription_id FROM customers c LEFT JOIN.",
      ],
      detailedExplanation:
        "Simulates FULL OUTER JOIN in MySQL using UNION of left and right exclusion queries.",
      alternativeApproach: "None.",
      performanceNotes: "Requires sorting for UNION deduplication.",
      concepts: ["FULL JOIN simulation", "UNION", "LEFT JOIN"],
      companyTags: ["Hotstar"],
    },
    {
      id: "m19-p2",
      moduleId: 19,
      difficulty: "Medium",
      title: "Segment Isolation",
      businessScenario: "Reconcile customer segments and subscriptions.",
      prompt:
        "Write a query to combine all customer segments and subscription plan names, " +
        "retaining unmatched entries from both datasets. Return distinct segment and plan_name.",
      starterQuery: "SELECT ???\nFROM ???\nJOIN ??? ON ???\nWHERE ???;",
      solution:
        "SELECT DISTINCT c.segment, s.plan_name FROM customers c LEFT JOIN subscriptions " +
        "s ON c.customer_id = s.customer_id UNION SELECT DISTINCT c.segment, s.plan_name " +
        "FROM subscriptions s LEFT JOIN customers c ON s.customer_id = c.customer_id;",
      hints: [
        "UNION combines left and right queries.",
        "Connect the primary table with related foreign key tables using INNER JOIN or LEFT JOIN.",
        "Structure your query using clauses similar to: SELECT DISTINCT c.segment, s.plan_name FROM customers c LEFT JOIN subscriptions.",
      ],
      detailedExplanation:
        "Evaluates connections between buyer segment attributes and subscription plans.",
      alternativeApproach: "None.",
      performanceNotes: "De-duplicates results.",
      concepts: ["FULL JOIN simulation", "UNION"],
      companyTags: ["Hotstar"],
    },
    {
      id: "m19-p3",
      moduleId: 19,
      difficulty: "Hard",
      title: "Order & Payment Ledger",
      businessScenario: "Reconcile orders and payments ledger completely.",
      prompt:
        "Reconcile all orders and payments. Return order_id (from orders), payment_id, " +
        "total_amount, and amount (from payments). Use FULL JOIN simulation. Order by " +
        "order_id ASC.",
      starterQuery:
        "SELECT o.order_id, o.total_amount, COALESCE(???, 0) as paid_amount, o.total_amount - COALESCE(???, 0) as outstanding FROM orders o LEFT JOIN payments p ON o.order_id = ???;",
      solution:
        "SELECT o.order_id, p.payment_id, o.total_amount, p.amount FROM orders o LEFT " +
        "JOIN payments p ON o.order_id = p.order_id UNION SELECT p.order_id, " +
        "p.payment_id, o.total_amount, p.amount FROM payments p LEFT JOIN orders o ON " +
        "p.order_id = o.order_id WHERE o.order_id IS NULL ORDER BY 1;",
      hints: [
        "Write left join, then UNION, then right join with WHERE left key IS NULL.",
        "Apply standard filtering and analytical clauses to isolate the exact target dataset.",
        "Structure your query using clauses similar to: SELECT o.order_id, p.payment_id, o.total_amount, p.amount FROM orders o LEFT.",
      ],
      detailedExplanation:
        "Audit Ledger compilation using FULL JOIN simulation.",
      alternativeApproach: "None.",
      performanceNotes: "Requires sorting for UNION.",
      concepts: ["FULL JOIN simulation", "UNION", "anti-join"],
      companyTags: ["Paytm"],
    },
  ],

  // MODULE 20: Self Joins
  20: [
    {
      id: "m20-p1",
      moduleId: 20,
      difficulty: "Easy",
      title: "Employees and Managers",
      businessScenario: "Corporate chart review.",
      prompt:
        "Write a query to list all employee names along with their manager's name. Join " +
        "the employees table to itself. Return employee_name and manager_name.",
      starterQuery:
        "SELECT\n  e.employee_name AS employee_name,\n  m.employee_name AS manager_name\nFROM employees e\nINNER JOIN employees m ON e.manager_id = ???;",
      solution:
        "SELECT e.employee_name AS employee_name, m.employee_name AS manager_name FROM " +
        "employees e INNER JOIN employees m ON e.manager_id = m.employee_id;",
      hints: [
        "Join employees aliased as e (employee) and m (manager) on e.manager_id = m.employee_id.",
        "Apply standard filtering and analytical clauses to isolate the exact target dataset.",
        "Structure your query using clauses similar to: SELECT e.employee_name AS employee_name, m.employee_name AS manager_name FROM.",
      ],
      detailedExplanation: "Self join associates rows within the same table.",
      alternativeApproach: "None.",
      performanceNotes: "Fast pk-fk join.",
      concepts: ["SELF JOIN"],
      companyTags: ["Ola"],
    },
    {
      id: "m20-p2",
      moduleId: 20,
      difficulty: "Medium",
      title: "Earning More Than Managers",
      businessScenario: "Audit salary hierarchies.",
      prompt:
        "Find employees who earn more than their manager. Return employee_name, " +
        "employee_salary, manager_name, and manager_salary.",
      starterQuery:
        "SELECT\n  e.employee_name AS employee_name,\n  e.salary_lpa AS " +
        "employee_salary,\n  m.employee_name AS manager_name,\n  m.salary_lpa AS " +
        "manager_salary\nFROM employees e\nINNER JOIN employees m ON e.manager_id = " +
        "m.employee_id\nWHERE e.salary_lpa > ???;",
      solution:
        "SELECT e.employee_name AS employee_name, e.salary_lpa AS employee_salary, " +
        "m.employee_name AS manager_name, m.salary_lpa AS manager_salary FROM employees e " +
        "INNER JOIN employees m ON e.manager_id = m.employee_id WHERE e.salary_lpa > " +
        "m.salary_lpa;",
      hints: [
        "Add a WHERE clause comparing e.salary_lpa > m.salary_lpa.",
        "Apply standard filtering and analytical clauses to isolate the exact target dataset.",
        "Structure your query using clauses similar to: SELECT e.employee_name AS employee_name, e.salary_lpa AS employee_salary,.",
      ],
      detailedExplanation: "SELF JOIN with a value filter.",
      alternativeApproach: "None.",
      performanceNotes: "Sort compares local records.",
      concepts: ["SELF JOIN", "WHERE"],
      companyTags: ["Ola"],
    },
    {
      id: "m20-p3",
      moduleId: 20,
      difficulty: "Hard",
      title: "Cities with multiple same-segment customers — spend comparison",
      businessScenario:
        "The marketing team at Ola wants to target cities that have at least 2 Premium " +
        "customers, and for those cities, wants to compare premium customer pairs by " +
        "total lifetime spend to identify the top buyer in each pairing.",
      prompt:
        "Write a query using a SELF JOIN on customers where both customers are 'Premium' " +
        "segment and share the same city (c1.customer_id < c2.customer_id to avoid " +
        "duplicates). JOIN both aliases to the orders table to compute each customer's " +
        "total spend. Return c1.full_name as customer1, c2.full_name as customer2, the " +
        "city, c1_total_spend (rounded SUM of c1's orders), and c2_total_spend (rounded " +
        "SUM of c2's orders). Order by city, c1_total_spend descending.",
      starterQuery:
        "SELECT c1.full_name AS customer1, c2.full_name AS customer2, c1.city, ROUND(SUM(o1.total_amount), 2) AS c1_total_spend, ROUND(SUM(o2.total_amount), 2) AS c2_total_spend FROM customers c1 INNER JOIN customers c2 ON c1.city = ??? AND c1.segment = ??? AND c2.segment = ??? AND c1.customer_id < ??? LEFT JOIN orders o1 ON o1.customer_id = c1.customer_id LEFT JOIN orders o2 ON o2.customer_id = c2.customer_id GROUP BY ???, ???, ??? ORDER BY c1.city ASC, c1_total_spend DESC;",
      solution:
        "SELECT c1.full_name AS customer1, c2.full_name AS customer2, c1.city, " +
        "ROUND(SUM(o1.total_amount), 2) AS c1_total_spend, ROUND(SUM(o2.total_amount), 2) " +
        "AS c2_total_spend FROM customers c1 INNER JOIN customers c2 ON c1.city = c2.city " +
        "AND c1.segment = 'Premium' AND c2.segment = 'Premium' AND c1.customer_id < " +
        "c2.customer_id LEFT JOIN orders o1 ON o1.customer_id = c1.customer_id LEFT JOIN " +
        "orders o2 ON o2.customer_id = c2.customer_id GROUP BY c1.customer_id, " +
        "c2.customer_id, c1.city ORDER BY c1.city ASC, c1_total_spend DESC;",
      hints: [
        "Perform a SELF JOIN on customers for Premium customers sharing a city with c1.customer_id < c2.customer_id.",
        "LEFT JOIN orders to compute rounded SUM spend for customer 1 and customer 2.",
        "Structure your query: SELECT c1.full_name AS customer1, c2.full_name AS customer2, c1.city, ROUND(SUM(o1.total_amount), 2) AS c1_total_spend, ROUND(SUM(o2.total_amount), 2) AS c2_total_spend FROM customers c1 INNER JOIN customers c2 ON c1.city = c2.city AND c1.segment = 'Premium' AND c2.segment = 'Premium' AND c1.customer_id < c2.customer_id LEFT JOIN orders o1 ON o1.customer_id = c1.customer_id LEFT JOIN orders o2 ON o2.customer_id = c2.customer_id GROUP BY c1.customer_id, c2.customer_id, c1.city ORDER BY c1.city ASC, c1_total_spend DESC;",
      ],
      detailedExplanation:
        "This problem combines SELF JOIN (Module 20's core concept) with multi-table " +
        "LEFT JOINs, GROUP BY, SUM, ROUND, and ORDER BY — the full multi-concept " +
        "composition expected at Hard difficulty. The inequality c1.customer_id < " +
        "c2.customer_id eliminates both self-pairs and symmetric duplicates.",
      alternativeApproach:
        "Could pre-aggregate spend per customer in a CTE, then do the self-join on the " +
        "CTE to simplify the GROUP BY.",
      performanceNotes:
        "SELF JOIN is O(n²) on customers; filtering to 'Premium' segment first reduces " +
        "the working set significantly.",
      concepts: [
        "SELF JOIN",
        "multi-table JOIN",
        "GROUP BY",
        "SUM",
        "ROUND",
        "ORDER BY",
        "segment filter",
      ],
      companyTags: ["Ola"],
    },
  ],

  // MODULE 21: Subqueries in WHERE
  21: [
    {
      id: "m21-p1",
      moduleId: 21,
      difficulty: "Easy",
      title: "Orders above the overall average",
      businessScenario: "Identify high-value orders.",
      prompt:
        "Write a query to find all orders with a total_amount strictly greater than the " +
        "overall average total_amount. Return order_id and total_amount. Sort desc.",
      starterQuery:
        "SELECT order_id, total_amount FROM orders WHERE ???" +
        "AVG(total_amount) FROM orders) ORDER BY ???;",
      solution:
        "SELECT order_id, total_amount FROM orders WHERE total_amount > (SELECT " +
        "AVG(total_amount) FROM orders) ORDER BY total_amount DESC;",
      hints: [
        "Compute average in subquery inside WHERE clause.",
        "Filter your result set using WHERE conditions to isolate the target criteria.",
        "Structure your query using clauses similar to: SELECT order_id, total_amount FROM orders WHERE total_amount > (SELECT.",
      ],
      detailedExplanation: "Uncorrelated subquery evaluated once.",
      alternativeApproach: "None.",
      performanceNotes: "Highly performant.",
      concepts: ["subquery", "WHERE"],
      companyTags: ["Zomato"],
    },
    {
      id: "m21-p2",
      moduleId: 21,
      difficulty: "Medium",
      title: "Customers with above-average total spend",
      businessScenario: "Target premium loyalty tier candidates.",
      prompt:
        "Find customer_id and total_spent. Group by customer, return only those whose " +
        "total sum of total_amount exceeds the average customer lifetime spend.",
      starterQuery:
        "SELECT customer_id, SUM(total_amount) AS total_spent\nFROM orders\nGROUP BY customer_id\nHAVING SUM(total_amount) > (\n  SELECT AVG(???)\n  FROM (SELECT SUM(total_amount) AS customer_spent FROM orders GROUP BY customer_id)\n);",
      solution:
        "SELECT customer_id, SUM(total_amount) AS total_spent FROM orders GROUP BY " +
        "customer_id HAVING SUM(total_amount) > (SELECT AVG(customer_spent) FROM (SELECT " +
        "SUM(total_amount) AS customer_spent FROM orders GROUP BY customer_id));",
      hints: [
        "Use HAVING with subquery computing average customer spend.",
        "Group your output rows using GROUP BY and apply aggregate functions like COUNT(), SUM(), or AVG().",
        "Structure your query using clauses similar to: SELECT customer_id, SUM(total_amount) AS total_spent FROM orders GROUP BY.",
      ],
      detailedExplanation:
        "Filters groups using a nested scalar aggregate subquery.",
      alternativeApproach: "None.",
      performanceNotes: "Requires aggregating orders.",
      concepts: ["subquery", "HAVING", "GROUP BY"],
      companyTags: ["Zomato"],
    },
    {
      id: "m21-p3",
      moduleId: 21,
      difficulty: "Hard",
      title: "Products priced above Electronics category average",
      businessScenario:
        "The catalog team wants to benchmark premium catalog items against the average list price of the Electronics department.",
      prompt:
        "Write a query to retrieve product_id, product_name, category, and list_price from the products table for all products whose list_price is strictly greater than the average list_price of products in the 'Electronics' category. Order by list_price descending, product_id ascending.",
      starterQuery:
        "SELECT product_id, product_name, category, list_price\nFROM products\nWHERE list_price > (SELECT AVG(list_price) FROM products WHERE category = '???')\nORDER BY list_price DESC, product_id ASC;",
      solution:
        "SELECT product_id, product_name, category, list_price FROM products WHERE list_price > (SELECT AVG(list_price) FROM products WHERE category = 'Electronics') ORDER BY list_price DESC, product_id ASC;",
      hints: [
        "Construct a scalar subquery to compute average price: SELECT AVG(list_price) FROM products WHERE category = 'Electronics'.",
        "Use that subquery in the main WHERE clause: WHERE list_price > (subquery).",
        "Structure your query: SELECT product_id, product_name, category, list_price FROM products WHERE list_price > (SELECT AVG(list_price) FROM products WHERE category = 'Electronics') ORDER BY list_price DESC, product_id ASC;",
      ],
      detailedExplanation:
        "Executes a scalar subquery to compute the benchmark average price of Electronics items, then compares every product's list price against that single benchmark value.",
      alternativeApproach: "None.",
      performanceNotes: "Executes category average scalar subquery once.",
      concepts: ["subquery", "AVG", "WHERE"],
      companyTags: ["Croma"],
    },
  ],

  // MODULE 22: Correlated Subqueries
  22: [
    {
      id: "m22-p1",
      moduleId: 22,
      difficulty: "Easy",
      title: "Above Channel Average",
      businessScenario: "Check transaction deviations.",
      prompt:
        "Find orders exceeding their booking channel's average total_amount. Return " +
        "order_id, channel, and total_amount.",
      starterQuery:
        "SELECT order_id, channel, total_amount\nFROM orders o\nWHERE total_amount > (\n  SELECT AVG(total_amount) FROM orders WHERE channel = ???\n);",
      solution:
        "SELECT o1.order_id, o1.channel, o1.total_amount FROM orders o1 WHERE " +
        "o1.total_amount > (SELECT AVG(o2.total_amount) FROM orders o2 WHERE o2.channel = " +
        "o1.channel);",
      hints: [
        "Inside the subquery, link o2.channel = o1.channel.",
        "Filter your result set using WHERE conditions to isolate the target criteria.",
        "Structure your query using clauses similar to: SELECT o1.order_id, o1.channel, o1.total_amount FROM orders o1 WHERE.",
      ],
      detailedExplanation: "Correlated subquery runs once per outer order row.",
      alternativeApproach: "JOIN with grouped channel averages CTE.",
      performanceNotes: "Runs N times; slower than CTE JOIN on large tables.",
      concepts: ["correlated subquery", "AVG"],
      companyTags: ["Zomato"],
    },
    {
      id: "m22-p2",
      moduleId: 22,
      difficulty: "Medium",
      title: "Above-average department salaries",
      businessScenario:
        "The corporate finance team is conducting a compensation parity review to " +
        "identify employees who are paid significantly more than their immediate peers. " +
        "Your task is to query the employee records to find individuals whose current " +
        "salary exceeds the average salary of their respective department.",
      prompt:
        "Find employees who earn more than their department's average salary. Return " +
        "name (employee's name), dept_name (department name), and salary.",
      starterQuery:
        "SELECT e1.employee_name AS name, d1.department_name AS dept_name, e1.salary_lpa AS salary\nFROM employees e1\nJOIN departments d1 ON e1.department_id = d1.department_id\nWHERE e1.salary_lpa > (\n  SELECT AVG(e2.salary_lpa) FROM employees e2 WHERE e2.department_id = ???\n);",
      solution:
        "SELECT e1.employee_name AS name, d1.department_name AS dept_name, e1.salary_lpa " +
        "AS salary FROM employees e1 JOIN departments d1 ON e1.department_id = " +
        "d1.department_id WHERE e1.salary_lpa > (SELECT AVG(e2.salary_lpa) FROM employees " +
        "e2 WHERE e2.department_id = e1.department_id);",
      hints: [
        "Correlate on department_id inside the subquery.",
        "Apply standard filtering and analytical clauses to isolate the exact target dataset.",
        "Structure your query using clauses similar to: SELECT e1.employee_name AS name, d1.department_name AS dept_name, e1.salary_lpa.",
      ],
      detailedExplanation: "Compares employee to their department peers.",
      alternativeApproach: "None.",
      performanceNotes: "Fast on indexed tables.",
      concepts: ["correlated subquery"],
      companyTags: ["Ola"],
    },
    {
      id: "m22-p3",
      moduleId: 22,
      difficulty: "Hard",
      title: "Slow city deliveries",
      businessScenario:
        "Operations wants food orders with above-average delivery times for their city.",
      prompt:
        "Find food orders that have a delivery time strictly greater than the average " +
        "delivery time of their own city. Return food_order_id, restaurant, city, and " +
        "delivery_minutes.",
      starterQuery:
        "SELECT f1.food_order_id, f1.restaurant, f1.city, f1.delivery_minutes\nFROM food_orders f1\nWHERE f1.delivery_minutes > (\n  SELECT AVG(f2.delivery_minutes) FROM food_orders f2 WHERE f2.city = ???\n);",
      solution:
        "SELECT f1.food_order_id, f1.restaurant, f1.city, f1.delivery_minutes FROM " +
        "food_orders f1 WHERE f1.delivery_minutes > (SELECT AVG(f2.delivery_minutes) FROM " +
        "food_orders f2 WHERE f2.city = f1.city);",
      hints: [
        "Correlate subquery on f2.city = f1.city.",
        "Apply standard filtering and analytical clauses to isolate the exact target dataset.",
        "Structure your query using clauses similar to: SELECT f1.food_order_id, f1.restaurant, f1.city, f1.delivery_minutes FROM.",
      ],
      detailedExplanation: "Compares delivery speed with city baseline.",
      alternativeApproach: "JOIN with city aggregates.",
      performanceNotes: "Highly CPU bound.",
      concepts: ["correlated subquery", "AVG"],
      companyTags: ["Zomato"],
    },
  ],

  // MODULE 23: Subqueries in FROM (Derived Tables)
  23: [
    {
      id: "m23-p1",
      moduleId: 23,
      difficulty: "Easy",
      title: "Average of customer order counts derived table",
      businessScenario:
        "Operational benchmark: how many orders does a customer place on average?",
      prompt:
        "Write a query to calculate the average number of orders placed by customers. " +
        "First, write a subquery in FROM that counts orders grouped by customer_id. Then, " +
        "in the outer query, calculate the average of those counts. Alias the result as " +
        "avg_orders_per_customer.",
      starterQuery:
        "SELECT AVG(order_count) AS avg_orders_per_customer\nFROM (\n  SELECT customer_id, COUNT(*) AS order_count FROM orders GROUP BY ???\n) AS customer_orders;",
      solution:
        "SELECT AVG(order_count) AS avg_orders_per_customer FROM (SELECT customer_id, " +
        "COUNT(*) AS order_count FROM orders GROUP BY customer_id);",
      hints: [
        "Wrap the GROUP BY query inside parentheses in FROM clause.",
        "Apply standard filtering and analytical clauses to isolate the exact target dataset.",
        "Structure your query using clauses similar to: SELECT AVG(order_count) AS avg_orders_per_customer FROM (SELECT customer_id,.",
      ],
      detailedExplanation: "Derived table is evaluated first, then aggregated.",
      alternativeApproach: "CTE.",
      performanceNotes: "Extremely performant.",
      concepts: ["derived table", "AVG", "GROUP BY"],
      companyTags: ["Flipkart"],
    },
    {
      id: "m23-p2",
      moduleId: 23,
      difficulty: "Medium",
      title: "Max of average city transaction amounts",
      businessScenario: "Identify spending peaks across regions.",
      prompt:
        "Write a query to find the highest average order total amount across all cities. " +
        "Use a derived table that calculates average total_amount grouped by customer " +
        "city (joining orders and customers). Then, select the maximum average value as " +
        "max_city_average.",
      starterQuery:
        "SELECT MAX(avg_txn) AS max_city_avg\nFROM (\n  SELECT city, AVG(total_amount) AS avg_txn FROM orders o JOIN customers c ON o.customer_id = c.customer_id GROUP BY ???\n) AS city_averages;",
      solution:
        "SELECT MAX(avg_amount) AS max_city_average FROM (SELECT c.city, " +
        "AVG(o.total_amount) AS avg_amount FROM orders o INNER JOIN customers c ON " +
        "o.customer_id = c.customer_id GROUP BY c.city);",
      hints: [
        "The subquery joins tables, groups by city, and aggregates AVG(total_amount).",
        "Apply standard filtering and analytical clauses to isolate the exact target dataset.",
        "Structure your query using clauses similar to: SELECT MAX(avg_amount) AS max_city_average FROM (SELECT c.city,.",
      ],
      detailedExplanation:
        "Computes intermediate averages before finding the global peak.",
      alternativeApproach: "None.",
      performanceNotes: "Scans and groups orders.",
      concepts: ["derived table", "MAX", "INNER JOIN"],
      companyTags: ["Swiggy"],
    },
    {
      id: "m23-p3",
      moduleId: 23,
      difficulty: "Hard",
      title: "Active month counts per plan derived table",
      businessScenario: "Audits subscription plan retention peaks.",
      prompt:
        "Find the maximum active months duration recorded for subscriptions in each plan " +
        "category, using a derived table that calculates active months (in MySQL: " +
        "DATEDIFF(end_date, start_date)/30.0). Return plan_name and " +
        "max_duration (rounded to 1 decimal place). If end_date is NULL, assume a default " +
        "duration of 12.0.",
      starterQuery:
        "SELECT plan_name, MAX(active_months) AS max_duration\nFROM (\n  SELECT plan_name, ROUND(COALESCE(DATEDIFF(end_date, start_date)/30.0, 12.0), 1) AS active_months FROM subscriptions\n) AS plan_durations\nGROUP BY ???;",
      solution:
        "SELECT plan_name, MAX(active_months) AS max_duration FROM (SELECT plan_name, " +
        "ROUND(COALESCE(DATEDIFF(end_date, start_date)/30.0, 12.0), 1) AS " +
        "active_months FROM subscriptions) GROUP BY plan_name;",
      hints: [
        "Calculate months inside derived table, then aggregate in outer query.",
        "Apply standard filtering and analytical clauses to isolate the exact target dataset.",
        "Structure your query using clauses similar to: SELECT plan_name, MAX(active_months) AS max_duration FROM (SELECT plan_name,.",
      ],
      detailedExplanation:
        "Combines derived tables with advanced NULL coalescing and date arithmetic.",
      alternativeApproach: "None.",
      performanceNotes: "Performs calculations on small dimensions.",
      concepts: ["derived table", "MAX", "COALESCE", "DATEDIFF"],
      companyTags: ["Hotstar"],
    },
  ],

  // MODULE 24: Common Table Expressions (CTEs)
  24: [
    {
      id: "m24-p1",
      moduleId: 24,
      difficulty: "Easy",
      title: "Clean customer records via CTE",
      businessScenario: "Re-usable query pipelines.",
      prompt:
        "Write a query using a Common Table Expression (CTE) named customer_summary to " +
        "retrieve all columns from customers. Select all columns from the CTE where the " +
        "city is 'Bengaluru'.",
      starterQuery:
        "WITH customer_summary AS (\n  SELECT * FROM customers\n)\nSELECT * FROM customer_summary WHERE ??? = '???';",
      solution:
        "WITH customer_summary AS (SELECT * FROM customers) SELECT * FROM " +
        "customer_summary WHERE city = 'Bengaluru';",
      hints: [
        "Use WITH customer_summary AS (...) syntax.",
        "Apply standard filtering and analytical clauses to isolate the exact target dataset.",
        "Structure your query using clauses similar to: WITH customer_summary AS (SELECT * FROM customers) SELECT * FROM.",
      ],
      detailedExplanation: "CTE acts as a temporary named result set.",
      alternativeApproach: "Subquery.",
      performanceNotes: "Inlined in query optimizer.",
      concepts: ["CTE", "WITH"],
      companyTags: ["Flipkart"],
    },
    {
      id: "m24-p2",
      moduleId: 24,
      difficulty: "Medium",
      title: "Monthly revenue trend using CTE",
      businessScenario:
        "The leadership team at Flipkart wants to analyze revenue growth over time to " +
        "detect seasonal purchasing patterns. You need to write a query that compiles " +
        "total sales volume into monthly time buckets using a clean Common Table " +
        "Expression (CTE) format.",
      prompt:
        "Create a CTE named monthly_sales that aggregates order total_amount into " +
        "monthly buckets. Select order_month (as YYYY-MM) and total_revenue from the CTE, " +
        "sorted by sales_month ASC.",
      starterQuery:
        "WITH monthly_revenue AS (SELECT SUBSTR(order_date, 1, 7) as month, SUM(???) as revenue FROM orders GROUP BY ???) SELECT month, revenue FROM monthly_revenue WHERE revenue > ???;" +
        "SUM(total_amount) AS revenue\n  FROM orders\n  GROUP BY sales_month\n)\nSELECT " +
        "sales_month, revenue\nFROM monthly_sales\nORDER BY sales_month ASC;",
      solution:
        "WITH monthly_sales AS (SELECT SUBSTR(order_date, 1, 7) AS sales_month, " +
        "SUM(total_amount) AS revenue FROM orders GROUP BY SUBSTR(order_date, 1, 7)) " +
        "SELECT sales_month, revenue FROM monthly_sales ORDER BY sales_month ASC;",
      hints: [
        "Compute SUM grouped by month inside CTE.",
        "Apply standard filtering and analytical clauses to isolate the exact target dataset.",
        "Structure your query using clauses similar to: WITH monthly_sales AS (SELECT SUBSTR(order_date, 1, 7) AS sales_month,.",
      ],
      detailedExplanation: "Averages revenue over structured time buckets.",
      alternativeApproach: "None.",
      performanceNotes: "Fast aggregation.",
      concepts: ["CTE", "GROUP BY", "SUM"],
      companyTags: ["Flipkart"],
    },
    {
      id: "m39-p4",
      moduleId: 39,
      difficulty: "Hard",
      title: "Hierarchical Org Chart via Recursive CTE",
      businessScenario: "Construct hierarchy org tree.",
      prompt:
        "Write a recursive CTE named org_hierarchy that builds the employee hierarchy " +
        "reporting path starting with the top manager (where manager_id IS NULL). For " +
        "each employee, return emp_id, name, manager_id, level (starting at 1), and path " +
        "(concatenated names like 'Priya Menon > ...'). Order by level, path.",
      starterQuery:
        "WITH RECURSIVE org_chart AS (SELECT employee_id, employee_name, manager_id, 1 as level FROM employees WHERE manager_id IS ??? UNION ALL SELECT e.employee_id, e.employee_name, e.manager_id, o.level + 1 FROM employees e JOIN org_chart o ON e.manager_id = ???) SELECT employee_id, employee_name, manager_id, level FROM org_chart ORDER BY level, employee_id;" +
        "emp_id, employee_name AS name, manager_id, 1 AS level, CAST(employee_name AS " +
        "TEXT) AS path\n  FROM employees\n  WHERE manager_id IS NULL\n  UNION ALL\n  -- " +
        "Recursive Member\n  SELECT e.employee_id, e.employee_name, e.manager_id, " +
        "oh.level + 1, CONCAT(oh.path, ' > ', e.employee_name)\n  FROM employees e\n  INNER " +
        "JOIN org_hierarchy oh ON e.manager_id = oh.emp_id\n)\nSELECT emp_id, name, " +
        "manager_id, level, path\nFROM org_hierarchy\nORDER BY level, path;",
      solution:
        "WITH RECURSIVE org_hierarchy AS (SELECT employee_id AS emp_id, employee_name AS " +
        "name, manager_id, 1 AS level, CAST(employee_name AS TEXT) AS path FROM employees " +
        "WHERE manager_id IS NULL UNION ALL SELECT e.employee_id, e.employee_name, " +
        "e.manager_id, oh.level + 1, CONCAT(oh.path, ' > ', e.employee_name) FROM employees e " +
        "INNER JOIN org_hierarchy oh ON e.manager_id = oh.emp_id) SELECT emp_id, name, " +
        "manager_id, level, path FROM org_hierarchy ORDER BY level, path;",
      hints: [
        "Use WITH RECURSIVE org_hierarchy AS (anchor UNION ALL recursive).",
        "Apply standard filtering and analytical clauses to isolate the exact target dataset.",
        "Structure your query using clauses similar to: WITH RECURSIVE org_hierarchy AS (SELECT employee_id AS emp_id, employee_name AS.",
      ],
      detailedExplanation:
        "Recursive CTE matches reports to managers sequentially, building levels.",
      alternativeApproach: "None.",
      performanceNotes: "Runs iteratively until leaf nodes are resolved.",
      concepts: ["recursive CTE", "SELF JOIN", "UNION ALL"],
      companyTags: ["Ola"],
    },
    {
      id: "m24-p4",
      moduleId: 24,
      difficulty: "Hard",
      title: "Category Revenue Contribution via CTE",
      businessScenario:
        "The Chief Merchandising Officer at Flipkart wants to see how much each product " +
        "category contributes to the total revenue of the company. Break this down by " +
        "category and calculate the percentage contribution.",
      prompt:
        "Write a query using CTEs. First, create a CTE that calculates the total revenue " +
        "of the company (all order items quantity * unit_price). Second, create a CTE " +
        "that aggregates revenue by product category. Finally, query these CTEs to return " +
        "category, category_revenue, and contribution_pct (calculated as category_revenue " +
        "divided by total company revenue multiplied by 100). Round contribution_pct to 2 " +
        "decimal places. Sort by contribution_pct descending.",
      starterQuery:
        "WITH total_rev AS (SELECT SUM(???) as overall_revenue FROM order_items), category_rev AS (SELECT p.category, SUM(???) as cat_revenue FROM products p JOIN order_items oi ON p.product_id = oi.product_id GROUP BY ???) SELECT cr.category, cr.cat_revenue, ROUND(cr.cat_revenue * 100.0 / ???, 2) as pct_contribution FROM category_rev cr CROSS JOIN total_rev tr ORDER BY pct_contribution DESC;",
      solution:
        "WITH total_rev AS (SELECT SUM(quantity * unit_price) AS global_total FROM " +
        "order_items), cat_rev AS (SELECT p.category, SUM(oi.quantity * oi.unit_price) AS " +
        "category_revenue FROM order_items oi INNER JOIN products p ON oi.product_id = " +
        "p.product_id GROUP BY p.category) SELECT cr.category, cr.category_revenue, " +
        "ROUND((cr.category_revenue * 100.0) / tr.global_total, 2) AS contribution_pct " +
        "FROM cat_rev cr CROSS JOIN total_rev tr ORDER BY contribution_pct DESC;",
      hints: [
        "Create a single-row CTE for total company revenue.",
        "Create another CTE for product category revenue by joining order_items and products.",
        "Cross join the two CTEs in your final SELECT to calculate the percentage: " +
          "(category_revenue * 100.0) / global_total.",
      ],
      detailedExplanation:
        "This demonstrates how to combine aggregations of different grains (global vs " +
        "category) by referencing multiple CTEs in the same query.",
      alternativeApproach:
        "Using nested scalar subqueries in the SELECT clause.",
      performanceNotes:
        "CTEs are cleaner and allow the database to optimize the global total " +
        "calculation once instead of running a subquery for every row.",
      concepts: ["CTE", "CROSS JOIN", "aggregation", "percentage contribution"],
      companyTags: ["Flipkart", "Amazon"],
    },
  ],

  // MODULE 25: Window Functions - ROW_NUMBER
  25: [
    {
      id: "m25-p1",
      moduleId: 25,
      difficulty: "Easy",
      title: "Chronological Order Numbering",
      businessScenario: "Assign unique order sequence markers.",
      prompt:
        "Write a query to assign a unique sequential row number to all orders. Return " +
        "order_id, customer_id, order_date, total_amount, and order_seq (using " +
        "ROW_NUMBER() OVER(ORDER BY order_date ASC)).",
      starterQuery:
        "SELECT ???\nFROM ???;" + "(ORDER BY ???) AS order_seq FROM orders;",
      solution:
        "SELECT order_id, customer_id, order_date, total_amount, ROW_NUMBER() OVER " +
        "(ORDER BY order_date ASC) AS order_seq FROM orders;",
      hints: [
        "Use ROW_NUMBER() OVER (ORDER BY order_date ASC).",
        "Apply standard filtering and analytical clauses to isolate the exact target dataset.",
        "Structure your query using clauses similar to: SELECT order_id, customer_id, order_date, total_amount, ROW_NUMBER() OVER.",
      ],
      detailedExplanation: "Assigns sequential integers starting from 1.",
      alternativeApproach: "None.",
      performanceNotes: "Requires sorting orders.",
      concepts: ["ROW_NUMBER", "window function"],
      companyTags: ["Flipkart"],
    },
    {
      id: "m25-p2",
      moduleId: 25,
      difficulty: "Medium",
      title: "Customer's most recent order",
      businessScenario: "Locate latest buyer transactions.",
      prompt:
        "Find each customer's most recent order. Use ROW_NUMBER() partitioned by " +
        "customer_id and ordered by order_date desc. Wrap in a CTE and select rows with " +
        "sequence = 1.",
      starterQuery:
        "WITH ranked_orders AS (\n  SELECT customer_id, order_id, order_date, total_amount, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY ???) AS rn FROM orders\n)\nSELECT customer_id, order_id, order_date, total_amount FROM ranked_orders WHERE rn = 1;",
      solution:
        "WITH ranked_orders AS (SELECT order_id, customer_id, order_date, total_amount, " +
        "ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC) AS rn FROM " +
        "orders) SELECT order_id, customer_id, order_date, total_amount FROM " +
        "ranked_orders WHERE rn = 1;",
      hints: [
        "Partition by customer_id, sort by order_date DESC inside window.",
        "Apply standard filtering and analytical clauses to isolate the exact target dataset.",
        "Structure your query using clauses similar to: WITH ranked_orders AS (SELECT order_id, customer_id, order_date, total_amount,.",
      ],
      detailedExplanation:
        "Combines partition mapping with row sequence filters in CTE.",
      alternativeApproach: "None.",
      performanceNotes: "Window partition sorts are optimized.",
      concepts: ["ROW_NUMBER", "PARTITION BY", "CTE"],
      companyTags: ["Flipkart"],
    },
    {
      id: "m25-p3",
      moduleId: 25,
      difficulty: "Hard",
      title: "Top 2 Products per Category",
      businessScenario: "Identify category leaders.",
      prompt:
        "Find the top 2 products with the highest list price in each product category. " +
        "Use ROW_NUMBER() partitioned by category and ordered by list_price desc. Return " +
        "category, product_name, list_price, and price_rank.",
      starterQuery:
        "WITH ranked_products AS (\n  SELECT product_id, product_name, category, list_price, DENSE_RANK() OVER (PARTITION BY category ORDER BY list_price DESC) AS rk FROM products\n)\nSELECT product_id, product_name, category, list_price FROM ranked_products WHERE ???;",
      solution:
        "WITH ranked_products AS (SELECT category, product_name, list_price, " +
        "ROW_NUMBER() OVER (PARTITION BY category ORDER BY list_price DESC) AS price_rank " +
        "FROM products) SELECT category, product_name, list_price, price_rank FROM " +
        "ranked_products WHERE price_rank <= 2 ORDER BY category, price_rank;",
      hints: [
        "Use PARTITION BY category ORDER BY list_price DESC.",
        "Apply standard filtering and analytical clauses to isolate the exact target dataset.",
        "Structure your query using clauses similar to: WITH ranked_products AS (SELECT category, product_name, list_price,.",
      ],
      detailedExplanation: "Ranks catalog rows per category partition.",
      alternativeApproach: "None.",
      performanceNotes: "Sort partition runs per category.",
      concepts: ["ROW_NUMBER", "PARTITION BY", "CTE"],
      companyTags: ["Croma"],
    },
  ],
};
