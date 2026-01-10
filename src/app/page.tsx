
"use client";

import { useState, useEffect } from 'react';
import { Logo } from '@/components/Logo';
import { ActionCard } from '@/components/features/ActionCard';
import Link from 'next/link';
import { MealPreferencesForm } from '@/components/features/MealPreferencesForm';
import { Footer } from '@/components/features/Footer';
import { useUser } from '@/firebase/client';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [greeting, setGreeting] = useState("Good morning! What's on the menu?");
  const [subGreeting, setSubGreeting] = useState("Instant Meal Ideas, Zero Hassle.");
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  
  const { user, isUserLoading } = useUser();
  const router = useRouter();


  const handleWeeklyPlanClick = (e: React.MouseEvent) => {
    e.preventDefault(); 
    router.push('/weekly-meal-planner');
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
        </div>
      </main>
      <MealPreferencesForm open={isPreferencesOpen} onOpenChange={setIsPreferencesOpen} />
      <Footer />
    </div>
  );
}
