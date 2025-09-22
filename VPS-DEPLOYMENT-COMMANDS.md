# 🚀 VPS Deployment Commands - MyMeds Pharmacy Inc.

## 🎯 **VPS Details:**
- **IP**: 72.60.116.253
- **Domain**: mymedspharmacyinc.com
- **Resources**: 1 CPU, 4GB RAM

---

## 📋 **Step 1: Connect to VPS**

```bash
# Connect to your VPS
ssh root@72.60.116.253

# Or if using a specific user
ssh your-username@72.60.116.253
```

---

## 📋 **Step 2: Update System & Install Dependencies**

```bash
# Update system packages
apt update && apt upgrade -y

# Install essential packages
apt install -y curl wget git unzip software-properties-common

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Nginx (if not already installed)
apt install -y nginx

# Install Certbot for SSL
apt install -y certbot python3-certbot-nginx

# Start and enable services
systemctl start docker
systemctl enable docker
systemctl start nginx
systemctl enable nginx
```

---

## 📋 **Step 3: Clone Repository**

```bash
# Create project directory
mkdir -p /opt/mymeds
cd /opt/mymeds

# Clone your repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git .

# Or if you have the exact repo URL, use:
# git clone https://github.com/YOUR_USERNAME/mymeds-brooklyn-care-1.git .
```

---

## 📋 **Step 4: Set Up Environment Variables**

```bash
# Copy the production environment file
cp env.production.mymedspharmacyinc.com .env

# Edit the environment file if needed
nano .env

# Set proper permissions
chmod 600 .env
```

---

## 📋 **Step 5: Configure DNS (Do This First!)**

### **Before deploying, configure your DNS:**

```bash
# Add these A records to your domain DNS:
# mymedspharmacyinc.com → 72.60.116.253
# www.mymedspharmacyinc.com → 72.60.116.253
```

---

## 📋 **Step 6: Deploy with Docker**

```bash
# Make deployment script executable
chmod +x deployment/scripts/deploy-optimized.sh

# Run the optimized deployment
./deployment/scripts/deploy-optimized.sh
```

---

## 📋 **Step 7: Set Up SSL Certificate**

```bash
# Stop Nginx temporarily
systemctl stop nginx

# Generate SSL certificate
certbot certonly --standalone -d mymedspharmacyinc.com -d www.mymedspharmacyinc.com

# Start Nginx
systemctl start nginx
```

---

## 📋 **Step 8: Configure Nginx**

```bash
# Copy the optimized Nginx configuration
cp deployment/nginx/nginx-full-stack.conf /etc/nginx/sites-available/mymeds

# Enable the site
ln -s /etc/nginx/sites-available/mymeds /etc/nginx/sites-enabled/

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

---

## 📋 **Step 9: Start Services**

```bash
# Start all services
docker-compose -f docker-compose.optimized.yml up -d

# Check service status
docker-compose -f docker-compose.optimized.yml ps

# View logs
docker-compose -f docker-compose.optimized.yml logs -f
```

---

## 📋 **Step 10: Verify Deployment**

```bash
# Check if all services are running
docker ps

# Check Nginx status
systemctl status nginx

# Test SSL certificate
curl -I https://mymedspharmacyinc.com

# Test WordPress admin
curl -I https://mymedspharmacyinc.com/wp-admin/

# Test shop
curl -I https://mymedspharmacyinc.com/shop/

# Test blog
curl -I https://mymedspharmacyinc.com/blog/
```

---

## 🔧 **Quick Commands for Management**

### **View Logs:**
```bash
# View all logs
docker-compose -f docker-compose.optimized.yml logs -f

# View specific service logs
docker-compose -f docker-compose.optimized.yml logs -f mymeds-app
docker-compose -f docker-compose.optimized.yml logs -f mymeds-wordpress
docker-compose -f docker-compose.optimized.yml logs -f mysql
```

### **Restart Services:**
```bash
# Restart all services
docker-compose -f docker-compose.optimized.yml restart

# Restart specific service
docker-compose -f docker-compose.optimized.yml restart mymeds-app
```

### **Update Application:**
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.optimized.yml down
docker-compose -f docker-compose.optimized.yml up -d --build
```

---

## 🎯 **Expected URLs After Deployment**

### **✅ Production URLs:**
- **Main Site**: https://mymedspharmacyinc.com
- **WordPress Admin**: https://mymedspharmacyinc.com/wp-admin/
- **WooCommerce Shop**: https://mymedspharmacyinc.com/shop/
- **Blog**: https://mymedspharmacyinc.com/blog/
- **MyMeds Admin**: https://mymedspharmacyinc.com/admin

### **✅ Development URLs (Before DNS):**
- **MyMeds Frontend**: http://72.60.116.253:3000
- **MyMeds Backend**: http://72.60.116.253:4000
- **WordPress**: http://72.60.116.253:8080

---

## 🚨 **Troubleshooting**

### **If services don't start:**
```bash
# Check logs
docker-compose -f docker-compose.optimized.yml logs

# Check system resources
free -h
df -h

# Check Docker status
systemctl status docker
```

### **If SSL fails:**
```bash
# Check if ports 80 and 443 are open
netstat -tlnp | grep :80
netstat -tlnp | grep :443

# Check firewall
ufw status
```

### **If WordPress doesn't work:**
```bash
# Check WordPress container
docker logs mymeds-wordpress

# Check database connection
docker exec -it mysql mysql -u root -p
```

---

## 🎉 **Deployment Complete!**

After following these steps, your MyMeds Pharmacy application will be fully deployed and accessible at:

**🌐 https://mymedspharmacyinc.com**

**🎯 All features working:**
- ✅ MyMeds Pharmacy App
- ✅ WordPress Admin Panel
- ✅ WooCommerce Shop
- ✅ Health Blog
- ✅ Admin Dashboard
- ✅ SSL Security
- ✅ Database Integration
