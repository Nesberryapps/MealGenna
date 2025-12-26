
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

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  const { toast } = useToast();
  const { firebaseUser } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);

  const singlePackPriceId = process.env.NEXT_PUBLIC_STRIPE_SINGLE_PACK_PRICE_ID!;
  const planPackPriceId = process.env.NEXT_PUBLIC_STRIPE_PLAN_PACK_PRICE_ID!;

  useEffect(() => {
    // Reset loading state when the modal is closed or opened
    if (!isOpen) {
      setTimeout(() => {
        setIsLoading(false);
        setSelectedPriceId(null);
      }, 300);
    }
  }, [isOpen]);

  const handleCheckout = async (priceId: string) => {
    setIsLoading(true);
    setSelectedPriceId(priceId);

    try {
      const idToken = firebaseUser ? await firebaseUser.getIdToken() : undefined;
      const userEmail = firebaseUser?.email; 

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken && { 'Authorization': `Bearer ${idToken}` }),
        },
        body: JSON.stringify({
          priceId,
          ...(userEmail && { userEmail }), 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not create checkout session.");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned.");
      }

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Purchase Failed",
        description: error.message,
      });
      setIsLoading(false);
      setSelectedPriceId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg text-center">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Get More Generations</DialogTitle>
          <DialogDescription className="pt-2 text-base">
            Choose a one-time pack to continue creating on the web.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="p-6 border rounded-lg flex flex-col items-center justify-between">
                <div className="text-center">
                    <h3 className="text-lg font-bold">Single Meal Pack</h3>
                    <p className="text-3xl font-extrabold my-2">$1.99</p>
                    <p className="text-muted-foreground">Get 5 generations for single meals.</p>
                </div>
                <Button onClick={() => handleCheckout(singlePackPriceId)} disabled={isLoading} className="w-full mt-4">
                    {isLoading && selectedPriceId === singlePackPriceId ? <Loader2 className="h-4 w-4 animate-spin"/> : "Purchase"}
                </Button>
            </div>
            <div className="p-6 border rounded-lg flex flex-col items-center justify-between">
                <div className="text-center">
                    <h3 className="text-lg font-bold">7-Day Plan Pack</h3>
                    <p className="text-3xl font-extrabold my-2">$7.99</p>
                    <p className="text-muted-foreground">Get 1 full 7-day meal plan generation.</p>
                </div>
                <Button onClick={() => handleCheckout(planPackPriceId)} disabled={isLoading} className="w-full mt-4">
                    {isLoading && selectedPriceId === planPackPriceId ? <Loader2 className="h-4 w-4 animate-spin"/> : "Purchase"}
                </Button>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
