# My Meds Pharmacy - Quick VPS Deployment Commands

## Prerequisites
- Ubuntu 20.04+ VPS
- Root or sudo access
- Domain name pointing to your VPS IP

## Quick Deployment Commands

### 1. Download and run the deployment script
```bash
# Download the deployment script
wget https://raw.githubusercontent.com/Mymedspharmacy/mymeds-brooklyn-care-1/latest/deployment/deploy-to-vps.sh

# Make it executable
chmod +x deploy-to-vps.sh

# Run the deployment script
./deploy-to-vps.sh
```

### 2. Manual Step-by-Step Commands (Alternative)

#### Update system and install dependencies
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx ufw fail2ban htop
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
sudo apt install -y postgresql postgresql-contrib
```

#### Clone repository and setup
```bash
sudo mkdir -p /var/www/mymeds-pharmacy
sudo chown $USER:$USER /var/www/mymeds-pharmacy
git clone -b latest https://github.com/Mymedspharmacy/mymeds-brooklyn-care-1.git /var/www/mymeds-pharmacy
cd /var/www/mymeds-pharmacy
```

#### Install dependencies and build
```bash
cd backend && npm install --production
cd ../src && npm install --production && npm run build
cd ..
```

#### Setup database
```bash
sudo -u postgres psql << EOF
CREATE DATABASE mymeds_pharmacy;
CREATE USER mymeds_user WITH PASSWORD 'mymeds_password';
GRANT ALL PRIVILEGES ON DATABASE mymeds_pharmacy TO mymeds_user;
\q
EOF

cd backend
npx prisma migrate deploy
npx prisma generate
```

#### Configure environment files
```bash
# Backend .env
cat > backend/.env << EOF
NODE_ENV=production
PORT=3001
DATABASE_URL="postgresql://mymeds_user:mymeds_password@localhost:5432/mymeds_pharmacy"
JWT_SECRET="your-super-secure-jwt-secret-key-change-this"
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://mymedspharmacyinc.com
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
VITE_API_URL=https://mymedspharmacyinc.com/api
VITE_WORDPRESS_URL=https://your-wordpress-site.com
VITE_WOOCOMMERCE_URL=https://your-woocommerce-store.com
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
EOF
```

#### Setup PM2 ecosystem
```bash
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'mymeds-backend',
      script: 'dist/index.js',
      cwd: '/var/www/mymeds-pharmacy/backend',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'mymeds-frontend',
      script: 'serve',
      args: '-s dist -l 3000',
      cwd: '/var/www/mymeds-pharmacy/src',
      instances: 1,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
EOF

npm install -g serve
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### Configure Nginx
```bash
sudo tee /etc/nginx/sites-available/mymeds-pharmacy << EOF
server {
    listen 80;
    server_name mymedspharmacyinc.com www.mymedspharmacyinc.com;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mymedspharmacyinc.com www.mymedspharmacyinc.com;
    
    ssl_certificate /etc/letsencrypt/live/mymedspharmacyinc.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mymedspharmacyinc.com/privkey.pem;
    
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
    
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    location /uploads/ {
        proxy_pass http://localhost:3001/uploads/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/mymeds-pharmacy /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
```

#### Setup SSL and firewall
```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
sudo certbot --nginx -d mymedspharmacyinc.com -d www.mymedspharmacyinc.com --non-interactive --agree-tos --email admin@mymedspharmacyinc.com
sudo systemctl restart nginx
```

## Post-Deployment Configuration

### 1. Update environment variables
Edit `/var/www/mymeds-pharmacy/backend/.env` with your actual:
- WooCommerce credentials
- WordPress credentials  
- Stripe keys
- Email settings
- Database password

### 2. Test the deployment
```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs

# Test API
curl https://mymedspharmacyinc.com/api/health

# Test frontend
curl https://mymedspharmacyinc.com
```

### 3. Useful management commands
```bash
# Restart applications
pm2 restart all

# View logs
pm2 logs mymeds-backend
pm2 logs mymeds-frontend

# Check Nginx status
sudo systemctl status nginx

# Check PostgreSQL status
sudo systemctl status postgresql

# Update application
cd /var/www/mymeds-pharmacy
git pull origin latest
cd backend && npm install --production
cd ../src && npm run build
pm2 restart all
```

## Troubleshooting

### If backend fails to start:
```bash
cd /var/www/mymeds-pharmacy/backend
npm run build
pm2 restart mymeds-backend
pm2 logs mymeds-backend
```

### If frontend fails to start:
```bash
cd /var/www/mymeds-pharmacy/src
npm run build
pm2 restart mymeds-frontend
pm2 logs mymeds-frontend
```

### If database connection fails:
```bash
sudo systemctl restart postgresql
sudo -u postgres psql -c "SELECT 1;" mymeds_pharmacy
```

### Check Nginx configuration:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Security Checklist
- [ ] Change default database password
- [ ] Update JWT secret
- [ ] Configure firewall rules
- [ ] Setup SSL certificate
- [ ] Enable fail2ban
- [ ] Configure backup scripts
- [ ] Update all environment variables

Your My Meds Pharmacy application will be available at: https://mymedspharmacyinc.com
