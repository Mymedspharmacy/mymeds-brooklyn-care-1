// generate-admin-jwt.js
const jwt = require('jsonwebtoken');

const secret = process.env.SUPABASE_JWT_SECRET || 'your-very-strong-secret'; // Use the same as your backend
const payload = {
  role: 'ADMIN',
  email: 'a.mymeds03@gmail.com',
  exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour from now
};

const token = jwt.sign(payload, secret);
console.log('Admin JWT:', token); 