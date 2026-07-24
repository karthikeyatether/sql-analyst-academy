# ⚡ SQL Analyst Academy

> **An Interactive, Browser-Based SQL Learning & Technical Interview Preparation Platform for Data Analysts.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![SQLite WASM](https://img.shields.io/badge/SQLite-WASM_3.39+-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tests](https://img.shields.io/badge/SQL_Validation-202%2F202_Passing-10B981?style=flat-square)](https://github.com/karthikeyatether/sql-analyst-academy)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

---

## 🌟 Overview

**SQL Analyst Academy** is an offline-first, client-side web application built to help aspiring Data Analysts master practical SQL through real-world Indian business scenarios (E-Commerce, FinTech, Quick-Commerce, Logistics).

It runs **100% in-browser** using **SQLite compiled to WebAssembly (`sql.js`)** — requiring zero database installation, zero server setup, and zero cloud API credentials.

---

## ✨ Key Features

### 📚 43 Learning Modules & 202 Execution Challenges
- **142 SQL Practice Problems**: From fundamental `SELECT` & `WHERE` clauses to CTEs, Window Functions (`ROW_NUMBER`, `RANK`, `DENSE_RANK`, `LAG`/`LEAD`), `CASE WHEN`, `GROUP BY`, `HAVING`, `CTAS`, and Temporary Tables.
- **60 Interactive Debug Puzzles**: Identify and fix buggy SQL queries (SQL Anti-patterns, NOT IN NULL traps, implicit cartesian joins, window frame errors).

### 🎯 Company-Specific Mock Interview Simulators
- Timed 30 to 60 minute technical interview environments styled after real Data Analyst hiring rounds at **Blinkit**, **Zomato**, **Paytm**, **Swiggy**, **CRED**, **Myntra**, and **Flipkart**.

### 🔍 Execution Plan Visualizer & A/B Query Profiler
- **Visual EXPLAIN Plans**: Inspect physical execution trees, full table scans vs. index searches, and relative cost metrics.
- **A/B Performance Benchmarker**: Compare two SQL queries side-by-side to evaluate execution speed and verify output row equality.

### 🔒 Built-In Anti-Cheat & Dynamic Quality Signals
- **Anti-Cheat Grader**: Detects and rejects hardcoded projection values matching expected answers when queries do not dynamically compute results from table data.
- **SM-2 Spaced Repetition Engine**: Calculates optimal review intervals based on hint usage and first-attempt correctness.

---

## 📊 Business Datasets & Schema

The platform seeds 9 realistic relational tables:

| Table Name | Description | Key Columns |
| :--- | :--- | :--- |
| `customers` | E-Commerce customer profiles | `customer_id`, `full_name`, `city`, `region`, `signup_date`, `segment`, `metadata` (JSON) |
| `orders` | Order transaction records | `order_id`, `customer_id`, `order_date`, `channel`, `status`, `total_amount`, `discount_amount` |
| `order_items` | Line items per order | `order_item_id`, `order_id`, `product_id`, `quantity`, `unit_price` |
| `products` | Product catalog | `product_id`, `product_name`, `category`, `sub_category`, `brand`, `list_price`, `cost_price` |
| `payments` | Payment transaction audit logs | `payment_id`, `order_id`, `payment_date`, `payment_method`, `payment_status`, `amount` |
| `subscriptions` | SaaS subscription plans | `subscription_id`, `customer_id`, `plan_name`, `start_date`, `end_date`, `status`, `monthly_fee` |

---

## 🚀 Quick Start

### Windows (Instant Startup)
Double-click `run-locally.bat` or the **SQL Analyst Academy** Desktop shortcut. It launches the production preview server instantly at `http://127.0.0.1:4173`.

### Manual Developer Setup
```bash
# Clone the repository
git clone https://github.com/karthikeyatether/sql-analyst-academy.git
cd sql-analyst-academy

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://127.0.0.1:5173` in your browser.

---

## 🧪 Verification & Build Commands

### Run Automated SQL Test Suite (202 Queries)
```bash
node --import tsx testRunner.ts
```

### Production Build
```bash
npm run build
```

---

## 📖 Complete Study Roadmap

All study guides, day-wise watch trackers, and curriculum inventories are consolidated in the [`docs/`](docs/) directory:
- 📄 **[docs/DA_COMPLETE_STUDY_ROADMAP.docx](docs/DA_COMPLETE_STUDY_ROADMAP.docx)**: 30-Day Day-Wise Study Plan & Milestone Exam Schedule.
- 📄 **[docs/DA_COMPLETE_STUDY_ROADMAP.md](docs/DA_COMPLETE_STUDY_ROADMAP.md)**: Markdown Study Roadmap.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.
