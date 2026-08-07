@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required to run this app. Please install Node.js from https://nodejs.org/
  pause
  exit /b 1
)

REM Use the existing production build for instant startup.
REM Pass --rebuild when source changes need a fresh bundle.
if /i "%~1"=="--rebuild" goto BUILD
if exist "dist\index.html" goto SERVE

:BUILD
echo Building production app bundle...
call npm run build
if errorlevel 1 (
  echo Build failed! Exiting.
  pause
  exit /b 1
)

:SERVE
echo Starting SQL Analyst Academy...
call npm run preview
