# MyMeds Pharmacy Inc. - Domain Deployment Guide

## Your VPS & Domain Configuration

**Domain:** `mymedspharmacyinc.com`  
**VPS IP:** `72.60.116.253`  
**VPS Hostname:** `srv983203.hstgr.cloud`  
**OS:** Ubuntu 24.04 LTS  

## DNS Configuration Required

Before deploying, configure these DNS records with your domain registrar:

### A Records
```
mymedspharmacyinc.com        A    72.60.116.253
www.mymedspharmacyinc.com    A    72.60.116.253
blog.mymedspharmacyinc.com   A    72.60.116.253
shop.mymedspharmacyinc.com   A    72.60.116.253
```

### CNAME Records (Optional)
```
api.mymedspharmacyinc.com    CNAME    mymedspharmacyinc.com
admin.mymedspharmacyinc.com  CNAME    mymedspharmacyinc.com
```

## VPS Setup Steps

### 1. Connect to Your VPS
```bash
ssh root@72.60.116.253
```

### 2. Update System
```bash
apt update && apt upgrade -y
```

### 3. Install Dependencies
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install MySQL
apt install mysql-server -y

# Install Nginx
apt install nginx -y

# Install PM2 (Process Manager)
npm install -g pm2

# Install Certbot for SSL
apt install certbot python3-certbot-nginx -y
```

### 4. Setup MySQL Database
```bash
mysql -u root -p

# In MySQL shell:
CREATE DATABASE mymeds_production;
CREATE USER 'mymeds_user'@'localhost' IDENTIFIED BY 'YOUR_SECURE_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON mymeds_production.* TO 'mymeds_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 5. Setup Application Directory
```bash
# Create application directory
mkdir -p /var/www/mymeds
cd /var/www/mymeds

# Clone your repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git .

# Install dependencies
cd backend
npm install

# Copy environment file
cp ../../env.production.template .env.production
```

### 6. Configure Environment Variables

Edit `/var/www/mymeds/backend/.env.production` and replace these placeholders:

```bash
nano /var/www/mymeds/backend/.env.production
```

**Required Changes:**
- `REPLACE_WITH_SECURE_PASSWORD_HERE` → Your MySQL password
- `REPLACE_WITH_SECURE_JWT_SECRET_KEY_HERE_MINIMUM_64_CHARACTERS_LONG` → Generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- `REPLACE_WITH_SECURE_SESSION_SECRET_KEY_HERE_MINIMUM_32_CHARACTERS_LONG` → Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `REPLACE_WITH_SECURE_CSRF_SECRET_KEY_HERE_MINIMUM_64_CHARACTERS_LONG` → Generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

### 7. Setup Database Migration
```bash
cd /var/www/mymeds/backend
npx prisma migrate deploy
```

### 8. Build and Start Backend
```bash
# Build TypeScript
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 9. Build Frontend
```bash
cd /var/www/mymeds
npm install
npm run build
```

### 10. Configure Nginx
```bash
# Copy nginx configuration
cp nginx-combined-config.conf /etc/nginx/sites-available/mymeds
ln -s /etc/nginx/sites-available/mymeds /etc/nginx/sites-enabled/

# Remove default site
rm /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t

# Start nginx
systemctl start nginx
systemctl enable nginx
```

### 11. Setup SSL Certificates
```bash
# Get SSL certificate
certbot --nginx -d mymedspharmacyinc.com -d www.mymedspharmacyinc.com -d blog.mymedspharmacyinc.com -d shop.mymedspharmacyinc.com

# Setup auto-renewal
crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

### 12. Configure Firewall
```bash
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable
```

## Application Structure
```
/var/www/mymeds/
├── backend/
│   ├── .env.production
│   ├── dist/
│   └── prisma/
├── dist/          # Frontend build
├── nginx-combined-config.conf
└── ecosystem.config.js
```

## Services Status Check
```bash
# Check services
systemctl status nginx
pm2 status
mysql -u root -p -e "SHOW DATABASES;"

# Check SSL certificate
certbot certificates

# Test domain
curl -I https://mymedspharmacyinc.com
curl -I https://www.mymedspharmacyinc.com
```

## Deployment Commands

### Full Deployment
```bash
cd /var/www/mymeds
git pull origin main
cd backend
npm install
npm run build
pm2 restart ecosystem.config.js
cd ..
npm install
npm run build
systemctl reload nginx
```

### Quick Update (Backend only)
```bash
cd /var/www/mymeds/backend
git pull origin main
npm run build
pm2 restart ecosystem.config.js
```

## Troubleshooting

### Check Logs
```bash
# Backend logs
pm2 logs

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# MySQL logs
tail -f /var/log/mysql/error.log
```

### Common Issues

1. **502 Bad Gateway**: Check if backend is running on port 4000
2. **SSL Errors**: Verify DNS is pointing to correct IP
3. **Database Connection**: Check MySQL service and credentials
4. **Permission Issues**: Ensure nginx can read files in `/var/www/mymeds`

## Security Checklist
- [x] Firewall configured (UFW)
- [x] SSL certificates installed
- [x] MySQL root password changed
- [x] Application runs as non-root user
- [x] Sensitive environment variables secured
- [x] Regular backups enabled

## Next Steps After Deployment

1. **Test all functionality**: Visit https://mymedspharmacyinc.com
2. **Configure WordPress**: Set up blog.mymedspharmacyinc.com
3. **Configure WooCommerce**: Set up shop.mymedspharmacyinc.com
4. **Setup backups**: Configure automated database backups
5. **Monitor**: Set up monitoring and alerts
6. **Performance**: Configure caching and optimization

## Backup Command
```bash
# Database backup
mysqldump -u mymeds_user -p mymeds_production > /backups/mymeds_$(date +%Y%m%d_%H%M%S).sql

# Application backup
tar -czf /backups/mymeds_app_$(date +%Y%m%d_%H%M%S).tar.gz /var/www/mymeds
```

## Contact
For deployment issues, check the troubleshooting section or review the application logs.
