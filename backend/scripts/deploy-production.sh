#!/bin/bash

echo "Starting production deployment..."

# Stop current application
pm2 stop mymeds-backend || true

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Build application
npm run build

# Start application
pm2 start ecosystem.config.js --env production

# Check health
sleep 10
curl -f http://localhost:4000/api/health || exit 1

echo "Production deployment completed successfully!"
