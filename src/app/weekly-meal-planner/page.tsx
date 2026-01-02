
'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { generate7DayMealPlan, Generate7DayMealPlanOutput } from '@/ai/flows/generate-7-day-meal-plan';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Logo } from '@/components/Logo';
import { ArrowLeft, Download, Loader2, WandSparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const formSchema = z.object({
  dietaryPreferences: z.string().min(1, 'Please enter at least one preference.'),
  allergies: z.string().optional(),
  ingredients: z.string().optional(),
});

type WeeklyMealPlannerFormValues = z.infer<typeof formSchema>;

export default function WeeklyMealPlannerPage() {
  const [mealPlan, setMealPlan] = useState<Generate7DayMealPlanOutput['mealPlan'] | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const mealPlanRef = useRef<HTMLDivElement>(null);

  const form = useForm<WeeklyMealPlannerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dietaryPreferences: '',
      allergies: '',
      ingredients: '',
    },
  });

  async function onSubmit(values: WeeklyMealPlannerFormValues) {
    setLoading(true);
    setMealPlan(null);
    try {
      const result = await generate7DayMealPlan(values);
      setMealPlan(result.mealPlan);
    } catch (error) {
      console.error('Error generating meal plan:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Could not generate the meal plan. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }

  const handleDownload = async () => {
    if (!mealPlanRef.current) return;
    
    // Temporarily open all accordions for capture
    const accordions = mealPlanRef.current.querySelectorAll<HTMLButtonElement>('[data-state="closed"]');
    accordions.forEach(acc => acc.click());

    // Allow time for accordions to open before capturing
    await new Promise(resolve => setTimeout(resolve, 500));

    const canvas = await html2canvas(mealPlanRef.current, {
        scale: 2, // Higher scale for better quality
        backgroundColor: null, // Use element's background
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = canvasWidth / canvasHeight;
    const width = pdfWidth - 20; // with margin
    const height = width / ratio;

    let position = 10;
    pdf.addImage(imgData, 'PNG', 10, position, width, height);
    
    // Close the accordions again
    const openAccordions = mealPlanRef.current.querySelectorAll<HTMLButtonElement>('[data-state="open"]');
    openAccordions.forEach(acc => acc.click());

    pdf.save('7-day-meal-plan.pdf');
  };

  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      <header className="py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Logo />
            <h1 className="text-xl font-bold text-foreground">MealGenius</h1>
          </div>
          <div className="w-8"></div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-md mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>My Weekly Meal Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="dietaryPreferences"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dietary Preferences</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., vegetarian, low-carb" {...field} />
                      </FormControl>
                      <FormDescription>
                        List any dietary goals or preferences you have.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="allergies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allergies</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., peanuts, shellfish" {...field} />
                      </FormControl>
                      <FormDescription>
                        Please list any allergies you have.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ingredients"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available Ingredients (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., chicken breast, broccoli, rice" {...field} />
                      </FormControl>
                      <FormDescription>
                        List ingredients you have on hand to incorporate them.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <WandSparkles className="mr-2 h-4 w-4" />}
                  Generate My Plan
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {loading && (
            <div className="flex flex-col items-center justify-center pt-8 space-y-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Generating your personalized meal plan...</p>
            </div>
        )}

        {mealPlan && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Your 7-Day Plan</h2>
                <Button variant="outline" onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                </Button>
            </div>
            <div ref={mealPlanRef}>
                <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
                {mealPlan.map((day, index) => (
                    <Card key={index} className="mb-2 bg-card">
                        <AccordionItem value={`item-${index+1}`} className="border-b-0">
                            <AccordionTrigger className="p-4 text-lg font-semibold hover:no-underline">
                            Day {day.day}
                            </AccordionTrigger>
                            <AccordionContent className="p-4 pt-0">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-md">Breakfast</h4>
                                    <p className="text-muted-foreground">{day.breakfast}</p>
                                </div>
                                <Separator />
                                <div>
                                    <h4 className="font-semibold text-md">Lunch</h4>
                                    <p className="text-muted-foreground">{day.lunch}</p>
                                </div>
                                <Separator />
                                <div>
                                    <h4 className="font-semibold text-md">Dinner</h4>
                                    <p className="text-muted-foreground">{day.dinner}</p>
                                </div>
                            </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Card>
                ))}
                </Accordion>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
