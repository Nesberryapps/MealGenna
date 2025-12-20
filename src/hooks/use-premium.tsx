
'use client';

import { useState, useEffect, useCallback } from 'react';

const PREMIUM_EXPIRY_KEY = 'mealgenna_premium_expiry';

// This hook manages temporary premium access for web users who make a one-time purchase.
export const usePremium = () => {
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [premiumExpiry, setPremiumExpiry] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // On initial load, check for an existing premium session
  useEffect(() => {
    if (typeof window !== 'undefined') {
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
    }
    setIsInitialized(true);
  }, []);

  const setPremium = useCallback((durationInHours: number) => {
    if (typeof window !== 'undefined') {
      const now = new Date().getTime();
      const expiryTimestamp = now + durationInHours * 60 * 60 * 1000;
      localStorage.setItem(PREMIUM_EXPIRY_KEY, expiryTimestamp.toString());
      setIsPremium(true);
      setPremiumExpiry(expiryTimestamp);
    }
  }, []);

  return { isPremium, setPremium, isInitialized, premiumExpiry };
};

    