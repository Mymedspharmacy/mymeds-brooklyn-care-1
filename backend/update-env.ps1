# Update .env file with correct Railway database URL
$envContent = @"
ADMIN_EMAIL=a.mymedspharmacy03@gmail.com
ADMIN_NAME=MYMEDSPHARMACY
ADMIN_PASSWORD=admin@mymedspharmacy@01
CONTACT_RECEIVER=a.mymedspharmacy03@gmail.com

DATABASE_URL=postgresql://postgres:RERyYmqDfURUTNZyqzBLTLGtXsyLPwTE@switchyard.proxy.rlwy.net:35835/railway

DIRECT_URL=postgresql://postgres:RERyYmqDfURUTNZyqzBLTLGtXsyLPwTE@switchyard.proxy.rlwy.net:35835/railway

FRONT_END=www.mymedspharmacyinc.com

JWT_SECRET=tUR6SRh+Yq3WGVGIzKRpboweC+FmGV6fTazBwocbSFIcAwN2Dfk42ZZin1bxxWhP/1nyAjDrSdwSTLTy/y+YJg==

NODE_ENV=development
PGHOST=switchyard.proxy.rlwy.net
PORT=4000

RAILWAY_ENVIRONMENT=production
RAILWAY_ENVIRONMENT_ID=d3a5bbc1-7aa6-4d7b-9407-cdaec63db60b
RAILWAY_ENVIRONMENT_NAME=production

RAILWAY_PRIVATE_DOMAIN=mymeds-brooklyn-care.railway.internal
RAILWAY_PROJECT_ID=3136f910-22f4-41f7-980e-373441e311a7
RAILWAY_PROJECT_NAME=Mymedspharmacy

RAILWAY_PUBLIC_DOMAIN=mymeds-brooklyn-care-production.up.railway.app
RAILWAY_SERVICE_ID=dcafdcb2-0d84-4f48-b7c5-a444a84dec20
RAILWAY_SERVICE_NAME=mymeds-brooklyn-care
RAILWAY_STATIC_URL=mymeds-brooklyn-care-production.up.railway.app

RAILWAY_TCP_APPLICATION_PORT=6543
RAILWAY_TCP_PROXY_DOMAIN=shortline.proxy.rlwy.net
RAILWAY_TCP_PROXY_PORT=35432

STRIPE_SECRET_KEY=sk_test_51RotVPRyGAg8aKqqIoJRZdMFb7s78P2m5X9MW5cdWzg9h9TeeK22GiMzLITeucDapmyBl4EoG57C5WIfE
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8
Write-Host "Updated .env file with Railway proxy database URL" 