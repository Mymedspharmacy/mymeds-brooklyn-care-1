import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface WooCommerceCartItem {
  id: number;
  name: string;
  price: string;
  quantity: number;
  total: string;
  product_id: number;
  variation_id?: number;
  meta_data?: Array<{ key: string; value: string }>;
}

export interface WooCommerceCart {
  cart_hash: string;
  cart_key: string;
  currency: {
    currency_code: string;
    currency_symbol: string;
    currency_minor_unit: number;
    currency_decimal_separator: string;
    currency_thousand_separator: string;
    currency_prefix: string;
    currency_suffix: string;
  };
  customer: {
    billing_address: any;
    shipping_address: any;
  };
  items: WooCommerceCartItem[];
  item_count: number;
  items_weight: number;
  cross_sells: any[];
  needs_payment: boolean;
  needs_shipping: boolean;
  shipping: {
    total_packages: number;
    show_package_details: boolean;
    has_calculated_shipping: boolean;
    packages: any[];
  };
  fees: any[];
  taxes: any[];
  totals: {
    subtotal: string;
    subtotal_tax: string;
    fee_total: string;
    fee_tax: string;
    discount_total: string;
    discount_tax: string;
    shipping_total: string;
    shipping_tax: string;
    total: string;
    total_tax: string;
  };
  removed_items: any[];
  coupon_lines: any[];
  shipping_lines: any[];
  fee_lines: any[];
  is_cart: boolean;
  is_checkout: boolean;
  is_pay_for_order: boolean;
}

export class WooCommerceCartService {
  private static instance: WooCommerceCartService;
  private cartSessions: Map<string, WooCommerceCart> = new Map();

  static getInstance(): WooCommerceCartService {
    if (!WooCommerceCartService.instance) {
      WooCommerceCartService.instance = new WooCommerceCartService();
    }
    return WooCommerceCartService.instance;
  }

  /**
   * Create a new WooCommerce cart session
   */
  async createCartSession(): Promise<string> {
    try {
      // For now, create a local cart session
      const cartKey = this.generateCartKey();
      
      // Create a default empty cart
      const emptyCart: WooCommerceCart = {
        cart_hash: cartKey,
        cart_key: cartKey,
        currency: {
          currency_code: 'USD',
          currency_symbol: '$',
          currency_minor_unit: 2,
          currency_decimal_separator: '.',
          currency_thousand_separator: ',',
          currency_prefix: '$',
          currency_suffix: '',
        },
        customer: {
          billing_address: {},
          shipping_address: {},
        },
        items: [],
        item_count: 0,
        items_weight: 0,
        cross_sells: [],
        needs_payment: false,
        needs_shipping: false,
        shipping: {
          total_packages: 0,
          show_package_details: false,
          has_calculated_shipping: false,
          packages: [],
        },
        fees: [],
        taxes: [],
        totals: {
          subtotal: '0.00',
          subtotal_tax: '0.00',
          fee_total: '0.00',
          fee_tax: '0.00',
          discount_total: '0.00',
          discount_tax: '0.00',
          shipping_total: '0.00',
          shipping_tax: '0.00',
          total: '0.00',
          total_tax: '0.00',
        },
        removed_items: [],
        coupon_lines: [],
        shipping_lines: [],
        fee_lines: [],
        is_cart: true,
        is_checkout: false,
        is_pay_for_order: false,
      };
      
      // Store cart session locally for faster access
      this.cartSessions.set(cartKey, emptyCart);
      
      return cartKey;
    } catch (error) {
      console.error('Error creating WooCommerce cart session:', error);
      // Fallback to local cart key generation
      return this.generateCartKey();
    }
  }

  /**
   * Get cart contents by session key
   */
  async getCart(sessionKey: string): Promise<WooCommerceCart | null> {
    try {
      // Check local cache first
      if (this.cartSessions.has(sessionKey)) {
        return this.cartSessions.get(sessionKey)!;
      }

      // Try to restore from database
      const restoredCart = await this.restoreCartSession(sessionKey);
      if (restoredCart) {
        return restoredCart;
      }

      // Create new cart if none exists
      const newCartKey = await this.createCartSession();
      return this.cartSessions.get(newCartKey) || null;
    } catch (error) {
      console.error('Error fetching WooCommerce cart:', error);
      return null;
    }
  }

  /**
   * Add item to WooCommerce cart
   */
  async addToCart(
    sessionKey: string, 
    productId: number, 
    quantity: number = 1,
    variationId?: number
  ): Promise<WooCommerceCart | null> {
    try {
      let cart = this.cartSessions.get(sessionKey);
      
      if (!cart) {
        // Create new cart
        const newKey = await this.createCartSession();
        cart = this.cartSessions.get(newKey)!;
        sessionKey = newKey;
      }

      // Check if item already exists
      const existingItemIndex = cart.items.findIndex(item => 
        item.product_id === productId && item.variation_id === variationId
      );

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        cart.items[existingItemIndex].quantity += quantity;
        cart.items[existingItemIndex].total = (
          parseFloat(cart.items[existingItemIndex].price) * cart.items[existingItemIndex].quantity
        ).toFixed(2);
      } else {
        // Add new item (we'll need to fetch product details)
        const product = await this.getProductDetails(productId);
        if (product) {
          const newItem: WooCommerceCartItem = {
            id: Date.now(), // Temporary ID
            name: product.name,
            price: product.price,
            quantity: quantity,
            total: (parseFloat(product.price) * quantity).toFixed(2),
            product_id: productId,
            variation_id: variationId,
            meta_data: [],
          };
          cart.items.push(newItem);
        }
      }

      // Update cart totals
      this.updateCartTotals(cart);
      
      // Update local cache
      this.cartSessions.set(sessionKey, cart);
      
      // Store in database
      // await this.storeCartSession(sessionKey); // Disabled to prevent foreign key constraint violations
      
      return cart;
    } catch (error) {
      console.error('Error adding item to WooCommerce cart:', error);
      return null;
    }
  }

  /**
   * Update item quantity in WooCommerce cart
   */
  async updateCartItem(
    sessionKey: string,
    itemKey: string,
    quantity: number
  ): Promise<WooCommerceCart | null> {
    try {
      const cart = this.cartSessions.get(sessionKey);
      if (!cart) return null;

      const itemIndex = cart.items.findIndex(item => item.id.toString() === itemKey);
      if (itemIndex >= 0) {
        cart.items[itemIndex].quantity = quantity;
        cart.items[itemIndex].total = (
          parseFloat(cart.items[itemIndex].price) * quantity
        ).toFixed(2);
        
        // Remove item if quantity is 0
        if (quantity <= 0) {
          cart.items.splice(itemIndex, 1);
        }
      }

      // Update cart totals
      this.updateCartTotals(cart);
      
      // Update local cache
      this.cartSessions.set(sessionKey, cart);
      
      // Store in database
      // await this.storeCartSession(sessionKey); // Disabled to prevent foreign key constraint violations
      
      return cart;
    } catch (error) {
      console.error('Error updating WooCommerce cart item:', error);
      return null;
    }
  }

  /**
   * Remove item from WooCommerce cart
   */
  async removeFromCart(
    sessionKey: string,
    itemKey: string
  ): Promise<WooCommerceCart | null> {
    try {
      const cart = this.cartSessions.get(sessionKey);
      if (!cart) return null;

      const itemIndex = cart.items.findIndex(item => item.id.toString() === itemKey);
      if (itemIndex >= 0) {
        cart.items.splice(itemIndex, 1);
      }

      // Update cart totals
      this.updateCartTotals(cart);
      
      // Update local cache
      this.cartSessions.set(sessionKey, cart);
      
      // Store in database
      // await this.storeCartSession(sessionKey); // Disabled to prevent foreign key constraint violations
      
      return cart;
    } catch (error) {
      console.error('Error removing item from WooCommerce cart:', error);
      return null;
    }
  }

  /**
   * Clear entire WooCommerce cart
   */
  async clearCart(sessionKey: string): Promise<boolean> {
    try {
      const cart = this.cartSessions.get(sessionKey);
      if (cart) {
        cart.items = [];
        this.updateCartTotals(cart);
        this.cartSessions.set(sessionKey, cart);
        // await this.storeCartSession(sessionKey); // Disabled to prevent foreign key constraint violations
      }
      return true;
    } catch (error) {
      console.error('Error clearing WooCommerce cart:', error);
      return false;
    }
  }

  /**
   * Apply coupon to WooCommerce cart
   */
  async applyCoupon(sessionKey: string, couponCode: string): Promise<WooCommerceCart | null> {
    try {
      const cart = this.cartSessions.get(sessionKey);
      if (!cart) return null;

      // For now, just add to coupon lines (simplified implementation)
      cart.coupon_lines.push({
        code: couponCode,
        discount: '0.00',
        discount_tax: '0.00',
      });

      // Update cart totals
      this.updateCartTotals(cart);
      
      // Update local cache
      this.cartSessions.set(sessionKey, cart);
      
      return cart;
    } catch (error) {
      console.error('Error applying coupon to WooCommerce cart:', error);
      return null;
    }
  }

  /**
   * Remove coupon from WooCommerce cart
   */
  async removeCoupon(sessionKey: string, couponCode: string): Promise<WooCommerceCart | null> {
    try {
      const cart = this.cartSessions.get(sessionKey);
      if (!cart) return null;

      // Remove coupon from coupon lines
      cart.coupon_lines = cart.coupon_lines.filter(coupon => coupon.code !== couponCode);

      // Update cart totals
      this.updateCartTotals(cart);
      
      // Update local cache
      this.cartSessions.set(sessionKey, cart);
      
      return cart;
    } catch (error) {
      console.error('Error removing coupon from WooCommerce cart:', error);
      return null;
    }
  }

  /**
   * Sync local cart with WooCommerce cart
   */
  async syncCartWithWooCommerce(
    sessionKey: string,
    localCartItems: Array<{ productId: number; quantity: number; variationId?: number }>
  ): Promise<WooCommerceCart | null> {
    try {
      // Clear existing cart
      await this.clearCart(sessionKey);

      // Add all local items to WooCommerce cart
      for (const item of localCartItems) {
        await this.addToCart(sessionKey, item.productId, item.quantity, item.variationId);
      }

      // Return updated cart
      return await this.getCart(sessionKey);
    } catch (error) {
      console.error('Error syncing cart with WooCommerce:', error);
      return null;
    }
  }

  /**
   * Generate a unique cart key
   */
  private generateCartKey(): string {
    return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update cart totals
   */
  private updateCartTotals(cart: WooCommerceCart): void {
    const subtotal = cart.items.reduce((sum, item) => sum + parseFloat(item.total), 0);
    cart.item_count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    
    cart.totals.subtotal = subtotal.toFixed(2);
    cart.totals.total = subtotal.toFixed(2);
    cart.totals.subtotal_tax = '0.00';
    cart.totals.total_tax = '0.00';
  }

  /**
   * Get product details from WooCommerce API
   */
  private async getProductDetails(productId: number): Promise<{ name: string; price: string } | null> {
    try {
      // Validate required environment variables for production
      if (!process.env.WOOCOMMERCE_CONSUMER_KEY || !process.env.WOOCOMMERCE_CONSUMER_SECRET || !process.env.WOOCOMMERCE_STORE_URL) {
        throw new Error('WooCommerce credentials not configured for cart service');
      }

      // Fetch from WooCommerce API using axios instead
      const axios = (await import('axios')).default;
      
      const auth = Buffer.from(
        `${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`
      ).toString('base64');

      const response = await axios.get(
        `${process.env.WOOCOMMERCE_STORE_URL}/wp-json/wc/v3/products/${productId}`,
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const product = response.data as Record<string, unknown>;
      return {
        name: String(product.name || ''),
        price: String(product.price || '0'),
      };
    } catch (error) {
      console.error('Error fetching product details:', error);
      throw new Error(`Failed to fetch product details for product ${productId}: ${error.message}`);
    }
  }

  /**
   * Store cart session in database for persistence
   */
  async storeCartSession(
    sessionKey: string,
    userId?: number,
    expiresAt?: Date
  ): Promise<void> {
    try {
      const cart = this.cartSessions.get(sessionKey);
      if (!cart) return;

      // Store in local database for backup/recovery
      const dbCart = await prisma.cart.findFirst({
        where: { sessionId: sessionKey },
      });

      let cartId: number;
      if (dbCart) {
        // Update existing cart
        await prisma.cart.update({
          where: { id: dbCart.id },
          data: {
            userId: userId || null,
            expiresAt: expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            updatedAt: new Date(),
          },
        });
        cartId = dbCart.id;
      } else {
        // Create new cart
        const newCart = await prisma.cart.create({
          data: {
            sessionId: sessionKey,
            userId: userId || null,
            expiresAt: expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          },
        });
        cartId = newCart.id;
      }

      // Store cart items
      for (const item of cart.items) {
        const existingItem = await prisma.cartItem.findFirst({
          where: {
            cartId: cartId,
            productId: item.product_id,
          },
        });

        if (existingItem) {
          await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: {
              quantity: item.quantity,
              price: parseFloat(item.price),
            },
          });
        } else {
          await prisma.cartItem.create({
            data: {
              cartId: cartId,
              productId: item.product_id,
              quantity: item.quantity,
              price: parseFloat(item.price),
            },
          });
        }
      }
    } catch (error) {
      console.error('Error storing cart session:', error);
    }
  }

  /**
   * Restore cart session from database
   */
  async restoreCartSession(sessionKey: string): Promise<WooCommerceCart | null> {
    try {
      const dbCart = await prisma.cart.findFirst({
        where: { sessionId: sessionKey },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!dbCart) return null;

      // Check if cart is expired
      if (dbCart.expiresAt && dbCart.expiresAt < new Date()) {
        await prisma.cart.delete({ where: { id: dbCart.id } });
        return null;
      }

      // Convert database cart to WooCommerce cart format
      const restoredCart: WooCommerceCart = {
        cart_hash: sessionKey,
        cart_key: sessionKey,
        currency: {
          currency_code: 'USD',
          currency_symbol: '$',
          currency_minor_unit: 2,
          currency_decimal_separator: '.',
          currency_thousand_separator: ',',
          currency_prefix: '$',
          currency_suffix: '',
        },
        customer: {
          billing_address: {},
          shipping_address: {},
        },
        items: dbCart.items.map(item => ({
          id: item.id,
          name: item.product.name,
          price: item.price.toString(),
          quantity: item.quantity,
          total: (item.price * item.quantity).toFixed(2),
          product_id: item.productId,
          meta_data: [],
        })),
        item_count: dbCart.items.reduce((sum, item) => sum + item.quantity, 0),
        items_weight: 0,
        cross_sells: [],
        needs_payment: false,
        needs_shipping: false,
        shipping: {
          total_packages: 0,
          show_package_details: false,
          has_calculated_shipping: false,
          packages: [],
        },
        fees: [],
        taxes: [],
        totals: {
          subtotal: dbCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2),
          subtotal_tax: '0.00',
          fee_total: '0.00',
          fee_tax: '0.00',
          discount_total: '0.00',
          discount_tax: '0.00',
          shipping_total: '0.00',
          shipping_tax: '0.00',
          total: dbCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2),
          total_tax: '0.00',
        },
        removed_items: [],
        coupon_lines: [],
        shipping_lines: [],
        fee_lines: [],
        is_cart: true,
        is_checkout: false,
        is_pay_for_order: false,
      };

      // Cache the restored cart
      this.cartSessions.set(sessionKey, restoredCart);
      
      return restoredCart;
    } catch (error) {
      console.error('Error restoring cart session:', error);
      return null;
    }
  }
}

export default WooCommerceCartService;
