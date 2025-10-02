# MyMeds Pharmacy Inc. - Manual Deployment Guide

## Prerequisites Completed ✅
- [x] Frontend built successfully
- [x] Backend built successfully  
- [x] Production environment files prepared
- [x] Database schema configured for MySQL
- [x] PM2 process manager available

## Step-by-Step Manual Deployment

### 1. Environment Setup
The production environment files are already configured:
- `env.production` - Main production environment
- `backend/.env.production` - Backend production environment

### 2. Database Setup
The MySQL database schema is ready with migrations in:
- `backend/prisma/migrations/20250928000000_init_mysql/migration.sql`

### 3. Application Files Ready
- Frontend: Built in `dist/` directory
- Backend: Built in `backend/dist/` directory

### 4. Deployment Options

#### Option A: PM2 Deployment (Recommended)
```bash
# Start the backend with PM2
cd backend
pm2 start ecosystem.config.js

# Start the frontend with PM2 (if using serve)
pm2 start ecosystem.config.js --only mymeds-frontend
```

#### Option B: Direct Node.js Deployment
```bash
# Start backend
cd backend
node dist/index.js

# Start frontend (in another terminal)
npx serve -s dist -l 3000
```

#### Option C: Docker Deployment
```bash
# Build and start with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

### 5. Production Server Setup

#### For VPS/Cloud Server:
1. **Upload files to server:**
   ```bash
   # Upload the entire project to /var/www/mymeds
   scp -r . user@your-server:/var/www/mymeds
   ```

2. **Install dependencies:**
   ```bash
   cd /var/www/mymeds
   npm install
   cd backend
   npm install
   ```

3. **Set up environment:**
   ```bash
   # Copy production environment files
   cp env.production .env
   cd backend
   cp .env.production .env
   ```

4. **Set up MySQL database:**
   ```bash
   # Install MySQL if not already installed
   sudo apt update
   sudo apt install mysql-server
   
   # Create database and user
   mysql -u root -p
   CREATE DATABASE mymeds_production;
   CREATE USER 'mymeds_user'@'localhost' IDENTIFIED BY 'Pharm-23-medS';
   GRANT ALL PRIVILEGES ON mymeds_production.* TO 'mymeds_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

5. **Run database migrations:**
   ```bash
   cd backend
   npx prisma migrate deploy
   npx prisma generate
   ```

6. **Start with PM2:**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

### 6. Nginx Configuration (Optional)
Create `/etc/nginx/sites-available/mymeds`:
```nginx
server {
    listen 80;
    server_name mymedspharmacyinc.com www.mymedspharmacyinc.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
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
    }
}
```

### 7. SSL Certificate (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d mymedspharmacyinc.com -d www.mymedspharmacyinc.com
```

### 8. Firewall Configuration
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 9. Monitoring and Maintenance
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs

# Restart services
pm2 restart all

# Monitor resources
pm2 monit
```

## Current Status
- ✅ Frontend built and ready
- ✅ Backend built and ready
- ✅ Environment files configured
- ✅ Database schema prepared
- ✅ PM2 available for process management

## Next Steps
1. Choose deployment method (PM2, Docker, or direct Node.js)
2. Set up production server (VPS/Cloud)
3. Configure domain and SSL
4. Test all functionality
5. Set up monitoring and backups

## Important Notes
- Update the `VPS_IP` in `env.production` with your actual server IP
- Replace `YourGmailAppPasswordHere` with actual Gmail app password
- Ensure MySQL is running and accessible
- Test all API endpoints after deployment
- Set up regular database backups
- Monitor application logs for errors
