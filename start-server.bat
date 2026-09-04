@echo off
echo.
echo ============================================================
echo   Assignment Helper - Browser Automation Server
echo ============================================================
echo.
echo Starting Playwright automation sidecar on port 3001...
echo This window must stay open while using the app.
echo.
cd /d "%~dp0server"
node index.js
pause
