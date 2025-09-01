# Environment Variables Guide

This guide explains all the environment variables needed for the Railway migration from Supabase.

## Backend Environment Variables (.env)

### Database Configuration
```env
# Railway PostgreSQL Database
DATABASE_URL="postgresql://username:password@host:port/database"
DIRECT_URL="postgresql://username:password@host:port/database"
```

### JWT Configuration
```env
# JWT Secret for authentication
JWT_SECRET="your-super-secure-jwt-secret-here-change-this-in-production"
```

### Admin Configuration
```env
# Admin user credentials
ADMIN_EMAIL="admin@mymedspharmacy.com"
ADMIN_PASSWORD="AdminPassword123!"
ADMIN_NAME="Admin User"
```

### WooCommerce Integration
```env
# WooCommerce API credentials
WOOCOMMERCE_URL="https://your-store.com"
WOOCOMMERCE_CONSUMER_KEY="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
WOOCOMMERCE_CONSUMER_SECRET="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### WordPress Integration
```env
# WordPress API credentials
WORDPRESS_URL="https://your-wordpress-site.com"
WORDPRESS_USERNAME="your-username"
WORDPRESS_APPLICATION_PASSWORD="your-application-password"
```

### Email Configuration (Optional)
```env
# SMTP settings for email notifications
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@mymeds.com"
```

### Frontend URL
```env
# Frontend URL for password reset links
FRONTEND_URL="https://www.mymedspharmacyinc.com"
```

## Frontend Environment Variables (.env)

### API Configuration
```env
# Backend API URL
VITE_API_URL="https://your-railway-backend.railway.app/api"
```

### WooCommerce Configuration (for payments)
```env
# WooCommerce store URL
VITE_WOOCOMMERCE_STORE_URL="https://your-store.com"
# WooCommerce consumer key
VITE_WOOCOMMERCE_CONSUMER_KEY="ck_xxxxxxxxxxxxxxxxxxxxxxxx"
```

## Remove these Supabase variables (no longer needed)
# VITE_SUPABASE_URL=
# VITE_SUPABASE_ANON_KEY=

## Railway Deployment

### 1. Set Environment Variables in Railway Dashboard
- Go to your Railway project
- Navigate to the Variables tab
- Add all the backend environment variables listed above

### 2. Frontend Environment Variables
- For Vercel: Add them in the Vercel dashboard under Settings > Environment Variables
- For other platforms: Add them according to your hosting provider's instructions

### 3. Database Migration
```bash
# Run database migrations
npx prisma migrate deploy
npx prisma generate
```

### 4. Admin User Setup
```bash
# Create admin user (if not already done)
npm run create-admin
```

## Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Change default admin credentials
- [ ] Use strong passwords for all services
- [ ] Enable HTTPS in production
- [ ] Set up proper CORS origins
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Remove Supabase dependencies

## WooCommerce Setup

1. **Generate API Keys**:
   - Go to WooCommerce > Settings > Advanced > REST API
   - Click "Add Key"
   - Set permissions (Read/Write)
   - Copy Consumer Key and Consumer Secret

2. **Test Connection**:
   - Use the `/api/woocommerce/products` endpoint
   - Should return your WooCommerce products

## WordPress Setup

1. **Create Application Password**:
   - Go to Users > Profile
   - Scroll to "Application Passwords"
   - Create a new application password
   - Use this instead of your regular password

2. **Test Connection**:
   - Use the `/api/wordpress/posts` endpoint
   - Should return your WordPress posts

## Troubleshooting

### Common Issues:

1. **Database Connection Failed**:
   - Check DATABASE_URL format
   - Ensure Railway database is running
   - Verify network connectivity

2. **JWT Errors**:
   - Ensure JWT_SECRET is set
   - Check token expiration
   - Verify token format

3. **CORS Errors**:
   - Check allowed origins in backend
   - Verify frontend URL is correct
   - Ensure credentials are included

4. **WooCommerce API Errors**:
   - Verify API keys are correct
   - Check WooCommerce REST API is enabled
   - Ensure proper permissions

5. **WordPress API Errors**:
   - Verify application password is correct
   - Check WordPress REST API is enabled
   - Ensure user has proper permissions

### Health Checks:

```bash
# Backend health
curl https://your-backend.railway.app/api/health

# Database health
curl https://your-backend.railway.app/api/health/db

# Admin system health (requires auth)
curl -H "Authorization: Bearer YOUR_TOKEN" https://your-backend.railway.app/api/admin/health
```

## Migration Checklist

- [ ] Set up Railway database
- [ ] Configure environment variables
- [ ] Run database migrations
- [ ] Test admin authentication
- [ ] Verify all API endpoints
- [ ] Test WooCommerce integration
- [ ] Test WordPress integration
- [ ] Update frontend API URL
- [ ] Remove Supabase dependencies
- [ ] Deploy to production
- [ ] Monitor for errors
- [ ] Set up backups 