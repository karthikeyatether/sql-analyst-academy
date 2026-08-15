@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required to run this app. Please install Node.js from https://nodejs.org/
  pause
  exit /b 1
)

REM ── Smart launch: skip rebuild if dist/ already exists ─────────────────────
REM Pass --rebuild as first argument to force a fresh build.
REM Example: run-locally.bat --rebuild

if "%1"=="--rebuild" goto BUILD
if exist "dist\index.html" goto SERVE

:BUILD
echo Building production app bundle... (pass --rebuild next time to force this)
call npm run build
if errorlevel 1 (
  echo Build failed! Exiting.
  pause
  exit /b 1
)

:SERVE
echo Starting SQL Analyst Academy...
node serve-dist.cjs
