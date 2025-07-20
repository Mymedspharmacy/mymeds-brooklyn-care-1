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

## Deployment
- Use a process manager (PM2, Docker, etc.) for production.
- Ensure environment variables are set in your deployment environment.
- Use HTTPS in production.

## Health Check
- GET `/api/health` returns `{ status: 'ok' }` if running. 