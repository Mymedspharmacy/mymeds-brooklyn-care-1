# MyMeds Pharmacy VPS Deployment Checklist

## 🚀 **Pre-Deployment Checklist**

### **VPS Requirements**
- [ ] Ubuntu 20.04+ or Debian 11+
- [ ] Minimum 2GB RAM
- [ ] Minimum 20GB SSD storage
- [ ] Root access or sudo privileges
- [ ] Domain `mymedspharmacyinc.com` pointing to VPS IP

### **Domain Configuration**
- [ ] Domain DNS A record pointing to VPS IP
- [ ] Domain DNS AAAA record (if IPv6 available)
- [ ] Domain DNS CNAME record for www subdomain
- [ ] SSL certificate ready (Let's Encrypt)

## 🔧 **Deployment Steps**

### **Step 1: VPS Setup**
```bash
# Connect to VPS
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Run deployment script
chmod +x vps-deployment.sh
./vps-deployment.sh
```

### **Step 2: Upload Application Code**
```bash
# Upload your MyMeds code to /var/www/mymeds
# You can use SCP, SFTP, or Git clone
scp -r ./mymeds-brooklyn-care-1-4/* root@your-vps-ip:/var/www/mymeds/
```

### **Step 3: Configure Environment**
```bash
# Copy environment template
cp /var/www/mymeds/.env.production.template /var/www/mymeds/.env.production

# Edit environment file
nano /var/www/mymeds/.env.production
```

### **Step 4: Deploy Application**
```bash
cd /var/www/mymeds
chmod +x deploy.sh
./deploy.sh
```

### **Step 5: Request SSL Certificate**
```bash
cd /var/www/mymeds
chmod +x request-ssl.sh
./request-ssl.sh
```

## 📝 **Environment Configuration**

### **Required Environment Variables**
```bash
# Database
DATABASE_URL="mysql://mymeds_user:MyMeds2025!SecurePassword@localhost:3306/mymeds_db"

# Security
JWT_SECRET="MyMeds2025!JWTSecretKey_Production_Secure_2025!@#$%^&*()"
ADMIN_PASSWORD_HASH="REPLACE_WITH_BCRYPT_HASH"
CSRF_SECRET="MyMeds2025!CSRFSecret_Production_Secure_2025!@#$%^&*()"

# WordPress Integration
WORDPRESS_SITE_URL="https://mymedspharmacyinc.com"
WORDPRESS_USERNAME="REPLACE_WITH_WP_USERNAME"
WORDPRESS_APPLICATION_PASSWORD="REPLACE_WITH_WP_APP_PASSWORD"

# WooCommerce Integration
WOOCOMMERCE_STORE_URL="https://mymedspharmacyinc.com"
WOOCOMMERCE_CONSUMER_KEY="REPLACE_WITH_WC_CONSUMER_KEY"
WOOCOMMERCE_CONSUMER_SECRET="REPLACE_WITH_WC_CONSUMER_SECRET"
```

## 🔐 **Security Configuration**

### **MySQL Security**
- [ ] Change default MySQL root password
- [ ] Create dedicated database users
- [ ] Set up database backups
- [ ] Configure MySQL security settings

### **Nginx Security**
- [ ] Enable SSL/TLS
- [ ] Configure security headers
- [ ] Set up rate limiting
- [ ] Enable fail2ban

### **Application Security**
- [ ] Set strong JWT secret
- [ ] Generate bcrypt password hash
- [ ] Configure CSRF protection
- [ ] Set up rate limiting

## 🌐 **WordPress Setup**

### **WordPress Installation**
- [ ] Access WordPress admin: `https://mymedspharmacyinc.com/wp-admin`
- [ ] Complete WordPress setup wizard
- [ ] Install required plugins
- [ ] Configure WordPress settings

### **WordPress API Configuration**
- [ ] Create Application Password
- [ ] Configure WordPress API settings
- [ ] Test WordPress API connection

## 🛒 **WooCommerce Setup**

### **WooCommerce Installation**
- [ ] Install WooCommerce plugin
- [ ] Complete WooCommerce setup
- [ ] Configure payment methods
- [ ] Set up shipping options

### **WooCommerce API Configuration**
- [ ] Generate Consumer Key
- [ ] Generate Consumer Secret
- [ ] Configure WooCommerce API settings
- [ ] Test WooCommerce API connection

## 📊 **Testing Checklist**

### **Frontend Testing**
- [ ] Homepage loads correctly
- [ ] All pages accessible
- [ ] Forms working
- [ ] Contact form submission
- [ ] Refill form submission
- [ ] Transfer form submission
- [ ] Appointment form submission

### **Backend Testing**
- [ ] API endpoints responding
- [ ] Database connections working
- [ ] Authentication working
- [ ] Admin panel accessible
- [ ] Data persistence working

### **Integration Testing**
- [ ] WordPress blog posts fetching
- [ ] WooCommerce products fetching
- [ ] WordPress settings sync
- [ ] WooCommerce settings sync

## 🔍 **Monitoring Setup**

### **System Monitoring**
- [ ] PM2 process monitoring
- [ ] Nginx status monitoring
- [ ] MySQL status monitoring
- [ ] Disk space monitoring
- [ ] Memory usage monitoring

### **Application Monitoring**
- [ ] Error logging
- [ ] Performance monitoring
- [ ] Security monitoring
- [ ] Backup monitoring

## 🚨 **Troubleshooting**

### **Common Issues**
- [ ] SSL certificate errors
- [ ] Database connection errors
- [ ] Nginx configuration errors
- [ ] PM2 process errors
- [ ] WordPress API errors
- [ ] WooCommerce API errors

### **Log Locations**
- [ ] Application logs: `/var/log/mymeds/`
- [ ] Nginx logs: `/var/log/nginx/`
- [ ] MySQL logs: `/var/log/mysql/`
- [ ] PM2 logs: `pm2 logs`

## 📞 **Support Information**

### **Contact Details**
- [ ] Admin email: admin@mymedspharmacyinc.com
- [ ] Support email: support@mymedspharmacyinc.com
- [ ] Emergency contact: [Your phone number]

### **Documentation**
- [ ] Deployment README: `/var/www/mymeds/DEPLOYMENT_README.md`
- [ ] API documentation: `https://mymedspharmacyinc.com/api/docs`
- [ ] Admin guide: `https://mymedspharmacyinc.com/wp-admin`

## ✅ **Final Verification**

### **Production Checklist**
- [ ] All URLs working
- [ ] SSL certificate valid
- [ ] All forms functional
- [ ] Admin panel accessible
- [ ] WordPress integration working
- [ ] WooCommerce integration working
- [ ] Database backups configured
- [ ] Monitoring setup complete
- [ ] Security measures in place
- [ ] Performance optimized

---

## 🎯 **Success Criteria**

✅ **Deployment Complete When:**
- Frontend accessible at `https://mymedspharmacyinc.com`
- Backend API responding at `https://mymedspharmacyinc.com/api/`
- WordPress admin accessible at `https://mymedspharmacyinc.com/wp-admin`
- All forms submitting data to database
- WordPress blog posts displaying
- WooCommerce products displaying
- SSL certificate valid
- All security measures active
- Monitoring and backups configured

---

**🚀 Ready for Production!**
