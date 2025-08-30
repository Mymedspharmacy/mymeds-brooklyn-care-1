@echo off
echo 🚀 MyMeds Backend Quick Deployment
echo.

set /p VPS_IP="Enter VPS IP: "
set /p VPS_USER="Enter username (root): "

if "%VPS_USER%"=="" set VPS_USER=root

echo.
echo 📤 Deploying to %VPS_USER%@%VPS_IP%...
echo.

echo 🔧 Creating directory...
ssh %VPS_USER%@%VPS_IP% "mkdir -p /var/www/mymeds-backend"

echo 📤 Uploading files...
scp -r dist\* %VPS_USER%@%VPS_IP%:/var/www/mymeds-backend/
scp package*.json %VPS_USER%@%VPS_IP%:/var/www/mymeds-backend/
scp deploy.sh %VPS_USER%@%VPS_IP%:/var/www/mymeds-backend/
scp env.production %VPS_USER%@%VPS_IP%:/var/www/mymeds-backend/

echo 🚀 Running deployment...
ssh %VPS_USER%@%VPS_IP% "cd /var/www/mymeds-backend; chmod +x deploy.sh; ./deploy.sh"

echo.
echo ✅ Deployment complete!
echo.
echo Next: ssh %VPS_USER%@%VPS_IP%
echo Then: cd /var/www/mymeds-backend && cp env.production .env && nano .env
pause
