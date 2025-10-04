#!/usr/bin/env node

/**
 * WordPress Connection Test Script
 * 
 * This script tests the WordPress API connection to ensure your blog page
 * will fetch real content from your WordPress admin panel.
 */

const fetch = require('node-fetch');
require('dotenv').config();

async function testWordPressConnection() {
  console.log('\n🧪 Testing WordPress API Connection\n');

  // Get environment variables
  const wpUrl = process.env.WORDPRESS_URL || process.env.VITE_WORDPRESS_URL;
  const wpUsername = process.env.WORDPRESS_USERNAME;
  const wpPassword = process.env.WORDPRESS_APP_PASSWORD || process.env.WORDPRESS_PASSWORD;

  console.log('📋 Configuration Check:');
  console.log(`   WordPress URL: ${wpUrl ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Username: ${wpUsername ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Password: ${wpPassword ? '✅ Set' : '❌ Missing'}\n`);

  if (!wpUrl || !wpUsername || !wpPassword) {
    console.log('❌ WordPress configuration is incomplete!');
    console.log('\nPlease set the following environment variables in your .env file:');
    if (!wpUrl) console.log('   - VITE_WORDPRESS_URL=https://yourdomain.com');
    if (!wpUsername) console.log('   - WORDPRESS_USERNAME=your_username');
    if (!wpPassword) console.log('   - WORDPRESS_PASSWORD=your_app_password');
    console.log('\nSee docs/wordpress-setup-guide.md for detailed instructions.');
    process.exit(1);
  }

  // Test basic API access
  console.log('🔄 Testing WordPress REST API access...');
  
  try {
    const testUrl = `${wpUrl}/wp-json/wp/v2/posts?per_page=1`;
    console.log(`   Testing URL: ${testUrl}`);

    const auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64');
    
    const response = await fetch(testUrl, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`   Response Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      const totalPosts = response.headers.get('X-WP-Total');
      const totalPages = response.headers.get('X-WP-TotalPages');

      console.log('✅ WordPress API connection successful!\n');
      
      console.log('📊 WordPress Site Information:');
      console.log(`   Total Posts: ${totalPosts || 'Unknown'}`);
      console.log(`   Total Pages: ${totalPages || 'Unknown'}`);
      
      if (data.length > 0) {
        console.log(`   Latest Post: "${data[0].title?.rendered || 'Untitled'}"`);
        console.log(`   Post ID: ${data[0].id}`);
        console.log(`   Published: ${data[0].date}`);
      } else {
        console.log('   ⚠️ No published posts found');
        console.log('   Create some blog posts in your WordPress admin panel');
      }

      // Test categories
      console.log('\n🔄 Testing categories endpoint...');
      const categoriesResponse = await fetch(`${wpUrl}/wp-json/wp/v2/categories`, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });

      if (categoriesResponse.ok) {
        const categories = await categoriesResponse.json();
        console.log(`✅ Categories endpoint working! Found ${categories.length} categories`);
        
        if (categories.length > 0) {
          console.log('   Sample categories:');
          categories.slice(0, 3).forEach(cat => {
            console.log(`   - ${cat.name} (${cat.count} posts)`);
          });
        }
      } else {
        console.log(`⚠️ Categories endpoint returned status: ${categoriesResponse.status}`);
      }

      console.log('\n🎉 Your blog page should now fetch real WordPress content!');
      console.log('\n📋 Next Steps:');
      console.log('1. Restart your backend server');
      console.log('2. Visit your blog page to see real WordPress posts');
      console.log('3. Create more blog posts in WordPress admin if needed');

    } else {
      console.log('❌ WordPress API connection failed!');
      
      if (response.status === 401) {
        console.log('\n🔐 Authentication Error:');
        console.log('   - Check your WordPress username');
        console.log('   - Verify your application password is correct');
        console.log('   - Make sure application passwords are enabled in WordPress');
      } else if (response.status === 404) {
        console.log('\n🌐 URL Error:');
        console.log('   - Check your WordPress URL');
        console.log('   - Make sure WordPress REST API is enabled');
        console.log('   - Verify the site is accessible');
      } else {
        console.log(`\n❌ HTTP Error ${response.status}:`);
        console.log('   - Check WordPress site accessibility');
        console.log('   - Verify REST API is enabled');
        console.log('   - Check for plugin conflicts');
      }

      const errorText = await response.text();
      if (errorText) {
        console.log('\n📄 Error Details:');
        console.log(errorText);
      }
    }

  } catch (error) {
    console.log('❌ Connection test failed:');
    console.log(`   ${error.message}`);
    
    console.log('\n🔧 Troubleshooting:');
    console.log('   - Check your internet connection');
    console.log('   - Verify WordPress site URL is correct');
    console.log('   - Make sure WordPress site is accessible');
    console.log('   - Check for firewall or security restrictions');
  }

  console.log('\n📚 For more help, see: docs/wordpress-setup-guide.md\n');
}

// Run the test
testWordPressConnection();
