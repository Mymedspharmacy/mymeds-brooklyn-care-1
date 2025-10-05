#!/bin/bash

# Script to update admin credentials on VPS
# Usage: ./update-admin-creds.sh <new_email> <new_password>

set -e

NEW_EMAIL=${1:-"admin@mymedspharmacyinc.com"}
NEW_PASSWORD=${2:-"MyMedsAdmin2025!"}

echo "🔧 Updating admin credentials..."
echo "📧 New Email: $NEW_EMAIL"
echo "🔑 New Password: $NEW_PASSWORD"

# Generate bcrypt hash for new password
echo "🔐 Generating password hash..."
HASH=$(node -e "const bcrypt = require('bcrypt'); bcrypt.hash('$NEW_PASSWORD', 12, (err, hash) => { if (err) throw err; console.log(hash); });")

echo "✅ Generated hash: $HASH"

# Update environment file
echo "📝 Updating environment file..."
ENV_FILE="/var/www/mymeds-pharmacy/backend/.env"

# Backup original env file
cp "$ENV_FILE" "$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"

# Update admin credentials in env file
sed -i "s/ADMIN_EMAIL=.*/ADMIN_EMAIL=$NEW_EMAIL/" "$ENV_FILE"
sed -i "s/ADMIN_PASSWORD_HASH=.*/ADMIN_PASSWORD_HASH=$HASH/" "$ENV_FILE"

echo "✅ Environment file updated"

# Update database
echo "🗄️ Updating database..."
mysql -u mymeds_user -p'SecurePassword123!' mymeds_production << EOF
UPDATE users 
SET email = '$NEW_EMAIL', 
    password = '$HASH',
    updatedAt = NOW()
WHERE role = 'ADMIN' OR email LIKE '%admin%';
EOF

echo "✅ Database updated"

# Restart PM2 process to load new environment
echo "🔄 Restarting application..."
pm2 restart mymeds-backend

echo "🎉 Admin credentials updated successfully!"
echo "📝 New credentials:"
echo "   Email: $NEW_EMAIL"
echo "   Password: $NEW_PASSWORD"



