# =============================================================================
# MyMeds Pharmacy VPS Deployment Script (PowerShell)
# =============================================================================
# Automated deployment script to update VPS with latest fixes
# Includes duplication checks and clean deployment process
# =============================================================================

param(
    [string]$VpsHost = "root@72.60.116.253",
    [string]$VpsProjectPath = "/var/www/mymedspharmacyinc.com",
    [switch]$SkipBackup = $false,
    [switch]$DryRun = $false
)

# Configuration
$BackupDir = "/tmp/mymeds-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

# Colors for output
$Red = "`e[31m"
$Green = "`e[32m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Reset = "`e[0m"

# Logging functions
function Write-Log {
    param([string]$Message)
    Write-Host "$Green[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message$Reset"
}

function Write-Warning {
    param([string]$Message)
    Write-Host "$Yellow[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] WARNING: $Message$Reset"
}

function Write-Error {
    param([string]$Message)
    Write-Host "$Red[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] ERROR: $Message$Reset"
    exit 1
}

# =============================================================================
# Pre-deployment checks
# =============================================================================
function Test-LocalFiles {
    Write-Log "Checking local files..."
    
    $requiredFiles = @(
        "backend/src/routes/wordpress.ts",
        "backend/src/routes/woocommerce.ts", 
        "backend/src/index.ts",
        "dist/index.html"
    )
    
    foreach ($file in $requiredFiles) {
        if (-not (Test-Path $file)) {
            Write-Error "Required file not found: $file"
        }
    }
    
    Write-Log "✅ All local files found"
}

function Test-VpsConnectivity {
    Write-Log "Checking VPS connectivity..."
    
    try {
        $result = ssh -o ConnectTimeout=10 -o BatchMode=yes $VpsHost "echo 'VPS connection successful'" 2>$null
        if ($LASTEXITCODE -ne 0) {
            throw "Connection failed"
        }
        Write-Log "✅ VPS connectivity confirmed"
    }
    catch {
        Write-Error "Cannot connect to VPS. Please check SSH access."
    }
}

# =============================================================================
# VPS Health Check
# =============================================================================
function Test-VpsHealth {
    Write-Log "Checking VPS health..."
    
    # Check PM2 status
    try {
        $pm2Status = ssh $VpsHost "pm2 list --format json" 2>$null | ConvertFrom-Json
        if ($pm2Status -and $pm2Status.status -eq "online") {
            Write-Log "✅ PM2 services running"
        } else {
            Write-Warning "PM2 services may not be running properly"
        }
    }
    catch {
        Write-Warning "Could not check PM2 status"
    }
    
    # Check disk space
    try {
        $diskUsage = ssh $VpsHost "df -h $VpsProjectPath | tail -1 | awk '{print `$5}' | sed 's/%//'"
        if ([int]$diskUsage -gt 85) {
            Write-Warning "Disk usage is high: $diskUsage%"
        } else {
            Write-Log "✅ Disk usage OK: $diskUsage%"
        }
    }
    catch {
        Write-Warning "Could not check disk usage"
    }
    
    # Check backend health
    try {
        ssh $VpsHost "curl -s -f http://localhost:4000/api/health > /dev/null" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Log "✅ Backend API responding"
        } else {
            Write-Warning "Backend API not responding"
        }
    }
    catch {
        Write-Warning "Could not check backend health"
    }
}

# =============================================================================
# Duplication Check and Cleanup
# =============================================================================
function Remove-Duplicates {
    Write-Log "Checking for file duplications and cleaning up..."
    
    # Check for duplicate node_modules
    try {
        $nodeModulesCount = ssh $VpsHost "find $VpsProjectPath -name 'node_modules' -type d | wc -l"
        if ([int]$nodeModulesCount -gt 2) {
            Write-Warning "Found $nodeModulesCount node_modules directories (expected 1-2)"
            Write-Log "Cleaning up duplicate node_modules..."
            ssh $VpsHost "find $VpsProjectPath -name 'node_modules' -type d | head -n -1 | xargs rm -rf" 2>$null
        }
    }
    catch {
        Write-Warning "Could not check/clean node_modules"
    }
    
    # Check for duplicate package.json files
    try {
        $packageJsonCount = ssh $VpsHost "find $VpsProjectPath -name 'package.json' -type f | wc -l"
        if ([int]$packageJsonCount -gt 2) {
            Write-Warning "Found $packageJsonCount package.json files (expected 1-2)"
        }
    }
    catch {
        Write-Warning "Could not check package.json files"
    }
    
    # Check for old backup files
    try {
        $backupCount = ssh $VpsHost "find $VpsProjectPath -name '*.backup' -type f | wc -l"
        if ([int]$backupCount -gt 10) {
            Write-Warning "Found $backupCount backup files, cleaning old ones..."
            ssh $VpsHost "find $VpsProjectPath -name '*.backup' -type f -mtime +7 -delete" 2>$null
        }
    }
    catch {
        Write-Warning "Could not check/clean backup files"
    }
    
    Write-Log "✅ Duplication check completed"
}

# =============================================================================
# Backup Current Deployment
# =============================================================================
function New-Backup {
    if ($SkipBackup) {
        Write-Log "Skipping backup as requested"
        return
    }
    
    Write-Log "Creating backup of current deployment..."
    
    ssh $VpsHost "mkdir -p $BackupDir" 2>$null
    
    # Backup critical files
    ssh $VpsHost @"
        cp -r $VpsProjectPath/backend/src $BackupDir/backend-src-backup 2>/dev/null || true
        cp -r $VpsProjectPath/frontend/dist $BackupDir/frontend-dist-backup 2>/dev/null || true
        cp $VpsProjectPath/backend/.env $BackupDir/env-backup 2>/dev/null || true
        cp $VpsProjectPath/backend/package.json $BackupDir/package-json-backup 2>/dev/null || true
"@ 2>$null
    
    Write-Log "✅ Backup created at: $BackupDir"
}

# =============================================================================
# Deploy Backend Updates
# =============================================================================
function Deploy-Backend {
    Write-Log "Deploying backend updates..."
    
    if ($DryRun) {
        Write-Log "DRY RUN: Would deploy backend files"
        return
    }
    
    # Upload fixed files
    scp backend/src/routes/wordpress.ts "${VpsHost}:${VpsProjectPath}/backend/src/routes/wordpress.ts"
    scp backend/src/routes/woocommerce.ts "${VpsHost}:${VpsProjectPath}/backend/src/routes/woocommerce.ts"
    scp backend/src/index.ts "${VpsHost}:${VpsProjectPath}/backend/src/index.ts"
    
    # Set proper permissions
    ssh $VpsHost "chown -R root:root $VpsProjectPath/backend/src/"
    
    Write-Log "✅ Backend files deployed"
}

# =============================================================================
# Deploy Frontend Updates
# =============================================================================
function Deploy-Frontend {
    Write-Log "Deploying frontend updates..."
    
    if ($DryRun) {
        Write-Log "DRY RUN: Would deploy frontend files"
        return
    }
    
    # Clear old frontend files
    ssh $VpsHost "rm -rf $VpsProjectPath/frontend/dist/*"
    
    # Upload new frontend build
    scp -r dist/* "${VpsHost}:${VpsProjectPath}/frontend/dist/"
    
    # Set proper permissions
    ssh $VpsHost "chown -R www-data:www-data $VpsProjectPath/frontend/dist/"
    ssh $VpsHost "chmod -R 755 $VpsProjectPath/frontend/dist/"
    
    Write-Log "✅ Frontend deployed"
}

# =============================================================================
# Restart Services
# =============================================================================
function Restart-Services {
    Write-Log "Restarting services..."
    
    if ($DryRun) {
        Write-Log "DRY RUN: Would restart services"
        return
    }
    
    # Restart PM2 backend
    ssh $VpsHost "pm2 restart mymeds-backend || pm2 start $VpsProjectPath/backend/dist/index.js --name mymeds-backend"
    
    # Wait for backend to start
    Start-Sleep -Seconds 5
    
    # Reload Nginx
    ssh $VpsHost "nginx -t && systemctl reload nginx"
    
    Write-Log "✅ Services restarted"
}

# =============================================================================
# Post-deployment Verification
# =============================================================================
function Test-Deployment {
    Write-Log "Verifying deployment..."
    
    if ($DryRun) {
        Write-Log "DRY RUN: Would verify deployment"
        return
    }
    
    # Check PM2 status
    Start-Sleep -Seconds 10  # Give backend time to start
    
    try {
        $pm2Status = ssh $VpsHost "pm2 list --format json" 2>$null
        if ($pm2Status -and $pm2Status.Contains("online")) {
            Write-Log "✅ PM2 services running"
        } else {
            Write-Error "PM2 services not running properly"
        }
    }
    catch {
        Write-Error "Could not verify PM2 status"
    }
    
    # Check backend health
    try {
        ssh $VpsHost "curl -s -f http://localhost:4000/api/health > /dev/null" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Log "✅ Backend API responding"
        } else {
            Write-Error "Backend API not responding after deployment"
        }
    }
    catch {
        Write-Error "Backend API health check failed"
    }
    
    # Check frontend files
    try {
        $frontendFiles = ssh $VpsHost "ls -la $VpsProjectPath/frontend/dist/ | wc -l"
        if ([int]$frontendFiles -gt 5) {
            Write-Log "✅ Frontend files deployed"
        } else {
            Write-Error "Frontend deployment incomplete"
        }
    }
    catch {
        Write-Error "Could not verify frontend deployment"
    }
    
    Write-Log "✅ Deployment verification successful"
}

# =============================================================================
# Rollback Function
# =============================================================================
function Invoke-Rollback {
    Write-Error "Deployment failed. Rolling back..."
    
    if (-not $SkipBackup) {
        try {
            ssh $VpsHost "test -d $BackupDir" 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Log "Restoring from backup..."
                ssh $VpsHost @"
                    cp -r $BackupDir/backend-src-backup/* $VpsProjectPath/backend/src/ 2>/dev/null || true
                    cp -r $BackupDir/frontend-dist-backup/* $VpsProjectPath/frontend/dist/ 2>/dev/null || true
                    pm2 restart mymeds-backend
"@
                Write-Log "Rollback completed"
            }
        }
        catch {
            Write-Warning "Rollback failed"
        }
    }
}

# =============================================================================
# Main Execution
# =============================================================================
function Main {
    Write-Log "🚀 Starting MyMeds VPS Deployment"
    Write-Log "VPS: $VpsHost"
    Write-Log "Project Path: $VpsProjectPath"
    if ($DryRun) {
        Write-Log "DRY RUN MODE - No changes will be made"
    }
    
    try {
        # Pre-deployment checks
        Test-LocalFiles
        Test-VpsConnectivity
        Test-VpsHealth
        
        # Cleanup and backup
        Remove-Duplicates
        New-Backup
        
        # Deploy updates
        Deploy-Backend
        Deploy-Frontend
        
        # Restart services
        Restart-Services
        
        # Verify deployment
        Test-Deployment
        
        Write-Log "🎉 Deployment completed successfully!"
        Write-Log "Backup location: $BackupDir"
        Write-Log "You can now test your application at: https://mymedspharmacyinc.com"
    }
    catch {
        Invoke-Rollback
        throw
    }
}

# Run main function
Main
