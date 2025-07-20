import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

interface AuthRequest extends Request {
  user?: any;
}

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

function auth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token' });
  try {
    const token = header.split(' ')[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Public: refill prescription request (no auth required)
router.post('/refill', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, phone, email, prescriptionNumber, medication, pharmacy, notes } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !phone || !prescriptionNumber || !medication) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate file upload
    if (!req.file) {
      return res.status(400).json({ error: 'Prescription file is required' });
    }

    // Get or create default user for public requests
    let defaultUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!defaultUser) {
      defaultUser = await prisma.user.create({
        data: {
          email: 'admin@mymeds.com',
          password: 'hashedpassword',
          name: 'Admin User',
          role: 'ADMIN'
        }
      });
    }

    // Create prescription request with file information
    const prescription = await prisma.prescription.create({
      data: {
        userId: defaultUser.id,
        medication: `REFILL REQUEST: ${medication}`,
        dosage: `Patient: ${firstName} ${lastName}\nPhone: ${phone}\nEmail: ${email || 'Not provided'}\nPrescription #: ${prescriptionNumber}\nCurrent Pharmacy: ${pharmacy || 'Not specified'}\nNotes: ${notes || 'None'}\nFile: ${req.file.filename}`,
        instructions: 'PENDING_REFILL'
      }
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Refill request submitted successfully',
      prescriptionId: prescription.id,
      fileName: req.file.filename
    });
  } catch (err) {
    console.error('Error creating refill request:', err);
    res.status(500).json({ error: 'Failed to submit refill request' });
  }
});

// Public: transfer prescription request (no auth required)
router.post('/transfer', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, phone, email, prescriptionNumber, medication, currentPharmacy, notes } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !phone || !prescriptionNumber || !medication || !currentPharmacy) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate file upload
    if (!req.file) {
      return res.status(400).json({ error: 'Prescription file is required' });
    }

    // Get or create default user for public requests
    let defaultUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!defaultUser) {
      defaultUser = await prisma.user.create({
        data: {
          email: 'admin@mymeds.com',
          password: 'hashedpassword',
          name: 'Admin User',
          role: 'ADMIN'
        }
      });
    }

    // Create prescription request with file information
    const prescription = await prisma.prescription.create({
      data: {
        userId: defaultUser.id,
        medication: `TRANSFER REQUEST: ${medication}`,
        dosage: `Patient: ${firstName} ${lastName}\nPhone: ${phone}\nEmail: ${email || 'Not provided'}\nPrescription #: ${prescriptionNumber}\nCurrent Pharmacy: ${currentPharmacy}\nNotes: ${notes || 'None'}\nFile: ${req.file.filename}`,
        instructions: 'PENDING_TRANSFER'
      }
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Transfer request submitted successfully',
      prescriptionId: prescription.id,
      fileName: req.file.filename
    });
  } catch (err) {
    console.error('Error creating transfer request:', err);
    res.status(500).json({ error: 'Failed to submit transfer request' });
  }
});

// User: create prescription (authenticated users)
router.post('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { medication, dosage, instructions } = req.body;
    const prescription = await prisma.prescription.create({
      data: {
        userId: req.user.userId,
        medication,
        dosage,
        instructions
      }
    });
    res.status(201).json(prescription);
  } catch (err) {
    console.error('Error creating prescription:', err);
    res.status(500).json({ error: 'Failed to create prescription' });
  }
});

// User: get own prescriptions
router.get('/my', auth, async (req: AuthRequest, res: Response) => {
  try {
    const prescriptions = await prisma.prescription.findMany({ where: { userId: req.user.userId } });
    res.json(prescriptions);
  } catch (err) {
    console.error('Error fetching prescriptions:', err);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

// Admin: get all prescriptions
router.get('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    const prescriptions = await prisma.prescription.findMany();
    res.json(prescriptions);
  } catch (err) {
    console.error('Error fetching all prescriptions:', err);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

// Admin: delete prescription
router.delete('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    await prisma.prescription.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting prescription:', err);
    res.status(500).json({ error: 'Failed to delete prescription' });
  }
});

export default router; 