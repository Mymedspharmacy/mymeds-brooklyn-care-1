# VPS Update Script for MyMeds Pharmacy (PowerShell)
# This script updates the application with latest changes

Write-Host "🚀 Starting VPS Update for MyMeds Pharmacy..." -ForegroundColor Green

# Navigate to project directory (update this path)
$projectPath = "C:\path\to\your\project"
Set-Location $projectPath

# Pull latest changes
Write-Host "📥 Pulling latest changes from Git..." -ForegroundColor Yellow
git pull origin latest
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to pull changes" -ForegroundColor Red
    exit 1
}

# Install/update dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}

# Update backend dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}

# Generate Prisma client for production
Write-Host "🗄️ Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma client" -ForegroundColor Red
    exit 1
}

# Run database migrations (if any)
Write-Host "🔄 Running database migrations..." -ForegroundColor Yellow
npx prisma db push
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to push database changes" -ForegroundColor Red
    exit 1
}

# Build frontend
Write-Host "🏗️ Building frontend..." -ForegroundColor Yellow
Set-Location ..
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build frontend" -ForegroundColor Red
    exit 1
}

# Build backend
Write-Host "🏗️ Building backend..." -ForegroundColor Yellow
Set-Location backend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build backend" -ForegroundColor Red
    exit 1
}

# Restart backend service
Write-Host "🔄 Restarting backend service..." -ForegroundColor Yellow
pm2 restart mymeds-backend
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to restart backend" -ForegroundColor Red
    exit 1
}

# Reload nginx
Write-Host "🔄 Reloading nginx..." -ForegroundColor Yellow
sudo systemctl reload nginx
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to reload nginx" -ForegroundColor Red
    exit 1
}

# Check service status
Write-Host "✅ Checking service status..." -ForegroundColor Green
pm2 status

Write-Host "🎉 VPS Update Complete!" -ForegroundColor Green
Write-Host "📊 Application Status:" -ForegroundColor Cyan
Write-Host "- Frontend: Built and deployed" -ForegroundColor White
Write-Host "- Backend: Restarted with PM2" -ForegroundColor White
Write-Host "- Database: Migrations applied" -ForegroundColor White
Write-Host "- Nginx: Reloaded" -ForegroundColor White

Write-Host ""
Write-Host "🔍 To verify deployment:" -ForegroundColor Cyan
Write-Host "- Visit: https://mymedspharmacyinc.com" -ForegroundColor White
Write-Host "- Check admin panel: https://mymedspharmacyinc.com/admin" -ForegroundColor White
Write-Host "- Monitor logs: pm2 logs mymeds-backend" -ForegroundColor White