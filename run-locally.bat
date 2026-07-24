@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required to run this app. Please install Node.js from https://nodejs.org/
  pause
  exit /b 1
)

if not exist dist (
  echo Building production app bundle for instant load...
  call npm run build
)

node serve-dist.cjs
