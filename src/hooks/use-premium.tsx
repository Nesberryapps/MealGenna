
'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { getFirestore, doc, onSnapshot, runTransaction, DocumentData } from 'firebase/firestore';
import { useAuth } from './use-auth';
import { app } from '@/lib/firebase-client';
import { useToast } from '@/components/ui/use-toast';
import { Capacitor } from '@capacitor/core';

interface Credits {
  single: number;
  '7-day-plan': number;
}

interface PremiumContextType {
  credits: Credits | null;
  isInitialized: boolean;
  hasFreebie: boolean;
  useCredit: (type: 'single' | '7-day-plan') => Promise<boolean>;
  useFreebie: () => void;
  refreshCredits: () => void;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

const FREEBIE_KEY = 'mealgenna_freebie_used';

export const PremiumProvider = ({ children }: { children: ReactNode }) => {
  const { firebaseUser, isInitialized: authInitialized } = useAuth();
  const [credits, setCredits] = useState<Credits | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasFreebie, setHasFreebie] = useState(true);
  const { toast } = useToast();
  const db = getFirestore(app);

  useEffect(() => {
    if (Capacitor.getPlatform() === 'web') {
      const freebieUsed = localStorage.getItem(FREEBIE_KEY);
      setHasFreebie(freebieUsed !== 'true');
    } else {
      setHasFreebie(false);
    }
  }, []);

  const fetchCredits = useCallback(() => {
    if (authInitialized && firebaseUser) {
      const creditsRef = doc(db, 'user_credits', firebaseUser.uid);
      const unsubscribe = onSnapshot(creditsRef, (snap) => {
        if (snap.exists()) {
          setCredits(snap.data() as Credits);
        } else {
          // If user exists but has no credits doc, create one.
          setCredits({ single: 0, '7-day-plan': 0 });
        }
        if (!isInitialized) setIsInitialized(true);
      }, (error) => {
        console.error("Error fetching credits:", error);
        setCredits({ single: 0, '7-day-plan': 0 });
        if (!isInitialized) setIsInitialized(true);
      });
      return unsubscribe;
    } else if (authInitialized) {
      // User is not logged in
      setCredits(null);
      if (!isInitialized) setIsInitialized(true);
    }
    return () => {};
  }, [firebaseUser, authInitialized, db, isInitialized]);

  useEffect(() => {
    const unsubscribe = fetchCredits();
    return () => unsubscribe();
  }, [fetchCredits]);

  const useCredit = useCallback(async (type: 'single' | '7-day-plan') => {
    if (!firebaseUser) {
      toast({ variant: 'destructive', title: 'Please sign in to use credits.' });
      return false;
    }

    const creditsRef = doc(db, 'user_credits', firebaseUser.uid);

    try {
      await runTransaction(db, async (transaction) => {
        const userCreditsSnap = await transaction.get(creditsRef);
        
        let currentCredits: Credits = { single: 0, '7-day-plan': 0 };
        if (userCreditsSnap.exists()) {
          currentCredits = userCreditsSnap.data() as Credits;
        }

        if ((currentCredits[type] || 0) > 0) {
          currentCredits[type] -= 1;
          transaction.set(creditsRef, currentCredits, { merge: true });
        } else {
          throw new Error(`No credits of type "${type}" available.`);
        }
      });
      toast({ title: 'Credit Used', description: 'Your meal is being generated.' });
      return true;
    } catch (error: any) {
      console.error("Failed to use credit:", error);
      toast({ variant: 'destructive', title: 'Out of Credits', description: `You have no ${type === 'single' ? 'Single Meal' : 'Meal Plan'} credits left.` });
      return false;
    }
  }, [firebaseUser, db, toast]);
  
  const useFreebie = () => {
    if (Capacitor.getPlatform() === 'web' && hasFreebie) {
      localStorage.setItem(FREEBIE_KEY, 'true');
      setHasFreebie(false);
      toast({ title: 'Free Generation Used', description: 'Your first one is on the house!' });
    }
  };

  const refreshCredits = () => {
    fetchCredits();
  };

  const value = {
    credits,
    isInitialized,
    hasFreebie,
    useCredit,
    useFreebie,
    refreshCredits,
  };

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
};

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (context === undefined) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
};
