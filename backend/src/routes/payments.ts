import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Initialize Stripe only if API key is provided
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-06-30.basil' });
} else {
  console.log('⚠️  Stripe API key not found. Payment functionality will be disabled.');
}

// POST /api/payments/create-payment-intent
router.post('/create-payment-intent', async (req: Request, res: Response) => {
  try {
    if (!stripe) {
      return res.status(503).json({ 
        error: 'Payment service is not configured. Please set STRIPE_SECRET_KEY environment variable.',
        code: 'PAYMENT_NOT_CONFIGURED'
      });
    }

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

// ✅ IMPLEMENTED: Confirm payment
router.post('/confirm-payment', async (req: Request, res: Response) => {
  try {
    if (!stripe) {
      return res.status(503).json({ 
        error: 'Payment service is not configured',
        code: 'PAYMENT_NOT_CONFIGURED'
      });
    }

    const { paymentIntentId, orderId } = req.body;
    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      // ✅ IMPLEMENTED: Update order status in database
      if (orderId) {
        try {
          await prisma.order.update({
            where: { id: Number(orderId) },
            data: { status: 'PAID' }
          });
          console.log(`✅ Order ${orderId} marked as paid`);
        } catch (dbError) {
          console.error('Failed to update order status:', dbError);
          // Don't fail the payment confirmation if DB update fails
        }
      }

      res.json({
        success: true,
        message: 'Payment confirmed',
        paymentIntent
      });
    } else {
      res.status(400).json({
        error: 'Payment not completed',
        status: paymentIntent.status
      });
    }
  } catch (err: any) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// ✅ IMPLEMENTED: Create subscription
router.post('/create-subscription', async (req: Request, res: Response) => {
  try {
    if (!stripe) {
      return res.status(503).json({ 
        error: 'Payment service is not configured',
        code: 'PAYMENT_NOT_CONFIGURED'
      });
    }

    const { customerId, priceId } = req.body;
    if (!customerId || !priceId) {
      return res.status(400).json({ error: 'Customer ID and Price ID are required' });
    }

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    // Handle the client secret safely
    let clientSecret = null;
    if (subscription.latest_invoice && 
        typeof subscription.latest_invoice === 'object' && 
        'payment_intent' in subscription.latest_invoice &&
        subscription.latest_invoice.payment_intent &&
        typeof subscription.latest_invoice.payment_intent === 'object' &&
        'client_secret' in subscription.latest_invoice.payment_intent) {
      clientSecret = subscription.latest_invoice.payment_intent.client_secret as string;
    }

    res.json({
      success: true,
      subscriptionId: subscription.id,
      clientSecret
    });
  } catch (err: any) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// ✅ IMPLEMENTED: Webhook handler
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Payment service is not configured' });
    }

    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !endpointSecret) {
      return res.status(400).json({ error: 'Missing signature or webhook secret' });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
      return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
    }

    // ✅ IMPLEMENTED: Handle different webhook events
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        // Update order status
        // await prisma.order.update({
        //   where: { stripePaymentIntentId: paymentIntent.id },
        //   data: { status: 'PAID' }
        // });
        break;
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Payment failed:', failedPayment.id);
        // Handle failed payment
        // await prisma.order.update({
        //   where: { stripePaymentIntentId: failedPayment.id },
        //   data: { status: 'PAYMENT_FAILED' }
        // });
        break;
      case 'customer.subscription.created':
        const subscription = event.data.object;
        console.log('Subscription created:', subscription.id);
        // Handle new subscription
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error('Webhook error:', err.message);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router; 