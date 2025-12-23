
'use client';

// RevenueCat functionality has been temporarily disabled to debug the iOS build.

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Capacitor } from '@capacitor/core';

// Mock types to prevent build errors
type PurchasesOffering = any;
type PurchasesPackage = any;

interface SubscriptionContextType {
  isPro: boolean;
  isInitialized: boolean;
  restorePurchases: () => Promise<void>;
  getOfferings: () => Promise<PurchasesOffering[]>;
  makePurchase: (pkg: PurchasesPackage) => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [isPro] = useState<boolean>(false); // Default to false
  const [isInitialized] = useState(true); // Default to true
  const { toast } = useToast();

  const disabledAction = async (feature: string) => {
      if (Capacitor.getPlatform() !== 'web') {
        toast({ 
            variant: 'destructive',
            title: 'Temporarily Disabled',
            description: `${feature} is currently disabled for this build.`
        });
      }
  }

  const restorePurchases = async () => {
    await disabledAction('Restore Purchases');
  };
  
  const getOfferings = async (): Promise<PurchasesOffering[]> => {
    await disabledAction('In-App Purchases');
    return [];
  };

  const makePurchase = async (pkg: PurchasesPackage) => {
     await disabledAction('In-App Purchases');
  };

  const value = { 
    isPro, 
    isInitialized, 
    restorePurchases, 
    getOfferings,
    makePurchase,
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
