@echo off
setlocal
cd /d "%~dp0"

REM Ensure Desktop shortcut exists with custom icon
if exist "%~dp0create_shortcut.vbs" (
  cscript //nologo "%~dp0create_shortcut.vbs" "%~dp0" >nul 2>&1
)

cd /d "%~dp0core"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required. Install from https://nodejs.org/
  pause
  exit /b 1
)

echo Synchronizing and building latest application bundle...
call npm run build
if errorlevel 1 (
  echo Build failed! Exiting.
  pause
  exit /b 1
)

echo Starting SQL Analyst Academy...
start "" "http://127.0.0.1:4173"
call npm run preview
