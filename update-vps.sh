#!/bin/bash

# VPS Update Script for MyMeds Pharmacy Backend
echo "🚀 Updating MyMeds Pharmacy Backend on VPS..."

# Build the backend
echo "📦 Building backend..."
cd /var/www/mymeds/mymeds-brooklyn-care-1/backend
npm run build

# Restart the backend service
echo "🔄 Restarting backend service..."
systemctl restart mymeds-backend

# Check service status
echo "✅ Checking service status..."
systemctl status mymeds-backend --no-pager | head -10

# Test the new endpoints
echo "🧪 Testing new endpoints..."

echo "Testing /api/refills:"
curl -s http://localhost:4000/api/refills | head -100

echo "Testing /api/transfers:"
curl -s http://localhost:4000/api/transfers | head -100

echo "Testing /api/reviews:"
curl -s http://localhost:4000/api/reviews | head -100

echo "🎉 Update complete!"


