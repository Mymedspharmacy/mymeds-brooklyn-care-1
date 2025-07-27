#!/bin/bash

# Wait for database to be ready (optional)
echo "Waiting for database to be ready..."
sleep 5

# Run Prisma migrations (with error handling)
echo "Running Prisma migrations..."
if npx prisma migrate deploy; then
    echo "Migrations completed successfully"
else
    echo "Warning: Migrations failed, but continuing with startup..."
fi

# Start the application
echo "Starting application..."
npm start 