import { Router, Request, Response } from 'express';
import Stripe from 'stripe';

const router = Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Create payment intent
router.post('/create-payment-intent', async (req: Request, res: Response) => {
  try {
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
    const { paymentIntentId, orderData } = req.body;

    // Verify payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Create WooCommerce order with payment confirmation
    const wooCommerceAPI = (await import('./woocommerce')).default;
    
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

    const response = await wooCommerceAPI.createOrder(orderDataWithPayment);
    
    if (response && response.order) {
      res.json({
        success: true,
        order: response.order,
        paymentIntent: paymentIntent
      });
    } else {
      throw new Error('Failed to create WooCommerce order');
    }
  } catch (error: unknown) {
    console.error('Payment confirmation failed:', error);
    res.status(500).json({
      error: 'Failed to confirm payment',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
    });
  }
});

export default router;
