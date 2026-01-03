'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { generateMealIdea, GenerateMealIdeaInput, GenerateMealIdeaOutput } from '@/ai/flows/generate-meal-idea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { ArrowLeft, ChefHat, Flame, RefreshCw, Scale } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Footer } from '@/components/features/Footer';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';

function MealIdeasContent() {
  const searchParams = useSearchParams();
  const [mealIdea, setMealIdea] = useState<GenerateMealIdeaOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const getMealIdea = async () => {
    setLoading(true);
    setError(null);
    setMealIdea(null);
    
    if (!user || !firestore) {
      setError("Please sign in to generate meal ideas.");
      setLoading(false);
      toast({
        title: "Authentication Required",
        description: "You need to be signed in to generate meal ideas.",
        variant: "destructive"
      });
      return;
    }

    // --- Trial Logic ---
    const userRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
        setError("User profile not found. Please sign in again.");
        setLoading(false);
        return;
    }

    const userData = userDoc.data();
    const isPremium = userData.subscriptionTier === 'premium';
    const trialGenerations = userData.trialGenerations || 0;
    const trialStartedAt = userData.trialStartedAt?.toDate();
    const isTrialExpired = trialStartedAt && (new Date().getTime() - trialStartedAt.getTime()) > 24 * 60 * 60 * 1000;

    if (!isPremium && trialGenerations >= 3) {
        setError("You have used all your free generations.");
        setLoading(false);
        toast({
            title: "Trial Limit Reached",
            description: "Please upgrade to a premium subscription to continue generating meal ideas.",
            variant: "destructive",
        });
        return;
    }

    if (!isPremium && trialGenerations > 0 && isTrialExpired) {
        setError("Your 24-hour trial period has expired.");
        setLoading(false);
        toast({
            title: "Trial Period Expired",
            description: "Please upgrade to a premium subscription to continue generating meal ideas.",
            variant: "destructive",
        });
        return;
    }
    // --- End Trial Logic ---


    const params: GenerateMealIdeaInput = {
      mealType: searchParams.get('mealType') || 'Breakfast',
      dietaryPreference: searchParams.get('dietaryPreference') || 'No preference',
      flavorFusion1: searchParams.get('flavorFusion1') || 'Surprise Me!',
      flavorFusion2: searchParams.get('flavorFusion2') || 'Surprise Me!',
      customRequests: searchParams.get('customRequests') || '',
    };

    try {
      const result = await generateMealIdea(params);
      setMealIdea(result);

      // Increment trial usage if not premium
      if (!isPremium) {
          if(trialGenerations === 0) {
            // First generation, set the start time
            await updateDoc(userRef, {
                trialGenerations: increment(1),
                trialStartedAt: serverTimestamp()
            });
          } else {
             await updateDoc(userRef, {
                trialGenerations: increment(1)
            });
          }
      }

    } catch (e) {
      setError('Failed to generate meal idea. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMealIdea();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, user]);
  
  const renderSkeleton = () => (
    <div className="w-full">
      <Skeleton className="h-64 w-full rounded-t-xl" />
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Separator className="my-6" />
        <div className="space-y-2">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
        </div>
        <div className="space-y-2">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
        </div>
      </div>
    </div>
  );

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
            <h1 className="text-xl font-bold text-foreground">MealGenna</h1>
          </div>
          <div className="w-8"></div>
        </div>
      </header>
      <main className="flex-grow w-full max-w-md mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        <Card className="w-full overflow-hidden">
          {loading && renderSkeleton()}
          {error && <div className="p-6 text-center text-destructive">{error}</div>}
          {mealIdea && !loading && (
            <div>
              <div className="relative h-64 w-full">
                <Image src={mealIdea.imageDataUri} alt={mealIdea.title} layout="fill" className="object-cover" unoptimized/>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">{mealIdea.title}</CardTitle>
                <p className="text-muted-foreground pt-2">{mealIdea.description}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <Separator />

                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2"><ChefHat className="h-5 w-5 text-primary" /> Ingredients</h3>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                    {mealIdea.ingredients.map((item, index) => <li key={index}>{item}</li>)}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2"><Flame className="h-5 w-5 text-primary" /> Instructions</h3>
                   <ol className="list-decimal list-inside mt-2 space-y-2 text-muted-foreground">
                    {mealIdea.instructions.map((item, index) => <li key={index}>{item}</li>)}
                  </ol>
                  <p className="text-sm text-muted-foreground mt-2"><strong>Cooking Time:</strong> {mealIdea.cookingTime}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2"><Scale className="h-5 w-5 text-primary" /> Nutritional Facts</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-muted-foreground">
                    <p><strong>Calories:</strong> {mealIdea.nutrition.calories}</p>
                    <p><strong>Protein:</strong> {mealIdea.nutrition.protein}</p>
                    <p><strong>Fat:</strong> {mealIdea.nutrition.fat}</p>
                    <p><strong>Carbs:</strong> {mealIdea.nutrition.carbs}</p>
                  </div>
                </div>

              </CardContent>
            </div>
          )}
           <div className="p-6 pt-0">
             <Button onClick={getMealIdea} disabled={loading} className="mt-6 w-full">
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Generate Another
            </Button>
           </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
}


export default function MealIdeasPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MealIdeasContent />
        </Suspense>
    )
}

    