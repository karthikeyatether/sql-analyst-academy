@echo off
setlocal
cd /d "%~dp0core"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required to run this app. Please install Node.js from https://nodejs.org/
  pause
  exit /b 1
)

echo Building ultra-fast esbuild bundle...
call npm run build:esbuild
if errorlevel 1 (
  echo Build failed! Exiting.
  pause
  exit /b 1
)

echo Starting SQL Analyst Academy...
start "" "http://127.0.0.1:4173"
call npm run preview
