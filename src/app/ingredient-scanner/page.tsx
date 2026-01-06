
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { IdentifyIngredientsFromImageOutput } from '@/ai/flows/identify-ingredients-from-image';
import type { GenerateMealIdeasFromIngredientsOutput } from '@/ai/flows/generate-meal-ideas-from-ingredients';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Camera, Loader2, Sparkles, Star } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Footer } from '@/components/features/Footer';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';

type UserData = {
    subscriptionTier: 'free' | 'premium';
    trialGenerations?: number;
    trialStartedAt?: { toDate: () => Date };
}

async function identifyIngredientsFromImage(imageDataUri: string): Promise<IdentifyIngredientsFromImageOutput> {
    const response = await fetch('/api/genkit/flow/identifyIngredientsFlow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: { imageDataUri } }),
    });
    if (!response.ok) {
        throw new Error('Failed to identify ingredients');
    }
    const result = await response.json();
    return result.output;
}

async function generateMealIdeasFromIngredients(ingredients: string[]): Promise<GenerateMealIdeasFromIngredientsOutput> {
    const response = await fetch('/api/genkit/flow/generateMealIdeasFromIngredientsFlow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: { ingredients } }),
    });
    if (!response.ok) {
        throw new Error('Failed to generate meal ideas');
    }
    const result = await response.json();
    return result.output;
}


export default function IngredientScannerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [identifiedIngredients, setIdentifiedIngredients] = useState<string[]>([]);
  const [mealIdeas, setMealIdeas] = useState<string[]>([]);
  const { toast } = useToast();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Not Supported',
          description: 'Your browser does not support camera access. Please try a different browser.',
        });
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    };

    getCameraPermission();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  const handleScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    if (isUserLoading) return;
    if (!user || !firestore) {
        toast({
            title: "Authentication Required",
            description: "You must be signed in to scan ingredients.",
            variant: "destructive"
        });
        router.push('/login');
        return;
    }

    setIsScanning(true);
    setIdentifiedIngredients([]);
    setMealIdeas([]);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if(context){
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    }
    
    const imageDataUri = canvas.toDataURL('image/jpeg');

    try {
      const { ingredients } = await identifyIngredientsFromImage(imageDataUri);
      
      if (ingredients.length > 0) {
        setIdentifiedIngredients(ingredients);
        await handleGenerateMeals(ingredients);
      } else {
        toast({
            variant: "default",
            title: "No Ingredients Found",
            description: "We couldn't identify any ingredients. Please try again with a clearer picture.",
        });
      }
    } catch (error) {
      console.error('Error identifying ingredients:', error);
      toast({
        variant: 'destructive',
        title: 'Scan Failed',
        description: 'Could not identify ingredients. Please try again.',
      });
    } finally {
      setIsScanning(false);
    }
  };
  
  const handleGenerateMeals = async (ingredients: string[]) => {
    if (!user || !firestore) return;
    setIsGenerating(true);

    const userRef = doc(firestore, 'users', user.uid);
    
    try {
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
            throw new Error("User profile not found.");
        }
        
        const userData = userDoc.data() as UserData;
        const isPremium = userData.subscriptionTier === 'premium';
        const trialGenerations = userData.trialGenerations || 0;
        const trialStartedAt = userData.trialStartedAt?.toDate();
        
        // Check if the 24-hour trial period has expired
        const isTrialExpired = trialStartedAt && (new Date().getTime() - trialStartedAt.getTime()) > 24 * 60 * 60 * 1000;

        if (!isPremium && trialGenerations > 0 && isTrialExpired) {
            toast({
                title: "Trial Period Expired",
                description: "Your 24-hour trial has ended. Please upgrade to continue generating meal ideas.",
                variant: "destructive",
                action: <Button variant="secondary" onClick={() => router.push('/subscription')}>Upgrade</Button>
            });
            setIsGenerating(false);
            return;
        }

        const { mealIdeas } = await generateMealIdeasFromIngredients(ingredients);
        setMealIdeas(mealIdeas);

        if (!isPremium) {
            const updates: any = { trialGenerations: increment(1) };
            if (trialGenerations === 0) {
                // Start the trial on the first generation
                updates.trialStartedAt = serverTimestamp();
            }
            await updateDoc(userRef, updates);
        }

    } catch (error) {
        console.error('Error generating meal ideas:', error);
        toast({
            variant: 'destructive',
            title: 'Generation Failed',
            description: 'Could not generate meal ideas. Please try again.',
        });
    } finally {
        setIsGenerating(false);
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
            <h1 className="text-xl font-bold text-foreground">MealGenna</h1>
          </div>
          <div className="w-8"></div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-md mx-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center">
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Ingredient Scanner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="relative aspect-video w-full bg-muted rounded-md overflow-hidden border">
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                    <canvas ref={canvasRef} className="hidden" />
                    {hasCameraPermission === false && (
                         <div className="absolute inset-0 flex items-center justify-center p-4">
                            <Alert variant="destructive">
                                <AlertTitle>Camera Access Required</AlertTitle>
                                <AlertDescription>
                                    Please allow camera access in your browser to use this feature.
                                </AlertDescription>
                            </Alert>
                         </div>
                    )}
                     {(isScanning && !isGenerating) && (
                        <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center space-y-2">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <p>Scanning for ingredients...</p>
                        </div>
                    )}
                </div>

                <Button onClick={handleScan} disabled={isScanning || isGenerating || hasCameraPermission !== true || isUserLoading} className="w-full">
                    {isScanning || isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                    Scan Ingredients
                </Button>

                {identifiedIngredients.length > 0 && (
                    <div className="space-y-4 pt-4">
                        <Separator />
                        <h3 className="text-lg font-semibold">Identified Ingredients:</h3>
                        <div className="flex flex-wrap gap-2">
                            {identifiedIngredients.map((ingredient, index) => (
                                <Badge key={index} variant="secondary">{ingredient}</Badge>
                            ))}
                        </div>
                    </div>
                )}
                
                {(isGenerating || mealIdeas.length > 0) && (
                     <div className="space-y-4 pt-4">
                        <Separator />
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                           <Sparkles className="h-5 w-5 text-primary" /> Meal Ideas
                        </h3>
                        {isGenerating ? (
                             <div className="flex flex-col items-center justify-center py-4 space-y-2">
                                <Loader2 className="h-6 w-6 animate-spin" />
                                <p className="text-sm text-muted-foreground">Generating ideas...</p>
                             </div>
                        ) : (
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                {mealIdeas.map((idea, index) => (
                                    <li key={index}>{idea}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

            </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
