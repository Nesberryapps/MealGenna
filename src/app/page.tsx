"use client";

import { useState, useEffect } from 'react';
import { Wifi, BatteryFull } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { ActionCard } from '@/components/features/ActionCard';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    };
    updateClock();
    const timerId = setInterval(updateClock, 1000);
    return () => clearInterval(timerId);
  }, []);

  const ingredientsImage = PlaceHolderImages.find(p => p.id === 'pantry-organization');
  const quickMealImage = PlaceHolderImages.find(p => p.id === 'ramen-bowl');

  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      <header className="py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{time}</span>
            <Logo />
            <h1 className="text-xl font-bold text-foreground">MealGenna</h1>
          </div>
          <div className="flex items-center gap-2 text-foreground">
            <Wifi size={16} />
            <div className="flex items-center gap-1">
              <BatteryFull size={16} />
              <span className="text-xs font-semibold">97</span>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-grow w-full max-w-md mx-auto p-4 sm:p-6 lg:p-8">
        <div className="text-left my-8 md:my-12">
          <h2 className="text-4xl md:text-5xl font-black font-headline mb-2">
            Good morning! What's for breakfast?
          </h2>
          <p className="text-lg text-muted-foreground">
            Instant Meal Ideas, Zero Hassle.
          </p>
        </div>

        <div className="space-y-6">
          {ingredientsImage && (
            <ActionCard
              title="Use My Ingredients"
              description="Scan your pantry or fridge to get a meal idea from what you have."
              buttonText="Start Scanning"
              buttonIcon="Camera"
              imageUrl={ingredientsImage.imageUrl}
              imageAlt={ingredientsImage.description}
              imageHint={ingredientsImage.imageHint}
            />
          )}

          {quickMealImage && (
             <ActionCard
              title="Something Quick"
              description="Short on time? Get delicious meal ideas."
              buttonText="Find Quick Meals"
              imageUrl={quickMealImage.imageUrl}
              imageAlt={quickMealImage.description}
              imageHint={quickMealImage.imageHint}
            />
          )}
        </div>
      </main>
    </div>
  );
}
