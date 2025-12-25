
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
  
  // Handle magic link verification
  const verifyTokenAndSignIn = useCallback(async () => {
      const url = window.location.href;
      // Use a regex to avoid including other query params
      const tokenMatch = url.match(/token=([^&]+)/);
      const token = tokenMatch ? tokenMatch[1] : null;

      if (token) {
        setIsSigningIn(true);
        toast({ title: 'Verifying your sign-in link...' });
        
        try {
          const response = await fetch('/api/account/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: url }),
          });

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || 'Invalid or expired sign-in link.');
          }

          // Sign in with the custom token from the server
          await signInWithCustomToken(auth, data.customToken);

          // The onAuthStateChanged listener below will handle setting the user state.
          toast({
            title: 'Sign-in Successful!',
            description: `Welcome back, ${data.email}!`,
          });
        } catch (error: any) {
          toast({
            variant: 'destructive',
            title: 'Sign-in Failed',
            description: error.message,
          });
        } finally {
          setIsSigningIn(false);
          // Clean up the URL
          const cleanUrl = window.location.href.split('?')[0];
          window.history.replaceState({}, document.title, cleanUrl);
        }
      }
  }, [auth, toast]);

  // Listener for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser && fbUser.email) {
        setUser({ email: fbUser.email });
      } else {
        setUser(null);
      }
      setIsInitialized(true);
    });
    return () => unsubscribe();
  }, [auth]);

  // On initial load, check for a recovery token
  useEffect(() => {
    verifyTokenAndSignIn();
  }, [verifyTokenAndSignIn]);

  const beginRecovery = async (email: string) => {
    setIsRecovering(true);
    try {
      const response = await fetch('/api/account/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      toast({
        title: 'Check your email!',
        description: "We've sent a secure sign-in link to your email address.",
      });
    } catch (error: any) {
      console.error('Recovery error:', error);
      toast({
        variant: 'destructive',
        title: 'Recovery Failed',
        description: error.message,
      });
    } finally {
      setIsRecovering(false);
    }
  };

  const handleSignOut = async () => {
    await auth.signOut();
    setUser(null);
    setFirebaseUser(null);
    toast({
      title: 'Signed Out',
      description: 'You have been signed out.',
    });
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
