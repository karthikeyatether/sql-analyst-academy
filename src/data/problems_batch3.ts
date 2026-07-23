import { PracticeProblem } from "./curriculum";

export const problemsBatch3: Record<number, PracticeProblem[]> = {
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
