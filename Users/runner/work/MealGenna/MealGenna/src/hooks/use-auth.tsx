
'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, signInWithCustomToken, User as FirebaseUser } from 'firebase/auth';
import { app } from '@/lib/firebase-client';
import { Capacitor } from '@capacitor/core';

interface AuthContextType {
  user: { email: string } | null;
  firebaseUser: FirebaseUser | null;
  isInitialized: boolean;
  isRecovering: boolean;
  isSigningIn: boolean;
  hasFreebie: boolean;
  useFreebie: () => void;
  beginRecovery: (email: string) => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<void>;
  verifySignInLink: (href: string) => Promise<{ success: boolean; message: string; email?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const FREEBIE_KEY = 'mealgenna_freebie_used_v2';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [hasFreebie, setHasFreebie] = useState(true);
  
  const auth = getAuth(app);

  useEffect(() => {
    if (Capacitor.getPlatform() === 'web') {
      const freebieUsed = localStorage.getItem(FREEBIE_KEY);
      setHasFreebie(freebieUsed !== 'true');
    } else {
      setHasFreebie(false); // No freebies on mobile
    }
  }, []);

  const verifySignInLink = useCallback(async (href: string) => {
    if (auth.isSignInWithEmailLink(href)) {
      setIsSigningIn(true);
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        setIsSigningIn(false);
        return { success: false, message: 'Please use the same device and browser you used to request the sign-in link.' };
      }
      
      try {
        const response = await fetch('/api/account/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: href }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Invalid or expired sign-in link.');

        await signInWithCustomToken(auth, data.customToken);
        
        window.localStorage.removeItem('emailForSignIn');
        return { success: true, message: `Welcome back, ${data.email}!`, email: data.email };

      } catch (error: any) {
        return { success: false, message: error.message };
      } finally {
        setIsSigningIn(false);
        const cleanUrl = window.location.href.split('?')[0];
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }
    return { success: false, message: 'Not a sign-in link.' };
  }, [auth]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      setUser(fbUser ? { email: fbUser.email! } : null);
      if (!isInitialized) {
        setIsInitialized(true);
      }
    });
    return () => unsubscribe();
  }, [auth, isInitialized]);
  
  useEffect(() => {
    if (isInitialized && !firebaseUser && window.location.search.includes('oobCode')) {
      verifySignInLink(window.location.href);
    }
  }, [isInitialized, firebaseUser, verifySignInLink]);


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

      window.localStorage.setItem('emailForSignIn', email);
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
  };
  
  const useFreebie = () => {
    if (Capacitor.getPlatform() === 'web' && hasFreebie) {
      localStorage.setItem(FREEBIE_KEY, 'true');
      setHasFreebie(false);
    }
  };

  const value = {
    user,
    firebaseUser,
    isInitialized,
    isRecovering,
    isSigningIn,
    hasFreebie,
    useFreebie,
    beginRecovery,
    signOut,
    verifySignInLink,
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
