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

# Build frontend
npm run build

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Start PM2 processes
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "✅ Deployment complete!"
echo "Backend: http://localhost:4000"
echo "Frontend: https://mymedspharmacyinc.com"
echo "WordPress: https://mymedspharmacyinc.com/wp-admin"
