# 📋 MyMeds Pharmacy - Form Testing Guide

## 🚀 Current Status
- **Frontend**: Running on `http://localhost:3003/`
- **Backend**: Running on `http://localhost:4000/`
- **API**: Configured to use localhost

## 📝 Forms to Test

### 1. 📋 Prescription Refill Form
**Location**: Home page (`/`) - Click "Prescription Refill" button

**Test Data**:
- Patient Name: `John Doe`
- Phone: `555-123-4567`
- Medication: `Metformin 500mg`
- Quantity: `30`
- Current Pharmacy: `CVS Pharmacy`
- Date of Birth: `1990-01-15`
- Insurance: `Blue Cross Blue Shield`

**Expected Behavior**:
- Form should open in modal
- All fields should be fillable
- Submit should send to `http://localhost:4000/prescriptions/refill`
- Should show success/error message

### 2. 📅 Appointment Booking Form
**Location**: Home page (`/`) - Click "Book Appointment" button

**Test Data**:
- Name: `Jane Smith`
- Email: `jane@example.com`
- Phone: `555-987-6543`
- Service: `Medication Review`
- Preferred Date: `2025-09-10`
- Preferred Time: `14:00`
- Message: `Need consultation for new medication`

**Expected Behavior**:
- Form should open in modal
- Date picker should work
- Time selection should work
- Submit should send to `http://localhost:4000/appointments/request`

### 3. 🔄 Prescription Transfer Form
**Location**: Home page (`/`) - Click "Transfer Prescription" button

**Test Data**:
- Patient Name: `Bob Johnson`
- Phone: `555-456-7890`
- Current Pharmacy: `Walgreens`
- Medication: `Lisinopril 10mg`
- Quantity: `90`
- Date of Birth: `1985-03-22`

**Expected Behavior**:
- Form should open in modal
- All fields should be fillable
- Submit should send to `http://localhost:4000/prescriptions/transfer`

### 4. 📞 Contact Form
**Location**: Contact page (`/contact`)

**Test Data**:
- Name: `Test User`
- Email: `test@example.com`
- Phone: `555-111-2222`
- Subject: `General Inquiry`
- Message: `This is a test message for form testing.`

**Expected Behavior**:
- Form should be visible on page
- All fields should be fillable
- Submit should send to `http://localhost:4000/contact`

### 5. 🛒 WooCommerce Checkout Form
**Location**: Shop page (`/shop`) - Add item to cart and checkout

**Test Data**:
- First Name: `Test`
- Last Name: `Customer`
- Email: `test@example.com`
- Phone: `555-333-4444`
- Address: `123 Test Street`
- City: `Test City`
- State: `NY`
- ZIP: `12345`

**Expected Behavior**:
- Form should appear after adding items to cart
- All billing fields should be fillable
- Payment integration should work

### 6. 👤 Patient Portal Login Form
**Location**: Patient Portal page (`/patient-portal`)

**Test Data**:
- Username: `testuser`
- Password: `testpassword123`

**Expected Behavior**:
- Form should be visible on page
- Login should authenticate against backend
- Should redirect to patient dashboard on success

### 7. 🔍 Medicine Search Form
**Location**: Home page (`/`) - Medicine search section

**Test Data**:
- Search Term: `aspirin`
- Category: `Pain Relief`

**Expected Behavior**:
- Search should work
- Results should display
- API calls should go to localhost

### 8. 💊 Medication Interaction Checker
**Location**: Home page (`/`) - Interaction checker section

**Test Data**:
- Medication 1: `Aspirin`
- Medication 2: `Warfarin`

**Expected Behavior**:
- Form should accept medication names
- Should check interactions via API
- Results should display

## 🧪 Testing Checklist

### ✅ Frontend Testing
- [ ] All forms load without errors
- [ ] Form validation works
- [ ] Error messages display properly
- [ ] Success messages display properly
- [ ] Forms submit to correct endpoints
- [ ] No console errors

### ✅ Backend Testing
- [ ] All API endpoints respond
- [ ] Form data is received correctly
- [ ] Database operations work
- [ ] Email notifications work
- [ ] Error handling works

### ✅ Integration Testing
- [ ] Frontend to backend communication
- [ ] Form submission flow
- [ ] Data persistence
- [ ] Email delivery

## 🐛 Common Issues to Check

1. **CORS Errors**: Should be resolved with current config
2. **API Timeouts**: Check network tab for slow requests
3. **Form Validation**: Ensure client-side validation works
4. **Database Connection**: Check backend logs for DB errors
5. **Email Configuration**: Verify SMTP settings

## 📊 Test Results Template

```
Form Test Results:
=================

1. Refill Form: [PASS/FAIL] - Notes:
2. Appointment Form: [PASS/FAIL] - Notes:
3. Transfer Form: [PASS/FAIL] - Notes:
4. Contact Form: [PASS/FAIL] - Notes:
5. WooCommerce Checkout: [PASS/FAIL] - Notes:
6. Patient Portal Login: [PASS/FAIL] - Notes:
7. Medicine Search: [PASS/FAIL] - Notes:
8. Interaction Checker: [PASS/FAIL] - Notes:

Overall Status: [PASS/FAIL]
Issues Found: [List any issues]
```

## 🚀 Quick Start Commands

```bash
# Start frontend (if not running)
npm run dev

# Start backend (if not running)
cd backend && npm run dev

# Check if servers are running
netstat -ano | findstr ":3003\|:4000"
```

## 📱 Testing URLs

- **Frontend**: http://localhost:3003/
- **Backend API**: http://localhost:4000/
- **Health Check**: http://localhost:4000/api/health
