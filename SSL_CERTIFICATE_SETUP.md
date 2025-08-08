# SSL Certificate Setup Guide for MyMeds Pharmacy

## Overview
This guide provides step-by-step instructions for installing SSL certificates and configuring HTTPS for your MyMeds Pharmacy application.

## Prerequisites
- Domain name (e.g., mymedspharmacyinc.com)
- Server access (VPS, cloud provider, or hosting service)
- Node.js application running on port 4000

## Option 1: Let's Encrypt (Free SSL Certificates)

### 1. Install Certbot

#### For Ubuntu/Debian:
```bash
sudo apt update
sudo apt install certbot
```

#### For CentOS/RHEL:
```bash
sudo yum install epel-release
sudo yum install certbot
```

#### For Windows (using WSL or Git Bash):
```bash
# Install via pip
pip install certbot
```

### 2. Obtain SSL Certificate

#### Standalone Mode (Recommended for initial setup):
```bash
sudo certbot certonly --standalone -d mymedspharmacyinc.com -d www.mymedspharmacyinc.com
```

#### Webroot Mode (If you have a web server):
```bash
sudo certbot certonly --webroot -w /var/www/html -d mymedspharmacyinc.com -d www.mymedspharmacyinc.com
```

### 3. Certificate Files Location
Certificates will be stored in:
- Certificate: `/etc/letsencrypt/live/mymedspharmacyinc.com/fullchain.pem`
- Private Key: `/etc/letsencrypt/live/mymedspharmacyinc.com/privkey.pem`

## Option 2: Nginx Reverse Proxy (Recommended Production Setup)

### 1. Install Nginx
```bash
sudo apt update
sudo apt install nginx
```

### 2. Configure Nginx
Create configuration file: `/etc/nginx/sites-available/mymeds`

```nginx
server {
    listen 80;
    server_name mymedspharmacyinc.com www.mymedspharmacyinc.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mymedspharmacyinc.com www.mymedspharmacyinc.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/mymedspharmacyinc.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mymedspharmacyinc.com/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Enable Site and Test Configuration
```bash
sudo ln -s /etc/nginx/sites-available/mymeds /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Option 3: Direct SSL in Node.js Application

### 1. Install Required Packages
```bash
cd backend
npm install https fs
```

### 2. Update Application for SSL
Modify `backend/src/index.ts`:

```typescript
import https from 'https';
import fs from 'fs';

// SSL Configuration
const sslOptions = {
  key: fs.readFileSync('/etc/letsencrypt/live/mymedspharmacyinc.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/mymedspharmacyinc.com/fullchain.pem')
};

// Create HTTPS server
const httpsServer = https.createServer(sslOptions, app);
const io = new Server(httpsServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "https://mymedspharmacyinc.com",
    methods: ["GET", "POST"]
  }
});

// Start HTTPS server
const PORT = process.env.PORT || 4000;
httpsServer.listen(PORT, () => {
  console.log(`HTTPS server running on port ${PORT}`);
});
```

## Option 4: Cloud Provider SSL (Railway, Vercel, etc.)

### Railway Deployment
Railway automatically provides SSL certificates. Update your environment variables:

```env
NODE_ENV=production
FRONTEND_URL=https://mymedspharmacyinc.com
```

### Vercel Deployment
Vercel provides automatic SSL. Configure in `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "backend/src/index.ts"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ]
}
```

## SSL Certificate Renewal

### 1. Automatic Renewal with Cron
```bash
# Add to crontab
sudo crontab -e

# Add this line for daily renewal check
0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. Test Renewal
```bash
sudo certbot renew --dry-run
```

## SSL Security Best Practices

### 1. Update Security Headers
Ensure your application includes these headers:

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### 2. Environment Variables
Update your `.env` file:

```env
NODE_ENV=production
FRONTEND_URL=https://mymedspharmacyinc.com
SSL_ENABLED=true
```

### 3. CORS Configuration
Update CORS settings in `backend/src/index.ts`:

```typescript
const allowedOrigins = [
  'https://mymedspharmacyinc.com',
  'https://www.mymedspharmacyinc.com',
  'https://your-frontend-domain.com'
];
```

## Testing SSL Configuration

### 1. Test SSL Certificate
```bash
openssl s_client -connect mymedspharmacyinc.com:443 -servername mymedspharmacyinc.com
```

### 2. Check SSL Labs Rating
Visit: https://www.ssllabs.com/ssltest/

### 3. Test Application Endpoints
```bash
curl -k https://mymedspharmacyinc.com/api/health
```

## Troubleshooting

### Common Issues:

1. **Certificate Not Found**
   - Verify certificate paths
   - Check file permissions
   - Ensure domain matches certificate

2. **Mixed Content Errors**
   - Update all HTTP URLs to HTTPS
   - Check frontend configuration
   - Update API endpoints

3. **CORS Issues**
   - Update allowed origins to HTTPS
   - Check frontend domain configuration

4. **WebSocket Issues**
   - Ensure WebSocket uses WSS in production
   - Update Socket.IO configuration

## Next Steps

After SSL setup:
1. Configure monitoring and backup strategies
2. Set up automated certificate renewal
3. Implement security monitoring
4. Configure CDN for better performance
5. Set up automated backups

## Security Checklist

- [ ] SSL certificate installed and working
- [ ] HTTP to HTTPS redirect configured
- [ ] Security headers implemented
- [ ] CORS configured for HTTPS
- [ ] WebSocket configured for WSS
- [ ] Certificate auto-renewal set up
- [ ] SSL Labs rating checked
- [ ] Mixed content issues resolved
- [ ] Environment variables updated
- [ ] Production deployment tested
