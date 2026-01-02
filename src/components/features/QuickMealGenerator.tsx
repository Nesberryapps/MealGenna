"use client";

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateQuickMealIdeas, type GenerateQuickMealIdeasOutput } from '@/ai/flows/generate-quick-meal-ideas';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle, Sparkles, ChefHat } from 'lucide-react';

const formSchema = z.object({
  ingredients: z.string().min(3, "Please list at least one ingredient."),
  timeAvailable: z.string({ required_error: "Please select a time." }),
  dietaryPreferences: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function QuickMealGenerator() {
  const [result, setResult] = useState<GenerateQuickMealIdeasOutput | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ingredients: "",
      dietaryPreferences: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    const ingredientsArray = values.ingredients.split(',').map(item => item.trim()).filter(Boolean);

    if (ingredientsArray.length === 0) {
        form.setError("ingredients", { type: "manual", message: "Please provide at least one ingredient."});
        return;
    }

    startTransition(async () => {
      try {
        const response = await generateQuickMealIdeas({ 
            ingredients: ingredientsArray,
            timeAvailable: values.timeAvailable,
            dietaryPreferences: values.dietaryPreferences
         });
        setResult(response);
      } catch (e) {
        setResult(null);
        toast({
            variant: "destructive",
            title: "Error Generating Ideas",
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
            <CardTitle className="text-2xl font-bold">Short on Time?</CardTitle>
            <CardDescription>Tell us what you have and how much time you've got. We'll whip up some quick meal ideas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="ingredients"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available Ingredients</FormLabel>
                  <FormControl>
                    <Textarea placeholder="List your ingredients, separated by commas..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="timeAvailable"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Available</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select cooking time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="15 minutes">Under 15 minutes</SelectItem>
                        <SelectItem value="30 minutes">Under 30 minutes</SelectItem>
                        <SelectItem value="45 minutes">Under 45 minutes</SelectItem>
                        <SelectItem value="1 hour">1 hour or more</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dietaryPreferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dietary Preferences (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Vegetarian, Gluten-free" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {isPending && (
              <div className="flex items-center justify-center gap-2 text-primary pt-4">
                <LoaderCircle className="h-6 w-6 animate-spin" />
                <p className="text-lg">Finding quick recipes...</p>
              </div>
            )}
            
            {result && !isPending && (
                <div className="pt-4">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><ChefHat /> Quick Meal Suggestions</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {result.mealIdeas.map((idea, index) => (
                             <Card key={index} className="bg-background/50">
                                <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4">
                                    <Sparkles className="w-5 h-5 text-accent flex-shrink-0" />
                                    <CardTitle className="text-lg leading-tight">{idea}</CardTitle>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending} className="w-full text-lg py-6 bg-accent text-accent-foreground hover:bg-accent/90">
              {isPending ? "Generating..." : "Get Quick Ideas"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
