
'use client';

import { useState, useEffect, useCallback } from 'react';

const PREMIUM_EXPIRY_KEY = 'mealgenna_premium_expiry';

// This hook manages the user's premium access state for single meal generations.
export const usePremium = () => {
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [premiumExpiry, setPremiumExpiry] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check for an active premium pass on initial load
  useEffect(() => {
    const expiryTimestamp = localStorage.getItem(PREMIUM_EXPIRY_KEY);
    if (expiryTimestamp) {
      const expiry = parseInt(expiryTimestamp, 10);
      if (new Date().getTime() < expiry) {
        setIsPremium(true);
        setPremiumExpiry(expiry);
      } else {
        // Clear expired pass from storage
        localStorage.removeItem(PREMIUM_EXPIRY_KEY);
      }
    }
    setIsInitialized(true);
  }, []);

  const setPremium = useCallback(() => {
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const expiry = new Date().getTime() + twentyFourHours;
    
    localStorage.setItem(PREMIUM_EXPIRY_KEY, expiry.toString());
    setIsPremium(true);
    setPremiumExpiry(expiry);
  }, []);

  return { isPremium, setPremium, isInitialized, premiumExpiry };
};
