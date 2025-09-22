# =============================================================================
# UPLOAD TO VPS SCRIPT - MyMeds Pharmacy Inc.
# =============================================================================
# PowerShell script to upload deployment files to VPS
# =============================================================================

param(
    [string]$VPSHost = "72.60.116.253",
    [string]$VPSUser = "root",
    [string]$VPSPath = "/var/www/mymeds"
)

Write-Host "🚀 MyMeds Pharmacy - VPS Upload Script" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Check if required files exist
$requiredFiles = @(
    "docker-compose.optimized.yml",
    "deployment",
    "backend",
    "src",
    "package.json"
)

Write-Host "🔍 Checking required files..." -ForegroundColor Blue
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ Found: $file" -ForegroundColor Green
    } else {
        Write-Host "❌ Missing: $file" -ForegroundColor Red
        exit 1
    }
}

# Create temporary deployment directory
$tempDir = "mymeds-deployment-temp"
if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

Write-Host "📦 Creating deployment package..." -ForegroundColor Blue

# Copy essential files
$filesToCopy = @(
    "docker-compose.optimized.yml",
    "deployment",
    "backend", 
    "src",
    "package.json",
    "package-lock.json",
    "vite.config.ts",
    "tailwind.config.ts",
    "postcss.config.js",
    "tsconfig*.json",
    "index.html",
    "public"
)

foreach ($item in $filesToCopy) {
    if (Test-Path $item) {
        if ((Get-Item $item).PSIsContainer) {
            Copy-Item -Recurse $item "$tempDir/"
            Write-Host "📁 Copied directory: $item" -ForegroundColor Yellow
        } else {
            Copy-Item $item "$tempDir/"
            Write-Host "📄 Copied file: $item" -ForegroundColor Yellow
        }
    }
}

Write-Host "📤 Uploading files to VPS..." -ForegroundColor Blue

# Upload to VPS using SCP
try {
    # Create remote directory
    ssh "${VPSUser}@${VPSHost}" "mkdir -p $VPSPath"
    
    # Upload files
    scp -r "$tempDir/*" "${VPSUser}@${VPSHost}:$VPSPath/"
    
    Write-Host "✅ Upload completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Upload failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Clean up temporary directory
Remove-Item -Recurse -Force $tempDir

Write-Host ""
Write-Host "🎉 Upload completed!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Blue
Write-Host "1. SSH to your VPS: ssh $VPSUser@$VPSHost" -ForegroundColor White
Write-Host "2. Navigate to project: cd $VPSPath" -ForegroundColor White
Write-Host "3. Run deployment: ./deployment/scripts/deploy-with-ssl.sh" -ForegroundColor White
Write-Host ""
Write-Host "VPS Details:" -ForegroundColor Blue
Write-Host "Host: $VPSHost" -ForegroundColor White
Write-Host "User: $VPSUser" -ForegroundColor White
Write-Host "Path: $VPSPath" -ForegroundColor White
