# ⚡ SQL Analyst Academy

> **A modern, offline-first SQL learning platform, interactive playground, and technical interview preparation workspace for Data Analysts.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![SQLite WASM](https://img.shields.io/badge/SQLite-WASM_3.39+-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tests](https://img.shields.io/badge/SQL_Validation-215%2F215_Passing-10B981?style=flat-square)](https://github.com/karthikeyatether/sql-analyst-academy)
[![CI](https://github.com/karthikeyatether/sql-analyst-academy/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/karthikeyatether/sql-analyst-academy/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

---

## 🎯 Overview

**SQL Analyst Academy** is an interactive, client-side SQL mastery workspace engineered specifically for Data Analysts and Analytics Engineers. Powered by **SQLite compiled to WebAssembly** running in a dedicated Web Worker thread, it executes queries completely offline with zero backend server overhead, zero database setup, and zero API costs.

Practice real-world data analytics queries using authentic relational business datasets modeled after top Tech, E-Commerce, FinTech, and Logistics companies.

---

## 🚀 Key Features

### 📚 30-Day Curriculum · 201 Interactive Challenges (215 Test Verifications)
- **141 Practice Problems**: Step-by-step SQL exercises spanning `SELECT`, `WHERE`, `GROUP BY`, `HAVING`, `JOINs`, Subqueries, CTEs, Window Functions (`ROW_NUMBER`, `RANK`, `DENSE_RANK`, `LAG`/`LEAD`), `CASE WHEN`, and Conditional Aggregations.
- **60 Debug Puzzles**: Real-world buggy queries featuring NULL traps, implicit Cartesian products, window frame misconfigurations, and syntax anti-patterns.
- **215 Automated Test Checks**: Continuous test suite validating solution correctness, RFC 4180 CSV parser compliance, transaction rollback, and schema integrity.

### ⚡ Off-Main-Thread SQL Execution (Web Worker Architecture)
- **Web Worker Offloading**: All SQL queries, execution plan generations, and CSV imports execute in an isolated Web Worker, keeping the main UI thread 60fps responsive.
- **Deferred Engine Initialization**: WebAssembly (`sql.js`) loads on demand only when interactive SQL views mount.

### 💡 100% Progressive 3-Step Hint System
Every problem in the academy includes 3 progressive hints (**collapsed by default**):
1. **Hint 1**: Analytical objective & target table/column overview.
2. **Hint 2**: Clause-level guidance (`WHERE`, `JOIN`, `GROUP BY`, `HAVING`, Windowing).
3. **Hint 3**: Query pattern & structural template.

### 🔍 Enforced Required Column Alias Verification
- Automatically validates that user expressions use explicit aliases requested in problem prompts (e.g. `AS upper_name`).
- Generates clear diagnostic feedback (`Missing Required Column Alias: Your query returned 'upper(full_name)'. You must alias it as 'upper_name'`).

### ⌨️ Monaco Code Editor & Multi-Cursor Editing
- **VS Code Editor**: Full Monaco editor experience with syntax highlighting, auto-formatting, and error detection.
- **Multi-Cursor (`Alt` + Click)**: Hold `Alt` and click anywhere to place multiple typing cursors simultaneously.
- **Visual EXPLAIN Query Plans**: Inspect query costs, index scans, and execution trees.
- **RFC 4180 CSV Import Engine**: Import custom CSV files with automatic multi-row type inference and batch seeding.

### 🏢 Company Mock Interview Simulators
Timed interview practice sessions tailored after real Data Analyst technical rounds at **Blinkit**, **Zomato**, **Paytm**, **Swiggy**, **CRED**, **Myntra**, and **Flipkart**.

---

## 📊 Business Datasets

The platform seeds 9 relational tables into an in-memory SQLite instance:

| Table | Description | Key Columns |
| :--- | :--- | :--- |
| `customers` | Customer profiles & segments | `customer_id`, `city`, `region`, `signup_date`, `segment` |
| `orders` | Transaction records | `order_id`, `customer_id`, `order_date`, `channel`, `status`, `total_amount` |
| `order_items` | Line items per order | `order_item_id`, `order_id`, `product_id`, `quantity`, `unit_price` |
| `products` | Product catalog | `product_id`, `product_name`, `category`, `brand`, `list_price`, `cost_price` |
| `payments` | Audit logs for payments | `payment_id`, `order_id`, `payment_method`, `payment_status`, `amount` |
| `subscriptions` | SaaS subscription data | `subscription_id`, `customer_id`, `plan_name`, `start_date`, `end_date`, `monthly_fee` |

---

## 🛠️ Installation & Running Locally

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### Step 1: Clone Repository
```bash
git clone https://github.com/karthikeyatether/sql-analyst-academy.git
cd sql-analyst-academy
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Launch Local Application

#### Option A: Development Server (Vite)
```bash
npm run dev
```
Open **`http://localhost:5173`** in your browser.

#### Option B: Fast Production Server (Brotli / Gzip Pre-Compressed)
```bash
npm run build:fast
node serve-dist.cjs
```
Open **`http://localhost:4173`** in your browser.

#### Option C: One-Click Windows Launcher
Double-click **`run-locally.bat`** in the project root directory.

---

## 🧪 Testing & Verification

Run the automated test runner to validate all 215 curriculum problems and system checks:

```bash
npm test
```

Run linting and format verification:
```bash
npm run lint         # ESLint check
npm run format:check # Prettier formatting check
npm run test:e2e     # Playwright E2E tests
```

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.
