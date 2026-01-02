
"use client";

import { useState, useEffect } from 'react';
import { Logo } from '@/components/Logo';
import { ActionCard } from '@/components/features/ActionCard';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import { MealPreferencesForm } from '@/components/features/MealPreferencesForm';
import { Footer } from '@/components/features/Footer';
import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

function ProfileButton() {
    const { user, isUserLoading } = useUser();

    if (isUserLoading) {
        return <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />;
    }

    if (user) {
        return (
             <Link href="/profile" passHref>
                <Avatar className="cursor-pointer h-10 w-10">
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                    <AvatarFallback>{user.displayName?.charAt(0) || <User />}</AvatarFallback>
                </Avatar>
            </Link>
        )
    }

    return (
        <Button asChild variant="secondary">
            <Link href="/login">Sign In</Link>
        </Button>
    )

}


export default function Home() {
  const [greeting, setGreeting] = useState("Good morning! What's on the menu?");
  const [subGreeting, setSubGreeting] = useState("Instant Meal Ideas, Zero Hassle.");
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

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

  const ingredientsImage = PlaceHolderImages.find(p => p.id === 'pantry-organization');
  const quickMealImage = PlaceHolderImages.find(p => p.id === 'ramen-bowl');
  const weeklyMealPlanImage = PlaceHolderImages.find(p => p.id === 'meal-prep-containers');

  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      <header className="py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo />
            <h1 className="text-xl font-bold text-foreground">MealGenius</h1>
          </div>
          <ProfileButton />
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
          {quickMealImage && (
             <div onClick={() => setIsPreferencesOpen(true)} className="cursor-pointer">
               <ActionCard
                title="Meal Ideas"
                description="Get delicious meal ideas for any occasion."
                buttonText="Get Ideas"
                imageUrl={quickMealImage.imageUrl}
                imageAlt={quickMealImage.description}
                imageHint={quickMealImage.imageHint}
              />
            </div>
          )}

          {ingredientsImage && (
            <Link href="/ingredient-scanner" passHref>
              <ActionCard
                title="Use My Ingredients"
                description="Scan your pantry or fridge to get a meal idea from what you have."
                buttonText="Start Scanning"
                buttonIcon="Camera"
                imageUrl={ingredientsImage.imageUrl}
                imageAlt={ingredientsImage.description}
                imageHint={ingredientsImage.imageHint}
              />
            </Link>
          )}

          {weeklyMealPlanImage && (
            <Link href="/weekly-meal-planner" passHref>
              <ActionCard
                title="7-Day Meal Plan"
                description="Generate a meal plan for the week, tailored to you."
                buttonText="Plan My Week"
                imageUrl={weeklyMealPlanImage.imageUrl}
                imageAlt={weeklyMealPlanImage.description}
                imageHint={weeklyMealPlanImage.imageHint}
              />
            </Link>
          )}
        </div>
      </main>
      <MealPreferencesForm open={isPreferencesOpen} onOpenChange={setIsPreferencesOpen} />
      <Footer />
    </div>
  );
}
