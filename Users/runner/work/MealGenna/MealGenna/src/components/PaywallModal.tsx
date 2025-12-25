
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
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import Link from 'next/link';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  const [isRedirecting, setIsRedirecting] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, firebaseUser } = useAuth();
  
  const singlePackPriceId = process.env.NEXT_PUBLIC_STRIPE_SINGLE_PACK_PRICE_ID!;
  const planPackPriceId = process.env.NEXT_PUBLIC_STRIPE_PLAN_PACK_PRICE_ID!;

  const handlePurchase = async (priceId: string) => {
    if (!user || !firebaseUser) {
        toast({
            variant: "destructive",
            title: "Authentication Required",
            description: "Please go to the account page to sign in before making a purchase.",
        });
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
                priceId,
                userId: firebaseUser.uid,
                userEmail: user.email,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(errorBody.error || 'Failed to create checkout session.');
        }

        const { url } = await response.json();
        if (!url) {
            throw new Error('Could not retrieve checkout URL.');
        }

        window.location.href = url;

    } catch (error: any) {
        console.error("Stripe checkout error:", error);
        toast({
            variant: "destructive",
            title: "Purchase Failed",
            description: error.message || "Could not connect to Stripe. Please try again.",
        });
        setIsRedirecting(null);
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

        <DialogFooter className="sm:justify-center flex-col items-center">
            <p className="text-sm text-muted-foreground">Or get unlimited ad-supported generations on our mobile app!</p>
             <div className="flex gap-4 justify-center">
              <Link href="https://play.google.com/store/apps/details?id=com.nesberry.mealgenna.pro" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-105">
                <img 
                  src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" 
                  alt="Get it on Google Play" 
                  className="h-12 w-auto"
                />
              </Link>
  
              <Link href="https://apps.apple.com/us/app/mealgenna-pro/id6503874984" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-105">
                <img 
                  src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" 
                  alt="Download on the App Store" 
                  className="h-12 w-auto"
                />
              </Link>
            </div>
          <Button type="button" variant="ghost" onClick={onClose} className="mt-4">
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
