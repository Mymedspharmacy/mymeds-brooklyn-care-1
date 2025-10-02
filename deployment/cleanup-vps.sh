#!/bin/bash

# MyMeds VPS Cleanup Script - Preserves WordPress
set -e

echo "🧹 Cleaning up previous MyMeds deployment (preserving WordPress)..."

# Stop PM2 processes
echo "Stopping PM2 processes..."
pm2 stop all || true
pm2 delete all || true

# Remove MyMeds application files (preserve WordPress)
echo "Removing MyMeds application files..."
sudo rm -rf /var/www/mymeds

# Remove MyMeds database (preserve WordPress database)
echo "Removing MyMeds database..."
sudo mysql -e "DROP DATABASE IF EXISTS mymeds_db;"
sudo mysql -e "DROP USER IF EXISTS 'mymeds_user'@'localhost';"

# Remove MyMeds logs
echo "Cleaning up logs..."
sudo rm -rf /var/log/mymeds || true

# Remove MyMeds backups
echo "Cleaning up backups..."
sudo rm -rf /var/backups/mymeds || true

# Remove MyMeds cron jobs
echo "Removing MyMeds cron jobs..."
crontab -l | grep -v "mymeds" | crontab - || true

# Remove MyMeds systemd services (if any)
echo "Removing systemd services..."
sudo systemctl stop mymeds || true
sudo systemctl disable mymeds || true
sudo rm -f /etc/systemd/system/mymeds.service || true
sudo systemctl daemon-reload

# Clean up PM2
echo "Cleaning up PM2..."
pm2 kill || true
pm2 unstartup || true

# Remove Node.js modules (optional - uncomment if you want to clean everything)
# echo "Removing Node.js modules..."
# sudo rm -rf /usr/lib/node_modules/pm2 || true
# sudo rm -rf /usr/lib/node_modules/npm || true

# Clean up temporary files
echo "Cleaning up temporary files..."
sudo rm -rf /tmp/mymeds* || true
sudo rm -rf /var/tmp/mymeds* || true

# Verify WordPress is still intact
echo "Verifying WordPress installation..."
if [ -d "/var/www/wordpress" ]; then
    echo "✅ WordPress directory preserved: /var/www/wordpress"
    if [ -f "/var/www/wordpress/wp-config.php" ]; then
        echo "✅ WordPress configuration preserved"
    else
        echo "⚠️  WordPress wp-config.php not found"
    fi
else
    echo "⚠️  WordPress directory not found at /var/www/wordpress"
fi

# Check WordPress database
echo "Checking WordPress database..."
if sudo mysql -e "USE wordpress; SELECT 1;" >/dev/null 2>&1; then
    echo "✅ WordPress database preserved"
else
    echo "⚠️  WordPress database not found or not accessible"
fi

# Clean up Nginx configuration (remove MyMeds specific configs)
echo "Cleaning up Nginx configuration..."
if [ -f "/etc/nginx/sites-available/mymeds" ]; then
    sudo rm -f /etc/nginx/sites-available/mymeds
    sudo rm -f /etc/nginx/sites-enabled/mymeds
    sudo nginx -t && sudo systemctl reload nginx
    echo "✅ MyMeds Nginx configuration removed"
fi

# Clean up SSL certificates (preserve WordPress SSL)
echo "Checking SSL certificates..."
if [ -d "/etc/letsencrypt/live/mymedspharmacyinc.com" ]; then
    echo "✅ SSL certificates preserved for mymedspharmacyinc.com"
else
    echo "⚠️  SSL certificates not found for mymedspharmacyinc.com"
fi

# Clean up system logs
echo "Cleaning up system logs..."
sudo journalctl --vacuum-time=7d || true

# Final verification
echo ""
echo "🧹 Cleanup completed!"
echo ""
echo "Preserved:"
echo "  ✅ WordPress files: /var/www/wordpress"
echo "  ✅ WordPress database: wordpress"
echo "  ✅ SSL certificates: /etc/letsencrypt/live/mymedspharmacyinc.com"
echo "  ✅ Nginx (WordPress configs)"
echo ""
echo "Removed:"
echo "  ❌ MyMeds application: /var/www/mymeds"
echo "  ❌ MyMeds database: mymeds_db"
echo "  ❌ MyMeds user: mymeds_user"
echo "  ❌ PM2 processes"
echo "  ❌ MyMeds logs and backups"
echo "  ❌ MyMeds cron jobs"
echo ""
echo "Next steps:"
echo "1. Clone the new repository"
echo "2. Run the MySQL setup script"
echo "3. Deploy the new application"
echo "4. Configure environment variables"
echo ""
echo "WordPress should still be accessible at: https://mymedspharmacyinc.com"


