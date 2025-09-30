#!/bin/bash

# =============================================================================
# VPS DEPLOYMENT SCRIPT - MyMeds Pharmacy
# =============================================================================
# This script updates the VPS server with the latest changes
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# VPS Configuration
VPS_HOST="mymedspharmacyinc.com"
VPS_USER="root"
VPS_PATH="/var/www/mymeds"
BACKUP_PATH="/var/backups/mymeds"

echo -e "${BLUE}🚀 Starting VPS deployment for MyMeds Pharmacy...${NC}"

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to run commands on VPS
run_vps_command() {
    echo -e "${BLUE}📡 Running on VPS: $1${NC}"
    ssh $VPS_USER@$VPS_HOST "$1"
}

# Function to copy files to VPS
copy_to_vps() {
    echo -e "${BLUE}📁 Copying to VPS: $1${NC}"
    scp -r "$1" $VPS_USER@$VPS_HOST:"$2"
}

echo -e "${BLUE}📋 Deployment Steps:${NC}"
echo "1. Create backup of current deployment"
echo "2. Pull latest code from Git"
echo "3. Update backend dependencies and build"
echo "4. Update frontend build"
echo "5. Update environment variables"
echo "6. Update Prisma schema"
echo "7. Restart services"
echo "8. Test deployment"

# Step 1: Create backup
echo -e "\n${BLUE}📦 Step 1: Creating backup...${NC}"
run_vps_command "mkdir -p $BACKUP_PATH/$(date +%Y%m%d_%H%M%S)"
run_vps_command "cp -r $VPS_PATH $BACKUP_PATH/$(date +%Y%m%d_%H%M%S)/"
print_status "Backup created"

# Step 2: Pull latest code
echo -e "\n${BLUE}📥 Step 2: Pulling latest code...${NC}"
run_vps_command "cd $VPS_PATH && git pull origin latest"
print_status "Code updated"

# Step 3: Update backend
echo -e "\n${BLUE}🔧 Step 3: Updating backend...${NC}"
run_vps_command "cd $VPS_PATH/backend && npm install"
run_vps_command "cd $VPS_PATH/backend && npx prisma generate"
run_vps_command "cd $VPS_PATH/backend && npm run build"
print_status "Backend updated and built"

# Step 4: Update frontend
echo -e "\n${BLUE}🎨 Step 4: Updating frontend...${NC}"
run_vps_command "cd $VPS_PATH && npm install"
run_vps_command "cd $VPS_PATH && npm run build"
print_status "Frontend updated and built"

# Step 5: Update environment variables
echo -e "\n${BLUE}⚙️  Step 5: Updating environment variables...${NC}"
run_vps_command "cd $VPS_PATH && cp env.production .env.production"
print_status "Environment variables updated"

# Step 6: Update Prisma schema
echo -e "\n${BLUE}🗄️  Step 6: Updating database schema...${NC}"
run_vps_command "cd $VPS_PATH/backend && npx prisma db push"
print_status "Database schema updated"

# Step 7: Restart services
echo -e "\n${BLUE}🔄 Step 7: Restarting services...${NC}"
run_vps_command "pm2 restart mymeds-backend"
run_vps_command "pm2 restart mymeds-frontend"
print_status "Services restarted"

# Step 8: Test deployment
echo -e "\n${BLUE}🧪 Step 8: Testing deployment...${NC}"
run_vps_command "pm2 status"
run_vps_command "curl -f http://localhost:4000/api/health || echo 'Backend health check failed'"
run_vps_command "curl -f http://localhost:3000 || echo 'Frontend health check failed'"

echo -e "\n${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${BLUE}📊 Service Status:${NC}"
run_vps_command "pm2 status"

echo -e "\n${BLUE}🌐 Your application is now live at:${NC}"
echo -e "${GREEN}   Frontend: https://mymedspharmacyinc.com${NC}"
echo -e "${GREEN}   Backend API: https://mymedspharmacyinc.com/api${NC}"
echo -e "${GREEN}   Admin Panel: https://mymedspharmacyinc.com/admin${NC}"

echo -e "\n${YELLOW}📝 Next steps:${NC}"
echo "1. Test the blog page: https://mymedspharmacyinc.com/blog"
echo "2. Test the shop page: https://mymedspharmacyinc.com/shop"
echo "3. Test the admin panel: https://mymedspharmacyinc.com/admin"
echo "4. Add a location in admin panel to test location management"
echo "5. Add a blog post in WordPress admin to test blog integration"
echo "6. Add a product in WooCommerce admin to test shop integration"

echo -e "\n${GREEN}✅ VPS deployment completed!${NC}"
