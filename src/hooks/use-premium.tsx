
'use client';

import { useState, useEffect, useCallback } from 'react';

const PREMIUM_EXPIRY_KEY = 'mealgenna_premium_expiry';

// This hook manages the user's premium access state.
// "Premium" here refers to the 24-hour pass for generating single meals.
export const usePremium = () => {
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [premiumExpiry, setPremiumExpiry] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // On initial load, check for an active premium session from local storage.
  useEffect(() => {
    const expiryTimestamp = localStorage.getItem(PREMIUM_EXPIRY_KEY);
    if (expiryTimestamp) {
      const expiry = parseInt(expiryTimestamp, 10);
      if (new Date().getTime() < expiry) {
        setIsPremium(true);
        setPremiumExpiry(expiry);
      } else {
        // Clear expired session
        localStorage.removeItem(PREMIUM_EXPIRY_KEY);
      }
    }
    setIsInitialized(true);
  }, []);

  // Grants a 24-hour premium pass.
  const setPremium = useCallback(() => {
    const newExpiry = new Date().getTime() + 24 * 60 * 60 * 1000; // 24 hours from now
    localStorage.setItem(PREMIUM_EXPIRY_KEY, newExpiry.toString());
    setIsPremium(true);
    setPremiumExpiry(newExpiry);
  }, []);

  return { isPremium, setPremium, isInitialized, premiumExpiry };
};
