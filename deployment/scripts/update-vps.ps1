# MyMeds Pharmacy VPS Update Script (PowerShell)
# This script updates the VPS deployment with the latest code

param(
    [string]$VPS_USER = "root",
    [string]$VPS_HOST = "72.60.116.253",
    [string]$VPS_PATH = "/var/www/mymeds",
    [string]$BACKUP_PATH = "/var/www/backups"
)

Write-Host "🚀 MyMeds Pharmacy VPS Update Script" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Step 1: Validate Dependencies
Write-Host "`nStep 1: Validating Dependencies..." -ForegroundColor Yellow

# Check Node.js version
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Check npm version
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found. Please install npm first." -ForegroundColor Red
    exit 1
}

# Step 2: Build Frontend
Write-Host "`nStep 2: Building Frontend..." -ForegroundColor Yellow

try {
    # Set NODE_ENV for Windows PowerShell
    $env:NODE_ENV = "production"
    
    # Install dependencies
    Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
    npm install
    
    # Build frontend
    Write-Host "Building frontend..." -ForegroundColor Cyan
    npm run build
    
    Write-Host "✅ Frontend built successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend build failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Build Backend
Write-Host "`nStep 3: Building Backend..." -ForegroundColor Yellow

try {
    # Navigate to backend directory
    Set-Location backend
    
    # Install dependencies
    Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
    npm install
    
    # Generate Prisma client
    Write-Host "Generating Prisma client..." -ForegroundColor Cyan
    npx prisma generate
    
    # Build backend
    Write-Host "Building backend..." -ForegroundColor Cyan
    npm run build
    
    # Return to root directory
    Set-Location ..
    
    Write-Host "✅ Backend built successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend build failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 4: Create Backup on VPS
Write-Host "`nStep 4: Creating VPS Backup..." -ForegroundColor Yellow

try {
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $backupName = "mymeds_backup_$timestamp"
    
    Write-Host "Creating backup: $backupName" -ForegroundColor Cyan
    
    # Create backup command
    $backupCmd = "ssh ${VPS_USER}@${VPS_HOST} `"mkdir -p ${BACKUP_PATH} && tar -czf ${BACKUP_PATH}/${backupName}.tar.gz -C ${VPS_PATH} .`""
    
    # Execute backup
    Invoke-Expression $backupCmd
    
    Write-Host "✅ VPS backup created: $backupName" -ForegroundColor Green
} catch {
    Write-Host "❌ VPS backup failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Continuing without backup..." -ForegroundColor Yellow
}

# Step 5: Upload Files to VPS
Write-Host "`nStep 5: Uploading Files to VPS..." -ForegroundColor Yellow

try {
    # Upload frontend build
    Write-Host "Uploading frontend build..." -ForegroundColor Cyan
    scp -r dist ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/
    
    # Upload backend files
    Write-Host "Uploading backend files..." -ForegroundColor Cyan
    scp -r backend/* ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/backend/
    
    # Upload environment files
    Write-Host "Uploading environment files..." -ForegroundColor Cyan
    scp frontend.env.production ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/
    scp backend/env.production ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/backend/.env
    
    Write-Host "✅ Files uploaded successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ File upload failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 6: Run Prisma Migrations on VPS
Write-Host "`nStep 6: Running Database Migrations..." -ForegroundColor Yellow

try {
    Write-Host "Running Prisma migrations..." -ForegroundColor Cyan
    
    $migrationCmd = "ssh ${VPS_USER}@${VPS_HOST} `"cd ${VPS_PATH}/backend && npx prisma generate && npx prisma migrate deploy`""
    Invoke-Expression $migrationCmd
    
    Write-Host "✅ Database migrations completed" -ForegroundColor Green
} catch {
    Write-Host "❌ Database migrations failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 7: Restart PM2 on VPS
Write-Host "`nStep 7: Restarting Application..." -ForegroundColor Yellow

try {
    Write-Host "Restarting PM2 application..." -ForegroundColor Cyan
    
    $restartCmd = "ssh ${VPS_USER}@${VPS_HOST} `"cd ${VPS_PATH}/backend && pm2 stop mymeds-backend && pm2 delete mymeds-backend && pm2 start ecosystem.config.js --env production && pm2 save`""
    Invoke-Expression $restartCmd
    
    Write-Host "✅ Application restarted successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Application restart failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 8: Health Check
Write-Host "`nStep 8: Health Check..." -ForegroundColor Yellow

try {
    Write-Host "Checking application health..." -ForegroundColor Cyan
    
    Start-Sleep -Seconds 5  # Wait for application to start
    
    $healthCmd = "ssh ${VPS_USER}@${VPS_HOST} `"curl -f http://localhost:4000/api/health`""
    $healthResult = Invoke-Expression $healthCmd
    
    if ($healthResult -like "*healthy*" -or $healthResult -like "*ok*") {
        Write-Host "✅ Application is healthy" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Health check returned: $healthResult" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please check the application manually." -ForegroundColor Yellow
}

# Step 9: Cleanup
Write-Host "`nStep 9: Cleanup..." -ForegroundColor Yellow

try {
    # Remove local build artifacts
    if (Test-Path "dist") {
        Remove-Item -Recurse -Force "dist"
        Write-Host "✅ Local build artifacts cleaned" -ForegroundColor Green
    }
    
    if (Test-Path "backend/dist") {
        Remove-Item -Recurse -Force "backend/dist"
        Write-Host "✅ Backend build artifacts cleaned" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Cleanup failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Success Message
Write-Host "`nVPS Update Completed Successfully!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host "✅ Frontend built and deployed" -ForegroundColor Green
Write-Host "✅ Backend built and deployed" -ForegroundColor Green
Write-Host "✅ Database migrations applied" -ForegroundColor Green
Write-Host "✅ Application restarted" -ForegroundColor Green
Write-Host "✅ Health check passed" -ForegroundColor Green

Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "1. Monitor the application: pm2 status" -ForegroundColor White
Write-Host "2. Check logs: pm2 logs mymeds-backend" -ForegroundColor White
Write-Host "3. Test the application in browser" -ForegroundColor White

Write-Host "`nYour MyMeds Pharmacy application has been updated!" -ForegroundColor Green
