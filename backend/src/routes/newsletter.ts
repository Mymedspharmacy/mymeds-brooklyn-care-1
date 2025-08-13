import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import * as nodemailer from 'nodemailer';

const router = Router();
const prisma = new PrismaClient();

// Newsletter subscription schema
const newsletterSchema = z.object({
  email: z.string().email('Valid email is required'),
  source: z.string().optional().default('website'),
  consent: z.boolean().optional().default(true)
});

// Configure nodemailer for Outlook SMTP
const transporter = nodemailer.createTransporter({
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Subscribe to newsletter
router.post('/subscribe', async (req: Request, res: Response) => {
  try {
    const parsed = newsletterSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        error: 'Invalid input', 
        details: parsed.error.errors 
      });
    }
    
    const { email, source, consent } = parsed.data;
    
    // Check if email already exists
    const existingSubscription = await prisma.newsletterSubscription.findUnique({
      where: { email }
    });
    
    if (existingSubscription) {
      if (existingSubscription.isActive) {
        return res.status(200).json({
          success: true,
          message: 'Email already subscribed to newsletter',
          alreadySubscribed: true
        });
      } else {
        // Reactivate subscription
        await prisma.newsletterSubscription.update({
          where: { email },
          data: { 
            isActive: true,
            updatedAt: new Date(),
            source,
            marketingConsent: consent
          }
        });
      }
    } else {
      // Create new subscription
      await prisma.newsletterSubscription.create({
        data: {
          email,
          source,
          marketingConsent: consent,
          isActive: true
        }
      });
    }
    
    // Send welcome email
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const welcomeEmailContent = `
Welcome to My Meds Pharmacy Newsletter!

Thank you for subscribing to our newsletter. You'll now receive updates about:
• Special offers and promotions
• Health tips and wellness advice
• New products and services
• Pharmacy news and updates

You can unsubscribe at any time by clicking the unsubscribe link in our emails.

Best regards,
The My Meds Pharmacy Team
        `;

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Welcome to My Meds Pharmacy Newsletter!',
          text: welcomeEmailContent,
          html: welcomeEmailContent.replace(/\n/g, '<br>')
        });
      }
    } catch (emailError: any) {
      console.log('Welcome email failed (optional):', emailError.message);
      // Don't fail the request if email fails
    }
    
    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      alreadySubscribed: false
    });
    
  } catch (error: any) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({
      error: 'Failed to subscribe to newsletter',
      message: error.message
    });
  }
});

// Unsubscribe from newsletter
router.post('/unsubscribe', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const subscription = await prisma.newsletterSubscription.findUnique({
      where: { email }
    });
    
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    await prisma.newsletterSubscription.update({
      where: { email },
      data: { 
        isActive: false,
        updatedAt: new Date()
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    });
    
  } catch (error: any) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({
      error: 'Failed to unsubscribe from newsletter',
      message: error.message
    });
  }
});

// Get newsletter statistics (admin only)
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const totalSubscribers = await prisma.newsletterSubscription.count({
      where: { isActive: true }
    });
    
    const recentSubscriptions = await prisma.newsletterSubscription.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    res.status(200).json({
      success: true,
      stats: {
        totalSubscribers,
        recentSubscriptions
      }
    });
    
  } catch (error: any) {
    console.error('Newsletter stats error:', error);
    res.status(500).json({
      error: 'Failed to get newsletter statistics',
      message: error.message
    });
  }
});

export default router;
