import { problemsBatch1 } from "./problems_batch1.ts";

import { batch2Problems } from "./problems_batch2.ts";

import { problemsBatch3 } from "./problems_batch3.ts";

export type ModuleLevel = "Beginner" | "Intermediate" | "Advanced";

export type Difficulty = "Easy" | "Medium" | "Hard";

export type LessonExample = {

  title: string;

  query: string;

  explanation: string;

};

export type PracticeProblem = {

  id: string;

  moduleId: number;

  difficulty: Difficulty;

  title: string;

  businessScenario: string;

  prompt: string;

  starterQuery: string;

  solution: string;

  hints: string[];

  detailedExplanation: string;

  alternativeApproach: string;

  performanceNotes: string;

  concepts: string[];

  companyTags?: string[];

  isEssential?: boolean;

};

export type Lesson = {

  conceptExplanation: string;

  visualExplanation: string;

  realBusinessScenario: string;

  examples: LessonExample[];

  commonMistakes: string[];

  interviewQuestions: string[];

  revisionNotes: string[];

  cheatSheet: string[];

};

export type RoadmapModule = {

  id: number;

  title: string;

  level: ModuleLevel;

  track: string;

  outcome: string;

  lesson: Lesson;

  problems: PracticeProblem[];

  prerequisites: number[];

  isHighWeight?: boolean;

};



// REAL LESSON CONTENT per module



const realLessons: Record<number, Lesson> = {
1: {

        conceptExplanation: `A database is an organised collection of structured data stored in tables. Each
      table represents one real-world entity — customers, orders, products.

A table has:

- Rows (records): one row = one entity (e.g., one customer)

- Columns (fields): each column holds one attribute (e.g., city, signup_date)

- Primary Key: a column that uniquely identifies every row (e.g., customer_id)

- Foreign Key: a column that references the primary key of another table (e.g., orders.customer_id refers to
customers.customer_id)

In this course you will work with a realistic Indian e-commerce dataset:

• customers — buyer profiles with city, region, segment

• orders — purchase headers with date, status, amount

• order_items — line items linking orders to products

• products — product catalog with category and price

• payments — payment method and status per order

• employees — internal HR data

• subscriptions — subscription plan history

SQL (Structured Query Language) is the language you use to ask questions of this data. Every query you write
follows a logical execution order that we will learn step by step.`,

    visualExplanation: `Think of the database as a company's filing cabinet:

- Each DRAWER = one table (Customers drawer, Orders drawer)

- Each FILE = one row (one customer's record)

- Each COLUMN = a labelled field on the file (name, city, date)

The PRIMARY KEY is the unique file number that prevents duplicates.

The FOREIGN KEY is a note inside the Orders file that says "this order belongs to customer #42" — it links
files across drawers.

Relationships:

customers (1) ──< orders (many)     one customer can place many orders

orders (1) ──< order_items (many)   one order can have many products

order_items (many) >── products (1) many items can refer to one product`,

        realBusinessScenario: `You join Flipkart's Analytics team. Your manager asks: "How many customers do
      we have in each city?". Before writing a single line of SQL you need to understand:

1. Which table holds customer data? → customers

2. Which column has the city? → city

3. What is the grain (one row = one what)? → one customer

This mental model — table → column → grain — is the foundation of every query you will ever write.`,

    examples: [

      {

        title: "Explore the customers table",

        query: `SELECT *

FROM customers

LIMIT 10;`,

                explanation: "SELECT * means 'give me all columns'. FROM customers tells SQL which table. " +
                             "LIMIT 10 prevents returning thousands of rows — always use LIMIT when exploring."

      },

      {

        title: "Explore the orders table and understand foreign keys",

        query: `SELECT

  order_id,

  customer_id,

  order_date,

  status,

  total_amount

FROM orders

LIMIT 10;`,

                explanation: "customer_id here is a FOREIGN KEY — it matches customer_id in the customers " +
                             "table. This link lets us join the two tables later to answer questions like " +
                             "'what did each customer order?'."

      }

    ],

    commonMistakes: [

      "Using SELECT * in production queries — always name the columns you need.",

      "Confusing rows with columns — a row is one record, a column is one attribute.",

      "Forgetting LIMIT when exploring — large tables can return millions of rows and crash your session."

    ],

    interviewQuestions: [

      "What is the difference between a primary key and a foreign key?",

      "What does 'grain of a table' mean? Give an example.",

      "If a customer places 3 orders, how many rows would appear in the orders table for that customer?"

    ],

    revisionNotes: [

      "Table = entity. Row = one instance. Column = one attribute.",

      "Primary key uniquely identifies a row. Foreign key links to another table's primary key.",

      "Always identify the grain before writing a query: one row = one WHAT?"

    ],

    cheatSheet: [

      "SELECT * FROM table LIMIT 10; — quick table peek",

      "Grain rule: one row = one [customer / order / product]",

      "Relationships: customers 1 → ∞ orders → ∞ order_items"

    ]

  },

2: {

        conceptExplanation: `WHERE filters ROWS before any grouping or selection happens. It is your first
      line of defence against processing unnecessary data.

Syntax:

  SELECT columns

  FROM table

  WHERE condition;

Comparison operators:

  =    equal to           WHERE status = 'Delivered'

  !=   not equal          WHERE status != 'Cancelled'

  >    greater than       WHERE total_amount > 1000

  >=   greater or equal   WHERE total_amount >= 500

  <    less than

  <=   less or equal

Logical operators (combine conditions):

  AND  — both conditions must be true

  OR   — at least one condition must be true

  NOT  — reverses the condition

Range and list operators:

  BETWEEN x AND y   WHERE total_amount BETWEEN 500 AND 2000

  IN (...)          WHERE city IN ('Mumbai', 'Delhi', 'Bengaluru')

  LIKE 'pattern'    WHERE full_name LIKE 'Amit%'  (% = any characters)

  IS NULL           WHERE discount_amount IS NULL

  IS NOT NULL       WHERE discount_amount IS NOT NULL

Important: String values need SINGLE quotes. Numbers do not.

  WHERE city = 'Mumbai'   ✓ correct

  WHERE city = Mumbai     ✗ error`,

    visualExplanation: `Imagine the full orders table has 1000 rows. Without WHERE, SELECT returns all 1000.

orders table (1000 rows):

┌──────────┬────────────┬──────────────┐

│ order_id │ status     │ total_amount │

├──────────┼────────────┼──────────────┤

│ 1        │ Delivered  │ 1200         │

│ 2        │ Cancelled  │ 500          │

│ 3        │ Returned   │ 800          │

│ 4        │ Delivered  │ 3400         │

└──────────┴────────────┴──────────────┘

After WHERE status = 'Delivered':

┌──────────┬────────────┬──────────────┐

│ 1        │ Delivered  │ 1200         │

│ 4        │ Delivered  │ 3400         │

└──────────┴────────────┴──────────────┘

WHERE removes rows. SELECT then chooses columns FROM the remaining rows.`,

        realBusinessScenario: `A Myntra analyst is calculating monthly GMV (Gross Merchandise Value). If they
      forget to filter WHERE status = 'Delivered', they will include cancelled and returned orders in the
      revenue figure — causing the stakeholder to see inflated revenue.

This is a real interview trap: "What is the first thing you check when your revenue number looks too high?"

Answer: Check whether you filtered by order status.`,

    examples: [

      {

        title: "Filter delivered orders in a specific region",

        query: `SELECT

  order_id,

  customer_id,

  order_date,

  total_amount,

  status

FROM orders

WHERE status = 'Delivered'

  AND total_amount > 1000

LIMIT 20;`,

                explanation: "AND means both conditions must be true. Only rows that are Delivered AND have " +
                             "total_amount above 1000 will appear."

      },

      {

        title: "Filter using IN for multiple cities",

        query: `SELECT

  customer_id,

  full_name,

  city,

  segment

FROM customers

WHERE city IN ('Mumbai', 'Bengaluru', 'Delhi', 'Hyderabad')

ORDER BY city;`,

                explanation: "IN is cleaner than writing city = 'Mumbai' OR city = 'Bengaluru' OR ... Use IN " +
                             "when you have a list of allowed values."

      }

    ],

    commonMistakes: [

      "Using WHERE with aggregates — WHERE runs before GROUP BY, so you cannot write " +
      "WHERE COUNT(*) > 5. Use HAVING instead.",

      "Using = to compare NULL — write IS NULL, not = NULL.",

      "Forgetting that LIKE is case-sensitive in some databases — use ILIKE in " +
      "PostgreSQL or LOWER(col) LIKE '%value%'.",

      "Using double quotes for string values — SQL strings use single quotes."

    ],

    interviewQuestions: [

      "What is the difference between using '=' and 'LIKE' for filtering text?",

      "Why can't you use WHERE COUNT(*) > 5?",

      "How do you filter for NULL values? Why doesn't = NULL work?"

    ],

    revisionNotes: [

      "WHERE filters rows BEFORE GROUP BY. HAVING filters groups AFTER GROUP BY.",

      "NULL comparisons: always use IS NULL or IS NOT NULL.",

      "IN is equivalent to multiple ORs but cleaner."

    ],

    cheatSheet: [

      "WHERE col = 'value' AND col2 > 100",

      "WHERE city IN ('Mumbai','Delhi','Bengaluru')",

      "WHERE col IS NULL / IS NOT NULL",

      "WHERE name LIKE 'A%' — starts with A"

    ]

  },

3: {

        conceptExplanation: `ORDER BY sorts the result rows. Without ORDER BY, SQL returns rows in an
      arbitrary order — never rely on the default.

Syntax:

  ORDER BY column1 [ASC|DESC], column2 [ASC|DESC];

ASC  = ascending  (A→Z, 0→9, oldest→newest) — this is the DEFAULT

DESC = descending (Z→A, 9→0, newest→oldest)

You can sort by multiple columns. The second column is used as a tiebreaker when the first column has equal values.

ORDER BY is the LAST logical step before LIMIT — it runs after SELECT, so you CAN use SELECT aliases in ORDER BY.

Sorting NULL values:

  PostgreSQL/BigQuery: NULLs go LAST in ASC, FIRST in DESC by default

  SQLite (used here): NULLs sort first in ASC

ORDER BY position number (avoid in production):

  ORDER BY 1 DESC  -- sorts by the first selected column -- avoid this`,

    visualExplanation: `Unsorted result:

│ city      │ revenue │

│ Chennai   │ 45000   │

│ Mumbai    │ 120000  │

│ Delhi     │ 85000   │

After ORDER BY revenue DESC:

│ Mumbai    │ 120000  │ ← highest first

│ Delhi     │ 85000   │

│ Chennai   │ 45000   │

Multi-column sort — by region then by revenue DESC:

│ North │ Delhi   │ 85000 │

│ North │ Jaipur  │ 42000 │

│ South │ Chennai │ 45000 │

│ West  │ Mumbai  │ 120000│`,

        realBusinessScenario: `A CRED analyst builds a "top cities by transaction value" leaderboard for the
      weekly business review. The stakeholder expects the highest-value city at the top. If ORDER BY is
      missing, the output is random and looks unprofessional.

Interview question: "If you run the same query twice and get rows in different order, what would you add to
guarantee consistency?" → ORDER BY on a unique or stable column.`,

    examples: [

      {

        title: "Top 10 orders by value",

        query: `SELECT

  order_id,

  customer_id,

  total_amount,

  discount_amount,

  total_amount - discount_amount AS net_amount,

  order_date

FROM orders

WHERE status = 'Delivered'

ORDER BY net_amount DESC

LIMIT 10;`,

                explanation: "We filter to delivered orders, compute net_amount in SELECT, then sort by that " +
                             "alias. ORDER BY can reference SELECT aliases because it runs after SELECT."

      },

      {

        title: "Multi-column sort — region then signup date",

        query: `SELECT

  customer_id,

  full_name,

  region,

  signup_date

FROM customers

ORDER BY region ASC, signup_date DESC;`,

                explanation: "First sort by region alphabetically. Within the same region, show the most " +
                             "recently signed-up customers first."

      }

    ],

    commonMistakes: [

      "Relying on the default row order — databases can return rows in any order without ORDER BY.",

      "Using ORDER BY with a column not in SELECT when DISTINCT is used — not allowed in most databases.",

      "Sorting by position number (ORDER BY 1) — breaks silently if you rearrange SELECT columns."

    ],

    interviewQuestions: [

      "Can you reference a SELECT alias in ORDER BY? Why can you here but not in WHERE?",

      "What is the default sort direction in ORDER BY?",

      "How would you show the top 5 customers by lifetime value?"

    ],

    revisionNotes: [

      "ORDER BY runs AFTER SELECT — aliases are available.",

      "Default direction is ASC. Always write DESC explicitly for descending.",

      "Use multiple columns for stable, deterministic sorting."

    ],

    cheatSheet: [

      "ORDER BY col DESC — largest first",

      "ORDER BY col1 ASC, col2 DESC — multi-column sort",

      "Always add ORDER BY to make results reproducible"

    ]

  },

4: {

        conceptExplanation: `LIMIT (also called FETCH FIRST or TOP in other databases) restricts the number
      of rows returned.

Syntax (SQLite / MySQL / PostgreSQL):

  LIMIT n           -- return first n rows

  LIMIT n OFFSET m  -- skip m rows then return n rows

Why you need LIMIT:

1. Exploratory queries — peek at a table without loading millions of rows

2. Top-N reports — "show top 10 customers"

3. Pagination — page 1 = LIMIT 10 OFFSET 0, page 2 = LIMIT 10 OFFSET 10

OFFSET for pagination:

  Page 1: LIMIT 10 OFFSET 0

  Page 2: LIMIT 10 OFFSET 10

  Page 3: LIMIT 10 OFFSET 20

Always pair LIMIT with ORDER BY when you want meaningful top-N results.

Without ORDER BY, LIMIT returns an arbitrary set of rows.`,

    visualExplanation: `Table has 1000 rows ordered by revenue DESC:

Row 1: Mumbai — 120,000

Row 2: Delhi  — 85,000

Row 3: Pune   — 62,000

...

Row 1000: ...

LIMIT 3 → returns only rows 1, 2, 3.

LIMIT 3 OFFSET 2 → skips rows 1-2, returns rows 3, 4, 5.`,

        realBusinessScenario: `Every analyst dashboard has a "Top 10" widget — top products, top cities, top
      customers. LIMIT powers all of them. In interviews, when asked to find "the customer with the highest
      order value", a clean answer uses ORDER BY + LIMIT 1 rather than a complex subquery.`,

    examples: [

      {

        title: "Top 5 most expensive orders",

        query: `SELECT

  order_id,

  customer_id,

  total_amount,

  order_date

FROM orders

WHERE status = 'Delivered'

ORDER BY total_amount DESC

LIMIT 5;`,

                explanation: "ORDER BY total_amount DESC ensures the highest values are first. LIMIT 5 then " +
                             "takes only those top 5."

      },

      {

        title: "Pagination — second page of customers",

        query: `SELECT

  customer_id,

  full_name,

  city,

  signup_date

FROM customers

ORDER BY signup_date DESC

LIMIT 10 OFFSET 10;`,

                explanation: "Skip the first 10 rows (page 1) and return the next 10 (page 2). Used in any " +
                             "paginated report or API."

      }

    ],

    commonMistakes: [

      "Using LIMIT without ORDER BY — the 'top N' result will be arbitrary and change on every run.",

      "Using LIMIT in subqueries expecting a stable result — subquery order is not guaranteed.",

      "Confusing LIMIT and OFFSET: LIMIT = how many, OFFSET = how many to skip."

    ],

    interviewQuestions: [

      "How would you find the second highest order value without using window functions?",

      "What is the difference between LIMIT and OFFSET?",

      "Why must you always use ORDER BY when using LIMIT for top-N results?"

    ],

    revisionNotes: [

      "LIMIT without ORDER BY returns arbitrary rows — never do this for top-N.",

      "OFFSET = skip N rows. Useful for pagination.",

      "LIMIT 1 with ORDER BY is a simple way to find the maximum or minimum."

    ],

    cheatSheet: [

      "SELECT ... ORDER BY col DESC LIMIT 10; — top 10",

      "LIMIT 10 OFFSET 20; — rows 21–30 (page 3)",

      "ORDER BY + LIMIT = correct top-N pattern"

    ]

  },

5: {

        conceptExplanation: `NULL means missing or unknown data. It is NOT zero, NOT an empty string, NOT
      false. NULL is the absence of a value.\n\nGolden Rules of NULL Handling:
1. **The Comparison Rule:** Never use \`= NULL\` or \`!= NULL\`. Standard SQL will evaluate this to
\`UNKNOWN\` and return 0 rows. Always use \`IS NULL\` or \`IS NOT NULL\`.
2. **The Arithmetic Rule (Propagation):** Any mathematical operation with a NULL value results in NULL (e.g.,
\`100 + NULL = NULL\`). Always wrap nullable numeric columns in \`COALESCE(column, 0)\` before doing
arithmetic.

Key NULL rules:

1. NULL = NULL → FALSE  (use IS NULL instead)

2. NULL != anything → NULL (unknown, not true or false)

3. Any arithmetic with NULL → NULL  (5 + NULL = NULL)

4. Aggregate functions IGNORE NULL values (COUNT, SUM, AVG skip NULLs)

5. COUNT(*) counts all rows; COUNT(col) skips NULLs in that column

Handling NULLs:

  IS NULL       → check if value is missing

  IS NOT NULL   → check if value exists

  COALESCE(a, b, c) → return first non-null value

  IFNULL(a, b)  → return b if a is NULL (SQLite/MySQL)

  NULLIF(a, b)  → return NULL if a = b, else return a (avoids division by zero)

Safe division with NULLIF:

  revenue / NULLIF(orders, 0)  → returns NULL instead of error when orders = 0`,

    visualExplanation: `orders table with some NULL discounts:

│ order_id │ discount_amount │

│ 1        │ 200             │

│ 2        │ NULL            │ ← missing discount data

│ 3        │ 0               │ ← discount applied but is zero

│ 4        │ NULL            │

COUNT(discount_amount) → 2  (skips NULLs)

COUNT(*) → 4  (counts all rows)

SUM(discount_amount) → 200  (NULL treated as 0 by SUM)

AVG(discount_amount) → 100  (200 / 2, not 200 / 4!)

AVG skips NULLs in the denominator too — this can mislead analysis.`,

        realBusinessScenario: `A Myntra analyst calculates average discount per order. The column has NULLs
      for orders WHERE no discount data was captured. AVG returns 200 (average of the 2 non-null VALUES) but
      the analyst reports it as if all 4 orders were discounted. The correct approach: use
      COALESCE(discount_amount, 0) to treat NULLs as zero discounts when that is the business intent.`,

    examples: [

      {

        title: "Find orders with missing discount data",

        query: `SELECT

  order_id,

  customer_id,

  total_amount,

  discount_amount,

  COALESCE(discount_amount, 0) AS discount_cleaned

FROM orders

WHERE discount_amount IS NULL

   OR discount_amount = 0;`,

                explanation: "IS NULL finds missing values. COALESCE(discount_amount, 0) replaces NULL with 0 " +
                             "for calculations. These are different: NULL = unknown, 0 = explicitly no " +
                             "discount."

      },

      {

        title: "Safe AVG that treats NULL discount as zero",

        query: `SELECT

  COUNT(*) AS total_orders,

  COUNT(discount_amount) AS orders_with_discount,

  COUNT(*) - COUNT(discount_amount) AS orders_without_discount,

  ROUND(AVG(COALESCE(discount_amount, 0)), 2) AS avg_discount_all_orders

FROM orders

WHERE status = 'Delivered';`,

                explanation: "COALESCE(discount_amount, 0) makes the AVG denominator include all orders, not " +
                             "just those with discount data."

      }

    ],

    commonMistakes: [

      "Writing WHERE col = NULL — this never returns any rows. Use IS NULL.",

      "Assuming AVG handles NULLs the way you expect — it skips them, which can distort the average.",

      "Forgetting that COUNT(*) ≠ COUNT(col) when col has NULLs.",

      "Not considering NULLs in JOIN conditions — NULLs never match in a join."

    ],

    interviewQuestions: [

      "What is the difference between NULL, 0, and an empty string?",

      "What does COUNT(*) return vs COUNT(col) when col has NULL values?",

      "How does COALESCE work? Give a business example."

    ],

    revisionNotes: [

      "NULL is unknown. NULL = NULL is false. Always use IS NULL.",

      "Aggregate functions skip NULLs — this affects AVG denominators.",

      "COALESCE(a, b) returns b when a is NULL. Safe for calculations."

    ],

    cheatSheet: [

      "WHERE col IS NULL / IS NOT NULL",

      "COALESCE(col, default_value) — replace NULL",

      "NULLIF(col, 0) — return NULL instead of zero (prevent div-by-zero)",

      "COUNT(*) counts all rows; COUNT(col) skips NULLs"

    ]

  },

6: {

    conceptExplanation: `String functions let you clean, transform, and extract text data.

Most important functions (work in SQLite + most databases):

  UPPER(col)              → 'mumbai' → 'MUMBAI'

  LOWER(col)              → 'MUMBAI' → 'mumbai'

  LENGTH(col)             → number of characters

  TRIM(col)               → remove leading and trailing spaces

  LTRIM(col), RTRIM(col)  → trim left or right only

  SUBSTR(col, start, len) → extract substring

    SUBSTR('2024-01-15', 1, 7) → '2024-01'

  REPLACE(col, old, new)  → replace text

  INSTR(col, substr)      → position of substring (0 if not found)

  col || ' ' || col2      → concatenate strings (SQLite)

  CONCAT(col1, col2)      → concatenate (MySQL/PostgreSQL)

  LIKE 'pattern'          → pattern matching (% = any chars, _ = one char)

Common DA use cases:

  Email domain: SUBSTR(email, INSTR(email, '@') + 1)

  Year from date: SUBSTR(order_date, 1, 4)

  Month from date: SUBSTR(order_date, 1, 7)

  Normalize city: UPPER(TRIM(city))`,

    visualExplanation: `Dirty data in customers:

│ full_name          │ city      │

│ ' Amit Kumar '    │ 'MUMBAI'  │

│ 'priya sharma'     │ 'delhi '  │

After cleaning:

  TRIM(full_name) → 'Amit Kumar'

  UPPER(TRIM(city)) → 'MUMBAI', 'DELHI'

  LOWER(full_name) → 'amit kumar'

Data cleaning is one of the most common analyst tasks — string functions make it systematic.`,

        realBusinessScenario: `A Swiggy analyst needs to group orders by month but the order_date column
      stores full dates like '2024-03-15'. There is no MONTH() function in SQLite, but SUBSTR(order_date, 1,
      7) extracts '2024-03' for consistent monthly grouping. This is a very common interview question: "How do
      you group by month in SQL?"`,

    examples: [

      {

        title: "Group orders by month using SUBSTR",

        query: `SELECT

  SUBSTR(order_date, 1, 7) AS order_month,

  COUNT(order_id) AS orders,

  SUM(total_amount - discount_amount) AS net_revenue

FROM orders

WHERE status = 'Delivered'

GROUP BY SUBSTR(order_date, 1, 7)

ORDER BY order_month;`,

                explanation: "SUBSTR(order_date, 1, 7) extracts 'YYYY-MM' from 'YYYY-MM-DD'. This is the " +
                             "SQLite approach to monthly grouping."

      },

      {

        title: "Normalize and clean customer names",

        query: `SELECT

  customer_id,

  TRIM(full_name)         AS full_name,

  UPPER(TRIM(city))       AS city_normalized,

  LENGTH(TRIM(full_name)) AS name_length

FROM customers

ORDER BY name_length DESC

LIMIT 10;`,

                explanation: "TRIM removes stray spaces. UPPER standardises city names. LENGTH helps spot " +
                             "anomalies in text fields."

      }

    ],

    commonMistakes: [

      "Using MONTH(date) in SQLite — it doesn't exist. Use SUBSTR(date, 6, 2) instead.",

      "Not TRIM-ming data before grouping — 'Mumbai ' and 'Mumbai' become two groups.",

      "LIKE '%value%' is slow on large tables — it can't use an index on most databases."

    ],

    interviewQuestions: [

      "How do you extract the month and year FROM a date stored as 'YYYY-MM-DD' text?",

      "What is the difference between TRIM and LTRIM?",

      "How would you find all customers whose name starts with 'A'?"

    ],

    revisionNotes: [

      "SUBSTR(col, start, length) — 1-indexed in SQL.",

      "Always TRIM and normalise case before GROUP BY on text columns.",

      "LIKE 'A%' — starts with A. LIKE '%A' — ends with A. LIKE '%A%' — contains A."

    ],

    cheatSheet: [

      "SUBSTR(date_col, 1, 7) → 'YYYY-MM' monthly grouping",

      "UPPER(TRIM(col)) → normalise city/name",

      "col1 || ' ' || col2 → concatenate (SQLite)"

    ]

  },

8: {

        conceptExplanation: `Date functions let you extract parts of dates, calculate differences, and filter
      by time periods.

In SQLite (which this course uses), dates are stored as TEXT in 'YYYY-MM-DD' format.

Key SQLite date operations:

  DATE('now')                         → today's date

  SUBSTR(date_col, 1, 4)              → year  e.g. '2024'

  SUBSTR(date_col, 1, 7)              → month e.g. '2024-03'

  SUBSTR(date_col, 6, 2)              → month number e.g. '03'

  SUBSTR(date_col, 9, 2)              → day number e.g. '15'

Date arithmetic (SQLite):

  date(col, '+30 days')               → 30 days later

  date(col, '-1 month')               → 1 month earlier

  JULIANDAY(date2) - JULIANDAY(date1) → number of days between

In real DA roles (BigQuery / PostgreSQL):

  DATE_TRUNC('month', date_col)       → first day of month

  EXTRACT(YEAR FROM date_col)         → year number

  DATE_DIFF(date1, date2, DAY)        → days between (BigQuery)

  AGE(date1, date2)                   → interval (PostgreSQL)

Interview gold: always mention that you adapt to the specific database's date functions.`,

    visualExplanation: `order_date = '2024-03-15'

SUBSTR(order_date, 1, 4) → '2024'     ← year

SUBSTR(order_date, 1, 7) → '2024-03'  ← year-month

SUBSTR(order_date, 6, 2) → '03'       ← month

SUBSTR(order_date, 9, 2) → '15'       ← day

Cohort analysis — group customers by their signup year-month:

SUBSTR(signup_date, 1, 7) → '2023-06', '2023-07', etc.`,

        realBusinessScenario: `A Flipkart analyst needs monthly GMV trend for the last 6 months. They group
      by SUBSTR(order_date, 1, 7) to get monthly buckets. They also calculate customer tenure (days since
      signup) using JULIANDAY('now') - JULIANDAY(signup_date) to segment customers by age.`,

    examples: [

      {

        title: "Monthly order trend",

        query: `SELECT

  SUBSTR(order_date, 1, 7) AS month,

  COUNT(order_id) AS orders,

  SUM(total_amount - discount_amount) AS net_revenue,

  ROUND(AVG(total_amount), 2) AS avg_order_value

FROM orders

WHERE status = 'Delivered'

GROUP BY SUBSTR(order_date, 1, 7)

ORDER BY month;`,

                explanation: "Monthly GMV trend — a must-know query for any DA interview. GROUP BY the same " +
                             "expression as in SELECT."

      },

      {

        title: "Customer tenure in days",

        query: `SELECT

  customer_id,

  full_name,

  signup_date,

  ROUND(JULIANDAY('now') - JULIANDAY(signup_date)) AS days_since_signup

FROM customers

ORDER BY days_since_signup DESC

LIMIT 10;`,

                explanation: "JULIANDAY converts a date to a numeric value. The difference gives days between " +
                             "two dates. Useful for cohort and retention analysis."

      }

    ],

    commonMistakes: [

      "Using MySQL functions like DATE_FORMAT or YEAR() in SQLite — they don't exist.",

      "Comparing dates as strings when format is not YYYY-MM-DD — '2024-1-5' < '2024-01-15' alphabetically is wrong.",

      "Grouping by a raw date column when you want monthly buckets — always extract the month prefix."

    ],

    interviewQuestions: [

      "How do you group sales data by month in SQL?",

      "How would you calculate the number of days a customer has been active?",

      "What date functions would you use in BigQuery vs SQLite?"

    ],

    revisionNotes: [

      "In SQLite: use SUBSTR for date parts, JULIANDAY for differences.",

      "In BigQuery/PG: use DATE_TRUNC, EXTRACT, DATE_DIFF.",

      "Always mention the database when discussing date functions in interviews."

    ],

    cheatSheet: [

      "SUBSTR(date_col, 1, 7) → 'YYYY-MM' — month grouping (SQLite)",

      "JULIANDAY(d2) - JULIANDAY(d1) → days between dates",

      "DATE('now') → today"

    ]

  },

9: {

    conceptExplanation: `COUNT is an aggregate function — it collapses multiple rows into a single value.

Variants:

  COUNT(*)      → counts ALL rows (including NULLs)

  COUNT(col)    → counts non-NULL values in that column

  COUNT(DISTINCT col) → counts unique non-NULL values

COUNT is almost always used with GROUP BY to count per group:

  COUNT(*) per city, per category, per month

Without GROUP BY, COUNT(*) returns a single number for the whole table.

Important: aggregate functions cannot be in WHERE. Use HAVING to filter grouped results.

  ✗ WHERE COUNT(*) > 10         ← syntax error

  ✓ GROUP BY city HAVING COUNT(*) > 10   ← correct`,

    visualExplanation: `orders table:

│ order_id │ customer_id │ status     │

│ 1        │ 101         │ Delivered  │

│ 2        │ 101         │ Cancelled  │

│ 3        │ 102         │ Delivered  │

│ 4        │ 103         │ Delivered  │

COUNT(*) → 4

COUNT(DISTINCT customer_id) → 3

GROUP BY status + COUNT(*):

  Delivered: 3

  Cancelled: 1`,

        realBusinessScenario: `"How many orders were placed last month?" — COUNT(*) on filtered orders. "How
      many unique customers placed an order?" — COUNT(DISTINCT customer_id). These are the first two metrics
      on any e-commerce dashboard.`,

    examples: [

      {

        title: "Order counts by status",

        query: `SELECT

  status,

  COUNT(*) AS total_orders,

  COUNT(DISTINCT customer_id) AS unique_customers

FROM orders

GROUP BY status

ORDER BY total_orders DESC;`,

                explanation: "GROUP BY status creates one row per status. COUNT(*) counts all orders in each " +
                             "status. COUNT(DISTINCT customer_id) counts unique buyers per status."

      },

      {

        title: "Customers with more than 2 orders",

        query: `SELECT

  customer_id,

  COUNT(*) AS order_count

FROM orders

WHERE status = 'Delivered'

GROUP BY customer_id

HAVING COUNT(*) > 2

ORDER BY order_count DESC;`,

                explanation: "HAVING filters AFTER grouping. This finds repeat buyers — customers with more " +
                             "than 2 delivered orders."

      }

    ],

    commonMistakes: [

      "Writing WHERE COUNT(*) > 5 — aggregate functions cannot appear in WHERE.",

      "Confusing COUNT(*) and COUNT(col) when there are NULLs.",

      "Forgetting GROUP BY — if you SELECT a non-aggregate column and use COUNT, you need GROUP BY."

    ],

    interviewQuestions: [

      "What is the difference between COUNT(*) and COUNT(col)?",

      "How do you find customers who placed more than 3 orders?",

      "What is the difference between WHERE and HAVING?"

    ],

    revisionNotes: [

      "COUNT(*) = all rows. COUNT(col) = non-null rows in col.",

      "HAVING filters groups; WHERE filters rows. Both can be used in the same query.",

      "Aggregate functions: COUNT, SUM, AVG, MIN, MAX always need GROUP BY when a non-aggregate column is selected."

    ],

    cheatSheet: [

      "COUNT(*) — all rows | COUNT(col) — non-null | COUNT(DISTINCT col) — unique",

      "GROUP BY col HAVING COUNT(*) > n — filter groups",

      "Aggregate functions cannot be in WHERE"

    ]

  },

10: {

    conceptExplanation: `SUM adds up numeric values across rows in a group.

  SUM(col)  → total of all non-null values in col

  SUM with CASE WHEN → conditional sum (pivot-like)

Real DA patterns with SUM:

  Revenue: SUM(total_amount - discount_amount)

  Conditional sum: SUM(CASE WHEN status = 'Delivered' THEN total_amount ELSE 0 END)

  Running total: SUM(revenue) OVER (ORDER BY month) — window function (module 33)

SUM ignores NULLs — if a column has NULLs, they are not added.

SUM of an empty group = NULL, not 0.

To handle NULL from SUM: COALESCE(SUM(col), 0)`,

    visualExplanation: `orders per region:

│ region │ net_revenue │

│ North  │ 1200        │

│ North  │ 800         │

│ South  │ 2500        │

SUM(net_revenue) without GROUP BY → 4500 (total)

GROUP BY region + SUM:

  North: 2000

  South: 2500`,

        realBusinessScenario: `GMV (Gross Merchandise Value) = SUM(total_amount). Net revenue =
      SUM(total_amount - discount_amount). These two metrics appear on every e-commerce dashboard and every DA
      interview. Know the difference and know how to compute them correctly with status filtering.`,

    examples: [

      {

        title: "Regional revenue breakdown",

        query: `SELECT

  c.region,

  COUNT(o.order_id)                          AS orders,

  SUM(o.total_amount)                        AS gross_revenue,

  SUM(o.discount_amount)                     AS total_discount,

  SUM(o.total_amount - o.discount_amount)    AS net_revenue

FROM customers c

JOIN orders o ON c.customer_id = o.customer_id

WHERE o.status = 'Delivered'

GROUP BY c.region

ORDER BY net_revenue DESC;`,

                explanation: "This is a standard business report: revenue by region, split into gross and " +
                             "net. The JOIN pulls region from the customers table into the order-level " +
                             "calculation."

      },

      {

        title: "Conditional sum — delivered vs returned revenue",

        query: `SELECT

  SUM(CASE WHEN status = 'Delivered' THEN total_amount ELSE 0 END) AS delivered_revenue,

  SUM(CASE WHEN status = 'Returned'  THEN total_amount ELSE 0 END) AS returned_revenue,

  COUNT(CASE WHEN status = 'Cancelled' THEN 1 END)                 AS cancelled_orders

FROM orders;`,

                explanation: "SUM(CASE WHEN ...) lets you compute multiple conditional aggregates in one " +
                             "query — a pivot technique used heavily in analyst work."

      }

    ],

    commonMistakes: [

      "Summing total_amount without filtering status — includes cancelled and returned orders, inflating revenue.",

      "Expecting SUM of an empty set to return 0 — it returns NULL. Use COALESCE(SUM(col), 0).",

      "Adding SUM and non-aggregate columns without GROUP BY."

    ],

    interviewQuestions: [

      "How do you calculate GMV vs net revenue in SQL?",

      "What does SUM(CASE WHEN ...) do? Give a business example.",

      "What happens if SUM is called on a group with all NULL values?"

    ],

    revisionNotes: [

      "SUM ignores NULLs. SUM of no rows = NULL (use COALESCE).",

      "Filter by status BEFORE summing revenue — always exclude cancellations.",

      "SUM(CASE WHEN cond THEN col ELSE 0 END) = conditional aggregation."

    ],

    cheatSheet: [

      "SUM(total_amount - discount_amount) AS net_revenue — net GMV",

      "COALESCE(SUM(col), 0) — handle NULL FROM empty group",

      "SUM(CASE WHEN status='Delivered' THEN amount ELSE 0 END) — conditional sum"

    ]

  },

11: {

    conceptExplanation: `AVG calculates the arithmetic mean: sum of non-null values ÷ count of non-null values.

  AVG(col) = SUM(col) / COUNT(col)  ← both skip NULLs

Key pitfalls:

1. NULLs are excluded FROM BOTH numerator and denominator — AVG of [100, NULL, 200] = 150 (not 100).

2. If you want to treat NULL as 0: AVG(COALESCE(col, 0))

3. Integer columns: AVG(100 + 200) → 150.0 in most DBs, but verify float output.

4. ROUND(AVG(col), 2) for clean output.

Business uses:

  AOV (Average Order Value) = SUM(revenue) / COUNT(orders) — do NOT use AVG(total_amount) if you need net revenue

  Average discount % = AVG(discount_amount / total_amount * 100)

  Average rating = AVG(rating)`,

    visualExplanation: `orders: [1000, NULL, 2000, 500]

AVG(total_amount) = (1000 + 2000 + 500) / 3 = 1166.67  ← NULL skipped

AVG(COALESCE(total_amount, 0)) = (1000 + 0 + 2000 + 500) / 4 = 875

Which is correct depends on the business question.`,

        realBusinessScenario: `"What is our AOV (Average Order Value)?" is question #1 in every e-commerce DA
      interview. The correct answer: SUM(net_revenue) / COUNT(orders) on delivered orders only. Using
      AVG(total_amount) includes gross order value (before discount) and may include cancelled orders — both
      wrong.`,

    examples: [

      {

        title: "Average Order Value by channel",

        query: `SELECT

  channel,

  COUNT(order_id)                                   AS orders,

  ROUND(SUM(total_amount - discount_amount), 2)     AS net_revenue,

  ROUND(AVG(total_amount), 2)                       AS avg_gross_order_value,

  ROUND(SUM(total_amount - discount_amount)

        / COUNT(order_id), 2)                       AS aov_net

FROM orders

WHERE status = 'Delivered'

GROUP BY channel

ORDER BY aov_net DESC;`,

                explanation: "We compute both AVG(gross) and manual AOV (net revenue / count). The difference " +
                             "illustrates why you should always clarify 'gross or net?' in interviews."

      },

      {

        title: "Average discount percentage by city",

        query: `SELECT

  c.city,

  COUNT(o.order_id) AS orders,

  ROUND(AVG(

    CAST(o.discount_amount AS REAL) / NULLIF(o.total_amount, 0) * 100

  ), 2) AS avg_discount_pct

FROM orders o

JOIN customers c ON o.customer_id = c.customer_id

WHERE o.status = 'Delivered'

GROUP BY c.city

ORDER BY avg_discount_pct DESC

LIMIT 10;`,

        explanation: "NULLIF(total_amount, 0) prevents division by zero. CAST to REAL prevents integer division."

      }

    ],

    commonMistakes: [

      "Using AVG(total_amount) when you want net AOV — this gives gross order value before discounts.",

      "Not using ROUND — raw AVG results like 1499.999999 look unprofessional.",

      "Forgetting that NULLs are excluded FROM AVG — this can distort the result."

    ],

    interviewQuestions: [

      "What is AOV and how do you calculate it in SQL?",

      "What is the difference between AVG(col) and SUM(col)/COUNT(*)?",

      "If a column has NULLs, how does AVG treat them?"

    ],

    revisionNotes: [

      "AVG skips NULLs in both numerator and denominator.",

      "For business-accurate AOV: SUM(net_revenue) / COUNT(orders), not AVG(total_amount).",

      "Always ROUND(AVG(...), 2) for readable output."

    ],

    cheatSheet: [

      "ROUND(AVG(col), 2) — rounded average",

      "AOV = SUM(net_revenue) / COUNT(order_id) — not AVG(total_amount)",

      "AVG(COALESCE(col, 0)) — include NULLs as zero"

    ]

  },

12: {

    conceptExplanation: `MIN and MAX return the smallest and largest values in a group.

  MIN(col) → smallest value (works on numbers, text, dates)

  MAX(col) → largest value

With text: MIN gives alphabetically first, MAX gives last.

With dates (stored as YYYY-MM-DD text): MIN gives earliest date, MAX gives most recent — alphabetic sort
works correctly because of the YYYY-MM-DD format.

MIN and MAX both ignore NULLs.

Common patterns:

  First and last order date per customer → MIN(order_date), MAX(order_date)

  Price range → MIN(list_price), MAX(list_price)

  Oldest and newest signup → MIN(signup_date), MAX(signup_date)

  Revenue range per category → MIN, MAX of SUM per group (needs subquery or window)`,

    visualExplanation: `orders per customer:

customer 101: [1200, 800, 3400, 600]

MIN → 600   (cheapest order)

MAX → 3400  (most expensive order)

signup dates:

MIN(signup_date) → '2022-01-05'  (first customer)

MAX(signup_date) → '2024-11-20'  (most recent customer)`,

        realBusinessScenario: `A Flipkart analyst calculates "first and last order date" per customer for
      cohort retention analysis. MIN(order_date) = acquisition date of first order, MAX(order_date) = last
      active date. The gap between them (in days) tells you how long a customer was engaged.`,

    examples: [

      {

        title: "Customer order history summary",

        query: `SELECT

  customer_id,

  COUNT(order_id) AS total_orders,

  MIN(order_date) AS first_order_date,

  MAX(order_date) AS last_order_date,

  MIN(total_amount) AS cheapest_order,

  MAX(total_amount) AS most_expensive_order,

  SUM(total_amount - discount_amount) AS lifetime_value

FROM orders

WHERE status = 'Delivered'

GROUP BY customer_id

ORDER BY lifetime_value DESC

LIMIT 10;`,

                explanation: "This is a complete customer-level summary — a very common interview question. " +
                             "It covers COUNT, MIN, MAX, SUM together."

      },

      {

        title: "Product price range by category",

        query: `SELECT

  category,

  COUNT(product_id) AS products,

  ROUND(MIN(list_price), 2) AS min_price,

  ROUND(MAX(list_price), 2) AS max_price,

  ROUND(MAX(list_price) - MIN(list_price), 2) AS price_range

FROM products

GROUP BY category

ORDER BY price_range DESC;`,

                explanation: "Price range (MAX - MIN) tells you which category has the widest product spread " +
                             "— useful for merchandising analysis."

      }

    ],

    commonMistakes: [

      "Using MAX without GROUP BY when you want per-customer max — without GROUP BY you get the global max.",

      "Assuming MIN on a text column gives the shortest string — it gives alphabetically first.",

      "Using MAX(order_date) to find the 'last active date' without filtering status — includes cancelled orders."

    ],

    interviewQuestions: [

      "How do you find the first and last order date per customer?",

      "How does MIN/MAX behave on text columns vs date columns?",

      "How would you find the customer with the single highest order value?"

    ],

    revisionNotes: [

      "MIN and MAX ignore NULLs.",

      "On YYYY-MM-DD text dates, MIN/MAX work correctly because alphabetic = chronological.",

      "Combine MIN, MAX, SUM, COUNT in one GROUP BY query for full customer summaries."

    ],

    cheatSheet: [

      "MIN(order_date) → first order, MAX(order_date) → last order",

      "MAX - MIN → range of values",

      "Always filter by status before MIN/MAX on dates for accuracy"

    ]

  },

13: {

        conceptExplanation: `GROUP BY groups rows that share the same value in one or more columns, then
      applies aggregate functions (COUNT, SUM, AVG, MIN, MAX) to each group.

Logical order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT

Rules:

1. Every column in SELECT must be either in GROUP BY or inside an aggregate function.

2. GROUP BY runs BEFORE SELECT — you cannot use SELECT aliases in GROUP BY.

3. You can GROUP BY multiple columns — creates one row per unique combination.

4. Expressions in GROUP BY: GROUP BY SUBSTR(order_date, 1, 7) for monthly grouping.\n\nThe GROUP BY Column
Matching Rule:
Whenever you aggregate, SQL splits your data into groups. It cannot display individual row values alongside
aggregated group totals. Therefore, if you SELECT a column (e.g., city, segment) without wrapping it in an
aggregate function (like SUM or AVG), you MUST include it in the GROUP BY clause.

✗ Invalid (Throws syntax errors in standard databases like PostgreSQL & BigQuery):
  SELECT city, segment, SUM(total_amount)
  FROM orders
  GROUP BY city; -- ERROR: 'segment' must appear in the GROUP BY clause or be used in an aggregate function!

✓ Valid (Both non-aggregated columns are declared in GROUP BY):
  SELECT city, segment, SUM(total_amount)
  FROM orders
  GROUP BY city, segment;

Multi-column GROUP BY:

  GROUP BY region, segment → one row per region-segment combination

  GROUP BY city, SUBSTR(order_date, 1, 7) → one row per city per month

Advanced Aggregation (PostgreSQL, SQL Server, etc.):

• GROUP BY ROLLUP(col1, col2) - Generates sub-totals and a grand total (hierarchical).

• GROUP BY CUBE(col1, col2) - Generates totals for every possible combination of columns.

• GROUPING SETS((col1), (col2), ()) - Specify exactly which groupings you want.`,

    visualExplanation: `orders table (simplified):

│ region │ status     │ amount │

│ North  │ Delivered  │ 1000   │

│ North  │ Cancelled  │ 500    │

│ South  │ Delivered  │ 2000   │

│ South  │ Delivered  │ 1500   │

GROUP BY region, status:

│ region │ status     │ COUNT │ SUM   │

│ North  │ Cancelled  │ 1     │ 500   │

│ North  │ Delivered  │ 1     │ 1000  │

│ South  │ Delivered  │ 2     │ 3500  │`,

        realBusinessScenario: `"Show me revenue by region and month" — this is a GROUP BY region,
      SUBSTR(order_date, 1, 7) query with SUM(net_revenue). Every business dashboard is built on these grouped
      aggregations.`,

    examples: [

      {

        title: "Monthly revenue by region",

        query: `SELECT

  c.region,

  SUBSTR(o.order_date, 1, 7) AS month,

  COUNT(o.order_id) AS orders,

  SUM(o.total_amount - o.discount_amount) AS net_revenue

FROM customers c

JOIN orders o ON c.customer_id = o.customer_id

WHERE o.status = 'Delivered'

GROUP BY c.region, SUBSTR(o.order_date, 1, 7)

ORDER BY c.region, month;`,

                explanation: "GROUP BY two columns: region and month. This creates one row per region-month " +
                             "combination — the standard format for a trend-by-region table."

      },

      {

        title: "Customer segment performance",

        query: `SELECT

  c.segment,

  COUNT(DISTINCT c.customer_id) AS customers,

  COUNT(o.order_id) AS orders,

  ROUND(AVG(o.total_amount - o.discount_amount), 2) AS avg_net_order_value,

  SUM(o.total_amount - o.discount_amount) AS total_revenue

FROM customers c

JOIN orders o ON c.customer_id = o.customer_id

WHERE o.status = 'Delivered'

GROUP BY c.segment

ORDER BY total_revenue DESC;`,

        explanation: "Which customer segment drives the most revenue? A classic segmentation question."

      },

      {

        title: "Advanced: Sub-totals with ROLLUP",

        query: `SELECT

  COALESCE(c.region, 'All Regions') AS region,

  COALESCE(c.segment, 'All Segments') AS segment,

  SUM(o.total_amount) AS revenue

FROM customers c

JOIN orders o ON c.customer_id = o.customer_id

GROUP BY ROLLUP(c.region, c.segment)

ORDER BY c.region, c.segment;`,

                explanation: "ROLLUP computes the revenue for each region+segment, then a sub-total for each " +
                             "region, and finally a grand total for 'All Regions'. We use COALESCE to replace " +
                             "the NULLs generated by the rollup with readable labels."

      }

    ],

    commonMistakes: [

      "Selecting a column that is neither in GROUP BY nor in an aggregate — most databases throw an error.",

      "GROUP BY on column position number (GROUP BY 1) — error-prone if you reorder columns.",

      "Using WHERE to filter aggregates — use HAVING instead."

    ],

    interviewQuestions: [

      "Why must every SELECT column be in GROUP BY or an aggregate function?",

      "How do you GROUP BY month when the date is stored as 'YYYY-MM-DD'?",

      "What is the difference between GROUP BY one column and GROUP BY two columns?",

      "What is the difference between ROLLUP and CUBE in a GROUP BY clause?"

    ],

    revisionNotes: [

      "GROUP BY col means one row per unique value of col.",

      "All SELECT non-aggregate columns must appear in GROUP BY.",

      "Can GROUP BY expressions: GROUP BY SUBSTR(date, 1, 7)."

    ],

    cheatSheet: [

      "SELECT col, AGG(col2) FROM t GROUP BY col",

      "Every non-aggregate column in SELECT must be in GROUP BY",

      "GROUP BY col1, col2 → one row per unique combination",

      "ROLLUP: Adds sub-totals and grand-totals",

      "CUBE: Adds totals for all combinations"

    ]

  },

14: {

    conceptExplanation: `HAVING filters groups AFTER aggregation. It is the WHERE clause for grouped results.

Syntax:

  GROUP BY col

  HAVING aggregate_condition

Key differences vs WHERE:

  WHERE  → filters individual rows BEFORE grouping (can't use aggregates)

  HAVING → filters groups AFTER aggregation (must use aggregates or GROUP BY columns)

You can use both in the same query:

  WHERE filters raw data first (faster — reduces data before grouping)

  HAVING then filters the grouped results

When to use each:

  "Orders WHERE status = 'Delivered'" → WHERE (row-level filter)

  "Cities with more than 100 orders" → HAVING (group-level filter)

  "Customers who spent more than 10000 in total" → HAVING SUM() > 10000`,

    visualExplanation: `All orders:        1000 rows

WHERE status='Delivered':  700 rows  ← WHERE reduces rows

GROUP BY customer:         350 groups ← GROUP BY aggregates

HAVING COUNT(*) > 2:       80 groups  ← HAVING filters groups

The order matters. Run expensive filters in WHERE first — it reduces the data before grouping.`,

        realBusinessScenario: `"Find cities that had more than 50 delivered orders last month" → this
      REQUIRES HAVING because it filters ON COUNT(*), which is an aggregate. You cannot write WHERE COUNT(*) >
      50. This distinction is asked in almost every SQL interview.`,

    examples: [

      {

        title: "Cities with more than 2 delivered orders",

        query: `SELECT

  c.city,

  COUNT(o.order_id) AS delivered_orders,

  SUM(o.total_amount - o.discount_amount) AS net_revenue

FROM customers c

JOIN orders o ON c.customer_id = o.customer_id

WHERE o.status = 'Delivered'

GROUP BY c.city

HAVING COUNT(o.order_id) > 2

ORDER BY delivered_orders DESC;`,

                explanation: "WHERE filters to delivered orders (row level). HAVING then filters to cities " +
                             "with more than 2 such orders (group level). Both work together."

      },

      {

        title: "High-value customers (lifetime value > 5000)",

        query: `SELECT

  customer_id,

  COUNT(order_id) AS orders,

  SUM(total_amount - discount_amount) AS lifetime_value

FROM orders

WHERE status = 'Delivered'

GROUP BY customer_id

HAVING SUM(total_amount - discount_amount) > 5000

ORDER BY lifetime_value DESC;`,

                explanation: "Repeat HAVING pattern: filter groups on the aggregate. This identifies VIP " +
                             "customers — a very common business requirement."

      }

    ],

    commonMistakes: [

      "Writing WHERE SUM(revenue) > 1000 — aggregate functions cannot be in WHERE.",

      "Putting GROUP BY conditions in HAVING instead of WHERE — slower because WHERE filters first.",

      "Using HAVING without GROUP BY — technically allowed (treats whole table as one group) but rare."

    ],

    interviewQuestions: [

      "What is the difference between WHERE and HAVING? Give an example of each.",

      "Can you use both WHERE and HAVING in the same query?",

      "Why should you prefer WHERE over HAVING for non-aggregate filters?"

    ],

    revisionNotes: [

      "WHERE = row filter (before GROUP BY). HAVING = group filter (after GROUP BY).",

      "Aggregate functions (COUNT, SUM, AVG) can ONLY appear in HAVING, SELECT, or ORDER BY — not in WHERE.",

      "Use WHERE first to reduce data, HAVING second to filter groups."

    ],

    cheatSheet: [

      "WHERE = row filter | HAVING = group filter",

      "HAVING COUNT(*) > n — groups with more than n rows",

      "WHERE status='X' GROUP BY city HAVING SUM(rev) > 10000"

    ]

  },

16: {

        conceptExplanation: `INNER JOIN returns only rows where there is a matching value in BOTH tables.
      Non-matching rows from either table are excluded.

Syntax:

  SELECT columns

  FROM table1 t1

  [INNER] JOIN table2 t2 ON t1.key = t2.key;

INNER is optional — JOIN alone means INNER JOIN.

The ON clause specifies the join condition. Usually it's the foreign key relationship:

  ON orders.customer_id = customers.customer_id

  ON order_items.order_id = orders.order_id

Joining multiple tables:

  FROM customers c

  JOIN orders o ON c.customer_id = o.customer_id

  JOIN order_items oi ON o.order_id = oi.order_id

  JOIN products p ON oi.product_id = p.product_id

Key insight: INNER JOIN reduces row count if there are unmatched rows. Always check the row counts before and
after joining to detect unexpected drops.\n\nGolden Rules of Joins:
1. **Table Aliases and Column Qualification:** Always qualify columns with table prefixes or short aliases
(e.g., \`o.customer_id\`) to prevent "ambiguous column" compiler errors.
2. **Verify Row Counts:** Always check your table row counts before and after joining. If an INNER JOIN
reduces your rows, it means there are unmatched records. Switch to a LEFT JOIN if you need to keep unmatched
rows.`,

    visualExplanation: `customers:         orders:

│ id │ name  │     │ id │ cust_id │ amount │

│ 1  │ Amit  │     │ 1  │ 1       │ 1200   │

│ 2  │ Priya │     │ 2  │ 1       │ 800    │

│ 3  │ Ravi  │     │ 3  │ 2       │ 2500   │

(no orders)     (no orders for 3)

INNER JOIN ON customers.id = orders.cust_id:

│ Amit  │ 1200 │

│ Amit  │ 800  │

│ Priya │ 2500 │

Ravi is EXCLUDED — no matching orders.`,

        realBusinessScenario: `You join customers and orders to find "which customers placed orders".
      Customers with no orders are excluded. If your result has fewer rows than expected, check whether you
      need a LEFT JOIN (to include all customers) instead.`,

    examples: [

      {

        title: "Revenue by customer — INNER JOIN",

        query: `SELECT

  c.customer_id,

  c.full_name,

  c.city,

  c.segment,

  COUNT(o.order_id)                         AS total_orders,

  SUM(o.total_amount - o.discount_amount)   AS lifetime_value

FROM customers c

JOIN orders o ON c.customer_id = o.customer_id

WHERE o.status = 'Delivered'

GROUP BY c.customer_id, c.full_name, c.city, c.segment

ORDER BY lifetime_value DESC

LIMIT 10;`,

                explanation: "INNER JOIN means only customers who have at least one delivered order appear. " +
                             "Customers with no orders are excluded."

      },

      {

        title: "Product revenue — three-table join",

        query: `SELECT

  p.category,

  p.product_name,

  SUM(oi.quantity * oi.unit_price) AS revenue,

  SUM(oi.quantity) AS units_sold

FROM products p

JOIN order_items oi ON p.product_id = oi.product_id

JOIN orders o ON oi.order_id = o.order_id

WHERE o.status = 'Delivered'

GROUP BY p.category, p.product_name

ORDER BY revenue DESC

LIMIT 10;`,

                explanation: "Three-table join: products → order_items → orders. Start from the most granular " +
                             "table (order_items) and join outward."

      }

    ],

    commonMistakes: [

      "Joining on the wrong keys — always verify the relationship direction.",

      "Not noticing a row count drop after joining — check if INNER should be LEFT.",

      "Missing the WHERE status filter after join — aggregates will include cancelled orders."

    ],

    interviewQuestions: [

      "What does INNER JOIN return when there is no match in one table?",

      "How would you check if your JOIN caused unexpected row loss?",

      "Write a query to find total revenue per product category using three tables."

    ],

    revisionNotes: [

      "INNER JOIN = matching rows only. Non-matching rows excluded.",

      "Always check row counts before and after joining.",

      "JOIN multiple tables sequentially: t1 JOIN t2 JOIN t3."

    ],

    cheatSheet: [

      "JOIN t2 ON t1.key = t2.key — inner join (matching rows only)",

      "3-table join: FROM t1 JOIN t2 ON ... JOIN t3 ON ...",

      "Row count drops after JOIN → check if you need LEFT JOIN"

    ]

  },

17: {

        conceptExplanation: `LEFT JOIN (also called LEFT OUTER JOIN) returns ALL rows from the LEFT table
      plus matching rows from the RIGHT table. When there is no match in the right table, the right columns
      appear as NULL.\n\nThe LEFT JOIN WHERE Trap:
A common mistake is placing filter conditions for the right table in the \`WHERE\` clause instead of the
\`ON\` clause. This converts your LEFT JOIN into an INNER JOIN because NULL rows are filtered out by the WHERE
clause!

✗ Invalid (Converts LEFT JOIN into INNER JOIN):
  SELECT c.full_name, o.order_id
  FROM customers c
  LEFT JOIN orders o ON c.customer_id = o.customer_id
  WHERE o.status = 'Delivered'; -- Excludes customers who have never ordered!

✓ Valid (Keeps unmatched customers, showing order columns as NULL):
  SELECT c.full_name, o.order_id
  FROM customers c
  LEFT JOIN orders o ON c.customer_id = o.customer_id AND o.status = 'Delivered';

Syntax:

  SELECT columns

  FROM table1 t1

  LEFT JOIN table2 t2 ON t1.key = t2.key;

The table after FROM is the LEFT table. The table after LEFT JOIN is the RIGHT table.

Use LEFT JOIN when you want to keep all rows FROM the left table regardless of whether they have a match.

**The ON vs WHERE Trap**

If you filter the RIGHT table in the WHERE clause, you accidentally convert your LEFT JOIN into an INNER JOIN.

• LEFT JOIN t2 ON t1.id = t2.id AND t2.status = 'Active' → Keeps all rows FROM t1, only joins active t2 rows.

• LEFT JOIN t2 ON t1.id = t2.id WHERE t2.status = 'Active' → Drops any t1 rows that didn't have a match in t2
(because NULL != 'Active').

Common pattern — find unmatched rows:

  WHERE t2.key IS NULL  → rows in t1 with NO match in t2

  (anti-join pattern: find customers with no orders)`,

    visualExplanation: `customers (left):    orders (right):

│ id │ name  │      │ id │ cust_id │

│ 1  │ Amit  │      │ 1  │ 1       │

│ 2  │ Priya │      │ 2  │ 2       │

│ 3  │ Ravi  │      (no order for 3)

LEFT JOIN result:

│ 1  │ Amit  │ 1 (order) │

│ 2  │ Priya │ 2 (order) │

│ 3  │ Ravi  │ NULL       │ ← Ravi kept, no order

With WHERE orders.cust_id IS NULL:

│ 3  │ Ravi  │ NULL │   ← customers with NO orders (anti-join)`,

        realBusinessScenario: `"Find all customers who have NEVER placed an order" — this is the LEFT JOIN +
      IS NULL anti-join pattern. A huge proportion of retention analysis is built on this. If you can't write
      this in an interview, you won't pass.`,

    examples: [

      {

        title: "Customers with no orders (anti-join)",

        query: `SELECT

  c.customer_id,

  c.full_name,

  c.city,

  c.signup_date

FROM customers c

LEFT JOIN orders o ON c.customer_id = o.customer_id

WHERE o.order_id IS NULL

ORDER BY c.signup_date;`,

                explanation: "LEFT JOIN keeps all customers. WHERE o.order_id IS NULL filters to only those " +
                             "without a matching order. This is the anti-join pattern."

      },

      {

        title: "All customers with order summary (including no orders)",

        query: `SELECT

  c.customer_id,

  c.full_name,

  c.city,

  COUNT(o.order_id) AS total_orders,

  COALESCE(SUM(o.total_amount - o.discount_amount), 0) AS lifetime_value

FROM customers c

LEFT JOIN orders o ON c.customer_id = o.customer_id

  AND o.status = 'Delivered'

GROUP BY c.customer_id, c.full_name, c.city

ORDER BY lifetime_value DESC;`,

                explanation: "Move the status filter into the JOIN condition (not WHERE) so that all " +
                             "customers remain. Customers with no delivered orders show 0 via COALESCE."

      }

    ],

    commonMistakes: [

      "Putting the right table's filter in WHERE instead of the JOIN condition — converts LEFT JOIN to INNER JOIN.",

      "Not using COALESCE for NULLs in aggregates FROM the right table.",

      "Confusing which table is LEFT and which is RIGHT."

    ],

    interviewQuestions: [

      "What is the difference between INNER JOIN and LEFT JOIN?",

      "How do you find customers who have never placed an order?",

      "Why does putting a WHERE condition on the right table turn a LEFT JOIN into an INNER JOIN?"

    ],

    revisionNotes: [

      "LEFT JOIN = all left rows + matching right rows. Non-matching right = NULL.",

      "Anti-join: LEFT JOIN + WHERE right_table.key IS NULL.",

      "Filter right table in ON clause, not WHERE, to preserve all left rows."

    ],

    cheatSheet: [

      "LEFT JOIN keeps ALL left rows. No match → NULL on right.",

      "Anti-join: LEFT JOIN t2 ON ... WHERE t2.id IS NULL",

      "Status filter in JOIN: ON t1.id = t2.id AND t2.status = 'X'"

    ]

  },

18: {

    conceptExplanation: `RIGHT JOIN returns ALL rows from the right table, plus matching rows from the left table.

Non-matching rows FROM the left table appear as NULL in the result.

Syntax: FROM left_table LEFT JOIN right_table ON key  ← equivalent to right join but swapped

        FROM left_table RIGHT JOIN right_table ON key

Key insight: RIGHT JOIN is identical to LEFT JOIN with the table order swapped.

  FROM orders RIGHT JOIN products ON product_id

  = FROM products LEFT JOIN orders ON product_id

In practice: most SQL developers avoid RIGHT JOIN for consistency. When you need a RIGHT JOIN, swap the table
order and use LEFT JOIN instead. This makes code more readable and consistent across a codebase.

Anti-join with RIGHT JOIN: find products with no orders

  FROM order_items RIGHT JOIN products ON ... WHERE order_items.product_id IS NULL`,

    visualExplanation: `Table A (order_items): products 201, 202, 207 have orders

Table B (products): all 8 products exist

RIGHT JOIN products:

  → Shows ALL products FROM Table B

  → Left side (order_items) is NULL for products with no orders

  product_id | order_item_id | quantity

  201        | 9             | 1         ← has orders

  202        | 2             | 1         ← has orders

  203        | 3             | 1         ← has orders

  204        | 8             | 1         ← has orders

  205        | 5             | 2         ← has orders

  206        | 4             | 1         ← has orders

  207        | 1             | 1         ← has orders

  208        | 10            | 3         ← has orders`,

        realBusinessScenario: `The product catalog team at Myntra adds new products weekly. After a sales
      campaign, the analyst checks: "Which newly added products received no orders during the campaign?".

Using RIGHT JOIN (or equivalently LEFT JOIN with tables swapped):

  FROM order_items oi RIGHT JOIN products p ON oi.product_id = p.product_id

  WHERE oi.order_item_id IS NULL  ← products with no order items

This quickly identifies dead-stock products that may need promotional push.`,

    examples: [

      {

        title: "Find products with no orders using RIGHT JOIN",

        query: `SELECT

  p.product_id,

  p.product_name,

  p.category,

  COUNT(oi.order_item_id) AS times_ordered

FROM order_items oi

RIGHT JOIN products p ON oi.product_id = p.product_id

GROUP BY p.product_id, p.product_name, p.category

ORDER BY times_ordered ASC;`,

                explanation: "RIGHT JOIN ensures all products appear even if they have no order_items. " +
                             "COUNT(oi.order_item_id) returns 0 for products with no orders (NULL " +
                             "order_item_id is not counted by COUNT(col))."

      },

      {

        title: "Equivalent with LEFT JOIN (recommended style)",

        query: `SELECT

  p.product_id, p.product_name, p.category,

  COUNT(oi.order_item_id) AS times_ordered

FROM products p

LEFT JOIN order_items oi ON p.product_id = oi.product_id

GROUP BY p.product_id, p.product_name, p.category

ORDER BY times_ordered ASC;`,

                explanation: "Identical result, but using LEFT JOIN with products as the leading table. This " +
                             "is the preferred coding style — consistent with all other outer joins in the " +
                             "codebase."

      }

    ],

    commonMistakes: [

      "Using RIGHT JOIN when a LEFT JOIN with swapped tables is clearer — consistency matters.",

      "Applying a WHERE filter on the right table's non-null columns — this converts RIGHT JOIN to INNER JOIN.",

      "Confusing which side shows NULLs — in RIGHT JOIN, the LEFT (first) table's columns can be NULL."

    ],

    interviewQuestions: [

      "What is the difference between LEFT JOIN and RIGHT JOIN?",

      "How would you convert a RIGHT JOIN to a LEFT JOIN?",

      "When would you use RIGHT JOIN in a real project? (Answer: almost never — swap tables and use LEFT JOIN)"

    ],

    revisionNotes: [

      "RIGHT JOIN = all rows FROM RIGHT table + matching rows FROM LEFT",

      "Any RIGHT JOIN can be rewritten as LEFT JOIN by swapping table order",

      "Interview preference: always use LEFT JOIN for consistency",

      "Anti-join: RIGHT JOIN + WHERE left.col IS NULL"

    ],

    cheatSheet: [

      "FROM a RIGHT JOIN b ON key → all b rows, matching a rows",

      "Equivalent: FROM b LEFT JOIN a ON key",

      "WHERE a.col IS NULL → b rows with no match in a",

      "Rarely used in practice — rewrite as LEFT JOIN"

    ]

  },

19: {

    conceptExplanation: `FULL JOIN (FULL OUTER JOIN) returns ALL rows from BOTH tables.

Non-matching rows FROM either side have NULLs in the other table's columns.

Syntax: FROM table1 FULL JOIN table2 ON key

        FROM table1 FULL OUTER JOIN table2 ON key  (OUTER is optional)

Result: Left-only rows + Matching rows + Right-only rows

Use cases:

• Reconciliation: rows in Table A not in Table B, AND rows in Table B not in Table A

• Data quality checks between two systems

• Merging two partial datasets

Modern SQLite (3.39.0+) supports native RIGHT JOIN and FULL JOIN directly, similar to PostgreSQL and
BigQuery. On older database systems (or MySQL), you simulate a FULL JOIN by combining queries:

  SELECT * FROM a LEFT JOIN b ON key

  UNION ALL

  SELECT * FROM a RIGHT JOIN b ON key WHERE a.key IS NULL

In PostgreSQL/BigQuery: FULL OUTER JOIN works directly.`,

    visualExplanation: `FULL JOIN = INNER JOIN + all left-only rows + all right-only rows

Table A (Customers): C1, C2, C3

Table B (Orders):    C1 has order, C3 has order, C4 has order (C4 not in customers)

FULL JOIN result:

  C1 | customer data | order data   ← match

  C2 | customer data | NULL         ← left-only (no order)

  C3 | customer data | order data   ← match

  NULL | NULL         | C4 order    ← right-only (order with unknown customer)`,

        realBusinessScenario: `Two databases need to be reconciled at CRED: the payments database and the
      orders database. Some payments may not have matching orders (bank error), and some orders may not have
      matching payments (system glitch).

FULL JOIN finds BOTH types of orphan records in one query:

  FROM payments p FULL JOIN orders o ON p.order_id = o.order_id

  WHERE p.payment_id IS NULL   -- orders without payments

     OR o.order_id IS NULL     -- payments without orders`,

    examples: [

      {

        title: "Reconcile orders and payments (simulated in SQLite)",

        query: `-- Simulate FULL JOIN in SQLite

SELECT

  o.order_id, o.total_amount,

  p.payment_id, p.amount AS paid_amount,

  CASE

    WHEN p.payment_id IS NULL THEN 'Order without payment'

    WHEN o.order_id IS NULL THEN 'Payment without order'

    ELSE 'Matched'

  END AS status

FROM orders o

LEFT JOIN payments p ON o.order_id = p.order_id

UNION ALL

SELECT

  o.order_id, o.total_amount,

  p.payment_id, p.amount,

  'Payment without order'

FROM payments p

LEFT JOIN orders o ON p.order_id = o.order_id

WHERE o.order_id IS NULL

ORDER BY o.order_id;`,

                explanation: "The UNION ALL combines a LEFT JOIN (all orders + matching payments) with a LEFT " +
                             "JOIN flipped (orphan payments). CASE WHEN labels each row's reconciliation " +
                             "status."

      },

      {

        title: "COALESCE for unified columns across both sides",

        query: `SELECT

  COALESCE(o.order_id, p.order_id) AS order_ref,

  o.total_amount,

  p.amount AS paid_amount,

  p.payment_mode

FROM orders o

LEFT JOIN payments p ON o.order_id = p.order_id

ORDER BY order_ref;`,

                explanation: "COALESCE picks the first non-NULL value. In a full join, either side might be " +
                             "NULL — COALESCE ensures the order reference always has a value from whichever " +
                             "side has it."

      }

    ],

    commonMistakes: [

      "Trying to use FULL JOIN in older systems where it's not supported without simulating it using UNION ALL.",

      "Not using COALESCE on key columns — the JOIN key FROM one side may be NULL.",

      "Expecting FULL JOIN to be common — it's used mainly for data reconciliation tasks."

    ],

    interviewQuestions: [

      "What is a FULL OUTER JOIN and when would you use it?",

      "How do you simulate a FULL JOIN on older engines (like older SQLite or MySQL)?",

      "What does COALESCE do in the context of a FULL JOIN?"

    ],

    revisionNotes: [

      "FULL JOIN = LEFT JOIN rows + INNER JOIN rows + RIGHT JOIN rows",

      "Older engines: simulate with LEFT JOIN UNION ALL (reverse LEFT JOIN WHERE IS NULL)",

      "COALESCE(a.key, b.key) handles NULL JOIN keys FROM either side",

      "Mainly used for data reconciliation, auditing, or merging partial datasets"

    ],

    cheatSheet: [

      "FULL JOIN: all rows from both tables, NULLs where no match",

      "Simulation on older engines: LEFT JOIN UNION ALL reverse-LEFT JOIN WHERE IS NULL",

      "COALESCE(a.col, b.col): picks non-null value from either side",

      "Use case: data reconciliation, orphan detection"

    ]

  },

20: {

        conceptExplanation: `SELF JOIN joins a table to ITSELF. You must use two different aliases to
      distinguish the two copies.

Syntax:

  FROM employees e1

  JOIN employees e2 ON e1.manager_id = e2.employee_id

  -- e1 = the employee, e2 = their manager (same table, different row)

When to use SELF JOIN:

• Manager-employee hierarchy (most common interview question)

• Finding pairs of rows satisfying a condition (same city, same date)

• Comparing a row to other rows in the same table

• Sequential data: comparing current row to previous row (though LAG is better now)

The JOIN condition defines the relationship between the two copies of the table.`,

    visualExplanation: `employees table:

  employee_id | employee_name | manager_id

  701         | Priya Menon   | NULL       ← no manager (she IS the manager)

  702         | Rahul Bansal  | 701        ← reports to 701 (Priya)

  703         | Sneha Jain    | 701        ← reports to 701 (Priya)

SELF JOIN:

  FROM employees e1 LEFT JOIN employees e2 ON e1.manager_id = e2.employee_id

Result:

  e1.name      | e2.name (manager)

  Priya Menon  | NULL              ← no manager

  Rahul Bansal | Priya Menon       ← manager is Priya

  Sneha Jain   | Priya Menon       ← manager is Priya`,

        realBusinessScenario: `HR Analytics at a startup: the CHRO wants a report showing each employee
      alongside their manager's name and salary for compensation benchmarking.

The employees table has manager_id which references another employee_id in the same table. SELF JOIN is the
correct tool:

  SELECT e1.employee_name, e1.salary_lpa, e2.employee_name AS manager, e2.salary_lpa AS manager_salary

  FROM employees e1 LEFT JOIN employees e2 ON e1.manager_id = e2.employee_id;

LEFT JOIN (not INNER JOIN) ensures top-level managers with no manager_id also appear.`,

    examples: [

      {

        title: "Employee-manager hierarchy with salary comparison",

        query: `SELECT

  e1.employee_id,

  e1.employee_name,

  e1.role,

  e1.salary_lpa,

  e2.employee_name  AS manager_name,

  e2.salary_lpa     AS manager_salary,

  ROUND(e2.salary_lpa - e1.salary_lpa, 1) AS salary_gap

FROM employees e1

LEFT JOIN employees e2 ON e1.manager_id = e2.employee_id

ORDER BY e1.department_id, e1.salary_lpa DESC;`,

                explanation: "LEFT JOIN ensures top-level managers (NULL manager_id) appear with NULL in the " +
                             "manager columns. The salary_gap column shows how much more (or less) the manager " +
                             "earns."

      },

      {

        title: "Find employees in the same department",

        query: `SELECT

  e1.employee_name AS emp1,

  e2.employee_name AS emp2,

  e1.department_id

FROM employees e1

JOIN employees e2

  ON e1.department_id = e2.department_id

  AND e1.employee_id < e2.employee_id  -- avoid duplicates and self-pairing

ORDER BY e1.department_id;`,

                explanation: "e1.employee_id < e2.employee_id prevents both (A,B) and (B,A) from appearing, " +
                             "and also prevents any employee being paired with themselves."

      }

    ],

    commonMistakes: [

      "Forgetting to alias both copies — SQL can't distinguish which copy of the table you mean.",

      "Using INNER JOIN when the top-level manager should still appear — use LEFT JOIN.",

      "In pair queries, missing the e1.id < e2.id condition — causes duplicates and self-pairing."

    ],

    interviewQuestions: [

      "What is a SELF JOIN? Give a real example.",

      "How do you display employee names alongside their manager's name using a SELF JOIN?",

      "Why do you use LEFT JOIN instead of INNER JOIN in a SELF JOIN for a manager hierarchy?"

    ],

    revisionNotes: [

      "SELF JOIN = same table joined to itself with two different aliases (e1, e2)",

      "Most common use: manager-employee hierarchy",

      "Always LEFT JOIN for hierarchies (top-level rows have NULL foreign key)",

      "For pairs: add e1.id < e2.id to avoid duplicates"

    ],

    cheatSheet: [

      "FROM t e1 JOIN t e2 ON e1.col = e2.primary_key",

      "Use different aliases (e1, e2) for the two copies",

      "LEFT JOIN for hierarchies — root nodes have NULL foreign key",

      "Pair queries: add AND e1.id < e2.id to prevent (A,B) and (B,A) duplicates"

    ]

  },

22: {

        conceptExplanation: `A correlated subquery is a subquery that references a column from the outer
      query. Unlike a regular subquery that runs once, a correlated subquery re-executes once for EVERY row in
      the outer query.

Syntax:

  SELECT outer.col

  FROM table outer

  WHERE outer.value > (

    SELECT AVG(inner.value)

    FROM table inner

    WHERE inner.group_col = outer.group_col  -- references outer query!

  );

Key difference from a regular subquery:

• Regular subquery: runs once, returns one value/set used by all outer rows

• Correlated subquery: runs N times (once per outer row) — can be slow on large tables

When to use: when the inner calculation depends on each specific outer row.

Performance tip: for large tables, rewrite as a JOIN with a CTE-based aggregate.`,

        visualExplanation: `Think of a correlated subquery like a teacher grading each student relative to
      their own class average (not the school average).

For each student row (outer):

  → Run: "what is the average grade in THIS student's class?" (inner)

  → Compare the student's grade to their class average

For 1000 students, the inner query runs 1000 times — once per student.

Rewrite as JOIN for performance:

  STEP 1: Compute class averages (CTE)

  STEP 2: JOIN students to class averages

  STEP 3: Compare — runs only twice total (once per step)`,

        realBusinessScenario: `The data team at Zomato wants to find restaurants with above-average delivery
      time for their own city (not the national average). A correlated subquery runs the city average
      calculation for each restaurant's city separately:

  SELECT restaurant, city, AVG(delivery_minutes) AS avg_time

  FROM food_orders f1

  GROUP BY restaurant, city

  HAVING AVG(delivery_minutes) > (

    SELECT AVG(delivery_minutes)

    FROM food_orders f2

    WHERE f2.city = f1.city

  );

This compares each restaurant to their city peers, not all restaurants.`,

    examples: [

      {

        title: "Customers with above-average order count (correlated)",

        query: `SELECT

  c.customer_id,

  c.full_name,

  (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.customer_id AND o.status = 'Delivered') AS delivered_orders

FROM customers c

WHERE (

  SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.customer_id AND o.status = 'Delivered'

) > (

  SELECT AVG(cnt) FROM (

    SELECT COUNT(*) AS cnt FROM orders WHERE status = 'Delivered' GROUP BY customer_id

  )

)

ORDER BY delivered_orders DESC;`,

                explanation: "The inner subquery counts delivered orders for each specific customer_id from " +
                             "the outer query. It runs once per customer row. The second subquery computes the " +
                             "overall average order count for comparison."

      },

      {

        title: "Rewritten as JOIN + CTE (recommended for performance)",

        query: `WITH order_counts AS (

  SELECT customer_id, COUNT(*) AS delivered_orders

  FROM orders WHERE status = 'Delivered'

  GROUP BY customer_id

),

avg_count AS (

  SELECT AVG(delivered_orders) AS avg_orders FROM order_counts

)

SELECT c.customer_id, c.full_name, oc.delivered_orders

FROM customers c

JOIN order_counts oc ON c.customer_id = oc.customer_id

CROSS JOIN avg_count ac

WHERE oc.delivered_orders > ac.avg_orders

ORDER BY oc.delivered_orders DESC;`,

                explanation: "This produces the same result but runs the average calculation only once " +
                             "instead of once per customer row. Always prefer this pattern on large datasets."

      }

    ],

    commonMistakes: [

      "Using = when the subquery might return multiple rows — use IN for multi-row subqueries.",

      "Not aliasing the outer and inner table differently — causes ambiguous column errors.",

      "Using correlated subqueries in WHERE on millions of rows — rewrites as CTEs are faster.",

      "Forgetting that correlated subqueries in SELECT (scalar subqueries) can return NULL if no row matches."

    ],

    interviewQuestions: [

      "What is a correlated subquery and how does it differ FROM a regular subquery?",

      "When would you prefer a correlated subquery over a JOIN? (Answer: rarely — " +
      "joins are almost always faster for large tables)",

      "How would you rewrite a correlated subquery as a JOIN for better performance?",

      "Can you use a correlated subquery in a SELECT clause? What does it return?"

    ],

    revisionNotes: [

      "Correlated = references outer query column. Runs once per outer row.",

      "Regular subquery runs once total. Much faster for set-based operations.",

      "Best pattern: WITH cte AS (agg) + JOIN — avoids repeated execution.",

      "Use EXISTS/NOT EXISTS with correlated subqueries for row existence checks — faster than IN."

    ],

    cheatSheet: [

      "Correlated subquery: WHERE col = (SELECT ... WHERE inner.col = outer.col)",

      "Runs N times (once per outer row) — slow on large data",

      "Rewrite pattern: CTE + JOIN replaces most correlated subqueries",

      "EXISTS(correlated) is faster than IN(subquery) for large sets"

    ]

  },

24: {

        conceptExplanation: `A CTE (Common Table Expression) is a named temporary result set defined with the
      WITH keyword. It makes complex queries readable by breaking them into named steps.

Syntax:

  WITH cte_name AS (

    SELECT ...

    FROM ...

  ),

  cte2 AS (

    SELECT ...

    FROM cte_name  -- can reference previous CTEs

  )

  SELECT ...

  FROM cte2;

Benefits over subqueries:

1. Readable — each step is named and self-documenting

2. Reusable — reference the same CTE multiple times in the final SELECT

3. Chainable — CTEs can reference earlier CTEs in the same WITH block

4. Debuggable — test each CTE independently

CTEs vs subqueries:

  Subquery: hard to read when nested 3+ levels

  CTE: each step is on the same level, named clearly

Recursive CTEs (advanced):

A special type of CTE defined with WITH RECURSIVE that references itself. Essential for hierarchical data
(like finding employee-manager chains or generating sequences).

A Recursive CTE has three parts:

1. Anchor Member: The initial query that returns the base result.

2. UNION ALL: Combines the anchor with the recursive step.

3. Recursive Member: A query that references the CTE itself to generate the next row.`,

    visualExplanation: `Without CTE (hard to read):

SELECT * FROM (

  SELECT customer_id, SUM(revenue) AS ltv FROM (

    SELECT customer_id, total_amount - discount_amount AS revenue

    FROM orders WHERE status = 'Delivered'

  ) r GROUP BY customer_id

) agg WHERE ltv > 5000;

With CTE (clear, step by step):

WITH clean_orders AS (

  SELECT customer_id, total_amount - discount_amount AS revenue

  FROM orders WHERE status = 'Delivered'

),

customer_ltv AS (

  SELECT customer_id, SUM(revenue) AS ltv

  FROM clean_orders GROUP BY customer_id

)

SELECT * FROM customer_ltv WHERE ltv > 5000;`,

        realBusinessScenario: `An Ola analyst builds a "driver retention" report. Step 1: find drivers' first
      trip date. Step 2: find their last trip date. Step 3: calculate the gap. Step 4: filter churned drivers.
      Using CTEs, each step is named first_trip, last_trip, tenure, churned — anyone on the team can read the
      logic immediately.`,

    examples: [

      {

        title: "Customer lifetime value with CTE",

        query: `WITH delivered_orders AS (

  SELECT

    o.customer_id,

    o.total_amount - o.discount_amount AS net_amount

  FROM orders o

  WHERE o.status = 'Delivered'

),

customer_ltv AS (

  SELECT

    customer_id,

    COUNT(*) AS orders,

    SUM(net_amount) AS lifetime_value,

    ROUND(AVG(net_amount), 2) AS avg_order_value

  FROM delivered_orders

  GROUP BY customer_id

)

SELECT

  c.full_name,

  c.city,

  c.segment,

  ltv.orders,

  ltv.lifetime_value,

  ltv.avg_order_value

FROM customer_ltv ltv

JOIN customers c ON ltv.customer_id = c.customer_id

WHERE ltv.lifetime_value > 2000

ORDER BY ltv.lifetime_value DESC;`,

                explanation: "CTE 1 cleans and filters. CTE 2 aggregates. Final SELECT joins to get customer " +
                             "details. Each step is clear and testable."

      },

      {

        title: "Month-over-month revenue with CTE",

        query: `WITH monthly AS (

  SELECT

    SUBSTR(order_date, 1, 7) AS month,

    SUM(total_amount - discount_amount) AS net_revenue

  FROM orders

  WHERE status = 'Delivered'

  GROUP BY SUBSTR(order_date, 1, 7)

)

SELECT

  month,

  net_revenue,

  LAG(net_revenue) OVER (ORDER BY month) AS prev_month_revenue,

  ROUND(

    (net_revenue - LAG(net_revenue) OVER (ORDER BY month))

    / NULLIF(LAG(net_revenue) OVER (ORDER BY month), 0) * 100

  , 1) AS mom_growth_pct

FROM monthly

ORDER BY month;`,

                explanation: "CTE computes monthly revenue. Final SELECT uses LAG window function for " +
                             "month-over-month comparison. This is a top-tier DA interview question."

      },

      {

        title: "Recursive CTE: Generate a date sequence",

        query: `WITH RECURSIVE date_series AS (

  -- 1. Anchor Member (base case)

  SELECT '2024-01-01' AS date_val

  UNION ALL

  -- 2. Recursive Member

  SELECT DATE(date_val, '+1 day')

  FROM date_series

  WHERE date_val < '2024-01-05' -- Termination condition

)

SELECT * FROM date_series;`,

                explanation: "This recursive CTE starts with Jan 1st. It then continually adds 1 day to the " +
                             "previous result until it reaches Jan 5th. Essential for creating calendar tables " +
                             "or finding missing dates in a dataset."

      }

    ],

    commonMistakes: [

      "Not aliasing a CTE used in FROM — CTEs act like tables and must be referenced by name.",

      "Using semicolons between CTEs — use commas to separate multiple CTEs.",

      "Referencing a CTE that appears later in the WITH block — CTEs are defined in order."

    ],

    interviewQuestions: [

      "What is a CTE and when would you use it instead of a subquery?",

      "Can a CTE reference another CTE defined earlier in the same query?",

      "Write a query using a CTE to find the top customer per city.",

      "Are CTEs always faster than subqueries? (Answer: No, they are syntactic sugar. " +
      "In some engines they are materialized, in others they act exactly like inline " +
      "views.)",

      "What is a Recursive CTE and when would you use one?"

    ],

    revisionNotes: [

      "WITH name AS (...), name2 AS (...) SELECT ... FROM name2",

      "CTEs are readable, reusable, chainable. Prefer over deep nested subqueries.",

      "Test each CTE by running it in isolation during development."

    ],

    cheatSheet: [

      "WITH cte AS (SELECT ...) SELECT ... FROM cte",

      "Multiple CTEs: WITH a AS (...), b AS (...) SELECT ...",

      "CTEs run once per query execution (not cached like views)",

      "Recursive: WITH RECURSIVE x AS (SELECT 1 AS n UNION ALL SELECT n+1 FROM x WHERE n < 5)"

    ]

  },

25: {

        conceptExplanation: `ROW_NUMBER() assigns a unique sequential integer to each row within a partition,
      ordered by a specified column. No two rows share the same number — even on ties (unlike RANK or
      DENSE_RANK).\n\nGolden Rule of Window Functions:
*   **No Window Functions in WHERE or HAVING:** Window functions are executed *after* filtering and grouping.
Therefore, you cannot filter on a window function result in the same query block.
*   **The CTE Wrapper Solution:** To filter on rank or row numbers, you must wrap the query in a Common Table
Expression (CTE) or subquery:
    \`\`\`sql
    WITH ranked_orders AS (
      SELECT order_id, RANK() OVER(ORDER BY amount DESC) as rk FROM orders
    )
    SELECT * FROM ranked_orders WHERE rk <= 3;
    \`\`\`

Syntax:

  ROW_NUMBER() OVER (

    PARTITION BY col  -- optional: restart numbering per group

    ORDER BY col2 DESC  -- required: defines the ordering within partition

  )

Key properties:

• Always produces unique numbers: 1, 2, 3, 4… (no gaps, no ties)

• Non-deterministic on ties: if two rows have the same ORDER BY value, either can get row 1

• Used to get exactly ONE row per group (top-1 per category)

Critical rule: you CANNOT filter on ROW_NUMBER in the same query.

Wrap in a CTE:

  WITH r AS (SELECT *, ROW_NUMBER() OVER (...) AS rn FROM table)

  SELECT * FROM r WHERE rn = 1;`,

    visualExplanation: `Example: top-selling product per category

| category    | product_name       | revenue | ROW_NUMBER() OVER (PARTITION BY category ORDER BY revenue DESC) |

|-------------|--------------------|---------|-----------------------------------------------------------------|

| Electronics | Headphones         | 45000   | 1  ← top in Electronics

| Electronics | Ergo Keyboard      | 12000   | 2

| Electronics | Wireless Mouse     | 5000    | 3

| Fashion     | Running Shoes      | 18000   | 1  ← top in Fashion

| Fashion     | Cotton Kurta       | 6000    | 2

| Home        | Office Chair       | 32000   | 1  ← top in Home

| Home        | Steel Water Bottle | 2400    | 2

Filter WHERE rn = 1 → 3 rows (one per category)`,

        realBusinessScenario: `Myntra's merchandising team needs: "For each product category, which single
      product had the highest revenue this quarter?"

This is the classic TOP-1-PER-GROUP problem. ROW_NUMBER() guarantees exactly one row per category — even if
two products tied for first place (unlike RANK which would return both).

When ties don't matter: use ROW_NUMBER()

When ties matter: use RANK() or DENSE_RANK()`,

    examples: [

      {

        title: "Top product per category (classic ROW_NUMBER pattern)",

        query: `WITH product_revenue AS (

  SELECT

    p.category,

    p.product_name,

    SUM(oi.quantity * oi.unit_price) AS revenue

  FROM products p

  JOIN order_items oi ON p.product_id = oi.product_id

  JOIN orders o ON oi.order_id = o.order_id

  WHERE o.status = 'Delivered'

  GROUP BY p.category, p.product_name

),

ranked AS (

  SELECT *,

    ROW_NUMBER() OVER (PARTITION BY category ORDER BY revenue DESC) AS rn

  FROM product_revenue

)

SELECT category, product_name, revenue

FROM ranked

WHERE rn = 1

ORDER BY revenue DESC;`,

                explanation: "Two-CTE pattern: (1) aggregate revenue per product, (2) rank with ROW_NUMBER " +
                             "within each category, (3) filter to rn=1 in the outer SELECT. This pattern is " +
                             "asked in virtually every senior DA interview."

      },

      {

        title: "Most recent order per customer",

        query: `WITH ordered AS (

  SELECT

    customer_id, order_id, order_date, total_amount, status,

    ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC) AS rn

  FROM orders

)

SELECT customer_id, order_id, order_date, total_amount, status

FROM ordered

WHERE rn = 1

ORDER BY customer_id;`,

                explanation: "PARTITION BY customer_id restarts the row numbering for each customer. ORDER BY " +
                             "order_date DESC puts the most recent order first. WHERE rn = 1 returns only that " +
                             "most recent order per customer."

      }

    ],

    commonMistakes: [

      "Filtering WHERE rn = 1 in the same query WHERE ROW_NUMBER is defined — must use a CTE.",

      "Using ROW_NUMBER when tied rows should get the same rank — use RANK() or DENSE_RANK() instead.",

      "Forgetting ORDER BY inside OVER() — without it, row numbers are assigned in arbitrary order.",

      "Using ROW_NUMBER() without PARTITION BY — assigns a single sequence across the entire result set."

    ],

    interviewQuestions: [

      "What is the difference between ROW_NUMBER, RANK, and DENSE_RANK?",

      "Write a query to return the most recent order per customer.",

      "Write a query to return the top product per category by revenue.",

      "Why can't you filter on a window function result in the same WHERE clause?"

    ],

    revisionNotes: [

      "ROW_NUMBER: always unique — 1,2,3,4. RANK: gaps after ties. DENSE_RANK: no gaps.",

      "Pattern: WITH r AS (SELECT *, ROW_NUMBER() OVER (...) AS rn FROM ...) SELECT * FROM r WHERE rn=1",

      "Cannot filter window result in same query — ALWAYS use CTE wrapper.",

      "PARTITION BY = restart numbering per group. Without it = global numbering."

    ],

    cheatSheet: [

      "ROW_NUMBER() OVER (PARTITION BY x ORDER BY y DESC) AS rn",

      "Filter: wrap in CTE, then WHERE rn = 1",

      "Top-1 per group: ROW_NUMBER. Top-N allowing ties: RANK. Top-N no gaps: DENSE_RANK.",

      "Most common pattern in DA interviews: top product/customer per segment"

    ]

  },

26: {

        conceptExplanation: `Window functions perform calculations across a set of rows related to the
      current row — WITHOUT collapsing them like GROUP BY.

Syntax:

  function() OVER (

    [PARTITION BY col]    -- group rows (like GROUP BY but rows stay)

    [ORDER BY col]         -- order within the partition

    [ROWS BETWEEN ...]     -- frame specification

  )

Key difference from GROUP BY:

  GROUP BY: 10 rows → 3 groups → 3 result rows (rows collapsed)

  Window:   10 rows → still 10 result rows (rows preserved, function value added)

Most common window functions:

  ROW_NUMBER() → unique sequential number per partition

  RANK()       → rank with gaps for ties

  DENSE_RANK() → rank without gaps for ties

  LEAD(col, n) → value FROM n rows ahead

  LAG(col, n)  → value FROM n rows behind

  SUM() OVER   → running total

  AVG() OVER   → moving average

  NTILE(n)     → divide rows into n equal buckets`,

    visualExplanation: `orders grouped by region (no window):

│ region │ total_revenue │  ← 3 rows only (GROUP BY collapsed)

│ North  │ 45000         │

│ South  │ 62000         │

│ West   │ 38000         │

orders with window function (rows preserved):

│ order_id │ region │ revenue │ region_total │ rank_in_region │

│ 1        │ North  │ 1200    │ 45000        │ 3              │

│ 2        │ North  │ 8000    │ 45000        │ 1              │

│ 3        │ South  │ 3200    │ 62000        │ 2              │

All rows preserved, window values added.`,

        realBusinessScenario: `"Rank products by revenue within each category" — this requires RANK() OVER
      (PARTITION BY category ORDER BY revenue DESC). GROUP BY cannot do this because you need both the
      individual product rows AND their rank. Window functions are the key differentiator between junior and
      senior analyst SQL.`,

    examples: [

      {

        title: "Rank products by revenue within category",

        query: `WITH product_revenue AS (

  SELECT

    p.category,

    p.product_name,

    SUM(oi.quantity * oi.unit_price) AS revenue

  FROM products p

  JOIN order_items oi ON p.product_id = oi.product_id

  JOIN orders o ON oi.order_id = o.order_id

  WHERE o.status = 'Delivered'

  GROUP BY p.category, p.product_name

)

SELECT

  category,

  product_name,

  revenue,

  RANK() OVER (PARTITION BY category ORDER BY revenue DESC) AS rank_in_category,

  ROUND(

    100.0 * revenue / SUM(revenue) OVER (PARTITION BY category), 1

  ) AS pct_of_category_revenue

FROM product_revenue

ORDER BY category, rank_in_category;`,

                explanation: "PARTITION BY category creates separate windows per category. RANK() ranks " +
                             "within each. SUM() OVER (PARTITION BY) gives category totals without collapsing " +
                             "rows."

      },

      {

        title: "Running total revenue over time",

        query: `WITH daily AS (

  SELECT

    order_date,

    SUM(total_amount - discount_amount) AS daily_revenue

  FROM orders

  WHERE status = 'Delivered'

  GROUP BY order_date

)

SELECT

  order_date,

  daily_revenue,

  SUM(daily_revenue) OVER (ORDER BY order_date) AS cumulative_revenue,

  ROUND(AVG(daily_revenue) OVER (

    ORDER BY order_date

    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW

  ), 2) AS seven_day_avg

FROM daily

ORDER BY order_date;`,

                explanation: "SUM() OVER (ORDER BY date) = running total. AVG() OVER (ROWS BETWEEN 6 " +
                             "PRECEDING AND CURRENT ROW) = 7-day moving average. These are standard " +
                             "time-series patterns."

      }

    ],

    commonMistakes: [

      "Trying to filter with WHERE on a window function result — must use a CTE or subquery wrapper.",

      "Confusing RANK() and DENSE_RANK() — RANK has gaps (1,1,3), DENSE_RANK does not (1,1,2).",

      "Omitting PARTITION BY when you want per-group windows — without it, the window is the whole table."

    ],

    interviewQuestions: [

      "What is the difference between GROUP BY and window functions?",

      "Explain RANK vs DENSE_RANK vs ROW_NUMBER with an example of tied values.",

      "How do you calculate a running total in SQL?"

    ],

    revisionNotes: [

      "Window functions preserve rows. GROUP BY collapses rows.",

      "OVER (PARTITION BY col ORDER BY col2) — per-group window.",

      "To filter on window function result, wrap in CTE or subquery."

    ],

    cheatSheet: [

      "RANK() OVER (PARTITION BY cat ORDER BY revenue DESC)",

      "SUM(rev) OVER (ORDER BY date) → running total",

      "LAG(col, 1) OVER (ORDER BY date) → previous row's value"

    ]

  },

27: {

    conceptExplanation: `LAG(col, n, default) — returns the value from n rows BEHIND the current row.

LEAD(col, n, default) — returns the value FROM n rows AHEAD of the current row.

Both are window functions — they require OVER() with ORDER BY.

Syntax:

  LAG(column, n, default_if_null) OVER (PARTITION BY group_col ORDER BY sort_col)

  LEAD(column, n, default_if_null) OVER (PARTITION BY group_col ORDER BY sort_col)

Parameters:

• column: the value to look back/forward at

• n (optional, default=1): how many rows to look back/forward

• default_if_null (optional): what to return when there's no previous/next row (returns NULL by default)

Key use cases:

• Month-over-month (MoM) or year-over-year growth

• Sequential comparison (this period vs last period)

• Finding gaps between consecutive events

• Day-on-day revenue change`,

    visualExplanation: `Monthly revenue table:

  Month   | Revenue | LAG(rev,1) | LEAD(rev,1)

  2024-01 | 10000   | NULL       | 12000   ← no previous month → NULL

  2024-02 | 12000   | 10000      | 9500

  2024-03 | 9500    | 12000      | 14000

  2024-04 | 14000   | 9500       | NULL    ← no next month → NULL

MoM growth = (current - LAG) / LAG * 100

  2024-02: (12000-10000)/10000*100 = +20%

  2024-03: (9500-12000)/12000*100 = -20.8%

  2024-04: (14000-9500)/9500*100 = +47.4%`,

        realBusinessScenario: `The business analyst at Zomato presents a monthly revenue report to the CEO.
      The CEO wants to know: "How much did we grow vs last month and vs last year?"

Monthly CTE → LAG(1) for MoM → LAG(12) for YoY (if 12 months of data):

  MoM growth = (this_month - LAG(rev,1)) / LAG(rev,1) * 100

  YoY growth = (this_month - LAG(rev,12)) / LAG(rev,12) * 100

NULLIF protects against division by zero on the first month.`,

    examples: [

      {

        title: "Month-over-month revenue growth",

        query: `WITH monthly AS (

  SELECT

    SUBSTR(order_date, 1, 7) AS month,

    SUM(total_amount - discount_amount) AS revenue

  FROM orders

  WHERE status = 'Delivered'

  GROUP BY 1

)

SELECT

  month,

  ROUND(revenue, 2) AS revenue,

  ROUND(LAG(revenue, 1) OVER (ORDER BY month), 2) AS prev_month,

  ROUND(

    (revenue - LAG(revenue, 1) OVER (ORDER BY month))

    / NULLIF(LAG(revenue, 1) OVER (ORDER BY month), 0) * 100,

  1) AS mom_growth_pct

FROM monthly

ORDER BY month;`,

                explanation: "CTE aggregates to monthly grain. LAG(revenue,1) pulls the previous month's " +
                             "revenue. NULLIF prevents division by zero (returns NULL instead of error for the " +
                             "first month). ROUND formats cleanly."

      },

      {

        title: "Days between consecutive orders per customer",

        query: `WITH ordered AS (

  SELECT

    customer_id, order_id, order_date,

    LAG(order_date, 1) OVER (PARTITION BY customer_id ORDER BY order_date) AS prev_order_date

  FROM orders

  WHERE status = 'Delivered'

)

SELECT

  customer_id, order_id, order_date, prev_order_date,

  ROUND(JULIANDAY(order_date) - JULIANDAY(prev_order_date)) AS days_since_last_order

FROM ordered

WHERE prev_order_date IS NOT NULL

ORDER BY customer_id, order_date;`,

                explanation: "PARTITION BY customer_id restarts LAG for each customer. ORDER BY order_date " +
                             "means LAG looks back to the previous order for that same customer. JULIANDAY " +
                             "computes the difference in days."

      }

    ],

    commonMistakes: [

      "Forgetting ORDER BY inside OVER() — LAG/LEAD are undefined without ordering.",

      "Dividing by LAG without NULLIF — causes division by zero error on the first row.",

      "Missing PARTITION BY for per-group comparisons — without it, LAG crosses group boundaries.",

      "Comparing to previous row in overall ORDER BY instead of within-group order."

    ],

    interviewQuestions: [

      "What do LAG and LEAD functions do? How are they different?",

      "Write a query to calculate month-over-month revenue growth.",

      "How do you prevent a division by zero error when using LAG for growth calculation?",

      "What happens at the first row when you use LAG(col, 1)?"

    ],

    revisionNotes: [

      "LAG(col, n): look n rows back. LEAD(col, n): look n rows forward.",

      "Require ORDER BY in OVER(). PARTITION BY for per-group comparison.",

      "First/last row returns NULL — use COALESCE or NULLIF for safety.",

      "MoM pattern: CTE monthly → LAG(rev,1) → (current-prev)/NULLIF(prev,0)*100"

    ],

    cheatSheet: [

      "LAG(col, 1) OVER (PARTITION BY grp ORDER BY date): previous row per group",

      "LEAD(col, 1) OVER (ORDER BY date): next row",

      "MoM growth: (rev - LAG(rev,1) OVER (...)) / NULLIF(LAG(rev,1) OVER (...), 0) * 100",

      "NULLIF(value, 0): returns NULL if value is 0 (prevents division by zero)"

    ]

  },

29: {

        conceptExplanation: `UNION and UNION ALL stack results from two or more SELECT statements
      vertically.\n\nUNION ALL Performance Rule:
*   **Always Prefer UNION ALL:** \`UNION\` removes duplicate rows by performing an expensive sorting and
de-duplication step. \`UNION ALL\` simply stacks the rows directly. Unless you explicitly need to de-duplicate
the results, always use \`UNION ALL\` for better query speed.

UNION: removes duplicate rows from the combined result (runs a DISTINCT sort — slower)

UNION ALL: keeps ALL rows including duplicates (no dedup — faster)

Rules:

• Both SELECT statements must have the SAME number of columns

• Corresponding columns must have compatible data types

• Column names in the output come FROM the FIRST SELECT statement

• ORDER BY can only appear once at the end (applies to the full combined result)

Syntax:

  SELECT col1, col2 FROM table1 WHERE condition1

  UNION ALL

  SELECT col1, col2 FROM table2 WHERE condition2

  ORDER BY col1;

When to use:

• Combine data FROM two tables with similar structure

• Stack filtered subsets with labels (status breakdown)

• Create summary rows (totals + detail rows)

• Append data FROM different time periods`,

    visualExplanation: `Table A:        Table B:

  id | val       id | val

   1 | 100        2 | 200

   2 | 150        3 | 300

UNION (removes duplicates):

  id | val

   1 | 100

   2 | 150   ← id=2 appears only once (deduped)

   3 | 300

UNION ALL (keeps everything):

  id | val

   1 | 100

   2 | 150   ← FROM Table A

   2 | 200   ← FROM Table B (both kept!)

   3 | 300

Conclusion: always use UNION ALL unless you explicitly need deduplication.`,

        realBusinessScenario: `Operations dashboard at Swiggy needs a single report showing order counts and
      revenue by status:

  Delivered | 12 | ₹82,000

  Returned  | 2  | ₹3,400

  Cancelled | 1  | ₹1,200

Instead of GROUP BY (which sums across all statuses), UNION ALL lets you label each row:

  SELECT 'Delivered', COUNT(*), SUM(net) FROM orders WHERE status='Delivered'

  UNION ALL

  SELECT 'Returned',  COUNT(*), SUM(net) FROM orders WHERE status='Returned'

  UNION ALL

  SELECT 'Cancelled', COUNT(*), SUM(net) FROM orders WHERE status='Cancelled'`,

    examples: [

      {

        title: "Order status breakdown with UNION ALL",

                query: `SELECT 'Delivered' AS status, COUNT(*) AS orders, ROUND(SUM(total_amount -
          discount_amount), 2) AS net_revenue

FROM orders WHERE status = 'Delivered'

UNION ALL

SELECT 'Returned',  COUNT(*), ROUND(SUM(total_amount - discount_amount), 2)

FROM orders WHERE status = 'Returned'

UNION ALL

SELECT 'Cancelled', COUNT(*), ROUND(SUM(total_amount - discount_amount), 2)

FROM orders WHERE status = 'Cancelled'

UNION ALL

SELECT 'ALL STATUSES', COUNT(*), ROUND(SUM(total_amount - discount_amount), 2)

FROM orders;`,

                explanation: "UNION ALL stacks the results of four independent queries. The last SELECT adds " +
                             "a grand total row. Column names come from the first SELECT. Each query is " +
                             "independently filtered — no GROUP BY needed."

      },

      {

        title: "Combine customers from two segments",

        query: `SELECT customer_id, full_name, 'Premium' AS tier, signup_date

FROM customers WHERE segment = 'Premium'

UNION ALL

SELECT customer_id, full_name, 'Value', signup_date

FROM customers WHERE segment = 'Value'

ORDER BY signup_date DESC;`,

                explanation: "Stacks two filtered customer sets. UNION ALL is used (not UNION) because the " +
                             "same customer can't be in both segments — duplicates are impossible, so UNION " +
                             "ALL is faster."

      }

    ],

    commonMistakes: [

      "Using UNION when UNION ALL is sufficient — UNION sorts the entire result to " +
      "find duplicates, which is expensive.",

      "Different column counts between SELECT statements — causes a syntax error.",

      "Putting ORDER BY inside an individual SELECT in a UNION — must be at the very end after all UNION statements.",

      "Assuming UNION removes all duplicates globally — it only deduplicates the " +
      "COMBINED result, not each individual SELECT."

    ],

    interviewQuestions: [

      "What is the difference between UNION and UNION ALL?",

      "When would you prefer UNION ALL over UNION?",

      "What are the requirements for two SELECT statements to be combined with UNION?",

      "Can you add an ORDER BY inside individual SELECT statements in a UNION query?"

    ],

    revisionNotes: [

      "UNION: removes duplicates (slower, requires sort). UNION ALL: keeps all rows (faster).",

      "Both SELECTs must have same column count and compatible types.",

      "Column names FROM first SELECT. ORDER BY at the very end only.",

      "Default choice: UNION ALL (faster). Use UNION only when dedup is needed."

    ],

    cheatSheet: [

      "UNION ALL: stack rows, keep duplicates (fast). UNION: stack + dedup (slow).",

      "Requirements: same column count, compatible types",

      "ORDER BY: only once, at the very end of the combined query",

      "Common use: status breakdown rows, append historical data"

    ]

  },

31: {

        conceptExplanation: `CASE WHEN is SQL's if-else logic. It lets you create conditional columns,
      categories, and labels inside SELECT or aggregate functions.

Syntax (searched CASE):

  CASE

    WHEN condition1 THEN result1

    WHEN condition2 THEN result2

    ELSE default_result

  END AS alias

Syntax (simple CASE):

  CASE column

    WHEN value1 THEN result1

    WHEN value2 THEN result2

    ELSE default_result

  END AS alias

Key uses:

1. Categorise numeric ranges → revenue_band

2. Create flags → is_repeat_customer (0 or 1)

3. Conditional aggregation → SUM(CASE WHEN status='Delivered' THEN amount ELSE 0 END)

4. Null handling → CASE WHEN col IS NULL THEN 'Unknown' ELSE col END

5. Pivot-style reporting

CASE is evaluated left to right — the first matching WHEN wins.

ELSE is optional but recommended — without it, unmatched rows return NULL.\n\nGolden Rules of CASE WHEN:
1. **Sequential Evaluation:** CASE WHEN evaluates conditions in order from top to bottom. The first condition
that evaluates to TRUE is executed, and subsequent conditions are ignored. Put more specific filters before
general ones.
2. **The ELSE Fallback:** Always provide an \`ELSE\` clause. If no condition matches and there is no
\`ELSE\`, CASE WHEN returns \`NULL\`.`,

    visualExplanation: `Revenue banding example:

total_amount = 500  → WHEN <= 1000 THEN 'Low'

total_amount = 2000 → WHEN <= 3000 THEN 'Medium'

total_amount = 8000 → ELSE 'High'

output column: revenue_band

│ 500  │ Low    │

│ 2000 │ Medium │

│ 8000 │ High   │`,

        realBusinessScenario: `A Zomato analyst segments orders into value tiers (Low / Medium / High) for a
      stakeholder presentation. Using CASE WHEN, they create the tier column directly in SQL — no Python
      needed. This is one of the most-asked SQL patterns in DA interviews.`,

    examples: [

      {

        title: "Order value banding",

        query: `SELECT

  order_id,

  total_amount,

  discount_amount,

  total_amount - discount_amount AS net_amount,

  CASE

    WHEN total_amount - discount_amount < 500   THEN 'Low (<500)'

    WHEN total_amount - discount_amount < 2000  THEN 'Medium (500-1999)'

    WHEN total_amount - discount_amount < 5000  THEN 'High (2000-4999)'

    ELSE 'Premium (5000+)'

  END AS order_tier

FROM orders

WHERE status = 'Delivered'

ORDER BY net_amount DESC

LIMIT 15;`,

                explanation: "CASE WHEN creates a categorical label from a numeric value. The tiers are " +
                             "evaluated in order — first match wins."

      },

      {

        title: "Conditional aggregation — pivot by status",

        query: `SELECT

  c.region,

  COUNT(*) AS total_orders,

  SUM(CASE WHEN o.status = 'Delivered'  THEN 1 ELSE 0 END) AS delivered,

  SUM(CASE WHEN o.status = 'Returned'   THEN 1 ELSE 0 END) AS returned,

  SUM(CASE WHEN o.status = 'Cancelled'  THEN 1 ELSE 0 END) AS cancelled,

  ROUND(

    100.0 * SUM(CASE WHEN o.status = 'Delivered' THEN 1 ELSE 0 END) / COUNT(*), 1

  ) AS delivery_rate_pct

FROM customers c

JOIN orders o ON c.customer_id = o.customer_id

GROUP BY c.region

ORDER BY delivery_rate_pct DESC;`,

                explanation: "SUM(CASE WHEN ...) is the pivot technique. Each status becomes a column. This " +
                             "is a very common interview pattern."

      }

    ],

    commonMistakes: [

      "Forgetting ELSE — rows that don't match any WHEN get NULL, not 0.",

      "CASE without END — syntax error.",

      "Overlapping WHEN conditions — only the first match is used."

    ],

    interviewQuestions: [

      "Write a query to categorise orders into value tiers.",

      "How do you use CASE WHEN inside SUM to create a pivot?",

      "What is the difference between a searched CASE and a simple CASE?"

    ],

    revisionNotes: [

      "CASE WHEN ... THEN ... ELSE ... END — always end with END.",

      "Without ELSE, unmatched rows → NULL.",

      "SUM(CASE WHEN cond THEN 1 ELSE 0 END) = count of rows matching condition."

    ],

    cheatSheet: [

      "CASE WHEN col > 1000 THEN 'High' ELSE 'Low' END AS band",

      "SUM(CASE WHEN status='X' THEN amount ELSE 0 END) — conditional sum",

      "First matching WHEN wins — order matters"

    ]

  },

40: {

        conceptExplanation: `Query optimization is writing SQL that produces correct results as fast as
      possible by reducing the work the database engine has to do.

Key principles:

1. Filter early — WHERE reduces rows before joins and aggregations

2. Join on indexed columns — primary/foreign keys are usually indexed

3. Avoid SELECT * — reading all columns increases I/O unnecessarily

4. UNION ALL over UNION — skip the deduplication sort step

5. Write SARGable queries (Search ARGument ABLE) - avoid using functions on columns in your WHERE clause, as
this prevents the database FROM using indexes (forcing a full table scan).

   Bad:  WHERE YEAR(order_date) = 2024   ← can't use index

   Good: WHERE order_date >= '2024-01-01' AND order_date < '2025-01-01'

6. Use CTEs for readability — they don't hurt performance in most databases

7. GROUP BY before ORDER BY — aggregate first, sort second

8. LIMIT during exploration — prevents scanning millions of rows

Execution Plans (EXPLAIN):

Appending EXPLAIN (or EXPLAIN ANALYZE) before your query shows the engine's execution plan.

• Index Seek: The database used an index (like a book's index) to jump straight to the exact rows. (Fast!)

• Table Scan / Index Scan: The database had to read every single row to check the condition. (Slow!)`,

    visualExplanation: `Query cost analogy — imagine scanning a physical ledger:

Bad query:

  FROM orders (all 1M rows)

  JOIN customers (all 100K)

  → result: 1M×100K potential combinations

  → THEN filter by status

Good query:

  FROM orders WHERE status='Delivered' (→ 700K rows filtered first)

  JOIN customers (100K)

  → result: 700K×100K combinations

  → Much smaller intermediate result

Filter BEFORE you join. Every row you eliminate early is work the JOIN never has to do.`,

    realBusinessScenario: `A Flipkart dashboard query takes 45 seconds. The analyst investigates:

1. No WHERE — loading all 5M orders, including cancelled ones

2. SELECT * — reading 12 columns when only 3 are needed

3. WHERE MONTH(order_date) = 3 — function prevents index use

Fixes:

1. Add WHERE status='Delivered' — drops to 3M rows

2. Name only required columns — reduces I/O

3. Change to WHERE order_date BETWEEN '2024-03-01' AND '2024-03-31'

Result: query runs in 4 seconds.`,

    examples: [

      {

        title: "Before vs after optimization",

        query: `-- BEFORE: slow, reads all data

SELECT *

FROM orders o

JOIN customers c ON o.customer_id = c.customer_id

JOIN order_items oi ON o.order_id = oi.order_id

GROUP BY c.region

HAVING o.status = 'Delivered'  -- filtering AFTER group = wasteful

ORDER BY SUM(o.total_amount) DESC;

-- AFTER: fast, filters early

SELECT

  c.region,

  COUNT(DISTINCT o.order_id) AS orders,

  ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue

FROM orders o

JOIN customers c ON o.customer_id = c.customer_id

JOIN order_items oi ON o.order_id = oi.order_id

WHERE o.status = 'Delivered'          -- filter BEFORE joining

  AND o.order_date >= '2024-01-01'    -- narrow date range

GROUP BY c.region

ORDER BY revenue DESC;`,

                explanation: "The bad version puts a non-aggregate filter in HAVING (runs after full table " +
                             "scan + group). The good version moves it to WHERE (runs before join, drastically " +
                             "reducing rows). Always filter in WHERE when the condition doesn't involve " +
                             "aggregates."

      },

      {

        title: "EXPLAIN QUERY PLAN (SQLite)",

        query: `EXPLAIN QUERY PLAN

SELECT c.region, COUNT(o.order_id) AS orders

FROM customers c

JOIN orders o ON c.customer_id = o.customer_id

WHERE o.status = 'Delivered'

GROUP BY c.region

ORDER BY orders DESC;`,

                explanation: "EXPLAIN QUERY PLAN shows the database's plan without running the query. Look " +
                             "for 'SCAN TABLE' (slow, full scan) vs 'SEARCH TABLE USING INDEX' (fast, indexed " +
                             "lookup/Seek). In real interviews, mention that you check the execution plan when " +
                             "a query is slow."

      }

    ],

    commonMistakes: [

      "Filtering in HAVING instead of WHERE for non-aggregate conditions.",

      "SELECT * in production queries — always name the columns you need.",

      "WHERE YEAR(col) = 2024 — function prevents index use. Use range comparison instead.",

      "Not checking row counts at each step — understanding how many rows flow through " +
      "each stage catches performance issues."

    ],

    interviewQuestions: [

      "How would you optimize a slow SQL query? Walk me through your approach.",

      "Why is WHERE status='X' more efficient than HAVING status='X' for a non-aggregate filter?",

      "What does EXPLAIN or EXPLAIN QUERY PLAN tell you? What is the difference " +
      "between an Index Seek and a Table Scan?",

      "What does SARGable mean in the context of SQL performance?",

      "Why does WHERE YEAR(date) = 2024 perform worse than WHERE date BETWEEN ... AND ...?"

    ],

    revisionNotes: [

      "Filter first: WHERE reduces rows before joins — less data = less work.",

      "Write SARGable queries: Avoid functions on columns in WHERE so indexes can be used (Seek vs Scan).",

      "SELECT * is expensive: name only the columns you need.",

      "EXPLAIN QUERY PLAN: shows index usage and scan type (interview win).",

      "UNION ALL > UNION (skip dedup sort)."

    ],

    cheatSheet: [

      "Filter early: WHERE before JOIN. Less data = faster join.",

      "Avoid SELECT *: name columns explicitly",

      "Don't use functions on filtered cols in WHERE: prefer date ranges",

      "UNION ALL (keep dups, fast) vs UNION (dedup, slow)",

      "EXPLAIN QUERY PLAN → see if index is used"

    ]

  },

41: {

        conceptExplanation: `Advanced Business SQL combines CTEs, window functions, JOINs, CASE WHEN, and
      aggregates into multi-step analytical queries that answer complex real business questions.

Key advanced patterns for DA interviews:

1. Cohort Analysis: group customers by signup month, track behaviour over time

2. Retention / Churn: customers active in month N who are/aren't active in month N+1

3. Month-over-Month Growth: CTE → LAG → growth %

4. Top-N per Group: CTE → ROW_NUMBER → WHERE rn = 1

5. Conditional Aggregation / Pivot: SUM(CASE WHEN...)

6. Running Totals: SUM() OVER (ORDER BY date)

7. Customer Segmentation: GROUP BY segment → CASE WHEN revenue bands

8. Funnel Analysis: count at each stage → drop-off %

Interview approach:

1. Clarify the grain: one row = one WHAT?

2. Identify required tables

3. Sketch the query in steps (CTEs are your friend)

4. State edge cases: NULLs, duplicate orders, status filters

5. Validate the output`,

    visualExplanation: `Multi-step query design (think in layers):

Layer 1 (CTE: base data):

  Filter + join + basic aggregation → clean, filtered dataset

Layer 2 (CTE: intermediate metrics):

  Apply window functions or further aggregation

Layer 3 (CTE: rankings/flags):

  ROW_NUMBER, RANK, CASE WHEN segments

Layer 4 (final SELECT):

  Filter, format, and present the answer

This layered approach — instead of one nested monster query — is what separates junior FROM senior SQL writers.`,

        realBusinessScenario: `A business analyst at CRED is asked: "Find our top 3 customers by revenue in
      each city and show how their lifetime value compares to the city average."

Steps:

1. Compute customer LTV (GROUP BY customer + city)

2. Compute city average LTV

3. Rank customers within each city

4. Filter to top 3

5. Join city average back in

This requires: CTE chain + ROW_NUMBER + AVG OVER (PARTITION BY city) + final filter.`,

    examples: [

      {

        title: "Top 3 customers per city with city average comparison",

        query: `WITH customer_ltv AS (

  SELECT

    c.customer_id, c.full_name, c.city,

    SUM(o.total_amount - o.discount_amount) AS ltv

  FROM customers c

  JOIN orders o ON c.customer_id = o.customer_id

  WHERE o.status = 'Delivered'

  GROUP BY c.customer_id, c.full_name, c.city

),

ranked AS (

  SELECT *,

    ROUND(AVG(ltv) OVER (PARTITION BY city), 2) AS city_avg_ltv,

    ROW_NUMBER() OVER (PARTITION BY city ORDER BY ltv DESC) AS rn

  FROM customer_ltv

)

SELECT

  city, full_name, ltv, city_avg_ltv,

  ROUND(ltv - city_avg_ltv, 2) AS vs_city_avg,

  CASE WHEN ltv > city_avg_ltv THEN 'Above Average' ELSE 'Below Average' END AS segment

FROM ranked

WHERE rn <= 3

ORDER BY city, rn;`,

                explanation: "CTE 1: aggregates LTV per customer. CTE 2: adds city average (AVG OVER " +
                             "PARTITION BY city) and ROW_NUMBER (ranking within city). Final SELECT filters " +
                             "top 3 and labels each customer as above/below their city average."

      },

      {

        title: "Monthly cohort revenue: first 3 months after signup",

        query: `WITH customer_first AS (

  SELECT customer_id, SUBSTR(signup_date, 1, 7) AS cohort_month

  FROM customers

),

order_months AS (

  SELECT

    o.customer_id,

    SUBSTR(o.order_date, 1, 7) AS order_month,

    SUM(o.total_amount - o.discount_amount) AS revenue

  FROM orders o

  WHERE o.status = 'Delivered'

  GROUP BY o.customer_id, SUBSTR(o.order_date, 1, 7)

)

SELECT

  cf.cohort_month,

  om.order_month,

  COUNT(DISTINCT om.customer_id) AS active_customers,

  ROUND(SUM(om.revenue), 2) AS revenue

FROM customer_first cf

JOIN order_months om ON cf.customer_id = om.customer_id

GROUP BY cf.cohort_month, om.order_month

ORDER BY cf.cohort_month, om.order_month;`,

                explanation: "CTE 1: tags each customer with their signup cohort month. CTE 2: aggregates " +
                             "monthly order revenue. Final query: shows how each cohort's revenue evolves " +
                             "month by month. This is a standard retention/cohort analysis."

      },

      {

        title: "Basic E-commerce Funnel Analysis",

        query: `WITH funnel AS (

  SELECT

    COUNT(DISTINCT c.customer_id) AS total_signups,

    COUNT(DISTINCT o.customer_id) AS users_who_ordered,

    COUNT(DISTINCT CASE WHEN o.status = 'Delivered' THEN o.customer_id END) AS users_who_completed

  FROM customers c

  LEFT JOIN orders o ON c.customer_id = o.customer_id

)

SELECT

  total_signups,

  users_who_ordered,

  users_who_completed,

  ROUND(CAST(users_who_ordered AS REAL) / total_signups * 100, 2) AS order_conversion_pct,

  ROUND(CAST(users_who_completed AS REAL) / users_who_ordered * 100, 2) AS completion_rate_pct

FROM funnel;`,

                explanation: "Uses a LEFT JOIN to keep the top of the funnel (all signups), then uses COUNT " +
                             "DISTINCT and conditional aggregation (CASE WHEN) to count how many users reached " +
                             "each subsequent stage. Finally, calculates drop-off percentages."

      }

    ],

    commonMistakes: [

      "Trying to solve complex problems in one query instead of using CTEs — CTEs make each step testable.",

      "Forgetting to filter by order status — mixing delivered and cancelled orders corrupts revenue metrics.",

      "Using AVG() instead of SUM()/COUNT() for AOV — AVG of transaction value includes cancelled orders by default.",

      "Not clarifying the grain before writing — the most common cause of wrong results in DA interviews."

    ],

    interviewQuestions: [

      "Walk me through how you'd calculate monthly churn rate in SQL.",

      "How would you design a cohort analysis query? What's the grain?",

      "How would you find the top N customers per city and compare them to the city average?",

      "What is conditional aggregation and when do you use it?",

      "How would you compute a 7-day rolling average in SQL?"

    ],

    revisionNotes: [

      "Advanced SQL = combining CTEs + window functions + aggregates in layers.",

      "Always clarify grain first: one row = one WHAT?",

      "CTE chain: base data → intermediate metrics → rankings → final output.",

      "Status filter (WHERE status='Delivered') is almost always needed for revenue metrics.",

      "Practice: cohort, retention, MoM growth, top-N per group, funnel."

    ],

    cheatSheet: [

      "Top-N per group: CTE(agg) → ROW_NUMBER() OVER(PARTITION BY x) → WHERE rn<=N",

      "MoM growth: monthly CTE → LAG(rev,1) → (curr-prev)/NULLIF(prev,0)*100",

      "Conditional agg: SUM(CASE WHEN status='X' THEN amt ELSE 0 END)",

      "Running total: SUM(rev) OVER (ORDER BY month)",

      "Cohort: JOIN customers signup_month to orders order_month → GROUP BY both"

    ]

  }
,

  7: {

        conceptExplanation: `IN checks whether a column value matches any value in a list. NOT IN checks the
      opposite. BETWEEN checks if a value falls within a range (inclusive on both ends).

IN syntax:
  WHERE column IN (value1, value2, value3)
  WHERE column NOT IN (value1, value2)

IN with a subquery:
  WHERE customer_id IN (SELECT customer_id FROM orders WHERE status = 'Cancelled')

BETWEEN syntax:
  WHERE price BETWEEN 100 AND 500
  WHERE order_date BETWEEN '2024-01-01' AND '2024-03-31'

Key rules:
1. NOT IN with NULLs: if any value in the list is NULL, NOT IN returns NO rows. Use NOT EXISTS instead.
2. BETWEEN is inclusive: BETWEEN 10 AND 20 includes both 10 and 20.
3. IN (val1, val2) is equivalent to col = val1 OR col = val2.`,

    visualExplanation: `Think of IN like a checklist:
  city IN ('Mumbai', 'Delhi', 'Bangalore')
  = "Is city on my checklist? Yes → include row. No → skip."

BETWEEN is like a price tag range filter in a shopping app:
  price BETWEEN 500 AND 2000
  = "Is the price inside this range? Yes → show it."

NOT IN is the inverse — exclude rows that match the list.`,

        realBusinessScenario: `Swiggy analyst task: "Find all orders from metros (Mumbai, Delhi, Bangalore,
      Hyderabad) in Q1 2024 worth more than ₹500."

You need:
1. IN to filter cities
2. BETWEEN to filter the date range and amount
3. AND to combine conditions

This type of multi-condition filter appears in 80% of real analytics queries.`,

    examples: [
      {
        title: "IN: filter by specific cities",
        query: `SELECT order_id, city, total_amount
FROM orders
WHERE city IN ('Mumbai', 'Delhi', 'Bangalore')
ORDER BY city;`,
        explanation: "IN checks if city matches any of the three values. Much cleaner than three OR conditions."
      },
      {
        title: "BETWEEN: orders in a price range",
        query: `SELECT order_id, total_amount
FROM orders
WHERE total_amount BETWEEN 500 AND 2000
  AND status = 'Delivered'
ORDER BY total_amount;`,
        explanation: "BETWEEN 500 AND 2000 includes both endpoints. Combined with AND status filter."
      },
      {
        title: "NOT IN: exclude certain statuses",
        query: `SELECT order_id, status, total_amount
FROM orders
WHERE status NOT IN ('Cancelled', 'Returned')
ORDER BY order_date DESC;`,
                explanation: "NOT IN excludes rows matching any listed value. Equivalent to status != " +
                             "'Cancelled' AND status != 'Returned'."
      }
    ],

    commonMistakes: [
      "NOT IN returns no rows if the list has any NULL value — use NOT EXISTS instead",
      "BETWEEN includes both endpoints — BETWEEN 1 AND 5 includes 1 and 5",
      "Using IN for 100+ values — a subquery or JOIN is more efficient for large lists"
    ],

    interviewQuestions: [
      "How does the IN operator behave when the list contains a NULL value?",
      "Why does NOT IN fail when the subquery returns any NULL?",
      "Is BETWEEN 10 AND 20 the same as >= 10 AND <= 20?"
    ],

    revisionNotes: [
      "IN (a, b, c) = col = a OR col = b OR col = c",
      "BETWEEN is always inclusive on both ends",
      "NOT IN is dangerous with NULLs — prefer NOT EXISTS for subqueries"
    ],

    cheatSheet: [
      "WHERE col IN ('A', 'B', 'C') — match any listed value",
      "WHERE col BETWEEN 10 AND 100 — inclusive range",
      "WHERE col NOT IN ('X', 'Y') — exclude listed values (watch for NULLs)"
    ]

  }

,

  15: {

    conceptExplanation: `WHERE and HAVING both filter rows, but at different stages of SQL query execution.

SQL execution order:
  FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT

WHERE:
  Filters individual rows BEFORE grouping
  Cannot use aggregate functions (COUNT, SUM, AVG, etc.)

HAVING:
  Filters groups AFTER aggregation
  Must use aggregate functions or GROUP BY columns

When to use each:
  WHERE  → filter raw data (e.g., only delivered orders)
  HAVING → filter groups (e.g., cities with total revenue > 50000)

You can use BOTH in the same query. WHERE runs first and reduces rows before GROUP BY.
This makes HAVING's work smaller and the query faster.

Golden Rule: Always put non-aggregate conditions in WHERE, not HAVING.
HAVING is only for conditions on aggregate results.`,

    visualExplanation: `Data flow:
  Raw orders table → WHERE (remove Cancelled) → GROUP BY city → HAVING (keep cities > 50k revenue) → Output

WHERE acts like a bouncer at the door — filters before anyone gets in.
HAVING acts like a judge at the end — reviews the final group summaries.`,

        realBusinessScenario: `Zomato analyst: "Which cities have more than 1000 delivered orders AND average
      order value above ₹300?"

You need:
  WHERE status = 'Delivered'     ← filter rows first
  GROUP BY city
  HAVING COUNT(*) > 1000         ← filter groups by count
    AND AVG(total_amount) > 300  ← filter groups by average`,

    examples: [
      {
        title: "HAVING: cities with high total revenue",
        query: `SELECT city,
       COUNT(*) AS order_count,
       SUM(total_amount - discount_amount) AS net_revenue
FROM orders
WHERE status = 'Delivered'
GROUP BY city
HAVING SUM(total_amount - discount_amount) > 50000
ORDER BY net_revenue DESC;`,
                explanation: "WHERE filters raw rows first (only Delivered orders). HAVING then filters the " +
                             "aggregated city groups."
      },
      {
        title: "Combined WHERE and HAVING",
        query: `SELECT customer_id,
       COUNT(*) AS total_orders,
       AVG(total_amount) AS avg_order_value
FROM orders
WHERE order_date >= '2024-01-01'
GROUP BY customer_id
HAVING COUNT(*) >= 3
ORDER BY avg_order_value DESC;`,
                explanation: "WHERE restricts to recent orders before grouping. HAVING keeps only customers " +
                             "with 3+ orders. Both work together."
      }
    ],

    commonMistakes: [
      "WHERE COUNT(*) > 5 — syntax error, aggregates belong in HAVING",
      "Putting non-aggregate conditions in HAVING instead of WHERE (runs slower)",
      "Forgetting HAVING can only reference GROUP BY columns or aggregate results"
    ],

    interviewQuestions: [
      "What is the difference between COUNT(column_name) and COUNT(*) with respect to NULL values?",
      "Can you use an aggregate function in a WHERE clause?",
      "Why does WHERE filter happen before GROUP BY in SQL's execution order?"
    ],

    revisionNotes: [
      "WHERE → before GROUP BY, filters individual rows",
      "HAVING → after GROUP BY, filters aggregated groups",
      "WHERE cannot use aggregates. HAVING must use aggregates or GROUP BY cols."
    ],

    cheatSheet: [
      "WHERE filters rows (before GROUP BY)",
      "HAVING filters groups (after GROUP BY)",
      "WHERE status = 'X' + GROUP BY col + HAVING COUNT(*) > 5"
    ]

  }

,

  21: {

        conceptExplanation: `A subquery is a SELECT query nested inside another query. It lets you use the
      result of one query as input to another.

Three types by placement:

1. Subquery in WHERE clause — filters using another query's result:
   WHERE customer_id IN (SELECT customer_id FROM orders WHERE total_amount > 5000)

2. Subquery in FROM clause (Derived Table) — use a query result as a temporary table:
   FROM (SELECT customer_id, COUNT(*) AS cnt FROM orders GROUP BY customer_id) AS cust_orders

3. Scalar subquery in SELECT clause — computes one value per row:
   SELECT total_amount, (SELECT AVG(total_amount) FROM orders) AS avg_val

EXISTS vs IN:
  IN materialises the full result list.
  EXISTS runs a correlated check for each outer row and stops when a match is found.
  NOT EXISTS is SAFER than NOT IN when the subquery might return NULL values.

Golden Rules:
1. Every FROM subquery (derived table) MUST have an alias.
2. Scalar subqueries MUST return exactly 1 row and 1 column — else runtime error.
3. NOT EXISTS is safer than NOT IN when NULLs may appear in the subquery result.`,

    visualExplanation: `Subquery execution flow:
  Outer query asks: "Give me customers WHERE customer_id IN (...)"
  Inner query runs first: "...SELECT customer_id FROM orders WHERE total_amount > 5000"
  Inner result: [101, 203, 405]
  Outer query uses that list to filter.

Think of it as: inner query builds the answer, outer query uses it.`,

        realBusinessScenario: `Meesho analytics task: "Find all customers who placed an order in January 2024
      with total > ₹2000. Show their customer_id, name, and city."

Best approach: subquery in WHERE:
  WHERE customer_id IN (SELECT customer_id FROM orders WHERE order_date LIKE '2024-01%' AND total_amount > 2000)`,

    examples: [
      {
        title: "Subquery in WHERE with IN",
        query: `SELECT customer_id, name, city
FROM customers
WHERE customer_id IN (
  SELECT DISTINCT customer_id
  FROM orders
  WHERE status = 'Delivered'
    AND total_amount > 2000
)
ORDER BY name;`,
        explanation: "Inner query finds customer IDs with qualifying orders. Outer query retrieves customer details."
      },
      {
        title: "NOT EXISTS (safer than NOT IN)",
        query: `SELECT c.customer_id, c.name
FROM customers c
WHERE NOT EXISTS (
  SELECT 1
  FROM orders o
  WHERE o.customer_id = c.customer_id
);`,
                explanation: "Finds customers with no orders. NOT EXISTS is preferred over NOT IN because it " +
                             "handles NULLs safely."
      },
      {
        title: "Derived table in FROM",
        query: `SELECT city, AVG(order_count) AS avg_orders_per_customer
FROM (
  SELECT customer_id, city, COUNT(*) AS order_count
  FROM orders
  GROUP BY customer_id, city
) AS customer_orders
GROUP BY city
ORDER BY avg_orders_per_customer DESC;`,
                explanation: "Inner query computes orders per customer. Outer query averages those counts by " +
                             "city — double aggregation."
      }
    ],

    commonMistakes: [
      "Forgetting alias for derived table: FROM (SELECT ...) ← missing AS alias — syntax error",
      "Scalar subquery returning multiple rows — causes runtime error",
      "Using NOT IN when subquery might return NULLs — use NOT EXISTS instead"
    ],

    interviewQuestions: [
      "What is the difference between IN and EXISTS?",
      "What is a scalar subquery and what constraint does it have?",
      "Why does NOT IN fail when the subquery returns a NULL value?"
    ],

    revisionNotes: [
      "Subquery in WHERE → filter by another query's result (use IN or EXISTS)",
      "Subquery in FROM → derived table, must have alias",
      "Scalar subquery in SELECT → must return exactly 1 row, 1 column"
    ],

    cheatSheet: [
      "WHERE col IN (SELECT col FROM table WHERE ...) — filter by subquery",
      "FROM (SELECT ...) AS alias — derived table",
      "WHERE EXISTS (SELECT 1 FROM ... WHERE outer.col = inner.col) — existence check"
    ]

  }

,

  23: {

        conceptExplanation: `A derived table is a subquery in the FROM clause. It acts as a temporary virtual
      table that only exists for the duration of the outer query. Every derived table MUST have an alias.

Syntax:
  SELECT outer_cols
  FROM (
    SELECT inner_cols
    FROM base_table
    WHERE conditions
    GROUP BY ...
  ) AS alias_name
  WHERE outer_conditions;

Key use cases:
1. Double aggregation — aggregate data, then aggregate the result again
2. Pre-filter before a join — reduce rows before an expensive JOIN operation
3. Complex transformations — apply business logic before querying further

Derived table vs CTE (WITH clause):
  Both achieve the same result.
  Derived tables are inline inside the query — good for simple, one-off cases.
  CTEs are defined at the top with WITH — much more readable for complex multi-step logic.
  Rule of thumb: if you have more than one derived table or the logic is complex, use CTEs.

Golden Rule: Columns you reference in the outer query MUST be selected in the inner query.`,

    visualExplanation: `Derived table flow:
  Step 1: Inner SELECT runs and creates a virtual table.
  Step 2: Outer SELECT queries that virtual table like it's a real table.

Example:
  FROM (SELECT city, AVG(amount) AS avg_amt FROM orders GROUP BY city) AS city_avgs
  WHERE avg_amt > 1000

The alias city_avgs is required — without it, SQL doesn't know what to call the result.`,

        realBusinessScenario: `Amazon India analyst: "What is the average number of orders placed per
      customer in each city? Show cities where this average is above 3."

You need:
  Step 1: Calculate orders per customer (GROUP BY customer_id, city)
  Step 2: Average those counts by city (GROUP BY city)
  This requires a double aggregation — the perfect use case for a derived table.`,

    examples: [
      {
        title: "Double aggregation: average orders per customer by city",
        query: `SELECT city, ROUND(AVG(order_count), 1) AS avg_orders_per_customer
FROM (
  SELECT o.customer_id, c.city, COUNT(*) AS order_count
  FROM orders o
  JOIN customers c ON o.customer_id = c.customer_id
  WHERE o.status = 'Delivered'
  GROUP BY o.customer_id, c.city
) AS customer_summary
GROUP BY city
HAVING AVG(order_count) >= 2
ORDER BY avg_orders_per_customer DESC;`,
                explanation: "Inner query gets orders-per-customer. Outer query averages those by city. This " +
                             "is the classic double aggregation pattern."
      },
      {
        title: "Top product per category using derived table + window function",
        query: `SELECT category, product_name, revenue
FROM (
  SELECT p.category,
         p.product_name,
         SUM(oi.quantity * oi.unit_price) AS revenue,
         ROW_NUMBER() OVER (PARTITION BY p.category ORDER BY SUM(oi.quantity * oi.unit_price) DESC) AS rn
  FROM products p
  JOIN order_items oi ON p.product_id = oi.product_id
  JOIN orders o ON oi.order_id = o.order_id
  WHERE o.status = 'Delivered'
  GROUP BY p.category, p.product_name
) AS ranked_products
WHERE rn = 1
ORDER BY revenue DESC;`,
                explanation: "Inner query ranks products by revenue within each category. Outer query filters " +
                             "to keep only the top-ranked product per category."
      }
    ],

    commonMistakes: [
      "Missing alias on derived table: FROM (SELECT ...) without AS alias — syntax error",
      "Referencing in outer query a column not selected in the inner query",
      "Deep nesting of derived tables — use CTEs instead for readability"
    ],

    interviewQuestions: [
      "When would you use a derived table vs a CTE?",
      "What is the purpose of an alias on a derived table?",
      "What is double aggregation and how do you implement it in SQL?"
    ],

    revisionNotes: [
      "Derived table = subquery in FROM clause with an alias",
      "All columns referenced in outer query must be in inner query's SELECT",
      "Prefer CTEs over multiple nested derived tables for readability"
    ],

    cheatSheet: [
      "FROM (SELECT ... FROM ... GROUP BY ...) AS alias — derived table",
      "Double aggregation: inner GROUP BY customer, outer GROUP BY city",
      "Every derived table must have AS alias_name"
    ]

  }

,

  28: {

        conceptExplanation: `Running totals and moving averages use aggregate window functions — SUM, AVG,
      COUNT with an OVER() clause. Unlike GROUP BY, they keep all rows visible while computing
      rolling/cumulative values.

Running Total (Cumulative Sum):
  SUM(col) OVER (ORDER BY date_col)
  Each row shows the sum FROM the first row up to the current row.

Group Total Without Collapsing:
  SUM(col) OVER (PARTITION BY group_col)
  Shows the group's total on every row. Used for % of total calculations.

Moving / Rolling Average:
  AVG(col) OVER (ORDER BY date_col ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)
  Average of the current row and the 6 rows before it (7-row rolling window).

Window Frame Syntax:
  ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW  → cumulative (default with ORDER BY)
  ROWS BETWEEN 6 PRECEDING AND CURRENT ROW          → 7-row rolling window
  ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING          → 3-row centered window

% of Total Pattern (very common in interviews):
  SUM(revenue) / SUM(SUM(revenue)) OVER () * 100
  Inner SUM = group total. Outer SUM(...) OVER() = grand total across all groups.

Golden Rules:
1. SUM OVER (ORDER BY) = running total. Without ORDER BY = partition constant.
2. ROWS BETWEEN only applies when ORDER BY is specified in OVER().
3. For running totals within a group: PARTITION BY group ORDER BY date.`,

    visualExplanation: `Without PARTITION BY ORDER BY:
  SUM(revenue) OVER () → same grand total on every row

With ORDER BY only:
  SUM(revenue) OVER (ORDER BY month) → cumulative total, grows each row

With PARTITION BY + ORDER BY:
  SUM(revenue) OVER (PARTITION BY city ORDER BY month) → cumulative per city

With ROWS BETWEEN:
  AVG(revenue) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)
  → 3-month rolling average`,

        realBusinessScenario: `Myntra financial reporting: "Show monthly revenue alongside the cumulative
      revenue for the year, and a 3-month rolling average to smooth out seasonal spikes."

This requires:
1. Monthly revenue via GROUP BY
2. Cumulative: SUM(monthly) OVER (ORDER BY month)
3. Rolling avg: AVG(monthly) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)`,

    examples: [
      {
        title: "Running total of monthly revenue",
        query: `SELECT
  SUBSTR(order_date, 1, 7) AS month,
  SUM(total_amount - discount_amount) AS monthly_revenue,
  SUM(SUM(total_amount - discount_amount)) OVER (ORDER BY SUBSTR(order_date, 1, 7)) AS cumulative_revenue
FROM orders
WHERE status = 'Delivered'
GROUP BY 1
ORDER BY 1;`,
                explanation: "The outer SUM wraps the GROUP BY SUM to create a running total across months. " +
                             "Note the double SUM pattern."
      },
      {
        title: "% of total revenue by category",
        query: `SELECT
  p.category,
  SUM(oi.quantity * oi.unit_price) AS category_revenue,
  ROUND(SUM(oi.quantity * oi.unit_price) * 100.0 /
        SUM(SUM(oi.quantity * oi.unit_price)) OVER (), 1) AS pct_of_total
FROM products p
JOIN order_items oi ON p.product_id = oi.product_id
JOIN orders o ON oi.order_id = o.order_id
WHERE o.status = 'Delivered'
GROUP BY p.category
ORDER BY category_revenue DESC;`,
                explanation: "SUM(oi.quantity * oi.unit_price) gives each category's revenue. SUM(...) OVER " +
                             "() gives the grand total across all categories."
      },
      {
        title: "3-month moving average",
        query: `SELECT
  SUBSTR(order_date, 1, 7) AS month,
  SUM(total_amount - discount_amount) AS monthly_revenue,
  ROUND(AVG(SUM(total_amount - discount_amount)) OVER (
    ORDER BY SUBSTR(order_date, 1, 7)
    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
  ), 0) AS rolling_3mo_avg
FROM orders
WHERE status = 'Delivered'
GROUP BY 1
ORDER BY 1;`,
                explanation: "ROWS BETWEEN 2 PRECEDING AND CURRENT ROW creates a 3-month window (2 before + " +
                             "current). AVG over this window gives the rolling average."
      }
    ],

    commonMistakes: [
      "SUM OVER without ORDER BY when you want a running total — gives partition total instead",
      "Using RANGE BETWEEN instead of ROWS BETWEEN on non-unique dates (unexpected results)",
      "Forgetting that ROWS BETWEEN only works when ORDER BY is in the OVER() clause"
    ],

    interviewQuestions: [
      "What is the difference between SUM() OVER (ORDER BY) and SUM() OVER (PARTITION BY)?",
      "How do you calculate a 7-day moving average using window functions?",
      "What does ROWS BETWEEN 2 PRECEDING AND CURRENT ROW mean?"
    ],

    revisionNotes: [
      "Running total: SUM(col) OVER (ORDER BY date)",
      "Group total on each row: SUM(col) OVER (PARTITION BY group)",
      "% of total: col_total / SUM(col_total) OVER () * 100",
      "Moving avg: AVG(col) OVER (ORDER BY date ROWS BETWEEN N PRECEDING AND CURRENT ROW)"
    ],

    cheatSheet: [
      "Cumulative sum: SUM(x) OVER (ORDER BY date)",
      "Moving avg 7-day: AVG(x) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)",
      "% of total: value / SUM(value) OVER () * 100"
    ]

  }

,

  30: {

    conceptExplanation: `INTERSECT and EXCEPT are set operators that compare two result sets.

INTERSECT:
  Returns rows that appear in BOTH result sets.
  Automatically removes duplicates (like UNION, not UNION ALL).
  Conceptually equivalent to an INNER JOIN on all selected columns.

EXCEPT (called MINUS in Oracle):
  Returns rows in the FIRST result set that do NOT appear in the SECOND.
  Automatically removes duplicates.
  Conceptually equivalent to a LEFT JOIN + IS NULL pattern.

Rules (same as UNION):
1. Both SELECT statements must return the same number of columns.
2. Columns must have compatible data types in matching positions.
3. Column names come FROM the first SELECT statement.

INTERSECT vs JOIN:
  INTERSECT is simpler for comparing whole rows FROM simple queries.
  JOIN is more flexible and allows comparing specific columns.

EXCEPT vs LEFT JOIN + IS NULL:
  EXCEPT is cleaner for comparing whole rows.
  LEFT JOIN + IS NULL is more flexible for partial column comparisons.

Note: In most production code, JOINs are used instead of INTERSECT/EXCEPT
for better control and readability. Know INTERSECT and EXCEPT for interviews.`,

    visualExplanation: `INTERSECT:
  Set A = {1, 2, 3, 4}
  Set B = {3, 4, 5, 6}
  A INTERSECT B = {3, 4}    → only what's in BOTH

EXCEPT:
  Set A = {1, 2, 3, 4}
  Set B = {3, 4, 5, 6}
  A EXCEPT B = {1, 2}       → in A but NOT in B`,

    realBusinessScenario: `Ola analyst: "Which driver IDs completed trips in BOTH January AND February 2024?"
→ Use INTERSECT between January trip driver IDs and February trip driver IDs.

"Which customers placed an order in January but NOT in February?"
→ Use EXCEPT: January customer IDs EXCEPT February customer IDs.`,

    examples: [
      {
        title: "INTERSECT: products ordered in both months",
        query: `SELECT product_id FROM order_items
WHERE order_id IN (SELECT order_id FROM orders WHERE order_date LIKE '2024-01%')
INTERSECT
SELECT product_id FROM order_items
WHERE order_id IN (SELECT order_id FROM orders WHERE order_date LIKE '2024-02%');`,
        explanation: "Returns product IDs that appear in BOTH January AND February orders."
      },
      {
        title: "EXCEPT: customers who ordered but never returned",
        query: `SELECT DISTINCT customer_id FROM orders WHERE status = 'Delivered'
EXCEPT
SELECT DISTINCT customer_id FROM orders WHERE status = 'Returned';`,
                explanation: "Customers who placed a Delivered order but have NO Returned order. EXCEPT " +
                             "removes the second set from the first."
      },
      {
        title: "LEFT JOIN equivalent of EXCEPT",
        query: `SELECT DISTINCT o1.customer_id
FROM orders o1
LEFT JOIN orders o2
  ON o1.customer_id = o2.customer_id
  AND o2.status = 'Returned'
WHERE o1.status = 'Delivered'
  AND o2.customer_id IS NULL;`,
                explanation: "This produces the same result as the EXCEPT query above. LEFT JOIN + IS NULL is " +
                             "more flexible and common in production."
      }
    ],

    commonMistakes: [
      "Different column counts between the two SELECT statements — syntax error",
      "Oracle uses MINUS instead of EXCEPT",
      "Using EXCEPT when you need to compare on specific columns only — use LEFT JOIN instead"
    ],

    interviewQuestions: [
      "What is the difference between INTERSECT and INNER JOIN?",
      "How would you replace EXCEPT with a LEFT JOIN?",
      "Does INTERSECT remove duplicates automatically?"
    ],

    revisionNotes: [
      "INTERSECT = rows in both sets (like inner JOIN on all columns)",
      "EXCEPT = rows in first set that are not in second (like LEFT JOIN + IS NULL)",
      "Both require same number of columns and compatible types"
    ],

    cheatSheet: [
      "A INTERSECT B → rows in both A and B",
      "A EXCEPT B → rows in A not in B",
      "Oracle uses MINUS instead of EXCEPT"
    ]

  }

,

  32: {

        conceptExplanation: `PIVOTING and NTILE() are two powerful patterns for transforming data into
      business-ready formats.

PART 1 — PIVOT with CASE WHEN:
SQL doesn't have native PIVOT syntax in most databases. Use CASE WHEN inside SUM():
  SUM(CASE WHEN category = 'Electronics' THEN revenue ELSE 0 END) AS electronics

This converts row values into columns — turning category rows into side-by-side columns.
Always use ELSE 0 in SUM(CASE WHEN) to avoid NULL in aggregates.

PART 2 — NTILE(n) Bucketing:
NTILE(n) divides rows into n equal-sized buckets, numbered 1 to n.
  NTILE(4) OVER (ORDER BY revenue DESC) → Q1 (top 25%), Q2, Q3, Q4

Common use cases:
  NTILE(4)   → quartiles
  NTILE(10)  → deciles (top 10%, next 10%, etc.)
  NTILE(100) → percentile buckets

Groups are as equal as possible — if rows don't divide evenly, earlier buckets get one extra row.

Golden Rules:
1. NTILE requires ORDER BY in OVER() — it defines which rows go into which bucket.
2. Pivot with CASE WHEN requires knowing all category values in advance.
3. Always use ELSE 0 in SUM(CASE WHEN ...) to prevent NULL leaking into totals.`,

    visualExplanation: `PIVOT transform (rows → columns):
Before:
  month   | category     | revenue
  2024-01 | Electronics  | 50000
  2024-01 | Clothing     | 30000

After pivot:
  month   | electronics | clothing
  2024-01 | 50000       | 30000

NTILE(4) example:
  Customer LTV ranking:
  Rank 1-25th percentile → Bucket 1 (Platinum)
  Rank 26-50th percentile → Bucket 2 (Gold)
  etc.`,

        realBusinessScenario: `Flipkart category performance report: "Show total revenue for each category
      side by side per month, so the business head can compare Electronics vs Clothing vs Books in one row."

This is a pivot — you need CASE WHEN inside SUM() to rotate category rows into columns.`,

    examples: [
      {
        title: "PIVOT: category revenue as columns",
        query: `SELECT
  SUBSTR(order_date, 1, 7) AS month,
  SUM(CASE WHEN p.category = 'Electronics' THEN oi.quantity * oi.unit_price ELSE 0 END) AS electronics,
  SUM(CASE WHEN p.category = 'Clothing'    THEN oi.quantity * oi.unit_price ELSE 0 END) AS clothing,
  SUM(CASE WHEN p.category = 'Books'       THEN oi.quantity * oi.unit_price ELSE 0 END) AS books,
  SUM(oi.quantity * oi.unit_price) AS total
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
JOIN products p ON oi.product_id = p.product_id
WHERE o.status = 'Delivered'
GROUP BY SUBSTR(order_date, 1, 7)
ORDER BY month;`,
        explanation: "CASE WHEN inside SUM() routes each row's revenue to the right column. ELSE 0 prevents NULL."
      },
      {
        title: "NTILE: divide customers into quartiles",
        query: `WITH customer_revenue AS (
  SELECT customer_id,
         SUM(total_amount - discount_amount) AS lifetime_value
  FROM orders
  WHERE status = 'Delivered'
  GROUP BY customer_id
)
SELECT customer_id,
       lifetime_value,
       NTILE(4) OVER (ORDER BY lifetime_value DESC) AS quartile,
       CASE NTILE(4) OVER (ORDER BY lifetime_value DESC)
         WHEN 1 THEN 'Platinum'
         WHEN 2 THEN 'Gold'
         WHEN 3 THEN 'Silver'
         ELSE 'Bronze'
       END AS tier
FROM customer_revenue
ORDER BY lifetime_value DESC;`,
        explanation: "NTILE(4) divides customers by revenue into 4 equal buckets. Bucket 1 = top 25% (highest LTV)."
      }
    ],

    commonMistakes: [
      "NTILE without ORDER BY in OVER() — random bucketing, meaningless result",
      "Pivoting without ELSE 0 — NULL values break SUM calculations",
      "Expecting NTILE buckets to always be equal size when total rows don't divide evenly"
    ],

    interviewQuestions: [
      "How do you pivot rows into columns in SQL without a PIVOT keyword?",
      "What does NTILE(4) return and how is it different FROM RANK()?",
      "How would you segment customers into top/middle/bottom thirds by spend?"
    ],

    revisionNotes: [
      "Pivot: SUM(CASE WHEN category = X THEN value ELSE 0 END) AS col_name",
      "NTILE(n) divides rows into n equal buckets, numbered 1 to n",
      "NTILE(4) = quartiles. NTILE(10) = deciles."
    ],

    cheatSheet: [
      "Pivot: SUM(CASE WHEN col = 'X' THEN value ELSE 0 END) AS X",
      "NTILE(4) OVER (ORDER BY metric DESC) → quartile 1=top",
      "Always ORDER BY in NTILE OVER() — it determines which bucket each row gets"
    ]

  }

,

  33: {

        conceptExplanation: `CREATE TABLE defines the structure of a new table: its columns, data types, and
      constraints. In Data Warehousing (DWH), schema design follows Dimensional Modeling to optimize
      analytical queries:

1. **Facts vs Dimensions**:
   - **Fact Tables**: Store quantitative measurements/metrics of business events (e.g., sales revenue,
   quantity sold). They are thin, tall, have foreign keys to dimensions, and are transaction-grain.
   - **Dimension Tables**: Store descriptive attributes/context about the business entities (e.g., customer
   city, product brand). They are wide, short, and contain descriptive columns.

2. **Star vs Snowflake Schema**:
   - **Star Schema**: Dimensions are fully denormalized (joined directly to the central Fact table).
   Optimized for speed and simpler queries.
   - **Snowflake Schema**: Dimensions are normalized into secondary tables (e.g., products points to brand,
   brand points to supplier). Optimized for redundancy cleanup, but requires more joins.

3. **Table Grain**:
   - Defines what a single row represents (e.g., 'one row per order line item' vs 'one row per daily store
   summary'). Defining grain upfront is critical.

4. **Slowly Changing Dimensions (SCD)**:
   - **SCD Type 1**: Overwrite old data with new data (no history is preserved).
   - **SCD Type 2**: Add a new row with track parameters (start_date, end_date, is_current) to preserve full history.

SQL Constraints:
  PRIMARY KEY  → unique identifier, cannot be NULL, auto-indexed
  NOT NULL     → value is required, no NULLs allowed
  UNIQUE       → all values must be distinct
  DEFAULT val  → used when no value is provided on INSERT
  FOREIGN KEY  → enforces referential integrity with another table
  CHECK(cond)  → enforces business rules (e.g., price > 0)`,

    visualExplanation: `Table structure = blueprint for data storage.

  Column name | Data type  | Constraint
  ------------|------------|-------------------
  customer_id | INTEGER    | PRIMARY KEY
  email       | VARCHAR(200)| UNIQUE NOT NULL
  created_at  | DATE       | DEFAULT today

Primary Key = the unique row identifier.
Foreign Key = a column that points to another table's Primary Key.
NOT NULL = the field MUST have a value — NULL not allowed.`,

        realBusinessScenario: `You are onboarding a new data source at a startup. The engineering team asks
      you to define the schema for a new "referrals" table to track customer referrals.

You need to define:
- referral_id (primary key)
- referrer_customer_id (foreign key to customers)
- referred_customer_id (foreign key to customers)
- referral_date
- reward_amount (must be >= 0)`,

    examples: [
      {
        title: "Create a customers table",
        query: `CREATE TABLE customers (
  customer_id INTEGER PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(200) UNIQUE NOT NULL,
  city        VARCHAR(50),
  created_at  DATE DEFAULT (DATE('now'))
);`,
                explanation: "PRIMARY KEY ensures unique customer IDs. UNIQUE NOT NULL on email prevents " +
                             "duplicates. DEFAULT provides the current date automatically."
      },
      {
        title: "Create a table with foreign key and CHECK constraint",
        query: `CREATE TABLE products (
  product_id   INTEGER PRIMARY KEY,
  product_name VARCHAR(200) NOT NULL,
  price        DECIMAL(10, 2) NOT NULL CHECK(price > 0),
  stock        INTEGER DEFAULT 0 CHECK(stock >= 0),
  category     VARCHAR(50) NOT NULL
);`,
                explanation: "CHECK constraints enforce business rules at the database level. price > 0 " +
                             "prevents negative prices. stock >= 0 prevents negative inventory."
      }
    ],

    commonMistakes: [
      "Forgetting PRIMARY KEY — leads to duplicate rows and incorrect JOIN results",
      "Using TEXT for everything — loses type safety and makes range queries slower",
      "Not adding NOT NULL to required columns — NULLs can silently corrupt aggregates"
    ],

    interviewQuestions: [
      "What is the difference between PRIMARY KEY and UNIQUE constraints?",
      "What does a FOREIGN KEY constraint enforce?",
      "Why should you avoid using TEXT for columns WHERE you know the max length?"
    ],

    revisionNotes: [
      "PRIMARY KEY = unique, NOT NULL, auto-indexed — one per table",
      "FOREIGN KEY = links to another table's primary key",
      "CHECK = enforce business rule at database level"
    ],

    cheatSheet: [
      "PRIMARY KEY = unique row identifier, cannot be NULL",
      "NOT NULL = required field",
      "FOREIGN KEY (col) REFERENCES other_table(pk_col)",
      "CHECK(price > 0) = enforce business rules"
    ]

  }

,

  34: {

    conceptExplanation: `ALTER TABLE modifies an existing table's structure without losing data.

Common operations:

1. Add a column:
   ALTER TABLE table_name ADD COLUMN column_name datatype [constraints];

2. Rename the table:
   ALTER TABLE old_name RENAME TO new_name;

3. Rename a column (SQLite 3.25+):
   ALTER TABLE table_name RENAME COLUMN old_name TO new_name;

4. Drop a column (not supported in older SQLite):
   ALTER TABLE table_name DROP COLUMN column_name;

SQLite limitation: SQLite supports ADD COLUMN and RENAME, but NOT change of data type
or DROP COLUMN in older versions. For complex changes, recreate the table:
  1. CREATE TABLE new_table with desired structure
  2. INSERT INTO new_table SELECT ... FROM old_table
  3. DROP TABLE old_table
  4. ALTER TABLE new_table RENAME TO old_table

Adding a NOT NULL column to an existing table requires a DEFAULT value (for existing rows).

Note for DAs: ALTER TABLE is done by engineers. You need to understand it for interviews and to read
migration scripts.`,

    visualExplanation: `ALTER TABLE = table surgery.
You can add limbs (columns) or rename the patient (table name).
But you cannot change the skeleton (data type) without full reconstruction.

Adding a column with DEFAULT: existing rows get the default value automatically.
Adding a column with NOT NULL but no DEFAULT: fails because existing rows have no value.`,

        realBusinessScenario: `The business team decides to track whether each customer has opted into
      marketing emails. You need to add an is_marketing_opted_in column to the existing customers table with a
      default of 1 (opted in by default).`,

    examples: [
      {
        title: "Add a new column with a default value",
        query: `ALTER TABLE customers ADD COLUMN phone VARCHAR(20);

ALTER TABLE orders ADD COLUMN updated_at DATE DEFAULT (DATE('now'));`,
        explanation: "ADD COLUMN appends a new column to the table. Existing rows get NULL (or the DEFAULT value)."
      },
      {
        title: "Rename a column and a table",
        query: `ALTER TABLE customers RENAME COLUMN name TO full_name;

ALTER TABLE customer_orders RENAME TO orders;`,
        explanation: "RENAME COLUMN changes the column name. RENAME TO renames the entire table."
      },
      {
        title: "Recreate table for complex changes (SQLite pattern)",
        query: `CREATE TABLE customers_new (
  customer_id INTEGER PRIMARY KEY,
  full_name   VARCHAR(100) NOT NULL,
  email       VARCHAR(200) UNIQUE NOT NULL,
  city        VARCHAR(50)
);
INSERT INTO customers_new SELECT customer_id, name, email, city FROM customers;
DROP TABLE customers;
ALTER TABLE customers_new RENAME TO customers;`,
        explanation: "When SQLite doesn't support the change directly, use this create-copy-drop-rename pattern."
      }
    ],

    commonMistakes: [
      "Adding a NOT NULL column without DEFAULT to a table that already has data — error",
      "Expecting all databases to support the same ALTER TABLE operations (they vary)",
      "Dropping a column without checking if queries or views depend on it"
    ],

    interviewQuestions: [
      "How would you add a column to an existing table in SQL?",
      "What is the limitation of ALTER TABLE in SQLite?",
      "How do you rename a table in SQL?"
    ],

    revisionNotes: [
      "ADD COLUMN: ALTER TABLE t ADD COLUMN col type DEFAULT val",
      "RENAME TABLE: ALTER TABLE old RENAME TO new",
      "SQLite complex changes: create new + INSERT SELECT + DROP old + RENAME"
    ],

    cheatSheet: [
      "ALTER TABLE t ADD COLUMN col type — add new column",
      "ALTER TABLE t RENAME COLUMN old TO new — rename column",
      "ALTER TABLE old RENAME TO new — rename table"
    ]

  }

,

  35: {

    conceptExplanation: `DML (Data Manipulation Language) commands modify data inside tables.

INSERT — Add new rows:
  INSERT INTO table (col1, col2) VALUES (val1, val2);
  INSERT INTO table SELECT ... FROM other_table;  -- copy rows

UPDATE — Modify existing rows:
  UPDATE table SET col = value WHERE condition;
  CRITICAL: Always include WHERE. Without WHERE, ALL rows are updated.

DELETE — Remove rows:
  DELETE FROM table WHERE condition;
  CRITICAL: Always include WHERE. Without WHERE, ALL rows are deleted.

Safe DML practice:
1. Run SELECT with the same WHERE first to see what will be affected.
2. Wrap important DML in a transaction (BEGIN / COMMIT / ROLLBACK).
3. Test on a small subset before updating thousands of rows.

Note for DAs: You will mostly read data (SELECT), not write it. But DML knowledge is needed for:
  - Data cleanup tasks
  - Interview questions about data maintenance
  - Understanding what ETL pipelines do`,

    visualExplanation: `INSERT = add rows to the table (like adding a new file to the cabinet)
UPDATE = change data in existing rows (like editing a field on an existing file)
DELETE = remove rows FROM the table (like shredding a file)

The WHERE clause is your safety guard:
  UPDATE orders SET status = 'X'           ← ALL rows updated (catastrophic)
  UPDATE orders SET status = 'X' WHERE id = 5   ← only row 5 updated (safe)`,

        realBusinessScenario: `Data quality task: A batch of orders was incorrectly marked as 'Pending' when
      they were actually 'Delivered'. You need to update those specific order IDs.

Safe approach:
1. SELECT COUNT(*) to verify which rows will be affected
2. BEGIN transaction
3. Run the UPDATE
4. Verify the result
5. COMMIT (or ROLLBACK if wrong)`,

    examples: [
      {
        title: "INSERT single and multiple rows",
        query: `INSERT INTO customers (customer_id, name, email, city)
VALUES (1001, 'Priya Sharma', 'priya@example.com', 'Mumbai');

INSERT INTO products (product_id, product_name, price, category)
VALUES
  (201, 'Wireless Headphones', 2999.00, 'Electronics'),
  (202, 'Yoga Mat', 799.00, 'Sports');`,
        explanation: "INSERT VALUES adds specific rows. Multi-row INSERT is more efficient than individual INSERTs."
      },
      {
        title: "Safe UPDATE with WHERE clause",
        query: `-- Step 1: Check what will be updated
SELECT COUNT(*) FROM orders WHERE status = 'Pending' AND order_date < '2024-01-01';

-- Step 2: Run the update (with WHERE!)
UPDATE orders
SET status = 'Delivered'
WHERE status = 'Pending'
  AND order_date < '2024-01-01';`,
                explanation: "Always SELECT first to verify the WHERE condition before running UPDATE. The " +
                             "WHERE clause protects all other rows."
      },
      {
        title: "Safe DELETE with verification",
        query: `-- Verify before deleting
SELECT COUNT(*) FROM orders WHERE status = 'Cancelled' AND order_date < '2023-01-01';

-- Delete old cancelled orders
DELETE FROM orders
WHERE status = 'Cancelled'
  AND order_date < '2023-01-01';`,
                explanation: "Check row count first. Delete is irreversible without a transaction — use " +
                             "ROLLBACK if you need safety."
      }
    ],

    commonMistakes: [
      "UPDATE table SET col = val; — no WHERE clause updates EVERY row (catastrophic in production)",
      "DELETE FROM table; — no WHERE deletes ALL rows",
      "Not testing the WHERE condition with SELECT before running DELETE or UPDATE"
    ],

    interviewQuestions: [
      "What is the risk of running UPDATE without a WHERE clause?",
      "How would you safely delete old records FROM a large production table?",
      "What is the difference between DELETE and TRUNCATE?"
    ],

    revisionNotes: [
      "INSERT INTO t (cols) VALUES (vals) — add rows",
      "UPDATE t SET col = val WHERE ... — ALWAYS use WHERE",
      "DELETE FROM t WHERE ... — ALWAYS use WHERE",
      "SELECT first to verify, then UPDATE/DELETE"
    ],

    cheatSheet: [
      "INSERT INTO t (a, b) VALUES (1, 2)",
      "UPDATE t SET col = val WHERE condition — always WHERE!",
      "DELETE FROM t WHERE condition — always WHERE!"
    ]

  }

,

  36: {

        conceptExplanation: `A VIEW is a stored, named SELECT query. It behaves like a virtual table — you
      query it like a real table, but it doesn't store data itself. The underlying SELECT runs each time you
      query the view.

Syntax:
  CREATE VIEW view_name AS
  SELECT ...
  FROM ...;

Usage:
  SELECT * FROM view_name WHERE condition;

Benefits:
1. Simplify complex queries — define once, reuse everywhere
2. Standardise metrics — ensure all teams use the same formula
3. Security — hide sensitive columns FROM specific users
4. Abstraction — BI tools can query views without knowing the underlying joins

Drop a view:
  DROP VIEW IF EXISTS view_name;

Limitations:
  - Views don't store data (no performance improvement by default)
  - Complex views (with joins/aggregates) are typically read-only
  - For performance, use Materialized Views (available in PostgreSQL, Snowflake, BigQuery — NOT in SQLite)

Materialized Views: store the actual query result on disk. Must be refreshed when underlying data changes.
Used in production DWH systems for expensive pre-computed aggregations.`,

    visualExplanation: `Regular View:
  CREATE VIEW v AS SELECT ... (stores the query definition)
  SELECT * FROM v → runs the underlying SELECT every time

Materialized View (not SQLite):
  CREATE MATERIALIZED VIEW mv AS SELECT ... (stores the actual result)
  SELECT * FROM mv → reads pre-computed data (fast!)
  REFRESH MATERIALIZED VIEW mv → updates the stored data`,

        realBusinessScenario: `At Swiggy, the Business Intelligence team uses the same "delivered_orders"
      view in 50 different dashboards. Instead of each analyst writing the same JOIN + WHERE every time, they
      all query the view. When the filter changes (e.g., new status name), only the view needs updating — all
      50 dashboards UPDATE automatically.`,

    examples: [
      {
        title: "Create a simplified view for delivered orders",
        query: `CREATE VIEW delivered_orders AS
SELECT
  o.order_id,
  o.customer_id,
  c.name AS customer_name,
  c.city,
  o.order_date,
  o.total_amount - o.discount_amount AS net_amount,
  o.status
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
WHERE o.status = 'Delivered';

-- Use the view
SELECT city, SUM(net_amount) AS revenue
FROM delivered_orders
WHERE order_date >= '2024-01-01'
GROUP BY city
ORDER BY revenue DESC;`,
        explanation: "The view hides the JOIN complexity. Users query delivered_orders like a simple table."
      },
      {
        title: "Metric standardisation view",
        query: `CREATE VIEW customer_metrics AS
SELECT
  customer_id,
  COUNT(*) AS total_orders,
  SUM(total_amount - discount_amount) AS lifetime_value,
  AVG(total_amount - discount_amount) AS avg_order_value,
  MAX(order_date) AS last_order_date
FROM orders
WHERE status = 'Delivered'
GROUP BY customer_id;

SELECT * FROM customer_metrics WHERE lifetime_value > 10000 ORDER BY lifetime_value DESC;`,
                explanation: "All analysts use the same lifetime_value formula. If the formula changes, " +
                             "update the view once — all queries benefit."
      }
    ],

    commonMistakes: [
      "Expecting views to improve query performance — regular views don't (only materialized views do)",
      "Trying to UPDATE through a complex view with joins/aggregates — usually fails",
      "Not using IF EXISTS in DROP VIEW — causes error if view doesn't exist"
    ],

    interviewQuestions: [
      "What is the difference between a view and a table?",
      "What is a materialized view and how is it different FROM a regular view?",
      "When would you use a view instead of a CTE?"
    ],

    revisionNotes: [
      "View = stored query, not stored data",
      "Use views for: metric standardisation, query simplification, security",
      "Materialized view = stored data (needs refresh) — used in DWH for performance"
    ],

    cheatSheet: [
      "CREATE VIEW v AS SELECT ...;",
      "SELECT * FROM v WHERE ...;",
      "DROP VIEW IF EXISTS v;"
    ]

  }

,

  37: {

        conceptExplanation: `An index is a data structure that speeds up row lookups on a table column.
      Without an index, the database must scan every row (full table scan). With an index, it can find
      matching rows in O(log n) time.

Performance Rules of Thumb:
1. **The Cost of SELECT * (Columnar Storage)**: In analytic column-store databases (like BigQuery, Snowflake,
Redshift), data is stored column-by-column rather than row-by-row. Selecting * forces the engine to read every
single column from disk/object storage, running up scan costs and memory usage. Rule: Only select the columns
you need.
2. **Early Filter Pushdown**: Always filter data as early as possible. If joining two large tables, pushing
the WHERE clause filters inside subqueries or joining on filtered CTE sets reduces the join footprint and CPU
overhead.
3. **Partitioning vs Clustering**:
   - **Partitioning**: Splits a table into segments based on a column (e.g., date or region). Queries
   filtering by partition only scan relevant segments, skipping the rest completely (partition pruning).
   - **Clustering/Sorting**: Organizes table rows physically within partitions by specified columns (e.g.,
   customer_id). This optimizes range query lookups and consecutive scans.

Creating an index:
  CREATE INDEX idx_name ON table (column);
  CREATE INDEX idx_orders_customer ON orders (customer_id);

Types:
  Single column:  CREATE INDEX idx ON t (col)
  Composite:      CREATE INDEX idx ON t (col1, col2)  -- order matters
  Unique:         CREATE UNIQUE INDEX idx ON t (email)

When indexes help:
  WHERE col = value          (equality filter on indexed column)
  JOIN ON col                (foreign key lookups)
  ORDER BY col               (avoid sort if column is indexed in same order)
  High cardinality columns   (many distinct values: email, order_id)

When indexes DON'T help:
  Function on indexed column: WHERE UPPER(email) = ...  -- breaks the index!
  Low cardinality columns (status with 3 values, gender)
  Returning most rows anyway (full scans may be faster)

Index downsides:
  Slower INSERT/UPDATE/DELETE (index must be updated with data)
  Additional disk space
  Too many indexes slow down write-heavy workloads

Primary keys are always auto-indexed. Foreign key columns should also usually be indexed.`,

    visualExplanation: `Without index (Full Table Scan):
  "Find orders WHERE customer_id = 500"
  → Check row 1, row 2, row 3 ... row 100,000 (slow!)

With index on customer_id:
  → Binary search in index: find customer_id = 500 in O(log n)
  → Jump directly to those rows (fast!)

Function on column breaks index:
  WHERE YEAR(order_date) = 2024   ← cannot use index on order_date
  WHERE order_date BETWEEN '2024-01-01' AND '2024-12-31'  ← uses index!`,

        realBusinessScenario: `Analysts at a large e-commerce company noticed queries like SELECT * FROM
      orders WHERE customer_id = X were taking 5 seconds ON a 10 million row TABLE. The fix: CREATE INDEX
      idx_orders_cust ON orders(customer_id). Queries dropped to 30 milliseconds — 100x faster.`,

    examples: [
      {
        title: "Create indexes on frequently filtered columns",
        query: `CREATE INDEX idx_orders_customer ON orders (customer_id);
CREATE INDEX idx_orders_date ON orders (order_date);
CREATE INDEX idx_orders_status ON orders (status);

CREATE INDEX idx_orders_cust_date ON orders (customer_id, order_date);

CREATE UNIQUE INDEX idx_customers_email ON customers (email);`,
                explanation: "Index customer_id and order_date since they appear in WHERE and JOIN conditions " +
                             "constantly. Composite index helps queries filtering by both."
      },
      {
        title: "EXPLAIN QUERY PLAN to verify index use",
        query: `-- Check if index is being used
EXPLAIN QUERY PLAN
SELECT * FROM orders WHERE customer_id = 123;

-- Should output: SEARCH TABLE orders USING INDEX idx_orders_customer
-- If it shows SCAN TABLE orders -- index not being used, check your query`,
                explanation: "EXPLAIN QUERY PLAN shows if the database uses your index. SEARCH = fast index " +
                             "lookup. SCAN = full table scan = slow."
      }
    ],

    commonMistakes: [
      "WHERE YEAR(order_date) = 2024 — function on column prevents index use; use BETWEEN instead",
      "Adding indexes on every column — slows INSERT/UPDATE and wastes disk space",
      "Indexing low-cardinality columns (status with 3 values) — provides no benefit"
    ],

    interviewQuestions: [
      "What is a database index and how does it speed up queries?",
      "Why does applying a function to an indexed column prevent the index FROM being used?",
      "What is a composite index and when would you use it?"
    ],

    revisionNotes: [
      "Index = faster lookups, but slower writes and more storage",
      "Function on indexed column = index bypassed (full scan)",
      "Primary keys auto-indexed. Add indexes on foreign keys and frequent WHERE/JOIN columns."
    ],

    cheatSheet: [
      "CREATE INDEX idx ON table (col) — single column index",
      "CREATE UNIQUE INDEX idx ON table (col) — unique index",
      "Never use functions on indexed columns in WHERE"
    ]

  }

,

  38: {

        conceptExplanation: `EXPLAIN shows the query execution plan — how the database engine plans to run
      your SQL. It reveals which indexes are used, how tables are scanned, and where the performance
      bottlenecks are.

SQLite syntax:
  EXPLAIN QUERY PLAN SELECT ...;

PostgreSQL syntax:
  EXPLAIN SELECT ...;
  EXPLAIN ANALYZE SELECT ...;  -- runs the query and shows actual timing

What to look for:

SCAN TABLE vs SEARCH TABLE (SQLite):
  SCAN TABLE orders       → full table scan — reads every row (slow on large tables!)
  SEARCH TABLE orders USING INDEX → index lookup (fast!)

After adding an index, SCAN should change to SEARCH.

Key optimization signals:
  SCAN on a large frequently-filtered table → add an index
  Function on column → index bypassed, rewrite the WHERE condition
  SCAN on a tiny table → acceptable, full scan is fine for small tables

How to use EXPLAIN in practice:
1. Run EXPLAIN QUERY PLAN on a slow query
2. Look for SCAN TABLE on large tables
3. Add an index on the filtered column
4. Re-run EXPLAIN to verify SCAN → SEARCH`,

    visualExplanation: `EXPLAIN output reading guide:

  SCAN TABLE orders — reading every row
  → Bad if orders has millions of rows
  → Fix: add index on the WHERE column

  SEARCH TABLE orders USING INDEX idx_orders_customer — using index
  → Good! Fast binary search.

  SEARCH TABLE customers USING INTEGER PRIMARY KEY — PK lookup
  → Very fast, always fine.`,

        realBusinessScenario: `A data analyst at Paytm reports that a dashboard query takes 20 seconds.
      Running EXPLAIN QUERY PLAN reveals: "SCAN TABLE transactions" — the query filters on transaction_date
      but no index exists on that column. Adding CREATE INDEX idx_txn_date ON transactions(transaction_date)
      changes the plan to SEARCH TABLE... and the query drops to 200ms.`,

    examples: [
      {
        title: "Read an EXPLAIN QUERY PLAN output",
        query: `-- Before adding index: will show SCAN
EXPLAIN QUERY PLAN
SELECT o.order_id, c.name, o.total_amount
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
WHERE o.status = 'Delivered'
  AND o.order_date >= '2024-01-01';`,
                explanation: "Without an index on status/order_date, this will show SCAN TABLE orders. Adding " +
                             "an index will change it to SEARCH TABLE."
      },
      {
        title: "Add index and verify plan improves",
        query: `-- Add index
CREATE INDEX idx_orders_status_date ON orders (status, order_date);

-- Re-run EXPLAIN — should now show SEARCH TABLE orders USING INDEX
EXPLAIN QUERY PLAN
SELECT o.order_id, c.name, o.total_amount
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
WHERE o.status = 'Delivered'
  AND o.order_date >= '2024-01-01';`,
        explanation: "After the index is created, the query planner uses it and shows SEARCH instead of SCAN."
      }
    ],

    commonMistakes: [
      "Ignoring EXPLAIN output — it's the most valuable query debugging tool",
      "Adding an index but still getting SCAN — likely using a function on the column",
      "Confusing EXPLAIN (different databases have different syntax and output formats)"
    ],

    interviewQuestions: [
      "How do you identify a slow query in SQL?",
      "What does a full table scan mean in a query execution plan?",
      "What is the difference between EXPLAIN and EXPLAIN ANALYZE in PostgreSQL?"
    ],

    revisionNotes: [
      "SCAN TABLE = full scan = slow on large tables",
      "SEARCH TABLE USING INDEX = fast index lookup",
      "Use EXPLAIN QUERY PLAN before optimising a slow query"
    ],

    cheatSheet: [
      "EXPLAIN QUERY PLAN SELECT ... — see the execution plan (SQLite)",
      "SCAN = slow (add an index), SEARCH USING INDEX = fast",
      "EXPLAIN ANALYZE in PostgreSQL runs the query and shows actual timing"
    ]

  }

,

  39: {

        conceptExplanation: `A transaction is a group of SQL statements that execute as a single unit. Either
      ALL statements succeed and are committed, or ALL are rolled back if anything fails.

Syntax:
  BEGIN;           -- start transaction
  -- SQL statements
  COMMIT;          -- save all changes permanently
  ROLLBACK;        -- undo all changes since BEGIN

ACID Properties:
  A — Atomicity:   All or nothing. If any statement fails, all changes are undone.
  C — Consistency: Database moves from one valid state to another valid state.
  I — Isolation:   Concurrent transactions don't interfere with each other.
  D — Durability:  Committed data survives crashes (written to disk).

When to use transactions:
  Multi-step DML (transfer money: debit one account + credit another)
  Bulk updates (update 10,000 rows — if one fails, roll back all)
  Any critical write operation WHERE partial completion is dangerous

Savepoints (partial rollback):
  SAVEPOINT sp1;
  ROLLBACK TO SAVEPOINT sp1;  -- undo only to this savepoint, not all the way to BEGIN

Note for DAs: You rarely write explicit transactions in analytics work. But ACID is a very common interview
question for DA and Data Engineering roles.`,

    visualExplanation: `Transaction = all-or-nothing deal.

Without transaction:
  UPDATE accounts SET balance = balance - 1000 WHERE id = 1;  -- succeeds
  UPDATE accounts SET balance = balance + 1000 WHERE id = 2;  -- crashes!
  → Account 1 is debited but account 2 never gets credited. Money lost!

With transaction:
  BEGIN;
  UPDATE accounts SET balance = balance - 1000 WHERE id = 1;
  UPDATE accounts SET balance = balance + 1000 WHERE id = 2;
  COMMIT;  -- both changes saved together
  -- If step 2 fails → ROLLBACK → Account 1 gets its money back`,

        realBusinessScenario: `A fintech company processes loan disbursements: mark the loan as disbursed,
      credit the customer account, and log the transaction. All three steps must succeed together or none
      should happen. Transactions enforce this guarantee.`,

    examples: [
      {
        title: "Basic transaction with COMMIT",
        query: `BEGIN;

UPDATE orders SET status = 'Delivered' WHERE order_id IN (5001, 5002, 5003);

UPDATE customers SET total_orders = total_orders + 1
WHERE customer_id IN (SELECT customer_id FROM orders WHERE order_id IN (5001, 5002, 5003));

COMMIT;`,
                explanation: "Both UPDATEs are wrapped in a transaction. If anything fails, ROLLBACK ensures " +
                             "neither change is saved."
      },
      {
        title: "Transaction with ROLLBACK safety",
        query: `BEGIN;

UPDATE orders
SET discount_amount = total_amount * 0.10
WHERE customer_id IN (
  SELECT customer_id FROM customers WHERE city = 'Mumbai'
)
AND status = 'Pending';

-- Check the result before committing
SELECT COUNT(*), SUM(discount_amount) FROM orders WHERE status = 'Pending';

-- If looks good: COMMIT;
-- If something's wrong: ROLLBACK;`,
        explanation: "Run SELECT after UPDATE to verify the result before COMMIT. ROLLBACK is your safety net."
      }
    ],

    commonMistakes: [
      "Forgetting COMMIT after BEGIN — transaction stays open, blocking other sessions",
      "Not using transactions for multi-step DML — partial failures leave data inconsistent",
      "Confusing ROLLBACK TO SAVEPOINT (partial) with full ROLLBACK (undo everything)"
    ],

    interviewQuestions: [
      "What does ACID stand for in the context of databases?",
      "What is the difference between COMMIT and ROLLBACK?",
      "Why is Atomicity important for a bank transfer operation?"
    ],

    revisionNotes: [
      "ACID = Atomicity, Consistency, Isolation, Durability",
      "BEGIN + COMMIT = save. BEGIN + ROLLBACK = undo.",
      "Transactions ensure all-or-nothing for multi-step DML operations"
    ],

    cheatSheet: [
      "BEGIN; -- statements -- COMMIT; — all changes saved",
      "BEGIN; -- statements -- ROLLBACK; — all changes undone",
      "SAVEPOINT sp; ROLLBACK TO SAVEPOINT sp; — partial undo"
    ]
  }
,
  42: {
        conceptExplanation: "CTAS stands for 'CREATE TABLE AS SELECT'. It is a powerful, concise DDL " +
                            "operation that allows you to create a new, permanent table and populate it with " +
                            "the results of a SELECT query in a single step. The database automatically " +
                            "defines the table schema (column names and data types) based on the result set " +
                            "of the query. CTAS is widely used in data warehousing to persist aggregated " +
                            "summary tables, stage transformed data, or take backups before running " +
                            "large-scale modifications.",
        visualExplanation: "Think of a standard CREATE TABLE + INSERT INTO as building a bookshelf " +
                           "manually, then placing books on it. CTAS is like taking a photo of a shelf full " +
                           "of books (SELECT) and instantly cloning the entire structure and books together " +
                           "into a new shelf.",
        realBusinessScenario: "You are a Growth Analyst at a ride-sharing startup. The database contains " +
                              "millions of raw trips. Querying the raw trips table is slow and expensive. You " +
                              "want to create a pre-aggregated summary table of monthly rider metrics (total " +
                              "trips, gross revenue, unique drivers) to power a high-performance BI dashboard.",
    examples: [
      {
        title: "Basic CTAS Summary Table",
                query: "CREATE TABLE high_value_customers AS\nSELECT customer_id, SUM(total_amount) as " +
                       "total_spent\nFROM orders\nGROUP BY customer_id\nHAVING SUM(total_amount) > 5000;",
                explanation: "This creates a new table named 'high_value_customers' with columns " +
                             "'customer_id' and 'total_spent', populated only with customers who spent over " +
                             "5000."
      }
    ],
    commonMistakes: [
      "Forgetting that CTAS does NOT copy indexes, constraints (primary keys, foreign " +
      "keys), or default values FROM the source tables.",
      "Not aliasing calculated columns (e.g. SUM(amount)) in the SELECT statement — " +
      "SQLite requires aliases for expressions in CTAS."
    ],
    interviewQuestions: [
      "What is the difference between CREATE TABLE AS SELECT (CTAS) and a VIEW?",
      "Does CTAS copy table constraints like PRIMARY KEY or FOREIGN KEY?"
    ],
    revisionNotes: [
      "CTAS is a permanent DDL statement that physicalizes data on disk.",
      "Calculated fields must have column aliases in the SELECT query.",
      "Always create indexes manually on the new table if it will be queried frequently."
    ],
    cheatSheet: [
      "Syntax: CREATE TABLE new_tbl AS SELECT ...",
      "SQLite requires all SELECT columns to have names (use AS alias)."
    ]
  },
  43: {
        conceptExplanation: "Temporary Tables are tables that exist only for the duration of the current " +
                            "database session (or transaction). They are automatically dropped when the " +
                            "session ends or connection closes. They are extremely useful for storing " +
                            "intermediate results, staging complex multi-step transformations, and isolating " +
                            "private workspaces without cluttering the global database schema. In SQLite, " +
                            "they are created using the CREATE TEMPORARY TABLE (or CREATE TEMP TABLE) syntax.",
        visualExplanation: "A permanent table is like writing a document in a leather-bound notebook. A " +
                           "temporary table is like writing on a sticky note at your desk — you use it to do " +
                           "quick calculations, and throw it in the trash when you leave the office.",
        realBusinessScenario: "You are performing a complex revenue attribution analysis. To calculate the " +
                              "final payouts, you need to first filter active subscriptions, apply seasonal " +
                              "discounts, and then join with payment records. Storing the intermediate filtered " +
                              "subscriptions in a temporary table simplifies the subsequent queries and " +
                              "dramatically improves performance by reducing repetitive calculations.",
    examples: [
      {
        title: "Creating and Querying a Temp Table",
                query: "CREATE TEMPORARY TABLE temp_active_subs AS\nSELECT subscription_id, " +
                       "customer_id, monthly_fee\nFROM subscriptions\nWHERE status = 'Active';\n\nSELECT " +
                       "* FROM temp_active_subs WHERE monthly_fee > 50;",
                explanation: "Creates a session-specific temporary table storing active subscriptions and " +
                             "immediately queries it. The table will vanish when the connection closes."
      }
    ],
    commonMistakes: [
      "Expecting temporary tables to be visible to other database connections or " +
      "sessions — they are strictly private to the connection that created them.",
      "Forgetting to drop the temporary table manually if executing the script " +
      "multiple times in the same session (use CREATE TEMPORARY TABLE IF NOT EXISTS or " +
      "DROP TABLE IF EXISTS)."
    ],
    interviewQuestions: [
      "When should you use a Temporary Table instead of a Common Table Expression (CTE)?",
      "Are temporary tables visible to other users querying the same database?"
    ],
    revisionNotes: [
      "Temporary tables are session-private and auto-drop on disconnect.",
      "They can have indexes, primary keys, and constraints just like permanent tables.",
      "They are stored in a separate temporary database schema (e.g. 'temp' in SQLite)."
    ],
    cheatSheet: [
      "Syntax: CREATE TEMPORARY TABLE temp_name AS SELECT ...",
      "Drop manually: DROP TABLE IF EXISTS temp_name;"
    ]
  }};



// FALLBACK LESSON (for modules without custom content)



function buildFallbackLesson(moduleId: number, title: string, track: string): Lesson {

  const queryExamples: Record<string, string> = {

    "ROW_NUMBER": `WITH ranked AS (

  SELECT

    p.category,

    p.product_name,

    SUM(oi.quantity * oi.unit_price) AS revenue,

    ROW_NUMBER() OVER (PARTITION BY p.category ORDER BY SUM(oi.quantity * oi.unit_price) DESC) AS rn

  FROM products p

  JOIN order_items oi ON p.product_id = oi.product_id

  JOIN orders o ON oi.order_id = o.order_id

  WHERE o.status = 'Delivered'

  GROUP BY p.category, p.product_name

)

SELECT category, product_name, revenue

FROM ranked

WHERE rn = 1;`,

    "RANK": `SELECT

  p.category,

  p.product_name,

  SUM(oi.quantity * oi.unit_price) AS revenue,

  RANK() OVER (PARTITION BY p.category ORDER BY SUM(oi.quantity * oi.unit_price) DESC) AS rank_num

FROM products p

JOIN order_items oi ON p.product_id = oi.product_id

JOIN orders o ON oi.order_id = o.order_id

WHERE o.status = 'Delivered'

GROUP BY p.category, p.product_name

ORDER BY p.category, rank_num;`,

    "DENSE_RANK": `SELECT

  customer_id,

  SUM(total_amount - discount_amount) AS ltv,

  DENSE_RANK() OVER (ORDER BY SUM(total_amount - discount_amount) DESC) AS ltv_rank

FROM orders

WHERE status = 'Delivered'

GROUP BY customer_id

ORDER BY ltv_rank;`,

    "LEAD": `WITH monthly AS (

  SELECT SUBSTR(order_date, 1, 7) AS month, SUM(total_amount - discount_amount) AS revenue

  FROM orders WHERE status = 'Delivered' GROUP BY 1

)

SELECT month, revenue,

  LEAD(revenue, 1) OVER (ORDER BY month) AS next_month_revenue,

  ROUND((LEAD(revenue) OVER (ORDER BY month) - revenue) / revenue * 100, 1) AS growth_pct

FROM monthly ORDER BY month;`,

    "LAG": `WITH monthly AS (

  SELECT SUBSTR(order_date, 1, 7) AS month, SUM(total_amount - discount_amount) AS revenue

  FROM orders WHERE status = 'Delivered' GROUP BY 1

)

SELECT month, revenue,

  LAG(revenue, 1) OVER (ORDER BY month) AS prev_month_revenue

FROM monthly ORDER BY month;`,

    "Correlated Subqueries": `SELECT

  c.customer_id, c.full_name, c.city,

  (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.customer_id AND o.status = 'Delivered') AS delivered_orders

FROM customers c

ORDER BY delivered_orders DESC LIMIT 10;`,

    "RIGHT JOIN": `SELECT

  p.product_name, p.category,

  COUNT(oi.order_item_id) AS times_ordered

FROM order_items oi

RIGHT JOIN products p ON oi.product_id = p.product_id

GROUP BY p.product_name, p.category

ORDER BY times_ordered DESC;`,

    "FULL JOIN": `SELECT COALESCE(c.city, 'Unknown') AS city, COUNT(o.order_id) AS orders

FROM customers c

LEFT JOIN orders o ON c.customer_id = o.customer_id

GROUP BY c.city ORDER BY orders DESC;`,

    "SELF JOIN": `SELECT

  e1.employee_id, e1.full_name AS employee, e2.full_name AS manager

FROM employees e1

LEFT JOIN employees e2 ON e1.manager_id = e2.employee_id

ORDER BY e1.department;`,

    "CROSS JOIN": `SELECT p.product_name, c.segment

FROM (SELECT DISTINCT segment FROM customers) c

CROSS JOIN (SELECT product_name FROM products LIMIT 3) p

ORDER BY p.product_name, c.segment;`,

    "UNION": `SELECT customer_id, 'High Value' AS segment FROM orders WHERE total_amount > 5000

UNION

SELECT customer_id, 'Low Value' AS segment FROM orders WHERE total_amount < 500

ORDER BY customer_id;`,

    "UNION ALL": `SELECT 'Delivered' AS status, COUNT(*) AS cnt FROM orders WHERE status = 'Delivered'

UNION ALL

SELECT 'Returned', COUNT(*) FROM orders WHERE status = 'Returned'

UNION ALL

SELECT 'Cancelled', COUNT(*) FROM orders WHERE status = 'Cancelled';`,

    "Views": `SELECT name FROM sqlite_master WHERE type='view';`,

    "Indexes": `SELECT name, tbl_name FROM sqlite_master WHERE type='index';`,

    "Query Optimization": `EXPLAIN QUERY PLAN

SELECT c.region, SUM(o.total_amount) AS revenue

FROM customers c JOIN orders o ON c.customer_id = o.customer_id

WHERE o.status = 'Delivered'

GROUP BY c.region ORDER BY revenue DESC;`,

    "Advanced Business SQL": `WITH customer_segments AS (

  SELECT c.customer_id, c.segment,

    SUM(o.total_amount - o.discount_amount) AS ltv

  FROM customers c JOIN orders o ON c.customer_id = o.customer_id

  WHERE o.status = 'Delivered' GROUP BY c.customer_id, c.segment

)

SELECT segment, COUNT(*) AS customers, ROUND(AVG(ltv), 2) AS avg_ltv, SUM(ltv) AS total_ltv

FROM customer_segments GROUP BY segment ORDER BY avg_ltv DESC;`

  };

  const defaultQuery = queryExamples[title] || `SELECT c.region, COUNT(o.order_id) AS orders,

  SUM(o.total_amount - o.discount_amount) AS net_revenue

FROM customers c

JOIN orders o ON c.customer_id = o.customer_id

WHERE o.status = 'Delivered'

GROUP BY c.region ORDER BY net_revenue DESC;`;

  return {

        conceptExplanation: `${title} is a key SQL concept in the ${track} track. Mastering it is essential
      for the Data Analyst role in Indian companies like Zomato, Flipkart, Myntra, Swiggy, CRED, and
      Paytm.\n\nIn this module, you will understand the syntax, the mental model, and the real business
      application of ${title}. Focus on writing clean, readable SQL that any team member can understand and
      maintain.`,

        visualExplanation: `Think of ${title} as a specific tool in your SQL toolkit. Every analytical
      question maps to one or more SQL concepts. ${title} handles a specific type of question — understanding
      which questions it answers (and which it doesn't) is the key to using it correctly.`,

        realBusinessScenario: `A data analyst at an Indian startup is asked a business question that requires
      ${title}. Rather than pulling data INTO Excel, they write a single SQL query using ${title} to produce
      an accurate, reproducible answer directly FROM the production database.`,

    examples: [

      {

        title: `${title} — business example`,

        query: defaultQuery,

                explanation: `This query demonstrates ${title} in a real business context. Study the
          structure: understand what each clause does and why it is needed.`

      },

      {

        title: `${title} — interview pattern`,

        query: defaultQuery.replace("ORDER BY", "-- Interviewers expect you to explain the logic\nORDER BY"),

                explanation: `In an interview, explain your query step by step: what TABLE you start FROM,
          what filter you apply, what you GROUP BY, and what the output grain is.`

      }

    ],

    commonMistakes: [

      `Misunderstanding when to use ${title} vs a simpler approach.`,

      "Writing the query before clarifying the required output grain.",

      "Not validating results with a simple COUNT or spot check."

    ],

    interviewQuestions: [

      `Explain ${title} and give a real-world example of when you would use it.`,

      `How does ${title} fit into SQL's logical execution order?`,

      `What is the most common mistake when using ${title}?`

    ],

    revisionNotes: [

      `Practice ${title} with real business questions, not toy examples.`,

      "Always validate your output grain before submitting a query.",

      "Write readable SQL — use CTEs and aliases to make logic self-documenting."

    ],

    cheatSheet: [

      `${title}: master the syntax then focus on which questions it answers.`,

      "Execution order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT",

      "Interview tip: explain your approach before writing the query."

    ]

  };

}

const moduleTitles = [
  "Introduction to Databases",
  "Filtering with WHERE",
  "Sorting with ORDER BY",
  "LIMIT & DISTINCT",
  "NULL Handling",
  "String Functions & LIKE",
  "IN & Set Membership",
  "Date Functions",
  "COUNT",
  "SUM",
  "AVG",
  "MIN & MAX",
  "GROUP BY",
  "HAVING",
  "HAVING vs WHERE",
  "INNER JOIN",
  "LEFT JOIN",
  "RIGHT JOIN",
  "FULL JOIN",
  "SELF JOIN",
  "Subqueries in WHERE & FROM",
  "Correlated Subqueries",
  "Derived Tables & FROM Subqueries",
  "CTEs (Common Table Expressions)",
  "ROW_NUMBER",
  "Window Functions Overview",
  "LAG & LEAD",
  "Running Totals & Moving Averages",
  "UNION & UNION ALL",
  "INTERSECT & EXCEPT",
  "CASE WHEN & Conditional Logic",
  "Pivoting & NTILE Bucketing",
  "CREATE TABLE & Constraints",
  "ALTER TABLE & Schema Updates",
  "DML: INSERT, UPDATE, DELETE",
  "Creating & Using Views",
  "Indexing & Performance",
  "Query Execution Plans (EXPLAIN)",
  "Transactions & ACID",
  "Query Optimization",
  "Interview Pattern Library",
  "CTAS (Create Table As Select)",
  "Temporary Tables"
];

const tracks = [
  "Foundation",
  "Foundation",
  "Foundation",
  "Foundation",
  "Foundation",
  "Foundation",
  "Foundation",
  "Foundation",
  "Aggregation",
  "Aggregation",
  "Aggregation",
  "Aggregation",
  "Aggregation",
  "Aggregation",
  "Aggregation",
  "Joins",
  "Joins",
  "Joins",
  "Joins",
  "Joins",
  "Subqueries",
  "Subqueries",
  "Subqueries",
  "Subqueries",
  "Window Functions",
  "Window Functions",
  "Window Functions",
  "Window Functions",
  "Set Operations",
  "Set Operations",
  "Business Logic",
  "Business Logic",
  "Database Design",
  "Database Design",
  "Database Design",
  "Database Design",
  "Performance",
  "Performance",
  "Performance",
  "Performance",
  "Interview Prep",
  "Database Design",
  "Database Design"
];

function getLevel(id: number): ModuleLevel {

  if (id <= 15) return "Beginner";

  if (id <= 28) return "Intermediate";

  return "Advanced";

}

const realProblems: Record<number, PracticeProblem[]> = {
  ...problemsBatch1,
  1: [

    {

      id: "m1-p1", moduleId: 1, difficulty: "Easy",

      title: "Select customer details for a report",

      businessScenario: "You are preparing a city-wise customer report for Flipkart's operations team.",

      prompt: "Write a query to retrieve customer_id, full_name, city, and segment from the customers table.",

      starterQuery: "SELECT\n  -- list the 4 required columns here\nFROM customers;",

      solution: "SELECT\n  customer_id,\n  full_name,\n  city,\n  segment\nFROM customers;",

      hints: [

        "List each column name separated by commas after SELECT.",

        "The table name goes after FROM."

      ],

      detailedExplanation: "SELECT names specific columns — never use SELECT * in reports.",

            alternativeApproach: "You could order the columns differently in the SELECT list to match the " +
                                 "report's structure.",

      performanceNotes: "Selecting fewer columns reduces I/O compared to SELECT *.",

      concepts: ["SELECT"]

    },

    {

      id: "m1-p2", moduleId: 1, difficulty: "Medium",

      title: "Compute net order value",

      businessScenario: "You need to show net revenue (after discounts) for each order in the orders table.",

            prompt: "Write a query that returns order_id, customer_id, total_amount, " +
                    "discount_amount, and a computed column net_amount (= total_amount minus " +
                    "discount_amount). Also include order_date and status.",

            starterQuery: "SELECT\n  order_id,\n  customer_id,\n  total_amount,\n  discount_amount,\n " +
                          "total_amount - ??? AS net_amount,\n  order_date,\n  status\nFROM orders;",

            solution: "SELECT\n  order_id,\n  customer_id,\n  total_amount,\n  discount_amount,\n " +
                      "total_amount - discount_amount AS net_amount,\n  order_date,\n  status\nFROM " +
                      "orders;",

      hints: [

        "Arithmetic in SELECT: total_amount - discount_amount.",

        "Use AS net_amount to give it a readable name."

      ],

            detailedExplanation: "Computed columns in SELECT let you derive new metrics from existing data " +
                                 "without modifying the table. The AS keyword gives it a column header name.",

            alternativeApproach: "You could also write this as ROUND(total_amount - discount_amount, 2) AS " +
                                 "net_amount for cleaner decimal output.",

      performanceNotes: "Arithmetic in SELECT is computed row-by-row and adds minimal overhead.",

      concepts: ["SELECT", "computed columns", "aliases"]

    },

    {

      id: "m1-p3", moduleId: 1, difficulty: "Hard",

      title: "Discount percentage per order",

      businessScenario: "A pricing analyst at Myntra wants to see the discount percentage for each order.",

            prompt: "Write a query that returns order_id, total_amount, discount_amount, and a " +
                    "computed column discount_pct (= (discount_amount * 1.0 / total_amount) * 100) " +
                    "from the orders table.",

      starterQuery: "SELECT\n  -- calculate discount_pct and retrieve other columns here\nFROM orders;",

            solution: "SELECT\n  order_id,\n  total_amount,\n  discount_amount,\n  (discount_amount * " +
                      "1.0 / total_amount) * 100 AS discount_pct\nFROM orders;",

      hints: [

        "Discount % = (discount_amount / total_amount) * 100.",

        "Multiply by 1.0 to avoid integer division."

      ],

            detailedExplanation: "This uses computed columns and arithmetic operators. Always scale integers by a " +
                                 "decimal (like 1.0) when dividing in SQLite to avoid integer division truncation.",

      alternativeApproach: "Use CAST(discount_amount AS REAL) instead of multiplying by 1.0.",

      performanceNotes: "The arithmetic is calculated dynamically for each row returned.",

      concepts: ["SELECT", "computed columns", "aliases"]

    }

  ],

  2: [

    {

      id: "m2-p1", moduleId: 2, difficulty: "Easy",

      title: "Filter high-value delivered orders",

            businessScenario: "Swiggy's operations manager needs a list of high-value delivered orders to " +
                              "audit premium shipping handling.",

            prompt: "Find all delivered orders with a total amount greater than 5000. Return " +
                    "order_id, customer_id, channel, total_amount, and order_date.",

            starterQuery: "SELECT\n  order_id,\n  customer_id,\n  channel,\n  total_amount,\n " +
                          "order_date\nFROM orders\nWHERE status = ???\n  AND total_amount > ???;",

            solution: "SELECT\n  order_id,\n  customer_id,\n  channel,\n  total_amount,\n " +
                      "order_date\nFROM orders\nWHERE status = 'Delivered'\n  AND total_amount > 5000;",

      hints: [

        "Filter by status first: WHERE status = 'Delivered'.",

        "Combine filters with AND: total_amount > 5000."

      ],

            detailedExplanation: "Combining filters with AND limits results to records satisfying all conditions. " +
                                 "No JOIN is needed since all order status and amount columns exist directly in " +
                                 "the orders table.",

      alternativeApproach: "Could use: WHERE status = 'Delivered' AND total_amount >= 5001.",

            performanceNotes: "Filtering on status and total_amount helps the query planner avoid full-table " +
                              "scans if indexes exist.",

      concepts: ["WHERE", "AND"]

    },

    {

      id: "m2-p2", moduleId: 2, difficulty: "Medium",

      title: "High-value cancelled orders",

            businessScenario: "The finance team at CRED needs to identify cancelled orders above ₹3000 for " +
                              "refund processing.",

            prompt: "Find all cancelled orders where total_amount is between 3000 and 10000. Return " +
                    "order_id, customer_id, total_amount, discount_amount, and order_date.",

            starterQuery: "SELECT\n  order_id,\n  customer_id,\n  total_amount,\n  discount_amount,\n " +
                          "order_date\nFROM orders\nWHERE status = ???\n  AND total_amount BETWEEN ??? AND " +
                          "???;",

            solution: "SELECT\n  order_id,\n  customer_id,\n  total_amount,\n  discount_amount,\n " +
                      "order_date\nFROM orders\nWHERE status = 'Cancelled'\n  AND total_amount BETWEEN " +
                      "3000 AND 10000;",

      hints: [

        "status = 'Cancelled' — exact match with single quotes.",

        "BETWEEN 3000 AND 10000 — inclusive on both ends."

      ],

            detailedExplanation: "BETWEEN is a clean way to express range filters. It is inclusive, meaning 3000 " +
                                 "and 10000 are included in the result.",

      alternativeApproach: "WHERE total_amount >= 3000 AND total_amount <= 10000 is equivalent but more verbose.",

      performanceNotes: "BETWEEN can use an index if one exists on total_amount.",

      concepts: ["WHERE", "BETWEEN", "AND"]

    },

    {

      id: "m2-p3", moduleId: 2, difficulty: "Hard",

      title: "Premium customers from specific regions",

            businessScenario: "Identify Premium segment customers who signed up after 2023 and are located in " +
                              "the South or West region.",

            prompt: "Write a query to find customer_id, full_name, city, region, segment, and " +
                    "signup_date for Premium customers in the South or West region who signed up " +
                    "after '2023-01-01'.",

            starterQuery: "SELECT\n  customer_id,\n  full_name,\n  city,\n  region,\n  segment,\n " +
                          "signup_date\nFROM customers\nWHERE segment = ???\n  AND region IN (???)\n  AND " +
                          "signup_date > ???;",

            solution: "SELECT\n  customer_id,\n  full_name,\n  city,\n  region,\n  segment,\n " +
                      "signup_date\nFROM customers\nWHERE segment = 'Premium'\n  AND region IN " +
                      "('South', 'West')\n  AND signup_date > '2023-01-01';",

      hints: [

        "Three conditions combined with AND.",

        "segment = 'Premium' — exact string match.",

        "Date comparison: signup_date > '2023-01-01' works because YYYY-MM-DD sorts correctly as text."

      ],

            detailedExplanation: "Combining multiple WHERE conditions with AND is the standard way to narrow down " +
                                 "a dataset. Each condition reduces the row count further.",

      alternativeApproach: "You could use BETWEEN for the date range if you also have an end date.",

            performanceNotes: "The most selective filter (highest cardinality) should ideally come first — " +
                              "segment is more selective than region.",

      concepts: ["WHERE", "AND", "IN", "date comparison"]

    }

  ],

  5: [

    {

      id: "m5-p1", moduleId: 5, difficulty: "Easy",

      title: "Find orders with missing discount data",

      businessScenario: "The finance team needs to audit orders where discount information was not captured.",

            prompt: "Write a query to find all orders where discount_amount is NULL or 0. Return " +
                    "order_id, customer_id, total_amount, discount_amount, and status. Order by " +
                    "total_amount descending.",

            starterQuery: "SELECT order_id, customer_id, total_amount, discount_amount, status\nFROM " +
                          "orders\nWHERE discount_amount ??? OR discount_amount = ???\nORDER BY " +
                          "total_amount DESC;",

            solution: "SELECT order_id, customer_id, total_amount, discount_amount, status\nFROM " +
                      "orders\nWHERE discount_amount IS NULL OR discount_amount = 0\nORDER BY " +
                      "total_amount DESC;",

      hints: [

        "You cannot use = NULL. Use IS NULL instead.",

        "Combine two conditions with OR.",

        "IS NULL checks for missing values. = 0 checks for zero discount."

      ],

            detailedExplanation: "NULL means unknown/missing — it cannot be compared with = or !=. The only " +
                                 "correct operators are IS NULL and IS NOT NULL. This is one of the most common " +
                                 "mistakes in SQL.",

            alternativeApproach: "COALESCE(discount_amount, 0) = 0 also works — COALESCE replaces NULL with 0, " +
                                 "then compares to 0.",

      performanceNotes: "IS NULL check is fast when the column is indexed with null values tracked.",

      concepts: ["NULL", "IS NULL", "OR", "WHERE"]

    },

    {

      id: "m5-p2", moduleId: 5, difficulty: "Medium",

      title: "Replace NULL discounts and compute net amount",

      businessScenario: "The reporting team wants net revenue, treating NULL discounts as 0.",

            prompt: "Write a query on the orders table. Return order_id, total_amount, " +
                    "discount_amount (replacing NULL with 0), and net_amount (total minus discount). " +
                    "Filter to delivered orders. Order by net_amount descending. Show top 10.",

            starterQuery: "SELECT\n  order_id,\n  total_amount,\n  COALESCE(???, 0) AS discount_amount,\n " +
                          "total_amount - COALESCE(???, 0) AS net_amount\nFROM orders\nWHERE status = " +
                          "'Delivered'\nORDER BY net_amount DESC\nLIMIT 10;",

            solution: "SELECT\n  order_id,\n  total_amount,\n  COALESCE(discount_amount, 0) AS " +
                      "discount_amount,\n  total_amount - COALESCE(discount_amount, 0) AS " +
                      "net_amount\nFROM orders\nWHERE status = 'Delivered'\nORDER BY net_amount " +
                      "DESC\nLIMIT 10;",

      hints: [

        "COALESCE(col, default) returns the first non-NULL value.",

        "COALESCE(discount_amount, 0) treats NULL discount as 0.",

        "Reuse the same COALESCE expression in both columns."

      ],

            detailedExplanation: "COALESCE is the standard way to replace NULLs with a default value. It accepts " +
                                 "multiple arguments and returns the first non-NULL one. Very common in revenue " +
                                 "calculations.",

      alternativeApproach: "IFNULL(discount_amount, 0) is SQLite-specific equivalent of COALESCE with 2 args.",

            performanceNotes: "COALESCE adds minimal overhead. More important: always handle NULLs in " +
                              "financial calculations to avoid silent errors.",

      concepts: ["COALESCE", "NULL handling", "computed columns"]

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

      starterQuery: `SELECT

  subscription_id,

  customer_id,

  plan_name,

  COALESCE(end_date, 'Active') AS end_status

FROM subscriptions

ORDER BY subscription_id;`,

      solution: `SELECT

  subscription_id,

  customer_id,

  plan_name,

  COALESCE(end_date, 'Active') AS end_status

FROM subscriptions

ORDER BY subscription_id;`,

      hints: [

        "Use COALESCE to handle the NULL end_date case.",

        "COALESCE(end_date, 'Active') will return 'Active' if end_date is NULL.",

        "Order by subscription_id."

      ],

            detailedExplanation: "This demonstrates standard NULL handling using COALESCE. For active " +
                                 "subscribers, end_date is NULL, which we cleanly default to the string 'Active'.",

            alternativeApproach: "You could also use CASE WHEN end_date IS NULL THEN 'Active' ELSE end_date END, " +
                                 "but CASE is taught later.",

      performanceNotes: "Calculations run per row, practically instantaneous for typical dimensions.",
      concepts: ["COALESCE", "NULL", "ORDER BY"]
    },
    {
      id: "m5-p4", moduleId: 5, difficulty: "Hard",
      title: "Safe average customer discount to avoid division by zero",
            businessScenario: "The finance team wants to calculate average order discount percentage, ensuring " +
                              "they do not run into division-by-zero errors when total_amount is zero.",
            prompt: "Write a query to calculate the average discount percentage for each order. " +
                    "Calculate discount percentage as discount_amount * 100.0 / NULLIF(total_amount, " +
                    "0). Return order_id, total_amount, discount_amount, and discount_pct. Order by " +
                    "order_id.",
            starterQuery: "SELECT order_id, total_amount, discount_amount, discount_amount * 100.0 / " +
                          "NULLIF(total_amount, 0) AS discount_pct FROM orders ORDER BY order_id;",
            solution: "SELECT order_id, total_amount, discount_amount, discount_amount * 100.0 / " +
                      "NULLIF(total_amount, 0) AS discount_pct FROM orders ORDER BY order_id;",
      hints: ["Use NULLIF(total_amount, 0) in the denominator.", "Sort the final output by order_id."],
            detailedExplanation: "If total_amount is 0, NULLIF(total_amount, 0) returns NULL. Any division by " +
                                 "NULL propagates as NULL instead of throwing a division by zero exception.",
      alternativeApproach: "None.",
      performanceNotes: "Runs per row. Minimizes runtime errors on dirty database records.",
      concepts: ["NULLIF", "NULL handling", "arithmetic"]
    }
  ],

  9: [

    {

      id: "m9-p1", moduleId: 9, difficulty: "Easy",

      title: "Count orders per channel",

      businessScenario: "The growth team needs to know which channels (App, Web, Marketplace) drive the most orders.",

            prompt: "Count the number of orders per channel. Return channel and order_count. Order " +
                    "by order_count descending.",

            starterQuery: "SELECT\n  channel,\n  COUNT(???) AS order_count\nFROM orders\nGROUP BY " +
                          "???\nORDER BY order_count DESC;",

            solution: "SELECT\n  channel,\n  COUNT(*) AS order_count\nFROM orders\nGROUP BY " +
                      "channel\nORDER BY order_count DESC;",

      hints: [

        "COUNT(*) counts all rows in each group.",

        "GROUP BY channel creates one row per channel.",

        "ORDER BY the alias (works in ORDER BY)."

      ],

            detailedExplanation: "This is the simplest GROUP BY pattern. COUNT(*) counts all rows per channel " +
                                 "group. Note: no WHERE filter here — the question asks for all orders, not just " +
                                 "delivered ones.",

      alternativeApproach: "COUNT(order_id) is equivalent here since order_id is never NULL.",

      performanceNotes: "COUNT(*) is the fastest count — no column evaluation needed.",

      concepts: ["COUNT", "GROUP BY", "ORDER BY"]

    },

    {

      id: "m9-p2", moduleId: 9, difficulty: "Medium",

      title: "Unique cities per region",

            businessScenario: "Marketing wants to know how geographically spread out our customers are by " +
                              "counting the number of distinct cities in each region.",

            prompt: "Count the number of unique cities in each region from the customers table. " +
                    "Return region and unique_cities. Order by unique_cities descending.",

            starterQuery: "SELECT\n  region,\n  COUNT(DISTINCT ???) AS unique_cities\nFROM " +
                          "customers\nGROUP BY ???\nORDER BY unique_cities DESC;",

            solution: "SELECT\n  region,\n  COUNT(DISTINCT city) AS unique_cities\nFROM " +
                      "customers\nGROUP BY region\nORDER BY unique_cities DESC;",

      hints: [

        "No JOINs are needed — region and city are columns in the customers table.",

        "COUNT(DISTINCT city) counts only unique city names, ignoring duplicate occurrences.",

        "Group by region so that the count is computed separately for each region."

      ],

            detailedExplanation: "COUNT(DISTINCT col) counts the unique values within a group. Grouping by region " +
                                 "collapses customers into their respective regions and calculates how many " +
                                 "distinct cities exist in each.",

            alternativeApproach: "You could achieve this with subqueries, but COUNT(DISTINCT) with GROUP BY is " +
                                 "the standard approach.",

            performanceNotes: "Distinct counts require sorting/hashing columns to locate unique entries, " +
                              "adding slightly more cost than COUNT(*).",

      concepts: ["COUNT DISTINCT", "GROUP BY", "WHERE"]

    },

    {

      id: "m9-p3", moduleId: 9, difficulty: "Hard",

      title: "Count active customer profiles",

            businessScenario: "The product manager wants to count how many unique customer accounts have " +
                              "actually placed a successful delivered order.",

            prompt: "Write a query to count the number of unique customer_id values in the orders " +
                    "table that have a status of 'Delivered'. Alias the count as active_buyers.",

      starterQuery: `SELECT

  COUNT(DISTINCT customer_id) AS active_buyers

FROM orders

WHERE status = 'Delivered';`,

      solution: `SELECT

  COUNT(DISTINCT customer_id) AS active_buyers

FROM orders

WHERE status = 'Delivered';`,

      hints: [

        "Filter for status = 'Delivered' in the WHERE clause.",

        "Use COUNT(DISTINCT customer_id) to count only unique customers.",

        "Do NOT use GROUP BY since we want a single total count."

      ],

            detailedExplanation: "This query combines COUNT with DISTINCT inside it. It filters for delivered " +
                                 "orders first, and then calculates the number of unique buyers that placed those " +
                                 "orders.",

            alternativeApproach: "Without DISTINCT, COUNT(customer_id) would count all orders (including " +
                                 "duplicates per customer).",

      performanceNotes: "Uses indexes on status and customer_id to quickly group unique keys.",

      concepts: ["COUNT", "DISTINCT", "WHERE"]

    }

  ],

  10: [

    {

      id: "m10-p1", moduleId: 10, difficulty: "Easy",

      title: "Total revenue per payment mode",

      businessScenario: "The finance team at Paytm wants to see total settled revenue by payment mode.",

            prompt: "Calculate total payment amount per payment mode. Filter to successful payments " +
                    "only. Return payment_mode and total_amount. Order by total_amount descending.",

            starterQuery: "SELECT\n  payment_mode,\n  SUM(???) AS total_amount\nFROM payments\nWHERE " +
                          "payment_status = ???\nGROUP BY ???\nORDER BY total_amount DESC;",

            solution: "SELECT\n  payment_mode,\n  ROUND(SUM(amount), 2) AS total_amount\nFROM " +
                      "payments\nWHERE payment_status = 'Success'\nGROUP BY payment_mode\nORDER BY " +
                      "total_amount DESC;",

      hints: [

        "SUM(amount) adds up all amounts in each group.",

        "Filter to successful payments before summing.",

        "ROUND(SUM(amount), 2) for clean decimal output."

      ],

            detailedExplanation: "This combines WHERE (filter before aggregating) with SUM + GROUP BY. Always " +
                                 "filter before aggregating — it's more efficient and more accurate.",

            alternativeApproach: "Could use HAVING SUM(amount) > 0 instead of WHERE — but WHERE is faster here " +
                                 "since it's a non-aggregate condition.",

      performanceNotes: "WHERE filters rows before aggregation — much faster than HAVING for non-aggregate conditions.",

      concepts: ["SUM", "GROUP BY", "WHERE", "ROUND"]

    },

    {

      id: "m10-p2", moduleId: 10, difficulty: "Medium",

      title: "Net revenue vs gross revenue by channel",

            businessScenario: "The CFO wants to compare gross vs net revenue per sales channel to understand " +
                              "the discount impact of different acquisition channels.",

            prompt: "Write a query showing channel, gross_revenue (sum of total_amount), " +
                    "total_discount (sum of discount_amount), net_revenue (gross minus discount), and " +
                    "discount_rate (discount as % of gross, rounded to 1 decimal). Filter to " +
                    "delivered orders. Group by channel. Order by net_revenue descending.",

            starterQuery: "SELECT\n  channel,\n  ROUND(SUM(total_amount), 2) AS gross_revenue,\n " +
                          "ROUND(SUM(???), 2) AS total_discount,\n  ROUND(SUM(??? - ???), 2) AS " +
                          "net_revenue,\n  ROUND(SUM(???) * 1.0 / SUM(???) * 100, 1) AS discount_rate\nFROM " +
                          "orders\nWHERE status = 'Delivered'\nGROUP BY channel\nORDER BY net_revenue DESC;",

            solution: "SELECT\n  channel,\n  ROUND(SUM(total_amount), 2) AS gross_revenue,\n " +
                      "ROUND(SUM(discount_amount), 2) AS total_discount,\n  ROUND(SUM(total_amount - " +
                      "discount_amount), 2) AS net_revenue,\n  ROUND(SUM(discount_amount) * 1.0 / " +
                      "SUM(total_amount) * 100, 1) AS discount_rate\nFROM orders\nWHERE status = " +
                      "'Delivered'\nGROUP BY channel\nORDER BY net_revenue DESC;",

      hints: [

        "No JOINs are needed — all order sales and discounts exist directly in the orders table.",

        "Net revenue = SUM(total_amount - discount_amount).",

        "Discount rate = (SUM(discount_amount) / SUM(total_amount)) * 100."

      ],

            detailedExplanation: "This query aggregates multiple transactional fields per sales channel. We " +
                                 "calculate both gross and net sums and compute the effective discount percentage " +
                                 "by dividing sum of discounts by sum of gross totals.",

            alternativeApproach: "You could use CAST(SUM(discount_amount) AS REAL) instead of *1.0 to enforce " +
                                 "decimal division.",

            performanceNotes: "Grouping on a single table evaluates rows in a single pass without loading " +
                              "relational lookup tables.",

      concepts: ["SUM", "GROUP BY", "computed rates", "WHERE"]

    },

    {

      id: "m10-p3", moduleId: 10, difficulty: "Hard",

      title: "Financial net value summary in 2024",

            businessScenario: "The finance lead wants a high-level summary of total net revenue and total " +
                              "discounts applied across all completed purchases in 2024.",

            prompt: "Write a query on the orders table. Calculate the total net revenue (SUM of " +
                    "total_amount minus discount_amount) as total_net_revenue, and the total " +
                    "discounts given (SUM of discount_amount) as total_discounts. Only include " +
                    "delivered orders placed in the year 2024.",

      starterQuery: `SELECT

  SUM(total_amount - discount_amount) AS total_net_revenue,

  SUM(discount_amount) AS total_discounts

FROM orders

WHERE status = 'Delivered'

  AND order_date LIKE '2024%';`,

      solution: `SELECT

  SUM(total_amount - discount_amount) AS total_net_revenue,

  SUM(discount_amount) AS total_discounts

FROM orders

WHERE status = 'Delivered'

  AND order_date LIKE '2024%';`,

      hints: [

        "Filter WHERE status = 'Delivered' and order_date starts with '2024'.",

        "Use SUM(total_amount - discount_amount) to calculate net revenue.",

        "Use SUM(discount_amount) to calculate the sum of all discounts."

      ],

            detailedExplanation: "We perform aggregation on the entire table after applying a WHERE filter. SUM " +
                                 "computes the total of the expression (total_amount - discount_amount) across all " +
                                 "matched rows.",

      alternativeApproach: "None — simple SUM without GROUP BY returns exactly one row representing the global sums.",

      performanceNotes: "Highly performant as it aggregates in a single scan of the filtered orders table.",

      concepts: ["SUM", "Operators", "WHERE"]

    }

  ],

  41: [

    {

      id: "m41-p1", moduleId: 41, difficulty: "Hard",

      title: "2nd Highest Order Value per City",

            businessScenario: "The operations team wants to identify the runner-up high-value purchase in each " +
                              "city to understand mid-tier customer transactions.",

            prompt: "Write a query to find the runner-up (2nd highest) order total_amount for each city to assist the operations team in establishing mid-tier purchasing benchmarks. Return city, full_name (of the customer), and total_amount. Order the final output by city ascending.",

            starterQuery: "WITH ranked_orders AS (\n  SELECT\n    c.city,\n    c.full_name,\n   " +
                          "o.total_amount,\n    DENSE_RANK() OVER (PARTITION BY c.city ORDER BY " +
                          "o.total_amount DESC) as rnk\n  FROM customers c\n  JOIN orders o ON " +
                          "c.customer_id = o.customer_id\n)\nSELECT\n  city,\n  full_name,\n " +
                          "total_amount\nFROM ranked_orders\nWHERE rnk = 2\nORDER BY city;",

            solution: "WITH ranked_orders AS (\n  SELECT\n    c.city,\n    c.full_name,\n   " +
                      "o.total_amount,\n    DENSE_RANK() OVER (PARTITION BY c.city ORDER BY " +
                      "o.total_amount DESC) as rnk\n  FROM customers c\n  JOIN orders o ON " +
                      "c.customer_id = o.customer_id\n)\nSELECT city, full_name, total_amount\nFROM " +
                      "ranked_orders\nWHERE rnk = 2\nORDER BY city;",

      hints: [

        "Use DENSE_RANK() OVER (PARTITION BY city ORDER BY total_amount DESC) inside a CTE.",

        "Filter for rnk = 2 in the outer query.",

        "Ensure you JOIN customers and orders tables on customer_id."

      ],

            detailedExplanation: "This query finds the runner-up highest purchase per city. DENSE_RANK() is " +
                                 "useful here because if multiple orders tie for first place, the next distinct " +
                                 "price still gets rank 2.",

      alternativeApproach: "Could use ROW_NUMBER() instead of DENSE_RANK() if ties don't need to be grouped together.",

            performanceNotes: "Partitioning and ranking require sorting city partitions. An index on " +
                              "orders(customer_id) is beneficial.",

      concepts: ["DENSE_RANK", "PARTITION BY", "CTE", "JOIN"]

    },

    {

      id: "m41-p2", moduleId: 41, difficulty: "Hard",

      title: "Month-over-Month Revenue Growth Rate",

            businessScenario: "The finance team needs to track monthly business scaling by monitoring the " +
                              "month-over-month revenue growth rate.",

            prompt: "Finance needs a revenue velocity report tracking month-over-month percentage scaling for delivered orders. For each month (YYYY-MM format), compute net revenue (total_amount minus discount_amount), previous month net revenue, and mom_growth_pct rounded to 2 decimal places. Order output by month ascending.",

            starterQuery: "WITH monthly_revenue AS (\n  SELECT\n    SUBSTR(order_date, 1, 7) AS month,\n  " +
                          " SUM(total_amount - discount_amount) AS current_month_revenue\n  FROM orders\n " +
                          "WHERE status = 'Delivered'\n  GROUP BY 1\n),\nlagged_revenue AS (\n  SELECT\n   " +
                          "month,\n    current_month_revenue,\n    LAG(current_month_revenue, 1) OVER " +
                          "(ORDER BY month) AS previous_month_revenue\n  FROM monthly_revenue\n)\nSELECT\n " +
                          "month,\n  ROUND(current_month_revenue, 2) AS current_month_revenue,\n " +
                          "ROUND(previous_month_revenue, 2) AS previous_month_revenue,\n " +
                          "ROUND((current_month_revenue - previous_month_revenue) / previous_month_revenue " +
                          "* 100.0, 2) AS mom_growth_pct\nFROM lagged_revenue\nORDER BY month;",

            solution: "WITH monthly_revenue AS (\n  SELECT\n    SUBSTR(order_date, 1, 7) AS month,\n  " +
                      " SUM(total_amount - discount_amount) AS current_month_revenue\n  FROM orders\n " +
                      "WHERE status = 'Delivered'\n  GROUP BY 1\n),\nlagged_revenue AS (\n  SELECT\n   " +
                      "month,\n    current_month_revenue,\n    LAG(current_month_revenue, 1) OVER " +
                      "(ORDER BY month) AS previous_month_revenue\n  FROM monthly_revenue\n)\nSELECT\n " +
                      "month,\n  ROUND(current_month_revenue, 2) AS current_month_revenue,\n " +
                      "ROUND(previous_month_revenue, 2) AS previous_month_revenue,\n " +
                      "ROUND((current_month_revenue - previous_month_revenue) / previous_month_revenue " +
                      "* 100.0, 2) AS mom_growth_pct\nFROM lagged_revenue\nORDER BY month;",

      hints: [

        "First calculate total net revenue per month using SUM(total_amount - discount_amount).",

        "Use LAG(current_month_revenue, 1) OVER (ORDER BY month) to fetch the previous month's revenue.",

        "Calculate the percentage difference: (curr - prev) / prev * 100.0."

      ],

            detailedExplanation: "This query calculates month-over-month revenue growth. It leverages LAG to look " +
                                 "back at the previous row's revenue inside a CTE.",

            alternativeApproach: "Could do a self-join of the monthly aggregate CTE on month differences, but LAG " +
                                 "is cleaner and faster.",

            performanceNotes: "The aggregation is quick. The window function runs on the aggregated 12-row " +
                              "monthly dataset, which is tiny and fast.",

      concepts: ["LAG", "OVER", "CTE", "arithmetic"]

    },

    {

      id: "m41-p3", moduleId: 41, difficulty: "Hard",

      title: "Customers with Consecutive Daily Orders",

            businessScenario: "The growth team wants to identify highly engaged customers who made purchases " +
                              "on at least 2 consecutive days.",

            prompt: "Growth analytics needs to detect power users with daily purchasing velocity. Find customers who placed orders on at least 2 consecutive days, returning customer_id, full_name, start_date (first day of streak), and consecutive_days. Order results by consecutive_days descending, then customer_id.",

            starterQuery: "WITH distinct_dates AS (\n  SELECT DISTINCT customer_id, SUBSTR(order_date, 1, " +
                          "10) as o_date\n  FROM orders\n),\nislands AS (\n  SELECT\n    customer_id,\n   " +
                          "o_date,\n    julianday(o_date) - DENSE_RANK() OVER (PARTITION BY customer_id " +
                          "ORDER BY o_date) as group_id\n  FROM distinct_dates\n),\nconsecutive_counts AS " +
                          "(\n  SELECT\n    customer_id,\n    MIN(o_date) as start_date,\n    COUNT(*) as " +
                          "consecutive_days\n  FROM islands\n  GROUP BY customer_id, group_id\n)\nSELECT " +
                          "c.customer_id, c.full_name, cc.start_date, cc.consecutive_days\nFROM " +
                          "consecutive_counts cc\nJOIN customers c ON cc.customer_id = c.customer_id\nWHERE " +
                          "cc.consecutive_days >= 2\nORDER BY cc.consecutive_days DESC, c.customer_id;",

            solution: "WITH distinct_dates AS (\n  SELECT DISTINCT customer_id, SUBSTR(order_date, 1, " +
                      "10) as o_date\n  FROM orders\n),\nislands AS (\n  SELECT\n    customer_id,\n   " +
                      "o_date,\n    julianday(o_date) - DENSE_RANK() OVER (PARTITION BY customer_id " +
                      "ORDER BY o_date) as group_id\n  FROM distinct_dates\n),\nconsecutive_counts AS " +
                      "(\n  SELECT\n    customer_id,\n    MIN(o_date) as start_date,\n    COUNT(*) as " +
                      "consecutive_days\n  FROM islands\n  GROUP BY customer_id, group_id\n)\nSELECT " +
                      "c.customer_id, c.full_name, cc.start_date, cc.consecutive_days\nFROM " +
                      "consecutive_counts cc\nJOIN customers c ON cc.customer_id = c.customer_id\nWHERE " +
                      "cc.consecutive_days >= 2\nORDER BY cc.consecutive_days DESC, c.customer_id;",

      hints: [

        "The subtraction of DENSE_RANK() FROM the julian date creates a constant value " +
        "(group_id) for consecutive date runs.",

        "Aggregate by customer_id and group_id to count consecutive days.",

        "Filter for streaks WHERE consecutive_days >= 2."

      ],

            detailedExplanation: "This is the classic Gaps & Islands pattern. By subtracting DENSE_RANK from the " +
                                 "sequence of dates, consecutive days will decrement at the same rate, resulting " +
                                 "in a constant group identifier.",

            alternativeApproach: "Can be solved using self-joins or LAG/LEAD with date comparisons, but " +
                                 "group-state identifiers scale better.",

      performanceNotes: "Uses DENSE_RANK on distinct customer order dates.",

      concepts: ["Gaps and Islands", "DENSE_RANK", "julianday", "date math"]

    },

    {

      id: "m41-p4", moduleId: 41, difficulty: "Hard",

      title: "Two-Month Customer Cohort Retention",

            businessScenario: "Inspect product stickiness by tracking what percentage of monthly signup " +
                              "cohorts return to make purchases in the subsequent two months.",

            prompt: "Measure product stickiness across customer signup cohorts. For each signup cohort_month, calculate cohort_size, the percentage of users ordering in month 1 post-signup (retention_month_1), and percentage ordering in month 2 (retention_month_2). Order output by cohort_month.",

            starterQuery: "WITH cohort_sizes AS (\n  SELECT SUBSTR(signup_date, 1, 7) as cohort_month, " +
                          "COUNT(*) as cohort_size\n  FROM customers\n  GROUP BY 1\n),\norder_diffs AS (\n " +
                          "SELECT\n    c.customer_id,\n    SUBSTR(c.signup_date, 1, 7) as cohort_month,\n  " +
                          " o.order_date,\n    (strftime('%Y', o.order_date) - strftime('%Y', " +
                          "c.signup_date)) * 12 +\n    (strftime('%m', o.order_date) - strftime('%m', " +
                          "c.signup_date)) as months_diff\n  FROM customers c\n  JOIN orders o ON " +
                          "c.customer_id = o.customer_id\n)\nSELECT\n  cs.cohort_month,\n " +
                          "cs.cohort_size,\n  ROUND(COUNT(DISTINCT CASE WHEN od.months_diff = 1 THEN " +
                          "od.customer_id END) * 100.0 / cs.cohort_size, 2) as retention_month_1,\n " +
                          "ROUND(COUNT(DISTINCT CASE WHEN od.months_diff = 2 THEN od.customer_id END) * " +
                          "100.0 / cs.cohort_size, 2) as retention_month_2\nFROM cohort_sizes cs\nLEFT JOIN " +
                          "order_diffs od ON cs.cohort_month = od.cohort_month\nGROUP BY cs.cohort_month, " +
                          "cs.cohort_size\nORDER BY cs.cohort_month;",

            solution: "WITH cohort_sizes AS (\n  SELECT SUBSTR(signup_date, 1, 7) as cohort_month, " +
                      "COUNT(*) as cohort_size\n  FROM customers\n  GROUP BY 1\n),\norder_diffs AS (\n " +
                      "SELECT\n    c.customer_id,\n    SUBSTR(c.signup_date, 1, 7) as cohort_month,\n  " +
                      " o.order_date,\n    (strftime('%Y', o.order_date) - strftime('%Y', " +
                      "c.signup_date)) * 12 +\n    (strftime('%m', o.order_date) - strftime('%m', " +
                      "c.signup_date)) as months_diff\n  FROM customers c\n  JOIN orders o ON " +
                      "c.customer_id = o.customer_id\n)\nSELECT\n  cs.cohort_month,\n " +
                      "cs.cohort_size,\n  ROUND(COUNT(DISTINCT CASE WHEN od.months_diff = 1 THEN " +
                      "od.customer_id END) * 100.0 / cs.cohort_size, 2) as retention_month_1,\n " +
                      "ROUND(COUNT(DISTINCT CASE WHEN od.months_diff = 2 THEN od.customer_id END) * " +
                      "100.0 / cs.cohort_size, 2) as retention_month_2\nFROM cohort_sizes cs\nLEFT JOIN " +
                      "order_diffs od ON cs.cohort_month = od.cohort_month\nGROUP BY cs.cohort_month, " +
                      "cs.cohort_size\nORDER BY cs.cohort_month;",

      hints: [

        "First build a cohort_sizes CTE to get the count of signups per cohort_month.",

        "Calculate the months_diff between orders and signup dates using strftime calculations.",

        "Use conditional DISTINCT customer counts to calculate retention rates."

      ],

            detailedExplanation: "Cohort retention analysis measures buyer stickiness over time. We establish a " +
                                 "signup cohort sizing baseline and track active customers in subsequent months.",

            alternativeApproach: "Could calculate date differences using julianday, but month differences are " +
                                 "cleaner for monthly cohorts.",

      performanceNotes: "Performs left joins to ensure cohorts with 0 retention are still returned in the output.",

      concepts: ["cohort analysis", "conditional aggregation", "LEFT JOIN", "date math"]

    },

    {

      id: "m41-p5", moduleId: 41, difficulty: "Hard",

      title: "Order to Payment Funnel Conversion",

            businessScenario: "Audit checkout flow friction by tracking the drop-off rates from order " +
                              "placement to payment success and refund states.",

            prompt: "Audit checkout drop-off rates across payment states. Return total_orders, payment_success_rate_pct (percentage of orders with payment_status 'Success'), and refund_rate_pct (percentage of successful payments with status 'Refunded').",

            starterQuery: "SELECT\n  COUNT(o.order_id) AS total_orders,\n  ROUND(COUNT(CASE WHEN " +
                          "p.payment_status = 'Success' THEN 1 END) * 100.0 / COUNT(o.order_id), 2) AS " +
                          "payment_success_rate_pct,\n  ROUND(COUNT(CASE WHEN p.payment_status = 'Refunded' " +
                          "THEN 1 END) * 100.0 / NULLIF(COUNT(CASE WHEN p.payment_status = 'Success' OR " +
                          "p.payment_status = 'Refunded' THEN 1 END), 0), 2) AS refund_rate_pct\nFROM " +
                          "orders o\nLEFT JOIN payments p ON o.order_id = p.order_id;",

            solution: "SELECT\n  COUNT(o.order_id) AS total_orders,\n  ROUND(COUNT(CASE WHEN " +
                      "p.payment_status = 'Success' THEN 1 END) * 100.0 / COUNT(o.order_id), 2) AS " +
                      "payment_success_rate_pct,\n  ROUND(COUNT(CASE WHEN p.payment_status = 'Refunded' " +
                      "THEN 1 END) * 100.0 / NULLIF(COUNT(CASE WHEN p.payment_status = 'Success' OR " +
                      "p.payment_status = 'Refunded' THEN 1 END), 0), 2) AS refund_rate_pct\nFROM " +
                      "orders o\nLEFT JOIN payments p ON o.order_id = p.order_id;",

      hints: [

        "Join orders and payments on order_id.",

        "Use CASE WHEN with payment_status values to count successes and refunds.",

        "Use NULLIF to handle divisions by zero safely."

      ],

            detailedExplanation: "Funnel queries map drop-off points in user activation flows. The NULLIF " +
                                 "function ensures that if a step has zero entries, the math fails safely to null " +
                                 "rather than division by zero errors.",

            alternativeApproach: "Can also write using separate CTEs for each funnel step, but conditional " +
                                 "aggregates are more performant.",

      performanceNotes: "Runs in a single scan of matched order-payment rows.",

      concepts: ["funnel analysis", "CASE WHEN", "conditional count", "NULLIF"]

    },

    {

      id: "m41-p6", moduleId: 41, difficulty: "Hard",

      title: "Deduplicate customer contacts",

            businessScenario: "The CRM platform database occasionally creates duplicate records. We need to " +
                              "identify duplicates and keep only the earliest record.",

            prompt: "Clean up duplicate customer CRM profiles. Delete duplicate records sharing the same full_name and city combinations, preserving only the earliest record (lowest customer_id).",

            starterQuery: "DELETE FROM customers\nWHERE customer_id NOT IN (\n  SELECT MIN(customer_id)\n " +
                          "FROM customers\n  GROUP BY full_name, city\n);",

            solution: "DELETE FROM customers\nWHERE customer_id NOT IN (\n  SELECT MIN(customer_id)\n " +
                      "FROM customers\n  GROUP BY full_name, city\n);",

      hints: [

        "Group by full_name and city to find duplicate groups.",

        "Find the MIN(customer_id) for each group.",

        "Delete all rows whose customer_id is NOT in that list."

      ],

            detailedExplanation: "This query deduplicates contacts. It groups by duplicate identifier columns, " +
                                 "extracts the original key (MIN), and purges the rest.",

      alternativeApproach: "Could join the table to a duplicate-finding subquery, but NOT IN is direct and readable.",

      performanceNotes: "DML operations mutate the table. The grader compares the resulting snapshots.",

      concepts: ["deduplication", "DELETE", "subquery", "GROUP BY"]

    },

    {

      id: "m41-p7", moduleId: 41, difficulty: "Hard",

      title: "Median order amount calculation",

            businessScenario: "Averages are skewed by high-value outliers. The marketing team requires the " +
                              "median order total_amount to design discounts.",

            prompt: "Compute the unskewed median order total_amount to establish spending baselines for marketing promotions. Output a single column median_amount rounded to 2 decimal places.",

            starterQuery: "WITH ranked_orders AS (\n  SELECT\n    total_amount,\n    ROW_NUMBER() OVER " +
                          "(ORDER BY total_amount) AS row_num,\n    COUNT(*) OVER () AS total_count\n  FROM " +
                          "orders\n)\nSELECT\n  ROUND(AVG(total_amount), 2) AS median_amount\nFROM " +
                          "ranked_orders\nWHERE row_num IN (total_count / 2 + 1, (total_count + 1) / 2);",

            solution: "WITH ranked_orders AS (\n  SELECT\n    total_amount,\n    ROW_NUMBER() OVER " +
                      "(ORDER BY total_amount) AS row_num,\n    COUNT(*) OVER () AS total_count\n  FROM " +
                      "orders\n)\nSELECT\n  ROUND(AVG(total_amount), 2) AS median_amount\nFROM " +
                      "ranked_orders\nWHERE row_num IN (total_count / 2 + 1, (total_count + 1) / 2);",

      hints: [

        "Sort order_amount ascending using ROW_NUMBER().",

        "Use COUNT(*) OVER () to get the total rows.",

        "Select and average the middle row indices using integer division rules."

      ],

            detailedExplanation: "Median calculations require sorting values and picking the middle index. By " +
                                 "averaging the two middle indices for even counts and targeting the single middle " +
                                 "index for odd counts, we compute a mathematically correct median.",

      alternativeApproach: "Can be solved with subquery offsets or percentile functions depending on engine support.",

            performanceNotes: "Sorts the orders table by total_amount. An index on orders(total_amount) would " +
                              "bypass this sort.",

      concepts: ["median", "ROW_NUMBER", "window function", "COUNT OVER"]

    },

    {

      id: "m41-p8", moduleId: 41, difficulty: "Hard",

      title: "Payment Reconciliation Discrepancy check",

            businessScenario: "The financial operations team wants to run a referential integrity audit to " +
                              "identify orphaned records between orders and payments.",

            prompt: "Execute a financial integrity audit identifying orphaned records between orders and payments. Return source_mismatch ('Order Without Payment' or 'Payment Without Order'), order_id, and amount_discrepancy (total_amount from orders or amount from payments). Order by source_mismatch, then order_id.",

            starterQuery: "WITH unmatched_orders AS (\n  SELECT\n    'Order Without Payment' AS " +
                          "source_mismatch,\n    o.order_id,\n    o.total_amount AS amount_discrepancy\n " +
                          "FROM orders o\n  LEFT JOIN payments p ON o.order_id = p.order_id\n  WHERE " +
                          "p.order_id IS NULL\n),\nunmatched_payments AS (\n  SELECT\n    'Payment Without " +
                          "Order' AS source_mismatch,\n    p.order_id,\n    p.amount AS " +
                          "amount_discrepancy\n  FROM payments p\n  LEFT JOIN orders o ON p.order_id = " +
                          "o.order_id\n  WHERE o.order_id IS NULL\n)\nSELECT source_mismatch, order_id, " +
                          "amount_discrepancy\nFROM unmatched_orders\nUNION ALL\nSELECT source_mismatch, " +
                          "order_id, amount_discrepancy\nFROM unmatched_payments\nORDER BY source_mismatch, " +
                          "order_id;",

            solution: "WITH unmatched_orders AS (\n  SELECT\n    'Order Without Payment' AS " +
                      "source_mismatch,\n    o.order_id,\n    o.total_amount AS amount_discrepancy\n " +
                      "FROM orders o\n  LEFT JOIN payments p ON o.order_id = p.order_id\n  WHERE " +
                      "p.order_id IS NULL\n),\nunmatched_payments AS (\n  SELECT\n    'Payment Without " +
                      "Order' AS source_mismatch,\n    p.order_id,\n    p.amount AS " +
                      "amount_discrepancy\n  FROM payments p\n  LEFT JOIN orders o ON p.order_id = " +
                      "o.order_id\n  WHERE o.order_id IS NULL\n)\nSELECT source_mismatch, order_id, " +
                      "amount_discrepancy\nFROM unmatched_orders\nUNION ALL\nSELECT source_mismatch, " +
                      "order_id, amount_discrepancy\nFROM unmatched_payments\nORDER BY source_mismatch, " +
                      "order_id;",

      hints: [

        "Build a LEFT JOIN orders with payments to find missing payments.",

        "Build a LEFT JOIN payments with orders to find missing orders.",

        "Combine results using UNION ALL and ORDER BY source_mismatch, order_id."

      ],

            detailedExplanation: "Referential integrity audits verify database relationships. This query " +
                                 "identifies orphans on both sides of a relationship key using outer joins and " +
                                 "union combinations.",

            alternativeApproach: "Could perform a FULL OUTER JOIN if natively supported, filtering where either " +
                                 "side's join key is null.",

      performanceNotes: "Uses left joins and filters. Fast on small tables.",

      concepts: ["data quality", "LEFT JOIN", "UNION ALL", "IS NULL"]

    },
    {
      id: "m41-p9",
      moduleId: 41,
      difficulty: "Medium",
      title: "Extract JSON device info",
            businessScenario: "The mobile product team wants to segment customers by their device type " +
                              "recorded in the metadata JSON column to analyze app adoption.",
            prompt: "Extract device types stored in customer metadata JSON strings for mobile adoption analysis. Return customer_id, full_name, and device_type. Sort by customer_id.",
            starterQuery: "SELECT customer_id, full_name, json_extract(metadata, '$.device') AS " +
                          "device_type FROM customers ORDER BY customer_id;",
            solution: "SELECT customer_id, full_name, json_extract(metadata, '$.device') AS " +
                      "device_type FROM customers ORDER BY customer_id;",
      hints: [
        "Use json_extract(metadata, '$.device') to extract the device key.",
        "Sort the final output by customer_id."
      ],
            detailedExplanation: "In SQLite and modern SQL engines (like Postgres/BigQuery), JSON data can be " +
                                 "queried inline using extraction paths like $.device. This avoids needing " +
                                 "separate columns for sparse attributes.",
      alternativeApproach: "None.",
            performanceNotes: "Runs per row. Indexes on JSON keys are not supported natively in SQLite unless " +
                              "generated columns are used, so a full table scan is performed.",
      concepts: ["JSON", "json_extract", "string functions"],
      companyTags: ["Myntra"]
    }

  ],

  ...batch2Problems,
42: [
    {
      id: "m42-p1", moduleId: 42, difficulty: "Medium",
      title: "Persist High-Value Customer Summaries (CTAS)",
      businessScenario: "The CRM team wants a fast, pre-aggregated database table containing total spending of high-value customers (spending more than 5000) so they can query it instantly without running expensive joins.",
      prompt: "Write a query using CREATE TABLE AS SELECT to create a permanent table named 'high_value_customers'. The table should contain customer_id, full_name, and total_spend (the sum of total_amount from orders). Join customers and orders on customer_id, group by customer_id and full_name, and filter for total spend greater than 5000.",
      starterQuery: "CREATE TABLE high_value_customers AS\nSELECT\n  c.customer_id,\n  c.full_name,\n  SUM(o.total_amount) AS total_spend\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nGROUP BY c.customer_id, c.full_name\nHAVING SUM(o.total_amount) > 5000;",
      solution: "CREATE TABLE high_value_customers AS\nSELECT c.customer_id, c.full_name, SUM(o.total_amount) AS total_spend\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nGROUP BY c.customer_id, c.full_name\nHAVING SUM(o.total_amount) > 5000;",
      hints: [
        "Use CREATE TABLE table_name AS SELECT ... syntax.",
        "Join customers and orders on customer_id, GROUP BY customer_id and full_name.",
        "Use HAVING to filter aggregated total_spend > 5000."
      ],
      detailedExplanation: "The CREATE TABLE AS SELECT (CTAS) statement is used to create a new database table and populate it with the query results.",
      alternativeApproach: "You could run a separate CREATE TABLE statement followed by an INSERT INTO SELECT statement.",
      performanceNotes: "CTAS writes data physically to disk.",
      concepts: ["CTAS", "DDL", "data staging", "aggregation"]
    },
    {
      id: "m42-p2", moduleId: 42, difficulty: "Easy",
      title: "Stage Product Category Price Ranges",
      businessScenario: "Create a reference table containing category price statistics.",
      prompt: "Write a query using CREATE TABLE AS SELECT to create a permanent table named 'category_prices'. The table should contain category, min_price (the minimum list_price of products), and max_price (the maximum list_price of products) grouped by category.",
      starterQuery: "CREATE TABLE category_prices AS\nSELECT category, MIN(list_price) AS min_price, MAX(list_price) AS max_price\nFROM products\nGROUP BY category;",
      solution: "CREATE TABLE category_prices AS SELECT category, MIN(list_price) AS min_price, MAX(list_price) AS max_price FROM products GROUP BY category;",
      hints: ["Use CREATE TABLE table_name AS SELECT.", "GROUP BY category.", "Select MIN(list_price) and MAX(list_price)."],
      detailedExplanation: "CTAS can be used to stage aggregated lookups.",
      alternativeApproach: "None.",
      performanceNotes: "Runs aggregation and creates table in one pass.",
      concepts: ["CTAS", "DDL", "GROUP BY", "aggregation"]
    },
    {
      id: "m42-p3", moduleId: 42, difficulty: "Hard",
      title: "Active Customer Signups by Region",
      businessScenario: "CRM wants to stage customer distribution data.",
      prompt: "Write a query using CREATE TABLE AS SELECT to create a permanent table named 'regional_signup_summary'. The table should contain region, city, and active_customer_count (count of customers). Join customers and subscriptions on customer_id, filter for status = 'Active', group by region and city, and order by region, active_customer_count descending.",
      starterQuery: "CREATE TABLE regional_signup_summary AS\nSELECT c.region, c.city, COUNT(DISTINCT c.customer_id) AS active_customer_count\nFROM customers c\nINNER JOIN subscriptions s ON c.customer_id = s.customer_id\nWHERE s.status = 'Active'\nGROUP BY c.region, c.city\nORDER BY c.region, active_customer_count DESC;",
      solution: "CREATE TABLE regional_signup_summary AS SELECT c.region, c.city, COUNT(DISTINCT c.customer_id) AS active_customer_count FROM customers c INNER JOIN subscriptions s ON c.customer_id = s.customer_id WHERE s.status = 'Active' GROUP BY c.region, c.city ORDER BY c.region, active_customer_count DESC;",
      hints: ["Join customers and subscriptions.", "Filter status = 'Active'.", "Order by region and active_customer_count DESC."],
      detailedExplanation: "CTAS creates regional data snapshots.",
      alternativeApproach: "None.",
      performanceNotes: "Requires sorting for ORDER BY inside the CTAS statement.",
      concepts: ["CTAS", "DDL", "INNER JOIN", "GROUP BY"]
    }
  ],
  43: [
    {
      id: "m43-p1", moduleId: 43, difficulty: "Medium",
      title: "Active Subscriptions Staging Table",
      businessScenario: "To run a complex multi-step subscription dashboard audit, we need to temporarily stage all active subscription records.",
      prompt: "Write a script to: (1) Create a temporary table named 'temp_active_subs' containing subscription_id, customer_id, and monthly_fee from subscriptions where status is 'Active'. (2) Write a SELECT query to retrieve all rows from 'temp_active_subs' ordered by monthly_fee descending.",
      starterQuery: "CREATE TEMPORARY TABLE temp_active_subs AS\nSELECT\n  subscription_id,\n  customer_id,\n  monthly_fee\nFROM subscriptions\nWHERE status = 'Active';\n\nSELECT *\nFROM temp_active_subs\nORDER BY monthly_fee DESC;",
      solution: "CREATE TEMPORARY TABLE temp_active_subs AS\nSELECT subscription_id, customer_id, monthly_fee\nFROM subscriptions\nWHERE status = 'Active';\n\nSELECT * FROM temp_active_subs ORDER BY monthly_fee DESC;",
      hints: [
        "Use CREATE TEMPORARY TABLE temp_active_subs AS SELECT ... syntax.",
        "Select subscription_id, customer_id, and monthly_fee WHERE status = 'Active'.",
        "Write a separate SELECT * FROM temp_active_subs ORDER BY monthly_fee DESC; query."
      ],
      detailedExplanation: "Temporary tables are private to the current connection and automatically deleted when the session ends.",
      alternativeApproach: "You could use a CTE.",
      performanceNotes: "SQLite stores temporary tables in a separate database.",
      concepts: ["temporary tables", "session data", "data staging", "DML"]
    },
    {
      id: "m43-p2", moduleId: 43, difficulty: "Easy",
      title: "Filter Low Inventory Products",
      businessScenario: "Inventory staging table.",
      prompt: "Write a script to: (1) Create a temporary table named 'temp_high_cost_products' containing product_id, product_name, and cost_price from products where cost_price > 500. (2) Select all rows from 'temp_high_cost_products' ordered by cost_price descending.",
      starterQuery: "CREATE TEMPORARY TABLE temp_high_cost_products AS\nSELECT product_id, product_name, cost_price\nFROM products\nWHERE cost_price > 500;\n\nSELECT * FROM temp_high_cost_products ORDER BY cost_price DESC;",
      solution: "CREATE TEMPORARY TABLE temp_high_cost_products AS SELECT product_id, product_name, cost_price FROM products WHERE cost_price > 500;\nSELECT * FROM temp_high_cost_products ORDER BY cost_price DESC;",
      hints: ["Create temporary table for cost_price > 500.", "Select all rows ordered by cost_price DESC."],
      detailedExplanation: "Creates a session-specific lookup staging table.",
      alternativeApproach: "None.",
      performanceNotes: "Runs simple scan filter.",
      concepts: ["temporary tables", "DML", "WHERE"]
    },
    {
      id: "m43-p3", moduleId: 43, difficulty: "Hard",
      title: "Active Premium Subscriptions Staging",
      businessScenario: "Target cohort staging.",
      prompt: "Write a script to: (1) Create a temporary table named 'temp_premium_cohort' containing customer_id and monthly_fee from subscriptions where monthly_fee > 1000 and status = 'Active'. (2) Write a SELECT query to join 'temp_premium_cohort' with customers on customer_id and return customer_id, full_name, and monthly_fee ordered by monthly_fee descending.",
      starterQuery: "CREATE TEMPORARY TABLE temp_premium_cohort AS\nSELECT customer_id, monthly_fee\nFROM subscriptions\nWHERE monthly_fee > 1000 AND status = 'Active';\n\nSELECT t.customer_id, c.full_name, t.monthly_fee\nFROM temp_premium_cohort t\nINNER JOIN customers c ON t.customer_id = c.customer_id\nORDER BY t.monthly_fee DESC;",
      solution: "CREATE TEMPORARY TABLE temp_premium_cohort AS SELECT customer_id, monthly_fee FROM subscriptions WHERE monthly_fee > 1000 AND status = 'Active';\nSELECT t.customer_id, c.full_name, t.monthly_fee FROM temp_premium_cohort t INNER JOIN customers c ON t.customer_id = c.customer_id ORDER BY t.monthly_fee DESC;",
      hints: ["Create temporary table for monthly_fee > 1000 and active status.", "Join temp_premium_cohort with customers."],
      detailedExplanation: "Integrates temporary table data with primary schema relations.",
      alternativeApproach: "None.",
      performanceNotes: "Speeds up sub-query joins.",
      concepts: ["temporary tables", "DML", "INNER JOIN"]
    }
  ],
  ...problemsBatch3
};

function buildFallbackProblem(moduleId: number, title: string, index: number, difficulty: Difficulty): PracticeProblem {

  const t = title.toUpperCase();

  let query = "";

  let promptText = "";

  let concepts = [title];

  if (t.includes("JOIN")) {

    query = `SELECT c.customer_id, c.full_name, o.order_id, o.total_amount\n` +
            `FROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nLIMIT 10;`;

    promptText = `Write a query to retrieve customer_id, full_name, order_id, and total_amount ` +
                 `by joining the customers and orders tables.`;

    concepts.push("JOIN", "Foreign Key");

  } else if (
    t.includes("WINDOW") || t.includes("RANK") || t.includes("ROW_NUMBER") ||
    t.includes("LEAD") || t.includes("LAG")
  ) {

    query = `SELECT customer_id, order_id, total_amount, ` +
            `RANK() OVER(PARTITION BY customer_id ORDER BY total_amount DESC) as rank_amount\n` +
            `FROM orders\nWHERE status = 'Delivered';`;

    promptText = `Write a window function query to rank the delivered orders for each customer ` +
                 `based on their total_amount (highest first).`;

    concepts.push("Window Function", "RANK", "PARTITION BY");

  } else if (
    t.includes("GROUP BY") || t.includes("HAVING") || t.includes("COUNT") ||
    t.includes("SUM") || t.includes("AVG") || t.includes("MIN") || t.includes("MAX")
  ) {

    query = `SELECT status, COUNT(order_id) as total_orders, SUM(total_amount) as revenue\n` +
            `FROM orders\nGROUP BY status;`;

    promptText = `Write a query to calculate the total number of orders and the total revenue for each order status.`;

    concepts.push("Aggregation", "GROUP BY");

  } else if (
    t.includes("WHERE") || t.includes("FILTER") || t.includes("IN") ||
    t.includes("LIKE") || t.includes("NULL") || t.includes("OPERATOR")
  ) {

    query = `SELECT order_id, customer_id, total_amount\n` +
            `FROM orders\nWHERE status = 'Delivered' AND total_amount > 1000;`;

    promptText = `Retrieve the order_id, customer_id, and total_amount for all 'Delivered' orders ` +
                 `WHERE the total_amount is greater than 1000.`;

    concepts.push("Filtering", "WHERE", "AND");

  } else if (t.includes("ORDER BY") || t.includes("LIMIT") || t.includes("SORT")) {

    query = `SELECT product_id, product_name, list_price\nFROM products\nORDER BY list_price DESC\nLIMIT 5;`;

    promptText = `Retrieve the product_id, product_name, and list_price of the top 5 most expensive products.`;

    concepts.push("Sorting", "ORDER BY", "LIMIT");

  } else if (t.includes("CTE") || t.includes("WITH") || t.includes("SUBQUERY") || t.includes("SUBQUERIES")) {

    query = `WITH high_value AS (\n  SELECT * FROM orders WHERE total_amount > 5000\n)\n` +
            `SELECT customer_id, COUNT(order_id) as big_orders\n` +
            `FROM high_value\nGROUP BY customer_id;`;

    promptText = `Use a CTE (or subquery) named 'high_value' to filter orders > 5000, ` +
                 `then query it to count how many big orders each customer has.`;

    concepts.push("CTE", "Subqueries");

  } else if (t.includes("UNION")) {

    query = `SELECT city, 'Customer' as source FROM customers\nUNION ALL\nSELECT 'N/A', 'Dummy' as source\nLIMIT 10;`;

    promptText = `Write a query using UNION ALL to combine cities FROM customers and a dummy row.`;

    concepts.push("UNION", "Set Operations");

  } else if (t.includes("CASE")) {

    query = `SELECT order_id, total_amount,\n` +
            `CASE WHEN total_amount > 5000 THEN 'High'\n` +
            `     WHEN total_amount > 1000 THEN 'Medium'\n` +
            `     ELSE 'Low' END as value_tier\nFROM orders;`;

    promptText = `Write a query using CASE WHEN to classify orders into 'High' (> 5000), ` +
                 `'Medium' (> 1000), and 'Low' tiers based on total_amount.`;

    concepts.push("CASE WHEN", "Conditional Logic");

  } else if (t.includes("DATE") || t.includes("STRING") || t.includes("ALIAS") || t.includes("DISTINCT")) {

    query = `SELECT DISTINCT UPPER(city) as city_upper\nFROM customers\nWHERE city LIKE 'M%';`;

    promptText = `Retrieve unique customer cities in uppercase for cities starting with 'M'. ` +
                 `Use an alias 'city_upper'.`;

    concepts.push("String Functions", "UPPER", "DISTINCT");

  } else {

    query = `SELECT customer_id, full_name, city, segment\nFROM customers\nLIMIT 10;`;

    promptText = `Write a basic SELECT query to retrieve the first 10 rows FROM the customers TABLE.`;

    concepts.push("SELECT", "LIMIT");

  }

  if (index === 1) {

    query = query.replace("LIMIT 10", "LIMIT 15").replace("LIMIT 5", "LIMIT 3");

    promptText += " (Variation B)";

  } else if (index === 2) {

    query = query.replace("DESC", "ASC");

    promptText += " (Variation C - Try sorting ascending if applicable)";

  } else if (index === 3) {

    promptText += " (Variation D)";

  } else if (index === 4) {

    promptText += " (Variation E)";

  }

  return {

    id: `m${moduleId}-p${index + 1}`,

    moduleId,

    difficulty,

    title: `${difficulty}: ${title} — Problem ${index + 1}`,

        businessScenario: `You are a Data Analyst at an Indian e-commerce company. Apply your knowledge of
      ${title} to solve this business requirement.`,

    prompt: promptText,

    starterQuery: `-- ${title} practice\n-- Goal: ${promptText}\n\nSELECT * \nFROM orders \nLIMIT 5;`,

    solution: query,

    hints: [

      `Identify the tables needed: customers, orders, or products?`,

      `Build the query step by step: FROM → WHERE → GROUP BY → SELECT.`,

      `Ensure your syntax matches the required concept: ${title}.`

    ],

        detailedExplanation: `This problem specifically targets ${title}. By analyzing the query structure,
      you can see how the SQL engine processes this logic.`,

        alternativeApproach: `For complex queries, start by selecting * to understand the raw data, then
      progressively add filters, joins, and aggregates.`,

        performanceNotes: `Filtering early with WHERE (before joins or grouping) is the #1 way to optimize
      query performance.`,

    concepts,

    companyTags: [["Google", "Amazon", "Flipkart", "Swiggy", "Zomato", "Myntra", "Uber", "CRED"][
      Math.floor(Math.random() * 8)
    ]]

  };

}

function buildProblems(moduleId: number, title: string): PracticeProblem[] {

  if (realProblems[moduleId]) {

    return realProblems[moduleId].map((p, i) => ({

      ...p,

      isEssential: i === 0,

      companyTags: p.companyTags || [["Google", "Amazon", "Flipkart", "Swiggy", "Zomato", "Myntra", "Uber", "CRED"][
        Math.floor(Math.random() * 8)
      ]]

    }));

  }

  const difficulties: Difficulty[] = ["Easy", "Easy", "Medium", "Medium", "Hard"];

  return difficulties.map((d, i) => ({

    ...buildFallbackProblem(moduleId, title, i, d),

    isEssential: i === 0

  }));

}

const moduleOutcomes: Record<number, string> = {
  1: "Understand core database concepts and write basic SELECT queries.",
  2: "Filter data using WHERE clauses to find specific records.",
  3: "Sort query outputs using ORDER BY and handle sorting orders.",
  4: "Control results size using LIMIT and remove duplicates using DISTINCT.",
  5: "Handle NULL values safely using IS NULL, IS NOT NULL, and COALESCE.",
  6: "Query text fields using string functions and LIKE wildcards.",
  7: "Match multiple criteria using IN lists and handle subquery results.",
  8: "Manipulate, format, and filter dates using date-specific functions.",
  9: "Count database records and handle NULL column values in counts.",
  10: "Sum numeric column values to calculate metrics like total revenue.",
  11: "Compute arithmetic averages and handle NULLs in average calculations.",
  12: "Find maximum and minimum values in datasets for range analysis.",
  13: "Aggregate records into groups using GROUP BY for summary stats.",
  14: "Filter aggregated groups using HAVING clauses based on metrics.",
  15: "Distinguish between WHERE (row filter) and HAVING (group filter) execution.",
  16: "Combine data from multiple tables using INNER JOINs on primary/foreign keys.",
  17: "Retrieve unmatched records from left tables using LEFT JOINs.",
  18: "Retrieve unmatched records from right tables using RIGHT JOINs.",
  19: "Perform full outer joins to inspect all records from both datasets.",
  20: "Join a table to itself using self joins for hierarchical analysis.",
  21: "Nest queries inside WHERE and FROM clauses as subqueries.",
  22: "Evaluate correlated subqueries executing once per outer query row.",
  23: "Build temporary result subsets inline using derived tables.",
  24: "Define readable, reusable query steps using Common Table Expressions (CTEs).",
  25: "Assign sequence ranks using ROW_NUMBER, RANK, and DENSE_RANK.",
  26: "Calculate sliding calculations and overview Window Functions.",
  27: "Fetch values from adjacent rows using LAG and LEAD offset functions.",
  28: "Calculate cumulative run sums and rolling moving averages over time.",
  29: "Merge query results vertically using UNION and UNION ALL operators.",
  30: "Find matching and distinct rows between sets using INTERSECT and EXCEPT.",
  31: "Implement IF-THEN branching logic using CASE WHEN expressions.",
  32: "Reshape tables using Pivot logic and bucket records using NTILE.",
  33: "Create database tables and enforce integrity constraints.",
  34: "Modify table schemas and update columns using ALTER TABLE.",
  35: "Perform data mutations using INSERT, UPDATE, and DELETE commands.",
  36: "Build virtual read-only abstraction layers using SQL Views.",
  37: "Improve read query speed using indexes and explore index types.",
  38: "Inspect database search paths and costs using EXPLAIN query plans.",
  39: "Manage concurrent data modifications safely using ACID Transactions.",
  40: "Optimize query execution speed and resolve performance bottlenecks.",
  41: "Solve complex, real-world data analyst interview patterns.",
  42: "Create and populate permanent tables in a single step using CTAS.",
  43: "Stage intermediate query results temporarily using Session Temp Tables."
};

const modulePrerequisites: Record<number, number[]> = {
  2: [1],
  3: [1, 2],
  4: [1, 2],
  5: [1, 2],
  6: [1, 2],
  7: [1, 2],
  8: [1, 2],
  9: [1],
  10: [1, 9],
  11: [1, 9, 10],
  12: [1, 9],
  13: [1, 9, 10],
  14: [13],
  15: [13, 14],
  16: [1, 13],
  17: [16],
  18: [16, 17],
  19: [16, 17],
  20: [16],
  21: [1, 16],
  22: [21],
  23: [21],
  24: [21, 23],
  25: [13, 24],
  26: [25],
  27: [25, 26],
  28: [25, 26],
  29: [1, 16],
  30: [29],
  31: [1, 2],
  32: [31],
  33: [1],
  34: [33],
  35: [33, 34],
  36: [1, 16, 33],
  37: [33, 34],
  38: [16, 37],
  39: [33, 35],
  40: [37, 38],
  41: [24, 25, 28],
  42: [33, 35],
  43: [33, 35]
};

const validateUniqueProblemIds = (modules: RoadmapModule[]) => {
  const seenIds = new Set<string>();
  const duplicates: string[] = [];
  modules.forEach((m) => {
    m.problems.forEach((p) => {
      if (seenIds.has(p.id)) {
        duplicates.push(p.id);
      }
      seenIds.add(p.id);
    });
  });
  if (duplicates.length > 0) {
    throw new Error(`[Curriculum Integrity Error] Duplicate problem IDs detected: ${duplicates.join(", ")}`);
  }
};

export const roadmapModules: RoadmapModule[] = moduleTitles.map((title, index) => {

  const id = index + 1;

  const level = getLevel(id);

  const track = tracks[index] ?? "SQL Analytics";

  const lesson = realLessons[id] ?? buildFallbackLesson(id, title, track);

  let outcome = moduleOutcomes[id];
  if (!outcome) {
    outcome = level === "Beginner"
      ? "Write clean first queries — filter, sort, and compute basic metrics."
      : level === "Intermediate"
        ? "Turn raw tables into interview-ready summaries using joins and aggregations."
        : "Solve multi-table business problems with window functions, CTEs, and optimisation.";
  }

  return {

    id,

    title,

    level,

    track,

    outcome,

    lesson,

    problems: buildProblems(id, title),

    prerequisites: modulePrerequisites[id] || [],

    isHighWeight: [17, 21, 22, 23, 24, 25, 26, 27, 28, 41].includes(id)

  };

});

export interface RoadmapDay {
  day: number;
  title: string;
  focus: string;
  modules: number[];
  mockInterview: {
    company: string;
    minutes: number;
    questions: number;
    difficulty: string;
    maxModuleId: number;
  } | null;
}

export const learningRoadmap: RoadmapDay[] = [
  { day: 1, title: "SQL Fundamentals", focus: "Databases, SELECT", modules: [1], mockInterview: null },
  { day: 2, title: "Filtering & Sorting", focus: "WHERE, ORDER BY", modules: [2, 3], mockInterview: null },
  { day: 3, title: "Result Control", focus: "LIMIT, DISTINCT", modules: [4], mockInterview: null },
  { day: 4, title: "NULL & Data Quality", focus: "NULL Handling, COALESCE", modules: [5], mockInterview: null },
  { day: 5, title: "Text & Patterns", focus: "String Functions, LIKE patterns", modules: [6], mockInterview: null },
  { day: 6, title: "IN, Sets & Dates", focus: "IN operator, Date Functions", modules: [7, 8], mockInterview: null },
  {
    day: 7,
    title: "Milestone Day",
    focus: "Blinkit Analyst Prep",
    modules: [],
    mockInterview: {
      company: "Blinkit Growth Analyst",
      minutes: 30,
      questions: 8,
      difficulty: "Beginner",
      maxModuleId: 8
    }
  },
  { day: 8, title: "Basic Metrics", focus: "COUNT, SUM", modules: [9, 10], mockInterview: null },
  { day: 9, title: "Averages & Ranges", focus: "AVG, MIN & MAX", modules: [11, 12], mockInterview: null },
  { day: 10, title: "Group summaries", focus: "GROUP BY, HAVING", modules: [13, 14], mockInterview: null },
  { day: 11, title: "Aggregation logic", focus: "HAVING vs WHERE", modules: [15], mockInterview: null },
  {
    day: 12,
    title: "Milestone Day",
    focus: "Zomato Growth Analyst Prep",
    modules: [],
    mockInterview: {
      company: "Zomato Growth Analyst",
      minutes: 40,
      questions: 20,
      difficulty: "Beginner - Intermediate",
      maxModuleId: 15
    }
  },
  { day: 13, title: "Relational Joins", focus: "Inner, Left Joins", modules: [16, 17], mockInterview: null },
  { day: 14, title: "Outer Joins", focus: "Right, Full Joins", modules: [18, 19], mockInterview: null },
  { day: 15, title: "Hierarchy Analysis", focus: "Self Joins", modules: [20], mockInterview: null },
  {
    day: 16,
    title: "Milestone Day",
    focus: "Paytm Finance Analyst Prep",
    modules: [],
    mockInterview: {
      company: "Paytm Finance Analyst",
      minutes: 45,
      questions: 20,
      difficulty: "Intermediate",
      maxModuleId: 20
    }
  },
  {
    day: 17,
    title: "Milestone Day",
    focus: "Swiggy Growth Analyst Prep",
    modules: [],
    mockInterview: {
      company: "Swiggy Business Analyst",
      minutes: 45,
      questions: 15,
      difficulty: "Intermediate",
      maxModuleId: 20
    }
  },
  { day: 18, title: "Subqueries", focus: "WHERE, Correlated subqueries", modules: [21, 22], mockInterview: null },
  { day: 19, title: "Query Architecture", focus: "Derived Tables, CTEs", modules: [23, 24], mockInterview: null },
  {
    day: 20,
    title: "Milestone Day",
    focus: "CRED Risk Analyst Prep",
    modules: [],
    mockInterview: {
      company: "CRED Risk Analyst",
      minutes: 50,
      questions: 20,
      difficulty: "Intermediate - Advanced",
      maxModuleId: 24
    }
  },
  { day: 21, title: "Window Functions 1", focus: "ROW_NUMBER, RANK", modules: [25, 26], mockInterview: null },
  { day: 22, title: "Window Functions 2", focus: "LEAD & LAG, Running Totals", modules: [27, 28], mockInterview: null },
  {
    day: 23,
    title: "Milestone Day",
    focus: "Myntra Growth Analyst Prep",
    modules: [],
    mockInterview: {
      company: "Myntra Marketing Analyst",
      minutes: 50,
      questions: 22,
      difficulty: "Advanced",
      maxModuleId: 28
    }
  },
  { day: 24, title: "Dataset operations", focus: "UNION, Set Operations", modules: [29, 30], mockInterview: null },
  {
    day: 25,
    title: "Business Analytics",
    focus: "CASE WHEN, Pivoting & NTILE",
    modules: [31, 32],
    mockInterview: null
  },
  {
    day: 26,
    title: "Milestone Day",
    focus: "Ola Mobility Analyst Prep",
    modules: [],
    mockInterview: {
      company: "Ola Mobility Analyst",
      minutes: 60,
      questions: 28,
      difficulty: "Advanced",
      maxModuleId: 32
    }
  },
  { day: 27, title: "Database Foundations", focus: "CREATE, ALTER TABLE", modules: [33, 34], mockInterview: null },
  {
    day: 28,
    title: "Milestone Day",
    focus: "Walmart Supply Chain Prep",
    modules: [],
    mockInterview: {
      company: "Walmart Supply Chain Analyst",
      minutes: 50,
      questions: 20,
      difficulty: "Intermediate → Advanced",
      maxModuleId: 32
    }
  },
  { day: 29, title: "Data Manipulation & Views", focus: "DML commands, Views", modules: [35, 36], mockInterview: null },
  { day: 30, title: "Table Creation From Queries", focus: "CTAS syntax & tables", modules: [42], mockInterview: null },
  {
    day: 31,
    title: "Milestone Day",
    focus: "Uber Rides Analyst Prep",
    modules: [],
    mockInterview: {
      company: "Uber Rides Analyst",
      minutes: 55,
      questions: 22,
      difficulty: "Advanced",
      maxModuleId: 36
    }
  },
  {
    day: 32,
    title: "Staging Data with Temp Tables",
    focus: "Temporary tables & query flow",
    modules: [43],
    mockInterview: null
  },
  {
    day: 33,
    title: "Performance & Execution Plans",
    focus: "Indexes, EXPLAIN plan",
    modules: [37, 38],
    mockInterview: null
  },
  {
    day: 34,
    title: "Transactions & Tuning",
    focus: "Transactions, Query optimization",
    modules: [39, 40],
    mockInterview: null
  },
  {
    day: 35,
    title: "Interview Pattern Library",
    focus: "Common SQL interview patterns",
    modules: [41],
    mockInterview: null
  },
  {
    day: 36,
    title: "Milestone Day",
    focus: "Netflix Streaming Analyst Prep",
    modules: [],
    mockInterview: {
      company: "Netflix Streaming Analyst",
      minutes: 60,
      questions: 25,
      difficulty: "Advanced → Expert",
      maxModuleId: 41
    }
  },
  {
    day: 37,
    title: "Milestone Day",
    focus: "Stripe Financial Analyst Prep",
    modules: [],
    mockInterview: {
      company: "Stripe Financial Analyst",
      minutes: 60,
      questions: 12,
      difficulty: "Expert",
      maxModuleId: 43
    }
  },
  {
    day: 38,
    title: "Final Milestone Day",
    focus: "Google Performance Engineer Prep",
    modules: [],
    mockInterview: {
      company: "Google Performance Engineer",
      minutes: 60,
      questions: 12,
      difficulty: "Expert",
      maxModuleId: 43
    }
  }
];

export interface MockInterview {

  company: string;

  minutes: number;

  questions: number;

  difficulty: string;

  focus: string;

  maxModuleId: number;

}

export const mockInterviews: MockInterview[] = [

  {
    company: "Blinkit Growth Analyst",
    minutes: 30,
    questions: 8,
    difficulty: "Beginner",
    focus: "Basic retrieval, WHERE, ORDER BY, LIMIT, DISTINCT, LIKE, IN",
    maxModuleId: 8
  },

  {
    company: "Zomato Growth Analyst",
    minutes: 40,
    questions: 20,
    difficulty: "Beginner → Intermediate",
    focus: "Restaurant ratings, delivery times, aggregations, GROUP BY, HAVING",
    maxModuleId: 15
  },

  {
    company: "Paytm Finance Analyst",
    minutes: 45,
    questions: 20,
    difficulty: "Intermediate",
    focus: "Financial summaries, joins, self joins, CASE WHEN, and aggregations",
    maxModuleId: 20
  },

  {
    company: "Swiggy Business Analyst",
    minutes: 45,
    questions: 15,
    difficulty: "Intermediate",
    focus: "Delivery cohorts, SLA breaches, relational joins, and retention stats",
    maxModuleId: 20
  },

  {
    company: "CRED Risk Analyst",
    minutes: 50,
    questions: 20,
    difficulty: "Intermediate → Advanced",
    focus: "Subqueries, CTE chains, transaction audits, and complex metrics",
    maxModuleId: 24
  },

  {
    company: "Myntra Marketing Analyst",
    minutes: 50,
    questions: 22,
    difficulty: "Advanced",
    focus: "Campaign performance, user ranking, LAG/LEAD, cohort retention",
    maxModuleId: 28
  },

  {
    company: "Ola Mobility Analyst",
    minutes: 60,
    questions: 28,
    difficulty: "Advanced",
    focus: "Ride statistics, running totals, Union operations, set differences",
    maxModuleId: 32
  },

  {
    company: "Google Performance Engineer",
    minutes: 60,
    questions: 12,
    difficulty: "Expert",
    focus: "DDL/DML transactions, EXPLAIN execution plans, CTAS performance, tuning",
    maxModuleId: 43
  },

  {
    company: "Walmart Supply Chain Analyst",
    minutes: 50,
    questions: 20,
    difficulty: "Intermediate → Advanced",
    focus: "Retail KPIs, inventories, replenishment rate, cumulative sales",
    maxModuleId: 32
  },

  {
    company: "Uber Rides Analyst",
    minutes: 55,
    questions: 22,
    difficulty: "Advanced",
    focus: "Dynamic pricing, supply-demand matching, spatial surge metrics, partition logic",
    maxModuleId: 36
  },

  {
    company: "Netflix Streaming Analyst",
    minutes: 60,
    questions: 25,
    difficulty: "Advanced → Expert",
    focus: "User engagement, retention curves, content performance ranks, LEAD/LAG watch trends",
    maxModuleId: 41
  },

  {
    company: "Stripe Financial Analyst",
    minutes: 60,
    questions: 12,
    difficulty: "Expert",
    focus: "Fraud detection, rolling 30-day merchant volume, ledger aggregation, index performance",
    maxModuleId: 43
  }

];

export const interviewQuestionBank = [
{

    category: "Fundamentals",

    question: "What is the difference between WHERE and HAVING?",

        answer: "WHERE filters individual rows before grouping. HAVING filters groups after " +
                "aggregation. You cannot use aggregate functions in WHERE.",

    followUp: "Write a query that uses both WHERE and HAVING in the same statement.",

        mistake: "Using HAVING for simple row filters — it works but forces the database to group " +
                 "all rows first, which is slower than WHERE."

  },

{

    category: "Fundamentals",

    question: "In what order does SQL logically execute a query?",

        answer: "FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT. " +
                "This is why you cannot use a SELECT alias in WHERE.",

    followUp: "Can you use a SELECT alias in ORDER BY? Why?",

    mistake: "Writing queries in the order you think them (SELECT first) without understanding execution order."

  },

{

    category: "Aggregation",

    question: "What is the difference between COUNT(*), COUNT(col), and COUNT(DISTINCT col)?",

        answer: "COUNT(*) = all rows including NULLs. COUNT(col) = non-NULL values in col. " +
                "COUNT(DISTINCT col) = unique non-NULL values.",

    followUp: "A customer placed 3 orders. How would each COUNT behave?",

    mistake: "Assuming COUNT(*) and COUNT(primary_key) are always equal — they are, but COUNT(nullable_col) can differ."

  },

{

    category: "Aggregation",

    question: "How do you calculate AOV (Average Order Value)?",

        answer: "AOV = SUM(total_amount - discount_amount) / COUNT(DISTINCT order_id) on " +
                "delivered orders only. Do NOT use AVG(total_amount) — that gives gross value " +
                "before discounts.",

    followUp: "How would AOV change if you forgot to filter for delivered orders?",

    mistake: "Using AVG(total_amount) which includes cancelled/returned orders and ignores discounts."

  },

{

    category: "JOINs",

    question: "What is the difference between INNER JOIN and LEFT JOIN?",

        answer: "INNER JOIN returns only matching rows from both tables. LEFT JOIN returns all " +
                "rows from the left table plus matching rows from the right; non-matching right " +
                "rows appear as NULL.",

    followUp: "How do you find customers who have never placed an order?",

    mistake: "Using INNER JOIN when you need to include all rows from one table — causes silent data loss."

  },

{

    category: "JOINs",

    question: "How do you find customers with no orders?",

        answer: "LEFT JOIN customers to orders ON customer_id. Then filter WHERE orders.order_id " +
                "IS NULL. This is the anti-join pattern.",

    followUp: "Could you solve this with a subquery instead of a LEFT JOIN?",

        mistake: "Putting a WHERE filter on the right table's column (not IS NULL check) — this " +
                 "converts LEFT JOIN to INNER JOIN."

  },

{

    category: "Window Functions",

    question: "What is the difference between GROUP BY and window functions?",

        answer: "GROUP BY collapses rows into one row per group. Window functions add a " +
                "calculated value to each row WITHOUT collapsing them. The row count is preserved " +
                "with window functions.",

    followUp: "Write a query to rank each customer by their lifetime value.",

        mistake: "Trying to use a window function result in a WHERE clause in the same query — " +
                 "must wrap in CTE or subquery."

  },

{

    category: "Window Functions",

    question: "What is the difference between RANK, DENSE_RANK, and ROW_NUMBER?",

        answer: "ROW_NUMBER: always unique (1,2,3,4). RANK: tied rows get same rank with gaps " +
                "(1,1,3). DENSE_RANK: tied rows get same rank without gaps (1,1,2).",

        followUp: "If two products have the same revenue, which function gives you exactly 3 " +
                  "results when you filter to top 3?",

    mistake: "Using ROW_NUMBER when ties should share a rank — or RANK when you need exactly N results."

  },

{

    category: "NULL Handling",

    question: "Why does WHERE col = NULL return no rows?",

        answer: "NULL is unknown. Comparing anything to NULL with = returns NULL (not TRUE). You " +
                "must use IS NULL or IS NOT NULL.",

    followUp: "What does COALESCE do and when would you use it?",

    mistake: "Writing WHERE discount_amount = NULL — returns 0 rows every time."

  },

{

    category: "CTEs",

    question: "When would you use a CTE instead of a subquery?",

        answer: "Use CTEs when: (1) the same subquery is referenced more than once, (2) the " +
                "logic has 3+ nesting levels, (3) you want named steps for readability and " +
                "debugging.",

    followUp: "Can a CTE reference another CTE defined before it in the same WITH block?",

    mistake: "Using deeply nested subqueries that are hard to debug — CTEs make each step independently testable."

  },

{

    category: "Business SQL",

    question: "How would you calculate month-over-month revenue growth?",

        answer: "Use LAG(revenue, 1) OVER (ORDER BY month) to get previous month's revenue. " +
                "Then: (current - previous) / previous * 100 for growth %. Use a CTE to first " +
                "aggregate monthly revenue.",

    followUp: "How would you handle the first month where LAG returns NULL?",

    mistake: "Dividing by LAG without NULLIF protection — causes a division by zero error on the first month."

  },

{

    category: "Business SQL",

    question: "How do you identify churned customers in SQL?",

        answer: "Find customers whose MAX(order_date) is more than N days ago (e.g., 90 days) " +
                "using JULIANDAY('now') - JULIANDAY(MAX(order_date)) > 90 in a GROUP BY query.",

    followUp: "How would you calculate the churn rate as a percentage?",

        mistake: "Not filtering by order status — including cancelled orders makes a customer " +
                 "appear active when they are not."

  },

{

    category: "Fundamentals",

    question: "What is the difference between DELETE, TRUNCATE, and DROP?",

        answer: "DELETE removes specific rows (can use WHERE, can rollback). TRUNCATE removes " +
                "all rows fast (cannot rollback, resets auto-increment). DROP removes the entire " +
                "table and its structure. For DA interviews, knowing these shows DDL awareness.",

    followUp: "If you accidentally deleted the wrong rows, how would you recover them?",

    mistake: "Using DROP when you only wanted to clear data — you'd lose the table structure entirely."

  },

{

    category: "Fundamentals",

    question: "What is the difference between a PRIMARY KEY and a FOREIGN KEY?",

        answer: "PRIMARY KEY uniquely identifies each row in its own table. FOREIGN KEY is a " +
                "column that references the PRIMARY KEY of another table — it creates the " +
                "relationship between tables. An order's customer_id (FK) references " +
                "customers.customer_id (PK).",

        followUp: "What happens if you try to insert an order with a customer_id that doesn't " +
                  "exist in the customers table?",

    mistake: "Confusing PK and FK — the PK is in the parent table, the FK is in the child table."

  },

{

    category: "JOINs",

    question: "What happens if you JOIN on a column that has duplicate values?",

        answer: "Each row from table A matches with EVERY row from table B that has the same " +
                "value — creating a multiplicative result (fan-out). If a customer has 5 orders " +
                "and you join on customer_id, each customer attribute is repeated 5 times. Always " +
                "verify row count before and after a join.",

    followUp: "How would you detect and handle duplicate join keys?",

    mistake: "Not checking for duplicates before joining — causes inflated aggregates (double/triple-counting)."

  },

{

    category: "JOINs",

    question: "What is a SELF JOIN and when would you use it?",

        answer: "A SELF JOIN joins a table to itself using two different aliases. Most common " +
                "use: employee-manager hierarchy where manager_id references employee_id in the " +
                "same table. Always use LEFT JOIN for hierarchies (top-level managers have NULL " +
                "manager_id).",

    followUp: "Write a query showing each employee's name and their manager's name.",

    mistake: "Using INNER JOIN in a SELF JOIN for a hierarchy — this excludes top-level managers who have no manager."

  },

{

    category: "Aggregation",

    question: "What is the difference between SUM and COUNT? When would you use each?",

        answer: "COUNT counts rows (or non-null values). SUM adds numeric values. COUNT(*) = how " +
                "many orders. SUM(amount) = total revenue. Both ignore NULLs except COUNT(*). " +
                "Common mistake: using COUNT(amount) when you want SUM(amount) — COUNT gives the " +
                "number of rows with a non-null amount, not the total value.",

    followUp: "How would you count orders AND sum revenue in the same query?",

    mistake: "Using COUNT(amount) thinking it returns the total value — it counts non-null rows."

  },

{

    category: "Aggregation",

    question: "How do you handle NULL values in SUM and AVG?",

        answer: "Both SUM and AVG ignore NULLs automatically. AVG([100, NULL, 200]) = 150 (not " +
                "100). If you want NULLs treated as 0: COALESCE(col, 0) before aggregating. For " +
                "percentages, this matters: SUM(COALESCE(discount, 0)) / SUM(total) gives true " +
                "discount rate including zero-discount orders.",

    followUp: "What is COALESCE and how is it different from IFNULL?",

    mistake: "Assuming AVG skips NULLs from both numerator and denominator — it does, which can be misleading."

  },

{

    category: "Window Functions",

    question: "What is PARTITION BY in a window function?",

        answer: "PARTITION BY divides rows into groups for the window function — similar to " +
                "GROUP BY but without collapsing rows. Each partition gets its own window. " +
                "Example: RANK() OVER (PARTITION BY city ORDER BY revenue DESC) assigns ranks " +
                "independently within each city. Without PARTITION BY, the window spans the " +
                "entire result set.",

    followUp: "What is the difference between PARTITION BY and GROUP BY?",

    mistake: "Confusing PARTITION BY (preserves all rows) with GROUP BY (collapses rows into one per group)."

  },

{

    category: "Window Functions",

    question: "What is a running total and how do you compute it in SQL?",

        answer: "A running total (cumulative sum) adds each row's value to all previous rows. In " +
                "SQL: SUM(col) OVER (ORDER BY date). The ORDER BY in OVER defines the running " +
                "direction. ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW is the default " +
                "frame.",

    followUp: "How would you compute a 7-day moving average?",

    mistake: "Using SUM() OVER () (no ORDER BY) which computes the grand total on every row, not a running total."

  },

{

    category: "NULL Handling",

    question: "What does NULLIF do and when would you use it?",

        answer: "NULLIF(a, b) returns NULL if a equals b, otherwise returns a. Most common use: " +
                "prevent division by zero. NULLIF(denominator, 0) returns NULL when the " +
                "denominator is 0, making the division return NULL instead of an error. Better " +
                "than a CASE WHEN for this specific case.",

    followUp: "How is NULLIF different from COALESCE?",

        mistake: "Dividing by a column without NULLIF protection — causes a division by zero " +
                 "error when the denominator is 0."

  },

{

    category: "CTEs",

    question: "Can a CTE reference another CTE defined in the same WITH block?",

        answer: "Yes. In a WITH block, each CTE can reference all CTEs defined before it in the " +
                "same block. Example: WITH a AS (...), b AS (SELECT * FROM a WHERE ...) — b can " +
                "reference a. This enables step-by-step query building.",

    followUp: "What is the difference between a CTE and a VIEW?",

    mistake: "Defining CTEs in the wrong order — you cannot reference a CTE that is defined after the current one."

  },

{

    category: "Business SQL",

    question: "How would you find the top-N products per category in SQL?",

        answer: "Use the two-CTE pattern: (1) aggregate revenue per product+category, (2) apply " +
                "ROW_NUMBER() OVER (PARTITION BY category ORDER BY revenue DESC), (3) in the " +
                "outer query, WHERE rn <= N. Use ROW_NUMBER for exactly N per category. Use RANK " +
                "if ties should get the same rank.",

    followUp: "What changes if you want top-N allowing ties?",

    mistake: "Trying to filter WHERE ROW_NUMBER() <= N in the same SELECT — you must wrap it in a CTE or subquery."

  },

{

    category: "Business SQL",

    question: "What is a cohort analysis and how would you implement it in SQL?",

        answer: "Cohort analysis groups users by a defining event (e.g., signup month) and " +
                "tracks their behaviour over time. SQL approach: (1) Find each user's cohort " +
                "month (MIN(signup_date)), (2) For each transaction, compute 'months since " +
                "signup', (3) GROUP BY cohort + months_since to compute retention or revenue per " +
                "cohort-period.",

    followUp: "How would you calculate the 1-month retention rate?",

        mistake: "Not anchoring to the cohort month — comparing absolute months instead of " +
                 "relative months since the defining event."

  },

  {
    category: "Fundamentals",
        question: "Why does SELECT * FROM customers WHERE customer_id NOT IN (SELECT customer_id " +
                  "FROM orders) return zero rows if even a single order has a NULL customer_id?",
        answer: "In SQL, x NOT IN (a, b, NULL) evaluates as x != a AND x != b AND x != NULL. " +
                "Because any comparison to NULL results in UNKNOWN, the entire condition " +
                "evaluates to UNKNOWN, causing the filter to reject all rows. To prevent this " +
                "NULL trap, use NOT EXISTS or filter out NULLs in the subquery: WHERE customer_id " +
                "IS NOT NULL.",
    followUp: "Does the IN operator suffer from the same NULL trap? Why?",
        mistake: "Using NOT IN with a subquery on a column that can contain NULLs, resulting in " +
                 "an unexpectedly empty result set."
  },

  {
    category: "Performance",
        question: "What does it mean for a query to be SARGable, and why does writing WHERE " +
                  "YEAR(order_date) = 2026 cause performance issues?",
        answer: "SARGable stands for Search Argument Able. A query is SARGable if the database " +
                "engine can utilize an index to find rows. Using functions like YEAR(order_date) " +
                "on a column in the WHERE clause prevents index usage (index suppression) because " +
                "the database must evaluate the function for every single row (full table scan). " +
                "Instead, write: WHERE order_date >= '2026-01-01' AND order_date < '2027-01-01' " +
                "to enable index range scans.",
    followUp: "How does index usage change when using LIKE '%suffix' vs LIKE 'prefix%'?",
        mistake: "Wrapping index columns in functions (like DATE, LOWER, or UPPER) inside the " +
                 "WHERE clause, which completely disables database indexes."
  },

  {
    category: "Aggregation",
        question: "Does GROUP BY include NULL values, and how does COUNT(*) behave compared to " +
                  "COUNT(column) when a group is all NULL?",
        answer: "Yes, GROUP BY treats all NULL values as a single group. If you GROUP BY a " +
                "column containing NULLs, a group for NULL will appear in the result set. In that " +
                "NULL group, COUNT(*) will count the number of rows in the group, whereas " +
                "COUNT(column_name) will return 0 because it ignores NULLs.",
    followUp: "What does SUM(column) return if all values in the column (or a group) are NULL?",
    mistake: "Assuming NULL values are excluded from GROUP BY results, or that COUNT(column) counts the NULL rows."
  },

  {
    category: "JOINs",
        question: "How do you find the status change events for a customer (e.g., from 'Pending' " +
                  "to 'Active') when the history is stored as chronological log rows?",
        answer: "You can solve this using either a Self-Join or LEAD/LAG window functions. The " +
                "LEAD/LAG approach is cleaner and faster: use LAG(status) OVER (PARTITION BY " +
                "customer_id ORDER BY log_date) to fetch the previous status on each row, then " +
                "wrap this in a CTE and query where status != prev_status to find the exact " +
                "transitions.",
    followUp: "How would you write this using a Self-Join if window functions were not supported?",
        mistake: "Trying to do WHERE status != status or doing simple joins without sorting or " +
                 "partitioning keys, leading to random row matchups."
  },

  {
    category: "Database Design",
        question: "When should you choose a Temporary Table over a Common Table Expression (CTE) " +
                  "in a complex analytics pipeline?",
        answer: "Use a CTE for single-query readability and simple recursion. Choose a Temporary " +
                "Table when: (1) You need to reference the intermediate dataset multiple times " +
                "across separate queries (avoiding recalculation), (2) The intermediate dataset " +
                "is very large and needs an index created on it for downstream join performance, " +
                "or (3) You need to perform update/delete mutations on the staged data.",
    followUp: "Do temporary tables persist on disk, and who can see them?",
        mistake: "Using a CTE multiple times in the same query thinking it caches the result — " +
                 "most database engines re-run the CTE query every time it is referenced, whereas " +
                 "a temp table is materialized once."
  }
];


validateUniqueProblemIds(roadmapModules);
