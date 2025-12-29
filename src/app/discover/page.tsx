'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Shuffle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MEALS, type Meal } from '@/lib/data';

function getRandomMeal(currentMealId?: string): Meal {
  let meal;
  do {
    meal = MEALS[Math.floor(Math.random() * MEALS.length)];
  } while (currentMealId && meal.id === currentMealId);
  return meal;
}

export default function DiscoverPage() {
  const [meal, setMeal] = useState<Meal | null>(null);

  const suggestMeal = () => {
    setMeal(getRandomMeal(meal?.id));
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline">Discover a New Meal</h1>
        <p className="text-muted-foreground mt-2">
          Feeling uninspired? Let us pick a meal for you!
        </p>
      </div>

      <div className="w-full">
        {meal ? (
          <Card className="shadow-lg overflow-hidden">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">{meal.name}</CardTitle>
              <CardDescription>{meal.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video relative rounded-lg overflow-hidden">
                <Image
                  src={meal.image.imageUrl}
                  alt={meal.name}
                  fill
                  className="object-cover"
                  data-ai-hint={meal.image.imageHint}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={suggestMeal} className="w-full">
                <Shuffle className="mr-2" />
                Suggest Another
              </Button>
            </CardFooter>
          </Card>
        ) : (
            <div className="text-center p-8 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Click the button below to get your first meal suggestion.</p>
            </div>
        )}
      </div>

      {!meal && (
        <Button onClick={suggestMeal} size="lg">
          <Shuffle className="mr-2" />
          Suggest a Meal
        </Button>
      )}
    </div>
  );
}
