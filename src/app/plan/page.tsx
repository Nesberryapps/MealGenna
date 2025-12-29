'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { RefreshCw, Info, Drumstick, CookingPot, Flame, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { handleDownload } from '@/lib/pdf';
import { getMealPlan, type MealPlan } from '../actions';
import type { Recipe } from '@/ai/flows/generate-recipes-from-pantry';
import Loading from './loading';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];


function MealCard({ meal, type }: { meal: Recipe & { imageUrl?: string }; type: string }) {
  return (
    <Card className="bg-card rounded-lg overflow-hidden border w-full flex flex-col">
      <div className="relative aspect-video w-full bg-muted">
        {meal.imageUrl ? (
            <Image
            src={meal.imageUrl}
            alt={meal.name}
            fill
            className="object-cover"
            />
        ) : (
            <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground"/>
            </div>
        )}
      </div>
      <CardHeader>
        <p className="font-semibold text-sm text-primary">{type}</p>
        <CardTitle className="font-medium text-xl font-headline leading-tight">
          {meal.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value={`item-${meal.name}`} className="border-b-0">
            <AccordionTrigger>
              <div className="flex items-center gap-2 text-primary text-sm">
                <Info className="h-4 w-4" />
                <span>View Recipe</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2 text-base">
                  <Drumstick className="h-4 w-4" /> Ingredients
                </h4>
                <ul className="list-disc list-inside space-y-1 pl-2 text-muted-foreground text-sm">
                  {meal.ingredients.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2 text-base">
                  <CookingPot className="h-4 w-4" /> Instructions
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 pl-2 text-sm">
                  {meal.instructions.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
                <p className="text-xs text-muted-foreground pt-1">
                  <strong>Cook Time:</strong> {meal.cookTime}
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
       <CardContent className="pt-0">
        <Button onClick={() => handleDownload(meal)} variant="outline" className="w-full">
          <Download className="mr-2" />
          Download PDF
        </Button>
      </CardContent>
    </Card>
  );
}

export default function PlanPage() {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [isPending, startTransition] = useTransition();

  const regeneratePlan = () => {
    startTransition(async () => {
      const newPlan = await getMealPlan();
      setMealPlan(newPlan);
    });
  };

  // Generate initial plan
  useState(() => {
    if (!mealPlan) {
      regeneratePlan();
    }
  });


  if (isPending || !mealPlan) {
    return <Loading />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-bold font-headline">
            Your 7-Day Meal Plan
          </h1>
          <p className="text-muted-foreground mt-2">
            A week of delicious meals, generated just for you by our AI chef.
          </p>
        </div>
        <Button onClick={regeneratePlan} className="w-full md:w-auto" disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 animate-spin" /> : <RefreshCw className="mr-2" />}
          Generate New Plan
        </Button>
      </div>

      <div className="space-y-10">
        {DAYS_OF_WEEK.map(day => (
          <Card key={day} className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">{day}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <MealCard meal={mealPlan[day].breakfast} type="Breakfast" />
                <MealCard meal={mealPlan[day].lunch} type="Lunch" />
                <MealCard meal={mealPlan[day].dinner} type="Dinner" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
