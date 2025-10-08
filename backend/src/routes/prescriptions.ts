import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';
import { authenticateAdmin } from '../middleware/auth';

import { AuthRequest } from '../types/express';

const router = Router();
const prisma = new PrismaClient();

// Email transporter setup
const emailRecipient = process.env.CONTACT_RECEIVER || process.env.EMAIL_USER;
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.office365.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

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

// Public: refill prescription request (no auth required)
router.post('/refill', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, phone, email, prescriptionNumber, medication, pharmacy, notes } = req.body;
    
    // Validate required fields (only firstName, lastName, and phone are required)
    if (!firstName || !lastName || !phone) {
      return res.status(400).json({ error: 'Missing required fields: First name, last name, and phone are required' });
    }

    // File upload is now optional
    // Prescription number and medication are now optional

    // Get or create default user for public requests
    let defaultUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!defaultUser) {
      // Create admin user with proper hashed password
      const adminPassword = process.env.ADMIN_PASSWORD;
      if (!adminPassword) {
        throw new Error('ADMIN_PASSWORD environment variable is required');
      }
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      defaultUser = await prisma.user.create({
        data: {
          email: process.env.ADMIN_EMAIL,
          password: hashedPassword,
          name: process.env.ADMIN_NAME || 'Admin User',
          role: 'ADMIN'
        }
      });
    }

    // Create prescription request with optional file and medication information
    const prescription = await prisma.prescription.create({
      data: {
        userId: defaultUser.id,
        patientName: `${firstName} ${lastName}`,
        medication: `REFILL REQUEST: ${medication || 'Not specified'}`,
        dosage: `Patient: ${firstName} ${lastName}\nPhone: ${phone}\nEmail: ${email || 'Not provided'}\nPrescription #: ${prescriptionNumber || 'Not provided'}\nCurrent Pharmacy: ${pharmacy || 'Not specified'}\nNotes: ${notes || 'None'}\nFile: ${req.file ? req.file.filename : 'Not uploaded'}`,
        instructions: 'PENDING_REFILL'
      }
    });

    // Also create a proper RefillRequest record for admin panel
    const refillRequest = await prisma.refillRequest.create({
      data: {
        patientName: `${firstName} ${lastName}`,
        email: email || 'noemail@pharmacy.com',
        phone: phone,
        medication: medication || 'Not specified',
        dosage: `Prescription #: ${prescriptionNumber || 'Not provided'}\nCurrent Pharmacy: ${pharmacy || 'Not specified'}`,
        quantity: 30, // Default quantity
        urgency: 'normal',
        notes: `Patient: ${firstName} ${lastName}\nPhone: ${phone}\nEmail: ${email || 'Not provided'}\nPrescription File: ${req.file ? req.file.filename : 'Not uploaded'}\nAdditional Notes: ${notes || 'None'}`,
        status: 'pending',
        requestedDate: new Date(),
        notified: false
      } as any
    });
    
    // Send notification email
    try {
      if (emailRecipient) {
        await emailTransporter.sendMail({
          from: process.env.EMAIL_USER,
          to: emailRecipient,
          subject: `New Prescription Refill Request from ${firstName} ${lastName}`,
          text: `Patient: ${firstName} ${lastName}\nPhone: ${phone}\nEmail: ${email || 'Not provided'}\nPrescription #: ${prescriptionNumber || 'Not provided'}\nMedication: ${medication || 'Not specified'}\nCurrent Pharmacy: ${pharmacy || 'Not specified'}\nNotes: ${notes || 'None'}\nFile: ${req.file ? req.file.filename : 'Not uploaded'}`
        });
      }
    } catch (emailError) {
      console.error('Failed to send refill notification email:', emailError);
    }

    res.status(201).json({ 
      success: true, 
      message: 'Refill request submitted successfully',
      prescriptionId: prescription.id,
      refillRequestId: refillRequest.id,
      fileName: req.file ? req.file.filename : null
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
    
    // Validate required fields (only firstName, lastName, and phone are required)
    if (!firstName || !lastName || !phone) {
      return res.status(400).json({ error: 'Missing required fields: First name, last name, and phone are required' });
    }

    // File upload is now optional
    // Prescription number and medication are now optional

    // Get or create default user for public requests
    let defaultUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!defaultUser) {
      // Create admin user with proper hashed password
      const adminPassword = process.env.ADMIN_PASSWORD;
      if (!adminPassword) {
        throw new Error('ADMIN_PASSWORD environment variable is required');
      }
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      defaultUser = await prisma.user.create({
        data: {
          email: process.env.ADMIN_EMAIL,
          password: hashedPassword,
          name: process.env.ADMIN_NAME || 'Admin User',
          role: 'ADMIN'
        }
      });
    }

    // Create prescription request with optional file and medication information
    const prescription = await prisma.prescription.create({
      data: {
        userId: defaultUser.id,
        patientName: `${firstName} ${lastName}`,
        medication: `TRANSFER REQUEST: ${medication || 'Not specified'}`,
        dosage: `Patient: ${firstName} ${lastName}\nPhone: ${phone}\nEmail: ${email || 'Not provided'}\nPrescription #: ${prescriptionNumber || 'Not provided'}\nCurrent Pharmacy: ${currentPharmacy || 'Not provided'}\nNotes: ${notes || 'None'}\nFile: ${req.file ? req.file.filename : 'Not uploaded'}`,
        instructions: 'PENDING_TRANSFER'
      }
    });

    // Also create a proper TransferRequest record for admin panel
    const transferRequest = await prisma.transferRequest.create({
      data: {
        patientName: `${firstName} ${lastName}`,
        email: email || 'noemail@pharmacy.com',
        phone: phone,
        fromPharmacy: currentPharmacy || 'Not specified',
        toPharmacy: 'MyMeds Pharmacy',
        currentPharmacy: currentPharmacy || 'Not specified',
        medication: medication || 'Not specified',
        medications: medication || 'Not specified', // Store as string for now
        dosage: `Prescription #: ${prescriptionNumber || 'Not provided'}`,
        quantity: 30, // Default quantity
        notes: `Patient: ${firstName} ${lastName}\nPhone: ${phone}\nEmail: ${email || 'Not provided'}\nPrescription File: ${req.file ? req.file.filename : 'Not uploaded'}\nAdditional Notes: ${notes || 'None'}`,
        status: 'pending',
        requestedDate: new Date(),
        notified: false
      } as any
    });
    
    // Send notification email
    try {
      if (emailRecipient) {
        await emailTransporter.sendMail({
          from: process.env.EMAIL_USER,
          to: emailRecipient,
          subject: `New Prescription Transfer Request from ${firstName} ${lastName}`,
          text: `Patient: ${firstName} ${lastName}\nPhone: ${phone}\nEmail: ${email || 'Not provided'}\nPrescription #: ${prescriptionNumber || 'Not provided'}\nMedication: ${medication || 'Not specified'}\nCurrent Pharmacy: ${currentPharmacy || 'Not provided'}\nNotes: ${notes || 'None'}\nFile: ${req.file ? req.file.filename : 'Not uploaded'}`
        });
      }
    } catch (emailError) {
      console.error('Failed to send transfer notification email:', emailError);
    }

    res.status(201).json({ 
      success: true, 
      message: 'Transfer request submitted successfully',
      prescriptionId: prescription.id,
      transferRequestId: transferRequest.id,
      fileName: req.file ? req.file.filename : null
    });
  } catch (err) {
    console.error('Error creating transfer request:', err);
    res.status(500).json({ error: 'Failed to submit transfer request' });
  }
});

// User: create prescription (authenticated users)
router.post('/', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { medication, dosage, instructions } = req.body;
    const prescription = await prisma.prescription.create({
      data: {
        userId: parseInt(req.user.userId),
        patientName: req.user.name || 'Unknown Patient',
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
router.get('/my', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const prescriptions = await prisma.prescription.findMany({ where: { userId: parseInt(req.user.userId) } });
    res.json(prescriptions);
  } catch (err) {
    console.error('Error fetching prescriptions:', err);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

// Admin: get all prescriptions
router.get('/', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    let limit = parseInt(req.query.limit as string) || 20;
    if (limit > 100) limit = 100;
    const prescriptions = await prisma.prescription.findMany({ take: limit });
    res.json(prescriptions);
  } catch (err) {
    console.error('Error fetching all prescriptions:', err);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

// Admin: delete prescription
router.delete('/:id', authenticateAdmin, async (req: AuthRequest, res: Response) => {
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