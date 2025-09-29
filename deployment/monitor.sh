#!/bin/bash

# MyMeds Monitoring Script
echo "📊 MyMeds System Status"
echo "======================"

# Check services
echo "Services:"
systemctl is-active nginx && echo "✅ Nginx: Active" || echo "❌ Nginx: Inactive"
systemctl is-active mysql && echo "✅ MySQL: Active" || echo "❌ MySQL: Inactive"
systemctl is-active php8.1-fpm && echo "✅ PHP-FPM: Active" || echo "❌ PHP-FPM: Inactive"

# Check PM2 processes
echo -e "\nPM2 Processes:"
pm2 status

# Check disk space
echo -e "\nDisk Usage:"
df -h /var/www

# Check memory usage
echo -e "\nMemory Usage:"
free -h

# Check SSL certificate
echo -e "\nSSL Certificate:"
certbot certificates

# Check logs
echo -e "\nRecent Errors:"
tail -n 10 /var/log/mymeds/backend-error.log 2>/dev/null || echo "No error logs found"
