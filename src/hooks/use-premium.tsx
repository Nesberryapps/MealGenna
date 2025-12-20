
'use client';

import { useState, useEffect, useCallback } from 'react';

const PREMIUM_EXPIRY_KEY = 'mealgenna_premium_expiry';

// This hook is now deprecated and will be replaced by useSubscription.
// It is kept for now to avoid breaking the app, but its logic is disabled.
export const usePremium = () => {
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [premiumExpiry, setPremiumExpiry] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // We can disable this logic for now as we transition to the new subscription model.
    // The new `useSubscription` hook will handle the "Pro" state.
    setIsInitialized(true); 
  }, []);

  const setPremium = useCallback(() => {
    // This function will be handled by the new subscription service.
    // For now, it does nothing.
  }, []);

  return { isPremium, setPremium, isInitialized, premiumExpiry };
};
