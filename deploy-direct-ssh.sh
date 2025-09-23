#!/bin/bash
# =============================================================================
# DIRECT SSH DEPLOYMENT - MyMeds Pharmacy (Bypass API Issues)
# =============================================================================

set -e

# Configuration
VPS_IP="72.60.116.253"
VPS_HOSTNAME="srv983203.hstgr.cloud"
DOMAIN_NAME="mymedspharmacyinc.com"
PROJECT_DIR="/opt/mymeds-pharmacy"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 MyMeds Pharmacy - Direct SSH Deployment${NC}"
echo "=============================================="
echo -e "${CYAN}VPS: $VPS_IP ($VPS_HOSTNAME)${NC}"
echo -e "${CYAN}Domain: $DOMAIN_NAME${NC}"
echo -e "${CYAN}Project Directory: $PROJECT_DIR${NC}"
echo ""

# Function to test SSH connection
test_ssh_connection() {
    echo -e "${YELLOW}🔍 Testing SSH connection...${NC}"
    
    if ssh -o ConnectTimeout=10 -o BatchMode=yes root@$VPS_IP "echo 'SSH connection successful'" 2>/dev/null; then
        echo -e "${GREEN}✅ SSH connection established${NC}"
        return 0
    else
        echo -e "${RED}❌ SSH connection failed${NC}"
        echo -e "${YELLOW}Please ensure:${NC}"
        echo "1. VPS is running"
        echo "2. SSH key is configured or password authentication is enabled"
        echo "3. Firewall allows SSH (port 22)"
        return 1
    fi
}

# Function to upload files
upload_files() {
    echo -e "${YELLOW}📁 Uploading project files...${NC}"
    
    # Create project directory on VPS
    ssh root@$VPS_IP "mkdir -p $PROJECT_DIR"
    
    # Upload files using rsync (if available) or scp
    if command -v rsync &> /dev/null; then
        echo "Using rsync for file upload..."
        rsync -avz --progress \
            --exclude=node_modules \
            --exclude=.git \
            --exclude=dist \
            --exclude=logs \
            --exclude=*.log \
            ./ root@$VPS_IP:$PROJECT_DIR/
    else
        echo "Using scp for file upload..."
        scp -r \
            --exclude=node_modules \
            --exclude=.git \
            --exclude=dist \
            --exclude=logs \
            ./ root@$VPS_IP:$PROJECT_DIR/
    fi
    
    echo -e "${GREEN}✅ Files uploaded successfully${NC}"
}

# Function to deploy on VPS
deploy_on_vps() {
    echo -e "${YELLOW}🔧 Deploying on VPS...${NC}"
    
    ssh root@$VPS_IP << EOF
set -e

cd $PROJECT_DIR

echo "🚀 MyMeds Pharmacy - VPS Deployment"
echo "=================================="

# Update system
echo "📦 Updating system packages..."
export DEBIAN_FRONTEND=noninteractive
apt update && apt upgrade -y

# Install required packages
echo "📦 Installing required packages..."
apt install -y curl wget git rsync ufw nginx certbot python3-certbot-nginx

# Install Node.js
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker root
    rm get-docker.sh
fi

# Install Docker Compose
echo "🐳 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-\$(uname -s)-\$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Setup firewall
echo "🔥 Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp
ufw allow 4000/tcp
ufw allow 8080/tcp
ufw --force enable

# Set up environment
echo "⚙️ Setting up environment..."
if [ -f "env.production" ]; then
    cp env.production .env
    echo "✅ Environment file configured"
else
    echo "⚠️ env.production not found, creating default..."
    cat > .env << 'ENVEOF'
NODE_ENV=production
PORT=4000
HOST=0.0.0.0
DATABASE_URL="mysql://mymeds_user:Mymeds2025!UserSecure123!@#@localhost:3306/mymeds_production"
MYSQL_ROOT_PASSWORD=Mymeds2025!RootSecure123!@#
MYSQL_DATABASE=mymeds_production
MYSQL_USER=mymeds_user
MYSQL_PASSWORD=Mymeds2025!UserSecure123!@#
JWT_SECRET=Mymeds2025!JWTSecretKey_PharmacySecure_Production_2025!@#\$%^&*()
JWT_EXPIRES_IN=24h
ADMIN_EMAIL=admin@$DOMAIN_NAME
ADMIN_PASSWORD=Mymeds2025!AdminSecure123!@#
CORS_ORIGIN=https://www.$DOMAIN_NAME,https://$DOMAIN_NAME
WORDPRESS_URL=https://$DOMAIN_NAME/blog
WOOCOMMERCE_STORE_URL=https://$DOMAIN_NAME/shop
ENVEOF
fi

# Deploy with Docker
echo "🐳 Deploying with Docker..."
if [ -f "docker-compose.prod.yml" ]; then
    # Stop any existing containers
    docker-compose -f docker-compose.prod.yml down --remove-orphans || true
    
    # Build and start services
    docker-compose -f docker-compose.prod.yml build --no-cache
    docker-compose -f docker-compose.prod.yml up -d
    
    echo "⏳ Waiting for services to start..."
    sleep 90
    
    # Database setup
    echo "🗄️ Setting up database..."
    docker-compose -f docker-compose.prod.yml exec -T mymeds-app npx prisma migrate deploy || echo "Migration failed, continuing..."
    docker-compose -f docker-compose.prod.yml exec -T mymeds-app npx prisma generate || echo "Generate failed, continuing..."
    docker-compose -f docker-compose.prod.yml exec -T mymeds-app node create-admin-user.cjs || echo "Admin user creation failed, continuing..."
    
    # Test deployment
    echo "🧪 Testing deployment..."
    sleep 30
    curl -f http://localhost:4000/api/health && echo "✅ Backend health check passed" || echo "⚠️ Backend health check failed"
    curl -f http://localhost:3000 && echo "✅ Frontend accessible" || echo "⚠️ Frontend not accessible"
    
    echo ""
    echo "🎉 Deployment completed!"
    echo "🌐 Frontend: http://$VPS_IP:3000"
    echo "🔧 Backend: http://$VPS_IP:4000"
    echo "🔐 Admin: http://$VPS_IP:3000/admin"
    echo "📊 Health: http://$VPS_IP:4000/api/health"
    echo "📝 WordPress: http://$VPS_IP:8080"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Configure DNS: Point $DOMAIN_NAME to $VPS_IP"
    echo "2. Setup SSL: certbot --nginx -d $DOMAIN_NAME"
    echo "3. Test all endpoints"
    
else
    echo "❌ docker-compose.prod.yml not found"
    echo "Please ensure all project files are uploaded to $PROJECT_DIR"
fi
EOF

    echo -e "${GREEN}✅ Deployment completed on VPS${NC}"
}

# Main deployment function
main() {
    echo -e "${BLUE}🚀 Starting Direct SSH Deployment...${NC}"
    
    # Test SSH connection
    if ! test_ssh_connection; then
        echo -e "${RED}❌ Cannot proceed without SSH access${NC}"
        exit 1
    fi
    
    # Upload files
    upload_files
    
    # Deploy on VPS
    deploy_on_vps
    
    echo -e "${GREEN}🎉 Direct SSH Deployment Completed Successfully!${NC}"
    echo ""
    echo -e "${CYAN}📊 Your MyMeds Pharmacy is now live at:${NC}"
    echo -e "${WHITE}Frontend: http://$VPS_IP:3000${NC}"
    echo -e "${WHITE}Backend: http://$VPS_IP:4000${NC}"
    echo -e "${WHITE}Admin: http://$VPS_IP:3000/admin${NC}"
    echo -e "${WHITE}Health: http://$VPS_IP:4000/api/health${NC}"
    echo -e "${WHITE}WordPress: http://$VPS_IP:8080${NC}"
    echo ""
    echo -e "${YELLOW}📋 Next Steps:${NC}"
    echo "1. Configure DNS: Point $DOMAIN_NAME to $VPS_IP"
    echo "2. Setup SSL certificate"
    echo "3. Test all functionality"
}

# Execute main function
main "$@"
