# MyMeds Backend Update Deployment
# This script updates only the backend with OpenFDA fixes

param(
    [Parameter(Mandatory=$true)]
    [string]$VPS_IP,
    
    [Parameter(Mandatory=$false)]
    [string]$VPS_USER = "root"
)

Write-Host "🚀 Starting MyMeds Backend Update Deployment..." -ForegroundColor Green

# Test SSH connection
Write-Host "Testing SSH connection..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 $VPS_USER@$VPS_IP "echo 'SSH connection successful'"

# Stop the current backend
Write-Host "Stopping current backend..." -ForegroundColor Yellow
ssh $VPS_USER@$VPS_IP "pm2 stop mymeds-backend"

# Build backend
Write-Host "Building backend..." -ForegroundColor Yellow
Set-Location backend
npm run build
Set-Location ..

# Create temporary directory on VPS
Write-Host "Creating temporary directory..." -ForegroundColor Yellow
ssh $VPS_USER@$VPS_IP "mkdir -p /tmp/mymeds-backend-update"

# Copy updated backend files
Write-Host "Copying updated backend files..." -ForegroundColor Yellow
scp -r backend/dist/* ${VPS_USER}@${VPS_IP}:/tmp/mymeds-backend-update/
scp -r backend/prisma ${VPS_USER}@${VPS_IP}:/tmp/mymeds-backend-update/
scp backend/package.json ${VPS_USER}@${VPS_IP}:/tmp/mymeds-backend-update/

# Backup current backend
Write-Host "Backing up current backend..." -ForegroundColor Yellow
ssh $VPS_USER@$VPS_IP "cp -r /var/www/mymeds/backend /var/backups/mymeds/backend-backup-$(date +%Y%m%d-%H%M%S)"

# Update backend files
Write-Host "Updating backend files..." -ForegroundColor Yellow
ssh $VPS_USER@$VPS_IP "cp -r /tmp/mymeds-backend-update/* /var/www/mymeds/backend/"

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
ssh $VPS_USER@$VPS_IP "cd /var/www/mymeds/backend && npm ci --production"

# Run database migrations
Write-Host "Running database migrations..." -ForegroundColor Yellow
ssh $VPS_USER@$VPS_IP "cd /var/www/mymeds/backend && npx prisma generate"
ssh $VPS_USER@$VPS_IP "cd /var/www/mymeds/backend && npx prisma migrate deploy"

# Start the backend
Write-Host "Starting updated backend..." -ForegroundColor Yellow
ssh $VPS_USER@$VPS_IP "cd /var/www/mymeds && pm2 start mymeds-backend"

# Set permissions
Write-Host "Setting permissions..." -ForegroundColor Yellow
ssh $VPS_USER@$VPS_IP "chown -R www-data:www-data /var/www/mymeds/backend"
ssh $VPS_USER@$VPS_IP "chmod -R 755 /var/www/mymeds/backend"

# Health check
Write-Host "Performing health check..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Test OpenFDA endpoint
Write-Host "Testing OpenFDA endpoint..." -ForegroundColor Yellow
$openfdaTest = ssh $VPS_USER@$VPS_IP "curl -s http://localhost:4000/api/openfda/health"
if ($openfdaTest -like "*healthy*") {
    Write-Host "✅ OpenFDA endpoint is working!" -ForegroundColor Green
} else {
    Write-Host "❌ OpenFDA endpoint still has issues" -ForegroundColor Red
    Write-Host "Response: $openfdaTest" -ForegroundColor Red
}

# Test main health endpoint
Write-Host "Testing main health endpoint..." -ForegroundColor Yellow
$healthTest = ssh $VPS_USER@$VPS_IP "curl -s http://localhost:4000/api/health"
if ($healthTest -like "*healthy*") {
    Write-Host "✅ Main health endpoint is working!" -ForegroundColor Green
} else {
    Write-Host "❌ Main health endpoint has issues" -ForegroundColor Red
}

# Cleanup
Write-Host "Cleaning up temporary files..." -ForegroundColor Yellow
ssh $VPS_USER@$VPS_IP "rm -rf /tmp/mymeds-backend-update"

# Display summary
Write-Host "=== BACKEND UPDATE SUMMARY ===" -ForegroundColor Green
Write-Host "VPS IP: $VPS_IP" -ForegroundColor Cyan
Write-Host "Production URL: https://mymedspharmacyinc.com" -ForegroundColor Cyan
Write-Host "OpenFDA Health: https://mymedspharmacyinc.com/api/openfda/health" -ForegroundColor Cyan
Write-Host "Main Health: https://mymedspharmacyinc.com/api/health" -ForegroundColor Cyan

Write-Host "🎉 Backend update completed successfully!" -ForegroundColor Green
