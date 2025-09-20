@echo off
echo 🚀 MyMeds VPS Deployment Script
echo.

set VPS_HOST=root@72.60.116.253
set VPS_PATH=/var/www/mymedspharmacyinc.com

echo 💾 Creating backup...
ssh %VPS_HOST% "mkdir -p /tmp/mymeds-backup-$(date +%%Y%%m%%d-%%H%%M%%S)"
ssh %VPS_HOST% "cp -r %VPS_PATH%/backend/src /tmp/mymeds-backup-$(date +%%Y%%m%%d-%%H%%M%%S)/backend-src-backup"

echo.
echo 🔧 Deploying backend files...
echo Uploading WordPress routes...
scp backend/src/routes/wordpress.ts %VPS_HOST%:%VPS_PATH%/backend/src/routes/wordpress.ts

echo Uploading WooCommerce routes...
scp backend/src/routes/woocommerce.ts %VPS_HOST%:%VPS_PATH%/backend/src/routes/woocommerce.ts

echo Uploading main server file...
scp backend/src/index.ts %VPS_HOST%:%VPS_PATH%/backend/src/index.ts

echo.
echo 🎨 Deploying frontend...
ssh %VPS_HOST% "rm -rf %VPS_PATH%/frontend/dist/*"
scp -r dist/* %VPS_HOST%:%VPS_PATH%/frontend/dist/
ssh %VPS_HOST% "chown -R www-data:www-data %VPS_PATH%/frontend/dist/"

echo.
echo 🔄 Restarting services...
ssh %VPS_HOST% "pm2 restart mymeds-backend"
timeout /t 5 /nobreak >nul
ssh %VPS_HOST% "systemctl reload nginx"

echo.
echo ✅ Verifying deployment...
ssh %VPS_HOST% "pm2 list"
ssh %VPS_HOST% "curl -s http://localhost:4000/api/health"

echo.
echo 🎉 Deployment completed!
echo Test at: https://mymedspharmacyinc.com
pause
