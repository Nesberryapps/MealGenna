
'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, signInWithCustomToken, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, runTransaction, DocumentData } from 'firebase/firestore';
import { app } from '@/lib/firebase-client';
import { Capacitor } from '@capacitor/core';

interface Credits {
  single: number;
  '7-day-plan': number;
}

interface AuthContextType {
  user: { email: string } | null;
  firebaseUser: FirebaseUser | null;
  credits: Credits | null;
  isInitialized: boolean;
  isRecovering: boolean;
  isSigningIn: boolean;
  hasFreebie: boolean;
  useFreebie: () => void;
  useCredit: (type: 'single' | '7-day-plan') => Promise<{ success: boolean; message: string }>;
  beginRecovery: (email: string) => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<void>;
  verifySignInLink: (href: string) => Promise<{ success: boolean; message: string; email?: string }>;
  refreshCredits: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const FREEBIE_KEY = 'mealgenna_freebie_used_v2';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [hasFreebie, setHasFreebie] = useState(true);
  
  const auth = getAuth(app);
  const db = getFirestore(app);

  useEffect(() => {
    if (Capacitor.getPlatform() === 'web') {
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
    // Check is done on the client side
    if (auth.isSignInWithEmailLink(href)) {
      setIsSigningIn(true);
      
      try {
        const response = await fetch('/api/account/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: href }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Invalid or expired sign-in link.');

        // Sign in with the custom token returned from the server
        await signInWithCustomToken(auth, data.customToken);
        
        return { success: true, message: `Welcome back, ${data.email}!`, email: data.email };

      } catch (error: any) {
        return { success: false, message: error.message };
      } finally {
        setIsSigningIn(false);
        // Clean the URL to remove the sign-in link parameters
        const newUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
    return { success: false, message: 'Not a sign-in link.' };
  }, [auth]);

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
    const unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      setUser(fbUser?.email ? { email: fbUser.email } : null);
      // Fetch or re-fetch credits whenever the user state changes
      const unsubscribeCredits = fetchCredits(fbUser); 
      
      // On initial load, if the user is not signed in but there's a link, try to sign them in.
      if (!fbUser && window.location.href.includes('oobCode=')) {
        verifySignInLink(window.location.href);
      }

      return () => unsubscribeCredits();
    });

    return () => unsubscribeAuth();
  }, [auth, fetchCredits, verifySignInLink]);
  
  const beginRecovery = async (email: string) => {
    setIsRecovering(true);
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
    } finally {
      setIsRecovering(false);
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
    isRecovering,
    isSigningIn,
    hasFreebie,
    useFreebie,
    useCredit,
    beginRecovery,
    signOut,
    verifySignInLink,
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
