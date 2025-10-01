# Manual VPS Update - Admin Panel Fixes

## 🚀 **Manual Update Steps for MyMeds Pharmacy VPS**

### **Issues Fixed:**
1. ✅ Added missing appointment API endpoints (`/appointments/admin/all` and `/appointments/admin/stats`)
2. ✅ Fixed authentication middleware inconsistency (standardized to `secureAdminAuthMiddleware`)
3. ✅ Updated appointment routes to use consistent authentication

---

## **Step 1: Connect to VPS**

```bash
# Connect to your VPS
ssh root@your-vps-ip
# or
ssh username@your-vps-ip
```

---

## **Step 2: Navigate to Application Directory**

```bash
# Navigate to your MyMeds application directory
cd /var/www/mymeds-brooklyn-care-1-4
# or wherever your app is located
cd /var/www/mymeds
```

---

## **Step 3: Backup Current Version**

```bash
# Create backup of current backend
cp -r backend backend-backup-$(date +%Y%m%d_%H%M%S)

# Create backup of current frontend
cp -r dist dist-backup-$(date +%Y%m%d_%H%M%S)
```

---

## **Step 4: Update Backend Code**

### **4.1: Update Appointments Route File**

```bash
# Edit the appointments route file
nano backend/src/routes/appointments.ts
```

**Replace the entire file content with:**

```typescript
import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { secureAdminAuthMiddleware } from '../services/SecureAdminAuth';

interface AuthRequest extends Request {
  user?: any;
}

const router = Router();
const prisma = new PrismaClient();

// Email functionality temporarily disabled

// Public: create appointment request (no auth required)
router.post('/request', async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, phone, email, service, preferredDate, preferredTime, notes } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !phone || !email || !service || !preferredDate || !preferredTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get or create default user for public requests
    let defaultUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!defaultUser) {
      // Create admin user with proper hashed password
      const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      defaultUser = await prisma.user.create({
        data: {
          email: process.env.ADMIN_EMAIL || 'mymedspharmacy@outlook.com',
          password: hashedPassword,
          name: process.env.ADMIN_NAME || 'Admin User',
          role: 'ADMIN'
        }
      });
    }

    // Create appointment request
    const appointment = await prisma.appointment.create({
      data: {
        userId: defaultUser.id,
        patientName: `${firstName} ${lastName}`,
        email: email,
        phone: phone,
        date: new Date(preferredDate + ' ' + preferredTime),
        time: preferredTime,
        reason: `Service: ${service}\nNotes: ${notes || 'None'}`,
        status: 'PENDING'
      }
    });
    
    // Email notifications temporarily disabled

    res.status(201).json({ 
      success: true, 
      message: 'Appointment request submitted successfully',
      appointmentId: appointment.id 
    });
  } catch (err) {
    console.error('Error creating appointment request:', err);
    res.status(500).json({ error: 'Failed to create appointment request' });
  }
});

// User: create appointment (authenticated users)
router.post('/', secureAdminAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { date, reason, status } = req.body;
    const appointment = await prisma.appointment.create({
      data: {
        userId: req.user.userId,
        patientName: req.user.name || 'Admin User',
        email: req.user.email || 'mymedspharmacy@outlook.com',
        phone: '',
        date: new Date(date),
        time: new Date(date).toTimeString().split(' ')[0],
        reason,
        status
      }
    });
    res.status(201).json(appointment);
  } catch (err) {
    console.error('Error creating appointment:', err);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// User: get own appointments
router.get('/my', secureAdminAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const appointments = await prisma.appointment.findMany({ where: { userId: req.user.userId } });
    res.json(appointments);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Admin: get all appointments
router.get('/', secureAdminAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    let limit = parseInt(req.query.limit as string) || 20;
    if (limit > 100) limit = 100;
    const appointments = await prisma.appointment.findMany({ take: limit });
    res.json(appointments);
  } catch (err) {
    console.error('Error fetching all appointments:', err);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Admin: get all appointments (alternative endpoint for frontend compatibility)
router.get('/admin/all', secureAdminAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    let limit = parseInt(req.query.limit as string) || 20;
    if (limit > 100) limit = 100;
    const appointments = await prisma.appointment.findMany({ 
      take: limit,
      orderBy: { date: 'desc' }
    });
    res.json({ 
      success: true, 
      data: { appointments } 
    });
  } catch (err) {
    console.error('Error fetching all appointments:', err);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Admin: get appointment statistics
router.get('/admin/stats', secureAdminAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const [total, pending, confirmed, completed, cancelled] = await Promise.all([
      prisma.appointment.count(),
      prisma.appointment.count({ where: { status: 'PENDING' } }),
      prisma.appointment.count({ where: { status: 'CONFIRMED' } }),
      prisma.appointment.count({ where: { status: 'COMPLETED' } }),
      prisma.appointment.count({ where: { status: 'CANCELLED' } })
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await prisma.appointment.count({
      where: {
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    res.json({ 
      success: true, 
      data: {
        total,
        pending,
        confirmed,
        completed,
        cancelled,
        today: todayAppointments,
        availableSlots: 20 // This could be calculated based on schedule
      }
    });
  } catch (err) {
    console.error('Error fetching appointment stats:', err);
    res.status(500).json({ error: 'Failed to fetch appointment statistics' });
  }
});

// Admin: delete appointment
router.delete('/:id', secureAdminAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    await prisma.appointment.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting appointment:', err);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

export default router;
```

**Save the file:** `Ctrl + X`, then `Y`, then `Enter`

---

## **Step 5: Build and Deploy Backend**

### **5.1: Install Dependencies**

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm ci --production
```

### **5.2: Build Backend**

```bash
# Build the backend
npm run build
```

### **5.3: Generate Prisma Client**

```bash
# Generate Prisma client
npx prisma generate
```

---

## **Step 6: Restart Services**

### **6.1: Stop Current PM2 Processes**

```bash
# Stop PM2 processes
pm2 stop mymeds-backend
pm2 delete mymeds-backend
```

### **6.2: Start Updated Backend**

```bash
# Start the updated backend
pm2 start ecosystem.config.js
pm2 save
```

### **6.3: Check PM2 Status**

```bash
# Check PM2 status
pm2 status
pm2 logs mymeds-backend --lines 20
```

---

## **Step 7: Test the Fixes**

### **7.1: Test Appointment Endpoints**

```bash
# Test the new appointment endpoints (replace with your actual admin token)
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     http://localhost:4000/api/appointments/admin/all

curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     http://localhost:4000/api/appointments/admin/stats
```

### **7.2: Test Refill Requests**

```bash
# Test refill requests endpoint
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     http://localhost:4000/api/refill-requests
```

### **7.3: Test Transfer Requests**

```bash
# Test transfer requests endpoint
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     http://localhost:4000/api/transfer-requests
```

---

## **Step 8: Verify Frontend**

### **8.1: Check Frontend Build**

```bash
# Navigate back to root directory
cd ..

# Build frontend if needed
npm run build
```

### **8.2: Restart Frontend (if using PM2)**

```bash
# Restart frontend
pm2 restart mymeds-frontend
```

---

## **Step 9: Test Admin Panel**

1. **Access Admin Panel**: Go to `https://your-domain.com/admin`
2. **Login**: Use your admin credentials
3. **Check Appointments Tab**: Should now load appointment data
4. **Check Refills Tab**: Should load refill request data
5. **Check Transfers Tab**: Should load transfer request data

---

## **Step 10: Monitor Logs**

### **10.1: Check Backend Logs**

```bash
# Check PM2 logs
pm2 logs mymeds-backend --lines 50

# Check application logs
tail -f logs/backend-combined.log
```

### **10.2: Check Nginx Logs**

```bash
# Check Nginx error logs
tail -f /var/log/nginx/error.log

# Check Nginx access logs
tail -f /var/log/nginx/access.log
```

---

## **Step 11: Rollback (if needed)**

If something goes wrong, you can rollback:

```bash
# Stop current processes
pm2 stop mymeds-backend
pm2 delete mymeds-backend

# Restore backup
rm -rf backend
mv backend-backup-* backend

# Restart with backup
pm2 start ecosystem.config.js
```

---

## **✅ Verification Checklist**

- [ ] Backend builds successfully
- [ ] PM2 processes are running
- [ ] Appointment endpoints respond correctly
- [ ] Refill request endpoints respond correctly
- [ ] Transfer request endpoints respond correctly
- [ ] Admin panel loads appointment data
- [ ] Admin panel loads refill request data
- [ ] Admin panel loads transfer request data
- [ ] No errors in logs
- [ ] Frontend is accessible

---

## **🚨 Troubleshooting**

### **Common Issues:**

1. **Build Errors**: Check Node.js version and dependencies
2. **PM2 Issues**: Check ecosystem.config.js configuration
3. **Database Errors**: Verify Prisma schema and database connection
4. **Authentication Errors**: Check JWT secret and admin credentials
5. **Nginx Errors**: Check configuration and restart nginx

### **Useful Commands:**

```bash
# Check system status
systemctl status nginx
systemctl status mysql

# Check PM2 status
pm2 status
pm2 logs

# Check disk space
df -h

# Check memory usage
free -h

# Check running processes
ps aux | grep node
```

---

## **📞 Support**

If you encounter issues:

1. Check the logs first
2. Verify all services are running
3. Test endpoints individually
4. Check database connectivity
5. Verify environment variables

---

**🎉 Update Complete!**

Your VPS should now have the fixed admin panel that properly fetches and displays:
- ✅ Appointment management data
- ✅ Transfer request data  
- ✅ Refill request data







