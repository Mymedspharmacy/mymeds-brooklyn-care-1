# MyMeds Pharmacy Inc. - Complete Deployment Guide

## 🚀 Quick Start Deployment

### Option 1: Automated Deployment (Recommended)

**For Windows Users:**
1. Run `deploy-windows.bat` to prepare your local environment
2. Copy `deploy-to-vps.sh` to your VPS
3. Run `./deploy-to-vps.sh` on the VPS

**For Linux/Mac Users:**
1. Run `./deploy-to-vps.sh` directly

### Option 2: Manual Deployment

1. Run `deploy-vps-simple.sh` on your VPS to setup the environment
2. Upload your application files manually
3. Follow the post-setup instructions

## 📋 VPS Specifications

- **VPS IP**: 72.60.116.253
- **OS**: Ubuntu 24.04 LTS
- **Resources**: 1 CPU, 4GB RAM, 50GB Storage
- **SSH Access**: root user with password `Pharm-23-medS`

## 🎯 What Gets Deployed

### ✅ Complete System Stack
- **React Frontend** - Modern pharmacy management interface
- **Node.js Backend** - Express.js API with TypeScript and Prisma ORM
- **MySQL Database** - Production database with optimized configuration
- **WordPress + WooCommerce** - E-commerce store with API integration
- **Nginx Reverse Proxy** - High-performance web server with SSL
- **PM2 Process Manager** - Application monitoring and auto-restart
- **Automated Backups** - Daily database and file backups
- **Security Hardening** - Firewall, rate limiting, security headers
- **SSL Certificates** - Automatic Let's Encrypt SSL with auto-renewal

### 🔐 Default Credentials

All passwords are set to: `Pharm-23-medS`

- **Admin Email**: mymedspharmacyinc@gmail.com
- **Admin Password**: Pharm-23-medS
- **Database Password**: Pharm-23-medS
- **WordPress Admin**: Same as above

## 🌐 Domain Configuration

The system is configured for `mymedspharmacyinc.com` with the following routing:

- `mymedspharmacyinc.com/` → React Frontend Application
- `mymedspharmacyinc.com/api/*` → Node.js Backend API
- `mymedspharmacyinc.com/shop/*` → WordPress/WooCommerce Store
- `mymedspharmacyinc.com/uploads/*` → File Uploads
- `mymedspharmacyinc.com/admin` → Admin Dashboard

## 📁 Directory Structure

```
/var/www/mymeds-pharmacy/
├── backend/              # Node.js API server
│   ├── dist/            # Compiled TypeScript
│   ├── src/             # Source code
│   ├── prisma/          # Database schema and migrations
│   └── .env             # Environment variables
├── dist/                # React frontend build
├── uploads/             # File uploads
├── logs/                # Application logs
└── ecosystem.config.js  # PM2 configuration

/var/www/wordpress/      # WordPress + WooCommerce
├── wp-content/
│   ├── plugins/
│   │   └── woocommerce/ # WooCommerce plugin
│   └── uploads/         # WordPress uploads
├── wp-admin/
└── wp-config.php        # WordPress configuration

/var/backups/mymeds-pharmacy/ # Automated backups
├── YYYYMMDD_HHMMSS/
│   ├── mymeds_production.sql
│   ├── mymeds_wordpress.sql
│   ├── app_files.tar.gz
│   └── wordpress_files.tar.gz
```

## 🔧 Management Commands

### Application Management
```bash
# Check application status
pm2 status

# View logs
pm2 logs mymeds-backend

# Restart application
pm2 restart mymeds-backend

# Monitor resources
pm2 monit

# Stop application
pm2 stop mymeds-backend
```

### Service Management
```bash
# Nginx
sudo systemctl status nginx
sudo systemctl reload nginx
sudo systemctl restart nginx

# MySQL
sudo systemctl status mysql
sudo systemctl restart mysql

# PHP-FPM
sudo systemctl status php8.1-fpm
sudo systemctl restart php8.1-fpm
```

### Database Management
```bash
# Connect to main database
mysql -u mymeds_user -p mymeds_production

# Connect to WordPress database
mysql -u mymeds_wordpress_user -p mymeds_wordpress

# Run Prisma migrations
cd /var/www/mymeds-pharmacy/backend
npx prisma migrate deploy
npx prisma generate
```

### Backup Management
```bash
# Manual backup
sudo /usr/local/bin/mymeds-backup.sh

# View backup logs
ls -la /var/backups/mymeds-pharmacy/

# Restore from backup
cd /var/backups/mymeds-pharmacy/YYYYMMDD_HHMMSS/
mysql -u mymeds_user -p mymeds_production < mymeds_production.sql
mysql -u mymeds_wordpress_user -p mymeds_wordpress < mymeds_wordpress.sql
```

## 🔒 Security Features

### SSL/TLS Encryption
- Automatic Let's Encrypt certificates
- HTTP to HTTPS redirect
- HSTS headers for security

### Rate Limiting
- Login attempts: 5 requests per minute
- Contact forms: 3 requests per minute
- General API: 100 requests per minute

### Security Headers
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- X-Content-Type-Options: nosniff
- Content-Security-Policy: Strict CSP
- Strict-Transport-Security: 1 year

### Firewall Configuration
- Only ports 22 (SSH), 80 (HTTP), 443 (HTTPS) open
- UFW firewall enabled
- Fail2ban for intrusion prevention

## 📊 Monitoring & Health Checks

### Health Endpoints
- **System Health**: https://mymedspharmacyinc.com/health
- **API Health**: https://mymedspharmacyinc.com/api/health
- **Database Health**: https://mymedspharmacyinc.com/api/health/db

### Monitoring Features
- **PM2 Monitoring**: Real-time process monitoring
- **System Monitoring**: Automated every 5 minutes
- **Log Rotation**: Daily rotation with 30-day retention
- **Backup Monitoring**: Daily automated backups

### Log Locations
- **Application Logs**: `/var/www/mymeds-pharmacy/logs/`
- **Nginx Logs**: `/var/log/nginx/`
- **PM2 Logs**: `~/.pm2/logs/`
- **MySQL Logs**: `/var/log/mysql/`
- **System Logs**: `/var/log/syslog`

## 🛠️ Troubleshooting

### Common Issues

#### 1. 502 Bad Gateway
```bash
# Check if backend is running
pm2 status

# Check backend logs
pm2 logs mymeds-backend

# Restart if needed
pm2 restart mymeds-backend

# Check if port 4000 is available
netstat -tlnp | grep 4000
```

#### 2. WordPress 404 Errors
```bash
# Check Nginx configuration
sudo nginx -t

# Verify WordPress files
ls -la /var/www/wordpress/

# Check permissions
sudo chown -R www-data:www-data /var/www/wordpress/
sudo chmod -R 755 /var/www/wordpress/

# Check PHP-FPM
sudo systemctl status php8.1-fpm
```

#### 3. Database Connection Issues
```bash
# Check MySQL status
sudo systemctl status mysql

# Test database connection
mysql -u mymeds_user -p mymeds_production

# Check environment variables
cat /var/www/mymeds-pharmacy/backend/.env

# Check Prisma connection
cd /var/www/mymeds-pharmacy/backend
npx prisma db push
```

#### 4. SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificates
sudo certbot renew

# Check certificate files
ls -la /etc/letsencrypt/live/mymedspharmacyinc.com/
```

### Performance Optimization

#### Memory Usage
```bash
# Check memory usage
free -h
htop

# Check PM2 memory usage
pm2 monit

# Restart if memory usage is high
pm2 restart mymeds-backend
```

#### Disk Space
```bash
# Check disk usage
df -h

# Check largest directories
du -sh /var/www/* | sort -hr

# Clean up old logs
sudo find /var/log -name "*.log" -mtime +30 -delete
```

## 🔄 Updates and Maintenance

### Deploying Code Updates

1. **Update code locally**:
   ```bash
   git pull origin main
   npm run build:production
   cd backend && npm run build:production
   ```

2. **Deploy to VPS**:
   ```bash
   # Copy updated files
   scp -r dist/ root@72.60.116.253:/var/www/mymeds-pharmacy/dist/
   scp -r backend/ root@72.60.116.253:/var/www/mymeds-pharmacy/backend/
   
   # On VPS, rebuild and restart
   ssh root@72.60.116.253
   cd /var/www/mymeds-pharmacy/backend
   npm install --production
   npm run build:production
   pm2 restart mymeds-backend
   ```

### Database Updates

```bash
# Run migrations
cd /var/www/mymeds-pharmacy/backend
npx prisma migrate deploy
npx prisma generate

# Seed database (if needed)
npx prisma db seed
```

### WordPress Updates

```bash
# Update WordPress core
cd /var/www/wordpress
wp core update

# Update plugins
wp plugin update --all

# Update themes
wp theme update --all
```

## 📈 Performance Monitoring

### Key Metrics to Monitor

1. **Response Times**
   - API endpoints: < 200ms
   - Frontend pages: < 1s
   - Database queries: < 100ms

2. **Resource Usage**
   - Memory usage: < 80%
   - CPU usage: < 70%
   - Disk usage: < 80%

3. **Error Rates**
   - 4xx errors: < 5%
   - 5xx errors: < 1%

### Monitoring Commands

```bash
# Check system resources
htop
df -h
free -h

# Check application performance
pm2 monit
curl -w "@curl-format.txt" -o /dev/null -s "https://mymedspharmacyinc.com/api/health"

# Check database performance
mysql -u mymeds_user -p -e "SHOW PROCESSLIST;"
```

## 🎉 Success Checklist

After deployment, verify:

- [ ] Main application loads: https://mymedspharmacyinc.com
- [ ] WooCommerce store loads: https://mymedspharmacyinc.com/shop
- [ ] Admin panel accessible: https://mymedspharmacyinc.com/admin
- [ ] WordPress admin accessible: https://mymedspharmacyinc.com/shop/wp-admin
- [ ] SSL certificates are valid and auto-renewing
- [ ] All services are running: `pm2 status`
- [ ] Database connections work
- [ ] File uploads work
- [ ] Email notifications work
- [ ] Backups are running daily
- [ ] Monitoring is active

## 📞 Support

For deployment issues:

1. Check logs in `/var/www/mymeds-pharmacy/logs/`
2. Verify all services: `pm2 status && systemctl status nginx mysql php8.1-fpm`
3. Test health endpoints
4. Review this guide for troubleshooting steps

---

**Your MyMeds Pharmacy application is now live and ready for business! 🚀**

**Live URLs:**
- Main App: https://mymedspharmacyinc.com
- WooCommerce Store: https://mymedspharmacyinc.com/shop
- Admin Panel: https://mymedspharmacyinc.com/admin


