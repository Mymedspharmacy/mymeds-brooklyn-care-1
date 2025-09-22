#!/bin/bash
# =============================================================================
# QUICK VPS DEPLOYMENT SCRIPT - MyMeds Pharmacy Inc.
# =============================================================================

set -e

echo "🚀 MyMeds Pharmacy Inc. - Quick VPS Deployment"
echo "=============================================="
echo "VPS IP: 72.60.116.253"
echo "Path: /var/www/mymeds"
echo "=============================================="

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

VPS_IP="72.60.116.253"
VPS_USER="root"
VPS_PATH="/var/www/mymeds"

# =============================================================================
# STEP 1: UPLOAD FILES
# =============================================================================
log_info "Step 1: Uploading application files to VPS..."

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
    . $VPS_USER@$VPS_IP:$VPS_PATH/

log_success "Files uploaded successfully"

# =============================================================================
# STEP 2: RUN DEPLOYMENT ON VPS
# =============================================================================
log_info "Step 2: Running deployment on VPS..."

# Connect to VPS and run deployment
ssh $VPS_USER@$VPS_IP << 'EOF'
cd /var/www/mymeds

echo "🚀 Starting deployment on VPS..."

# Make scripts executable
chmod +x deployment/scripts/*.sh

# Run the perfect deployment script
./deployment/scripts/deploy-perfect.sh

echo "✅ Deployment completed on VPS"
EOF

log_success "Deployment completed successfully"

# =============================================================================
# STEP 3: VERIFY DEPLOYMENT
# =============================================================================
log_info "Step 3: Verifying deployment..."

# Check if services are running
ssh $VPS_USER@$VPS_IP << 'EOF'
echo "=== Deployment Verification ==="
echo "Date: $(date)"
echo ""

echo "=== Docker Containers ==="
docker ps | grep mymeds || echo "No MyMeds containers running"

echo ""
echo "=== Service URLs ==="
echo "🌐 MyMeds Frontend: http://72.60.116.253:3000"
echo "🔧 MyMeds Backend API: http://72.60.116.253:4000"
echo "📝 WordPress Admin: http://72.60.116.253:8080/wp-admin"
echo "🛒 WooCommerce Shop: http://72.60.116.253:8080/shop"
echo "📖 Blog: http://72.60.116.253:8080/blog"
echo "🗄️ Database: 72.60.116.253:3306"
echo "🔐 Admin Panel: http://72.60.116.253:3000/admin"
echo "🏥 Health Check: http://72.60.116.253:4000/api/health"

echo ""
echo "=== System Resources ==="
echo "Disk Usage:"
df -h /var/www
echo ""
echo "Memory Usage:"
free -h
echo ""
echo "Docker System Usage:"
docker system df
EOF

log_success "🎉 MyMeds Pharmacy deployment completed successfully!"
echo ""
log_info "Your application is now running on:"
echo "🌐 Frontend: http://72.60.116.253:3000"
echo "🔧 Backend API: http://72.60.116.253:4000"
echo "📝 WordPress: http://72.60.116.253:8080"
echo ""
log_info "Next steps:"
echo "1. Test all services by visiting the URLs above"
echo "2. Configure your domain DNS to point to 72.60.116.253"
echo "3. Set up SSL certificates for HTTPS"
echo "4. Configure firewall rules"
echo "5. Set up monitoring and backups"
