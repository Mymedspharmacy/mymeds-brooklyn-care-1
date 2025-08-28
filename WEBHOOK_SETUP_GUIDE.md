# 🔗 Webhook Setup Guide for WooCommerce & WordPress Integration

This guide explains how to set up webhooks for real-time synchronization between your WooCommerce store, WordPress site, and your pharmacy application.

## 📋 Prerequisites

- WooCommerce store with REST API access
- WordPress site with REST API enabled
- Admin access to both platforms
- Your pharmacy app running and accessible via HTTPS

## 🛒 WooCommerce Webhook Setup

### 1. Access WooCommerce Webhooks

1. **Login to WordPress Admin** → **WooCommerce** → **Settings** → **Advanced** → **Webhooks**
2. **Click "Add webhook"**

### 2. Configure Webhook Settings

#### **Product Created/Updated Webhook**
- **Name**: `Product Sync - Created/Updated`
- **Status**: Active
- **Topic**: `Product created` and `Product updated`
- **Delivery URL**: `https://your-domain.com/api/woocommerce/webhook`
- **Version**: v3
- **Secret**: Generate a secure random string (32+ characters)

#### **Product Deleted Webhook**
- **Name**: `Product Sync - Deleted`
- **Status**: Active
- **Topic**: `Product deleted`
- **Delivery URL**: `https://your-domain.com/api/woocommerce/webhook`
- **Version**: v3
- **Secret**: Same secret as above

#### **Order Webhooks (Optional)**
- **Name**: `Order Sync`
- **Status**: Active
- **Topic**: `Order created` and `Order updated`
- **Delivery URL**: `https://your-domain.com/api/woocommerce/webhook`
- **Version**: v3
- **Secret**: Same secret as above

### 3. Update Your App Configuration

In your pharmacy app admin panel:
1. Go to **Integrations** → **WooCommerce**
2. Set **Webhook Secret** to match the secret you generated
3. **Save Settings**

## 📝 WordPress Webhook Setup

### 1. Install WP Webhooks Plugin

1. **Login to WordPress Admin** → **Plugins** → **Add New**
2. **Search for**: "WP Webhooks"
3. **Install and Activate** the plugin

### 2. Configure Webhook Triggers

#### **Post Created/Updated Webhook**
1. Go to **WP Webhooks** → **Triggers**
2. **Add New Trigger**:
   - **Name**: `Post Sync - Created/Updated`
   - **Trigger**: `Post created` and `Post updated`
   - **Webhook URL**: `https://your-domain.com/api/wordpress/webhook`
   - **Secret**: Generate a secure random string (32+ characters)

#### **Post Deleted Webhook**
1. **Add New Trigger**:
   - **Name**: `Post Sync - Deleted`
   - **Trigger**: `Post deleted`
   - **Webhook URL**: `https://your-domain.com/api/wordpress/webhook`
   - **Secret**: Same secret as above

### 3. Update Your App Configuration

In your pharmacy app admin panel:
1. Go to **Integrations** → **WordPress**
2. Set **Webhook Secret** to match the secret you generated
3. **Save Settings**

## 🔐 Security Considerations

### Webhook Secret Management
- **Use strong, unique secrets** (32+ characters)
- **Never commit secrets to version control**
- **Rotate secrets periodically**
- **Store secrets securely** in environment variables

### HTTPS Requirements
- **Webhooks require HTTPS** for security
- **Use valid SSL certificates**
- **Test webhook delivery** in staging environment first

### Rate Limiting
- **Implement rate limiting** on webhook endpoints
- **Monitor webhook delivery** for abuse
- **Set reasonable timeouts** (5-10 seconds)

## 🧪 Testing Webhooks

### 1. Test WooCommerce Webhooks
1. **Create a test product** in WooCommerce
2. **Check your app logs** for webhook receipt
3. **Verify product sync** in your database
4. **Update the test product** and verify sync
5. **Delete the test product** and verify removal

### 2. Test WordPress Webhooks
1. **Create a test post** in WordPress
2. **Check your app logs** for webhook receipt
3. **Verify post sync** in your database
4. **Update the test post** and verify sync
5. **Delete the test post** and verify removal

### 3. Monitor Webhook Delivery
```bash
# Check your app logs for webhook activity
tail -f /var/log/your-app/webhooks.log

# Monitor webhook delivery in WooCommerce
WooCommerce → Settings → Advanced → Webhooks → View Logs

# Monitor webhook delivery in WordPress
WP Webhooks → Logs
```

## 🚨 Troubleshooting

### Common Issues

#### **Webhook Not Delivering**
- **Check webhook URL** is correct and accessible
- **Verify HTTPS** is working properly
- **Check firewall settings** allow incoming webhooks
- **Verify webhook secret** matches in both systems

#### **Authentication Errors**
- **Check webhook secret** is correct
- **Verify API credentials** are valid
- **Check user permissions** for webhook access

#### **Timeout Errors**
- **Increase webhook timeout** in WordPress/WooCommerce
- **Optimize webhook processing** in your app
- **Check server performance** and resources

#### **Duplicate Data**
- **Implement idempotency** in webhook handlers
- **Check for duplicate webhook registrations**
- **Verify webhook deduplication** logic

### Debug Commands

```bash
# Test webhook endpoint manually
curl -X POST https://your-domain.com/api/woocommerce/webhook \
  -H "Content-Type: application/json" \
  -H "x-wc-webhook-signature: your-secret" \
  -d '{"action":"product.created","data":{"id":123}}'

# Check webhook status
curl https://your-domain.com/api/woocommerce/sync-status

# Clear webhook cache
curl -X POST https://your-domain.com/api/woocommerce/clear-cache
```

## 📊 Monitoring & Analytics

### Webhook Metrics to Track
- **Delivery success rate**
- **Response times**
- **Error rates by type**
- **Data sync accuracy**
- **Cache hit rates**

### Recommended Monitoring Tools
- **Application logs** with structured logging
- **Database monitoring** for sync status
- **API response time** monitoring
- **Error tracking** (Sentry, LogRocket)
- **Performance monitoring** (New Relic, DataDog)

## 🔄 Best Practices

### 1. **Idempotency**
- Implement idempotent webhook handlers
- Use unique identifiers to prevent duplicates
- Handle retries gracefully

### 2. **Error Handling**
- Log all webhook errors with context
- Implement exponential backoff for retries
- Send notifications for critical failures

### 3. **Performance**
- Process webhooks asynchronously when possible
- Use efficient database operations
- Implement proper indexing for sync queries

### 4. **Security**
- Validate webhook signatures
- Sanitize all incoming data
- Implement rate limiting
- Use HTTPS for all webhook communication

### 5. **Monitoring**
- Track webhook delivery success rates
- Monitor sync performance
- Alert on critical failures
- Maintain audit logs

## 📚 Additional Resources

- [WooCommerce Webhooks Documentation](https://woocommerce.com/document/webhooks/)
- [WordPress REST API Handbook](https://developer.wordpress.org/rest-api/)
- [Webhook Security Best Practices](https://webhooks.fyi/)
- [API Rate Limiting Strategies](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)

## 🆘 Support

If you encounter issues with webhook setup:

1. **Check the troubleshooting section** above
2. **Review your app logs** for error details
3. **Verify webhook configuration** in both platforms
4. **Test webhook endpoints** manually
5. **Contact your development team** with specific error messages

---

**Note**: This guide assumes your pharmacy application is running and accessible via HTTPS. Adjust URLs and endpoints according to your actual deployment configuration.

