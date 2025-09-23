#!/bin/bash
# =============================================================================
# DOCKER ENTRYPOINT SCRIPT - MyMeds Pharmacy Inc.
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

echo "✅ Environment validation passed"

# =============================================================================
# DATABASE SETUP
# =============================================================================
echo "🗄️ Setting up database..."

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
until npx prisma db push --accept-data-loss 2>/dev/null; do
    echo "⏳ Database not ready yet, waiting..."
    sleep 5
done

echo "✅ Database connection established"

# Run migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy || npx prisma db push --accept-data-loss

echo "✅ Database migrations completed"

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

echo "✅ Prisma client generated"

# =============================================================================
# APPLICATION STARTUP
# =============================================================================
echo "🚀 Starting MyMeds Pharmacy application..."

# Start the backend server
cd backend
exec npm run start



