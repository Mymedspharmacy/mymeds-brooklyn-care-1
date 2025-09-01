@echo off
echo.
echo 🚀 MyMeds Pharmacy - One-Click Deployment
echo ==========================================
echo.
echo This will deploy your entire application to your VPS
echo from 0 to 100%% in a single go.
echo.
echo Target: mymedspharmacyinc.com
echo VPS: 72.60.116.253
echo.
pause

powershell -ExecutionPolicy Bypass -File "deploy-complete.ps1"

echo.
echo Deployment completed!
echo Press any key to exit...
pause >nul
