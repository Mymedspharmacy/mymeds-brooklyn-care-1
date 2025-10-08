@echo off
echo ========================================
echo Running Tests with Coverage Reports
echo ========================================
echo.

echo [1/2] Frontend Tests with Coverage...
echo ========================================
call npx vitest run --coverage
echo.

echo [2/2] Backend Tests with Coverage...
echo ========================================
cd backend
call npm run test:coverage
cd ..
echo.

echo ========================================
echo Coverage reports generated!
echo ========================================
echo Frontend: Open coverage/index.html
echo Backend: Check console output above
echo.
pause


