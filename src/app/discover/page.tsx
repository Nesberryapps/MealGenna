'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Shuffle, Info, Drumstick, CookingPot, Flame, Download } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
import { handleDownload } from '@/lib/pdf';

function getRandomMeal(currentMealId?: string): Meal {
  let meal;
  do {
    meal = MEALS[Math.floor(Math.random() * MEALS.length)];
  } while (currentMealId && meal.id === currentMealId);
  return meal;
}

export default function DiscoverPage() {
  const [meal, setMeal] = useState<Meal | null>(() => getRandomMeal());

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
            <div className="relative aspect-video w-full">
              <Image
                src={meal.image.imageUrl}
                alt={meal.name}
                fill
                className="object-cover"
                data-ai-hint={meal.image.imageHint}
              />
            </div>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">
                {meal.name}
              </CardTitle>
              <CardDescription>{meal.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="border-b-0">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2 text-primary">
                      <Info className="h-5 w-5" />
                      <span>View Recipe Details</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-6 pt-4">
                    {/* Ingredients */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Drumstick /> Ingredients
                      </h3>
                      <ul className="list-disc list-inside space-y-1 pl-2 text-muted-foreground">
                        {meal.ingredients.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Instructions */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <CookingPot /> Instructions
                      </h3>
                      <ol className="list-decimal list-inside space-y-2 pl-2">
                        {meal.instructions.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                      <p className="text-sm text-muted-foreground">
                        <strong>Cook Time:</strong> {meal.cookTime}
                      </p>
                    </div>

                    {/* Nutritional Facts */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Flame /> Nutritional Facts
                      </h3>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <p>
                          <strong>Calories:</strong>{' '}
                          {meal.nutritionalFacts.calories}
                        </p>
                        <p>
                          <strong>Protein:</strong>{' '}
                          {meal.nutritionalFacts.protein}
                        </p>
                        <p>
                          <strong>Carbs:</strong> {meal.nutritionalFacts.carbs}
                        </p>
                        <p>
                          <strong>Fat:</strong> {meal.nutritionalFacts.fat}
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
            <CardFooter className="flex-col sm:flex-row gap-2">
              <Button onClick={suggestMeal} className="w-full">
                <Shuffle className="mr-2" />
                Suggest Another
              </Button>
              <Button onClick={() => handleDownload(meal)} variant="outline" className="w-full">
                <Download className="mr-2" />
                Download PDF
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="text-center p-8 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">
              Click the button below to get your first meal suggestion.
            </p>
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
