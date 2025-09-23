# 🚀 MyMeds Pharmacy Inc. - Manual VPS Deployment Commands

## 📋 Prerequisites
- VPS with Ubuntu 20.04+ or CentOS 8+
- Root or sudo access
- Domain name pointing to your VPS IP
- Minimum 2GB RAM, 2 CPU cores, 20GB storage

## 🎯 Step-by-Step Manual Deployment

### Step 1: Connect to Your VPS
```bash
ssh root@YOUR_VPS_IP
# or
ssh username@YOUR_VPS_IP
```

### Step 2: Update System and Install Dependencies
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
rm get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version
```

### Step 3: Create Project Directory
```bash
# Create project directory
sudo mkdir -p /opt/mymeds-pharmacy
cd /opt/mymeds-pharmacy

# Set proper permissions
sudo chown -R $USER:$USER /opt/mymeds-pharmacy
```

### Step 4: Upload Project Files
```bash
# Option A: Clone from Git (if you have a repository)
# git clone https://github.com/yourusername/mymeds-brooklyn-care.git .

# Option B: Upload files using SCP from your local machine
# scp -r /path/to/local/mymeds-brooklyn-care/* root@YOUR_VPS_IP:/opt/mymeds-pharmacy/

# Option C: Create files manually (copy from your local project)
# You'll need to copy all the project files to this directory
```

### Step 5: Create Production Environment File
```bash
# Create production environment file
cat > .env.production << 'EOF'
# =============================================================================
# PRODUCTION ENVIRONMENT CONFIGURATION - MyMeds Pharmacy Inc.
# =============================================================================

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

# Email Configuration (Update with your actual email settings)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=mymedspharmacyinc@gmail.com
EMAIL_PASSWORD=YourGmailAppPasswordHere
EMAIL_FROM=mymedspharmacyinc@gmail.com
EMAIL_FROM_NAME=MyMeds Pharmacy Inc.

# CORS Configuration (Update with your actual domain)
CORS_ORIGIN=https://www.mymedspharmacyinc.com,https://mymedspharmacyinc.com

# Security Configuration
SESSION_SECRET=Mymeds2025!SessionSecret_PharmacySecure_Production_2025!@#$%^&*()

# WordPress Integration (Update with your actual WordPress settings)
WORDPRESS_URL=https://mymedspharmacyinc.com/blog
WORDPRESS_USERNAME=mymeds_api_user
WORDPRESS_APP_PASSWORD=X8J0 ICBi 5Ilb PnrX Bhyp r2PE

# WooCommerce Integration (Update with your actual WooCommerce settings)
WOOCOMMERCE_STORE_URL=https://mymedspharmacyinc.com/shop
WOOCOMMERCE_CONSUMER_KEY=ck_47e02dc770a3824275746e6efd09a01497e3881f
WOOCOMMERCE_CONSUMER_SECRET=cs_9fc99adfd9306f1b02005701f7a1eb4244be2d46
WOOCOMMERCE_WEBHOOK_SECRET=Mymeds2025!WooCommerceWebhookSecret_Production_2025!@#

# Payment Gateway Configuration (Update with your actual Stripe keys)
STRIPE_SECRET_KEY=sk_live_YourStripeSecretKey123
STRIPE_PUBLISHABLE_KEY=pk_live_YourStripePublishableKey123
STRIPE_WEBHOOK_SECRET=whsec_YourStripeWebhookSecret123

# Monitoring & Analytics (Optional)
SENTRY_DSN=https://YourSentryDSN@sentry.io/project-id
GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX-X
EOF

# Set proper permissions
chmod 600 .env.production
```

### Step 6: Configure Firewall
```bash
# Configure UFW firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Check firewall status
sudo ufw status
```

### Step 7: Deploy the Application
```bash
# Stop any existing containers
docker-compose -f docker-compose.prod.yml down --remove-orphans || true

# Remove old images
docker image prune -f || true

# Build new images
docker-compose -f docker-compose.prod.yml build --no-cache

# Start MySQL first
docker-compose -f docker-compose.prod.yml up -d mysql

# Wait for MySQL to be ready
echo "Waiting for MySQL to be ready..."
sleep 30

# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 60
```

### Step 8: Run Database Migrations
```bash
# Run database migrations
docker-compose -f docker-compose.prod.yml exec mymeds-app npx prisma migrate deploy

# Initialize integrations
docker-compose -f docker-compose.prod.yml exec mymeds-app node init-integrations.js
```

### Step 9: Verify Deployment
```bash
# Check if all containers are running
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

### Step 10: Set Up SSL Certificate (Optional but Recommended)
```bash
# Install Certbot for SSL certificates
sudo apt install -y certbot python3-certbot-nginx

# Generate SSL certificate (replace with your actual domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test SSL renewal
sudo certbot renew --dry-run
```

### Step 11: Configure Domain DNS
```bash
# Point your domain to your VPS IP
# Add these DNS records:
# A record: yourdomain.com -> YOUR_VPS_IP
# A record: www.yourdomain.com -> YOUR_VPS_IP
# CNAME record: api.yourdomain.com -> yourdomain.com
```

### Step 12: Final Verification
```bash
# Test all endpoints
curl -f http://yourdomain.com/api/health
curl -f http://yourdomain.com/api/products
curl -f http://yourdomain.com/api/blogs

# Test admin login
curl -X POST http://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mymedspharmacyinc.com","password":"Mymeds2025!AdminSecure123!@#"}'
```

## 🔧 Post-Deployment Configuration

### Configure Email Settings
```bash
# Edit environment file
nano .env.production

# Update email configuration with your actual settings:
# EMAIL_HOST=your-smtp-host
# EMAIL_USER=your-email@domain.com
# EMAIL_PASSWORD=your-app-password

# Restart the application
docker-compose -f docker-compose.prod.yml restart mymeds-app
```

### Configure WordPress Integration
```bash
# Edit environment file
nano .env.production

# Update WordPress settings with your actual settings:
# WORDPRESS_URL=https://yourdomain.com/blog
# WORDPRESS_USERNAME=your-wp-username
# WORDPRESS_APP_PASSWORD=your-wp-app-password

# Restart the application
docker-compose -f docker-compose.prod.yml restart mymeds-app
```

### Configure WooCommerce Integration
```bash
# Edit environment file
nano .env.production

# Update WooCommerce settings with your actual settings:
# WOOCOMMERCE_STORE_URL=https://yourdomain.com/shop
# WOOCOMMERCE_CONSUMER_KEY=your-consumer-key
# WOOCOMMERCE_CONSUMER_SECRET=your-consumer-secret

# Restart the application
docker-compose -f docker-compose.prod.yml restart mymeds-app
```

## 📊 Monitoring and Maintenance

### View Logs
```bash
# View application logs
docker-compose -f docker-compose.prod.yml logs -f mymeds-app

# View database logs
docker-compose -f docker-compose.prod.yml logs -f mysql

# View nginx logs
docker-compose -f docker-compose.prod.yml logs -f nginx
```

### Backup Database
```bash
# Create backup script
cat > backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/mymeds-pharmacy/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

docker-compose -f docker-compose.prod.yml exec -T mysql mysqldump \
  -u root -p$MYSQL_ROOT_PASSWORD $MYSQL_DATABASE > $BACKUP_DIR/mymeds_backup_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "mymeds_backup_*.sql" -mtime +7 -delete
EOF

chmod +x backup-db.sh

# Run backup
./backup-db.sh
```

### Update Application
```bash
# Pull latest changes (if using Git)
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

## 🚨 Troubleshooting

### Common Issues and Solutions

1. **Port Already in Use**
```bash
# Check what's using the port
sudo netstat -tulpn | grep :4000
sudo netstat -tulpn | grep :3000

# Kill the process
sudo kill -9 PID_NUMBER
```

2. **Database Connection Issues**
```bash
# Check database logs
docker-compose -f docker-compose.prod.yml logs mysql

# Restart database
docker-compose -f docker-compose.prod.yml restart mysql
```

3. **Application Won't Start**
```bash
# Check application logs
docker-compose -f docker-compose.prod.yml logs mymeds-app

# Check environment variables
docker-compose -f docker-compose.prod.yml exec mymeds-app env
```

4. **SSL Certificate Issues**
```bash
# Check nginx configuration
docker-compose -f docker-compose.prod.yml exec nginx nginx -t

# Restart nginx
docker-compose -f docker-compose.prod.yml restart nginx
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
