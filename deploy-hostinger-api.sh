#!/bin/bash
# =============================================================================
# HOSTINGER VPS API DEPLOYMENT SCRIPT - MyMeds Pharmacy Inc.
# =============================================================================
# Automated deployment using Hostinger VPS API
# =============================================================================

set -e

echo "🚀 MyMeds Pharmacy Inc. - Hostinger VPS API Deployment"
echo "====================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# =============================================================================
# CONFIGURATION
# =============================================================================

# Hostinger API Configuration
HOSTINGER_API_BASE_URL="https://api.hostinger.com/v1"
HOSTINGER_API_TOKEN="LhiSbJevwJrYmte64n2DP6hByMgnTj8osIVRVq0p1aa9827a"
VPS_VM_ID="srv983203"
DOMAIN_NAME="mymedspharmacyinc.com"

# Project Configuration
PROJECT_NAME="mymeds-pharmacy"
PROJECT_DIR="/opt/mymeds-pharmacy"
GITHUB_REPO_URL="https://github.com/yourusername/mymeds-brooklyn-care.git"

# =============================================================================
# API FUNCTIONS
# =============================================================================

# Function to make API calls to Hostinger
hostinger_api_call() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    
    if [ -z "$HOSTINGER_API_TOKEN" ]; then
        log_error "Hostinger API token not set"
        return 1
    fi
    
    local url="${HOSTINGER_API_BASE_URL}${endpoint}"
    local headers="Authorization: Bearer ${HOSTINGER_API_TOKEN}"
    local content_type="Content-Type: application/json"
    
    if [ "$method" = "GET" ]; then
        curl -s -H "$headers" -H "$content_type" "$url"
    elif [ "$method" = "POST" ]; then
        curl -s -X POST -H "$headers" -H "$content_type" -d "$data" "$url"
    elif [ "$method" = "PUT" ]; then
        curl -s -X PUT -H "$headers" -H "$content_type" -d "$data" "$url"
    elif [ "$method" = "DELETE" ]; then
        curl -s -X DELETE -H "$headers" -H "$content_type" "$url"
    fi
}

# Get VPS information
get_vps_info() {
    log_info "Getting VPS information..."
    local response=$(hostinger_api_call "GET" "/vps/${VPS_VM_ID}")
    echo "$response"
}

# Get VPS IP address
get_vps_ip() {
    log_info "Getting VPS IP address..."
    local response=$(hostinger_api_call "GET" "/vps/${VPS_VM_ID}")
    local ip=$(echo "$response" | grep -o '"ip":"[^"]*"' | cut -d'"' -f4)
    echo "$ip"
}

# Start VPS
start_vps() {
    log_info "Starting VPS..."
    local response=$(hostinger_api_call "POST" "/vps/${VPS_VM_ID}/start" '{}')
    echo "$response"
}

# Stop VPS
stop_vps() {
    log_info "Stopping VPS..."
    local response=$(hostinger_api_call "POST" "/vps/${VPS_VM_ID}/stop" '{}')
    echo "$response"
}

# Restart VPS
restart_vps() {
    log_info "Restarting VPS..."
    local response=$(hostinger_api_call "POST" "/vps/${VPS_VM_ID}/restart" '{}')
    echo "$response"
}

# Get VPS status
get_vps_status() {
    log_info "Getting VPS status..."
    local response=$(hostinger_api_call "GET" "/vps/${VPS_VM_ID}")
    local status=$(echo "$response" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    echo "$status"
}

# =============================================================================
# DEPLOYMENT FUNCTIONS
# =============================================================================

# Wait for VPS to be ready
wait_for_vps() {
    log_info "Waiting for VPS to be ready..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        local status=$(get_vps_status)
        if [ "$status" = "running" ]; then
            log_success "VPS is running"
            return 0
        fi
        
        log_info "VPS status: $status (attempt $attempt/$max_attempts)"
        sleep 10
        attempt=$((attempt + 1))
    done
    
    log_error "VPS failed to start within expected time"
    return 1
}

# Connect to VPS and run commands
run_vps_command() {
    local command="$1"
    local vps_ip="$2"
    
    log_info "Running command on VPS: $command"
    
    # Use SSH to run commands on the VPS
    ssh -o StrictHostKeyChecking=no root@$vps_ip "$command"
}

# Upload files to VPS
upload_to_vps() {
    local local_path="$1"
    local remote_path="$2"
    local vps_ip="$3"
    
    log_info "Uploading files to VPS..."
    
    # Use SCP to upload files
    scp -o StrictHostKeyChecking=no -r "$local_path" root@$vps_ip:"$remote_path"
}

# =============================================================================
# MAIN DEPLOYMENT PROCESS
# =============================================================================

# Check if required parameters are provided
check_parameters() {
    if [ -z "$HOSTINGER_API_TOKEN" ]; then
        log_error "Hostinger API token is required"
        log_info "Please set HOSTINGER_API_TOKEN environment variable or provide it as parameter"
        exit 1
    fi
    
    if [ -z "$VPS_VM_ID" ]; then
        log_error "VPS VM ID is required"
        log_info "Please set VPS_VM_ID environment variable or provide it as parameter"
        exit 1
    fi
    
    if [ -z "$DOMAIN_NAME" ]; then
        log_error "Domain name is required"
        log_info "Please set DOMAIN_NAME environment variable or provide it as parameter"
        exit 1
    fi
}

# Deploy application to VPS
deploy_to_vps() {
    local vps_ip="$1"
    
    log_info "Starting deployment to VPS ($vps_ip)..."
    
    # 1. Update system and install dependencies
    log_info "Step 1: Updating system and installing dependencies..."
    run_vps_command "apt update && apt upgrade -y" "$vps_ip"
    run_vps_command "apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release" "$vps_ip"
    
    # 2. Install Docker
    log_info "Step 2: Installing Docker..."
    run_vps_command "curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh && usermod -aG docker root && rm get-docker.sh" "$vps_ip"
    
    # 3. Install Docker Compose
    log_info "Step 3: Installing Docker Compose..."
    run_vps_command "curl -L 'https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-\$(uname -s)-\$(uname -m)' -o /usr/local/bin/docker-compose && chmod +x /usr/local/bin/docker-compose" "$vps_ip"
    
    # 4. Create project directory
    log_info "Step 4: Creating project directory..."
    run_vps_command "mkdir -p $PROJECT_DIR && cd $PROJECT_DIR" "$vps_ip"
    
    # 5. Upload project files (if GitHub repo is provided)
    if [ -n "$GITHUB_REPO_URL" ]; then
        log_info "Step 5: Cloning project from GitHub..."
        run_vps_command "cd $PROJECT_DIR && git clone $GITHUB_REPO_URL ." "$vps_ip"
    else
        log_info "Step 5: Please upload project files manually to $PROJECT_DIR"
    fi
    
    # 6. Create environment file
    log_info "Step 6: Creating production environment file..."
    run_vps_command "cat > $PROJECT_DIR/.env.production << 'EOF'
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
EMAIL_FROM_NAME=MyMeds Pharmacy Inc.

# CORS Configuration
CORS_ORIGIN=https://www.$DOMAIN_NAME,https://$DOMAIN_NAME

# Security Configuration
SESSION_SECRET=Mymeds2025!SessionSecret_PharmacySecure_Production_2025!@#\$%^&*()

# WordPress Integration
WORDPRESS_URL=https://$DOMAIN_NAME/blog
WORDPRESS_USERNAME=mymeds_api_user
WORDPRESS_APP_PASSWORD=X8J0 ICBi 5Ilb PnrX Bhyp r2PE

# WooCommerce Integration
WOOCOMMERCE_STORE_URL=https://$DOMAIN_NAME/shop
WOOCOMMERCE_CONSUMER_KEY=ck_47e02dc770a3824275746e6efd09a01497e3881f
WOOCOMMERCE_CONSUMER_SECRET=cs_9fc99adfd9306f1b02005701f7a1eb4244be2d46
WOOCOMMERCE_WEBHOOK_SECRET=Mymeds2025!WooCommerceWebhookSecret_Production_2025!@#

# Payment Gateway Configuration
STRIPE_SECRET_KEY=sk_live_YourStripeSecretKey123
STRIPE_PUBLISHABLE_KEY=pk_live_YourStripePublishableKey123
STRIPE_WEBHOOK_SECRET=whsec_YourStripeWebhookSecret123
EOF" "$vps_ip"
    
    # 7. Configure firewall
    log_info "Step 7: Configuring firewall..."
    run_vps_command "ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp && ufw --force enable" "$vps_ip"
    
    # 8. Deploy application
    log_info "Step 8: Deploying application..."
    run_vps_command "cd $PROJECT_DIR && docker-compose -f docker-compose.prod.yml down --remove-orphans || true" "$vps_ip"
    run_vps_command "cd $PROJECT_DIR && docker image prune -f || true" "$vps_ip"
    run_vps_command "cd $PROJECT_DIR && docker-compose -f docker-compose.prod.yml build --no-cache" "$vps_ip"
    run_vps_command "cd $PROJECT_DIR && docker-compose -f docker-compose.prod.yml up -d mysql" "$vps_ip"
    run_vps_command "sleep 30" "$vps_ip"
    run_vps_command "cd $PROJECT_DIR && docker-compose -f docker-compose.prod.yml up -d" "$vps_ip"
    run_vps_command "sleep 60" "$vps_ip"
    
    # 9. Run database migrations
    log_info "Step 9: Running database migrations..."
    run_vps_command "cd $PROJECT_DIR && docker-compose -f docker-compose.prod.yml exec mymeds-app npx prisma migrate deploy" "$vps_ip"
    run_vps_command "cd $PROJECT_DIR && docker-compose -f docker-compose.prod.yml exec mymeds-app node init-integrations.js" "$vps_ip"
    
    # 10. Verify deployment
    log_info "Step 10: Verifying deployment..."
    run_vps_command "cd $PROJECT_DIR && docker-compose -f docker-compose.prod.yml ps" "$vps_ip"
    run_vps_command "curl -f http://localhost:4000/api/health" "$vps_ip"
    run_vps_command "curl -f http://localhost:3000" "$vps_ip"
    
    log_success "Deployment completed successfully!"
}

# =============================================================================
# MAIN EXECUTION
# =============================================================================

main() {
    log_info "Starting Hostinger VPS API deployment..."
    
    # Check parameters
    check_parameters
    
    # Get VPS information
    local vps_info=$(get_vps_info)
    log_info "VPS Info: $vps_info"
    
    # Get VPS IP
    local vps_ip=$(get_vps_ip)
    if [ -z "$vps_ip" ]; then
        log_error "Failed to get VPS IP address"
        exit 1
    fi
    
    log_success "VPS IP: $vps_ip"
    
    # Start VPS if not running
    local status=$(get_vps_status)
    if [ "$status" != "running" ]; then
        log_info "Starting VPS..."
        start_vps
        wait_for_vps
    else
        log_success "VPS is already running"
    fi
    
    # Deploy application
    deploy_to_vps "$vps_ip"
    
    # Final status
    log_info "=== DEPLOYMENT SUMMARY ==="
    log_success "VPS IP: $vps_ip"
    log_success "Domain: $DOMAIN_NAME"
    log_success "Project Directory: $PROJECT_DIR"
    log_success "Frontend URL: http://$vps_ip:3000"
    log_success "Backend URL: http://$vps_ip:4000"
    log_success "Health Check: http://$vps_ip:4000/api/health"
    
    log_success "🎉 MyMeds Pharmacy Inc. deployment completed successfully!"
    log_info "Next steps:"
    log_info "1. Configure DNS to point $DOMAIN_NAME to $vps_ip"
    log_info "2. Set up SSL certificates"
    log_info "3. Update environment variables with your actual settings"
    log_info "4. Test all functionality"
    log_info "5. Go live! 🚀"
}

# =============================================================================
# SCRIPT USAGE
# =============================================================================

usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -t, --token TOKEN       Hostinger API token (required)"
    echo "  -v, --vps-id ID         VPS VM ID (required)"
    echo "  -d, --domain DOMAIN     Domain name (required)"
    echo "  -r, --repo URL          GitHub repository URL (optional)"
    echo "  -h, --help              Show this help message"
    echo ""
    echo "Example:"
    echo "  $0 --token YOUR_API_TOKEN --vps-id YOUR_VM_ID --domain yourdomain.com --repo https://github.com/user/repo.git"
    echo ""
    echo "Environment Variables:"
    echo "  HOSTINGER_API_TOKEN     Hostinger API token"
    echo "  VPS_VM_ID              VPS VM ID"
    echo "  DOMAIN_NAME            Domain name"
    echo "  GITHUB_REPO_URL        GitHub repository URL"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--token)
            HOSTINGER_API_TOKEN="$2"
            shift 2
            ;;
        -v|--vps-id)
            VPS_VM_ID="$2"
            shift 2
            ;;
        -d|--domain)
            DOMAIN_NAME="$2"
            shift 2
            ;;
        -r|--repo)
            GITHUB_REPO_URL="$2"
            shift 2
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Run main function
main
