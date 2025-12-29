'use client';

import { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BREAKFAST_MEALS,
  DINNER_MEALS,
  LUNCH_MEALS,
  type Meal,
} from '@/lib/data';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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
      breakfast: BREAKFAST_MEALS[Math.floor(Math.random() * BREAKFAST_MEALS.length)],
      lunch: LUNCH_MEALS[Math.floor(Math.random() * LUNCH_MEALS.length)],
      dinner: DINNER_MEALS[Math.floor(Math.random() * DINNER_MEALS.length)],
    };
  });
  return plan;
}

function MealCard({ meal, type }: { meal: Meal; type: string }) {
    return (
        <div className="bg-card rounded-lg overflow-hidden border">
            <div className="p-4">
                <p className="font-semibold text-sm text-primary">{type}</p>
                <p className="font-medium">{meal.name}</p>
            </div>
            <div className="aspect-video relative">
                 <Image src={meal.image.imageUrl} alt={meal.name} fill className="object-cover" data-ai-hint={meal.image.imageHint} />
            </div>
        </div>
    )
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
          <h1 className="text-4xl font-bold font-headline">Your 7-Day Meal Plan</h1>
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
