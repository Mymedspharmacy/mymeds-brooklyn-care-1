# Deploy Admin User Scripts to VPS
# This script will upload the admin user creation scripts to your VPS

param(
    [string]$VpsIp = "72.60.116.253",
    [string]$VpsUser = "root"
)

Write-Host "🚀 Deploying admin user scripts to VPS..." -ForegroundColor Cyan

# Files to deploy
$filesToDeploy = @(
    "backend/src/ensureAdminUser2.ts",
    "backend/add-admin-user.js",
    "scripts/add-admin-user.sh",
    "docs/add-admin-user-guide.md"
)

Write-Host "📁 Files to deploy:" -ForegroundColor Yellow
foreach ($file in $filesToDeploy) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file (not found)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🔧 Commands to run on VPS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. SSH into VPS:" -ForegroundColor White
Write-Host "   ssh $VpsUser@$VpsIp" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Navigate to project directory:" -ForegroundColor White
Write-Host "   cd /var/www/mymeds-pharmacy" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Pull latest changes:" -ForegroundColor White
Write-Host "   git pull origin latest" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Add environment variables to .env:" -ForegroundColor White
Write-Host "   echo '' >> backend/.env" -ForegroundColor Gray
Write-Host "   echo '# Second Admin User' >> backend/.env" -ForegroundColor Gray
Write-Host "   echo 'ADMIN2_EMAIL=mymedspharmacyinc@gmail.com' >> backend/.env" -ForegroundColor Gray
Write-Host "   echo 'ADMIN2_PASSWORD_HASH=`$2b`$12`$auPmZQBuFSoEiqpK1mTQWu7ItdaRkAQjKgK0xL/X8TDA3iuGEnNFa' >> backend/.env" -ForegroundColor Gray
Write-Host "   echo 'ADMIN2_FIRST_NAME=MyMeds' >> backend/.env" -ForegroundColor Gray
Write-Host "   echo 'ADMIN2_LAST_NAME=Admin' >> backend/.env" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Create the admin user:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   npx ts-node src/ensureAdminUser2.ts" -ForegroundColor Gray
Write-Host ""
Write-Host "6. Restart the backend service:" -ForegroundColor White
Write-Host "   pm2 restart mymeds-backend" -ForegroundColor Gray
Write-Host ""

Write-Host "🎉 Deployment instructions ready!" -ForegroundColor Green
Write-Host "📖 See docs/add-admin-user-guide.md for detailed instructions" -ForegroundColor Yellow
