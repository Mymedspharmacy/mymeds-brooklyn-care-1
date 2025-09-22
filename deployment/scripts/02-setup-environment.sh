#!/bin/bash
# =============================================================================
# ENVIRONMENT SETUP SCRIPT - MyMeds Pharmacy Inc.
# =============================================================================
# Sets up production environment and system dependencies
# =============================================================================

set -e

echo "🔧 MyMeds Pharmacy Inc. - Environment Setup Script"
echo "================================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# =============================================================================
# SYSTEM UPDATE
# =============================================================================
log_info "Updating system packages..."
apt update && apt upgrade -y

log_success "System packages updated"

# =============================================================================
# INSTALL SYSTEM DEPENDENCIES
# =============================================================================
log_info "Installing system dependencies..."

# Essential packages
apt install -y \
    curl \
    wget \
    git \
    unzip \
    htop \
    nano \
    ufw \
    certbot \
    python3-certbot-nginx \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

log_success "System dependencies installed"

# =============================================================================
# DOCKER INSTALLATION
# =============================================================================
log_info "Installing Docker..."

# Remove old Docker installations
apt remove -y docker docker-engine docker.io containerd runc || true

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package index
apt update

# Install Docker Engine
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start and enable Docker
systemctl start docker
systemctl enable docker

# Add current user to docker group
usermod -aG docker $USER

log_success "Docker installed and configured"

# =============================================================================
# DOCKER COMPOSE INSTALLATION
# =============================================================================
log_info "Installing Docker Compose..."

# Download Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make executable
chmod +x /usr/local/bin/docker-compose

# Create symlink
ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

log_success "Docker Compose installed"

# =============================================================================
# VERIFY DOCKER INSTALLATION
# =============================================================================
log_info "Verifying Docker installation..."

# Test Docker
docker --version
docker-compose --version

# Test Docker daemon
docker run hello-world

log_success "Docker verification completed"

# =============================================================================
# FIREWALL SETUP
# =============================================================================
log_info "Setting up firewall..."

# Reset UFW
ufw --force reset

# Default policies
ufw default deny incoming
ufw default allow outgoing

# Allow SSH
ufw allow 22/tcp

# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Allow application ports
ufw allow 3000/tcp  # MyMeds Frontend
ufw allow 4000/tcp  # MyMeds Backend
ufw allow 8080/tcp  # WordPress
ufw allow 3306/tcp  # MySQL (if needed externally)
ufw allow 6379/tcp  # Redis (if needed externally)

# Enable firewall
ufw --force enable

log_success "Firewall configured"

# =============================================================================
# SYSTEM OPTIMIZATION
# =============================================================================
log_info "Applying system optimizations..."

# Increase file limits
cat >> /etc/security/limits.conf << 'EOF'
* soft nofile 65536
* hard nofile 65536
* soft nproc 32768
* hard nproc 32768
EOF

# Optimize kernel parameters
cat >> /etc/sysctl.conf << 'EOF'
# Network optimizations
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 12582912 16777216
net.ipv4.tcp_wmem = 4096 12582912 16777216
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_congestion_control = bbr

# File system optimizations
fs.file-max = 2097152
vm.swappiness = 10
vm.dirty_ratio = 15
vm.dirty_background_ratio = 5
EOF

# Apply sysctl changes
sysctl -p

log_success "System optimizations applied"

# =============================================================================
# CREATE SYSTEM USERS
# =============================================================================
log_info "Creating system users..."

# Create mymeds user for application
useradd -m -s /bin/bash mymeds || true
usermod -aG docker mymeds

# Create directories for mymeds user
mkdir -p /home/mymeds/{uploads,logs,backups}
chown -R mymeds:mymeds /home/mymeds

log_success "System users created"

# =============================================================================
# SETUP LOGGING
# =============================================================================
log_info "Setting up logging..."

# Create logrotate configuration
cat > /etc/logrotate.d/mymeds << 'EOF'
/var/www/mymeds/backend/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        /bin/kill -USR1 $(cat /var/run/nginx.pid 2>/dev/null) 2>/dev/null || true
    endscript
}
EOF

log_success "Logging configured"

# =============================================================================
# SUMMARY
# =============================================================================
echo ""
log_success "🎉 Environment setup completed successfully!"
echo ""
log_info "System Information:"
echo "====================="
echo "OS: $(lsb_release -d | cut -f2)"
echo "Kernel: $(uname -r)"
echo "Docker: $(docker --version)"
echo "Docker Compose: $(docker-compose --version)"
echo "Firewall: $(ufw status | head -1)"
echo ""
log_info "Next steps:"
echo "1. Run: ./deployment/scripts/03-install-dependencies.sh"
echo "2. Run: ./deployment/scripts/04-setup-database.sh"
echo "3. Run: ./deployment/scripts/05-deploy-application.sh"
echo ""
log_info "System is ready for application deployment!"

