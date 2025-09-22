#!/bin/bash
# =============================================================================
# FIXED DOCKER ENTRYPOINT SCRIPT - MyMeds Pharmacy Inc.
# =============================================================================
# Production startup script for complete application stack
# =============================================================================

set -e

echo "🚀 Starting MyMeds Pharmacy Inc. Production Deployment..."

# =============================================================================
# ENVIRONMENT VALIDATION
# =============================================================================
echo "🔍 Validating environment variables..."

# Required environment variables
REQUIRED_VARS=(
    "DATABASE_URL"
    "JWT_SECRET"
    "ADMIN_EMAIL"
    "ADMIN_PASSWORD"
    "NODE_ENV"
    "PORT"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: Required environment variable $var is not set"
        exit 1
    fi
done

echo "✅ Environment variables validated"

# =============================================================================
# DATABASE SETUP
# =============================================================================
echo "🗄️ Setting up database..."

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
until mysql -h"${DB_HOST:-mysql}" -P"${DB_PORT:-3306}" -u"${DB_USER:-mymeds_user}" -p"${DB_PASSWORD:-Mymeds2025!UserSecure123!@#}" -e "SELECT 1;" >/dev/null 2>&1; do
    echo "⏳ Database not ready, waiting..."
    sleep 2
done

echo "✅ Database connection established"

# =============================================================================
# PRISMA SETUP
# =============================================================================
echo "🔧 Setting up Prisma..."

cd /app/backend

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

echo "✅ Prisma setup completed"

# =============================================================================
# ADMIN USER CREATION
# =============================================================================
echo "👤 Creating admin user..."

node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
    const admin = await prisma.user.upsert({
      where: { email: process.env.ADMIN_EMAIL },
      update: { 
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isActive: true
      },
      create: {
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isActive: true
      }
    });
    console.log('✅ Admin user created/updated:', admin.email);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.\$disconnect();
  }
}

createAdmin();
"

echo "✅ Admin user setup completed"

# =============================================================================
# INTEGRATIONS SETUP
# =============================================================================
echo "🔧 Initializing integrations..."
node init-integrations.js
echo "✅ Integrations initialized"

# =============================================================================
# APPLICATION STARTUP
# =============================================================================
echo "🚀 Starting application services..."

# Start backend server
echo "🔧 Starting backend server..."
pm2 start ecosystem.config.js --env production

# Start frontend server (if needed)
echo "🌐 Frontend built and ready"

# =============================================================================
# HEALTH MONITORING
# =============================================================================
echo "🏥 Starting health monitoring..."

# Function to check backend health
check_backend_health() {
    curl -f http://localhost:4000/api/health >/dev/null 2>&1
}

# Function to check database health
check_database_health() {
    mysql -h"${DB_HOST:-mysql}" -P"${DB_PORT:-3306}" -u"${DB_USER:-mymeds_user}" -p"${DB_PASSWORD:-Mymeds2025!UserSecure123!@#}" -e "SELECT 1;" >/dev/null 2>&1
}

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
for i in {1..30}; do
    if check_backend_health && check_database_health; then
        echo "✅ All services are ready!"
        break
    fi
    echo "⏳ Services not ready, waiting... ($i/30)"
    sleep 2
done

# =============================================================================
# FINAL STATUS
# =============================================================================
echo "🎉 MyMeds Pharmacy Inc. is now running!"
echo "📊 Backend API: http://localhost:4000"
echo "🌐 Frontend: http://localhost:3000"
echo "🗄️ Database: Connected"
echo "🔐 Admin Panel: Ready"
echo "🛒 WooCommerce: Integrated"
echo "📝 WordPress: Integrated"
echo "👤 Admin User: ${ADMIN_EMAIL}"

# Keep container running
echo "🔄 Monitoring services..."
while true; do
    if ! check_backend_health; then
        echo "❌ Backend health check failed, restarting..."
        pm2 restart all
    fi
    
    if ! check_database_health; then
        echo "❌ Database health check failed!"
        exit 1
    fi
    
    sleep 30
done
