#!/bin/bash

# Railway PostgreSQL Collation Fix Script
# This script can be run in Railway's deployment environment

echo "🔧 Railway PostgreSQL Collation Fix Script"
echo "=========================================="
echo ""

# Check if we're in Railway environment
if [ -n "$RAILWAY_ENVIRONMENT" ]; then
    echo "✅ Running in Railway environment: $RAILWAY_ENVIRONMENT"
else
    echo "⚠️  Not running in Railway environment"
fi

echo ""

# Check if DATABASE_URL is available
if [ -n "$DATABASE_URL" ]; then
    echo "✅ DATABASE_URL is configured"
    echo "Database: $(echo $DATABASE_URL | sed 's/.*@//' | sed 's/:.*//')"
else
    echo "❌ DATABASE_URL not found"
    echo "Please ensure your Railway service has the DATABASE_URL variable set"
    exit 1
fi

echo ""

# Install PostgreSQL client if not available
if ! command -v psql &> /dev/null; then
    echo "📦 Installing PostgreSQL client..."
    apt-get update && apt-get install -y postgresql-client
fi

echo ""

# Extract database connection details
DB_HOST=$(echo $DATABASE_URL | sed 's/.*@//' | sed 's/:.*//')
DB_PORT=$(echo $DATABASE_URL | sed 's/.*://' | sed 's/\/.*//' | sed 's/.*://')
DB_NAME=$(echo $DATABASE_URL | sed 's/.*\///')
DB_USER=$(echo $DATABASE_URL | sed 's/.*:\/\/\([^:]*\):.*/\1/')
DB_PASS=$(echo $DATABASE_URL | sed 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/')

echo "🔍 Database Connection Details:"
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo ""

# Test database connection
echo "📡 Testing database connection..."
if PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT version();" > /dev/null 2>&1; then
    echo "✅ Database connection successful!"
else
    echo "❌ Database connection failed"
    exit 1
fi

echo ""

# Check current collation version
echo "🔍 Checking current collation version..."
COLLATION_STATUS=$(PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "
SELECT 
    datname as database_name,
    datcollversion as collation_version
FROM pg_database 
WHERE datname = current_database();
")

echo "📊 Current Collation Status:"
echo "$COLLATION_STATUS"
echo ""

# Check system collation version
SYSTEM_COLLATION=$(PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "
SELECT collversion as system_collation_version
FROM pg_collation 
WHERE collname = 'default';
")

echo "🔧 System Collation Version:"
echo "$SYSTEM_COLLATION"
echo ""

# Attempt to fix collation issue
echo "🔄 Attempting to fix collation version mismatch..."
if PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "ALTER DATABASE $DB_NAME REFRESH COLLATION VERSION;" > /dev/null 2>&1; then
    echo "✅ Collation version refreshed successfully!"
    
    # Verify the fix
    echo ""
    echo "🔍 Verifying the fix..."
    NEW_COLLATION_STATUS=$(PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "
    SELECT 
        datname as database_name,
        datcollversion as collation_version
    FROM pg_database 
    WHERE datname = current_database();
    ")
    
    echo "📊 Updated Collation Status:"
    echo "$NEW_COLLATION_STATUS"
    
    echo ""
    echo "🎉 SUCCESS: Collation version mismatch has been resolved!"
    
else
    echo "❌ Failed to refresh collation version"
    echo ""
    echo "💡 Alternative solutions:"
    echo "1. Check if you have sufficient database permissions"
    echo "2. Consider recreating the database with correct collation"
    echo "3. Contact Railway support if the issue persists"
fi

echo ""
echo "🔌 Script completed."
