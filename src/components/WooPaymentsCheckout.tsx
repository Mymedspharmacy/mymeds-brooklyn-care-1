import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CreditCard, CheckCircle, AlertCircle, Lock, Smartphone, Apple, Heart } from 'lucide-react';
import { WooCommerceCartItem } from '@/lib/woocommerceCart';
import { wooCommerceAPI } from '@/lib/woocommerce';

interface WooPaymentsCheckoutProps {
  cart: WooCommerceCartItem[];
  total: number;
  currency?: string;
  onSuccess: (orderId: number, paymentDetails: any) => void;
  onCancel: () => void;
}

export const WooPaymentsCheckout: React.FC<WooPaymentsCheckoutProps> = ({
  cart,
  total,
  currency = 'USD',
  onSuccess,
  onCancel
}) => {
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
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('woocommerce_payments');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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

    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create order data for WooPayments
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
        set_paid: false, // WooPayments will handle payment processing
        status: 'pending'
      };

      // Create order via WooCommerce API
      const response = await wooCommerceAPI.createOrder(orderData);
      
      if (response && response.order) {
        setPaymentSuccess(true);
        setOrderId(response.order.id);
        
        // WooPayments will handle the actual payment processing
        // The order will be updated when payment is completed
        onSuccess(response.order.id, {
          paymentMethod: selectedPaymentMethod,
          orderStatus: 'pending',
          paymentUrl: response.order.payment_url
        });
      } else {
        throw new Error('Failed to create order');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Order creation failed';
      setError(errorMessage);
      console.error('Order creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodTitle = (method: string) => {
    switch (method) {
      case 'woocommerce_payments':
        return 'Credit/Debit Card (WooPayments)';
      case 'ppcp-gateway':
        return 'PayPal Payments';
      case 'apple_pay':
        return 'Apple Pay';
      case 'google_pay':
        return 'Google Pay';
      default:
        return 'WooPayments';
    }
  };

  if (paymentSuccess && orderId) {
    return (
      <div className="space-y-6">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-green-700 mb-4">
              <CheckCircle className="h-6 w-6" />
              <h3 className="text-lg font-semibold">Order Created Successfully!</h3>
            </div>
            <div className="space-y-2 text-green-600">
              <p><strong>Order Number:</strong> #{orderId}</p>
              <p><strong>Payment Method:</strong> {getPaymentMethodTitle(selectedPaymentMethod)}</p>
              <p><strong>Total:</strong> ${total.toFixed(2)}</p>
              <p>You will be redirected to complete your payment securely.</p>
              <p>Thank you for shopping with MyMeds Pharmacy!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <form className="space-y-6">
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
          {/* WooPayments - Credit/Debit Cards */}
          <div 
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedPaymentMethod === 'woocommerce_payments' 
                ? 'border-[#57BBB6] bg-[#57BBB6]/5' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedPaymentMethod('woocommerce_payments')}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="paymentMethod"
                value="woocommerce_payments"
                checked={selectedPaymentMethod === 'woocommerce_payments'}
                onChange={() => setSelectedPaymentMethod('woocommerce_payments')}
                className="text-[#57BBB6] focus:ring-[#57BBB6]"
              />
              <CreditCard className="h-5 w-5 text-[#57BBB6]" />
              <div className="flex-1">
                <h4 className="font-medium">Credit/Debit Card</h4>
                <p className="text-sm text-gray-600">Visa, Mastercard, Amex, Discover</p>
              </div>
              <div className="flex gap-1">
                <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">V</div>
                <div className="w-8 h-5 bg-red-500 rounded text-white text-xs flex items-center justify-center font-bold">M</div>
                <div className="w-8 h-5 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">A</div>
              </div>
            </div>
          </div>

          {/* Apple Pay */}
          <div 
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedPaymentMethod === 'apple_pay' 
                ? 'border-[#57BBB6] bg-[#57BBB6]/5' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedPaymentMethod('apple_pay')}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="paymentMethod"
                value="apple_pay"
                checked={selectedPaymentMethod === 'apple_pay'}
                onChange={() => setSelectedPaymentMethod('apple_pay')}
                className="text-[#57BBB6] focus:ring-[#57BBB6]"
              />
              <Apple className="h-5 w-5 text-black" />
              <div className="flex-1">
                <h4 className="font-medium">Apple Pay</h4>
                <p className="text-sm text-gray-600">Pay securely with Touch ID or Face ID</p>
              </div>
            </div>
          </div>

          {/* Google Pay */}
          <div 
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedPaymentMethod === 'google_pay' 
                ? 'border-[#57BBB6] bg-[#57BBB6]/5' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedPaymentMethod('google_pay')}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="paymentMethod"
                value="google_pay"
                checked={selectedPaymentMethod === 'google_pay'}
                onChange={() => setSelectedPaymentMethod('google_pay')}
                className="text-[#57BBB6] focus:ring-[#57BBB6]"
              />
              <Smartphone className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <h4 className="font-medium">Google Pay</h4>
                <p className="text-sm text-gray-600">Quick and secure mobile payments</p>
              </div>
            </div>
          </div>

          {/* PayPal */}
          <div 
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedPaymentMethod === 'ppcp-gateway' 
                ? 'border-[#57BBB6] bg-[#57BBB6]/5' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedPaymentMethod('ppcp-gateway')}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="paymentMethod"
                value="ppcp-gateway"
                checked={selectedPaymentMethod === 'ppcp-gateway'}
                onChange={() => setSelectedPaymentMethod('ppcp-gateway')}
                className="text-[#57BBB6] focus:ring-[#57BBB6]"
              />
              <Heart className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <h4 className="font-medium">PayPal</h4>
                <p className="text-sm text-gray-600">Pay with PayPal, Venmo, or Pay Later</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-700 mb-2">
              <Lock className="h-4 w-4" />
              <span className="text-sm font-medium">Secure Payment</span>
            </div>
            <p className="text-xs text-blue-600">
              All payments are processed securely through WooPayments with bank-level encryption and fraud protection.
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
            <div className="flex justify-between items-center py-2 font-bold text-lg">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handlePayment}
          disabled={loading || !validateForm()}
          className="flex-1 bg-[#57BBB6] hover:bg-[#376F6B] text-white"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Pay ${total.toFixed(2)}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default WooPaymentsCheckout;
