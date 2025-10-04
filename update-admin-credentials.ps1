# PowerShell script to update admin credentials on VPS
# Run this from your local machine

$serverIP = "72.60.116.253"
$newEmail = "admin@mymedspharmacyinc.com"
$newPassword = "MyMedsAdmin2025!"

Write-Host "🔧 Updating MyMeds Pharmacy Admin Credentials on VPS..." -ForegroundColor Blue
Write-Host "📧 New Email: $newEmail" -ForegroundColor Green
Write-Host "🔑 New Password: $newPassword" -ForegroundColor Green

# Create the update script content
$updateScript = @"
#!/bin/bash
echo "🔧 Updating admin credentials..."

# Set new credentials
NEW_EMAIL="$newEmail"
NEW_PASSWORD="$newPassword"

echo "📧 New Email: \$NEW_EMAIL"
echo "🔑 New Password: \$NEW_PASSWORD"

# Navigate to backend directory
cd /var/www/mymeds-pharmacy/backend

# Generate new password hash
echo "🔐 Generating password hash..."
HASH=\$(node -e "const bcrypt = require('bcrypt'); bcrypt.hash('\$NEW_PASSWORD', 12, (err, hash) => { if (err) throw err; console.log(hash); });")

echo "✅ Generated hash: \$HASH"

# Update .env file
echo "📝 Updating .env file..."
if [ -f ".env" ]; then
    # Backup original
    cp .env .env.backup.\$(date +%Y%m%d_%H%M%S)
    
    # Update admin credentials
    sed -i "s/ADMIN_EMAIL=.*/ADMIN_EMAIL=\$NEW_EMAIL/" .env
    sed -i "s/ADMIN_PASSWORD_HASH=.*/ADMIN_PASSWORD_HASH=\$HASH/" .env
    
    echo "✅ .env file updated"
else
    echo "❌ .env file not found!"
    exit 1
fi

# Update database
echo "🗄️ Updating database..."
mysql -u mymeds_user -p'SecurePassword123!' mymeds_production << EOF
UPDATE users 
SET email = '\$NEW_EMAIL', 
    password = '\$HASH',
    updatedAt = NOW()
WHERE role = 'ADMIN';
EOF

echo "✅ Database updated"

# Restart PM2 process
echo "🔄 Restarting application..."
pm2 restart mymeds-backend

echo ""
echo "🎉 Admin credentials updated successfully!"
echo "📝 New login credentials:"
echo "   URL: https://mymedspharmacyinc.com/admin-signin"
echo "   Email: \$NEW_EMAIL"
echo "   Password: \$NEW_PASSWORD"
echo ""
echo "✅ You can now login with these new credentials!"
"@

# Write script to temporary file
$tempScript = "update-admin-temp.sh"
$updateScript | Out-File -FilePath $tempScript -Encoding UTF8

Write-Host "📤 Uploading update script to VPS..." -ForegroundColor Yellow

try {
    # Upload script to VPS
    scp $tempScript "root@$serverIP`:/tmp/update-admin.sh"
    
    Write-Host "✅ Script uploaded successfully" -ForegroundColor Green
    
    Write-Host "🚀 Running update script on VPS..." -ForegroundColor Yellow
    
    # Execute script on VPS
    ssh "root@$serverIP" "chmod +x /tmp/update-admin.sh && /tmp/update-admin.sh && rm /tmp/update-admin.sh"
    
    Write-Host "🎉 Admin credentials updated successfully!" -ForegroundColor Green
    Write-Host "📝 New login credentials:" -ForegroundColor Cyan
    Write-Host "   URL: https://mymedspharmacyinc.com/admin-signin" -ForegroundColor White
    Write-Host "   Email: $newEmail" -ForegroundColor White
    Write-Host "   Password: $newPassword" -ForegroundColor White
    
} catch {
    Write-Host "❌ Error updating credentials: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    # Clean up temporary file
    if (Test-Path $tempScript) {
        Remove-Item $tempScript
    }
}

Write-Host ""
Write-Host "✅ Process completed!" -ForegroundColor Green

