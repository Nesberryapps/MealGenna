
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Zap } from "lucide-react";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  setPremium: (durationInHours: number) => void;
}

const CheckoutForm = ({ planType, setPremium, onClose }: { planType: 'single' | 'weekly', setPremium: (durationInHours: number) => void, onClose: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) {
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message || 'An unknown error occurred.');
      setIsLoading(false);
      return;
    }

    // Create PaymentIntent
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planType }),
    });

    const { clientSecret, error: backendError } = await res.json();
    if (backendError) {
        setErrorMessage(backendError);
        setIsLoading(false);
        return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message || 'Payment failed. Please try again.');
    } else {
      toast({
        title: 'Payment Successful!',
        description: 'Your premium access has been activated.',
      });
      const duration = planType === 'weekly' ? 7 * 24 : 24; // 7 days or 1 day
      setPremium(duration);
      onClose();
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
       <PaymentElement />
       {errorMessage && <Alert variant="destructive"><AlertDescription>{errorMessage}</AlertDescription></Alert>}
       <Button disabled={isLoading || !stripe} className="w-full">
         {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
         Pay
       </Button>
    </form>
  );
};


export function PaywallModal({ isOpen, onClose, setPremium }: PaywallModalProps) {
    const [selectedPlan, setSelectedPlan] = useState<'single' | 'weekly' | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handlePlanSelect = async (planType: 'single' | 'weekly') => {
        setIsLoading(true);
        setSelectedPlan(planType);
        
        try {
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planType }),
            });
            const { clientSecret, error } = await response.json();
            if (error) throw new Error(error);
            setClientSecret(clientSecret);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
            setSelectedPlan(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        onClose();
        setTimeout(() => {
            setSelectedPlan(null);
            setClientSecret(null);
        }, 300);
    }
    
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Unlock More Generations</DialogTitle>
          <DialogDescription className="text-center">
            You've used your free daily generation. Choose a pack to continue creating.
          </DialogDescription>
        </DialogHeader>

        {!selectedPlan ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <Card className="cursor-pointer hover:border-primary" onClick={() => handlePlanSelect('single')}>
                    <CardContent className="p-6 text-center">
                        <h3 className="text-lg font-semibold">Single Meal Pack</h3>
                        <p className="text-2xl font-bold">$1.99</p>
                        <p className="text-sm text-muted-foreground">5 generations, valid for 24 hours.</p>
                    </CardContent>
                </Card>
                 <Card className="cursor-pointer hover:border-primary" onClick={() => handlePlanSelect('weekly')}>
                    <CardContent className="p-6 text-center">
                        <h3 className="text-lg font-semibold">Weekly Plan Pack</h3>
                        <p className="text-2xl font-bold">$7.99</p>
                        <p className="text-sm text-muted-foreground">Unlimited generations for 7 days.</p>
                    </CardContent>
                </Card>
            </div>
        ) : (
            <div className="py-4">
                {clientSecret ? (
                     <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <CheckoutForm planType={selectedPlan} setPremium={setPremium} onClose={handleClose}/>
                    </Elements>
                ) : (
                    <div className="flex justify-center items-center h-24">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}
            </div>
        )}
        
        <DialogFooter className="sm:justify-center">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    