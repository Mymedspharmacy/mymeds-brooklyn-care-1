#!/usr/bin/env node

/**
 * WordPress Configuration Script
 * 
 * This script helps you configure WordPress integration for your MyMeds Pharmacy app.
 * It will guide you through setting up the necessary environment variables and database settings.
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function configureWordPress() {
  console.log('\n🚀 WordPress Configuration for MyMeds Pharmacy\n');
  console.log('This script will help you configure WordPress integration to fetch real blog content.\n');

  try {
    // Get WordPress site URL
    const wpUrl = await question('📝 Enter your WordPress site URL (e.g., https://mymedspharmacyinc.com): ');
    if (!wpUrl || !wpUrl.startsWith('http')) {
      console.error('❌ Invalid URL. Please enter a valid URL starting with http:// or https://');
      process.exit(1);
    }

    // Get WordPress username
    const wpUsername = await question('👤 Enter your WordPress username: ');
    if (!wpUsername) {
      console.error('❌ Username is required');
      process.exit(1);
    }

    // Get application password
    console.log('\n🔐 Application Password Setup:');
    console.log('1. Log into your WordPress admin panel');
    console.log('2. Go to Users → Profile');
    console.log('3. Scroll down to "Application Passwords"');
    console.log('4. Enter a name like "MyMeds Pharmacy App"');
    console.log('5. Click "Add New Application Password"');
    console.log('6. Copy the generated password (you won\'t see it again!)\n');

    const wpPassword = await question('🔑 Enter the application password generated above: ');
    if (!wpPassword) {
      console.error('❌ Application password is required');
      process.exit(1);
    }

    // Update .env file
    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';

    // Read existing .env file if it exists
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Update or add WordPress configuration
    const wpConfig = `
# WordPress Configuration
VITE_WORDPRESS_URL=${wpUrl}
WORDPRESS_USERNAME=${wpUsername}
WORDPRESS_PASSWORD=${wpPassword}

# Alternative WordPress Configuration (if needed)
WORDPRESS_URL=${wpUrl}
WORDPRESS_APP_PASSWORD=${wpPassword}
`;

    // Remove existing WordPress configuration if present
    const lines = envContent.split('\n');
    const filteredLines = lines.filter(line => {
      const trimmed = line.trim();
      return !trimmed.startsWith('VITE_WORDPRESS_URL') &&
             !trimmed.startsWith('WORDPRESS_USERNAME') &&
             !trimmed.startsWith('WORDPRESS_PASSWORD') &&
             !trimmed.startsWith('WORDPRESS_URL') &&
             !trimmed.startsWith('WORDPRESS_APP_PASSWORD') &&
             !trimmed.startsWith('# WordPress Configuration') &&
             !trimmed.startsWith('# Alternative WordPress Configuration');
    });

    // Add new WordPress configuration
    const newEnvContent = [...filteredLines, wpConfig].join('\n');

    // Write updated .env file
    fs.writeFileSync(envPath, newEnvContent);

    console.log('\n✅ WordPress configuration saved to .env file');

    // Test the configuration
    console.log('\n🧪 Testing WordPress API connection...');
    
    const testUrl = `${wpUrl}/wp-json/wp/v2/posts?per_page=1`;
    const auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64');

    try {
      const response = await fetch(testUrl, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ WordPress API connection successful!');
        console.log(`📊 Found ${response.headers.get('X-WP-Total') || 'unknown'} posts in your WordPress site`);
        
        if (data.length > 0) {
          console.log(`📝 Latest post: "${data[0].title?.rendered || 'Untitled'}"`);
        }
      } else {
        console.log(`⚠️ WordPress API responded with status: ${response.status}`);
        console.log('This might be due to:');
        console.log('- Application password not set correctly');
        console.log('- WordPress REST API disabled');
        console.log('- Incorrect username or URL');
      }
    } catch (error) {
      console.log('⚠️ Could not test WordPress API connection:');
      console.log(`   ${error.message}`);
      console.log('\nThis might be due to:');
      console.log('- Network connectivity issues');
      console.log('- WordPress site not accessible');
      console.log('- Incorrect URL format');
    }

    console.log('\n📋 Next Steps:');
    console.log('1. Restart your backend server to load the new environment variables');
    console.log('2. Visit your blog page to see real WordPress content');
    console.log('3. Create blog posts in your WordPress admin panel');
    console.log('4. Check the admin panel for WordPress integration settings');

    console.log('\n🔧 Manual Configuration (Alternative):');
    console.log('If you prefer to configure via the admin panel:');
    console.log('1. Log into your MyMeds Pharmacy admin panel');
    console.log('2. Go to Settings → WordPress Integration');
    console.log('3. Enter the same information there');

    console.log('\n📚 For more help, see: docs/wordpress-setup-guide.md');

  } catch (error) {
    console.error('\n❌ Configuration failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the configuration
configureWordPress();
