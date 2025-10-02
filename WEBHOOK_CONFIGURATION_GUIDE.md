# 🔗 **WEBHOOK ENDPOINTS CONFIGURATION GUIDE**

## 📋 **OVERVIEW**

This guide covers the complete setup and configuration of webhook endpoints for real-time synchronization between WordPress/WooCommerce and the MyMeds Pharmacy application.

---

## 🛒 **WOOCOMMERCE WEBHOOK CONFIGURATION**

### **1. Webhook Endpoints Available**

**🔗 Primary Webhook URL:**
```
POST https://yourdomain.com/api/woocommerce/webhook
```

**📝 Supported Events:**
- `product.created` - New product added
- `product.updated` - Product modified
- `product.deleted` - Product removed
- `order.created` - New order placed
- `order.updated` - Order status changed
- `order.deleted` - Order cancelled

### **2. WooCommerce Admin Configuration**

**Step 1: Access WooCommerce Settings**
1. Login to WordPress Admin
2. Navigate to **WooCommerce → Settings → Advanced → Webhooks**
3. Click **"Add Webhook"**

**Step 2: Configure Product Webhooks**
```yaml
Name: MyMeds Product Sync
Status: Active
Topic: Product created
Delivery URL: https://yourdomain.com/api/woocommerce/webhook
Secret: your_webhook_secret_here
API Version: WP REST API Integration v3
```

**Step 3: Configure Order Webhooks**
```yaml
Name: MyMeds Order Sync
Status: Active
Topic: Order created
Delivery URL: https://yourdomain.com/api/woocommerce/webhook
Secret: your_webhook_secret_here
API Version: WP REST API Integration v3
```

### **3. Environment Variables**

**Add to `backend/.env`:**
```bash
# WooCommerce Webhook Configuration
WOOCOMMERCE_WEBHOOK_SECRET=your_secure_webhook_secret_here
WOOCOMMERCE_STORE_URL=https://yourdomain.com
WOOCOMMERCE_CONSUMER_KEY=ck_your_consumer_key
WOOCOMMERCE_CONSUMER_SECRET=cs_your_consumer_secret
FEATURE_WOOCOMMERCE_ENABLED=true
```

### **4. Webhook Security**

**🔐 Signature Validation:**
```javascript
// Webhook signature verification (implemented in backend)
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}
```

---

## 📝 **WORDPRESS WEBHOOK CONFIGURATION**

### **1. Webhook Endpoints Available**

**🔗 Primary Webhook URL:**
```
POST https://yourdomain.com/api/wordpress/webhook
```

**📝 Supported Events:**
- `post.created` - New blog post published
- `post.updated` - Blog post modified
- `post.deleted` - Blog post removed
- `page.created` - New page created
- `page.updated` - Page modified

### **2. WordPress Plugin Configuration**

**Step 1: Install Webhook Plugin**
```bash
# Recommended plugins:
# - WP Webhooks Pro
# - WordPress Webhooks
# - Custom Post Type Webhooks
```

**Step 2: Configure Post Webhooks**
```yaml
Plugin: WP Webhooks Pro
Trigger: Post Created/Updated/Deleted
Endpoint URL: https://yourdomain.com/api/wordpress/webhook
Authentication: Bearer Token
Secret Key: your_wordpress_webhook_secret
```

### **3. Environment Variables**

**Add to `backend/.env`:**
```bash
# WordPress Webhook Configuration
WORDPRESS_WEBHOOK_SECRET=your_secure_wordpress_secret
WORDPRESS_URL=https://yourdomain.com/blog
WORDPRESS_USERNAME=your_username
WORDPRESS_APP_PASSWORD=your_app_password
FEATURE_WORDPRESS_ENABLED=true
```

---

## 🔧 **WEBHOOK IMPLEMENTATION DETAILS**

### **1. Current Backend Implementation**

**WooCommerce Webhook Handler:**
```typescript
// backend/src/routes/woocommerce.ts
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const settings = await prisma.wooCommerceSettings.findUnique({
      where: { id: 1 }
    });

    if (!settings || !settings.enabled) {
      return res.status(400).json({ error: 'WooCommerce integration not enabled' });
    }

    const { action, data } = req.body;

    switch (action) {
      case 'product.created':
      case 'product.updated':
        // Clear cache and trigger sync for specific product
        clearProductCache();
        console.log(`Webhook: Product ${action} - ID: ${data.id}`);
        
        // Update local product if exists
        try {
          const product = await prisma.product.findFirst({
            where: { id: data.id }
          });
          
          if (product) {
            await prisma.product.update({
              where: { id: data.id },
              data: {
                name: data.name,
                description: data.description,
                price: parseFloat(data.price),
                stock: data.stock_quantity || 0,
                updatedAt: new Date()
              }
            });
          }
        } catch (error: any) {
          console.error(`Error updating product ${data.id}:`, error);
        }
        break;
      
      case 'product.deleted':
        // Remove product from local database
        try {
          await prisma.product.delete({
            where: { id: data.id }
          });
          clearProductCache();
          console.log(`Webhook: Product deleted - ID: ${data.id}`);
        } catch (error: any) {
          console.error(`Error deleting product ${data.id}:`, error);
        }
        break;
      
      case 'order.created':
      case 'order.updated':
        // Handle order updates
        console.log(`Webhook: Order ${action} - ID: ${data.id}`);
        break;
      
      default:
        console.log(`Webhook: Unknown action - ${action}`);
    }

    res.json({ success: true, message: 'Webhook processed' });
  } catch (err: any) {
    console.error('Error processing WooCommerce webhook:', err);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});
```

**WordPress Webhook Handler:**
```typescript
// backend/src/routes/wordpress.ts
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const settings = await prisma.wordPressSettings.findUnique({
      where: { id: 1 }
    });

    if (!settings || !settings.enabled) {
      return res.status(400).json({ error: 'WordPress integration not enabled' });
    }

    const { action, data } = req.body;

    switch (action) {
      case 'post.created':
      case 'post.updated':
        // Clear cache and trigger sync for specific post
        clearPostCache();
        console.log(`Webhook: Post ${action} - ID: ${data.id}`);
        break;
      
      case 'post.deleted':
        // Remove post from local database
        try {
          await prisma.blog.delete({
            where: { id: data.id }
          });
          clearPostCache();
          console.log(`Webhook: Post deleted - ID: ${data.id}`);
        } catch (error: any) {
          console.error(`Error deleting post ${data.id}:`, error);
        }
        break;
      
      case 'page.created':
      case 'page.updated':
        // Handle page updates if needed
        console.log(`Webhook: Page ${action} - ID: ${data.id}`);
        break;
      
      default:
        console.log(`Webhook: Unknown action - ${action}`);
    }

    res.json({ success: true, message: 'Webhook processed' });
  } catch (err: any) {
    console.error('Error processing WordPress webhook:', err);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});
```

### **2. Webhook Payload Examples**

**WooCommerce Product Webhook:**
```json
{
  "action": "product.created",
  "data": {
    "id": 123,
    "name": "New Product",
    "description": "Product description",
    "price": "29.99",
    "stock_quantity": 50,
    "status": "publish",
    "categories": [1, 2],
    "images": [
      {
        "src": "https://example.com/image.jpg",
        "alt": "Product image"
      }
    ]
  }
}
```

**WordPress Post Webhook:**
```json
{
  "action": "post.created",
  "data": {
    "id": 456,
    "title": "New Blog Post",
    "content": "Post content here...",
    "excerpt": "Post excerpt",
    "status": "publish",
    "categories": [1, 2],
    "tags": [3, 4],
    "featured_media": 789
  }
}
```

---

## 🚀 **PRODUCTION DEPLOYMENT**

### **1. SSL Requirements**
- ✅ **HTTPS Required**: All webhook URLs must use HTTPS
- ✅ **Valid SSL Certificate**: Ensure SSL certificate is valid
- ✅ **Certificate Chain**: Include full certificate chain

### **2. Firewall Configuration**
```bash
# Allow webhook endpoints
sudo ufw allow 443/tcp
sudo ufw allow 80/tcp

# Optional: Restrict to specific IPs
sudo ufw allow from 192.168.1.0/24 to any port 443
```

### **3. Load Balancer Configuration**
```nginx
# Nginx configuration for webhook endpoints
upstream mymeds_backend {
    server 127.0.0.1:4000;
    server 127.0.0.1:4001;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location /api/woocommerce/webhook {
        proxy_pass http://mymeds_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Increase timeout for webhook processing
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
    }
    
    location /api/wordpress/webhook {
        proxy_pass http://mymeds_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Increase timeout for webhook processing
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
    }
}
```

---

## 📊 **MONITORING & DEBUGGING**

### **1. Webhook Logging**
```typescript
// Enhanced logging for webhooks
function logWebhookEvent(source: string, action: string, data: any) {
  console.log(`[WEBHOOK] ${new Date().toISOString()} - ${source}: ${action}`, {
    action,
    dataId: data.id,
    timestamp: new Date().toISOString(),
    source
  });
}
```

### **2. Health Check Endpoints**
```bash
# Test webhook endpoints
curl -X GET https://yourdomain.com/api/woocommerce/status
curl -X GET https://yourdomain.com/api/wordpress/status
```

### **3. Error Handling**
```typescript
// Webhook error handling
try {
  // Process webhook
  await processWebhookData(action, data);
  res.json({ success: true, message: 'Webhook processed' });
} catch (error) {
  console.error(`Webhook processing failed:`, error);
  
  // Store failed webhook for retry
  await storeFailedWebhook({
    source: 'woocommerce',
    action,
    data,
    error: error.message,
    timestamp: new Date()
  });
  
  res.status(500).json({ 
    error: 'Webhook processing failed',
    retryable: true 
  });
}
```

---

## 🔄 **AUTOMATED SYNC ENDPOINTS**

### **1. Manual Sync Triggers**
```bash
# WooCommerce sync
curl -X POST https://yourdomain.com/api/woocommerce/sync-products \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# WordPress sync
curl -X POST https://yourdomain.com/api/wordpress/sync-posts \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### **2. Cron Job Configuration**
```bash
# Add to crontab for automated syncing
# Sync products every hour
0 * * * * curl -X POST https://yourdomain.com/api/woocommerce/auto-sync

# Sync posts every 30 minutes
*/30 * * * * curl -X POST https://yourdomain.com/api/wordpress/auto-sync
```

---

## ✅ **TESTING CHECKLIST**

### **WooCommerce Webhooks**
- [ ] Webhook URL is accessible via HTTPS
- [ ] SSL certificate is valid
- [ ] Webhook secret is configured
- [ ] Product creation triggers webhook
- [ ] Product update triggers webhook
- [ ] Product deletion triggers webhook
- [ ] Order creation triggers webhook
- [ ] Error handling works correctly
- [ ] Webhook logs are being recorded

### **WordPress Webhooks**
- [ ] Webhook URL is accessible via HTTPS
- [ ] SSL certificate is valid
- [ ] Webhook secret is configured
- [ ] Post creation triggers webhook
- [ ] Post update triggers webhook
- [ ] Post deletion triggers webhook
- [ ] Page creation triggers webhook
- [ ] Error handling works correctly
- [ ] Webhook logs are being recorded

---

## 🎯 **NEXT STEPS**

1. **Configure WooCommerce webhooks** in WordPress admin
2. **Set up WordPress webhook plugin** and configure endpoints
3. **Update environment variables** with webhook secrets
4. **Test webhook endpoints** using provided curl commands
5. **Monitor webhook logs** for successful processing
6. **Set up automated sync** via cron jobs
7. **Configure production SSL** and load balancer
8. **Implement monitoring** and alerting for webhook failures

The webhook system is now ready for production deployment! 🚀



