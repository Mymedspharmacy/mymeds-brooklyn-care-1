# WooCommerce Payment Gateway Setup Guide

## Overview
This guide will help you configure WooCommerce payment gateways for full payment processing integration.

## Available Payment Gateways

### 1. Direct Bank Transfer (BACS)
- **Status**: ✅ Enabled by default
- **Description**: Manual payment via bank transfer
- **Customer Experience**: Customer receives payment instructions via email
- **Admin Action**: Manually mark orders as "paid" after receiving payment

### 2. Stripe (Credit Cards)
- **Status**: ⚠️ Requires setup
- **Description**: Real-time credit card processing
- **Setup Required**: Stripe account and API keys

### 3. PayPal
- **Status**: ⚠️ Requires setup  
- **Description**: PayPal payment processing
- **Setup Required**: PayPal business account

## Setup Instructions

### Step 1: Access WooCommerce Settings
1. Log into your WordPress admin panel
2. Navigate to **WooCommerce > Settings > Payments**
3. Enable desired payment gateways

### Step 2: Configure Stripe (Recommended)
1. Create a Stripe account at https://stripe.com
2. Get your API keys from Stripe Dashboard
3. In WooCommerce, enable Stripe payment gateway
4. Enter your Stripe API keys:
   - **Publishable Key**: pk_test_...
   - **Secret Key**: sk_test_...
5. Test with Stripe test cards

### Step 3: Configure PayPal
1. Create a PayPal business account
2. In WooCommerce, enable PayPal payment gateway
3. Enter your PayPal credentials
4. Configure PayPal settings

### Step 4: Test Payment Processing
1. Create a test order in your shop
2. Try different payment methods
3. Verify payments are processed correctly
4. Check order status updates

## Environment Variables (Optional)
If you want to override payment settings via environment variables:

```bash
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# PayPal Configuration  
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
```

## Payment Flow

### Bank Transfer Flow:
1. Customer places order
2. Order created with "pending" status
3. Customer receives payment instructions via email
4. Customer makes bank transfer
5. Admin manually marks order as "paid"

### Stripe/PayPal Flow:
1. Customer places order
2. Payment processed in real-time
3. Order automatically marked as "processing" or "completed"
4. Customer receives confirmation

## Troubleshooting

### Payment Gateway Not Appearing
- Check if gateway is enabled in WooCommerce settings
- Verify API keys are correct
- Check WooCommerce logs for errors

### Orders Not Updating Status
- Verify payment gateway webhooks are configured
- Check if `set_paid` parameter is working
- Review WooCommerce order status flow

### API Connection Issues
- Verify WooCommerce REST API is enabled
- Check consumer key/secret permissions
- Test API connection via WooCommerce > Settings > Advanced > REST API

## Security Notes
- Always use HTTPS in production
- Keep API keys secure and never commit to version control
- Use test keys during development
- Enable fraud protection in Stripe/PayPal

## Support
For additional help:
- WooCommerce Documentation: https://woocommerce.com/document/
- Stripe Documentation: https://stripe.com/docs
- PayPal Documentation: https://developer.paypal.com/
