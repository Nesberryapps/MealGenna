
'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, signInWithCustomToken, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, runTransaction } from 'firebase/firestore';
import { app } from '@/lib/firebase-client';
import { Capacitor } from '@capacitor/core';
import { useToast } from '@/components/ui/use-toast';

interface Credits {
  single: number;
  '7-day-plan': number;
}

interface AuthContextType {
  user: { email: string } | null;
  firebaseUser: FirebaseUser | null;
  credits: Credits | null;
  isInitialized: boolean;
  hasFreebie: boolean;
  useFreebie: () => void;
  useCredit: (type: 'single' | '7-day-plan') => Promise<{ success: boolean; message: string }>;
  beginRecovery: (email: string) => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<void>;
  refreshCredits: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const FREEBIE_KEY = 'mealgenna_freebie_used_v2';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasFreebie, setHasFreebie] = useState(true);
  
  const auth = getAuth(app);
  const db = getFirestore(app);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined' && Capacitor.getPlatform() === 'web') {
      const freebieUsed = localStorage.getItem(FREEBIE_KEY);
      setHasFreebie(freebieUsed !== 'true');
    } else {
      setHasFreebie(false); // No freebies on mobile
    }
  }, []);

  const useFreebie = () => {
    if (Capacitor.getPlatform() === 'web' && hasFreebie) {
      localStorage.setItem(FREEBIE_KEY, 'true');
      setHasFreebie(false);
    }
  };

  const verifySignInLink = useCallback(async (href: string) => {
    if (auth.isSignInWithEmailLink(href)) {
      try {
        const response = await fetch('/api/account/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: href }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Invalid or expired sign-in link.');

        await signInWithCustomToken(auth, data.customToken);
        toast({ title: "Sign In Successful", description: `Welcome back, ${data.email}!` });
        
        // Clean the URL to remove the sign-in link parameters
        const newUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
        return true;

      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Sign In Failed', description: error.message });
        const newUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
        return false;
      }
    }
    return false;
  }, [auth, toast]);


  const fetchCredits = useCallback((fbUser: FirebaseUser | null) => {
      if (fbUser) {
          const creditsRef = doc(db, 'user_credits', fbUser.uid);
          return onSnapshot(creditsRef, (snap) => {
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
      } else {
          setCredits(null);
          if (!isInitialized) setIsInitialized(true);
      }
      return () => {};
  }, [db, isInitialized]);

  useEffect(() => {
    // Run this effect only once on initial client-side mount
    if (typeof window !== 'undefined' && window.location.href.includes('oobCode=')) {
        verifySignInLink(window.location.href);
    }
    
    const unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      setUser(fbUser?.email ? { email: fbUser.email } : null);
      const unsubscribeCredits = fetchCredits(fbUser);
      
      if (!isInitialized) {
        setIsInitialized(true);
      }
      
      return () => unsubscribeCredits();
    });

    return () => unsubscribeAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const beginRecovery = async (email: string) => {
    try {
      const response = await fetch('/api/account/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Something went wrong');

      return { success: true, message: "We've sent a secure sign-in link to your email address." };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  const signOut = async () => {
    await auth.signOut();
    setUser(null);
    setFirebaseUser(null);
    setCredits(null);
  };

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
  
  const refreshCredits = useCallback(() => {
    if (firebaseUser) {
        fetchCredits(firebaseUser);
    }
  }, [firebaseUser, fetchCredits]);


  const value = {
    user,
    firebaseUser,
    credits,
    isInitialized,
    hasFreebie,
    useFreebie,
    useCredit,
    beginRecovery,
    signOut,
    refreshCredits,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
