# MyMeds Domain Deployment Script
# Domain: mymedspharmacyinc.com
# VPS: Hostinger KVM1 (72.60.116.253)

Write-Host "🚀 MyMeds Pharmacy Inc. - Domain Deployment" -ForegroundColor Green
Write-Host "Domain: mymedspharmacyinc.com" -ForegroundColor Cyan
Write-Host "VPS: 72.60.116.253" -ForegroundColor Cyan
Write-Host ""

# Check if required files exist
$requiredFiles = @(
    "backend/dist",
    "dist",
    "deploy-everything.sh",
    "backend/env.production"
)

Write-Host "📋 Checking required files..." -ForegroundColor Blue
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file - NOT FOUND" -ForegroundColor Red
        Write-Host "Please build the application first:" -ForegroundColor Yellow
        Write-Host "  npm run build (in backend folder)" -ForegroundColor White
        Write-Host "  npm run build (in root folder)" -ForegroundColor White
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host ""
Write-Host "🔧 Starting deployment process..." -ForegroundColor Blue
Write-Host ""

# Step 1: Create directories on VPS
Write-Host "Step 1: Creating directories on VPS..." -ForegroundColor Yellow
Write-Host "When prompted, enter password: Pharm-23-medS" -ForegroundColor Cyan
ssh root@72.60.116.253 "mkdir -p /var/www/mymeds-backend /var/www/mymeds-frontend /var/www/mymeds-shop /var/www/mymeds-blog /var/log/mymeds /var/backups/mymeds"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create directories on VPS" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Directories created successfully" -ForegroundColor Green

# Step 2: Upload backend files
Write-Host ""
Write-Host "Step 2: Uploading backend files..." -ForegroundColor Yellow
Write-Host "When prompted, enter password: Pharm-23-medS" -ForegroundColor Cyan

scp -r backend/dist/* root@72.60.116.253:/var/www/mymeds-backend/
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to upload backend files" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

scp backend/package*.json root@72.60.116.253:/var/www/mymeds-backend/
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to upload package files" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Backend files uploaded successfully" -ForegroundColor Green

# Step 3: Upload frontend files
Write-Host ""
Write-Host "Step 3: Uploading frontend files..." -ForegroundColor Yellow
Write-Host "When prompted, enter password: Pharm-23-medS" -ForegroundColor Cyan

scp -r dist/* root@72.60.116.253:/var/www/mymeds-frontend/
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to upload frontend files" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Frontend files uploaded successfully" -ForegroundColor Green

# Step 4: Upload deployment scripts
Write-Host ""
Write-Host "Step 4: Uploading deployment scripts..." -ForegroundColor Yellow
Write-Host "When prompted, enter password: Pharm-23-medS" -ForegroundColor Cyan

scp deploy-everything.sh root@72.60.116.253:/var/www/mymeds-backend/
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to upload deployment script" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

scp backend/env.production root@72.60.116.253:/var/www/mymeds-backend/
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to upload environment file" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Deployment scripts uploaded successfully" -ForegroundColor Green

# Step 5: Execute deployment on VPS
Write-Host ""
Write-Host "Step 5: Executing deployment on VPS..." -ForegroundColor Yellow
Write-Host "This will take several minutes. Please wait..." -ForegroundColor Cyan
Write-Host "When prompted, enter password: Pharm-23-medS" -ForegroundColor Cyan

ssh root@72.60.116.253 "cd /var/www/mymeds-backend; chmod +x deploy-everything.sh; ./deploy-everything.sh"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed on VPS" -ForegroundColor Red
    Write-Host "Check the VPS logs for more details" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Your MyMeds Pharmacy Inc. application is now running at:" -ForegroundColor Cyan
Write-Host "   Frontend: https://www.mymedspharmacyinc.com" -ForegroundColor White
Write-Host "   Backend API: https://api.mymedspharmacyinc.com" -ForegroundColor White
Write-Host "   WooCommerce Shop: https://shop.mymedspharmacyinc.com" -ForegroundColor White
Write-Host "   WordPress Blog: https://blog.mymedspharmacyinc.com" -ForegroundColor White
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Update DNS records to point to 72.60.116.253" -ForegroundColor White
Write-Host "   2. Wait for DNS propagation (24-48 hours)" -ForegroundColor White
Write-Host "   3. Configure WooCommerce and WordPress" -ForegroundColor White
Write-Host "   4. Test all endpoints" -ForegroundColor White
Write-Host ""
Write-Host "📊 Monitoring:" -ForegroundColor Yellow
Write-Host "   Health Check: ssh root@72.60.116.253 '/var/www/mymeds-backend/health-check.sh'" -ForegroundColor White
Write-Host "   PM2 Status: ssh root@72.60.116.253 'pm2 status'" -ForegroundColor White
Write-Host ""
Write-Host "🚀 MyMeds Pharmacy Inc. is ready for production!" -ForegroundColor Green

Read-Host "Press Enter to exit"

