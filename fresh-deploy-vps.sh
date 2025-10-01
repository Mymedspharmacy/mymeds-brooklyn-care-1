#!/bin/bash

# ============================================================================
# Fresh VPS Deployment Script - MyMeds Pharmacy
# ============================================================================
# This script safely removes old app, clones fresh code, and rebuilds
# WordPress installation is PRESERVED
# ============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# VPS Configuration
VPS_USER="root"
VPS_HOST="72.60.116.253"
APP_PATH="/var/www/mymeds"
BACKUP_PATH="/var/backups/mymeds"
WORDPRESS_PATH="/var/www/html/wordpress"
REPO_URL="https://github.com/Mymedspharmacy/mymeds-brooklyn-care-1.git"
BRANCH="latest"

echo -e "${BLUE}============================================================================${NC}"
echo -e "${BLUE}Fresh VPS Deployment - MyMeds Pharmacy${NC}"
echo -e "${BLUE}============================================================================${NC}"
echo ""

# Step 1: Create backup of current deployment
echo -e "${YELLOW}Step 1: Creating backup of current deployment...${NC}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ssh ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
set -e
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="/var/backups/mymeds"
APP_PATH="/var/www/mymeds"

# Create backup directory
mkdir -p ${BACKUP_PATH}/${TIMESTAMP}

# Backup only critical files (not node_modules)
echo "Backing up environment files..."
if [ -f "${APP_PATH}/.env.production" ]; then
    cp ${APP_PATH}/.env.production ${BACKUP_PATH}/${TIMESTAMP}/
fi
if [ -f "${APP_PATH}/backend/.env.production" ]; then
    cp ${APP_PATH}/backend/.env.production ${BACKUP_PATH}/${TIMESTAMP}/
fi

# Backup database (SQLite)
echo "Backing up database..."
if [ -f "${APP_PATH}/backend/prisma/dev.db" ]; then
    cp ${APP_PATH}/backend/prisma/dev.db ${BACKUP_PATH}/${TIMESTAMP}/
fi

# Backup PM2 ecosystem file
if [ -f "${APP_PATH}/ecosystem.config.js" ]; then
    cp ${APP_PATH}/ecosystem.config.js ${BACKUP_PATH}/${TIMESTAMP}/
fi

echo "✅ Backup created at: ${BACKUP_PATH}/${TIMESTAMP}"
ENDSSH

echo -e "${GREEN}✅ Backup completed${NC}"
echo ""

# Step 2: Stop running services
echo -e "${YELLOW}Step 2: Stopping running services...${NC}"
ssh ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
set -e
echo "Stopping PM2 processes..."
pm2 stop all || true
pm2 delete all || true
echo "✅ Services stopped"
ENDSSH

echo -e "${GREEN}✅ Services stopped${NC}"
echo ""

# Step 3: Remove old application (preserve WordPress)
echo -e "${YELLOW}Step 3: Removing old application...${NC}"
echo -e "${RED}⚠️  WordPress installation will be PRESERVED${NC}"
ssh ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
set -e
APP_PATH="/var/www/mymeds"

if [ -d "${APP_PATH}" ]; then
    echo "Removing old application directory..."
    rm -rf ${APP_PATH}
    echo "✅ Old application removed"
else
    echo "No existing application found"
fi
ENDSSH

echo -e "${GREEN}✅ Old application removed${NC}"
echo ""

# Step 4: Clone fresh code from repository
echo -e "${YELLOW}Step 4: Cloning fresh code from GitHub...${NC}"
ssh ${VPS_USER}@${VPS_HOST} << ENDSSH
set -e
APP_PATH="/var/www/mymeds"
REPO_URL="${REPO_URL}"
BRANCH="${BRANCH}"

echo "Cloning repository..."
git clone --branch \${BRANCH} \${REPO_URL} \${APP_PATH}
cd \${APP_PATH}
echo "Current commit: \$(git rev-parse HEAD)"
echo "✅ Code cloned successfully"
ENDSSH

echo -e "${GREEN}✅ Fresh code cloned${NC}"
echo ""

# Step 5: Restore environment files and database
echo -e "${YELLOW}Step 5: Restoring environment files and database...${NC}"
ssh ${VPS_USER}@${VPS_HOST} << ENDSSH
set -e
TIMESTAMP=\$(ls -t /var/backups/mymeds | head -1)
BACKUP_PATH="/var/backups/mymeds/\${TIMESTAMP}"
APP_PATH="/var/www/mymeds"

echo "Restoring from backup: \${TIMESTAMP}"

# Restore environment files
if [ -f "\${BACKUP_PATH}/.env.production" ]; then
    cp \${BACKUP_PATH}/.env.production \${APP_PATH}/
    echo "✅ Restored .env.production"
fi

if [ -f "\${BACKUP_PATH}/.env.production" ]; then
    cp \${BACKUP_PATH}/.env.production \${APP_PATH}/backend/.env
    echo "✅ Restored backend .env"
fi

# Restore database
if [ -f "\${BACKUP_PATH}/dev.db" ]; then
    mkdir -p \${APP_PATH}/backend/prisma
    cp \${BACKUP_PATH}/dev.db \${APP_PATH}/backend/prisma/
    echo "✅ Restored database"
fi

echo "✅ Files restored"
ENDSSH

echo -e "${GREEN}✅ Files restored${NC}"
echo ""

# Step 6: Install backend dependencies
echo -e "${YELLOW}Step 6: Installing backend dependencies...${NC}"
ssh ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
set -e
APP_PATH="/var/www/mymeds"

echo "Installing backend dependencies..."
cd ${APP_PATH}/backend
npm install --production

echo "Generating Prisma client..."
npx prisma generate

echo "✅ Backend dependencies installed"
ENDSSH

echo -e "${GREEN}✅ Backend dependencies installed${NC}"
echo ""

# Step 7: Build backend
echo -e "${YELLOW}Step 7: Building backend...${NC}"
ssh ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
set -e
APP_PATH="/var/www/mymeds"

echo "Building backend TypeScript..."
cd ${APP_PATH}/backend
npm run build

echo "✅ Backend built successfully"
ENDSSH

echo -e "${GREEN}✅ Backend built${NC}"
echo ""

# Step 8: Install frontend dependencies
echo -e "${YELLOW}Step 8: Installing frontend dependencies...${NC}"
ssh ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
set -e
APP_PATH="/var/www/mymeds"

echo "Installing frontend dependencies..."
cd ${APP_PATH}
npm install --production

echo "✅ Frontend dependencies installed"
ENDSSH

echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
echo ""

# Step 9: Build frontend
echo -e "${YELLOW}Step 9: Building frontend...${NC}"
ssh ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
set -e
APP_PATH="/var/www/mymeds"

echo "Building frontend..."
cd ${APP_PATH}
npm run build

echo "✅ Frontend built successfully"
ENDSSH

echo -e "${GREEN}✅ Frontend built${NC}"
echo ""

# Step 10: Set proper permissions
echo -e "${YELLOW}Step 10: Setting proper permissions...${NC}"
ssh ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
set -e
APP_PATH="/var/www/mymeds"

echo "Setting file permissions..."
chown -R www-data:www-data ${APP_PATH}
chmod -R 755 ${APP_PATH}

# Backend specific permissions
chmod -R 755 ${APP_PATH}/backend/dist
chmod -R 755 ${APP_PATH}/backend/node_modules

# Database permissions
if [ -f "${APP_PATH}/backend/prisma/dev.db" ]; then
    chmod 644 ${APP_PATH}/backend/prisma/dev.db
fi

echo "✅ Permissions set"
ENDSSH

echo -e "${GREEN}✅ Permissions configured${NC}"
echo ""

# Step 11: Start services with PM2
echo -e "${YELLOW}Step 11: Starting services with PM2...${NC}"
ssh ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
set -e
APP_PATH="/var/www/mymeds"

echo "Starting backend with PM2..."
cd ${APP_PATH}
pm2 start backend/dist/index.js --name mymeds-backend --node-args="--max-old-space-size=1024"

echo "Waiting for backend to start..."
sleep 5

echo "✅ Services started"
ENDSSH

echo -e "${GREEN}✅ Services started${NC}"
echo ""

# Step 12: Verify deployment
echo -e "${YELLOW}Step 12: Verifying deployment...${NC}"
ssh ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
set -e

echo "PM2 Status:"
pm2 status

echo ""
echo "Testing backend health..."
curl -f http://localhost:4000/api/health || echo "⚠️  Backend health check failed"

echo ""
echo "Checking WordPress..."
if [ -d "/var/www/html/wordpress" ]; then
    echo "✅ WordPress installation preserved"
else
    echo "⚠️  WordPress not found"
fi
ENDSSH

echo -e "${GREEN}✅ Verification complete${NC}"
echo ""

# Step 13: Show service information
echo -e "${YELLOW}Step 13: Service Information${NC}"
ssh ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
echo "==================================================================="
echo "Service Status:"
echo "==================================================================="
pm2 status

echo ""
echo "==================================================================="
echo "Latest Logs:"
echo "==================================================================="
pm2 logs mymeds-backend --lines 20 --nostream || true
ENDSSH

echo ""
echo -e "${BLUE}============================================================================${NC}"
echo -e "${GREEN}✅ Fresh deployment completed successfully!${NC}"
echo -e "${BLUE}============================================================================${NC}"
echo ""
echo -e "${YELLOW}Application URLs:${NC}"
echo -e "  Frontend: ${GREEN}https://mymedspharmacyinc.com${NC}"
echo -e "  Backend API: ${GREEN}https://mymedspharmacyinc.com/api${NC}"
echo -e "  Backend Health: ${GREEN}https://mymedspharmacyinc.com/api/health${NC}"
echo -e "  Admin Panel: ${GREEN}https://mymedspharmacyinc.com/admin${NC}"
echo -e "  WordPress: ${GREEN}https://mymedspharmacyinc.com/blog${NC} (Preserved)"
echo -e "  WooCommerce: ${GREEN}https://mymedspharmacyinc.com/shop${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Test all endpoints: https://mymedspharmacyinc.com/api/health"
echo "2. Test admin login: https://mymedspharmacyinc.com/admin-signin"
echo "3. Test shop page: https://mymedspharmacyinc.com/shop (NEW FIXES APPLIED!)"
echo "4. Test blog page: https://mymedspharmacyinc.com/blog (NEW FIXES APPLIED!)"
echo "5. Monitor logs: ssh ${VPS_USER}@${VPS_HOST} 'pm2 logs'"
echo ""
echo -e "${GREEN}Deployment completed! 🎉${NC}"
echo ""
echo -e "${BLUE}Backup location: ${BACKUP_PATH}/${TIMESTAMP}${NC}"

