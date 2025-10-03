#!/bin/bash

# MyMeds Pharmacy - VPS Deployment Script
# This script deploys the MyMeds Pharmacy application to a VPS with MySQL

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
BACKUP_DIR="/var/www/mymeds/backups"
LOG_DIR="/var/www/mymeds/logs"
UPLOAD_DIR="/var/www/mymeds/uploads"
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"
PM2_APP_NAME="mymeds-backend"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_error "This script should not be run as root for security reasons"
        print_status "Please run as a regular user with sudo privileges"
        exit 1
    fi
}

# Function to install system dependencies
install_system_dependencies() {
    print_status "Installing system dependencies..."
    
    sudo apt update
    sudo apt install -y \
        curl \
        wget \
        git \
        nginx \
        mysql-server \
        nodejs \
        npm \
        pm2 \
        certbot \
        python3-certbot-nginx \
        ufw \
        fail2ban \
        htop \
        unzip \
        build-essential
    
    print_success "System dependencies installed"
}

# Function to configure MySQL
configure_mysql() {
    print_status "Configuring MySQL..."
    
    # Start MySQL service
    sudo systemctl start mysql
    sudo systemctl enable mysql
    
    # Run MySQL setup script
    if [ -f "mysql-setup.sql" ]; then
        print_status "Running MySQL setup script..."
        sudo mysql < mysql-setup.sql
        print_success "MySQL database configured"
    else
        print_warning "MySQL setup script not found. Please run it manually."
    fi
}

# Function to configure Node.js
configure_nodejs() {
    print_status "Configuring Node.js..."
    
    # Install Node.js 18.x if not already installed
    if ! command_exists node || [[ $(node -v | cut -d'v' -f2 | cut -d'.' -f1) -lt 18 ]]; then
        print_status "Installing Node.js 18.x..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    
    # Install PM2 globally
    sudo npm install -g pm2
    
    print_success "Node.js configured"
}

# Function to create application directories
create_directories() {
    print_status "Creating application directories..."
    
    sudo mkdir -p $APP_DIR
    sudo mkdir -p $BACKUP_DIR
    sudo mkdir -p $LOG_DIR
    sudo mkdir -p $UPLOAD_DIR
    
    # Set ownership
    sudo chown -R $USER:$USER $APP_DIR
    
    print_success "Application directories created"
}

# Function to deploy application code
deploy_application() {
    print_status "Deploying application code..."
    
    # Create backup of current deployment
    if [ -d "$APP_DIR/current" ]; then
        print_status "Creating backup of current deployment..."
        sudo cp -r $APP_DIR/current $BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S)
    fi
    
    # Copy application files
    sudo cp -r . $APP_DIR/current/
    cd $APP_DIR/current
    
    # Install dependencies
    print_status "Installing backend dependencies..."
    cd backend
    npm ci --production
    
    print_status "Installing frontend dependencies..."
    cd ../frontend
    npm ci --production
    
    # Build frontend
    print_status "Building frontend..."
    npm run build
    
    # Build backend
    print_status "Building backend..."
    cd ../backend
    npm run build
    
    print_success "Application deployed"
}

# Function to configure environment
configure_environment() {
    print_status "Configuring environment..."
    
    # Copy environment file
    if [ -f "env.production" ]; then
        cp env.production $APP_DIR/current/backend/.env
        print_success "Environment configured"
    else
        print_warning "Production environment file not found"
        print_status "Please create .env file manually in $APP_DIR/current/backend/"
    fi
}

# Function to run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    cd $APP_DIR/current/backend
    
    # Generate Prisma client
    npx prisma generate
    
    # Run migrations
    npx prisma migrate deploy
    
    print_success "Database migrations completed"
}

# Function to configure PM2
configure_pm2() {
    print_status "Configuring PM2..."
    
    cd $APP_DIR/current/backend
    
    # Create PM2 ecosystem file
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$PM2_APP_NAME',
    script: 'dist/index.js',
    cwd: '$APP_DIR/current/backend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    error_file: '$LOG_DIR/error.log',
    out_file: '$LOG_DIR/out.log',
    log_file: '$LOG_DIR/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
EOF
    
    # Start application with PM2
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup
    
    print_success "PM2 configured and application started"
}

# Function to configure Nginx
configure_nginx() {
    print_status "Configuring Nginx..."
    
    # Create Nginx configuration
    sudo tee $NGINX_SITES_AVAILABLE/$APP_NAME << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL configuration (will be configured by Certbot)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
    
    # Frontend (React app)
    location / {
        root $APP_DIR/current/dist;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://localhost:4000/api/health;
        access_log off;
    }
    
    # File uploads
    location /uploads {
        alias $UPLOAD_DIR;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }
    
    location ~ \.(env|log|sql)$ {
        deny all;
    }
}
EOF
    
    # Enable site
    sudo ln -sf $NGINX_SITES_AVAILABLE/$APP_NAME $NGINX_SITES_ENABLED/
    
    # Test Nginx configuration
    sudo nginx -t
    
    # Reload Nginx
    sudo systemctl reload nginx
    
    print_success "Nginx configured"
}

# Function to configure SSL with Let's Encrypt
configure_ssl() {
    print_status "Configuring SSL with Let's Encrypt..."
    
    # Get domain name from user
    read -p "Enter your domain name (e.g., mymedspharmacyinc.com): " DOMAIN_NAME
    
    if [ -z "$DOMAIN_NAME" ]; then
        print_warning "No domain name provided. Skipping SSL configuration."
        return
    fi
    
    # Update Nginx configuration with domain name
    sudo sed -i "s/your-domain.com/$DOMAIN_NAME/g" $NGINX_SITES_AVAILABLE/$APP_NAME
    
    # Obtain SSL certificate
    sudo certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME --non-interactive --agree-tos --email admin@$DOMAIN_NAME
    
    # Reload Nginx
    sudo systemctl reload nginx
    
    print_success "SSL configured for $DOMAIN_NAME"
}

# Function to configure firewall
configure_firewall() {
    print_status "Configuring firewall..."
    
    # Reset UFW
    sudo ufw --force reset
    
    # Default policies
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    
    # Allow SSH
    sudo ufw allow ssh
    
    # Allow HTTP and HTTPS
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    
    # Enable firewall
    sudo ufw --force enable
    
    print_success "Firewall configured"
}

# Function to configure fail2ban
configure_fail2ban() {
    print_status "Configuring fail2ban..."
    
    # Create custom jail for the application
    sudo tee /etc/fail2ban/jail.d/mymeds.conf << EOF
[mymeds-auth]
enabled = true
port = 80,443
filter = mymeds-auth
logpath = $LOG_DIR/combined.log
maxretry = 5
bantime = 3600
findtime = 600
EOF
    
    # Create filter for authentication failures
    sudo tee /etc/fail2ban/filter.d/mymeds-auth.conf << EOF
[Definition]
failregex = ^.*"POST /api/admin/login".*"status":401.*$
ignoreregex =
EOF
    
    # Restart fail2ban
    sudo systemctl restart fail2ban
    
    print_success "Fail2ban configured"
}

# Function to create backup script
create_backup_script() {
    print_status "Creating backup script..."
    
    sudo tee /usr/local/bin/mymeds-backup.sh << EOF
#!/bin/bash

# MyMeds Pharmacy Backup Script
BACKUP_DIR="$BACKUP_DIR"
APP_DIR="$APP_DIR"
DB_NAME="mymeds_pharmacy"
DB_USER="mymeds_user"
DB_PASS="Pharm-23-medS"
DATE=\$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p \$BACKUP_DIR

# Backup database
mysqldump -u\$DB_USER -p\$DB_PASS \$DB_NAME > \$BACKUP_DIR/db_backup_\$DATE.sql

# Backup application files
tar -czf \$BACKUP_DIR/app_backup_\$DATE.tar.gz -C \$APP_DIR current

# Remove old backups (keep last 30 days)
find \$BACKUP_DIR -name "*.sql" -mtime +30 -delete
find \$BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: \$DATE"
EOF
    
    sudo chmod +x /usr/local/bin/mymeds-backup.sh
    
    # Add to crontab for daily backups
    (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/mymeds-backup.sh") | crontab -
    
    print_success "Backup script created and scheduled"
}

# Function to create monitoring script
create_monitoring_script() {
    print_status "Creating monitoring script..."
    
    sudo tee /usr/local/bin/mymeds-monitor.sh << EOF
#!/bin/bash

# MyMeds Pharmacy Monitoring Script
LOG_FILE="$LOG_DIR/monitor.log"
APP_NAME="$PM2_APP_NAME"

# Check if PM2 process is running
if ! pm2 list | grep -q "\$APP_NAME.*online"; then
    echo "\$(date): Application is not running, restarting..." >> \$LOG_FILE
    pm2 restart \$APP_NAME
fi

# Check disk space
DISK_USAGE=\$(df / | awk 'NR==2 {print \$5}' | sed 's/%//')
if [ \$DISK_USAGE -gt 80 ]; then
    echo "\$(date): Disk usage is high: \$DISK_USAGE%" >> \$LOG_FILE
fi

# Check memory usage
MEMORY_USAGE=\$(free | awk 'NR==2{printf "%.2f", \$3*100/\$2}')
if (( \$(echo "\$MEMORY_USAGE > 80" | bc -l) )); then
    echo "\$(date): Memory usage is high: \$MEMORY_USAGE%" >> \$LOG_FILE
fi
EOF
    
    sudo chmod +x /usr/local/bin/mymeds-monitor.sh
    
    # Add to crontab for monitoring every 5 minutes
    (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/mymeds-monitor.sh") | crontab -
    
    print_success "Monitoring script created and scheduled"
}

# Function to display deployment summary
display_summary() {
    print_success "Deployment completed successfully!"
    echo
    echo "=========================================="
    echo "MyMeds Pharmacy Deployment Summary"
    echo "=========================================="
    echo "Application Directory: $APP_DIR"
    echo "Backup Directory: $BACKUP_DIR"
    echo "Log Directory: $LOG_DIR"
    echo "Upload Directory: $UPLOAD_DIR"
    echo
    echo "PM2 Process: $PM2_APP_NAME"
    echo "Nginx Site: $APP_NAME"
    echo
    echo "Next Steps:"
    echo "1. Update your domain name in Nginx configuration"
    echo "2. Configure SSL certificate with: sudo certbot --nginx -d your-domain.com"
    echo "3. Update environment variables in $APP_DIR/current/backend/.env"
    echo "4. Test the application at http://your-domain.com"
    echo
    echo "Useful Commands:"
    echo "  pm2 status                    # Check application status"
    echo "  pm2 logs $PM2_APP_NAME        # View application logs"
    echo "  pm2 restart $PM2_APP_NAME     # Restart application"
    echo "  sudo nginx -t                 # Test Nginx configuration"
    echo "  sudo systemctl reload nginx   # Reload Nginx"
    echo "  /usr/local/bin/mymeds-backup.sh  # Run manual backup"
    echo
}

# Main deployment function
main() {
    print_status "Starting MyMeds Pharmacy VPS deployment..."
    
    # Check if running as root
    check_root
    
    # Install system dependencies
    install_system_dependencies
    
    # Configure MySQL
    configure_mysql
    
    # Configure Node.js
    configure_nodejs
    
    # Create application directories
    create_directories
    
    # Deploy application code
    deploy_application
    
    # Configure environment
    configure_environment
    
    # Run database migrations
    run_migrations
    
    # Configure PM2
    configure_pm2
    
    # Configure Nginx
    configure_nginx
    
    # Configure SSL (optional)
    read -p "Do you want to configure SSL with Let's Encrypt? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        configure_ssl
    fi
    
    # Configure firewall
    configure_firewall
    
    # Configure fail2ban
    configure_fail2ban
    
    # Create backup script
    create_backup_script
    
    # Create monitoring script
    create_monitoring_script
    
    # Display summary
    display_summary
}

# Run main function
main "$@"

