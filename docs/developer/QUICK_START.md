# ⚡ Quick Start Guide

## 🚀 **Get MyMeds Pharmacy Running in 5 Minutes**

This guide will get you up and running with the MyMeds Pharmacy system quickly.

---

## ⚡ **5-Minute Setup**

### **1. Prerequisites (1 minute)**
```bash
# Check if you have the required software
node --version    # Should be 18+
npm --version     # Should be 8+
git --version     # Any recent version
```

**If missing any:**
- **Node.js**: [Download here](https://nodejs.org/)
- **Git**: [Download here](https://git-scm.com/)

### **2. Clone & Install (2 minutes)**
```bash
# Clone the repository
git clone https://github.com/yourusername/mymeds-brooklyn-care-1.git
cd mymeds-brooklyn-care-1

# Install dependencies
npm install
cd backend && npm install
```

### **3. Environment Setup (1 minute)**
```bash
# Create backend environment file
cd backend
echo "NODE_ENV=development
PORT=4000
HOST=localhost
DATABASE_URL=file:./dev.db
JWT_SECRET=your-super-secure-jwt-secret-here-change-this-in-production-minimum-32-chars
ADMIN_EMAIL=admin@mymedspharmacy.com
ADMIN_PASSWORD=SecureAdmin123!
ADMIN_NAME=Development Administrator
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
DEBUG=true
DEBUG_DATABASE=true
DISABLE_RATE_LIMIT=true
DISABLE_EMAIL_VERIFICATION=true
DISABLE_PAYMENT_PROCESSING=true" > .env
```

### **4. Start the System (1 minute)**
```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd ..
npm run dev
```

**🎉 You're now running MyMeds Pharmacy!**

---

## 🌐 **Access Your System**

| Service | URL | Status |
|---------|-----|---------|
| **Frontend** | http://localhost:5173 | ✅ Running |
| **Backend API** | http://localhost:4000 | ✅ Running |
| **Admin Login** | http://localhost:5173/admin-signin | ✅ Ready |

**Default Admin Credentials:**
- **Email**: `admin@mymedspharmacy.com`
- **Password**: `SecureAdmin123!`

---

## 🧪 **Test Your Setup**

### **Quick API Test**
```bash
# Test backend health
curl http://localhost:4000/api/health

# Test admin login
curl -X POST http://localhost:4000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mymedspharmacy.com","password":"SecureAdmin123!"}'
```

### **Frontend Test**
1. Open http://localhost:5173
2. Navigate to Admin Sign In
3. Login with admin credentials
4. Explore the admin dashboard

---

## 🐛 **Common Issues & Solutions**

### **Port Already in Use**
```bash
# Check what's using the port
netstat -ano | findstr :4000
netstat -ano | findstr :5173

# Kill the process or change ports in .env
```

### **Database Connection Error**
```bash
# Generate Prisma client
cd backend
npx prisma generate
npx prisma db push
```

### **Dependencies Issues**
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 **Next Steps**

### **Immediate Actions**
- ✅ **System Running**: You're all set!
- 🔍 **Explore Frontend**: Navigate through the UI
- 🔌 **Test API**: Try different endpoints
- 👤 **Create Users**: Test user registration

### **Learning Path**
1. **[Developer Onboarding](ONBOARDING.md)** - Complete setup guide
2. **[API Reference](../api/REFERENCE.md)** - Learn the API
3. **[Architecture Overview](../architecture/OVERVIEW.md)** - Understand the system
4. **[Development Guide](../development/BACKEND.md)** - Start coding

---

## 🎯 **What You Can Do Now**

### **🏥 Pharmacy Features**
- **Patient Portal**: User registration and management
- **Prescriptions**: Create and manage prescriptions
- **Appointments**: Schedule and manage appointments
- **Inventory**: Product catalog and management

### **🛒 E-commerce Features**
- **Product Catalog**: Browse products
- **Shopping Cart**: Add items and checkout
- **Order Management**: Track orders and status
- **Payment Processing**: Stripe integration

### **⚙️ Admin Features**
- **Dashboard**: System overview and analytics
- **User Management**: Manage customers and staff
- **Content Management**: Update website content
- **System Settings**: Configure application

---

## 🔧 **Development Workflow**

### **Making Changes**
```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make your changes
# Edit files...

# 3. Test changes
npm test

# 4. Commit and push
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
```

### **Hot Reload**
- **Frontend**: Changes auto-reload in browser
- **Backend**: Server restarts on file changes
- **Database**: Schema changes require migration

---

## 📱 **Mobile Testing**

### **Responsive Design**
- **Mobile**: 375px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

### **Test on Different Devices**
- Use browser dev tools for mobile simulation
- Test touch interactions and gestures
- Verify responsive breakpoints

---

## 🚨 **Troubleshooting**

### **System Won't Start**
```bash
# Check logs
cd backend && npm run dev
# Look for error messages

# Verify environment
cat .env
# Check all required variables are set
```

### **Database Issues**
```bash
# Reset database (SQLite)
cd backend
rm dev.db
npx prisma db push
```

### **Frontend Issues**
```bash
# Clear browser cache
# Check console for errors
# Verify backend is running
```

---

## 🆘 **Need Help?**

### **Quick Support**
- **Documentation**: Check relevant guides
- **Issues**: Search existing GitHub issues
- **Team**: Ask team members for help

### **Escalation**
1. Check this quick start guide
2. Review [Developer Onboarding](ONBOARDING.md)
3. Check [Troubleshooting](../troubleshooting/DEBUGGING.md)
4. Create detailed GitHub issue

---

## 🎉 **You're Ready!**

**Congratulations!** You now have a fully functional MyMeds Pharmacy system running locally.

### **What's Next?**
- **Explore the system** - Navigate through all features
- **Read the documentation** - Understand the architecture
- **Start developing** - Add new features or fix bugs
- **Join the team** - Contribute to the project

**🚀 Happy coding!**

---

**📚 Need more help? Check the [Complete Documentation Index](../README.md)**

