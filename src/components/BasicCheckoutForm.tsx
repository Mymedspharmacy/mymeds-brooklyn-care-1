import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle, AlertCircle, Mail, Phone } from 'lucide-react';
import { WooCommerceCartItem } from '@/lib/woocommerceCart';

interface BasicCheckoutFormProps {
  cart: WooCommerceCartItem[];
  total: number;
  onSuccess: (orderDetails: any) => void;
  onCancel: () => void;
}

export const BasicCheckoutForm: React.FC<BasicCheckoutFormProps> = ({
  cart,
  total,
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
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>('');

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

  const handleSubmitOrder = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      setLoading(true);
      setError(null);

      // Generate a simple order number
      const orderNumber = `MM-${Date.now()}`;
      setOrderNumber(orderNumber);

      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create order details
      const orderDetails = {
        orderNumber,
        customer: formData,
        items: cart,
        total,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };

      console.log('Order created:', orderDetails);
      
      setOrderSuccess(true);
      onSuccess(orderDetails);

    } catch (err) {
      console.error('Order creation error:', err);
      setError('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="space-y-6">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-green-700 mb-4">
              <CheckCircle className="h-6 w-6" />
              <h3 className="text-lg font-semibold">Order Submitted Successfully!</h3>
            </div>
            <div className="space-y-2 text-green-600">
              <p><strong>Order Number:</strong> {orderNumber}</p>
              <p><strong>Total:</strong> ${total.toFixed(2)}</p>
              <p><strong>Status:</strong> Pending Review</p>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Next Steps:</strong>
                </p>
                <ul className="text-sm text-blue-600 mt-1 space-y-1">
                  <li>• Our team will review your order</li>
                  <li>• You'll receive payment instructions via email</li>
                  <li>• We'll contact you to arrange payment and delivery</li>
                </ul>
              </div>
              <p className="text-sm mt-4">
                Thank you for shopping with MyMeds Pharmacy!
              </p>
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
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Information
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
              <Label htmlFor="phone">Phone Number *</Label>
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

      {/* Delivery Address */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Delivery Address
          </CardTitle>
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

      {/* Order Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Special Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="notes">Additional Notes (Optional)</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Any special delivery instructions or notes..."
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

      {/* Payment Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg text-blue-700">Payment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-blue-600">
              <strong>Payment Method:</strong> Contact After Order Confirmation
            </p>
            <div className="bg-white p-3 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                <strong>How it works:</strong>
              </p>
              <ul className="text-sm text-blue-600 mt-1 space-y-1">
                <li>1. Submit your order below</li>
                <li>2. Our team will review and confirm availability</li>
                <li>3. We'll contact you to arrange payment</li>
                <li>4. Payment can be made via cash, card, or bank transfer</li>
                <li>5. Delivery will be arranged after payment confirmation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

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
          onClick={handleSubmitOrder}
          disabled={loading || !validateForm()}
          className="flex-1 bg-[#57BBB6] hover:bg-[#376F6B] text-white"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting Order...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Submit Order ${total.toFixed(2)}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default BasicCheckoutForm;
