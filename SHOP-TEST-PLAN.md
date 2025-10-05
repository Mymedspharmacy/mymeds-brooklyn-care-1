# 🛒 MyMeds Pharmacy Shop Functionality Test Plan

## Overview
This document provides a comprehensive test plan for the MyMeds Pharmacy shop functionality, including WooCommerce integration, cart management, and checkout process.

## 🎯 Test Objectives
- Verify WooCommerce integration is working correctly
- Test product catalog display and filtering
- Validate shopping cart functionality
- Test checkout process and order creation
- Ensure payment gateway integration
- Verify responsive design and user experience

## 🏗️ Architecture Overview

### Frontend (React + Vite)
- **Shop Page**: `src/pages/Shop.tsx`
- **Cart Service**: `src/lib/woocommerceCart.ts`
- **WooCommerce API**: `src/lib/woocommerce.ts`
- **Checkout Form**: `src/components/WooCommerceCheckoutForm.tsx`

### Backend (Node.js + Express)
- **WooCommerce Routes**: `backend/src/routes/woocommerce.ts`
- **Cart Routes**: `backend/src/routes/woocommerceCart.ts`
- **Cart Service**: `backend/src/services/woocommerceCartService.ts`

## 🚀 Setup Instructions

### 1. Environment Configuration
Create a `.env` file in the backend directory with the following variables:

```env
# WooCommerce Configuration
WOOCOMMERCE_STORE_URL="https://your-store.com"
WOOCOMMERCE_CONSUMER_KEY="ck_your_consumer_key_here"
WOOCOMMERCE_CONSUMER_SECRET="cs_your_consumer_secret_here"

# Server Configuration
PORT=4000
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/mymeds_pharmacy"

# CORS Configuration
CORS_ORIGINS="http://localhost:3000,http://localhost:5173"

# Rate Limiting (disable for development)
DISABLE_RATE_LIMIT=true
```

### 2. Start Development Servers

#### Backend Server
```bash
cd backend
npm install
npm run dev
```
Server will run on `http://localhost:4000`

#### Frontend Server
```bash
npm install
npm run dev
```
Server will run on `http://localhost:3000`

## 🧪 Test Cases

### 1. Server Status Tests
- [ ] Backend server is running on port 4000
- [ ] Frontend server is running on port 3000
- [ ] API health check returns 200 status
- [ ] CORS headers are properly configured

### 2. WooCommerce API Integration Tests
- [ ] WooCommerce status endpoint returns correct status
- [ ] Products endpoint returns product list
- [ ] Categories endpoint returns category list
- [ ] Payment gateways endpoint returns available methods
- [ ] Product details endpoint returns complete product info

### 3. Product Catalog Tests
- [ ] Products are displayed in grid layout
- [ ] Product images load correctly
- [ ] Product prices are formatted correctly
- [ ] Stock status is displayed
- [ ] Product categories are shown
- [ ] Search functionality works
- [ ] Category filtering works
- [ ] Pagination works (if implemented)

### 4. Shopping Cart Tests
- [ ] Add product to cart
- [ ] Update product quantity
- [ ] Remove product from cart
- [ ] Cart total calculation
- [ ] Cart persistence across page reloads
- [ ] Cart session management
- [ ] Multiple products in cart
- [ ] Cart validation (stock availability)

### 5. Checkout Process Tests
- [ ] Customer information form validation
- [ ] Shipping address form
- [ ] Payment method selection
- [ ] Order summary display
- [ ] Order creation in WooCommerce
- [ ] Order confirmation
- [ ] Payment processing (if applicable)
- [ ] Email notifications (if implemented)

### 6. User Experience Tests
- [ ] Responsive design on mobile devices
- [ ] Loading states and error handling
- [ ] Form validation messages
- [ ] Success/error notifications
- [ ] Navigation between pages
- [ ] Accessibility compliance

## 🔧 Manual Testing Steps

### Step 1: Access Shop Page
1. Open browser and navigate to `http://localhost:3000/shop`
2. Verify page loads without errors
3. Check if products are displayed
4. Test search functionality
5. Test category filtering

### Step 2: Test Cart Functionality
1. Click "Add to Cart" on a product
2. Verify cart counter updates
3. Click on cart icon/button to view cart
4. Test quantity updates
5. Test item removal
6. Verify total calculation

### Step 3: Test Checkout Process
1. Click "Checkout" button
2. Fill out customer information form
3. Fill out shipping address
4. Select payment method
5. Review order summary
6. Submit order
7. Verify order confirmation

### Step 4: Test Error Scenarios
1. Try to add out-of-stock product
2. Submit form with invalid data
3. Test network error handling
4. Test with empty cart

## 🐛 Common Issues and Solutions

### Issue 1: WooCommerce API Connection Failed
**Symptoms**: Products not loading, API errors
**Solutions**:
- Check WooCommerce credentials in environment variables
- Verify store URL is accessible
- Check API key permissions
- Test API connection manually

### Issue 2: Cart Not Persisting
**Symptoms**: Cart items disappear on page reload
**Solutions**:
- Check cart session management
- Verify database connection
- Check cart service implementation
- Test session storage

### Issue 3: Checkout Form Validation Errors
**Symptoms**: Form submission fails, validation errors
**Solutions**:
- Check form validation rules
- Verify required field validation
- Test email format validation
- Check address validation

### Issue 4: Payment Gateway Issues
**Symptoms**: Payment processing fails
**Solutions**:
- Check payment gateway configuration
- Verify API credentials
- Test with different payment methods
- Check error logs

## 📊 Performance Testing

### Load Testing
- Test with multiple concurrent users
- Monitor API response times
- Check database query performance
- Test cart session handling under load

### Memory Usage
- Monitor memory usage during cart operations
- Check for memory leaks in cart service
- Test with large product catalogs
- Monitor cache performance

## 🔍 Debugging Tools

### Browser Developer Tools
- Network tab for API calls
- Console for JavaScript errors
- Application tab for local storage
- Performance tab for load times

### Backend Logging
- Check server logs for errors
- Monitor API request/response times
- Check database query logs
- Monitor cart session logs

### API Testing Tools
- Postman for API testing
- curl commands for quick tests
- Browser network inspector
- Custom test scripts

## 📝 Test Results Documentation

### Test Execution Log
```
Date: [DATE]
Tester: [NAME]
Environment: [DEVELOPMENT/PRODUCTION]
Browser: [BROWSER VERSION]
OS: [OPERATING SYSTEM]

Test Results:
✅ Passed: [NUMBER]
❌ Failed: [NUMBER]
⚠️  Skipped: [NUMBER]

Failed Tests:
- [LIST OF FAILED TESTS WITH DETAILS]

Recommendations:
- [LIST OF RECOMMENDATIONS]
```

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] All tests pass
- [ ] WooCommerce credentials configured
- [ ] Database migrations applied
- [ ] Environment variables set
- [ ] SSL certificates configured
- [ ] Payment gateways tested
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Performance optimized
- [ ] Security measures in place

## 📞 Support and Maintenance

### Regular Maintenance Tasks
- Monitor API performance
- Check cart session cleanup
- Update WooCommerce integration
- Monitor error logs
- Test payment gateways
- Update product catalog
- Check security updates

### Troubleshooting Resources
- WooCommerce API documentation
- React documentation
- Express.js documentation
- Database documentation
- Payment gateway documentation

---

## 🎉 Conclusion

This test plan ensures comprehensive coverage of the MyMeds Pharmacy shop functionality. Regular testing and monitoring will help maintain a high-quality user experience and reliable e-commerce functionality.

For questions or issues, please refer to the development team or create an issue in the project repository.

