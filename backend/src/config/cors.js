
// CORS Configuration for Production - NO LOCALHOST
const corsOptions = {
  origin: [
    'https://mymedspharmacyinc.com',
    'https://www.mymedspharmacyinc.com',
    'https://72.60.116.253' // VPS Production IP
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control'
  ],
  exposedHeaders: ['Content-Length', 'X-Total-Count', 'X-Requested-With'],
  maxAge: 86400 // 24 hours
};

module.exports = corsOptions;
