# MyMeds Pharmacy Inc. - Complete VPS Deployment Guide

## 🚀 One-Click Deployment Script

This repository includes a comprehensive deployment script that automatically sets up the entire MyMeds Pharmacy system on your VPS.

### 📋 Prerequisites

Before running the deployment script, ensure you have:

1. **VPS Access**: Root access to your VPS (IP: 72.60.116.253)
2. **Domain Setup**: Domain `mymedspharmacyinc.com` pointing to your VPS IP
3. **Local Environment**: Node.js 18+ installed locally for building the frontend
4. **SSH Access**: Ability to SSH into your VPS

### 🎯 What Gets Deployed

The deployment script automatically installs and configures:

- ✅ **React Frontend** - Modern pharmacy management interface
- ✅ **Node.js Backend** - Express.js API with TypeScript
- ✅ **MySQL Database** - Production database with Prisma ORM
- ✅ **WordPress + WooCommerce** - E-commerce store integration
- ✅ **Nginx Reverse Proxy** - High-performance web server
- ✅ **SSL Certificates** - Automatic Let's Encrypt SSL
- ✅ **PM2 Process Manager** - Application monitoring and auto-restart
- ✅ **Automated Backups** - Daily database and file backups
- ✅ **Security Hardening** - Firewall, rate limiting, security headers
- ✅ **Monitoring & Logging** - System health monitoring

### 🚀 Quick Start

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd mymeds-brooklyn-care-1-6
   ```

2. **Install prerequisites** (if needed):
   ```bash
   # On macOS
   brew install sshpass
   
   # On Ubuntu/Debian
   sudo apt-get install sshpass rsync
   ```

3. **Run the deployment script**:
   ```bash
   ./deploy-to-vps.sh
   ```

4. **Wait for completion** (15-20 minutes)

5. **Access your application**:
   - Main App: https://mymedspharmacyinc.com
   - WooCommerce Store: https://mymedspharmacyinc.com/shop
   - Admin Panel: https://mymedspharmacyinc.com/admin

### 🔐 Default Credentials

After deployment, use these credentials:

- **Admin Email**: mymedspharmacyinc@gmail.com
- **Admin Password**: Pharm-23-medS
- **Database Password**: Pharm-23-medS
- **WordPress Admin**: Same as above

### 📁 Directory Structure

```
/var/www/mymeds-pharmacy/
├── backend/           # Node.js API server
├── dist/             # React frontend build
├── uploads/          # File uploads
├── logs/             # Application logs
└── ecosystem.config.js # PM2 configuration

/var/www/wordpress/   # WordPress + WooCommerce
├── wp-content/
├── wp-admin/
└── wp-config.php

/var/backups/mymeds-pharmacy/ # Automated backups
```

### 🔧 Management Commands

#### Application Management
```bash
# Check application status
pm2 status

# View logs
pm2 logs mymeds-backend

# Restart application
pm2 restart mymeds-backend

# Monitor resources
pm2 monit
```

#### Service Management
```bash
# Nginx
sudo systemctl status nginx
sudo systemctl reload nginx

# MySQL
sudo systemctl status mysql
sudo systemctl restart mysql

# PHP-FPM
sudo systemctl status php8.1-fpm
```

#### Backup Management
```bash
# Manual backup
sudo /usr/local/bin/mymeds-backup.sh

# View backup logs
ls -la /var/backups/mymeds-pharmacy/
```

### 🌐 Domain Configuration

The deployment script configures the following routing:

- `mymedspharmacyinc.com/` → React Frontend
- `mymedspharmacyinc.com/api/*` → Node.js Backend API
- `mymedspharmacyinc.com/shop/*` → WordPress/WooCommerce Store
- `mymedspharmacyinc.com/uploads/*` → File Uploads

### 🔒 Security Features

- **SSL/TLS Encryption** - Automatic Let's Encrypt certificates
- **Rate Limiting** - API endpoint protection
- **Security Headers** - XSS, CSRF, and clickjacking protection
- **Firewall** - UFW configured with minimal open ports
- **File Upload Security** - Restricted file types and sizes
- **Database Security** - Secure MySQL configuration

### 📊 Monitoring & Health Checks

- **Health Endpoint**: https://mymedspharmacyinc.com/health
- **API Health**: https://mymedspharmacyinc.com/api/health
- **System Monitoring**: Automated every 5 minutes
- **Log Rotation**: Daily log rotation with 30-day retention

### 🛠️ Troubleshooting

#### Common Issues

1. **502 Bad Gateway**
   ```bash
   # Check if backend is running
   pm2 status
   
   # Check backend logs
   pm2 logs mymeds-backend
   
   # Restart if needed
   pm2 restart mymeds-backend
   ```

2. **WordPress 404 Errors**
   ```bash
   # Check Nginx configuration
   sudo nginx -t
   
   # Verify WordPress files
   ls -la /var/www/wordpress/
   
   # Check permissions
   sudo chown -R www-data:www-data /var/www/wordpress/
   ```

3. **Database Connection Issues**
   ```bash
   # Check MySQL status
   sudo systemctl status mysql
   
   # Test database connection
   mysql -u mymeds_user -p mymeds_production
   
   # Check environment variables
   cat /var/www/mymeds-pharmacy/backend/.env
   ```

4. **SSL Certificate Issues**
   ```bash
   # Check certificate status
   sudo certbot certificates
   
   # Renew certificates
   sudo certbot renew
   ```

#### Log Locations

- **Application Logs**: `/var/www/mymeds-pharmacy/logs/`
- **Nginx Logs**: `/var/log/nginx/`
- **PM2 Logs**: `~/.pm2/logs/`
- **MySQL Logs**: `/var/log/mysql/`
- **System Logs**: `/var/log/syslog`

### 🔄 Updates and Maintenance

#### Deploying Updates

1. **Update code locally**:
   ```bash
   git pull origin main
   npm run build:production
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

#### Database Migrations

```bash
# Run migrations
cd /var/www/mymeds-pharmacy/backend
npx prisma migrate deploy
npx prisma generate
```

#### WordPress Updates

```bash
# Update WordPress core
cd /var/www/wordpress
wp core update

# Update plugins
wp plugin update --all

# Update themes
wp theme update --all
```

### 📈 Performance Optimization

The deployment includes several performance optimizations:

- **Nginx Caching** - Static asset caching with long expiration
- **Gzip Compression** - Reduced bandwidth usage
- **PM2 Cluster Mode** - Multi-process Node.js application
- **MySQL Optimization** - Tuned for VPS resources
- **Connection Pooling** - Efficient database connections

### 🔐 Security Checklist

After deployment, verify:

- [ ] SSL certificates are active and valid
- [ ] Firewall is configured (ports 22, 80, 443 only)
- [ ] Admin passwords are changed from defaults
- [ ] WordPress admin user is created
- [ ] WooCommerce API credentials are configured
- [ ] File upload permissions are secure
- [ ] Database users have minimal privileges
- [ ] Regular backups are working

### 📞 Support

For deployment issues:

1. Check the logs in `/var/www/mymeds-pharmacy/logs/`
2. Verify all services are running: `pm2 status`
3. Test individual components
4. Review this guide for missed steps

### 🎉 Success!

Once deployment is complete, you'll have a fully functional pharmacy management system with:

- Modern React frontend
- Robust Node.js backend
- Integrated e-commerce store
- Secure SSL encryption
- Automated backups
- System monitoring
- Professional domain setup

Your MyMeds Pharmacy application is now live and ready for business! 🚀


