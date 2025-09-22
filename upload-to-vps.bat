@echo off
REM =============================================================================
REM VPS FILE UPLOAD SCRIPT - MyMeds Pharmacy Inc. (Windows)
REM =============================================================================
REM Simple script to upload files to VPS using rsync
REM =============================================================================

echo.
echo 📁 MyMeds Pharmacy Inc. - VPS File Upload (Windows)
echo ================================================
echo.

REM =============================================================================
REM CONFIGURATION
REM =============================================================================
set VPS_IP=72.60.116.253
set VPS_USER=root
set VPS_PATH=/var/www/mymeds

REM =============================================================================
REM VALIDATION
REM =============================================================================
echo [INFO] Validating connection to VPS...
ping -n 1 %VPS_IP% >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Cannot reach VPS at %VPS_IP%
    pause
    exit /b 1
)
echo [SUCCESS] VPS is reachable

REM =============================================================================
REM UPLOAD FILES
REM =============================================================================
echo [INFO] Starting file upload to VPS...

REM Create directory on VPS
ssh %VPS_USER%@%VPS_IP% "mkdir -p %VPS_PATH%"

REM Upload files (excluding large directories)
echo [INFO] Uploading project files...
rsync -avz --progress ^
    --exclude 'node_modules' ^
    --exclude '.git' ^
    --exclude 'dist' ^
    --exclude 'backend/node_modules' ^
    --exclude 'backend/dist' ^
    --exclude 'backend/logs' ^
    --exclude 'backend/uploads' ^
    --exclude 'backend/prisma/dev.db' ^
    --exclude '*.log' ^
    --exclude '.env*' ^
    --exclude 'uploads/*' ^
    --exclude 'logs/*' ^
    --exclude 'backups/*' ^
    . %VPS_USER%@%VPS_IP%:%VPS_PATH%/

echo [SUCCESS] Files uploaded successfully

REM Upload environment template
echo [INFO] Uploading environment template...
rsync -avz env.production.template %VPS_USER%@%VPS_IP%:%VPS_PATH%/.env.production

echo [SUCCESS] Environment template uploaded

REM =============================================================================
REM SET PERMISSIONS
REM =============================================================================
echo [INFO] Setting file permissions...
ssh %VPS_USER%@%VPS_IP% "cd %VPS_PATH% && chmod +x deployment/scripts/*.sh && chmod +x docker-entrypoint*.sh && chmod 755 uploads logs backups && chmod 644 .env.production && chown -R root:root %VPS_PATH%"

echo [SUCCESS] File permissions set

REM =============================================================================
REM SUMMARY
REM =============================================================================
echo.
echo [SUCCESS] 🎉 File upload completed successfully!
echo.
echo [INFO] Next steps:
echo 1. SSH into your VPS: ssh %VPS_USER%@%VPS_IP%
echo 2. Navigate to: cd %VPS_PATH%
echo 3. Run the complete deployment: ./deployment/scripts/00-deploy-all.sh
echo.
echo [INFO] Or run individual scripts:
echo 1. ./deployment/scripts/02-setup-environment.sh
echo 2. ./deployment/scripts/03-install-dependencies.sh
echo 3. ./deployment/scripts/04-setup-database.sh
echo 4. ./deployment/scripts/05-deploy-application.sh
echo 5. ./deployment/scripts/06-setup-wordpress.sh
echo.
echo [INFO] Files uploaded to: %VPS_USER%@%VPS_IP%:%VPS_PATH%
echo.
pause

