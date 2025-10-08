@echo off
echo ========================================
echo MyMeds Pharmacy - Local Development
echo ========================================
echo.
echo This will start both Frontend and Backend servers:
echo - Frontend: http://localhost:3000 (or next available port)
echo - Backend:  http://localhost:4000
echo.
echo Press CTRL+C in each window to stop the servers
echo.
pause

echo Starting Backend Server...
start cmd /k "cd backend && start-dev.bat"

timeout /t 3

echo Starting Frontend Server...
start cmd /k "npm run dev"

echo.
echo ========================================
echo Both servers are starting!
echo ========================================
echo.
echo Frontend: Check the window that just opened
echo Backend:  Check the other window that just opened
echo.
echo Press any key to close this window...
pause > nul

