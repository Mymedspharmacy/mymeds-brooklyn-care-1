import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { unifiedAdminAuth } from './auth';

const router = Router();
const prisma = new PrismaClient();

// Cart item schema
const cartItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive().max(100),
});

// Cart operations schema
const cartOperationsSchema = z.object({
  cartId: z.string().optional(),
  userId: z.number().int().positive().optional(),
});

// Get or create cart
router.get('/', async (req: Request, res: Response) => {
  try {
    const { cartId, userId } = cartOperationsSchema.parse(req.query);
    
    let cart;
    
    if (userId) {
      // User is logged in - get their cart
      cart = await prisma.cart.findFirst({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: true,
                  variants: true,
                }
              }
            }
          }
        }
      });
      
      if (!cart) {
        // Create new cart for user
        cart = await prisma.cart.create({
          data: {
            userId,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          },
          include: {
            items: {
              include: {
                product: {
                  include: {
                    images: true,
                    variants: true,
                  }
                }
              }
            }
          }
        });
      }
    } else if (cartId) {
      // Guest cart
      const cartIdNum = parseInt(cartId as string);
      if (isNaN(cartIdNum)) {
        return res.status(400).json({ error: 'Invalid cart ID' });
      }
      
      cart = await prisma.cart.findUnique({
        where: { id: cartIdNum },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: true,
                  variants: true,
                }
              }
            }
          }
        }
      });
      
      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }
      
      // Check if cart is expired
      if (cart.expiresAt < new Date()) {
        await prisma.cart.delete({ where: { id: cartIdNum } });
        return res.status(410).json({ error: 'Cart expired' });
      }
    } else {
      // Create new guest cart
      cart = await prisma.cart.create({
        data: {
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: true,
                  variants: true,
                }
              }
            }
          }
        }
      });
    }
    
    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    
    res.json({
      success: true,
      cart: {
        id: cart.id,
        items: cart.items,
        subtotal: parseFloat(subtotal.toFixed(2)),
        totalItems,
        expiresAt: cart.expiresAt,
      }
    });
    
  } catch (error: any) {
    console.error('Error getting cart:', error);
    res.status(500).json({
      error: 'Failed to get cart',
      message: error.message
    });
  }
});

// Add item to cart
router.post('/add', async (req: Request, res: Response) => {
  try {
    const { cartId, productId, quantity } = req.body;
    
    if (!cartId || !productId || !quantity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate input
    const validatedData = cartItemSchema.parse({ productId, quantity });
    
    // Check if product exists and has stock
    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    if (product.stock < validatedData.quantity) {
      return res.status(400).json({ 
        error: 'Insufficient stock',
        availableStock: product.stock
      });
    }
    
    // Get or create cart
    const cartIdNum = parseInt(cartId as string);
    if (isNaN(cartIdNum)) {
      return res.status(400).json({ error: 'Invalid cart ID' });
    }
    
    let cart = await prisma.cart.findUnique({
      where: { id: cartIdNum }
    });
    
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        }
      });
    }
    
    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: validatedData.productId
      }
    });
    
    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + validatedData.quantity;
      
      if (newQuantity > product.stock) {
        return res.status(400).json({ 
          error: 'Insufficient stock for requested quantity',
          availableStock: product.stock
        });
      }
      
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity }
      });
    } else {
      // Add new item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: validatedData.productId,
          quantity: validatedData.quantity,
          price: product.price
        }
      });
    }
    
    // Get updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                variants: true,
              }
            }
          }
        }
      }
    });
    
    const subtotal = updatedCart!.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = updatedCart!.items.reduce((sum, item) => sum + item.quantity, 0);
    
    res.json({
      success: true,
      message: 'Item added to cart',
      cart: {
        id: updatedCart!.id,
        items: updatedCart!.items,
        subtotal: parseFloat(subtotal.toFixed(2)),
        totalItems,
        expiresAt: updatedCart!.expiresAt,
      }
    });
    
  } catch (error: any) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({
      error: 'Failed to add item to cart',
      message: error.message
    });
  }
});

// Update cart item quantity
router.put('/update/:itemId', async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    
    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }
    
    // Get cart item
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: parseInt(itemId) },
      include: { product: true }
    });
    
    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    
    // Check stock
    if (quantity > cartItem.product.stock) {
      return res.status(400).json({ 
        error: 'Insufficient stock',
        availableStock: cartItem.product.stock
      });
    }
    
    // Update quantity
    await prisma.cartItem.update({
      where: { id: parseInt(itemId) },
      data: { quantity }
    });
    
    res.json({
      success: true,
      message: 'Cart item updated'
    });
    
  } catch (error: any) {
    console.error('Error updating cart item:', error);
    res.status(500).json({
      error: 'Failed to update cart item',
      message: error.message
    });
  }
});

// Remove item from cart
router.delete('/remove/:itemId', async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    
    await prisma.cartItem.delete({
      where: { id: parseInt(itemId) }
    });
    
    res.json({
      success: true,
      message: 'Item removed from cart'
    });
    
  } catch (error: any) {
    console.error('Error removing cart item:', error);
    res.status(500).json({
      error: 'Failed to remove item from cart',
      message: error.message
    });
  }
});

// Clear cart
router.delete('/clear/:cartId', async (req: Request, res: Response) => {
  try {
    const { cartId } = req.params;
    const cartIdNum = parseInt(cartId);
    if (isNaN(cartIdNum)) {
      return res.status(400).json({ error: 'Invalid cart ID' });
    }
    
    await prisma.cartItem.deleteMany({
      where: { cartId: cartIdNum }
    });
    
    res.json({
      success: true,
      message: 'Cart cleared'
    });
    
  } catch (error: any) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      error: 'Failed to clear cart',
      message: error.message
    });
  }
});

// Get cart summary (for header display)
router.get('/summary/:cartId', async (req: Request, res: Response) => {
  try {
    const { cartId } = req.params;
    const cartIdNum = parseInt(cartId);
    if (isNaN(cartIdNum)) {
      return res.status(400).json({ error: 'Invalid cart ID' });
    }
    
    const cart = await prisma.cart.findUnique({
      where: { id: cartIdNum },
      include: { items: true }
    });
    
    if (!cart) {
      return res.json({
        success: true,
        summary: {
          totalItems: 0,
          subtotal: 0
        }
      });
    }
    
    const totalItems = cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
    const subtotal = cart.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    
    res.json({
      success: true,
      summary: {
        totalItems,
        subtotal: parseFloat(subtotal.toFixed(2))
      }
    });
    
  } catch (error: any) {
    console.error('Error getting cart summary:', error);
    res.status(500).json({
      error: 'Failed to get cart summary',
      message: error.message
    });
  }
});

export default router;
