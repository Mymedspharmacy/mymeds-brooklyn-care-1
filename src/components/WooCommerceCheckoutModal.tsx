import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, MapPin, User, Mail, Phone, ShoppingCart, AlertCircle } from 'lucide-react';
import { WooCommerceCart } from '@/lib/woocommerceCart';
import api from '@/lib/api';

interface WooCommerceCheckoutModalProps {
  cart: WooCommerceCart | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (orderId: string) => void;
}

export const WooCommerceCheckoutModal: React.FC<WooCommerceCheckoutModalProps> = ({
  cart,
  isOpen,
  onClose,
  onSuccess
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
    country: 'US'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('bacs');

  // Load payment methods
  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        const response = await api.get('/woocommerce/payment-gateways');
        setPaymentMethods(response.data || []);
      } catch (err) {
        console.error('Error loading payment methods:', err);
        // Fallback to bank transfer
        setPaymentMethods([{ id: 'bacs', title: 'Bank Transfer', description: 'Pay via bank transfer' }]);
      }
    };

    if (isOpen) {
      loadPaymentMethods();
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

      if (!cart || !cart.items || cart.items.length === 0) {
        setError('Cart is empty');
        return;
      }

      setLoading(true);
      setError(null);

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
        line_items: cart.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        })),
        payment_method: selectedPaymentMethod,
        payment_method_title: paymentMethods.find(pm => pm.id === selectedPaymentMethod)?.title || 'Bank Transfer',
        set_paid: false,
        status: 'pending'
      };

      console.log('Creating order with data:', orderData);

      // Create order via backend API
      const response = await api.post('/woocommerce/orders', orderData);
      
      if (response.data && response.data.id) {
        onSuccess(response.data.id.toString());
        onClose();
        
        // Show success message
        alert(`Order #${response.data.id} created successfully! You will receive an email confirmation shortly.`);
      } else {
        throw new Error('Invalid response from server');
      }

    } catch (err: any) {
      console.error('Order creation error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!cart) return null;

  const cartTotal = cart.items.reduce((total, item) => total + (parseFloat(item.price.toString()) * item.quantity), 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-[#57BBB6]" />
            Checkout
          </DialogTitle>
          <DialogDescription>
            Complete your order by filling out the form below.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Summary */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <Badge variant="secondary">
                      ${(parseFloat(item.price.toString()) * item.quantity).toFixed(2)}
                    </Badge>
                  </div>
                ))}
                
                <div className="flex justify-between items-center pt-4 border-t-2">
                  <span className="text-lg font-bold">Total:</span>
                  <span className="text-lg font-bold text-[#57BBB6]">
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Checkout Form */}
          <div className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name *</label>
                    <Input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name *</label>
                    <Input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Address *</label>
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter street address"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">City *</label>
                    <Input
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Enter city"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">State *</label>
                    <Input
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="Enter state"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">ZIP Code *</label>
                    <Input
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      placeholder="Enter ZIP code"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Country</label>
                    <Input
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="Enter country"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={method.id}
                      name="paymentMethod"
                      value={method.id}
                      checked={selectedPaymentMethod === method.id}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      className="text-[#57BBB6]"
                    />
                    <label htmlFor={method.id} className="text-sm font-medium">
                      {method.title}
                    </label>
                    {method.description && (
                      <span className="text-sm text-gray-600">- {method.description}</span>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitOrder}
                disabled={loading}
                className="flex-1 bg-[#57BBB6] hover:bg-[#376F6B]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Place Order'
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
