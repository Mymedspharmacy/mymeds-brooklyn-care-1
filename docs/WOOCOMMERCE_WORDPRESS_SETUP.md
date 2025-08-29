# WooCommerce & WordPress Integration Setup

This guide will help you set up WooCommerce for the shop and WordPress for the blog integration.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# API Configuration
VITE_API_URL=http://localhost:4000/api

# WooCommerce Configuration
VITE_WOOCOMMERCE_URL=https://your-wordpress-site.com
VITE_WOOCOMMERCE_CONSUMER_KEY=your_woocommerce_consumer_key
VITE_WOOCOMMERCE_CONSUMER_SECRET=your_woocommerce_consumer_secret

# WordPress Configuration
VITE_WORDPRESS_URL=https://your-wordpress-site.com

# Stripe Configuration (for payments)
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## WooCommerce Setup

### 1. Install WooCommerce Plugin
1. Go to your WordPress admin panel
2. Navigate to Plugins > Add New
3. Search for "WooCommerce"
4. Install and activate the WooCommerce plugin

### 2. Configure WooCommerce
1. Follow the WooCommerce setup wizard
2. Configure your store settings, payment methods, and shipping options
3. Add your products through the WooCommerce admin panel

### 3. Generate API Keys
1. Go to WooCommerce > Settings > Advanced > REST API
2. Click "Add Key"
3. Set the following:
   - Description: "MyMeds Brooklyn Care Frontend"
   - User: Select your admin user
   - Permissions: Read/Write
4. Copy the Consumer Key and Consumer Secret
5. Add these to your `.env` file

### 4. Enable CORS (if needed)
If you encounter CORS issues, add this to your WordPress site's `.htaccess` file:

```apache
<IfModule mod_headers.c>
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
</IfModule>
```

## WordPress Blog Setup

### 1. Configure WordPress REST API
The WordPress REST API should be enabled by default. If not:

1. Go to Settings > Permalinks
2. Select any option other than "Plain"
3. Save changes

### 2. Create Blog Posts
1. Go to Posts > Add New in your WordPress admin
2. Create your blog posts with:
   - Featured images
   - Categories
   - Tags (optional)
   - Content

### 3. Set Featured Posts
To make a post featured (sticky):
1. Edit the post
2. In the Publish box, click "Edit" next to "Visibility"
3. Check "Stick this post to the front page"
4. Update the post

## Features Implemented

### Shop (WooCommerce)
- ✅ Product listing with categories
- ✅ Product search and filtering
- ✅ Product details with images
- ✅ Shopping cart functionality
- ✅ Wishlist feature
- ✅ Stock status checking
- ✅ Sale price display
- ✅ Product ratings and reviews

### Blog (WordPress)
- ✅ Blog post listing
- ✅ Category filtering
- ✅ Search functionality
- ✅ Featured posts (sticky posts)
- ✅ Post details with full content
- ✅ Author information
- ✅ Reading time calculation
- ✅ Social sharing
- ✅ Like functionality (client-side)

## API Endpoints Used

### WooCommerce API
- `GET /wp-json/wc/v3/products` - Get products
- `GET /wp-json/wc/v3/products/{id}` - Get single product
- `GET /wp-json/wc/v3/products/categories` - Get categories
- `GET /wp-json/wc/v3/products?search={term}` - Search products

### WordPress API
- `GET /wp-json/wp/v2/posts` - Get posts
- `GET /wp-json/wp/v2/posts/{id}` - Get single post
- `GET /wp-json/wp/v2/categories` - Get categories
- `GET /wp-json/wp/v2/posts?sticky=true` - Get featured posts

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure your WordPress site allows cross-origin requests
   - Check if your hosting provider blocks CORS

2. **API Authentication Errors**
   - Verify your WooCommerce API keys are correct
   - Ensure the API keys have the right permissions

3. **Images Not Loading**
   - Check if your WordPress site is accessible
   - Verify featured images are set for posts/products

4. **Products/Posts Not Loading**
   - Check the browser console for errors
   - Verify your environment variables are set correctly
   - Ensure your WordPress/WooCommerce site is accessible

### Testing the Integration

1. Start your development server: `npm run dev`
2. Navigate to `/shop` to test WooCommerce integration
3. Navigate to `/blog` to test WordPress integration
4. Check the browser console for any errors

## Security Considerations

1. **API Keys**: Keep your WooCommerce API keys secure and never commit them to version control
2. **HTTPS**: Use HTTPS for production to secure API communications
3. **Rate Limiting**: Consider implementing rate limiting for API calls
4. **CORS**: Configure CORS properly for production environments

## Next Steps

1. **Payment Integration**: Integrate WooCommerce checkout or Stripe payments
2. **User Accounts**: Add user registration and login functionality
3. **Order Management**: Implement order tracking and management
4. **SEO**: Add meta tags and structured data for better SEO
5. **Performance**: Implement caching for API responses
6. **Analytics**: Add tracking for shop and blog interactions 