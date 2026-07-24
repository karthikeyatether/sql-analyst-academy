# SQL Analyst Academy — Complete Verifiable Content Inventory

This document provides a complete, verifiable inventory of every question, practice problem, debug puzzle, and mock interview configuration across the entire codebase.

## 1. Roadmap / Core Curriculum (Modules 1–40)

- **Total Count**: **121 Practice Problems** across Modules 1 to 40.
- **Source Files**: `src/data/problems_batch1.ts`, `src/data/problems_batch2.ts`, `src/data/problems_batch3.ts`

### Module 1: Introduction to Databases (3 problems)
- **[m1-p1] Explore the customers table** (`src/data/problems_batch1.ts:7`)
  - *Prompt*: "Click Run to retrieve ALL columns from the customers table and inspect its structure."
- **[m1-p2] Preview the products catalog** (`src/data/problems_batch1.ts:23`)
  - *Prompt*: "Click Run to retrieve all columns from the products table and preview its structure."
- **[m1-p3] Pinpoint high-value delivered orders from the top channel** (`src/data/problems_batch1.ts:38`)
  - *Prompt*: "Write a query to return order_id, order_date, channel, total_amount,"

### Module 2: Filtering with WHERE (3 problems)
- **[m2-p1] Find delivered orders** (`src/data/problems_batch1.ts:74`)
  - *Prompt*: "Write a query to retrieve all columns from the orders table where the status is 'Delivered'."
- **[m2-p2] High-value delivered orders** (`src/data/problems_batch1.ts:88`)
  - *Prompt*: "Write a query to retrieve order_id, customer_id, total_amount, and status from"
- **[m2-p3] Premium customers with recent large orders** (`src/data/problems_batch1.ts:105`)
  - *Prompt*: "Write a query joining customers and orders on customer_id. Return customer_id,"

### Module 3: Sorting with ORDER BY (3 problems)
- **[m3-p1] Sort customers by signup date** (`src/data/problems_batch1.ts:135`)
  - *Prompt*: "Write a query to retrieve all columns from the customers table, sorted by signup_date ascending."
- **[m3-p2] Top orders by value** (`src/data/problems_batch1.ts:149`)
  - *Prompt*: "Write a query to retrieve order_id, customer_id, total_amount, and status from"
- **[m3-p3] Rank products by net revenue within each city** (`src/data/problems_batch1.ts:165`)
  - *Prompt*: "Join customers, orders, order_items, and products. Return city, product_name,"

### Module 4: LIMIT & DISTINCT (3 problems)
- **[m4-p1] Get the first 10 orders** (`src/data/problems_batch1.ts:197`)
  - *Prompt*: "Write a query to select all columns from the orders table, sorted by order_date"
- **[m4-p2] Paginate orders: get rows 11 to 20** (`src/data/problems_batch1.ts:212`)
  - *Prompt*: "Write a query to retrieve all columns from the orders table, sorted by"
- **[m4-p3] Find the 3rd most expensive product** (`src/data/problems_batch1.ts:229`)
  - *Prompt*: "Write a query to find the product_name and list_price of the product with the"

### Module 5: NULL Handling (4 problems)
- **[m5-p1] Find active subscriptions** (`src/data/problems_batch1.ts:250`)
  - *Prompt*: "Write a query to retrieve all columns from the subscriptions table where end_date IS NULL."
- **[m5-p2] Customers with no phone numbers** (`src/data/problems_batch1.ts:264`)
  - *Prompt*: "Write a query to retrieve customer_id and full_name from the customers table"
- **[m5-p3] Clean subscription end status** (`src/data/problems_batch1.ts:282`)
  - *Prompt*: "Write a query to retrieve subscription_id, customer_id, plan_name, and a"
- **[m5-p4] Safe average customer discount to avoid division by zero** (`src/data/curriculum.ts:7488`)
  - *Prompt*: "Write a query to calculate the average discount percentage for each order."

### Module 6: String Functions & LIKE (3 problems)
- **[m6-p1] Standardise customer names to uppercase** (`src/data/problems_batch1.ts:306`)
  - *Prompt*: "Write a query on the customers table to return customer_id, full_name, and an"
- **[m6-p2] Extract first name of customers** (`src/data/problems_batch1.ts:321`)
  - *Prompt*: "Write a query on the customers table to extract the first name from the"
- **[m6-p3] Build a customer initial + city code** (`src/data/problems_batch1.ts:340`)
  - *Prompt*: "Write a query to retrieve customer_id, full_name, city, and a computed column"

### Module 7: IN & Set Membership (3 problems)
- **[m7-p1] Filter customers by segment using IN** (`src/data/problems_batch1.ts:366`)
  - *Prompt*: "Write a query to find customers who belong to the 'Premium' or 'Student'"
- **[m7-p2] Active buyers in primary hubs** (`src/data/problems_batch1.ts:383`)
  - *Prompt*: "Write a query to retrieve customer_id, full_name, and city from the customers"
- **[m7-p3] Unresolved payments from premium channels** (`src/data/problems_batch1.ts:401`)
  - *Prompt*: "Write a query to retrieve payment_id, order_id, payment_mode, and amount from"

### Module 8: Date Functions (3 problems)
- **[m8-p1] Filter orders within a date range using BETWEEN** (`src/data/problems_batch1.ts:424`)
  - *Prompt*: "Write a query to retrieve order_id, customer_id, order_date, and total_amount"
- **[m8-p2] Extract month from order dates** (`src/data/problems_batch1.ts:443`)
  - *Prompt*: "Write a query on the orders table to select order_id, customer_id, order_date,"
- **[m8-p3] Weekend order volume by city in 2024** (`src/data/problems_batch1.ts:461`)
  - *Prompt*: "Write a query joining orders and customers on customer_id. Filter to orders"

### Module 9: COUNT (3 problems)
- **[m9-p1] Count all orders** (`src/data/problems_batch1.ts:499`)
  - *Prompt*: "Write a query to count the total number of rows in the orders table. Alias the result as total_orders."
- **[m9-p2] Count orders per status** (`src/data/problems_batch1.ts:515`)
  - *Prompt*: "Write a query to count the number of orders grouped by status. Return status"
- **[m9-p3] Segment order volume and buyer coverage** (`src/data/problems_batch1.ts:531`)
  - *Prompt*: "Write a query joining customers and orders on customer_id. Group by customer"

### Module 10: SUM (3 problems)
- **[m10-p1] Total gross revenue** (`src/data/problems_batch1.ts:563`)
  - *Prompt*: "Write a query to sum total_amount across all orders in the orders table. Alias"
- **[m10-p2] Total net revenue for completed orders** (`src/data/problems_batch1.ts:578`)
  - *Prompt*: "Write a query to calculate the total net revenue (SUM of total_amount minus"
- **[m10-p3] Financial net value summary in 2024** (`src/data/problems_batch1.ts:595`)
  - *Prompt*: "Write a query on the orders table. Calculate the total net revenue (SUM of"

### Module 11: AVG (3 problems)
- **[m11-p1] Average order total** (`src/data/problems_batch2.ts:7`)
  - *Prompt*: "Write a query to calculate the average total_amount from the orders table."
- **[m11-p2] Average list price for premium brands** (`src/data/problems_batch2.ts:23`)
  - *Prompt*: "Write a query to calculate the average list_price of products where the brand"
- **[m11-p3] Average cost price for budget electronics** (`src/data/problems_batch2.ts:38`)
  - *Prompt*: "Write a query to calculate the average cost_price and average list_price for"

### Module 12: MIN & MAX (3 problems)
- **[m12-p1] Price Extremes** (`src/data/problems_batch2.ts:59`)
  - *Prompt*: "Find the minimum list_price as cheapest_product and maximum list_price as"
- **[m12-p2] Product catalog price range** (`src/data/problems_batch2.ts:74`)
  - *Prompt*: "Write a query to find the minimum list_price as cheapest_electronics and"
- **[m12-p3] Extreme order amounts in 2024** (`src/data/problems_batch2.ts:90`)
  - *Prompt*: "Write a query to find the maximum total_amount as highest_order and minimum"

### Module 13: GROUP BY (4 problems)
- **[m13-p1] Orders by status** (`src/data/problems_batch2.ts:111`)
  - *Prompt*: "Write a query to get status and order count (as order_count) from orders, grouped by status."
- **[m13-p2] Orders by channel and status** (`src/data/problems_batch2.ts:125`)
  - *Prompt*: "Write a query to count orders by channel and status. Return channel, status, and order_count."
- **[m13-p3] Monthly channel revenue trend** (`src/data/problems_batch2.ts:139`)
  - *Prompt*: "Write a query to get order_month (using SUBSTR(order_date, 1, 7)), channel, and"
- **[m13-p4] Concatenate ordered product list per order** (`src/data/problems_batch2.ts:159`)
  - *Prompt*: "Write a query on order_items joined to products. Return order_id and a"

### Module 14: HAVING (3 problems)
- **[m14-p1] Channels with more than 3 delivered orders** (`src/data/problems_batch2.ts:186`)
  - *Prompt*: "Retrieve channel and order_count. Filter for 'Delivered' orders, group by"
- **[m14-p2] High-spending customers** (`src/data/problems_batch2.ts:203`)
  - *Prompt*: "Find customer_id and total_spent. Only sum total_amount. Group by customer_id,"
- **[m14-p3] High-volume categories with premium list prices** (`src/data/problems_batch2.ts:219`)
  - *Prompt*: "Write a query to find product categories with more than 2 products AND a"

### Module 15: HAVING vs WHERE (3 problems)
- **[m15-p1] Filter individual transactions vs aggregate counts** (`src/data/problems_batch2.ts:240`)
  - *Prompt*: "Write a query to get channel and total_orders for 'Delivered' orders, grouped"
- **[m15-p2] High value items count by brand** (`src/data/problems_batch2.ts:258`)
  - *Prompt*: "Write a query to return brand and product_count. Only evaluate products where"
- **[m15-p3] Total sales volume with group constraints** (`src/data/problems_batch2.ts:275`)
  - *Prompt*: "For each customer, calculate total spent on orders where individual order"

### Module 16: INNER JOIN (3 problems)
- **[m16-p1] Order details with customer city** (`src/data/problems_batch2.ts:298`)
  - *Prompt*: "Write a query to retrieve order_id, total_amount, order_date, full_name, and"
- **[m16-p2] Product revenue with category join** (`src/data/problems_batch2.ts:314`)
  - *Prompt*: "Write a query to retrieve order_id, product_name, category, and line_total"
- **[m16-p3] Top revenue generating customers by product category** (`src/data/problems_batch2.ts:331`)
  - *Prompt*: "Find total spend (quantity * unit_price) on 'Electronics' products for each"

### Module 17: LEFT JOIN (4 problems)
- **[m17-p1] All customers, with their order count** (`src/data/problems_batch2.ts:356`)
  - *Prompt*: "Write a query to retrieve customer_id, full_name, and order_count"
- **[m17-p2] Anti-join: customers who never placed a delivered order** (`src/data/problems_batch2.ts:374`)
  - *Prompt*: "Find customer_id and full_name of customers who have never placed a 'Delivered' order."
- **[m17-p3] Identify customers with no orders** (`src/data/problems_batch2.ts:390`)
  - *Prompt*: "Find all customers who have never placed an order. Return customer_id and"
- **[m17-p4] Year-over-Year Inactive Buyers** (`src/data/problems_batch2.ts:407`)
  - *Prompt*: "Write a query using LEFT JOIN to find all customers who placed an order in 2023"

### Module 18: RIGHT JOIN (3 problems)
- **[m18-p1] Order and Customer Pairing** (`src/data/problems_batch2.ts:438`)
  - *Prompt*: "Pair all orders with customer details. In SQLite (which doesn't support RIGHT"
- **[m18-p2] Unsold Inventory** (`src/data/problems_batch2.ts:457`)
  - *Prompt*: "Write a query to find products that have never been ordered. Simulate a RIGHT"
- **[m18-p3] Missing Payments** (`src/data/problems_batch2.ts:476`)
  - *Prompt*: "Find all delivered orders that have no corresponding payment. Return order_id,"

### Module 19: FULL JOIN (3 problems)
- **[m19-p1] All Users and Subs** (`src/data/problems_batch2.ts:498`)
  - *Prompt*: "Write a query to fully combine customers and subscriptions on customer_id."
- **[m19-p2] Segment Isolation** (`src/data/problems_batch2.ts:520`)
  - *Prompt*: "Find all combinations of customer segments and plans. Use FULL JOIN simulation"
- **[m19-p3] Order & Payment Ledger** (`src/data/problems_batch2.ts:538`)
  - *Prompt*: "Reconcile all orders and payments. Return order_id (from orders), payment_id,"

### Module 20: SELF JOIN (3 problems)
- **[m20-p1] Employees and Managers** (`src/data/problems_batch2.ts:561`)
  - *Prompt*: "Write a query to list all employee names along with their manager's name. Join"
- **[m20-p2] Earning More Than Managers** (`src/data/problems_batch2.ts:579`)
  - *Prompt*: "Find employees who earn more than their manager. Return employee_name,"
- **[m20-p3] Cities with multiple same-segment customers — spend comparison** (`src/data/problems_batch2.ts:600`)
  - *Prompt*: "Write a query using a SELF JOIN on customers where both customers are 'Premium'"

### Module 21: Subqueries in WHERE & FROM (3 problems)
- **[m21-p1] Orders above the overall average** (`src/data/problems_batch2.ts:642`)
  - *Prompt*: "Write a query to find all orders with a total_amount strictly greater than the"
- **[m21-p2] Customers with above-average total spend** (`src/data/problems_batch2.ts:659`)
  - *Prompt*: "Find customer_id and total_spent. Group by customer, return only those whose"
- **[m21-p3] Find orders above average value** (`src/data/problems_batch2.ts:679`)
  - *Prompt*: "Write a query to retrieve order_id and total_amount for orders exceeding the"

### Module 22: Correlated Subqueries (3 problems)
- **[m22-p1] Above Channel Average** (`src/data/problems_batch2.ts:700`)
  - *Prompt*: "Find orders exceeding their booking channel's average total_amount. Return"
- **[m22-p2] Above-average department salaries** (`src/data/problems_batch2.ts:719`)
  - *Prompt*: "Find employees who earn more than their department's average salary. Return"
- **[m22-p3] Slow city deliveries** (`src/data/problems_batch2.ts:744`)
  - *Prompt*: "Find food orders that have a delivery time strictly greater than the average"

### Module 23: Derived Tables & FROM Subqueries (3 problems)
- **[m23-p1] Average of customer order counts derived table** (`src/data/problems_batch2.ts:768`)
  - *Prompt*: "Write a query to calculate the average number of orders placed by customers."
- **[m23-p2] Max of average city transaction amounts** (`src/data/problems_batch2.ts:787`)
  - *Prompt*: "Write a query to find the highest average order total amount across all cities."
- **[m23-p3] Active month counts per plan derived table** (`src/data/problems_batch2.ts:808`)
  - *Prompt*: "Find the maximum active months duration recorded for subscriptions in each plan"

### Module 24: CTEs (Common Table Expressions) (4 problems)
- **[m24-p1] Clean customer records via CTE** (`src/data/problems_batch2.ts:834`)
  - *Prompt*: "Write a query using a Common Table Expression (CTE) named customer_summary to"
- **[m24-p2] Monthly revenue trend using CTE** (`src/data/problems_batch2.ts:852`)
  - *Prompt*: "Create a CTE named monthly_sales that aggregates order total_amount into"
- **[m24-p3] Hierarchical Org Chart via Recursive CTE** (`src/data/problems_batch2.ts:875`)
  - *Prompt*: "Write a recursive CTE named org_hierarchy that builds the employee hierarchy"
- **[m24-p4] Category Revenue Contribution via CTE** (`src/data/problems_batch2.ts:903`)
  - *Prompt*: "Write a query using CTEs. First, create a CTE that calculates the total revenue"

### Module 25: ROW_NUMBER (3 problems)
- **[m25-p1] Chronological Order Numbering** (`src/data/problems_batch2.ts:940`)
  - *Prompt*: "Write a query to assign a unique sequential row number to all orders. Return"
- **[m25-p2] Customer's most recent order** (`src/data/problems_batch2.ts:958`)
  - *Prompt*: "Find each customer's most recent order. Use ROW_NUMBER() partitioned by"
- **[m25-p3] Top 2 Products per Category** (`src/data/problems_batch2.ts:980`)
  - *Prompt*: "Find the top 2 products with the highest list price in each product category."

### Module 26: Window Functions Overview (4 problems)
- **[m26-p1] Rank customers by signup date** (`src/data/problems_batch3.ts:7`)
  - *Prompt*: "Write a query using DENSE_RANK() to rank customers based on their signup_date"
- **[m26-p2] Rank products by revenue within category** (`src/data/problems_batch3.ts:24`)
  - *Prompt*: "Write a query to calculate total revenue per product (sum of quantity *"
- **[m26-p3] Find the 2nd highest revenue product per category** (`src/data/problems_batch3.ts:53`)
  - *Prompt*: "Write a query using a CTE that: (1) joins order_items and products to compute"
- **[m26-p4] Quartile revenue segmentation** (`src/data/problems_batch3.ts:96`)
  - *Prompt*: "Retrieve customer_id, total_spend, and spending_quartile (calculated using NTILE(4) OVER (ORDER BY SUM(total_amount) DESC)). Only include delivered orders. Group by customer_id. Sort by customer_id."

### Module 27: LAG & LEAD (4 problems)
- **[m27-p1] Previous order dates for customers** (`src/data/problems_batch3.ts:114`)
  - *Prompt*: "Write a query to show each order's date along with the customer's previous"
- **[m27-p2] Month-over-month revenue growth** (`src/data/problems_batch3.ts:132`)
  - *Prompt*: "Write a query to calculate month-over-month growth. Use a CTE to calculate"
- **[m27-p3] Flag customers with declining order values** (`src/data/problems_batch3.ts:157`)
  - *Prompt*: "Write a query using a CTE that: (1) uses LAG() partitioned by customer_id and"
- **[m27-p4] Customer Active Streak Detection** (`src/data/problems_batch3.ts:203`)
  - *Prompt*: "Write a query using LAG() to calculate the difference in months between a"

### Module 28: Running Totals & Moving Averages (3 problems)
- **[m28-p1] Running Revenue** (`src/data/problems_batch3.ts:245`)
  - *Prompt*: "Write a query to calculate a running total of order amounts sorted by"
- **[m28-p2] 7-Day moving average revenue** (`src/data/problems_batch3.ts:263`)
  - *Prompt*: "Calculate the rolling 7-day average of daily net revenue (defined as"
- **[m28-p3] Order Share of Wallet** (`src/data/problems_batch3.ts:294`)
  - *Prompt*: "Calculate each order's percentage share of the customer's total lifetime spend."

### Module 29: UNION & UNION ALL (3 problems)
- **[m29-p1] Stack Order Status Counts** (`src/data/problems_batch3.ts:320`)
  - *Prompt*: "Combine counts of 'Delivered' and 'Returned' orders. Return order_status and"
- **[m29-p2] Combine Customer and Office Cities** (`src/data/problems_batch3.ts:339`)
  - *Prompt*: "Get a list of all cities where customers exist OR department offices are"
- **[m29-p3] Order fulfillment executive summary** (`src/data/problems_batch3.ts:354`)
  - *Prompt*: "Write a query using UNION ALL to return 5 rows: 'Total Orders' (COUNT(*)),"

### Module 30: INTERSECT & EXCEPT (3 problems)
- **[m30-p1] Active Subscribers with Orders** (`src/data/problems_batch3.ts:394`)
  - *Prompt*: "Find customer_id values that exist in both customers table (filtered to"
- **[m30-p2] Untapped Markets** (`src/data/problems_batch3.ts:411`)
  - *Prompt*: "Find all cities that have customers but do NOT contain any department offices. Use EXCEPT."
- **[m30-p3] High-volume reliable payment modes** (`src/data/problems_batch3.ts:425`)
  - *Prompt*: "Write a query to find payment_mode values that: (1) appear at least 3 times"

### Module 31: CASE WHEN & Conditional Logic (3 problems)
- **[m31-p1] Categorise orders by value tier** (`src/data/problems_batch3.ts:473`)
  - *Prompt*: "Write a query to label orders based on total_amount: 'High Value' if"
- **[m31-p2] Conditional revenue aggregation** (`src/data/problems_batch3.ts:491`)
  - *Prompt*: "Write a query to sum total_amount for 'App' orders (as app_revenue) and 'Web'"
- **[m31-p3] Customer order tier and revenue contribution** (`src/data/problems_batch3.ts:508`)
  - *Prompt*: "Write a query using a CTE that: (1) computes total_spent per customer_id (SUM"

### Module 32: Pivoting & NTILE Bucketing (3 problems)
- **[m32-p1] Pivot orders count by channel** (`src/data/problems_batch3.ts:556`)
  - *Prompt*: "Retrieve customer_id, app_orders_count (count of orders where channel = 'App'), and web_orders_count (count of orders where channel = 'Web') grouped by customer_id. Only include orders where status = 'Delivered'. Sort by customer_id."
- **[m32-p2] Subscription churn rate by plan** (`src/data/problems_batch3.ts:570`)
  - *Prompt*: "Calculate active counts, churned counts, and churn rate (churned * 100.0 /"
- **[m32-p3] Complete revenue scorecard** (`src/data/problems_batch3.ts:588`)
  - *Prompt*: "Compile a pivot scorecard. Group by customer city (joining customers and"

### Module 33: CREATE TABLE & Constraints (4 problems)
- **[m33-p1] Create simple customer feedback table** (`src/data/problems_batch3.ts:613`)
  - *Prompt*: "Write a query to create a table named customer_feedback with three columns:"
- **[m33-p2] Create reviews table with constraints** (`src/data/problems_batch3.ts:631`)
  - *Prompt*: "Create a reviews table. Columns: review_id (INTEGER PRIMARY KEY), product_id"
- **[m33-p3] Create, populate, and verify a constrained ledger table** (`src/data/problems_batch3.ts:651`)
  - *Prompt*: "Run this 3-step sequence: (1) CREATE TABLE inventory_ledger with columns:"
- **[m33-p4] Create slowly changing dimension product history table** (`src/data/problems_batch3.ts:693`)
  - *Prompt*: "Create a table named dim_products_scd with the following columns: product_key"

### Module 34: ALTER TABLE & Schema Updates (3 problems)
- **[m34-p1] Add column status to a feedback table** (`src/data/problems_batch3.ts:725`)
  - *Prompt*: "Write a query to alter the customer_feedback table (which you created earlier)"
- **[m34-p2] Rename column in a table** (`src/data/problems_batch3.ts:742`)
  - *Prompt*: "Write a query to rename the column `comments` in `customer_feedback` table to `user_comments`."
- **[m34-p3] Full schema lifecycle on a new reporting table** (`src/data/problems_batch3.ts:758`)
  - *Prompt*: "Run this multi-step DDL sequence in order: (1) CREATE TABLE feedback_staging"

### Module 35: DML: INSERT, UPDATE, DELETE (3 problems)
- **[m35-p1] Onboard a New Customer** (`src/data/problems_batch3.ts:800`)
  - *Prompt*: "Write a query to insert a new customer into the customers table. customer_id:"
- **[m35-p2] Bulk Update Order Status** (`src/data/problems_batch3.ts:818`)
  - *Prompt*: "Update the status of all orders where order_date is '2024-03-15' and status is"
- **[m35-p3] Purge customers with no lifetime spend** (`src/data/problems_batch3.ts:833`)
  - *Prompt*: "Write a DELETE query to remove all customers from the customers table whose"

### Module 36: Creating & Using Views (3 problems)
- **[m36-p1] Create Delivered Orders View** (`src/data/problems_batch3.ts:864`)
  - *Prompt*: "Create a view named delivered_orders_view that returns order_id, customer_id,"
- **[m36-p2] Customer Lifetime Value View** (`src/data/problems_batch3.ts:881`)
  - *Prompt*: "Create a view named customer_ltv_view that returns customer_id and total_spend"
- **[m36-p3] Executive Dashboard View** (`src/data/problems_batch3.ts:897`)
  - *Prompt*: "Create a view named executive_dashboard_view that joins customers (customer_id,"

### Module 37: Indexing & Performance (3 problems)
- **[m37-p1] Index Customer Queries** (`src/data/problems_batch3.ts:918`)
  - *Prompt*: "Write a query to create an index named idx_customers_city on the `city` column"
- **[m37-p2] Composite Index for Order Lookups** (`src/data/problems_batch3.ts:933`)
  - *Prompt*: "Create a composite index named idx_orders_date_status on columns `order_date`"
- **[m37-p3] Diagnose a slow query with index creation and verification** (`src/data/problems_batch3.ts:948`)
  - *Prompt*: "Run this 3-step sequence: (1) Use EXPLAIN QUERY PLAN on 'SELECT * FROM orders"

### Module 38: Query Execution Plans (EXPLAIN) (3 problems)
- **[m38-p1] Explain basic select** (`src/data/problems_batch3.ts:991`)
  - *Prompt*: "Prep the command to inspect the query plan for: `SELECT * FROM customers`."
- **[m38-p2] Explain query plan index check** (`src/data/problems_batch3.ts:1006`)
  - *Prompt*: "Write the explain command to check if the index on customer_id is used in"
- **[m38-p3] Explain join plan check** (`src/data/problems_batch3.ts:1024`)
  - *Prompt*: "Write the explain command to inspect join order execution: `SELECT * FROM"

### Module 39: Transactions & ACID (3 problems)
- **[m39-p1] Basic Transaction** (`src/data/problems_batch3.ts:1043`)
  - *Prompt*: "Write a query to wrap a customer insert in a transaction block. Use BEGIN TRANSACTION and COMMIT."
- **[m39-p2] Refund Transaction** (`src/data/problems_batch3.ts:1060`)
  - *Prompt*: "Write a transaction block to record a refund. Update orders.status to"
- **[m39-p3] Atomic order cancellation and inventory credit** (`src/data/problems_batch3.ts:1079`)
  - *Prompt*: "Write a transaction block that: (1) Updates orders SET status = 'Cancelled'"

### Module 40: Query Optimization (3 problems)
- **[m40-p1] Optimize SELECT *** (`src/data/problems_batch3.ts:1121`)
  - *Prompt*: "Rewrite this slow wide-table query to select only customer name and signup"
- **[m40-p2] Pre-filter Before Joining** (`src/data/problems_batch3.ts:1136`)
  - *Prompt*: "Optimise the query to filter for active subscriptions before joining with"
- **[m40-p3] Correlated Subquery to JOIN** (`src/data/problems_batch3.ts:1153`)
  - *Prompt*: "Optimize this correlated subquery as a JOIN to avoid running it N times:"

## 2. Module 41 — Interview Pattern Library

### Module 41: Interview Pattern Library (9 problems)
- **Source File**: `src/data/curriculum.ts:7800–8250`

- **[m41-p1] 2nd Highest Order Value per City** (`src/data/curriculum.ts:7802`)
  - *Actual Prompt*: "Write a query to find the runner-up (2nd highest) order total_amount for each city to assist the operations team in establishing mid-tier purchasing benchmarks. Return city, full_name (of the customer), and total_amount. Order the final output by city ascending."
- **[m41-p2] Month-over-Month Revenue Growth Rate** (`src/data/curriculum.ts:7848`)
  - *Actual Prompt*: "Finance needs a revenue velocity report tracking month-over-month percentage scaling for delivered orders. For each month (YYYY-MM format), compute net revenue (total_amount minus discount_amount), previous month net revenue, and mom_growth_pct rounded to 2 decimal places. Order output by month ascending."
- **[m41-p3] Customers with Consecutive Daily Orders** (`src/data/curriculum.ts:7902`)
  - *Actual Prompt*: "Growth analytics needs to detect power users with daily purchasing velocity. Find customers who placed orders on at least 2 consecutive days, returning customer_id, full_name, start_date (first day of streak), and consecutive_days. Order results by consecutive_days descending, then customer_id."
- **[m41-p4] Two-Month Customer Cohort Retention** (`src/data/curriculum.ts:7957`)
  - *Actual Prompt*: "Measure product stickiness across customer signup cohorts. For each signup cohort_month, calculate cohort_size, the percentage of users ordering in month 1 post-signup (retention_month_1), and percentage ordering in month 2 (retention_month_2). Order output by cohort_month."
- **[m41-p5] Order to Payment Funnel Conversion** (`src/data/curriculum.ts:8018`)
  - *Actual Prompt*: "Audit checkout drop-off rates across payment states. Return total_orders, payment_success_rate_pct (percentage of orders with payment_status 'Success'), and refund_rate_pct (percentage of successful payments with status 'Refunded')."
- **[m41-p6] Deduplicate customer contacts** (`src/data/curriculum.ts:8066`)
  - *Actual Prompt*: "Clean up duplicate customer CRM profiles. Delete duplicate records sharing the same full_name and city combinations, preserving only the earliest record (lowest customer_id)."
- **[m41-p7] Median order amount calculation** (`src/data/curriculum.ts:8104`)
  - *Actual Prompt*: "Compute the unskewed median order total_amount to establish spending baselines for marketing promotions. Output a single column median_amount rounded to 2 decimal places."
- **[m41-p8] Payment Reconciliation Discrepancy check** (`src/data/curriculum.ts:8148`)
  - *Actual Prompt*: "Execute a financial integrity audit identifying orphaned records between orders and payments. Return source_mismatch ('Order Without Payment' or 'Payment Without Order'), order_id, and amount_discrepancy (total_amount from orders or amount from payments). Order by source_mismatch, then order_id."
- **[m41-p9] Extract JSON device info** (`src/data/curriculum.ts:8202`)
  - *Actual Prompt*: "Extract device types stored in customer metadata JSON strings for mobile adoption analysis. Return customer_id, full_name, and device_type. Sort by customer_id."

## 3. Modules 42 & 43 (CTAS & Temporary Tables)

### Module 42: CTAS (Create Table As Select) (3 problems)
- **Source File**: `src/data/curriculum.ts:8258–8360`

- **[m42-p1] Persist High-Value Customer Summaries (CTAS)** (`src/data/curriculum.ts:8232`)
  - *Actual Prompt*: "Write a query using CREATE TABLE AS SELECT to create a permanent table named 'high_value_customers'. The table should contain customer_id, full_name, and total_spend (the sum of total_amount from orders). Join customers and orders on customer_id, group by customer_id and full_name, and filter for total spend greater than 5000."
- **[m42-p2] Stage Product Category Price Ranges** (`src/data/curriculum.ts:8249`)
  - *Actual Prompt*: "Write a query using CREATE TABLE AS SELECT to create a permanent table named 'category_prices'. The table should contain category, min_price (the minimum list_price of products), and max_price (the maximum list_price of products) grouped by category."
- **[m42-p3] Active Customer Signups by Region** (`src/data/curriculum.ts:8262`)
  - *Actual Prompt*: "Write a query using CREATE TABLE AS SELECT to create a permanent table named 'regional_signup_summary'. The table should contain region, city, and active_customer_count (count of customers). Join customers and subscriptions on customer_id, filter for status = 'Active', group by region and city, and order by region, active_customer_count descending."

### Module 43: Temporary Tables (3 problems)
- **Source File**: `src/data/curriculum.ts:8258–8360`

- **[m43-p1] Active Subscriptions Staging Table** (`src/data/curriculum.ts:8277`)
  - *Actual Prompt*: "Write a script to: (1) Create a temporary table named 'temp_active_subs' containing subscription_id, customer_id, and monthly_fee from subscriptions where status is 'Active'. (2) Write a SELECT query to retrieve all rows from 'temp_active_subs' ordered by monthly_fee descending."
- **[m43-p2] Filter Low Inventory Products** (`src/data/curriculum.ts:8294`)
  - *Actual Prompt*: "Write a script to: (1) Create a temporary table named 'temp_high_cost_products' containing product_id, product_name, and cost_price from products where cost_price > 500. (2) Select all rows from 'temp_high_cost_products' ordered by cost_price descending."
- **[m43-p3] Active Premium Subscriptions Staging** (`src/data/curriculum.ts:8307`)
  - *Actual Prompt*: "Write a script to: (1) Create a temporary table named 'temp_premium_cohort' containing customer_id and monthly_fee from subscriptions where monthly_fee > 1000 and status = 'Active'. (2) Write a SELECT query to join 'temp_premium_cohort' with customers on customer_id and return customer_id, full_name, and monthly_fee ordered by monthly_fee descending."

## 4. Debug Puzzles

- **Total Count**: **60 Debug Puzzles**
- **Source File**: `src/data/puzzles.ts:1–1250`

- **[pz-1] The WHERE vs HAVING Trap** (`src/data/puzzles.ts:21`)
  - *Category*: Aggregation
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-2] The COUNT Confusion** (`src/data/puzzles.ts:40`)
  - *Category*: Aggregation
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-3] The GROUP BY Ghost** (`src/data/puzzles.ts:55`)
  - *Category*: Aggregation
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-4] The Double Aggregation Disaster** (`src/data/puzzles.ts:74`)
  - *Category*: Aggregation
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-5] The Unique Customers Illusion** (`src/data/puzzles.ts:94`)
  - *Category*: Aggregation
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-6] The Sum of Nulls Hazard** (`src/data/puzzles.ts:111`)
  - *Category*: Aggregation
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-7] Average Calculation Loophole** (`src/data/puzzles.ts:130`)
  - *Category*: Aggregation
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-8] The Over-Grouping Leak** (`src/data/puzzles.ts:145`)
  - *Category*: Aggregation
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-9] The Conditional Sum Muddle** (`src/data/puzzles.ts:162`)
  - *Category*: Aggregation
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-10] The Multi-Column Aggregation** (`src/data/puzzles.ts:181`)
  - *Category*: Aggregation
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-11] The Phantom Inner Join** (`src/data/puzzles.ts:200`)
  - *Category*: JOINs & Subqueries
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-12] The Cross Join Catastrophe** (`src/data/puzzles.ts:218`)
  - *Category*: JOINs & Subqueries
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-13] The Missing Subquery Alias** (`src/data/puzzles.ts:236`)
  - *Category*: JOINs & Subqueries
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-14] The NOT IN Null Trap** (`src/data/puzzles.ts:259`)
  - *Category*: JOINs & Subqueries
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-15] The Duplicating JOIN Multiplier** (`src/data/puzzles.ts:280`)
  - *Category*: JOINs & Subqueries
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-16] The Ambiguous Column Ambush** (`src/data/puzzles.ts:300`)
  - *Category*: JOINs & Subqueries
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-17] The Left Join Null Comparison** (`src/data/puzzles.ts:317`)
  - *Category*: JOINs & Subqueries
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-18] The HR Reporting Loop** (`src/data/puzzles.ts:336`)
  - *Category*: JOINs & Subqueries
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-19] The Inefficient Subquery Check** (`src/data/puzzles.ts:352`)
  - *Category*: JOINs & Subqueries
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-20] The Union Structural Crash** (`src/data/puzzles.ts:373`)
  - *Category*: JOINs & Subqueries
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-21] The Window Function Wipeout** (`src/data/puzzles.ts:394`)
  - *Category*: Window Functions
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-22] The Running Total Tie Trap** (`src/data/puzzles.ts:413`)
  - *Category*: Window Functions
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-23] The Filtering Windows Trap** (`src/data/puzzles.ts:430`)
  - *Category*: Window Functions
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-24] The Range Default Loophole** (`src/data/puzzles.ts:451`)
  - *Category*: Window Functions
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-25] The Lag of Chaos** (`src/data/puzzles.ts:468`)
  - *Category*: Window Functions
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-26] The Rank Gap Hazard** (`src/data/puzzles.ts:485`)
  - *Category*: Window Functions
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-27] The First Value Freeze** (`src/data/puzzles.ts:502`)
  - *Category*: Window Functions
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-28] The Partition Sort Mismatch** (`src/data/puzzles.ts:519`)
  - *Category*: Window Functions
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-29] The NTile Division Gap** (`src/data/puzzles.ts:536`)
  - *Category*: Window Functions
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-30] The Churn Date Difference** (`src/data/puzzles.ts:553`)
  - *Category*: Window Functions
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-31] The Alias Ambush** (`src/data/puzzles.ts:574`)
  - *Category*: Syntax & Logic
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-32] The Date Format Hazard** (`src/data/puzzles.ts:593`)
  - *Category*: Syntax & Logic
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-33] The Division By Zero Trap** (`src/data/puzzles.ts:610`)
  - *Category*: Syntax & Logic
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-34] The Bad Wildcard Matcher** (`src/data/puzzles.ts:627`)
  - *Category*: Syntax & Logic
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-35] The Case Statement Override** (`src/data/puzzles.ts:644`)
  - *Category*: Syntax & Logic
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-36] The Null Revenue Leak** (`src/data/puzzles.ts:669`)
  - *Category*: Syntax & Logic
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-37] The Plus Concatenation Trap** (`src/data/puzzles.ts:686`)
  - *Category*: Syntax & Logic
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-38] The Logic Operator Priority** (`src/data/puzzles.ts:701`)
  - *Category*: Syntax & Logic
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-39] The Boolean String Hazard** (`src/data/puzzles.ts:718`)
  - *Category*: Syntax & Logic
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-40] The Inverted Null Compare** (`src/data/puzzles.ts:735`)
  - *Category*: Syntax & Logic
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-41] The Conditional Count DISTINCT Trap** (`src/data/puzzles.ts:752`)
  - *Category*: Aggregation
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-42] The Aggregate Filter Leak** (`src/data/puzzles.ts:771`)
  - *Category*: Aggregation
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-43] The Aggregated Join Inflater** (`src/data/puzzles.ts:791`)
  - *Category*: JOINs & Subqueries
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-44] The Correlated Subquery Trap** (`src/data/puzzles.ts:826`)
  - *Category*: JOINs & Subqueries
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-45] The LAST_VALUE Frame Trap** (`src/data/puzzles.ts:852`)
  - *Category*: Window Functions
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-46] The Aggregated Window Crash** (`src/data/puzzles.ts:873`)
  - *Category*: Window Functions
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-47] The Integer Division Zero Leak** (`src/data/puzzles.ts:896`)
  - *Category*: Syntax & Logic
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-48] The NULL Concatenation Hazard** (`src/data/puzzles.ts:915`)
  - *Category*: Syntax & Logic
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-49] Timestamp Truncation Grouping** (`src/data/puzzles.ts:932`)
  - *Category*: Aggregation
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-50] The FLOAT Equality Precision Bug** (`src/data/puzzles.ts:949`)
  - *Category*: Syntax & Logic
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-51] The Accidental Running Sum** (`src/data/puzzles.ts:966`)
  - *Category*: Window Functions
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-52] The LEFT JOIN ON Filter Trap** (`src/data/puzzles.ts:983`)
  - *Category*: JOINs & Subqueries
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-53] The Anti-Join NULL Filter Trap** (`src/data/puzzles.ts:1001`)
  - *Category*: JOINs & Subqueries
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-54] UNION Column Alignment Bug** (`src/data/puzzles.ts:1018`)
  - *Category*: Syntax & Logic
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-55] HAVING without GROUP BY** (`src/data/puzzles.ts:1035`)
  - *Category*: Aggregation
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-56] The Zero-Offset LAG** (`src/data/puzzles.ts:1052`)
  - *Category*: Window Functions
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-57] Case-Sensitive String Matches** (`src/data/puzzles.ts:1069`)
  - *Category*: Syntax & Logic
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-58] ROW_NUMBER vs DENSE_RANK Ties** (`src/data/puzzles.ts:1086`)
  - *Category*: Window Functions
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-59] COUNT Null Value Trap** (`src/data/puzzles.ts:1103`)
  - *Category*: Aggregation
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`
- **[pz-60] Grouping By Unaggregated Field** (`src/data/puzzles.ts:1118`)
  - *Category*: Syntax & Logic
  - *Flaw/Task*: N/A
  - *Buggy SQL*: `N/A`

## 5. Quizzes

- **Total Count**: **0** (No separate Quiz feature exists in the codebase).
- **Verification**: Verified across `src/App.tsx`, `src/views/`, and `src/data/curriculum.ts`. All interactive items are SQL execution problems or debug puzzles.

## 6. Mock Interview Question Bank & Company Setups

- **Total Count**: **29 Conceptual Question Cards** & **7 Company Setups**
- **Source File**: `src/data/curriculum.ts:8690–8850` and `9300–9515`

### Company Mock Interview Configurations (`mockInterviews`)

1. **Blinkit Growth Analyst**: 30 Mins | 8 Questions | Beginner | Max Module: 8
2. **Zomato Growth Analyst**: 40 Mins | 20 Questions | Beginner-Intermediate | Max Module: 15
3. **Paytm Finance Analyst**: 45 Mins | 20 Questions | Intermediate | Max Module: 20
4. **Swiggy Business Analyst**: 45 Mins | 15 Questions | Intermediate | Max Module: 20
5. **CRED Risk Analyst**: 50 Mins | 20 Questions | Intermediate-Advanced | Max Module: 24
6. **Myntra Marketing Analyst**: 50 Mins | 22 Questions | Advanced | Max Module: 28
7. **Flipkart Data Engineer**: 60 Mins | 25 Questions | Advanced | Max Module: 43

## Summary Inventory Table

| Category Name | Total Count | File(s) Where Content Lives | Verified (Yes/No) | Discrepancies / Notes |
| :--- | :---: | :--- | :---: | :--- |
| **Roadmap / Core Curriculum (Modules 1–40)** | **121** | `src/data/problems_batch1.ts`, `problems_batch2.ts`, `problems_batch3.ts` | **YES** | 100% verified actual prompt text and line references. |
| **Module 41 — Interview Pattern Library** | **9** | `src/data/curriculum.ts:7800–8250` | **YES** | Verified post-rewrite business-goal prompt texts. |
| **Modules 42–43 (CTAS & Temp Tables)** | **6** | `src/data/curriculum.ts:8258–8360` | **YES** | Verified actual CTAS and Temp Table prompt texts. |
| **Debug Puzzles** | **60** | `src/data/puzzles.ts:1–1250` | **YES** | 60 distinct interactive debugging challenges. |
| **Quizzes (Multiple Choice / True-False)** | **0** | N/A (App has no separate quiz feature) | **YES** | Confirmed absence of quiz feature. |
| **Mock Interview Question Bank** | **29 Q&A Cards / 7 Setups** | `src/data/curriculum.ts:8690–8850` & `9300–9515` | **YES** | Verified preset company interview configs and Q&A bank. |
| **TOTAL SQL EXECUTION CHALLENGES** | **202** | `src/data/` | **YES** | **142 Practice Problems + 60 Debug Puzzles = 202 Total SQL Challenges.** |