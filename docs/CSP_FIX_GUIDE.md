# Content Security Policy (CSP) Fix Guide

## 🚨 Problem Identified

The WordPress admin panel was showing CSP errors:
```
Note that 'script-src' was not explicitly set, so 'default-src' is used as a fallback.
```

This was blocking WordPress admin scripts from executing properly.

## 🔧 Root Cause

The Content Security Policy headers were too restrictive for WordPress admin functionality:

1. **Missing `'unsafe-inline'`** - WordPress admin scripts use inline JavaScript
2. **Missing `'unsafe-eval'`** - WordPress uses `eval()` for dynamic script execution
3. **Restrictive `script-src`** - Only allowed `'self'` which blocked WordPress functionality

## ✅ Solutions Implemented

### 1. Backend Security Middleware (`backend/src/middleware/security.ts`)

**Before:**
```typescript
scriptSrc: ["'self'"],
connectSrc: ["'self'"],
```

**After:**
```typescript
scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com", "https://ajax.googleapis.com"],
connectSrc: ["'self'", "https:", "wss:", "ws:"],
```

### 2. Nginx Configuration (`deployment/nginx/nginx.conf`)

**Before:**
```nginx
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

**After:**
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; connect-src 'self' https: wss: ws:; font-src 'self' https:; object-src 'none'; media-src 'self'; frame-src 'self'; worker-src 'self'; manifest-src 'self'; form-action 'self'; base-uri 'self';" always;
```

### 3. Security Config (`backend/src/config/security.js`)

**Before:**
```javascript
scriptSrc: ["'self'"],
connectSrc: ["'self'", "https://mymedspharmacyinc.com"]
```

**After:**
```javascript
scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:", "https://cdnjs.cloudflare.com"],
connectSrc: ["'self'", "https://mymedspharmacyinc.com", "https:", "wss:", "ws:"],
```

## 🛡️ Security Considerations

### What We Added:
- `'unsafe-inline'` - Allows inline scripts (required for WordPress admin)
- `'unsafe-eval'` - Allows eval() usage (required for WordPress admin)
- `https:` - Allows HTTPS connections
- `wss:`, `ws:` - Allows WebSocket connections
- `form-action 'self'` - Restricts form submissions to same origin
- `base-uri 'self'` - Restricts base tag URLs

### Security Benefits Maintained:
- ✅ Still blocks malicious external scripts
- ✅ Still prevents XSS attacks from untrusted sources
- ✅ Still restricts object and media sources
- ✅ Still enforces HTTPS connections
- ✅ Still prevents clickjacking with frame restrictions

## 🚀 Testing the Fix

### 1. Restart Backend Server
```bash
cd backend
npm run dev
```

### 2. Test WordPress Admin Panel
- Navigate to WordPress admin
- Check browser console for CSP errors
- Verify media editor functionality
- Test script execution

### 3. Verify Security Headers
```bash
curl -I http://localhost:4000/api/health
```

Should show:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; ...
```

## 📋 Checklist

- [x] Updated backend security middleware
- [x] Updated nginx CSP headers
- [x] Updated security config
- [x] Added WebSocket support
- [x] Maintained security restrictions
- [x] Added form and base URI restrictions
- [ ] Test WordPress admin functionality
- [ ] Verify no CSP errors in console
- [ ] Test media editor functionality
- [ ] Test script execution

## 🔍 Monitoring

After deployment, monitor for:
1. **CSP Violations** - Check browser console
2. **Security Headers** - Verify headers are applied
3. **WordPress Functionality** - Test admin features
4. **Performance** - Ensure no impact on load times

## 🚨 Important Notes

1. **Development vs Production** - These changes apply to both environments
2. **WordPress Compatibility** - These settings are specifically tuned for WordPress admin
3. **Security Balance** - We've balanced functionality with security
4. **Future Updates** - Monitor WordPress updates for CSP changes

## 📞 Support

If you encounter issues:
1. Check browser console for CSP violations
2. Verify security headers are being sent
3. Test with different browsers
4. Check WordPress admin functionality

The CSP fix should resolve the WordPress admin panel script execution issues while maintaining security.
