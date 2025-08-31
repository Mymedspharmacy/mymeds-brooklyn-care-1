# 🚀 MyMeds Pharmacy Production Deployment Script (PowerShell)
# This script automates the production deployment process for Windows users
# Run this script from the project root directory

param(
    [string]$Environment = "production",
    [switch]$SkipBackup,
    [switch]$SkipTests,
    [switch]$Force,
    [string]$ServerPath = "/var/www/mymeds"
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$Cyan = "Cyan"

# Configuration
$AppName = "mymeds-pharmacy"
$AppDir = $ServerPath
$BackupDir = "/var/backups/mymeds"
$LogFile = "/var/log/mymeds/deployment.log"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# Logging function
function Write-Log {
    param([string]$Message, [string]$Color = $Blue)
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] $Message"
    Write-Host $LogMessage -ForegroundColor $Color
    Add-Content -Path $LogFile -Value $LogMessage -ErrorAction SilentlyContinue
}

# Error function
function Write-Error {
    param([string]$Message)
    Write-Log "[ERROR] $Message" $Red
    exit 1
}

# Success function
function Write-Success {
    param([string]$Message)
    Write-Log "[SUCCESS] $Message" $Green
}

# Warning function
function Write-Warning {
    param([string]$Message)
    Write-Log "[WARNING] $Message" $Yellow
}

# Check if running as administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Check prerequisites
function Test-Prerequisites {
    Write-Log "🔍 Checking prerequisites..." $Cyan
    
    # Check if we're in the right directory
    if (-not (Test-Path "package.json")) {
        Write-Error "package.json not found. Please run this script from the project root directory."
    }
    
    # Check if backend directory exists
    if (-not (Test-Path "backend")) {
        Write-Error "Backend directory not found. Please ensure the repository is properly cloned."
    }
    
    # Check if .env file exists
    if (-not (Test-Path "backend/.env")) {
        Write-Error "Production .env file not found. Please configure environment variables first."
    }
    
    # Check if backend package.json exists
    if (-not (Test-Path "backend/package.json")) {
        Write-Error "Backend package.json not found."
    }
    
    Write-Success "Prerequisites check passed"
}

# Create backup
function Create-Backup {
    if ($SkipBackup) {
        Write-Log "⏭️ Skipping backup as requested" $Yellow
        return
    }
    
    Write-Log "💾 Creating backup before deployment..." $Cyan
    
    try {
        # Create backup directory
        if (-not (Test-Path $BackupDir)) {
            New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
        }
        
        # Backup application files
        $BackupFile = "$BackupDir/app_backup_$Timestamp.tar.gz"
        Write-Log "Creating application backup: $BackupFile"
        
        # Use tar if available (Git Bash, WSL, or similar)
        if (Get-Command "tar" -ErrorAction SilentlyContinue) {
            tar -czf $BackupFile --exclude=node_modules --exclude=.git --exclude=dist --exclude=*.log .
            Write-Success "Application backup created: $BackupFile"
        } else {
            # Fallback to PowerShell compression
            Write-Warning "tar not available, using PowerShell compression"
            $BackupFile = "$BackupDir/app_backup_$Timestamp.zip"
            Compress-Archive -Path * -DestinationPath $BackupFile -Force
            Write-Success "Application backup created: $BackupFile"
        }
        
        # Backup database if possible
        if (Test-Path "backend/.env") {
            Write-Log "🗄️ Attempting database backup..."
            # This would require database tools to be available
            Write-Warning "Database backup requires database tools. Manual backup recommended."
        }
        
    } catch {
        Write-Warning "Backup creation failed: $($_.Exception.Message)"
        Write-Warning "Continuing with deployment..."
    }
}

# Run tests
function Run-Tests {
    if ($SkipTests) {
        Write-Log "⏭️ Skipping tests as requested" $Yellow
        return
    }
    
    Write-Log "🧪 Running tests..." $Cyan
    
    try {
        # Frontend tests
        Write-Log "Running frontend tests..."
        npm test
        Write-Success "Frontend tests passed"
        
        # Backend tests
        Write-Log "Running backend tests..."
        Set-Location backend
        npm test
        Set-Location ..
        Write-Success "Backend tests passed"
        
    } catch {
        Write-Error "Tests failed: $($_.Exception.Message)"
    }
}

# Build application
function Build-Application {
    Write-Log "🔨 Building application..." $Cyan
    
    try {
        # Frontend build
        Write-Log "Building frontend..."
        npm run build
        Write-Success "Frontend built successfully"
        
        # Backend build
        Write-Log "Building backend..."
        Set-Location backend
        npm run build
        Set-Location ..
        Write-Success "Backend built successfully"
        
    } catch {
        Write-Error "Build failed: $($_.Exception.Message)"
    }
}

# Deploy to server
function Deploy-ToServer {
    Write-Log "🚀 Deploying to server..." $Cyan
    
    try {
        # Check if server path is accessible
        if (-not (Test-Path $AppDir)) {
            Write-Error "Server path $AppDir is not accessible. Please check your configuration."
        }
        
        # Copy files to server
        Write-Log "Copying files to server..."
        Copy-Item -Path "dist" -Destination "$AppDir/frontend" -Recurse -Force
        Copy-Item -Path "backend/dist" -Destination "$AppDir/backend" -Recurse -Force
        Copy-Item -Path "backend/package*.json" -Destination "$AppDir/backend" -Force
        Copy-Item -Path "backend/ecosystem.config.js" -Destination "$AppDir/backend" -Force
        Copy-Item -Path "backend/start.sh" -Destination "$AppDir/backend" -Force
        
        Write-Success "Files copied to server"
        
        # Install dependencies on server
        Write-Log "Installing dependencies on server..."
        Set-Location $AppDir/backend
        npm install --production
        Set-Location ../..
        
        Write-Success "Dependencies installed on server"
        
    } catch {
        Write-Error "Deployment failed: $($_.Exception.Message)"
    }
}

# Start application
function Start-Application {
    Write-Log "🚀 Starting application..." $Cyan
    
    try {
        Set-Location $AppDir/backend
        
        # Check if PM2 is available
        if (Get-Command "pm2" -ErrorAction SilentlyContinue) {
            Write-Log "Starting with PM2..."
            pm2 start ecosystem.config.js --env production
            pm2 save
            Write-Success "Application started with PM2"
        } else {
            Write-Warning "PM2 not available, starting with npm..."
            Start-Process -FilePath "npm" -ArgumentList "start" -NoNewWindow
            Write-Success "Application started with npm"
        }
        
        Set-Location ../..
        
    } catch {
        Write-Error "Failed to start application: $($_.Exception.Message)"
    }
}

# Health check
function Test-Health {
    Write-Log "🧪 Testing application health..." $Cyan
    
    try {
        $HealthCheckRetries = 5
        $HealthCheckDelay = 10
        
        for ($i = 1; $i -le $HealthCheckRetries; $i++) {
            try {
                $Response = Invoke-WebRequest -Uri "http://localhost:4000/api/health" -TimeoutSec 10
                if ($Response.StatusCode -eq 200) {
                    Write-Success "Application health check passed"
                    return
                }
            } catch {
                if ($i -eq $HealthCheckRetries) {
                    Write-Error "Application health check failed after $HealthCheckRetries attempts"
                } else {
                    Write-Warning "Health check attempt $i failed, retrying in $HealthCheckDelay seconds..."
                    Start-Sleep -Seconds $HealthCheckDelay
                }
            }
        }
        
    } catch {
        Write-Warning "Health check failed: $($_.Exception.Message)"
    }
}

# Main deployment function
function Start-Deployment {
    Write-Log "🚀 Starting MyMeds Pharmacy Production Deployment" $Cyan
    Write-Log "Timestamp: $Timestamp" $Blue
    Write-Log "Environment: $Environment" $Blue
    Write-Log "Server Path: $AppDir" $Blue
    
    try {
        # Pre-deployment checks
        Test-Prerequisites
        
        # Create backup
        Create-Backup
        
        # Run tests
        Run-Tests
        
        # Build application
        Build-Application
        
        # Deploy to server
        Deploy-ToServer
        
        # Start application
        Start-Application
        
        # Wait for application to be ready
        Write-Log "⏳ Waiting for application to be ready..." $Yellow
        Start-Sleep -Seconds 10
        
        # Test application health
        Test-Health
        
        # Final status
        Write-Log "📊 Final deployment status check..." $Cyan
        if (Get-Command "pm2" -ErrorAction SilentlyContinue) {
            pm2 status
        }
        
        # Deployment summary
        Write-Log "🎉 Deployment completed successfully!" $Green
        Write-Log "📅 Deployment timestamp: $Timestamp" $Blue
        Write-Log "🌐 Application should be available at your domain" $Blue
        Write-Log "📊 Monitor logs with: pm2 logs mymeds-backend" $Blue
        Write-Log "📈 Monitor status with: pm2 monit" $Blue
        
        # Save deployment info
        Add-Content -Path $LogFile -Value "Deployment completed: $Timestamp"
        Add-Content -Path $LogFile -Value "---"
        
        Write-Success "🚀 MyMeds Pharmacy is now deployed to production!"
        Write-Success "📚 Check the deployment documentation for monitoring and maintenance procedures"
        Write-Success "🆘 For issues, check the troubleshooting guides or contact the DevOps team"
        
    } catch {
        Write-Error "Deployment failed: $($_.Exception.Message)"
        Write-Log "Deployment failed at: $Timestamp" $Red
        exit 1
    }
}

# Script execution
try {
    # Check if running as administrator (optional)
    if (-not (Test-Administrator)) {
        Write-Warning "Not running as administrator. Some operations may require elevated privileges."
    }
    
    # Create log directory
    $LogDir = Split-Path $LogFile -Parent
    if (-not (Test-Path $LogDir)) {
        New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
    }
    
    # Start deployment
    Start-Deployment
    
} catch {
    Write-Error "Script execution failed: $($_.Exception.Message)"
    exit 1
}
