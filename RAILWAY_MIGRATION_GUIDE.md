# Railway Migration Guide: Supabase → Railway

## Overview
This guide will help you migrate your admin panel authentication from Supabase to Railway with your own PostgreSQL database and authentication system.

## Prerequisites
- Railway account (https://railway.app)
- GitHub repository connected to Railway
- Existing backend code (already in place)

## Step 1: Set up Railway Database

### 1.1 Create Railway Project
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Select your repository

### 1.2 Add PostgreSQL Database
1. In your Railway project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically provision a PostgreSQL database
4. Note down the connection details (you'll need these for environment variables)

### 1.3 Get Database Connection Details
1. Click on your PostgreSQL database in Railway
2. Go to "Connect" tab
3. Copy the following details:
   - `DATABASE_URL` (for Prisma)
   - `DIRECT_URL` (for Prisma direct connections)

## Step 2: Update Environment Variables

### 2.1 Backend Environment Variables
Add these to your Railway project environment variables:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"
DIRECT_URL="postgresql://username:password@host:port/database"

# JWT Secret (generate a strong secret)
JWT_SECRET="your-super-secure-jwt-secret-here"

# Frontend URL
FRONTEND_URL="https://your-frontend-domain.com"

# Email Configuration (optional, for password reset)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@yourdomain.com"
```

### 2.2 Frontend Environment Variables
Update your frontend `.env` file:

```env
# Remove Supabase variables
# VITE_SUPABASE_URL=
# VITE_SUPABASE_ANON_KEY=

# Add Railway backend URL
VITE_API_URL="https://your-railway-backend-url.railway.app"

# Keep existing variables
VITE_WOOCOMMERCE_URL="https://your-wordpress-site.com"
VITE_WOOCOMMERCE_CONSUMER_KEY="your-consumer-key"
VITE_WOOCOMMERCE_CONSUMER_SECRET="your-consumer-secret"
VITE_WORDPRESS_URL="https://your-wordpress-site.com"
VITE_STRIPE_PUBLISHABLE_KEY="your-stripe-key"
```

## Step 3: Deploy Backend to Railway

### 3.1 Configure Railway Deployment
1. In your Railway project, add a new service
2. Choose "GitHub Repo" and select your repository
3. Set the root directory to `backend/`
4. Configure build settings:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

### 3.2 Set Environment Variables
Add all the environment variables from Step 2.1 to your Railway service.

### 3.3 Deploy and Run Migrations
1. Deploy your backend service
2. Once deployed, run database migrations:
   ```bash
   # In Railway terminal or via Railway CLI
   npx prisma migrate deploy
   npx prisma generate
   ```

## Step 4: Create Admin User

### 4.1 Using Railway CLI (Recommended)
1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Link to your project: `railway link`
4. Open terminal: `railway shell`
5. Run the admin user creation script:
   ```bash
   node generate-admin-jwt.js
   ```

### 4.2 Using Railway Dashboard
1. Go to your backend service in Railway
2. Click "Deployments" → "Latest" → "View Logs"
3. Open terminal and run the admin creation script

## Step 5: Update Frontend Authentication

### 5.1 Remove Supabase Dependencies
```bash
npm uninstall @supabase/supabase-js
```

### 5.2 Update Authentication Logic
The frontend code has already been updated to use the new authentication system.

## Step 6: Test the Migration

### 6.1 Test Admin Login
1. Go to your frontend admin signin page
2. Use the admin credentials created in Step 4
3. Verify you can access the admin panel

### 6.2 Test API Endpoints
1. Verify all admin endpoints work with the new authentication
2. Test user management, orders, reviews, etc.

## Step 7: Clean Up

### 7.1 Remove Supabase Configuration
- Delete Supabase environment variables
- Remove Supabase client files (optional, keep for reference)
- Update documentation

### 7.2 Update Documentation
- Update README files
- Update deployment guides
- Update environment variable documentation

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify `DATABASE_URL` and `DIRECT_URL` are correct
   - Check if Railway database is running
   - Ensure migrations have been applied

2. **JWT Token Issues**
   - Verify `JWT_SECRET` is set correctly
   - Check token expiration settings
   - Ensure frontend and backend use the same secret

3. **CORS Issues**
   - Update CORS configuration in backend
   - Add your frontend domain to allowed origins

4. **Migration Failures**
   - Check Prisma schema compatibility
   - Verify database permissions
   - Run migrations manually if needed

### Support
- Railway Documentation: https://docs.railway.app
- Prisma Documentation: https://www.prisma.io/docs
- JWT Documentation: https://jwt.io

## Security Considerations

1. **JWT Secret**: Use a strong, randomly generated secret
2. **Environment Variables**: Never commit secrets to version control
3. **Database Access**: Use Railway's built-in security features
4. **HTTPS**: Railway provides HTTPS by default
5. **Rate Limiting**: Already implemented in your backend

## Cost Optimization

1. **Database**: Railway PostgreSQL starts at $5/month
2. **Compute**: Railway compute starts at $5/month
3. **Bandwidth**: Included in base plans
4. **Monitoring**: Built-in monitoring and logging

## Next Steps

1. Monitor your application performance
2. Set up alerts and monitoring
3. Configure backups for your database
4. Set up CI/CD pipelines if needed
5. Consider implementing additional security measures 