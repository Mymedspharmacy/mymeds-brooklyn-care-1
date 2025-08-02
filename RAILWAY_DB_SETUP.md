# Railway Database Setup Guide

## Quick Database Migration Steps

### 1. Create Railway PostgreSQL Database
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Create a new project
3. Add a **PostgreSQL** service
4. Copy the connection details from the "Connect" tab

### 2. Set Environment Variables
In your Railway project, add these environment variables:

```env
DATABASE_URL="postgresql://username:password@host:port/database"
DIRECT_URL="postgresql://username:password@host:port/database"
JWT_SECRET="your-super-secret-jwt-key-here"
FRONTEND_URL="https://your-frontend-domain.com"
ADMIN_EMAIL="admin@yourpharmacy.com"
ADMIN_PASSWORD="secure-password-123"
ADMIN_NAME="Admin User"
```

### 3. Deploy Backend to Railway
1. Connect your GitHub repository to Railway
2. Set the root directory to `backend/`
3. Set the build command: `npm install && npx prisma generate`
4. Set the start command: `npm start`

### 4. Run Database Migrations
Once deployed, run these commands in Railway's terminal:

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Create admin user
npm run create-admin
```

### 5. Verify Database Connection
Check if the database is working by visiting:
`https://your-railway-app.railway.app/health`

## Database Schema Overview

Your database includes these key tables:

- **users** - Admin and customer accounts
- **orders** - Order management
- **prescriptions** - Prescription tracking
- **appointments** - Appointment scheduling
- **contact_forms** - Contact submissions
- **reviews** - Product reviews
- **settings** - Site configuration

## Important Notes

1. **Product/Category data** is now handled by WooCommerce
2. **Blog data** is now handled by WordPress
3. **Authentication** uses JWT tokens instead of Supabase
4. **Admin user** is created programmatically via the script

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` and `DIRECT_URL` are correct
- Check if Railway PostgreSQL service is running
- Ensure Prisma client is generated: `npx prisma generate`

### Migration Issues
- If migrations fail, try: `npx prisma migrate reset`
- Check Railway logs for detailed error messages
- Verify all environment variables are set

### Admin Access Issues
- Ensure admin user is created: `npm run create-admin`
- Check JWT_SECRET is set correctly
- Verify admin credentials in environment variables 