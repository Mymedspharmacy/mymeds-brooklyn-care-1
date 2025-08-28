#!/bin/bash

# Automated Sync Setup Script for MyMeds Pharmacy
# This script sets up cron jobs and automation for WooCommerce/WordPress sync

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="mymeds-pharmacy"
APP_DIR="/var/www/mymeds-production"
SCRIPT_NAME="automated-sync.cjs"
LOG_DIR="/var/log/mymeds"
CRON_USER="root"

echo -e "${BLUE}🚀 Setting up Automated Sync for MyMeds Pharmacy${NC}"
echo "=================================================="

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ This script must be run as root${NC}"
   exit 1
fi

# Create log directory
echo -e "${YELLOW}📁 Creating log directory...${NC}"
mkdir -p "$LOG_DIR"
chown -R www-data:www-data "$LOG_DIR"
chmod 755 "$LOG_DIR"

# Copy automation script
echo -e "${YELLOW}📝 Copying automation script...${NC}"
if [ -f "$SCRIPT_NAME" ]; then
    cp "$SCRIPT_NAME" "$APP_DIR/"
    chmod +x "$APP_DIR/$SCRIPT_NAME"
    chown www-data:www-data "$APP_DIR/$SCRIPT_NAME"
    echo -e "${GREEN}✅ Script copied to $APP_DIR/$SCRIPT_NAME${NC}"
else
    echo -e "${RED}❌ Script file $SCRIPT_NAME not found in current directory${NC}"
    exit 1
fi

# Test the script
echo -e "${YELLOW}🧪 Testing automation script...${NC}"
cd "$APP_DIR"
if node "$SCRIPT_NAME" health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Script test passed${NC}"
else
    echo -e "${YELLOW}⚠️  Script test failed (this is normal if app is not running yet)${NC}"
fi

# Create environment file for the script
echo -e "${YELLOW}⚙️  Creating environment configuration...${NC}"
cat > "$APP_DIR/.env.sync" << EOF
# Automated Sync Environment Variables
APP_BASE_URL=https://www.mymedspharmacyinc.com
LOG_FILE=$LOG_DIR/auto-sync.log
NODE_ENV=production
EOF

chown www-data:www-data "$APP_DIR/.env.sync"
chmod 600 "$APP_DIR/.env.sync"

# Setup cron jobs
echo -e "${YELLOW}⏰ Setting up cron jobs...${NC}"

# Remove existing cron jobs for this app
(crontab -u "$CRON_USER" -l 2>/dev/null | grep -v "$SCRIPT_NAME" || true) | crontab -u "$CRON_USER" -

# Add new cron jobs
(crontab -u "$CRON_USER" -l 2>/dev/null; cat << EOF
# MyMeds Pharmacy Automated Sync
# Sync WooCommerce products every 15 minutes
*/15 * * * * cd $APP_DIR && /usr/bin/node $SCRIPT_NAME woocommerce >> $LOG_DIR/woocommerce-sync.log 2>&1

# Sync WordPress posts every 30 minutes
*/30 * * * * cd $APP_DIR && /usr/bin/node $SCRIPT_NAME wordpress >> $LOG_DIR/wordpress-sync.log 2>&1

# Full sync every hour (backup)
0 * * * * cd $APP_DIR && /usr/bin/node $SCRIPT_NAME >> $LOG_DIR/full-sync.log 2>&1

# Health check every 5 minutes
*/5 * * * * cd $APP_DIR && /usr/bin/node $SCRIPT_NAME health >> $LOG_DIR/health-check.log 2>&1

# Clear old logs weekly (keep last 30 days)
0 2 * * 0 find $LOG_DIR -name "*.log" -mtime +30 -delete
EOF
) | crontab -u "$CRON_USER" -

echo -e "${GREEN}✅ Cron jobs configured${NC}"

# Create log rotation configuration
echo -e "${YELLOW}📋 Setting up log rotation...${NC}"
cat > "/etc/logrotate.d/$APP_NAME" << EOF
$LOG_DIR/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        # Reload PM2 logs if needed
        if command -v pm2 >/dev/null 2>&1; then
            pm2 reloadLogs
        fi
    endscript
}
EOF

echo -e "${GREEN}✅ Log rotation configured${NC}"

# Create systemd service for monitoring (optional)
echo -e "${YELLOW}🔧 Creating systemd service for monitoring...${NC}"
cat > "/etc/systemd/system/$APP_NAME-sync.service" << EOF
[Unit]
Description=MyMeds Pharmacy Automated Sync Service
After=network.target

[Service]
Type=oneshot
User=www-data
WorkingDirectory=$APP_DIR
EnvironmentFile=$APP_DIR/.env.sync
ExecStart=/usr/bin/node $SCRIPT_NAME
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Create timer for the service
cat > "/etc/systemd/system/$APP_NAME-sync.timer" << EOF
[Unit]
Description=Run MyMeds Pharmacy sync every 15 minutes
Requires=$APP_NAME-sync.service

[Timer]
Unit=$APP_NAME-sync.service
OnCalendar=*:0/15
Persistent=true

[Install]
WantedBy=timers.target
EOF

# Enable and start the timer
systemctl daemon-reload
systemctl enable "$APP_NAME-sync.timer"
systemctl start "$APP_NAME-sync.timer"

echo -e "${GREEN}✅ Systemd service and timer configured${NC}"

# Create monitoring script
echo -e "${YELLOW}📊 Creating monitoring script...${NC}"
cat > "/usr/local/bin/$APP_NAME-monitor.sh" << 'EOF'
#!/bin/bash

# MyMeds Pharmacy Sync Monitor
APP_NAME="mymeds-pharmacy"
LOG_DIR="/var/log/mymeds"
ALERT_EMAIL="admin@mymedspharmacyinc.com"

# Check if sync is working
check_sync_status() {
    local log_file="$LOG_DIR/auto-sync.log"
    local last_sync=$(tail -n 50 "$log_file" 2>/dev/null | grep "sync completed" | tail -n 1 | cut -d' ' -f1,2)
    
    if [ -z "$last_sync" ]; then
        echo "ERROR: No recent sync activity found"
        return 1
    fi
    
    local last_sync_time=$(date -d "$last_sync" +%s 2>/dev/null)
    local current_time=$(date +%s)
    local time_diff=$((current_time - last_sync_time))
    
    # Alert if last sync was more than 2 hours ago
    if [ $time_diff -gt 7200 ]; then
        echo "WARNING: Last sync was $((time_diff / 3600)) hours ago"
        return 1
    fi
    
    echo "OK: Last sync was $((time_diff / 60)) minutes ago"
    return 0
}

# Check disk space
check_disk_space() {
    local disk_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ $disk_usage -gt 80 ]; then
        echo "WARNING: Disk usage is ${disk_usage}%"
        return 1
    fi
    
    echo "OK: Disk usage is ${disk_usage}%"
    return 0
}

# Check log file sizes
check_log_sizes() {
    local large_logs=$(find "$LOG_DIR" -name "*.log" -size +100M 2>/dev/null)
    
    if [ -n "$large_logs" ]; then
        echo "WARNING: Large log files detected:"
        echo "$large_logs"
        return 1
    fi
    
    echo "OK: Log file sizes are normal"
    return 0
}

# Main monitoring
main() {
    echo "=== MyMeds Pharmacy Sync Monitor ==="
    echo "Time: $(date)"
    echo ""
    
    local overall_status=0
    
    echo "1. Checking sync status..."
    if ! check_sync_status; then
        overall_status=1
    fi
    echo ""
    
    echo "2. Checking disk space..."
    if ! check_disk_space; then
        overall_status=1
    fi
    echo ""
    
    echo "3. Checking log files..."
    if ! check_log_sizes; then
        overall_status=1
    fi
    echo ""
    
    if [ $overall_status -eq 0 ]; then
        echo "✅ All systems operational"
    else
        echo "⚠️  Issues detected - check logs for details"
        # Send alert email if configured
        if command -v mail >/dev/null 2>&1; then
            echo "Sending alert email to $ALERT_EMAIL"
            echo "MyMeds Pharmacy sync issues detected at $(date)" | mail -s "Sync Alert" "$ALERT_EMAIL"
        fi
    fi
}

main "$@"
EOF

chmod +x "/usr/local/bin/$APP_NAME-monitor.sh"

# Add monitoring to crontab
(crontab -u "$CRON_USER" -l 2>/dev/null; echo "# Monitor sync status every hour
0 * * * * /usr/local/bin/$APP_NAME-monitor.sh >> $LOG_DIR/monitor.log 2>&1") | crontab -u "$CRON_USER" -

echo -e "${GREEN}✅ Monitoring script configured${NC}"

# Test the setup
echo -e "${YELLOW}🧪 Testing the setup...${NC}"

# Test cron jobs
if crontab -u "$CRON_USER" -l | grep -q "$SCRIPT_NAME"; then
    echo -e "${GREEN}✅ Cron jobs are configured${NC}"
else
    echo -e "${RED}❌ Cron jobs not found${NC}"
fi

# Test monitoring script
if [ -x "/usr/local/bin/$APP_NAME-monitor.sh" ]; then
    echo -e "${GREEN}✅ Monitoring script is executable${NC}"
else
    echo -e "${RED}❌ Monitoring script not found or not executable${NC}"
fi

# Show current cron jobs
echo -e "${BLUE}📅 Current cron jobs:${NC}"
crontab -u "$CRON_USER" -l | grep "$SCRIPT_NAME" || echo "No cron jobs found"

# Show log files
echo -e "${BLUE}📁 Log files will be created in:${NC}"
echo "  - $LOG_DIR/auto-sync.log (main sync logs)"
echo "  - $LOG_DIR/woocommerce-sync.log (WooCommerce sync)"
echo "  - $LOG_DIR/wordpress-sync.log (WordPress sync)"
echo "  - $LOG_DIR/health-check.log (health checks)"
echo "  - $LOG_DIR/monitor.log (monitoring)"

# Show manual commands
echo -e "${BLUE}🔧 Manual commands:${NC}"
echo "  - Test sync: cd $APP_DIR && node $SCRIPT_NAME"
echo "  - Test WooCommerce: cd $APP_DIR && node $SCRIPT_NAME woocommerce"
echo "  - Test WordPress: cd $APP_DIR && node $SCRIPT_NAME wordpress"
echo "  - Health check: cd $APP_DIR && node $SCRIPT_NAME health"
echo "  - Monitor: /usr/local/bin/$APP_NAME-monitor.sh"

echo ""
echo -e "${GREEN}🎉 Automated sync setup completed successfully!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Ensure your WooCommerce and WordPress integrations are configured in the admin panel"
echo "2. Test the sync manually: cd $APP_DIR && node $SCRIPT_NAME"
echo "3. Monitor logs: tail -f $LOG_DIR/auto-sync.log"
echo "4. Check cron jobs: crontab -l"
echo "5. The system will now automatically sync every 15-30 minutes"
echo ""
echo -e "${BLUE}Your admin panel will continue to show:${NC}"
echo "  ✅ All existing orders and customer data"
echo "  ✅ Sync status and logs"
echo "  ✅ Manual sync controls"
echo "  ✅ Settings management"
echo "  ✅ All other admin features"
echo ""
echo -e "${GREEN}The automation runs in the background without affecting admin functionality!${NC}"
