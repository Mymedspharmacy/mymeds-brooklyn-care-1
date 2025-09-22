#!/bin/bash
# =============================================================================
# FILE UPLOAD SCRIPT - MyMeds Pharmacy Inc.
# =============================================================================
# Uploads application files to VPS via rsync
# =============================================================================

set -e

echo "📁 MyMeds Pharmacy Inc. - File Upload Script"
echo "============================================"

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
LOCAL_PATH="."

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
# CREATE DIRECTORY ON VPS
# =============================================================================
log_info "Creating directory structure on VPS..."
ssh $VPS_USER@$VPS_IP "mkdir -p $VPS_PATH/{deployment,uploads,logs,backups}"

log_success "Directory structure created"

# =============================================================================
# UPLOAD FILES
# =============================================================================
log_info "Starting file upload..."

# Upload main application files
log_info "Uploading application files..."
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
    $LOCAL_PATH/ $VPS_USER@$VPS_IP:$VPS_PATH/

log_success "Application files uploaded"

# Upload environment template
log_info "Uploading environment template..."
rsync -avz env.production.template $VPS_USER@$VPS_IP:$VPS_PATH/.env.production

log_success "Environment template uploaded"

# Upload Docker configurations
log_info "Uploading Docker configurations..."
rsync -avz docker-compose*.yml $VPS_USER@$VPS_IP:$VPS_PATH/
rsync -avz Dockerfile* $VPS_USER@$VPS_IP:$VPS_PATH/
rsync -avz docker-entrypoint*.sh $VPS_USER@$VPS_IP:$VPS_PATH/

log_success "Docker configurations uploaded"

# Upload deployment scripts
log_info "Uploading deployment scripts..."
rsync -avz deployment/ $VPS_USER@$VPS_IP:$VPS_PATH/deployment/

log_success "Deployment scripts uploaded"

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
# VERIFY UPLOAD
# =============================================================================
log_info "Verifying uploaded files..."

ssh $VPS_USER@$VPS_IP << 'EOF'
cd /var/www/mymeds

echo "=== Upload Verification ==="
echo "Directory structure:"
ls -la

echo ""
echo "Deployment scripts:"
ls -la deployment/scripts/

echo ""
echo "Docker files:"
ls -la docker-compose*.yml Dockerfile*

echo ""
echo "Environment file:"
ls -la .env.production

echo ""
echo "Disk usage:"
df -h /var/www/mymeds
EOF

log_success "File upload verification completed"

# =============================================================================
# SUMMARY
# =============================================================================
echo ""
log_success "🎉 File upload completed successfully!"
echo ""
log_info "Next steps:"
echo "1. Run: ./deployment/scripts/02-setup-environment.sh"
echo "2. Run: ./deployment/scripts/03-install-dependencies.sh"
echo "3. Run: ./deployment/scripts/04-setup-database.sh"
echo "4. Run: ./deployment/scripts/05-deploy-application.sh"
echo ""
log_info "Or run all at once:"
echo "ssh root@$VPS_IP 'cd /var/www/mymeds && ./deployment/scripts/00-deploy-all.sh'"

