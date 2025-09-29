#!/bin/bash
# Setup script for MyMeds development environment

echo "Setting up MyMeds development environment..."

# Set environment variables
export DATABASE_URL="file:./prisma/dev.db"
export NODE_ENV="development"
export PORT="4000"
export JWT_SECRET="MyMeds2025!JWTSecretKey_Development_Secure_2025!@#$%^&*()"
export ADMIN_EMAIL="admin@mymedspharmacyinc.com"
export ADMIN_PASSWORD_HASH="$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8K8K8K8K8"
export DISABLE_RATE_LIMIT="true"

echo "Environment variables set"

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Push database schema
echo "Setting up database..."
npx prisma db push

# Seed database with initial data
echo "Seeding database..."
npx prisma db seed

echo "Development environment setup complete!"
echo "You can now run: npm run dev"
