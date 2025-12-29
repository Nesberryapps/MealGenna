'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { RefreshCw, Info, Drumstick, CookingPot, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  BREAKFAST_MEALS,
  DINNER_MEALS,
  LUNCH_MEALS,
  type Meal,
} from '@/lib/data';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

type MealPlan = {
  [day: string]: {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
  };
};

function generateMealPlan(): MealPlan {
  const plan: MealPlan = {};
  DAYS_OF_WEEK.forEach(day => {
    plan[day] = {
      breakfast:
        BREAKFAST_MEALS[Math.floor(Math.random() * BREAKFAST_MEALS.length)],
      lunch: LUNCH_MEALS[Math.floor(Math.random() * LUNCH_MEALS.length)],
      dinner: DINNER_MEALS[Math.floor(Math.random() * DINNER_MEALS.length)],
    };
  });
  return plan;
}

function MealCard({ meal, type }: { meal: Meal; type: string }) {
  return (
    <Card className="bg-card rounded-lg overflow-hidden border w-full">
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
        <p className="font-semibold text-sm text-primary">{type}</p>
        <CardTitle className="font-medium text-xl font-headline leading-tight">
          {meal.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value={`item-${meal.id}`} className="border-b-0">
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
    </Card>
  );
}

export default function PlanPage() {
  const [mealPlan, setMealPlan] = useState<MealPlan>(() => generateMealPlan());

  const regeneratePlan = useCallback(() => {
    setMealPlan(generateMealPlan());
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-bold font-headline">
            Your 7-Day Meal Plan
          </h1>
          <p className="text-muted-foreground mt-2">
            A week of delicious meals, planned just for you.
          </p>
        </div>
        <Button onClick={regeneratePlan} className="w-full md:w-auto">
          <RefreshCw className="mr-2" />
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