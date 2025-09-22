# 🚀 Complete VPS Deployment Package - MyMeds Pharmacy Inc.

## 📋 Pre-Deployment Checklist

### ✅ **What's Ready:**
- [x] SSL certificates setup scripts
- [x] Docker Compose configuration
- [x] Nginx SSL configuration
- [x] Environment variables configured
- [x] Database initialization scripts
- [x] Health check and monitoring scripts
- [x] Automated renewal setup

### ⚠️ **What You Need to Do:**
1. **Set up DNS** (CRITICAL - must be done first)
2. **Upload files to VPS**
3. **Run deployment scripts**

## 🎯 **EXACT DEPLOYMENT STEPS**

### **Step 1: DNS Configuration (DO THIS FIRST!)**

**Go to your domain registrar and set these DNS records:**

```
Type: A
Name: @
Value: 72.60.116.253
TTL: 300

Type: A  
Name: www
Value: 72.60.116.253
TTL: 300
```

**Wait 5-10 minutes for DNS propagation, then verify:**
```bash
nslookup mymedspharmacyinc.com
# Should return: 72.60.116.253
```

### **Step 2: Connect to Your VPS**

```bash
ssh root@72.60.116.253
```

### **Step 3: Prepare VPS Environment**

```bash
# Update system
apt update && apt upgrade -y

# Install required packages
apt install -y curl wget git unzip htop nano ufw certbot python3-certbot-nginx

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# Verify installations
docker --version
docker-compose --version
```

### **Step 4: Upload Your Project Files**

**From your local machine (Windows PowerShell):**

```powershell
# Create deployment package
mkdir mymeds-deployment
copy docker-compose.optimized.yml mymeds-deployment/
copy -r deployment mymeds-deployment/
copy -r backend mymeds-deployment/
copy -r src mymeds-deployment/
copy package*.json mymeds-deployment/
copy *.ts mymeds-deployment/
copy *.js mymeds-deployment/
copy *.md mymeds-deployment/

# Upload to VPS
scp -r mymeds-deployment root@72.60.116.253:/var/www/
```

### **Step 5: Set Up Project on VPS**

```bash
# On your VPS
cd /var/www/mymeds-deployment

# Make scripts executable
chmod +x deployment/scripts/*.sh

# Create necessary directories
mkdir -p /var/www/certbot
mkdir -p /var/log/mymeds
mkdir -p /var/www/mymeds/uploads
mkdir -p /var/www/mymeds/logs
mkdir -p /var/www/mymeds/backups

# Set permissions
chown -R www-data:www-data /var/www/certbot
chmod -R 755 /var/www/certbot
```

### **Step 6: Configure Firewall**

```bash
# Configure UFW firewall
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable
```

### **Step 7: Run SSL Setup**

```bash
# Run SSL certificate setup
./deployment/scripts/setup-ssl.sh
```

**If SSL setup fails due to DNS:**
```bash
# Set up temporary HTTP server for Let's Encrypt validation
python3 -m http.server 80 --directory /var/www/html &
# Then run SSL setup again
./deployment/scripts/setup-ssl.sh
```

### **Step 8: Deploy Application with SSL**

```bash
# Deploy complete application
./deployment/scripts/deploy-with-ssl.sh
```

### **Step 9: Verify Deployment**

```bash
# Check all services are running
docker-compose -f docker-compose.optimized.yml ps

# Check SSL health
./deployment/scripts/ssl-health-check.sh

# Test endpoints
curl -I https://mymedspharmacyinc.com
curl -I https://mymedspharmacyinc.com/api/health
```

## 🔧 **Alternative: One-Command Deployment**

If you want to do everything at once:

```bash
# On your VPS, run this single command
cd /var/www/mymeds-deployment && ./deployment/scripts/deploy-with-ssl.sh
```

## 📊 **Post-Deployment Verification**

### **Check Service Status:**
```bash
# View running containers
docker-compose -f docker-compose.optimized.yml ps

# Check resource usage
docker stats

# View logs
docker-compose -f docker-compose.optimized.yml logs -f
```

### **Test Your Website:**
- **Main Site**: https://mymedspharmacyinc.com
- **API Health**: https://mymedspharmacyinc.com/api/health
- **WordPress Admin**: https://mymedspharmacyinc.com/wp-admin
- **WooCommerce Shop**: https://mymedspharmacyinc.com/shop

### **Default Login Credentials:**
- **WordPress Admin**: `admin` / `Mymeds2025!AdminSecure123!@#`
- **MyMeds Admin**: `admin@mymedspharmacyinc.com` / `Mymeds2025!AdminSecure123!@#`

## 🚨 **Troubleshooting Commands**

### **If SSL fails:**
```bash
# Check Let's Encrypt logs
tail -f /var/log/letsencrypt/letsencrypt.log

# Test manual certificate request
certbot certonly --webroot --webroot-path=/var/www/certbot -d mymedspharmacyinc.com -d www.mymedspharmacyinc.com
```

### **If containers won't start:**
```bash
# Check Docker logs
docker-compose -f docker-compose.optimized.yml logs

# Restart services
docker-compose -f docker-compose.optimized.yml restart
```

### **If database issues:**
```bash
# Check MySQL container
docker-compose -f docker-compose.optimized.yml logs mysql

# Run database migrations
docker-compose -f docker-compose.optimized.yml exec mymeds-app npx prisma migrate deploy
```

## 📧 **Set Up Email Alerts**

```bash
# Install mail utilities
apt install -y mailutils

# Configure email alerts
export ALERT_EMAIL="your-email@example.com"

# Test email
echo "MyMeds deployment test" | mail -s "Deployment Test" your-email@example.com
```

## ✅ **Success Checklist**

After deployment, verify:

- [ ] DNS points to 72.60.116.253
- [ ] HTTPS redirect works (http → https)
- [ ] SSL certificate is valid and not expired
- [ ] All Docker containers are running
- [ ] API health check passes
- [ ] WordPress admin is accessible
- [ ] WooCommerce shop is accessible
- [ ] Email alerts are configured
- [ ] Automated SSL renewal is working

## 🎉 **Your MyMeds Pharmacy is Live!**

**Service URLs:**
- 🌐 **Frontend**: https://mymedspharmacyinc.com
- 🔧 **API**: https://mymedspharmacyinc.com/api
- 📝 **WordPress Admin**: https://mymedspharmacyinc.com/wp-admin
- 🛒 **WooCommerce Shop**: https://mymedspharmacyinc.com/shop
- 📖 **Blog**: https://mymedspharmacyinc.com/blog
- 📝 **Blog Admin**: https://mymedspharmacyinc.com/blog/wp-admin

**Monitoring:**
- 📊 **Health Check**: `./deployment/scripts/ssl-health-check.sh`
- 🔄 **Renewal Status**: `certbot certificates`
- 📧 **Alerts**: Check your email for notifications

---

**Need Help?** Check the logs or run the health check script for detailed diagnostics.
