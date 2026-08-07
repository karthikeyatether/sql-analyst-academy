@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required to run this app. Please install Node.js from https://nodejs.org/
  pause
  exit /b 1
)

echo Building production app bundle...
call npm run build
if errorlevel 1 (
  echo Build failed! Exiting.
  pause
  exit /b 1
)

echo Starting SQL Analyst Academy...
call npm run preview
