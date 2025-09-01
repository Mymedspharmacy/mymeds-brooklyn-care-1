#!/bin/bash

# Production Deployment Script for MyMeds Pharmacy
# This script deploys the application to the current VPS setup

set -e

echo "🚀 Starting production deployment..."

# Navigate to the application directory
cd /root/mymeds-brooklyn-care-1

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Install frontend dependencies and build
echo "🔨 Building frontend..."
npm install
npm run build

# Copy frontend to web directory
echo "📁 Copying frontend to web directory..."
sudo cp -r dist/* /var/www/mymeds-frontend/

# Install backend dependencies
echo "🔧 Setting up backend..."
cd backend
npm install --production

# Update Prisma schema to use MySQL
echo "🗄️ Updating database schema..."
sed -i 's/provider = "sqlite"/provider = "mysql"/' prisma/schema.prisma

# Build backend
echo "🔨 Building backend..."
npm run build

# Push database schema changes
echo "🗄️ Updating database..."
npx prisma db push

# Restart PM2 processes
echo "🔄 Restarting application..."
pm2 restart mymeds-backend

# Reload Nginx
echo "🌐 Reloading Nginx..."
sudo systemctl reload nginx

echo "✅ Production deployment completed successfully!"
echo "🌐 Frontend: https://www.mymedspharmacyinc.com"
echo "🔧 Backend: https://www.mymedspharmacyinc.com/api"
