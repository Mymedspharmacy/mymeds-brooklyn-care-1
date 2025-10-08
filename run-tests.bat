@echo off
echo ========================================
echo Running MyMeds Pharmacy Tests
echo ========================================
echo.

echo [1/2] Running Frontend Tests...
echo ========================================
call npm test
if %errorlevel% neq 0 (
    echo Frontend tests FAILED!
    pause
    exit /b %errorlevel%
)
echo.
echo Frontend tests PASSED!
echo.

echo [2/2] Running Backend Tests...
echo ========================================
cd backend
call npm test
if %errorlevel% neq 0 (
    echo Backend tests FAILED!
    cd ..
    pause
    exit /b %errorlevel%
)
cd ..
echo.
echo Backend tests PASSED!
echo.

echo ========================================
echo ALL TESTS PASSED! ✓
echo ========================================
echo Total: Frontend (98 tests) + Backend (64 tests) = 162 tests
echo.
pause


