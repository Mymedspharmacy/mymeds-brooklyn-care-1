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
cp env.production .env

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
