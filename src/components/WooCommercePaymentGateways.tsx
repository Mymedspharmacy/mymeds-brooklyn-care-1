import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { CreditCard, Lock, Banknote } from 'lucide-react';
import { wooCommerceAPI } from '@/lib/woocommerce';

interface PaymentGateway {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  order: number;
}

interface WooCommercePaymentGatewaysProps {
  selectedMethod: string;
  onPaymentMethodChange: (method: string, title: string) => void;
}

export const WooCommercePaymentGateways: React.FC<WooCommercePaymentGatewaysProps> = ({
  selectedMethod,
  onPaymentMethodChange
}) => {
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentGateways = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const paymentGateways = await wooCommerceAPI.getPaymentGateways();
        
        // Filter and sort gateways
        const enabledGateways = paymentGateways
          .filter((gateway: any) => gateway.enabled)
          .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
        
        setGateways(enabledGateways);
        
        // Auto-select first gateway if none selected
        if (enabledGateways.length > 0 && !selectedMethod) {
          const firstGateway = enabledGateways[0];
          onPaymentMethodChange(firstGateway.id, firstGateway.title);
        }
        
      } catch (err) {
        console.error('Error fetching payment gateways:', err);
        setError(err instanceof Error ? err.message : 'Failed to load payment methods');
        
        // Fallback to default methods
        const fallbackGateways: PaymentGateway[] = [
          {
            id: 'bacs',
            title: 'Direct Bank Transfer',
            description: 'Pay via bank transfer',
            enabled: true,
            order: 1
          }
        ];
        setGateways(fallbackGateways);
        
        if (!selectedMethod) {
          onPaymentMethodChange('bacs', 'Direct Bank Transfer');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentGateways();
  }, [selectedMethod, onPaymentMethodChange]);

  const getGatewayIcon = (gatewayId: string) => {
    switch (gatewayId) {
      case 'stripe':
      case 'paypal':
        return <CreditCard className="h-4 w-4 text-[#57BBB6]" />;
      case 'bacs':
      case 'bank_transfer':
        return <Banknote className="h-4 w-4 text-[#57BBB6]" />;
      default:
        return <CreditCard className="h-4 w-4 text-[#57BBB6]" />;
    }
  };

  const getGatewayDescription = (gateway: PaymentGateway) => {
    if (gateway.description) return gateway.description;
    
    switch (gateway.id) {
      case 'stripe':
        return 'Pay securely with your credit card';
      case 'paypal':
        return 'Pay with PayPal';
      case 'bacs':
      case 'bank_transfer':
        return 'Pay via bank transfer';
      default:
        return 'Secure payment processing';
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Label>Payment Method *</Label>
        <div className="animate-pulse space-y-3">
          <div className="h-16 bg-gray-200 rounded-lg"></div>
          <div className="h-16 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error && gateways.length === 0) {
    return (
      <div className="space-y-3">
        <Label>Payment Method *</Label>
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Label>Payment Method *</Label>
      <div className="grid grid-cols-1 gap-3">
        {gateways.map((gateway) => (
          <div 
            key={gateway.id}
            className={`flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
              selectedMethod === gateway.id 
                ? 'border-[#57BBB6] bg-[#57BBB6]/5' 
                : 'border-gray-200'
            }`}
            onClick={() => onPaymentMethodChange(gateway.id, gateway.title)}
          >
            <input
              type="radio"
              id={gateway.id}
              name="paymentMethod"
              value={gateway.id}
              checked={selectedMethod === gateway.id}
              onChange={() => onPaymentMethodChange(gateway.id, gateway.title)}
              className="text-[#57BBB6] focus:ring-[#57BBB6]"
            />
            <label htmlFor={gateway.id} className="flex items-center gap-2 cursor-pointer flex-1">
              {getGatewayIcon(gateway.id)}
              <div className="flex-1">
                <span className="font-medium">{gateway.title}</span>
                <p className="text-sm text-gray-500">{getGatewayDescription(gateway)}</p>
              </div>
            </label>
          </div>
        ))}
      </div>
      
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 text-blue-700">
            <Lock className="h-5 w-5" />
            <span className="text-sm font-medium">
              Secure Payment Processing
            </span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            All payments are processed securely through WooCommerce's certified payment gateways.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
