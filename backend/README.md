# MyMeds Backend

## Setup

1. Use `env.production` for VPS deployment or `env.development` for local development.
2. Install dependencies:
   ```sh
   npm install
   ```
3. Run Prisma migrations and generate client:
   ```sh
   npm run prisma:migrate
   npm run prisma:generate
   ```
4. Start the server:
   ```sh
   npm run build && npm start
   ```

## Environment Variables
- `DATABASE_URL` (MySQL connection string for production, SQLite for development)
- `JWT_SECRET` (a strong secret for JWT signing)
- `PORT` (optional, default 4000)

## Environment Variables Setup

For production deployment, use `env.production` which includes:

```
# MySQL database for production
DATABASE_URL="mysql://mymeds_user:MyMedsSecurePassword2024!@localhost:3306/mymeds_production"

# JWT and security
JWT_SECRET=prod_jwt_secret_key_64_chars_minimum_required_for_production_environment_2024
JWT_REFRESH_SECRET=prod_refresh_secret_key_64_chars_minimum_required_for_production_2024

# WooCommerce integration
WOOCOMMERCE_STORE_URL=https://mymedspharmacyinc.com/shop
WOOCOMMERCE_CONSUMER_KEY=ck_production_key_here
WOOCOMMERCE_CONSUMER_SECRET=cs_production_secret_here

# Email configuration
SMTP_HOST=smtp.gmail.com
SMTP_USER=mymedspharmacyinc@gmail.com
SMTP_PASS=your_production_app_password_here
```

- The deployment script will automatically copy and configure these settings.
- Update the placeholder values with your actual production credentials.

## Deployment
- Use a process manager (PM2, Docker, etc.) for production.
- Ensure environment variables are set in your deployment environment.
- Use HTTPS in production.

## Health Check
- GET `/api/health` returns `{ status: 'ok' }` if running. 