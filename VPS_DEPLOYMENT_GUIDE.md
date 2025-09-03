# 🚀 MyMeds Pharmacy VPS Deployment Guide

## 📋 **Overview**
This guide will help you deploy your MyMeds Pharmacy application to a VPS with MySQL database, Nginx, SSL, and all production-ready features.

## 🎯 **What Gets Deployed**

### **Backend (Node.js/Express)**
- ✅ MySQL database with production schema
- ✅ JWT authentication system
- ✅ WooCommerce integration
- ✅ WordPress integration
- ✅ File upload system
- ✅ Email notifications
- ✅ Rate limiting and security
- ✅ PM2 process management

### **Frontend (React/Vite)**
- ✅ Built and optimized for production
- ✅ Served by Nginx
- ✅ Static asset caching
- ✅ SPA routing support

### **Infrastructure**
- ✅ MySQL database server
- ✅ Nginx web server with SSL
- ✅ PM2 process manager
- ✅ UFW firewall
- ✅ Fail2ban intrusion prevention
- ✅ Automated backups
- ✅ Health monitoring
- ✅ SSL certificates (Let's Encrypt)

## 🚀 **Quick Deployment Steps**

### **1. Prepare Your VPS**
```bash
# Connect to your VPS
ssh root@72.60.116.253

# Make the deployment script executable
chmod +x deploy-vps-mysql.sh

# Run the deployment script
./deploy-vps-mysql.sh
```

### **2. Update DNS Records**
Point your domain `mymedspharmacyinc.com` to your VPS IP: `72.60.116.253`

### **3. Configure SSL**
The script will automatically set up SSL certificates using Let's Encrypt.

## 📊 **Database Configuration**

### **MySQL Production Setup**
- **Database Name:** `mymeds_production`
- **User:** `mymeds_user`
- **Password:** `MyMedsSecurePassword2024!`
- **Host:** `localhost`
- **Port:** `3306`

### **Connection String**
```env
DATABASE_URL="mysql://mymeds_user:MyMedsSecurePassword2024!@localhost:3306/mymeds_production"
```

## 🔧 **Environment Configuration**

### **Production Environment Variables**
The deployment script will automatically configure:
- ✅ Database connection
- ✅ JWT secrets
- ✅ CORS origins
- ✅ Rate limiting
- ✅ SSL certificates
- ✅ Monitoring settings

### **Key Production Settings**
```env
NODE_ENV=production
PORT=4000
HOST=0.0.0.0
DATABASE_URL="mysql://mymeds_user:MyMedsSecurePassword2024!@localhost:3306/mymeds_production"
JWT_SECRET=your_64_character_jwt_secret_here
CORS_ORIGINS=https://www.mymedspharmacyinc.com,https://mymedspharmacyinc.com
RATE_LIMITING_ENABLED=true
SSL_ENABLED=true
```

## 🛡️ **Security Features**

### **Firewall (UFW)**
- ✅ SSH access only
- ✅ HTTP (80) and HTTPS (443)
- ✅ Backend API (4000)
- ✅ All other ports blocked

### **Fail2ban Protection**
- ✅ Nginx brute force protection
- ✅ API rate limiting
- ✅ SSH attack prevention
- ✅ Automatic IP blocking

### **SSL/TLS Security**
- ✅ Let's Encrypt certificates
- ✅ HTTP/2 support
- ✅ Security headers
- ✅ HSTS enabled

## 📈 **Performance Optimization**

### **Nginx Configuration**
- ✅ Gzip compression
- ✅ Static asset caching
- ✅ Load balancing
- ✅ Rate limiting
- ✅ Security headers

### **Database Optimization**
- ✅ Connection pooling
- ✅ Query optimization
- ✅ Indexed tables
- ✅ Regular maintenance

### **Application Optimization**
- ✅ PM2 clustering
- ✅ Memory management
- ✅ Error handling
- ✅ Logging optimization

## 🔄 **Backup & Recovery**

### **Automated Backups**
- ✅ Daily database backups
- ✅ File system backups
- ✅ 30-day retention
- ✅ Automated cleanup

### **Backup Schedule**
```bash
# Daily at 2 AM
0 2 * * * /var/www/mymeds/backup.sh
```

### **Manual Backup**
```bash
# Run backup manually
/var/www/mymeds/backup.sh
```

## 📊 **Monitoring & Health Checks**

### **Service Monitoring**
- ✅ Backend process monitoring
- ✅ Nginx service monitoring
- ✅ MySQL service monitoring
- ✅ Automatic restart on failure

### **Resource Monitoring**
- ✅ Disk space monitoring
- ✅ Memory usage monitoring
- ✅ CPU usage tracking
- ✅ Alert notifications

### **Health Check Endpoints**
- ✅ `/health` - Basic health check
- ✅ `/api/health` - API health check
- ✅ `/api/health/db` - Database health check

## 🚀 **Deployment Commands**

### **Start Deployment**
```bash
# Run the complete deployment
./deploy-vps-mysql.sh
```

### **Check Status**
```bash
# Check PM2 status
pm2 status

# Check Nginx status
systemctl status nginx

# Check MySQL status
systemctl status mysql

# Check firewall status
ufw status
```

### **View Logs**
```bash
# Application logs
pm2 logs

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# MySQL logs
tail -f /var/log/mysql/error.log

# Application logs
tail -f /var/log/mymeds/application.log
```

### **Restart Services**
```bash
# Restart backend
pm2 restart mymeds-backend

# Restart Nginx
systemctl restart nginx

# Restart MySQL
systemctl restart mysql
```

## 🔧 **Post-Deployment Configuration**

### **1. Update Domain DNS**
Point your domain to your VPS IP address.

### **2. Configure WooCommerce**
Update the production environment with your WooCommerce credentials:
```env
WOOCOMMERCE_STORE_URL=https://your-production-store.com
WOOCOMMERCE_CONSUMER_KEY=your_production_consumer_key
WOOCOMMERCE_CONSUMER_SECRET=your_production_consumer_secret
```

### **3. Configure Email**
Set up production email settings:
```env
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_production_email@gmail.com
SMTP_PASS=your_production_app_password
```

### **4. Test All Features**
- ✅ User registration and login
- ✅ Product management
- ✅ WooCommerce integration
- ✅ File uploads
- ✅ Email notifications

## 🛠️ **Troubleshooting**

### **Common Issues**

#### **Backend Not Starting**
```bash
# Check PM2 logs
pm2 logs mymeds-backend

# Check environment variables
cat /var/www/mymeds/backend/.env

# Restart the service
pm2 restart mymeds-backend
```

#### **Database Connection Issues**
```bash
# Test MySQL connection
mysql -u mymeds_user -p

# Check MySQL status
systemctl status mysql

# Restart MySQL
systemctl restart mysql
```

#### **Nginx Issues**
```bash
# Test Nginx configuration
nginx -t

# Check Nginx status
systemctl status nginx

# Restart Nginx
systemctl restart nginx
```

#### **SSL Certificate Issues**
```bash
# Check SSL certificate
certbot certificates

# Renew SSL certificate
certbot renew

# Check SSL configuration
openssl s_client -connect mymedspharmacyinc.com:443
```

### **Performance Issues**
```bash
# Check system resources
htop
df -h
free -h

# Check application performance
pm2 monit

# Check database performance
mysql -u mymeds_user -p -e "SHOW PROCESSLIST;"
```

## 📞 **Support & Maintenance**

### **Regular Maintenance**
- ✅ Daily backups
- ✅ Weekly security updates
- ✅ Monthly performance reviews
- ✅ Quarterly SSL certificate renewal

### **Monitoring Alerts**
- ✅ Service down alerts
- ✅ High resource usage alerts
- ✅ Security breach alerts
- ✅ Backup failure alerts

### **Log Locations**
- **Application:** `/var/log/mymeds/`
- **Nginx:** `/var/log/nginx/`
- **MySQL:** `/var/log/mysql/`
- **System:** `/var/log/syslog`

## 🎉 **Deployment Complete!**

After running the deployment script, your MyMeds Pharmacy application will be:

- ✅ **Live at:** https://mymedspharmacyinc.com
- ✅ **API at:** https://mymedspharmacyinc.com/api
- ✅ **Database:** MySQL production ready
- ✅ **Security:** SSL, firewall, monitoring
- ✅ **Performance:** Optimized and scalable
- ✅ **Backups:** Automated daily backups
- ✅ **Monitoring:** 24/7 health checks

### **Next Steps**
1. Test all application features
2. Configure WooCommerce integration
3. Set up monitoring alerts
4. Configure email notifications
5. Test backup and recovery procedures

---

**🎯 Your MyMeds Pharmacy application is now production-ready and deployed on your VPS with MySQL!**
