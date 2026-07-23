# SQL Analyst Academy

SQL Analyst Academy is a browser-based tool I built to practice SQL queries using realistic Indian business datasets. It runs locally in the browser using SQLite compiled to WebAssembly (`sql.js`), so there's no need to install or configure any database server.

## Features

- **43 Learning Modules**: Covers everything from basic `SELECT` and `WHERE` clauses up to CTEs, window functions (`ROW_NUMBER`, `RANK`, `LAG/LEAD`), conditional logic, and schema DDL/DML.
- **Interactive ERD & Schema Explorer**: Clickable schema diagrams and column metrics to inspect table structures.
- **Query Plan Visualizer**: Shows bottom-up execution flow, scan types (full table scan vs index search), and estimated query costs.
- **Side-by-Side Performance Comparison**: Benchmark two queries side-by-side to check relative execution time and output matching.
- **Mock Interviews**: Timed practice sets styled after actual data analyst technical rounds (Swiggy, Zomato, Paytm, Google, Stripe).
- **Offline Support**: Caches static assets and the WASM engine so you can use the app offline.
- **Results Export**: One-click CSV and JSON exports for query results.

## Stack

- **Frontend**: React 18, TypeScript, Vite
- **Database**: SQLite via WebAssembly (`sql.js`)
- **Editor**: Monaco Editor
- **Icons & Styling**: Lucide React, Vanilla CSS

## Running Locally

### Windows (Quick Start)
Just double-click `run-locally.bat`. It handles dependency installation if needed and opens the app in your default browser.

### Manual Setup
```bash
# Clone the repo
git clone https://github.com/karthikeyatether/sql-analyst-academy.git
cd sql-analyst-academy

# Install packages
npm install

# Start local server
npm run dev
```

Then open `http://localhost:5173`.

## Verification

To run the automated SQL query test suite:
```bash
node --import tsx testRunner.ts
```

For production builds:
```bash
npm run build
```

## License

MIT
