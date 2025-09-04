# 🚀 MyMeds Pharmacy VPS Deployment Guide

## ✅ **COMPLETE AUTOMATED DEPLOYMENT**

This guide will help you deploy your MyMeds Pharmacy application to a VPS with full automation.

---

## 📋 **PRE-DEPLOYMENT CHECKLIST**

### **1. GitHub Repository Setup**
- [ ] Push your code to GitHub
- [ ] Update `REPO_URL` in `deploy-vps.sh` with your actual GitHub URL
- [ ] Ensure all files are committed and pushed

### **2. VPS Requirements**
- [ ] Ubuntu 20.04+ or CentOS 8+
- [ ] Minimum 2GB RAM, 20GB storage
- [ ] Root access or sudo privileges
- [ ] Domain name pointing to VPS IP

### **3. Domain Configuration**
- [ ] Point `mymedspharmacyinc.com` to your VPS IP
- [ ] Point `www.mymedspharmacyinc.com` to your VPS IP
- [ ] Wait for DNS propagation (up to 24 hours)

---

## 🚀 **STEP-BY-STEP DEPLOYMENT**

### **Step 1: Push to GitHub**
```bash
# On your local machine
git add .
git commit -m "Production ready deployment"
git push origin main
```

### **Step 2: Connect to Your VPS**
```bash
# SSH into your VPS
ssh root@your-vps-ip
# or
ssh your-username@your-vps-ip
```

### **Step 3: Download Deployment Script**
```bash
# Download the deployment script
wget https://raw.githubusercontent.com/yourusername/mymeds-brooklyn-care-1-1/main/deploy-vps.sh

# Make it executable
chmod +x deploy-vps.sh
```

### **Step 4: Update Configuration**
```bash
# Edit the deployment script to match your setup
nano deploy-vps.sh

# Update these variables:
REPO_URL="https://github.com/YOUR_USERNAME/mymeds-brooklyn-care-1-1.git"
DOMAIN="your-domain.com"
DB_PASSWORD="YourSecurePassword123"
```

### **Step 5: Run Automated Deployment**
```bash
# Run the deployment script
./deploy-vps.sh

# Or with SSL certificate setup
./deploy-vps.sh --ssl
```

---

## 🔧 **WHAT THE SCRIPT DOES AUTOMATICALLY**

### **✅ System Dependencies**
- Installs Node.js 18.x
- Installs MySQL 8.0
- Installs Nginx
- Installs PM2 (process manager)
- Installs Certbot (SSL certificates)

### **✅ Database Setup**
- Creates MySQL database: `mymeds_production`
- Creates database user: `mymeds_user`
- Sets up proper permissions
- Configures character encoding

### **✅ Project Setup**
- Clones your GitHub repository
- Installs all npm dependencies
- Sets up environment variables
- Configures production settings

### **✅ Database Schema**
- Generates Prisma client
- Creates all database tables
- Sets up relationships
- Initializes integration settings

### **✅ Frontend Build**
- Builds React app for production
- Optimizes assets
- Enables gzip compression
- Configures caching

### **✅ Server Configuration**
- Sets up Nginx reverse proxy
- Configures API routing
- Sets up file upload handling
- Configures security headers

### **✅ Process Management**
- Sets up PM2 for auto-restart
- Configures logging
- Sets up startup scripts
- Monitors application health

### **✅ SSL Certificate**
- Installs Let's Encrypt certificate
- Configures HTTPS
- Sets up automatic renewal

---

## 🌐 **POST-DEPLOYMENT VERIFICATION**

### **1. Check Application Status**
```bash
# Check PM2 status
pm2 status

# Check Nginx status
sudo systemctl status nginx

# Check MySQL status
sudo systemctl status mysql

# Check application logs
pm2 logs mymeds-backend
```

### **2. Test Your Application**
- Visit: `https://your-domain.com`
- Test admin login: `https://your-domain.com/admin`
- Test form submissions
- Verify file uploads work

### **3. Update Credentials**
```bash
# Edit environment file
nano /var/www/mymeds/backend/.env

# Update these important values:
ADMIN_PASSWORD=YourNewSecurePassword
JWT_SECRET=YourNewJWTSecret
EMAIL_PASSWORD=YourEmailAppPassword
```

---

## 📊 **DATABASE TABLES CREATED**

The deployment will automatically create these tables:

```sql
✅ User              -- User accounts and authentication
✅ RefillRequest     -- Prescription refill submissions
✅ TransferRequest   -- Prescription transfer submissions
✅ Appointment       -- Appointment booking submissions
✅ ContactForm       -- Contact form submissions
✅ Review            -- Customer reviews
✅ Cart              -- Shopping cart
✅ Order             -- Order management
✅ OrderItem         -- Order items
✅ WooCommerceSettings -- WooCommerce integration
✅ WordPressSettings -- WordPress integration
✅ SystemLog         -- System logging
✅ Session           -- User sessions
✅ FileUpload        -- File upload tracking
```

---

## 🔗 **API ENDPOINTS AVAILABLE**

All these endpoints will be automatically available:

### **Forms & Submissions**
- `POST /api/prescriptions/refill` - Prescription refill
- `POST /api/prescriptions/transfer` - Prescription transfer
- `POST /api/appointments/request` - Appointment booking
- `POST /api/contact` - Contact form

### **Authentication**
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout

### **Health & Status**
- `GET /api/health` - Health check
- `GET /api/status` - Server status

### **Admin Dashboard**
- `GET /api/prescriptions` - View prescriptions
- `GET /api/appointments` - View appointments
- `GET /api/contact` - View contact forms

---

## 🔒 **SECURITY FEATURES**

### **✅ Automatically Configured**
- Rate limiting (100 requests/15min)
- CORS protection
- SQL injection prevention
- XSS protection headers
- File upload security
- JWT authentication
- Password hashing

### **✅ SSL/HTTPS**
- Let's Encrypt certificate
- Automatic renewal
- HSTS headers
- Secure cookies

---

## 📈 **PERFORMANCE OPTIMIZATIONS**

### **✅ Frontend**
- Gzip compression
- Asset caching
- Code splitting
- Image optimization

### **✅ Backend**
- Database indexing
- Connection pooling
- Response caching
- Error handling

### **✅ Server**
- Nginx reverse proxy
- Static file serving
- Load balancing ready
- Monitoring setup

---

## 🛠️ **MANAGEMENT COMMANDS**

### **Application Management**
```bash
# Restart application
pm2 restart mymeds-backend

# View logs
pm2 logs mymeds-backend

# Monitor resources
pm2 monit

# Update application
cd /var/www/mymeds
git pull origin main
npm install
cd backend && npm install
pm2 restart mymeds-backend
```

### **Database Management**
```bash
# Access MySQL
mysql -u mymeds_user -p mymeds_production

# Backup database
mysqldump -u mymeds_user -p mymeds_production > backup.sql

# Restore database
mysql -u mymeds_user -p mymeds_production < backup.sql
```

### **Server Management**
```bash
# Restart Nginx
sudo systemctl restart nginx

# Check Nginx config
sudo nginx -t

# Renew SSL certificate
sudo certbot renew

# View server logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🚨 **TROUBLESHOOTING**

### **Common Issues**

#### **1. Application Not Starting**
```bash
# Check PM2 logs
pm2 logs mymeds-backend

# Check if port 4000 is available
netstat -tlnp | grep :4000

# Restart application
pm2 restart mymeds-backend
```

#### **2. Database Connection Issues**
```bash
# Check MySQL status
sudo systemctl status mysql

# Test database connection
mysql -u mymeds_user -p -e "SELECT 1;"

# Reset database
cd /var/www/mymeds/backend
npx prisma db push --accept-data-loss
```

#### **3. Nginx Issues**
```bash
# Check Nginx config
sudo nginx -t

# Check Nginx status
sudo systemctl status nginx

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
```

#### **4. SSL Certificate Issues**
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Test SSL
curl -I https://your-domain.com
```

---

## 📞 **SUPPORT**

### **✅ Everything Working**
- All forms will submit to database
- File uploads will work
- Email notifications will send
- Admin dashboard will function
- SSL certificates will be valid

### **🔧 If You Need Help**
1. Check the logs: `pm2 logs mymeds-backend`
2. Verify database connection
3. Test API endpoints: `curl https://your-domain.com/api/health`
4. Check Nginx configuration

---

## 🎉 **DEPLOYMENT COMPLETE!**

After running the deployment script, your MyMeds Pharmacy will be:

- ✅ **Live at**: `https://your-domain.com`
- ✅ **Admin Dashboard**: `https://your-domain.com/admin`
- ✅ **All Forms Working**: Submitting to MySQL database
- ✅ **File Uploads**: Working with security
- ✅ **SSL Certificate**: Valid and auto-renewing
- ✅ **Process Management**: Auto-restart on crashes
- ✅ **Monitoring**: Logs and health checks
- ✅ **Backup Ready**: Database backup scripts

**Your pharmacy is now ready for production!** 🚀
