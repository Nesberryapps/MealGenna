'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { generateMealIdea, GenerateMealIdeaInput } from '@/ai/flows/generate-meal-idea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { ArrowLeft, RefreshCw } from 'lucide-react';

function MealIdeasContent() {
  const searchParams = useSearchParams();
  const [mealIdea, setMealIdea] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getMealIdea = async () => {
    setLoading(true);
    setError(null);
    setMealIdea(null);

    const params: GenerateMealIdeaInput = {
      mealType: searchParams.get('mealType') || 'Breakfast',
      dietaryPreference: searchParams.get('dietaryPreference') || 'No preference',
      flavorFusion1: searchParams.get('flavorFusion1') || 'Surprise Me!',
      flavorFusion2: searchParams.get('flavorFusion2') || 'Surprise Me!',
      customRequests: searchParams.get('customRequests') || '',
    };

    try {
      const result = await generateMealIdea(params);
      setMealIdea(result.mealIdea);
    } catch (e) {
      setError('Failed to generate meal idea. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMealIdea();
  }, [searchParams]);

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
      <main className="flex-grow w-full max-w-md mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">Your Meal Idea</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {loading && (
              <div className="space-y-2">
                <div className="animate-pulse bg-muted h-8 w-3/4 mx-auto rounded-md"></div>
                <div className="animate-pulse bg-muted h-4 w-full mx-auto rounded-md"></div>
                <div className="animate-pulse bg-muted h-4 w-2/3 mx-auto rounded-md"></div>
              </div>
            )}
            {error && <p className="text-destructive">{error}</p>}
            {mealIdea && !loading && (
              <div className="text-lg" dangerouslySetInnerHTML={{ __html: mealIdea.replace(/\n/g, '<br />') }} />
            )}
            <Button onClick={getMealIdea} disabled={loading} className="mt-6 w-full">
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Generate Another
            </Button>
          </CardContent>
        </Card>
      </main>
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
