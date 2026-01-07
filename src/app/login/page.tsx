
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useFirebase,
  useUser,
} from '@/firebase';
import {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { Apple, Chrome } from 'lucide-react';
import { Footer } from '@/components/features/Footer';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Capacitor } from '@capacitor/core';

export default function LoginPage() {
  const { auth, firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isUserLoading && user) {
      router.push('/profile');
    }
  }, [user, isUserLoading, router, isClient]);

  // Handle redirect result (for mobile flow)
  useEffect(() => {
    const checkRedirect = async () => {
      if (!auth || !firestore) return;
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const user = result.user;
          // Check if user document already exists
          const userRef = doc(firestore, 'users', user.uid);
          const userDoc = await getDoc(userRef);

          if (!userDoc.exists()) {
            await setDoc(userRef, {
              id: user.uid,
              name: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              subscriptionTier: 'free',
              trialGenerations: 0,
            });
          }
          router.push('/profile');
        }
      } catch (error) {
        // If no redirect operation was called, this error is expected and can be ignored.
        // Or if the popup was closed by user.
        if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
             console.log('Redirect result check:', error);
        }
      }
    };

    if (auth && firestore) {
        checkRedirect();
    }
  }, [auth, firestore, router]);


  const handleSignIn = async (provider: GoogleAuthProvider | OAuthProvider) => {
    if (!auth || !firestore) return;
    
    // Use Redirect for Native Apps (Android/iOS), Popup for Web
    const isNative = Capacitor.isNativePlatform();

    try {
      if (isNative) {
        await signInWithRedirect(auth, provider);
        // The page will redirect, so no further code execution here
      } else {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        const userRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          await setDoc(userRef, {
            id: user.uid,
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            subscriptionTier: 'free',
            trialGenerations: 0,
          });
        }
      }
    } catch (error) {
      console.error('Error during Sign-In:', error);
    }
  };

  const handleGoogleSignIn = () => {
    handleSignIn(new GoogleAuthProvider());
  };

  const handleAppleSignIn = () => {
    handleSignIn(new OAuthProvider('apple.com'));
  };

  if (!isClient || isUserLoading || user) {
    return (
      <div className="flex flex-col min-h-dvh bg-background text-foreground">
        <main className="flex-grow w-full max-w-md mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
            <div className="flex justify-center mb-8">
                <Link href="/">
                  <Logo />
                </Link>
            </div>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle>Welcome to MealGenna</CardTitle>
                    <CardDescription>Sign in to continue to your account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </main>
        <Footer/>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
       <main className="flex-grow w-full max-w-md mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        <div className="flex justify-center mb-8">
            <Link href="/">
              <Logo />
            </Link>
        </div>
        <Card>
            <CardHeader className="text-center">
                <CardTitle>Welcome to MealGenna</CardTitle>
                <CardDescription>Sign in to continue to your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button onClick={handleGoogleSignIn} className="w-full" variant="outline">
                    <Chrome className="mr-2" />
                    Sign In with Google
                </Button>
                 <Button onClick={handleAppleSignIn} className="w-full" variant="outline">
                    <Apple className="mr-2" />
                    Sign In with Apple
                </Button>
            </CardContent>
        </Card>
      </main>
      <Footer/>
    </div>
  );
}
