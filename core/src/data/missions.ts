export interface MissionStep {
  stepNumber: number;
  title: string;
  objective: string;
  hint: string;
  starterQuery: string;
  solutionQuery: string;
}

export interface MissionCapstone {
  id: string;
  title: string;
  subtitle: string;
  category: "E-Commerce" | "FinTech" | "SaaS" | "Logistics";
  difficulty: "Intermediate" | "Advanced";
  estimatedMinutes: number;
  description: string;
  steps: MissionStep[];
  executiveReportTemplate: string;
}

export const missionCapstones: MissionCapstone[] = [
  {
    id: "m1",
    title: "E-Commerce Customer Churn & Unit Economics Audit",
    subtitle:
      "Audit customer repeat rates, identify churned VIP accounts, and calculate revenue loss",
    category: "E-Commerce",
    difficulty: "Advanced",
    estimatedMinutes: 30,
    description:
      "Executive leadership at a major food delivery platform observed a 14% drop in active diners. As the lead analyst, write SQL queries to audit order frequency, identify churned VIP accounts, and quantify revenue impact.",
    steps: [
      {
        stepNumber: 1,
        title: "Identify Active vs Inactive Customers",
        objective:
          "Calculate total orders per customer and classify customers with 0 orders or whose last order was over 60 days ago as 'CHURN_RISK'.",
        hint: "Join customers with orders, group by customer id and name, and use CASE WHEN MAX(order_date) < '2024-05-01' THEN 'CHURN_RISK' ELSE 'ACTIVE' END.",
        starterQuery:
          "SELECT c.id, c.name, COUNT(o.id) as order_count,\n       CASE WHEN MAX(o.order_date) < '2024-05-01' THEN 'CHURN_RISK' ELSE 'ACTIVE' END as churn_status\nFROM customers c\nLEFT JOIN orders o ON c.id = o.customer_id\nGROUP BY c.id, c.name;",
        solutionQuery:
          "SELECT c.id, c.name, COUNT(o.id) as order_count,\n       CASE WHEN MAX(o.order_date) < '2024-05-01' OR COUNT(o.id) = 0 THEN 'CHURN_RISK' ELSE 'ACTIVE' END as churn_status\nFROM customers c\nLEFT JOIN orders o ON c.id = o.customer_id\nGROUP BY c.id, c.name;",
      },
      {
        stepNumber: 2,
        title: "Revenue Impact of Churned VIPs",
        objective:
          "Find total historical spend by customers classified in CHURN_RISK whose historical spend exceeded $500.",
        hint: "Filter grouped orders using HAVING SUM(o.total_amount) > 500.",
        starterQuery:
          "SELECT c.id, c.name, SUM(o.total_amount) as lifetime_spend\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nGROUP BY c.id, c.name\nHAVING SUM(o.total_amount) > 500\nORDER BY lifetime_spend DESC;",
        solutionQuery:
          "SELECT c.id, c.name, SUM(o.total_amount) as lifetime_spend\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nGROUP BY c.id, c.name\nHAVING SUM(o.total_amount) > 500\nORDER BY lifetime_spend DESC;",
      },
      {
        stepNumber: 3,
        title: "Top Product Categories Among Churned Diners",
        objective:
          "Identify the top 3 product categories purchased by churn-risk customers to target targeted win-back discount campaigns.",
        hint: "Join order_items and products tables, filtering for customer_id in churned list.",
        starterQuery:
          "SELECT p.category, COUNT(oi.id) as total_units_bought, SUM(oi.quantity * oi.unit_price) as category_revenue\nFROM order_items oi\nJOIN products p ON oi.product_id = p.id\nGROUP BY p.category\nORDER BY category_revenue DESC\nLIMIT 3;",
        solutionQuery:
          "SELECT p.category, COUNT(oi.id) as total_units_bought, SUM(oi.quantity * oi.unit_price) as category_revenue\nFROM order_items oi\nJOIN products p ON oi.product_id = p.id\nGROUP BY p.category\nORDER BY category_revenue DESC\nLIMIT 3;",
      },
      {
        stepNumber: 4,
        title: "Retention Win-Back Cohort Strategy",
        objective:
          "Build the target list of customers who made more than 5 orders historically but none in the last 45 days for promo dispatch.",
        hint: "Combine order count and date filter in HAVING clause.",
        starterQuery:
          "SELECT c.id, c.name, c.email, COUNT(o.id) as total_orders, MAX(o.order_date) as last_order_date\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nGROUP BY c.id, c.name, c.email\nHAVING COUNT(o.id) >= 5 AND MAX(o.order_date) < '2024-05-15'\nORDER BY total_orders DESC;",
        solutionQuery:
          "SELECT c.id, c.name, c.email, COUNT(o.id) as total_orders, MAX(o.order_date) as last_order_date\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nGROUP BY c.id, c.name, c.email\nHAVING COUNT(o.id) >= 5 AND MAX(o.order_date) < '2024-05-15'\nORDER BY total_orders DESC;",
      },
    ],
    executiveReportTemplate:
      "### Key Findings:\n- Total high-value churned accounts identified: **18 VIP Customers** representing **$14,250** in annual gross merchandise value.\n- Primary churned categories: **Gourmet Meals (42%)** and **Beverages (31%)**.\n- Action item: Deploy 25% win-back coupon to cohort with >= 5 historical orders.",
  },
  {
    id: "m2",
    title: "FinTech Fraud Risk & Transaction Anomaly Detection",
    subtitle:
      "Identify high-frequency duplicate transfers, abnormal withdrawal spikes, and account takeovers",
    category: "FinTech",
    difficulty: "Advanced",
    estimatedMinutes: 35,
    description:
      "A digital banking app experienced unusual transaction spikes. Detect suspicious transfers, identify accounts with rapid successive transactions under $10, and flag potential laundering rings.",
    steps: [
      {
        stepNumber: 1,
        title: "Detect High-Frequency Rapid Transactions",
        objective:
          "Find customer accounts that completed more than 3 transactions on the same calendar day.",
        hint: "Group by customer_id and DATE(transaction_date), filtering with HAVING COUNT(*) > 3.",
        starterQuery:
          "SELECT customer_id, order_date, COUNT(*) as txn_count, SUM(total_amount) as daily_volume\nFROM orders\nGROUP BY customer_id, order_date\nHAVING COUNT(*) > 3\nORDER BY txn_count DESC;",
        solutionQuery:
          "SELECT customer_id, order_date, COUNT(*) as txn_count, SUM(total_amount) as daily_volume\nFROM orders\nGROUP BY customer_id, order_date\nHAVING COUNT(*) > 3\nORDER BY txn_count DESC;",
      },
      {
        stepNumber: 2,
        title: "Identify Micro-Transaction Card Testing Anomalies",
        objective:
          "Identify accounts where average order amount is below $15 but order count exceeds 4 (common automated card testing signature).",
        hint: "Use HAVING AVG(total_amount) < 15 AND COUNT(*) > 4.",
        starterQuery:
          "SELECT customer_id, COUNT(*) as order_count, AVG(total_amount) as avg_amount\nFROM orders\nGROUP BY customer_id\nHAVING AVG(total_amount) < 15 AND COUNT(*) > 4;",
        solutionQuery:
          "SELECT customer_id, COUNT(*) as order_count, AVG(total_amount) as avg_amount\nFROM orders\nGROUP BY customer_id\nHAVING AVG(total_amount) < 15 AND COUNT(*) > 4;",
      },
      {
        stepNumber: 3,
        title: "Calculate Rolling 3-Day Transaction Volume",
        objective:
          "Use a window function to calculate the running total volume per customer across their order history.",
        hint: "SUM(total_amount) OVER (PARTITION BY customer_id ORDER BY order_date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW).",
        starterQuery:
          "SELECT id as order_id, customer_id, order_date, total_amount,\n       SUM(total_amount) OVER (PARTITION BY customer_id ORDER BY order_date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) as rolling_3_orders_vol\nFROM orders\nORDER BY customer_id, order_date;",
        solutionQuery:
          "SELECT id as order_id, customer_id, order_date, total_amount,\n       SUM(total_amount) OVER (PARTITION BY customer_id ORDER BY order_date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) as rolling_3_orders_vol\nFROM orders\nORDER BY customer_id, order_date;",
      },
      {
        stepNumber: 4,
        title: "Generate Compliance Freeze List",
        objective:
          "Produce the final compliance blacklist containing customer IDs, full names, total flagged transactions, and total exposure.",
        hint: "Join flagged customer IDs back to the customers table.",
        starterQuery:
          "SELECT c.id, c.name, c.city, COUNT(o.id) as total_txns, SUM(o.total_amount) as total_exposure\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nGROUP BY c.id, c.name, c.city\nHAVING COUNT(o.id) >= 4 AND AVG(o.total_amount) < 25\nORDER BY total_exposure DESC;",
        solutionQuery:
          "SELECT c.id, c.name, c.city, COUNT(o.id) as total_txns, SUM(o.total_amount) as total_exposure\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nGROUP BY c.id, c.name, c.city\nHAVING COUNT(o.id) >= 4 AND AVG(o.total_amount) < 25\nORDER BY total_exposure DESC;",
      },
    ],
    executiveReportTemplate:
      "### Compliance Summary:\n- Identified 6 suspect accounts displaying micro-charge card testing patterns.\n- Recommended automated hold on accounts with > 4 transactions under $15 within 24 hours.\n- Zero false-positive impact on verified VIP tier.",
  },
  {
    id: "m3",
    title: "SaaS Subscription Cohort Retention & LTV Analysis",
    subtitle:
      "Calculate monthly subscriber retention cohorts, churn velocity, and lifetime customer value",
    category: "SaaS",
    difficulty: "Advanced",
    estimatedMinutes: 30,
    description:
      "A B2B SaaS platform wants to understand monthly revenue retention and user upgrade trajectories across signup cohorts.",
    steps: [
      {
        stepNumber: 1,
        title: "Signup Month Cohort Assignment",
        objective:
          "Assign each customer to a signup cohort based on the month of their very first order.",
        hint: "Use MIN(SUBSTR(order_date, 1, 7)) in a subquery or CTE.",
        starterQuery:
          "SELECT customer_id, MIN(SUBSTR(order_date, 1, 7)) as cohort_month\nFROM orders\nGROUP BY customer_id;",
        solutionQuery:
          "SELECT customer_id, MIN(SUBSTR(order_date, 1, 7)) as cohort_month\nFROM orders\nGROUP BY customer_id;",
      },
      {
        stepNumber: 2,
        title: "Cohort Monthly Revenue Aggregation",
        objective:
          "Calculate the total revenue generated by each signup cohort in subsequent calendar months.",
        hint: "Join customer cohorts with orders and group by cohort_month and order_month.",
        starterQuery:
          "WITH cohorts AS (\n  SELECT customer_id, MIN(SUBSTR(order_date, 1, 7)) as cohort_month\n  FROM orders\n  GROUP BY customer_id\n)\nSELECT c.cohort_month, SUBSTR(o.order_date, 1, 7) as activity_month, SUM(o.total_amount) as cohort_revenue\nFROM orders o\nJOIN cohorts c ON o.customer_id = c.customer_id\nGROUP BY c.cohort_month, activity_month\nORDER BY c.cohort_month, activity_month;",
        solutionQuery:
          "WITH cohorts AS (\n  SELECT customer_id, MIN(SUBSTR(order_date, 1, 7)) as cohort_month\n  FROM orders\n  GROUP BY customer_id\n)\nSELECT c.cohort_month, SUBSTR(o.order_date, 1, 7) as activity_month, SUM(o.total_amount) as cohort_revenue\nFROM orders o\nJOIN cohorts c ON o.customer_id = c.customer_id\nGROUP BY c.cohort_month, activity_month\nORDER BY c.cohort_month, activity_month;",
      },
      {
        stepNumber: 3,
        title: "Cohort Retention Rate Calculation",
        objective:
          "Calculate the percentage of active customers retained in Month 2 compared to Month 1 for each cohort.",
        hint: "COUNT(DISTINCT customer_id) divided by cohort size.",
        starterQuery:
          "SELECT SUBSTR(order_date, 1, 7) as order_month, COUNT(DISTINCT customer_id) as active_subscribers, SUM(total_amount) as monthly_mrr\nFROM orders\nGROUP BY order_month\nORDER BY order_month;",
        solutionQuery:
          "SELECT SUBSTR(order_date, 1, 7) as order_month, COUNT(DISTINCT customer_id) as active_subscribers, SUM(total_amount) as monthly_mrr\nFROM orders\nGROUP BY order_month\nORDER BY order_month;",
      },
      {
        stepNumber: 4,
        title: "Customer Lifetime Value (LTV) Distribution",
        objective:
          "Rank customers by total lifetime revenue and segment into Top 10%, Middle 40%, and Bottom 50% using NTILE(10).",
        hint: "NTILE(10) OVER (ORDER BY SUM(total_amount) DESC).",
        starterQuery:
          "SELECT customer_id, SUM(total_amount) as lifetime_value,\n       NTILE(10) OVER (ORDER BY SUM(total_amount) DESC) as ltv_decile\nFROM orders\nGROUP BY customer_id\nORDER BY lifetime_value DESC;",
        solutionQuery:
          "SELECT customer_id, SUM(total_amount) as lifetime_value,\n       NTILE(10) OVER (ORDER BY SUM(total_amount) DESC) as ltv_decile\nFROM orders\nGROUP BY customer_id\nORDER BY lifetime_value DESC;",
      },
    ],
    executiveReportTemplate:
      "### SaaS Metrics Summary:\n- Q1 Cohort demonstrated 78% Month-2 retention.\n- Top Decile (NTILE 1) accounts account for 54% of overall Net Recurring Revenue.\n- Recommendation: Focus account manager check-ins on Decile 1 & 2 accounts at Day 45.",
  },
  {
    id: "m4",
    title: "10-Minute Grocery Delivery SLA & Fulfillment Audit",
    subtitle:
      "Analyze delivery delays, stockout frequency, and warehouse fulfillment bottlenecks",
    category: "Logistics",
    difficulty: "Intermediate",
    estimatedMinutes: 25,
    description:
      "A quick-commerce platform noticed delivery time breaches during peak hours. Analyze order timestamps, delivery statuses, and inventory shortages.",
    steps: [
      {
        stepNumber: 1,
        title: "Audit Delivery Status Breakdown",
        objective:
          "Calculate total orders, successful deliveries, cancellations, and delivery success rate per city.",
        hint: "Count total orders and use SUM(CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END).",
        starterQuery:
          "SELECT c.city, COUNT(o.id) as total_orders,\n       SUM(CASE WHEN o.status = 'Delivered' THEN 1 ELSE 0 END) as delivered_count,\n       SUM(CASE WHEN o.status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled_count,\n       ROUND(100.0 * SUM(CASE WHEN o.status = 'Delivered' THEN 1 ELSE 0 END) / COUNT(o.id), 1) as success_rate_pct\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nGROUP BY c.city\nORDER BY total_orders DESC;",
        solutionQuery:
          "SELECT c.city, COUNT(o.id) as total_orders,\n       SUM(CASE WHEN o.status = 'Delivered' THEN 1 ELSE 0 END) as delivered_count,\n       SUM(CASE WHEN o.status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled_count,\n       ROUND(100.0 * SUM(CASE WHEN o.status = 'Delivered' THEN 1 ELSE 0 END) / COUNT(o.id), 1) as success_rate_pct\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nGROUP BY c.city\nORDER BY total_orders DESC;",
      },
      {
        stepNumber: 2,
        title: "Identify Low-Stock Out-of-Stock Risk Products",
        objective:
          "Find products with stock under 15 units that have generated more than 3 orders in the past 30 days.",
        hint: "Join products and order_items with WHERE p.stock_quantity < 15.",
        starterQuery:
          "SELECT p.id, p.name, p.category, p.stock_quantity, COUNT(oi.id) as order_frequency\nFROM products p\nJOIN order_items oi ON p.id = oi.product_id\nWHERE p.stock_quantity < 15\nGROUP BY p.id, p.name, p.category, p.stock_quantity\nHAVING COUNT(oi.id) >= 2\nORDER BY p.stock_quantity ASC;",
        solutionQuery:
          "SELECT p.id, p.name, p.category, p.stock_quantity, COUNT(oi.id) as order_frequency\nFROM products p\nJOIN order_items oi ON p.id = oi.product_id\nWHERE p.stock_quantity < 15\nGROUP BY p.id, p.name, p.category, p.stock_quantity\nHAVING COUNT(oi.id) >= 2\nORDER BY p.stock_quantity ASC;",
      },
      {
        stepNumber: 3,
        title: "Peak Hourly Order Volume Analysis",
        objective:
          "Identify peak demand hours to optimize delivery rider fleet allocations.",
        hint: "Group by order date or hour.",
        starterQuery:
          "SELECT order_date, COUNT(*) as daily_orders, SUM(total_amount) as daily_revenue\nFROM orders\nWHERE status = 'Delivered'\nGROUP BY order_date\nORDER BY daily_orders DESC\nLIMIT 7;",
        solutionQuery:
          "SELECT order_date, COUNT(*) as daily_orders, SUM(total_amount) as daily_revenue\nFROM orders\nWHERE status = 'Delivered'\nGROUP BY order_date\nORDER BY daily_orders DESC\nLIMIT 7;",
      },
    ],
    executiveReportTemplate:
      "### Logistics Assessment:\n- Mumbai & Bangalore fulfillment hubs achieved 94.2% delivery SLA compliance.\n- 8 critical SKUs flagged for immediate reorder to prevent stockouts.\n- Fleet capacity recommendation: Reallocate 15% riders to 7 PM-10 PM dinner peak.",
  },
];
