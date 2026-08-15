# SQL Analyst Academy

> An offline-first, insanely fast SQL learning platform and interview practice workspace for data analysts, analytics engineers, and data scientists.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Preact](https://img.shields.io/badge/Preact-10.22-673AB8?style=flat-square&logo=preact&logoColor=white)](https://preactjs.com/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![SQLite WASM](https://img.shields.io/badge/SQLite-WASM-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sql.js.org/)
[![Tests](https://img.shields.io/badge/tests-313%20passing-10B981?style=flat-square)](#verification)

## V3 Architecture: The Speed Update ⚡

We've completely overhauled the platform's core to provide a blisteringly fast, enterprise-grade learning experience:

*   **Preact Migration:** We ripped out the heavy React/React-DOM engine and migrated the entire platform to **Preact**. This slashed our frontend payload by **83%** (dropping from ~142kB down to an ultra-light **24.64kB**).
*   **0ms Time-to-Interactive (TTI):** By decoupling the `CurriculumContext` bootloader and lazily fetching JSON assets, the UI now renders and becomes interactive instantaneously upon page load.
*   **WebAssembly RAM Management:** We integrated an aggressive memory management layer into the `sql.js` (SQLite WASM) Web Worker. The engine now bounds its query result cache and automatically fires `PRAGMA shrink_memory;` to release raw WebAssembly memory pool bytes back to the browser tab, preventing out-of-memory crashes on mobile and low-end devices.
*   **Premium Glassmorphism UI:** A ground-up redesign featuring 4 dynamic premium themes: **OLED (True Black)**, **Ember (Dark Red)**, **Dark**, and **Light**.
*   **Monaco Editor Caching:** The Monaco SQL Editor engine is now aggressively pre-fetched, cached in Service Workers, and chunked at the route-level for instant workspace booting.

## What it includes

- **201 interactive challenges:** 141 guided SQL problems and 60 debugging puzzles.
- **Realistic analytics data:** customers, orders, products, payments, subscriptions, and related relational tables.
- **Progressive feedback:** three-level hints, required-alias checks, query grading, and actionable diagnostics.
- **SQL playground:** Monaco editor, keyboard execution, CSV import, schema browsing, and visual `EXPLAIN` plans.
- **Interview practice:** timed mock sessions based on common data-analyst interview patterns.
- **Offline-first execution:** SQLite compiled to WebAssembly and executed in a dedicated Web Worker.
- **Responsive runtime:** query cancellation, request timeouts, worker recovery, and safe sandbox execution.

## Architecture

```text
Preact (React-compat) UI layer
       |
       +-- lazy learning views, premium dashboards
       |
       +-- SQL Engine Client (Bounded LRU Cache) -----------+
                                                            |
                                                SQL Web Worker
                                                (PRAGMA shrink_memory)
                                                            |
                                                SQLite WASM Engine
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

## Verification & Static Analysis

The repository is built to strict MNC standards and includes validation at several levels:

```bash
cd core
npm run lint             # ESLint (0 errors)
npm test                 # curriculum, grading, parser, rollback checks
npm run test:e2e         # Playwright browser flows
```

Current verification baseline:
- **313** automated unit/system checks passing
- **6** Playwright E2E scenarios passing
- **0** TypeScript errors
- **0** ESLint errors
- Production build passing with compressed WebAssembly assets
