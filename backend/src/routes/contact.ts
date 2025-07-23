import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import * as nodemailer from 'nodemailer';

const router = Router();
const prisma = new PrismaClient();

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1)
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
    if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.errors });
    const { name, email, message } = parsed.data;
    const contact = await prisma.contactForm.create({ data: { name, email, message } });
    
    // Try to send email notification (optional)
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: process.env.CONTACT_RECEIVER || process.env.EMAIL_USER,
          subject: `New Contact Form Submission from ${name}`,
          text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
        });
      }
    } catch (emailError: any) {
      // console.log('Email notification failed (optional):', emailError.message);
    }
    
    res.status(201).json(contact);
  } catch (err) {
    // console.error('Error handling contact form:', err);
    res.status(500).json({ error: 'Failed to submit contact form' });
  }
});

// Get all contact forms (admin only)
router.get('/', async (req, res) => {
  try {
    let limit = parseInt(req.query.limit as string) || 20;
    if (limit > 100) limit = 100;
    const contacts = await prisma.contactForm.findMany({ take: limit });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contact forms' });
  }
});

export default router; 