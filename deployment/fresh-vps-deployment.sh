#!/bin/bash

# MyMeds Fresh VPS Deployment Script
set -e

echo "🚀 Starting fresh MyMeds VPS deployment..."

# Step 1: Cleanup previous deployment
echo "Step 1: Cleaning up previous deployment..."
chmod +x deployment/cleanup-vps.sh
./deployment/cleanup-vps.sh

# Step 2: Update system
echo "Step 2: Updating system..."
sudo apt update && sudo apt upgrade -y

# Step 3: Install required packages
echo "Step 3: Installing required packages..."
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx mysql-server

# Step 4: Install Node.js 18
echo "Step 4: Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Step 5: Install PM2 globally
echo "Step 5: Installing PM2..."
sudo npm install -g pm2

# Step 6: Setup MySQL
echo "Step 6: Setting up MySQL..."
chmod +x deployment/mysql-setup.sh
sudo ./deployment/mysql-setup.sh

# Step 7: Clone repository
echo "Step 7: Cloning repository..."
cd /var/www
sudo git clone https://github.com/your-username/mymeds-brooklyn-care-1-4.git mymeds
sudo chown -R $USER:$USER /var/www/mymeds
cd mymeds

# Step 8: Install dependencies
echo "Step 8: Installing dependencies..."
npm ci --production

# Step 9: Build backend
echo "Step 9: Building backend..."
cd backend
npm run build
cd ..

# Step 10: Build frontend
echo "Step 10: Building frontend..."
npm run build

# Step 11: Generate Prisma client
echo "Step 11: Generating Prisma client..."
cd backend
npx prisma generate
cd ..

# Step 12: Push database schema
echo "Step 12: Pushing database schema..."
cd backend
npx prisma db push
cd ..

# Step 13: Setup environment file
echo "Step 13: Setting up environment file..."
if [ ! -f ".env.production" ]; then
    echo "Creating .env.production file..."
    cp env.production.template .env.production
    echo "⚠️  IMPORTANT: Edit .env.production with your actual credentials!"
    echo "   See deployment/credentials-setup-guide.md for details"
fi

# Step 14: Setup Nginx
echo "Step 14: Setting up Nginx..."
sudo tee /etc/nginx/sites-available/mymeds > /dev/null <<EOF
server {
    listen 80;
    server_name mymedspharmacyinc.com www.mymedspharmacyinc.com;

    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mymedspharmacyinc.com www.mymedspharmacyinc.com;

    # SSL Configuration (will be updated by certbot)
    ssl_certificate /etc/letsencrypt/live/mymedspharmacyinc.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mymedspharmacyinc.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Frontend (React app)
    location / {
        proxy_pass http://localhost:3000;
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
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # WordPress (if separate)
    location /blog/ {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Static files
    location /static/ {
        alias /var/www/mymeds/dist/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # File uploads
    location /uploads/ {
        alias /var/www/mymeds/uploads/;
        expires 1y;
        add_header Cache-Control "public";
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/mymeds /etc/nginx/sites-enabled/
sudo nginx -t

# Step 15: Get SSL certificate
echo "Step 15: Getting SSL certificate..."
sudo certbot --nginx -d mymedspharmacyinc.com -d www.mymedspharmacyinc.com --non-interactive --agree-tos --email admin@mymedspharmacyinc.com

# Step 16: Create directories
echo "Step 16: Creating directories..."
sudo mkdir -p /var/www/mymeds/logs
sudo mkdir -p /var/www/mymeds/uploads
sudo chown -R $USER:$USER /var/www/mymeds/logs
sudo chown -R $USER:$USER /var/www/mymeds/uploads

# Step 17: Start application
echo "Step 17: Starting application..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Step 18: Setup monitoring
echo "Step 18: Setting up monitoring..."
pm2 install pm2-logrotate

# Step 19: Final verification
echo "Step 19: Final verification..."
sleep 5

# Check if services are running
if pm2 list | grep -q "mymeds-backend.*online"; then
    echo "✅ Backend is running"
else
    echo "❌ Backend failed to start"
    pm2 logs mymeds-backend --lines 20
fi

if pm2 list | grep -q "mymeds-frontend.*online"; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend failed to start"
    pm2 logs mymeds-frontend --lines 20
fi

# Test health endpoint
if curl -f http://localhost:4000/api/health >/dev/null 2>&1; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
fi

# Step 20: Display final information
echo ""
echo "🎉 Deployment completed!"
echo ""
echo "Application URLs:"
echo "  Frontend: https://mymedspharmacyinc.com"
echo "  Backend API: https://mymedspharmacyinc.com/api"
echo "  Admin Panel: https://mymedspharmacyinc.com/admin"
echo "  Health Check: https://mymedspharmacyinc.com/api/health"
echo ""
echo "WordPress (preserved):"
echo "  WordPress Admin: https://mymedspharmacyinc.com/wp-admin"
echo "  WordPress API: https://mymedspharmacyinc.com/wp-json/wp/v2"
echo ""
echo "Database:"
echo "  MySQL Database: mymeds_db"
echo "  MySQL User: mymeds_user"
echo "  Connection: mysql://mymeds_user:MyMeds2025!SecurePassword@localhost:3306/mymeds_db"
echo ""
echo "Next Steps:"
echo "1. Edit /var/www/mymeds/.env.production with your credentials"
echo "2. See deployment/credentials-setup-guide.md for details"
echo "3. Test all functionality"
echo "4. Set up monitoring and alerts"
echo ""
echo "Useful Commands:"
echo "  pm2 status                    # Check application status"
echo "  pm2 logs                      # View application logs"
echo "  pm2 restart all               # Restart applications"
echo "  sudo nginx -t                 # Test Nginx configuration"
echo "  sudo systemctl reload nginx   # Reload Nginx"
echo ""
echo "⚠️  IMPORTANT: Configure your credentials in .env.production before testing!"
