# 🚀 Environment Variables Setup Guide

## 📋 **Overview**

This directory contains example environment files for different deployment stages. Use these as templates to create your actual `.env` files.

## 📁 **Available Examples**

### **🌍 Backend Environment**
- `backend.env.example` - Complete backend configuration with all variables
- **Copy to:** `backend/.env`

### **🎨 Frontend Environment**
- `frontend.env.example` - Complete frontend configuration with all variables
- **Copy to:** `.env` (root directory)

### **🚀 Environment-Specific**
- `production.env.example` - Production deployment settings
- `staging.env.example` - Staging deployment settings
- `development.env.example` - Local development settings

## 🔧 **Setup Instructions**

### **Step 1: Backend Setup**
```bash
# Copy backend example
cp env-examples/backend.env.example backend/.env

# Edit with your values
nano backend/.env
```

### **Step 2: Frontend Setup**
```bash
# Copy frontend example
cp env-examples/frontend.env.example .env

# Edit with your values
nano .env
```

### **Step 3: Environment-Specific Setup**
```bash
# For production
cp env-examples/production.env.example backend/.env.production
cp env-examples/production.env.example .env.production

# For staging
cp env-examples/staging.env.example backend/.env.staging
cp env-examples/staging.env.example .env.staging

# For development
cp env-examples/development.env.example backend/.env.development
cp env-examples/development.env.example .env.development
```

## 🔐 **Critical Variables to Set**

### **Backend (.env)**
```bash
# Database
DATABASE_URL="mysql://mymeds_user:YOUR_PASSWORD@localhost:3306/mymeds_production"

# JWT Secrets (Generate strong ones!)
JWT_SECRET=your_64_character_secret_here
JWT_REFRESH_SECRET=your_64_character_refresh_secret_here

# Email
EMAIL_USER=your_email@domain.com
EMAIL_PASS=your_app_password

# URLs
FRONTEND_URL="https://www.mymedspharmacyinc.com"
BACKEND_URL="https://api.mymedspharmacyinc.com"
```

### **Frontend (.env)**
```bash
# API URLs
VITE_API_URL=https://api.mymedspharmacyinc.com
VITE_BACKEND_URL=https://api.mymedspharmacyinc.com

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_key_here

# Analytics
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

## 🎯 **Environment-Specific Configurations**

### **Production**
- Use `https://` URLs
- Production database
- Live Stripe keys
- Strong security settings
- Production analytics IDs

### **Staging**
- Use `https://` URLs
- Staging database
- Test Stripe keys
- Moderate security settings
- Test analytics IDs

### **Development**
- Use `http://localhost` URLs
- Local database
- Test Stripe keys
- Relaxed security settings
- Mock analytics IDs

## 🔒 **Security Best Practices**

### **Password Generation**
```bash
# Generate strong JWT secrets
openssl rand -base64 64
openssl rand -base64 64

# Generate database password
openssl rand -base64 32
```

### **File Permissions**
```bash
# Set secure permissions
chmod 600 backend/.env
chmod 600 .env
chown www-data:www-data backend/.env
chown www-data:www-data .env
```

### **Git Ignore**
```bash
# Ensure .env files are ignored
echo ".env" >> .gitignore
echo ".env.*" >> .gitignore
echo "!.env.example" >> .gitignore
```

## 🧪 **Testing Your Configuration**

### **Backend Test**
```bash
cd backend
npm run test:env
# or
node -e "require('dotenv').config(); console.log('Environment loaded:', process.env.NODE_ENV)"
```

### **Frontend Test**
```bash
npm run dev
# Check browser console for environment variables
```

## 🚨 **Common Issues & Solutions**

### **Variable Not Found**
- Ensure variable names match exactly (case-sensitive)
- Check for typos in variable names
- Verify `.env` file is in correct location

### **Database Connection Failed**
- Verify `DATABASE_URL` format
- Check database credentials
- Ensure database exists and is accessible

### **JWT Errors**
- Generate new JWT secrets if compromised
- Ensure secrets are at least 64 characters
- Use different secrets for different environments

### **Email Not Working**
- Verify SMTP credentials
- Check app password (not regular password)
- Test SMTP connection manually

## 📊 **Environment Variable Reference**

### **Backend Variables**
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NODE_ENV` | ✅ | Environment name | `production` |
| `PORT` | ✅ | Server port | `3000` |
| `DATABASE_URL` | ✅ | Database connection | `mysql://user:pass@host/db` |
| `JWT_SECRET` | ✅ | JWT signing secret | `64_char_secret` |
| `EMAIL_USER` | ✅ | SMTP username | `admin@domain.com` |
| `EMAIL_PASS` | ✅ | SMTP app password | `app_password` |

### **Frontend Variables**
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_URL` | ✅ | Backend API URL | `https://api.domain.com` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | ❌ | Stripe public key | `pk_live_key` |
| `VITE_GOOGLE_ANALYTICS_ID` | ❌ | GA measurement ID | `G-XXXXXXXXXX` |

## 🎉 **Next Steps**

1. ✅ Copy example files to your project
2. ✅ Fill in your actual values
3. ✅ Test configuration in development
4. ✅ Deploy to staging for testing
5. ✅ Deploy to production
6. ✅ Monitor and maintain

## 📞 **Need Help?**

- Check variable names and values
- Verify file locations
- Test with minimal configuration first
- Review error logs for specific issues
- Use environment validation tools

