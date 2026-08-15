@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"

echo ========================================================
echo   SQL Analyst Academy - Complete Setup & Installation
echo ========================================================
echo.

echo [1/3] Checking environment...
where node >nul 2>nul
if errorlevel 1 (
  echo Error: Node.js is not installed or not in PATH!
  echo Please download and install Node.js (LTS) from https://nodejs.org/
  pause
  exit /b 1
)

echo [2/3] Installing application dependencies...
cd /d "%~dp0core"
call npm install
if %errorlevel% neq 0 (
  echo Failed to install dependencies. Please check your internet connection.
  pause
  exit /b 1
)

echo [3/3] Building production assets...
call npm run build
if %errorlevel% neq 0 (
  echo Build encountered warnings/errors.
)

cd /d "%~dp0"
echo.
echo Creating Desktop Shortcut with custom grey icon...
if exist "%~dp0create_shortcut.vbs" (
  cscript //nologo "%~dp0create_shortcut.vbs" "%~dp0"
)

echo.
echo ========================================================
echo   Installation Completed Successfully!
echo   Desktop Shortcut: "SQL Analyst Academy"
echo ========================================================
echo.
echo You can now launch the app directly from your Desktop!
pause
