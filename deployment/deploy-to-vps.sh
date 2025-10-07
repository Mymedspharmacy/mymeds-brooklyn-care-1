#!/bin/bash

# My Meds Pharmacy - VPS Deployment Script
# Run this script on your VPS to deploy the complete system

set -e  # Exit on any error

echo "🚀 Starting My Meds Pharmacy Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/Mymedspharmacy/mymeds-brooklyn-care-1.git"
BRANCH="latest"
APP_DIR="/var/www/mymeds-pharmacy"
BACKEND_PORT="3001"
FRONTEND_PORT="3000"
DOMAIN="mymedspharmacyinc.com"

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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
print_status "Installing required packages..."
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx ufw fail2ban htop

# Install Node.js 18.x
print_status "Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
print_status "Installing PM2 process manager..."
sudo npm install -g pm2

# Install PostgreSQL (if not already installed)
print_status "Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib

# Create application directory
print_status "Creating application directory..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Clone or update repository
print_status "Cloning/updating repository..."
if [ -d "$APP_DIR/.git" ]; then
    cd $APP_DIR
    git fetch origin
    git reset --hard origin/$BRANCH
    print_success "Repository updated"
else
    git clone -b $BRANCH $REPO_URL $APP_DIR
    print_success "Repository cloned"
fi

cd $APP_DIR

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
npm install --production

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd ../src
npm install --production

# Build frontend
print_status "Building frontend..."
npm run build

# Go back to root directory
cd ..

# Create environment files
print_status "Creating environment files..."

# Backend .env
cat > backend/.env << EOF
NODE_ENV=production
PORT=$BACKEND_PORT
DATABASE_URL="postgresql://mymeds_user:mymeds_password@localhost:5432/mymeds_pharmacy"
JWT_SECRET="your-super-secure-jwt-secret-key-change-this"
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://$DOMAIN
WOOCOMMERCE_STORE_URL="https://your-woocommerce-store.com"
WOOCOMMERCE_CONSUMER_KEY="your-consumer-key"
WOOCOMMERCE_CONSUMER_SECRET="your-consumer-secret"
WORDPRESS_URL="https://your-wordpress-site.com"
WORDPRESS_USERNAME="your-wp-username"
WORDPRESS_PASSWORD="your-wp-password"
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
EOF

# Frontend .env
cat > .env << EOF
VITE_API_URL=https://$DOMAIN/api
VITE_WORDPRESS_URL=https://your-wordpress-site.com
VITE_WOOCOMMERCE_URL=https://your-woocommerce-store.com
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
EOF

# Setup PostgreSQL database
print_status "Setting up PostgreSQL database..."
sudo -u postgres psql << EOF
CREATE DATABASE mymeds_pharmacy;
CREATE USER mymeds_user WITH PASSWORD 'mymeds_password';
GRANT ALL PRIVILEGES ON DATABASE mymeds_pharmacy TO mymeds_user;
\q
EOF

# Run database migrations
print_status "Running database migrations..."
cd backend
npx prisma migrate deploy
npx prisma generate

# Create PM2 ecosystem file
print_status "Creating PM2 ecosystem configuration..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'mymeds-backend',
      script: 'dist/index.js',
      cwd: '$APP_DIR/backend',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: $BACKEND_PORT
      },
      error_file: '/var/log/pm2/mymeds-backend-error.log',
      out_file: '/var/log/pm2/mymeds-backend-out.log',
      log_file: '/var/log/pm2/mymeds-backend.log',
      time: true
    },
    {
      name: 'mymeds-frontend',
      script: 'serve',
      args: '-s dist -l $FRONTEND_PORT',
      cwd: '$APP_DIR/src',
      instances: 1,
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/var/log/pm2/mymeds-frontend-error.log',
      out_file: '/var/log/pm2/mymeds-frontend-out.log',
      log_file: '/var/log/pm2/mymeds-frontend.log',
      time: true
    }
  ]
};
EOF

# Install serve for frontend
print_status "Installing serve for frontend..."
cd ../src
npm install -g serve

# Create PM2 log directory
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2

# Start applications with PM2
print_status "Starting applications with PM2..."
cd $APP_DIR
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Configure Nginx
print_status "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/mymeds-pharmacy << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # SSL configuration (will be updated by certbot)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Frontend (React app)
    location / {
        proxy_pass http://localhost:$FRONTEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:$BACKEND_PORT/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # File uploads
    location /uploads/ {
        proxy_pass http://localhost:$BACKEND_PORT/uploads/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/mymeds-pharmacy /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Configure firewall
print_status "Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Setup SSL certificate with Let's Encrypt
print_status "Setting up SSL certificate..."
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# Restart services
print_status "Restarting services..."
sudo systemctl restart nginx
sudo systemctl enable nginx
sudo systemctl restart postgresql
sudo systemctl enable postgresql

# Setup log rotation
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/mymeds-pharmacy << EOF
/var/log/pm2/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# Create backup script
print_status "Creating backup script..."
sudo tee /usr/local/bin/backup-mymeds.sh << EOF
#!/bin/bash
BACKUP_DIR="/var/backups/mymeds-pharmacy"
DATE=\$(date +%Y%m%d_%H%M%S)
mkdir -p \$BACKUP_DIR

# Backup database
pg_dump -h localhost -U mymeds_user mymeds_pharmacy > \$BACKUP_DIR/database_\$DATE.sql

# Backup uploads
tar -czf \$BACKUP_DIR/uploads_\$DATE.tar.gz $APP_DIR/backend/uploads/

# Keep only last 7 days of backups
find \$BACKUP_DIR -name "*.sql" -mtime +7 -delete
find \$BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
EOF

sudo chmod +x /usr/local/bin/backup-mymeds.sh

# Setup daily backup cron job
echo "0 2 * * * /usr/local/bin/backup-mymeds.sh" | sudo crontab -

# Create monitoring script
print_status "Creating monitoring script..."
sudo tee /usr/local/bin/monitor-mymeds.sh << EOF
#!/bin/bash
# Check if services are running
if ! pm2 list | grep -q "mymeds-backend.*online"; then
    echo "Backend is down, restarting..."
    pm2 restart mymeds-backend
fi

if ! pm2 list | grep -q "mymeds-frontend.*online"; then
    echo "Frontend is down, restarting..."
    pm2 restart mymeds-frontend
fi

# Check disk space
DISK_USAGE=\$(df / | awk 'NR==2 {print \$5}' | sed 's/%//')
if [ \$DISK_USAGE -gt 80 ]; then
    echo "Warning: Disk usage is \${DISK_USAGE}%"
fi

# Check memory usage
MEM_USAGE=\$(free | awk 'NR==2{printf "%.0f", \$3*100/\$2}')
if [ \$MEM_USAGE -gt 80 ]; then
    echo "Warning: Memory usage is \${MEM_USAGE}%"
fi
EOF

sudo chmod +x /usr/local/bin/monitor-mymeds.sh

# Setup monitoring cron job
echo "*/5 * * * * /usr/local/bin/monitor-mymeds.sh" | sudo crontab -

print_success "Deployment completed successfully!"
print_status "Your My Meds Pharmacy application is now running at: https://$DOMAIN"
print_status "Backend API: https://$DOMAIN/api"
print_status "Admin Panel: https://$DOMAIN/admin"

echo ""
print_status "Useful commands:"
echo "  pm2 status                    - Check application status"
echo "  pm2 logs                      - View application logs"
echo "  pm2 restart all              - Restart all applications"
echo "  sudo systemctl status nginx  - Check Nginx status"
echo "  sudo systemctl status postgresql - Check PostgreSQL status"

echo ""
print_warning "Don't forget to:"
echo "  1. Update the environment variables in backend/.env with your actual values"
echo "  2. Update the frontend .env with your actual API URLs"
echo "  3. Configure your WooCommerce and WordPress credentials"
echo "  4. Test all functionality after deployment"

print_success "Deployment script completed!"