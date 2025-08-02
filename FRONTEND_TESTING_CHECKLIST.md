# 🎨 Frontend Testing Checklist

## 🚀 **Quick Start Testing**

### **1. Start Both Servers**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd ../
npm run dev
```

### **2. Open Browser**
- Go to: `http://localhost:5173`
- Open DevTools (F12) for error monitoring

---

## ✅ **ADMIN LOGIN TESTING**

### **Test Admin Login**
1. **Navigate to Admin Login**
   - Go to: `http://localhost:5173/admin-signin`
   - ✅ Page loads without errors
   - ✅ Form fields are visible

2. **Test Login Credentials**
   ```bash
   Email: admin@yourpharmacy.com
   Password: [your-admin-password]
   ```
   - ✅ Enter credentials and click "Sign In"
   - ✅ Redirects to admin dashboard
   - ✅ Admin panel loads correctly

3. **Test Invalid Login**
   ```bash
   Email: wrong@email.com
   Password: wrongpassword
   ```
   - ✅ Error message displays
   - ✅ Form doesn't submit

4. **Test Logout**
   - ✅ Click logout button
   - ✅ Redirects to login page
   - ✅ Tokens cleared from localStorage

---

## 📝 **FORM SUBMISSIONS TESTING**

### **Contact Form**
1. **Navigate to Contact Form**
   - Go to homepage and find contact section
   - ✅ Form fields are present

2. **Test Valid Submission**
   ```json
   {
     "name": "John Doe",
     "email": "john@example.com", 
     "message": "Test contact form"
   }
   ```
   - ✅ Success message displays
   - ✅ Form clears after submission

3. **Test Invalid Submission**
   ```json
   {
     "name": "",
     "email": "invalid-email",
     "message": ""
   }
   ```
   - ✅ Validation errors display
   - ✅ Form doesn't submit

### **Appointment Form**
1. **Find Appointment Form**
   - Look for appointment booking section
   - ✅ All fields are present

2. **Test Valid Appointment**
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
   - ✅ Success message displays
   - ✅ Form clears after submission

### **Prescription Forms**
1. **Test Prescription Refill**
   - Find prescription refill form
   - ✅ Fill out all required fields
   - ✅ Submit form
   - ✅ Success message displays

2. **Test Prescription Transfer**
   - Find prescription transfer form
   - ✅ Fill out all required fields
   - ✅ Submit form
   - ✅ Success message displays

---

## 🌐 **API INTEGRATIONS TESTING**

### **WooCommerce Shop**
1. **Navigate to Shop**
   - Go to: `http://localhost:5173/shop`
   - ✅ Page loads without errors

2. **Test Product Loading**
   - ✅ Products display (or error message if API not configured)
   - ✅ Product images load
   - ✅ Product details are visible

3. **Test Search**
   - ✅ Enter search term
   - ✅ Products filter correctly

4. **Test Categories**
   - ✅ Category buttons work
   - ✅ Products filter by category

### **WordPress Blog**
1. **Navigate to Blog**
   - Go to: `http://localhost:5173/blog`
   - ✅ Page loads without errors

2. **Test Post Loading**
   - ✅ Blog posts display (or error message if API not configured)
   - ✅ Post images load
   - ✅ Post content is readable

3. **Test Search**
   - ✅ Enter search term
   - ✅ Posts filter correctly

4. **Test Categories**
   - ✅ Category buttons work
   - ✅ Posts filter by category

---

## 🔒 **SECURITY TESTING**

### **JWT Token Testing**
1. **Check Token Storage**
   - After login, open DevTools → Application → Local Storage
   - ✅ `railway-admin-token` exists
   - ✅ `railway-admin-auth` is "true"

2. **Test Token Persistence**
   - ✅ Refresh page after login
   - ✅ Stay logged in, no redirect

3. **Test Invalid Token**
   ```javascript
   // In browser console
   localStorage.setItem('railway-admin-token', 'invalid-token');
   // Refresh page
   ```
   - ✅ Redirects to login page

### **Rate Limiting Test**
1. **Test Login Rate Limiting**
   - Try logging in with wrong credentials 6 times quickly
   - ✅ Rate limiting message appears

2. **Test Form Rate Limiting**
   - Submit contact form 11 times quickly
   - ✅ Rate limiting message appears

---

## 🐛 **ERROR HANDLING TESTING**

### **Network Errors**
1. **Test Backend Down**
   ```bash
   # Stop backend server
   # Try to submit forms
   ```
   - ✅ User-friendly error message
   - ✅ No application crash

2. **Test API Errors**
   - Break WooCommerce/WordPress URLs
   - ✅ Error messages display
   - ✅ No broken UI

### **Input Validation**
1. **Test XSS Protection**
   ```json
   {
     "name": "<script>alert('xss')</script>",
     "email": "test@example.com",
     "message": "Test"
   }
   ```
   - ✅ Script tags are escaped
   - ✅ No JavaScript execution

2. **Test SQL Injection**
   ```json
   {
     "name": "'; DROP TABLE users; --",
     "email": "test@example.com", 
     "message": "Test"
   }
   ```
   - ✅ Input is sanitized
   - ✅ No database errors

---

## 📱 **RESPONSIVE TESTING**

### **Mobile Testing**
1. **Test Mobile Layout**
   - Resize browser to mobile width
   - ✅ All forms are usable
   - ✅ Navigation works
   - ✅ Text is readable

2. **Test Touch Interactions**
   - ✅ Buttons are tappable
   - ✅ Forms are easy to fill
   - ✅ No horizontal scrolling

### **Tablet Testing**
1. **Test Tablet Layout**
   - Resize browser to tablet width
   - ✅ Layout adapts correctly
   - ✅ All functionality works

---

## 🎯 **PERFORMANCE TESTING**

### **Load Testing**
1. **Test Page Load Speed**
   - ✅ Homepage loads quickly
   - ✅ Admin panel loads quickly
   - ✅ Forms are responsive

2. **Test Memory Usage**
   - Open DevTools → Performance
   - ✅ No memory leaks
   - ✅ Smooth interactions

---

## 📋 **QUICK TESTING CHECKLIST**

### **Critical Tests**
- [ ] Admin login works
- [ ] Admin logout works
- [ ] Contact form submits
- [ ] Appointment form submits
- [ ] Prescription forms submit
- [ ] Shop page loads (or shows error)
- [ ] Blog page loads (or shows error)
- [ ] Error messages display properly
- [ ] No console errors
- [ ] Mobile responsive

### **Security Tests**
- [ ] JWT tokens work
- [ ] Rate limiting functions
- [ ] Input validation works
- [ ] XSS protection works
- [ ] No sensitive data in console

### **User Experience Tests**
- [ ] Forms are easy to use
- [ ] Error messages are clear
- [ ] Success messages display
- [ ] Loading states work
- [ ] Navigation is intuitive

---

## 🚨 **COMMON ISSUES & SOLUTIONS**

### **Issue: Admin Login Fails**
**Check:**
1. Backend server is running
2. Environment variables are set
3. Admin user exists in database
4. Browser console for errors

### **Issue: Forms Don't Submit**
**Check:**
1. Backend server is running
2. Database connection
3. CORS configuration
4. Browser console for errors

### **Issue: API Integrations Fail**
**Check:**
1. Environment variables are set
2. API endpoints are accessible
3. API credentials are correct
4. CORS on external APIs

### **Issue: Page Doesn't Load**
**Check:**
1. Frontend server is running
2. Port 5173 is available
3. No JavaScript errors
4. Network connectivity

---

## 📊 **TESTING REPORT TEMPLATE**

```markdown
# Frontend Testing Report - [Date]

## Summary
- Total Tests: [X]
- Passed: [X]
- Failed: [X]
- Success Rate: [X]%

## Critical Issues
1. [Issue description]
2. [Issue description]

## Minor Issues
1. [Issue description]
2. [Issue description]

## Browser Testing
- Chrome: [PASS/FAIL]
- Firefox: [PASS/FAIL]
- Safari: [PASS/FAIL]
- Mobile: [PASS/FAIL]

## Ready for Production: [YES/NO]
```

---

## 🎯 **NEXT STEPS**

After completing frontend tests:
1. **Fix any critical issues** found
2. **Document test results**
3. **Test in different browsers**
4. **Test on mobile devices**
5. **Deploy to staging** if all tests pass
6. **Run tests again** in staging environment

**Remember:** Test thoroughly before deploying to production! 