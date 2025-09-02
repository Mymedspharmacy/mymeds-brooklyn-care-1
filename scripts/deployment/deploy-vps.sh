#!/bin/bash

# 🏥 MyMeds Pharmacy - VPS Deployment Script
# This script handles the complete deployment process on the VPS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_DIR="/var/www/mymeds"
BACKUP_DIR="/var/backups/mymeds"
LOG_FILE="/var/log/mymeds-deployment.log"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Logging function
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}" | tee -a "$LOG_FILE"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root for security reasons"
fi

log "🚀 Starting MyMeds Pharmacy deployment..."

# Create backup
log "📦 Creating backup..."
if [ -d "$DEPLOY_DIR" ]; then
    sudo mkdir -p "$BACKUP_DIR"
    sudo tar -czf "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" -C "$DEPLOY_DIR" .
    log "✅ Backup created: backup_$TIMESTAMP.tar.gz"
    
    # Keep only last 5 backups
    sudo find "$BACKUP_DIR" -name "backup_*.tar.gz" -type f -mtime +5 -delete
else
    warning "No existing deployment found, skipping backup"
fi

# Stop services gracefully
log "⏹️ Stopping services..."
sudo pm2 stop mymeds-backend || warning "PM2 process not running"
sudo systemctl stop nginx || warning "Nginx not running"

# Create deployment directory
log "📁 Preparing deployment directory..."
sudo mkdir -p "$DEPLOY_DIR"
sudo chown -R $USER:www-data "$DEPLOY_DIR"

# Clean deployment directory
sudo rm -rf "$DEPLOY_DIR"/*

# Copy new files
log "📋 Copying new files..."
if [ -d "/tmp/mymeds-deploy" ]; then
    sudo cp -r /tmp/mymeds-deploy/* "$DEPLOY_DIR/"
else
    error "Deployment files not found in /tmp/mymeds-deploy"
fi

# Set permissions
log "🔐 Setting permissions..."
sudo chown -R www-data:www-data "$DEPLOY_DIR"
sudo chmod -R 755 "$DEPLOY_DIR"
sudo chmod -R 644 "$DEPLOY_DIR/dist"

# Install backend dependencies
log "📦 Installing backend dependencies..."
cd "$DEPLOY_DIR/backend"
npm ci --production --silent

# Run database migrations
log "🗄️ Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Update PM2 configuration
log "⚙️ Updating PM2 configuration..."
if [ -f "ecosystem.config.js" ]; then
    # Update PM2 config with current paths
    sed -i "s|script: 'dist/index.js'|script: '$DEPLOY_DIR/backend/dist/index.js'|g" ecosystem.config.js
    sed -i "s|error_file: '/var/log/mymeds/pm2-error.log'|error_file: '/var/log/mymeds/pm2-error.log'|g" ecosystem.config.js
    sed -i "s|out_file: '/var/log/mymeds/pm2-out.log'|out_file: '/var/log/mymeds/pm2-out.log'|g" ecosystem.config.js
    sed -i "s|log_file: '/var/log/mymeds/pm2-combined.log'|log_file: '/var/log/mymeds/pm2-combined.log'|g" ecosystem.config.js
fi

# Start services
log "▶️ Starting services..."
sudo pm2 start ecosystem.config.js --env production
sudo pm2 save

# Restart nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

# Wait for services to start
log "⏳ Waiting for services to start..."
sleep 10

# Health check
log "🏥 Performing health check..."
MAX_RETRIES=5
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f http://localhost:4000/api/health > /dev/null 2>&1; then
        log "✅ Backend health check passed"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        warning "Backend health check failed (attempt $RETRY_COUNT/$MAX_RETRIES)"
        sleep 10
    fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    error "Backend health check failed after $MAX_RETRIES attempts"
fi

# Check nginx
if curl -f http://localhost:80 > /dev/null 2>&1; then
    log "✅ Frontend health check passed"
else
    error "Frontend health check failed"
fi

# Check SSL certificate
if [ -n "$DOMAIN" ]; then
    if curl -f https://localhost > /dev/null 2>&1; then
        log "✅ SSL certificate is valid"
    else
        warning "SSL certificate check failed"
    fi
fi

# Cleanup
log "🧹 Cleaning up temporary files..."
rm -rf /tmp/mymeds-deploy

# Display deployment summary
log "=== DEPLOYMENT SUMMARY ==="
log "Deployment Directory: $DEPLOY_DIR"
log "Backup Directory: $BACKUP_DIR"
log "Log File: $LOG_FILE"
log "Timestamp: $TIMESTAMP"

# Show service status
log "=== SERVICE STATUS ==="
sudo pm2 status
sudo systemctl status nginx --no-pager -l

log "🎉 Deployment completed successfully!"
log "🌐 Application is live and ready to serve requests"

# Optional: Send notification
if command -v curl > /dev/null && [ -n "$WEBHOOK_URL" ]; then
    curl -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{\"text\":\"✅ MyMeds Pharmacy deployment completed successfully at $(date)\"}" \
        || warning "Failed to send notification"
fi
