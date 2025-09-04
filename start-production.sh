#!/bin/bash
# Production Start Script for MyMeds Pharmacy
# Generated: September 4, 2025

echo "🚀 Starting MyMeds Pharmacy Production Server..."

# Set environment
export NODE_ENV=production

# Check if database is ready
echo "📊 Checking database connection..."
cd backend
npx prisma db push --accept-data-loss

# Start the server
echo "🌐 Starting server on port 4000..."
npm run start:prod

echo "✅ Production server started successfully!"
