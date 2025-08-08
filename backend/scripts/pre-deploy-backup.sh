#!/bin/bash

echo "Creating pre-deployment backup..."

# Create backup directory
mkdir -p backups/pre-deploy

# Database backup
node scripts/backup-database.js

# File backup
node scripts/backup-files.js

# Environment backup
node scripts/backup-env.js

echo "Pre-deployment backup completed!"
