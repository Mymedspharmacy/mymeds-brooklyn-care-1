@echo off
REM MyMeds Backend Windows Deployment Script
REM This script deploys your backend to VPS KVM1 Hostinger

echo 🚀 Starting MyMeds Backend Deployment from Windows...

REM Check if required tools are installed
where ssh >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ SSH not found. Please install OpenSSH or use PuTTY.
    echo Download from: https://www.putty.org/
    pause
    exit /b 1
)

REM Get VPS details from user
set /p VPS_IP="Enter your VPS IP address: "
set /p VPS_USER="Enter VPS username (usually 'root'): "
set /p VPS_PATH="Enter deployment path (default: /var/www/mymeds-backend): "

if "%VPS_PATH%"=="" set VPS_PATH=/var/www/mymeds-backend

echo.
echo 📋 Deployment Configuration:
echo VPS IP: %VPS_IP%
echo Username: %VPS_USER%
echo Path: %VPS_PATH%
echo.

REM Confirm deployment
set /p CONFIRM="Proceed with deployment? (y/N): "
if /i not "%CONFIRM%"=="y" (
    echo Deployment cancelled.
    pause
    exit /b 0
)

echo.
echo 🔧 Creating deployment directory on VPS...
ssh %VPS_USER%@%VPS_IP% "mkdir -p %VPS_PATH%"

echo 📤 Uploading production build files...
scp -r dist\* %VPS_USER%@%VPS_IP%:%VPS_PATH%/

echo 📤 Uploading package files...
scp package*.json %VPS_USER%@%VPS_USER%:%VPS_PATH%/

echo 📤 Uploading deployment script...
scp deploy.sh %VPS_USER%@%VPS_IP%:%VPS_PATH%/

echo 📤 Uploading environment template...
scp env.production %VPS_USER%@%VPS_IP%:%VPS_PATH%/

echo 📤 Uploading verification script...
scp verify-deployment.sh %VPS_USER%@%VPS_IP%:%VPS_PATH%/

echo.
echo 🚀 Executing deployment on VPS...
ssh %VPS_USER%@%VPS_IP% "cd %VPS_PATH% && chmod +x deploy.sh && ./deploy.sh"

echo.
echo ✅ Deployment completed!
echo.
echo 📋 Next steps:
echo 1. SSH into your VPS: ssh %VPS_USER%@%VPS_IP%
echo 2. Configure environment: cd %VPS_PATH% && cp env.production .env && nano .env
echo 3. Verify deployment: ./verify-deployment.sh
echo 4. Check status: pm2 status
echo.
echo 🎉 Your backend is now deployed!
pause
