export type SchemaColumn = {
  name: string;
  type: string;
  note: string;
};

export type TableSchema = {
  name: string;
  domain: string;
  description: string;
  primaryKey: string;
  relationships: string[];
  columns: SchemaColumn[];
};

export type SeedTable = {
  name: string;
  rows: Record<string, string | number | boolean | null>[];
};

export const tableSchemas: TableSchema[] = [
  {
    name: "customers",
    domain: "E-Commerce",
    description: "Registered buyers across Indian metro and tier-2 markets.",
    primaryKey: "customer_id",
    relationships: ["orders.customer_id", "subscriptions.customer_id"],
    columns: [
      { name: "customer_id", type: "INT", note: "Unique customer id" },
      { name: "full_name", type: "TEXT", note: "Customer name" },
      { name: "city", type: "TEXT", note: "Primary city" },
      { name: "region", type: "TEXT", note: "Business region" },
      { name: "signup_date", type: "DATE", note: "Acquisition date" },
      { name: "segment", type: "TEXT", note: "Consumer segment" },
      { name: "metadata", type: "TEXT", note: "JSON tracking metadata" }
    ]
  },
  {
    name: "orders",
    domain: "Sales",
    description: "Order headers with revenue, channel, and lifecycle state.",
    primaryKey: "order_id",
    relationships: ["customers.customer_id", "payments.order_id", "order_items.order_id"],
    columns: [
      { name: "order_id", type: "INT", note: "Unique order id" },
      { name: "customer_id", type: "INT", note: "Buyer id" },
      { name: "order_date", type: "DATE", note: "Order date" },
      { name: "channel", type: "TEXT", note: "Acquisition channel" },
      { name: "status", type: "TEXT", note: "Delivered, returned, cancelled" },
      { name: "total_amount", type: "DECIMAL", note: "Gross order value" },
      { name: "discount_amount", type: "DECIMAL", note: "Discount applied" }
    ]
  },
  {
    name: "products",
    domain: "Product Performance",
    description: "Sellable catalog with category, brand, and unit economics.",
    primaryKey: "product_id",
    relationships: ["order_items.product_id"],
    columns: [
      { name: "product_id", type: "INT", note: "Unique product id" },
      { name: "product_name", type: "TEXT", note: "Product display name" },
      { name: "category", type: "TEXT", note: "Merchandising category" },
      { name: "brand", type: "TEXT", note: "Brand or vendor" },
      { name: "cost_price", type: "DECIMAL", note: "Cost to company" },
      { name: "list_price", type: "DECIMAL", note: "Catalog list price" }
    ]
  },
  {
    name: "order_items",
    domain: "Sales",
    description: "Line-item grain for product quantity and margin analysis.",
    primaryKey: "order_item_id",
    relationships: ["orders.order_id", "products.product_id"],
    columns: [
      { name: "order_item_id", type: "INT", note: "Unique line id" },
      { name: "order_id", type: "INT", note: "Parent order id" },
      { name: "product_id", type: "INT", note: "Sold product id" },
      { name: "quantity", type: "INT", note: "Units sold" },
      { name: "unit_price", type: "DECIMAL", note: "Price per unit" }
    ]
  },
  {
    name: "payments",
    domain: "Finance",
    description: "Payment attempts and modes for revenue reconciliation.",
    primaryKey: "payment_id",
    relationships: ["orders.order_id"],
    columns: [
      { name: "payment_id", type: "INT", note: "Unique payment id" },
      { name: "order_id", type: "INT", note: "Associated order" },
      { name: "payment_date", type: "DATE", note: "Settlement date" },
      { name: "payment_mode", type: "TEXT", note: "UPI, card, wallet, netbanking" },
      { name: "payment_status", type: "TEXT", note: "Success, failed, refunded" },
      { name: "amount", type: "DECIMAL", note: "Settled value" }
    ]
  },
  {
    name: "subscriptions",
    domain: "Retention",
    description: "Subscription lifecycle data for churn and retention analysis.",
    primaryKey: "subscription_id",
    relationships: ["customers.customer_id"],
    columns: [
      { name: "subscription_id", type: "INT", note: "Unique subscription id" },
      { name: "customer_id", type: "INT", note: "Subscriber id" },
      { name: "plan_name", type: "TEXT", note: "Plan tier" },
      { name: "start_date", type: "DATE", note: "Activation date" },
      { name: "end_date", type: "DATE", note: "Nullable churn date" },
      { name: "monthly_fee", type: "DECIMAL", note: "Monthly recurring revenue" },
      { name: "status", type: "TEXT", note: "Active, paused, churned" }
    ]
  },
  {
    name: "departments",
    domain: "Employees",
    description: "Department dimension for HR analytics and reporting.",
    primaryKey: "department_id",
    relationships: ["employees.department_id"],
    columns: [
      { name: "department_id", type: "INT", note: "Unique department id" },
      { name: "department_name", type: "TEXT", note: "Business unit" },
      { name: "office_city", type: "TEXT", note: "Main office location" },
      { name: "budget_lakhs", type: "DECIMAL", note: "Annual budget in INR lakhs" }
    ]
  },
  {
    name: "employees",
    domain: "Employees",
    description: "Employee facts for workforce, compensation, and manager analysis.",
    primaryKey: "employee_id",
    relationships: ["departments.department_id", "employees.manager_id"],
    columns: [
      { name: "employee_id", type: "INT", note: "Unique employee id" },
      { name: "employee_name", type: "TEXT", note: "Employee name" },
      { name: "department_id", type: "INT", note: "Department id" },
      { name: "manager_id", type: "INT", note: "Nullable manager id" },
      { name: "hire_date", type: "DATE", note: "Joining date" },
      { name: "salary_lpa", type: "DECIMAL", note: "Annual salary in lakhs" },
      { name: "role", type: "TEXT", note: "Job role" }
    ]
  },
  {
    name: "food_orders",
    domain: "Food Delivery",
    description: "Restaurant delivery orders with ratings and delivery durations.",
    primaryKey: "food_order_id",
    relationships: [],
    columns: [
      { name: "food_order_id", type: "INT", note: "Unique food order id" },
      { name: "restaurant", type: "TEXT", note: "Restaurant name" },
      { name: "city", type: "TEXT", note: "Delivery city" },
      { name: "order_date", type: "DATE", note: "Order date" },
      { name: "gross_value", type: "DECIMAL", note: "Cart value" },
      { name: "delivery_minutes", type: "INT", note: "Delivery time" },
      { name: "rating", type: "DECIMAL", note: "Customer rating" }
    ]
  }
];

export const seedTables: SeedTable[] = [
  {
    name: "customers",
    rows: [
      { customer_id: 1, full_name: "Aarav Mehta", city: "Mumbai", region: "West", signup_date: "2023-01-18", segment: "Premium", metadata: '{"device": "Mobile", "app_version": "v4.2.1", "referred_by": 3}' },
      { customer_id: 2, full_name: "Ananya Rao", city: "Bengaluru", region: "South", signup_date: "2023-02-05", segment: "Student", metadata: '{"device": "Web", "app_version": "v1.0.8", "referred_by": null}' },
      { customer_id: 3, full_name: "Kabir Singh", city: "Delhi", region: "North", signup_date: "2023-02-21", segment: "Value", metadata: '{"device": "Mobile", "app_version": "v4.2.0", "referred_by": null}' },
      { customer_id: 4, full_name: "Meera Nair", city: "Kochi", region: "South", signup_date: "2023-03-11", segment: "Premium", metadata: '{"device": "Mobile", "app_version": "v4.2.1", "referred_by": 1}' },
      { customer_id: 5, full_name: "Riya Patel", city: "Ahmedabad", region: "West", signup_date: "2023-03-29", segment: "Value", metadata: '{"device": "Web", "app_version": "v1.0.9", "referred_by": null}' },
      { customer_id: 6, full_name: "Ishaan Gupta", city: "Pune", region: "West", signup_date: "2023-04-12", segment: "Premium", metadata: '{"device": "Mobile", "app_version": "v4.2.2", "referred_by": null}' },
      { customer_id: 7, full_name: "Sara Khan", city: "Hyderabad", region: "South", signup_date: "2023-05-06", segment: "Student", metadata: '{"device": "Web", "app_version": "v1.0.8", "referred_by": 2}' },
      { customer_id: 8, full_name: "Vivaan Iyer", city: "Chennai", region: "South", signup_date: "2023-06-17", segment: "Value", metadata: '{"device": "Mobile", "app_version": "v4.1.9", "referred_by": null}' },
      { customer_id: 9, full_name: "Nisha Verma", city: "Jaipur", region: "North", signup_date: "2023-07-09", segment: "Premium", metadata: '{"device": "Web", "app_version": "v1.0.9", "referred_by": 4}' },
      { customer_id: 10, full_name: "Arjun Das", city: "Kolkata", region: "East", signup_date: "2023-07-30", segment: "Value", metadata: '{"device": "Mobile", "app_version": "v4.2.2", "referred_by": null}' },
      { customer_id: 11, full_name: "Tara Sen", city: "Gurugram", region: "North", signup_date: "2023-08-16", segment: "Premium", metadata: '{"device": "Mobile", "app_version": "v4.2.3", "referred_by": 9}' },
      { customer_id: 12, full_name: "Dev Malhotra", city: "Indore", region: "Central", signup_date: "2023-09-01", segment: "Student", metadata: '{"device": "Web", "app_version": "v1.0.7", "referred_by": null}' }
    ]
  },
  {
    name: "orders",
    rows: [
      { order_id: 1001, customer_id: 1, order_date: "2024-01-03", channel: "App", status: "Delivered", total_amount: 5799, discount_amount: 300 },
      { order_id: 1002, customer_id: 2, order_date: "2024-01-08", channel: "Web", status: "Delivered", total_amount: 2199, discount_amount: 150 },
      { order_id: 1003, customer_id: 3, order_date: "2024-01-12", channel: "Marketplace", status: "Returned", total_amount: 1599, discount_amount: 100 },
      { order_id: 1004, customer_id: 4, order_date: "2024-02-02", channel: "App", status: "Delivered", total_amount: 8499, discount_amount: 500 },
      { order_id: 1005, customer_id: 5, order_date: "2024-02-12", channel: "Web", status: "Cancelled", total_amount: 1199, discount_amount: 0 },
      { order_id: 1006, customer_id: 6, order_date: "2024-02-19", channel: "App", status: "Delivered", total_amount: 12999, discount_amount: 700 },
      { order_id: 1007, customer_id: 7, order_date: "2024-03-05", channel: "App", status: "Delivered", total_amount: 3299, discount_amount: 250 },
      { order_id: 1008, customer_id: 8, order_date: "2024-03-11", channel: "Web", status: "Delivered", total_amount: 4599, discount_amount: 200 },
      { order_id: 1009, customer_id: 9, order_date: "2024-03-22", channel: "Marketplace", status: "Delivered", total_amount: 9499, discount_amount: 900 },
      { order_id: 1010, customer_id: 1, order_date: "2024-04-01", channel: "App", status: "Delivered", total_amount: 2499, discount_amount: 100 },
      { order_id: 1011, customer_id: 10, order_date: "2024-04-15", channel: "Web", status: "Delivered", total_amount: 6999, discount_amount: 650 },
      { order_id: 1012, customer_id: 11, order_date: "2024-05-03", channel: "App", status: "Delivered", total_amount: 15499, discount_amount: 1000 },
      { order_id: 1013, customer_id: 12, order_date: "2024-05-18", channel: "Marketplace", status: "Returned", total_amount: 1799, discount_amount: 120 },
      { order_id: 1014, customer_id: 4, order_date: "2024-06-02", channel: "App", status: "Delivered", total_amount: 3999, discount_amount: 300 },
      { order_id: 1015, customer_id: 6, order_date: "2024-06-14", channel: "Web", status: "Delivered", total_amount: 10999, discount_amount: 800 }
    ]
  },
  {
    name: "products",
    rows: [
      { product_id: 201, product_name: "Wireless Mouse Pro", category: "Electronics", brand: "NovaTech", cost_price: 750, list_price: 1299 },
      { product_id: 202, product_name: "Ergo Keyboard", category: "Electronics", brand: "NovaTech", cost_price: 1800, list_price: 2799 },
      { product_id: 203, product_name: "Cotton Kurta", category: "Fashion", brand: "Indigo Loom", cost_price: 600, list_price: 1499 },
      { product_id: 204, product_name: "Running Shoes", category: "Fashion", brand: "StrideX", cost_price: 2100, list_price: 3999 },
      { product_id: 205, product_name: "Steel Water Bottle", category: "Home", brand: "DailyNest", cost_price: 280, list_price: 799 },
      { product_id: 206, product_name: "Office Chair", category: "Home", brand: "WorkWell", cost_price: 5200, list_price: 8999 },
      { product_id: 207, product_name: "Noise Cancelling Headphones", category: "Electronics", brand: "SoundPeak", cost_price: 4600, list_price: 7999 },
      { product_id: 208, product_name: "Yoga Mat", category: "Wellness", brand: "FitSpace", cost_price: 550, list_price: 1199 }
    ]
  },
  {
    name: "order_items",
    rows: [
      { order_item_id: 1, order_id: 1001, product_id: 207, quantity: 1, unit_price: 5799 },
      { order_item_id: 2, order_id: 1002, product_id: 202, quantity: 1, unit_price: 2199 },
      { order_item_id: 3, order_id: 1003, product_id: 203, quantity: 1, unit_price: 1599 },
      { order_item_id: 4, order_id: 1004, product_id: 206, quantity: 1, unit_price: 8499 },
      { order_item_id: 5, order_id: 1005, product_id: 205, quantity: 2, unit_price: 599 },
      { order_item_id: 6, order_id: 1006, product_id: 207, quantity: 1, unit_price: 7999 },
      { order_item_id: 7, order_id: 1006, product_id: 202, quantity: 2, unit_price: 2500 },
      { order_item_id: 8, order_id: 1007, product_id: 204, quantity: 1, unit_price: 3299 },
      { order_item_id: 9, order_id: 1008, product_id: 201, quantity: 1, unit_price: 1099 },
      { order_item_id: 10, order_id: 1008, product_id: 208, quantity: 3, unit_price: 1167 },
      { order_item_id: 11, order_id: 1009, product_id: 206, quantity: 1, unit_price: 9499 },
      { order_item_id: 12, order_id: 1010, product_id: 203, quantity: 1, unit_price: 2499 },
      { order_item_id: 13, order_id: 1011, product_id: 204, quantity: 2, unit_price: 3499 },
      { order_item_id: 14, order_id: 1012, product_id: 207, quantity: 1, unit_price: 7999 },
      { order_item_id: 15, order_id: 1012, product_id: 206, quantity: 1, unit_price: 7500 },
      { order_item_id: 16, order_id: 1013, product_id: 205, quantity: 3, unit_price: 599 },
      { order_item_id: 17, order_id: 1014, product_id: 204, quantity: 1, unit_price: 3999 },
      { order_item_id: 18, order_id: 1015, product_id: 207, quantity: 1, unit_price: 6999 },
      { order_item_id: 19, order_id: 1015, product_id: 201, quantity: 3, unit_price: 1333 }
    ]
  },
  {
    name: "payments",
    rows: [
      { payment_id: 5001, order_id: 1001, payment_date: "2024-01-03", payment_mode: "UPI", payment_status: "Success", amount: 5799 },
      { payment_id: 5002, order_id: 1002, payment_date: "2024-01-08", payment_mode: "Card", payment_status: "Success", amount: 2199 },
      { payment_id: 5003, order_id: 1003, payment_date: "2024-01-14", payment_mode: "Wallet", payment_status: "Refunded", amount: 1599 },
      { payment_id: 5004, order_id: 1004, payment_date: "2024-02-02", payment_mode: "UPI", payment_status: "Success", amount: 8499 },
      { payment_id: 5005, order_id: 1005, payment_date: "2024-02-12", payment_mode: "UPI", payment_status: "Failed", amount: 0 },
      { payment_id: 5006, order_id: 1006, payment_date: "2024-02-19", payment_mode: "Netbanking", payment_status: "Success", amount: 12999 },
      { payment_id: 5007, order_id: 1007, payment_date: "2024-03-05", payment_mode: "UPI", payment_status: "Success", amount: 3299 },
      { payment_id: 5008, order_id: 1008, payment_date: "2024-03-11", payment_mode: "Card", payment_status: "Success", amount: 4599 },
      { payment_id: 5009, order_id: 1009, payment_date: "2024-03-22", payment_mode: "Wallet", payment_status: "Success", amount: 9499 },
      { payment_id: 5010, order_id: 1010, payment_date: "2024-04-01", payment_mode: "UPI", payment_status: "Success", amount: 2499 },
      { payment_id: 5011, order_id: 1011, payment_date: "2024-04-15", payment_mode: "Card", payment_status: "Success", amount: 6999 },
      { payment_id: 5012, order_id: 1012, payment_date: "2024-05-03", payment_mode: "UPI", payment_status: "Success", amount: 15499 },
      { payment_id: 5013, order_id: 1013, payment_date: "2024-05-20", payment_mode: "UPI", payment_status: "Refunded", amount: 1799 },
      { payment_id: 5014, order_id: 1014, payment_date: "2024-06-02", payment_mode: "Netbanking", payment_status: "Success", amount: 3999 },
      { payment_id: 5015, order_id: 1015, payment_date: "2024-06-14", payment_mode: "Card", payment_status: "Success", amount: 10999 }
    ]
  },
  {
    name: "subscriptions",
    rows: [
      { subscription_id: 9001, customer_id: 1, plan_name: "Pro", start_date: "2024-01-01", end_date: null, monthly_fee: 899, status: "Active" },
      { subscription_id: 9002, customer_id: 2, plan_name: "Starter", start_date: "2024-01-10", end_date: null, monthly_fee: 299, status: "Active" },
      { subscription_id: 9003, customer_id: 3, plan_name: "Starter", start_date: "2024-01-15", end_date: "2024-04-15", monthly_fee: 299, status: "Churned" },
      { subscription_id: 9004, customer_id: 4, plan_name: "Pro", start_date: "2024-02-01", end_date: null, monthly_fee: 899, status: "Active" },
      { subscription_id: 9005, customer_id: 6, plan_name: "Enterprise", start_date: "2024-02-20", end_date: null, monthly_fee: 1499, status: "Active" },
      { subscription_id: 9006, customer_id: 8, plan_name: "Starter", start_date: "2024-03-12", end_date: "2024-05-12", monthly_fee: 299, status: "Churned" },
      { subscription_id: 9007, customer_id: 11, plan_name: "Enterprise", start_date: "2024-05-03", end_date: null, monthly_fee: 1499, status: "Active" },
      { subscription_id: 9008, customer_id: 12, plan_name: "Starter", start_date: "2024-05-18", end_date: null, monthly_fee: 299, status: "Paused" }
    ]
  },
  {
    name: "departments",
    rows: [
      { department_id: 10, department_name: "Analytics", office_city: "Bengaluru", budget_lakhs: 180 },
      { department_id: 20, department_name: "Sales", office_city: "Mumbai", budget_lakhs: 220 },
      { department_id: 30, department_name: "Customer Success", office_city: "Gurugram", budget_lakhs: 130 },
      { department_id: 40, department_name: "Finance", office_city: "Pune", budget_lakhs: 95 },
      { department_id: 50, department_name: "Operations", office_city: "Hyderabad", budget_lakhs: 155 }
    ]
  },
  {
    name: "employees",
    rows: [
      { employee_id: 701, employee_name: "Priya Menon", department_id: 10, manager_id: null, hire_date: "2020-04-12", salary_lpa: 26, role: "Analytics Manager" },
      { employee_id: 702, employee_name: "Rahul Bansal", department_id: 10, manager_id: 701, hire_date: "2021-06-01", salary_lpa: 13.5, role: "Data Analyst" },
      { employee_id: 703, employee_name: "Sneha Jain", department_id: 10, manager_id: 701, hire_date: "2022-01-20", salary_lpa: 11, role: "BI Analyst" },
      { employee_id: 704, employee_name: "Karan Shetty", department_id: 20, manager_id: null, hire_date: "2019-11-18", salary_lpa: 24, role: "Sales Lead" },
      { employee_id: 705, employee_name: "Fatima Ali", department_id: 20, manager_id: 704, hire_date: "2022-08-04", salary_lpa: 9.5, role: "Account Executive" },
      { employee_id: 706, employee_name: "Manav Suri", department_id: 30, manager_id: null, hire_date: "2021-02-15", salary_lpa: 18, role: "CS Manager" },
      { employee_id: 707, employee_name: "Lina Dutta", department_id: 30, manager_id: 706, hire_date: "2023-03-01", salary_lpa: 8, role: "Support Analyst" },
      { employee_id: 708, employee_name: "Vikram Joshi", department_id: 40, manager_id: null, hire_date: "2020-09-27", salary_lpa: 21, role: "Finance Manager" },
      { employee_id: 709, employee_name: "Neel Shah", department_id: 50, manager_id: null, hire_date: "2018-05-22", salary_lpa: 23, role: "Ops Manager" },
      { employee_id: 710, employee_name: "Pooja Roy", department_id: 50, manager_id: 709, hire_date: "2022-12-10", salary_lpa: 10.5, role: "Operations Analyst" }
    ]
  },
  {
    name: "food_orders",
    rows: [
      { food_order_id: 3001, restaurant: "Spice Route", city: "Delhi", order_date: "2024-05-01", gross_value: 740, delivery_minutes: 34, rating: 4.6 },
      { food_order_id: 3002, restaurant: "Dosa Central", city: "Bengaluru", order_date: "2024-05-01", gross_value: 420, delivery_minutes: 28, rating: 4.4 },
      { food_order_id: 3003, restaurant: "Biriyani Box", city: "Hyderabad", order_date: "2024-05-02", gross_value: 890, delivery_minutes: 42, rating: 4.7 },
      { food_order_id: 3004, restaurant: "Cafe Mandala", city: "Pune", order_date: "2024-05-02", gross_value: 510, delivery_minutes: 31, rating: 4.2 },
      { food_order_id: 3005, restaurant: "Bombay Bites", city: "Mumbai", order_date: "2024-05-03", gross_value: 680, delivery_minutes: 39, rating: 4.5 },
      { food_order_id: 3006, restaurant: "Tandoor House", city: "Gurugram", order_date: "2024-05-03", gross_value: 1120, delivery_minutes: 48, rating: 4.1 },
      { food_order_id: 3007, restaurant: "Coastal Curry", city: "Kochi", order_date: "2024-05-04", gross_value: 760, delivery_minutes: 36, rating: 4.8 },
      { food_order_id: 3008, restaurant: "Noodle Yard", city: "Chennai", order_date: "2024-05-04", gross_value: 620, delivery_minutes: 29, rating: 4.3 }
    ]
  }
];

export const tableNames = tableSchemas.map((table) => table.name);

export const datasetDomains = Array.from(new Set(tableSchemas.map((table) => table.domain)));
