import api from './api';

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
  sessionKey: string;
  items: WooCommerceCartItem[];
  itemCount: number;
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
  currency: {
    currency_code: string;
    currency_symbol: string;
    currency_minor_unit: number;
    currency_decimal_separator: string;
    currency_thousand_separator: string;
    currency_prefix: string;
    currency_suffix: string;
  };
  needsPayment: boolean;
  needsShipping: boolean;
  couponLines?: any[];
}

export interface CartResponse {
  success: boolean;
  cart: WooCommerceCart;
  message?: string;
  error?: string;
}

export interface AddToCartRequest {
  productId: number;
  quantity?: number;
  variationId?: number;
}

export interface UpdateCartItemRequest {
  itemKey: string;
  quantity: number;
}

export interface CouponRequest {
  code: string;
}

export interface SyncCartRequest {
  items: Array<{
    productId: number;
    quantity: number;
    variationId?: number;
  }>;
}

class WooCommerceCartService {
  private static instance: WooCommerceCartService;
  private sessionKey: string | null = null;
  private cartCache: WooCommerceCart | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 30000; // 30 seconds

  static getInstance(): WooCommerceCartService {
    if (!WooCommerceCartService.instance) {
      WooCommerceCartService.instance = new WooCommerceCartService();
    }
    return WooCommerceCartService.instance;
  }

  /**
   * Get or create cart session
   */
  async getSessionKey(): Promise<string> {
    if (this.sessionKey) {
      return this.sessionKey;
    }

    try {
      const response = await api.get('/woocommerce-cart/session');
      if (response.data.success && response.data.sessionKey) {
        this.sessionKey = response.data.sessionKey;
        return this.sessionKey;
      }
    } catch (error) {
      console.error('Error getting cart session:', error);
    }

    // Fallback: generate a local session key
    this.sessionKey = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('Using fallback session key:', this.sessionKey);
    return this.sessionKey;
  }

  /**
   * Get cart contents
   */
  async getCart(): Promise<WooCommerceCart | null> {
    try {
      // Check cache first
      if (this.cartCache && Date.now() < this.cacheExpiry) {
        return this.cartCache;
      }

      const sessionKey = await this.getSessionKey();
      if (!sessionKey) {
        console.warn('No session key available for cart request');
        return null;
      }

      const response = await api.get('/woocommerce-cart', {
        headers: {
          'X-Cart-Session': sessionKey,
        },
      });

      if (response.data.success) {
        this.cartCache = response.data.cart;
        this.cacheExpiry = Date.now() + this.CACHE_DURATION;
        return this.cartCache;
      }

      return null;
    } catch (error) {
        console.error('Error getting cart:', error);
        // Return empty cart on error to prevent UI issues
        return {
          sessionKey: this.sessionKey || '',
          items: [],
          itemCount: 0,
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
          currency: {
            currency_code: 'USD',
            currency_symbol: '$',
            currency_minor_unit: 2,
            currency_decimal_separator: '.',
            currency_thousand_separator: ',',
            currency_prefix: '$',
            currency_suffix: '',
          },
          needsPayment: false,
          needsShipping: false,
        };
      }
    }

  /**
   * Add item to cart
   */
  async addToCart(request: AddToCartRequest): Promise<CartResponse | null> {
    try {
      const sessionKey = await this.getSessionKey();
      const response = await api.post('/woocommerce-cart/add', request, {
        headers: {
          'X-Cart-Session': sessionKey,
        },
      });

      if (response.data.success) {
        this.cartCache = response.data.cart;
        this.cacheExpiry = Date.now() + this.CACHE_DURATION;
      }

      return response.data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return null;
    }
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(request: UpdateCartItemRequest): Promise<CartResponse | null> {
    try {
      const sessionKey = await this.getSessionKey();
      const response = await api.put('/woocommerce-cart/update', request, {
        headers: {
          'X-Cart-Session': sessionKey,
        },
      });

      if (response.data.success) {
        this.cartCache = response.data.cart;
        this.cacheExpiry = Date.now() + this.CACHE_DURATION;
      }

      return response.data;
    } catch (error) {
      console.error('Error updating cart item:', error);
      return null;
    }
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(itemKey: string): Promise<CartResponse | null> {
    try {
      const sessionKey = await this.getSessionKey();
      const response = await api.delete('/woocommerce-cart/remove', {
        data: { itemKey },
        headers: {
          'X-Cart-Session': sessionKey,
        },
      });

      if (response.data.success) {
        this.cartCache = response.data.cart;
        this.cacheExpiry = Date.now() + this.CACHE_DURATION;
      }

      return response.data;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return null;
    }
  }

  /**
   * Clear entire cart
   */
  async clearCart(): Promise<CartResponse | null> {
    try {
      const sessionKey = await this.getSessionKey();
      const response = await api.delete('/woocommerce-cart/clear', {
        headers: {
          'X-Cart-Session': sessionKey,
        },
      });

      if (response.data.success) {
        this.cartCache = response.data.cart;
        this.cacheExpiry = Date.now() + this.CACHE_DURATION;
      }

      return response.data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return null;
    }
  }

  /**
   * Apply coupon
   */
  async applyCoupon(request: CouponRequest): Promise<CartResponse | null> {
    try {
      const sessionKey = await this.getSessionKey();
      const response = await api.post('/woocommerce-cart/coupon', request, {
        headers: {
          'X-Cart-Session': sessionKey,
        },
      });

      if (response.data.success) {
        this.cartCache = response.data.cart;
        this.cacheExpiry = Date.now() + this.CACHE_DURATION;
      }

      return response.data;
    } catch (error) {
      console.error('Error applying coupon:', error);
      return null;
    }
  }

  /**
   * Remove coupon
   */
  async removeCoupon(code: string): Promise<CartResponse | null> {
    try {
      const sessionKey = await this.getSessionKey();
      const response = await api.delete('/woocommerce-cart/coupon', {
        data: { code },
        headers: {
          'X-Cart-Session': sessionKey,
        },
      });

      if (response.data.success) {
        this.cartCache = response.data.cart;
        this.cacheExpiry = Date.now() + this.CACHE_DURATION;
      }

      return response.data;
    } catch (error) {
      console.error('Error removing coupon:', error);
      return null;
    }
  }

  /**
   * Sync local cart with WooCommerce
   */
  async syncCart(request: SyncCartRequest): Promise<CartResponse | null> {
    try {
      const sessionKey = await this.getSessionKey();
      const response = await api.post('/woocommerce-cart/sync', request, {
        headers: {
          'X-Cart-Session': sessionKey,
        },
      });

      if (response.data.success) {
        this.cartCache = response.data.cart;
        this.cacheExpiry = Date.now() + this.CACHE_DURATION;
      }

      return response.data;
    } catch (error) {
      console.error('Error syncing cart:', error);
      return null;
    }
  }

  /**
   * Get cart item count
   */
  async getCartItemCount(): Promise<number> {
    const cart = await this.getCart();
    return cart?.itemCount || 0;
  }

  /**
   * Get cart total
   */
  async getCartTotal(): Promise<number> {
    const cart = await this.getCart();
    return cart ? parseFloat(cart.totals.total) : 0;
  }

  /**
   * Check if cart is empty
   */
  async isCartEmpty(): Promise<boolean> {
    const cart = await this.getCart();
    return !cart || cart.itemCount === 0;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cartCache = null;
    this.cacheExpiry = 0;
  }

  /**
   * Reset session
   */
  resetSession(): void {
    this.sessionKey = null;
    this.clearCache();
  }

  /**
   * Format price with currency
   */
  formatPrice(price: string | number, currency?: WooCommerceCart['currency']): string {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    const symbol = currency?.currency_symbol || '$';
    const code = currency?.currency_code || 'USD';
    
    return `${symbol}${numPrice.toFixed(2)}`;
  }

  /**
   * Get cart summary
   */
  async getCartSummary(): Promise<{
    itemCount: number;
    total: number;
    formattedTotal: string;
    isEmpty: boolean;
  }> {
    const cart = await this.getCart();
    
    if (!cart) {


      return {
        itemCount: 0,
        total: 0,
        formattedTotal: '$0.00',
        isEmpty: true,
      };
    }

    return {
      itemCount: cart.itemCount,
      total: parseFloat(cart.totals.total),
      formattedTotal: this.formatPrice(cart.totals.total, cart.currency),
      isEmpty: cart.itemCount === 0,
    };
  }
}

export default WooCommerceCartService;