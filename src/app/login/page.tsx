'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  useFirebase,
  useUser,
} from '@/firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { Chrome } from 'lucide-react';
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

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Create user profile in Firestore if it doesn't exist
      const userRef = doc(firestore, 'users', user.uid);
      await setDoc(userRef, {
        id: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        subscriptionTier: 'free',
      }, { merge: true });

    } catch (error) {
      console.error('Error during Google Sign-In:', error);
    }
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
            <CardContent>
                <Button onClick={handleGoogleSignIn} className="w-full" variant="outline">
                    <Chrome className="mr-2" />
                    Sign In with Google
                </Button>
            </CardContent>
        </Card>
      </main>
      <Footer/>
    </div>
  );
}
