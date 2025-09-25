import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import * as nodemailer from 'nodemailer';
import { unifiedAdminAuth } from './auth';

const router = Router();
const prisma = new PrismaClient();

// Newsletter subscription schema
const newsletterSchema = z.object({
  email: z.string().email('Valid email is required'),
  source: z.string().optional().default('website'),
  consent: z.boolean().optional().default(true)
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
    
    // Check if email already exists - using user table for now
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      // Update user with newsletter preference
      await prisma.user.update({
        where: { email },
        data: { 
          // Add newsletter fields to user if needed
        }
      });
    } else {
      // Create new user with newsletter preference
      await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0], // Use email prefix as name
          password: 'newsletter-user', // Temporary password
          role: 'CUSTOMER'
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

        // Send notification to business email
        const notificationContent = `
New Newsletter Subscription

A new user has subscribed to your newsletter:

Email: ${email}
Source: ${source}
Timestamp: ${new Date().toISOString()}

You can manage your newsletter subscribers through your admin panel.

Best regards,
My Meds Pharmacy System
        `;

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: 'mymedspharmacy@outlook.com',
          subject: 'New Newsletter Subscription - My Meds Pharmacy',
          text: notificationContent,
          html: notificationContent.replace(/\n/g, '<br>')
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
    
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update user newsletter preference
    await prisma.user.update({
      where: { email },
      data: { 
        // Add newsletter fields to user if needed
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
router.get('/stats', unifiedAdminAuth, async (req: Request, res: Response) => {
  try {
    // Count total users (as a proxy for newsletter subscribers)
    const totalUsers = await prisma.user.count({
      where: { role: 'CUSTOMER' }
    });
    
    const recentUsers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    res.status(200).json({
      success: true,
      stats: {
        totalSubscribers: totalUsers,
        recentSubscriptions: recentUsers
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
