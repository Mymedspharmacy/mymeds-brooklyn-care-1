import { Router, Request, Response } from 'express';
import Stripe from 'stripe';

const router = Router();

// Initialize Stripe (only if API key is provided)
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-09-30.clover',
    })
  : null;

// Create payment intent
router.post('/create-payment-intent', async (req: Request, res: Response) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.' });
    }

    const { amount, currency } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currency || 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: unknown) {
    console.error('Stripe payment intent creation failed:', error);
    res.status(500).json({
      error: 'Failed to create payment intent',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
    });
  }
});

// Confirm payment and create WooCommerce order
router.post('/confirm-payment', async (req: Request, res: Response) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.' });
    }

    const { paymentIntentId, orderData } = req.body;

    // Verify payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Create WooCommerce order with payment confirmation
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    const settings = await prisma.wooCommerceSettings.findUnique({
      where: { id: 1 }
    });

    if (!settings || !settings.enabled) {
      return res.status(503).json({ error: 'WooCommerce is not configured or enabled' });
    }

    const orderDataWithPayment = {
      ...orderData,
      payment_method: 'stripe',
      payment_method_title: 'Credit Card (Stripe)',
      set_paid: true,
      status: 'processing',
      meta_data: [
        {
          key: '_stripe_payment_intent_id',
          value: paymentIntentId
        },
        {
          key: '_stripe_charge_id',
          value: paymentIntent.latest_charge
        }
      ]
    };

    const response = await fetch(`${settings.storeUrl}/wp-json/wc/v3/orders?consumer_key=${settings.consumerKey}&consumer_secret=${settings.consumerSecret}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderDataWithPayment)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'WooCommerce API error');
    }

    const order = await response.json();

    res.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        total: order.total,
        created_at: order.created_at
      },
      paymentIntent: paymentIntent
    });
  } catch (error: unknown) {
    console.error('Payment confirmation failed:', error);
    res.status(500).json({
      error: 'Failed to confirm payment',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
    });
  }
});

export default router;
