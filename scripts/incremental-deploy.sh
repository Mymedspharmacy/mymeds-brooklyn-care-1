#!/bin/bash

# Incremental Deployment Script for MyMeds Pharmacy
# This script handles incremental deployments with minimal downtime

set -e

# Configuration
VPS_HOST="${VPS_HOST:-72.60.116.253}"
VPS_USER="${VPS_USER:-root}"
VPS_PORT="${VPS_PORT:-22}"
DEPLOY_PATH="/var/www/mymeds-pharmacy"
BACKUP_PATH="/var/backups/mymeds-pharmacy"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to create backup
create_backup() {
    log "Creating backup of current deployment..."
    
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "
        cd $DEPLOY_PATH
        if [ -d 'current' ]; then
            BACKUP_DIR=\"$BACKUP_PATH/backup-\$(date +%Y%m%d-%H%M%S)\"
            sudo mkdir -p \$BACKUP_DIR
            sudo cp -r current/* \$BACKUP_DIR/
            echo \"✅ Backup created at \$BACKUP_DIR\"
        else
            echo \"⚠️  No current deployment found to backup\"
        fi
    "
}

# Function to deploy frontend changes
deploy_frontend() {
    log "Deploying frontend changes..."
    
    # Build frontend
    npm run build:prod
    
    # Upload built files
    rsync -avz --delete -e "ssh -p $VPS_PORT" \
        dist/ $VPS_USER@$VPS_HOST:$DEPLOY_PATH/current/public/
    
    success "Frontend deployed successfully"
}

# Function to deploy backend changes
deploy_backend() {
    log "Deploying backend changes..."
    
    # Build backend
    cd backend
    npm run build
    cd ..
    
    # Upload backend files
    rsync -avz --delete -e "ssh -p $VPS_PORT" \
        backend/dist/ $VPS_USER@$VPS_HOST:$DEPLOY_PATH/current/backend/dist/
    
    # Upload package.json and other necessary files
    rsync -avz -e "ssh -p $VPS_PORT" \
        backend/package.json $VPS_USER@$VPS_HOST:$DEPLOY_PATH/current/backend/
    
    success "Backend deployed successfully"
}

# Function to update dependencies
update_dependencies() {
    log "Updating dependencies..."
    
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "
        cd $DEPLOY_PATH/current
        
        # Update frontend dependencies
        npm ci --production
        
        # Update backend dependencies
        cd backend
        npm ci --production
        cd ..
        
        echo \"✅ Dependencies updated\"
    "
}

# Function to run database migrations
run_migrations() {
    log "Running database migrations..."
    
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "
        cd $DEPLOY_PATH/current/backend
        npm run prisma:migrate
        echo \"✅ Database migrations completed\"
    "
}

# Function to restart services
restart_services() {
    log "Restarting services..."
    
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "
        # Restart backend
        sudo pm2 restart mymeds-backend
        
        # Reload nginx
        sudo systemctl reload nginx
        
        echo \"✅ Services restarted\"
    "
}

# Function to perform health check
health_check() {
    log "Performing health check..."
    
    # Wait for services to start
    sleep 10
    
    # Check backend health
    if ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "curl -f http://localhost:4000/api/health > /dev/null 2>&1"; then
        success "Backend health check passed"
    else
        error "Backend health check failed"
        return 1
    fi
    
    # Check frontend
    if ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "curl -f http://localhost > /dev/null 2>&1"; then
        success "Frontend health check passed"
    else
        error "Frontend health check failed"
        return 1
    fi
}

# Function to rollback deployment
rollback() {
    warning "Rolling back to previous version..."
    
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "
        cd $DEPLOY_PATH
        
        # Find latest backup
        LATEST_BACKUP=\$(ls -t $BACKUP_PATH/backup-* 2>/dev/null | head -n1)
        
        if [ -n \"\$LATEST_BACKUP\" ]; then
            sudo rm -rf current
            sudo cp -r \$LATEST_BACKUP current
            sudo pm2 restart mymeds-backend
            sudo systemctl reload nginx
            echo \"✅ Rolled back to \$LATEST_BACKUP\"
        else
            echo \"❌ No backup found for rollback\"
            exit 1
        fi
    "
}

# Function to show deployment status
show_status() {
    log "Current deployment status:"
    
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "
        cd $DEPLOY_PATH
        
        echo \"📁 Current deployment:\"
        ls -la current/ 2>/dev/null || echo \"No current deployment\"
        
        echo \"\n📦 PM2 processes:\"
        sudo pm2 list
        
        echo \"\n🌐 Nginx status:\"
        sudo systemctl status nginx --no-pager -l
        
        echo \"\n💾 Available backups:\"
        ls -la $BACKUP_PATH/ 2>/dev/null || echo \"No backups available\"
    "
}

# Main deployment function
deploy() {
    local deploy_type="${1:-full}"
    
    log "Starting $deploy_type deployment..."
    
    case $deploy_type in
        "frontend")
            create_backup
            deploy_frontend
            restart_services
            health_check
            ;;
        "backend")
            create_backup
            deploy_backend
            update_dependencies
            run_migrations
            restart_services
            health_check
            ;;
        "full")
            create_backup
            deploy_frontend
            deploy_backend
            update_dependencies
            run_migrations
            restart_services
            health_check
            ;;
        *)
            error "Invalid deployment type: $deploy_type"
            echo "Usage: $0 [frontend|backend|full]"
            exit 1
            ;;
    esac
    
    success "Deployment completed successfully!"
}

# Function to setup deployment environment
setup() {
    log "Setting up deployment environment..."
    
    # Check required tools
    if ! command_exists rsync; then
        error "rsync is required but not installed"
        exit 1
    fi
    
    if ! command_exists ssh; then
        error "ssh is required but not installed"
        exit 1
    fi
    
    # Create SSH key if it doesn't exist
    if [ ! -f ~/.ssh/id_rsa ]; then
        log "Generating SSH key..."
        ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
        success "SSH key generated"
        warning "Please add the public key to your VPS: cat ~/.ssh/id_rsa.pub"
    fi
    
    # Test SSH connection
    log "Testing SSH connection..."
    if ssh -p $VPS_PORT -o ConnectTimeout=10 $VPS_USER@$VPS_HOST "echo 'SSH connection successful'"; then
        success "SSH connection successful"
    else
        error "SSH connection failed"
        exit 1
    fi
    
    success "Setup completed successfully!"
}

# Main script logic
case "${1:-deploy}" in
    "setup")
        setup
        ;;
    "deploy")
        deploy "${2:-full}"
        ;;
    "rollback")
        rollback
        ;;
    "status")
        show_status
        ;;
    "health")
        health_check
        ;;
    *)
        echo "MyMeds Pharmacy Deployment Script"
        echo ""
        echo "Usage: $0 [command] [options]"
        echo ""
        echo "Commands:"
        echo "  setup                    Setup deployment environment"
        echo "  deploy [type]           Deploy application (frontend|backend|full)"
        echo "  rollback                Rollback to previous version"
        echo "  status                  Show deployment status"
        echo "  health                  Perform health check"
        echo ""
        echo "Examples:"
        echo "  $0 setup"
        echo "  $0 deploy frontend"
        echo "  $0 deploy backend"
        echo "  $0 deploy full"
        echo "  $0 rollback"
        echo "  $0 status"
        echo ""
        echo "Environment Variables:"
        echo "  VPS_HOST                VPS IP address (default: your-vps-ip)"
        echo "  VPS_USER                VPS username (default: root)"
        echo "  VPS_PORT                VPS SSH port (default: 22)"
        ;;
esac
