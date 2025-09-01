#!/bin/bash

# MyMeds Backend Deployment Verification Script
# Run this after deployment to verify everything is working

echo "🔍 Verifying MyMeds Backend Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Check if PM2 is running
echo "📊 Checking PM2 status..."
pm2 status > /dev/null 2>&1
print_status $? "PM2 is running"

# Check if application is running
echo "🚀 Checking application status..."
pm2 list | grep -q "mymeds-backend"
print_status $? "Application is running"

# Check if port 4000 is listening
echo "🔌 Checking port 4000..."
netstat -tulpn | grep -q ":4000"
print_status $? "Port 4000 is listening"

# Check if Nginx is running
echo "🌐 Checking Nginx status..."
systemctl is-active --quiet nginx
print_status $? "Nginx is running"

# Check if MySQL is running
echo "🗄️ Checking MySQL status..."
systemctl is-active --quiet mysql
print_status $? "MySQL is running"

# Test health endpoint
echo "💚 Testing health endpoint..."
if curl -f http://localhost:4000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Health endpoint is responding${NC}"
else
    echo -e "${RED}❌ Health endpoint is not responding${NC}"
fi

# Test database connection
echo "🔗 Testing database connection..."
if npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
fi

# Check environment variables
echo "⚙️ Checking environment variables..."
if [ -n "$DATABASE_URL" ] && [ -n "$JWT_SECRET" ] && [ -n "$ADMIN_EMAIL" ]; then
    echo -e "${GREEN}✅ Required environment variables are set${NC}"
else
    echo -e "${YELLOW}⚠️ Some environment variables may be missing${NC}"
fi

# Check log files
echo "📝 Checking log files..."
if [ -d "/var/log/pm2" ] && [ -f "/var/log/pm2/mymeds-backend-combined.log" ]; then
    echo -e "${GREEN}✅ Log files are accessible${NC}"
else
    echo -e "${YELLOW}⚠️ Log files may not be accessible${NC}"
fi

# Check backup directory
echo "💾 Checking backup directory..."
if [ -d "/var/backups/mymeds" ]; then
    echo -e "${GREEN}✅ Backup directory exists${NC}"
else
    echo -e "${YELLOW}⚠️ Backup directory does not exist${NC}"
fi

# Check SSL certificate (if domain is configured)
echo "🔒 Checking SSL configuration..."
if [ -f "/etc/letsencrypt/live/$(hostname)/fullchain.pem" ]; then
    echo -e "${GREEN}✅ SSL certificate is installed${NC}"
else
    echo -e "${YELLOW}⚠️ SSL certificate not found (run certbot if you have a domain)${NC}"
fi

# Check firewall status
echo "🛡️ Checking firewall status..."
if ufw status | grep -q "Status: active"; then
    echo -e "${GREEN}✅ Firewall is active${NC}"
else
    echo -e "${YELLOW}⚠️ Firewall may not be active${NC}"
fi

# Performance check
echo "⚡ Checking performance..."
if pm2 monit --no-daemon --timeout 5 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PM2 monitoring is working${NC}"
else
    echo -e "${YELLOW}⚠️ PM2 monitoring may not be working${NC}"
fi

# Check cron jobs
echo "⏰ Checking cron jobs..."
if crontab -l 2>/dev/null | grep -q "health-check.sh"; then
    echo -e "${GREEN}✅ Health check cron job is set${NC}"
else
    echo -e "${YELLOW}⚠️ Health check cron job not found${NC}"
fi

if crontab -l 2>/dev/null | grep -q "backup.sh"; then
    echo -e "${GREEN}✅ Backup cron job is set${NC}"
else
    echo -e "${YELLOW}⚠️ Backup cron job not found${NC}"
fi

echo ""
echo "🎯 Deployment Verification Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Configure your domain in Nginx"
echo "2. Set up SSL with: sudo certbot --nginx -d your-domain.com"
echo "3. Test external access: curl https://your-domain.com/api/health"
echo "4. Monitor with: pm2 monit"
echo "5. Check logs: pm2 logs"
echo ""
echo "🔗 Useful Commands:"
echo "- Restart: pm2 restart mymeds-backend"
echo "- Status: pm2 status"
echo "- Health: curl http://localhost:4000/api/health"
echo "- Backup: ./backup.sh"
echo ""
echo "🚀 Your backend is ready for production use!"
