# ⚡ SQL Analyst Academy Core

> **Core application workspace for SQL Analyst Academy.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![SQLite WASM](https://img.shields.io/badge/SQLite-WASM-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sql.js.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![CI Status](https://img.shields.io/badge/CI-Passing-10B981?style=flat-square&logo=githubactions&logoColor=white)](https://github.com/karthikeyatether/sql-analyst-academy/actions/workflows/ci.yml)

---

## Overview

This directory contains the primary frontend application and WebAssembly runtime for SQL Analyst Academy. The client is built with React 18, Vite 6, and TypeScript, interfacing with an in-memory SQLite WebAssembly engine executed inside a Web Worker.

---

## Project Structure

```text
core/
├── e2e/                     # Playwright end-to-end test specifications
├── public/                  # Static assets, WebAssembly binaries, web manifest
├── src/
│   ├── components/          # Reusable UI components (Monaco editor, ERD viewer, modals)
│   ├── data/                # Curriculum metadata, practice problems, debug puzzles, datasets
│   ├── hooks/               # Custom React hooks (storage, lifecycle)
│   ├── types/               # TypeScript interfaces and type definitions
│   ├── utils/               # SQL parsing, schema analysis, database seeding, test utilities
│   ├── views/               # Primary platform views (Roadmap, Playground, Mock Tests, Analytics)
│   ├── workers/             # Dedicated Web Worker for SQLite WASM execution
│   ├── App.tsx              # Main application shell and routing
│   ├── main.tsx             # Application bootstrap and service worker registration
│   └── styles.css           # Global stylesheet and theme tokens
├── package.json             # Package configuration and dependencies
├── playwright.config.ts     # Playwright test configuration
├── precompress.cjs          # Build-time Gzip & Brotli asset pre-compression
├── testRunner.ts            # Node.js automated SQL validation test runner
├── tsconfig.json            # TypeScript compiler configuration
└── vite.config.ts           # Vite build and plugin configuration
```

---

## Development & Build Commands

```bash
# Install dependencies
npm install

# Start development server with Hot Module Replacement (HMR)
npm run dev

# Compile TypeScript and bundle production assets
npm run build

# Typecheck codebase without emitting files
npm run typecheck

# Preview local production distribution
npm run preview

# Run automated SQL curriculum and system test suite
npm test

# Run ESLint check
npm run lint

# Check code formatting with Prettier
npm run format:check

# Format code with Prettier
npm run format

# Run Playwright E2E browser tests
npm run test:e2e
```
