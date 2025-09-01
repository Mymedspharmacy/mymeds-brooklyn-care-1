# 🚀 MyMeds Pharmacy - Complete Deployment Script (PowerShell)
# Deploy from 0 to 100% in a single go
# Author: MyMeds Pharmacy Team
# Version: 2.0.0

param(
    [string]$VpsIp = "72.60.116.253",
    [string]$Domain = "mymedspharmacyinc.com",
    [string]$SshUser = "root",
    [string]$SshKey = "",
    [switch]$SkipConfirmation
)

# Configuration
$DB_NAME = "mymeds_production"
$DB_USER = "mymeds_user"
$DB_PASSWORD = "MyMeds2024!@Pharm"
$ADMIN_EMAIL = "admin@mymedspharmacyinc.com"
$ADMIN_PASSWORD = "MyMeds2024!@Pharm"

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$Cyan = "Cyan"

# Function to log messages
function Write-Log {
    param([string]$Message, [string]$Color = $Green)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor $Color
}

function Write-Error {
    param([string]$Message)
    Write-Log "ERROR: $Message" $Red
    exit 1
}

function Write-Warning {
    param([string]$Message)
    Write-Log "WARNING: $Message" $Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Log "INFO: $Message" $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Log "SUCCESS: $Message" $Green
}

# Function to check prerequisites
function Test-Prerequisites {
    Write-Info "Checking prerequisites..."
    
    # Check if SSH is available
    try {
        $sshVersion = ssh -V 2>&1
        Write-Success "SSH is available"
    } catch {
        Write-Error "SSH is not available. Please install OpenSSH or use WSL."
    }
    
    # Check if we can connect to VPS
    Write-Info "Testing connection to VPS..."
    try {
        if ($SshKey) {
            ssh -i $SshKey -o ConnectTimeout=10 -o BatchMode=yes $SshUser@$VpsIp "echo 'Connection successful'"
        } else {
            ssh -o ConnectTimeout=10 -o BatchMode=yes $SshUser@$VpsIp "echo 'Connection successful'"
        }
        Write-Success "VPS connection successful"
    } catch {
        Write-Error "Cannot connect to VPS. Please check your SSH configuration."
    }
}

# Function to create deployment package
function New-DeploymentPackage {
    Write-Info "Creating deployment package..."
    
    $packageDir = "deployment-package"
    if (Test-Path $packageDir) {
        Remove-Item $packageDir -Recurse -Force
    }
    New-Item -ItemType Directory -Path $packageDir | Out-Null
    
    # Copy backend files
    Write-Info "Copying backend files..."
    Copy-Item -Path "backend" -Destination "$packageDir/backend" -Recurse -Force
    
    # Copy frontend files
    Write-Info "Copying frontend files..."
    Copy-Item -Path "src" -Destination "$packageDir/frontend/src" -Recurse -Force
    Copy-Item -Path "public" -Destination "$packageDir/frontend/public" -Recurse -Force
    Copy-Item -Path "package.json" -Destination "$packageDir/frontend/package.json" -Force
    Copy-Item -Path "vite.config.ts" -Destination "$packageDir/frontend/vite.config.ts" -Force
    Copy-Item -Path "tailwind.config.ts" -Destination "$packageDir/frontend/tailwind.config.ts" -Force
    Copy-Item -Path "tsconfig.json" -Destination "$packageDir/frontend/tsconfig.json" -Force
    Copy-Item -Path "index.html" -Destination "$packageDir/frontend/index.html" -Force
    
    # Copy deployment script
    Copy-Item -Path "deploy-complete.sh" -Destination "$packageDir/deploy-complete.sh" -Force
    
    Write-Success "Deployment package created successfully"
    return $packageDir
}

# Function to upload files to VPS
function Send-FilesToVps {
    param([string]$PackageDir)
    
    Write-Info "Uploading files to VPS..."
    
    try {
        if ($SshKey) {
            scp -i $SshKey -r "$PackageDir/*" "$SshUser@${VpsIp}:/tmp/mymeds-deployment/"
        } else {
            scp -r "$PackageDir/*" "$SshUser@${VpsIp}:/tmp/mymeds-deployment/"
        }
        Write-Success "Files uploaded successfully"
    } catch {
        Write-Error "Failed to upload files to VPS"
    }
}

# Function to execute deployment on VPS
function Start-VpsDeployment {
    Write-Info "Starting deployment on VPS..."
    
    $deployCommand = @"
cd /tmp/mymeds-deployment
chmod +x deploy-complete.sh
./deploy-complete.sh
"@
    
    try {
        if ($SshKey) {
            ssh -i $SshKey $SshUser@$VpsIp $deployCommand
        } else {
            ssh $SshUser@$VpsIp $deployCommand
        }
        Write-Success "Deployment completed successfully"
    } catch {
        Write-Error "Deployment failed on VPS"
    }
}

# Function to verify deployment
function Test-Deployment {
    Write-Info "Verifying deployment..."
    
    $testUrls = @(
        "https://$Domain",
        "https://$Domain/api/health",
        "https://$Domain/api/products"
    )
    
    foreach ($url in $testUrls) {
        try {
            $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 30
            if ($response.StatusCode -eq 200) {
                Write-Success "$url is accessible"
            } else {
                Write-Warning "$url returned status $($response.StatusCode)"
            }
        } catch {
            Write-Warning "$url is not accessible yet"
        }
    }
}

# Function to display deployment summary
function Show-DeploymentSummary {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor $Cyan
    Write-Host "🚀 MyMeds Pharmacy - Deployment Summary" -ForegroundColor $Cyan
    Write-Host "==========================================" -ForegroundColor $Cyan
    Write-Host ""
    Write-Host "🌐 Domain: https://$Domain" -ForegroundColor $Green
    Write-Host "🔧 Backend: https://$Domain/api" -ForegroundColor $Green
    Write-Host "🎨 Frontend: https://$Domain" -ForegroundColor $Green
    Write-Host "🗄️ Database: MySQL ($DB_NAME)" -ForegroundColor $Green
    Write-Host "🔒 SSL: Let's Encrypt" -ForegroundColor $Green
    Write-Host "🛡️ Firewall: UFW + Fail2ban" -ForegroundColor $Green
    Write-Host "📊 Monitoring: PM2 + Health Checks" -ForegroundColor $Green
    Write-Host "💾 Backups: Daily automated" -ForegroundColor $Green
    Write-Host ""
    Write-Host "📋 Admin Credentials:" -ForegroundColor $Yellow
    Write-Host "   Email: $ADMIN_EMAIL" -ForegroundColor $Yellow
    Write-Host "   Password: $ADMIN_PASSWORD" -ForegroundColor $Yellow
    Write-Host ""
    Write-Host "🔧 Useful Commands:" -ForegroundColor $Blue
    Write-Host "   SSH to VPS: ssh $SshUser@$VpsIp" -ForegroundColor $Blue
    Write-Host "   View logs: tail -f /var/www/mymeds/logs/*.log" -ForegroundColor $Blue
    Write-Host "   PM2 status: pm2 status" -ForegroundColor $Blue
    Write-Host "   Nginx status: systemctl status nginx" -ForegroundColor $Blue
    Write-Host "   MySQL status: systemctl status mysql" -ForegroundColor $Blue
    Write-Host ""
    Write-Host "⚠️ Important Notes:" -ForegroundColor $Yellow
    Write-Host "   1. Update Stripe keys in backend/.env" -ForegroundColor $Yellow
    Write-Host "   2. Update SMTP password in backend/.env" -ForegroundColor $Yellow
    Write-Host "   3. Update New Relic license key" -ForegroundColor $Yellow
    Write-Host "   4. Configure Google Analytics" -ForegroundColor $Yellow
    Write-Host "   5. Test all functionality" -ForegroundColor $Yellow
    Write-Host ""
    Write-Host "✅ Your MyMeds Pharmacy is now live!" -ForegroundColor $Green
    Write-Host "==========================================" -ForegroundColor $Cyan
}

# Main deployment function
function Start-CompleteDeployment {
    Write-Host ""
    Write-Host "🚀 MyMeds Pharmacy - Complete Deployment Script" -ForegroundColor $Cyan
    Write-Host "================================================" -ForegroundColor $Cyan
    Write-Host "This script will deploy your entire application" -ForegroundColor $Cyan
    Write-Host "from 0 to 100% in a single go." -ForegroundColor $Cyan
    Write-Host ""
    Write-Host "Target Domain: $Domain" -ForegroundColor $Green
    Write-Host "VPS IP: $VpsIp" -ForegroundColor $Green
    Write-Host "Database: $DB_NAME" -ForegroundColor $Green
    Write-Host ""
    
    if (-not $SkipConfirmation) {
        $confirmation = Read-Host "Press Enter to continue or 'n' to abort"
        if ($confirmation -eq 'n') {
            Write-Info "Deployment aborted by user"
            exit 0
        }
    }
    
    Write-Info "Starting complete deployment..."
    
    try {
        Test-Prerequisites
        $packageDir = New-DeploymentPackage
        Send-FilesToVps -PackageDir $packageDir
        Start-VpsDeployment
        Start-Sleep -Seconds 30  # Wait for deployment to complete
        Test-Deployment
        Show-DeploymentSummary
        
        Write-Success "Deployment completed successfully!"
        
        # Cleanup
        if (Test-Path $packageDir) {
            Remove-Item $packageDir -Recurse -Force
        }
        
    } catch {
        Write-Error "Deployment failed: $($_.Exception.Message)"
    }
}

# Run main deployment
Start-CompleteDeployment
