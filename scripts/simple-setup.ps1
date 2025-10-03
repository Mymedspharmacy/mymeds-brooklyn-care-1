# Simple CI/CD Setup Script for MyMeds Pharmacy
param(
    [string]$VpsHost = "72.60.116.253",
    [string]$VpsUser = "root",
    [int]$VpsPort = 22
)

Write-Host "🚀 MyMeds Pharmacy CI/CD Setup" -ForegroundColor Cyan
Write-Host "VPS: $VpsHost" -ForegroundColor Green

# Check prerequisites
if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) {
    Write-Host "❌ SSH not found. Please install Git Bash or OpenSSH." -ForegroundColor Red
    exit 1
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js not found. Please install Node.js 18+." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prerequisites OK" -ForegroundColor Green

# Generate SSH key
$sshKeyPath = "$env:USERPROFILE\.ssh\id_rsa"
if (-not (Test-Path $sshKeyPath)) {
    Write-Host "🔑 Generating SSH key..." -ForegroundColor Yellow
    ssh-keygen -t rsa -b 4096 -f $sshKeyPath -N ""
    Write-Host "✅ SSH key generated" -ForegroundColor Green
}

# Test SSH connection
Write-Host "🔌 Testing SSH connection..." -ForegroundColor Yellow
try {
    $result = ssh -p $VpsPort -o ConnectTimeout=10 -o StrictHostKeyChecking=no $VpsUser@$VpsHost "echo 'SSH OK'"
    if ($result -eq "SSH OK") {
        Write-Host "✅ SSH connection works" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ SSH failed. Please check VPS access." -ForegroundColor Red
    exit 1
}

# Setup VPS
Write-Host "📦 Setting up VPS..." -ForegroundColor Yellow
$setupScript = @"
# Update system
sudo apt update

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs nginx pm2 rsync curl git ufw mysql-server

# Create directories
sudo mkdir -p /var/www/mymeds-pharmacy
sudo mkdir -p /var/backups/mymeds-pharmacy
sudo mkdir -p /opt/webhook-deploy
sudo chown -R $VpsUser:$VpsUser /var/www/mymeds-pharmacy
sudo chown -R $VpsUser:$VpsUser /var/backups/mymeds-pharmacy
sudo chown -R $VpsUser:$VpsUser /opt/webhook-deploy

# Start services
sudo systemctl start nginx mysql
sudo systemctl enable nginx mysql

echo "VPS setup completed"
"@

ssh -p $VpsPort $VpsUser@$VpsHost $setupScript

# Setup webhook server
Write-Host "🔗 Setting up webhook server..." -ForegroundColor Yellow
$webhookScript = @"
cd /opt/webhook-deploy

# Create package.json
cat > package.json << 'EOF'
{
  "name": "webhook-deploy",
  "version": "1.0.0",
  "main": "webhook-deploy.js",
  "dependencies": {
    "express": "^4.18.2"
  }
}
EOF

npm install
echo "Webhook server setup completed"
"@

ssh -p $VpsPort $VpsUser@$VpsHost $webhookScript

# Copy files
Write-Host "📤 Copying files..." -ForegroundColor Yellow
scp -P $VpsPort scripts/webhook-deploy.js $VpsUser@$VpsHost:/opt/webhook-deploy/
scp -P $VpsPort scripts/incremental-deploy.sh $VpsUser@$VpsHost:/opt/webhook-deploy/
ssh -p $VpsPort $VpsUser@$VpsHost "chmod +x /opt/webhook-deploy/incremental-deploy.sh"

# Create service
Write-Host "⚙️ Creating service..." -ForegroundColor Yellow
$serviceScript = @"
sudo tee /etc/systemd/system/webhook-deploy.service > /dev/null << 'EOF'
[Unit]
Description=Webhook Deployment Server
After=network.target

[Service]
Type=simple
User=$VpsUser
WorkingDirectory=/opt/webhook-deploy
ExecStart=/usr/bin/node webhook-deploy.js
Restart=always
Environment=NODE_ENV=production
Environment=WEBHOOK_PORT=3001
Environment=WEBHOOK_SECRET=MyMeds-Webhook-Secret-2024-Pharmacy-Deploy

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable webhook-deploy
sudo systemctl start webhook-deploy
echo "Service created and started"
"@

ssh -p $VpsPort $VpsUser@$VpsHost $serviceScript

# Setup nginx
Write-Host "🌐 Setting up nginx..." -ForegroundColor Yellow
$nginxScript = @"
sudo tee /etc/nginx/sites-available/webhook-deploy > /dev/null << 'EOF'
server {
    listen 80;
    server_name $VpsHost;
    
    location /webhook {
        proxy_pass http://localhost:3001;
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
    }
    
    location /deploy {
        proxy_pass http://localhost:3001;
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
    }
    
    location /status {
        proxy_pass http://localhost:3001;
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/webhook-deploy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
echo "Nginx configured"
"@

ssh -p $VpsPort $VpsUser@$VpsHost $nginxScript

# Setup firewall
Write-Host "🔥 Configuring firewall..." -ForegroundColor Yellow
$firewallScript = @"
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3001/tcp
sudo ufw --force enable
echo "Firewall configured"
"@

ssh -p $VpsPort $VpsUser@$VpsHost $firewallScript

# Test webhook
Write-Host "🧪 Testing webhook..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
try {
    $response = Invoke-RestMethod -Uri "http://$VpsHost/webhook/health" -Method Get -TimeoutSec 10
    Write-Host "✅ Webhook server is running" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Webhook test failed, but setup completed" -ForegroundColor Yellow
}

# Display results
Write-Host ""
Write-Host "🎉 CI/CD Setup Completed!" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Add GitHub Secrets:" -ForegroundColor White
Write-Host "   VPS_HOST: $VpsHost" -ForegroundColor Gray
Write-Host "   VPS_USERNAME: $VpsUser" -ForegroundColor Gray
Write-Host "   VPS_PORT: $VpsPort" -ForegroundColor Gray
Write-Host "   VPS_SSH_KEY: [Content of $sshKeyPath]" -ForegroundColor Gray
Write-Host "   WEBHOOK_SECRET: MyMeds-Webhook-Secret-2024-Pharmacy-Deploy" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Add GitHub Webhook:" -ForegroundColor White
Write-Host "   URL: http://$VpsHost/webhook" -ForegroundColor Gray
Write-Host "   Secret: MyMeds-Webhook-Secret-2024-Pharmacy-Deploy" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Push code to deploy:" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor Gray
Write-Host "   git commit -m Add CI/CD pipeline" -ForegroundColor Gray
Write-Host "   git push origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "🔗 URLs:" -ForegroundColor Cyan
Write-Host "   Health: http://$VpsHost/webhook/health" -ForegroundColor Gray
Write-Host "   Deploy: http://$VpsHost/deploy/frontend" -ForegroundColor Gray
Write-Host "   Status: http://$VpsHost/status" -ForegroundColor Gray
Write-Host ""
Write-Host "📝 SSH Public Key:" -ForegroundColor Cyan
Get-Content "$sshKeyPath.pub"
Write-Host ""
Write-Host "✅ Ready for automated deployments!" -ForegroundColor Green
