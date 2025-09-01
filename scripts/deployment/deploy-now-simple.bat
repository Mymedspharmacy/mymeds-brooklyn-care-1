@echo off
echo 🚀 Deploying MyMeds to VPS KVM1 Hostinger...
echo VPS IP: 72.60.116.253
echo Username: root
echo.

echo 🔧 Creating directories on VPS...
sshpass -p "Pharm-23-medS" ssh -o StrictHostKeyChecking=no root@72.60.116.253 "mkdir -p /var/www/mymeds-backend /var/www/mymeds-frontend"

echo 📤 Uploading backend files...
sshpass -p "Pharm-23-medS" scp -o StrictHostKeyChecking=no -r backend\dist\* root@72.60.116.253:/var/www/mymeds-backend/
sshpass -p "Pharm-23-medS" scp -o StrictHostKeyChecking=no backend\package*.json root@72.60.116.253:/var/www/mymeds-backend/

echo 📤 Uploading frontend files...
sshpass -p "Pharm-23-medS" scp -o StrictHostKeyChecking=no -r dist\* root@72.60.116.253:/var/www/mymeds-frontend/

echo 📤 Uploading deployment scripts...
sshpass -p "Pharm-23-medS" scp -o StrictHostKeyChecking=no deploy-everything.sh root@72.60.116.253:/var/www/mymeds-backend/
sshpass -p "Pharm-23-medS" scp -o StrictHostKeyChecking=no backend\env.production root@72.60.116.253:/var/www/mymeds-backend/

echo 🚀 Running deployment on VPS...
sshpass -p "Pharm-23-medS" ssh -o StrictHostKeyChecking=no root@72.60.116.253 "cd /var/www/mymeds-backend; chmod +x deploy-everything.sh; ./deploy-everything.sh"

echo.
echo ✅ Deployment complete!
echo 🌐 Your app is now running at:
echo Frontend: http://72.60.116.253
echo Backend: http://72.60.116.253:4000
pause
