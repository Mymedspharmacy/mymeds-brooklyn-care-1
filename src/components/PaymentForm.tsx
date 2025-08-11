import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CreditCard, CheckCircle } from 'lucide-react';

interface PaymentFormProps {
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

const cardElementOptions = {
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
};

export const PaymentForm = ({ amount, onSuccess, onError }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get backend URL from env or fallback
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || loading) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create payment intent
      let response: Response;
      try {
        response = await fetch(`${backendUrl}/payments/create-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount }),
        });
      } catch (networkErr) {
        throw new Error('Network error. Please check your connection and try again.');
      }

      let data: { clientSecret?: string; error?: string };
      try {
        data = await response.json();
      } catch {
        throw new Error('Invalid server response. Please try again later.');
      }

      const { clientSecret, error: intentError } = data;

      if (!response.ok) {
        throw new Error(intentError || 'Failed to create payment intent.');
      }
      if (!clientSecret) {
        throw new Error('Payment could not be initiated. Please try again.');
      }

      // Confirm payment
      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
          },
        }
      );

      if (paymentError) {
        throw new Error(paymentError.message || 'Payment failed');
      }

      if (paymentIntent?.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      } else {
        throw new Error('Payment was not successful');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Card Details</label>
            <div className="border rounded-md p-3">
              <CardElement options={cardElementOptions} />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="text-center">
            <p className="text-lg font-semibold text-[#376f6b]">
              Total: ${amount.toFixed(2)}
            </p>
          </div>

          <Button
            type="submit"
            disabled={!stripe || loading}
            className="w-full bg-[#376f6b] hover:bg-[#2e8f88] text-white"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Pay ${amount.toFixed(2)}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}; 