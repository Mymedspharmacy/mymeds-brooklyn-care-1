# 🚀 **MyMeds Pharmacy VPS KVM1 Hostinger Deployment Guide**

## 📋 **Overview**

This guide provides step-by-step instructions for deploying the MyMeds Pharmacy application on VPS KVM1 Hostinger with **Phase 1 scalability improvements** implemented. The deployment is optimized for performance, security, and scalability.

---

## 🎯 **Phase 1 Scalability Improvements Implemented**

### ✅ **1. Database Connection Pooling**
- Optimized Prisma client configuration
- Connection pool management
- VPS-specific connection limits

### ✅ **2. Database Performance Indexes**
- Added strategic database indexes
- Optimized query performance
- Enhanced search capabilities

### ✅ **3. Enhanced Memory Management**
- Increased memory thresholds (1GB warning, 2GB critical)
- Memory usage monitoring
- Automatic cleanup processes

### ✅ **4. Basic Caching System**
- In-memory caching layer
- TTL-based cache management
- Cache size monitoring

---

## 🛠️ **Prerequisites**

### **VPS Requirements**
- **Hostinger VPS KVM1** (or higher)
- **Ubuntu 20.04+** or **Debian 11+**
- **Minimum 2GB RAM** (4GB recommended)
- **20GB+ storage**
- **Root access** or **sudo privileges**

### **Domain Requirements**
- **Domain name** pointing to your VPS IP
- **DNS access** for configuration
- **Email access** for SSL certificates

---

## 🚀 **Step-by-Step Deployment**

### **Step 1: Initial VPS Setup**

#### **1.1 Connect to Your VPS**
```bash
ssh root@your-vps-ip
```

#### **1.2 Update System**
```bash
apt update && apt upgrade -y
```

#### **1.3 Install Essential Packages**
```bash
apt install -y curl wget git build-essential htop
```

### **Step 2: Install Required Software**

#### **2.1 Install Node.js 18.x (LTS)**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs
```

#### **2.2 Install PM2 Process Manager**
```bash
npm install -g pm2
```

#### **2.3 Install Database & Cache**
```bash
# MySQL
apt install -y mysql-server

# Redis
apt install -y redis-server
```

#### **2.4 Install Web Server & SSL**
```bash
# Nginx
apt install -y nginx nginx-extras

# Let's Encrypt
apt install -y certbot python3-certbot-nginx
```

#### **2.5 Install Security Tools**
```bash
# Firewall
apt install -y ufw

# Intrusion Prevention
apt install -y fail2ban
```

### **Step 3: Configure Database**

#### **3.1 Secure MySQL Installation**
```bash
mysql_secure_installation
```

#### **3.2 Create Database & User**
```bash
mysql -u root -p
```

```sql
CREATE DATABASE mymeds_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mymeds_user'@'localhost' IDENTIFIED BY 'your-secure-password';
GRANT ALL PRIVILEGES ON mymeds_db.* TO 'mymeds_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### **3.3 Configure Redis**
```bash
systemctl enable redis-server
systemctl start redis-server
```

### **Step 4: Deploy Application**

#### **4.1 Clone Repository**
```bash
cd /var/www
git clone https://github.com/your-username/mymeds-pharmacy.git
cd mymeds-pharmacy
```

#### **4.2 Build Frontend**
```bash
npm install
npm run build
```

#### **4.3 Build Backend**
```bash
cd backend
npm install
npm run build
```

#### **4.4 Configure Environment**
```bash
# Copy environment template
cp ../env-vps-kvm1.example .env

# Edit with your values
nano .env
```

**Required Environment Variables:**
```env
NODE_ENV=production
PORT=4000
DATABASE_URL=mysql://mymeds_user:your-password@localhost:3306/mymeds_db
JWT_SECRET=your-super-secret-jwt-key
WOOCOMMERCE_STORE_URL=https://your-store.com
WOOCOMMERCE_CONSUMER_KEY=your-key
WOOCOMMERCE_CONSUMER_SECRET=your-secret
```

### **Step 5: Configure PM2 Process Manager**

#### **5.1 Start Application**
```bash
# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

#### **5.2 Verify PM2 Status**
```bash
pm2 status
pm2 logs
```

### **Step 6: Configure Nginx**

#### **6.1 Copy Nginx Configuration**
```bash
cp nginx-vps-config.conf /etc/nginx/sites-available/mymeds-pharmacy
```

#### **6.2 Update Configuration**
```bash
# Replace placeholders
sed -i 's/your-domain.com/your-actual-domain.com/g' /etc/nginx/sites-available/mymeds-pharmacy
sed -i 's/your-vps-ip/YOUR_ACTUAL_VPS_IP/g' /etc/nginx/sites-available/mymeds-pharmacy
```

#### **6.3 Enable Site**
```bash
ln -sf /etc/nginx/sites-available/mymeds-pharmacy /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### **Step 7: Configure SSL Certificate**

#### **7.1 Obtain SSL Certificate**
```bash
certbot --nginx -d your-domain.com --non-interactive --agree-tos --email your-email@example.com
```

#### **7.2 Test SSL Configuration**
```bash
certbot certificates
```

### **Step 8: Configure Security**

#### **8.1 Configure Firewall**
```bash
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 4000
ufw status
```

#### **8.2 Configure Fail2ban**
```bash
systemctl enable fail2ban
systemctl start fail2ban
```

### **Step 9: Setup Monitoring & Backups**

#### **9.1 Create Monitoring Script**
```bash
# Copy the monitoring script from deploy-vps-kvm1.sh
# It's already included in the deployment script
```

#### **9.2 Setup Cron Jobs**
```bash
# Monitoring (every 5 minutes)
crontab -e
# Add: */5 * * * * /usr/local/bin/mymeds-monitor.sh

# Daily backup (2 AM)
# Add: 0 2 * * * /usr/local/bin/mymeds-backup.sh
```

---

## 🔧 **Post-Deployment Configuration**

### **1. Database Migration**
```bash
cd /var/www/mymeds-pharmacy/backend
npx prisma migrate deploy
npx prisma generate
```

### **2. Test Application**
```bash
# Test health endpoint
curl http://localhost:4000/api/health

# Test frontend
curl http://localhost
```

### **3. Monitor Logs**
```bash
# PM2 logs
pm2 logs

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Application logs
tail -f /var/log/mymeds/monitor.log
```

---

## 📊 **Performance Monitoring**

### **1. PM2 Monitoring**
```bash
# Real-time monitoring
pm2 monit

# Process status
pm2 status

# Performance metrics
pm2 show mymeds-backend
```

### **2. System Monitoring**
```bash
# System resources
htop

# Memory usage
free -h

# Disk usage
df -h

# Network connections
netstat -tulpn
```

### **3. Application Health**
```bash
# Health check
curl https://your-domain.com/api/health

# Database health
curl https://your-domain.com/api/health/db
```

---

## 🚨 **Troubleshooting**

### **Common Issues & Solutions**

#### **1. Application Won't Start**
```bash
# Check PM2 logs
pm2 logs

# Check environment variables
pm2 env mymeds-backend

# Restart application
pm2 restart all
```

#### **2. Database Connection Issues**
```bash
# Test MySQL connection
mysql -u mymeds_user -p mymeds_db

# Check MySQL status
systemctl status mysql

# Check MySQL logs
tail -f /var/log/mysql/error.log
```

#### **3. Nginx Issues**
```bash
# Test Nginx configuration
nginx -t

# Check Nginx status
systemctl status nginx

# Check Nginx logs
tail -f /var/log/nginx/error.log
```

#### **4. SSL Certificate Issues**
```bash
# Check certificate status
certbot certificates

# Renew certificate
certbot renew --dry-run

# Check SSL configuration
openssl s_client -connect your-domain.com:443
```

---

## 🔒 **Security Checklist**

### **✅ Completed Security Measures**
- [x] **Firewall (UFW)** configured
- [x] **Fail2ban** intrusion prevention
- [x] **SSL/TLS** encryption
- [x] **Rate limiting** implemented
- [x] **Security headers** configured
- [x] **Database user** with limited privileges
- [x] **Environment variables** secured

### **🔒 Additional Security Recommendations**
- [ ] **Regular security updates**
- [ ] **Database backups** verification
- [ ] **SSL certificate** renewal monitoring
- [ ] **Access logs** monitoring
- [ ] **Intrusion detection** alerts

---

## 📈 **Scalability Features**

### **🚀 Phase 1 Implemented**
- **Database connection pooling** ✅
- **Performance indexes** ✅
- **Enhanced memory management** ✅
- **Basic caching system** ✅
- **PM2 clustering** ✅
- **Nginx load balancing** ✅

### **🔮 Phase 2 (Future)**
- **Redis caching layer**
- **Database read replicas**
- **Advanced clustering**
- **CDN integration**

---

## 📞 **Support & Maintenance**

### **Daily Operations**
```bash
# Check application status
pm2 status

# Monitor system resources
htop

# Check logs for errors
pm2 logs --lines 100
```

### **Weekly Maintenance**
```bash
# Update system packages
apt update && apt upgrade -y

# Check SSL certificate expiry
certbot certificates

# Verify backup integrity
ls -la /var/backups/mymeds/
```

### **Monthly Tasks**
- **Performance review**
- **Security audit**
- **Backup restoration test**
- **SSL certificate renewal**

---

## 🎉 **Deployment Complete!**

Your MyMeds Pharmacy application is now deployed on VPS KVM1 Hostinger with **Phase 1 scalability improvements**!

### **🌐 Access Your Application**
- **Frontend**: https://your-domain.com
- **Backend API**: https://your-domain.com/api
- **Health Check**: https://your-domain.com/api/health
- **Status Monitor**: https://your-domain.com/status

### **🔧 Management Commands**
```bash
# Application management
pm2 start/stop/restart/reload all

# Log monitoring
pm2 logs --lines 100

# Performance monitoring
pm2 monit

# System status
systemctl status nginx mysql redis-server
```

### **📊 Performance Metrics**
- **Response Time**: < 200ms (target)
- **Throughput**: 1000+ req/min
- **Memory Usage**: < 1GB (normal)
- **CPU Usage**: < 70% (normal)

---

## 🚀 **Next Steps**

1. **Test all functionality** thoroughly
2. **Monitor performance** for 24-48 hours
3. **Configure alerts** for critical issues
4. **Plan Phase 2** scalability improvements
5. **Document customizations** made

---

**🎯 Your application is now ready for production use with enterprise-level scalability!**
