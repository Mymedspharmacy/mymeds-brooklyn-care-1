import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { env } from '@/lib/env';

interface CheckoutItem {
  productId: number;
  name: string;
  quantity: number;
  price: number;
}

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    address1: string;
    address2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
}

interface WooCommerceCheckoutProps {
  items: CheckoutItem[];
  onSuccess: (orderId: string) => void;
  onError: (error: string) => void;
}

export const WooCommerceCheckout: React.FC<WooCommerceCheckoutProps> = ({
  items,
  onSuccess,
  onError
}) => {
  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      address1: '',
      address2: '',
      city: '',
      state: '',
      postcode: '',
      country: 'US'
    }
  });

  const { toast } = useToast();

  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setCustomerInfo(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof CustomerInfo],
          [child]: value
        }
      }));
    } else {
      setCustomerInfo(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${env.API_URL}/api/woocommerce-payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          })),
          customerInfo,
          totalAmount,
          paymentMethod: 'woocommerce'
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Order Created',
          description: 'Your order has been created successfully. Redirecting to checkout...',
        });

        // Redirect to WooCommerce checkout
        if (data.wooCommerceOrder?.checkoutUrl) {
          window.location.href = data.wooCommerceOrder.checkoutUrl;
        }

        onSuccess(data.order.id);
      } else {
        throw new Error(data.error || 'Failed to create order');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Checkout</CardTitle>
        <CardDescription>
          Complete your order using WooCommerce secure checkout
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Summary */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Order Summary</h3>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>{item.name} x {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="font-semibold">Customer Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={customerInfo.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={customerInfo.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="space-y-4">
            <h3 className="font-semibold">Shipping Address</h3>
            
            <div>
              <Label htmlFor="address1">Address Line 1 *</Label>
              <Input
                id="address1"
                value={customerInfo.address.address1}
                onChange={(e) => handleInputChange('address.address1', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="address2">Address Line 2</Label>
              <Input
                id="address2"
                value={customerInfo.address.address2}
                onChange={(e) => handleInputChange('address.address2', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={customerInfo.address.city}
                  onChange={(e) => handleInputChange('address.city', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={customerInfo.address.state}
                  onChange={(e) => handleInputChange('address.state', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="postcode">Postal Code *</Label>
                <Input
                  id="postcode"
                  value={customerInfo.address.postcode}
                  onChange={(e) => handleInputChange('address.postcode', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Select
                value={customerInfo.address.country}
                onValueChange={(value) => handleInputChange('address.country', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="GB">United Kingdom</SelectItem>
                  <SelectItem value="AU">Australia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Creating Order...' : `Proceed to Checkout - $${totalAmount.toFixed(2)}`}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            You will be redirected to WooCommerce's secure checkout page to complete your payment.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
