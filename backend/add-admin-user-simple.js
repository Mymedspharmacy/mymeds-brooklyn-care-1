const bcrypt = require('bcrypt');

// Generate bcrypt hash for the new admin password
async function generateHash() {
  try {
    const password = 'Pharm-23-medS';
    const saltRounds = 12;
    const hash = await bcrypt.hash(password, saltRounds);
    
    console.log('🔐 Generated bcrypt hash for new admin user:');
    console.log('');
    console.log('Add these lines to your .env file:');
    console.log('');
    console.log('# Second Admin User');
    console.log('ADMIN2_EMAIL=mymedspharmacyinc@gmail.com');
    console.log(`ADMIN2_PASSWORD_HASH=${hash}`);
    console.log('ADMIN2_FIRST_NAME=MyMeds');
    console.log('ADMIN2_LAST_NAME=Admin');
    console.log('');
    console.log('Then run: node src/ensureAdminUser2.js');
    
  } catch (error) {
    console.error('❌ Error generating hash:', error);
  }
}

generateHash();
