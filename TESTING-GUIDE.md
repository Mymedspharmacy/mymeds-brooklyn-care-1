# MyMeds Pharmacy Testing Guide

## Prerequisites
- Backend server running on `http://localhost:4000`
- Frontend server running on `http://localhost:5173` (or your Vite port)
- Database configured and migrated

---

## 1. Shop Features Testing

### 1.1 Product Browsing
**Test Cases:**
- [ ] Navigate to Shop page
- [ ] Verify products load from WooCommerce
- [ ] Check product images display correctly
- [ ] Verify product prices are visible
- [ ] Test product search functionality
- [ ] Test product category filtering

**API Endpoints to Test:**
```bash
# Get all products
curl http://localhost:4000/api/products

# Get WooCommerce products
curl http://localhost:4000/api/woocommerce/products

# Get specific product
curl http://localhost:4000/api/products/1
```

### 1.2 Shopping Cart
**Test Cases:**
- [ ] Add product to cart (guest user)
- [ ] Add product to cart (logged in user)
- [ ] Update product quantity in cart
- [ ] Remove product from cart
- [ ] View cart summary
- [ ] Verify cart persists across page refreshes

**API Endpoints to Test:**
```bash
# Get cart
curl http://localhost:4000/api/cart

# Add to cart (requires authentication)
curl -X POST http://localhost:4000/api/cart \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 2}'
```

### 1.3 Checkout Process
**Test Cases:**
- [ ] View checkout page
- [ ] Fill in shipping information
- [ ] Fill in billing information
- [ ] Select payment method
- [ ] Apply discount/coupon code (if available)
- [ ] Review order summary
- [ ] Complete order
- [ ] Verify order confirmation

**API Endpoints to Test:**
```bash
# Create order
curl -X POST http://localhost:4000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "items": [{"productId": 1, "quantity": 2}],
    "shippingAddress": "123 Main St",
    "billingAddress": "123 Main St"
  }'

# Get orders
curl http://localhost:4000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 1.4 Product Reviews
**Test Cases:**
- [ ] View product reviews
- [ ] Submit a product review
- [ ] Rate a product (1-5 stars)
- [ ] Upload review images (if supported)

**API Endpoints to Test:**
```bash
# Get reviews
curl http://localhost:4000/api/reviews

# Submit review
curl -X POST http://localhost:4000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "rating": 5,
    "title": "Great product",
    "comment": "Highly recommend",
    "customerName": "John Doe",
    "customerEmail": "john@example.com"
  }'
```

---

## 2. Blog Features Testing

### 2.1 Blog Posts
**Test Cases:**
- [ ] Navigate to Blog page
- [ ] View list of blog posts
- [ ] Click on blog post to view details
- [ ] Verify blog post content displays correctly
- [ ] Check featured image displays
- [ ] Test blog post pagination
- [ ] Test blog search functionality

**API Endpoints to Test:**
```bash
# Get all blog posts
curl http://localhost:4000/api/blogs

# Get WordPress posts
curl http://localhost:4000/api/wordpress/posts

# Get specific blog post
curl http://localhost:4000/api/blogs/1
```

### 2.2 Blog Categories & Tags
**Test Cases:**
- [ ] View blog categories
- [ ] Filter posts by category
- [ ] View blog tags
- [ ] Filter posts by tag

**API Endpoints to Test:**
```bash
# Get WordPress categories
curl http://localhost:4000/api/wordpress/categories

# Get WordPress tags
curl http://localhost:4000/api/wordpress/tags
```

### 2.3 Blog Comments (if implemented)
**Test Cases:**
- [ ] View comments on blog post
- [ ] Submit a comment
- [ ] Reply to a comment
- [ ] Verify comment moderation

---

## 3. Admin Panel Features Testing

### 3.1 Admin Authentication
**Test Cases:**
- [ ] Navigate to admin login page
- [ ] Login with admin credentials
- [ ] Verify admin dashboard loads
- [ ] Test invalid credentials
- [ ] Test logout functionality

**API Endpoints to Test:**
```bash
# Admin login
curl -X POST http://localhost:4000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your_password"
  }'

# Get admin profile
curl http://localhost:4000/api/admin/profile \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 3.2 Dashboard & Analytics
**Test Cases:**
- [ ] View dashboard overview
- [ ] Check total sales statistics
- [ ] Check total orders count
- [ ] Check total customers count
- [ ] View recent orders
- [ ] View sales charts/graphs
- [ ] Check analytics data

**API Endpoints to Test:**
```bash
# Get dashboard data
curl http://localhost:4000/api/admin/dashboard \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Get analytics
curl http://localhost:4000/api/analytics/dashboard \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 3.3 Order Management
**Test Cases:**
- [ ] View all orders
- [ ] Filter orders by status
- [ ] View order details
- [ ] Update order status
- [ ] Process refunds
- [ ] Print/download order invoice
- [ ] Send order confirmation email

**API Endpoints to Test:**
```bash
# Get all orders (admin)
curl http://localhost:4000/api/admin/orders \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Update order status
curl -X PUT http://localhost:4000/api/admin/orders/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "shipped"}'
```

### 3.4 Product Management
**Test Cases:**
- [ ] View all products
- [ ] Add new product
- [ ] Edit product details
- [ ] Upload product images
- [ ] Set product pricing
- [ ] Manage product inventory
- [ ] Delete product
- [ ] Bulk actions on products

**API Endpoints to Test:**
```bash
# Create product (admin)
curl -X POST http://localhost:4000/api/admin/products \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "price": 19.99,
    "description": "Test description",
    "stock": 100
  }'
```

### 3.5 User Management
**Test Cases:**
- [ ] View all users
- [ ] View customer details
- [ ] Edit user information
- [ ] Change user role
- [ ] Deactivate/activate user
- [ ] Delete user
- [ ] View user order history

**API Endpoints to Test:**
```bash
# Get all users
curl http://localhost:4000/api/admin/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Update user
curl -X PUT http://localhost:4000/api/admin/users/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "CUSTOMER"}'
```

### 3.6 Prescription Management
**Test Cases:**
- [ ] View all prescriptions
- [ ] View prescription details
- [ ] Approve prescription
- [ ] Reject prescription
- [ ] Upload prescription documents
- [ ] Process prescription refills

**API Endpoints to Test:**
```bash
# Get all prescriptions
curl http://localhost:4000/api/prescriptions \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Create prescription
curl -X POST http://localhost:4000/api/prescriptions \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 1,
    "medicationName": "Test Medication",
    "dosage": "10mg",
    "instructions": "Take twice daily"
  }'
```

### 3.7 Appointment Management
**Test Cases:**
- [ ] View all appointments
- [ ] Create new appointment
- [ ] Edit appointment
- [ ] Cancel appointment
- [ ] View appointment calendar
- [ ] Send appointment reminders

**API Endpoints to Test:**
```bash
# Get appointments
curl http://localhost:4000/api/appointments \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Create appointment
curl -X POST http://localhost:4000/api/appointments \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 1,
    "date": "2025-10-15",
    "time": "10:00",
    "type": "consultation"
  }'
```

### 3.8 Refill & Transfer Requests
**Test Cases:**
- [ ] View refill requests
- [ ] Approve/reject refill requests
- [ ] View transfer requests
- [ ] Process transfer requests

**API Endpoints to Test:**
```bash
# Get refill requests
curl http://localhost:4000/api/refill-requests \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Get transfer requests
curl http://localhost:4000/api/transfer-requests \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 3.9 Feedback & Contact Management
**Test Cases:**
- [ ] View customer feedback
- [ ] Respond to feedback
- [ ] View contact form submissions
- [ ] Mark feedback as resolved

**API Endpoints to Test:**
```bash
# Get feedback
curl http://localhost:4000/api/feedback

# Submit feedback
curl -X POST http://localhost:4000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Great service!",
    "rating": 5
  }'
```

### 3.10 Newsletter Management
**Test Cases:**
- [ ] View newsletter subscribers
- [ ] Export subscriber list
- [ ] Send newsletter
- [ ] Unsubscribe user

**API Endpoints to Test:**
```bash
# Subscribe to newsletter
curl -X POST http://localhost:4000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### 3.11 Location Management
**Test Cases:**
- [ ] View all locations
- [ ] Add new location
- [ ] Edit location details
- [ ] Delete location
- [ ] View location on map

**API Endpoints to Test:**
```bash
# Get locations
curl http://localhost:4000/api/locations

# Create location
curl -X POST http://localhost:4000/api/locations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Brooklyn Location",
    "address": "123 Brooklyn Ave",
    "phone": "555-0123",
    "hours": "Mon-Fri 9AM-6PM"
  }'
```

### 3.12 System Monitoring
**Test Cases:**
- [ ] View system health
- [ ] Check server logs
- [ ] Monitor database performance
- [ ] View error logs

**API Endpoints to Test:**
```bash
# Health check
curl http://localhost:4000/api/health

# Database health
curl http://localhost:4000/api/health/db

# Monitoring dashboard
curl http://localhost:4000/api/monitoring/dashboard \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 4. Additional Features

### 4.1 Search Functionality
**Test Cases:**
- [ ] Test global search
- [ ] Search for products
- [ ] Search for blog posts
- [ ] Search for medications

### 4.2 Notifications
**Test Cases:**
- [ ] View notifications
- [ ] Mark notification as read
- [ ] Receive real-time notifications

**API Endpoints to Test:**
```bash
# Get notifications
curl http://localhost:4000/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4.3 Patient Portal
**Test Cases:**
- [ ] Patient registration
- [ ] View prescription history
- [ ] Request refills
- [ ] View appointments

**API Endpoints to Test:**
```bash
# Patient registration
curl -X POST http://localhost:4000/api/patient/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

---

## Testing Checklist Summary

### Critical Features
- [ ] User authentication (login/logout)
- [ ] Product browsing and search
- [ ] Shopping cart functionality
- [ ] Checkout process
- [ ] Order management
- [ ] Admin dashboard access
- [ ] Prescription management
- [ ] Appointment scheduling

### Secondary Features
- [ ] Blog posts and comments
- [ ] Product reviews
- [ ] Newsletter subscription
- [ ] Contact form
- [ ] Location management
- [ ] Analytics and reporting
- [ ] Notifications
- [ ] System monitoring

### Security & Performance
- [ ] Test role-based access control
- [ ] Verify admin-only endpoints are protected
- [ ] Check rate limiting
- [ ] Test CORS configuration
- [ ] Verify input validation
- [ ] Check XSS protection
- [ ] Test SQL injection prevention
- [ ] Monitor page load times
- [ ] Check mobile responsiveness

---

## Test Results Template

| Feature | Status | Notes | Priority |
|---------|--------|-------|----------|
| Product Browsing | ✅/❌ | | High |
| Shopping Cart | ✅/❌ | | High |
| Checkout | ✅/❌ | | High |
| Admin Login | ✅/❌ | | High |
| Order Management | ✅/❌ | | High |
| Blog Posts | ✅/❌ | | Medium |
| Prescriptions | ✅/❌ | | High |
| Appointments | ✅/❌ | | Medium |

---

## Known Issues & Limitations

- WooCommerce/WordPress APIs require external services to be running
- Some features may require specific environment variables
- Real-time notifications require WebSocket connection

---

## Contact & Support

For issues or questions during testing, check:
- Backend logs in `backend/logs/`
- Frontend console in browser DevTools
- Network tab for API call details


