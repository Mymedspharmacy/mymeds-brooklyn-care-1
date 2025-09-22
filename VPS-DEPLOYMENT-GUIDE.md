# 🚀 MyMeds Pharmacy Inc. - VPS Deployment Guide

## 🎯 **Optimized for Your VPS Specifications**

**VPS Details:**
- **IP Address**: `72.60.116.253`
- **OS**: Ubuntu 24.04 LTS ✅
- **CPU**: 1 core ⚠️ (Optimized)
- **RAM**: 4 GB ⚠️ (Optimized)
- **Storage**: 50 GB ✅
- **Location**: United States - Boston ✅

---

## ⚠️ **Important: Resource Optimization**

Your VPS has **1 CPU core and 4GB RAM**, which is the minimum for our full stack. I've created an **optimized configuration** that:

### **✅ Memory Optimization:**
- **MySQL**: Limited to 1GB RAM
- **WordPress**: Limited to 1GB RAM
- **MyMeds App**: Limited to 1.5GB RAM
- **Redis**: Limited to 256MB RAM
- **Nginx**: Limited to 128MB RAM
- **Total**: ~3.8GB RAM usage (within 4GB limit)

### **✅ CPU Optimization:**
- **Disabled clustering** (single CPU)
- **Optimized database connections** (50 max)
- **Reduced worker processes**
- **Efficient caching** with Redis

### **✅ Staged Deployment:**
- **Stage 1**: MySQL database
- **Stage 2**: Redis cache
- **Stage 3**: WordPress
- **Stage 4**: MyMeds application
- **Stage 5**: Nginx reverse proxy

---

## 🚀 **Deployment Instructions**

### **1. Connect to Your VPS**
```bash
ssh root@72.60.116.253
```

### **2. Clone Repository**
```bash
git clone https://github.com/your-username/mymeds-brooklyn-care.git
cd mymeds-brooklyn-care
```

### **3. Run Optimized Deployment**
```bash
# Make script executable
chmod +x deployment/scripts/deploy-optimized.sh

# Run optimized deployment
./deployment/scripts/deploy-optimized.sh
```

### **4. What Gets Installed:**
- ✅ **MySQL Database** (1GB RAM limit)
- ✅ **WordPress** (1GB RAM limit)
- ✅ **WooCommerce** plugin
- ✅ **MyMeds Application** (1.5GB RAM limit)
- ✅ **Redis Cache** (256MB RAM limit)
- ✅ **Nginx Reverse Proxy** (128MB RAM limit)

---

## 🌐 **Access URLs**

### **Direct IP Access:**
- **MyMeds Frontend**: `http://72.60.116.253:3000`
- **MyMeds Backend**: `http://72.60.116.253:4000`
- **WordPress Admin**: `http://72.60.116.253:8080/wp-admin`
- **WooCommerce Shop**: `http://72.60.116.253:8080/shop`
- **Blog**: `http://72.60.116.253:8080/blog`

### **With Domain (After DNS Setup):**
- **Main Site**: `https://your-domain.com`
- **Admin Panel**: `https://your-domain.com/admin`
- **WordPress Admin**: `https://your-domain.com/wp-admin`
- **Shop**: `https://your-domain.com/shop`
- **Blog**: `https://your-domain.com/blog`

---

## 🔧 **VPS Configuration**

### **Firewall Setup:**
```bash
# Allow required ports
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw allow 3000  # MyMeds Frontend
ufw allow 4000  # MyMeds Backend
ufw allow 8080  # WordPress
ufw allow 3306  # MySQL (if external access needed)
ufw allow 6379  # Redis (if external access needed)

# Enable firewall
ufw enable
```

### **SSL Certificate Setup:**
```bash
# Install Certbot
apt install certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## 📊 **Monitoring Commands**

### **Check Resource Usage:**
```bash
# View container stats
docker stats

# View running containers
docker-compose -f docker-compose.optimized.yml ps

# Check logs
docker-compose -f docker-compose.optimized.yml logs -f
```

### **Health Checks:**
```bash
# MyMeds Backend
curl http://72.60.116.253:4000/api/health

# WordPress
curl http://72.60.116.253:8080

# MySQL
docker-compose -f docker-compose.optimized.yml exec mysql mysql -u root -p -e "SELECT 1;"

# Redis
docker-compose -f docker-compose.optimized.yml exec redis redis-cli ping
```

---

## ⚠️ **Performance Considerations**

### **Memory Usage:**
- **Current**: ~3.8GB RAM usage
- **Available**: ~200MB free RAM
- **Recommendation**: Monitor memory usage regularly

### **CPU Usage:**
- **Single Core**: All services share 1 CPU core
- **Performance**: May be slower under heavy load
- **Recommendation**: Consider upgrading to 2+ CPU cores

### **Storage Usage:**
- **Available**: 50GB SSD
- **Estimated Usage**: ~20GB for all services
- **Available**: ~30GB for data and backups

---

## 🛠️ **Troubleshooting**

### **Memory Issues:**
```bash
# Check memory usage
free -h
docker stats

# Restart services if needed
docker-compose -f docker-compose.optimized.yml restart
```

### **Performance Issues:**
```bash
# Check CPU usage
htop

# Check disk usage
df -h

# Check running processes
docker-compose -f docker-compose.optimized.yml ps
```

### **Service Issues:**
```bash
# Check specific service logs
docker-compose -f docker-compose.optimized.yml logs mymeds-app
docker-compose -f docker-compose.optimized.yml logs wordpress
docker-compose -f docker-compose.optimized.yml logs mysql
```

---

## 🎯 **Post-Deployment Setup**

### **1. WordPress Initial Setup:**
1. Access `http://72.60.116.253:8080/wp-admin`
2. Complete WordPress installation
3. Install WooCommerce plugin
4. Configure WooCommerce settings

### **2. MyMeds Integration:**
1. Access admin panel: `http://72.60.116.253:3000/admin`
2. Configure WordPress integration
3. Configure WooCommerce integration
4. Test all features

### **3. Domain Setup:**
1. Point your domain DNS to `72.60.116.253`
2. Set up SSL certificates
3. Configure Nginx for your domain

---

## 🚨 **Important Notes**

### **⚠️ Resource Limitations:**
- **Memory**: Close to 4GB limit
- **CPU**: Single core may cause bottlenecks
- **Storage**: 50GB should be sufficient

### **✅ Optimizations Applied:**
- **Memory limits** on all containers
- **Staged deployment** to prevent memory issues
- **Redis caching** for performance
- **Database optimization** for low memory
- **Single CPU optimization**

### **🎯 Recommendations:**
1. **Monitor memory usage** regularly
2. **Consider upgrading** to 8GB RAM for better performance
3. **Set up monitoring** and alerts
4. **Regular backups** of database and files
5. **SSL certificates** for production use

---

## 🎉 **Success!**

After successful deployment, you'll have:
- ✅ **Complete MyMeds pharmacy management system**
- ✅ **WordPress blog with full content management**
- ✅ **WooCommerce shop with e-commerce functionality**
- ✅ **Optimized for your VPS specifications**
- ✅ **Production-ready security and performance**

**🚀 Your complete pharmacy ecosystem is now live and optimized for your VPS!**
