# 🚀 GitHub Deployment Guide - MyMeds Pharmacy Inc.

## 📋 **Quick Start with GitHub**

### **Option 1: One-Command Deployment (Recommended)**

```bash
# SSH to your VPS
ssh root@72.60.116.253

# Set your GitHub repository URL
export GITHUB_REPO="https://github.com/Mymedspharmacy/mymeds-brooklyn-care-1.git"
export BRANCH="latest"

# Download and run the GitHub deployment script
curl -o deploy-from-github.sh https://raw.githubusercontent.com/Mymedspharmacy/mymeds-brooklyn-care-1/latest/deployment/scripts/deploy-from-github.sh
chmod +x deploy-from-github.sh
./deploy-from-github.sh
```

### **Option 2: Manual Step-by-Step**

```bash
# 1. SSH to your VPS
ssh root@72.60.116.253

# 2. Install dependencies
apt update && apt upgrade -y
apt install -y git curl wget unzip htop nano ufw certbot python3-certbot-nginx

# 3. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# 4. Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# 5. Clone repository
cd /var/www
git clone https://github.com/Mymedspharmacy/mymeds-brooklyn-care-1.git mymeds
cd mymeds

# 6. Run deployment
chmod +x deployment/scripts/*.sh
./deployment/scripts/deploy-with-ssl.sh
```

## 🔧 **Prerequisites**

### **Before You Start:**

1. **Set up DNS** (CRITICAL):
   ```
   Type: A, Name: @, Value: 72.60.116.253
   Type: A, Name: www, Value: 72.60.116.253
   ```

2. **Have your GitHub repository ready** with:
   - All code committed and pushed
   - `deployment/scripts/` folder with SSL scripts
   - `docker-compose.optimized.yml` file
   - Environment files configured

3. **Verify DNS propagation**:
   ```bash
   nslookup mymedspharmacyinc.com
   # Should return: 72.60.116.253
   ```

## 📁 **Repository Structure Required**

Your GitHub repository should have this structure:

```
mymeds-brooklyn-care/
├── deployment/
│   ├── scripts/
│   │   ├── setup-ssl.sh
│   │   ├── deploy-with-ssl.sh
│   │   ├── ssl-health-check.sh
│   │   └── deploy-from-github.sh
│   └── nginx/
│       └── nginx-ssl.conf
├── backend/
│   ├── src/
│   ├── prisma/
│   └── env.production
├── src/
├── docker-compose.optimized.yml
├── package.json
└── ... (other files)
```

## 🚀 **Deployment Process**

### **What the GitHub Deployment Script Does:**

1. **System Setup**:
   - Updates Ubuntu packages
   - Installs Docker, Docker Compose, Git
   - Installs SSL tools (Certbot)

2. **Repository Management**:
   - Clones your GitHub repository
   - Updates to latest version
   - Sets up project directories

3. **SSL Configuration**:
   - Obtains Let's Encrypt certificates
   - Configures Nginx for HTTPS
   - Sets up automated renewal

4. **Docker Deployment**:
   - Builds application containers
   - Starts services in optimized order
   - Configures SSL volume mounts

5. **Database Setup**:
   - Runs Prisma migrations
   - Initializes integrations
   - Creates admin users

6. **Health Monitoring**:
   - Verifies all services are running
   - Tests HTTPS endpoints
   - Sets up monitoring scripts

## 🔄 **Updating Your Deployment**

### **To update your live deployment:**

```bash
# SSH to your VPS
ssh root@72.60.116.253

# Navigate to project directory
cd /var/www/mymeds

# Pull latest changes
git pull origin main

# Restart services with new code
docker-compose -f docker-compose.optimized.yml down
docker-compose -f docker-compose.optimized.yml up -d --build

# Run any new migrations
docker-compose -f docker-compose.optimized.yml exec mymeds-app npx prisma migrate deploy
```

## 📊 **Post-Deployment Verification**

### **Check Your Live Site:**

- **Main Site**: https://mymedspharmacyinc.com
- **Admin Panel**: https://mymedspharmacyinc.com/admin
- **API Health**: https://mymedspharmacyinc.com/api/health
- **WooCommerce Shop**: https://mymedspharmacyinc.com/shop
- **Blog**: https://mymedspharmacyinc.com/blog
- **Blog Admin**: https://mymedspharmacyinc.com/blog/wp-admin

### **Monitor Your Deployment:**

```bash
# Check container status
docker-compose -f docker-compose.optimized.yml ps

# View logs
docker-compose -f docker-compose.optimized.yml logs -f

# Check SSL status
./deployment/scripts/ssl-health-check.sh

# Check certificate renewal
certbot certificates
```

## 🚨 **Troubleshooting**

### **If GitHub clone fails:**
```bash
# Check if repository is public or you have SSH keys set up
git clone https://github.com/YOUR_USERNAME/mymeds-brooklyn-care.git

# For private repositories, use SSH:
git clone git@github.com:YOUR_USERNAME/mymeds-brooklyn-care.git
```

### **If SSL setup fails:**
```bash
# Check DNS propagation
nslookup mymedspharmacyinc.com

# Test manual certificate request
certbot certonly --webroot --webroot-path=/var/www/certbot -d mymedspharmacyinc.com -d www.mymedspharmacyinc.com
```

### **If containers won't start:**
```bash
# Check Docker logs
docker-compose -f docker-compose.optimized.yml logs

# Check system resources
free -h
df -h

# Restart services
docker-compose -f docker-compose.optimized.yml restart
```

## ✅ **Success Checklist**

After deployment, verify:

- [ ] DNS points to 72.60.116.253
- [ ] HTTPS redirect works (http → https)
- [ ] SSL certificate is valid
- [ ] All Docker containers are running
- [ ] All service URLs are accessible
- [ ] Database migrations completed
- [ ] Email alerts configured
- [ ] Automated SSL renewal working

## 🎉 **Your MyMeds Pharmacy is Live!**

**Service URLs:**
- 🌐 **Frontend**: https://mymedspharmacyinc.com
- 🔧 **API**: https://mymedspharmacyinc.com/api
- 📝 **WordPress Admin**: https://mymedspharmacyinc.com/wp-admin
- 🛒 **WooCommerce Shop**: https://mymedspharmacyinc.com/shop
- 📖 **Blog**: https://mymedspharmacyinc.com/blog
- 📝 **Blog Admin**: https://mymedspharmacyinc.com/blog/wp-admin

**Default Login Credentials:**
- **WordPress Admin**: `admin` / `Mymeds2025!AdminSecure123!@#`
- **MyMeds Admin**: `admin@mymedspharmacyinc.com` / `Mymeds2025!AdminSecure123!@#`

---

**Need Help?** Check the logs or run the health check script for detailed diagnostics.
