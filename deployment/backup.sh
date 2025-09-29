#!/bin/bash

# MyMeds Backup Script
BACKUP_DIR="/var/backups/mymeds"
DATE=$(date +%Y%m%d_%H%M%S)

echo "📦 Creating backup..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u mymeds_user -p'MyMeds2025!SecurePassword' mymeds_db > $BACKUP_DIR/mymeds_db_$DATE.sql

# Backup WordPress database
mysqldump -u wp_user -p'WordPress2025!SecurePassword' wordpress_db > $BACKUP_DIR/wordpress_db_$DATE.sql

# Backup application files
tar -czf $BACKUP_DIR/mymeds_app_$DATE.tar.gz /var/www/mymeds

# Backup WordPress files
tar -czf $BACKUP_DIR/wordpress_$DATE.tar.gz /var/www/wordpress

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "✅ Backup completed: $BACKUP_DIR"
