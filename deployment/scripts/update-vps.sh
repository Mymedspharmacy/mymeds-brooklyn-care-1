#!/bin/bash

# MyMeds Pharmacy VPS Update Script
# Updates frontend, backend, and runs Prisma migrations on VPS

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="MyMeds Pharmacy"
VPS_USER="root"  # Change this to your VPS user
VPS_HOST="your-vps-ip.com"  # Change this to your VPS IP/domain
VPS_PATH="/var/www/mymeds"  # Change this to your VPS deployment path
BACKUP_PATH="/var/www/backups"

echo -e "${BLUE}🚀 Starting ${APP_NAME} VPS Update...${NC}"
echo ""

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Pre-update checks
echo -e "${BLUE}🔍 Pre-update Validation...${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "backend/package.json" ]; then
    print_error "Not in the correct directory. Please run this script from the project root."
    exit 1
fi

# Check if git is available
if ! command_exists git; then
    print_error "Git is not installed. Please install git first."
    exit 1
fi

# Check if SSH key is available
if [ ! -f ~/.ssh/id_rsa ]; then
    print_warning "SSH key not found. You may need to enter password for VPS access."
fi

print_status "Pre-update validation completed"

# Step 1: Install and validate dependencies
echo ""
echo -e "${BLUE}📦 Installing and Validating Dependencies...${NC}"

# Check Node.js version
print_status "Checking Node.js version..."
NODE_VERSION=$(node --version)
echo "  Node.js version: $NODE_VERSION"

# Check npm version
print_status "Checking npm version..."
NPM_VERSION=$(npm --version)
echo "  npm version: $NPM_VERSION"

# Install frontend dependencies
print_status "Installing frontend dependencies..."
if [ -d "node_modules" ]; then
    echo "  Updating existing node_modules..."
    npm update
else
    echo "  Installing fresh node_modules..."
    npm install
fi

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
if [ -d "node_modules" ]; then
    echo "  Updating existing backend node_modules..."
    npm update
else
    echo "  Installing fresh backend node_modules..."
    npm install
fi
cd ..

# Validate TypeScript installation
print_status "Validating TypeScript installation..."
if npx tsc --version > /dev/null 2>&1; then
    echo "  TypeScript is available"
else
    print_error "TypeScript is not installed. Installing TypeScript..."
    npm install -g typescript
fi

# Validate Vite installation
print_status "Validating Vite installation..."
if npx vite --version > /dev/null 2>&1; then
    echo "  Vite is available"
else
    print_error "Vite is not installed. Installing Vite..."
    npm install -g vite
fi

# Step 2: Build applications locally
echo ""
echo -e "${BLUE}🔨 Building Applications...${NC}"

# Build frontend
print_status "Building frontend..."
$env:NODE_ENV="production"; npm run build
if [ $? -eq 0 ]; then
    print_status "Frontend build completed"
else
    print_error "Frontend build failed"
    exit 1
fi

# Build backend
print_status "Building backend..."
cd backend
$env:NODE_ENV="production"; npm run build
if [ $? -eq 0 ]; then
    print_status "Backend build completed"
else
    print_error "Backend build failed"
    exit 1
fi
cd ..

# Step 2: Create backup on VPS
echo ""
echo -e "${BLUE}💾 Creating VPS Backup...${NC}"

BACKUP_NAME="mymeds-backup-$(date +%Y%m%d-%H%M%S)"
ssh ${VPS_USER}@${VPS_HOST} << EOF
    # Create backup directory if it doesn't exist
    mkdir -p ${BACKUP_PATH}
    
    # Create backup of current deployment
    if [ -d "${VPS_PATH}" ]; then
        tar -czf ${BACKUP_PATH}/${BACKUP_NAME}.tar.gz -C ${VPS_PATH} .
        echo "✅ Backup created: ${BACKUP_PATH}/${BACKUP_NAME}.tar.gz"
    else
        echo "⚠️  No existing deployment found to backup"
    fi
EOF

# Step 3: Upload new files to VPS
echo ""
echo -e "${BLUE}📤 Uploading Files to VPS...${NC}"

# Create temporary directory for upload
ssh ${VPS_USER}@${VPS_HOST} "mkdir -p /tmp/mymeds-update"

# Upload frontend build
print_status "Uploading frontend build..."
scp -r dist/* ${VPS_USER}@${VPS_HOST}:/tmp/mymeds-update/frontend/

# Upload backend build
print_status "Uploading backend build..."
scp -r backend/dist/* ${VPS_USER}@${VPS_HOST}:/tmp/mymeds-update/backend/

# Upload environment files
print_status "Uploading environment files..."
scp frontend.env.production ${VPS_USER}@${VPS_HOST}:/tmp/mymeds-update/
scp backend/env.production ${VPS_USER}@${VPS_HOST}:/tmp/mymeds-update/backend/

# Upload package.json files
scp package.json ${VPS_USER}@${VPS_HOST}:/tmp/mymeds-update/
scp backend/package.json ${VPS_USER}@${VPS_HOST}:/tmp/mymeds-update/backend/

# Upload Prisma files
scp -r backend/prisma ${VPS_USER}@${VPS_HOST}:/tmp/mymeds-update/backend/

# Upload ecosystem config
scp backend/ecosystem.config.js ${VPS_USER}@${VPS_HOST}:/tmp/mymeds-update/backend/

print_status "Files uploaded successfully"

# Step 4: Deploy on VPS
echo ""
echo -e "${BLUE}🚀 Deploying on VPS...${NC}"

ssh ${VPS_USER}@${VPS_HOST} << EOF
    # Stop current PM2 processes
    echo "🛑 Stopping current processes..."
    pm2 stop mymeds-backend || true
    pm2 delete mymeds-backend || true
    
    # Create deployment directory if it doesn't exist
    mkdir -p ${VPS_PATH}
    
    # Backup current deployment
    if [ -d "${VPS_PATH}" ] && [ "\$(ls -A ${VPS_PATH})" ]; then
        mv ${VPS_PATH} ${VPS_PATH}-old-\$(date +%Y%m%d-%H%M%S)
    fi
    
    # Deploy new files
    echo "📁 Deploying new files..."
    cp -r /tmp/mymeds-update/* ${VPS_PATH}/
    
    # Set proper permissions
    chown -R www-data:www-data ${VPS_PATH}
    chmod -R 755 ${VPS_PATH}
    
    # Install backend dependencies
    echo "📦 Installing backend dependencies..."
    cd ${VPS_PATH}/backend
    npm install --production
    
    # Install global dependencies if needed
    echo "🔧 Installing global dependencies..."
    npm install -g pm2 typescript
    
    # Generate Prisma client
    echo "🔧 Generating Prisma client..."
    npx prisma generate
    
    # Run Prisma migrations
    echo "🗄️  Running Prisma migrations..."
    npx prisma migrate deploy
    
    # Start PM2 process
    echo "🚀 Starting application..."
    pm2 start ecosystem.config.js --env production
    
    # Save PM2 configuration
    pm2 save
    
    # Clean up temporary files
    rm -rf /tmp/mymeds-update
    
    echo "✅ Deployment completed successfully!"
EOF

# Step 5: Health check
echo ""
echo -e "${BLUE}🏥 Running Health Checks...${NC}"

# Wait a moment for the application to start
sleep 5

# Check if the application is running
ssh ${VPS_USER}@${VPS_HOST} << EOF
    # Check PM2 status
    echo "📊 PM2 Status:"
    pm2 status
    
    # Check if backend is responding
    echo "🔍 Backend Health Check:"
    if curl -f http://localhost:4000/api/health > /dev/null 2>&1; then
        echo "✅ Backend is responding"
    else
        echo "❌ Backend is not responding"
        exit 1
    fi
    
    # Check database connection
    echo "🗄️  Database Connection Check:"
    cd ${VPS_PATH}/backend
    if npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
        echo "✅ Database connection successful"
    else
        echo "❌ Database connection failed"
        exit 1
    fi
EOF

# Step 6: Cleanup old backups (keep last 5)
echo ""
echo -e "${BLUE}🧹 Cleaning up old backups...${NC}"

ssh ${VPS_USER}@${VPS_HOST} << EOF
    # Keep only the last 5 backups
    cd ${BACKUP_PATH}
    ls -t *.tar.gz | tail -n +6 | xargs -r rm
    echo "✅ Old backups cleaned up"
EOF

# Final status
echo ""
echo -e "${GREEN}🎉 VPS Update Completed Successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Update Summary:${NC}"
echo "  • Frontend: Updated and deployed"
echo "  • Backend: Updated and deployed"
echo "  • Database: Migrations applied"
echo "  • PM2: Process restarted"
echo "  • Backup: Created before update"
echo ""
echo -e "${BLUE}🔗 Useful Commands:${NC}"
echo "  ssh ${VPS_USER}@${VPS_HOST} 'pm2 status'           # Check PM2 status"
echo "  ssh ${VPS_USER}@${VPS_HOST} 'pm2 logs mymeds-backend'  # View logs"
echo "  ssh ${VPS_USER}@${VPS_HOST} 'pm2 restart mymeds-backend'  # Restart if needed"
echo ""
echo -e "${YELLOW}⚠️  Important Notes:${NC}"
echo "  • Backup created: ${BACKUP_NAME}.tar.gz"
echo "  • Old deployment backed up to: ${VPS_PATH}-old-*"
echo "  • Monitor logs for any issues"
echo "  • Test all functionality after update"
