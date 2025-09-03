# MyMeds Pharmacy Production Deployment
param(
    [Parameter(Mandatory=$true)]
    [string]$VPS_IP,
    
    [Parameter(Mandatory=$false)]
    [string]$VPS_USER = "root"
)

Write-Host "🚀 Starting MyMeds Pharmacy Production Deployment..." -ForegroundColor Green

# Test SSH connection
Write-Host "Testing SSH connection..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 $VPS_USER@$VPS_IP "echo 'SSH connection successful'"

# Clean previous deployment
Write-Host "Cleaning previous deployment..." -ForegroundColor Yellow
ssh $VPS_USER@$VPS_IP "pm2 stop all"
ssh $VPS_USER@$VPS_IP "pm2 delete all"
ssh $VPS_USER@$VPS_IP "rm -rf /var/www/mymeds"
ssh $VPS_USER@$VPS_IP "rm -rf /tmp/mymeds-deploy"

# Create directories
Write-Host "Creating deployment directories..." -ForegroundColor Yellow
ssh $VPS_USER@$VPS_IP "mkdir -p /var/www/mymeds/backend"
ssh $VPS_USER@$VPS_IP "mkdir -p /var/backups/mymeds"
ssh $VPS_USER@$VPS_IP "mkdir -p /var/log/mymeds"

# Build applications
Write-Host "Building frontend..." -ForegroundColor Yellow
npm run build

Write-Host "Building backend..." -ForegroundColor Yellow
Set-Location backend
npm run build
Set-Location ..

# Copy files to VPS
Write-Host "Copying files to VPS..." -ForegroundColor Yellow
ssh $VPS_USER@$VPS_IP "mkdir -p /tmp/mymeds-deploy/frontend"
ssh $VPS_USER@$VPS_IP "mkdir -p /tmp/mymeds-deploy/backend"
scp -r dist/* ${VPS_USER}@${VPS_IP}:/tmp/mymeds-deploy/frontend/
scp -r backend/dist/* ${VPS_USER}@${VPS_IP}:/tmp/mymeds-deploy/backend/
scp -r backend/prisma ${VPS_USER}@${VPS_IP}:/tmp/mymeds-deploy/backend/
scp backend/package.json ${VPS_USER}@${VPS_IP}:/tmp/mymeds-deploy/backend/

# Copy environment files
Write-Host "Copying environment files..." -ForegroundColor Yellow
scp backend/env.production ${VPS_USER}@${VPS_IP}:/tmp/mymeds-deploy/backend/.env
scp env.production ${VPS_USER}@${VPS_IP}:/tmp/mymeds-deploy/.env

# Move files to deployment directory
Write-Host "Moving files to deployment directory..." -ForegroundColor Yellow
ssh $VPS_USER@$VPS_IP "cp -r /tmp/mymeds-deploy/* /var/www/mymeds/"

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
ssh $VPS_USER@$VPS_IP "cd /var/www/mymeds/backend && npm ci --production"

# Setup database
Write-Host "Setting up database..." -ForegroundColor Yellow
ssh $VPS_USER@$VPS_IP "mysql -e 'CREATE DATABASE IF NOT EXISTS mymeds_production;'"
ssh $VPS_USER@$VPS_IP "mysql -e \"CREATE USER IF NOT EXISTS 'mymeds_user'@'localhost' IDENTIFIED BY 'mymeds_secure_password_2024';\""
ssh $VPS_USER@$VPS_IP "mysql -e \"GRANT ALL PRIVILEGES ON mymeds_production.* TO 'mymeds_user'@'localhost';\""
ssh $VPS_USER@$VPS_IP "mysql -e 'FLUSH PRIVILEGES;'"

# Run database migrations
Write-Host "Running database migrations..." -ForegroundColor Yellow
ssh $VPS_USER@$VPS_IP "cd /var/www/mymeds/backend && npx prisma generate"
ssh $VPS_USER@$VPS_IP "cd /var/www/mymeds/backend && npx prisma migrate deploy"

# Create PM2 ecosystem file
Write-Host "Creating PM2 configuration..." -ForegroundColor Yellow
$pm2Config = "module.exports = {`n  apps: [{`n    name: 'mymeds-backend',`n    script: '/var/www/mymeds/backend/dist/index.js',`n    instances: 1,`n    autorestart: true,`n    watch: false,`n    max_memory_restart: '1G',`n    env: {`n      NODE_ENV: 'production',`n      PORT: 4000`n    },`n    error_file: '/var/log/mymeds/pm2-error.log',`n    out_file: '/var/log/mymeds/pm2-out.log',`n    log_file: '/var/log/mymeds/pm2-combined.log'`n  }]`n};"

$pm2Config | Out-File -FilePath "ecosystem.config.js" -Encoding UTF8
scp ecosystem.config.js ${VPS_USER}@${VPS_IP}:/var/www/mymeds/
Remove-Item ecosystem.config.js

# Start PM2 process
Write-Host "Starting PM2 process..." -ForegroundColor Yellow
ssh $VPS_USER@$VPS_IP "cd /var/www/mymeds && pm2 start ecosystem.config.js"
ssh $VPS_USER@$VPS_IP "pm2 save"
ssh $VPS_USER@$VPS_IP "pm2 startup"

# Configure Nginx
Write-Host "Configuring Nginx..." -ForegroundColor Yellow
$nginxConfig = "server {`n    listen 80;`n    server_name mymedspharmacyinc.com;`n    root /var/www/mymeds/frontend;`n    index index.html;`n`n    location / {`n        try_files `$uri `$uri/ /index.html;`n    }`n`n    location /api {`n        proxy_pass http://localhost:4000;`n        proxy_http_version 1.1;`n        proxy_set_header Upgrade `$http_upgrade;`n        proxy_set_header Connection 'upgrade';`n        proxy_set_header Host `$host;`n        proxy_set_header X-Real-IP `$remote_addr;`n        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;`n        proxy_set_header X-Forwarded-Proto `$scheme;`n        proxy_cache_bypass `$http_upgrade;`n    }`n}"

$nginxConfig | Out-File -FilePath "mymeds.conf" -Encoding UTF8
scp mymeds.conf ${VPS_USER}@${VPS_IP}:/etc/nginx/sites-available/mymeds
Remove-Item mymeds.conf

# Enable site
ssh $VPS_USER@$VPS_IP "ln -sf /etc/nginx/sites-available/mymeds /etc/nginx/sites-enabled/"
ssh $VPS_USER@$VPS_IP "rm -f /etc/nginx/sites-enabled/default"
ssh $VPS_USER@$VPS_IP "nginx -t"
ssh $VPS_USER@$VPS_IP "systemctl reload nginx"

# Setup SSL certificate
Write-Host "Setting up SSL certificate..." -ForegroundColor Yellow
ssh $VPS_USER@$VPS_IP "certbot --nginx -d mymedspharmacyinc.com --email mymedspharmacyinc@gmail.com --agree-tos --non-interactive"

# Set permissions
Write-Host "Setting permissions..." -ForegroundColor Yellow
ssh $VPS_USER@$VPS_IP "chown -R www-data:www-data /var/www/mymeds"
ssh $VPS_USER@$VPS_IP "chmod -R 755 /var/www/mymeds"
ssh $VPS_USER@$VPS_IP "chmod 600 /var/www/mymeds/backend/.env"

# Health check
Write-Host "Performing health check..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
ssh $VPS_USER@$VPS_IP "curl -f http://localhost:4000/api/health"

# Cleanup
Write-Host "Cleaning up temporary files..." -ForegroundColor Yellow
ssh $VPS_USER@$VPS_IP "rm -rf /tmp/mymeds-deploy"

# Display summary
Write-Host "=== DEPLOYMENT SUMMARY ===" -ForegroundColor Green
Write-Host "VPS IP: $VPS_IP" -ForegroundColor Cyan
Write-Host "Production URL: https://mymedspharmacyinc.com" -ForegroundColor Cyan
Write-Host "Admin Panel: https://mymedspharmacyinc.com/admin" -ForegroundColor Cyan
Write-Host "Patient Portal: https://mymedspharmacyinc.com/patient" -ForegroundColor Cyan

Write-Host "🎉 MyMeds Pharmacy deployment completed successfully!" -ForegroundColor Green
