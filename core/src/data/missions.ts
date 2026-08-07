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
          "SELECT c.id, c.name, COUNT(o.id) as order_count FROM customers c LEFT JOIN orders o ON c.id = o.customer_id GROUP BY c.id, c.name;",
        solutionQuery:
          "SELECT c.id, c.name, COUNT(o.id) as order_count, CASE WHEN MAX(o.order_date) < '2024-05-01' THEN 'CHURN_RISK' ELSE 'ACTIVE' END as status FROM customers c LEFT JOIN orders o ON c.id = o.customer_id GROUP BY c.id, c.name;",
      },
      {
        stepNumber: 2,
        title: "Revenue Impact of Churned VIPs",
        objective:
          "Find total spent by customers in CHURN_RISK category who previously spent over $500.",
        hint: "Filter aggregated results using HAVING SUM(o.amount) > 500.",
        starterQuery:
          "SELECT c.id, c.name, SUM(o.amount) as total_spent FROM customers c JOIN orders o ON c.id = o.customer_id GROUP BY c.id, c.name HAVING total_spent > 500;",
        solutionQuery:
          "SELECT c.id, c.name, SUM(o.amount) as total_spent FROM customers c JOIN orders o ON c.id = o.customer_id GROUP BY c.id, c.name HAVING SUM(o.amount) > 500 ORDER BY total_spent DESC;",
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
          "SELECT order_id, COUNT(*) as refund_count FROM refunds GROUP BY order_id HAVING refund_count > 1;",
        solutionQuery:
          "SELECT order_id, COUNT(*) as refund_count, SUM(amount) as leaked_amount FROM refunds GROUP BY order_id HAVING COUNT(*) > 1;",
      },
    ],
    executiveReportTemplate:
      "EXECUTIVE SUMMARY:\n- Uncovered $12,400 in duplicate refund payouts across 28 merchant accounts.\n- Recommended Action: Enforce unique constraint on (order_id, refund_type) in payment gateway.",
  },
];
