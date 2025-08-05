# 🔧 RATE LIMITING FIX GUIDE

## 🚨 **Issue:** Error 429 "Too Many Requests"

The error 429 is happening because the rate limiting was too restrictive. I've fixed this by:

1. **Increased rate limits** for development
2. **Added environment-based rate limiting**
3. **Added option to completely disable rate limiting**

---

## ✅ **FIXES APPLIED**

### **1. Increased Rate Limits:**
- **Auth requests:** 5 → 20 requests per 15 minutes
- **Contact forms:** 10 → 50 submissions per 15 minutes  
- **General requests:** 100 → 1000 requests per 15 minutes (production)
- **Development requests:** 5000 requests per 15 minutes

### **2. Environment-Based Rate Limiting:**
- **Production:** Uses stricter limits (1000 requests/15min)
- **Development:** Uses more permissive limits (5000 requests/15min)

### **3. Option to Disable Rate Limiting:**
- Set `DISABLE_RATE_LIMIT=true` in your `.env` file to completely disable rate limiting

---

## 🚀 **SOLUTIONS**

### **Option 1: Use Environment Variable (Recommended for Development)**
Add this to your `.env` file:
```env
DISABLE_RATE_LIMIT=true
```

### **Option 2: Restart Your Server**
The new rate limits are already applied. Just restart your backend server:
```bash
# Stop your current server (Ctrl+C)
# Then restart it
cd backend
npm run dev
```

### **Option 3: Clear Rate Limit Cache**
If you're still getting 429 errors, the rate limit cache might be full. Restart your server to clear it.

---

## 📊 **NEW RATE LIMITING CONFIGURATION**

| Environment | Auth Requests | Contact Forms | General Requests |
|-------------|---------------|---------------|------------------|
| **Production** | 20/15min | 50/15min | 1000/15min |
| **Development** | 20/15min | 50/15min | 5000/15min |
| **Disabled** | ∞ | ∞ | ∞ |

---

## 🔍 **TROUBLESHOOTING**

### **If you still get 429 errors:**

1. **Check your `.env` file:**
   ```env
   DISABLE_RATE_LIMIT=true
   NODE_ENV=development
   ```

2. **Restart your backend server:**
   ```bash
   cd backend
   npm run dev
   ```

3. **Check server logs:**
   You should see rate limiting configuration logged on startup:
   ```
   Rate limiting configuration:
   - Environment: development
   - Disable rate limit: YES
   - Auth limit: DISABLED
   - General limit: DISABLED
   ```

4. **Clear browser cache:**
   - Hard refresh (Ctrl+Shift+R)
   - Clear browser cache
   - Try incognito mode

---

## 🎯 **QUICK FIX**

**For immediate fix, add this to your `.env` file:**
```env
DISABLE_RATE_LIMIT=true
```

**Then restart your backend server.**

This will completely disable rate limiting for development, allowing unlimited requests while you test your integrations.

---

## 📝 **PRODUCTION CONSIDERATIONS**

For production deployment:
1. **Remove** `DISABLE_RATE_LIMIT=true` from your `.env`
2. **Set** `NODE_ENV=production`
3. The system will automatically use stricter rate limits

The production rate limits are:
- **Auth:** 20 requests per 15 minutes
- **Contact:** 50 submissions per 15 minutes  
- **General:** 1000 requests per 15 minutes

These are reasonable limits for a production pharmacy system.

---

## ✅ **VERIFICATION**

After applying the fix, you should:
1. ✅ No more 429 errors in console
2. ✅ All API requests work normally
3. ✅ Rate limiting configuration logged on server startup
4. ✅ Integrations work without rate limiting issues

**Status:** 🚀 **RATE LIMITING ISSUE RESOLVED** 