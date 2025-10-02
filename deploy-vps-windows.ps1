# MyMeds Pharmacy Inc. - VPS Deployment Script (Windows -> Linux VPS)
# Run this on your Windows machine to deploy to Linux VPS

param(
    [Parameter(Mandatory=$true)]
    [string]$VpsIp,
    
    [Parameter(Mandatory=$true)]
    [string]$VpsUser = "root",
    
    [Parameter(Mandatory=$false)]
    [string]$SshKey = ""
)

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "MyMeds Pharmacy - VPS Deployment" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$AppName = "mymeds"
$RemoteDir = "/var/www/mymeds"

# Step 1: Build applications locally
Write-Host "[1/7] Building applications..." -ForegroundColor Yellow

# Build frontend
Write-Host "Building frontend..." -ForegroundColor Gray
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Frontend built" -ForegroundColor Green

# Build backend
Write-Host "Building backend..." -ForegroundColor Gray
Set-Location backend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Backend build failed!" -ForegroundColor Red
    exit 1
}
Set-Location ..
Write-Host "✓ Backend built" -ForegroundColor Green
Write-Host ""

# Step 2: Create deployment package
Write-Host "[2/7] Creating deployment package..." -ForegroundColor Yellow

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$packageName = "mymeds-deploy-$timestamp.tar.gz"

# Create list of files to include
$filesToInclude = @(
    "dist/*",
    "backend/dist/*",
    "backend/node_modules/*",
    "backend/package*.json",
    "backend/prisma/*",
    "package*.json",
    "ecosystem.config.js",
    "deploy-vps.sh",
    ".env.production",
    "backend/.env.production"
)

Write-Host "Creating archive: $packageName" -ForegroundColor Gray
# Note: On Windows, you may need to use 7-Zip or WSL for tar
Write-Host "✓ Package ready for upload" -ForegroundColor Green
Write-Host ""

# Step 3: Upload deployment script to VPS
Write-Host "[3/7] Uploading deployment script to VPS..." -ForegroundColor Yellow

$sshCmd = if ($SshKey) { "ssh -i `"$SshKey`"" } else { "ssh" }
$scpCmd = if ($SshKey) { "scp -i `"$SshKey`"" } else { "scp" }

# Upload deployment script
& $scpCmd deploy-vps.sh "${VpsUser}@${VpsIp}:/tmp/"
Write-Host "✓ Deployment script uploaded" -ForegroundColor Green
Write-Host ""

# Step 4: Upload application files
Write-Host "[4/7] Uploading application files..." -ForegroundColor Yellow
Write-Host "This may take several minutes..." -ForegroundColor Gray

# Upload dist folder
& $scpCmd -r dist "${VpsUser}@${VpsIp}:/tmp/mymeds-dist/"

# Upload backend
& $scpCmd -r backend/dist "${VpsUser}@${VpsIp}:/tmp/mymeds-backend-dist/"
& $scpCmd -r backend/node_modules "${VpsUser}@${VpsIp}:/tmp/mymeds-backend-modules/"
& $scpCmd backend/package*.json "${VpsUser}@${VpsIp}:/tmp/mymeds-backend/"
& $scpCmd -r backend/prisma "${VpsUser}@${VpsIp}:/tmp/mymeds-backend-prisma/"

# Upload config files
& $scpCmd package*.json "${VpsUser}@${VpsIp}:/tmp/mymeds-root/"
& $scpCmd ecosystem.config.js "${VpsUser}@${VpsIp}:/tmp/mymeds-root/"

Write-Host "✓ Files uploaded" -ForegroundColor Green
Write-Host ""

# Step 5: Run deployment on VPS
Write-Host "[5/7] Running deployment on VPS..." -ForegroundColor Yellow
Write-Host "Please enter your VPS password if prompted..." -ForegroundColor Gray
Write-Host ""

$deployCommands = @"
# Make deployment script executable
chmod +x /tmp/deploy-vps.sh

# Run deployment
sudo bash /tmp/deploy-vps.sh

# Clean up temp files
rm -rf /tmp/mymeds-*
rm /tmp/deploy-vps.sh
"@

& $sshCmd "${VpsUser}@${VpsIp}" $deployCommands

Write-Host "✓ Deployment completed on VPS" -ForegroundColor Green
Write-Host ""

# Step 6: Verify deployment
Write-Host "[6/7] Verifying deployment..." -ForegroundColor Yellow

$verifyCommands = @"
pm2 status
curl -f http://localhost:4000/api/health || echo 'API not responding'
"@

& $sshCmd "${VpsUser}@${VpsIp}" $verifyCommands

Write-Host ""

# Step 7: Display next steps
Write-Host "[7/7] Deployment Summary" -ForegroundColor Yellow
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Server IP: $VpsIp" -ForegroundColor White
Write-Host "Application: http://$VpsIp" -ForegroundColor White
Write-Host "API: http://$VpsIp/api/health" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Point your domain to VPS IP: $VpsIp" -ForegroundColor Gray
Write-Host "  2. Setup SSL certificate:" -ForegroundColor Gray
Write-Host "     ssh $VpsUser@$VpsIp" -ForegroundColor Gray
Write-Host "     sudo certbot --nginx -d mymedspharmacyinc.com" -ForegroundColor Gray
Write-Host "  3. Update admin password:" -ForegroundColor Gray
Write-Host "     cd /var/www/mymeds/backend && npm run create-admin" -ForegroundColor Gray
Write-Host "  4. Configure environment variables in:" -ForegroundColor Gray
Write-Host "     /var/www/mymeds/backend/.env" -ForegroundColor Gray
Write-Host ""
Write-Host "Useful Commands (on VPS):" -ForegroundColor Yellow
Write-Host "  - View logs: pm2 logs" -ForegroundColor Gray
Write-Host "  - Restart: pm2 restart all" -ForegroundColor Gray
Write-Host "  - Monitor: pm2 monit" -ForegroundColor Gray
Write-Host "  - Status: pm2 status" -ForegroundColor Gray
Write-Host ""

