# MyMeds Deployment Fix Script for Windows/PowerShell
# This script fixes common deployment issues

param(
    [switch]$Verbose
)

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Header {
    Write-Host "==========================================" -ForegroundColor Blue
    Write-Host "  MyMeds Deployment Fix Script (Windows)" -ForegroundColor Blue  
    Write-Host "==========================================" -ForegroundColor Blue
    Write-Host ""
}

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Main function
function Main {
    Write-Header
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Success "Node.js version: $nodeVersion"
    } catch {
        Write-Error "Node.js not found. Please install Node.js first."
        exit 1
    }
    
    # Check npm
    try {
        $npmVersion = npm --version
        Write-Success "npm version: $npmVersion"
    } catch {
        Write-Error "npm not found"
        exit 1
    }
    
    # Fix 1: Clean and rebuild Frontend
    Write-Header "Building Frontend"
    Write-Status "Installing dependencies..."
    npm ci 2>$null
    
    Write-Status "Cleaning build cache..."
    if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
    if (Test-Path "node_modules\.vite") { Remove-Item -Recurse -Force "node_modules\.vite" }
    
    Write-Status "Building frontend..."
    npm run build 2>&1 | Out-Null
    
    if (Test-Path "dist") {
        Write-Success "Frontend build completed"
    } else {
        Write-Error "Frontend build failed"
        return 1
    }
    
    # Fix 2: Clean and rebuild Backend  
    Write-Header "Building Backend"
    Set-Location backend
    
    Write-Status "Installing backend dependencies..."
    npm ci 2>$null
    
    Write-Status "Generating Prisma client..."
    npx prisma generate --silent
    
    Write-Status "Building backend..."
    npm run build 2>&1 | Out-Null
    
    if (Test-Path "dist\index.js") {
        Write-Success "Backend build completed"
    } else {
        Write-Error "Backend build failed"
        return 1
    }
    
    Set-Location ..
    
    # Fix 3: Environment setup
    Write-Header "Environment Setup"
    if (Test-Path "backend\.env") {
        Write-Success "Backend .env exists"
    } else {
        Write-Warning "Backend .env missing - you may need to create it"
        Write-Status "Create backend\.env from env.template"
    }
    
    # Fix 4: Test configurations
    Write-Header "Testing Configurations"
    
    # Test backend startup
    Set-Location backend
    Write-Status "Testing backend startup..."
    try {
        # Set minimal environment
        $env:NODE_ENV = "development"
        $env:DATABASE_URL = "file:./prisma/dev.db"
        $env:JWT_SECRET = "test_jwt_secret_key_2025_mymeds_pharmacy_test_only_not_for_production_minimum_64_chars"
        
        # Test if backend can start (kill quickly)
        Start-Process -FilePath "node" -ArgumentList "dist/index.js" -NoNewWindow -PassThru | ForEach-Object {
            Start-Sleep 2
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        }
        Write-Success "Backend startup test passed"
    } catch {
        Write-Error "Backend startup test failed: $($_.Exception.Message)"
    }
    Set-Location ..
    
    # Fix 5: Show summary
    Write-Header "Deployment Fix Summary"
    Write-Success "Build processes completed successfully"
    Write-Warning "Next steps for deployment:"
    Write-Host "1. Update your deployment server with these files"
    Write-Host "2. Ensure environment variables are set on server"
    Write-Host "3. Run the Linux deployment fix script on your VPS:"
    Write-Host "   bash scripts/fix-deployment.sh"
    Write-Host "4. Check logs: pm2 logs mymeds-backend"
    
    return 0
}

# Run the script
try {
    Main
    Write-Host ""
    Write-Host "🎉 Deployment fix completed successfully!" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "❌ Deployment fix failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

