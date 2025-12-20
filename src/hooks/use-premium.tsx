
'use client';

import { useState, useEffect, useCallback } from 'react';

const CREDITS_KEY = 'mealgenna_web_credits';

// This hook manages generation credits for web users who make a one-time purchase.
export const usePremium = () => {
  const [credits, setCredits] = useState({ single: 0, plan: 0 });
  const [isInitialized, setIsInitialized] = useState(false);

  // On initial load, check for existing credits
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCredits = localStorage.getItem(CREDITS_KEY);
      if (storedCredits) {
        setCredits(JSON.parse(storedCredits));
      } else {
        // Give new users 1 free single generation
        setCredits({ single: 1, plan: 0 });
        localStorage.setItem(CREDITS_KEY, JSON.stringify({ single: 1, plan: 0 }));
      }
    }
    setIsInitialized(true);
  }, []);

  const addCredits = useCallback((planType: 'single' | 'weekly') => {
    if (typeof window !== 'undefined') {
      const currentCredits = JSON.parse(localStorage.getItem(CREDITS_KEY) || '{"single":0,"plan":0}');
      
      const newCredits = {
        single: currentCredits.single + (planType === 'single' ? 5 : 0),
        plan: currentCredits.plan + (planType === 'weekly' ? 1 : 0),
      };

      localStorage.setItem(CREDITS_KEY, JSON.stringify(newCredits));
      setCredits(newCredits);
    }
  }, []);

  return { credits, addCredits, isInitialized };
};

    