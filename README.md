# SQL Analyst Academy

SQL Analyst Academy is a lightweight, browser-based learning application for practicing SQL queries using real-world business datasets. It runs entirely on client-side WebAssembly using SQLite (`sql.js`), so you can write, test, and debug queries offline without needing to set up a database server.

---

## What's Inside

- **43 Guided Modules**: Starts with basic `SELECT` and `WHERE` filters, moving up to CTEs, window functions (`ROW_NUMBER`, `RANK`, `LAG/LEAD`), conditional aggregates, and schema management.
- **Interactive ERD & Schema Profiler**: Clickable schema diagrams and column distributions to inspect table relationships and data types.
- **Visual Query Planner**: Bottom-up query execution tree showing full table scans, index searches, and operator costs.
- **Side-by-Side Performance Comparison**: Compare two SQL queries to evaluate execution speed, result matching, and relative query efficiency.
- **Mock Interviews**: Timed assessment sessions modeled after real data analyst interview sets (e.g. Swiggy, Zomato, Paytm, Google, Stripe).
- **Offline PWA Support**: Caches static assets and the WebAssembly database engine so the app works seamlessly without an internet connection.
- **CSV & JSON Export**: Export query results directly to CSV or JSON with a single click.

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Database Engine**: SQLite via WebAssembly (`sql.js`)
- **Code Editor**: Monaco Editor (VS Code core)
- **Icons & Styling**: Lucide React, Vanilla CSS with custom tokens

---

## Getting Started

### Quick Start (Windows)
Double-click `run-locally.bat` in the project root. It will install missing packages (if needed) and launch the app in your default browser.

### Manual Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/karthikeyatether/sql-analyst-academy.git
   cd sql-analyst-academy
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser.

---

## Testing & Validation

To validate that all practice problems and debug puzzle solutions execute correctly against the database engine, run:

```bash
node --import tsx testRunner.ts
```

To create a production build:

```bash
npm run build
```

---

## License

MIT License. Free for educational and personal use.
