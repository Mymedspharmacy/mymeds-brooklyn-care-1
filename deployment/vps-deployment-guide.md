# MyMeds VPS Deployment Guide

## Prerequisites

- Ubuntu 20.04+ VPS
- Root or sudo access
- Domain name pointing to VPS IP
- SSL certificate (Let's Encrypt recommended)

## Step 1: Initial VPS Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install MySQL
sudo apt install -y mysql-server
```

## Step 2: MySQL Database Setup

```bash
# Run the MySQL setup script
chmod +x deployment/mysql-setup.sh
sudo ./deployment/mysql-setup.sh
```

## Step 3: Application Deployment

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/your-username/mymeds-brooklyn-care-1-4.git mymeds
sudo chown -R $USER:$USER /var/www/mymeds
cd mymeds

# Install dependencies
npm ci --production

# Build backend
cd backend
npm run build
cd ..

# Build frontend
npm run build

# Generate Prisma client
cd backend
npx prisma generate

# Push database schema
npx prisma db push
cd ..
```

## Step 4: Environment Configuration

```bash
# Copy production environment template
cp env.production.template .env.production

# Edit environment variables
nano .env.production
```

### Required Environment Variables:

```bash
# Database
DATABASE_URL="mysql://mymeds_user:MyMeds2025!SecurePassword@localhost:3306/mymeds_db"

# Security
JWT_SECRET="your-super-secure-jwt-secret-64-characters-minimum"
ADMIN_PASSWORD="your-secure-admin-password"

# WordPress Integration
WORDPRESS_SITE_URL="https://mymedspharmacyinc.com"
WORDPRESS_USERNAME="your-wp-username"
WORDPRESS_APPLICATION_PASSWORD="your-wp-app-password"

# WooCommerce Integration
WOOCOMMERCE_STORE_URL="https://mymedspharmacyinc.com"
WOOCOMMERCE_CONSUMER_KEY="your-wc-consumer-key"
WOOCOMMERCE_CONSUMER_SECRET="your-wc-consumer-secret"
```

## Step 5: Nginx Configuration

```bash
# Create Nginx configuration
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

    # SSL Configuration
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
sudo systemctl reload nginx
```

## Step 6: SSL Certificate

```bash
# Get SSL certificate
sudo certbot --nginx -d mymedspharmacyinc.com -d www.mymedspharmacyinc.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Step 7: Start Application

```bash
# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Check status
pm2 status
pm2 logs
```

## Step 8: Monitoring & Maintenance

### Health Checks
```bash
# Check application status
pm2 status
curl http://localhost:4000/api/health

# Check database
mysql -u mymeds_user -p mymeds_db -e "SELECT COUNT(*) FROM users;"

# Check logs
pm2 logs mymeds-backend
pm2 logs mymeds-frontend
```

### Backup
```bash
# Manual backup
/usr/local/bin/mymeds-backup.sh

# Check backup
ls -la /var/backups/mymeds/
```

### Updates
```bash
# Update application
cd /var/www/mymeds
git pull origin main
chmod +x deployment/deploy.sh
./deployment/deploy.sh
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   # Check MySQL status
   sudo systemctl status mysql
   
   # Check database exists
   mysql -u mymeds_user -p -e "SHOW DATABASES;"
   ```

2. **Port Already in Use**
   ```bash
   # Check what's using port 4000
   sudo netstat -tlnp | grep :4000
   
   # Kill process
   sudo kill -9 <PID>
   ```

3. **Permission Issues**
   ```bash
   # Fix ownership
   sudo chown -R $USER:$USER /var/www/mymeds
   sudo chmod -R 755 /var/www/mymeds
   ```

4. **SSL Issues**
   ```bash
   # Renew certificate
   sudo certbot renew --dry-run
   sudo certbot renew
   ```

### Log Locations
- Application logs: `pm2 logs`
- Nginx logs: `/var/log/nginx/`
- MySQL logs: `/var/log/mysql/`
- System logs: `/var/log/syslog`

## Security Checklist

- [ ] Firewall configured (UFW)
- [ ] SSH key authentication only
- [ ] Regular security updates
- [ ] Database backups automated
- [ ] SSL certificate valid
- [ ] Strong passwords for all services
- [ ] Rate limiting enabled
- [ ] CORS properly configured

## Performance Optimization

- [ ] Enable gzip compression
- [ ] Configure caching headers
- [ ] Optimize database queries
- [ ] Monitor memory usage
- [ ] Set up log rotation
- [ ] Configure CDN (optional)

## Support

For issues or questions:
1. Check logs first
2. Verify environment variables
3. Test database connectivity
4. Check network connectivity
5. Review this guide

---

**Note**: Replace placeholder values with your actual credentials and domain names.
