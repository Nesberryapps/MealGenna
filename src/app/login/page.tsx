'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  useFirebase,
  useUser,
} from '@/firebase';
import {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { Apple, Chrome } from 'lucide-react';
import { Footer } from '@/components/features/Footer';

export default function LoginPage() {
  const { auth, firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/profile');
    }
  }, [user, isUserLoading, router]);

  const handleSignIn = async (provider: GoogleAuthProvider | OAuthProvider) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user document already exists
      const userRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // New user, create the document
        await setDoc(userRef, {
          id: user.uid,
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          subscriptionTier: 'free',
        });
      }
      // If user exists, we don't need to do anything, just let them sign in.
      
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

  if (isUserLoading || user) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
       <main className="flex-grow w-full max-w-md mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        <div className="flex justify-center mb-8">
            <Logo />
        </div>
        <Card>
            <CardHeader className="text-center">
                <CardTitle>Welcome to MealGenius</CardTitle>
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
