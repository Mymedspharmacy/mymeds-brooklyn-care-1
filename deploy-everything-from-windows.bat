@echo off
echo 🚀 MyMeds Complete Application Deployment from Windows
echo This will deploy: Frontend + Backend + Database + Everything!
echo.

set /p VPS_IP="Enter VPS IP: "
set /p VPS_USER="Enter username (root): "

if "%VPS_USER%"=="" set VPS_USER=root

echo.
echo 📤 Deploying complete MyMeds application to %VPS_USER%@%VPS_IP%...
echo.

echo 🔧 Creating directories on VPS...
ssh %VPS_USER%@%VPS_IP% "mkdir -p /var/www/mymeds-backend /var/www/mymeds-frontend"

echo 📤 Uploading backend files...
scp -r backend\dist\* %VPS_USER%@%VPS_IP%:/var/www/mymeds-backend/
scp backend\package*.json %VPS_USER%@%VPS_IP%:/var/www/mymeds-backend/

echo 📤 Uploading frontend files...
scp -r frontend\dist\* %VPS_USER%@%VPS_IP%:/var/www/mymeds-frontend/

echo 📤 Uploading deployment scripts...
scp deploy-everything.sh %VPS_USER%@%VPS_IP%:/var/www/mymeds-backend/
scp backend\env.production %VPS_USER%@%VPS_IP%:/var/www/mymeds-backend/

echo 🚀 Running complete deployment on VPS...
ssh %VPS_USER%@%VPS_IP% "cd /var/www/mymeds-backend; chmod +x deploy-everything.sh; ./deploy-everything.sh"

echo.
echo ✅ Complete deployment finished!
echo.
echo 🌐 Your application is now running at:
echo Frontend: http://%VPS_IP%
echo Backend API: http://%VPS_IP%:4000
echo.
echo 📋 Next steps:
echo 1. SSH into VPS: ssh %VPS_USER%@%VPS_IP%
echo 2. Configure environment: cd /var/www/mymeds-backend && nano .env
echo 3. Update domain names in Nginx configs
echo 4. Get SSL certificates with Certbot
echo 5. Test health: ./health-check.sh
echo.
echo 🎉 Your complete MyMeds application is deployed!
pause
