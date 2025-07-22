import { Router, Request, Response } from 'express';
import Stripe from 'stripe';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2025-06-30.basil' });

// POST /api/payments/create-payment-intent
router.post('/create-payment-intent', async (req: Request, res: Response) => {
  try {
    const { amount, currency = 'usd' } = req.body;
    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }
    // Stripe expects amount in cents
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount) * 100),
      currency,
      automatic_payment_methods: { enabled: true },
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err: any) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

export default router; 