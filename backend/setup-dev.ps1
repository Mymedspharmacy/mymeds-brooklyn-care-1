# MyMeds Development Environment Setup Script

Write-Host "Setting up MyMeds development environment..." -ForegroundColor Green

# Set environment variables
$env:DATABASE_URL = "file:./prisma/dev.db"
$env:NODE_ENV = "development"
$env:PORT = "4000"
$env:JWT_SECRET = "MyMeds2025!JWTSecretKey_Development_Secure_2025!@#$%^&*()"
$env:ADMIN_EMAIL = "admin@mymedspharmacyinc.com"
$env:ADMIN_PASSWORD_HASH = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8K8K8K8K8"
$env:DISABLE_RATE_LIMIT = "true"

Write-Host "Environment variables set" -ForegroundColor Yellow

# Generate Prisma client
Write-Host "Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate

# Push database schema
Write-Host "Setting up database..." -ForegroundColor Yellow
npx prisma db push

Write-Host "Development environment setup complete!" -ForegroundColor Green
Write-Host "You can now run: npm run dev" -ForegroundColor Cyan

Read-Host "Press Enter to continue"
