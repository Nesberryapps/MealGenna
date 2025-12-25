
'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { getFirestore, doc, onSnapshot, runTransaction } from 'firebase/firestore';
import { useAuth } from './use-auth';
import { app } from '@/lib/firebase-client';

interface Credits {
  single: number;
  '7-day-plan': number;
}

interface PremiumContextType {
  credits: Credits | null;
  isInitialized: boolean;
  useCredit: (type: 'single' | '7-day-plan') => Promise<{ success: boolean; message: string }>;
  refreshCredits: () => void;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export const PremiumProvider = ({ children }: { children: ReactNode }) => {
  const { firebaseUser, isInitialized: authInitialized } = useAuth();
  const [credits, setCredits] = useState<Credits | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const db = getFirestore(app);

  const fetchCredits = useCallback(() => {
    if (authInitialized && firebaseUser) {
      const creditsRef = doc(db, 'user_credits', firebaseUser.uid);
      const unsubscribe = onSnapshot(creditsRef, (snap) => {
        if (snap.exists()) {
          setCredits(snap.data() as Credits);
        } else {
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
      setCredits(null);
      if (!isInitialized) setIsInitialized(true);
    }
    return () => {};
  }, [firebaseUser, authInitialized, db, isInitialized]);

  useEffect(() => {
    const unsubscribe = fetchCredits();
    return () => unsubscribe();
  }, [fetchCredits]);

  const useCredit = useCallback(async (type: 'single' | '7-day-plan'): Promise<{ success: boolean; message: string }> => {
    if (!firebaseUser) {
      return { success: false, message: 'Please sign in to use credits.' };
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
      return { success: true, message: 'Credit Used. Your meal is being generated.' };
    } catch (error: any) {
      console.error("Failed to use credit:", error);
      const friendlyType = type === 'single' ? 'Single Meal' : 'Meal Plan';
      return { success: false, message: `You have no ${friendlyType} credits left.` };
    }
  }, [firebaseUser, db]);

  const refreshCredits = () => {
    // This is a bit of a hack to force a re-fetch.
    // A better implementation might use a different state to trigger the effect.
    if(firebaseUser) {
        const creditsRef = doc(db, 'user_credits', firebaseUser.uid);
        onSnapshot(creditsRef, (snap) => {
            if (snap.exists()) {
                setCredits(snap.data() as Credits);
            } else {
                setCredits({ single: 0, '7-day-plan': 0 });
            }
        });
    }
  };
  
  const value = {
    credits,
    isInitialized,
    useCredit,
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
