# VPS Database Setup Guide

## Overview
This guide helps you set up your MyMeds Pharmacy application with a VPS database instead of Railway/Supabase.

## Database Configuration

### Option 1: MySQL (Recommended)
Update your `backend/env.production` file:

```bash
# Production Database (MySQL)
DATABASE_URL="mysql://username:password@your-vps-ip:3306/mymeds_production"
```

### Option 2: PostgreSQL
```bash
# Production Database (PostgreSQL)
DATABASE_URL="postgresql://username:password@your-vps-ip:5432/mymeds_production"
```

## Environment Variables

### Backend (.env file)
```bash
# Database
DATABASE_URL="mysql://mymeds_user:strong_password@your-vps-ip:3306/mymeds_production"

# Security
JWT_SECRET="your_64_character_jwt_secret_here"
ADMIN_EMAIL="admin@yourdomain.com"
ADMIN_PASSWORD="StrongAdminPassword123!"
ADMIN_NAME="Production Admin"

# Server
PORT=4000
NODE_ENV=production
```

### Frontend (.env file)
```bash
# API Configuration
VITE_API_URL=https://your-vps-domain.com
VITE_BACKEND_URL=https://your-vps-domain.com

# WordPress (optional)
VITE_WORDPRESS_URL=https://your-blog-domain.com
```

## Database Setup Steps

### 1. Install Database Server
```bash
# For MySQL
sudo apt update
sudo apt install mysql-server

# For PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib
```

### 2. Create Database and User
```sql
-- MySQL
CREATE DATABASE mymeds_production;
CREATE USER 'mymeds_user'@'%' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON mymeds_production.* TO 'mymeds_user'@'%';
FLUSH PRIVILEGES;

-- PostgreSQL
CREATE DATABASE mymeds_production;
CREATE USER mymeds_user WITH PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON DATABASE mymeds_production TO mymeds_user;
```

### 3. Run Database Migrations
```bash
cd backend
npm install
npx prisma migrate deploy
npx prisma generate
```

## Authentication System

The authentication system has been updated to work with your VPS:

- **File**: `src/lib/adminAuth.ts` (renamed from railwayAuth.ts)
- **Storage**: Uses `admin-token`, `admin-user`, `admin-auth` in localStorage
- **Endpoints**: Uses `/admin/login`, `/admin/profile`, `/admin/logout`

## Deployment Steps

### 1. Backend Deployment
```bash
# Build the backend
cd backend
npm run build

# Start the server
npm start
```

### 2. Frontend Deployment
```bash
# Build the frontend
npm run build

# Deploy to your web server (nginx, Apache, etc.)
```

## Security Considerations

1. **Database Security**:
   - Use strong passwords
   - Restrict database access to your application server only
   - Enable SSL connections

2. **API Security**:
   - Use HTTPS in production
   - Set up proper CORS configuration
   - Enable rate limiting

3. **Environment Variables**:
   - Never commit .env files to version control
   - Use different secrets for each environment

## Troubleshooting

### Common Issues

1. **Database Connection Failed**:
   - Check if database server is running
   - Verify connection string format
   - Ensure firewall allows database port

2. **Authentication Issues**:
   - Clear browser localStorage: `localStorage.clear()`
   - Check admin credentials in environment variables
   - Verify JWT_SECRET is properly set

3. **CORS Errors**:
   - Update CORS_ORIGINS in backend environment
   - Ensure frontend URL is included in allowed origins

## Migration from Railway/Supabase

If you're migrating from Railway/Supabase:

1. **Export your data** from the old database
2. **Import to your VPS database**
3. **Update environment variables**
4. **Test the application thoroughly**

## Support

For issues with your VPS setup:
- Check server logs: `journalctl -u your-service-name`
- Verify database connectivity
- Test API endpoints manually
- Review firewall and security group settings
