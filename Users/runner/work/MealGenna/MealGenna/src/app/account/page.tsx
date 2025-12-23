
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/use-subscription';
import { Badge } from '@/components/ui/badge';
import { Star, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { GoProModal } from '@/components/go-pro-modal';
import { useToast } from '@/components/ui/use-toast';

// Mock type for temporarily disabled feature
type PurchasesPackage = any;

export default function AccountPage() {
  const { isPro, isInitialized, restorePurchases, getOfferings, makePurchase } = useSubscription();
  const [isGoProModalOpen, setIsGoProModalOpen] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { toast } = useToast();

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      await restorePurchases();
    } catch (e) {
      // Error is handled in the hook
    } finally {
      setIsRestoring(false);
    }
  };

  const handlePurchase = async () => {
    setIsPurchasing(true);
    try {
      const offerings = await getOfferings();
      if (offerings && offerings.length > 0 && offerings[0].availablePackages.length > 0) {
        const monthlyPackage = offerings[0].availablePackages.find(p => p.identifier === '$rc_monthly');
        if (monthlyPackage) {
            await makePurchase(monthlyPackage as PurchasesPackage);
        } else {
             toast({
                variant: 'destructive',
                title: 'Purchase Unavailable',
                description: 'Could not find a monthly subscription to purchase.'
            });
        }
      } else {
        toast({
            variant: 'destructive',
            title: 'Purchase Unavailable',
            description: 'Could not find a subscription to purchase.'
        });
      }
    }
    finally {
        setIsPurchasing(false);
        setIsGoProModalOpen(false);
    }
  };
  
  const getStatusText = () => {
    if (!isInitialized) {
      return 'Loading subscription status...';
    }
    // Temporarily setting to false for clean build
    const tempIsPro = false;
    return tempIsPro ? 'You have an active MealGenna Pro subscription.' : 'You are currently on the Free plan.';
  };
  
  // Temporarily setting to false for clean build
  const tempIsPro = false;

  return (
    <div className="container py-12 md:py-20">
      <GoProModal isOpen={isGoProModalOpen} onClose={() => setIsGoProModalOpen(false)} onPurchase={handlePurchase} isLoading={isPurchasing} />

      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">Your Account</CardTitle>
          <CardDescription>
            Manage your subscription and app settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div>
              <p className="font-semibold">Subscription Status</p>
              <p className="text-sm text-muted-foreground">{getStatusText()}</p>
            </div>
            {isInitialized && (
              tempIsPro ? (
                <Badge variant="premium" className="text-base">
                  <Star className="mr-2 h-4 w-4" />
                  PRO
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-base">Free</Badge>
              )
            )}
          </div>
          {!tempIsPro && isInitialized && (
             <div className="p-6 rounded-lg bg-gradient-to-br from-primary/10 to-primary/20 text-center">
                <Star className="mx-auto h-8 w-8 text-primary mb-2"/>
                <h3 className="text-xl font-bold">Upgrade to MealGenna Pro</h3>
                <p className="text-muted-foreground mt-1 mb-4">Get unlimited, ad-free meal generations and more!</p>
                <Button onClick={() => setIsGoProModalOpen(true)}>
                    Upgrade for $4.99/month
                </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-col items-start gap-4">
           <p className="text-sm text-muted-foreground">
            If you have previously purchased a subscription on another device, you can restore it here.
          </p>
          <Button variant="outline" onClick={handleRestore} disabled={isRestoring}>
            {isRestoring ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isRestoring ? 'Restoring...' : 'Restore Purchases'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
