# MyMeds Backend - Development Startup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting MyMeds Backend (Development)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set environment variables for development
$env:NODE_ENV = "development"
$env:PORT = "4000"
$env:DATABASE_URL = "file:./prisma/dev.db"
$env:JWT_SECRET = "dev-secret-key-change-in-production-min-32-characters-long-123"
$env:JWT_EXPIRES_IN = "24h"
$env:BCRYPT_ROUNDS = "10"
$env:DB_MAX_CONNECTIONS = "10"
$env:DB_CONNECTION_TIMEOUT = "30000"
$env:RATE_LIMIT_AUTH = "20"
$env:RATE_LIMIT_CONTACT = "50"
$env:RATE_LIMIT_GENERAL = "5000"

Write-Host "Environment: $env:NODE_ENV" -ForegroundColor Green
Write-Host "Port: $env:PORT" -ForegroundColor Green
Write-Host "Database: SQLite (dev.db)" -ForegroundColor Green
Write-Host ""
Write-Host "Starting server..." -ForegroundColor Yellow
Write-Host ""

# Start the development server
npm run dev

