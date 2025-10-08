# Local Development Guide

## 🚀 Quick Start

### Option 1: Use the Startup Script (Recommended)
Simply double-click `start-local.bat` in the root directory. This will:
- Start the backend server on port 4000
- Start the frontend server on port 3000 (or next available)
- Open both in separate command windows

### Option 2: Manual Start

#### Start Backend
```bash
cd backend
start-dev.bat
```
The backend will run on: **http://localhost:4000**

#### Start Frontend
```bash
npm run dev
```
The frontend will run on: **http://localhost:3000** (or next available port)

## 📋 What You Need

### First Time Setup

1. **Create Backend .env File**
   - Navigate to `backend` folder
   - Create a file named `.env`
   - Add the following content:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="dev-secret-key-change-in-production-min-32-characters-long-123"
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=10
```

2. **Install Dependencies** (if not already done)
```bash
# Root (Frontend)
npm install

# Backend
cd backend
npm install
```

3. **Setup Database**
```bash
cd backend
npx prisma generate
npx prisma db push
```

## 🌐 Access URLs

- **Frontend**: http://localhost:3000 (or check console for actual port)
- **Backend API**: http://localhost:4000
- **Backend Health**: http://localhost:4000/api/health

## 🛠️ Development Tools

### Backend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run test:coverage` - Run tests with coverage
- `npx prisma studio` - Open database GUI

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests

## 🗄️ Database

The development environment uses **SQLite** stored in `backend/prisma/dev.db`.

To view/edit the database:
```bash
cd backend
npx prisma studio
```

## 🔧 Troubleshooting

### Port Already in Use
If you see "Port 3000 is in use", the frontend will automatically use the next available port (e.g., 3001).

### Backend Database Error
Make sure you have:
1. Created the `.env` file in the `backend` folder
2. Run `npx prisma generate` in the backend folder
3. Run `npx prisma db push` to create the database

### Environment Variables Not Loading
- Make sure `.env` file is in the `backend` folder (not the root)
- Restart the backend server after creating/modifying `.env`
- Use `start-dev.bat` which sets variables automatically

## 📝 Notes

- The backend uses SQLite for development (easier setup)
- Production uses MySQL (configured separately)
- Frontend runs on Vite (fast hot-reload)
- Backend uses ts-node-dev (auto-restart on changes)

## 🎯 Next Steps

1. ✅ Start both servers using `start-local.bat`
2. ✅ Access frontend at http://localhost:3000
3. ✅ Backend API available at http://localhost:4000
4. ✅ Start developing!

---

**Need help?** Check the console output in each window for errors.

