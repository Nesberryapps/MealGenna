"use client";

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generate7DayMealPlan } from '@/ai/flows/generate-7-day-meal-plan';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LoaderCircle, AlertTriangle, ChefHat } from 'lucide-react';

const formSchema = z.object({
  dietaryPreferences: z.string().min(1, "Please specify your dietary preferences."),
  allergies: z.string().min(1, "Please list any allergies, or enter 'None'."),
  ingredients: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ParsedMeal = {
    type: string;
    description: string;
};

type ParsedDay = {
    title: string;
    meals: ParsedMeal[];
};

const parseMealPlan = (plan: string): ParsedDay[] => {
    // Split by day headings (e.g., "Day 1:", "Monday:")
    const dayBlocks = plan.split(/\n(?=Day \d+:|Monday:|Tuesday:|Wednesday:|Thursday:|Friday:|Saturday:|Sunday:)/i);
    
    return dayBlocks.map(block => {
        const lines = block.trim().split('\n').filter(Boolean);
        if (lines.length === 0) return null;
        
        const title = lines[0].replace(/:$/, '');
        const meals: ParsedMeal[] = lines.slice(1).map(line => {
            const match = line.match(/-\s*(Breakfast|Lunch|Dinner):\s*(.*)/i);
            if (match) {
                return { type: match[1], description: match[2] };
            }
            return null;
        }).filter((m): m is ParsedMeal => m !== null);
        
        return { title, meals };
    }).filter((d): d is ParsedDay => d !== null && d.meals.length > 0);
};

export function WeeklyMealPlanner() {
  const [plan, setPlan] = useState<ParsedDay[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dietaryPreferences: "",
      allergies: "None",
      ingredients: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        const response = await generate7DayMealPlan(values);
        if (response && response.mealPlan) {
            const parsedPlan = parseMealPlan(response.mealPlan);
            setPlan(parsedPlan);
        } else {
             throw new Error("Empty response from AI");
        }
      } catch (e) {
        setPlan(null);
        toast({
            variant: "destructive",
            title: "Error Generating Plan",
            description: "Something went wrong. Please try again later.",
        });
      }
    });
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Plan Your Week</CardTitle>
            <CardDescription>Get a personalized 7-day meal plan. Tell us your dietary needs and what you have on hand.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Important!</AlertTitle>
              <AlertDescription>
                Always double-check recipes for allergens. Our AI is a tool, not a medical professional.
              </AlertDescription>
            </Alert>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dietaryPreferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dietary Preferences</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Vegan, Low-carb" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="allergies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allergies or Restrictions</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Peanuts, Dairy, or None" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="ingredients"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available Ingredients (optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Help us use what you've got! List ingredients separated by commas..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isPending && (
              <div className="flex items-center justify-center gap-2 text-primary pt-4">
                <LoaderCircle className="h-6 w-6 animate-spin" />
                <p className="text-lg">Building your weekly plan...</p>
              </div>
            )}
            
            {plan && plan.length > 0 && !isPending && (
                <div className="pt-4">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><ChefHat /> Your 7-Day Meal Plan</h3>
                    <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                        {plan.map((day, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger className="text-lg font-semibold">{day.title}</AccordionTrigger>
                            <AccordionContent>
                                <ul className="space-y-4 pl-2">
                                    {day.meals.map((meal, mealIndex) => (
                                    <li key={mealIndex} className="text-base">
                                        <strong className="text-primary">{meal.type}:</strong> {meal.description}
                                    </li>
                                    ))}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending} className="w-full text-lg py-6 bg-accent text-accent-foreground hover:bg-accent/90">
              {isPending ? "Generating..." : "Generate 7-Day Plan"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
