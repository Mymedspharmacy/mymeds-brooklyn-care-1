#!/bin/bash

# MyMeds Pharmacy Inc. - Fresh VPS Deployment Script
# This script performs a complete fresh deployment on your VPS
# Run this script on your VPS server

set -e  # Exit on any error

echo "========================================="
echo "MyMeds Pharmacy - Fresh VPS Deployment"
echo "========================================="
echo ""

# Configuration
APP_DIR="/var/www/mymeds"
LOG_DIR="/var/log/mymeds"
BACKUP_DIR="/var/backups/mymeds"
DB_NAME="mymeds_production"
DB_USER="mymeds_user"
DB_PASS="Pharm-23-medS"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${YELLOW}[i]${NC} $1"
}

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run with sudo: sudo bash deploy-vps.sh"
    exit 1
fi

print_info "Starting fresh deployment..."
echo ""

# Step 1: System Update
print_info "Step 1: Updating system packages..."
apt update && apt upgrade -y
print_status "System updated"
echo ""

# Step 2: Install Required Software
print_info "Step 2: Installing required software..."

# Install Node.js 18.x
if ! command -v node &> /dev/null; then
    print_info "Installing Node.js 18.x..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    print_status "Node.js installed: $(node --version)"
else
    print_status "Node.js already installed: $(node --version)"
fi

# Install MySQL
if ! command -v mysql &> /dev/null; then
    print_info "Installing MySQL..."
    apt install -y mysql-server
    systemctl start mysql
    systemctl enable mysql
    print_status "MySQL installed"
else
    print_status "MySQL already installed"
fi

# Install Nginx
if ! command -v nginx &> /dev/null; then
    print_info "Installing Nginx..."
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
    print_status "Nginx installed"
else
    print_status "Nginx already installed"
fi

# Install PM2
if ! command -v pm2 &> /dev/null; then
    print_info "Installing PM2..."
    npm install -g pm2
    print_status "PM2 installed"
else
    print_status "PM2 already installed"
fi

# Install other utilities
apt install -y git curl wget unzip certbot python3-certbot-nginx
print_status "Required software installed"
echo ""

# Step 3: Create Directories
print_info "Step 3: Creating application directories..."
mkdir -p $APP_DIR
mkdir -p $LOG_DIR
mkdir -p $BACKUP_DIR
mkdir -p $APP_DIR/backend/uploads
mkdir -p $APP_DIR/backend/logs
print_status "Directories created"
echo ""

# Step 4: Setup MySQL Database
print_info "Step 4: Setting up MySQL database..."
mysql -u root <<MYSQL_SCRIPT
DROP DATABASE IF EXISTS $DB_NAME;
CREATE DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
DROP USER IF EXISTS '$DB_USER'@'localhost';
CREATE USER '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
MYSQL_SCRIPT
print_status "Database created: $DB_NAME"
echo ""

# Step 5: Copy Application Files
print_info "Step 5: Copying application files to $APP_DIR..."
print_info "Please ensure you've uploaded your files to the server first"
print_info "Current directory: $(pwd)"
read -p "Press Enter to continue once files are in place..."

# If files are in current directory, copy them
if [ -f "package.json" ]; then
    cp -r ./* $APP_DIR/
    print_status "Files copied to $APP_DIR"
else
    print_info "Please manually copy files to $APP_DIR"
fi
echo ""

# Step 6: Install Dependencies
print_info "Step 6: Installing application dependencies..."
cd $APP_DIR

if [ -f "package.json" ]; then
    print_info "Installing frontend dependencies..."
    npm install --production
    print_status "Frontend dependencies installed"
fi

if [ -f "backend/package.json" ]; then
    print_info "Installing backend dependencies..."
    cd backend
    npm install --production
    cd ..
    print_status "Backend dependencies installed"
fi
echo ""

# Step 7: Setup Environment Files
print_info "Step 7: Setting up environment files..."

# Frontend environment
cat > $APP_DIR/.env.production <<EOL
NODE_ENV=production
VITE_API_URL=http://localhost:4000
VITE_WORDPRESS_URL=
VITE_WOOCOMMERCE_URL=
EOL
print_status "Frontend .env created"

# Backend environment
cat > $APP_DIR/backend/.env <<EOL
NODE_ENV=production
PORT=4000
HOST=0.0.0.0

# Database
DATABASE_URL="mysql://${DB_USER}:${DB_PASS}@localhost:3306/${DB_NAME}"

# JWT
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=24h
SESSION_SECRET=$(openssl rand -hex 32)
BCRYPT_ROUNDS=12

# Admin
ADMIN_EMAIL=admin@mymedspharmacyinc.com
ADMIN_PASSWORD=Admin123!Change

# CORS
CORS_ORIGIN=http://localhost:3000,https://mymedspharmacyinc.com,https://www.mymedspharmacyinc.com
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
EOL
print_status "Backend .env created"
echo ""

# Step 8: Run Database Migrations
print_info "Step 8: Running database migrations..."
cd $APP_DIR/backend
npx prisma generate
npx prisma migrate deploy
print_status "Database migrations completed"
echo ""

# Step 9: Build Applications
print_info "Step 9: Building applications..."

# Build frontend
cd $APP_DIR
if [ -f "package.json" ]; then
    npm run build
    print_status "Frontend built"
fi

# Build backend
cd $APP_DIR/backend
if [ -f "package.json" ]; then
    npm run build
    print_status "Backend built"
fi
echo ""

# Step 10: Setup PM2
print_info "Step 10: Setting up PM2 process manager..."

# Create PM2 ecosystem config
cat > $APP_DIR/ecosystem.config.js <<EOL
module.exports = {
  apps: [
    {
      name: 'mymeds-backend',
      script: './backend/dist/index.js',
      cwd: '$APP_DIR',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      error_file: '$LOG_DIR/backend-error.log',
      out_file: '$LOG_DIR/backend-out.log',
      log_file: '$LOG_DIR/backend-combined.log',
      time: true,
      max_memory_restart: '1G',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
EOL

# Stop any existing PM2 processes
pm2 delete all 2>/dev/null || true

# Start applications with PM2
cd $APP_DIR
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root

print_status "PM2 configured and applications started"
echo ""

# Step 11: Setup Nginx
print_info "Step 11: Configuring Nginx..."

cat > /etc/nginx/sites-available/mymeds <<'EOL'
server {
    listen 80;
    server_name mymedspharmacyinc.com www.mymedspharmacyinc.com;

    # Frontend (React app)
    root /var/www/mymeds/dist;
    index index.html;

    # Serve static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /socket.io {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # Logging
    access_log /var/log/nginx/mymeds-access.log;
    error_log /var/log/nginx/mymeds-error.log;

    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
}
EOL

# Enable site
ln -sf /etc/nginx/sites-available/mymeds /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t

# Restart nginx
systemctl restart nginx

print_status "Nginx configured and restarted"
echo ""

# Step 12: Setup Firewall
print_info "Step 12: Configuring firewall..."
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable
print_status "Firewall configured"
echo ""

# Step 13: Set Permissions
print_info "Step 13: Setting file permissions..."
chown -R www-data:www-data $APP_DIR
chmod -R 755 $APP_DIR
chmod -R 777 $APP_DIR/backend/uploads
chmod -R 777 $LOG_DIR
print_status "Permissions set"
echo ""

# Step 14: Health Check
print_info "Step 14: Performing health check..."
sleep 5

if curl -f http://localhost:4000/api/health > /dev/null 2>&1; then
    print_status "Backend API is responding"
else
    print_error "Backend API is not responding"
fi

if curl -f http://localhost > /dev/null 2>&1; then
    print_status "Frontend is responding"
else
    print_error "Frontend is not responding"
fi
echo ""

# Step 15: Display Status
echo "========================================="
echo "Deployment Summary"
echo "========================================="
pm2 status
echo ""
echo "Application Directory: $APP_DIR"
echo "Log Directory: $LOG_DIR"
echo "Database: $DB_NAME"
echo ""
echo "Services:"
echo "  - Backend API: http://localhost:4000"
echo "  - Frontend: http://localhost"
echo "  - Database: MySQL on localhost:3306"
echo ""
echo "Useful Commands:"
echo "  - View PM2 status: pm2 status"
echo "  - View logs: pm2 logs"
echo "  - Restart app: pm2 restart all"
echo "  - Monitor: pm2 monit"
echo "  - View Nginx logs: tail -f /var/log/nginx/mymeds-error.log"
echo ""
print_status "Fresh deployment completed successfully!"
echo ""
print_info "Next steps:"
echo "  1. Update admin password: cd $APP_DIR/backend && npm run create-admin"
echo "  2. Setup SSL: sudo certbot --nginx -d mymedspharmacyinc.com -d www.mymedspharmacyinc.com"
echo "  3. Configure environment variables in $APP_DIR/backend/.env"
echo "  4. Test all functionality"
echo ""

