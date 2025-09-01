// This script is for local testing only. Do NOT use in production.
// generate-admin-jwt.js
const jwt = require('jsonwebtoken');

const secret = process.env.SUPABASE_JWT_SECRET || 'tUR6SRh+Yq3WGVGIzKRpboweC+FmGV6fTazBwocbSFIcAwN2Dfk42ZZin1bxxWhP/1nyAjDrSdwSTLTy/y+YJg=='; // Use the same as your backend
const payload = {
  role: 'ADMIN',
  email: 'a.mymeds03@gmail.com',
  exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour from now
};

const token = jwt.sign(payload, secret);
console.log('Admin JWT:', token); 