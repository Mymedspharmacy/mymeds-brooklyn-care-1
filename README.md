# MyMeds Brooklyn Care

## Production Deployment Guide

### 1. Environment Setup
- Copy `.env.example` to `.env` and fill in all secrets (never commit real secrets).
- Ensure `DATABASE_URL`, `SUPABASE_JWT_SECRET`, and `JWT_SECRET` are set.

### 2. Install Dependencies
```
npm install
cd backend
npm install
```

### 3. Build Frontend
```
npm run build
```
- The optimized frontend will be in the `dist/` folder.

### 4. Run Database Migrations
```
npx prisma migrate deploy --schema=backend/prisma/schema.prisma
```

### 5. Start Backend with PM2
```
pm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 6. Serve Frontend (Production)
- Use Nginx or Caddy to serve the `dist/` folder and reverse proxy `/api/` to the backend.

#### Sample Nginx Config
```
server {
    listen 80;
    server_name www.mymedspharmacyinc.com;

    location /api/ {
        proxy_pass http://localhost:4000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        root /path/to/your/dist;
        try_files $uri /index.html;
    }
}
```

### 7. Enable HTTPS
- Use Let's Encrypt:
```
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx
```

### 8. Generate Admin JWT for Testing
```
node backend/generate-admin-jwt.js
```

### 9. Health Check
- Visit `/api/health` to verify backend is running.

---

For further optimization, see the full production checklist in this repo or ask your devops team for scaling and monitoring best practices.