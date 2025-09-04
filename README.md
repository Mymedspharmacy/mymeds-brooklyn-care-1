# 🏥 MyMeds Pharmacy - Modern Healthcare Platform

A comprehensive pharmacy management system built with React, Node.js, and TypeScript.

## 🏗️ Architecture

```
mymeds-brooklyn-care-1-1/
├── 📱 Frontend (React + Vite + TypeScript)
├── 🔧 Backend (Node.js + Express + Prisma)
├── 🚀 Deployment (Docker + PM2 + Nginx)
└── 📚 Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MySQL 8.0+
- Git

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mymeds-brooklyn-care-1-1
   ```

2. **Install dependencies**
   ```bash
   # Frontend dependencies
   npm install
   
   # Backend dependencies
   cd backend
   npm install
   cd ..
   ```

3. **Environment setup**
   ```bash
   # Copy environment files
   cp frontend.env.production .env.local
   cp backend/env.production backend/.env
   ```

4. **Database setup**
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev
   cd ..
   ```

5. **Start development servers**
   ```bash
   # Frontend (port 3000)
   npm run dev
   
   # Backend (port 4000)
   cd backend
   npm run dev
   ```

## 🏗️ Project Structure

### Frontend (`src/`)
- `components/` - Reusable React components
- `pages/` - Page components
- `hooks/` - Custom React hooks
- `lib/` - Utilities and configurations
- `main.tsx` - Application entry point

### Backend (`backend/src/`)
- `routes/` - API route handlers
- `middleware/` - Express middleware
- `services/` - Business logic
- `config/` - Configuration files
- `database/` - Database setup
- `types/` - TypeScript type definitions
- `utils/` - Utility functions

### Deployment (`deployment/`)
- `docker/` - Docker configurations
- `nginx/` - Web server configurations
- `scripts/` - Deployment scripts

### Documentation (`docs/`)
- `DEPLOYMENT.md` - Deployment guide
- `API.md` - API documentation
- `DEVELOPMENT.md` - Development guide

## 🛠️ Available Scripts

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Backend
```bash
cd backend
npm run dev          # Start development server
npm run build        # Build TypeScript
npm run start        # Start production server
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate    # Run database migrations
```

### Deployment
```bash
npm run deploy:prod  # Deploy to production
npm run deploy:docker    # Deploy with Docker
npm run update:vps   # Update VPS deployment
```

## 🚀 Deployment

### VPS Deployment
```bash
# Update VPS configuration
nano deployment/vps-config.json

# Deploy to VPS
npm run update:vps
```

### Docker Deployment
```bash
# Build and run with Docker Compose
cd deployment/docker
docker-compose -f docker-compose.prod.yml up -d
```

## 📚 Documentation

- [Deployment Guide](docs/DEPLOYMENT.md)
- [API Documentation](docs/API.md)
- [Development Guide](docs/DEVELOPMENT.md)
- [Clean Architecture](CLEAN_ARCHITECTURE.md)

## 🔧 Configuration

### Environment Variables

**Frontend** (`.env.local`)
```env
VITE_API_URL=http://localhost:4000
VITE_BACKEND_URL=http://localhost:4000
```

**Backend** (`backend/.env`)
```env
DATABASE_URL=mysql://user:password@localhost:3306/mymeds
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the [documentation](docs/)
- Open an issue on GitHub
- Contact the development team
