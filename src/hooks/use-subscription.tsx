
'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Capacitor } from '@capacitor/core';
import {
  initializePurchases,
  checkSubscription,
  restorePurchases as RCRestore,
  getOfferings as RCGetOfferings,
  makePurchase as RCMakePurchase,
  addPurchaseUpdateListener
} from '@/services/purchase';
import type { PurchasesOffering, PurchasesPackage } from '@revenuecat/purchases-capacitor';

interface SubscriptionContextType {
  isPro: boolean;
  isInitialized: boolean;
  restorePurchases: () => Promise<void>;
  getOfferings: () => Promise<PurchasesOffering[]>;
  makePurchase: (pkg: PurchasesPackage) => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [isPro, setIsPro] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  const checkStatus = useCallback(async () => {
    if (Capacitor.getPlatform() !== 'web') {
      const proStatus = await checkSubscription();
      setIsPro(proStatus);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    initializePurchases().then(() => {
        checkStatus();
    });

    addPurchaseUpdateListener((proStatus) => {
      setIsPro(proStatus);
      if (proStatus) {
        toast({
          title: 'Subscription Updated',
          description: 'You are now a MealGenna Pro member!',
        });
      }
    });

  }, [checkStatus, toast]);

  const restorePurchases = async () => {
    if (Capacitor.getPlatform() === 'web') {
      toast({ title: 'Restore feature is only available on the mobile app.' });
      return;
    }
    try {
      const customerInfo = await RCRestore();
      if (customerInfo?.entitlements.active.pro) {
        setIsPro(true);
        toast({ title: 'Success!', description: 'Your Pro subscription has been restored.' });
      } else {
        toast({ variant: 'destructive', title: 'No Subscription Found', description: 'We couldn\'t find a previous purchase to restore.' });
      }
    } catch (e) {
      toast({ variant: 'destructive', title: 'Restore Failed', description: 'An error occurred while trying to restore your purchase.' });
    }
  };
  
  const handleGetOfferings = async (): Promise<PurchasesOffering[]> => {
    if (Capacitor.getPlatform() === 'web') {
      toast({ title: 'In-app purchases are only available on the mobile app.' });
      return [];
    }
    return await RCGetOfferings();
  };

  const handleMakePurchase = async (pkg: PurchasesPackage) => {
     if (Capacitor.getPlatform() === 'web') {
      toast({ title: 'In-app purchases are only available on the mobile app.' });
      return;
    }
    try {
      const customerInfo = await RCMakePurchase(pkg);
      if (customerInfo?.entitlements.active.pro) {
        setIsPro(true);
        toast({ title: 'Purchase Successful!', description: 'Welcome to MealGenna Pro!' });
      }
    } catch (e) {
       toast({ variant: 'destructive', title: 'Purchase Failed', description: 'Something went wrong. Please try again.' });
    }
  };

  const value = { 
    isPro, 
    isInitialized, 
    restorePurchases, 
    getOfferings: handleGetOfferings,
    makePurchase: handleMakePurchase,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};


export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
