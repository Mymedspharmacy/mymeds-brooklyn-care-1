#!/bin/bash

echo "🔧 Updating MyMeds Pharmacy Admin Credentials..."

# Set new credentials
NEW_EMAIL="admin@mymedspharmacyinc.com"
NEW_PASSWORD="MyMedsAdmin2025!"

echo "📧 New Email: $NEW_EMAIL"
echo "🔑 New Password: $NEW_PASSWORD"

# Navigate to backend directory
cd /var/www/mymeds-pharmacy/backend

# Generate new password hash
echo "🔐 Generating password hash..."
HASH=$(node -e "const bcrypt = require('bcrypt'); bcrypt.hash('$NEW_PASSWORD', 12, (err, hash) => { if (err) throw err; console.log(hash); });")

echo "✅ Generated hash: $HASH"

# Update .env file
echo "📝 Updating .env file..."
if [ -f ".env" ]; then
    # Backup original
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    
    # Update admin credentials
    sed -i "s/ADMIN_EMAIL=.*/ADMIN_EMAIL=$NEW_EMAIL/" .env
    sed -i "s/ADMIN_PASSWORD_HASH=.*/ADMIN_PASSWORD_HASH=$HASH/" .env
    
    echo "✅ .env file updated"
else
    echo "❌ .env file not found!"
    exit 1
fi

# Update database
echo "🗄️ Updating database..."
mysql -u mymeds_user -p'SecurePassword123!' mymeds_production << EOF
UPDATE users 
SET email = '$NEW_EMAIL', 
    password = '$HASH',
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
echo "   Email: $NEW_EMAIL"
echo "   Password: $NEW_PASSWORD"
echo ""
echo "✅ You can now login with these new credentials!"

