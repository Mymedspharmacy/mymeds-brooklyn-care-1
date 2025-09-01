#!/bin/bash

# Simple MyMeds Deployment Script
# This script performs the exact deployment steps from your original command

set -e  # Exit on any error

echo "🚀 Starting MyMeds deployment..."

# Navigate to project directory
cd /root/mymeds-brooklyn-care-1

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin latest

# Install frontend dependencies and build
echo "🔨 Building frontend..."
npm install
npm run build

# Copy frontend files to web directory
echo "📁 Copying frontend files..."
sudo cp -r dist/* /var/www/mymeds-frontend/

# Install backend dependencies and build
echo "🔨 Building backend..."
cd backend
npm install --production
npm run build

# Copy backend files to web directory
echo "📁 Copying backend files..."
sudo cp -r dist/* /var/www/mymeds-backend/

# Restart PM2 processes
echo "🔄 Restarting PM2 processes..."
pm2 restart all

# Reload nginx
echo "🌐 Reloading nginx..."
sudo systemctl reload nginx

echo "✅ Deployment completed successfully!"
echo "🎉 MyMeds Pharmacy is now updated and running!"

