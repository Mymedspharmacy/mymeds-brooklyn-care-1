import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import WooCommerceCartService, { WooCommerceCart } from '../services/woocommerceCartService';

const router = Router();
const prisma = new PrismaClient();
const cartService = WooCommerceCartService.getInstance();

// Validation schemas
const addToCartSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive().max(100).default(1),
  variationId: z.number().int().positive().optional(),
});

const updateCartItemSchema = z.object({
  itemKey: z.string().min(1),
  quantity: z.number().int().min(0).max(100),
});

const couponSchema = z.object({
  code: z.string().min(1).max(50),
});

// Helper function to get or create cart session
async function getOrCreateCartSession(req: Request): Promise<string> {
  let sessionKey = req.headers['x-cart-session'] as string;
  
  if (!sessionKey) {
    // Create new cart session
    sessionKey = await cartService.createCartSession();
  } else {
    // Verify session exists
    const cart = await cartService.getCart(sessionKey);
    if (!cart) {
      // Session expired or invalid, create new one
      sessionKey = await cartService.createCartSession();
    }
  }
  
  return sessionKey;
}

// Get cart contents
router.get('/', async (req: Request, res: Response) => {
  try {
    const sessionKey = await getOrCreateCartSession(req);
    const cart = await cartService.getCart(sessionKey);
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found',
      });
    }

    // Store session for persistence
    await cartService.storeCartSession(sessionKey);

    res.json({
      success: true,
      cart: {
        sessionKey,
        items: cart.items,
        itemCount: cart.item_count,
        totals: cart.totals,
        currency: cart.currency,
        needsPayment: cart.needs_payment,
        needsShipping: cart.needs_shipping,
      },
    });
  } catch (error: any) {
    console.error('Error getting cart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cart',
      message: error.message,
    });
  }
});

// Add item to cart
router.post('/add', async (req: Request, res: Response) => {
  try {
    const sessionKey = await getOrCreateCartSession(req);
    const validatedData = addToCartSchema.parse(req.body);
    
    const cart = await cartService.addToCart(
      sessionKey,
      validatedData.productId,
      validatedData.quantity,
      validatedData.variationId
    );
    
    if (!cart) {
      return res.status(400).json({
        success: false,
        error: 'Failed to add item to cart',
      });
    }

    // Store session for persistence
    await cartService.storeCartSession(sessionKey);

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      cart: {
        sessionKey,
        items: cart.items,
        itemCount: cart.item_count,
        totals: cart.totals,
        currency: cart.currency,
      },
    });
  } catch (error: any) {
    console.error('Error adding item to cart:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid input data',
        details: error.errors,
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to add item to cart',
      message: error.message,
    });
  }
});

// Update cart item quantity
router.put('/update', async (req: Request, res: Response) => {
  try {
    const sessionKey = await getOrCreateCartSession(req);
    const validatedData = updateCartItemSchema.parse(req.body);
    
    if (validatedData.quantity === 0) {
      // Remove item if quantity is 0
      const cart = await cartService.removeFromCart(sessionKey, validatedData.itemKey);
      
      if (!cart) {
        return res.status(400).json({
          success: false,
          error: 'Failed to remove item from cart',
        });
      }

      res.json({
        success: true,
        message: 'Item removed from cart',
        cart: {
          sessionKey,
          items: cart.items,
          itemCount: cart.item_count,
          totals: cart.totals,
          currency: cart.currency,
        },
      });
    } else {
      // Update quantity
      const cart = await cartService.updateCartItem(
        sessionKey,
        validatedData.itemKey,
        validatedData.quantity
      );
      
      if (!cart) {
        return res.status(400).json({
          success: false,
          error: 'Failed to update cart item',
        });
      }

      res.json({
        success: true,
        message: 'Cart item updated successfully',
        cart: {
          sessionKey,
          items: cart.items,
          itemCount: cart.item_count,
          totals: cart.totals,
          currency: cart.currency,
        },
      });
    }

    // Store session for persistence
    await cartService.storeCartSession(sessionKey);
    
  } catch (error: any) {
    console.error('Error updating cart item:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid input data',
        details: error.errors,
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update cart item',
      message: error.message,
    });
  }
});

// Remove item from cart
router.delete('/remove', async (req: Request, res: Response) => {
  try {
    const sessionKey = await getOrCreateCartSession(req);
    const { itemKey } = req.body;
    
    if (!itemKey) {
      return res.status(400).json({
        success: false,
        error: 'Item key is required',
      });
    }
    
    const cart = await cartService.removeFromCart(sessionKey, itemKey);
    
    if (!cart) {
      return res.status(400).json({
        success: false,
        error: 'Failed to remove item from cart',
      });
    }

    // Store session for persistence
    await cartService.storeCartSession(sessionKey);

    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      cart: {
        sessionKey,
        items: cart.items,
        itemCount: cart.item_count,
        totals: cart.totals,
        currency: cart.currency,
      },
    });
  } catch (error: any) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove item from cart',
      message: error.message,
    });
  }
});

// Clear entire cart
router.delete('/clear', async (req: Request, res: Response) => {
  try {
    const sessionKey = await getOrCreateCartSession(req);
    const success = await cartService.clearCart(sessionKey);
    
    if (!success) {
      return res.status(400).json({
        success: false,
        error: 'Failed to clear cart',
      });
    }

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      cart: {
        sessionKey,
        items: [],
        itemCount: 0,
        totals: {
          subtotal: '0.00',
          total: '0.00',
        },
        currency: {
          currency_code: 'USD',
          currency_symbol: '$',
        },
      },
    });
  } catch (error: any) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cart',
      message: error.message,
    });
  }
});

// Apply coupon
router.post('/coupon', async (req: Request, res: Response) => {
  try {
    const sessionKey = await getOrCreateCartSession(req);
    const validatedData = couponSchema.parse(req.body);
    
    const cart = await cartService.applyCoupon(sessionKey, validatedData.code);
    
    if (!cart) {
      return res.status(400).json({
        success: false,
        error: 'Failed to apply coupon',
      });
    }

    // Store session for persistence
    await cartService.storeCartSession(sessionKey);

    res.json({
      success: true,
      message: 'Coupon applied successfully',
      cart: {
        sessionKey,
        items: cart.items,
        itemCount: cart.item_count,
        totals: cart.totals,
        currency: cart.currency,
        couponLines: cart.coupon_lines,
      },
    });
  } catch (error: any) {
    console.error('Error applying coupon:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid coupon code',
        details: error.errors,
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to apply coupon',
      message: error.message,
    });
  }
});

// Remove coupon
router.delete('/coupon', async (req: Request, res: Response) => {
  try {
    const sessionKey = await getOrCreateCartSession(req);
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Coupon code is required',
      });
    }
    
    const cart = await cartService.removeCoupon(sessionKey, code);
    
    if (!cart) {
      return res.status(400).json({
        success: false,
        error: 'Failed to remove coupon',
      });
    }

    // Store session for persistence
    await cartService.storeCartSession(sessionKey);

    res.json({
      success: true,
      message: 'Coupon removed successfully',
      cart: {
        sessionKey,
        items: cart.items,
        itemCount: cart.item_count,
        totals: cart.totals,
        currency: cart.currency,
        couponLines: cart.coupon_lines,
      },
    });
  } catch (error: any) {
    console.error('Error removing coupon:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove coupon',
      message: error.message,
    });
  }
});

// Sync local cart with WooCommerce
router.post('/sync', async (req: Request, res: Response) => {
  try {
    const sessionKey = await getOrCreateCartSession(req);
    const { items } = req.body;
    
    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        error: 'Items must be an array',
      });
    }
    
    const cart = await cartService.syncCartWithWooCommerce(sessionKey, items);
    
    if (!cart) {
      return res.status(400).json({
        success: false,
        error: 'Failed to sync cart',
      });
    }

    // Store session for persistence
    await cartService.storeCartSession(sessionKey);

    res.json({
      success: true,
      message: 'Cart synced successfully',
      cart: {
        sessionKey,
        items: cart.items,
        itemCount: cart.item_count,
        totals: cart.totals,
        currency: cart.currency,
      },
    });
  } catch (error: any) {
    console.error('Error syncing cart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync cart',
      message: error.message,
    });
  }
});

// Get cart session info
router.get('/session', async (req: Request, res: Response) => {
  try {
    const sessionKey = await getOrCreateCartSession(req);
    
    res.json({
      success: true,
      sessionKey,
      message: 'Cart session created/retrieved successfully',
    });
  } catch (error: any) {
    console.error('Error getting cart session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cart session',
      message: error.message,
    });
  }
});

export default router;



