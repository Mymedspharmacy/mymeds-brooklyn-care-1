#!/bin/bash

# Upload and Deploy MyMeds Project to VPS
# This script will upload your project files and complete the deployment

VPS_IP="72.60.116.253"
VPS_USER="root"
PROJECT_DIR="/var/www/mymeds"

echo "🚀 Uploading and Deploying MyMeds Project to VPS..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Step 1: Upload backend files
print_status "Uploading backend files..."
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'dist' backend/ $VPS_USER@$VPS_IP:$PROJECT_DIR/backend/

# Step 2: Upload frontend files
print_status "Uploading frontend files..."
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'dist' ./ $VPS_USER@$VPS_IP:$PROJECT_DIR/frontend/

# Step 3: Execute deployment commands on VPS
print_status "Executing deployment commands on VPS..."

ssh $VPS_USER@$VPS_IP << 'EOF'
cd /var/www/mymeds

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
npm run build

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd ../frontend
npm install
npm run build

# Set proper permissions
chown -R www-data:www-data /var/www/mymeds
chmod -R 755 /var/www/mymeds

# Run database migrations
echo "Running database migrations..."
cd ../backend
npx prisma migrate deploy

# Start the application with PM2
echo "Starting application with PM2..."
cd /var/www/mymeds
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Restart Nginx
systemctl restart nginx

echo "Deployment completed!"
EOF

print_success "Project deployed successfully!"
print_status "Your application should now be running at:"
print_status "- Frontend: http://72.60.116.253"
print_status "- Backend API: http://72.60.116.253/api"
print_status "- Admin Panel: http://72.60.116.253/admin"

echo "🎉 Deployment completed!"
