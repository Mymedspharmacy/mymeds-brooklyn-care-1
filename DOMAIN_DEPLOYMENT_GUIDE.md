# 🌐 MyMeds Pharmacy Inc. - Complete Domain Deployment Guide

## 🎯 **Deployment Overview**

**Domain**: `mymedspharmacyinc.com`  
**VPS**: Hostinger KVM1 (IP: 72.60.116.253)  
**Architecture**: Full-Stack Application with WooCommerce + WordPress Integration

---

## 🚀 **What You'll Get After Deployment**

### **Main Applications**
- **Frontend**: `https://www.mymedspharmacyinc.com` (React App)
- **Backend API**: `https://api.mymedspharmacyinc.com` (Node.js/Express)
- **WooCommerce Shop**: `https://shop.mymedspharmacyinc.com` (E-commerce)
- **WordPress Blog**: `https://blog.mymedspharmacyinc.com` (Content Management)

### **Features**
✅ **MyMeds Pharmacy App** - Complete medication management system  
✅ **WooCommerce Integration** - Online pharmacy store  
✅ **WordPress Blog** - Health articles, pharmacy news, patient education  
✅ **Secure API** - HIPAA-compliant backend  
✅ **SSL Certificates** - HTTPS for all subdomains  
✅ **Professional Domain** - Branded pharmacy experience  

---

## 📋 **Pre-Deployment Checklist**

### **1. Domain DNS Setup**
- [ ] Point `mymedspharmacyinc.com` to `72.60.116.253`
- [ ] Point `www.mymedspharmacyinc.com` to `72.60.116.253`
- [ ] Point `api.mymedspharmacyinc.com` to `72.60.116.253`
- [ ] Point `shop.mymedspharmacyinc.com` to `72.60.116.253`
- [ ] Point `blog.mymedspharmacyinc.com` to `72.60.116.253`

### **2. VPS Access**
- [ ] VPS IP: `72.60.116.253`
- [ ] Username: `root`
- [ ] Password: `Pharm-23-medS`
- [ ] SSH access confirmed

### **3. Application Files Ready**
- [ ] Backend `dist/` folder built
- [ ] Frontend `dist/` folder built
- [ ] `deploy-everything.sh` script ready
- [ ] `env.production` template ready

---

## 🔧 **Step-by-Step Deployment**

### **Phase 1: VPS Setup (Run on VPS)**

```bash
# 1. Access your VPS
ssh root@72.60.116.253

# 2. Update system
apt update && apt upgrade -y

# 3. Install required packages
apt install -y curl wget git build-essential nginx mysql-server mysql-client unzip

# 4. Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# 5. Install PM2
npm install -g pm2

# 6. Install Certbot for SSL
apt install -y certbot python3-certbot-nginx

# 7. Install firewall and monitoring
apt install -y ufw htop iotop nethogs logrotate apache2-utils

# 8. Create application directories
mkdir -p /var/www/mymeds-backend
mkdir -p /var/www/mymeds-frontend
mkdir -p /var/www/mymeds-shop
mkdir -p /var/www/mymeds-blog
mkdir -p /var/log/mymeds
mkdir -p /var/backups/mymeds
```

### **Phase 2: Database Setup**

```bash
# 1. Start and secure MySQL
systemctl start mysql
systemctl enable mysql

# 2. Create databases and user
mysql -e "CREATE DATABASE IF NOT EXISTS mymeds_production;"
mysql -e "CREATE DATABASE IF NOT EXISTS mymeds_woocommerce;"
mysql -e "CREATE DATABASE IF NOT EXISTS mymeds_wordpress;"
mysql -e "CREATE USER IF NOT EXISTS 'mymeds_user'@'localhost' IDENTIFIED BY 'MyMeds2024!@#';"
mysql -e "GRANT ALL PRIVILEGES ON mymeds_production.* TO 'mymeds_user'@'localhost';"
mysql -e "GRANT ALL PRIVILEGES ON mymeds_woocommerce.* TO 'mymeds_user'@'localhost';"
mysql -e "GRANT ALL PRIVILEGES ON mymeds_wordpress.* TO 'mymeds_user'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"
```

### **Phase 3: File Upload**

**Option A: Use FileZilla (Recommended)**
1. Download [FileZilla](https://filezilla-project.org/)
2. Connect to your VPS:
   - Host: `72.60.116.253`
   - Username: `root`
   - Password: `Pharm-23-medS`
   - Port: `22`
3. Upload files:
   - `backend/dist/*` → `/var/www/mymeds-backend/`
   - `backend/package*.json` → `/var/www/mymeds-backend/`
   - `dist/*` → `/var/www/mymeds-frontend/`
   - `deploy-everything.sh` → `/var/www/mymeds-backend/`
   - `backend/env.production` → `/var/www/mymeds-backend/`

**Option B: Use SCP from Windows**
```bash
# From your Windows terminal
scp -r backend/dist/* root@72.60.116.253:/var/www/mymeds-backend/
scp backend/package*.json root@72.60.116.253:/var/www/mymeds-backend/
scp -r dist/* root@72.60.116.253:/var/www/mymeds-frontend/
scp deploy-everything.sh root@72.60.116.253:/var/www/mymeds-backend/
scp backend/env.production root@72.60.116.253:/var/www/mymeds-backend/
```

### **Phase 4: Application Deployment**

```bash
# 1. Navigate to backend directory
cd /var/www/mymeds-backend

# 2. Install dependencies
npm ci --only=production

# 3. Generate Prisma client
npx prisma generate

# 4. Run database migrations
npx prisma migrate deploy

# 5. Make deployment script executable
chmod +x deploy-everything.sh

# 6. Run the complete deployment
./deploy-everything.sh
```

---

## 🌐 **DNS Configuration**

### **DNS Records to Add**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `@` | `72.60.116.253` | 300 |
| A | `www` | `72.60.116.253` | 300 |
| A | `api` | `72.60.116.253` | 300 |
| A | `shop` | `72.60.116.253` | 300 |
| A | `blog` | `72.60.116.253` | 300 |

### **Where to Add DNS Records**
1. **GoDaddy**: DNS Management → Manage Zones
2. **Namecheap**: Domain List → Manage → Advanced DNS
3. **Hostinger**: Domains → DNS Zone Editor
4. **Cloudflare**: DNS → Add Record

---

## 🛒 **WooCommerce Setup**

### **1. Access WooCommerce Admin**
- URL: `https://shop.mymedspharmacyinc.com/wp-admin`
- Default credentials will be set during deployment

### **2. Configure WooCommerce**
1. **Install WooCommerce Plugin**
2. **Run Setup Wizard**
3. **Configure Store Settings**:
   - Store Address
   - Currency (USD)
   - Payment Methods
   - Shipping Zones
   - Tax Settings

### **3. Add Pharmacy Products**
- Prescription Medications
- Over-the-Counter Products
- Medical Supplies
- Health & Wellness Items

---

## 📝 **WordPress Blog Setup**

### **1. Access WordPress Admin**
- URL: `https://blog.mymedspharmacyinc.com/wp-admin`
- Default credentials will be set during deployment

### **2. Configure WordPress**
1. **General Settings**:
   - Site Title: "MyMeds Pharmacy Blog"
   - Tagline: "Health & Wellness Information"
   - WordPress Address: `https://blog.mymedspharmacyinc.com`
   - Site Address: `https://blog.mymedspharmacyinc.com`

2. **Install Essential Plugins**:
   - Yoast SEO
   - WP Rocket (caching)
   - Wordfence Security
   - UpdraftPlus (backups)

### **3. Create Content Categories**
- Health Tips
- Medication Information
- Pharmacy News
- Patient Education
- Wellness Advice

---

## 🔒 **SSL Certificate Setup**

### **Automatic SSL (Recommended)**
The deployment script will automatically:
1. Install Certbot
2. Generate SSL certificates for all subdomains
3. Configure Nginx for HTTPS
4. Set up automatic renewal

### **Manual SSL (If needed)**
```bash
# Generate SSL certificates
certbot --nginx -d mymedspharmacyinc.com -d www.mymedspharmacyinc.com -d api.mymedspharmacyinc.com -d shop.mymedspharmacyinc.com -d blog.mymedspharmacyinc.com --non-interactive --agree-tos --email admin@mymedspharmacyinc.com
```

---

## 📊 **Post-Deployment Verification**

### **1. Health Check**
```bash
# Run health check script
/var/www/mymeds-backend/health-check.sh
```

### **2. Test All Endpoints**
- ✅ Frontend: `https://www.mymedspharmacyinc.com`
- ✅ Backend API: `https://api.mymedspharmacyinc.com/api/health`
- ✅ WooCommerce: `https://shop.mymedspharmacyinc.com`
- ✅ WordPress: `https://blog.mymedspharmacyinc.com`

### **3. Check Services**
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

---

## 🚨 **Troubleshooting**

### **Common Issues & Solutions**

#### **1. DNS Not Resolving**
- Wait 24-48 hours for DNS propagation
- Check DNS records are correct
- Use `nslookup` or `dig` to verify

#### **2. SSL Certificate Issues**
```bash
# Check certificate status
certbot certificates

# Renew certificates
certbot renew --dry-run
```

#### **3. Application Not Starting**
```bash
# Check PM2 logs
pm2 logs

# Check application logs
tail -f /var/log/mymeds/err.log
```

#### **4. Database Connection Issues**
```bash
# Test MySQL connection
mysql -u mymeds_user -p mymeds_production

# Check MySQL status
systemctl status mysql
```

---

## 🔧 **Maintenance & Updates**

### **Daily Tasks**
- Monitor application health
- Check error logs
- Verify backups

### **Weekly Tasks**
- Update system packages
- Review security logs
- Check disk space

### **Monthly Tasks**
- Review performance metrics
- Update SSL certificates
- Database optimization

---

## 📞 **Support & Resources**

### **Useful Commands**
```bash
# Application status
pm2 status
pm2 monit

# Logs
tail -f /var/log/mymeds/combined.log

# Health check
/var/www/mymeds-backend/health-check.sh

# Backup
/var/www/mymeds-backend/backup.sh
```

### **File Locations**
- **Application**: `/var/www/mymeds-*`
- **Logs**: `/var/log/mymeds/`
- **Backups**: `/var/backups/mymeds/`
- **Nginx Config**: `/etc/nginx/sites-available/mymedspharmacyinc.com`

---

## 🎉 **Congratulations!**

Your MyMeds Pharmacy Inc. application is now deployed with:
- ✅ Professional domain branding
- ✅ Complete e-commerce solution
- ✅ Content management system
- ✅ Secure API backend
- ✅ SSL encryption
- ✅ Professional hosting

**Your pharmacy is now online at `https://www.mymedspharmacyinc.com`!**

---

## 📞 **Need Help?**

If you encounter any issues during deployment:
1. Check the troubleshooting section above
2. Review the logs in `/var/log/mymeds/`
3. Run the health check script
4. Verify all services are running

**Your MyMeds application is ready for real-world pharmacy operations!** 🚀

