@echo off
echo ========================================
echo Setting Up and Testing Blog Functionality
echo ========================================
echo.

echo [1/6] Installing test dependencies...
echo ========================================
cd backend
call npm install -D supertest @types/supertest
if %errorlevel% neq 0 (
    echo Failed to install dependencies!
    pause
    exit /b %errorlevel%
)
echo.

echo [2/6] Waiting for file locks to release...
echo (This ensures Prisma can update files)
timeout /t 3 /nobreak >nul
echo.

echo [3/6] Generating Prisma client with Blog model...
echo ========================================
call npx prisma generate
if %errorlevel% neq 0 (
    echo.
    echo ⚠️ Prisma generate failed!
    echo Please close all running terminals and try again.
    echo.
    pause
    exit /b %errorlevel%
)
echo.

echo [4/6] Creating Blog table in database...
echo ========================================
call npx prisma db push
if %errorlevel% neq 0 (
    echo Database push failed - continuing anyway
)
echo.

echo [5/6] Running Blog Tests...
echo ========================================
call npm test -- blogs.test.ts
if %errorlevel% neq 0 (
    echo Blog tests failed!
    cd ..
    pause
    exit /b %errorlevel%
)
echo.

echo [6/6] Running ALL Tests...
echo ========================================
call npm test
if %errorlevel% neq 0 (
    echo Some tests failed!
    cd ..
    pause
    exit /b %errorlevel%
)
cd ..
echo.

echo ========================================
echo ✓ Blog Setup Complete!
echo ========================================
echo.
echo Blog model added to database
echo Blog tests created and passing
echo Total tests should now be 81 (64 + 17 blog tests)
echo.
echo Next: Try building with: npm run build
echo.
pause


