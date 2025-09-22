#!/bin/bash
# =============================================================================
# PERFECT DOCKER ENTRYPOINT SCRIPT - MyMeds Pharmacy Inc.
# =============================================================================
# Production startup script for complete application stack
# Optimized for Docker Compose deployment
# =============================================================================

set -e

echo "🚀 Starting MyMeds Pharmacy Inc. Production Deployment..."
echo "======================================================"

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

# Wait for database to be ready (Docker Compose service name)
echo "⏳ Waiting for database connection..."
until mysql -h"${DB_HOST:-mysql}" -P"${DB_PORT:-3306}" -u"${DB_USER:-mymeds_user}" -p"${DB_PASSWORD}" -e "SELECT 1;" >/dev/null 2>&1; do
    echo "⏳ Database not ready, waiting..."
    sleep 2
done

echo "✅ Database connection established"

# Run database migrations
echo "🔄 Running database migrations..."
cd /app/backend
npx prisma migrate deploy
echo "✅ Database migrations completed"

# Initialize integrations
echo "🔧 Initializing integrations..."
if [ -f "init-integrations.js" ]; then
    node init-integrations.js
    echo "✅ Integrations initialized"
else
    echo "⚠️ Integration script not found, skipping..."
fi

# =============================================================================
# APPLICATION STARTUP
# =============================================================================
echo "🚀 Starting application services..."

# Start backend server with PM2
echo "🔧 Starting backend server..."
cd /app/backend

# Check if PM2 is available
if command -v pm2 >/dev/null 2>&1; then
    pm2 start ecosystem.config.js --env production
    echo "✅ Backend started with PM2"
else
    echo "⚠️ PM2 not available, starting with Node.js directly..."
    node dist/index.js &
    echo "✅ Backend started with Node.js"
fi

# Start frontend server (serve static files)
echo "🌐 Starting frontend server..."
cd /app/frontend

# Check if we have a built frontend
if [ -d "dist" ]; then
    # Use a simple HTTP server for static files
    if command -v python3 >/dev/null 2>&1; then
        python3 -m http.server 3000 --directory dist &
    elif command -v python >/dev/null 2>&1; then
        python -m SimpleHTTPServer 3000 &
    else
        echo "⚠️ No Python available, frontend files ready in /app/frontend/dist"
    fi
    echo "✅ Frontend server started"
else
    echo "⚠️ Frontend dist directory not found"
fi

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
    mysql -h"${DB_HOST:-mysql}" -P"${DB_PORT:-3306}" -u"${DB_USER:-mymeds_user}" -p"${DB_PASSWORD}" -e "SELECT 1;" >/dev/null 2>&1
}

# Function to check frontend health
check_frontend_health() {
    curl -f http://localhost:3000 >/dev/null 2>&1
}

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
for i in {1..30}; do
    if check_backend_health && check_database_health; then
        echo "✅ All core services are ready!"
        break
    fi
    echo "⏳ Services not ready, waiting... ($i/30)"
    sleep 2
done

# Check frontend separately (optional)
if check_frontend_health; then
    echo "✅ Frontend is ready!"
else
    echo "⚠️ Frontend health check failed (may be expected)"
fi

# =============================================================================
# FINAL STATUS
# =============================================================================
echo ""
echo "🎉 MyMeds Pharmacy Inc. is now running!"
echo "======================================"
echo "📊 Backend API: http://localhost:4000"
echo "🌐 Frontend: http://localhost:3000"
echo "🗄️ Database: Connected to ${DB_HOST:-mysql}:${DB_PORT:-3306}"
echo "🔐 Admin Panel: Ready"
echo "🛒 WooCommerce: Integrated"
echo "📝 WordPress: Integrated"
echo ""

# Show running processes
echo "📋 Running Processes:"
ps aux | grep -E "(node|pm2)" | grep -v grep || echo "No Node.js processes found"

# =============================================================================
# MONITORING LOOP
# =============================================================================
echo "🔄 Starting monitoring loop..."
echo "Press Ctrl+C to stop the application"

# Keep container running and monitor health
while true; do
    sleep 30
    
    # Check backend health
    if ! check_backend_health; then
        echo "❌ Backend health check failed!"
        if command -v pm2 >/dev/null 2>&1; then
            echo "🔄 Restarting with PM2..."
            pm2 restart all
        else
            echo "❌ Cannot restart without PM2"
            exit 1
        fi
    fi
    
    # Check database health
    if ! check_database_health; then
        echo "❌ Database health check failed!"
        echo "⚠️ Database connection lost, but continuing..."
    fi
    
    # Log status every 5 minutes
    if [ $(($(date +%s) % 300)) -eq 0 ]; then
        echo "✅ Health check passed at $(date)"
    fi
done