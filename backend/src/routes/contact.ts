import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
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

// Email functionality temporarily disabled

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
        subject: formData.subject || 'General Inquiry',
        message: `Subject: ${formData.subject}\n\nMessage: ${formData.message}\n\nService Type: ${formData.serviceType || 'Not specified'}\nUrgency: ${formData.urgency || 'Normal'}\nPreferred Contact: ${formData.preferredContact || 'Email'}\nBest Time: ${formData.bestTimeToContact || 'Not specified'}\nMarketing Consent: ${formData.allowMarketing ? 'Yes' : 'No'}`
      } 
    });
    
    // Email notifications temporarily disabled due to SMTP configuration issues
    // TODO: Configure proper SMTP credentials for email notifications
    
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