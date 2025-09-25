# 🏥 MyMeds Pharmacy - Modern Healthcare Platform

A comprehensive pharmacy management system built with React, Node.js, and TypeScript, featuring full-stack deployment with Docker, WordPress integration, and production-ready configurations.

## 🏗️ Architecture

```
mymeds-brooklyn-care-1/
├── 📱 Frontend (React + Vite + TypeScript)
├── 🔧 Backend (Node.js + Express + Prisma)
├── 🚀 Deployment (Docker + PM2 + Nginx)
├── 📝 WordPress + WooCommerce Integration
└── 📚 Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MySQL 8.0+ (or SQLite for development)
- Docker & Docker Compose (for containerized deployment)
- Git

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Mymedspharmacy/mymeds-brooklyn-care-1.git
   cd mymeds-brooklyn-care-1
   ```

2. **Install dependencies**
   ```bash
   # Frontend dependencies
   npm install
   
   # Backend dependencies
   cd backend
   npm install
   cd ..
   ```

3. **Environment setup**
   ```bash
   # Copy environment files
   cp env.production .env
   cp backend/.env.example backend/.env
   ```

4. **MySQL Database setup**
   ```bash
   # Install MySQL (Ubuntu/Debian)
   sudo apt update
   sudo apt install mysql-server
   
   # Start MySQL service
   sudo systemctl start mysql
   sudo systemctl enable mysql
   
   # Create database and user
   sudo mysql -e "CREATE DATABASE IF NOT EXISTS mymeds_development;"
   sudo mysql -e "CREATE USER IF NOT EXISTS 'mymeds_user'@'localhost' IDENTIFIED BY 'Pharm-23-medS';"
   sudo mysql -e "GRANT ALL PRIVILEGES ON mymeds_development.* TO 'mymeds_user'@'localhost';"
   sudo mysql -e "FLUSH PRIVILEGES;"
   
   # Setup Prisma
   cd backend
   npx prisma generate
   npx prisma migrate dev
   cd ..
   ```

5. **Start development servers**
   ```bash
   # Frontend (port 5173)
   npm run dev
   
   # Backend (port 4000) - in separate terminal
   cd backend
   npm run dev
   ```

### Production Build

```bash
# Build both frontend and backend
npm run build:prod

# Or build separately
npm run build
cd backend && npm run build
```

## 📝 WordPress & WooCommerce Setup

### WordPress Installation

1. **Download WordPress**
   ```bash
   # Navigate to web root
   cd /var/www
   
   # Download latest WordPress
   sudo wget https://wordpress.org/latest.tar.gz
   
   # Extract WordPress
   sudo tar -xzf latest.tar.gz
   
   # Clean up
   sudo rm latest.tar.gz
   
   # Set permissions
   sudo chown -R www-data:www-data wordpress
   sudo chmod -R 755 wordpress
   ```

2. **Create WordPress Database**
   ```bash
   # Create WordPress database
   sudo mysql -e "CREATE DATABASE IF NOT EXISTS wordpress_db;"
   sudo mysql -e "CREATE USER IF NOT EXISTS 'wp_user'@'localhost' IDENTIFIED BY 'secure_wp_password';"
   sudo mysql -e "GRANT ALL PRIVILEGES ON wordpress_db.* TO 'wp_user'@'localhost';"
   sudo mysql -e "FLUSH PRIVILEGES;"
   ```

3. **Configure WordPress**
   ```bash
   # Copy WordPress config
   cd /var/www/wordpress
   sudo cp wp-config-sample.php wp-config.php
   
   # Edit wp-config.php with database credentials
   sudo nano wp-config.php
   ```

4. **WordPress Configuration**
   ```php
   // Database settings
   define('DB_NAME', 'wordpress_db');
   define('DB_USER', 'wp_user');
   define('DB_PASSWORD', 'secure_wp_password');
   define('DB_HOST', 'localhost');
   
   // Security keys (generate at https://api.wordpress.org/secret-key/1.1/salt/)
   define('AUTH_KEY',         'your-auth-key');
   define('SECURE_AUTH_KEY',  'your-secure-auth-key');
   define('LOGGED_IN_KEY',    'your-logged-in-key');
   define('NONCE_KEY',        'your-nonce-key');
   define('AUTH_SALT',        'your-auth-salt');
   define('SECURE_AUTH_SALT', 'your-secure-auth-salt');
   define('LOGGED_IN_SALT',   'your-logged-in-salt');
   define('NONCE_SALT',       'your-nonce-salt');
   ```

### WooCommerce Installation

1. **Install WooCommerce Plugin**
   ```bash
   # Download WooCommerce
   cd /var/www/wordpress/wp-content/plugins
   sudo wget https://downloads.wordpress.org/plugin/woocommerce.latest-stable.zip
   
   # Extract WooCommerce
   sudo unzip woocommerce.latest-stable.zip
   
   # Set permissions
   sudo chown -R www-data:www-data woocommerce
   sudo chmod -R 755 woocommerce
   
   # Clean up
   sudo rm woocommerce.latest-stable.zip
   ```

2. **Configure WooCommerce API**
   - Go to WordPress Admin → WooCommerce → Settings → Advanced → REST API
   - Click "Add Key"
   - Set description: "MyMeds Pharmacy Integration"
   - Set user: Administrator
   - Set permissions: Read/Write
   - Copy Consumer Key and Consumer Secret

3. **Update Environment Variables**
   ```bash
   # Add to backend/.env
   WOOCOMMERCE_STORE_URL=https://yourdomain.com/shop
   WOOCOMMERCE_CONSUMER_KEY=ck_your_consumer_key_here
   WOOCOMMERCE_CONSUMER_SECRET=cs_your_consumer_secret_here
   WOOCOMMERCE_WEBHOOK_SECRET=your_webhook_secret_here
   ```

### WordPress Integration Testing

```bash
# Test WordPress API connection
curl -X GET "https://yourdomain.com/wp-json/wp/v2/posts" \
  -H "Authorization: Basic $(echo -n 'username:app_password' | base64)"

# Test WooCommerce API connection
curl -X GET "https://yourdomain.com/wp-json/wc/v3/products" \
  -H "Authorization: Basic $(echo -n 'consumer_key:consumer_secret' | base64)"
```

## 🏗️ Project Structure

### Frontend (`src/`)
- `components/` - Reusable React components
- `pages/` - Page components
- `hooks/` - Custom React hooks
- `lib/` - Utilities and configurations
- `main.tsx` - Application entry point

### Backend (`backend/src/`)
- `routes/` - API route handlers
- `middleware/` - Express middleware
- `services/` - Business logic
- `config/` - Configuration files
- `database/` - Database setup
- `types/` - TypeScript type definitions
- `utils/` - Utility functions

### Deployment (`deployment/`)
- `docker/` - Docker configurations
- `nginx/` - Web server configurations
- `scripts/` - Deployment scripts

### Documentation (`docs/`)
- `DEPLOYMENT.md` - Deployment guide
- `API.md` - API documentation
- `DEVELOPMENT.md` - Development guide

## 🛠️ Available Scripts

### Frontend
```bash
npm run dev              # Start development server (port 5173)
npm run build            # Build for production
npm run build:prod       # Build both frontend and backend
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run type-check       # Run TypeScript checks
npm run clean            # Clean build directory
npm run analyze          # Analyze bundle size
```

### Backend
```bash
cd backend
npm run dev              # Start development server (port 4000)
npm run build            # Build TypeScript
npm run start            # Start production server
npm run start:prod       # Start production server with PM2
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:deploy    # Deploy migrations to production
npm run prisma:studio    # Open Prisma Studio
npm run seed:prod        # Seed production database
```

### Testing
```bash
npm run test             # Run Jest tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run test:automated   # Run automated testing suite
npm run test:e2e         # Run end-to-end tests
npm run test:database    # Test database connections
npm run test:api         # Test API endpoints
```

### Deployment & Production
```bash
npm run deploy:prod      # Deploy to production
npm run deploy:docker    # Deploy with Docker
npm run deploy:pm2       # Deploy with PM2
npm run update:vps       # Update VPS deployment
npm run start:prod       # Start production server
npm run db:migrate:prod  # Run production migrations
npm run db:seed:prod     # Seed production database
npm run validate:prod    # Validate production setup
npm run validate:deps    # Validate dependencies
npm run setup:deps       # Setup all dependencies
```

## 🚀 Deployment

### VPS Deployment (Recommended)

#### Prerequisites
- Ubuntu 20.04+ VPS
- Domain name pointed to VPS IP
- Root or sudo access
- Hostinger API token (optional)

#### Quick VPS Deployment
```bash
# 1. Clone repository on VPS
git clone https://github.com/Mymedspharmacy/mymeds-brooklyn-care-1.git
cd mymeds-brooklyn-care-1

# 2. Update system and install dependencies
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git nginx mysql-server php8.1 php8.1-fpm php8.1-mysql php8.1-curl php8.1-gd php8.1-mbstring php8.1-xml php8.1-zip php8.1-intl php8.1-bcmath nodejs npm certbot python3-certbot-nginx ufw

# 3. Install PM2 globally
sudo npm install -g pm2

# 4. Install project dependencies
npm install
cd backend && npm install && cd ..

# 5. Build application
npm run build:prod

# 6. Setup MySQL database
sudo mysql -e "CREATE DATABASE IF NOT EXISTS mymeds_production;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'mymeds_user'@'localhost' IDENTIFIED BY 'Pharm-23-medS';"
sudo mysql -e "GRANT ALL PRIVILEGES ON mymeds_production.* TO 'mymeds_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# 7. Setup WordPress
cd /var/www
sudo wget https://wordpress.org/latest.tar.gz
sudo tar -xzf latest.tar.gz
sudo rm latest.tar.gz
sudo chown -R www-data:www-data wordpress
sudo chmod -R 755 wordpress

# 8. Configure Nginx
sudo cp nginx.conf /etc/nginx/sites-available/mymeds-pharmacy
sudo ln -sf /etc/nginx/sites-available/mymeds-pharmacy /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t

# 9. Start services
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl start mysql
sudo systemctl enable mysql
sudo systemctl start php8.1-fpm
sudo systemctl enable php8.1-fpm

# 10. Start application with PM2
cd /var/www/mymeds-brooklyn-care-1
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 11. Setup SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com --non-interactive --agree-tos --email admin@yourdomain.com

# 12. Configure firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable
```

#### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

#### PM2 Process Management
```bash
# Start application
pm2 start ecosystem.config.js

# Monitor processes
pm2 monit

# View logs
pm2 logs

# Restart application
pm2 restart ecosystem.config.js

# Stop application
pm2 stop ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
```

## 📚 Documentation

- [Deployment Guide](docs/DEPLOYMENT.md) - Complete deployment instructions
- [Clean Architecture](docs/CLEAN_ARCHITECTURE.md) - System architecture overview

## 🔧 Configuration

### Environment Variables

**Frontend** (`.env.local`)
```env
VITE_API_URL=http://localhost:4000
VITE_BACKEND_URL=http://localhost:4000
VITE_WORDPRESS_URL=https://yourdomain.com/blog
VITE_WOOCOMMERCE_STORE_URL=https://yourdomain.com/shop
VITE_WOOCOMMERCE_CONSUMER_KEY=your_consumer_key
VITE_WOOCOMMERCE_CONSUMER_SECRET=your_consumer_secret
```

**Backend** (`backend/.env`)
```env
# Database
DATABASE_URL=mysql://mymeds_user:Pharm-23-medS@localhost:3306/mymeds_production
MYSQL_ROOT_PASSWORD=Pharm-23-medS
MYSQL_DATABASE=mymeds_production
MYSQL_USER=mymeds_user
MYSQL_PASSWORD=Pharm-23-medS

# JWT & Authentication
JWT_SECRET=Mymeds2025!JWTSecretKey_PharmacySecure_Production_2025!@#$%^&*()
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Admin Credentials
ADMIN_EMAIL=admin@mymedspharmacyinc.com
ADMIN_PASSWORD=Mymeds2025!AdminSecure123!@#
ADMIN_FIRST_NAME=Admin
ADMIN_LAST_NAME=User

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=mymedspharmacyinc@gmail.com
EMAIL_PASSWORD=YourGmailAppPasswordHere
EMAIL_FROM=mymedspharmacyinc@gmail.com
EMAIL_FROM_NAME="MyMeds Pharmacy Inc."

# WordPress Integration
WORDPRESS_URL=https://mymedspharmacyinc.com/blog
WORDPRESS_USERNAME=mymeds_api_user
WORDPRESS_APP_PASSWORD=X8J0 ICBi 5Ilb PnrX Bhyp r2PE
FEATURE_WORDPRESS_ENABLED=true

# WooCommerce Integration
WOOCOMMERCE_STORE_URL=https://mymedspharmacyinc.com/shop
WOOCOMMERCE_CONSUMER_KEY=ck_ddb321a18e45a62347c275dd1fdabd6131e736fa
WOOCOMMERCE_CONSUMER_SECRET=cs_31e5fcca00c36a6ff7913199999a29552a7494c2
WOOCOMMERCE_WEBHOOK_SECRET=Mymeds2025!WooCommerceWebhookSecret_Production_2025!@#
FEATURE_WOOCOMMERCE_ENABLED=true

# Security Configuration
SESSION_SECRET=Mymeds2025!SessionSecret_PharmacySecure_Production_2025!@#$%^&*()
HELMET_ENABLED=true
XSS_PROTECTION=true
CONTENT_SECURITY_POLICY=true

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=https://www.mymedspharmacyinc.com,https://mymedspharmacyinc.com
CORS_CREDENTIALS=true
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS,PATCH
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With,Accept,Origin,Cache-Control
```

### Production Environment Setup

1. **Copy environment file**
   ```bash
   cp env.production .env
   ```

2. **Update production values**
   - Replace `yourdomain.com` with your actual domain
   - Update database credentials
   - Set secure JWT secrets
   - Configure email settings
   - Add WooCommerce API keys

3. **Generate secure secrets**
   ```bash
   # Generate JWT secret
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   
   # Generate session secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check MySQL status
sudo systemctl status mysql

# Restart MySQL
sudo systemctl restart mysql

# Check database exists
mysql -u root -p -e "SHOW DATABASES;"

# Check user privileges
mysql -u root -p -e "SHOW GRANTS FOR 'mymeds_user'@'localhost';"

# Test connection
mysql -u mymeds_user -p -e "USE mymeds_development; SHOW TABLES;"

# Reset database (WARNING: Deletes all data)
cd backend
npx prisma migrate reset
npx prisma migrate dev

# Check Prisma status
npx prisma status
```

#### Port Already in Use
```bash
# Check what's using port 4000
sudo lsof -i :4000

# Kill process
sudo kill -9 <PID>

# Or use different port
PORT=4001 npm run dev
```

#### Build Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear backend node_modules
cd backend
rm -rf node_modules package-lock.json
npm install
cd ..

# Clear build cache
npm run clean
npm run build:prod
```

#### PM2 Issues
```bash
# Check PM2 status
pm2 status

# View PM2 logs
pm2 logs

# Restart PM2 processes
pm2 restart all

# Delete PM2 processes
pm2 delete all
pm2 start ecosystem.config.js
```

#### WordPress Issues
```bash
# Check WordPress permissions
sudo chown -R www-data:www-data /var/www/wordpress
sudo chmod -R 755 /var/www/wordpress

# Check WordPress database connection
mysql -u wp_user -p -e "USE wordpress_db; SHOW TABLES;"

# Check WordPress configuration
sudo nano /var/www/wordpress/wp-config.php

# Check WordPress logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/php8.1-fpm.log

# Reset WordPress permissions
sudo find /var/www/wordpress -type d -exec chmod 755 {} \;
sudo find /var/www/wordpress -type f -exec chmod 644 {} \;
```

#### WooCommerce Issues
```bash
# Check WooCommerce plugin status
ls -la /var/www/wordpress/wp-content/plugins/woocommerce

# Check WooCommerce API keys
# Go to WordPress Admin → WooCommerce → Settings → Advanced → REST API

# Test WooCommerce API
curl -X GET "https://yourdomain.com/wp-json/wc/v3/system_status" \
  -H "Authorization: Basic $(echo -n 'consumer_key:consumer_secret' | base64)"

# Check WooCommerce logs
sudo tail -f /var/www/wordpress/wp-content/uploads/wc-logs/
```

### Performance Optimization

#### Enable Gzip Compression
```bash
# Add to Nginx config
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

#### Enable Caching
```bash
# Add to Nginx config
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm run test && npm run lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- 📖 **Documentation**: Check this README and inline code comments
- 🐛 **Bug Reports**: Open an issue on [GitHub Issues](https://github.com/Mymedspharmacy/mymeds-brooklyn-care-1/issues)
- 💡 **Feature Requests**: Submit via [GitHub Issues](https://github.com/Mymedspharmacy/mymeds-brooklyn-care-1/issues)
- 💬 **Discussions**: Use [GitHub Discussions](https://github.com/Mymedspharmacy/mymeds-brooklyn-care-1/discussions)

### Contact Information
- **Email**: admin@mymedspharmacyinc.com
- **Website**: https://mymedspharmacyinc.com
- **GitHub**: https://github.com/Mymedspharmacy/mymeds-brooklyn-care-1

### Emergency Support
For critical production issues:
1. Check the troubleshooting section above
2. Review PM2 logs: `pm2 logs`
3. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
4. Open a GitHub issue with "URGENT" in the title
