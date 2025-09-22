# 🐳 MyMeds Pharmacy Inc. - Docker Production Deployment

## 🚀 **Complete Production-Ready Docker Setup**

This Docker configuration ensures **100% real-world functionality** with:
- ✅ **Frontend** - React application with Vite build
- ✅ **Backend** - Node.js API with all endpoints
- ✅ **Database** - MySQL with complete schema
- ✅ **Reverse Proxy** - Nginx with SSL support
- ✅ **All Features** - Admin panel, WordPress, WooCommerce integration

---

## 📋 **Prerequisites**

### **VPS Requirements:**
- **OS**: Ubuntu 20.04+ or CentOS 8+
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: Minimum 20GB SSD
- **CPU**: 2+ cores
- **Network**: Public IP with domain name

### **Software Requirements:**
- Docker 20.10+
- Docker Compose 2.0+
- Git

---

## 🔧 **VPS Setup Instructions**

### **1. Connect to Your VPS**
```bash
ssh root@your-vps-ip
# or
ssh username@your-vps-ip
```

### **2. Install Docker**
```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Add user to docker group
usermod -aG docker $USER
```

### **3. Clone Repository**
```bash
git clone https://github.com/your-username/mymeds-brooklyn-care.git
cd mymeds-brooklyn-care
```

### **4. Configure Environment**
```bash
# Copy environment template
cp env.production.template .env.production

# Edit with your values
nano .env.production
```

### **5. Deploy Application**
```bash
# Make deployment script executable
chmod +x deployment/scripts/deploy-production.sh

# Run deployment
./deployment/scripts/deploy-production.sh
```

---

## 🔐 **Environment Configuration**

### **Required VPS Details:**

Please provide the following information for your VPS:

1. **VPS IP Address**: `your-vps-ip`
2. **Domain Name**: `your-domain.com`
3. **SSL Certificate**: Do you have SSL certificates or need Let's Encrypt?
4. **Email Configuration**: SMTP settings for notifications
5. **WordPress URL**: Your WordPress site URL
6. **WooCommerce URL**: Your WooCommerce shop URL
7. **API Keys**: WordPress and WooCommerce API credentials

### **Environment Variables to Update:**

```bash
# Database
MYSQL_ROOT_PASSWORD=YourSecureRootPassword123!
MYSQL_PASSWORD=YourSecureUserPassword123!

# Domain
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com

# WordPress
WORDPRESS_URL=https://your-domain.com/blog
WORDPRESS_USERNAME=your_wp_api_user
WORDPRESS_APP_PASSWORD=your_wp_app_password

# WooCommerce
WOOCOMMERCE_STORE_URL=https://your-domain.com/shop
WOOCOMMERCE_CONSUMER_KEY=ck_your_consumer_key
WOOCOMMERCE_CONSUMER_SECRET=cs_your_consumer_secret

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
```

---

## 🏗️ **Docker Architecture**

### **Services:**
- **mysql**: MySQL 8.0 database
- **mymeds-app**: Frontend + Backend application
- **nginx**: Reverse proxy with SSL

### **Ports:**
- **80**: HTTP (redirects to HTTPS)
- **443**: HTTPS (main application)
- **3000**: Frontend development
- **4000**: Backend API
- **3306**: MySQL database

### **Volumes:**
- **mysql_data**: Database persistence
- **app_uploads**: File uploads
- **app_logs**: Application logs
- **app_backups**: Database backups

---

## 🚀 **Deployment Features**

### **✅ Complete Application Stack:**
- **Frontend**: React with Vite, optimized build
- **Backend**: Node.js with Express, all API endpoints
- **Database**: MySQL with complete Prisma schema
- **Authentication**: JWT-based admin authentication
- **File Uploads**: WordPress media upload support
- **Real-time**: WebSocket integration
- **Security**: Comprehensive security headers
- **Monitoring**: Health checks and logging

### **✅ Production Optimizations:**
- **Multi-stage builds** for smaller images
- **Gzip compression** for faster loading
- **Caching headers** for static assets
- **Database connection pooling**
- **Process management** with PM2
- **Automatic restarts** on failure
- **Health monitoring** and alerts

### **✅ Integration Ready:**
- **WordPress**: Complete API integration
- **WooCommerce**: Product and order management
- **Email**: SMTP configuration
- **Payment**: Stripe integration ready
- **Analytics**: Google Analytics support

---

## 🔍 **Verification Commands**

### **Check Services:**
```bash
# View running containers
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Health check
curl http://localhost:4000/api/health
```

### **Test Endpoints:**
```bash
# Backend API
curl http://localhost:4000/api/health

# Frontend
curl http://localhost:3000

# Database
docker-compose -f docker-compose.prod.yml exec mysql mysql -u mymeds_user -p mymeds_production -e "SHOW TABLES;"
```

---

## 🛠️ **Troubleshooting**

### **Common Issues:**

1. **Port Conflicts**: Ensure ports 80, 443, 3000, 4000, 3306 are available
2. **Memory Issues**: Increase VPS RAM if containers fail to start
3. **Database Connection**: Check MySQL credentials in environment file
4. **SSL Issues**: Ensure SSL certificates are properly configured

### **Debug Commands:**
```bash
# View container logs
docker-compose -f docker-compose.prod.yml logs mymeds-app

# Check database connection
docker-compose -f docker-compose.prod.yml exec mysql mysql -u root -p -e "SELECT 1;"

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

---

## 📞 **Support**

For deployment assistance, provide:
1. **VPS IP and domain**
2. **Error messages** (if any)
3. **Service status** (`docker-compose ps`)
4. **Logs** (`docker-compose logs`)

---

## 🎯 **Next Steps After Deployment**

1. **Configure DNS** to point to your VPS
2. **Set up SSL certificates** (Let's Encrypt recommended)
3. **Configure firewall** rules
4. **Set up monitoring** and alerts
5. **Configure backups** and disaster recovery
6. **Test all features** thoroughly

---

**🚀 Ready to deploy your complete MyMeds Pharmacy application!**
