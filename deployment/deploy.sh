#!/bin/bash

# MyMeds Deployment Script
set -e

echo "🚀 Deploying MyMeds Pharmacy..."

# Stop PM2 processes
pm2 stop mymeds-backend || true
pm2 delete mymeds-backend || true

# Pull latest code
git pull origin main

# Install dependencies
npm ci --production

# Build backend
cd backend
npm run build
cd ..

# Build frontend
npm run build

# Generate Prisma client
cd backend
npx prisma generate

# Push database schema (MySQL)
npx prisma db push
cd ..

# Start PM2 processes
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "✅ Deployment complete!"
echo "Backend: http://localhost:4000"
echo "Frontend: https://mymedspharmacyinc.com"
echo "WordPress: https://mymedspharmacyinc.com/wp-admin"
