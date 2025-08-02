# Complete Security Setup Guide

## 1. Create Private PostgreSQL on Railway

### Step 1: Create Railway Project
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository

### Step 2: Add Private PostgreSQL Database
1. In your Railway project, click "New Service"
2. Select "Database" → "PostgreSQL"
3. **IMPORTANT**: Ensure it's set to **Private** (default)
4. Note the connection details from "Connect" tab

### Step 3: Verify Private Access
- Database should show "Private" status
- No public endpoints should be visible
- Connection string should be internal only

## 2. Set Strong Environment Variables

### Required Environment Variables
```env
# Database (Railway will auto-generate these)
DATABASE_URL="postgresql://username:password@host:port/database"
DIRECT_URL="postgresql://username:password@host:port/database"

# Security (Generate these)
JWT_SECRET="your-super-secret-jwt-key-here-minimum-32-characters"
JWT_REFRESH_SECRET="another-super-secret-refresh-key-minimum-32-characters"

# Application
FRONTEND_URL="https://your-frontend-domain.com"
NODE_ENV="production"

# Admin User (Change these)
ADMIN_EMAIL="admin@yourpharmacy.com"
ADMIN_PASSWORD="SecurePassword123!@#"
ADMIN_NAME="Admin User"

# Email (for password reset)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@yourpharmacy.com"

# External APIs
VITE_WOOCOMMERCE_URL="https://your-store.com"
VITE_WOOCOMMERCE_CONSUMER_KEY="your-consumer-key"
VITE_WOOCOMMERCE_CONSUMER_SECRET="your-consumer-secret"
VITE_WORDPRESS_URL="https://your-blog.com"
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### Generate Strong Secrets
```bash
# Generate JWT Secret (run this in terminal)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate JWT Refresh Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 3. Use HTTPS Endpoints Only

### Backend HTTPS Configuration
The backend is already configured for HTTPS. Verify these settings:

```javascript
// backend/src/index.js
const corsOptions = {
  origin: process.env.FRONTEND_URL, // HTTPS only
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

### Frontend HTTPS Configuration
Ensure your frontend deployment uses HTTPS:
- Vercel: Automatic HTTPS
- Netlify: Automatic HTTPS
- Railway: Automatic HTTPS

## 4. Implement Proper Authentication

### Enhanced JWT Authentication
The authentication system includes:
- JWT token validation
- Refresh token rotation
- Password hashing with bcrypt
- Rate limiting
- Input validation

### Security Headers
```javascript
// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));
```

## 5. Regular Security Audits

### Automated Security Checks
```bash
# Run security audits
npm audit
npm audit fix

# Check for vulnerabilities
npx audit-ci

# Update dependencies regularly
npm update
```

### Manual Security Checklist
- [ ] Review access logs monthly
- [ ] Check for suspicious login attempts
- [ ] Verify admin user permissions
- [ ] Review API usage patterns
- [ ] Test password reset functionality
- [ ] Verify HTTPS enforcement
- [ ] Check database backup integrity

### Security Monitoring
Set up alerts for:
- Failed login attempts (>5 per hour)
- Unusual API usage patterns
- Database connection errors
- SSL certificate expiration

## 6. Additional Security Measures

### Input Validation
All user inputs are validated using:
- Joi schema validation
- SQL injection prevention
- XSS protection
- CSRF protection

### Data Encryption
- Passwords: bcrypt hashing
- JWT tokens: Signed with strong secret
- Database: Encrypted at rest (Railway default)
- Transport: HTTPS/TLS

### Access Control
- Role-based access (ADMIN, STAFF, CUSTOMER)
- JWT token expiration (1 hour)
- Refresh token rotation
- Session management

## 7. Deployment Checklist

### Before Deployment
- [ ] All environment variables set
- [ ] Strong secrets generated
- [ ] HTTPS configured
- [ ] Security headers enabled
- [ ] Rate limiting active
- [ ] Input validation working
- [ ] Database migrations ready

### After Deployment
- [ ] Test admin login
- [ ] Verify HTTPS redirects
- [ ] Check security headers
- [ ] Test password reset
- [ ] Verify database connection
- [ ] Monitor error logs
- [ ] Test rate limiting

## 8. Emergency Procedures

### If Security Breach Suspected
1. **Immediate Actions:**
   - Rotate JWT secrets
   - Reset admin passwords
   - Review access logs
   - Check for unauthorized access

2. **Investigation:**
   - Audit all user sessions
   - Review recent changes
   - Check for data exfiltration
   - Document incident

3. **Recovery:**
   - Update security measures
   - Notify affected users
   - Implement additional monitoring
   - Review and update procedures

## 9. Compliance Notes

### HIPAA Considerations
- All patient data encrypted
- Access logs maintained
- Regular security audits
- Staff training required
- Incident response plan

### GDPR Considerations
- Data minimization
- User consent management
- Right to be forgotten
- Data portability
- Privacy by design 