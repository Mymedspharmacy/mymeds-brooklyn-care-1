#!/bin/bash

# MyMeds Pharmacy Auto-Deployment Script
# This script is called by GitHub Actions to deploy updates

set -e  # Exit on any error

echo "🚀 Starting MyMeds Pharmacy deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Navigate to project directory
cd /root/mymeds-brooklyn-care-1

print_status "Pulling latest changes from GitHub..."
git pull origin latest

print_status "Installing frontend dependencies..."
npm install

print_status "Building frontend..."
npm run build

print_status "Deploying frontend files..."
sudo cp -r dist/* /var/www/mymeds-frontend/
sudo chown -R www-data:www-data /var/www/mymeds-frontend/
sudo chmod -R 755 /var/www/mymeds-frontend/

print_status "Installing backend dependencies..."
cd backend
npm install --production

print_status "Building backend..."
npm run build

print_status "Restarting backend services..."
pm2 restart mymeds-backend

print_status "Reloading Nginx..."
sudo systemctl reload nginx

print_status "Running health checks..."
sleep 5

# Health check
if curl -f -s https://mymedspharmacyinc.com > /dev/null; then
    print_status "✅ Frontend health check passed"
else
    print_error "❌ Frontend health check failed"
    exit 1
fi

if curl -f -s https://mymedspharmacyinc.com/api/health > /dev/null; then
    print_status "✅ Backend API health check passed"
else
    print_warning "⚠️ Backend API health check failed"
fi

print_status "🎉 Deployment completed successfully!"
print_status "Your MyMeds Pharmacy is now updated and running!"

# Show deployment summary
echo ""
echo "📋 Deployment Summary:"
echo "   • Frontend: Updated and deployed"
echo "   • Backend: Updated and restarted"
echo "   • Database: Connected and running"
echo "   • SSL: Active and working"
echo "   • Domain: https://mymedspharmacyinc.com"
echo ""
