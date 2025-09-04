
// CORS Configuration for Production
const corsOptions = {
  origin: [
    'https://mymedspharmacyinc.com',
    'https://www.mymedspharmacyinc.com',
    'https://mymedspharmacyinc.com/blog',
    'https://mymedspharmacyinc.com/shop'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Length', 'X-Total-Count'],
  maxAge: 86400 // 24 hours
};

module.exports = corsOptions;
