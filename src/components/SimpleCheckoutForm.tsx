import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CreditCard, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { WooCommerceCartItem } from '@/lib/woocommerceCart';
import { wooCommerceAPI } from '@/lib/woocommerce';

interface SimpleCheckoutFormProps {
  cart: WooCommerceCartItem[];
  total: number;
  currency?: string;
  onSuccess: (orderId: number, paymentDetails: any) => void;
  onCancel: () => void;
}

export const SimpleCheckoutForm: React.FC<SimpleCheckoutFormProps> = ({
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
    try {
      if (!validateForm()) {
        return;
      }

      setLoading(true);
      setError(null);

      console.log('Starting order creation...', { formData, cart, total });

      // Create order data
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
        payment_method: 'bacs',
        payment_method_title: 'Direct Bank Transfer',
        set_paid: false,
        status: 'pending'
      };

      console.log('Order data prepared:', orderData);

      // Create order via WooCommerce API
      const response = await wooCommerceAPI.createOrder(orderData);
      
      console.log('Order creation response:', response);

      if (response && response.order) {
        setPaymentSuccess(true);
        setOrderId(response.order.id);
        
        onSuccess(response.order.id, {
          paymentMethod: 'bacs',
          orderStatus: 'pending',
          paymentUrl: response.order.payment_url
        });
      } else {
        throw new Error('Failed to create order - no order data returned');
      }
    } catch (err) {
      console.error('Order creation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Order creation failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
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
              <p><strong>Payment Method:</strong> Direct Bank Transfer</p>
              <p><strong>Total:</strong> ${total.toFixed(2)}</p>
              <p>You will receive payment instructions via email.</p>
              <p>Thank you for shopping with MyMeds Pharmacy!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border border-[#57BBB6] bg-[#57BBB6]/5 rounded-lg">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-[#57BBB6]" />
              <div className="flex-1">
                <h4 className="font-medium">Direct Bank Transfer</h4>
                <p className="text-sm text-gray-600">You will receive payment instructions via email</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-700 mb-2">
              <Lock className="h-4 w-4" />
              <span className="text-sm font-medium">Secure Order</span>
            </div>
            <p className="text-xs text-blue-600">
              Your order information is secure. Payment instructions will be sent to your email.
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
              Creating Order...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Place Order ${total.toFixed(2)}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SimpleCheckoutForm;
