#!/bin/bash

# Add Admin User Script for MyMeds Pharmacy
# Usage: ./add-admin-user.sh [email] [password] [firstName] [lastName]

# Set default values
EMAIL=${1:-"admin2@mymedspharmacy.com"}
PASSWORD=${2:-"Admin123!"}
FIRST_NAME=${3:-"Admin"}
LAST_NAME=${4:-"User"}

echo "🔐 Adding new admin user..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if we're in the right directory
if [ ! -f "backend/package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo "📧 Email: $EMAIL"
echo "👤 Name: $FIRST_NAME $LAST_NAME"
echo "🔑 Password: $PASSWORD"

# Run the Node.js script
echo "🚀 Running admin user creation script..."
node scripts/add-admin-user.js "$EMAIL" "$PASSWORD" "$FIRST_NAME" "$LAST_NAME"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Admin user creation completed successfully!"
    echo ""
    echo "🎉 New admin user added:"
    echo "   Email: $EMAIL"
    echo "   Password: $PASSWORD"
    echo "   Name: $FIRST_NAME $LAST_NAME"
    echo ""
    echo "⚠️  Please change the password after first login for security."
else
    echo "❌ Failed to create admin user"
    exit 1
fi

echo ""
echo "📝 To login to the admin panel:"
echo "   1. Go to: http://your-domain/admin-signin"
echo "   2. Use the credentials above"
echo "   3. Change password after first login"
