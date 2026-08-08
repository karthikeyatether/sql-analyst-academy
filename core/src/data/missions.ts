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
  category: "E-Commerce" | "FinTech" | "SaaS" | "Logistics" | "Healthcare" | "HR";
  difficulty: "Intermediate" | "Advanced";
  estimatedMinutes: number;
  description: string;
  steps: MissionStep[];
  executiveReportTemplate: string;
}

export const missionCapstones: MissionCapstone[] = [
  {
    id: "m1",
    title: "E-Commerce Customer Churn Audit",
    subtitle:
      "Identify churn risk, high-value customer drop-off, and retention triggers",
    category: "E-Commerce",
    difficulty: "Advanced",
    estimatedMinutes: 25,
    description:
      "Zomato / Swiggy executive leadership noticed a 14% drop in 30-day active diners. Your mission is to write SQL queries to audit order frequency, identify churned VIP accounts, and build an executive summary.",
    steps: [
      {
        stepNumber: 1,
        title: "Identify Active vs Inactive Diners",
        objective:
          "Calculate total orders per customer and classify diners with 0 orders in the last 60 days as CHURN_RISK.",
        hint: "Use COUNT(order_id) and CASE WHEN order_date < DATE('now', '-60 days') THEN 'CHURN_RISK' ELSE 'ACTIVE' END.",
        starterQuery:
          "SELECT c.customer_id, c.full_name, COUNT(o.order_id) as order_count FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id, c.full_name;",
        solutionQuery:
          "SELECT c.customer_id, c.full_name, COUNT(o.order_id) as order_count, CASE WHEN MAX(o.order_date) < '2024-05-01' THEN 'CHURN_RISK' ELSE 'ACTIVE' END as status FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id, c.full_name;",
      },
      {
        stepNumber: 2,
        title: "Revenue Impact of Churned VIPs",
        objective:
          "Find total spent by customers in CHURN_RISK category who previously spent over $500.",
        hint: "Filter aggregated results using HAVING SUM(o.total_amount) > 500.",
        starterQuery:
          "SELECT c.customer_id, c.full_name, SUM(o.total_amount) as total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id, c.full_name HAVING total_spent > 500;",
        solutionQuery:
          "SELECT c.customer_id, c.full_name, SUM(o.total_amount) as total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id, c.full_name HAVING SUM(o.total_amount) > 500 ORDER BY total_spent DESC;",
      },
    ],
    executiveReportTemplate:
      "EXECUTIVE SUMMARY:\n- Identified 142 high-value VIP accounts at churn risk representing $74,500 in past revenue.\n- Recommended Action: Trigger targeted $10 discount coupon to diners inactive for >45 days.",
  },
  {
    id: "m2",
    title: "FinTech Fraud & Refund Leakage Audit",
    subtitle:
      "Detect duplicate refund claims and high-frequency transaction anomalies",
    category: "FinTech",
    difficulty: "Advanced",
    estimatedMinutes: 30,
    description:
      "Audit financial ledger records to uncover duplicate refund claims, un-settled pending payouts, and merchant fraud patterns.",
    steps: [
      {
        stepNumber: 1,
        title: "Detect Duplicate Refund Claims",
        objective:
          "Find orders where refund requests were processed more than once.",
        hint: "Group by order_id and count refund occurrences > 1.",
        starterQuery:
          "SELECT order_id, COUNT(*) as refund_count FROM payments WHERE payment_status = 'Refunded' GROUP BY order_id HAVING refund_count > 1;",
        solutionQuery:
          "SELECT order_id, COUNT(*) as refund_count, SUM(amount) as leaked_amount FROM payments WHERE payment_status = 'Refunded' GROUP BY order_id HAVING COUNT(*) > 1;",
      },
    ],
    executiveReportTemplate:
      "EXECUTIVE SUMMARY:\n- Uncovered $12,400 in duplicate refund payouts across 28 merchant accounts.\n- Recommended Action: Enforce unique constraint on (order_id, refund_type) in payment gateway.",
  },
  {
    id: "m3",
    title: "SaaS Subscription Cohort & MRR Analysis",
    subtitle: "Track monthly recurring revenue and subscriber churn.",
    category: "SaaS",
    difficulty: "Advanced",
    estimatedMinutes: 40,
    description: "The VP of Growth needs to understand the health of the subscription business. You will write queries to track active subscriptions, calculate MRR (Monthly Recurring Revenue), and identify churning cohorts.",
    steps: [
      {
        stepNumber: 1,
        title: "Active vs Churned Subscriber Count",
        objective: "Group subscriptions by status and count the total number of users in each status.",
        hint: "Use COUNT(subscription_id) and GROUP BY status on the subscriptions table.",
        starterQuery: "SELECT status, COUNT(*) as user_count FROM subscriptions GROUP BY status;",
        solutionQuery: "SELECT status, COUNT(*) as user_count, SUM(monthly_fee) as total_revenue FROM subscriptions GROUP BY status ORDER BY total_revenue DESC;"
      },
      {
        stepNumber: 2,
        title: "Identify High-Value Churn Risk",
        objective: "Find the total lost MRR (monthly_fee) from 'Churned' subscribers who had a 'Pro' or 'Enterprise' plan.",
        hint: "Filter for status = 'Churned' and plan_name IN ('Pro', 'Enterprise'), then SUM the monthly_fee.",
        starterQuery: "SELECT plan_name, SUM(monthly_fee) as lost_mrr FROM subscriptions WHERE status = 'Churned' GROUP BY plan_name;",
        solutionQuery: "SELECT plan_name, COUNT(*) as churned_users, SUM(monthly_fee) as lost_mrr FROM subscriptions WHERE status = 'Churned' AND plan_name IN ('Pro', 'Enterprise') GROUP BY plan_name ORDER BY lost_mrr DESC;"
      }
    ],
    executiveReportTemplate: "EXECUTIVE SUMMARY:\n- Detected significant MRR loss from the Pro tier.\n- Recommended Action: Implement automated retention workflows 7 days prior to renewal for Pro and Enterprise cohorts."
  },
  {
    id: "m4",
    title: "Food Delivery Logistics & SLA Audit",
    subtitle: "Analyze delivery times, SLA breaches, and customer satisfaction.",
    category: "Logistics",
    difficulty: "Intermediate",
    estimatedMinutes: 35,
    description: "Operations leadership wants to know if delivery delays are impacting customer ratings. You will audit the food_orders table to find SLA breaches (deliveries > 45 minutes) and correlate them with low ratings.",
    steps: [
      {
        stepNumber: 1,
        title: "Calculate Average Delivery Time by City",
        objective: "Find the average delivery time (in minutes) for each city.",
        hint: "Use AVG(delivery_minutes) and GROUP BY city.",
        starterQuery: "SELECT city, AVG(delivery_minutes) as avg_time FROM food_orders GROUP BY city;",
        solutionQuery: "SELECT city, ROUND(AVG(delivery_minutes), 1) as avg_time, COUNT(*) as total_orders FROM food_orders GROUP BY city ORDER BY avg_time DESC;"
      },
      {
        stepNumber: 2,
        title: "SLA Breach & Rating Correlation",
        objective: "Identify orders where delivery_minutes > 45 (SLA breach) and check the average rating of these delayed orders versus on-time orders.",
        hint: "Use a CASE statement to label orders as 'Delayed' or 'On-Time', then GROUP BY this label and calculate AVG(rating).",
        starterQuery: "SELECT CASE WHEN delivery_minutes > 45 THEN 'Delayed' ELSE 'On-Time' END as delivery_status, AVG(rating) as avg_rating FROM food_orders GROUP BY CASE WHEN delivery_minutes > 45 THEN 'Delayed' ELSE 'On-Time' END;",
        solutionQuery: "SELECT CASE WHEN delivery_minutes > 45 THEN 'Delayed (> 45m)' ELSE 'On-Time' END as delivery_status, COUNT(*) as order_count, ROUND(AVG(rating), 2) as avg_rating FROM food_orders GROUP BY delivery_status ORDER BY avg_rating DESC;"
      }
    ],
    executiveReportTemplate: "EXECUTIVE SUMMARY:\n- Orders exceeding the 45-minute SLA see an average rating drop of 1.2 stars.\n- Recommended Action: Reroute dispatch for high-density areas during peak hours to maintain < 45m SLA."
  },
  {
    id: "m5",
    title: "HR Compensation & Hierarchy Audit",
    subtitle: "Audit salary distributions, departmental budgets, and management structures.",
    category: "HR",
    difficulty: "Advanced",
    estimatedMinutes: 45,
    description: "The CFO wants an audit of departmental salary spending. You will use the employees and departments tables to analyze salary distribution and find departments that are exceeding their allocated budgets.",
    steps: [
      {
        stepNumber: 1,
        title: "Total Salary Spend per Department",
        objective: "Join employees to departments and calculate the total salary_lpa spent by each department.",
        hint: "INNER JOIN employees and departments on department_id, then SUM(salary_lpa).",
        starterQuery: "SELECT d.department_name, SUM(e.salary_lpa) as total_spend FROM employees e JOIN departments d ON e.department_id = d.department_id GROUP BY d.department_name;",
        solutionQuery: "SELECT d.department_name, SUM(e.salary_lpa) as total_spend, d.budget_lakhs FROM employees e JOIN departments d ON e.department_id = d.department_id GROUP BY d.department_name, d.budget_lakhs;"
      },
      {
        stepNumber: 2,
        title: "Identify Over-Budget Departments",
        objective: "Find departments where the total sum of employee salaries exceeds the department's budget_lakhs.",
        hint: "Use HAVING SUM(salary_lpa) > budget_lakhs after grouping.",
        starterQuery: "SELECT d.department_name, SUM(e.salary_lpa) as total_spend, d.budget_lakhs FROM employees e JOIN departments d ON e.department_id = d.department_id GROUP BY d.department_name, d.budget_lakhs HAVING SUM(e.salary_lpa) > d.budget_lakhs;",
        solutionQuery: "SELECT d.department_name, SUM(e.salary_lpa) as total_spend, d.budget_lakhs, (SUM(e.salary_lpa) - d.budget_lakhs) as over_budget_amount FROM employees e JOIN departments d ON e.department_id = d.department_id GROUP BY d.department_name, d.budget_lakhs HAVING total_spend > d.budget_lakhs ORDER BY over_budget_amount DESC;"
      }
    ],
    executiveReportTemplate: "EXECUTIVE SUMMARY:\n- Identified 2 departments exceeding their annual allocated budgets.\n- Recommended Action: Implement immediate hiring freeze for Engineering and restructure marketing overheads."
  }
];
