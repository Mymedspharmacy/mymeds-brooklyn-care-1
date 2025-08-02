const crypto = require('crypto');

// Generate a secure JWT secret
function generateJWTSecret() {
  // Generate a 64-byte random string and encode it as base64
  const secret = crypto.randomBytes(64).toString('base64');
  
  console.log('🔐 Generated Secure JWT Secret:');
  console.log('================================');
  console.log(secret);
  console.log('================================');
  console.log('');
  console.log('📝 Instructions:');
  console.log('1. Copy this secret and set it as your JWT_SECRET environment variable');
  console.log('2. Keep this secret secure and never share it publicly');
  console.log('3. Use different secrets for development and production');
  console.log('');
  console.log('🌐 Environment Variable Setup:');
  console.log('JWT_SECRET="' + secret + '"');
  console.log('');
  console.log('⚠️  Security Notes:');
  console.log('- Store this in your .env file (not in version control)');
  console.log('- Use Railway environment variables for production');
  console.log('- Rotate this secret periodically for enhanced security');
  
  return secret;
}

// Generate admin credentials
function generateAdminCredentials() {
  const adminEmail = 'admin@mymedspharmacy.com';
  const adminPassword = generateSecurePassword();
  const adminName = 'Admin User';
  
  console.log('👤 Generated Admin Credentials:');
  console.log('================================');
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);
  console.log(`Name: ${adminName}`);
  console.log('================================');
  console.log('');
  console.log('🌐 Environment Variables:');
  console.log(`ADMIN_EMAIL="${adminEmail}"`);
  console.log(`ADMIN_PASSWORD="${adminPassword}"`);
  console.log(`ADMIN_NAME="${adminName}"`);
  console.log('');
  console.log('⚠️  Important:');
  console.log('- Change the admin password after first login');
  console.log('- Use strong, unique passwords in production');
  console.log('- Store these securely and never commit to version control');
  
  return { adminEmail, adminPassword, adminName };
}

// Generate a secure password
function generateSecurePassword() {
  const length = 16;
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  // Ensure at least one character from each category
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Uppercase
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Lowercase
  password += '0123456789'[Math.floor(Math.random() * 10)]; // Number
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // Special character
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Main execution
if (require.main === module) {
  console.log('🚀 MyMeds Pharmacy - Security Setup');
  console.log('====================================');
  console.log('');
  
  generateJWTSecret();
  console.log('');
  generateAdminCredentials();
  
  console.log('');
  console.log('✅ Setup Complete!');
  console.log('Next steps:');
  console.log('1. Set the environment variables in your .env file');
  console.log('2. Restart your backend server');
  console.log('3. Test admin login with the generated credentials');
  console.log('4. Change the admin password after first login');
} 