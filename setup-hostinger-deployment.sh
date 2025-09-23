#!/bin/bash
# =============================================================================
# HOSTINGER DEPLOYMENT SETUP - MyMeds Pharmacy
# =============================================================================
# Quick setup script for Hostinger VPS deployment
# =============================================================================

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 MyMeds Pharmacy - Hostinger Deployment Setup${NC}"
echo "=================================================="

# Your VPS Details (from the dashboard)
VPS_IP="72.60.116.253"
VPS_HOSTNAME="srv983203.hstgr.cloud"
DOMAIN_NAME="mymedspharmacyinc.com"  # Update with your actual domain

echo -e "${YELLOW}📋 VPS Configuration:${NC}"
echo "IP Address: $VPS_IP"
echo "Hostname: $VPS_HOSTNAME"
echo "Domain: $DOMAIN_NAME"
echo ""

# Create deployment configuration
echo -e "${BLUE}⚙️ Creating deployment configuration...${NC}"

# Update deploy-hostinger-api.sh with your details
sed -i.bak "s/HOSTINGER_API_TOKEN=\"\"/HOSTINGER_API_TOKEN=\"YOUR_HOSTINGER_API_TOKEN\"/" deploy-hostinger-api.sh
sed -i.bak "s/VPS_VM_ID=\"\"/VPS_VM_ID=\"srv983203\"/" deploy-hostinger-api.sh
sed -i.bak "s/DOMAIN_NAME=\"\"/DOMAIN_NAME=\"$DOMAIN_NAME\"/" deploy-hostinger-api.sh
sed -i.bak "s|GITHUB_REPO_URL=\"\"|GITHUB_REPO_URL=\"https://github.com/yourusername/mymeds-brooklyn-care.git\"|" deploy-hostinger-api.sh

echo -e "${GREEN}✅ Configuration updated!${NC}"
echo ""

# Create production environment file
echo -e "${BLUE}📝 Creating production environment...${NC}"

cat > .env.production << EOF
# =============================================================================
# PRODUCTION ENVIRONMENT - MyMeds Pharmacy Inc.
# =============================================================================

# Server Configuration
NODE_ENV=production
PORT=4000
HOST=0.0.0.0

# Database Configuration
DATABASE_URL="mysql://mymeds_user:Mymeds2025!UserSecure123!@#@localhost:3306/mymeds_production"
MYSQL_ROOT_PASSWORD=Mymeds2025!RootSecure123!@#
MYSQL_DATABASE=mymeds_production
MYSQL_USER=mymeds_user
MYSQL_PASSWORD=Mymeds2025!UserSecure123!@#

# JWT & Authentication
JWT_SECRET=Mymeds2025!JWTSecretKey_PharmacySecure_Production_2025!@#\$%^&*()
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Admin Credentials
ADMIN_EMAIL=admin@mymedspharmacyinc.com
ADMIN_PASSWORD=Mymeds2025!AdminSecure123!@#
ADMIN_FIRST_NAME=Admin
ADMIN_LAST_NAME=User

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=mymedspharmacyinc@gmail.com
EMAIL_PASSWORD=YourGmailAppPasswordHere
EMAIL_FROM=mymedspharmacyinc@gmail.com
EMAIL_FROM_NAME="MyMeds Pharmacy Inc."

# CORS Configuration
CORS_ORIGIN=https://www.$DOMAIN_NAME,https://$DOMAIN_NAME
CORS_CREDENTIALS=true
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS,PATCH
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With,Accept,Origin,Cache-Control

# WordPress Integration
WORDPRESS_URL=https://$DOMAIN_NAME/blog
WORDPRESS_USERNAME=mymeds_api_user
WORDPRESS_APP_PASSWORD=X8J0 ICBi 5Ilb PnrX Bhyp r2PE
FEATURE_WORDPRESS_ENABLED=true

# WooCommerce Integration
WOOCOMMERCE_STORE_URL=https://$DOMAIN_NAME/shop
WOOCOMMERCE_CONSUMER_KEY=ck_47e02dc770a3824275746e6efd09a01497e3881f
WOOCOMMERCE_CONSUMER_SECRET=cs_9fc99adfd9306f1b02005701f7a1eb4244be2d46
WOOCOMMERCE_WEBHOOK_SECRET=Mymeds2025!WooCommerceWebhookSecret_Production_2025!@#
FEATURE_WOOCOMMERCE_ENABLED=true

# Payment Gateway
STRIPE_SECRET_KEY=sk_live_YourStripeSecretKey123
STRIPE_PUBLISHABLE_KEY=pk_live_YourStripePublishableKey123
STRIPE_WEBHOOK_SECRET=whsec_YourStripeWebhookSecret123
PAYMENT_GATEWAY_ENABLED=true

# Security Configuration
SESSION_SECRET=Mymeds2025!SessionSecret_PharmacySecure_Production_2025!@#\$%^&*()
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
CLUSTER_WORKERS=2

# Debug (DISABLE IN PRODUCTION)
DEBUG_MODE=false
VERBOSE_LOGGING=false
EOF

echo -e "${GREEN}✅ Production environment created!${NC}"
echo ""

# Create quick deployment script
echo -e "${BLUE}🚀 Creating quick deployment script...${NC}"

cat > deploy-quick.sh << 'EOF'
#!/bin/bash
# Quick deployment to Hostinger VPS

set -e

VPS_IP="72.60.116.253"
PROJECT_DIR="/opt/mymeds-pharmacy"

echo "🚀 Deploying to Hostinger VPS..."

# Copy files to VPS
echo "📁 Uploading files to VPS..."
rsync -avz --progress \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=dist \
  --exclude=logs \
  --exclude=*.log \
  ./ root@$VPS_IP:$PROJECT_DIR/

# Connect to VPS and deploy
echo "🔧 Setting up on VPS..."
ssh root@$VPS_IP << 'ENDSSH'
cd /opt/mymeds-pharmacy

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker $USER
rm get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Set up firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Copy environment file
cp .env.production .env

# Deploy with Docker
docker-compose -f docker-compose.prod.yml down --remove-orphans || true
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Wait for services
echo "Waiting for services to start..."
sleep 60

# Run database setup
docker-compose -f docker-compose.prod.yml exec mymeds-app npx prisma migrate deploy
docker-compose -f docker-compose.prod.yml exec mymeds-app npx prisma generate
docker-compose -f docker-compose.prod.yml exec mymeds-app node create-admin-user.cjs

# Test deployment
curl -f http://localhost:4000/api/health

echo "✅ Deployment completed!"
echo "Frontend: http://$VPS_IP:3000"
echo "Backend: http://$VPS_IP:4000"
echo "Admin: http://$VPS_IP:3000/admin"
ENDSSH

echo "🎉 Deployment completed successfully!"
echo "🌐 Frontend: http://$VPS_IP:3000"
echo "🔧 Backend: http://$VPS_IP:4000"
echo "🔐 Admin: http://$VPS_IP:3000/admin"
echo "📊 Health: http://$VPS_IP:4000/api/health"
EOF

chmod +x deploy-quick.sh

echo -e "${GREEN}✅ Quick deployment script created!${NC}"
echo ""

# Display next steps
echo -e "${YELLOW}📋 NEXT STEPS:${NC}"
echo ""
echo "1. 🔑 Get your Hostinger API token:"
echo "   - Go to Hostinger Panel > API"
echo "   - Create new API token"
echo "   - Copy the token"
echo ""
echo "2. 📝 Update API token in deploy-hostinger-api.sh:"
echo "   - Replace 'YOUR_HOSTINGER_API_TOKEN' with your actual token"
echo ""
echo "3. 🚀 Choose deployment method:"
echo ""
echo "   ${GREEN}Option A: Quick Deployment (Recommended)${NC}"
echo "   ./deploy-quick.sh"
echo ""
echo "   ${GREEN}Option B: Full Hostinger API Deployment${NC}"
echo "   ./deploy-hostinger-api.sh"
echo ""
echo "4. 🌐 Configure your domain DNS:"
echo "   - Point $DOMAIN_NAME to $VPS_IP"
echo "   - Point www.$DOMAIN_NAME to $VPS_IP"
echo ""
echo -e "${GREEN}✅ Setup completed! Ready for deployment.${NC}"
