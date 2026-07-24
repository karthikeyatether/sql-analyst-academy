@echo off
setlocal
cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 (
  echo Node.js and npm are required to run this app.
  pause
  exit /b 1
)

if not exist dist (
  echo Building production app for instant load...
  call npm run build
)

echo Launching SQL Analyst Academy instantly...
start http://127.0.0.1:4173
call npx vite preview --port 4173 --host 127.0.0.1
