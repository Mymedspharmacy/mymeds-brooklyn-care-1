@echo off
REM MyMeds Pharmacy Inc. - Windows Deployment Script
REM This script prepares the deployment and provides instructions

echo ============================================================================
echo MyMeds Pharmacy Inc. - VPS Deployment Preparation
echo ============================================================================
echo.

echo Checking prerequisites...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not available. Please reinstall Node.js
    pause
    exit /b 1
)

echo ✓ Node.js and npm are available

REM Install dependencies
echo.
echo Installing project dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo ✓ Dependencies installed

REM Install backend dependencies
echo.
echo Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..

echo ✓ Backend dependencies installed

REM Build the application
echo.
echo Building React application...
call npm run build:production
if %errorlevel% neq 0 (
    echo ERROR: Failed to build React application
    pause
    exit /b 1
)

echo ✓ React application built

REM Build backend
echo.
echo Building backend application...
cd backend
call npm run build:production
if %errorlevel% neq 0 (
    echo ERROR: Failed to build backend application
    pause
    exit /b 1
)
cd ..

echo ✓ Backend application built

echo.
echo ============================================================================
echo DEPLOYMENT PREPARATION COMPLETE!
echo ============================================================================
echo.
echo Next steps:
echo 1. Install SSH client (PuTTY, OpenSSH, or Git Bash)
echo 2. Install rsync or use SCP for file transfer
echo 3. Run the Linux deployment script on your VPS
echo.
echo VPS Details:
echo - IP: 72.60.116.253
echo - User: root
echo - Password: Pharm-23-medS
echo - Domain: mymedspharmacyinc.com
echo.
echo Admin Credentials:
echo - Email: mymedspharmacyinc@gmail.com
echo - Password: Pharm-23-medS
echo.
echo To deploy to VPS:
echo 1. Copy the deploy-to-vps.sh script to your VPS
echo 2. Make it executable: chmod +x deploy-to-vps.sh
echo 3. Run it: ./deploy-to-vps.sh
echo.
echo Or use the manual deployment steps in DEPLOYMENT-README.md
echo.
pause


