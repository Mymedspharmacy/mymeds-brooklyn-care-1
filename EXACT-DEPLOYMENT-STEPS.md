# 🎯 EXACT DEPLOYMENT STEPS - MyMeds Pharmacy Inc.

## 📋 **CRITICAL: DNS Setup First!**

**Before doing anything else, set up your DNS:**

1. **Go to your domain registrar** (GoDaddy, Namecheap, etc.)
2. **Add these DNS records:**
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
3. **Wait 5-10 minutes** for DNS propagation
4. **Verify DNS is working:**
   ```bash
   nslookup mymedspharmacyinc.com
   # Should return: 72.60.116.253
   ```

---

## 🚀 **DEPLOYMENT STEPS**

### **Step 1: Connect to Your VPS**

```bash
ssh root@72.60.116.253
```

### **Step 2: Prepare VPS Environment**

```bash
# Update system
apt update && apt upgrade -y

# Install essential packages
apt install -y curl wget git unzip htop nano ufw certbot python3-certbot-nginx

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# Verify installations
docker --version
docker-compose --version
```

### **Step 3: Clone Repository from GitHub**

**On your VPS:**

```bash
# Install Git if not already installed
apt install -y git

# Clone your repository
cd /var/www
git clone https://github.com/Mymedspharmacy/mymeds-brooklyn-care-1.git mymeds
cd mymeds

# Checkout the correct branch (if needed)
git checkout main
# OR
git checkout latest
```

**Alternative: One-Command GitHub Deployment**

If you want to deploy everything from GitHub in one command:

```bash
# Set your GitHub repository URL
export GITHUB_REPO="https://github.com/Mymedspharmacy/mymeds-brooklyn-care-1.git"
export BRANCH="latest"

# Download and run the GitHub deployment script
curl -o deploy-from-github.sh https://raw.githubusercontent.com/Mymedspharmacy/mymeds-brooklyn-care-1/latest/deployment/scripts/deploy-from-github.sh
chmod +x deploy-from-github.sh
./deploy-from-github.sh
```

### **Step 4: Set Up Project on VPS**

```bash
# On your VPS
cd /var/www/mymeds

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

### **Step 5: Configure Firewall**

```bash
# Configure UFW firewall
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable

# Check firewall status
ufw status
```

### **Step 6: Run SSL Setup**

```bash
# Run SSL certificate setup
./deployment/scripts/setup-ssl.sh
```

**If SSL setup fails due to DNS not ready:**
```bash
# Set up temporary HTTP server for Let's Encrypt validation
cd /var/www/html
python3 -m http.server 80 &
# Wait for DNS to propagate, then run SSL setup again
./deployment/scripts/setup-ssl.sh
```

### **Step 7: Deploy Application with SSL**

```bash
# Deploy complete application
./deployment/scripts/deploy-with-ssl.sh
```

### **Step 8: Verify Deployment**

```bash
# Check all services are running
docker-compose -f docker-compose.optimized.yml ps

# Check SSL health
./deployment/scripts/ssl-health-check.sh

# Test endpoints
curl -I https://mymedspharmacyinc.com
curl -I https://mymedspharmacyinc.com/api/health

# View logs if needed
docker-compose -f docker-compose.optimized.yml logs -f
```

---

## 🔧 **Alternative: One-Command Deployment**

If you want to do everything at once:

```bash
# On your VPS, run this single command
cd /var/www && ./deployment/scripts/deploy-with-ssl.sh
```

---

## 📊 **Post-Deployment Verification**

### **Check Service Status:**
```bash
# View running containers
docker-compose -f docker-compose.optimized.yml ps

# Check resource usage
docker stats

# View specific service logs
docker-compose -f docker-compose.optimized.yml logs mymeds-app
docker-compose -f docker-compose.optimized.yml logs nginx
docker-compose -f docker-compose.optimized.yml logs mysql
```

### **Test Your Website:**
- **Main Site**: https://mymedspharmacyinc.com
- **API Health**: https://mymedspharmacyinc.com/api/health
- **WordPress Admin**: https://mymedspharmacyinc.com/wp-admin
- **WooCommerce Shop**: https://mymedspharmacyinc.com/shop
- **Blog**: https://mymedspharmacyinc.com/blog
- **Blog Admin**: https://mymedspharmacyinc.com/blog/wp-admin

### **Default Login Credentials:**
- **WordPress Admin**: `admin` / `Mymeds2025!AdminSecure123!@#`
- **MyMeds Admin**: `admin@mymedspharmacyinc.com` / `Mymeds2025!AdminSecure123!@#`

---

## 🚨 **Troubleshooting Commands**

### **If SSL fails:**
```bash
# Check Let's Encrypt logs
tail -f /var/log/letsencrypt/letsencrypt.log

# Test manual certificate request
certbot certonly --webroot --webroot-path=/var/www/certbot -d mymedspharmacyinc.com -d www.mymedspharmacyinc.com

# Check certificate status
certbot certificates
```

### **If containers won't start:**
```bash
# Check Docker logs
docker-compose -f docker-compose.optimized.yml logs

# Restart services
docker-compose -f docker-compose.optimized.yml restart

# Check system resources
free -h
df -h
```

### **If database issues:**
```bash
# Check MySQL container
docker-compose -f docker-compose.optimized.yml logs mysql

# Run database migrations
docker-compose -f docker-compose.optimized.yml exec mymeds-app npx prisma migrate deploy

# Check database connection
docker-compose -f docker-compose.optimized.yml exec mysql mysql -u root -p
```

### **If Nginx issues:**
```bash
# Test Nginx configuration
nginx -t

# Check Nginx logs
tail -f /var/log/nginx/error.log

# Restart Nginx
systemctl restart nginx
```

---

## 📧 **Set Up Email Alerts**

```bash
# Install mail utilities
apt install -y mailutils

# Configure email alerts
export ALERT_EMAIL="your-email@example.com"

# Test email
echo "MyMeds deployment test" | mail -s "Deployment Test" your-email@example.com

# Add to crontab for SSL monitoring
(crontab -l 2>/dev/null; echo "0 6 * * * /usr/local/bin/ssl-monitor.sh") | crontab -
```

---

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

---

## 🎉 **Your MyMeds Pharmacy is Live!**

**Service URLs:**
- 🌐 **Frontend**: https://mymedspharmacyinc.com
- 🔧 **API**: https://mymedspharmacyinc.com/api
- 📝 **WordPress Admin**: https://mymedspharmacyinc.com/wp-admin
- 🛒 **WooCommerce Shop**: https://mymedspharmacyinc.com/shop
- 📖 **Blog**: https://mymedspharmacyinc.com/blog
- 📝 **Blog Admin**: https://mymedspharmacyinc.com/blog/wp-admin

**Monitoring Commands:**
- 📊 **Health Check**: `./deployment/scripts/ssl-health-check.sh`
- 🔄 **Renewal Status**: `certbot certificates`
- 📧 **Alerts**: Check your email for notifications

---

**Need Help?** Check the logs or run the health check script for detailed diagnostics.
