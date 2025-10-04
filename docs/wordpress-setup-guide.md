# WordPress Integration Setup Guide

## Overview
This guide will help you configure your MyMeds Pharmacy app to fetch real blog content from your WordPress admin panel instead of using sample data.

## Prerequisites
- WordPress website with admin access
- WordPress REST API enabled
- Application password capability

## Step 1: WordPress Site Preparation

### 1.1 Enable WordPress REST API
WordPress REST API is enabled by default in WordPress 4.7+. Verify it's working:
- Visit: `https://yourdomain.com/wp-json/wp/v2/posts`
- You should see JSON data of your posts

### 1.2 Create Application Password
1. Log into your WordPress admin panel
2. Go to **Users → Profile** (or **Users → All Users → Edit User**)
3. Scroll down to **Application Passwords**
4. Enter a name like "MyMeds Pharmacy App"
5. Click **Add New Application Password**
6. **Copy the generated password** (you won't see it again!)

## Step 2: Configure Environment Variables

### 2.1 Create/Update .env File
Add these variables to your `.env` file:

```bash
# WordPress Configuration
VITE_WORDPRESS_URL=https://yourdomain.com
WORDPRESS_USERNAME=your_wordpress_username
WORDPRESS_PASSWORD=your_application_password

# Alternative: Use these if VITE_WORDPRESS_URL doesn't work
WORDPRESS_URL=https://yourdomain.com
WORDPRESS_USERNAME=your_wordpress_username
WORDPRESS_APP_PASSWORD=your_application_password
```

### 2.2 Example Configuration
```bash
VITE_WORDPRESS_URL=https://mymedspharmacyinc.com
WORDPRESS_USERNAME=admin
WORDPRESS_PASSWORD=abcd efgh ijkl mnop qrst uvwx
```

## Step 3: Configure WordPress Settings in Database

### 3.1 Access Admin Panel
1. Log into your MyMeds Pharmacy admin panel
2. Navigate to **Settings → WordPress Integration**
3. Fill in the WordPress settings:

**WordPress Site URL**: `https://yourdomain.com`
**Username**: Your WordPress username
**Application Password**: The password generated in Step 1.2
**Enable WordPress Integration**: ✅ Check this box

### 3.2 Test Connection
Click **Test Connection** to verify the setup is working correctly.

## Step 4: Create Blog Content in WordPress

### 4.1 Create Categories
1. In WordPress admin, go to **Posts → Categories**
2. Create relevant categories:
   - Health & Wellness
   - Medication Safety
   - Pharmacy News
   - Patient Education
   - etc.

### 4.2 Create Blog Posts
1. Go to **Posts → Add New**
2. Create your first blog post:
   - **Title**: "Welcome to MyMeds Pharmacy Blog"
   - **Content**: Write your blog content
   - **Categories**: Select appropriate category
   - **Featured Image**: Upload a relevant image
   - **Publish** the post

### 4.3 Create Multiple Posts
Create several blog posts to populate your blog page with real content.

## Step 5: Verify Integration

### 5.1 Check Blog Page
1. Visit your app's blog page
2. Verify that real WordPress posts are displayed
3. Check that categories are working
4. Test search functionality

### 5.2 Test Features
- **Post Display**: Real posts from WordPress
- **Categories**: Real categories from WordPress
- **Author Information**: Real author data
- **Featured Images**: Real images from WordPress
- **Search**: Search through real WordPress content

## Troubleshooting

### Common Issues

#### 1. "WordPress not configured" Error
**Solution**: 
- Verify environment variables are set correctly
- Check that WordPress settings are enabled in admin panel
- Ensure WordPress URL is accessible

#### 2. Authentication Failed
**Solution**:
- Verify username is correct
- Regenerate application password in WordPress
- Check that application passwords are enabled

#### 3. No Posts Showing
**Solution**:
- Verify you have published posts in WordPress
- Check that posts are published (not drafts)
- Test WordPress REST API directly: `https://yourdomain.com/wp-json/wp/v2/posts`

#### 4. Images Not Loading
**Solution**:
- Check that featured images are set in WordPress posts
- Verify image URLs are accessible
- Ensure WordPress media library is working

### Testing WordPress API Directly

Test your WordPress API connection:

```bash
# Test basic API access
curl https://yourdomain.com/wp-json/wp/v2/posts

# Test with authentication
curl -u "username:app_password" https://yourdomain.com/wp-json/wp/v2/posts
```

## Advanced Configuration

### Custom Post Types
If you have custom post types, you can modify the API calls to include them:

```javascript
// In your WordPress API calls, add:
?type=post,custom_post_type
```

### Custom Fields
To include custom fields in your posts:

```javascript
// Add to your API calls:
?_fields=id,title,content,excerpt,custom_field
```

### Caching
The app includes caching for better performance:
- Posts are cached for 10 minutes
- Clear cache in admin panel if needed
- Cache is automatically invalidated when posts are updated

## Security Notes

1. **Application Passwords**: Store securely and don't share
2. **HTTPS**: Always use HTTPS for WordPress URLs
3. **Permissions**: Use a WordPress user with minimal required permissions
4. **Environment Variables**: Never commit .env files to version control

## Support

If you encounter issues:
1. Check the WordPress REST API documentation
2. Verify your WordPress installation
3. Test API endpoints directly
4. Check server logs for detailed error messages

## Next Steps

Once WordPress integration is working:
1. Create regular blog content in WordPress
2. Use categories to organize content
3. Add featured images to posts
4. Monitor the integration for any issues
5. Consider setting up automatic sync if needed
