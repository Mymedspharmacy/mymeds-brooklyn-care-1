@echo off
echo Setting up MyMeds development environment...

REM Set environment variables
set DATABASE_URL=file:./prisma/dev.db
set NODE_ENV=development
set PORT=4000
set JWT_SECRET=MyMeds2025!JWTSecretKey_Development_Secure_2025!@#$%^&*()
set ADMIN_EMAIL=admin@mymedspharmacyinc.com
set ADMIN_PASSWORD_HASH=$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8K8K8K8K8
set DISABLE_RATE_LIMIT=true

echo Environment variables set

REM Generate Prisma client
echo Generating Prisma client...
npx prisma generate

REM Push database schema
echo Setting up database...
npx prisma db push

echo Development environment setup complete!
echo You can now run: npm run dev

pause
