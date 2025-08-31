# 📡 Complete API Reference

## 🎯 **MyMeds Pharmacy API Documentation**

This document provides complete API endpoint documentation for the MyMeds Pharmacy system.

---

## 🔐 **Authentication & Authorization**

### **JWT Token Format**
All authenticated endpoints require a JWT token in the Authorization header:
```http
Authorization: Bearer <jwt_token>
```

### **Token Response Format**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@mymedspharmacy.com",
    "name": "Admin User",
    "role": "ADMIN"
  }
}
```

---

## 👥 **User Management API**

### **User Registration**
```http
POST /api/users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "role": "CUSTOMER"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 2,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "CUSTOMER",
    "emailVerified": false,
    "createdAt": "2024-12-01T10:00:00Z"
  }
}
```

**Validation Rules:**
- `email`: Valid email format, unique
- `password`: Min 12 chars, uppercase, lowercase, number, special char
- `name`: Min 2 chars, max 100 chars
- `role`: Must be one of: `CUSTOMER`, `ADMIN`, `PHARMACIST`

### **User Login**
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "CUSTOMER"
  }
}
```

### **Get User Profile**
```http
GET /api/users/profile
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "CUSTOMER",
    "emailVerified": true,
    "lastLoginAt": "2024-12-01T10:00:00Z",
    "createdAt": "2024-12-01T09:00:00Z",
    "patientProfile": {
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1990-01-01",
      "phone": "+1-555-0123",
      "verificationStatus": "VERIFIED"
    }
  }
}
```

### **Update User Profile**
```http
PUT /api/users/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "John Smith",
  "phone": "+1-555-0124"
}
```

---

## 🔐 **Admin API**

### **Admin Login**
```http
POST /api/admin/login
Content-Type: application/json

{
  "email": "admin@mymedspharmacy.com",
  "password": "SecureAdmin123!"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "admin@mymedspharmacy.com",
    "name": "Admin User",
    "role": "ADMIN"
  }
}
```

### **Get Admin Dashboard**
```http
GET /api/admin/dashboard
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalUsers": 150,
      "totalOrders": 89,
      "totalPrescriptions": 234,
      "pendingRefills": 12
    },
    "recentActivity": [
      {
        "type": "order_created",
        "message": "New order #1234 created",
        "timestamp": "2024-12-01T10:00:00Z"
      }
    ]
  }
}
```

### **Change Admin Password**
```http
POST /api/admin/change-password
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "currentPassword": "SecureAdmin123!",
  "newPassword": "NewSecureAdmin456!"
}
```

---

## 💊 **Prescription Management API**

### **Create Prescription**
```http
POST /api/prescriptions
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "medication": "Lisinopril 10mg",
  "dosage": "1 tablet daily",
  "instructions": "Take in the morning with food",
  "refillsRemaining": 3
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "medication": "Lisinopril 10mg",
    "dosage": "1 tablet daily",
    "instructions": "Take in the morning with food",
    "refillsRemaining": 3,
    "status": "ACTIVE",
    "createdAt": "2024-12-01T10:00:00Z"
  }
}
```

### **Get User Prescriptions**
```http
GET /api/prescriptions
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `status`: Filter by status (ACTIVE, EXPIRED, DISCONTINUED)
- `page`: Page number for pagination
- `limit`: Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "prescriptions": [
      {
        "id": 1,
        "medication": "Lisinopril 10mg",
        "dosage": "1 tablet daily",
        "instructions": "Take in the morning with food",
        "refillsRemaining": 3,
        "status": "ACTIVE",
        "createdAt": "2024-12-01T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

### **Request Refill**
```http
POST /api/prescriptions/:id/refill
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "urgency": "normal",
  "notes": "Running low on medication"
}
```

**Urgency Levels:**
- `low`: 7-14 days
- `normal`: 3-7 days
- `high`: 1-3 days
- `urgent`: Same day

---

## 🛒 **E-commerce API**

### **Get Products**
```http
GET /api/products
```

**Query Parameters:**
- `category`: Filter by category ID
- `search`: Search by product name
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter
- `inStock`: Filter by stock availability
- `page`: Page number
- `limit`: Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Vitamin D3 1000IU",
        "description": "High-quality vitamin D supplement",
        "price": 19.99,
        "stock": 150,
        "category": {
          "id": 1,
          "name": "Vitamins"
        },
        "images": [
          "https://example.com/vitamin-d3.jpg"
        ],
        "variants": [
          {
            "name": "Size",
            "value": "60 tablets",
            "price": 19.99
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

### **Get Product Details**
```http
GET /api/products/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Vitamin D3 1000IU",
    "description": "High-quality vitamin D supplement for bone health and immune support.",
    "price": 19.99,
    "stock": 150,
    "category": {
      "id": 1,
      "name": "Vitamins"
    },
    "images": [
      "https://example.com/vitamin-d3-1.jpg",
      "https://example.com/vitamin-d3-2.jpg"
    ],
    "variants": [
      {
        "id": 1,
        "name": "Size",
        "value": "60 tablets",
        "price": 19.99,
        "stock": 150
      },
      {
        "id": 2,
        "name": "Size",
        "value": "120 tablets",
        "price": 34.99,
        "stock": 75
      }
    ],
    "reviews": [
      {
        "id": 1,
        "rating": 5,
        "text": "Great product, highly recommend!",
        "userName": "John D.",
        "createdAt": "2024-11-15T10:00:00Z"
      }
    ]
  }
}
```

### **Add to Cart**
```http
POST /api/cart/items
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "productId": 1,
  "quantity": 2,
  "variantId": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item added to cart",
  "data": {
    "cartItem": {
      "id": 1,
      "productId": 1,
      "quantity": 2,
      "price": 19.99,
      "total": 39.98,
      "product": {
        "name": "Vitamin D3 1000IU",
        "imageUrl": "https://example.com/vitamin-d3.jpg"
      }
    },
    "cartTotal": 39.98,
    "itemCount": 2
  }
}
```

### **Get Cart**
```http
GET /api/cart
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "items": [
      {
        "id": 1,
        "productId": 1,
        "quantity": 2,
        "price": 19.99,
        "total": 39.98,
        "product": {
          "name": "Vitamin D3 1000IU",
          "imageUrl": "https://example.com/vitamin-d3.jpg"
        }
      }
    ],
    "subtotal": 39.98,
    "tax": 3.20,
    "shipping": 5.99,
    "total": 49.17
  }
}
```

---

## 📦 **Order Management API**

### **Create Order**
```http
POST /api/orders
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "cartId": 1,
  "shippingAddress": "123 Main St",
  "shippingCity": "Brooklyn",
  "shippingState": "NY",
  "shippingZipCode": "11201",
  "shippingMethod": "standard",
  "paymentMethod": "stripe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": 1,
      "orderNumber": "MM-2024-001",
      "status": "pending",
      "paymentStatus": "pending",
      "total": 49.17,
      "shippingAddress": "123 Main St",
      "shippingCity": "Brooklyn",
      "shippingState": "NY",
      "shippingZipCode": "11201",
      "createdAt": "2024-12-01T10:00:00Z"
    },
    "paymentIntent": {
      "clientSecret": "pi_xxx_secret_xxx"
    }
  }
}
```

### **Get User Orders**
```http
GET /api/orders
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `status`: Filter by order status
- `page`: Page number
- `limit`: Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": 1,
        "orderNumber": "MM-2024-001",
        "status": "processing",
        "paymentStatus": "paid",
        "total": 49.17,
        "createdAt": "2024-12-01T10:00:00Z",
        "items": [
          {
            "productName": "Vitamin D3 1000IU",
            "quantity": 2,
            "price": 19.99
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

### **Get Order Details**
```http
GET /api/orders/:id
Authorization: Bearer <jwt_token>
```

---

## 📅 **Appointment API**

### **Create Appointment**
```http
POST /api/appointments
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "date": "2024-12-15T14:00:00Z",
  "reason": "Medication consultation",
  "type": "consultation"
}
```

**Appointment Types:**
- `consultation`: General consultation
- `vaccination`: Vaccination appointment
- `testing`: Lab testing
- `pickup`: Prescription pickup

### **Get Available Slots**
```http
GET /api/appointments/available-slots
```

**Query Parameters:**
- `date`: Date to check (YYYY-MM-DD)
- `type`: Appointment type

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2024-12-15",
    "slots": [
      {
        "time": "09:00",
        "available": true
      },
      {
        "time": "10:00",
        "available": false
      },
      {
        "time": "11:00",
        "available": true
      }
    ]
  }
}
```

---

## 🔔 **Notifications API**

### **Get User Notifications**
```http
GET /api/notifications
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `type`: Filter by notification type
- `read`: Filter by read status
- `page`: Page number
- `limit`: Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": 1,
        "type": "prescription_refill",
        "title": "Refill Ready",
        "message": "Your prescription for Lisinopril is ready for pickup",
        "read": false,
        "createdAt": "2024-12-01T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

### **Mark Notification as Read**
```http
PUT /api/notifications/:id/read
Authorization: Bearer <jwt_token>
```

---

## 🏥 **Patient Portal API**

### **Create Patient Profile**
```http
POST /api/patient-profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01",
  "phone": "+1-555-0123",
  "address": "123 Main St",
  "city": "Brooklyn",
  "state": "NY",
  "zipCode": "11201",
  "emergencyContactName": "Jane Doe",
  "emergencyContactPhone": "+1-555-0124",
  "emergencyContactRelationship": "Spouse",
  "insuranceProvider": "Blue Cross Blue Shield",
  "insuranceGroupNumber": "12345",
  "insuranceMemberId": "67890"
}
```

### **Upload Documents**
```http
POST /api/patient-profile/documents
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

{
  "documentType": "government_id",
  "file": <file_upload>
}
```

**Document Types:**
- `government_id`: Government-issued ID
- `proof_of_address`: Proof of address
- `insurance_card`: Insurance card
- `prescription`: Prescription document

---

## 🔍 **Search & Filter API**

### **Search Products**
```http
GET /api/search/products
```

**Query Parameters:**
- `q`: Search query
- `category`: Category filter
- `priceRange`: Price range filter
- `inStock`: Stock availability

### **Search Medications**
```http
GET /api/search/medications
```

**Query Parameters:**
- `q`: Medication name or generic name
- `interaction`: Check for drug interactions

---

## 📊 **Analytics API (Admin Only)**

### **Get Sales Analytics**
```http
GET /api/admin/analytics/sales
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**
- `startDate`: Start date for range
- `endDate`: End date for range
- `groupBy`: Group by day, week, month

### **Get User Analytics**
```http
GET /api/admin/analytics/users
Authorization: Bearer <admin_jwt_token>
```

---

## 🚨 **Error Handling**

### **Standard Error Response Format**
```json
{
  "success": false,
  "error": "Error message description",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error details"
  }
}
```

### **Common Error Codes**
| Code | Description | HTTP Status |
|------|-------------|-------------|
| `VALIDATION_ERROR` | Input validation failed | 400 |
| `UNAUTHORIZED` | Authentication required | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `CONFLICT` | Resource conflict | 409 |
| `RATE_LIMITED` | Too many requests | 429 |
| `INTERNAL_ERROR` | Server error | 500 |

### **Validation Error Example**
```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "email": "Invalid email format",
    "password": "Password must be at least 12 characters"
  }
}
```

---

## 📋 **Rate Limiting**

### **Rate Limits by Endpoint**
| Endpoint Category | Limit | Window |
|-------------------|-------|---------|
| Authentication | 5 requests | 15 minutes |
| General API | 100 requests | 15 minutes |
| File Uploads | 10 requests | 1 hour |
| Admin Operations | 50 requests | 15 minutes |

### **Rate Limit Response Headers**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## 🔒 **Security Features**

### **CORS Configuration**
- **Allowed Origins**: Configured per environment
- **Methods**: GET, POST, PUT, DELETE, PATCH, OPTIONS
- **Headers**: Content-Type, Authorization
- **Credentials**: Supported

### **Security Headers**
```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

## 📚 **Additional Resources**

- **[Authentication Guide](AUTHENTICATION.md)** - Detailed auth documentation
- **[User Management](USERS.md)** - User operations guide
- **[Pharmacy Operations](PHARMACY.md)** - Prescription and medical features
- **[E-commerce Guide](ECOMMERCE.md)** - Shopping and payment features
- **[Content Management](CONTENT.md)** - WordPress integration

---

## 🆘 **Need Help?**

- **API Issues**: Check error codes and validation rules
- **Authentication**: Verify JWT token format and expiration
- **Rate Limiting**: Check request frequency and limits
- **Documentation**: Browse related API guides
- **Support**: Create GitHub issue for bugs

---

**📡 API Version**: v1.0  
**🔧 Last Updated**: December 2024  
**👥 Maintained By**: MyMeds Development Team

