
"use client";

import { useState, useEffect } from 'react';
import { Logo } from '@/components/Logo';
import { ActionCard } from '@/components/features/ActionCard';
import Link from 'next/link';
import { MealPreferencesForm } from '@/components/features/MealPreferencesForm';
import { Footer } from '@/components/features/Footer';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Settings, X } from 'lucide-react';
import { doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Capacitor } from '@capacitor/core';

export default function Home() {
  const [greeting, setGreeting] = useState("Good morning! What's on the menu?");
  const [subGreeting, setSubGreeting] = useState("Instant Meal Ideas, Zero Hassle.");
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [showPromoBanner, setShowPromoBanner] = useState(false);
  
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const userRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userData } = useDoc<{subscriptionTier: string}>(userRef);

  useEffect(() => {
    // Show promo banner ONLY on web (not native)
    if (!Capacitor.isNativePlatform()) {
        setShowPromoBanner(true);
    }
  }, []);

  const handleWeeklyPlanClick = (e: React.MouseEvent) => {
    e.preventDefault(); 
    if (isUserLoading || !user) {
      toast({
        title: "Loading...",
        description: "Please wait a moment while we get things ready.",
      });
      return;
    }
    
    if (userData?.subscriptionTier === 'premium') {
        router.push('/weekly-meal-planner');
    } else {
        toast({
            title: "Premium Feature",
            description: "The 7-Day Meal Plan is a premium feature. Please subscribe to access it.",
            variant: "destructive"
        });
        router.push('/subscription');
    }
  }

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Good morning! What's for breakfast?");
    } else if (hour >= 12 && hour < 17) {
      setGreeting("Good afternoon! What's for lunch?");
    } else if (hour >= 17 && hour < 21) {
      setGreeting("Good evening! What's for dinner?");
    } else {
      setGreeting("Late night snack? What are you cooking?");
    }
  }, []);

  if (isUserLoading) {
    return (
        <div className="flex flex-col min-h-dvh bg-background text-foreground">
             <header className="py-4 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Logo />
                        <h1 className="text-xl font-bold text-foreground">MealGenna</h1>
                    </div>
                    <Skeleton className="h-10 w-10 rounded-full" />
                </div>
            </header>
            <main className="flex-grow w-full max-w-md mx-auto p-4 sm:p-6 lg:p-8">
                <div className="text-left my-8 md:my-12">
                    <Skeleton className="h-12 w-3/4 mb-2" />
                    <Skeleton className="h-6 w-1/2" />
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-[288px] w-full rounded-xl" />
                    <Skeleton className="h-[288px] w-full rounded-xl" />
                    <Skeleton className="h-[288px] w-full rounded-xl" />
                </div>
            </main>
            <Footer />
        </div>
    )
  }

  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      {/* Web Promo Banner */}
      {showPromoBanner && (
        <div className="bg-primary text-primary-foreground px-4 py-3 relative text-center">
            <p className="text-sm font-medium pr-8">
                Get the full experience! Download the mobile app for unlimited features.
                <a href="https://apps.apple.com" target="_blank" className="underline ml-2 font-bold">iOS</a>
                <span className="mx-1">|</span>
                <a href="https://play.google.com" target="_blank" className="underline font-bold">Android</a>
            </p>
            <button 
                onClick={() => setShowPromoBanner(false)} 
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-primary-foreground/10 rounded-full"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
      )}

      <header className="py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo />
            <h1 className="text-xl font-bold text-foreground">MealGenna</h1>
          </div>
          {user && (
            <Link href="/profile">
              <Button variant="ghost" size="icon">
                <Settings className="h-6 w-6" />
              </Button>
            </Link>
          )}
        </div>
      </header>
      <main className="flex-grow w-full max-w-md mx-auto p-4 sm:p-6 lg:p-8">
        <div className="text-left my-8 md:my-12">
          <h2 className="text-4xl md:text-5xl font-black font-headline mb-2">
            {greeting}
          </h2>
          <p className="text-lg text-muted-foreground">
            {subGreeting}
          </p>
        </div>

        <div className="space-y-6">
          
             <div onClick={() => setIsPreferencesOpen(true)} className="cursor-pointer">
               <ActionCard
                title="Meal Ideas"
                description="Get delicious meal ideas for any occasion."
                buttonText="Get Ideas"
                imageUrl="/ramen.jpg"
                imageAlt="A delicious bowl of ramen"
                imageHint="ramen bowl"
              />
            </div>
          
            <Link href="/ingredient-scanner">
              <ActionCard
                title="Use My Ingredients"
                description="Scan your pantry or fridge to get a meal idea from what you have."
                buttonText="Start Scanning"
                buttonIcon="Camera"
                imageUrl="/pantry.jpg"
                imageAlt="A well-organized pantry"
                imageHint="organized pantry"
              />
            </Link>
          
            {isUserLoading ? (
              <Skeleton className="h-[288px] w-full rounded-xl" />
            ) : (
               <div onClick={handleWeeklyPlanClick} className="cursor-pointer">
                <ActionCard
                  title="7-Day Meal Plan"
                  description="Generate a meal plan for the week, tailored to you."
                  buttonText="Plan My Week"
                  imageUrl="/meal-prep.jpg"
                  imageAlt="Several glass containers with prepped meals"
                  imageHint="meal prep"
                />
              </div>
            )}
        </div>
      </main>
      <MealPreferencesForm open={isPreferencesOpen} onOpenChange={setIsPreferencesOpen} />
      <Footer />
    </div>
  );
}
