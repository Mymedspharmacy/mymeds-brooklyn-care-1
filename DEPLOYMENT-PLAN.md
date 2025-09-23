# 🚀 MyMeds Pharmacy - Error-Free Deployment Plan

## 📋 **DEPLOYMENT STRATEGY**

### **Phase 1: Pre-Deployment Preparation** ⚠️
### **Phase 2: Infrastructure Setup** 🏗️
### **Phase 3: Application Deployment** 🚀
### **Phase 4: Integration & Testing** ✅
### **Phase 5: Production Optimization** 🔧

---

## 🎯 **PHASE 1: PRE-DEPLOYMENT PREPARATION**

### **1.1 Environment Variables Setup**
```bash
# Create production environment file
cat > .env.production << 'EOF'
# =============================================================================
# PRODUCTION ENVIRONMENT - MyMeds Pharmacy Inc.
# =============================================================================

# Server Configuration
NODE_ENV=production
PORT=4000
HOST=0.0.0.0

# Database Configuration
DATABASE_URL="mysql://mymeds_user:Mymeds2025!UserSecure123!@#@mysql:3306/mymeds_production"
MYSQL_ROOT_PASSWORD=Mymeds2025!RootSecure123!@#
MYSQL_DATABASE=mymeds_production
MYSQL_USER=mymeds_user
MYSQL_PASSWORD=Mymeds2025!UserSecure123!@#

# JWT & Authentication
JWT_SECRET=Mymeds2025!JWTSecretKey_PharmacySecure_Production_2025!@#$%^&*()
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Admin Credentials
ADMIN_EMAIL=admin@mymedspharmacyinc.com
ADMIN_PASSWORD=Mymeds2025!AdminSecure123!@#
ADMIN_FIRST_NAME=Admin
ADMIN_LAST_NAME=User

# Email Configuration (UPDATE WITH YOUR SETTINGS)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=mymedspharmacyinc@gmail.com
EMAIL_PASSWORD=YourGmailAppPasswordHere
EMAIL_FROM=mymedspharmacyinc@gmail.com
EMAIL_FROM_NAME="MyMeds Pharmacy Inc."

# CORS Configuration (UPDATE WITH YOUR DOMAIN)
CORS_ORIGIN=https://www.mymedspharmacyinc.com,https://mymedspharmacyinc.com
CORS_CREDENTIALS=true
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS,PATCH
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With,Accept,Origin,Cache-Control

# WordPress Integration (UPDATE WITH YOUR SETTINGS)
WORDPRESS_URL=https://mymedspharmacyinc.com/blog
WORDPRESS_USERNAME=mymeds_api_user
WORDPRESS_APP_PASSWORD=X8J0 ICBi 5Ilb PnrX Bhyp r2PE
FEATURE_WORDPRESS_ENABLED=true

# WooCommerce Integration (UPDATE WITH YOUR SETTINGS)
WOOCOMMERCE_STORE_URL=https://mymedspharmacyinc.com/shop
WOOCOMMERCE_CONSUMER_KEY=ck_47e02dc770a3824275746e6efd09a01497e3881f
WOOCOMMERCE_CONSUMER_SECRET=cs_9fc99adfd9306f1b02005701f7a1eb4244be2d46
WOOCOMMERCE_WEBHOOK_SECRET=Mymeds2025!WooCommerceWebhookSecret_Production_2025!@#
FEATURE_WOOCOMMERCE_ENABLED=true

# Payment Gateway (UPDATE WITH YOUR STRIPE KEYS)
STRIPE_SECRET_KEY=sk_live_YourStripeSecretKey123
STRIPE_PUBLISHABLE_KEY=pk_live_YourStripePublishableKey123
STRIPE_WEBHOOK_SECRET=whsec_YourStripeWebhookSecret123
PAYMENT_GATEWAY_ENABLED=true

# Security Configuration
SESSION_SECRET=Mymeds2025!SessionSecret_PharmacySecure_Production_2025!@#$%^&*()
HELMET_ENABLED=true
XSS_PROTECTION=true
CONTENT_SECURITY_POLICY=true

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=./logs/app.log

# Performance
COMPRESSION_ENABLED=true
CLUSTER_ENABLED=true
CLUSTER_WORKERS=4

# Debug (DISABLE IN PRODUCTION)
DEBUG_MODE=false
VERBOSE_LOGGING=false
EOF

chmod 600 .env.production
```

### **1.2 Fix TypeScript Errors (Optional)**
```bash
# Fix TypeScript compilation errors (non-blocking)
cd backend
npm run lint:fix
npm run build
```

### **1.3 Verify Local Build**
```bash
# Test frontend build
npm run build

# Test backend build
cd backend
npm run build

# Test TypeScript compilation
npm run type-check
```

---

## 🏗️ **PHASE 2: INFRASTRUCTURE SETUP**

### **2.1 VPS Preparation**
```bash
# Connect to your VPS
ssh root@YOUR_VPS_IP

# Update system
apt update && apt upgrade -y

# Install essential packages
apt install -y curl wget git unzip software-properties-common \
  apt-transport-https ca-certificates gnupg lsb-release \
  nginx certbot python3-certbot-nginx ufw fail2ban

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker $USER
rm get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version
```

### **2.2 Security Configuration**
```bash
# Configure firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Configure fail2ban
systemctl enable fail2ban
systemctl start fail2ban

# Set up SSH key authentication (recommended)
# Disable password authentication for security
```

### **2.3 Project Directory Setup**
```bash
# Create project directory
mkdir -p /opt/mymeds-pharmacy
cd /opt/mymeds-pharmacy

# Set proper permissions
chown -R $USER:$USER /opt/mymeds-pharmacy
```

---

## 🚀 **PHASE 3: APPLICATION DEPLOYMENT**

### **3.1 Upload Project Files**
```bash
# Option A: Clone from Git repository
# git clone https://github.com/yourusername/mymeds-brooklyn-care.git .

# Option B: Upload via SCP from local machine
# scp -r /path/to/local/mymeds-brooklyn-care/* root@YOUR_VPS_IP:/opt/mymeds-pharmacy/

# Option C: Create files manually (copy from your local project)
```

### **3.2 Environment Configuration**
```bash
# Copy production environment file
cp .env.production .env

# Verify environment file
cat .env | grep -v PASSWORD
```

### **3.3 Database Setup**
```bash
# Start MySQL container first
docker-compose -f docker-compose.prod.yml up -d mysql

# Wait for MySQL to be ready (30 seconds)
echo "Waiting for MySQL to initialize..."
sleep 30

# Verify MySQL is running
docker-compose -f docker-compose.prod.yml exec mysql mysqladmin ping -h localhost

# Run database initialization
docker-compose -f docker-compose.prod.yml exec mysql mysql -u root -p$MYSQL_ROOT_PASSWORD -e "CREATE DATABASE IF NOT EXISTS mymeds_production;"
docker-compose -f docker-compose.prod.yml exec mysql mysql -u root -p$MYSQL_ROOT_PASSWORD -e "CREATE DATABASE IF NOT EXISTS wordpress;"
```

### **3.4 Application Deployment**
```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
echo "Waiting for services to initialize..."
sleep 60

# Check service status
docker-compose -f docker-compose.prod.yml ps
```

### **3.5 Database Migration**
```bash
# Run Prisma migrations
docker-compose -f docker-compose.prod.yml exec mymeds-app npx prisma migrate deploy

# Generate Prisma client
docker-compose -f docker-compose.prod.yml exec mymeds-app npx prisma generate

# Create admin user
docker-compose -f docker-compose.prod.yml exec mymeds-app node create-admin-user.cjs

# Initialize integrations
docker-compose -f docker-compose.prod.yml exec mymeds-app node init-integrations.js
```

---

## ✅ **PHASE 4: INTEGRATION & TESTING**

### **4.1 Health Checks**
```bash
# Test backend health
curl -f http://localhost:4000/api/health

# Test frontend
curl -f http://localhost:3000

# Test database connection
docker-compose -f docker-compose.prod.yml exec mysql mysqladmin ping -h localhost

# Test all API endpoints
curl -f http://localhost:4000/api/products
curl -f http://localhost:4000/api/blogs
curl -f http://localhost:4000/api/contact
```

### **4.2 Authentication Testing**
```bash
# Test admin login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mymedspharmacyinc.com","password":"Mymeds2025!AdminSecure123!@#"}'

# Test user registration
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPassword123!","name":"Test User"}'
```

### **4.3 WordPress Integration Setup**
```bash
# Install WordPress (if not already installed)
chmod +x install-wordpress.sh
./install-wordpress.sh

# Configure WordPress database
docker-compose -f docker-compose.prod.yml exec mysql mysql -u root -p$MYSQL_ROOT_PASSWORD wordpress < wordpress/wp-content/database.sql

# Test WordPress API
curl -f http://localhost/wordpress/wp-json/wp/v2/posts
```

### **4.4 WooCommerce Setup**
```bash
# Install WooCommerce plugin in WordPress
# Generate API keys:
# 1. Go to WordPress Admin > WooCommerce > Settings > Advanced > REST API
# 2. Create new API key with Read/Write permissions
# 3. Update environment variables with the generated keys

# Test WooCommerce API
curl -f http://localhost/wordpress/wp-json/wc/v3/products \
  -u "ck_your_consumer_key:cs_your_consumer_secret"
```

---

## 🔧 **PHASE 5: PRODUCTION OPTIMIZATION**

### **5.1 SSL Certificate Setup**
```bash
# Generate SSL certificate with Let's Encrypt
certbot --nginx -d mymedspharmacyinc.com -d www.mymedspharmacyinc.com

# Test SSL renewal
certbot renew --dry-run

# Set up automatic renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
```

### **5.2 Nginx Configuration**
```bash
# Update Nginx configuration for production
cat > /etc/nginx/sites-available/mymeds-pharmacy << 'EOF'
server {
    listen 80;
    server_name mymedspharmacyinc.com www.mymedspharmacyinc.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mymedspharmacyinc.com www.mymedspharmacyinc.com;

    ssl_certificate /etc/letsencrypt/live/mymedspharmacyinc.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mymedspharmacyinc.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WordPress
    location /blog {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WooCommerce
    location /shop {
        proxy_pass http://localhost:8080/shop;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/mymeds-pharmacy /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### **5.3 Monitoring Setup**
```bash
# Set up log rotation
cat > /etc/logrotate.d/mymeds-pharmacy << 'EOF'
/opt/mymeds-pharmacy/backend/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        docker-compose -f /opt/mymeds-pharmacy/docker-compose.prod.yml restart mymeds-app
    endscript
}
EOF

# Set up health monitoring
cat > /opt/mymeds-pharmacy/health-check.sh << 'EOF'
#!/bin/bash
# Health check script
HEALTH_URL="http://localhost:4000/api/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE -ne 200 ]; then
    echo "Health check failed: HTTP $RESPONSE"
    docker-compose -f /opt/mymeds-pharmacy/docker-compose.prod.yml restart mymeds-app
    # Send notification (implement your notification method)
fi
EOF

chmod +x /opt/mymeds-pharmacy/health-check.sh

# Add to crontab (check every 5 minutes)
echo "*/5 * * * * /opt/mymeds-pharmacy/health-check.sh" | crontab -
```

### **5.4 Backup Setup**
```bash
# Create backup script
cat > /opt/mymeds-pharmacy/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/mymeds-pharmacy/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Database backup
docker-compose -f docker-compose.prod.yml exec -T mysql mysqldump \
  -u root -p$MYSQL_ROOT_PASSWORD $MYSQL_DATABASE > $BACKUP_DIR/db_backup_$DATE.sql

# Application backup
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz \
  --exclude=node_modules \
  --exclude=logs \
  --exclude=backups \
  /opt/mymeds-pharmacy

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
EOF

chmod +x /opt/mymeds-pharmacy/backup.sh

# Schedule daily backups at 2 AM
echo "0 2 * * * /opt/mymeds-pharmacy/backup.sh" | crontab -
```

---

## 🚨 **ERROR PREVENTION CHECKLIST**

### **Pre-Deployment Checks**
- [ ] Environment variables configured
- [ ] Database credentials set
- [ ] SSL certificates ready
- [ ] Domain DNS configured
- [ ] Firewall rules set
- [ ] Backup strategy in place

### **Deployment Checks**
- [ ] Docker containers running
- [ ] Database migrations completed
- [ ] Admin user created
- [ ] API endpoints responding
- [ ] Frontend loading correctly
- [ ] WordPress accessible
- [ ] WooCommerce configured

### **Post-Deployment Checks**
- [ ] SSL certificates working
- [ ] All integrations functional
- [ ] Monitoring active
- [ ] Backups scheduled
- [ ] Performance optimized
- [ ] Security hardened

---

## 🔧 **TROUBLESHOOTING GUIDE**

### **Common Issues & Solutions**

#### **1. Container Won't Start**
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs mymeds-app

# Check environment variables
docker-compose -f docker-compose.prod.yml exec mymeds-app env

# Restart container
docker-compose -f docker-compose.prod.yml restart mymeds-app
```

#### **2. Database Connection Issues**
```bash
# Check MySQL logs
docker-compose -f docker-compose.prod.yml logs mysql

# Test database connection
docker-compose -f docker-compose.prod.yml exec mysql mysql -u root -p

# Restart MySQL
docker-compose -f docker-compose.prod.yml restart mysql
```

#### **3. API Endpoints Not Responding**
```bash
# Check if service is running
curl -f http://localhost:4000/api/health

# Check container status
docker-compose -f docker-compose.prod.yml ps

# Check port binding
netstat -tulpn | grep :4000
```

#### **4. WordPress Integration Issues**
```bash
# Check WordPress API
curl -f http://localhost/wordpress/wp-json/wp/v2/posts

# Check WordPress database
docker-compose -f docker-compose.prod.yml exec mysql mysql -u root -p wordpress

# Restart WordPress container
docker-compose -f docker-compose.prod.yml restart wordpress
```

---

## ✅ **FINAL VERIFICATION**

### **Complete System Test**
```bash
# 1. Check all containers
docker-compose -f docker-compose.prod.yml ps

# 2. Test backend
curl -f https://mymedspharmacyinc.com/api/health

# 3. Test frontend
curl -f https://mymedspharmacyinc.com

# 4. Test admin login
curl -X POST https://mymedspharmacyinc.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mymedspharmacyinc.com","password":"Mymeds2025!AdminSecure123!@#"}'

# 5. Test WordPress
curl -f https://mymedspharmacyinc.com/blog

# 6. Test WooCommerce
curl -f https://mymedspharmacyinc.com/shop

# 7. Test SSL
curl -I https://mymedspharmacyinc.com

# 8. Test all API endpoints
curl -f https://mymedspharmacyinc.com/api/products
curl -f https://mymedspharmacyinc.com/api/blogs
curl -f https://mymedspharmacyinc.com/api/contact
```

---

## 🎉 **DEPLOYMENT SUCCESS!**

### **Service URLs**
- 🌐 **Frontend**: https://mymedspharmacyinc.com
- 🔧 **Backend API**: https://mymedspharmacyinc.com/api
- 🔐 **Admin Panel**: https://mymedspharmacyinc.com/admin
- 📊 **Health Check**: https://mymedspharmacyinc.com/api/health
- 📝 **WordPress**: https://mymedspharmacyinc.com/blog
- 🛒 **WooCommerce**: https://mymedspharmacyinc.com/shop

### **Admin Credentials**
- **Email**: admin@mymedspharmacyinc.com
- **Password**: Mymeds2025!AdminSecure123!@#

### **Next Steps**
1. ✅ Configure your actual domain DNS
2. ✅ Update environment variables with real credentials
3. ✅ Set up email notifications
4. ✅ Configure payment processing
5. ✅ Test all functionality
6. ✅ Go live! 🚀

---

## 📞 **SUPPORT**

If you encounter any issues during deployment:
1. Check the troubleshooting guide above
2. Review container logs: `docker-compose -f docker-compose.prod.yml logs`
3. Verify environment variables
4. Check network connectivity
5. Ensure all prerequisites are met

**Your MyMeds Pharmacy system is now ready for production!** 🎉
