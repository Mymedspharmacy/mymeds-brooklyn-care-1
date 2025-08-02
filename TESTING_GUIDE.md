# 🧪 COMPREHENSIVE TESTING GUIDE

## 📊 **TESTING OVERVIEW**

This guide will help you test all critical functionality of your pharmacy application:
- ✅ Admin Login & Authentication
- ✅ Form Submissions (Contact, Appointments, Prescriptions)
- ✅ API Integrations (WooCommerce, WordPress)
- ✅ Security Features
- ✅ Error Handling

---

## 🔐 **1. ADMIN LOGIN FUNCTIONALITY TESTING**

### **Prerequisites**
```bash
# 1. Start the backend server
cd backend
npm run dev

# 2. Start the frontend
cd ../
npm run dev

# 3. Ensure environment variables are set
# Check if .env files exist and contain required values
```

### **Test Cases**

#### **Test 1: Basic Login Flow**
1. **Navigate to Admin Login**
   - Go to: `http://localhost:5173/admin-signin`
   - Verify page loads without errors
   - Check if form fields are present

2. **Test Valid Login**
   ```bash
   # Use credentials from your environment variables
   Email: admin@yourpharmacy.com
   Password: [your-admin-password]
   ```
   - Enter valid credentials
   - Click "Sign In"
   - Expected: Redirect to `/admin` dashboard
   - Verify admin panel loads correctly

3. **Test Invalid Login**
   ```bash
   # Test with wrong credentials
   Email: wrong@email.com
   Password: wrongpassword
   ```
   - Expected: Error message displayed
   - Verify error handling works

#### **Test 2: Authentication Persistence**
1. **Refresh Page Test**
   - After successful login, refresh the page
   - Expected: Stay logged in, no redirect to login

2. **Token Validation**
   - Check browser DevTools → Application → Local Storage
   - Verify `railway-admin-token` exists
   - Verify `railway-admin-auth` is set to "true"

#### **Test 3: Logout Functionality**
1. **Test Logout**
   - Click logout button in admin panel
   - Expected: Redirect to login page
   - Verify tokens are cleared from localStorage

#### **Test 4: Password Reset**
1. **Request Password Reset**
   - Click "Forgot password?" link
   - Enter admin email address
   - Expected: Success message (if email configured)

---

## 📝 **2. FORM SUBMISSIONS TESTING**

### **Test 1: Contact Form**
```bash
# Navigate to: http://localhost:5173/
# Scroll to contact section or footer
```

**Test Cases:**
1. **Valid Submission**
   ```json
   {
     "name": "John Doe",
     "email": "john@example.com",
     "message": "Test contact form submission"
   }
   ```
   - Expected: Success message
   - Check backend logs for database entry

2. **Invalid Submission**
   ```json
   {
     "name": "",
     "email": "invalid-email",
     "message": ""
   }
   ```
   - Expected: Validation errors displayed

3. **Database Verification**
   ```bash
   # Check if data was saved
   # In admin panel → Contact tab
   # Or check database directly
   ```

### **Test 2: Appointment Form**
```bash
# Navigate to: http://localhost:5173/
# Find appointment booking section
```

**Test Cases:**
1. **Valid Appointment Request**
   ```json
   {
     "firstName": "Jane",
     "lastName": "Smith",
     "phone": "(555) 123-4567",
     "email": "jane@example.com",
     "service": "Consultation",
     "preferredDate": "2024-12-25",
     "preferredTime": "14:00",
     "notes": "Test appointment"
   }
   ```
   - Expected: Success message
   - Check admin panel for new appointment

2. **File Upload Test** (if applicable)
   - Upload prescription image/PDF
   - Verify file is saved in uploads directory

### **Test 3: Prescription Forms**
```bash
# Navigate to prescription refill/transfer forms
```

**Test Cases:**
1. **Prescription Refill**
   ```json
   {
     "firstName": "Bob",
     "lastName": "Johnson",
     "phone": "(555) 987-6543",
     "email": "bob@example.com",
     "prescriptionNumber": "RX123456",
     "medication": "Lisinopril 10mg",
     "pharmacy": "Current Pharmacy",
     "notes": "Test refill request"
   }
   ```

2. **Prescription Transfer**
   ```json
   {
     "firstName": "Alice",
     "lastName": "Brown",
     "phone": "(555) 456-7890",
     "email": "alice@example.com",
     "prescriptionNumber": "RX789012",
     "medication": "Metformin 500mg",
     "currentPharmacy": "Old Pharmacy",
     "notes": "Test transfer request"
   }
   ```

---

## 🌐 **3. API INTEGRATIONS TESTING**

### **Test 1: WooCommerce Integration**
```bash
# Navigate to: http://localhost:5173/shop
```

**Prerequisites:**
```env
# Ensure these are set in your .env file
VITE_WOOCOMMERCE_URL=https://your-store.com
VITE_WOOCOMMERCE_CONSUMER_KEY=your-consumer-key
VITE_WOOCOMMERCE_CONSUMER_SECRET=your-consumer-secret
```

**Test Cases:**
1. **Products Loading**
   - Expected: Products display from WooCommerce
   - Check browser console for any errors
   - Verify product images load

2. **Categories Loading**
   - Expected: Product categories display
   - Test category filtering

3. **Search Functionality**
   - Enter search term
   - Expected: Filtered products display

4. **Error Handling**
   ```bash
   # Temporarily break the API by setting wrong URL
   VITE_WOOCOMMERCE_URL=https://invalid-url.com
   ```
   - Expected: Error message or fallback content
   - Check console for error logs

### **Test 2: WordPress Integration**
```bash
# Navigate to: http://localhost:5173/blog
```

**Prerequisites:**
```env
# Ensure this is set in your .env file
VITE_WORDPRESS_URL=https://your-blog.com
```

**Test Cases:**
1. **Posts Loading**
   - Expected: Blog posts display from WordPress
   - Verify featured images load
   - Check post content formatting

2. **Categories Loading**
   - Expected: Blog categories display
   - Test category filtering

3. **Search Functionality**
   - Enter search term
   - Expected: Filtered posts display

4. **Error Handling**
   ```bash
   # Temporarily break the API
   VITE_WORDPRESS_URL=https://invalid-url.com
   ```
   - Expected: Error message or fallback content

---

## 🔒 **4. SECURITY TESTING**

### **Test 1: JWT Token Validation**
1. **Valid Token**
   - Login successfully
   - Check token in localStorage
   - Verify API calls work with token

2. **Invalid Token**
   ```javascript
   // In browser console, manually set invalid token
   localStorage.setItem('railway-admin-token', 'invalid-token');
   ```
   - Expected: Redirect to login page
   - Verify error handling

3. **Expired Token**
   - Wait for token to expire (if short expiration set)
   - Expected: Automatic logout

### **Test 2: Rate Limiting**
1. **Login Attempts**
   - Try logging in with wrong credentials multiple times
   - Expected: Rate limiting after 5 attempts

2. **Form Submissions**
   - Submit contact form multiple times quickly
   - Expected: Rate limiting after 10 attempts

### **Test 3: Input Validation**
1. **SQL Injection Attempt**
   ```json
   {
     "name": "'; DROP TABLE users; --",
     "email": "test@example.com",
     "message": "Test"
   }
   ```
   - Expected: Input sanitized, no database errors

2. **XSS Attempt**
   ```json
   {
     "name": "<script>alert('xss')</script>",
     "email": "test@example.com",
     "message": "Test"
   }
   ```
   - Expected: Script tags escaped

---

## 🐛 **5. ERROR HANDLING TESTING**

### **Test 1: Network Errors**
1. **Backend Down**
   ```bash
   # Stop backend server
   # Try to submit forms
   ```
   - Expected: User-friendly error message
   - No application crash

2. **API Timeout**
   - Set very short timeout in API calls
   - Expected: Timeout error handled gracefully

### **Test 2: Database Errors**
1. **Connection Issues**
   - Temporarily break database connection
   - Expected: Error message, no crash

### **Test 3: File Upload Errors**
1. **Invalid File Types**
   - Try uploading .exe file
   - Expected: Validation error

2. **File Too Large**
   - Try uploading 10MB file
   - Expected: Size limit error

---

## 📊 **6. PERFORMANCE TESTING**

### **Test 1: Load Testing**
1. **Multiple Form Submissions**
   - Submit 10 forms simultaneously
   - Expected: All processed correctly

2. **Large Data Sets**
   - Load shop with 100+ products
   - Expected: Reasonable load time

### **Test 2: Memory Usage**
1. **Monitor Memory**
   - Use browser DevTools → Performance
   - Check for memory leaks

---

## 📋 **7. TESTING CHECKLIST**

### **Admin Authentication**
- [ ] Login with valid credentials works
- [ ] Login with invalid credentials shows error
- [ ] Logout clears session
- [ ] Password reset functionality works
- [ ] Token persistence works
- [ ] Token validation works

### **Form Submissions**
- [ ] Contact form saves to database
- [ ] Appointment form saves to database
- [ ] Prescription forms save to database
- [ ] File uploads work correctly
- [ ] Validation errors display properly
- [ ] Success messages display

### **API Integrations**
- [ ] WooCommerce products load
- [ ] WooCommerce categories load
- [ ] WooCommerce search works
- [ ] WordPress posts load
- [ ] WordPress categories load
- [ ] WordPress search works
- [ ] Error handling works for broken APIs

### **Security**
- [ ] JWT tokens work correctly
- [ ] Rate limiting functions
- [ ] Input validation works
- [ ] XSS protection works
- [ ] SQL injection protection works

### **Error Handling**
- [ ] Network errors handled gracefully
- [ ] Database errors handled gracefully
- [ ] File upload errors handled
- [ ] User-friendly error messages

---

## 🚨 **8. COMMON ISSUES & SOLUTIONS**

### **Issue: Admin Login Fails**
**Solutions:**
1. Check environment variables are set
2. Verify database is running
3. Check backend logs for errors
4. Ensure admin user exists in database

### **Issue: Forms Don't Submit**
**Solutions:**
1. Check backend server is running
2. Verify database connection
3. Check CORS configuration
4. Review browser console for errors

### **Issue: API Integrations Fail**
**Solutions:**
1. Verify environment variables are set
2. Check API endpoints are accessible
3. Verify API credentials are correct
4. Check CORS on external APIs

### **Issue: File Uploads Fail**
**Solutions:**
1. Check uploads directory exists
2. Verify file permissions
3. Check file size limits
4. Verify file type validation

---

## 📈 **9. TESTING REPORT TEMPLATE**

After completing tests, document results:

```markdown
# Testing Report - [Date]

## Summary
- Total Tests: [X]
- Passed: [X]
- Failed: [X]
- Success Rate: [X]%

## Critical Issues Found
1. [Issue description]
2. [Issue description]

## Minor Issues Found
1. [Issue description]
2. [Issue description]

## Recommendations
1. [Recommendation]
2. [Recommendation]

## Ready for Production: [YES/NO]
```

---

## 🎯 **10. NEXT STEPS**

After testing:
1. **Fix any critical issues** found
2. **Document test results**
3. **Update environment variables** if needed
4. **Deploy to staging** environment
5. **Run tests again** in staging
6. **Deploy to production** if all tests pass

**Remember:** Always test in a safe environment first, and never test with production data! 