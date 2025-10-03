#!/bin/bash

# CI/CD Setup Script for MyMeds Pharmacy
# This script sets up the complete CI/CD pipeline

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VPS_HOST="${VPS_HOST:-72.60.116.253}"
VPS_USER="${VPS_USER:-root}"
VPS_PORT="${VPS_PORT:-22}"
WEBHOOK_PORT="${WEBHOOK_PORT:-3001}"
WEBHOOK_SECRET="${WEBHOOK_SECRET:-MyMeds-Webhook-Secret-2024-Pharmacy-Deploy}"

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to setup GitHub repository
setup_github() {
    log "Setting up GitHub repository..."
    
    # Check if git is initialized
    if [ ! -d ".git" ]; then
        log "Initializing git repository..."
        git init
        git add .
        git commit -m "Initial commit"
    fi
    
    # Check if remote exists
    if ! git remote get-url origin >/dev/null 2>&1; then
        warning "No GitHub remote found. Please add your GitHub repository:"
        echo "git remote add origin https://github.com/yourusername/mymeds-pharmacy.git"
        echo "git push -u origin main"
        return 1
    fi
    
    success "GitHub repository configured"
}

# Function to setup GitHub Actions secrets
setup_github_secrets() {
    log "Setting up GitHub Actions secrets..."
    
    echo "Please add the following secrets to your GitHub repository:"
    echo "Go to: https://github.com/yourusername/mymeds-pharmacy/settings/secrets/actions"
    echo ""
    echo "Required secrets:"
    echo "  VPS_HOST: $VPS_HOST"
    echo "  VPS_USERNAME: $VPS_USER"
    echo "  VPS_PORT: $VPS_PORT"
    echo "  VPS_SSH_KEY: [Your private SSH key content]"
    echo "  WEBHOOK_SECRET: $WEBHOOK_SECRET"
    echo ""
    
    # Generate SSH key if it doesn't exist
    if [ ! -f ~/.ssh/id_rsa ]; then
        log "Generating SSH key..."
        ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
        success "SSH key generated"
    fi
    
    echo "Your public SSH key (add to VPS authorized_keys):"
    cat ~/.ssh/id_rsa.pub
    echo ""
    
    warning "Please add the public key to your VPS and the private key to GitHub secrets"
}

# Function to setup VPS for CI/CD
setup_vps() {
    log "Setting up VPS for CI/CD..."
    
    # Create deployment directory structure
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "
        # Create deployment directory
        sudo mkdir -p /var/www/mymeds-pharmacy
        sudo mkdir -p /var/backups/mymeds-pharmacy
        sudo mkdir -p /var/log/mymeds-pharmacy
        
        # Set permissions
        sudo chown -R $VPS_USER:$VPS_USER /var/www/mymeds-pharmacy
        sudo chown -R $VPS_USER:$VPS_USER /var/backups/mymeds-pharmacy
        sudo chown -R $VPS_USER:$VPS_USER /var/log/mymeds-pharmacy
        
        # Install required packages
        sudo apt update
        sudo apt install -y rsync curl git nginx pm2
        
        # Setup PM2
        pm2 startup
        sudo env PATH=\$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $VPS_USER --hp /home/$VPS_USER
        
        echo '✅ VPS setup completed'
    "
    
    success "VPS setup completed"
}

# Function to setup webhook server
setup_webhook_server() {
    log "Setting up webhook server..."
    
    # Create webhook server directory
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "
        # Create webhook directory
        sudo mkdir -p /opt/webhook-deploy
        sudo chown -R $VPS_USER:$VPS_USER /opt/webhook-deploy
        
        # Create webhook server package.json
        cat > /opt/webhook-deploy/package.json << 'EOF'
{
  \"name\": \"webhook-deploy\",
  \"version\": \"1.0.0\",
  \"description\": \"Webhook deployment server\",
  \"main\": \"webhook-deploy.js\",
  \"scripts\": {
    \"start\": \"node webhook-deploy.js\",
    \"dev\": \"nodemon webhook-deploy.js\"
  },
  \"dependencies\": {
    \"express\": \"^4.18.2\"
  },
  \"devDependencies\": {
    \"nodemon\": \"^3.0.1\"
  }
}
EOF
        
        # Install dependencies
        cd /opt/webhook-deploy
        npm install
        
        echo '✅ Webhook server setup completed'
    "
    
    # Copy webhook server files
    scp -P $VPS_PORT scripts/webhook-deploy.js $VPS_USER@$VPS_HOST:/opt/webhook-deploy/
    scp -P $VPS_PORT scripts/incremental-deploy.sh $VPS_USER@$VPS_HOST:/opt/webhook-deploy/
    
    # Make deploy script executable
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "chmod +x /opt/webhook-deploy/incremental-deploy.sh"
    
    # Create systemd service for webhook server
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "
        sudo tee /etc/systemd/system/webhook-deploy.service > /dev/null << EOF
[Unit]
Description=Webhook Deployment Server
After=network.target

[Service]
Type=simple
User=$VPS_USER
WorkingDirectory=/opt/webhook-deploy
ExecStart=/usr/bin/node webhook-deploy.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=WEBHOOK_PORT=$WEBHOOK_PORT
Environment=WEBHOOK_SECRET=$WEBHOOK_SECRET
Environment=VPS_HOST=$VPS_HOST
Environment=VPS_USER=$VPS_USER
Environment=VPS_PORT=$VPS_PORT

[Install]
WantedBy=multi-user.target
EOF
        
        # Enable and start webhook service
        sudo systemctl daemon-reload
        sudo systemctl enable webhook-deploy
        sudo systemctl start webhook-deploy
        
        echo '✅ Webhook service started'
    "
    
    success "Webhook server setup completed"
}

# Function to setup nginx for webhook
setup_nginx_webhook() {
    log "Setting up nginx for webhook..."
    
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "
        # Create nginx configuration for webhook
        sudo tee /etc/nginx/sites-available/webhook-deploy > /dev/null << EOF
server {
    listen 80;
    server_name $VPS_HOST;
    
    location /webhook {
        proxy_pass http://localhost:$WEBHOOK_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    location /deploy {
        proxy_pass http://localhost:$WEBHOOK_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location /status {
        proxy_pass http://localhost:$WEBHOOK_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
        
        # Enable webhook site
        sudo ln -sf /etc/nginx/sites-available/webhook-deploy /etc/nginx/sites-enabled/
        
        # Test nginx configuration
        sudo nginx -t
        
        # Reload nginx
        sudo systemctl reload nginx
        
        echo '✅ Nginx webhook configuration completed'
    "
    
    success "Nginx webhook setup completed"
}

# Function to setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "
        # Create monitoring script
        sudo tee /opt/monitor-deployment.sh > /dev/null << 'EOF'
#!/bin/bash

# Deployment monitoring script
LOG_FILE=\"/var/log/mymeds-pharmacy/deployment.log\"
WEBHOOK_URL=\"http://localhost:3001/health\"

# Function to log messages
log() {
    echo \"[\$(date +'%Y-%m-%d %H:%M:%S')] \$1\" >> \$LOG_FILE
}

# Check webhook server health
if curl -f \$WEBHOOK_URL > /dev/null 2>&1; then
    log \"Webhook server is healthy\"
else
    log \"Webhook server is down - restarting\"
    sudo systemctl restart webhook-deploy
fi

# Check backend health
if curl -f http://localhost:4000/api/health > /dev/null 2>&1; then
    log \"Backend is healthy\"
else
    log \"Backend is down - restarting\"
    sudo pm2 restart mymeds-backend
fi

# Check nginx health
if sudo systemctl is-active --quiet nginx; then
    log \"Nginx is healthy\"
else
    log \"Nginx is down - restarting\"
    sudo systemctl restart nginx
fi
EOF
        
        # Make monitoring script executable
        sudo chmod +x /opt/monitor-deployment.sh
        
        # Create cron job for monitoring
        echo \"*/5 * * * * /opt/monitor-deployment.sh\" | sudo crontab -
        
        echo '✅ Monitoring setup completed'
    "
    
    success "Monitoring setup completed"
}

# Function to test CI/CD setup
test_setup() {
    log "Testing CI/CD setup..."
    
    # Test webhook server
    if curl -f http://$VPS_HOST/webhook/health > /dev/null 2>&1; then
        success "Webhook server is accessible"
    else
        error "Webhook server is not accessible"
        return 1
    fi
    
    # Test deployment script
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "
        cd /opt/webhook-deploy
        if [ -f incremental-deploy.sh ]; then
            echo '✅ Deployment script found'
        else
            echo '❌ Deployment script not found'
            exit 1
        fi
    "
    
    success "CI/CD setup test completed"
}

# Main setup function
main() {
    log "Starting CI/CD setup for MyMeds Pharmacy..."
    
    # Check required tools
    if ! command_exists ssh; then
        error "SSH is required but not installed"
        exit 1
    fi
    
    if ! command_exists curl; then
        error "curl is required but not installed"
        exit 1
    fi
    
    # Setup steps
    setup_github
    setup_github_secrets
    setup_vps
    setup_webhook_server
    setup_nginx_webhook
    setup_monitoring
    test_setup
    
    success "CI/CD setup completed successfully!"
    
    echo ""
    echo "🎉 CI/CD Pipeline Setup Complete!"
    echo ""
    echo "Next steps:"
    echo "1. Add the GitHub secrets as shown above"
    echo "2. Push your code to GitHub: git push origin main"
    echo "3. The deployment will trigger automatically"
    echo ""
    echo "Webhook URL: http://$VPS_HOST/webhook"
    echo "Health check: http://$VPS_HOST/webhook/health"
    echo "Manual deploy: http://$VPS_HOST/deploy/[frontend|backend|full]"
    echo "Status: http://$VPS_HOST/status"
    echo ""
    echo "Webhook secret: $WEBHOOK_SECRET"
    echo "Add this to your GitHub repository webhook settings"
    echo ""
}

# Run main function
main "$@"
