# 🚀 Guest Checkout System - Production Deployment Guide

## 📋 Overview

This guide covers the production deployment of the **Guest Checkout System** for MyMeds Pharmacy, enabling customers to shop and complete purchases without creating accounts.

## ✨ Features Implemented

### **🛒 Shopping Cart System**
- **Session-based carts** for guest users (24-hour expiration)
- **User-specific carts** for registered customers (30-day expiration)
- **Real-time stock validation** before adding items
- **Cart persistence** across browser sessions
- **Cart summary** for header display

### **💳 Guest Checkout Process**
- **Complete purchase flow** without account creation
- **Shipping address collection** with validation
- **Multiple shipping methods** (standard, express, overnight)
- **Tax calculation** based on state
- **Order number generation** for tracking
- **Payment method selection** (Stripe, PayPal ready)

### **📦 Order Management**
- **Guest order tracking** by email/phone or order number
- **Admin order management** with status updates
- **Shipping tracking** integration ready
- **Stock management** with automatic updates
- **Order notifications** for staff

### **🔒 Security Features**
- **Input validation** with Zod schemas
- **Rate limiting** on all endpoints
- **SQL injection protection** via Prisma
- **XSS protection** with helmet middleware
- **CSRF protection** built-in

## 🏗️ System Architecture

### **Database Schema Updates**
```sql
-- New tables added
Cart (id, userId?, expiresAt, createdAt, updatedAt)
CartItem (id, cartId, productId, quantity, price, createdAt)
GuestOrderTracking (id, orderId, trackingNumber, estimatedDelivery, deliveredAt)

-- Updated tables
Order (added guest fields, orderNumber, paymentStatus, shipping fields)
```

### **API Endpoints**
```
POST   /api/cart/add              - Add item to cart
GET    /api/cart                  - Get/create cart
PUT    /api/cart/update/:id       - Update cart item
DELETE /api/cart/remove/:id       - Remove cart item
DELETE /api/cart/clear/:id        - Clear cart
GET    /api/cart/summary/:id      - Get cart summary

POST   /api/orders/guest-checkout - Guest checkout
GET    /api/orders/guest-track    - Track guest order
PUT    /api/orders/:id/status     - Update order status (admin)
```

## 🚀 Production Deployment Steps

### **Step 1: Database Migration**
```bash
# Navigate to backend directory
cd backend

# Generate Prisma client
npx prisma generate

# Run database migration
npx prisma migrate deploy

# Verify database connection
npx prisma db push --preview-feature
```

### **Step 2: Environment Configuration**
```bash
# Required environment variables
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=your-super-secure-jwt-secret
ADMIN_EMAIL=admin@mymedspharmacy.com
ADMIN_PASSWORD=secure-admin-password

# Optional but recommended
EMAIL_USER=smtp-email@domain.com
EMAIL_PASS=smtp-password
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
```

### **Step 3: Build and Deploy**
```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Start production server
npm start

# Or use PM2 for process management
pm2 start ecosystem.config.js
```

### **Step 4: Health Checks**
```bash
# Test health endpoint
curl https://your-domain.com/api/health

# Test cart creation
curl https://your-domain.com/api/cart

# Test guest checkout (with valid data)
curl -X POST https://your-domain.com/api/orders/guest-checkout \
  -H "Content-Type: application/json" \
  -d '{"cartId":"test","guestEmail":"test@example.com",...}'
```

## 🔧 Configuration Options

### **Cart Expiration Settings**
```typescript
// Guest carts: 24 hours
expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)

// User carts: 30 days  
expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
```

### **Shipping Cost Configuration**
```typescript
function calculateShippingCost(method: string, subtotal: number): number {
  switch (method) {
    case 'standard':
      return subtotal >= 50 ? 0 : 5.99; // Free shipping over $50
    case 'express':
      return 12.99;
    case 'overnight':
      return 24.99;
    default:
      return 5.99;
  }
}
```

### **Tax Rate Configuration**
```typescript
const taxRates: { [key: string]: number } = {
  'NY': 0.0875, // New York
  'CA': 0.0825, // California
  'TX': 0.0625, // Texas
  'FL': 0.0600, // Florida
  'WA': 0.0650, // Washington
};
```

## 🧪 Testing

### **Run Comprehensive Tests**
```bash
# Test guest checkout functionality
node test-guest-checkout.cjs

# Test all APIs
node test-apis.cjs
```

### **Test Scenarios**
1. **Cart Management**: Create, add items, update quantities, clear
2. **Guest Checkout**: Complete purchase without account
3. **Order Tracking**: Track orders by email/phone
4. **Admin Management**: View and update orders
5. **Error Handling**: Invalid inputs, expired carts, stock issues

## 📊 Monitoring and Maintenance

### **Key Metrics to Monitor**
- **Cart creation rate** (guest vs. user)
- **Checkout completion rate**
- **Average order value**
- **Cart abandonment rate**
- **Order processing time**

### **Log Analysis**
```bash
# Monitor cart operations
grep "cart" /var/log/application.log

# Monitor guest checkouts
grep "guest-checkout" /var/log/application.log

# Monitor errors
grep "ERROR" /var/log/application.log
```

### **Database Maintenance**
```sql
-- Clean up expired carts (run daily)
DELETE FROM "Cart" WHERE "expiresAt" < NOW();

-- Clean up expired cart items
DELETE FROM "CartItem" WHERE "cartId" NOT IN (SELECT id FROM "Cart");

-- Analyze order performance
SELECT status, COUNT(*), AVG(total) FROM "Order" GROUP BY status;
```

## 🚨 Troubleshooting

### **Common Issues**

#### **Cart Not Creating**
```bash
# Check database connection
npx prisma db push --preview-feature

# Verify Prisma client
npx prisma generate
```

#### **Guest Checkout Failing**
```bash
# Check cart exists
curl https://your-domain.com/api/cart?cartId=CART_ID

# Verify product stock
SELECT * FROM "Product" WHERE id = PRODUCT_ID;
```

#### **Order Tracking Issues**
```bash
# Check order exists
SELECT * FROM "Order" WHERE "orderNumber" = 'ORDER_NUMBER';

# Verify guest information
SELECT * FROM "Order" WHERE "guestEmail" = 'email@example.com';
```

### **Performance Issues**
```bash
# Check database indexes
npx prisma db push --preview-feature

# Monitor query performance
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;
```

## 🔐 Security Considerations

### **Input Validation**
- All inputs validated with Zod schemas
- SQL injection protection via Prisma ORM
- XSS protection with helmet middleware

### **Rate Limiting**
```typescript
// General API: 5000 requests/15min
// Auth endpoints: 20 requests/15min
// Contact forms: 10 requests/15min
```

### **Data Protection**
- Guest data encrypted in transit
- Order numbers are unique and non-sequential
- Payment information not stored (PCI compliant)

## 📈 Scaling Considerations

### **Database Optimization**
```sql
-- Add indexes for performance
CREATE INDEX idx_cart_expires ON "Cart"("expiresAt");
CREATE INDEX idx_order_guest_email ON "Order"("guestEmail");
CREATE INDEX idx_order_number ON "Order"("orderNumber");
```

### **Caching Strategy**
```typescript
// Consider Redis for cart caching
// Cache product information
// Cache shipping/tax calculations
```

### **Load Balancing**
- Use multiple application instances
- Database connection pooling
- CDN for static assets

## 🎯 Production Checklist

### **Pre-Deployment**
- [ ] Database migration completed
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Rate limiting configured
- [ ] Logging configured

### **Post-Deployment**
- [ ] Health checks passing
- [ ] Cart creation working
- [ ] Guest checkout functional
- [ ] Order tracking working
- [ ] Admin panel accessible
- [ ] Error monitoring active

### **Performance Validation**
- [ ] Cart operations < 200ms
- [ ] Checkout process < 2s
- [ ] Order tracking < 500ms
- [ ] Database queries optimized

## 📞 Support and Maintenance

### **Regular Maintenance Tasks**
- **Daily**: Monitor error logs, check cart cleanup
- **Weekly**: Review performance metrics, analyze cart abandonment
- **Monthly**: Update tax rates, review shipping costs
- **Quarterly**: Security audit, performance optimization

### **Emergency Procedures**
1. **System Down**: Check database connection, restart application
2. **Checkout Failing**: Verify cart system, check product stock
3. **Orders Not Processing**: Check payment integration, verify webhooks
4. **Performance Issues**: Analyze database queries, check resource usage

## 🎉 Success Metrics

### **Business Impact**
- **Increased conversion rate** (no account barrier)
- **Higher average order value** (better user experience)
- **Reduced cart abandonment** (streamlined checkout)
- **Improved customer satisfaction** (faster purchase process)

### **Technical Metrics**
- **99.9% uptime** for checkout system
- **< 2 second** checkout completion time
- **< 1% error rate** on guest checkout
- **100% order accuracy** and tracking

---

**🚀 Your guest checkout system is now production-ready!**

This implementation provides a seamless shopping experience for customers while maintaining security and performance standards required for production deployment.
