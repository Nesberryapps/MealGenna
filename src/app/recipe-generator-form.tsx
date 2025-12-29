
'use client';

import { useEffect, useState, useActionState, useRef } from 'react';
import Image from 'next/image';
import { Loader2, Sparkles, Camera, X, ChevronsUpDown, Drumstick, CookingPot, Flame, Info, Download, Smartphone } from 'lucide-react';
import { getRecipes, getIdentifiedItems, type RecipeResult } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CUISINE_PREFERENCES, DIETARY_PREFERENCES } from '@/lib/data';
import { handleDownload } from '@/lib/pdf';

// This is a placeholder for the Capacitor getPlatform function
// In a real Capacitor app, you would use:
// import { Capacitor } from '@capacitor/core';
const getPlatform = () => {
  // This mock will return 'web' in a browser environment.
  // When running in Capacitor, Capacitor.getPlatform() will return 'ios' or 'android'.
  if (typeof window !== 'undefined' && window.navigator && (window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches)) {
    // This is a simple heuristic for PWA, which we'll treat as native-like for now.
    // A real app would rely on Capacitor's own detection.
    return 'ios'; 
  }
  return 'web';
};


const showAdAndGenerateRecipes = async (form: HTMLFormElement) => {
  // --- Step 1: Integrate Capacitor AdMob Plugin ---
  //
  // const showAd = async () => {
  //   try {
  //     // Import the AdMob plugin from Capacitor
  //     // const { AdMob } = await import('@capacitor-community/admob');
  //
  //     // Prepare and show the Rewarded Interstitial ad
  //     // await AdMob.prepareRewardVideoAd({ adId: 'YOUR_ADMOB_REWARDED_AD_ID' });
  //     // const rewardInfo = await AdMob.showRewardVideoAd();
  //
  //     // Check if the user completed the ad view
  //     // return rewardInfo.rewarded;
  //     return true; // For testing without the plugin
  //
  //   } catch (error) {
  //     console.error("AdMob Error:", error);
  //     // If ads fail, you can decide to let the user proceed or not.
  //     // Returning true here allows recipe generation even if ads fail.
  //     return true;
  //   }
  // };

  // --- Step 2: Show Ad and Generate Recipes ---
  
  // const adWatched = await showAd();
  const adWatched = true; // For now, we'll assume the ad was watched.

  if (adWatched) {
    // If the ad was watched, we submit the form to the server action.
    form.requestSubmit();
  } else {
    // Optional: You could show a message if the user doesn't watch the ad.
    console.log("Ad not watched. Recipes will not be generated.");
  }
};
// --- End of AdMob Placeholder ---


export function RecipeGeneratorForm() {
  const { toast } = useToast();
  const [state, formAction] = useActionState<RecipeResult, FormData>(
    getRecipes,
    { recipes: [], error: undefined, timestamp: undefined }
  );

  const [pantryItems, setPantryItems] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean>();
  const [isPantryOpen, setIsPantryOpen] = useState(false);
  const [greeting, setGreeting] = useState("What's in your pantry?");
  const [platform, setPlatform] = useState('web');
  const [showPlatformDialog, setShowPlatformDialog] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // We only run this on the client
    setPlatform(getPlatform());

    const getGreeting = () => {
      const currentHour = new Date().getHours();
      if (currentHour >= 5 && currentHour < 12) {
        return "Good Morning! What's for breakfast?";
      } else if (currentHour >= 12 && currentHour < 17) {
        return "Good Afternoon! What's for lunch?";
      } else {
        return "Good Evening! What's for dinner?";
      }
    };
    setGreeting(getGreeting());
  }, []);


  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.error,
      });
    }
  }, [state, toast]);

  useEffect(() => {
    if (isScanning) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          setIsScanning(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings.',
          });
        }
      };
      getCameraPermission();

      return () => {
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
        }
      }
    }
  }, [isScanning, toast]);

  const handleCapture = async () => {
    if (videoRef.current && canvasRef.current) {
      setIsIdentifying(true);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const photoDataUri = canvas.toDataURL('image/jpeg');

        const result = await getIdentifiedItems(photoDataUri);

        if (result.error) {
          toast({ variant: 'destructive', title: 'Identification Failed', description: result.error });
        } else if (result.items.length === 0) {
          toast({ variant: 'default', title: 'No items found', description: 'Try getting closer or using a different angle.' });
        }
        else {
          setPantryItems(prev => [...new Set([...prev, ...result.items])]);
          setIsPantryOpen(true);
        }
      }
      setIsScanning(false);
      setIsIdentifying(false);
    }
  };

  const removeItem = (itemToRemove: string) => {
    setPantryItems(prev => prev.filter(item => item !== itemToRemove));
  };
  
  const [isPending, setIsPending] = useState(false);
  
  const handleGenerateClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (platform === 'web') {
      setShowPlatformDialog(true);
      return;
    }

    if (formRef.current) {
      setIsPending(true);
      showAdAndGenerateRecipes(formRef.current);
    }
  };

  useEffect(() => {
    // When the action is done (we get a timestamp), set pending to false
    if (state.timestamp) {
      setIsPending(false);
    }
     if (state.error) {
      setIsPending(false);
    }
  }, [state.timestamp, state.error]);

  if (isScanning) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-4">
        <div className="relative w-full h-full max-w-screen-md mx-auto">
            <video ref={videoRef} className="w-full h-full object-cover rounded-md" autoPlay muted playsInline />
            <canvas ref={canvasRef} className="hidden"></canvas>
            {isIdentifying && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white z-20">
                <Loader2 className="animate-spin h-10 w-10" />
                <p className="mt-4 text-lg">Identifying items...</p>
              </div>
            )}
             <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex justify-center items-center gap-4 z-30 w-full px-4">
                <Button onClick={() => setIsScanning(false)} variant="outline" size="lg" className="bg-white/80 backdrop-blur-sm">Cancel</Button>
                <Button onClick={handleCapture} size="lg" disabled={isIdentifying} className='h-16 w-16 rounded-full p-0 border-4 border-white/50'>
                    <Camera className='h-8 w-8'/>
                </Button>
                <div className='w-[88px]'></div>
            </div>

            {hasCameraPermission === false && (
              <Alert variant="destructive" className="absolute top-4 left-4 right-4 z-20 w-[calc(100%-2rem)]">
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                  Please allow camera access to use this feature. You may need to change permissions in your browser settings.
                </AlertDescription>
              </Alert>
            )}
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-8">
       <AlertDialog open={showPlatformDialog} onOpenChange={setShowPlatformDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Smartphone /> Get the Full Experience!
            </AlertDialogTitle>
            <AlertDialogDescription>
              AI recipe generation is available exclusively on our mobile app. Download it now to unlock this feature and many more!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowPlatformDialog(false)}>
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl md:text-4xl text-center">
            {greeting}
          </CardTitle>
          <CardDescription className="text-center">
            Scan your ingredients, and we'll whip up some recipe ideas for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            ref={formRef}
            action={formAction}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label>Pantry Items</Label>
              <Collapsible open={isPantryOpen} onOpenChange={setIsPantryOpen} className="w-full space-y-2">
                <div className="p-4 border-dashed border-2 rounded-lg min-h-[80px] flex items-center justify-center">
                  {pantryItems.length > 0 ? (
                    <div className='w-full'>
                        <div className='flex justify-between items-center'>
                            <p className='text-sm text-muted-foreground'>{pantryItems.length} items found</p>
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="w-9 p-0">
                                <ChevronsUpDown className="h-4 w-4" />
                                <span className="sr-only">Toggle</span>
                                </Button>
                            </CollapsibleTrigger>
                        </div>
                        <CollapsibleContent className="flex flex-wrap gap-2 pt-4">
                            {pantryItems.map(item => (
                            <Badge key={item} variant="secondary" className="text-base">
                                {item}
                                <button onClick={() => removeItem(item)} className="ml-2 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                <X className="h-3 w-3" />
                                </button>
                            </Badge>
                            ))}
                        </CollapsibleContent>
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-center py-4">
                      Click "Scan Pantry" to start adding items.
                    </div>
                  )}
                </div>
              </Collapsible>
              <input type="hidden" name="pantryItems" value={pantryItems.join(', ')} />
              <p className="text-sm text-muted-foreground">
                Click "Scan Pantry" to add items with your camera.
              </p>
            </div>

            <div className="flex justify-center">
              <Button type="button" onClick={() => setIsScanning(true)}>
                <Camera className="mr-2" />
                Scan Pantry
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                  <Label htmlFor="dietaryPreferences">Dietary Preferences</Label>
                  <Select name="dietaryPreferences" defaultValue="any">
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      {DIETARY_PREFERENCES.map(pref => (
                        <SelectItem key={pref.id} value={pref.label}>{pref.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">Optional: Help us narrow down the results.</p>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="cuisinePreferences">Cuisine Preferences</Label>
                  <Select name="cuisinePreferences" defaultValue="any">
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      {CUISINE_PREFERENCES.map(pref => (
                        <SelectItem key={pref.id} value={pref.label}>{pref.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">Optional: Craving a specific flavor?</p>
              </div>
            </div>

            <div className="flex justify-center pt-4">
               <Button onClick={handleGenerateClick} disabled={isPending} className="w-full md:w-auto">
                {isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Sparkles className="mr-2" />
                )}
                Generate Recipes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {isPending && !state.recipes && (
         <div className="space-y-8">
             <h2 className="text-3xl font-bold text-center font-headline">Generating your recipes...</h2>
              <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                      <Card key={index}>
                          <CardHeader>
                              <Skeleton className="h-8 w-3/4" />
                              <Skeleton className="h-4 w-1/2 mt-2" />
                          </CardHeader>
                          <CardContent>
                              <Skeleton className="w-full h-48 aspect-video" />
                          </CardContent>
                          <CardFooter>
                              <Skeleton className="h-10 w-full" />
                          </CardFooter>
                      </Card>
                  ))}
            </div>
        </div>
      )}

      {state.recipes && state.recipes.length > 0 && (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-center font-headline">Recipe Ideas</h2>
            <Accordion type="single" collapsible className="w-full space-y-4">
                {state.recipes.map((recipe, index) => (
                    <Card key={`${state.timestamp}-${index}`} className="overflow-hidden">
                        {recipe.imageUrl ? (
                            <div className="relative aspect-video w-full">
                                <Image src={recipe.imageUrl} alt={recipe.name} fill className="object-cover" />
                            </div>
                        ) : (
                           <div className="relative aspect-video w-full bg-muted flex items-center justify-center">
                             <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                           </div>
                        )}
                         <CardHeader>
                            <CardTitle className="font-headline text-2xl">{recipe.name}</CardTitle>
                            <CardDescription>{recipe.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <AccordionItem value={`item-${index}`} className="border-b-0">
                                <AccordionTrigger>
                                    <div className="flex items-center gap-2 text-primary">
                                        <Info className="h-5 w-5" />
                                        <span>View Recipe Details</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="space-y-6 pt-4">
                                    {/* Ingredients */}
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-lg flex items-center gap-2"><Drumstick /> Ingredients</h3>
                                        <ul className="list-disc list-inside space-y-1 pl-2 text-muted-foreground">
                                            {recipe.ingredients.map((item, i) => <li key={i}>{item}</li>)}
                                        </ul>
                                    </div>

                                    {/* Instructions */}
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-lg flex items-center gap-2"><CookingPot /> Instructions</h3>
                                        <ol className="list-decimal list-inside space-y-2 pl-2">
                                            {recipe.instructions.map((step, i) => <li key={i}>{step}</li>)}
                                        </ol>
                                        <p className="text-sm text-muted-foreground"><strong>Cook Time:</strong> {recipe.cookTime}</p>
                                    </div>

                                    {/* Nutritional Facts */}
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-lg flex items-center gap-2"><Flame /> Nutritional Facts</h3>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                            <p><strong>Calories:</strong> {recipe.nutritionalFacts.calories}</p>
                                            <p><strong>Protein:</strong> {recipe.nutritionalFacts.protein}</p>
                                            <p><strong>Carbs:</strong> {recipe.nutritionalFacts.carbs}</p>
                                            <p><strong>Fat:</strong> {recipe.nutritionalFacts.fat}</p>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={() => handleDownload(recipe)} variant="outline" className="w-full">
                                <Download className="mr-2" />
                                Download PDF
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </Accordion>
        </div>
      )}
    </div>
  );
}
