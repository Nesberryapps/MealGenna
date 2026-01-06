
'use client';

import { Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { GenerateMealIdeaInput, GenerateMealIdeaOutput } from '@/ai/flows/generate-meal-idea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { ArrowLeft, ChefHat, Download, Flame, RefreshCw, Scale, ShoppingCart, Star } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Footer } from '@/components/features/Footer';
import { useUser, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type UserData = {
    subscriptionTier: 'free' | 'premium';
    trialGenerations?: number;
    trialStartedAt?: { toDate: () => Date };
}

async function generateMealIdea(params: GenerateMealIdeaInput): Promise<GenerateMealIdeaOutput> {
    const response = await fetch('/api/genkit/flow/generateMealIdeaFlow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: params }),
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error('Failed to generate meal idea');
    }
    const result = await response.json();
    return result.output;
}

function IngredientShoppingLink({ ingredient }: { ingredient: string }) {
    const stores = [
        { name: "Walmart", url: "https://www.walmart.com/search?q=" },
        { name: "Instacart", url: "https://www.instacart.com/store/search/" },
        { name: "Amazon Fresh", url: "https://www.amazon.com/s?k=" },
    ];

    const handleStoreSelect = (storeUrl: string) => {
        window.open(`${storeUrl}${encodeURIComponent(ingredient)}`, '_blank');
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary">
                    <ShoppingCart className="h-4 w-4" />
                    <span className="sr-only">Shop for {ingredient}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                 {stores.map(store => (
                    <DropdownMenuItem key={store.name} onClick={() => handleStoreSelect(store.url)}>
                        Shop at {store.name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function MealIdeasContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mealIdea, setMealIdea] = useState<GenerateMealIdeaOutput | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const mealIdeaRef = useRef<HTMLDivElement>(null);


  const handleDownload = async () => {
    if (!mealIdeaRef.current || !mealIdea) {
        toast({
            variant: "destructive",
            title: "Download Failed",
            description: "Could not find the content to download."
        });
        return;
    }

    try {
        const canvas = await html2canvas(mealIdeaRef.current, {
            scale: 2,
            backgroundColor: null,
             onclone: (document) => {
                const content = document.querySelector('[data-meal-idea-content]');
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
        pdf.save(`${mealIdea.title.replace(/ /g, '_')}.pdf`);

    } catch (error) {
        console.error("Failed to generate PDF", error);
        toast({
            variant: "destructive",
            title: "Download Failed",
            description: "Could not create the PDF file. Please try again."
        });
    }
  };


  const getMealIdea = async () => {
    setLoading(true);
    setError(null);
    setMealIdea(null);
    
    if (isUserLoading) return; // Wait until user status is resolved

    if (!user || !firestore) {
      setError("Please sign in to generate meal ideas.");
      setLoading(false);
      toast({
        title: "Authentication Required",
        description: "You need to be signed in to generate meal ideas.",
        variant: "destructive"
      });
      router.push('/login');
      return;
    }

    const userRef = doc(firestore, 'users', user.uid);
    try {
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
            setError("User profile not found. Please sign in again.");
            setLoading(false);
            return;
        }

        const currentData = userDoc.data() as UserData;
        setUserData(currentData);

        const isPremium = currentData.subscriptionTier === 'premium';
        const trialGenerations = currentData.trialGenerations || 0;
        const trialStartedAt = currentData.trialStartedAt?.toDate();

        // Check if the 24-hour trial period has expired
        const isTrialExpired = trialStartedAt && (new Date().getTime() - trialStartedAt.getTime()) > 24 * 60 * 60 * 1000;

        if (!isPremium && trialGenerations > 0 && isTrialExpired) {
            setError("Your 24-hour trial period has expired.");
            setLoading(false);
            toast({
                title: "Trial Period Expired",
                description: "Please upgrade to a premium subscription to continue generating meal ideas.",
                variant: "destructive",
                action: <Button variant="secondary" onClick={() => router.push('/subscription')}>Upgrade</Button>
            });
            return;
        }
        
        const params: GenerateMealIdeaInput = {
          mealType: searchParams.get('mealType') || 'Breakfast',
          dietaryPreference: searchParams.get('dietaryPreference') || 'No preference',
          flavorFusion1: searchParams.get('flavorFusion1') || 'Surprise Me!',
          flavorFusion2: searchParams.get('flavorFusion2') || 'Surprise Me!',
          customRequests: searchParams.get('customRequests') || '',
        };

        const result = await generateMealIdea(params);
        setMealIdea(result);

        if (!isPremium) {
            const updates: any = { trialGenerations: increment(1) };
            if (trialGenerations === 0) {
                 // Start the trial on the first generation
                updates.trialStartedAt = serverTimestamp();
            }
            await updateDoc(userRef, updates);
             const newDoc = await getDoc(userRef);
             if(newDoc.exists()) setUserData(newDoc.data() as UserData);
        }
    } catch (e) {
      setError('Failed to generate meal idea. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if(!isUserLoading) {
      getMealIdea();
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, user, isUserLoading]);
  
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
          
          <div ref={mealIdeaRef}>
            {mealIdea && !loading && (
                <div data-meal-idea-content>
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
                      <ul className="mt-2 space-y-1 text-muted-foreground">
                        {mealIdea.ingredients.map((item, index) => (
                           <li key={index} className="flex items-center justify-between">
                                <span>{item}</span>
                                {userData?.subscriptionTier === 'premium' && (
                                    <IngredientShoppingLink ingredient={item} />
                                )}
                            </li>
                        ))}
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
          </div>
          {!loading && !error && mealIdea && (
            <div className="p-6 pt-0 space-y-4">
              {userData?.subscriptionTier === 'premium' && (
                  <Button onClick={handleDownload} variant="outline" className="w-full">
                      <Download className="mr-2 h-4 w-4"/>
                      Download PDF
                  </Button>
              )}
              <Button onClick={getMealIdea} disabled={loading || isUserLoading} className="w-full">
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Generate Another
              </Button>
            </div>
          )}

          {error && (
             <div className="p-6 pt-0 space-y-4">
                <Button onClick={() => router.push('/subscription')} className="w-full">
                    <Star className="mr-2 h-4 w-4" />
                    Upgrade to Premium
                </Button>
            </div>
          )}
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
