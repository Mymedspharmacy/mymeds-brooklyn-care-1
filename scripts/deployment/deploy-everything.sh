#!/bin/bash

# MyMeds Complete Deployment Script
# Domain: mymedspharmacyinc.com
# Frontend: www.mymedspharmacyinc.com
# Backend API: api.mymedspharmacyinc.com
# WooCommerce: shop.mymedspharmacyinc.com
# WordPress: blog.mymedspharmacyinc.com

set -e

echo "🚀 Starting MyMeds Complete Deployment..."
echo "Domain: mymedspharmacyinc.com"
echo "Frontend: www.mymedspharmacyinc.com"
echo "Backend API: api.mymedspharmacyinc.com"
echo "WooCommerce: shop.mymedspharmacyinc.com"
echo "WordPress: blog.mymedspharmacyinc.com"
echo ""

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install required packages
echo "🔧 Installing required packages..."
apt install -y curl wget git build-essential nginx mysql-server mysql-client unzip

# Install Node.js 20.x
echo "📦 Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# Install PM2
echo "📦 Installing PM2..."
npm install -g pm2

# Install Certbot for SSL
echo "🔒 Installing Certbot for SSL..."
apt install -y certbot python3-certbot-nginx

# Install firewall
echo "🛡️ Installing firewall..."
apt install -y ufw

# Install monitoring tools
echo "📊 Installing monitoring tools..."
apt install -y htop iotop nethogs logrotate apache2-utils

# Create directories
echo "📁 Creating application directories..."
mkdir -p /var/www/mymeds-backend
mkdir -p /var/www/mymeds-frontend
mkdir -p /var/www/mymeds-shop
mkdir -p /var/www/mymeds-blog
mkdir -p /var/log/mymeds
mkdir -p /var/backups/mymeds

# Set up MySQL
echo "🗄️ Setting up MySQL..."
systemctl start mysql
systemctl enable mysql

# Create MySQL database and user
echo "🗄️ Creating database and user..."
mysql -e "CREATE DATABASE IF NOT EXISTS mymeds_production;"
mysql -e "CREATE DATABASE IF NOT EXISTS mymeds_woocommerce;"
mysql -e "CREATE DATABASE IF NOT EXISTS mymeds_wordpress;"
mysql -e "CREATE USER IF NOT EXISTS 'mymeds_user'@'localhost' IDENTIFIED BY 'MyMeds2024!@#';"
mysql -e "GRANT ALL PRIVILEGES ON mymeds_production.* TO 'mymeds_user'@'localhost';"
mysql -e "GRANT ALL PRIVILEGES ON mymeds_woocommerce.* TO 'mymeds_user'@'localhost';"
mysql -e "GRANT ALL PRIVILEGES ON mymeds_wordpress.* TO 'mymeds_user'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

# Copy backend files
echo "📤 Setting up backend..."
cp -r dist/* /var/www/mymeds-backend/
cp package*.json /var/www/mymeds-backend/

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd /var/www/mymeds-backend
npm ci --only=production

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

# Copy frontend files
echo "📤 Setting up frontend..."
cp -r ../../dist/* /var/www/mymeds-frontend/

# Set up WooCommerce
echo "🛒 Setting up WooCommerce..."
cd /var/www/mymeds-shop
wget https://wordpress.org/latest.zip
unzip latest.zip
mv wordpress/* .
rm -rf wordpress latest.zip

# Set up WordPress Blog
echo "📝 Setting up WordPress Blog..."
cd /var/www/mymeds-blog
wget https://wordpress.org/latest.zip
unzip latest.zip
mv wordpress/* .
rm -rf wordpress latest.zip

# Set proper permissions
echo "🔐 Setting proper permissions..."
chown -R www-data:www-data /var/www/mymeds-*
chmod -R 755 /var/www/mymeds-*

# Configure Nginx
echo "🌐 Configuring Nginx..."

# Main Nginx config
cat > /etc/nginx/sites-available/mymedspharmacyinc.com << 'EOF'
# Main domain configuration
server {
    listen 80;
    server_name mymedspharmacyinc.com www.mymedspharmacyinc.com;
    return 301 https://www.mymedspharmacyinc.com$request_uri;
}

# Frontend (React App)
server {
    listen 80;
    server_name www.mymedspharmacyinc.com;
    
    root /var/www/mymeds-frontend;
    index index.html;
    
    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}

# Backend API
server {
    listen 80;
    server_name api.mymedspharmacyinc.com;
    
    location / {
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
}

# WooCommerce Shop
server {
    listen 80;
    server_name shop.mymedspharmacyinc.com;
    
    root /var/www/mymeds-shop;
    index index.php index.html index.htm;
    
    location / {
        try_files $uri $uri/ /index.php?$args;
    }
    
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
    }
    
    location ~ /\.ht {
        deny all;
    }
}

# WordPress Blog
server {
    listen 80;
    server_name blog.mymedspharmacyinc.com;
    
    root /var/www/mymeds-blog;
    index index.php index.html index.htm;
    
    location / {
        try_files $uri $uri/ /index.php?$args;
    }
    
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
    }
    
    location ~ /\.ht {
        deny all;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/mymedspharmacyinc.com /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
systemctl enable nginx

# Configure PM2 for backend
echo "📊 Setting up PM2..."
cd /var/www/mymeds-backend

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'mymeds-backend',
    script: 'index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    error_file: '/var/log/mymeds/err.log',
    out_file: '/var/log/mymeds/out.log',
    log_file: '/var/log/mymeds/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
EOF

# Start the application with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Configure firewall
echo "🛡️ Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 4000
ufw --force enable

# Set up SSL certificates
echo "🔒 Setting up SSL certificates..."
certbot --nginx -d mymedspharmacyinc.com -d www.mymedspharmacyinc.com -d api.mymedspharmacyinc.com -d shop.mymedspharmacyinc.com -d blog.mymedspharmacyinc.com --non-interactive --agree-tos --email admin@mymedspharmacyinc.com

# Set up log rotation
echo "📋 Setting up log rotation..."
cat > /etc/logrotate.d/mymeds << 'EOF'
/var/log/mymeds/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# Set up monitoring
echo "📊 Setting up monitoring..."
cat > /etc/cron.d/mymeds-monitoring << 'EOF'
# Health check every 5 minutes
*/5 * * * * root curl -f http://localhost:4000/api/health > /dev/null 2>&1 || echo "Backend health check failed at $(date)" >> /var/log/mymeds/health.log

# Database backup daily at 2 AM
0 2 * * * root mysqldump -u mymeds_user -p'MyMeds2024!@#' --all-databases | gzip > /var/backups/mymeds/db_backup_$(date +\%Y\%m\%d).sql.gz

# Log cleanup weekly
0 3 * * 0 root find /var/log/mymeds -name "*.log" -mtime +30 -delete

# Backup cleanup (keep last 30 days)
0 4 * * * root find /var/backups/mymeds -name "*.sql.gz" -mtime +30 -delete
EOF

# Create health check script
cat > /var/www/mymeds-backend/health-check.sh << 'EOF'
#!/bin/bash
BACKEND_URL="http://localhost:4000/api/health"
FRONTEND_URL="http://localhost"

echo "=== MyMeds Health Check ==="
echo "Time: $(date)"
echo ""

# Check backend
echo "Backend Status:"
if curl -f -s $BACKEND_URL > /dev/null; then
    echo "✅ Backend is running"
else
    echo "❌ Backend is down"
fi

# Check frontend
echo ""
echo "Frontend Status:"
if curl -f -s $FRONTEND_URL > /dev/null; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend is down"
fi

# Check MySQL
echo ""
echo "MySQL Status:"
if systemctl is-active --quiet mysql; then
    echo "✅ MySQL is running"
else
    echo "❌ MySQL is down"
fi

# Check Nginx
echo ""
echo "Nginx Status:"
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx is running"
else
    echo "❌ Nginx is down"
fi

echo ""
echo "=== Health Check Complete ==="
EOF

chmod +x /var/www/mymeds-backend/health-check.sh

# Create environment file
echo "🔧 Creating environment file..."
cat > /var/www/mymeds-backend/.env << 'EOF'
NODE_ENV=production
PORT=4000
CORS_ORIGIN=https://www.mymedspharmacyinc.com
DATABASE_URL=mysql://mymeds_user:MyMeds2024!@#@localhost:3306/mymeds_production
JWT_SECRET=YourSuperSecretJWTKey2024!@#$%^&*()
ADMIN_EMAIL=admin@mymedspharmacyinc.com
ADMIN_PASSWORD=Admin2024!@#$%^&*()
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
UPLOAD_PATH=/var/www/mymeds-backend/uploads
LOG_LEVEL=info
RATE_LIMITING_ENABLED=true
MONITORING_ENABLED=true
CACHE_ENABLED=true
SSL_ENABLED=true
FORCE_HTTPS=true
EOF

# Final status check
echo ""
echo "✅ Deployment Complete!"
echo ""
echo "🌐 Your MyMeds application is now running at:"
echo "   Frontend: https://www.mymedspharmacyinc.com"
echo "   Backend API: https://api.mymedspharmacyinc.com"
echo "   WooCommerce Shop: https://shop.mymedspharmacyinc.com"
echo "   WordPress Blog: https://blog.mymedspharmacyinc.com"
echo ""
echo "📊 Monitoring:"
echo "   PM2 Status: pm2 status"
echo "   Health Check: /var/www/mymeds-backend/health-check.sh"
echo "   Logs: /var/log/mymeds/"
echo ""
echo "🔧 Next Steps:"
echo "   1. Update DNS records to point to your VPS IP: 72.60.116.253"
echo "   2. Configure WooCommerce and WordPress"
echo "   3. Set up your admin accounts"
echo "   4. Test all endpoints"
echo ""
echo "🚀 MyMeds is ready for production!"
