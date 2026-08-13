@echo off
setlocal
cd /d "%~dp0"

echo ========================================================
echo   Installing SQL Analyst Academy Shortcut...
echo ========================================================
echo.

REM Check if icon exists
if not exist "%~dp0core\public\app_icon.ico" (
  echo Warning: app_icon.ico not found in the installation directory!
)

echo Installing dependencies...
cd /d "%~dp0core"
call npm install
if %errorlevel% neq 0 (
  echo Failed to install dependencies. Please ensure Node.js is installed.
  pause
  exit /b 1
)
cd /d "%~dp0"

REM Use PowerShell to automatically create a clean shortcut on the User's Desktop
powershell -Command "$wshell = New-Object -ComObject WScript.Shell; $shortcut = $wshell.CreateShortcut([Environment]::GetFolderPath('Desktop') + '\SQL Analyst Academy.lnk'); $shortcut.TargetPath = '%~dp0_launch.bat'; $shortcut.IconLocation = '%~dp0core\public\app_icon.ico'; $shortcut.WorkingDirectory = '%~dp0'; $shortcut.Save()"

if %errorlevel% neq 0 (
  echo Failed to create Desktop Shortcut.
  pause
  exit /b 1
)

echo Success! A shortcut named "SQL Analyst Academy" has been placed on your Desktop.
echo.
echo You can now close this window and launch the app from your Desktop.
echo ========================================================
pause
