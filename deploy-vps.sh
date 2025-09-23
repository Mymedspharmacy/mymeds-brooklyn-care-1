#!/bin/bash
set -e

echo "ðŸš€ MyMeds Pharmacy Deployment"
echo "============================="

# Update system
echo "ðŸ“¦ Updating system..."
apt update && apt upgrade -y

# Install required packages
echo "ðŸ“¦ Installing packages..."
apt install -y curl wget git rsync ufw

# Install Docker
echo "ðŸ³ Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker root
    rm get-docker.sh
fi

# Install Docker Compose
echo "ðŸ³ Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Setup firewall
echo "ðŸ”¥ Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp
ufw allow 4000/tcp
ufw --force enable

# Create project directory
echo "ðŸ“ Setting up project..."
mkdir -p /opt/mymeds-pharmacy
cd /opt/mymeds-pharmacy

# Copy environment file
if [ -f "env.production" ]; then
    cp env.production .env
    echo "âœ… Environment configured"
else
    echo "âš ï¸ env.production not found"
fi

# Deploy with Docker
echo "ðŸ³ Deploying with Docker..."
if [ -f "docker-compose.prod.yml" ]; then
    docker-compose -f docker-compose.prod.yml down --remove-orphans || true
    docker-compose -f docker-compose.prod.yml build --no-cache
    docker-compose -f docker-compose.prod.yml up -d
    
    echo "â³ Waiting for services..."
    sleep 60
    
    # Database setup
    echo "ðŸ—„ï¸ Setting up database..."
    docker-compose -f docker-compose.prod.yml exec -T mymeds-app npx prisma migrate deploy || true
    docker-compose -f docker-compose.prod.yml exec -T mymeds-app npx prisma generate || true
    docker-compose -f docker-compose.prod.yml exec -T mymeds-app node create-admin-user.cjs || true
    
    # Test
    echo "ðŸ§ª Testing deployment..."
    curl -f http://localhost:4000/api/health || echo "Health check failed"
    
    echo "âœ… Deployment completed!"
    echo "ðŸŒ Frontend: http://"
    echo "ðŸ”§ Backend: http://"
    echo "ðŸ” Admin: http:///admin"
else
    echo "âŒ docker-compose.prod.yml not found"
fi
