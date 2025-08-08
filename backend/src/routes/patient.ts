import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import multer from 'multer';
import { unifiedAdminAuth } from './auth';

interface AuthRequest extends Request {
  user?: any;
}

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET environment variable is not set!');
  console.error('Please set a strong JWT_SECRET in your environment variables.');
  process.exit(1);
}

// TypeScript assertion - we know JWT_SECRET is defined after the check above
const JWT_SECRET_ASSERTED = JWT_SECRET as string;

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

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/patient-documents/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and PDF files are allowed'));
    }
  }
});

function auth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token provided' });
  try {
    const token = header.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET_ASSERTED);
    if (typeof payload === 'object' && 'userId' in payload) {
      req.user = payload;
      next();
    } else {
      res.status(401).json({ error: 'Invalid token' });
    }
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// POST /api/patient/register - Create new patient account with strict verification
router.post('/register', upload.fields([
  { name: 'governmentIdFile', maxCount: 1 },
  { name: 'proofOfAddressFile', maxCount: 1 },
  { name: 'insuranceCardFile', maxCount: 1 }
]), async (req: Request, res: Response) => {
  try {
    const {
      firstName, lastName, dateOfBirth, email, phone, ssn,
      address, city, state, zipCode,
      emergencyContactName, emergencyContactPhone, emergencyContactRelationship,
      insuranceProvider, insuranceGroupNumber, insuranceMemberId,
      primaryCarePhysician, physicianPhone, allergies, currentMedications, medicalConditions,
      governmentIdType, governmentIdNumber,
      termsAccepted, privacyPolicyAccepted, hipaaConsent, medicalAuthorization, financialResponsibility,
      password, securityQuestions
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !dateOfBirth || !email || !phone || !ssn) {
      return res.status(400).json({ error: 'All personal information fields are required' });
    }

    if (!address || !city || !state || !zipCode) {
      return res.status(400).json({ error: 'All address fields are required' });
    }

    if (!emergencyContactName || !emergencyContactPhone) {
      return res.status(400).json({ error: 'Emergency contact information is required' });
    }

    if (!insuranceProvider || !insuranceGroupNumber || !insuranceMemberId) {
      return res.status(400).json({ error: 'All insurance information fields are required' });
    }

    if (!primaryCarePhysician || !physicianPhone) {
      return res.status(400).json({ error: 'Primary care physician information is required' });
    }

    if (!governmentIdType || !governmentIdNumber) {
      return res.status(400).json({ error: 'Government ID information is required' });
    }

    if (!termsAccepted || !privacyPolicyAccepted || !hipaaConsent || !medicalAuthorization || !financialResponsibility) {
      return res.status(400).json({ error: 'All legal agreements must be accepted' });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Validate file uploads
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (!files.governmentIdFile || !files.proofOfAddressFile) {
      return res.status(400).json({ error: 'Government ID and proof of address documents are required' });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    // Validate SSN format (basic validation)
    const ssnRegex = /^\d{3}-?\d{2}-?\d{4}$/;
    if (!ssnRegex.test(ssn)) {
      return res.status(400).json({ error: 'Invalid SSN format' });
    }

    // Validate phone number format
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Validate ZIP code format
    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (!zipRegex.test(zipCode)) {
      return res.status(400).json({ error: 'Invalid ZIP code format' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Parse security questions
    const parsedSecurityQuestions = typeof securityQuestions === 'string' 
      ? JSON.parse(securityQuestions) 
      : securityQuestions;

    // Create patient account with pending verification status
    const patient = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: `${firstName} ${lastName}`,
        role: 'CUSTOMER',
        // Store additional patient information in a separate table or as JSON
        // For now, we'll create a patient profile record
      }
    });

    // Create patient profile with verification status
    const patientProfile = await prisma.patientProfile.create({
      data: {
        userId: patient.id,
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        phone,
        ssn: ssn.replace(/-/g, ''), // Store SSN without dashes
        address,
        city,
        state,
        zipCode,
        emergencyContactName,
        emergencyContactPhone,
        emergencyContactRelationship,
        insuranceProvider,
        insuranceGroupNumber,
        insuranceMemberId,
        primaryCarePhysician,
        physicianPhone,
        allergies: allergies || 'None',
        currentMedications: currentMedications || 'None',
        medicalConditions: medicalConditions || 'None',
        governmentIdType,
        governmentIdNumber,
        governmentIdFile: files.governmentIdFile[0].filename,
        proofOfAddressFile: files.proofOfAddressFile[0].filename,
        insuranceCardFile: files.insuranceCardFile?.[0]?.filename || null,
        verificationStatus: 'PENDING',
        identityVerified: false,
        addressVerified: false,
        insuranceVerified: false,
        termsAccepted: true,
        privacyPolicyAccepted: true,
        hipaaConsent: true,
        medicalAuthorization: true,
        financialResponsibility: true,
        securityQuestions: JSON.stringify(parsedSecurityQuestions),
        createdAt: new Date()
      }
    });

    // Create notification for admin verification
    await prisma.notification.create({
      data: {
        type: 'patient_verification',
        title: 'New Patient Account Requires Verification',
        message: `Patient ${firstName} ${lastName} (${email}) has submitted account creation request`,
        data: JSON.stringify({ 
          patientId: patient.id, 
          profileId: patientProfile.id,
          documents: {
            governmentId: files.governmentIdFile[0].filename,
            proofOfAddress: files.proofOfAddressFile[0].filename,
            insuranceCard: files.insuranceCardFile?.[0]?.filename || null
          }
        })
      }
    });

    // Send verification email to patient
    try {
      await emailTransporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Patient Account Creation - Verification Required',
        html: `
          <h2>Welcome to My Meds Pharmacy!</h2>
          <p>Dear ${firstName} ${lastName},</p>
          <p>Thank you for creating your patient account. Your application has been received and is currently under review.</p>
          <p><strong>What happens next:</strong></p>
          <ul>
            <li>Our verification team will review your submitted documents</li>
            <li>We will verify your identity and address information</li>
            <li>We will contact your insurance provider to verify coverage</li>
            <li>You will receive an email notification once verification is complete</li>
          </ul>
          <p><strong>Verification typically takes 24-48 hours.</strong></p>
          <p>If you have any questions, please contact us at (347) 312-6458.</p>
          <p>Best regards,<br>My Meds Pharmacy Team</p>
        `
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    // Send notification email to admin
    try {
      if (emailRecipient) {
        await emailTransporter.sendMail({
          from: process.env.EMAIL_USER,
          to: emailRecipient,
          subject: 'New Patient Account Requires Verification',
          html: `
            <h2>New Patient Account Verification Required</h2>
            <p><strong>Patient:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Documents Submitted:</strong></p>
            <ul>
              <li>Government ID: ${files.governmentIdFile[0].filename}</li>
              <li>Proof of Address: ${files.proofOfAddressFile[0].filename}</li>
              ${files.insuranceCardFile?.[0] ? `<li>Insurance Card: ${files.insuranceCardFile[0].filename}</li>` : ''}
            </ul>
            <p>Please review the submitted documents and verify the patient's information.</p>
          `
        });
      }
    } catch (adminEmailError) {
      console.error('Failed to send admin notification email:', adminEmailError);
    }

    res.status(201).json({
      success: true,
      message: 'Patient account created successfully. Verification is pending.',
      patientId: patient.id,
      verificationStatus: 'PENDING'
    });

  } catch (err) {
    console.error('Error creating patient account:', err);
    res.status(500).json({ error: 'Failed to create patient account' });
  }
});

// GET /api/patient/profile - Get patient profile
router.get('/profile', auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    console.error('Error fetching patient profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/patient/profile - Update patient profile
router.put('/profile', auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const { name, email } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || undefined,
        email: email || undefined
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    res.json({ user: updatedUser, message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Error updating patient profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/patient/prescriptions - Get patient's prescriptions
router.get('/prescriptions', auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    
    const prescriptions = await prisma.prescription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    // Transform data to match frontend expectations
    const transformedPrescriptions = prescriptions.map(prescription => ({
      id: prescription.id.toString(),
      medication: prescription.medication,
      dosage: prescription.dosage,
      frequency: prescription.instructions,
      refills: 0, // This would need to be calculated based on business logic
      status: prescription.notified ? 'refill-needed' : 'active',
      lastFilled: prescription.createdAt.toISOString().split('T')[0],
      nextRefill: new Date(prescription.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      prescriber: 'Dr. Prescriber' // This would come from a separate prescriber table
    }));

    res.json({ prescriptions: transformedPrescriptions });
  } catch (err) {
    console.error('Error fetching patient prescriptions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/patient/appointments - Get patient's appointments
router.get('/appointments', auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    
    const appointments = await prisma.appointment.findMany({
      where: { userId },
      orderBy: { date: 'asc' }
    });

    // Transform data to match frontend expectations
    const transformedAppointments = appointments.map(appointment => ({
      id: appointment.id.toString(),
      type: appointment.reason.split('\n')[0].replace('Service: ', ''),
      date: appointment.date.toISOString().split('T')[0],
      time: appointment.date.toTimeString().split(' ')[0].substring(0, 5),
      status: appointment.status.toLowerCase(),
      provider: 'Dr. Provider', // This would come from a separate provider table
      notes: appointment.reason.includes('Notes:') ? appointment.reason.split('Notes:')[1] : undefined
    }));

    res.json({ appointments: transformedAppointments });
  } catch (err) {
    console.error('Error fetching patient appointments:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/patient/health-records - Get patient's health records (simulated)
router.get('/health-records', auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    
    // For now, return simulated health records
    // In a real implementation, this would query a health records table
    const healthRecords = [
      {
        id: '1',
        type: 'Blood Pressure',
        date: '2024-01-20',
        provider: 'Dr. Williams',
        result: '120/80 mmHg',
        status: 'normal'
      },
      {
        id: '2',
        type: 'Blood Glucose',
        date: '2024-01-20',
        provider: 'Dr. Williams',
        result: '95 mg/dL',
        status: 'normal'
      }
    ];

    res.json({ healthRecords });
  } catch (err) {
    console.error('Error fetching patient health records:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/patient/messages - Get patient's messages
router.get('/messages', auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    
    // For now, return empty messages array
    // In a real implementation, this would query a messages table
    const messages: any[] = [];

    res.json({ messages });
  } catch (err) {
    console.error('Error fetching patient messages:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/patient/messages - Send a message to pharmacy team
router.post('/messages', auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required' });
    }

    // Get user info for the email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Send email to pharmacy team
    try {
      if (emailRecipient) {
        await emailTransporter.sendMail({
          from: process.env.EMAIL_USER,
          to: emailRecipient,
          subject: `Patient Message: ${subject}`,
          text: `From: ${user.name} (${user.email})\nSubject: ${subject}\n\nMessage:\n${message}`
        });
      }
    } catch (emailError) {
      console.error('Failed to send message email:', emailError);
    }

    // Create notification for admin
    await prisma.notification.create({
      data: {
        type: 'message',
        title: `New Message from ${user.name}`,
        message: subject,
        data: JSON.stringify({ userId, subject, message })
      }
    });

    res.json({ 
      success: true, 
      message: 'Message sent successfully' 
    });
  } catch (err) {
    console.error('Error sending patient message:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/patient/refill-requests - Get patient's refill requests
router.get('/refill-requests', auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    
    const refillRequests = await prisma.refillRequest.findMany({
      where: { userId },
      orderBy: { requestedDate: 'desc' }
    });

    res.json({ refillRequests });
  } catch (err) {
    console.error('Error fetching patient refill requests:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/patient/transfer-requests - Get patient's transfer requests
router.get('/transfer-requests', auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    
    const transferRequests = await prisma.transferRequest.findMany({
      where: { userId },
      orderBy: { requestedDate: 'desc' }
    });

    res.json({ transferRequests });
  } catch (err) {
    console.error('Error fetching patient transfer requests:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/patient/dashboard - Get dashboard overview data
router.get('/dashboard', auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    
    // Get counts for dashboard
    const [prescriptions, appointments, refillRequests, transferRequests] = await Promise.all([
      prisma.prescription.count({ where: { userId } }),
      prisma.appointment.count({ where: { userId } }),
      prisma.refillRequest.count({ where: { userId } }),
      prisma.transferRequest.count({ where: { userId } })
    ]);

    // Get recent activity
    const recentActivity = await prisma.refillRequest.findMany({
      where: { userId },
      take: 5,
      orderBy: { requestedDate: 'desc' },
      select: {
        id: true,
        medication: true,
        status: true,
        requestedDate: true
      }
    });

    const dashboardData = {
      stats: {
        activePrescriptions: prescriptions,
        upcomingAppointments: appointments,
        pendingRefills: refillRequests,
        transferRequests: transferRequests
      },
      recentActivity: recentActivity.map(activity => ({
        id: activity.id,
        type: 'refill-request',
        title: `Refill requested for ${activity.medication}`,
        status: activity.status,
        date: activity.requestedDate
      }))
    };

    res.json(dashboardData);
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
