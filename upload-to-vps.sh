#!/bin/bash
# =============================================================================
# VPS FILE UPLOAD SCRIPT - MyMeds Pharmacy Inc.
# =============================================================================
# Simple script to upload files to VPS
# =============================================================================

set -e

echo "📁 MyMeds Pharmacy Inc. - VPS File Upload"
echo "======================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# =============================================================================
# CONFIGURATION
# =============================================================================
VPS_IP="72.60.116.253"
VPS_USER="root"
VPS_PATH="/var/www/mymeds"

# =============================================================================
# VALIDATION
# =============================================================================
log_info "Validating connection to VPS..."

if ! ping -c 1 $VPS_IP >/dev/null 2>&1; then
    log_error "Cannot reach VPS at $VPS_IP"
    exit 1
fi

log_success "VPS is reachable"

# =============================================================================
# UPLOAD FILES
# =============================================================================
log_info "Starting file upload to VPS..."

# Create directory on VPS
ssh $VPS_USER@$VPS_IP "mkdir -p $VPS_PATH"

# Upload files (excluding large directories)
log_info "Uploading project files..."
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'dist' \
    --exclude 'backend/node_modules' \
    --exclude 'backend/dist' \
    --exclude 'backend/logs' \
    --exclude 'backend/uploads' \
    --exclude 'backend/prisma/dev.db' \
    --exclude '*.log' \
    --exclude '.env*' \
    --exclude 'uploads/*' \
    --exclude 'logs/*' \
    --exclude 'backups/*' \
    . $VPS_USER@$VPS_IP:$VPS_PATH/

log_success "Files uploaded successfully"

# Upload environment template
log_info "Uploading environment template..."
rsync -avz env.production.template $VPS_USER@$VPS_IP:$VPS_PATH/.env.production

log_success "Environment template uploaded"

# =============================================================================
# SET PERMISSIONS
# =============================================================================
log_info "Setting file permissions..."
ssh $VPS_USER@$VPS_IP << 'EOF'
cd /var/www/mymeds

# Make scripts executable
chmod +x deployment/scripts/*.sh
chmod +x docker-entrypoint*.sh

# Set directory permissions
chmod 755 uploads logs backups
chmod 644 .env.production

# Set ownership
chown -R root:root /var/www/mymeds
EOF

log_success "File permissions set"

# =============================================================================
# SUMMARY
# =============================================================================
echo ""
log_success "🎉 File upload completed successfully!"
echo ""
log_info "Next steps:"
echo "1. SSH into your VPS: ssh root@$VPS_IP"
echo "2. Navigate to: cd /var/www/mymeds"
echo "3. Run the complete deployment: ./deployment/scripts/00-deploy-all.sh"
echo ""
log_info "Or run individual scripts:"
echo "1. ./deployment/scripts/02-setup-environment.sh"
echo "2. ./deployment/scripts/03-install-dependencies.sh"
echo "3. ./deployment/scripts/04-setup-database.sh"
echo "4. ./deployment/scripts/05-deploy-application.sh"
echo "5. ./deployment/scripts/06-setup-wordpress.sh"
echo ""
log_info "Files uploaded to: $VPS_USER@$VPS_IP:$VPS_PATH"

