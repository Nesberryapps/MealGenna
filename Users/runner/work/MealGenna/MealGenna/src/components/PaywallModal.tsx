
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
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  const [isRedirecting, setIsRedirecting] = useState<string | null>(null);
  const { toast } = useToast();

  const handlePurchase = async (priceId: string) => {
    // This is a placeholder for now. We will add auth and Stripe logic in the next stage.
    setIsRedirecting(priceId);
    toast({
      title: "Redirecting to Checkout",
      description: "This will be connected to Stripe in the next step.",
    });
    // In the future, this will redirect to Stripe
    setTimeout(() => {
        setIsRedirecting(null);
        onClose();
    }, 2000);
  };
  
  const singlePackPriceId = 'price_1PQ1QpGzFq7L3g1fXXXXXXX'; // Placeholder
  const planPackPriceId = 'price_1PQ1RAGzFq7L3g1fYYYYYYY'; // Placeholder


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg text-center">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Get More Generations</DialogTitle>
          <DialogDescription className="pt-2 text-base">
            Choose a one-time pack to continue creating.
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
