# Simple deployment script for MyMeds VPS
Write-Host "🚀 MyMeds VPS Deployment Script" -ForegroundColor Green

$VpsHost = "root@72.60.116.253"
$VpsPath = "/var/www/mymedspharmacyinc.com"

# Step 1: Create backup
Write-Host "`n💾 Creating backup..." -ForegroundColor Yellow
ssh $VpsHost "mkdir -p /tmp/mymeds-backup-$(date +%Y%m%d-%H%M%S)"
ssh $VpsHost "cp -r $VpsPath/backend/src /tmp/mymeds-backup-$(date +%Y%m%d-%H%M%S)/backend-src-backup"

# Step 2: Deploy backend files
Write-Host "`n🔧 Deploying backend files..." -ForegroundColor Yellow
Write-Host "Uploading WordPress routes..." -ForegroundColor Blue
scp backend/src/routes/wordpress.ts "${VpsHost}:${VpsPath}/backend/src/routes/wordpress.ts"

Write-Host "Uploading WooCommerce routes..." -ForegroundColor Blue
scp backend/src/routes/woocommerce.ts "${VpsHost}:${VpsPath}/backend/src/routes/woocommerce.ts"

Write-Host "Uploading main server file..." -ForegroundColor Blue
scp backend/src/index.ts "${VpsHost}:${VpsPath}/backend/src/index.ts"

# Step 3: Deploy frontend
Write-Host "`n🎨 Deploying frontend..." -ForegroundColor Yellow
ssh $VpsHost "rm -rf $VpsPath/frontend/dist/*"
scp -r dist/* "${VpsHost}:${VpsPath}/frontend/dist/"
ssh $VpsHost "chown -R www-data:www-data $VpsPath/frontend/dist/"

# Step 4: Restart services
Write-Host "`n🔄 Restarting services..." -ForegroundColor Yellow
ssh $VpsHost "pm2 restart mymeds-backend"
Start-Sleep -Seconds 5
ssh $VpsHost "systemctl reload nginx"

# Step 5: Verify
Write-Host "`n✅ Verifying deployment..." -ForegroundColor Yellow
ssh $VpsHost "pm2 list"
ssh $VpsHost "curl -s http://localhost:4000/api/health"

Write-Host "`n🎉 Deployment completed!" -ForegroundColor Green
Write-Host "Test at: https://mymedspharmacyinc.com" -ForegroundColor Cyan
