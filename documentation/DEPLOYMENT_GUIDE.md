# 🚀 MyMeds Pharmacy - Complete Deployment Guide

## Overview

This guide will help you deploy your MyMeds Pharmacy application from 0 to 100% in a single go. The deployment includes:

- ✅ **Backend** (Node.js/Express with TypeScript)
- ✅ **Frontend** (React/Vite with TypeScript)
- ✅ **Database** (MySQL with Prisma ORM)
- ✅ **Web Server** (Nginx with SSL)
- ✅ **Process Management** (PM2)
- ✅ **Security** (UFW firewall + Fail2ban)
- ✅ **SSL Certificates** (Let's Encrypt)
- ✅ **Monitoring** (Health checks + automated backups)
- ✅ **Rate Limiting** (Production-ready security)

## 🎯 Quick Start (One-Click Deployment)

### Option 1: Windows (Recommended)
```bash
# Simply double-click this file:
deploy-now.bat
```

### Option 2: PowerShell
```powershell
# Run the PowerShell script:
.\deploy-complete.ps1
```

### Option 3: Manual SSH
```bash
# Upload and run on VPS:
scp deploy-complete.sh root@72.60.116.253:/tmp/
ssh root@72.60.116.253 "chmod +x /tmp/deploy-complete.sh && /tmp/deploy-complete.sh"
```

## 📋 Prerequisites

### Local Machine Requirements
- ✅ Windows 10/11 with PowerShell
- ✅ SSH client (OpenSSH or WSL)
- ✅ Internet connection
- ✅ Access to your VPS

### VPS Requirements
- ✅ Ubuntu 20.04+ or Debian 11+
- ✅ Root access
- ✅ Domain pointing to VPS IP
- ✅ At least 2GB RAM, 20GB storage

## 🔧 Configuration

### Default Settings
```bash
Domain: mymedspharmacyinc.com
VPS IP: 72.60.116.253
Database: mymeds_production
Admin Email: mymedspharmacyinc@gmail.com
Admin Password: MyMeds2024!@Pharm
```

### Custom Configuration
Edit the deployment script to change:
- Domain name
- VPS IP address
- Database credentials
- Admin credentials

## 📦 What Gets Deployed

### Backend (`/var/www/mymeds/backend/`)
- ✅ Express.js API server
- ✅ Prisma ORM with MySQL
- ✅ JWT authentication
- ✅ Rate limiting
- ✅ Security middleware
- ✅ File upload handling
- ✅ Email notifications
- ✅ Payment processing (WooCommerce)
- ✅ Health monitoring

### Frontend (`/var/www/mymeds/frontend/`)
- ✅ React application
- ✅ Vite build system
- ✅ TypeScript support
- ✅ Tailwind CSS
- ✅ Responsive design
- ✅ PWA capabilities

### Infrastructure
- ✅ Nginx web server
- ✅ MySQL database
- ✅ PM2 process manager
- ✅ UFW firewall
- ✅ Fail2ban intrusion detection
- ✅ Let's Encrypt SSL certificates
- ✅ Automated backups
- ✅ Health monitoring

## 🛡️ Security Features

### Network Security
- ✅ UFW firewall (ports 22, 80, 443 only)
- ✅ Fail2ban (brute force protection)
- ✅ Rate limiting (API abuse prevention)

### Application Security
- ✅ HTTPS enforcement
- ✅ Security headers (HSTS, CSP, etc.)
- ✅ CORS protection
- ✅ JWT token validation
- ✅ Input sanitization
- ✅ SQL injection prevention

### Data Protection
- ✅ Encrypted database connections
- ✅ Secure file uploads
- ✅ Automated backups
- ✅ Access logging

## 📊 Monitoring & Maintenance

### Health Checks
- ✅ Automated health monitoring (every 5 minutes)
- ✅ Service restart on failure
- ✅ Disk space monitoring
- ✅ Memory usage tracking

### Backups
- ✅ Daily automated backups
- ✅ Database + application files
- ✅ 7-day retention policy
- ✅ Manual backup option

### Logs
- ✅ Application logs: `/var/www/mymeds/logs/`
- ✅ Nginx logs: `/var/log/nginx/`
- ✅ PM2 logs: `/var/www/mymeds/backend/logs/`
- ✅ System logs: `/var/log/`

## 🚀 Deployment Process

### Step 1: Preparation
1. Ensure your domain points to your VPS IP
2. Have SSH access to your VPS
3. Run the deployment script

### Step 2: Automated Deployment
The script will automatically:
1. Update system packages
2. Install required software
3. Configure firewall and security
4. Set up MySQL database
5. Deploy backend application
6. Deploy frontend application
7. Configure Nginx web server
8. Install SSL certificates
9. Set up monitoring and backups
10. Verify deployment

### Step 3: Post-Deployment
1. Update production credentials
2. Test all functionality
3. Configure analytics
4. Set up monitoring alerts

## 🔧 Post-Deployment Configuration

### Update Production Credentials
```bash
# SSH to your VPS
ssh root@72.60.116.253

# Edit backend environment
nano /var/www/mymeds/backend/.env

# Update these values:
WOOCOMMERCE_STORE_URL=https://your-store.com
WOOCOMMERCE_CONSUMER_KEY=your_consumer_key
WOOCOMMERCE_CONSUMER_SECRET=your_consumer_secret
SMTP_PASS=your_actual_smtp_password
NEW_RELIC_LICENSE_KEY=your_actual_new_relic_key
```

### Test Functionality
```bash
# Test API endpoints
curl https://mymedspharmacyinc.com/api/health
curl https://mymedspharmacyinc.com/api/products

# Test frontend
curl https://mymedspharmacyinc.com
```

### Monitor Services
```bash
# Check PM2 status
pm2 status

# Check Nginx status
systemctl status nginx

# Check MySQL status
systemctl status mysql

# View recent logs
tail -f /var/www/mymeds/logs/deployment-*.log
```

## 🛠️ Troubleshooting

### Common Issues

#### SSL Certificate Issues
```bash
# Renew SSL certificate
certbot renew

# Check certificate status
certbot certificates
```

#### Service Not Starting
```bash
# Restart PM2
pm2 restart all

# Restart Nginx
systemctl restart nginx

# Restart MySQL
systemctl restart mysql
```

#### Database Connection Issues
```bash
# Check MySQL status
systemctl status mysql

# Test database connection
mysql -u mymeds_user -p mymeds_production
```

#### Permission Issues
```bash
# Fix file permissions
chown -R www-data:www-data /var/www/mymeds
chmod -R 755 /var/www/mymeds
```

### Log Analysis
```bash
# View application logs
tail -f /var/www/mymeds/backend/logs/combined.log

# View Nginx error logs
tail -f /var/log/nginx/error.log

# View system logs
journalctl -u nginx -f
```

## 📈 Performance Optimization

### Database Optimization
- ✅ Connection pooling enabled
- ✅ Query optimization
- ✅ Index optimization
- ✅ Regular maintenance

### Application Optimization
- ✅ Gzip compression
- ✅ Static file caching
- ✅ Rate limiting
- ✅ Memory management

### Server Optimization
- ✅ Nginx worker processes
- ✅ PM2 cluster mode
- ✅ Resource monitoring
- ✅ Automatic scaling

## 🔄 Updates & Maintenance

### Application Updates
```bash
# Pull latest code
cd /var/www/mymeds/backend
git pull origin main

# Install dependencies
npm install

# Run migrations
npx prisma migrate deploy

# Restart application
pm2 restart mymeds-backend
```

### System Updates
```bash
# Update system packages
apt update && apt upgrade

# Restart services if needed
systemctl restart nginx mysql
```

### Backup Verification
```bash
# Test backup restoration
/usr/local/bin/mymeds-backup.sh

# Verify backup files
ls -la /var/www/mymeds/backups/
```

## 📞 Support

### Useful Commands
```bash
# SSH to VPS
ssh root@72.60.116.253

# View deployment logs
tail -f /var/www/mymeds/logs/deployment-*.log

# Check service status
pm2 status && systemctl status nginx mysql

# Manual backup
/usr/local/bin/mymeds-backup.sh

# Health check
/usr/local/bin/mymeds-health-check.sh
```

### Emergency Procedures
```bash
# Emergency restart
pm2 restart all && systemctl restart nginx

# Rollback to previous version
# (Use backup files in /var/www/mymeds/backups/)

# Emergency maintenance mode
# (Edit Nginx config to show maintenance page)
```

## ✅ Deployment Checklist

- [ ] Domain DNS configured
- [ ] VPS access confirmed
- [ ] Deployment script executed
- [ ] SSL certificates installed
- [ ] Database created and migrated
- [ ] Backend deployed and running
- [ ] Frontend deployed and accessible
- [ ] Security measures active
- [ ] Monitoring configured
- [ ] Backups working
- [ ] All functionality tested
- [ ] Production credentials updated
- [ ] Analytics configured
- [ ] Documentation updated

## 🎉 Success!

Your MyMeds Pharmacy application is now live at:
**https://mymedspharmacyinc.com**

### Admin Access
- **URL**: https://mymedspharmacyinc.com/admin
- **Email**: mymedspharmacyinc@gmail.com
- **Password**: MyMeds2024!@Pharm

### API Documentation
- **Health Check**: https://mymedspharmacyinc.com/api/health
- **Products**: https://mymedspharmacyinc.com/api/products
- **Authentication**: https://mymedspharmacyinc.com/api/auth

---

**Need help?** Check the troubleshooting section or contact support.
