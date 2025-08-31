#!/bin/bash

# 🚀 MyMeds Pharmacy Production Deployment Script
# This script automates the production deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="mymeds-pharmacy"
APP_DIR="/var/www/mymeds"
BACKUP_DIR="/var/backups/mymeds"
LOG_FILE="/var/log/mymeds/deployment.log"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

# Error function
error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

# Success function
success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

# Warning function
warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root. Please run as a regular user with sudo privileges."
fi

# Create log directory
sudo mkdir -p /var/log/mymeds
sudo chown $USER:$USER /var/log/mymeds

log "🚀 Starting MyMeds Pharmacy Production Deployment"
log "Timestamp: $TIMESTAMP"
log "User: $USER"
log "App Directory: $APP_DIR"

# Pre-deployment checks
log "🔍 Running pre-deployment checks..."

# Check if application directory exists
if [ ! -d "$APP_DIR" ]; then
    error "Application directory $APP_DIR does not exist. Please run server setup first."
fi

# Check if we're in the right directory
if [ ! -f "$APP_DIR/package.json" ]; then
    error "package.json not found in $APP_DIR. Please ensure you're in the correct directory."
fi

# Check if backend directory exists
if [ ! -d "$APP_DIR/backend" ]; then
    error "Backend directory not found. Please ensure the repository is properly cloned."
fi

# Check if .env file exists
if [ ! -f "$APP_DIR/backend/.env" ]; then
    error "Production .env file not found. Please configure environment variables first."
fi

success "Pre-deployment checks passed"

# Create backup
log "💾 Creating backup before deployment..."
sudo mkdir -p "$BACKUP_DIR"
cd "$APP_DIR"

# Backup application files
sudo tar -czf "$BACKUP_DIR/app_backup_$TIMESTAMP.tar.gz" \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=dist \
    --exclude=*.log \
    .

# Backup database (if MySQL is available)
if command -v mysql &> /dev/null; then
    log "🗄️ Creating database backup..."
    if [ -f "$APP_DIR/backend/.env" ]; then
        # Extract database URL from .env
        DATABASE_URL=$(grep DATABASE_URL "$APP_DIR/backend/.env" | cut -d '=' -f2-)
        if [[ $DATABASE_URL == mysql://* ]]; then
            # Extract database name from URL
            DB_NAME=$(echo $DATABASE_URL | sed 's/.*\///' | sed 's/\?.*//')
            DB_USER=$(echo $DATABASE_URL | sed 's/mysql:\/\///' | sed 's/:.*//')
            DB_PASS=$(echo $DATABASE_URL | sed 's/.*://' | sed 's/@.*//')
            
            if mysqldump -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql" 2>/dev/null; then
                sudo gzip "$BACKUP_DIR/db_backup_$TIMESTAMP.sql"
                success "Database backup created: db_backup_$TIMESTAMP.sql.gz"
            else
                warning "Database backup failed, continuing with deployment..."
            fi
        fi
    fi
fi

success "Backup completed"

# Stop PM2 processes
log "🛑 Stopping PM2 processes..."
if pm2 list | grep -q "mymeds-backend"; then
    pm2 stop mymeds-backend || warning "Failed to stop PM2 process"
fi

# Pull latest changes
log "📥 Pulling latest changes from repository..."
git fetch origin
git reset --hard origin/main
success "Repository updated"

# Install dependencies
log "📦 Installing frontend dependencies..."
npm install --production

log "📦 Installing backend dependencies..."
cd backend
npm install --production
cd ..

success "Dependencies installed"

# Run database migrations
log "🗄️ Running database migrations..."
cd backend
npx prisma generate
npx prisma migrate deploy
cd ..
success "Database migrations completed"

# Build application
log "🔨 Building application..."
npm run build
success "Application built successfully"

# Start PM2 processes
log "🚀 Starting PM2 processes..."
cd backend
pm2 start ecosystem.config.js --env production
pm2 save
cd ..
success "PM2 processes started"

# Wait for application to be ready
log "⏳ Waiting for application to be ready..."
sleep 10

# Test application health
log "🧪 Testing application health..."
HEALTH_CHECK_RETRIES=5
HEALTH_CHECK_DELAY=10

for i in $(seq 1 $HEALTH_CHECK_RETRIES); do
    if curl -f http://localhost:4000/api/health > /dev/null 2>&1; then
        success "Application health check passed"
        break
    else
        if [ $i -eq $HEALTH_CHECK_RETRIES ]; then
            error "Application health check failed after $HEALTH_CHECK_RETRIES attempts"
        else
            warning "Health check attempt $i failed, retrying in $HEALTH_CHECK_DELAY seconds..."
            sleep $HEALTH_CHECK_DELAY
        fi
    fi
done

# Reload Nginx configuration
log "🌐 Reloading Nginx configuration..."
if sudo nginx -t; then
    sudo systemctl reload nginx
    success "Nginx configuration reloaded"
else
    error "Nginx configuration test failed"
fi

# Cleanup old backups (keep last 7 days)
log "🧹 Cleaning up old backups..."
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete 2>/dev/null || true
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +7 -delete 2>/dev/null || true

# Final status check
log "📊 Final deployment status check..."
pm2 status
pm2 logs mymeds-backend --lines 10

# Deployment summary
log "🎉 Deployment completed successfully!"
log "📅 Deployment timestamp: $TIMESTAMP"
log "💾 Backup created: app_backup_$TIMESTAMP.tar.gz"
log "🌐 Application should be available at your domain"
log "📊 Monitor logs with: pm2 logs mymeds-backend"
log "📈 Monitor status with: pm2 monit"

# Save deployment info
echo "Deployment completed: $TIMESTAMP" >> "$LOG_FILE"
echo "Backup: app_backup_$TIMESTAMP.tar.gz" >> "$LOG_FILE"
echo "---" >> "$LOG_FILE"

success "🚀 MyMeds Pharmacy is now deployed to production!"
success "📚 Check the deployment documentation for monitoring and maintenance procedures"
success "🆘 For issues, check the troubleshooting guides or contact the DevOps team"

exit 0
