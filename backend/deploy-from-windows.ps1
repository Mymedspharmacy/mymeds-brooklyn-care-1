# MyMeds Backend Windows PowerShell Deployment Script
# This script deploys your backend to VPS KVM1 Hostinger

Write-Host "🚀 Starting MyMeds Backend Deployment from Windows..." -ForegroundColor Green

# Check if required tools are installed
try {
    $sshPath = Get-Command ssh -ErrorAction Stop
    Write-Host "✅ SSH found at: $($sshPath.Source)" -ForegroundColor Green
} catch {
    Write-Host "❌ SSH not found. Please install OpenSSH or use PuTTY." -ForegroundColor Red
    Write-Host "Download from: https://www.putty.org/" -ForegroundColor Yellow
    Write-Host "Or enable OpenSSH in Windows Features" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Get VPS details from user
$VPS_IP = Read-Host "Enter your VPS IP address"
$VPS_USER = Read-Host "Enter VPS username (usually 'root')"
$VPS_PATH = Read-Host "Enter deployment path (default: /var/www/mymeds-backend)"

if ([string]::IsNullOrWhiteSpace($VPS_PATH)) {
    $VPS_PATH = "/var/www/mymeds-backend"
}

Write-Host ""
Write-Host "📋 Deployment Configuration:" -ForegroundColor Cyan
Write-Host "VPS IP: $VPS_IP" -ForegroundColor White
Write-Host "Username: $VPS_USER" -ForegroundColor White
Write-Host "Path: $VPS_PATH" -ForegroundColor White
Write-Host ""

# Confirm deployment
$CONFIRM = Read-Host "Proceed with deployment? (y/N)"
if ($CONFIRM -ne "y" -and $CONFIRM -ne "Y") {
    Write-Host "Deployment cancelled." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 0
}

Write-Host ""
Write-Host "🔧 Creating deployment directory on VPS..." -ForegroundColor Blue
ssh "${VPS_USER}@${VPS_IP}" "mkdir -p ${VPS_PATH}"

Write-Host "📤 Uploading production build files..." -ForegroundColor Blue
scp -r dist/* "${VPS_USER}@${VPS_IP}:${VPS_PATH}/"

Write-Host "📤 Uploading package files..." -ForegroundColor Blue
scp package*.json "${VPS_USER}@${VPS_IP}:${VPS_PATH}/"

Write-Host "📤 Uploading deployment script..." -ForegroundColor Blue
scp deploy.sh "${VPS_USER}@${VPS_IP}:${VPS_PATH}/"

Write-Host "📤 Uploading environment template..." -ForegroundColor Blue
scp env.production "${VPS_USER}@${VPS_IP}:${VPS_PATH}/"

Write-Host "📤 Uploading verification script..." -ForegroundColor Blue
scp verify-deployment.sh "${VPS_USER}@${VPS_IP}:${VPS_PATH}/"

Write-Host ""
Write-Host "🚀 Executing deployment on VPS..." -ForegroundColor Blue
ssh "${VPS_USER}@${VPS_IP}" "cd ${VPS_PATH} && chmod +x deploy.sh && ./deploy.sh"

Write-Host ""
Write-Host "✅ Deployment completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. SSH into your VPS: ssh ${VPS_USER}@${VPS_IP}" -ForegroundColor White
Write-Host "2. Configure environment: cd ${VPS_PATH} && cp env.production .env && nano .env" -ForegroundColor White
Write-Host "3. Verify deployment: ./verify-deployment.sh" -ForegroundColor White
Write-Host "4. Check status: pm2 status" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Your backend is now deployed!" -ForegroundColor Green

Read-Host "Press Enter to exit"
