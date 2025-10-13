import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  CreditCard, 
  MapPin, 
  User, 
  Phone, 
  Mail,
  CheckCircle,
  Loader2,
  AlertCircle,
  Lock
} from 'lucide-react';
import api from '@/lib/api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface CartItem {
  id: number;
  name: string;
  price: string;
  sale_price?: string;
  images: Array<{ src: string; alt: string }>;
  quantity: number;
}

interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  paymentMethod: 'card' | 'paypal' | 'stripe';
  notes?: string;
}

// Inner component that uses Stripe hooks
function CheckoutForm({ cart: initialCart }: { cart: CartItem[] }) {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  
  const [cart, setCart] = useState<CartItem[]>(initialCart);
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postcode: '',
    country: 'US',
    paymentMethod: 'card'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Redirect if no cart items
  React.useEffect(() => {
    if (!cart || cart.length === 0) {
      navigate('/shop');
    }
  }, [cart, navigate]);

  const handleInputChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(price || '0'));
  };

  const getProductImage = (item: CartItem) => {
    if (!item || !item.images || !Array.isArray(item.images) || item.images.length === 0) {
      return '/placeholder-product.jpg';
    }
    return item.images[0]?.src || '/placeholder-product.jpg';
  };

  const getCartTotal = () => {
    const total = cart.reduce((total, item) => {
      if (!item) {
        return total;
      }
      const price = parseFloat(item.sale_price || item.price || '0');
      console.log(`Item: ${item.name}, Price: ${price}, Quantity: ${item.quantity}, Subtotal: ${price * item.quantity}`);
      return total + (price * item.quantity);
    }, 0);
    console.log('Cart total calculated:', total);
    return total;
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => {
      if (!item) {
        return total;
      }
      return total + item.quantity;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate cart has items
      if (!cart || cart.length === 0) {
        setError('Your cart is empty. Please add items to your cart before proceeding to checkout.');
        setLoading(false);
        return;
      }
      
      // Validate form
      const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address1', 'city', 'state', 'postcode', 'country'];
      const missingFields = requiredFields.filter(field => !formData[field as keyof CheckoutFormData]);
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }

      // If card payment is selected, process Stripe payment first
      if (formData.paymentMethod === 'card') {
        if (!stripe || !elements) {
          setError('Stripe is not loaded. Please refresh the page and try again.');
          setLoading(false);
          return;
        }

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          setError('Card details are required.');
          setLoading(false);
          return;
        }

        // Create payment intent
        const paymentIntentResponse = await api.post('/stripe/create-payment-intent', {
          amount: Math.round(getCartTotal() * 100), // Convert to cents
          currency: 'usd'
        });

        const { clientSecret } = paymentIntentResponse.data;

        // Confirm card payment
        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${formData.firstName} ${formData.lastName}`,
              email: formData.email,
              phone: formData.phone,
              address: {
                line1: formData.address1,
                line2: formData.address2 || '',
                city: formData.city,
                state: formData.state,
                postal_code: formData.postcode,
                country: formData.country
              }
            }
          }
        });

        if (stripeError) {
          throw new Error(stripeError.message || 'Payment failed');
        }

        if (paymentIntent?.status !== 'succeeded') {
          throw new Error('Payment was not completed successfully');
        }

        // Payment successful, create order with Stripe transaction ID
        const orderData = {
          billing: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address_1: formData.address1,
            address_2: formData.address2 || '',
            city: formData.city,
            state: formData.state,
            postcode: formData.postcode,
            country: formData.country
          },
          shipping: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            address_1: formData.address1,
            address_2: formData.address2 || '',
            city: formData.city,
            state: formData.state,
            postcode: formData.postcode,
            country: formData.country
          },
          line_items: cart.filter(item => item).map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            price: parseFloat(item.sale_price || item.price || '0')
          })),
          payment_method: 'stripe',
          payment_method_title: 'Credit Card (Stripe)',
          set_paid: true,
          customer_note: formData.notes || '',
          transaction_id: paymentIntent.id
        };

        // Submit order to WooCommerce
        const response = await api.post('/woocommerce/orders', orderData);
        
        if (response.data.success) {
          setSuccess(true);
          localStorage.removeItem('cart');
          setCart([]);
          setTimeout(() => {
            navigate('/shop', { state: { orderSuccess: true, clearCart: true } });
          }, 3000);
        } else {
          throw new Error(response.data.error || 'Failed to create order');
        }
      } else {
        // PayPal or other payment methods
        const orderData = {
          billing: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address_1: formData.address1,
            address_2: formData.address2 || '',
            city: formData.city,
            state: formData.state,
            postcode: formData.postcode,
            country: formData.country
          },
          shipping: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            address_1: formData.address1,
            address_2: formData.address2 || '',
            city: formData.city,
            state: formData.state,
            postcode: formData.postcode,
            country: formData.country
          },
          line_items: cart.filter(item => item).map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            price: parseFloat(item.sale_price || item.price || '0')
          })),
          payment_method: formData.paymentMethod || 'bacs',
          payment_method_title: formData.paymentMethod === 'paypal' ? 'PayPal' : 'Direct Bank Transfer',
          set_paid: false,
          customer_note: formData.notes || ''
        };

        // Submit order to WooCommerce
        const response = await api.post('/woocommerce/orders', orderData);
        
        if (response.data.success) {
          setSuccess(true);
          localStorage.removeItem('cart');
          setCart([]);
          setTimeout(() => {
            navigate('/shop', { state: { orderSuccess: true, clearCart: true } });
          }, 3000);
        } else {
          throw new Error(response.data.error || 'Failed to create order');
        }
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to process order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <SEOHead 
          title="Order Confirmed - My Meds Pharmacy"
          description="Your order has been successfully placed. Thank you for choosing My Meds Pharmacy."
        />
        
        <div className="min-h-screen bg-[#D5C6BC]">
          <Header 
            onRefillClick={() => navigate('/', { state: { openRefillForm: true } })}
            onTransferClick={() => navigate('/', { state: { openTransferForm: true } })}
            onAppointmentClick={() => navigate('/', { state: { openAppointmentForm: true } })}
          />

          <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-white rounded-2xl p-8 shadow-xl">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
                <h1 className="text-3xl font-bold text-[#376F6B] mb-4">Order Confirmed!</h1>
                <p className="text-lg text-gray-600 mb-6">
                  Thank you for your order. We'll send you a confirmation email shortly.
                </p>
                <p className="text-sm text-gray-500 mb-8">
                  Redirecting you back to the shop...
                </p>
                <Button 
                  onClick={() => navigate('/shop')}
                  className="bg-[#57BBB6] hover:bg-[#376F6B] text-white"
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </div>

          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead 
        title="Checkout - My Meds Pharmacy"
        description="Complete your order securely with our trusted checkout process."
      />
      
      <div className="min-h-screen bg-[#D5C6BC]">
        <Header 
          onRefillClick={() => navigate('/', { state: { openRefillForm: true } })}
          onTransferClick={() => navigate('/', { state: { openTransferForm: true } })}
          onAppointmentClick={() => navigate('/', { state: { openAppointmentForm: true } })}
        />

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/shop')}
                className="text-[#376F6B] hover:text-[#57BBB6]"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Shop
              </Button>
              <h1 className="text-3xl font-bold text-[#376F6B]">Checkout</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Checkout Form */}
              <div className="lg:col-span-2">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Customer Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Customer Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Shipping Address */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Shipping Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="address1">Address Line 1 *</Label>
                        <Input
                          id="address1"
                          value={formData.address1}
                          onChange={(e) => handleInputChange('address1', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="address2">Address Line 2</Label>
                        <Input
                          id="address2"
                          value={formData.address2}
                          onChange={(e) => handleInputChange('address2', e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="city">City *</Label>
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State *</Label>
                          <Input
                            id="state"
                            value={formData.state}
                            onChange={(e) => handleInputChange('state', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="postcode">ZIP Code *</Label>
                          <Input
                            id="postcode"
                            value={formData.postcode}
                            onChange={(e) => handleInputChange('postcode', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment Method */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payment Method
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="card"
                            name="paymentMethod"
                            value="card"
                            checked={formData.paymentMethod === 'card'}
                            onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                            className="text-[#57BBB6]"
                          />
                          <Label htmlFor="card">Credit/Debit Card</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="paypal"
                            name="paymentMethod"
                            value="paypal"
                            checked={formData.paymentMethod === 'paypal'}
                            onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                            className="text-[#57BBB6]"
                          />
                          <Label htmlFor="paypal">PayPal</Label>
                        </div>

                        {/* Stripe Card Input - Only show when card is selected */}
                        {formData.paymentMethod === 'card' && (
                          <div className="mt-4 space-y-3">
                            <Label>Card Details *</Label>
                            <div className="p-3 border border-gray-300 rounded-lg bg-white">
                              <CardElement
                                options={{
                                  style: {
                                    base: {
                                      fontSize: '16px',
                                      color: '#424770',
                                      '::placeholder': {
                                        color: '#aab7c4',
                                      },
                                    },
                                    invalid: {
                                      color: '#9e2146',
                                    },
                                  },
                                }}
                              />
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 text-blue-700">
                                <Lock className="h-4 w-4" />
                                <span className="text-xs font-medium">Secure Payment</span>
                              </div>
                              <p className="text-xs text-blue-600 mt-1">
                                Your card details are encrypted and secure. We use Stripe for payment processing.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* PayPal Notice */}
                        {formData.paymentMethod === 'paypal' && (
                          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p className="text-sm text-yellow-800">
                              You will be redirected to PayPal to complete your payment.
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <span className="text-red-700">{error}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#57BBB6] hover:bg-[#376F6B] text-white py-4 text-lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Processing Order...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        Place Order
                      </>
                    )}
                  </Button>
                </form>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-8">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                    <CardDescription>{getCartItemCount()} item(s) in your cart</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Cart Items */}
                    <div className="space-y-3">
                      {cart.filter(item => item && item.id).map(item => (
                        <div key={item.id} className="flex gap-3">
                          <img
                            src={getProductImage(item)}
                            alt={item.name || 'Product'}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-sm line-clamp-2">{item.name || 'Unknown Product'}</h4>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                            <p className="text-sm font-medium">
                              {formatPrice(item.sale_price || item.price || '0')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Total */}
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-[#376F6B]">{formatPrice(getCartTotal().toString())}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}

// Wrapper component with Stripe Elements provider
export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>(location.state?.cart || []);

  // Load cart from localStorage if not provided via state
  useEffect(() => {
    if (!cart || cart.length === 0) {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          setCart(parsedCart);
        } catch (error) {
          console.error('Error parsing cart from localStorage:', error);
        }
      }
    }
  }, []);

  // Redirect if no cart items
  useEffect(() => {
    if (!cart || cart.length === 0) {
      const timer = setTimeout(() => {
        navigate('/shop');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [cart, navigate]);

  if (!cart || cart.length === 0) {
    return null;
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm cart={cart} />
    </Elements>
  );
}
