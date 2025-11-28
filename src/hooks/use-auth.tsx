
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

// This hook manages the user's authentication state.
export const useAuth = () => {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { toast } = useToast();

  // On initial load, check for a recovery token and user session
  useEffect(() => {
    const handleToken = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('recoveryToken');

      if (token) {
        setIsSigningIn(true);
        toast({ title: 'Verifying your sign-in link...' });
        
        try {
          const response = await fetch('/api/account/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          });

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || 'Invalid or expired sign-in link.');
          }

          // On successful verification, we get user and credit info
          localStorage.setItem('user_email', data.email);
          setUser({ email: data.email });

          toast({
            title: 'Sign-in Successful!',
            description: `Welcome back!`,
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
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };

    handleToken();
    
    // Check for existing session in local storage
    const storedEmail = localStorage.getItem('user_email');
    if (storedEmail) {
      setUser({ email: storedEmail });
    }
    setIsInitialized(true);

  }, [toast]);

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

  const signOut = () => {
    localStorage.removeItem('user_email');
    // For this app, we might also want to clear credits on sign out
    // or prompt the user. For now, just sign out.
    setUser(null);
    toast({
      title: 'Signed Out',
      description: 'You have been signed out.',
    });
  };

  return {
    user,
    isInitialized,
    isRecovering,
    isSigningIn,
    beginRecovery,
    signOut,
  };
};
