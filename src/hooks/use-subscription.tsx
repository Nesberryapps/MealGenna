
'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useToast } from '@/components/ui/use-toast';
// We will implement the purchase service in the next stage.
// For now, we'll mock the functions.
// import { checkSubscription, restore } from '@/services/purchase';

interface SubscriptionContextType {
  isPro: boolean;
  isInitialized: boolean;
  restorePurchases: () => Promise<void>;
}

// Mock functions for now
const checkSubscription = async () => {
    console.log("Mocking subscription check. Defaulting to 'Free'.");
    return { isActive: false };
};

const restore = async () => {
    console.log("Mocking restore purchases.");
    // In a real scenario, this might return the user's new status
    return { isActive: false }; 
};


// This hook will manage the user's "Pro" subscription status.
export const useSubscription = () => {
  const [isPro, setIsPro] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  const checkStatus = useCallback(async () => {
    try {
      const { isActive } = await checkSubscription();
      setIsPro(isActive);
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      // Default to non-pro status on error
      setIsPro(false);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // On initial load, check the user's subscription status.
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const restorePurchases = async () => {
    toast({ title: 'Attempting to restore purchases...' });
    try {
      const { isActive } = await restore();
      setIsPro(isActive);
      if (isActive) {
        toast({
          title: 'Purchases Restored!',
          description: 'Your MealGenna Pro status has been restored.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'No Active Subscription Found',
          description: 'We could not find an active subscription to restore.',
        });
      }
    } catch (error: any) {
      console.error('Restore failed:', error);
      toast({
        variant: 'destructive',
        title: 'Restore Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    }
  };

  return { isPro, isInitialized, restorePurchases, checkStatus };
};
