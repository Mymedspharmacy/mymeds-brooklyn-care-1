#!/bin/bash

# Admin Login Fix Script for VPS
echo "🔧 Fixing admin login issue on VPS..."

# Navigate to project directory
cd /var/www/mymeds-pharmacy

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin latest

# Build backend
echo "🔨 Building backend..."
cd backend
npm run build

# Initialize admin user
echo "👤 Initializing admin user..."
curl -X POST https://mymedspharmacyinc.com/api/admin/init

# Restart backend
echo "🔄 Restarting backend..."
pm2 restart mymeds-backend

# Reload nginx
echo "🌐 Reloading nginx..."
sudo systemctl reload nginx

echo "✅ Admin login fix complete!"
echo ""
echo "🔑 Default admin credentials:"
echo "   Email: Check ADMIN_EMAIL environment variable"
echo "   Password: AdminPassword123!"
echo ""
echo "🔗 Test admin login at: https://mymedspharmacyinc.com/admin-signin"
