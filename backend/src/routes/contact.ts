import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import * as nodemailer from 'nodemailer';
import { unifiedAdminAuth } from './auth';

const router = Router();
const prisma = new PrismaClient();

// Updated schema to match frontend form data
const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(1, 'Phone number is required'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
  preferredContact: z.string().optional(),
  urgency: z.string().optional(),
  serviceType: z.string().optional(),
  bestTimeToContact: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to terms and conditions'),
  allowMarketing: z.boolean().optional(),
  fullName: z.string().optional(),
  timestamp: z.string().optional()
});

// Configure nodemailer for Outlook SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        error: 'Invalid input', 
        details: parsed.error.errors 
      });
    }
    
    const formData = parsed.data;
    
    // Create contact form entry with all the detailed data
    const contact = await prisma.contactForm.create({ 
      data: { 
        name: formData.fullName || `${formData.firstName} ${formData.lastName}`,
        email: formData.email, 
        message: `Subject: ${formData.subject}\n\nMessage: ${formData.message}\n\nService Type: ${formData.serviceType || 'Not specified'}\nUrgency: ${formData.urgency || 'Normal'}\nPreferred Contact: ${formData.preferredContact || 'Email'}\nBest Time: ${formData.bestTimeToContact || 'Not specified'}\nMarketing Consent: ${formData.allowMarketing ? 'Yes' : 'No'}`
      } 
    });
    
    // Try to send email notification (optional)
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const emailContent = `
New Contact Form Submission

Name: ${formData.firstName} ${formData.lastName}
Email: ${formData.email}
Phone: ${formData.phone}
Subject: ${formData.subject}

Message:
${formData.message}

Additional Information:
- Service Type: ${formData.serviceType || 'Not specified'}
- Urgency Level: ${formData.urgency || 'Normal'}
- Preferred Contact Method: ${formData.preferredContact || 'Email'}
- Best Time to Contact: ${formData.bestTimeToContact || 'Not specified'}
- Marketing Consent: ${formData.allowMarketing ? 'Yes' : 'No'}

Submitted: ${formData.timestamp || new Date().toISOString()}
        `;

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: process.env.CONTACT_RECEIVER || process.env.EMAIL_USER,
          subject: `New Contact Form Submission: ${formData.subject}`,
          text: emailContent,
          html: emailContent.replace(/\n/g, '<br>')
        });
      }
    } catch (emailError: any) {
      console.log('Email notification failed (optional):', emailError.message);
      // Don't fail the request if email fails
    }
    
    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully',
      contactId: contact.id
    });
  } catch (err: any) {
    console.error('Error handling contact form:', err);
    res.status(500).json({ 
      error: 'Failed to submit contact form',
      message: err.message 
    });
  }
});

// Get all contact forms (admin only)
router.get('/', unifiedAdminAuth, async (req, res) => {
  try {
    let limit = parseInt(req.query.limit as string) || 20;
    if (limit > 100) limit = 100;
    
    const contacts = await prisma.contactForm.findMany({ 
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json(contacts);
  } catch (err: any) {
    console.error('Error fetching contact forms:', err);
    res.status(500).json({ 
      error: 'Failed to fetch contact forms',
      message: err.message 
    });
  }
});

// Mark contact as read (admin only)
router.put('/:id/read', unifiedAdminAuth, async (req, res) => {
  try {
    const contactId = parseInt(req.params.id);
    const contact = await prisma.contactForm.update({
      where: { id: contactId },
      data: { notified: true }
    });
    
    res.json({
      success: true,
      message: 'Contact marked as read',
      contact
    });
  } catch (err: any) {
    console.error('Error marking contact as read:', err);
    res.status(500).json({ 
      error: 'Failed to mark contact as read',
      message: err.message 
    });
  }
});

// Delete contact form (admin only)
router.delete('/:id', unifiedAdminAuth, async (req, res) => {
  try {
    const contactId = parseInt(req.params.id);
    await prisma.contactForm.delete({
      where: { id: contactId }
    });
    
    res.json({
      success: true,
      message: 'Contact form deleted successfully'
    });
  } catch (err: any) {
    console.error('Error deleting contact form:', err);
    res.status(500).json({ 
      error: 'Failed to delete contact form',
      message: err.message 
    });
  }
});

export default router; 