#!/bin/bash
# VPS Update Script for MyMeds Pharmacy
# This script updates the application with latest changes

echo "🚀 Starting VPS Update for MyMeds Pharmacy..."

# Navigate to project directory
cd /path/to/your/project || { echo "❌ Failed to navigate to project directory"; exit 1; }

# Pull latest changes
echo "📥 Pulling latest changes from Git..."
git pull origin latest || { echo "❌ Failed to pull changes"; exit 1; }

# Install/update dependencies
echo "📦 Installing dependencies..."
npm install || { echo "❌ Failed to install frontend dependencies"; exit 1; }

# Update backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install || { echo "❌ Failed to install backend dependencies"; exit 1; }

# Generate Prisma client for production
echo "🗄️ Generating Prisma client..."
npx prisma generate || { echo "❌ Failed to generate Prisma client"; exit 1; }

# Run database migrations (if any)
echo "🔄 Running database migrations..."
npx prisma db push || { echo "❌ Failed to push database changes"; exit 1; }

# Build frontend
echo "🏗️ Building frontend..."
cd ..
npm run build || { echo "❌ Failed to build frontend"; exit 1; }

# Build backend
echo "🏗️ Building backend..."
cd backend
npm run build || { echo "❌ Failed to build backend"; exit 1; }

# Restart backend service
echo "🔄 Restarting backend service..."
pm2 restart mymeds-backend || { echo "❌ Failed to restart backend"; exit 1; }

# Reload nginx
echo "🔄 Reloading nginx..."
sudo systemctl reload nginx || { echo "❌ Failed to reload nginx"; exit 1; }

# Check service status
echo "✅ Checking service status..."
pm2 status

echo "🎉 VPS Update Complete!"
echo "📊 Application Status:"
echo "- Frontend: Built and deployed"
echo "- Backend: Restarted with PM2"
echo "- Database: Migrations applied"
echo "- Nginx: Reloaded"

echo ""
echo "🔍 To verify deployment:"
echo "- Visit: https://mymedspharmacyinc.com"
echo "- Check admin panel: https://mymedspharmacyinc.com/admin"
echo "- Monitor logs: pm2 logs mymeds-backend"