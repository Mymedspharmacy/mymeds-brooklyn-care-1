#!/bin/bash

# Quick VPS Update Script for Blog Post Fix
echo "🚀 Updating VPS with blog post fix..."

# Navigate to project directory
cd /var/www/mymeds-pharmacy

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin latest

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Restart backend (if needed)
echo "🔄 Restarting backend..."
pm2 restart mymeds-backend

# Reload nginx
echo "🌐 Reloading nginx..."
sudo systemctl reload nginx

echo "✅ VPS update complete!"
echo "🔗 Test the blog post: https://mymedspharmacyinc.com/blog/1"
