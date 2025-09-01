# 🎨 MyMeds Pharmacy - Frontend Environment Setup

## 📋 Overview

I've created comprehensive environment configuration files for your MyMeds Pharmacy frontend. Here's how to set them up:

## 📁 Environment Files Created

### 1. `frontend.env.development` - Development Environment
- ✅ Configured for local development
- ✅ Points to `http://localhost:4000` backend
- ✅ Debug mode enabled
- ✅ Analytics disabled
- ✅ Stripe test keys

### 2. `frontend.env.production` - Production Environment
- ✅ Configured for production deployment
- ✅ Points to `https://api.mymedspharmacyinc.com`
- ✅ Security enabled
- ✅ Analytics enabled
- ✅ Stripe live keys

## 🚀 Quick Setup

### For Development:
```bash
# Copy development environment
cp frontend.env.development .env

# Or manually create .env with these essential variables:
```

```env
# Essential Development Variables
VITE_APP_NAME="MyMeds Pharmacy"
VITE_API_URL=http://localhost:4000
VITE_BACKEND_URL=http://localhost:4000
VITE_API_BASE_URL=/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_test_key
VITE_ENABLE_DEBUG_MODE=true
```

### For Production:
```bash
# Copy production environment
cp frontend.env.production .env.production

# Build with production environment
npm run build
```

## 🔧 Key Configuration Sections

### 🌐 API Configuration
```env
VITE_API_URL=http://localhost:4000          # Development
VITE_API_URL=https://api.mymedspharmacyinc.com  # Production
VITE_BACKEND_URL=http://localhost:4000
VITE_API_BASE_URL=/api
```

### 💳 Stripe Configuration
```env
# Development (Test Keys)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_test_publishable_key_here

# Production (Live Keys)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_production_stripe_publishable_key
```

### 📊 Analytics Configuration
```env
# Development
VITE_GOOGLE_ANALYTICS_ENABLED=false
VITE_FACEBOOK_PIXEL_ENABLED=false

# Production
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_GOOGLE_ANALYTICS_ENABLED=true
VITE_FACEBOOK_PIXEL_ID=123456789012345
VITE_FACEBOOK_PIXEL_ENABLED=true
```

### 🔐 Security Configuration
```env
# Development
VITE_ENABLE_HTTPS=false
VITE_STRICT_MODE=false

# Production
VITE_ENABLE_HTTPS=true
VITE_STRICT_MODE=true
```

## 📱 Features Configuration

### Core Features
```env
VITE_ENABLE_PRESCRIPTION_REFILL=true
VITE_ENABLE_ONLINE_ORDERING=true
VITE_ENABLE_APPOINTMENT_BOOKING=true
VITE_ENABLE_MEDICATION_REMINDERS=true
VITE_ENABLE_HEALTH_TRACKING=true
```

### UI Features
```env
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_PWA=true          # Production only
VITE_ANIMATIONS_ENABLED=true
VITE_LOADING_INDICATORS=true
```

## 🎨 Theme Configuration

```env
VITE_PRIMARY_COLOR=#2563eb
VITE_SECONDARY_COLOR=#7c3aed
VITE_ACCENT_COLOR=#f59e0b
VITE_SUCCESS_COLOR=#10b981
VITE_WARNING_COLOR=#f59e0b
VITE_ERROR_COLOR=#ef4444
```

## 📧 Contact Information

```env
VITE_CONTACT_EMAIL=contact@mymedspharmacyinc.com
VITE_SUPPORT_EMAIL=support@mymedspharmacyinc.com
VITE_ADMIN_EMAIL=admin@mymedspharmacyinc.com
```

## 🔄 WordPress Integration

```env
VITE_WORDPRESS_ENABLED=true
VITE_WORDPRESS_URL=https://blog.mymedspharmacyinc.com
VITE_WORDPRESS_API_URL=https://blog.mymedspharmacyinc.com/wp-json/wp/v2
```

## 🧪 Development Tools

```env
# Development
VITE_ENABLE_DEBUG_MODE=true
VITE_ENABLE_LOGGING=true
VITE_LOG_LEVEL=debug
VITE_ENABLE_MOCK_DATA=true

# Production
VITE_ENABLE_DEBUG_MODE=false
VITE_ENABLE_LOGGING=true
VITE_LOG_LEVEL=info
VITE_ENABLE_MOCK_DATA=false
```

## 🔒 Privacy & Compliance

```env
# Development
VITE_ENABLE_COOKIE_CONSENT=false
VITE_ENABLE_GDPR_COMPLIANCE=false
VITE_HIPAA_COMPLIANT=false

# Production
VITE_ENABLE_COOKIE_CONSENT=true
VITE_ENABLE_GDPR_COMPLIANCE=true
VITE_HIPAA_COMPLIANT=true
```

## 🚀 Usage in Your React Components

### Accessing Environment Variables
```typescript
// In your React components
const apiUrl = import.meta.env.VITE_API_URL;
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const appName = import.meta.env.VITE_APP_NAME;

// Example usage
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + import.meta.env.VITE_API_BASE_URL,
  timeout: import.meta.env.VITE_API_TIMEOUT
});
```

### Feature Flags
```typescript
// Check if features are enabled
const isStripeEnabled = import.meta.env.VITE_ENABLE_STRIPE === 'true';
const isDarkModeEnabled = import.meta.env.VITE_ENABLE_DARK_MODE === 'true';
const isDebugMode = import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true';

// Conditional rendering
{isStripeEnabled && <StripePaymentForm />}
{isDarkModeEnabled && <DarkModeToggle />}
```

## 📝 Important Notes

1. **Security**: Never commit `.env` files to version control
2. **Vite Prefix**: All variables must start with `VITE_` to be accessible in the frontend
3. **Build Time**: Environment variables are embedded at build time
4. **TypeScript**: Add types for environment variables in `vite-env.d.ts`

## 🔄 Environment Switching

### Development
```bash
npm run dev  # Uses .env file
```

### Production Build
```bash
npm run build  # Uses .env.production file
```

### Custom Environment
```bash
# Build with specific environment
npm run build -- --mode staging
```

## ✅ Next Steps

1. **Copy the appropriate environment file**:
   ```bash
   cp frontend.env.development .env
   ```

2. **Update with your actual values**:
   - Stripe keys
   - Analytics IDs
   - Contact emails

3. **Test your configuration**:
   ```bash
   npm run dev
   ```

4. **Verify environment variables are loaded**:
   ```typescript
   console.log('API URL:', import.meta.env.VITE_API_URL);
   ```

Your frontend environment is now properly configured for both development and production! 🎉
