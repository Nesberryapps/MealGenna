
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/use-auth';
import { usePremium } from '@/hooks/use-premium';
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  const { user, firebaseUser } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState<string | null>(null);
  const { toast } = useToast();

  const handlePurchase = async (priceId: string) => {
    if (!user || !firebaseUser) {
      toast({ variant: 'destructive', title: 'You must be signed in to make a purchase.' });
      return;
    }

    setIsRedirecting(priceId);

    try {
      const idToken = await firebaseUser.getIdToken();
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ 
          priceId: priceId,
          userId: firebaseUser.uid,
          userEmail: user.email,
        }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('Failed to create Stripe session.');
      }
    } catch (error) {
      console.error('Stripe redirect error:', error);
      toast({
        variant: 'destructive',
        title: 'Purchase Failed',
        description: 'Could not redirect to Stripe. Please try again.',
      });
      setIsRedirecting(null);
    }
  };
  
  const singlePackPriceId = process.env.NEXT_PUBLIC_STRIPE_SINGLE_PACK_PRICE_ID!;
  const planPackPriceId = process.env.NEXT_PUBLIC_STRIPE_PLAN_PACK_PRICE_ID!;


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg text-center">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Get More Generations</DialogTitle>
          <DialogDescription className="pt-2 text-base">
            You're out of free generations. Choose a one-time pack to continue creating.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="p-6 border rounded-lg flex flex-col items-center justify-between">
                <div className="text-center">
                    <h3 className="text-lg font-bold">Single Meal Pack</h3>
                    <p className="text-3xl font-extrabold my-2">$1.99</p>
                    <p className="text-muted-foreground">Get 5 generations for single meals.</p>
                </div>
                 <Button onClick={() => handlePurchase(singlePackPriceId)} disabled={!!isRedirecting} className="w-full mt-4">
                    {isRedirecting === singlePackPriceId ? <Loader2 className="h-4 w-4 animate-spin"/> : "Purchase"}
                 </Button>
            </div>
            <div className="p-6 border rounded-lg flex flex-col items-center justify-between">
                <div className="text-center">
                    <h3 className="text-lg font-bold">Full Meal Plan Pack</h3>
                    <p className="text-3xl font-extrabold my-2">$7.99</p>
                    <p className="text-muted-foreground">Get 1 full 7-day meal plan generation.</p>
                </div>
                 <Button onClick={() => handlePurchase(planPackPriceId)} disabled={!!isRedirecting} className="w-full mt-4">
                    {isRedirecting === planPackPriceId ? <Loader2 className="h-4 w-4 animate-spin"/> : "Purchase"}
                 </Button>
            </div>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button type="button" variant="ghost" onClick={onClose}>
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
