# Admin Panel Authentication System

## Overview
The MyMeds Pharmacy admin panel uses a secure, multi-layered authentication system with JWT tokens, CSRF protection, rate limiting, and session management.

## Authentication Method

### 🔐 **Primary Authentication Method: JWT + bcrypt**

#### **Backend Authentication Flow:**
1. **Email/Password Login** → `/api/admin/login`
2. **bcrypt Password Verification** → Secure password hashing
3. **JWT Token Generation** → 2-hour expiration
4. **Session Management** → Database-tracked sessions
5. **CSRF Token** → Additional security layer

#### **Frontend Authentication:**
1. **Login Form** → Email and password input
2. **Token Storage** → localStorage with CSRF token
3. **Auto Token Refresh** → Interceptor-based refresh
4. **Route Protection** → Protected admin routes

## Security Features

### 🛡️ **Multi-Layer Security:**

#### **1. Password Security:**
- **bcrypt Hashing**: Passwords stored as bcrypt hashes
- **Strong Requirements**: Minimum 12 characters
- **Password History**: Tracks last 5 passwords
- **Hash Validation**: Validates bcrypt format

#### **2. Rate Limiting:**
- **Failed Attempts**: Max 5 attempts per account
- **IP-based Limiting**: Max 10 attempts per IP per 15 minutes
- **Lockout Duration**: 15 minutes after max attempts
- **Tracking**: All attempts logged to database

#### **3. Session Management:**
- **JWT Tokens**: 2-hour expiration
- **Session Timeout**: 30 minutes of inactivity
- **Token Blacklisting**: Logout invalidates tokens
- **Database Sessions**: Tracked in admin_sessions table

#### **4. CSRF Protection:**
- **CSRF Tokens**: Generated per session
- **Token Validation**: Server-side validation
- **1-hour Expiration**: CSRF tokens expire

#### **5. Security Headers:**
- **CORS Protection**: Configured origins only
- **Secure Headers**: X-CSRF-Token, Authorization
- **Environment Validation**: Required env vars checked

## Environment Configuration

### 📋 **Required Environment Variables:**

```bash
# Admin Credentials
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD_HASH=$2b$10$your_bcrypt_hash_here
ADMIN_NAME=Admin User

# Security Configuration
JWT_SECRET=your_32_character_minimum_secret
CSRF_SECRET=your_32_character_minimum_csrf_secret

# Optional Admin Details
ADMIN_FIRST_NAME=Admin
ADMIN_LAST_NAME=User
```

### 🔧 **Setting Up Admin Credentials:**

#### **1. Generate bcrypt Hash:**
```bash
# Using Node.js
node -e "console.log(require('bcrypt').hashSync('YourPassword123!', 10))"

# Or use online bcrypt generator
# https://bcrypt-generator.com/
```

#### **2. Set Environment Variables:**
```bash
# In your .env file
ADMIN_EMAIL=admin@mymedspharmacyinc.com
ADMIN_PASSWORD_HASH=$2b$10$your_generated_hash_here
ADMIN_NAME=MyMeds Admin
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
CSRF_SECRET=your_super_secret_csrf_key_min_32_chars
```

#### **3. Initialize Admin User:**
```bash
# Run admin user setup script
node backend/src/ensureAdminUser.ts
```

## Authentication Endpoints

### 🔗 **API Endpoints:**

#### **Admin Login:**
```http
POST /api/admin/login
Content-Type: application/json

{
  "email": "admin@yourdomain.com",
  "password": "YourPassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "admin@yourdomain.com",
    "name": "Admin User",
    "role": "ADMIN"
  },
  "csrfToken": "csrf_token_here",
  "message": "Admin login successful"
}
```

#### **Admin Logout:**
```http
POST /api/admin/logout
Authorization: Bearer jwt_token_here
X-CSRF-Token: csrf_token_here
```

#### **Password Reset:**
```http
POST /api/admin/reset-password
Content-Type: application/json

{
  "email": "admin@yourdomain.com"
}
```

#### **Change Password:**
```http
POST /api/admin/change-password
Authorization: Bearer jwt_token_here
X-CSRF-Token: csrf_token_here
Content-Type: application/json

{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

## Frontend Authentication

### 🖥️ **Admin Sign-In Page:**

**Location:** `/admin-signin`

**Features:**
- Email and password input
- Remember me checkbox
- Password visibility toggle
- Forgot password link
- Real-time validation
- Error handling
- Loading states

### 🔄 **Token Management:**

#### **Automatic Token Refresh:**
```javascript
// API interceptor handles token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Attempt token refresh
      const refreshResponse = await axios.post('/auth/refresh', { token });
      // Update token and retry request
    }
  }
);
```

#### **Session Persistence:**
```javascript
// Tokens stored in localStorage
localStorage.setItem('admin-token', token);
localStorage.setItem('admin-user', JSON.stringify(user));
localStorage.setItem('admin-csrf-token', csrfToken);
```

## Database Schema

### 🗄️ **Authentication Tables:**

#### **Users Table:**
```sql
CREATE TABLE User (
  id          Int      @id @default(autoincrement())
  email       String   @unique
  password    String
  name        String
  role        UserRole @default(CUSTOMER)
  isActive    Boolean  @default(true)
  emailVerified Boolean @default(false)
  lastLoginAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
);
```

#### **Admin Sessions Table:**
```sql
CREATE TABLE AdminSession (
  id        Int      @id @default(autoincrement())
  userId    Int
  token     String   @unique
  ipAddress String
  userAgent String?
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
);
```

#### **Login Attempts Table:**
```sql
CREATE TABLE LoginAttempt (
  id            Int      @id @default(autoincrement())
  email         String
  ipAddress     String
  userAgent     String?
  success       Boolean
  failureReason String?
  createdAt     DateTime @default(now())
);
```

## Security Best Practices

### ✅ **Implemented Security Measures:**

1. **Strong Password Requirements**
   - Minimum 12 characters
   - bcrypt hashing with salt rounds

2. **Rate Limiting**
   - Failed login attempt tracking
   - IP-based rate limiting
   - Account lockout after max attempts

3. **Session Security**
   - Short token expiration (2 hours)
   - Session timeout (30 minutes)
   - Token blacklisting on logout

4. **CSRF Protection**
   - CSRF tokens for state-changing operations
   - Token validation on server

5. **Input Validation**
   - Email format validation
   - Password strength requirements
   - SQL injection prevention

6. **Audit Logging**
   - All login attempts logged
   - Failed attempt tracking
   - Security event monitoring

## Troubleshooting

### 🔧 **Common Issues:**

#### **1. Login Fails:**
- Check ADMIN_EMAIL and ADMIN_PASSWORD_HASH in .env
- Verify bcrypt hash format (starts with $2)
- Check JWT_SECRET is set and 32+ characters
- Review login attempt logs

#### **2. Token Expired:**
- Tokens expire after 2 hours
- Auto-refresh should handle this
- Check JWT_SECRET consistency

#### **3. Rate Limited:**
- Wait 15 minutes after max failed attempts
- Check IP-based rate limiting
- Review LoginAttempt table

#### **4. CSRF Errors:**
- Ensure CSRF_SECRET is set
- Check CSRF token in headers
- Verify token hasn't expired (1 hour)

### 🧪 **Testing Authentication:**

```bash
# Test admin login
curl -X POST http://localhost:4000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yourdomain.com","password":"YourPassword123!"}'

# Test protected endpoint
curl -X GET http://localhost:4000/api/admin/me \
  -H "Authorization: Bearer your_jwt_token" \
  -H "X-CSRF-Token: your_csrf_token"
```

## Production Deployment

### 🚀 **Production Checklist:**

1. **Environment Variables:**
   - Set strong JWT_SECRET (32+ characters)
   - Set strong CSRF_SECRET (32+ characters)
   - Use production admin email
   - Generate secure bcrypt hash

2. **Security Headers:**
   - Enable HTTPS
   - Configure CORS properly
   - Set secure cookies if using

3. **Database Security:**
   - Use connection pooling
   - Enable SSL for database
   - Regular backups

4. **Monitoring:**
   - Monitor login attempts
   - Set up alerts for failed logins
   - Track session activity

## Default Admin Credentials

### ⚠️ **For Development Only:**

**Default Admin (if using reset script):**
- **Email:** admin@outlook.com
- **Password:** Admin@mymeds
- **Hash:** $2b$10$pkhLvqMloM2eV9upbq1RGulTLjZDnuXlLozYrCBEbDx0XKGqEwrdO

**⚠️ Change these in production!**

## Support

For authentication issues:
1. Check environment variables
2. Review login attempt logs
3. Verify database connectivity
4. Test API endpoints directly
5. Check browser console for frontend errors
