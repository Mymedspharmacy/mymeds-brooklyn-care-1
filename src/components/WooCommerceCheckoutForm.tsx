import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CreditCard, CheckCircle, AlertCircle, Lock, ExternalLink } from 'lucide-react';
import { WooCommerceCartItem } from '@/lib/woocommerceCart';
import { wooCommerceAPI } from '@/lib/woocommerce';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import api from '@/lib/api';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface WooCommerceCheckoutFormProps {
  cart: WooCommerceCartItem[];
  total: number;
  currency?: string;
  onSuccess: (orderId: number, paymentDetails: any) => void;
  onCancel: () => void;
}

export const WooCommerceCheckoutForm: React.FC<WooCommerceCheckoutFormProps> = ({
  cart,
  total,
  currency = 'USD',
  onSuccess,
  onCancel
}) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentGateways, setPaymentGateways] = useState<any[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [loadingGateways, setLoadingGateways] = useState(true);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Load available payment gateways
  useEffect(() => {
    const loadPaymentGateways = async () => {
      try {
        setLoadingGateways(true);
        const gateways = await wooCommerceAPI.getPaymentGateways();
        console.log('Payment gateways loaded:', gateways);
        
        if (Array.isArray(gateways) && gateways.length > 0) {
          setPaymentGateways(gateways);
          // Set default payment method
          if (gateways.length > 0) {
            setSelectedPaymentMethod(gateways[0].id);
          }
        } else {
          console.warn('No payment gateways available');
          // Set default to bank transfer if no gateways available
          setSelectedPaymentMethod('bacs');
        }
      } catch (err) {
        console.error('Error loading payment gateways:', err);
        // Fallback to bank transfer
        setSelectedPaymentMethod('bacs');
        setError('Payment methods could not be loaded. Using bank transfer as default.');
      } finally {
        setLoadingGateways(false);
      }
    };

    loadPaymentGateways();
  }, []);

  const validateForm = () => {
    const requiredFields = ['firstName', 'lastName', 'email', 'address', 'city', 'state', 'zipCode'];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        setError(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        return false;
      }
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!selectedPaymentMethod) {
      setError('Please select a payment method');
      return false;
    }

    return true;
  };

  const handleSubmitOrder = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      setLoading(true);
      setError(null);

      console.log('Creating order with data:', { formData, selectedPaymentMethod, cart, total });

      // Check if Stripe payment is selected
      const isStripePayment = selectedPaymentMethod === 'stripe' || 
                             selectedPaymentMethod === 'stripe_gateway' ||
                             selectedPaymentMethod === 'stripe_cc';

      let paymentIntentId = null;

      // Process Stripe payment first if applicable
      if (isStripePayment) {
        if (!stripe || !elements) {
          setError('Stripe is not loaded. Please refresh the page and try again.');
          setLoading(false);
          return;
        }

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          setError('Card details are required for credit card payment.');
          setLoading(false);
          return;
        }

        try {
          // Create payment intent
          const paymentIntentResponse = await api.post('/stripe/create-payment-intent', {
            amount: Math.round(total * 100), // Convert to cents
            currency: currency.toLowerCase()
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
                  line1: formData.address,
                  city: formData.city,
                  state: formData.state,
                  postal_code: formData.zipCode,
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

          paymentIntentId = paymentIntent.id;
          console.log('✅ Stripe payment successful:', paymentIntentId);
        } catch (stripeErr) {
          console.error('Stripe payment error:', stripeErr);
          throw stripeErr;
        }
      }

      // Create order data for WooCommerce
      const orderData = {
        billing: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address_1: formData.address,
          city: formData.city,
          state: formData.state,
          postcode: formData.zipCode,
          country: formData.country
        },
        shipping: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          address_1: formData.address,
          city: formData.city,
          state: formData.state,
          postcode: formData.zipCode,
          country: formData.country
        },
        line_items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        })),
        customer_note: formData.notes || '',
        payment_method: selectedPaymentMethod,
        payment_method_title: getPaymentMethodTitle(selectedPaymentMethod),
        set_paid: isStripePayment && paymentIntentId ? true : false,
        status: isStripePayment && paymentIntentId ? 'processing' : 'pending',
        transaction_id: paymentIntentId || undefined
      };

      console.log('Order data prepared:', orderData);

      // Create order via WooCommerce API
      const response = await wooCommerceAPI.createOrder(orderData);
      
      console.log('Order creation response:', response);

      if (response && response.order) {
        const order = response.order;
        
        // If there's a payment URL, redirect to it
        if (order.payment_url) {
          window.open(order.payment_url, '_blank');
          onSuccess(order.id, {
            paymentMethod: selectedPaymentMethod,
            orderStatus: order.status,
            paymentUrl: order.payment_url
          });
        } else {
          // Direct success for orders without payment URL
          onSuccess(order.id, {
            paymentMethod: selectedPaymentMethod,
            orderStatus: order.status
          });
        }
      } else {
        throw new Error('Failed to create order - invalid response');
      }
    } catch (err) {
      console.error('Order creation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodTitle = (methodId: string) => {
    const gateway = paymentGateways.find(g => g.id === methodId);
    if (gateway) {
      return gateway.title;
    }
    
    // Fallback titles
    switch (methodId) {
      case 'bacs':
        return 'Direct Bank Transfer';
      case 'stripe':
        return 'Credit Card (Stripe)';
      case 'ppcp-gateway':
        return 'PayPal';
      case 'woocommerce_payments':
        return 'WooPayments';
      default:
        return methodId;
    }
  };

  const getPaymentMethodDescription = (methodId: string) => {
    switch (methodId) {
      case 'bacs':
        return 'Make your payment directly into our bank account. Please use your Order ID as the payment reference.';
      case 'stripe':
        return 'Pay securely with your credit or debit card.';
      case 'ppcp-gateway':
        return 'Pay with PayPal, Venmo, or Pay Later options.';
      case 'woocommerce_payments':
        return 'Pay with credit/debit card, Apple Pay, or Google Pay.';
      default:
        return 'Secure payment processing.';
    }
  };

  return (
    <div className="space-y-6">
      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Customer Information</CardTitle>
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
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Shipping Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="address">Street Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              required
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
              <Label htmlFor="zipCode">ZIP Code *</Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingGateways ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span>Loading payment methods...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Bank Transfer (Always available) */}
              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedPaymentMethod === 'bacs' 
                    ? 'border-[#57BBB6] bg-[#57BBB6]/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPaymentMethod('bacs')}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bacs"
                    checked={selectedPaymentMethod === 'bacs'}
                    onChange={() => setSelectedPaymentMethod('bacs')}
                    className="text-[#57BBB6] focus:ring-[#57BBB6]"
                  />
                  <CreditCard className="h-5 w-5 text-[#57BBB6]" />
                  <div className="flex-1">
                    <h4 className="font-medium">Direct Bank Transfer</h4>
                    <p className="text-sm text-gray-600">Pay directly to our bank account</p>
                  </div>
                </div>
              </div>

              {/* Dynamic Payment Gateways */}
              {paymentGateways.map((gateway) => (
                <div 
                  key={gateway.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedPaymentMethod === gateway.id 
                      ? 'border-[#57BBB6] bg-[#57BBB6]/5' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPaymentMethod(gateway.id)}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={gateway.id}
                      checked={selectedPaymentMethod === gateway.id}
                      onChange={() => setSelectedPaymentMethod(gateway.id)}
                      className="text-[#57BBB6] focus:ring-[#57BBB6]"
                    />
                    <CreditCard className="h-5 w-5 text-[#57BBB6]" />
                    <div className="flex-1">
                      <h4 className="font-medium">{gateway.title}</h4>
                      <p className="text-sm text-gray-600">{gateway.description || getPaymentMethodDescription(gateway.id)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stripe Card Input - Show when Stripe gateway is selected */}
          {(selectedPaymentMethod === 'stripe' || 
            selectedPaymentMethod === 'stripe_gateway' || 
            selectedPaymentMethod === 'stripe_cc' ||
            selectedPaymentMethod.includes('stripe')) && (
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
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-green-700">
                  <Lock className="h-4 w-4" />
                  <span className="text-xs font-medium">Secure Card Processing</span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Your card details are encrypted and securely processed by Stripe. We never store your card information.
                </p>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-700 mb-2">
              <Lock className="h-4 w-4" />
              <span className="text-sm font-medium">Secure Payment</span>
            </div>
            <p className="text-xs text-blue-600">
              {getPaymentMethodDescription(selectedPaymentMethod)}
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="notes">Special Instructions (Optional)</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Any special instructions for your order..."
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium">${(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
              </div>
            ))}
            <div className="flex justify-between items-center py-2 font-bold text-lg border-t-2">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 order-2 sm:order-1"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmitOrder}
          disabled={loading || loadingGateways || !validateForm()}
          className="flex-1 bg-[#57BBB6] hover:bg-[#376F6B] text-white order-1 sm:order-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating Order...
            </>
          ) : (
            <>
              <ExternalLink className="h-4 w-4 mr-2" />
              Place Order ${total.toFixed(2)}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// Wrapper with Stripe Elements provider
const WooCommerceCheckoutFormWrapper: React.FC<WooCommerceCheckoutFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <WooCommerceCheckoutForm {...props} />
    </Elements>
  );
};

export default WooCommerceCheckoutFormWrapper;