# MyMeds Backend

## Setup

1. Copy `.env.example` to `.env` and fill in your environment variables.
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
- `DATABASE_URL` (your Supabase/Postgres connection string)
- `JWT_SECRET` (a strong secret for JWT signing)
- `PORT` (optional, default 4000)

## Environment Variables Setup

Create a `.env` file in the `backend/` directory with the following content:

```
# PostgreSQL connection for Prisma
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# Supabase configuration
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

- Replace the placeholders with your actual credentials from Supabase.
- `DATABASE_URL` is used by Prisma for direct Postgres access.
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are required for Supabase client features (auth, storage, RLS, etc.).

## Deployment
- Use a process manager (PM2, Docker, etc.) for production.
- Ensure environment variables are set in your deployment environment.
- Use HTTPS in production.

## Health Check
- GET `/api/health` returns `{ status: 'ok' }` if running. 