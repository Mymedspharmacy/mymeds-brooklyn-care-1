#!/bin/bash

# 🏥 MyMeds Pharmacy - VPS Deployment Check Script
# This script checks the current deployment status on your VPS

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
LOG_DIR="/var/log/mymeds"

# Logging function
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

log "🔍 Checking MyMeds Pharmacy deployment status on VPS..."

# Check if deployment directory exists
if [ -d "$DEPLOY_DIR" ]; then
    log "✅ Deployment directory exists: $DEPLOY_DIR"
    
    # Check directory contents
    log "📁 Current deployment contents:"
    ls -la "$DEPLOY_DIR" | head -20
    
    # Check if it's a git repository
    if [ -d "$DEPLOY_DIR/.git" ]; then
        log "📦 Current deployment is a git repository"
        cd "$DEPLOY_DIR"
        log "🔍 Current git status:"
        git status --short
        log "📋 Current branch: $(git branch --show-current)"
        log "📅 Last commit: $(git log -1 --format='%h - %s (%cr)')"
    else
        warning "⚠️ Current deployment is not a git repository"
    fi
    
    # Check package.json version
    if [ -f "$DEPLOY_DIR/package.json" ]; then
        log "📋 Current frontend version:"
        grep '"version"' "$DEPLOY_DIR/package.json" || echo "No version found"
    fi
    
    if [ -f "$DEPLOY_DIR/backend/package.json" ]; then
        log "📋 Current backend version:"
        grep '"version"' "$DEPLOY_DIR/backend/package.json" || echo "No version found"
    fi
    
else
    warning "⚠️ Deployment directory does not exist: $DEPLOY_DIR"
fi

# Check services status
log "🔧 Checking service status..."

# Check PM2 processes
if command -v pm2 > /dev/null; then
    log "📊 PM2 processes:"
    pm2 status
else
    warning "⚠️ PM2 not found"
fi

# Check Nginx status
if command -v nginx > /dev/null; then
    log "🌐 Nginx status:"
    systemctl status nginx --no-pager -l | head -10
else
    warning "⚠️ Nginx not found"
fi

# Check MySQL status
if command -v mysql > /dev/null; then
    log "🗄️ MySQL status:"
    systemctl status mysql --no-pager -l | head -10
else
    warning "⚠️ MySQL not found"
fi

# Check Redis status
if command -v redis-server > /dev/null; then
    log "🔴 Redis status:"
    systemctl status redis-server --no-pager -l | head -10
else
    warning "⚠️ Redis not found"
fi

# Check disk space
log "💾 Disk space usage:"
df -h

# Check memory usage
log "🧠 Memory usage:"
free -h

# Check if application is responding
log "🏥 Testing application health..."

# Test backend health
if curl -f http://localhost:4000/api/health > /dev/null 2>&1; then
    log "✅ Backend health check passed"
else
    error "❌ Backend health check failed"
fi

# Test frontend
if curl -f http://localhost:80 > /dev/null 2>&1; then
    log "✅ Frontend is responding"
else
    error "❌ Frontend is not responding"
fi

# Check SSL certificate
if [ -n "$DOMAIN" ]; then
    log "🔒 Checking SSL certificate for $DOMAIN..."
    if curl -f https://localhost > /dev/null 2>&1; then
        log "✅ SSL certificate is valid"
    else
        warning "⚠️ SSL certificate check failed"
    fi
fi

# Check recent logs
log "📋 Recent deployment logs:"
if [ -f "/var/log/mymeds-deployment.log" ]; then
    tail -20 /var/log/mymeds-deployment.log
else
    warning "⚠️ No deployment log found"
fi

# Check application logs
log "📋 Recent application logs:"
if [ -d "$LOG_DIR" ]; then
    find "$LOG_DIR" -name "*.log" -type f -exec tail -5 {} \; 2>/dev/null || echo "No application logs found"
else
    warning "⚠️ No application log directory found"
fi

# Check backups
log "💾 Checking backups:"
if [ -d "$BACKUP_DIR" ]; then
    log "📦 Available backups:"
    ls -la "$BACKUP_DIR" | head -10
else
    warning "⚠️ No backup directory found"
fi

# Check environment configuration
log "⚙️ Checking environment configuration:"
if [ -f "$DEPLOY_DIR/backend/.env" ]; then
    log "✅ Backend .env file exists"
    # Show non-sensitive config
    grep -E "^(NODE_ENV|PORT|DATABASE_URL)" "$DEPLOY_DIR/backend/.env" 2>/dev/null || echo "No environment variables found"
else
    warning "⚠️ Backend .env file not found"
fi

# Check database connection
log "🗄️ Testing database connection:"
if [ -f "$DEPLOY_DIR/backend/.env" ]; then
    cd "$DEPLOY_DIR/backend"
    if npx prisma db pull > /dev/null 2>&1; then
        log "✅ Database connection successful"
    else
        error "❌ Database connection failed"
    fi
fi

# Summary
log "=== DEPLOYMENT CHECK SUMMARY ==="
log "Deployment Directory: $DEPLOY_DIR"
log "Backup Directory: $BACKUP_DIR"
log "Log Directory: $LOG_DIR"

if [ -d "$DEPLOY_DIR" ]; then
    log "✅ MyMeds Pharmacy is currently deployed"
    log "🔄 Ready for update/replacement"
else
    log "❌ No current deployment found"
    log "🚀 Ready for fresh installation"
fi

log "🎯 Next steps:"
log "1. Review the current deployment status above"
log "2. Create backup if needed"
log "3. Deploy new version using GitHub Actions or manual deployment"
log "4. Verify new deployment is working"

log "✅ VPS deployment check completed!"
