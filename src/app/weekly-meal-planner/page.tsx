
'use client';

import { useState, useRef, createRef } from 'react';
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
  const [accordionState, setAccordionState] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Create an array of refs, one for each day
  const dayRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);
  if (mealPlan && dayRefs.current.length !== mealPlan.length) {
    dayRefs.current = Array(mealPlan.length).fill(null).map((_, i) => dayRefs.current[i] || createRef<HTMLDivElement>());
  }

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
      // Set the accordion to initially open the first day
      if (result.mealPlan && result.mealPlan.length > 0) {
        setAccordionState(['item-1']);
      }
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

  const handleDownloadDay = async (dayIndex: number, dayNumber: number) => {
    const dayContent = dayRefs.current[dayIndex]?.current;
    if (!dayContent) {
        toast({
            variant: "destructive",
            title: "Download Failed",
            description: "Could not find the content for this day."
        });
        return;
    }

    try {
        const canvas = await html2canvas(dayContent, {
            scale: 2,
            backgroundColor: null, 
            onclone: (document) => {
                // Ensure the background is not transparent for the capture
                const content = document.querySelector('[data-day-content]');
                if (content) {
                    (content as HTMLElement).style.backgroundColor = 'hsl(var(--card))';
                }
            }
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        
        let imgWidth = pdfWidth - 20; // with margin
        let imgHeight = imgWidth / ratio;
        
        // If image height is larger than page, scale it down
        if(imgHeight > pdfHeight - 20) {
            imgHeight = pdfHeight - 20;
            imgWidth = imgHeight * ratio;
        }

        const x = (pdfWidth - imgWidth) / 2;
        const y = 10;

        pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
        pdf.save(`day-${dayNumber}-meal-plan.pdf`);

    } catch (error) {
        console.error("Failed to generate PDF for day", error);
        toast({
            variant: "destructive",
            title: "Download Failed",
            description: "Could not create the PDF file. Please try again."
        });
    }
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
            </div>
             <Accordion type="multiple" value={accordionState} onValueChange={setAccordionState} className="w-full">
            {mealPlan.map((day, index) => (
                <Card key={index} className="mb-2 bg-card">
                    <AccordionItem value={`item-${index+1}`} className="border-b-0">
                        <AccordionTrigger className="p-4 text-lg font-semibold hover:no-underline">
                        Day {day.day}
                        </AccordionTrigger>
                        <AccordionContent className="p-4 pt-0">
                          <div ref={dayRefs.current[index]} data-day-content className="p-4 rounded-md">
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
                          </div>
                           <Button variant="outline" onClick={() => handleDownloadDay(index, day.day)} className="mt-4 w-full">
                                <Download className="mr-2 h-4 w-4" />
                                Download Day {day.day}
                            </Button>
                        </AccordionContent>
                    </AccordionItem>
                </Card>
            ))}
            </Accordion>
          </div>
        )}
      </main>
    </div>
  );
}
