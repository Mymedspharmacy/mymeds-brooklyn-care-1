# MyMeds Pharmacy Inc. 

Modern pharmacy management system with e-commerce integration.

## Quick Start

### Development
```bash
# Frontend
npm run dev

# Backend (in separate terminal)
cd backend
npm run dev
```

### Production Deployment
```bash
# Automated deployment
chmod +x deployment/deploy-vps.sh
./deployment/deploy-vps.sh
```

## Admin Access
- **URL**: `/admin`
- **Email**: `admin@mymedspharmacyinc.com`
- **Password**: `Pharm-23-medS`

## Environment Setup

Create `.env` in backend directory:
```bash
DATABASE_URL="mysql://user:password@localhost:3306/mymeds_production"
JWT_SECRET="your_jwt_secret_minimum_32_characters"
BCRYPT_ROUNDS=12
WOOCOMMERCE_STORE_URL="https://yourdomain.com/shop"
WOOCOMMERCE_CONSUMER_KEY="your_key"
WOOCOMMERCE_CONSUMER_SECRET="your_secret"
```

## Features
- Patient management portal
- Appointment booking system
- WooCommerce e-commerce integration
- Admin dashboard
- Form management
- WordPress blog integration





