@echo off
echo ========================================
echo Starting MyMeds Backend (Development)
echo ========================================
echo.

REM Set environment variables for development
set NODE_ENV=development
set PORT=4000
set DATABASE_URL=file:./prisma/dev.db
set JWT_SECRET=dev-secret-key-change-in-production-min-32-characters-long-123
set JWT_EXPIRES_IN=24h
set BCRYPT_ROUNDS=10
set DB_MAX_CONNECTIONS=10
set DB_CONNECTION_TIMEOUT=30000
set RATE_LIMIT_AUTH=20
set RATE_LIMIT_CONTACT=50
set RATE_LIMIT_GENERAL=5000

echo Environment: %NODE_ENV%
echo Port: %PORT%
echo Database: SQLite (dev.db)
echo.
echo Starting server...
echo.

npm run dev

