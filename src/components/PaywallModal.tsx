
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { CheckoutForm } from './CheckoutForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  const { toast } = useToast();
  const { user, firebaseUser, refreshCredits } = useAuth();
  
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const singlePackPriceId = process.env.NEXT_PUBLIC_STRIPE_SINGLE_PACK_PRICE_ID!;
  const planPackPriceId = process.env.NEXT_PUBLIC_STRIPE_PLAN_PACK_PRICE_ID!;

  useEffect(() => {
    if (!isOpen) {
        setTimeout(() => {
            setSelectedPriceId(null);
            setClientSecret(null);
            setIsLoading(false);
        }, 300);
    }
  }, [isOpen]);

  const handlePurchaseClick = async (priceId: string) => {
    if (!user || !firebaseUser) {
        toast({
            variant: "destructive",
            title: "Authentication Required",
            description: "Please go to the account page to sign in before making a purchase.",
        });
        onClose();
        return;
    }

    setIsLoading(true);
    setSelectedPriceId(priceId);

    try {
        const idToken = await firebaseUser.getIdToken();
        const response = await fetch('/api/stripe/payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`,
            },
            body: JSON.stringify({ 
                priceId,
                userId: firebaseUser.uid,
                userEmail: user.email,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(errorBody.error || 'Failed to create payment intent.');
        }

        const { clientSecret: newClientSecret } = await response.json();
        setClientSecret(newClientSecret);

    } catch (error: any) {
        console.error("Stripe payment intent error:", error);
        toast({
            variant: "destructive",
            title: "Purchase Failed",
            description: error.message || "Could not connect to Stripe. Please try again.",
        });
        setSelectedPriceId(null);
    } finally {
        setIsLoading(false);
    }
  };

  const appearance = {
    theme: 'night' as const,
    variables: {
      colorPrimary: '#10b981',
    },
  };
  
  const options = clientSecret ? {
    clientSecret,
    appearance,
  } : {};

  const handlePaymentSuccess = () => {
    toast({
        title: "Payment Successful!",
        description: "Your credits have been added. Refreshing your account.",
    });
    refreshCredits();
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg text-center">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Get More Generations</DialogTitle>
          <DialogDescription className="pt-2 text-base">
            {clientSecret 
              ? "Complete your secure purchase below." 
              : "Choose a one-time pack to continue creating on the web."
            }
          </DialogDescription>
        </DialogHeader>

        {clientSecret && stripePromise && options.clientSecret ? (
          <div className="pt-4">
            <Elements options={options} stripe={stripePromise}>
              <CheckoutForm onSuccess={handlePaymentSuccess} />
            </Elements>
          </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="p-6 border rounded-lg flex flex-col items-center justify-between">
                    <div className="text-center">
                        <h3 className="text-lg font-bold">Single Meal Pack</h3>
                        <p className="text-3xl font-extrabold my-2">$1.99</p>
                        <p className="text-muted-foreground">Get 5 generations for single meals.</p>
                    </div>
                    <Button onClick={() => handlePurchaseClick(singlePackPriceId)} disabled={isLoading} className="w-full mt-4">
                        {isLoading && selectedPriceId === singlePackPriceId ? <Loader2 className="h-4 w-4 animate-spin"/> : "Purchase"}
                    </Button>
                </div>
                <div className="p-6 border rounded-lg flex flex-col items-center justify-between">
                    <div className="text-center">
                        <h3 className="text-lg font-bold">7-Day Plan Pack</h3>
                        <p className="text-3xl font-extrabold my-2">$7.99</p>
                        <p className="text-muted-foreground">Get 1 full 7-day meal plan generation.</p>
                    </div>
                    <Button onClick={() => handlePurchaseClick(planPackPriceId)} disabled={isLoading} className="w-full mt-4">
                        {isLoading && selectedPriceId === planPackPriceId ? <Loader2 className="h-4 w-4 animate-spin"/> : "Purchase"}
                    </Button>
                </div>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
