# 🔍 SMTP Service Testing Guide
## MyMeds Pharmacy Email System Verification

**Purpose:** Ensure SMTP service is 100% working for all customer prescription refill data, contact forms, and transfer requests  
**Last Updated:** January 8, 2025

---

## 🎯 **OVERVIEW**

This guide provides comprehensive testing procedures to verify that the MyMeds Pharmacy SMTP service is fully functional for:

- ✅ **Prescription Refill Requests** - Customer medication refills
- ✅ **Contact Form Submissions** - General inquiries and support
- ✅ **Transfer Requests** - Prescription transfers from other pharmacies
- ✅ **Newsletter Subscriptions** - Marketing communications
- ✅ **Admin Password Resets** - Administrative functions
- ✅ **System Alerts** - Monitoring and notifications
- ✅ **Appointment Requests** - Patient scheduling
- ✅ **File Upload Notifications** - Document processing

---

## 🚀 **QUICK START TESTING**

### **1. Automated Testing Script**
```bash
# Run the comprehensive SMTP test suite
node test-smtp-service.cjs
```

### **2. Manual Testing Commands**
```bash
# Test individual components
node -e "
const { testSMTPConnection } = require('./test-smtp-service.cjs');
testSMTPConnection().then(console.log);
"
```

---

## 🔧 **PREREQUISITES**

### **Required Environment Variables**
```env
# SMTP Configuration
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-app-password
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false

# Optional Configuration
CONTACT_RECEIVER=admin@domain.com
ADMIN_EMAIL=admin@domain.com
```

### **Dependencies**
```bash
# Install required packages
npm install nodemailer
```

---

## 📧 **COMPREHENSIVE TESTING SCENARIOS**

### **1. Prescription Refill Email Testing** 💊

#### **Test Case: Basic Refill Request**
```javascript
// Test prescription refill email
const testData = {
  firstName: "John Doe",
  lastName: "Smith",
  phone: "(555) 123-4567",
  email: "john.doe@example.com",
  prescriptionNumber: "RX123456",
  medication: "Lisinopril 10mg",
  pharmacy: "CVS Pharmacy",
  notes: "Need refill by end of week"
};
```

**Expected Result:**
- ✅ Email sent successfully
- ✅ Message ID generated
- ✅ Content properly formatted
- ✅ All patient data included
- ✅ File attachment information included

#### **Test Case: Refill with File Upload**
```javascript
// Test refill with prescription image
const testData = {
  ...basicRefillData,
  fileName: "prescription-20250108-123456.jpg",
  fileSize: "2.4 MB"
};
```

**Expected Result:**
- ✅ File information included in email
- ✅ Upload directory accessible
- ✅ File size limits enforced
- ✅ File type validation working

---

### **2. Transfer Request Email Testing** 🔄

#### **Test Case: Basic Transfer Request**
```javascript
const testData = {
  firstName: "Jane Smith",
  lastName: "Wilson",
  phone: "(555) 987-6543",
  email: "jane.smith@example.com",
  currentPharmacy: "Walgreens",
  medications: "Metformin 500mg, Atorvastatin 20mg",
  reason: "Moving to new area, prefer local pharmacy"
};
```

**Expected Result:**
- ✅ Transfer notification sent
- ✅ Current pharmacy information included
- ✅ Medication list properly formatted
- ✅ Reason for transfer documented

#### **Test Case: Transfer with Prescription Number**
```javascript
const testData = {
  ...basicTransferData,
  prescriptionNumber: "RX789012",
  prescribingDoctor: "Dr. Michael Johnson"
};
```

**Expected Result:**
- ✅ Prescription number included
- ✅ Doctor information documented
- ✅ Insurance details captured (if provided)

---

### **3. Contact Form Email Testing** 📝

#### **Test Case: General Inquiry**
```javascript
const testData = {
  firstName: "Robert",
  lastName: "Johnson",
  email: "robert.johnson@example.com",
  phone: "(555) 456-7890",
  subject: "General Inquiry",
  message: "Do you offer medication synchronization?",
  serviceType: "General Inquiry",
  urgency: "Normal",
  preferredContact: "Email"
};
```

**Expected Result:**
- ✅ Contact form submission recorded
- ✅ Email notification sent to staff
- ✅ All form fields properly captured
- ✅ Urgency level properly categorized

#### **Test Case: Urgent Support Request**
```javascript
const testData = {
  ...generalInquiryData,
  urgency: "High",
  serviceType: "Technical Support",
  bestTimeToContact: "Morning"
};
```

**Expected Result:**
- ✅ Urgency properly flagged
- ✅ Priority handling implemented
- ✅ Contact preferences respected

---

### **4. Newsletter Subscription Email Testing** 📧

#### **Test Case: New Subscription**
```javascript
const testData = {
  email: "subscriber@example.com",
  source: "Website Footer",
  consent: true
};
```

**Expected Result:**
- ✅ Welcome email sent to subscriber
- ✅ Subscription recorded in database
- ✅ Unsubscribe link included
- ✅ Marketing consent documented

#### **Test Case: Duplicate Subscription**
```javascript
// Attempt to subscribe same email again
const duplicateData = { ...newSubscriptionData };
```

**Expected Result:**
- ✅ Duplicate prevented
- ✅ Appropriate message returned
- ✅ No duplicate emails sent

---

### **5. Admin Password Reset Email Testing** 🔐

#### **Test Case: Password Reset Request**
```javascript
const testData = {
  email: "admin@mymedspharmacy.com",
  resetToken: "jwt-reset-token-123",
  resetUrl: "https://mymedspharmacy.com/admin-reset?token=123"
};
```

**Expected Result:**
- ✅ Reset email sent to admin
- ✅ Secure reset link generated
- ✅ Token expiration enforced
- ✅ Security information included

---

### **6. System Alert Email Testing** 🚨

#### **Test Case: High Server Load Alert**
```javascript
const testData = {
  type: "warning",
  subject: "High Server Load Detected",
  message: "Server CPU usage exceeded 80%",
  data: {
    cpuUsage: "85%",
    memoryUsage: "72%",
    activeConnections: 45
  }
};
```

**Expected Result:**
- ✅ Alert email sent to monitoring team
- ✅ System metrics included
- ✅ Timestamp properly recorded
- ✅ Alert type properly categorized

---

## 🧪 **TESTING PROCEDURES**

### **Step 1: Environment Verification**
```bash
# Check environment variables
echo "SMTP Configuration:"
echo "EMAIL_USER: $EMAIL_USER"
echo "SMTP_HOST: $SMTP_HOST"
echo "SMTP_PORT: $SMTP_PORT"
```

### **Step 2: SMTP Connection Test**
```bash
# Test basic SMTP connectivity
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify()
  .then(() => console.log('✅ SMTP connection successful'))
  .catch(err => console.log('❌ SMTP connection failed:', err.message));
"
```

### **Step 3: Individual Email Tests**
```bash
# Test prescription refill emails
node -e "
const { testPrescriptionRefillEmail } = require('./test-smtp-service.cjs');
testPrescriptionRefillEmail().then(console.log);
"
```

### **Step 4: Full Test Suite**
```bash
# Run complete test suite
node test-smtp-service.cjs
```

---

## 📊 **TEST RESULTS VALIDATION**

### **Success Criteria**
- ✅ **SMTP Connection:** 100% successful
- ✅ **Email Delivery:** All test emails received
- ✅ **Content Accuracy:** All data properly formatted
- ✅ **File Handling:** Uploads properly processed
- ✅ **Error Handling:** Graceful failure handling
- ✅ **Rate Limiting:** Proper throttling implemented

### **Performance Metrics**
- **Connection Time:** < 2 seconds
- **Email Send Time:** < 5 seconds
- **Success Rate:** 100%
- **Error Rate:** 0%

---

## 🚨 **TROUBLESHOOTING**

### **Common Issues & Solutions**

#### **1. SMTP Authentication Failed**
```bash
# Check credentials
echo "User: $EMAIL_USER"
echo "Password: [HIDDEN]"

# Verify with provider
# - Check app password for Gmail
# - Verify Office 365 permissions
# - Check SMTP settings
```

#### **2. Connection Timeout**
```bash
# Check network connectivity
telnet $SMTP_HOST $SMTP_PORT

# Verify firewall settings
# Check ISP SMTP blocking
```

#### **3. Email Not Received**
```bash
# Check spam folder
# Verify recipient email
# Check email provider settings
# Test with different email client
```

#### **4. File Upload Issues**
```bash
# Check upload directory permissions
ls -la uploads/

# Verify file size limits
# Check file type validation
```

---

## 📋 **TESTING CHECKLIST**

### **Pre-Testing Setup**
- [ ] Environment variables configured
- [ ] SMTP credentials verified
- [ ] Test email addresses ready
- [ ] Database connection established
- [ ] File upload directory accessible

### **Core Functionality Tests**
- [ ] SMTP connection successful
- [ ] Prescription refill emails working
- [ ] Transfer request emails working
- [ ] Contact form emails working
- [ ] Newsletter subscription emails working
- [ ] Admin password reset emails working
- [ ] System alert emails working
- [ ] Appointment request emails working
- [ ] File upload notification emails working

### **Edge Case Tests**
- [ ] Large file uploads (>5MB)
- [ ] Invalid email formats
- [ ] Missing required fields
- [ ] Duplicate submissions
- [ ] Rate limiting behavior
- [ ] Error handling scenarios

### **Performance Tests**
- [ ] Multiple simultaneous requests
- [ ] High volume email sending
- [ ] Connection pooling
- [ ] Timeout handling

---

## 📈 **MONITORING & MAINTENANCE**

### **Daily Monitoring**
- Check email delivery logs
- Monitor SMTP connection status
- Verify file upload functionality
- Check error rates

### **Weekly Maintenance**
- Review email delivery reports
- Check SMTP provider status
- Verify backup email configuration
- Update test scenarios

### **Monthly Review**
- Analyze email delivery patterns
- Review error logs and trends
- Update testing procedures
- Performance optimization

---

## 🎯 **SUCCESS VERIFICATION**

### **Final Validation Checklist**
- [ ] All 8 email types tested successfully
- [ ] File uploads working properly
- [ ] Error handling implemented
- [ ] Rate limiting configured
- [ ] Monitoring in place
- [ ] Documentation complete
- [ ] Team trained on procedures

### **Production Readiness**
- [ ] SMTP service 100% functional
- [ ] All customer interactions working
- [ ] Prescription data properly captured
- [ ] Contact forms fully operational
- [ ] Transfer requests processed
- [ ] System alerts functional

---

## 📞 **SUPPORT & CONTACTS**

### **Technical Support**
- **SMTP Issues:** Check provider documentation
- **Code Problems:** Review error logs
- **Configuration:** Verify environment variables

### **Emergency Contacts**
- **System Admin:** [Admin Contact]
- **SMTP Provider:** [Provider Support]
- **Development Team:** [Team Contact]

---

**🎉 When all tests pass, your SMTP service is 100% working and ready for production use!**

