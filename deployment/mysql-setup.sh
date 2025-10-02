#!/bin/bash

# MySQL Setup Script for MyMeds VPS Deployment
set -e

echo "🗄️ Setting up MySQL for MyMeds Pharmacy..."

# Update system
sudo apt update

# Install MySQL Server
sudo apt install -y mysql-server

# Start and enable MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure MySQL installation
sudo mysql_secure_installation

# Create database and user
sudo mysql -e "CREATE DATABASE IF NOT EXISTS mymeds_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'mymeds_user'@'localhost' IDENTIFIED BY 'MyMeds2025!SecurePassword';"
sudo mysql -e "GRANT ALL PRIVILEGES ON mymeds_db.* TO 'mymeds_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# Configure MySQL for better performance
sudo tee /etc/mysql/mysql.conf.d/mymeds.cnf > /dev/null <<EOF
[mysqld]
# MyMeds Pharmacy MySQL Configuration
innodb_buffer_pool_size = 256M
innodb_log_file_size = 64M
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT
max_connections = 200
query_cache_size = 32M
query_cache_type = 1
tmp_table_size = 32M
max_heap_table_size = 32M
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2
EOF

# Restart MySQL
sudo systemctl restart mysql

# Create backup directory
sudo mkdir -p /var/backups/mymeds
sudo chown mysql:mysql /var/backups/mymeds

# Create backup script
sudo tee /usr/local/bin/mymeds-backup.sh > /dev/null <<'EOF'
#!/bin/bash
# MyMeds Database Backup Script
BACKUP_DIR="/var/backups/mymeds"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/mymeds_backup_$DATE.sql"

# Create backup
mysqldump -u mymeds_user -p'MyMeds2025!SecurePassword' mymeds_db > "$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_FILE"

# Keep only last 7 days of backups
find "$BACKUP_DIR" -name "mymeds_backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE.gz"
EOF

sudo chmod +x /usr/local/bin/mymeds-backup.sh

# Add to crontab for daily backups
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/mymeds-backup.sh") | crontab -

echo "✅ MySQL setup complete!"
echo "Database: mymeds_db"
echo "User: mymeds_user"
echo "Password: MyMeds2025!SecurePassword"
echo "Connection: mysql://mymeds_user:MyMeds2025!SecurePassword@localhost:3306/mymeds_db"


