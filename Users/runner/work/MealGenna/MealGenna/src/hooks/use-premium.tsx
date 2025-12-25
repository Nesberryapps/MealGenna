
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
  useCredit: (type: 'single' | '7-day-plan') => Promise<void>;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export const PremiumProvider = ({ children }: { children: ReactNode }) => {
  const { firebaseUser, isInitialized: authInitialized } = useAuth();
  const [credits, setCredits] = useState<Credits | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const db = getFirestore(app);

  useEffect(() => {
    if (authInitialized && firebaseUser) {
      const creditsRef = doc(db, 'user_credits', firebaseUser.uid);
      const unsubscribe = onSnapshot(creditsRef, (snap) => {
        if (snap.exists()) {
          setCredits(snap.data() as Credits);
        } else {
          setCredits({ single: 1, '7-day-plan': 0 });
        }
        setIsInitialized(true);
      });
      return () => unsubscribe();
    } else if (authInitialized && !firebaseUser) {
        setCredits({ single: 1, '7-day-plan': 0 });
        setIsInitialized(true);
    }
  }, [firebaseUser, authInitialized, db]);
  
  const useCredit = useCallback(async (type: 'single' | '7-day-plan') => {
    if (!firebaseUser) {
      throw new Error("User must be logged in to use a credit.");
    }
    
    const creditsRef = doc(db, 'user_credits', firebaseUser.uid);

    await runTransaction(db, async (transaction) => {
      const userCreditsSnap = await transaction.get(creditsRef);
      let currentCredits: Credits = { single: 1, '7-day-plan': 0 };

      if (userCreditsSnap.exists()) {
        currentCredits = userCreditsSnap.data() as Credits;
      }

      if ((currentCredits[type] ?? 0) > 0) {
        currentCredits[type] -= 1;
        transaction.set(creditsRef, currentCredits, { merge: true });
      } else {
        throw new Error(`No credits of type "${type}" available.`);
      }
    });

  }, [firebaseUser, db]);


  const value = {
    credits,
    isInitialized,
    useCredit,
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
