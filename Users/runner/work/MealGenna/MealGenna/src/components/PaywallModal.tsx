
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
import { Loader2, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  const { toast } = useToast();
  const { user, firebaseUser } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [emailForPurchase, setEmailForPurchase] = useState('');
  const [showEmailStep, setShowEmailStep] = useState(false);
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);

  const singlePackPriceId = process.env.NEXT_PUBLIC_STRIPE_SINGLE_PACK_PRICE_ID!;
  const planPackPriceId = process.env.NEXT_PUBLIC_STRIPE_PLAN_PACK_PRICE_ID!;

  useEffect(() => {
    if (isOpen && user?.email) {
      setEmailForPurchase(user.email);
    }
  }, [isOpen, user]);

  useEffect(() => {
    // Reset state when the modal is closed
    if (!isOpen) {
      setTimeout(() => {
        setIsLoading(false);
        setEmailForPurchase('');
        setShowEmailStep(false);
        setSelectedPriceId(null);
      }, 300);
    }
  }, [isOpen]);

  const handlePurchaseClick = (priceId: string) => {
    if (!user) {
      setShowEmailStep(true);
      setSelectedPriceId(priceId);
    } else {
      handleCheckout(priceId, user.email);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPriceId) return; // Should not happen
    await handleCheckout(selectedPriceId, emailForPurchase);
  };
  
  const handleCheckout = async (priceId: string, email: string) => {
    setIsLoading(true);
    try {
      const idToken = firebaseUser ? await firebaseUser.getIdToken() : undefined;
      
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken && { 'Authorization': `Bearer ${idToken}` }),
        },
        body: JSON.stringify({
          priceId,
          userEmail: email, // Use the provided/guest email
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not create checkout session.");
      }

      if (data.url) {
        // In a real app, you would also trigger sending the magic link here
        // if it's a new guest user. For now, the backend handles this.
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
    }
  };


  const renderContent = () => {
    if (showEmailStep) {
      return (
        <form onSubmit={handleEmailSubmit} className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
                Enter your email to create an account and proceed to checkout. A magic sign-in link will be sent to your inbox.
            </p>
            <div className="flex gap-2">
                <Input
                    type="email"
                    placeholder="your@email.com"
                    value={emailForPurchase}
                    onChange={e => setEmailForPurchase(e.target.value)}
                    disabled={isLoading}
                    required
                />
                <Button type="submit" disabled={isLoading || !emailForPurchase}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                    <span className="sr-only">Proceed to Checkout</span>
                </Button>
            </div>
            <Button variant="link" onClick={() => { setShowEmailStep(false); setSelectedPriceId(null); }}>Back</Button>
        </form>
      );
    }

    return (
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
    );
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
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
