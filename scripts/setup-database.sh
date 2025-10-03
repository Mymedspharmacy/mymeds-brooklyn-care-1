#!/bin/bash

# =============================================================================
# MyMeds Database Setup Script
# =============================================================================
# This script sets up MySQL database for MyMeds Pharmacy Inc.
# Domain: mymedspharmacyinc.com
# VPS: 72.60.116.253
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="mymeds_production"
DB_USER="mymeds_user"
MYSQL_ROOT_PASSWORD=""
DB_PASSWORD=""

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to generate secure password
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-25
}

# Function to check if MySQL is installed
check_mysql() {
    if command -v mysql >/dev/null 2>&1; then
        print_success "MySQL is already installed"
        return 0
    else
        print_status "MySQL not found. Installing..."
        return 1
    fi
}

# Function to install MySQL
install_mysql() {
    print_status "Installing MySQL Server..."
    
    # Update package list
    apt-get update
    
    # Set password for MySQL root user (non-interactive)
    echo "mysql-server mysql-server/root_password password $MYSQL_ROOT_PASSWORD" | debconf-set-selections
    echo "mysql-server mysql-server/root_password_again password $MYSQL_ROOT_PASSWORD" | debconf-set-selections
    
    # Install MySQL
    apt-get install -y mysql-server mysql-client
    
    # Start and enable MySQL
    systemctl start mysql
    systemctl enable mysql
    
    print_success "MySQL installed successfully"
}

# Function to secure MySQL installation
secure_mysql() {
    print_status "Securing MySQL installation..."
    
    # Run mysql_secure_installation equivalent
    mysql -u root -p"$MYSQL_ROOT_PASSWORD" <<EOF
DELETE FROM mysql.user WHERE User='';
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$MYSQL_ROOT_PASSWORD';
FLUSH PRIVILEGES;
EOF
    
    print_success "MySQL secured successfully"
}

# Function to create database and user
create_database_and_user() {
    print_status "Creating database and user..."
    
    mysql -u root -p"$MYSQL_ROOT_PASSWORD" <<EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
CREATE USER IF NOT EXISTS 'wp_mymeds'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
CREATE DATABASE IF NOT EXISTS wp_mymeds CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON wp_mymeds.* TO 'wp_mymeds'@'localhost';
FLUSH PRIVILEGES;
SHOW DATABASES;
SELECT User, Host FROM mysql.user WHERE User IN ('$DB_USER', 'wp_mymeds');
EOF
    
    print_success "Database and users created successfully"
}

# Function to create database credentials file
create_db_credentials() {
    print_status "Creating database credentials file..."
    
    cat > /var/www/mymeds/db-credentials.conf <<EOF
# MySQL Database Credentials for MyMeds Pharmacy Inc.
# Generated on: $(date)

# MyMeds Application Database
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# WordPress Database
WP_DB_NAME=wp_mymeds
WP_DB_USER=wp_mymeds
WP_DB_PASSWORD=$DB_PASSWORD

# MySQL Root Password
MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD

# Connection URLs
DATABASE_URL="mysql://$DB_USER:$DB_PASSWORD@localhost:3306/$DB_NAME"
WP_DATABASE_URL="mysql://wp_mymeds:$DB_PASSWORD@localhost:3306/wp_mymeds"
EOF
    
    # Secure the credentials file
    chmod 600 /var/www/mymeds/db-credentials.conf
    chown root:root /var/www/mymeds/db-credentials.conf
    
    print_success "Database credentials saved to /var/www/mymeds/db-credentials.conf"
}

# Function to setup database backup
setup_db_backup() {
    print_status "Setting up automated database backup..."
    
    # Create backup directory
    mkdir -p /backups/mysql
    
    # Create backup script
    cat > /usr/local/bin/mymeds-db-backup.sh <<EOF
#!/bin/bash
BACKUP_DIR="/backups/mysql"
DATE=\$(date +%Y%m%d_%H%M%S)
LOG_FILE="/var/log/mymeds-backup.log"

echo "\$(date): Starting MyMeds database backup" >> \$LOG_FILE

# Backup MyMeds database
mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > \$BACKUP_DIR/mymeds_\$DATE.sql

# Backup WordPress database
mysqldump -u wp_mymeds -p$DB_PASSWORD wp_mymeds > \$BACKUP_DIR/wp_mymeds_\$DATE.sql

# Compress backups
gzip \$BACKUP_DIR/mymeds_\$DATE.sql
gzip \$BACKUP_DIR/wp_mymeds_\$DATE.sql

# Keep only last 7 days of backups
find \$BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "\$(date): Database backup completed" >> \$LOG_FILE
EOF
    
    chmod +x /usr/local/bin/mymeds-db-backup.sh
    
    # Setup cron job for daily backups at 2 AM
    echo "0 2 * * * /usr/local/bin/mymeds-db-backup.sh" | crontab -
    
    # Test backup
    /usr/local/bin/mymeds-db-backup.sh
    
    print_success "Database backup system configured"
}

# Function to test database connection
test_connection() {
    print_status "Testing database connections..."
    
    # Test MyMeds database
    mysql -u "$DB_USER" -p"$DB_PASSWORD" -e "USE $DB_NAME; SHOW TABLES;" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        print_success "MyMeds database connection successful"
    else
        print_error "MyMeds database connection failed"
        exit 1
    fi
    
    # Test WordPress database
    mysql -u "wp_mymeds" -p"$DB_PASSWORD" -e "USE wp_mymeds; SHOW TABLES;" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        print_success "WordPress database connection successful"
    else
        print_error "WordPress database connection failed"
        exit 1
    fi
}

# Main execution
main() {
    echo "=========================================="
    echo "  MyMeds Database Setup Script"
    echo "  Domain: mymedspharmacyinc.com"
    echo "  Date: $(date)"
    echo "=========================================="
    
    # Generate secure passwords
    MYSQL_ROOT_PASSWORD=$(generate_password)
    DB_PASSWORD=$(generate_password)
    
    print_status "Generated secure passwords"
    print_warning "Save these passwords securely:"
    echo "MySQL Root Password: $MYSQL_ROOT_PASSWORD"
    echo "Database Password: $DB_PASSWORD"
    echo ""
    
    # Create application directory
    mkdir -p /var/www/mymeds
    
    # Check and install MySQL
    if ! check_mysql; then
        install_mysql
    fi
    
    # Secure MySQL
    secure_mysql
    
    # Create database and user
    create_database_and_user
    
    # Create credentials file
    create_db_credentials
    
    # Setup backup system
    setup_db_backup
    
    # Test connections
    test_connection
    
    echo ""
    print_success "Database setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Run the WordPress setup script: ./setup-wordpress.sh"
    echo "2. Run the application setup script: ./setup-application.sh"
    echo "3. Configure SSL certificates: ./setup-ssl.sh"
}

# Run main function
main "$@"

