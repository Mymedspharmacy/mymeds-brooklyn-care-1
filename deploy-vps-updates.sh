#!/bin/bash

# =============================================================================
# MyMeds Pharmacy VPS Deployment Script
# =============================================================================
# Automated deployment script to update VPS with latest fixes
# Includes duplication checks and clean deployment process
# =============================================================================

set -e  # Exit on any error

# Configuration
VPS_HOST="root@72.60.116.253"
VPS_PROJECT_PATH="/var/www/mymedspharmacyinc.com"
BACKUP_DIR="/tmp/mymeds-backup-$(date +%Y%m%d-%H%M%S)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# =============================================================================
# Pre-deployment checks
# =============================================================================
log "Starting VPS deployment process..."

# Check if required files exist locally
check_local_files() {
    log "Checking local files..."
    
    local files=(
        "backend/src/routes/wordpress.ts"
        "backend/src/routes/woocommerce.ts" 
        "backend/src/index.ts"
        "dist/index.html"
    )
    
    for file in "${files[@]}"; do
        if [[ ! -f "$file" ]]; then
            error "Required file not found: $file"
        fi
    done
    
    log "✅ All local files found"
}

# Check VPS connectivity
check_vps_connectivity() {
    log "Checking VPS connectivity..."
    
    if ! ssh -o ConnectTimeout=10 -o BatchMode=yes "$VPS_HOST" "echo 'VPS connection successful'" 2>/dev/null; then
        error "Cannot connect to VPS. Please check SSH access."
    fi
    
    log "✅ VPS connectivity confirmed"
}

# =============================================================================
# VPS Health Check
# =============================================================================
check_vps_health() {
    log "Checking VPS health..."
    
    # Check PM2 status
    local pm2_status=$(ssh "$VPS_HOST" "pm2 list --format json" 2>/dev/null | grep -o '"status":"[^"]*"' | head -1)
    if [[ "$pm2_status" == *"online"* ]]; then
        log "✅ PM2 services running"
    else
        warn "PM2 services may not be running properly"
    fi
    
    # Check disk space
    local disk_usage=$(ssh "$VPS_HOST" "df -h $VPS_PROJECT_PATH | tail -1 | awk '{print \$5}' | sed 's/%//'")
    if [[ $disk_usage -gt 85 ]]; then
        warn "Disk usage is high: ${disk_usage}%"
    else
        log "✅ Disk usage OK: ${disk_usage}%"
    fi
    
    # Check backend health
    if ssh "$VPS_HOST" "curl -s -f http://localhost:4000/api/health > /dev/null" 2>/dev/null; then
        log "✅ Backend API responding"
    else
        warn "Backend API not responding"
    fi
}

# =============================================================================
# Duplication Check and Cleanup
# =============================================================================
check_and_cleanup_duplicates() {
    log "Checking for file duplications and cleaning up..."
    
    # Check for duplicate node_modules
    local node_modules_count=$(ssh "$VPS_HOST" "find $VPS_PROJECT_PATH -name 'node_modules' -type d | wc -l")
    if [[ $node_modules_count -gt 2 ]]; then
        warn "Found $node_modules_count node_modules directories (expected 1-2)"
        log "Cleaning up duplicate node_modules..."
        ssh "$VPS_HOST" "find $VPS_PROJECT_PATH -name 'node_modules' -type d | head -n -1 | xargs rm -rf" || true
    fi
    
    # Check for duplicate package.json files
    local package_json_count=$(ssh "$VPS_HOST" "find $VPS_PROJECT_PATH -name 'package.json' -type f | wc -l")
    if [[ $package_json_count -gt 2 ]]; then
        warn "Found $package_json_count package.json files (expected 1-2)"
    fi
    
    # Check for old backup files
    local backup_count=$(ssh "$VPS_HOST" "find $VPS_PROJECT_PATH -name '*.backup' -type f | wc -l")
    if [[ $backup_count -gt 10 ]]; then
        warn "Found $backup_count backup files, cleaning old ones..."
        ssh "$VPS_HOST" "find $VPS_PROJECT_PATH -name '*.backup' -type f -mtime +7 -delete" || true
    fi
    
    log "✅ Duplication check completed"
}

# =============================================================================
# Backup Current Deployment
# =============================================================================
create_backup() {
    log "Creating backup of current deployment..."
    
    ssh "$VPS_HOST" "mkdir -p $BACKUP_DIR"
    
    # Backup critical files
    ssh "$VPS_HOST" "
        cp -r $VPS_PROJECT_PATH/backend/src $BACKUP_DIR/backend-src-backup 2>/dev/null || true
        cp -r $VPS_PROJECT_PATH/frontend/dist $BACKUP_DIR/frontend-dist-backup 2>/dev/null || true
        cp $VPS_PROJECT_PATH/backend/.env $BACKUP_DIR/env-backup 2>/dev/null || true
        cp $VPS_PROJECT_PATH/backend/package.json $BACKUP_DIR/package-json-backup 2>/dev/null || true
    "
    
    log "✅ Backup created at: $BACKUP_DIR"
}

# =============================================================================
# Deploy Backend Updates
# =============================================================================
deploy_backend() {
    log "Deploying backend updates..."
    
    # Upload fixed files
    scp backend/src/routes/wordpress.ts "$VPS_HOST:$VPS_PROJECT_PATH/backend/src/routes/wordpress.ts"
    scp backend/src/routes/woocommerce.ts "$VPS_HOST:$VPS_PROJECT_PATH/backend/src/routes/woocommerce.ts"
    scp backend/src/index.ts "$VPS_HOST:$VPS_PROJECT_PATH/backend/src/index.ts"
    
    # Set proper permissions
    ssh "$VPS_HOST" "chown -R root:root $VPS_PROJECT_PATH/backend/src/"
    
    log "✅ Backend files deployed"
}

# =============================================================================
# Deploy Frontend Updates
# =============================================================================
deploy_frontend() {
    log "Deploying frontend updates..."
    
    # Clear old frontend files
    ssh "$VPS_HOST" "rm -rf $VPS_PROJECT_PATH/frontend/dist/*"
    
    # Upload new frontend build
    scp -r dist/* "$VPS_HOST:$VPS_PROJECT_PATH/frontend/dist/"
    
    # Set proper permissions
    ssh "$VPS_HOST" "chown -R www-data:www-data $VPS_PROJECT_PATH/frontend/dist/"
    ssh "$VPS_HOST" "chmod -R 755 $VPS_PROJECT_PATH/frontend/dist/"
    
    log "✅ Frontend deployed"
}

# =============================================================================
# Restart Services
# =============================================================================
restart_services() {
    log "Restarting services..."
    
    # Restart PM2 backend
    ssh "$VPS_HOST" "pm2 restart mymeds-backend || pm2 start $VPS_PROJECT_PATH/backend/dist/index.js --name mymeds-backend"
    
    # Wait for backend to start
    sleep 5
    
    # Reload Nginx
    ssh "$VPS_HOST" "nginx -t && systemctl reload nginx"
    
    log "✅ Services restarted"
}

# =============================================================================
# Post-deployment Verification
# =============================================================================
verify_deployment() {
    log "Verifying deployment..."
    
    # Check PM2 status
    local pm2_status=$(ssh "$VPS_HOST" "pm2 list --format json" 2>/dev/null | grep -o '"status":"[^"]*"' | head -1)
    if [[ "$pm2_status" == *"online"* ]]; then
        log "✅ PM2 services running"
    else
        error "PM2 services not running properly"
    fi
    
    # Check backend health
    sleep 10  # Give backend time to start
    if ssh "$VPS_HOST" "curl -s -f http://localhost:4000/api/health > /dev/null" 2>/dev/null; then
        log "✅ Backend API responding"
    else
        error "Backend API not responding after deployment"
    fi
    
    # Check frontend files
    local frontend_files=$(ssh "$VPS_HOST" "ls -la $VPS_PROJECT_PATH/frontend/dist/ | wc -l")
    if [[ $frontend_files -gt 5 ]]; then
        log "✅ Frontend files deployed"
    else
        error "Frontend deployment incomplete"
    fi
    
    log "✅ Deployment verification successful"
}

# =============================================================================
# Rollback Function
# =============================================================================
rollback() {
    error "Deployment failed. Rolling back..."
    
    if ssh "$VPS_HOST" "test -d $BACKUP_DIR" 2>/dev/null; then
        log "Restoring from backup..."
        ssh "$VPS_HOST" "
            cp -r $BACKUP_DIR/backend-src-backup/* $VPS_PROJECT_PATH/backend/src/ 2>/dev/null || true
            cp -r $BACKUP_DIR/frontend-dist-backup/* $VPS_PROJECT_PATH/frontend/dist/ 2>/dev/null || true
            pm2 restart mymeds-backend
        "
        log "Rollback completed"
    fi
}

# =============================================================================
# Main Execution
# =============================================================================
main() {
    log "🚀 Starting MyMeds VPS Deployment"
    log "VPS: $VPS_HOST"
    log "Project Path: $VPS_PROJECT_PATH"
    
    # Pre-deployment checks
    check_local_files
    check_vps_connectivity
    check_vps_health
    
    # Cleanup and backup
    check_and_cleanup_duplicates
    create_backup
    
    # Deploy updates
    deploy_backend
    deploy_frontend
    
    # Restart services
    restart_services
    
    # Verify deployment
    verify_deployment
    
    log "🎉 Deployment completed successfully!"
    log "Backup location: $BACKUP_DIR"
    log "You can now test your application at: https://mymedspharmacyinc.com"
}

# Trap errors and run rollback
trap rollback ERR

# Run main function
main "$@"
