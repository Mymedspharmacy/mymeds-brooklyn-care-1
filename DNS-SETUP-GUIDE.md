# 🌐 DNS Setup Guide - MyMeds Pharmacy Inc.

## 🎯 **Domain Configuration: mymedspharmacyinc.com**

**VPS IP**: `72.60.116.253`

---

## 📋 **DNS Records to Configure**

### **1. A Records (Required)**
```
Type: A
Name: @
Value: 72.60.116.253
TTL: 3600

Type: A
Name: www
Value: 72.60.116.253
TTL: 3600
```

### **2. CNAME Records (Optional)**
```
Type: CNAME
Name: blog
Value: mymedspharmacyinc.com
TTL: 3600

Type: CNAME
Name: shop
Value: mymedspharmacyinc.com
TTL: 3600

Type: CNAME
Name: admin
Value: mymedspharmacyinc.com
TTL: 3600
```

---

## 🔧 **DNS Provider Instructions**

### **GoDaddy:**
1. Log into your GoDaddy account
2. Go to "My Products" → "DNS"
3. Find `mymedspharmacyinc.com`
4. Click "Manage DNS"
5. Add the A records above

### **Namecheap:**
1. Log into your Namecheap account
2. Go to "Domain List"
3. Click "Manage" next to `mymedspharmacyinc.com`
4. Go to "Advanced DNS"
5. Add the A records above

### **Cloudflare:**
1. Log into your Cloudflare account
2. Select `mymedspharmacyinc.com`
3. Go to "DNS" → "Records"
4. Add the A records above
5. Set "Proxy status" to "Proxied" (orange cloud)

---

## ⏱️ **DNS Propagation Time**

- **Typical**: 1-24 hours
- **Cloudflare**: 1-5 minutes
- **GoDaddy**: 1-6 hours
- **Namecheap**: 1-12 hours

---

## 🔍 **DNS Verification**

### **Check DNS Propagation:**
```bash
# Check A record
nslookup mymedspharmacyinc.com
nslookup www.mymedspharmacyinc.com

# Check from different locations
dig mymedspharmacyinc.com @8.8.8.8
dig www.mymedspharmacyinc.com @8.8.8.8
```

### **Online Tools:**
- https://dnschecker.org
- https://whatsmydns.net
- https://dns.google

---

## 🚀 **After DNS Setup**

### **1. SSL Certificate Setup:**
```bash
# Install Certbot
apt install certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d mymedspharmacyinc.com -d www.mymedspharmacyinc.com
```

### **2. Update Nginx Configuration:**
The Nginx configuration is already set up for your domain in `deployment/nginx/nginx-full-stack.conf`

### **3. Test All URLs:**
- **Main Site**: `https://mymedspharmacyinc.com`
- **Admin Panel**: `https://mymedspharmacyinc.com/admin`
- **WordPress Admin**: `https://mymedspharmacyinc.com/wp-admin`
- **Shop**: `https://mymedspharmacyinc.com/shop`
- **Blog**: `https://mymedspharmacyinc.com/blog`

---

## 🎯 **Final URLs After Setup**

### **Production URLs:**
- **Main Site**: `https://mymedspharmacyinc.com`
- **Admin Panel**: `https://mymedspharmacyinc.com/admin`
- **WordPress Admin**: `https://mymedspharmacyinc.com/wp-admin`
- **WooCommerce Shop**: `https://mymedspharmacyinc.com/shop`
- **Blog**: `https://mymedspharmacyinc.com/blog`
- **API**: `https://mymedspharmacyinc.com/api`

### **Development URLs (Before DNS):**
- **MyMeds Frontend**: `http://72.60.116.253:3000`
- **MyMeds Backend**: `http://72.60.116.253:4000`
- **WordPress Admin**: `http://72.60.116.253:8080/wp-admin`
- **WooCommerce Shop**: `http://72.60.116.253:8080/shop`
- **Blog**: `http://72.60.116.253:8080/blog`

---

## ✅ **DNS Setup Checklist**

- [ ] A record for `@` pointing to `72.60.116.253`
- [ ] A record for `www` pointing to `72.60.116.253`
- [ ] Wait for DNS propagation (1-24 hours)
- [ ] Verify DNS resolution
- [ ] Set up SSL certificate
- [ ] Test all URLs
- [ ] Update any hardcoded URLs in the application

---

## 🎉 **Success!**

After DNS setup and SSL configuration, your complete MyMeds Pharmacy ecosystem will be accessible at:

**🌐 https://mymedspharmacyinc.com**

With all features working:
- ✅ **MyMeds Application** - Complete pharmacy management
- ✅ **WordPress Blog** - Content management system
- ✅ **WooCommerce Shop** - E-commerce functionality
- ✅ **Complete Integration** - All systems working together
- ✅ **SSL Security** - HTTPS encryption
- ✅ **Production Ready** - Real-world functionality
