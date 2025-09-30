# =============================================================================
# VPS DEPLOYMENT SCRIPT - MyMeds Pharmacy (PowerShell)
# =============================================================================
# This script updates the VPS server with the latest changes
# =============================================================================

# VPS Configuration
$VPS_HOST = "mymedspharmacyinc.com"
$VPS_USER = "root"
$VPS_PATH = "/var/www/mymeds"
$BACKUP_PATH = "/var/backups/mymeds"

Write-Host "🚀 Starting VPS deployment for MyMeds Pharmacy..." -ForegroundColor Blue

# Function to run commands on VPS
function Invoke-VPSCommand {
    param([string]$Command)
    Write-Host "📡 Running on VPS: $Command" -ForegroundColor Blue
    ssh $VPS_USER@$VPS_HOST $Command
}

# Function to copy files to VPS
function Copy-ToVPS {
    param([string]$Source, [string]$Destination)
    Write-Host "📁 Copying to VPS: $Source" -ForegroundColor Blue
    scp -r $Source "${VPS_USER}@${VPS_HOST}:${Destination}"
}

Write-Host "📋 Deployment Steps:" -ForegroundColor Blue
Write-Host "1. Create backup of current deployment"
Write-Host "2. Pull latest code from Git"
Write-Host "3. Update backend dependencies and build"
Write-Host "4. Update frontend build"
Write-Host "5. Update environment variables"
Write-Host "6. Update Prisma schema"
Write-Host "7. Restart services"
Write-Host "8. Test deployment"

# Step 1: Create backup
Write-Host "`n📦 Step 1: Creating backup..." -ForegroundColor Blue
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
Invoke-VPSCommand "mkdir -p $BACKUP_PATH/$timestamp"
Invoke-VPSCommand "cp -r $VPS_PATH $BACKUP_PATH/$timestamp/"
Write-Host "✅ Backup created" -ForegroundColor Green

# Step 2: Pull latest code
Write-Host "`n📥 Step 2: Pulling latest code..." -ForegroundColor Blue
Invoke-VPSCommand "cd $VPS_PATH && git pull origin latest"
Write-Host "✅ Code updated" -ForegroundColor Green

# Step 3: Update backend
Write-Host "`n🔧 Step 3: Updating backend..." -ForegroundColor Blue
Invoke-VPSCommand "cd $VPS_PATH/backend && npm install"
Invoke-VPSCommand "cd $VPS_PATH/backend && npx prisma generate"
Invoke-VPSCommand "cd $VPS_PATH/backend && npm run build"
Write-Host "✅ Backend updated and built" -ForegroundColor Green

# Step 4: Update frontend
Write-Host "`n🎨 Step 4: Updating frontend..." -ForegroundColor Blue
Invoke-VPSCommand "cd $VPS_PATH && npm install"
Invoke-VPSCommand "cd $VPS_PATH && npm run build"
Write-Host "✅ Frontend updated and built" -ForegroundColor Green

# Step 5: Update environment variables
Write-Host "`n⚙️  Step 5: Updating environment variables..." -ForegroundColor Blue
Invoke-VPSCommand "cd $VPS_PATH && cp env.production .env.production"
Write-Host "✅ Environment variables updated" -ForegroundColor Green

# Step 6: Update Prisma schema
Write-Host "`n🗄️  Step 6: Updating database schema..." -ForegroundColor Blue
Invoke-VPSCommand "cd $VPS_PATH/backend && npx prisma db push"
Write-Host "✅ Database schema updated" -ForegroundColor Green

# Step 7: Restart services
Write-Host "`n🔄 Step 7: Restarting services..." -ForegroundColor Blue
Invoke-VPSCommand "pm2 restart mymeds-backend"
Invoke-VPSCommand "pm2 restart mymeds-frontend"
Write-Host "✅ Services restarted" -ForegroundColor Green

# Step 8: Test deployment
Write-Host "`n🧪 Step 8: Testing deployment..." -ForegroundColor Blue
Invoke-VPSCommand "pm2 status"
Invoke-VPSCommand "curl -f http://localhost:4000/api/health || echo 'Backend health check failed'"
Invoke-VPSCommand "curl -f http://localhost:3000 || echo 'Frontend health check failed'"

Write-Host "`n🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host "📊 Service Status:" -ForegroundColor Blue
Invoke-VPSCommand "pm2 status"

Write-Host "`n🌐 Your application is now live at:" -ForegroundColor Blue
Write-Host "   Frontend: https://mymedspharmacyinc.com" -ForegroundColor Green
Write-Host "   Backend API: https://mymedspharmacyinc.com/api" -ForegroundColor Green
Write-Host "   Admin Panel: https://mymedspharmacyinc.com/admin" -ForegroundColor Green

Write-Host "`n📝 Next steps:" -ForegroundColor Yellow
Write-Host "1. Test the blog page: https://mymedspharmacyinc.com/blog"
Write-Host "2. Test the shop page: https://mymedspharmacyinc.com/shop"
Write-Host "3. Test the admin panel: https://mymedspharmacyinc.com/admin"
Write-Host "4. Add a location in admin panel to test location management"
Write-Host "5. Add a blog post in WordPress admin to test blog integration"
Write-Host "6. Add a product in WooCommerce admin to test shop integration"

Write-Host "`n✅ VPS deployment completed!" -ForegroundColor Green
