
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';
import { useState } from "react";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: (priceId: string) => Promise<void>;
}

export function PaywallModal({ isOpen, onClose, onCheckout }: PaywallModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);
  
  const singlePackPriceId = process.env.NEXT_PUBLIC_STRIPE_SINGLE_PACK_PRICE_ID!;
  const planPackPriceId = process.env.NEXT_PUBLIC_STRIPE_PLAN_PACK_PRICE_ID!;

  const handlePurchaseClick = async (priceId: string) => {
    setIsLoading(true);
    setSelectedPriceId(priceId);
    await onCheckout(priceId);
    // The parent component handles the redirect, so we just set loading.
    // If it fails, the parent will toast and we can reset loading there if needed.
    // For now, assume redirect is imminent.
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
            setIsLoading(false);
            setSelectedPriceId(null);
            onClose();
        }
    }}>
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
      </DialogContent>
    </Dialog>
  );
}

    