# MyMeds Complete Application Deployment from Windows PowerShell
# Deploys Frontend + Backend + Database + Everything to VPS KVM1 Hostinger

Write-Host "🚀 MyMeds Complete Application Deployment from Windows" -ForegroundColor Green
Write-Host "This will deploy: Frontend + Backend + Database + Everything!" -ForegroundColor Cyan
Write-Host ""

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

if ([string]::IsNullOrWhiteSpace($VPS_USER)) {
    $VPS_USER = "root"
}

Write-Host ""
Write-Host "📋 Deployment Configuration:" -ForegroundColor Cyan
Write-Host "VPS IP: $VPS_IP" -ForegroundColor White
Write-Host "Username: $VPS_USER" -ForegroundColor White
Write-Host ""

# Confirm deployment
$CONFIRM = Read-Host "Proceed with complete deployment? (y/N)"
if ($CONFIRM -ne "y" -and $CONFIRM -ne "Y") {
    Write-Host "Deployment cancelled." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 0
}

Write-Host ""
Write-Host "🔧 Creating directories on VPS..." -ForegroundColor Blue
ssh "${VPS_USER}@${VPS_IP}" "mkdir -p /var/www/mymeds-backend /var/www/mymeds-frontend"

Write-Host "📤 Uploading backend files..." -ForegroundColor Blue
scp -r backend/dist/* "${VPS_USER}@${VPS_IP}:/var/www/mymeds-backend/"
scp backend/package*.json "${VPS_USER}@${VPS_IP}:/var/www/mymeds-backend/"

Write-Host "📤 Uploading frontend files..." -ForegroundColor Blue
scp -r frontend/dist/* "${VPS_USER}@${VPS_IP}:/var/www/mymeds-frontend/"

Write-Host "📤 Uploading deployment scripts..." -ForegroundColor Blue
scp deploy-everything.sh "${VPS_USER}@${VPS_IP}:/var/www/mymeds-backend/"
scp backend/env.production "${VPS_USER}@${VPS_IP}:/var/www/mymeds-backend/"

Write-Host ""
Write-Host "🚀 Running complete deployment on VPS..." -ForegroundColor Blue
ssh "${VPS_USER}@${VPS_IP}" "cd /var/www/mymeds-backend; chmod +x deploy-everything.sh; ./deploy-everything.sh"

Write-Host ""
Write-Host "✅ Complete deployment finished!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Your application is now running at:" -ForegroundColor Cyan
Write-Host "Frontend: http://$VPS_IP" -ForegroundColor White
Write-Host "Backend API: http://$VPS_IP:4000" -ForegroundColor White
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. SSH into VPS: ssh ${VPS_USER}@${VPS_IP}" -ForegroundColor White
Write-Host "2. Configure environment: cd /var/www/mymeds-backend && nano .env" -ForegroundColor White
Write-Host "3. Update domain names in Nginx configs" -ForegroundColor White
Write-Host "4. Get SSL certificates with Certbot" -ForegroundColor White
Write-Host "5. Test health: ./health-check.sh" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Your complete MyMeds application is deployed!" -ForegroundColor Green

Read-Host "Press Enter to exit"
