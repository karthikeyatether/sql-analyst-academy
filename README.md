# SQL Analyst Academy

> An offline-first SQL learning platform and interview practice workspace for data analysts and analytics engineers.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![SQLite WASM](https://img.shields.io/badge/SQLite-WASM-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sql.js.org/)
[![Tests](https://img.shields.io/badge/tests-313%20passing-10B981?style=flat-square)](#verification)

## Why this project

SQL Analyst Academy provides a SQL learning platform and interactive query environment. Learners write and run queries against business datasets, inspect execution plans, debug intentionally flawed SQL, and practice timed analytics interviews—all in the browser with no backend database or account required.

The architecture implements: Web Worker isolation, WebAssembly-based data execution, lazy route loading, defensive storage, automated correctness checks, and an offline-capable application shell.

## What it includes

- **201 interactive challenges:** 141 guided SQL problems and 60 debugging puzzles.
- **Realistic analytics data:** customers, orders, products, payments, subscriptions, and related relational tables.
- **Progressive feedback:** three-level hints, required-alias checks, query grading, and actionable diagnostics.
- **SQL playground:** Monaco editor, keyboard execution, CSV import, schema browsing, and visual `EXPLAIN` plans.
- **Interview practice:** timed mock sessions based on common data-analyst interview patterns.
- **Offline-first execution:** SQLite compiled to WebAssembly and executed in a dedicated Web Worker.
- **Responsive runtime:** query cancellation, request timeouts, worker recovery, and safe sandbox execution.

## Engineering highlights

| Area         | Implementation                                                                |
| ------------ | ----------------------------------------------------------------------------- |
| UI           | React 18, TypeScript, Lucide icons, Monaco Editor                             |
| Build        | Vite with route-level chunks and compressed production assets                 |
| Query engine | `sql.js` / SQLite WebAssembly in a Web Worker                                 |
| Data safety  | Sandboxed practice execution with rollback and transaction-control protection |
| Quality      | TypeScript, ESLint, Prettier, Knip, Playwright, domain-specific test runner   |
| Delivery     | PWA service worker, offline app shell, Vite production preview                |

## Architecture

```text
React application
       |
       +-- lazy learning views and interview flows
       |
       +-- SQL engine client --------------------+
                                                  |
                                      SQL Web Worker
                                                  |
                                      SQLite WASM database
```

Interactive SQL execution is isolated from the main UI thread. The client manages request IDs, timeouts, cancellation, worker recovery, and result snapshots for robust error handling.

## Run locally

### Requirements

- Node.js 18 or newer
- npm 9 or newer
- Git

### Windows (Recommended Quick Start)

For Windows users, we provide automated batch scripts at the root level for instant setup and zero-config launching:

1. Clone the repository:
   ```cmd
   git clone https://github.com/karthikeyatether/sql-analyst-academy.git
   cd sql-analyst-academy
   ```

2. Run the automated setup (installs dependencies and builds the project):
   ```cmd
   _setup.bat
   ```

3. Launch the application:
   ```cmd
   _launch.bat
   ```
   This will start the local server and automatically open `http://localhost:4173` in your default browser. For future runs, you only need to run `_launch.bat`. If you make changes to the source code, run `_launch.bat --rebuild`.

### Mac / Linux / Manual Setup

If you prefer to run things manually or are on Mac/Linux:

```bash
git clone https://github.com/karthikeyatether/sql-analyst-academy.git
cd sql-analyst-academy/core
npm install
npm run dev
```

Open `http://localhost:5173`.

To verify the production build locally:

```bash
npm run build
npm run preview
```

## Verification

The repository includes validation at several levels:

```bash
cd core
npm test                 # curriculum, grading, parser, rollback, and adversarial checks
npm run test:e2e         # Playwright browser flows
npm run lint             # ESLint
npm run format:check     # Prettier
npm run audit:dead-code  # Knip unused-file/export audit
npm audit --omit=optional
```

Current verification baseline:

- 313 automated unit/system checks passing
- 6 Playwright E2E scenarios passing
- 0 npm audit vulnerabilities
- Production build passing with compressed assets

## Repository layout

```text
core/
  src/
    components/     reusable UI and editor components
    data/           curriculum, datasets, puzzles, and problem content
    hooks/          reusable React hooks
    utils/          storage, grading, curriculum, and SQL client logic
    views/          lazy-loaded application views
  e2e/              Playwright browser tests
  tests/            system verification helpers
  public/           PWA assets and static files
```
