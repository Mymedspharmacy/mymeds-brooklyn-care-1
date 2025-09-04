#!/bin/bash

# MyMeds Pharmacy VPS Settings
# Update these values with your actual VPS details

export VPS_USER="root"
export VPS_HOST="72.60.116.253"
export VPS_PATH="/var/www/mymeds"
export BACKUP_PATH="/var/www/backups"

echo "VPS Settings loaded:"
echo "  User: $VPS_USER"
echo "  Host: $VPS_HOST"
echo "  Path: $VPS_PATH"
echo "  Backup: $BACKUP_PATH"
echo ""
