
'use client';

import { useState, useRef, createRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Generate7DayMealPlanInput, Generate7DayMealPlanOutput } from '@/ai/flows/generate-7-day-meal-plan';
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
import { ArrowLeft, Download, Loader2, WandSparkles, Clapperboard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Footer } from '@/components/features/Footer';
import { WebRedirectGuard } from '@/components/WebRedirectGuard';
import { useUser, useFirestore } from '@/firebase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdMob } from '@/hooks/use-admob';
import { doc, getDoc } from 'firebase/firestore';

const formSchema = z.object({
  dietaryPreferences: z.string().min(1, 'Please enter at least one preference.'),
  allergies: z.string().optional(),
  ingredients: z.string().optional(),
});

type WeeklyMealPlannerFormValues = z.infer<typeof formSchema>;

type UserData = {
    subscriptionTier: 'free' | 'premium';
}

async function generate7DayMealPlan(values: Generate7DayMealPlanInput): Promise<Generate7DayMealPlanOutput> {
    const response = await fetch('/api/genkit/flow/generate7DayMealPlanFlow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: values }),
    });
    if (!response.ok) {
        throw new Error('Failed to generate meal plan');
    }
    const result = await response.json();
    return result.output;
}

export default function WeeklyMealPlannerPage() {
  const [isClient, setIsClient] = useState(false);
  const [mealPlan, setMealPlan] = useState<Generate7DayMealPlanOutput['mealPlan'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [accordionState, setAccordionState] = useState<string[]>([]);
  const { toast } = useToast();
  
  const { user, isUserLoading } = useUser();
  const { showRewardedVideo, isAdShowing } = useAdMob();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [adWatchCount, setAdWatchCount] = useState(0);
  const firestore = useFirestore();
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (user && firestore) {
      const userDocRef = doc(firestore, 'users', user.uid);
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          setUserData(docSnap.data() as UserData);
        }
      });
    }
  }, [user, firestore]);
  
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

  const performMealPlanGeneration = async (values: WeeklyMealPlannerFormValues) => {
    setLoading(true);
    setMealPlan(null);

    try {
      const result = await generate7DayMealPlan(values);
      setMealPlan(result.mealPlan);
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
      setAdWatchCount(0);
    }
  }

  async function onSubmit(values: WeeklyMealPlannerFormValues) {
    if (userData?.subscriptionTier === 'premium') {
      performMealPlanGeneration(values);
    } else {
        if (adWatchCount < 2) {
            showRewardedVideo(() => {
                const newCount = adWatchCount + 1;
                setAdWatchCount(newCount);
                if (newCount === 2) {
                    performMealPlanGeneration(values);
                }
            });
        }
    }
  }

  const performDownload = async (dayIndex: number, dayNumber: number) => {
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
        
        let imgWidth = pdfWidth - 20;
        let imgHeight = imgWidth / ratio;
        
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
  }

  const handleDownloadDay = (dayIndex: number, dayNumber: number) => {
     if (userData?.subscriptionTier === 'premium') {
      performDownload(dayIndex, dayNumber);
    } else {
      showRewardedVideo(() => performDownload(dayIndex, dayNumber));
    }
  };
  
  const renderLoadingSkeleton = () => (
     <div className="flex flex-col min-h-dvh bg-background text-foreground">
        <header className="py-4 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto flex items-center justify-between">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-6 w-24" />
            </div>
            <div className="w-8"></div>
            </div>
        </header>
        <main className="flex-grow w-full max-w-md mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
           <Card className="w-full">
            <CardHeader>
                <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
                 <Skeleton className="h-6 w-36" />
                 <Skeleton className="h-20 w-full" />
                 <Skeleton className="h-6 w-24" />
                 <Skeleton className="h-20 w-full" />
                 <Skeleton className="h-10 w-full" />
            </CardContent>
            </Card>
        </main>
        <Footer />
    </div>
  );

  if (!isClient || isUserLoading) {
    return renderLoadingSkeleton();
  }

  const getButtonText = () => {
    if (loading) return <Loader2 className="mr-2 h-4 w-4 animate-spin" />;
    if (isAdShowing) return 'Loading Ad...';
    if (userData?.subscriptionTier !== 'premium') {
      if (adWatchCount === 0) return <><Clapperboard className="mr-2 h-4 w-4"/> Watch Ad (1/2) to Generate</>;
      if (adWatchCount === 1) return <><Clapperboard className="mr-2 h-4 w-4"/> Watch Ad (2/2) to Generate</>;
    }
    return <><WandSparkles className="mr-2 h-4 w-4" /> Generate My Plan</>;
  }

  return (
    <WebRedirectGuard>
        <div className="flex flex-col min-h-dvh bg-background text-foreground">
        <header className="py-4 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto flex items-center justify-between">
            <Link href="/">
                <Button variant="ghost" size="icon">
                <ArrowLeft />
                </Button>
            </Link>
            <div className="flex items-center gap-2">
                <Logo />
                <h1 className="text-xl font-bold text-foreground">MealGenna</h1>
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
                    <Button type="submit" disabled={loading || isAdShowing} className="w-all">
                        {getButtonText()}
                    </Button>
                </form>
                </Form>
            </CardContent>
            </Card>

            {loading && !mealPlan && (
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
                            <Button variant="outline" onClick={() => handleDownloadDay(index, day.day)} disabled={isAdShowing} className="mt-4 w-full">
                                {isAdShowing ? 'Loading Ad...' : <><Download className="mr-2 h-4 w-4" /> Download Day {day.day}</>}
                            </Button>
                            </AccordionContent>
                        </AccordionItem>
                    </Card>
                ))}
                </Accordion>
            </div>
            )}
        </main>
        <Footer />
        </div>
    </WebRedirectGuard>
  );
}
