# 🚀 MyMeds Pharmacy Inc. - Complete VPS Deployment Commands

## 📋 Quick Start Commands

### 1. Connect to Your VPS
```bash
ssh root@YOUR_VPS_IP
# or
ssh username@YOUR_VPS_IP
```

### 2. Run the Complete Deployment
```bash
# Clone or upload the project files to your VPS
# Then run the automated deployment script:

chmod +x deploy-vps-quick.sh
./deploy-vps-quick.sh
```

### 3. Configure Environment Variables
```bash
# Run the interactive environment setup
chmod +x setup-environment.sh
./setup-environment.sh
```

### 4. Verify Deployment
```bash
# Run comprehensive verification
chmod +x verify-deployment.sh
./verify-deployment.sh
```

## 🔧 Manual Step-by-Step Commands

### Step 1: System Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
rm get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Step 2: Project Setup
```bash
# Create project directory
sudo mkdir -p /opt/mymeds-pharmacy
cd /opt/mymeds-pharmacy
sudo chown -R $USER:$USER /opt/mymeds-pharmacy

# Upload your project files here (via SCP, Git clone, etc.)
```

### Step 3: Environment Configuration
```bash
# Create production environment file
cat > .env.production << 'EOF'
# Database Configuration
MYSQL_ROOT_PASSWORD=Mymeds2025!RootSecure123!@#
MYSQL_DATABASE=mymeds_production
MYSQL_USER=mymeds_user
MYSQL_PASSWORD=Mymeds2025!UserSecure123!@#

# Server Configuration
NODE_ENV=production
PORT=4000
HOST=0.0.0.0

# JWT & Authentication
JWT_SECRET=Mymeds2025!JWTSecretKey_PharmacySecure_Production_2025!@#$%^&*()
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Admin Credentials
ADMIN_EMAIL=admin@mymedspharmacyinc.com
ADMIN_PASSWORD=Mymeds2025!AdminSecure123!@#
ADMIN_FIRST_NAME=Admin
ADMIN_LAST_NAME=User

# Email Configuration (Update with your settings)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=mymedspharmacyinc@gmail.com
EMAIL_PASSWORD=YourGmailAppPasswordHere
EMAIL_FROM=mymedspharmacyinc@gmail.com
EMAIL_FROM_NAME=MyMeds Pharmacy Inc.

# CORS Configuration (Update with your domain)
CORS_ORIGIN=https://www.mymedspharmacyinc.com,https://mymedspharmacyinc.com

# Security Configuration
SESSION_SECRET=Mymeds2025!SessionSecret_PharmacySecure_Production_2025!@#$%^&*()

# WordPress Integration (Update with your settings)
WORDPRESS_URL=https://mymedspharmacyinc.com/blog
WORDPRESS_USERNAME=mymeds_api_user
WORDPRESS_APP_PASSWORD=X8J0 ICBi 5Ilb PnrX Bhyp r2PE

# WooCommerce Integration (Update with your settings)
WOOCOMMERCE_STORE_URL=https://mymedspharmacyinc.com/shop
WOOCOMMERCE_CONSUMER_KEY=ck_47e02dc770a3824275746e6efd09a01497e3881f
WOOCOMMERCE_CONSUMER_SECRET=cs_9fc99adfd9306f1b02005701f7a1eb4244be2d46
WOOCOMMERCE_WEBHOOK_SECRET=Mymeds2025!WooCommerceWebhookSecret_Production_2025!@#

# Payment Gateway Configuration (Update with your settings)
STRIPE_SECRET_KEY=sk_live_YourStripeSecretKey123
STRIPE_PUBLISHABLE_KEY=pk_live_YourStripePublishableKey123
STRIPE_WEBHOOK_SECRET=whsec_YourStripeWebhookSecret123
EOF

chmod 600 .env.production
```

### Step 4: Firewall Configuration
```bash
# Configure firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

### Step 5: Deploy Application
```bash
# Deploy using Docker Compose
docker-compose -f docker-compose.prod.yml down --remove-orphans
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to start
sleep 60

# Run database migrations
docker-compose -f docker-compose.prod.yml exec mymeds-app npx prisma migrate deploy

# Initialize integrations
docker-compose -f docker-compose.prod.yml exec mymeds-app node init-integrations.js
```

### Step 6: Verify Deployment
```bash
# Check container status
docker-compose -f docker-compose.prod.yml ps

# Test backend health
curl -f http://localhost:4000/api/health

# Test frontend
curl -f http://localhost:3000

# Test admin login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mymedspharmacyinc.com","password":"Mymeds2025!AdminSecure123!@#"}'
```

## 🔐 SSL Certificate Setup (Optional)

### Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Generate SSL Certificate
```bash
# Replace with your actual domain
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Test SSL Renewal
```bash
sudo certbot renew --dry-run
```

## 📊 Monitoring Commands

### View Logs
```bash
# Application logs
docker-compose -f docker-compose.prod.yml logs -f mymeds-app

# Database logs
docker-compose -f docker-compose.prod.yml logs -f mysql

# Nginx logs
docker-compose -f docker-compose.prod.yml logs -f nginx
```

### Check Status
```bash
# Container status
docker-compose -f docker-compose.prod.yml ps

# System resources
docker stats

# Disk usage
df -h
```

### Backup Database
```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec -T mysql mysqldump \
  -u root -p$MYSQL_ROOT_PASSWORD $MYSQL_DATABASE > backup_$(date +%Y%m%d_%H%M%S).sql
```

## 🔄 Update Commands

### Update Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

### Restart Services
```bash
# Restart all services
docker-compose -f docker-compose.prod.yml restart

# Restart specific service
docker-compose -f docker-compose.prod.yml restart mymeds-app
```

## 🚨 Troubleshooting Commands

### Common Issues
```bash
# Check what's using ports
sudo netstat -tulpn | grep :4000
sudo netstat -tulpn | grep :3000

# Kill processes
sudo kill -9 PID_NUMBER

# Check Docker logs
docker-compose -f docker-compose.prod.yml logs mymeds-app

# Check environment variables
docker-compose -f docker-compose.prod.yml exec mymeds-app env

# Test database connection
docker-compose -f docker-compose.prod.yml exec mysql mysql -u root -p
```

## ✅ Final Verification Checklist

Run these commands to verify everything is working:

```bash
# 1. Check containers are running
docker-compose -f docker-compose.prod.yml ps

# 2. Test backend health
curl -f http://localhost:4000/api/health

# 3. Test frontend
curl -f http://localhost:3000

# 4. Test admin login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mymedspharmacyinc.com","password":"Mymeds2025!AdminSecure123!@#"}'

# 5. Test all API endpoints
curl -f http://localhost:4000/api/products
curl -f http://localhost:4000/api/blogs
curl -f http://localhost:4000/api/woocommerce/status

# 6. Check database
docker-compose -f docker-compose.prod.yml exec mysql mysqladmin ping -h localhost
```

## 🎉 Success!

Your MyMeds Pharmacy Inc. system is now fully deployed and ready for production!

**Service URLs:**
- 🌐 Frontend: http://yourdomain.com
- 🔧 Backend API: http://yourdomain.com/api
- 🔐 Admin Panel: http://yourdomain.com/admin
- 📊 Health Check: http://yourdomain.com/api/health

**Next Steps:**
1. Configure your domain DNS
2. Set up SSL certificates
3. Update environment variables with your actual settings
4. Configure email settings
5. Test all functionality
6. Go live! 🚀
