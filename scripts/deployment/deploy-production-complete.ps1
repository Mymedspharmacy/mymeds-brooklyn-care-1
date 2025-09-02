# 🏥 MyMeds Pharmacy - Complete Production Deployment Script (PowerShell)
# This script deploys the entire MyMeds Pharmacy system to production on a VPS
# From initial setup to final deployment - everything from A to Z

param(
    [Parameter(Mandatory=$true)]
    [string]$VPS_IP,
    
    [Parameter(Mandatory=$true)]
    [string]$DOMAIN,
    
    [Parameter(Mandatory=$true)]
    [string]$SSL_EMAIL,
    
    [Parameter(Mandatory=$false)]
    [string]$VPS_USER = "root",
    
    [Parameter(Mandatory=$false)]
    [string]$SSH_KEY_PATH = "$env:USERPROFILE\.ssh\id_rsa"
)

# Configuration
$BACKUP_DIR = "/var/backups/mymeds"
$DEPLOY_DIR = "/var/www/mymeds"


# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"


# Logging function
function Write-Log {
    param([string]$Message, [string]$Color = $Green)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    Write-Host $logMessage -ForegroundColor $Color
    # Note: In PowerShell, we can't easily append to remote log files
    # This would need to be handled differently in a real deployment
}

function Write-Error {
    param([string]$Message)
    Write-Log "[ERROR] $Message" $Red
    exit 1
}

function Write-Warning {
    param([string]$Message)
    Write-Log "[WARNING] $Message" $Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Log "[INFO] $Message" $Blue
}

# Validate configuration
function Test-Configuration {
    if ([string]::IsNullOrEmpty($VPS_IP)) {
        Write-Error "VPS_IP is not set. Please set the VPS IP address."
    }
    
    if ([string]::IsNullOrEmpty($DOMAIN)) {
        Write-Error "DOMAIN is not set. Please set the domain name."
    }
    
    if ([string]::IsNullOrEmpty($SSL_EMAIL)) {
        Write-Error "SSL_EMAIL is not set. Please set the email for SSL certificates."
    }
    
    if (!(Test-Path $SSH_KEY_PATH)) {
        Write-Error "SSH key not found at $SSH_KEY_PATH. Please ensure your SSH key is available."
    }
    
    Write-Log "Configuration validation passed"
}

# Execute remote command
function Invoke-RemoteCommand {
    param([string]$Command, [string]$Description = "")
    
    if ($Description) {
        Write-Log "Executing: $Description"
    }
    
    try {
        $sshCommand = "ssh -i `"$SSH_KEY_PATH`" -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP `"$Command`""
        $result = Invoke-Expression $sshCommand 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Command failed: $Command"
            Write-Error "Output: $result"
        }
        
        return $result
    }
    catch {
        Write-Error "SSH command failed: $($_.Exception.Message)"
    }
}

# Copy files to VPS
function Copy-ToVPS {
    param([string]$LocalPath, [string]$RemotePath, [string]$Description = "")
    
    if ($Description) {
        Write-Log "Copying: $Description"
    }
    
    try {
        $scpCommand = "scp -i `"$SSH_KEY_PATH`" -o StrictHostKeyChecking=no -r `"$LocalPath`" $VPS_USER@$VPS_IP`:$RemotePath`""
        Invoke-Expression $scpCommand
        
        if ($LASTEXITCODE -ne 0) {
            Write-Error "File copy failed: $LocalPath to $RemotePath"
        }
    }
    catch {
        Write-Error "SCP command failed: $($_.Exception.Message)"
    }
}

# Main deployment function
function Start-Deployment {
    Write-Log "Starting MyMeds Pharmacy production deployment..."
    
    # Validate configuration
    Test-Configuration
    
    # Test SSH connection
    Write-Log "Testing SSH connection to VPS..."
    $testResult = Invoke-RemoteCommand "echo 'SSH connection successful'" "Testing SSH connection"
    if ($testResult -notlike "*SSH connection successful*") {
        Write-Error "SSH connection failed. Please check your VPS IP and SSH key."
    }
    
    # Update system
    Write-Log "Updating system packages..."
    Invoke-RemoteCommand "apt update -y && apt upgrade -y" "Updating system packages"
    Invoke-RemoteCommand "apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release" "Installing essential packages"
    
    # Setup firewall
    Write-Log "Setting up firewall..."
    Invoke-RemoteCommand "apt install -y ufw" "Installing UFW"
    Invoke-RemoteCommand "ufw default deny incoming" "Setting UFW default policies"
    Invoke-RemoteCommand "ufw default allow outgoing" "Setting UFW default policies"
    Invoke-RemoteCommand "ufw allow ssh" "Allowing SSH"
    Invoke-RemoteCommand "ufw allow 80" "Allowing HTTP"
    Invoke-RemoteCommand "ufw allow 443" "Allowing HTTPS"
    Invoke-RemoteCommand "ufw allow 4000" "Allowing Node.js backend port"
    Invoke-RemoteCommand "ufw --force enable" "Enabling firewall"
    
    # Install Node.js
    Write-Log "Installing Node.js and npm..."
    Invoke-RemoteCommand "apt remove -y nodejs npm" "Removing existing Node.js"
    Invoke-RemoteCommand "curl -fsSL https://deb.nodesource.com/setup_18.x | bash -" "Adding NodeSource repository"
    Invoke-RemoteCommand "apt install -y nodejs" "Installing Node.js"
    Invoke-RemoteCommand "npm install -g pm2" "Installing PM2"
    
    # Install Nginx
    Write-Log "Installing and configuring Nginx..."
    Invoke-RemoteCommand "apt install -y nginx" "Installing Nginx"
    
    # Create Nginx configuration
    $nginxConfig = @"
server {
    listen 80;
    server_name _;
    
    # Frontend
    location / {
        root /var/www/mymeds/dist;
        try_files `$uri `$uri/ /index.html;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade `$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
        proxy_cache_bypass `$http_upgrade;
    }
    
    # Security
    location ~ /\. {
        deny all;
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
}
"@
    
    Invoke-RemoteCommand "echo '$nginxConfig' > /etc/nginx/sites-available/mymeds" "Creating Nginx configuration"
    Invoke-RemoteCommand "ln -sf /etc/nginx/sites-available/mymeds /etc/nginx/sites-enabled/" "Enabling Nginx site"
    Invoke-RemoteCommand "rm -f /etc/nginx/sites-enabled/default" "Removing default Nginx site"
    Invoke-RemoteCommand "nginx -t" "Testing Nginx configuration"
    Invoke-RemoteCommand "systemctl restart nginx" "Restarting Nginx"
    Invoke-RemoteCommand "systemctl enable nginx" "Enabling Nginx"
    
    # Install SSL certificates
    Write-Log "Installing SSL certificates..."
    Invoke-RemoteCommand "apt install -y certbot python3-certbot-nginx" "Installing Certbot"
    Invoke-RemoteCommand "certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $SSL_EMAIL" "Getting SSL certificate"
    Invoke-RemoteCommand "echo '0 12 * * * /usr/bin/certbot renew --quiet' | crontab -" "Setting up SSL auto-renewal"
    
    # Install MySQL
    Write-Log "Installing and configuring MySQL..."
    Invoke-RemoteCommand "apt install -y mysql-server" "Installing MySQL"
    
    # Secure MySQL (this would need to be interactive in real deployment)
    Invoke-RemoteCommand "mysql -e \"CREATE DATABASE IF NOT EXISTS mymeds_production;\"" "Creating database"
    Invoke-RemoteCommand "mysql -e `"CREATE USER IF NOT EXISTS 'mymeds_user'@'localhost' IDENTIFIED BY 'mymeds_secure_password_2024';`"" "Creating database user"
    Invoke-RemoteCommand "mysql -e `"GRANT ALL PRIVILEGES ON mymeds_production.* TO 'mymeds_user'@'localhost';`"" "Granting database privileges"
    Invoke-RemoteCommand "mysql -e \"FLUSH PRIVILEGES;\"" "Flushing privileges"
    
    # Install Redis
    Write-Log "Installing Redis..."
    Invoke-RemoteCommand "apt install -y redis-server" "Installing Redis"
    Invoke-RemoteCommand "systemctl restart redis-server" "Restarting Redis"
    Invoke-RemoteCommand "systemctl enable redis-server" "Enabling Redis"
    
    # Create directories
    Write-Log "Creating deployment directories..."
    Invoke-RemoteCommand "mkdir -p $DEPLOY_DIR $BACKUP_DIR /var/log/mymeds /var/www/mymeds/uploads /var/www/mymeds/backups" "Creating directories"
    Invoke-RemoteCommand "chown -R www-data:www-data $DEPLOY_DIR" "Setting directory permissions"
    Invoke-RemoteCommand "chmod -R 755 $DEPLOY_DIR" "Setting directory permissions"
    
    # Copy application files
    Write-Log "Copying application files..."
    Copy-ToVPS ".\" "$DEPLOY_DIR" "Copying application files"
    
    # Build frontend
    Write-Log "Building frontend..."
    Invoke-RemoteCommand "cd $DEPLOY_DIR && npm install" "Installing frontend dependencies"
    Invoke-RemoteCommand "cd $DEPLOY_DIR && npm run build" "Building frontend"
    
    # Setup backend
    Write-Log "Setting up backend..."
    Invoke-RemoteCommand "cd $DEPLOY_DIR/backend && npm install" "Installing backend dependencies"
    Invoke-RemoteCommand "cd $DEPLOY_DIR/backend && npx prisma migrate deploy" "Running database migrations"
    Invoke-RemoteCommand "cd $DEPLOY_DIR/backend && npx prisma generate" "Generating Prisma client"
    
    # Setup PM2
    Write-Log "Setting up PM2 process manager..."
    $pm2Config = @"
module.exports = {
  apps: [{
    name: 'mymeds-backend',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    error_file: '/var/log/mymeds/pm2-error.log',
    out_file: '/var/log/mymeds/pm2-out.log',
    log_file: '/var/log/mymeds/pm2-combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 4000,
    exp_backoff_restart_delay: 100,
    kill_timeout: 5000,
    listen_timeout: 8000,
    shutdown_with_message: true,
    wait_ready: true,
    listen_timeout: 10000,
    kill_timeout: 5000
  }]
};
"@
    
    Invoke-RemoteCommand "cd $DEPLOY_DIR/backend && echo '$pm2Config' > ecosystem.config.js" "Creating PM2 configuration"
    Invoke-RemoteCommand "cd $DEPLOY_DIR/backend && pm2 start ecosystem.config.js --env production" "Starting application with PM2"
    Invoke-RemoteCommand "pm2 save" "Saving PM2 configuration"
    Invoke-RemoteCommand "pm2 startup" "Setting up PM2 startup"
    
    # Setup monitoring
    Write-Log "Setting up monitoring and logging..."
    Invoke-RemoteCommand "echo '*/5 * * * * /usr/local/bin/mymeds-monitor.sh' | crontab -" "Setting up monitoring cron job"
    
    # Setup backup
    Write-Log "Setting up backup system..."
    Invoke-RemoteCommand "echo '0 2 * * * /usr/local/bin/mymeds-backup.sh' | crontab -" "Setting up backup cron job"
    
    # Setup security
    Write-Log "Setting up security measures..."
    Invoke-RemoteCommand "apt install -y fail2ban" "Installing fail2ban"
    Invoke-RemoteCommand "systemctl restart fail2ban" "Restarting fail2ban"
    Invoke-RemoteCommand "systemctl enable fail2ban" "Enabling fail2ban"
    
    # Final configuration
    Write-Log "Performing final configuration..."
    Invoke-RemoteCommand "systemctl restart nginx" "Restarting Nginx"
    Invoke-RemoteCommand "systemctl restart mysql" "Restarting MySQL"
    Invoke-RemoteCommand "chown -R www-data:www-data /var/www/mymeds" "Setting final permissions"
    Invoke-RemoteCommand "chmod -R 755 /var/www/mymeds" "Setting final permissions"
    Invoke-RemoteCommand "chmod -R 644 /var/www/mymeds/dist" "Setting final permissions"
    
    # Health check
    Write-Log "Performing health check..."
    $healthChecks = @(
        "systemctl is-active --quiet nginx",
        "systemctl is-active --quiet mysql",
        "systemctl is-active --quiet redis-server",
        "pm2 list | grep -q 'mymeds-backend.*online'"
    )
    
    foreach ($check in $healthChecks) {
        Invoke-RemoteCommand $check | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Log "✓ Service check passed"
        } else {
            Write-Warning "✗ Service check failed: $check"
        }
    }
    
    # Display deployment summary
    Write-Log "=== DEPLOYMENT SUMMARY ==="
    Write-Log "Domain: $DOMAIN"
    Write-Log "Backend URL: https://$DOMAIN/api"
    Write-Log "Frontend URL: https://$DOMAIN"
    Write-Log "Admin Panel: https://$DOMAIN/admin"
    Write-Log "Backup Directory: $BACKUP_DIR"
    Write-Log "Log Directory: /var/log/mymeds"
    Write-Log "Deployment Directory: $DEPLOY_DIR"
    
    Write-Log ""
    Write-Log "=== IMPORTANT INFORMATION ==="
    Write-Log "1. Update environment variables in .env.production files"
    Write-Log "2. Configure your domain DNS to point to $VPS_IP"
    Write-Log "3. Set up monitoring alerts"
    Write-Log "4. Test all functionality"
    Write-Log "5. Set up regular backups"
    
    Write-Log ""
    Write-Log "=== USEFUL COMMANDS ==="
    Write-Log "View logs: ssh $VPS_USER@$VPS_IP 'tail -f /var/log/mymeds/backend.log'"
    Write-Log "PM2 status: ssh $VPS_USER@$VPS_IP 'pm2 status'"
    Write-Log "Restart backend: ssh $VPS_USER@$VPS_IP 'pm2 restart mymeds-backend'"
    Write-Log "View Nginx logs: ssh $VPS_USER@$VPS_IP 'tail -f /var/log/nginx/access.log'"
    
    Write-Log ""
    Write-Log "=== SECURITY REMINDERS ==="
    Write-Log "1. Change default passwords"
    Write-Log "2. Keep system updated"
    Write-Log "3. Monitor logs regularly"
    Write-Log "4. Test backups"
    Write-Log "5. Review firewall rules"
    
    Write-Log "🎉 MyMeds Pharmacy production deployment completed successfully!"
    Write-Log "Your application is now live at https://$DOMAIN"
}

# Run deployment
Start-Deployment

