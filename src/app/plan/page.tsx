'use client';

import { useState, useTransition, useEffect } from 'react';
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
import { getMealPlan, getRecipeDetails, type MealPlan, type Meal } from '../actions';
import type { Recipe } from '@/ai/flows/generate-meal-plan';
import Loading from './loading';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];


function MealCard({ meal, type, onAccordionChange }: { meal: Meal; type: string; onAccordionChange: (mealName: string) => void }) {
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const { toast } = useToast();

  const handleTriggerClick = (isOpen: boolean) => {
    if (isOpen && !meal.details && !isFetchingDetails) {
        setIsFetchingDetails(true);
        onAccordionChange(meal.name);
    }
  }

  useEffect(() => {
    if (meal.details) {
        setIsFetchingDetails(false);
    }
  }, [meal.details]);

  return (
    <Card className="bg-card rounded-lg overflow-hidden border w-full flex flex-col">
      <div className="relative aspect-video w-full bg-muted">
        {meal.details?.imageUrl ? (
            <Image
            src={meal.details.imageUrl}
            alt={meal.details.name}
            fill
            className="object-cover"
            />
        ) : (
            <div className="w-full h-full flex items-center justify-center">
                {(isFetchingDetails || !meal.details) && <Loader2 className="h-6 w-6 animate-spin text-muted-foreground"/>}
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
        <Accordion type="single" collapsible className="w-full" onValueChange={(value) => handleTriggerClick(!!value)}>
          <AccordionItem value={`item-${meal.name}`} className="border-b-0">
            <AccordionTrigger>
              <div className="flex items-center gap-2 text-primary text-sm">
                <Info className="h-4 w-4" />
                <span>View Recipe</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              {isFetchingDetails && !meal.details && (
                  <div className="space-y-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-4/5" />
                  </div>
              )}
              {meal.details && (
                <>
                  <p className="text-sm text-muted-foreground">{meal.details.description}</p>
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2 text-base">
                      <Drumstick className="h-4 w-4" /> Ingredients
                    </h4>
                    <ul className="list-disc list-inside space-y-1 pl-2 text-muted-foreground text-sm">
                      {meal.details.ingredients.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2 text-base">
                      <CookingPot className="h-4 w-4" /> Instructions
                    </h4>
                    <ol className="list-decimal list-inside space-y-1.5 pl-2 text-sm">
                      {meal.details.instructions.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                    <p className="text-xs text-muted-foreground pt-1">
                      <strong>Cook Time:</strong> {meal.details.cookTime}
                    </p>
                  </div>
                </>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
       <CardContent className="pt-0">
        <Button onClick={() => meal.details && handleDownload(meal.details)} variant="outline" className="w-full" disabled={!meal.details}>
          <Download className="mr-2" />
          Download PDF
        </Button>
      </CardContent>
    </Card>
  );
}

export default function PlanPage() {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [isGenerating, startGeneratingTransition] = useTransition();
  const { toast } = useToast();

  const generateNewPlan = () => {
    startGeneratingTransition(async () => {
      setMealPlan(null); // Clear old plan immediately
      const newPlan = await getMealPlan();
      setMealPlan(newPlan);
    });
  };

  const handleFetchRecipeDetails = async (day: string, mealType: keyof MealPlan[string], mealName: string) => {
    try {
      const details = await getRecipeDetails(mealName);
      setMealPlan(currentPlan => {
        if (!currentPlan) return null;
        const newPlan = { ...currentPlan };
        // Deep copy to ensure state updates correctly
        newPlan[day] = { ...newPlan[day] };
        newPlan[day][mealType] = { ...newPlan[day][mealType], details };
        return newPlan;
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error fetching recipe",
        description: `Could not load details for ${mealName}. Please try again.`,
      });
       setMealPlan(currentPlan => {
        if (!currentPlan) return null;
        // Reset the specific meal to allow for a retry
        const newPlan = { ...currentPlan };
        newPlan[day] = { ...newPlan[day] };
        newPlan[day][mealType] = { ...newPlan[day][mealType], details: undefined };
        return newPlan;
      });
    }
  }

  useEffect(() => {
    if (!mealPlan) {
      generateNewPlan();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  if (isGenerating || !mealPlan) {
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
        <Button onClick={generateNewPlan} className="w-full md:w-auto" disabled={isGenerating}>
            {isGenerating ? <Loader2 className="mr-2 animate-spin" /> : <RefreshCw className="mr-2" />}
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
                <MealCard meal={mealPlan[day].breakfast} type="Breakfast" onAccordionChange={() => handleFetchRecipeDetails(day, 'breakfast', mealPlan[day].breakfast.name)} />
                <MealCard meal={mealPlan[day].lunch} type="Lunch" onAccordionChange={() => handleFetchRecipeDetails(day, 'lunch', mealPlan[day].lunch.name)} />
                <MealCard meal={mealPlan[day].dinner} type="Dinner" onAccordionChange={() => handleFetchRecipeDetails(day, 'dinner', mealPlan[day].dinner.name)}/>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
