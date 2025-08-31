# 🆕 Developer Onboarding Guide

## 🎯 **Welcome to MyMeds Pharmacy Development Team!**

This guide will help you get up and running with the MyMeds Pharmacy project in under 30 minutes.

---

## 🚀 **Quick Start (5 minutes)**

### **1. Prerequisites Check**
- ✅ **Node.js 18+** installed
- ✅ **Git** installed
- ✅ **Code editor** (VS Code recommended)
- ✅ **Database** (MySQL/PostgreSQL or SQLite for development)

### **2. Clone & Setup**
```bash
# Clone the repository
git clone https://github.com/yourusername/mymeds-brooklyn-care-1.git
cd mymeds-brooklyn-care-1

# Install dependencies
npm install
cd backend && npm install
```

### **3. Environment Setup**
```bash
# Copy environment template
cp backend/env.production.example backend/.env

# Update backend/.env with your local settings
DATABASE_URL=file:./dev.db  # SQLite for development
JWT_SECRET=your-super-secure-jwt-secret-here-change-this-in-production-minimum-32-chars
ADMIN_EMAIL=admin@mymedspharmacy.com
ADMIN_PASSWORD=SecureAdmin123!
```

### **4. Start Development**
```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
npm run dev
```

**🎉 You're now running MyMeds Pharmacy locally!**

---

## 🏗️ **Project Architecture Overview**

### **System Components**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   (React/TS)    │◄──►│  (Node/Express) │◄──►│   (Prisma ORM)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  WooCommerce   │    │   WordPress     │    │   External      │
│   Integration   │    │   Integration   │    │     APIs        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Technology Stack**
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Prisma ORM
- **Database**: MySQL/PostgreSQL (SQLite for development)
- **Authentication**: JWT + bcrypt
- **Payment**: Stripe + WooCommerce
- **Content**: WordPress REST API

---

## 🔧 **Development Environment Setup**

### **Required Software**
1. **Node.js 18+** - [Download here](https://nodejs.org/)
2. **Git** - [Download here](https://git-scm.com/)
3. **VS Code** - [Download here](https://code.visualstudio.com/)
4. **Database** - MySQL/PostgreSQL or SQLite

### **VS Code Extensions (Recommended)**
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "prisma.prisma",
    "ms-vscode.vscode-json"
  ]
}
```

### **Environment Configuration**
Create `backend/.env` with these development settings:
```env
# Development Environment
NODE_ENV=development
PORT=4000
HOST=localhost

# Database (SQLite for development)
DATABASE_URL=file:./dev.db

# Security
JWT_SECRET=your-super-secure-jwt-secret-here-change-this-in-production-minimum-32-chars
ADMIN_EMAIL=admin@mymedspharmacy.com
ADMIN_PASSWORD=SecureAdmin123!
ADMIN_NAME=Development Administrator

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Development Settings
DEBUG=true
DEBUG_DATABASE=true
DISABLE_RATE_LIMIT=true
DISABLE_EMAIL_VERIFICATION=true
DISABLE_PAYMENT_PROCESSING=true
```

---

## 🗄️ **Database Setup**

### **Option 1: SQLite (Recommended for Development)**
```bash
cd backend
npx prisma generate
npx prisma db push
```

### **Option 2: MySQL/PostgreSQL**
```bash
# Install database server
# Update DATABASE_URL in .env
npx prisma migrate dev
npx prisma generate
```

### **Database Schema Overview**
- **Users**: Customer accounts, admin users, pharmacists
- **PatientProfiles**: Medical information, insurance, documents
- **Products**: Inventory, categories, variants
- **Orders**: E-commerce orders, prescriptions, tracking
- **Appointments**: Scheduling, consultations
- **Notifications**: System alerts, email notifications

---

## 🧪 **Testing Your Setup**

### **1. Backend Health Check**
```bash
# Start backend
cd backend
npm run dev

# Should see:
# ✅ Environment validation passed
# ✅ Admin user initialized successfully
# 🚀 Server running on port 4000
```

### **2. Frontend Access**
```bash
# Start frontend
npm run dev

# Open http://localhost:5173
# Should see MyMeds Pharmacy homepage
```

### **3. API Testing**
```bash
# Test health endpoint
curl http://localhost:4000/api/health

# Test admin login
curl -X POST http://localhost:4000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mymedspharmacy.com","password":"SecureAdmin123!"}'
```

---

## 📚 **Key Development Concepts**

### **Project Structure**
```
mymeds-brooklyn-care-1/
├── src/                    # Frontend React components
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom React hooks
│   └── utils/             # Utility functions
├── backend/               # Backend Node.js application
│   ├── src/               # Source code
│   ├── prisma/            # Database schema
│   └── routes/            # API endpoints
└── docs/                  # Documentation
```

### **Development Workflow**
1. **Feature Development**: Create feature branch from `main`
2. **Local Testing**: Test locally with `npm run dev`
3. **Code Review**: Submit pull request for review
4. **Testing**: Ensure all tests pass
5. **Deployment**: Merge to `main` triggers deployment

### **Code Standards**
- **TypeScript**: Strict typing throughout
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **Testing**: Jest for unit/integration tests
- **Documentation**: JSDoc comments for functions

---

## 🔌 **API Development**

### **API Structure**
```
/api
├── /auth          # Authentication endpoints
├── /admin         # Admin panel endpoints
├── /users         # User management
├── /products      # Product catalog
├── /orders        # Order management
├── /prescriptions # Prescription handling
├── /appointments  # Scheduling
└── /health        # System health
```

### **Creating New Endpoints**
1. **Define Route**: Add to appropriate route file
2. **Add Validation**: Use Zod schemas
3. **Implement Logic**: Business logic in service layer
4. **Add Tests**: Unit and integration tests
5. **Document**: Update API documentation

### **Example Endpoint**
```typescript
// routes/users.ts
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await getUserProfile(req.user.id);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 🧪 **Testing Strategy**

### **Test Types**
- **Unit Tests**: Individual functions/components
- **Integration Tests**: API endpoints and services
- **E2E Tests**: Complete user workflows
- **Performance Tests**: Load and stress testing

### **Running Tests**
```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Specific test file
npm test -- --testPathPattern=users
```

### **Writing Tests**
```typescript
// Example test
describe('User API', () => {
  it('should create a new user', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

---

## 🚀 **Deployment & Production**

### **Development vs Production**
| Aspect | Development | Production |
|--------|-------------|------------|
| **Database** | SQLite | MySQL/PostgreSQL |
| **Environment** | `.env` | Environment variables |
| **Logging** | Console | File + monitoring |
| **Security** | Relaxed | Strict |
| **Performance** | Basic | Optimized |

### **Production Checklist**
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Monitoring configured
- [ ] Backup strategy implemented
- [ ] Security audit completed

---

## 📚 **Learning Resources**

### **Essential Reading**
1. **[API Reference](api/REFERENCE.md)** - Complete API documentation
2. **[Architecture Overview](architecture/OVERVIEW.md)** - System design
3. **[Database Schema](reference/DATABASE_SCHEMA.md)** - Data models
4. **[Security Guide](architecture/SECURITY.md)** - Security practices

### **External Resources**
- **React**: [Official docs](https://react.dev/)
- **TypeScript**: [Handbook](https://www.typescriptlang.org/docs/)
- **Prisma**: [Documentation](https://www.prisma.io/docs/)
- **Express**: [API reference](https://expressjs.com/en/api.html)

---

## 🆘 **Getting Help**

### **Common Issues**
- **Database Connection**: Check `DATABASE_URL` in `.env`
- **Port Conflicts**: Ensure ports 3000 and 4000 are free
- **Dependencies**: Run `npm install` in both directories
- **Environment**: Verify `.env` file exists and is configured

### **Support Channels**
- **Documentation**: Check relevant docs first
- **Issues**: Create GitHub issue for bugs
- **Discussions**: Use GitHub discussions for questions
- **Team Chat**: Internal team communication

### **Escalation Path**
1. Check documentation
2. Search existing issues
3. Ask team members
4. Create detailed issue
5. Contact lead developer

---

## 🎯 **Next Steps**

### **Immediate Actions**
1. ✅ Complete this onboarding guide
2. ✅ Set up development environment
3. ✅ Run the application locally
4. ✅ Explore the codebase structure

### **Week 1 Goals**
- [ ] Understand project architecture
- [ ] Familiarize with codebase
- [ ] Run all tests successfully
- [ ] Make first small contribution

### **Month 1 Goals**
- [ ] Contribute to feature development
- [ ] Understand business logic
- [ ] Participate in code reviews
- [ ] Help improve documentation

---

## 🎉 **Welcome to the Team!**

You're now part of building a world-class pharmacy management system. Remember:

- **Ask questions** - No question is too small
- **Follow standards** - Maintain code quality
- **Test thoroughly** - Quality is everyone's responsibility
- **Document changes** - Help future developers
- **Have fun** - Building great software should be enjoyable!

**🚀 Ready to build something amazing? Let's get coding!**

---

**📚 Need more help? Check the [Complete Documentation Index](../README.md)**

