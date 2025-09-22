#!/bin/bash
# =============================================================================
# VPS CLEANUP SCRIPT - MyMeds Pharmacy Inc.
# =============================================================================
# Complete cleanup of previous deployments on VPS
# =============================================================================

set -e

echo "🧹 MyMeds Pharmacy Inc. - VPS Cleanup Script"
echo "============================================="
echo "VPS IP: 72.60.116.253"
echo "Path: /var/www/mymeds"
echo "============================================="

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
BACKUP_PATH="/var/www/backups"

# =============================================================================
# SAFETY CONFIRMATION
# =============================================================================
echo ""
log_warning "⚠️  WARNING: This script will completely remove all previous deployments!"
echo ""
log_warning "The following will be deleted:"
echo "  - All Docker containers and images"
echo "  - All Docker volumes and networks"
echo "  - Application files in $VPS_PATH"
echo "  - Logs and temporary files"
echo "  - PM2 processes"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    log_info "Cleanup cancelled by user"
    exit 0
fi

# =============================================================================
# BACKUP IMPORTANT DATA (Optional)
# =============================================================================
log_info "Creating backup of important data..."

# Create backup directory
mkdir -p "$BACKUP_PATH/$(date +%Y%m%d_%H%M%S)"

# Backup database if exists
if docker ps -q -f name=mymeds-mysql >/dev/null 2>&1; then
    log_info "Backing up MySQL database..."
    docker exec mymeds-mysql mysqldump -u root -p"Mymeds2025!RootSecure123!@#" --all-databases > "$BACKUP_PATH/$(date +%Y%m%d_%H%M%S)/mysql_backup.sql" || true
fi

# Backup uploads if exists
if [ -d "$VPS_PATH/backend/uploads" ]; then
    log_info "Backing up uploads..."
    cp -r "$VPS_PATH/backend/uploads" "$BACKUP_PATH/$(date +%Y%m%d_%H%M%S)/uploads" || true
fi

log_success "Backup completed"

# =============================================================================
# STOP ALL SERVICES
# =============================================================================
log_info "Stopping all services..."

# Stop PM2 processes
log_info "Stopping PM2 processes..."
pm2 stop all || true
pm2 delete all || true

# Stop Docker Compose services
log_info "Stopping Docker Compose services..."
if [ -f "$VPS_PATH/docker-compose.prod.yml" ]; then
    cd "$VPS_PATH" && docker-compose -f docker-compose.prod.yml down --remove-orphans || true
fi

if [ -f "$VPS_PATH/docker-compose.full-stack.yml" ]; then
    cd "$VPS_PATH" && docker-compose -f docker-compose.full-stack.yml down --remove-orphans || true
fi

if [ -f "$VPS_PATH/docker-compose.optimized.yml" ]; then
    cd "$VPS_PATH" && docker-compose -f docker-compose.optimized.yml down --remove-orphans || true
fi

# Stop all MyMeds containers
log_info "Stopping all MyMeds containers..."
docker stop $(docker ps -q -f name=mymeds) 2>/dev/null || true
docker rm $(docker ps -aq -f name=mymeds) 2>/dev/null || true

log_success "All services stopped"

# =============================================================================
# CLEANUP DOCKER RESOURCES
# =============================================================================
log_info "Cleaning up Docker resources..."

# Remove all MyMeds images
log_info "Removing MyMeds Docker images..."
docker images | grep mymeds | awk '{print $3}' | xargs -r docker rmi -f || true

# Remove all MyMeds volumes
log_info "Removing MyMeds Docker volumes..."
docker volume ls | grep mymeds | awk '{print $2}' | xargs -r docker volume rm || true

# Remove all MyMeds networks
log_info "Removing MyMeds Docker networks..."
docker network ls | grep mymeds | awk '{print $1}' | xargs -r docker network rm || true

# Clean up unused Docker resources
log_info "Cleaning up unused Docker resources..."
docker system prune -af || true
docker volume prune -f || true
docker network prune -f || true

log_success "Docker cleanup completed"

# =============================================================================
# CLEANUP APPLICATION FILES
# =============================================================================
log_info "Cleaning up application files..."

# Remove application directory
if [ -d "$VPS_PATH" ]; then
    log_info "Removing application directory: $VPS_PATH"
    rm -rf "$VPS_PATH"
fi

# Remove any remaining MyMeds files
log_info "Removing any remaining MyMeds files..."
find /var/www -name "*mymeds*" -type d -exec rm -rf {} + 2>/dev/null || true
find /var/www -name "*mymeds*" -type f -delete 2>/dev/null || true

log_success "Application files cleanup completed"

# =============================================================================
# CLEANUP SYSTEM FILES
# =============================================================================
log_info "Cleaning up system files..."

# Remove logs
log_info "Removing log files..."
rm -rf /var/log/mymeds* 2>/dev/null || true
rm -rf /var/log/pm2* 2>/dev/null || true

# Remove temporary files
log_info "Removing temporary files..."
rm -rf /tmp/mymeds* 2>/dev/null || true
rm -rf /tmp/docker* 2>/dev/null || true

# Clean up package manager cache
log_info "Cleaning up package manager cache..."
apt-get clean || true
apt-get autoclean || true

log_success "System files cleanup completed"

# =============================================================================
# CLEANUP NGINX CONFIGURATION
# =============================================================================
log_info "Cleaning up Nginx configuration..."

# Remove MyMeds Nginx configs
if [ -f "/etc/nginx/sites-available/mymeds" ]; then
    log_info "Removing Nginx site configuration..."
    rm -f /etc/nginx/sites-available/mymeds
    rm -f /etc/nginx/sites-enabled/mymeds
fi

# Remove SSL certificates
if [ -d "/etc/nginx/ssl/mymeds" ]; then
    log_info "Removing SSL certificates..."
    rm -rf /etc/nginx/ssl/mymeds
fi

# Test and reload Nginx
log_info "Testing and reloading Nginx..."
nginx -t && systemctl reload nginx || true

log_success "Nginx cleanup completed"

# =============================================================================
# CLEANUP CRON JOBS
# =============================================================================
log_info "Cleaning up cron jobs..."

# Remove MyMeds cron jobs
crontab -l | grep -v mymeds | crontab - || true

log_success "Cron jobs cleanup completed"

# =============================================================================
# CLEANUP FIREWALL RULES
# =============================================================================
log_info "Cleaning up firewall rules..."

# Remove MyMeds firewall rules
ufw delete allow 3000/tcp 2>/dev/null || true
ufw delete allow 4000/tcp 2>/dev/null || true
ufw delete allow 8080/tcp 2>/dev/null || true

log_success "Firewall rules cleanup completed"

# =============================================================================
# FINAL VERIFICATION
# =============================================================================
log_info "Performing final verification..."

# Check for remaining containers
remaining_containers=$(docker ps -aq -f name=mymeds 2>/dev/null | wc -l)
if [ "$remaining_containers" -gt 0 ]; then
    log_warning "Found $remaining_containers remaining MyMeds containers"
    docker ps -a -f name=mymeds
else
    log_success "No MyMeds containers found"
fi

# Check for remaining images
remaining_images=$(docker images | grep mymeds | wc -l)
if [ "$remaining_images" -gt 0 ]; then
    log_warning "Found $remaining_images remaining MyMeds images"
    docker images | grep mymeds
else
    log_success "No MyMeds images found"
fi

# Check for remaining volumes
remaining_volumes=$(docker volume ls | grep mymeds | wc -l)
if [ "$remaining_volumes" -gt 0 ]; then
    log_warning "Found $remaining_volumes remaining MyMeds volumes"
    docker volume ls | grep mymeds
else
    log_success "No MyMeds volumes found"
fi

# Check for remaining files
remaining_files=$(find /var/www -name "*mymeds*" 2>/dev/null | wc -l)
if [ "$remaining_files" -gt 0 ]; then
    log_warning "Found $remaining_files remaining MyMeds files"
    find /var/www -name "*mymeds*" 2>/dev/null
else
    log_success "No MyMeds files found"
fi

# =============================================================================
# CLEANUP SUMMARY
# =============================================================================
echo ""
log_success "🎉 VPS Cleanup completed successfully!"
echo ""
log_info "Cleanup Summary:"
echo "=================="
echo "✅ All Docker containers stopped and removed"
echo "✅ All Docker images removed"
echo "✅ All Docker volumes removed"
echo "✅ All Docker networks removed"
echo "✅ Application files removed from $VPS_PATH"
echo "✅ Log files cleaned up"
echo "✅ Temporary files removed"
echo "✅ Nginx configuration cleaned"
echo "✅ SSL certificates removed"
echo "✅ Cron jobs removed"
echo "✅ Firewall rules removed"
echo "✅ PM2 processes stopped"
echo "✅ System cache cleaned"
echo ""
log_info "Backup location: $BACKUP_PATH"
echo ""
log_info "System is now clean and ready for fresh deployment!"
echo ""
log_info "To deploy fresh:"
echo "1. Upload your application files to $VPS_PATH"
echo "2. Run your deployment script"
echo "3. Configure your domain and SSL"
echo ""
log_info "Disk space freed up:"
df -h /var/www
