# MyMeds Pharmacy VPS Direct Deployment Script
# This script uploads the entire project to VPS and builds it there

param(
    [string]$VPS_USER = "root",
    [string]$VPS_HOST = "72.60.116.253",
    [string]$VPS_PATH = "/var/www/mymeds",
    [string]$BACKUP_PATH = "/var/www/backups"
)

Write-Host "MyMeds Pharmacy VPS Direct Deployment" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Step 1: Create backup on VPS
Write-Host "`nStep 1: Creating VPS Backup..." -ForegroundColor Yellow

try {
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $backupName = "mymeds_backup_$timestamp"
    
    Write-Host "Creating backup: $backupName" -ForegroundColor Cyan
    
    # Create backup command
    $backupCmd = "ssh ${VPS_USER}@${VPS_HOST} `"mkdir -p ${BACKUP_PATH} && tar -czf ${BACKUP_PATH}/${backupName}.tar.gz -C ${VPS_PATH} .`""
    
    # Execute backup
    Invoke-Expression $backupCmd
    
    Write-Host "VPS backup created: $backupName" -ForegroundColor Green
} catch {
    Write-Host "VPS backup failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Continuing without backup..." -ForegroundColor Yellow
}

# Step 2: Upload entire project to VPS
Write-Host "`nStep 2: Uploading Project to VPS..." -ForegroundColor Yellow

try {
    Write-Host "Uploading entire project..." -ForegroundColor Cyan
    
    # Create temporary directory on VPS
    $createTempCmd = "ssh ${VPS_USER}@${VPS_HOST} `"mkdir -p /tmp/mymeds-deploy`""
    Invoke-Expression $createTempCmd
    
    # Upload the entire project (excluding node_modules and dist)
    Write-Host "Uploading project files..." -ForegroundColor Cyan
    scp -r src ${VPS_USER}@${VPS_HOST}:/tmp/mymeds-deploy/
    scp -r backend ${VPS_USER}@${VPS_HOST}:/tmp/mymeds-deploy/
    scp -r public ${VPS_USER}@${VPS_HOST}:/tmp/mymeds-deploy/
    scp -r deployment ${VPS_USER}@${VPS_HOST}:/tmp/mymeds-deploy/
    scp -r docs ${VPS_USER}@${VPS_HOST}:/tmp/mymeds-deploy/
    scp package.json ${VPS_USER}@${VPS_HOST}:/tmp/mymeds-deploy/
    scp package-lock.json ${VPS_USER}@${VPS_HOST}:/tmp/mymeds-deploy/
    scp vite.config.ts ${VPS_USER}@${VPS_HOST}:/tmp/mymeds-deploy/
    scp tailwind.config.ts ${VPS_USER}@${VPS_HOST}:/tmp/mymeds-deploy/
    scp tsconfig.json ${VPS_USER}@${VPS_HOST}:/tmp/mymeds-deploy/
    scp tsconfig.app.json ${VPS_USER}@${VPS_HOST}:/tmp/mymeds-deploy/
    scp tsconfig.node.json ${VPS_USER}@${VPS_HOST}:/tmp/mymeds-deploy/
    scp eslint.config.js ${VPS_USER}@${VPS_HOST}:/tmp/mymeds-deploy/
    scp postcss.config.js ${VPS_USER}@${VPS_HOST}:/tmp/mymeds-deploy/
    scp index.html ${VPS_USER}@${VPS_HOST}:/tmp/mymeds-deploy/
    scp frontend.env.production ${VPS_USER}@${VPS_HOST}:/tmp/mymeds-deploy/
    scp backend/env.production ${VPS_USER}@${VPS_HOST}:/tmp/mymeds-deploy/backend/.env
    scp .gitignore ${VPS_USER}@${VPS_HOST}:/tmp/mymeds-deploy/
    scp README.md ${VPS_USER}@${VPS_HOST}:/tmp/mymeds-deploy/
    
    Write-Host "Project uploaded successfully" -ForegroundColor Green
} catch {
    Write-Host "Project upload failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Deploy and build on VPS
Write-Host "`nStep 3: Deploying and Building on VPS..." -ForegroundColor Yellow

try {
    Write-Host "Deploying to VPS..." -ForegroundColor Cyan
    
    $deployCmd = @"
ssh ${VPS_USER}@${VPS_HOST} "
# Stop current PM2 process
pm2 stop mymeds-backend || true
pm2 delete mymeds-backend || true

# Backup current deployment
if [ -d '${VPS_PATH}' ] && [ \"\$(ls -A ${VPS_PATH})\" ]; then
    mv ${VPS_PATH} ${VPS_PATH}-old-\$(date +%Y%m%d-%H%M%S)
fi

# Deploy new files
cp -r /tmp/mymeds-deploy/* ${VPS_PATH}/

# Set proper permissions
chown -R www-data:www-data ${VPS_PATH}
chmod -R 755 ${VPS_PATH}

# Install frontend dependencies
cd ${VPS_PATH}
npm install

# Build frontend
NODE_ENV=production npm run build

# Install backend dependencies
cd ${VPS_PATH}/backend
npm install

# Generate Prisma client
npx prisma generate

# Run Prisma migrations
npx prisma migrate deploy

# Start PM2 process
pm2 start ecosystem.config.js --env production
pm2 save

# Clean up temporary files
rm -rf /tmp/mymeds-deploy

echo 'Deployment completed successfully!'
"
"@
    
    Invoke-Expression $deployCmd
    
    Write-Host "Deployment completed successfully" -ForegroundColor Green
} catch {
    Write-Host "Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 4: Health Check
Write-Host "`nStep 4: Health Check..." -ForegroundColor Yellow

try {
    Write-Host "Checking application health..." -ForegroundColor Cyan
    
    Start-Sleep -Seconds 10  # Wait for application to start
    
    $healthCmd = "ssh ${VPS_USER}@${VPS_HOST} `"curl -f http://localhost:4000/api/health`""
    $healthResult = Invoke-Expression $healthCmd
    
    if ($healthResult -like "*healthy*" -or $healthResult -like "*ok*") {
        Write-Host "Application is healthy" -ForegroundColor Green
    } else {
        Write-Host "Health check returned: $healthResult" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please check the application manually." -ForegroundColor Yellow
}

# Step 5: Show Status
Write-Host "`nStep 5: Application Status..." -ForegroundColor Yellow

try {
    $statusCmd = "ssh ${VPS_USER}@${VPS_HOST} `"pm2 status`""
    $statusResult = Invoke-Expression $statusCmd
    Write-Host "PM2 Status:" -ForegroundColor Cyan
    Write-Host $statusResult -ForegroundColor White
} catch {
    Write-Host "Could not get PM2 status" -ForegroundColor Yellow
}

# Success Message
Write-Host "`nVPS Direct Deployment Completed Successfully!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host "Project uploaded and built on VPS" -ForegroundColor Green
Write-Host "Database migrations applied" -ForegroundColor Green
Write-Host "Application restarted" -ForegroundColor Green
Write-Host "Health check completed" -ForegroundColor Green

Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "1. Monitor the application: pm2 status" -ForegroundColor White
Write-Host "2. Check logs: pm2 logs mymeds-backend" -ForegroundColor White
Write-Host "3. Test the application in browser" -ForegroundColor White

Write-Host "`nYour MyMeds Pharmacy application has been deployed!" -ForegroundColor Green
