# 🚀 MyMeds Pharmacy - Production Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Environment Configuration
- [ ] **Database**: MySQL configured and accessible
- [ ] **Environment Variables**: All production env vars set
- [ ] **SSL Certificates**: Valid SSL certificates installed
- [ ] **Domain**: Domain configured and DNS pointing to server
- [ ] **Email**: SMTP credentials configured
- [ ] **WooCommerce**: Production API keys configured
- [ ] **WordPress**: Production credentials configured

### ✅ Security Checklist
- [ ] **JWT Secrets**: Strong, unique secrets generated
- [ ] **Database Passwords**: Strong passwords set
- [ ] **Admin Credentials**: Secure admin account created
- [ ] **Rate Limiting**: Enabled for production
- [ ] **CORS**: Properly configured for production domains
- [ ] **HTTPS**: SSL/TLS configured
- [ ] **Firewall**: Server firewall configured
- [ ] **Backup**: Automated backup system configured

### ✅ Performance Checklist
- [ ] **Database**: Optimized and indexed
- [ ] **Caching**: Redis or in-memory caching configured
- [ ] **CDN**: Static assets served via CDN
- [ ] **Compression**: Gzip compression enabled
- [ ] **Monitoring**: Application monitoring configured
- [ ] **Logging**: Centralized logging configured

## 🛠️ Server Setup

### 1. VPS Configuration
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y nginx mysql-server redis-server nodejs npm git curl

# Install PM2 globally
sudo npm install -g pm2

# Create application user
sudo useradd -m -s /bin/bash mymeds
sudo usermod -aG sudo mymeds
```

### 2. MySQL Database Setup
```sql
-- Create database and user
CREATE DATABASE mymeds_production;
CREATE USER 'mymeds_user'@'localhost' IDENTIFIED BY 'pMyMedsSecurePassword2024!';
GRANT ALL PRIVILEGES ON mymeds_production.* TO 'mymeds_user'@'localhost';
FLUSH PRIVILEGES;

-- Create indexes for performance
USE mymeds_production;
CREATE INDEX idx_users_email ON User(email);
CREATE INDEX idx_orders_status ON Order(status);
CREATE INDEX idx_prescriptions_user ON Prescription(userId);
CREATE INDEX idx_appointments_date ON Appointment(date);
```

### 3. Nginx Configuration
```nginx
# /etc/nginx/sites-available/mymeds
server {
    listen 80;
    server_name mymedspharmacyinc.com www.mymedspharmacyinc.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mymedspharmacyinc.com www.mymedspharmacyinc.com;

    # SSL Configuration
    ssl_certificate /etc/ssl/certs/mymedspharmacyinc.com.crt;
    ssl_certificate_key /etc/ssl/private/mymedspharmacyinc.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Frontend (React App)
    location / {
        root /var/www/mymeds/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Rate limiting
        limit_req zone=api burst=20 nodelay;
        limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:4000/api/health;
        access_log off;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
}
```

### 4. SSL Certificate Setup
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d mymedspharmacyinc.com -d www.mymedspharmacyinc.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📦 Application Deployment

### 1. Frontend Deployment
```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/yourusername/mymeds-brooklyn-care.git mymeds
sudo chown -R mymeds:mymeds mymeds

# Install dependencies
cd mymeds
npm install

# Build for production
npm run build

# Copy to web directory
sudo cp -r dist/* /var/www/mymeds/frontend/dist/
```

### 2. Backend Deployment
```bash
# Install dependencies
cd backend
npm install

# Set environment variables
cp env.production .env

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Build application
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 3. Environment Variables
```bash
# Backend .env file
NODE_ENV=production
PORT=4000
HOST=0.0.0.0
DATABASE_URL="mysql://mymeds_user:pMyMedsSecurePassword2024!@localhost:3306/mymeds_production"
JWT_SECRET="your-64-character-jwt-secret-here"
JWT_REFRESH_SECRET="your-64-character-refresh-secret-here"
CORS_ORIGINS="https://www.mymedspharmacyinc.com,https://mymedspharmacyinc.com"
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=mymedspharmacyinc@gmail.com
SMTP_PASS=your-app-password-here
```

## 🔧 Configuration Files

### 1. PM2 Ecosystem Config
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'mymeds-backend',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    log_file: '/var/log/mymeds/combined.log',
    out_file: '/var/log/mymeds/out.log',
    error_file: '/var/log/mymeds/error.log',
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    watch: false,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

### 2. Log Rotation
```bash
# /etc/logrotate.d/mymeds
/var/log/mymeds/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 mymeds mymeds
    postrotate
        pm2 reloadLogs
    endscript
}
```

## 🔍 Monitoring & Maintenance

### 1. Health Checks
```bash
# Create health check script
cat > /usr/local/bin/mymeds-health << 'EOF'
#!/bin/bash
curl -f http://localhost:4000/api/health || exit 1
EOF
chmod +x /usr/local/bin/mymeds-health

# Add to crontab
*/5 * * * * /usr/local/bin/mymeds-health
```

### 2. Backup Script
```bash
# Create backup script
cat > /usr/local/bin/mymeds-backup << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/mymeds"
mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u mymeds_user -p'pMyMedsSecurePassword2024!' mymeds_production > $BACKUP_DIR/db_$DATE.sql

# Application backup
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/mymeds

# Clean old backups (keep 30 days)
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
EOF
chmod +x /usr/local/bin/mymeds-backup

# Add to crontab (daily at 2 AM)
0 2 * * * /usr/local/bin/mymeds-backup
```

### 3. Performance Monitoring
```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Monitor logs
tail -f /var/log/mymeds/combined.log

# Check PM2 status
pm2 status
pm2 monit
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check MySQL status
   sudo systemctl status mysql
   
   # Test connection
   mysql -u mymeds_user -p mymeds_production
   ```

2. **PM2 Issues**
   ```bash
   # Restart application
   pm2 restart mymeds-backend
   
   # Check logs
   pm2 logs mymeds-backend
   
   # Reset PM2
   pm2 delete all
   pm2 start ecosystem.config.js --env production
   ```

3. **Nginx Issues**
   ```bash
   # Test configuration
   sudo nginx -t
   
   # Reload configuration
   sudo systemctl reload nginx
   
   # Check status
   sudo systemctl status nginx
   ```

4. **SSL Issues**
   ```bash
   # Check certificate
   sudo certbot certificates
   
   # Renew certificate
   sudo certbot renew
   ```

## 📊 Performance Optimization

### 1. Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX idx_orders_created_at ON Order(createdAt);
CREATE INDEX idx_users_created_at ON User(createdAt);
CREATE INDEX idx_prescriptions_created_at ON Prescription(createdAt);

-- Optimize tables
OPTIMIZE TABLE User, Order, Prescription, Appointment;
```

### 2. Application Optimization
```javascript
// Enable compression
app.use(compression());

// Add caching headers
app.use((req, res, next) => {
  if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
  next();
});
```

### 3. CDN Configuration
```bash
# Configure Cloudflare or similar CDN
# Point DNS to CDN
# Configure cache rules for static assets
```

## 🔒 Security Hardening

### 1. Firewall Configuration
```bash
# Configure UFW
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 4000/tcp
sudo ufw deny 3306/tcp  # MySQL
```

### 2. Fail2ban Setup
```bash
# Install fail2ban
sudo apt install fail2ban

# Configure for Nginx
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
```

### 3. Regular Security Updates
```bash
# Automated security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 📈 Scaling Considerations

### 1. Load Balancing
```nginx
# Multiple backend instances
upstream backend {
    server 127.0.0.1:4000;
    server 127.0.0.1:4001;
    server 127.0.0.1:4002;
}
```

### 2. Database Scaling
```sql
-- Read replicas for scaling
-- Master-slave configuration
-- Connection pooling
```

### 3. Caching Strategy
```javascript
// Redis for session storage
// In-memory caching for frequently accessed data
// CDN for static assets
```

## 📞 Support & Maintenance

### Contact Information
- **Technical Support**: tech@mymedspharmacyinc.com
- **Emergency Contact**: +1-555-123-4567
- **Documentation**: https://docs.mymedspharmacyinc.com

### Maintenance Schedule
- **Daily**: Health checks, log monitoring
- **Weekly**: Performance review, security updates
- **Monthly**: Full backup verification, system updates
- **Quarterly**: Security audit, performance optimization

---

## 🎯 Deployment Checklist Summary

### Pre-Deployment
- [ ] Server provisioned and configured
- [ ] Database created and optimized
- [ ] SSL certificates installed
- [ ] Environment variables configured
- [ ] Security measures implemented

### Deployment
- [ ] Frontend built and deployed
- [ ] Backend built and deployed
- [ ] Database migrations run
- [ ] PM2 configured and started
- [ ] Nginx configured and started

### Post-Deployment
- [ ] Health checks passing
- [ ] Monitoring configured
- [ ] Backup system tested
- [ ] Performance optimized
- [ ] Security audit completed

### Documentation
- [ ] Deployment guide updated
- [ ] Runbook created
- [ ] Contact information documented
- [ ] Emergency procedures established

---

**Last Updated**: $(date)
**Version**: 2.0.0
**Status**: Production Ready ✅
