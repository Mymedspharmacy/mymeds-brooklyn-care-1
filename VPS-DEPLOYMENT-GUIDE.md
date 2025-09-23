# 🚀 MyMeds Pharmacy Inc. - Complete VPS Deployment Guide

## 📋 Prerequisites
- VPS with Ubuntu 20.04+ or CentOS 8+
- Root or sudo access
- Domain name pointing to your VPS IP
- Minimum 2GB RAM, 2 CPU cores, 20GB storage

## 🎯 Step-by-Step Deployment Commands

### Step 1: Connect to Your VPS
```bash
# Connect to your VPS (replace with your actual IP)
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

### Step 4: Clone Repository
```bash
# Clone the repository (replace with your actual repository URL)
git clone https://github.com/yourusername/mymeds-brooklyn-care.git .

# Or if you have the files locally, upload them using SCP:
# scp -r /path/to/local/mymeds-brooklyn-care/* root@YOUR_VPS_IP:/opt/mymeds-pharmacy/
```

### Step 5: Set Up Environment Configuration
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
# Make deployment script executable
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

### Step 8: Verify Deployment
```bash
# Check if all containers are running
docker-compose -f docker-compose.prod.yml ps

# Check application logs
docker-compose -f docker-compose.prod.yml logs -f mymeds-app

# Test backend health
curl -f http://localhost:4000/api/health

# Test frontend
curl -f http://localhost:3000
```

### Step 9: Set Up SSL Certificate (Optional but Recommended)
```bash
# Install Certbot for SSL certificates
sudo apt install -y certbot python3-certbot-nginx

# Generate SSL certificate (replace with your actual domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test SSL renewal
sudo certbot renew --dry-run
```

### Step 10: Configure Domain DNS
```bash
# Point your domain to your VPS IP
# Add these DNS records:
# A record: yourdomain.com -> YOUR_VPS_IP
# A record: www.yourdomain.com -> YOUR_VPS_IP
# CNAME record: api.yourdomain.com -> yourdomain.com
```

### Step 11: Final Verification
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
# Update email configuration in .env.production
nano .env.production

# Restart the application
docker-compose -f docker-compose.prod.yml restart mymeds-app
```

### Configure WordPress Integration
```bash
# Update WordPress settings in .env.production
nano .env.production

# Test WordPress connection
curl -X POST http://yourdomain.com/api/wordpress/test-connection \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Configure WooCommerce Integration
```bash
# Update WooCommerce settings in .env.production
nano .env.production

# Test WooCommerce connection
curl -X POST http://yourdomain.com/api/woocommerce/test-connection \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
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
# Pull latest changes
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

- [ ] All containers are running (`docker-compose ps`)
- [ ] Backend health check passes (`curl http://yourdomain.com/api/health`)
- [ ] Frontend loads (`curl http://yourdomain.com`)
- [ ] Admin login works
- [ ] Database is accessible
- [ ] SSL certificate is installed (if using HTTPS)
- [ ] Email configuration is working
- [ ] WordPress integration is configured
- [ ] WooCommerce integration is configured
- [ ] All API endpoints are responding
- [ ] File uploads are working
- [ ] Patient registration is working
- [ ] Review system is working
- [ ] Feedback system is working

## 🎉 Success!

Your MyMeds Pharmacy Inc. system is now fully deployed and ready for production use!

**Service URLs:**
- 🌐 Frontend: http://yourdomain.com
- 🔧 Backend API: http://yourdomain.com/api
- 🔐 Admin Panel: http://yourdomain.com/admin
- 📊 Health Check: http://yourdomain.com/api/health

**Next Steps:**
1. Configure your domain DNS
2. Set up SSL certificates
3. Configure email settings
4. Set up monitoring
5. Configure backups
6. Test all functionality
7. Go live! 🚀
