# Form and Admin Feature Testing Guide

## 🚀 Quick Start

1. **Start the servers:**
   ```bash
   # Terminal 1 - Frontend (Port 3000)
   npm run dev
   
   # Terminal 2 - Backend (Port 4000)
   cd backend && npm run dev
   ```

2. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000

## 📋 Testing Checklist

### 🔐 Admin Authentication Features

#### 1. Admin Sign-In Page (`/admin-signin`)
- [ ] **Basic Login Flow**
  - Navigate to http://localhost:3000/admin-signin
  - Test with valid admin credentials (check backend/.env for ADMIN_EMAIL and ADMIN_PASSWORD)
  - Verify successful login redirects to `/admin`
  - Test with invalid credentials shows error message
  - Test "Remember Me" functionality

- [ ] **Password Reset Flow**
  - Click "Forgot Password?" link
  - Enter admin email address
  - Verify reset email is sent (check backend logs)
  - Test with invalid email shows appropriate error

- [ ] **Security Features**
  - Test account lockout after 3 failed attempts
  - Verify 30-minute lockout duration
  - Test session timeout (15 minutes)
  - Verify JWT token refresh functionality

#### 2. Admin Dashboard (`/admin`)
- [ ] **Authentication Protection**
  - Verify unauthenticated users are redirected to signin
  - Test token expiration handling
  - Verify automatic logout on auth failure

- [ ] **Dashboard Features**
  - View real-time notifications
  - Check analytics dashboard
  - Test CRM functionality
  - Verify inventory management
  - Test scheduling features
  - Check export functionality

- [ ] **Admin Logout**
  - Test logout button functionality
  - Verify token cleanup
  - Confirm redirect to signin page

### 🏥 Patient Forms

#### 3. Prescription Refill Form
- [ ] **Form Access**
  - Navigate to homepage (http://localhost:3000)
  - Click "Request Refill" button
  - Verify modal opens with multi-step form

- [ ] **Step 1: Patient Information**
  - Test required field validation:
    - First Name (min 2 characters)
    - Last Name (min 2 characters)
    - Phone Number (valid format)
    - Email (optional, but must be valid if provided)
  - Test form navigation (Next/Previous buttons)

- [ ] **Step 2: Prescription Details**
  - Test required field validation:
    - Prescription Number
    - Medication Name
    - Current Pharmacy
  - Test optional fields (Notes)

- [ ] **Step 3: File Upload**
  - Test prescription file upload (PDF, JPG, PNG)
  - Verify file size limit (5MB)
  - Test drag-and-drop functionality
  - Verify file preview

- [ ] **Form Submission**
  - Test successful submission
  - Verify success toast notification
  - Check form reset after submission
  - Verify modal closes after success

#### 4. Prescription Transfer Form
- [ ] **Form Access**
  - Navigate to homepage
  - Click "Transfer Prescription" button
  - Verify modal opens with 4-step form

- [ ] **Step 1: Patient Information (Required)**
  - Test required fields:
    - First Name, Last Name
    - Date of Birth
    - Phone Number
    - Email
  - Test validation for each field

- [ ] **Step 2: Current Pharmacy (Optional)**
  - Test optional fields:
    - Current Pharmacy Name
    - Pharmacy Phone
    - Pharmacy Address

- [ ] **Step 3: Prescription Details**
  - Test required fields:
    - Medication Name
    - Prescription Number
    - Prescribing Doctor
  - Test optional file upload

- [ ] **Step 4: Insurance & Submit**
  - Test optional insurance fields:
    - Insurance Provider
    - Member ID
  - Test final submission

#### 5. Appointment Form
- [ ] **Form Access**
  - Navigate to homepage
  - Click "Schedule Appointment" button
  - Verify modal opens

- [ ] **Form Fields**
  - Test all required fields
  - Test date/time picker functionality
  - Test service selection
  - Test notes field

- [ ] **Submission**
  - Test successful appointment booking
  - Verify confirmation message
  - Check form reset

### 🎯 Advanced Testing Scenarios

#### 6. Error Handling
- [ ] **Network Errors**
  - Disconnect internet during form submission
  - Verify appropriate error messages
  - Test retry functionality

- [ ] **Server Errors**
  - Stop backend server during form submission
  - Verify graceful error handling
  - Test user-friendly error messages

- [ ] **Validation Errors**
  - Test all form validation rules
  - Verify real-time validation feedback
  - Test edge cases (empty strings, special characters)

#### 7. User Experience
- [ ] **Responsive Design**
  - Test forms on mobile devices
  - Verify modal behavior on different screen sizes
  - Test touch interactions

- [ ] **Accessibility**
  - Test keyboard navigation
  - Verify screen reader compatibility
  - Test focus management

- [ ] **Performance**
  - Test form loading times
  - Verify smooth animations
  - Test with large file uploads

#### 8. Data Persistence
- [ ] **Form State**
  - Test form data persistence during navigation
  - Verify form reset after successful submission
  - Test browser refresh handling

- [ ] **Session Management**
  - Test admin session timeout
  - Verify token refresh functionality
  - Test logout cleanup

## 🧪 API Testing

### Backend Endpoints to Test

#### Admin Routes (`/admin/*`)
```bash
# Login
POST http://localhost:4000/admin/login
{
  "email": "admin@mymedspharmacy.com",
  "password": "your-admin-password"
}

# Logout
POST http://localhost:4000/admin/logout

# Get admin info
GET http://localhost:4000/admin/info

# Change password
POST http://localhost:4000/admin/change-password
{
  "currentPassword": "old-password",
  "newPassword": "new-password"
}
```

#### Prescription Routes (`/prescriptions/*`)
```bash
# Refill request
POST http://localhost:4000/prescriptions/refill
Content-Type: multipart/form-data
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "555-123-4567",
  "email": "john@example.com",
  "prescriptionNumber": "RX123456",
  "medication": "Lisinopril",
  "pharmacy": "CVS",
  "notes": "Urgent refill needed",
  "file": [prescription-file]
}

# Transfer request
POST http://localhost:4000/prescriptions/transfer
Content-Type: multipart/form-data
{
  "firstName": "Jane",
  "lastName": "Smith",
  "dateOfBirth": "1990-01-01",
  "phone": "555-987-6543",
  "email": "jane@example.com",
  "currentPharmacy": "Walgreens",
  "medication": "Metformin",
  "prescriptionNumber": "RX789012",
  "prescribingDoctor": "Dr. Johnson"
}
```

## 🐛 Common Issues & Solutions

### Frontend Issues
1. **Forms not opening**
   - Check if modals are properly imported
   - Verify event handlers are connected
   - Check console for JavaScript errors

2. **Form validation not working**
   - Verify validation functions are properly defined
   - Check form state management
   - Test individual validation rules

3. **File upload issues**
   - Check file size limits
   - Verify supported file types
   - Test drag-and-drop functionality

### Backend Issues
1. **Database connection errors**
   - Check Prisma configuration
   - Verify database is running
   - Check environment variables

2. **Authentication errors**
   - Verify JWT secret is set
   - Check admin credentials in .env
   - Test token generation/validation

3. **File upload errors**
   - Check upload directory permissions
   - Verify multer configuration
   - Test file size limits

## 📊 Testing Metrics

### Performance Benchmarks
- Form load time: < 2 seconds
- File upload: < 10 seconds for 5MB files
- API response time: < 1 second
- Page load time: < 3 seconds

### Success Criteria
- All forms submit successfully
- Validation works correctly
- Error handling is user-friendly
- Admin authentication is secure
- File uploads work properly
- Responsive design functions on all devices

## 🔧 Environment Setup

### Required Environment Variables
```bash
# Backend (.env)
ADMIN_EMAIL=admin@mymedspharmacy.com
ADMIN_PASSWORD=your-secure-password
JWT_SECRET=your-jwt-secret
DATABASE_URL=your-database-url

# Frontend (.env)
VITE_API_URL=http://localhost:4000
```

### Dependencies
```bash
# Frontend
npm install

# Backend
cd backend && npm install
```

## 📝 Test Report Template

After completing tests, document results:

```markdown
## Test Report - [Date]

### ✅ Passed Tests
- [List of successful tests]

### ❌ Failed Tests
- [List of failed tests with details]

### 🔧 Issues Found
- [List of bugs or issues]

### 📈 Performance Notes
- [Performance observations]

### 🎯 Recommendations
- [Suggestions for improvements]
```

---

**Happy Testing! 🚀**
