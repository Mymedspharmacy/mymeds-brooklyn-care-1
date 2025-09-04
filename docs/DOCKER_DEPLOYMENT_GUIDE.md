# 🐳 MyMeds Pharmacy - Docker Deployment Guide

## 📋 Prerequisites

### System Requirements
- **Windows**: Windows 10/11 Pro, Enterprise, or Education (64-bit)
- **macOS**: macOS 10.15 or newer
- **Linux**: Ubuntu 18.04+, CentOS 7+, or similar
- **RAM**: Minimum 4GB, recommended 8GB+
- **Storage**: At least 10GB free space

### Required Software
1. **Docker Desktop** (includes Docker Engine and Docker Compose)
   - Download from: https://www.docker.com/products/docker-desktop/
   - Install and restart your computer
   - Start Docker Desktop

2. **Git** (for cloning the repository)
   - Download from: https://git-scm.com/

3. **Node.js** (for running scripts)
   - Download from: https://nodejs.org/ (LTS version)

## 🚀 Quick Start Deployment

### Step 1: Install Docker Desktop

1. **Download Docker Desktop**:
   - Go to https://www.docker.com/products/docker-desktop/
   - Click "Download for Windows" (or your OS)
   - Run the installer

2. **Installation Process**:
   - Follow the installation wizard
   - Enable WSL 2 if prompted
   - Restart your computer when asked

3. **Start Docker Desktop**:
   - Launch Docker Desktop
   - Wait for Docker to finish starting (whale icon in system tray)
   - Verify installation by opening terminal and running:
     ```bash
     docker --version
     docker-compose --version
     ```

### Step 2: Clone and Setup Project

```bash
# Clone the repository
git clone https://github.com/yourusername/mymeds-brooklyn-care.git
cd mymeds-brooklyn-care

# Install dependencies
npm install
cd backend && npm install && cd ..
```

### Step 3: Configure Environment

1. **Copy environment template**:
   ```bash
   cp docker.env .env
   ```

2. **Edit environment variables**:
   - Open `.env` file in your text editor
   - Update the following critical variables:
     ```bash
     # Generate strong JWT secrets (64+ characters)
     JWT_SECRET=your_very_long_and_secure_jwt_secret_here
     JWT_REFRESH_SECRET=your_very_long_and_secure_refresh_secret_here
     
     # Database passwords
     MYSQL_ROOT_PASSWORD=your_secure_root_password
     MYSQL_PASSWORD=pMyMedsSecurePassword2024!
     
     # Email configuration
     SMTP_USER=mymedspharmacyinc@gmail.com
     SMTP_PASS=your_app_password_here
     
     # Redis password
     REDIS_PASSWORD=your_secure_redis_password
     ```

### Step 4: Deploy with Docker

#### Option A: Automated Deployment (Recommended)
```bash
# Run the automated deployment script
npm run deploy:docker
```

#### Option B: Manual Deployment
```bash
# Generate SSL certificates
chmod +x scripts/generate-ssl.sh
./scripts/generate-ssl.sh

# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# Check service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Step 5: Verify Deployment

1. **Check service health**:
   ```bash
   # Application health
   curl -k https://localhost/api/health
   
   # Service status
   docker-compose -f docker-compose.prod.yml ps
   ```

2. **Access the application**:
   - **Frontend**: https://localhost
   - **API Health**: https://localhost/api/health
   - **API Documentation**: https://localhost/api/docs

## 🔧 Configuration Details

### Environment Variables

The following environment variables must be configured in your `.env` file:

#### Required Variables
```bash
# Database
MYSQL_ROOT_PASSWORD=your_secure_root_password
MYSQL_PASSWORD=pMyMedsSecurePassword2024!

# JWT Secrets (64+ characters)
JWT_SECRET=your_64_character_jwt_secret_here
JWT_REFRESH_SECRET=your_64_character_refresh_secret_here

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=mymedspharmacyinc@gmail.com
SMTP_PASS=your_app_password_here

# Redis
REDIS_PASSWORD=your_secure_redis_password
```

#### Optional Variables
```bash
# CORS Origins
CORS_ORIGINS=https://mymedspharmacyinc.com,https://www.mymedspharmacyinc.com

# WooCommerce
WOOCOMMERCE_STORE_URL=https://mymedspharmacyinc.com/shop
WOOCOMMERCE_CONSUMER_KEY=your_woocommerce_consumer_key
WOOCOMMERCE_CONSUMER_SECRET=your_woocommerce_consumer_secret

# WordPress
WORDPRESS_URL=https://mymedspharmacyinc.com/blog
WORDPRESS_USERNAME=your_wordpress_username
WORDPRESS_PASSWORD=your_wordpress_password
```

### SSL Certificates

For development, self-signed certificates are automatically generated. For production:

1. **Replace SSL certificates**:
   ```bash
   # Replace these files with your production certificates
   nginx/ssl/cert.pem    # Your SSL certificate
   nginx/ssl/key.pem    # Your private key
   ```

2. **Update Nginx configuration**:
   - Edit `nginx/nginx.conf` to use your domain name
   - Update SSL certificate paths if needed

## 📊 Service Architecture

The Docker deployment includes the following services:

### 1. **MySQL Database** (`mysql`)
- **Port**: 3306
- **Database**: `mymeds_production`
- **User**: `mymeds_user`
- **Volume**: `mysql_data`

### 2. **Redis Cache** (`redis`)
- **Port**: 6379
- **Password**: Configurable
- **Volume**: `redis_data`

### 3. **MyMeds Application** (`app`)
- **Port**: 4000
- **Frontend**: Built React app
- **Backend**: Node.js API
- **Volumes**: `app_logs`, `app_uploads`, `app_backups`

### 4. **Nginx Reverse Proxy** (`nginx`)
- **Ports**: 80 (HTTP), 443 (HTTPS)
- **SSL**: Self-signed certificates
- **Rate Limiting**: Configured
- **Volume**: `nginx_logs`

## 🛠️ Management Commands

### Service Management
```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Stop all services
docker-compose -f docker-compose.prod.yml down

# Restart all services
docker-compose -f docker-compose.prod.yml restart

# Restart specific service
docker-compose -f docker-compose.prod.yml restart app

# View service status
docker-compose -f docker-compose.prod.yml ps
```

### Logs and Monitoring
```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs

# Follow logs in real-time
docker-compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker-compose -f docker-compose.prod.yml logs app
docker-compose -f docker-compose.prod.yml logs mysql
docker-compose -f docker-compose.prod.yml logs nginx

# View last 50 lines
docker-compose -f docker-compose.prod.yml logs --tail=50
```

### Database Management
```bash
# Access MySQL
docker-compose -f docker-compose.prod.yml exec mysql mysql -u root -p

# Run database migrations
docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy

# Generate Prisma client
docker-compose -f docker-compose.prod.yml exec app npx prisma generate

# Access database as application user
docker-compose -f docker-compose.prod.yml exec mysql mysql -u mymeds_user -p mymeds_production
```

### Container Access
```bash
# Access application container
docker-compose -f docker-compose.prod.yml exec app bash

# Access MySQL container
docker-compose -f docker-compose.prod.yml exec mysql bash

# Access Nginx container
docker-compose -f docker-compose.prod.yml exec nginx sh
```

## 🔍 Troubleshooting

### Common Issues

#### 1. **Docker not running**
```bash
# Check Docker status
docker info

# Start Docker Desktop
# On Windows: Launch Docker Desktop application
# On macOS: Launch Docker Desktop application
# On Linux: sudo systemctl start docker
```

#### 2. **Port conflicts**
```bash
# Check what's using the ports
netstat -ano | findstr :80
netstat -ano | findstr :443
netstat -ano | findstr :4000

# Stop conflicting services or change ports in docker-compose.prod.yml
```

#### 3. **Database connection issues**
```bash
# Check MySQL logs
docker-compose -f docker-compose.prod.yml logs mysql

# Check if MySQL is running
docker-compose -f docker-compose.prod.yml exec mysql mysqladmin ping -h localhost

# Reset MySQL container
docker-compose -f docker-compose.prod.yml restart mysql
```

#### 4. **Application not starting**
```bash
# Check application logs
docker-compose -f docker-compose.prod.yml logs app

# Check if all dependencies are installed
docker-compose -f docker-compose.prod.yml exec app npm list

# Rebuild application
docker-compose -f docker-compose.prod.yml build --no-cache app
```

#### 5. **SSL certificate issues**
```bash
# Regenerate SSL certificates
./scripts/generate-ssl.sh

# Check certificate validity
openssl x509 -in nginx/ssl/cert.pem -text -noout

# Test SSL connection
curl -k https://localhost/api/health
```

### Performance Issues

#### 1. **High memory usage**
```bash
# Check container resource usage
docker stats

# Increase Docker Desktop memory limit
# Docker Desktop > Settings > Resources > Memory
```

#### 2. **Slow database queries**
```bash
# Check database performance
docker-compose -f docker-compose.prod.yml exec mysql mysql -u root -p -e "SHOW PROCESSLIST;"

# Optimize database
docker-compose -f docker-compose.prod.yml exec mysql mysql -u root -p -e "OPTIMIZE TABLE mymeds_production.*;"
```

## 🔒 Security Considerations

### Production Security Checklist

- [ ] **Replace self-signed SSL certificates** with proper certificates
- [ ] **Update all passwords** in environment variables
- [ ] **Generate strong JWT secrets** (64+ characters)
- [ ] **Configure firewall** to only allow necessary ports
- [ ] **Enable Docker security scanning**
- [ ] **Regular security updates** for base images
- [ ] **Monitor logs** for suspicious activity
- [ ] **Backup strategy** implementation

### Security Best Practices

1. **Environment Variables**:
   - Never commit `.env` files to version control
   - Use strong, unique passwords
   - Rotate secrets regularly

2. **Network Security**:
   - Use HTTPS only in production
   - Configure proper CORS origins
   - Implement rate limiting

3. **Container Security**:
   - Run containers as non-root users
   - Keep base images updated
   - Scan images for vulnerabilities

## 📈 Scaling and Performance

### Resource Allocation
```bash
# Monitor resource usage
docker stats

# Adjust resource limits in docker-compose.prod.yml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
```

### Load Balancing
For production scaling, consider:
- Multiple application instances
- Database read replicas
- CDN for static assets
- Redis cluster for caching

## 🔄 Backup and Recovery

### Automated Backups
```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec mysql mysqldump -u root -p mymeds_production > backup.sql

# Restore backup
docker-compose -f docker-compose.prod.yml exec -T mysql mysql -u root -p mymeds_production < backup.sql
```

### Volume Backups
```bash
# Backup volumes
docker run --rm -v mymeds_mysql_data:/data -v $(pwd):/backup alpine tar czf /backup/mysql_backup.tar.gz -C /data .

# Restore volumes
docker run --rm -v mymeds_mysql_data:/data -v $(pwd):/backup alpine tar xzf /backup/mysql_backup.tar.gz -C /data
```

## 📞 Support

### Getting Help
- **Documentation**: Check the main README.md
- **Issues**: Create an issue on GitHub
- **Logs**: Use `docker-compose logs` to debug issues

### Useful Resources
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [MySQL Documentation](https://dev.mysql.com/doc/)

---

**Last Updated**: $(date)
**Version**: 2.0.0
**Status**: Production Ready ✅
