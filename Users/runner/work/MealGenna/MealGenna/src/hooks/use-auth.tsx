
'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { getAuth, onAuthStateChanged, signInWithCustomToken, User as FirebaseUser } from 'firebase/auth';
import { app } from '@/lib/firebase-client';

interface AuthContextType {
  user: { email: string } | null;
  firebaseUser: FirebaseUser | null;
  isInitialized: boolean;
  isRecovering: boolean;
  isSigningIn: boolean;
  beginRecovery: (email: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { toast } = useToast();
  const auth = getAuth(app);

  const verifyTokenAndSignIn = useCallback(async () => {
    const url = window.location.href;
    const isSignInLink = auth.isSignInWithEmailLink(url);
    
    if (isSignInLink) {
      setIsSigningIn(true);
      toast({ title: 'Verifying your sign-in link...' });
      
      try {
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
          // This can happen if the user opens the link on a different device.
          // In a real app, you would ask the user for their email.
          // For this example, we'll throw an error.
          throw new Error('Email not found for sign-in. Please try signing in on the same device.');
        }

        const response = await fetch('/api/account/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: url, email }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Invalid or expired sign-in link.');

        await signInWithCustomToken(auth, data.customToken);
        
        toast({ title: 'Sign-in Successful!', description: `Welcome back, ${data.email}!` });
        window.localStorage.removeItem('emailForSignIn');
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Sign-in Failed', description: error.message });
      } finally {
        setIsSigningIn(false);
        const cleanUrl = window.location.href.split('?')[0];
        window.history.replaceState({}, document.title, cleanUrl);
      }
    } else {
        if (!auth.currentUser) {
          setIsInitialized(true);
        }
    }
  }, [auth, toast]);


  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser && fbUser.email) {
        setUser({ email: fbUser.email });
      } else {
        setUser(null);
      }
      setIsInitialized(true);
    });
    
    verifyTokenAndSignIn();

    return () => unsubscribeAuth();
  }, [auth, verifyTokenAndSignIn]);

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
      toast({ title: 'Check your email!', description: "We've sent a secure sign-in link to your email address." });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Recovery Failed', description: error.message });
    } finally {
      setIsRecovering(false);
    }
  };

  const handleSignOut = async () => {
    await auth.signOut();
    setUser(null);
    setFirebaseUser(null);
    toast({ title: 'Signed Out', description: 'You have been signed out.' });
  };
  
  const value = {
    user,
    firebaseUser,
    isInitialized,
    isRecovering,
    isSigningIn,
    beginRecovery,
    signOut: handleSignOut,
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
