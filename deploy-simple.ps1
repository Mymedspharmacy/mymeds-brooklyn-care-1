# Simple MyMeds Deployment Script
# Uses known VPS credentials

Write-Host "🚀 Deploying MyMeds to VPS KVM1 Hostinger..." -ForegroundColor Green
Write-Host "VPS IP: 72.60.116.253" -ForegroundColor Cyan
Write-Host "Username: root" -ForegroundColor Cyan
Write-Host ""

# Function to create SSH key file for passwordless auth
function Setup-SSHKey {
    Write-Host "🔑 Setting up SSH key for passwordless authentication..." -ForegroundColor Blue
    
    # Create .ssh directory if it doesn't exist
    $sshDir = "$env:USERPROFILE\.ssh"
    if (!(Test-Path $sshDir)) {
        New-Item -ItemType Directory -Path $sshDir -Force
    }
    
    # Generate SSH key if it doesn't exist
    $keyPath = "$sshDir\id_rsa"
    if (!(Test-Path $keyPath)) {
        Write-Host "Generating new SSH key..." -ForegroundColor Yellow
        ssh-keygen -t rsa -b 4096 -f $keyPath -N '""'
    }
    
    # Copy public key to VPS
    Write-Host "Copying SSH key to VPS..." -ForegroundColor Yellow
    $pubKey = Get-Content "$keyPath.pub"
    
    # Use expect-like approach with PowerShell
    $sshCommand = "ssh root@72.60.116.253 'mkdir -p ~/.ssh && echo $pubKey >> ~/.ssh/authorized_keys && chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys'"
    
    Write-Host "Setting up SSH key on VPS..." -ForegroundColor Blue
    Write-Host "When prompted, enter password: Pharm-23-medS" -ForegroundColor Yellow
    
    # This will prompt for password once
    Invoke-Expression $sshCommand
}

# Setup SSH key first
Setup-SSHKey

Write-Host ""
Write-Host "📤 Starting file upload..." -ForegroundColor Blue

# Create directories
Write-Host "🔧 Creating directories on VPS..." -ForegroundColor Blue
ssh root@72.60.116.253 "mkdir -p /var/www/mymeds-backend /var/www/mymeds-frontend"

# Upload backend files
Write-Host "📤 Uploading backend files..." -ForegroundColor Blue
scp -r backend/dist/* root@72.60.116.253:/var/www/mymeds-backend/
scp backend/package*.json root@72.60.116.253:/var/www/mymeds-backend/

# Upload frontend files
Write-Host "📤 Uploading frontend files..." -ForegroundColor Blue
scp -r dist/* root@72.60.116.253:/var/www/mymeds-frontend/

# Upload deployment scripts
Write-Host "📤 Uploading deployment scripts..." -ForegroundColor Blue
scp deploy-everything.sh root@72.60.116.253:/var/www/mymeds-backend/
scp backend/env.production root@72.60.116.253:/var/www/mymeds-backend/

Write-Host ""
Write-Host "🚀 Running deployment on VPS..." -ForegroundColor Blue
ssh root@72.60.116.253 "cd /var/www/mymeds-backend; chmod +x deploy-everything.sh; ./deploy-everything.sh"

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "🌐 Your app is now running at:" -ForegroundColor Cyan
Write-Host "Frontend: http://72.60.116.253" -ForegroundColor White
Write-Host "Backend: http://72.60.116.253:4000" -ForegroundColor White

Read-Host "Press Enter to exit"
