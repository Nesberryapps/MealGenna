
'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Sparkles, Camera, ScanLine, Download, ClipboardList, ShoppingCart, ChevronDown, X, Loader2, Salad, Sandwich, Drumstick, Cake, HelpCircle, Video, Star } from 'lucide-react';
import Image from 'next/image';
import { analyzePantry, AnalyzePantryOutput } from '@/ai/flows/analyze-pantry-flow';
import { suggestMeals, SuggestMealInput } from '@/ai/flows/suggest-meal-flow';
import { generateMealPlan, GenerateMealPlanInput } from '@/ai/flows/generate-meal-plan-flow';
import { getMealDetails } from '@/ai/flows/get-meal-details-flow';
import { getFullMealPlanDetails, DetailedMealPlan } from '@/ai/flows/get-full-meal-plan-details-flow';
import { generateGroceryList } from '@/ai/flows/generate-grocery-list-flow';
import { MealSuggestion, SimpleMeal, MealPlan } from '@/ai/flows/types';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import AdBanner from '@/components/ad-banner';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { FirebaseAnalytics } from '@capacitor-firebase/analytics';
import { showWatchToGenerateAd, showSevenDayPlanAds } from '@/services/admob';
import { registerNotifications, scheduleDailyNotifications } from '@/services/notifications';
import { Skeleton } from '@/components/ui/skeleton';
import { PaywallModal } from '@/components/PaywallModal';
import { useAuth } from '@/hooks/use-auth';
import { usePremium } from '@/hooks/use-premium';
import { LimitModal } from '@/components/LimitModal';


declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    gtag_report_conversion: (url?: string, enhanced_conversion_data?: any) => void;
  }
  
  interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
      outcome: 'accepted' | 'dismissed';
      platform: string;
    }>;
    prompt(): Promise<void>;
  }

  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

type Mood = 'Quick' | 'Healthy' | 'Hearty';
type ScanStep = 'scanning' | 'selectingMeal';

export default function MealApp() {
  const [pantryItems, setPantryItems] = useState<string[]>([]);
  const [sessionItems, setSessionItems] = useState<string[]>([]);
  const [loadingMood, setLoadingMood] = useState<Mood | '7-day-plan' | 'from pantry' | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  
  const [generatedMeals, setGeneratedMeals] = useState<MealSuggestion[] | null>(null);

  const [generatedPlan, setGeneratedPlan] = useState<MealPlan | null>(null);
  const [detailedPlan, setDetailedPlan] = useState<DetailedMealPlan | null>(null);
  const [isFetchingFullPlan, setIsFetchingFullPlan] = useState(false);
  const [heading, setHeading] = useState("What's on the menu?");

  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);
  const [scanStep, setScanStep] = useState<ScanStep>('scanning');
  const [isGroceryListOpen, setIsGroceryListOpen] = useState(false);
  const [groceryListItems, setGroceryListItems] = useState<string[]>([]);
  const [checkedGroceryItems, setCheckedGroceryItems] = useState<Set<string>>(new Set());
  const [isFetchingGroceryList, setIsFetchingGroceryList] = useState(false);
  
  const [isMealSuggestionsOpen, setIsMealSuggestionsOpen] = useState(false);
  const [isMealPlanOpen, setIsMealPlanOpen] = useState(false);
  const [isMealDetailOpen, setIsMealDetailOpen] = useState(false);
  const [activeMeal, setActiveMeal] = useState<MealSuggestion | null>(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  
  const [selectedMood, setSelectedMood] = useState<Mood | '7-day-plan' | 'from pantry' | null>(null);
  const [preferences, setPreferences] = useState({
    mealTime: 'lunch',
    diet: 'none',
    cuisine1: 'Surprise Me',
    cuisine2: 'Surprise Me',
    customRequest: ''
  });

  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [isAlreadyInstalledAlertOpen, setIsAlreadyInstalledAlertOpen] = useState(false);

  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const { user, hasFreebie, useFreebie, verifySignInLink } = useAuth();
  const { credits, useCredit, isInitialized: premiumInitialized } = usePremium();

  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const checkLink = async () => {
        if (window.location.href.includes('oobCode')) {
          const result = await verifySignInLink(window.location.href);
          if (result.success) {
            toast({ title: 'Sign-in Successful!', description: result.message });
          } else if (result.message !== 'Not a sign-in link.') {
            toast({ variant: 'destructive', title: 'Sign-in Failed', description: result.message });
          }
        }
      };
      checkLink();
      
      const date = new Date();
      const hour = date.getHours();
      let newHeading = "What's on the menu?";
      let newMealTime = 'lunch';

      if (hour < 12) {
        newHeading = "Good morning! What's for breakfast?";
        newMealTime = 'breakfast';
      } else if (hour < 18) {
        newHeading = "Good afternoon! What's for lunch?";
        newMealTime = 'lunch';
      } else {
        newHeading = "Good evening! What's for dinner?";
        newMealTime = 'dinner';
      }
      
      setHeading(newHeading);
      setPreferences(prev => ({ ...prev, mealTime: newMealTime }));

      const handleBeforeInstallPrompt = (event: any) => {
        event.preventDefault();
        setInstallPrompt(event);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsAppInstalled(true);
      }
      
      if (Capacitor.isNativePlatform()) {
        registerNotifications().then(success => {
          if (success) {
            scheduleDailyNotifications();
          }
        });
      }

      const initAnalytics = async () => {
          if (Capacitor.getPlatform() === 'web') return;
          try {
            await FirebaseAnalytics.setEnabled({ enabled: true });
            await FirebaseAnalytics.logEvent({
              name: "screen_view",
              params: {
                screen_name: "home",
              }
            });
          } catch (error) {
            console.error("Error initializing Firebase Analytics", error);
          }
      };

      initAnalytics();

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]);

  useEffect(() => {
    if (isCameraDialogOpen) {
      handleScanClick();
    } else if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      setSessionItems([]);
      setScanStep('scanning');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCameraDialogOpen]);

  useEffect(() => {
    if (generatedMeals && generatedMeals.length > 0) {
      setIsMealSuggestionsOpen(true);
    }
  }, [generatedMeals]);
  
  useEffect(() => {
    if (generatedPlan) {
      setIsMealPlanOpen(true);
    }
  }, [generatedPlan]);

  useEffect(() => {
    if(!isMealSuggestionsOpen) setGeneratedMeals(null);
    if(!isMealPlanOpen) { setGeneratedPlan(null); setDetailedPlan(null); setIsFetchingFullPlan(false); }
    if (!isMealDetailOpen) setActiveMeal(null);
    if (!isGroceryListOpen) { setActiveMeal(null); setGroceryListItems([]); setCheckedGroceryItems(new Set()); }
  }, [isMealSuggestionsOpen, isMealPlanOpen, isMealDetailOpen, isGroceryListOpen]);

  useEffect(() => {
    if (!isTutorialOpen) setTutorialStep(0);
  }, [isTutorialOpen]);

  const handlePreferenceChange = (key: keyof typeof preferences, value: string) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleScanClick = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            setHasCameraPermission(true);
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (error) {
            setHasCameraPermission(false);
            toast({ variant: 'destructive', title: 'Camera Access Denied', description: 'Please enable camera permissions in your browser settings.' });
            setIsCameraDialogOpen(false);
        }
    } else {
         toast({ variant: 'destructive', title: 'Camera Not Supported', description: 'Your browser does not support camera access.' });
        setIsCameraDialogOpen(false);
    }
  };

  const handleCaptureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsScanning(true);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) { setIsScanning(false); return; }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const photoDataUri = canvas.toDataURL('image/jpeg');

    try {
      const result: AnalyzePantryOutput = await analyzePantry({ photoDataUri });
      const newItems = [...new Set([...sessionItems, ...result.items])];
      setSessionItems(newItems);
      toast({ title: 'Items Added!', description: `Found: ${result.items.join(', ')}.` });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Analysis Failed', description: 'Could not analyze the image. Please try again.' });
    } finally {
      setIsScanning(false);
    }
  };

  const handleProceedToMealSelection = () => {
      if (sessionItems.length === 0) {
          toast({ variant: 'destructive', title: 'No Items', description: 'Please scan some items before generating meals.' });
          return;
      }
      setPantryItems([...new Set([...pantryItems, ...sessionItems])]);
      setScanStep('selectingMeal');
  }

  const getCuisinePreference = () => {
    const { cuisine1, cuisine2 } = preferences;
    if (cuisine1 !== 'Surprise Me' && cuisine2 !== 'Surprise Me' && cuisine1 !== cuisine2) return `${cuisine1}-${cuisine2} fusion`;
    if (cuisine1 !== 'Surprise Me') return cuisine1;
    if (cuisine2 !== 'Surprise Me') return cuisine2;
    return undefined;
  };

  const handleGenerateMeal = async (items?: string[]) => {
    const type = selectedMood === '7-day-plan' ? '7-day-plan' : 'single';

    setLoadingMood(selectedMood);
    if (type === '7-day-plan') { setGeneratedPlan(null); setDetailedPlan(null); setIsMealPlanOpen(true); } 
    else { setGeneratedMeals(null); setIsMealSuggestionsOpen(true); }
    if (isCameraDialogOpen) setIsCameraDialogOpen(false);

    try {
      if (type === '7-day-plan') {
        const input: GenerateMealPlanInput = { pantryItems, diet: preferences.diet !== 'none' ? preferences.diet : undefined, cuisine: getCuisinePreference(), customRequest: preferences.customRequest || undefined };
        const result = await generateMealPlan(input);
        setGeneratedPlan(result);
      } else {
        const input: SuggestMealInput = { pantryItems: items || pantryItems, mealTime: preferences.mealTime, mood: (loadingMood === 'from pantry' ? 'Quick' : (selectedMood as Mood)), diet: preferences.diet !== 'none' ? preferences.diet : undefined, cuisine: getCuisinePreference(), customRequest: preferences.customRequest || undefined };
        const result = await suggestMeals(input);
        setGeneratedMeals(result);
      }
    } catch (error) {
        toast({ variant: 'destructive', title: 'Generation Failed', description: 'Could not generate ideas. Please try again.' });
        if (type === '7-day-plan') setIsMealPlanOpen(false);
        else setIsMealSuggestionsOpen(false);
    } finally {
        setLoadingMood(null);
    }
  };


  const handleFinalGeneration = async (items?: string[]) => {
    setIsPreferencesOpen(false);
    const generationType = selectedMood === '7-day-plan' ? '7-day-plan' : 'single';
  
    if (isClient && Capacitor.getPlatform() === 'web') {
      if (user) {
        // Logged-in web user
        const hasCredits = (credits?.[generationType] ?? 0) > 0;
        if (hasCredits) {
          const result = await useCredit(generationType);
          if (result.success) {
            toast({ title: 'Credit Used', description: 'Your meal is being generated.' });
            await handleGenerateMeal(items);
          } else {
            toast({ variant: 'destructive', title: 'Out of Credits', description: result.message });
            setIsPaywallOpen(true);
          }
        } else {
          setIsPaywallOpen(true);
        }
      } else {
        // Guest web user
        if (hasFreebie) {
          useFreebie();
          toast({ title: 'Free Generation Used', description: 'Your first one is on the house!' });
          await handleGenerateMeal(items);
        } else {
          setIsLimitModalOpen(true);
        }
      }
    } else if (isClient) {
      // Mobile user
      const adLogic = generationType === '7-day-plan' ? showSevenDayPlanAds : showWatchToGenerateAd;
      adLogic(() => handleGenerateMeal(items));
    }
  };

  const handleOpenPreferences = (mood: Mood | '7-day-plan' | 'from pantry') => {
    setSelectedMood(mood);
    setIsPreferencesOpen(true);
  };
  
  const handleMoodOrPlanClick = (mood: Mood | '7-day-plan') => {
    setSelectedMood(mood);
    const generationType = mood === '7-day-plan' ? '7-day-plan' : 'single';
    
    if (isClient && Capacitor.getPlatform() === 'web') {
      if (user) {
        if ((credits?.[generationType] ?? 0) > 0) {
          handleOpenPreferences(mood);
        } else {
          setIsPaywallOpen(true);
        }
      } else {
        if (hasFreebie) {
          handleOpenPreferences(mood);
        } else {
          setIsLimitModalOpen(true);
        }
      }
    } else if (isClient) {
      // On mobile, always open preferences, ads are shown later.
      handleOpenPreferences(mood);
    }
  };

  const handleFetchMealDetails = async (meal: SimpleMeal) => {
    setIsFetchingDetails(true);
    setActiveMeal(null);
    setIsMealDetailOpen(true);
    try {
        const details = await getMealDetails({ ...meal, diet: preferences.diet !== 'none' ? preferences.diet : undefined, cuisine: getCuisinePreference(), customRequest: preferences.customRequest || undefined });
        setActiveMeal(details);
    } catch (error) {
        toast({ variant: 'destructive', title: 'Failed to get details', description: 'Could not load the recipe details. Please try again.' });
        setIsMealDetailOpen(false);
    } finally {
        setIsFetchingDetails(false);
    }
  }

  const handleFetchFullPlan = async () => {
    if (!generatedPlan) return;
    setIsFetchingFullPlan(true);
    try {
      const result = await getFullMealPlanDetails({ plan: generatedPlan, diet: preferences.diet !== 'none' ? preferences.diet : undefined, cuisine: getCuisinePreference(), customRequest: preferences.customRequest || undefined });
      setDetailedPlan(result);
      toast({ title: 'Plan Ready!', description: 'Your full 7-day plan with all recipes is ready to download.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to Fetch Details', description: 'Could not retrieve all recipes for the plan. Please try again.' });
    } finally {
      setIsFetchingFullPlan(false);
    }
  };
  
  const saveTextFile = async (filename: string, content: string) => {
    if (Capacitor.isNativePlatform()) {
      try {
        await Filesystem.writeFile({ path: filename, data: content, directory: Directory.Documents, encoding: Encoding.UTF8 });
        alert(`Saved ${filename} to your Documents folder!`);
      } catch (error) {
        alert("Could not save file. Please check permissions.");
      }
    } else {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleDownloadRecipe = (meal: MealSuggestion | null) => {
    if (!meal) return;
    const { title, description, ingredients, recipe } = meal;
    let content = `${title}\n\n${description}\n\nIngredients:\n${ingredients.map(i => `- ${i}`).join('\n')}\n\nRecipe:\n${recipe.map((step, index) => `${index + 1}. ${step}`).join('\n')}`;
    const filename = `${title.replace(/\s+/g, '_').toLowerCase()}.txt`;
    saveTextFile(filename, content);
  };
  
  const handleDownloadFullPlan = () => {
    if (!detailedPlan) return;
    let fullPlanContent = 'Your 7-Day Meal Plan by MealGenna\n\n';
    Object.entries(detailedPlan.dailyPlans).forEach(([day, plan]) => {
      fullPlanContent += `==============================\n${day.toUpperCase()}\n==============================\n\n`;
      [plan.breakfast, plan.lunch, plan.dinner].forEach(meal => {
        fullPlanContent += `----------\nMeal: ${meal.title}\n----------\n\n${meal.description}\n\nIngredients:\n${meal.ingredients.map(i => `- ${i}`).join('\n')}\n\nRecipe:\n${meal.recipe.map((step, index) => `${index + 1}. ${step}`).join('\n')}\n\nNutrition:\n- Calories: ${meal.nutrition.calories}\n- Protein: ${meal.nutrition.protein}\n- Carbs: ${meal.nutrition.carbs}\n- Fat: ${meal.nutrition.fat}\n\n\n`;
      });
    });
    saveTextFile('mealgenna_7_day_plan.txt', fullPlanContent);
  };

  const handleShopOnline = (store: 'walmart' | 'amazon' | 'instacart') => {
    const itemsToShop = groceryListItems.filter(item => !checkedGroceryItems.has(item));
    if (itemsToShop.length === 0) {
        toast({ title: 'No Items to Shop!', description: 'You have checked all items on your grocery list.' });
        return;
    }
    itemsToShop.forEach(item => {
        const url = store === 'walmart' ? `https://www.walmart.com/search?q=${encodeURIComponent(item)}`
                  : store === 'amazon' ? `https://www.amazon.com/s?k=${encodeURIComponent(item)}&i=amazonfresh`
                  : `https://www.instacart.com/store/search/${encodeURIComponent(item)}`;
        window.open(url, '_blank');
    });
  };

  const handleInstallClick = async () => {
    if (isAppInstalled) { setIsAlreadyInstalledAlertOpen(true); return; }
    if (installPrompt) {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') { setIsAppInstalled(true); setInstallPrompt(null); toast({ title: 'Installation Complete!', description: 'MealGenna has been added to your device.' }); } 
      else { toast({ variant: 'destructive', title: 'Installation Canceled', description: 'You can install the app at any time from the account section.' }); }
    } else {
        toast({ variant: 'destructive', title: 'Installation Not Available', description: 'The installation prompt is not ready yet. Please try again.' });
    }
  };

  const handleCheckboxChange = (item: string) => {
    setCheckedGroceryItems(prev => {
        const newSet = new Set(prev);
        if (newSet.has(item)) newSet.delete(item);
        else newSet.add(item);
        return newSet;
    });
  };

  const openGroceryList = async (meal: MealSuggestion) => {
    setActiveMeal(meal);
    setIsGroceryListOpen(true);
    setIsFetchingGroceryList(true);
    try {
        const { missingItems } = await generateGroceryList({ pantryItems, requiredItems: meal.ingredients });
        setGroceryListItems(missingItems);
    } catch (error) {
        toast({ variant: 'destructive', title: 'Could not generate grocery list', description: 'Please try again.' });
        setGroceryListItems(meal.ingredients.map(i => i.split(',')[0].split(' of ')[-1]));
    } finally {
        setIsFetchingGroceryList(false);
    }
  };

  const MoodCard = ({ mood, icon, title, description, onClick, isPlan = false }: { mood: Mood | '7-day-plan', icon: ReactNode, title: string, description: string, onClick: () => void, isPlan?: boolean }) => {
    
    if (!isClient) {
      return (
          <Card className="relative flex flex-col text-center h-full">
              <CardHeader className="p-6">
                <div className="mx-auto w-24 h-24 mb-2 flex items-center justify-center">
                  <Skeleton className="w-full h-full rounded-full" />
                </div>
                <CardTitle><Skeleton className="h-6 w-3/4 mx-auto" /></CardTitle>
                <div className="text-sm text-muted-foreground mt-1.5 space-y-1">
                    <Skeleton className="h-4 w-full mx-auto" />
                    <Skeleton className="h-4 w-5/6 mx-auto" />
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-6 pt-0" />
              <CardFooter className="p-6 pt-0">
                <Button className="w-full" disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...</Button>
              </CardFooter>
          </Card>
      );
    }
    
    const isWeb = Capacitor.getPlatform() === 'web';
    const generationType = isPlan ? '7-day-plan' : 'single';
    let showPurchaseState = false;

    if (isWeb) {
      if (user) {
        showPurchaseState = (credits?.[generationType] ?? 0) <= 0;
      } else {
        showPurchaseState = !hasFreebie;
      }
    }

    const getBadgeText = () => {
      if (isWeb) {
        if (showPurchaseState) return 'Purchase';
        if (user) {
          const count = credits?.[generationType] ?? 0;
          return `${count} left`;
        }
        return '1 Free Left';
      }
      return isPlan ? 'Watch 2 ads' : 'Watch an ad';
    };

    const getButtonContent = () => {
        if (loadingMood === mood) return <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</>;
        if (isWeb) {
          if (showPurchaseState) return <><Star className="mr-2 h-4 w-4" />Get More</>;
          return <><Sparkles className="mr-2 h-4 w-4" />Generate</>;
        }
        return <><Video className="mr-2 h-4 w-4" />{isPlan ? 'Watch Ads' : 'Watch Ad'}</>;
    };
    
    return (
        <Card className="relative flex flex-col text-center h-full">
             <Badge variant={showPurchaseState ? 'destructive' : 'premium'} className="absolute top-2 right-2">{getBadgeText()}</Badge>
            <CardHeader className="p-6"><div className="mx-auto w-24 h-24 mb-2 flex items-center justify-center">{icon}</div><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader>
            <CardContent className="flex-1 p-6 pt-0" />
            <CardFooter className="p-6 pt-0"><Button className="w-full" onClick={onClick} disabled={!!loadingMood}>{getButtonContent()}</Button></CardFooter>
        </Card>
    );
  };

  const tutorialContent = [
    { title: "Welcome to MealGenna!", description: "This quick tour will walk you through the main features. Use 'Next' and 'Back' to navigate." },
    { title: "App Controls", description: "Manage your account, re-run this tutorial, and install the app to your device for easy access." },
    { title: "Scan Your Pantry", description: "Use this to scan what's in your pantry. Our AI will identify items and suggest recipes." },
    { title: "Generate Meals", description: "Choose a card to get meal ideas. On mobile, watch an ad. On web, use credits or purchase more." },
    { title: "You're All Set!", description: "You're ready to start exploring. Close this dialog and start generating your first meal." },
  ];

  const cuisineOptions = [ { value: 'Surprise Me', label: 'Surprise Me!' }, { value: 'African', label: 'African' }, { value: 'American', label: 'American' }, { value: 'British', label: 'British' }, { value: 'Caribbean', label: 'Caribbean' }, { value: 'Chinese', label: 'Chinese' }, { value: 'European', label: 'European' }, { value: 'French', label: 'French' }, { value: 'German', label: 'German' }, { value: 'Greek', label: 'Greek' }, { value: 'Indian', label: 'Indian' }, { value: 'Italian', label: 'Italian' }, { value: 'Japanese', label: 'Japanese' }, { value: 'Jewish', label: 'Jewish' }, { value: 'Korean', label: 'Korean' }, { value: 'Latin American', label: 'Latin American' }, { value: 'Mediterranean', label: 'Mediterranean' }, { value: 'Mexican', label: 'Mexican' }, { value: 'Middle Eastern', label: 'Middle Eastern' }, { value: 'Nordic', label: 'Nordic' }, { value: 'Spanish', label: 'Spanish' }, { value: 'Thai', label: 'Thai' }, { value: 'Vietnamese', label: 'Vietnamese' } ];

  return (
    <>
      <PaywallModal isOpen={isPaywallOpen} onClose={() => setIsPaywallOpen(false)} />
      <LimitModal 
        isOpen={isLimitModalOpen} 
        onClose={() => setIsLimitModalOpen(false)} 
        onSwitchToPurchase={() => {
          setIsLimitModalOpen(false);
          setIsPaywallOpen(true);
        }}
      />
      <div className="container relative py-12 md:py-20">
        <section className="mx-auto flex max-w-3xl flex-col items-center text-center gap-4 mb-12">
          <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]">{heading}</h1>
          <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">Instant Meal Ideas, Zero Hassle.</p>
        </section>
        
        <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-center">
           <Dialog open={isCameraDialogOpen} onOpenChange={setIsCameraDialogOpen}>
                <Card className="relative flex flex-col text-center h-full">
                    <CardHeader className="p-6"><div className="relative mx-auto w-24 h-24 rounded-full overflow-hidden"><Image src="/landing-page-image.png" alt="Scan ingredients" layout="fill" objectFit="cover" data-ai-hint="food pantry" /></div><CardTitle>Use My Ingredients</CardTitle><CardDescription>Scan your pantry or fridge to get a meal idea from what you have.</CardDescription></CardHeader>
                    <CardContent className="flex-1 p-6 pt-0" />
                    <CardFooter className="p-6 pt-0"><DialogTrigger asChild><Button className="w-full" onClick={() => handleOpenPreferences('from pantry')}><Camera className="mr-2 h-4 w-4" />Start Scanning</Button></DialogTrigger></CardFooter>
                </Card>
              <DialogContent className="max-w-3xl">
                {scanStep === 'scanning' && ( <>
                    <DialogHeader><DialogTitle>Scan Your Pantry</DialogTitle><DialogDescription>Point your camera at ingredients and click "Analyze Image". Scan as many times as you need.</DialogDescription></DialogHeader>
                    <div className="relative"><video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted playsInline />
                        {hasCameraPermission === false && ( <Alert variant="destructive" className="mt-4"><AlertTitle>Camera Access Required</AlertTitle><AlertDescription>Please allow camera access in your browser to use this feature.</AlertDescription></Alert> )}
                        {isScanning && ( <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center"><ScanLine className="h-16 w-16 animate-pulse text-primary"/><p className="mt-4 text-muted-foreground">Analyzing items...</p></div> )}
                    </div>
                    <canvas ref={canvasRef} className="hidden"></canvas>
                    <div className="my-4"><h4 className="font-semibold mb-2">Found Items ({sessionItems.length})</h4><div className="max-h-24 overflow-y-auto rounded-md border p-2 bg-muted/50">{sessionItems.length > 0 ? ( <ul className="space-y-1">{sessionItems.map((item, index) => <li key={index} className="text-sm text-muted-foreground">{item}</li>)}</ul> ) : ( <p className="text-sm text-center text-muted-foreground py-2">No items scanned yet.</p> )}</div></div>
                    <DialogFooter className="sm:justify-between gap-2 flex-col sm:flex-row">
                        <Button onClick={handleCaptureAndAnalyze} disabled={isScanning || hasCameraPermission !== true}>{isScanning ? 'Analyzing...' : 'Analyze Image'}</Button>
                        <div className="flex flex-col sm:flex-row gap-2"><Button onClick={handleProceedToMealSelection} disabled={sessionItems.length === 0}>Next: Choose Meal Type</Button><Button variant="outline" onClick={() => setIsCameraDialogOpen(false)}>Cancel</Button></div>
                    </DialogFooter>
                </> )}
                {scanStep === 'selectingMeal' && ( <>
                    <DialogHeader><DialogTitle>What are you in the mood for?</DialogTitle><DialogDescription>Select a meal type to get suggestions based on your {sessionItems.length} scanned items.</DialogDescription></DialogHeader>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8">
                        <MealTypeButton mealType="breakfast" icon={<Salad className="h-8 w-8 mx-auto" />} onClick={() => { setPreferences(prev => ({...prev, mealTime: 'breakfast'})); handleFinalGeneration(sessionItems)}} />
                        <MealTypeButton mealType="lunch" icon={<Sandwich className="h-8 w-8 mx-auto" />} onClick={() => { setPreferences(prev => ({...prev, mealTime: 'lunch'})); handleFinalGeneration(sessionItems)}} />
                        <MealTypeButton mealType="dinner" icon={<Drumstick className="h-8 w-8 mx-auto" />} onClick={() => { setPreferences(prev => ({...prev, mealTime: 'dinner'})); handleFinalGeneration(sessionItems)}} />
                        <MealTypeButton mealType="dessert" icon={<Cake className="h-8 w-8 mx-auto" />} onClick={() => { setPreferences(prev => ({...prev, mealTime: 'dessert'})); handleFinalGeneration(sessionItems)}} />
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setScanStep('scanning')}>Back to Scanning</Button></DialogFooter>
                </> )}
              </DialogContent>
           </Dialog>

           <div className="lg:col-span-1">
             <MoodCard mood="Quick" icon={<div className="relative w-24 h-24 rounded-full overflow-hidden mx-auto"><Image src="/Quick-meal.png" alt="Quick Meal" layout="fill" objectFit="cover" data-ai-hint="fast food" /></div>} title="Something Quick" description="Short on time? Get delicious meal ideas in seconds." onClick={() => handleMoodOrPlanClick('Quick')} />
           </div>
           <div className="lg:col-span-1">
             <MoodCard mood="Healthy" icon={<div className="relative w-24 h-24 rounded-full overflow-hidden mx-auto"><Image src="/Healthy-meal.png" alt="Healthy Meal" layout="fill" objectFit="cover" data-ai-hint="healthy salad" /></div>} title="Something Healthy" description="Nourish your body with a wholesome and tasty recipe." onClick={() => handleMoodOrPlanClick('Healthy')} />
            </div>
            <div className="lg:col-span-1">
             <MoodCard mood="Hearty" icon={<div className="relative w-24 h-24 rounded-full overflow-hidden mx-auto"><Image src="/Hearty-meal.png" alt="Hearty Meal" layout="fill" objectFit="cover" data-ai-hint="steak dinner" /></div>} title="Something Hearty" description="Craving comfort food? Find a satisfying and filling meal." onClick={() => handleMoodOrPlanClick('Hearty')} />
            </div>
           <div className="md:col-span-2 lg:col-span-3">
              <MoodCard mood="7-day-plan" icon={<div className="relative w-24 h-24 rounded-full overflow-hidden mx-auto"><Image src="/Explore-flavors.png" alt="Meal Ideas" layout="fill" objectFit="cover" data-ai-hint="meal prep" /></div>} title="Generate a 7-Day Plan" description="Get a complete breakfast, lunch, and dinner plan for the week." onClick={() => handleMoodOrPlanClick('7-day-plan')} isPlan={true} />
           </div>
        </div>
        
        <Dialog open={isPreferencesOpen} onOpenChange={setIsPreferencesOpen}>
          <DialogContent className="max-h-[90vh] flex flex-col p-0">
            <DialogHeader className="p-6 pb-4"><DialogTitle>Set Your Preferences</DialogTitle><DialogDescription>Tell us what you'd like. The more specific you are, the better the suggestions!</DialogDescription></DialogHeader>
            <div className="grid gap-6 py-4 px-6 overflow-y-auto">
              { selectedMood !== '7-day-plan' && ( <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label htmlFor="meal-time">Meal Type</Label><Select value={preferences.mealTime} onValueChange={(value) => handlePreferenceChange('mealTime', value)}><SelectTrigger id="meal-time"><SelectValue placeholder="Select a meal time" /></SelectTrigger><SelectContent><SelectItem value="breakfast">Breakfast</SelectItem><SelectItem value="lunch">Lunch</SelectItem><SelectItem value="dinner">Dinner</SelectItem><SelectItem value="dessert">Dessert</SelectItem></SelectContent></Select></div>
                <div><Label htmlFor="diet-preference">Dietary Preference</Label><Select value={preferences.diet} onValueChange={(value) => handlePreferenceChange('diet', value)}><SelectTrigger id="diet-preference"><SelectValue placeholder="No preference" /></SelectTrigger><SelectContent><SelectItem value="none">No preference</SelectItem><SelectItem value="Vegetarian">Vegetarian</SelectItem><SelectItem value="Vegan">Vegan</SelectItem><SelectItem value="Keto">Keto</SelectItem><SelectItem value="Paleo">Paleo</SelectItem><SelectItem value="Gluten-Free">Gluten-Free</SelectItem></SelectContent></Select></div>
              </div> )}
              <div><Label>Create a Flavor Fusion</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
                    <Select value={preferences.cuisine1} onValueChange={(value) => handlePreferenceChange('cuisine1', value)}><SelectTrigger><SelectValue placeholder="Cuisine 1..." /></SelectTrigger><SelectContent>{cuisineOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent></Select>
                    <Select value={preferences.cuisine2} onValueChange={(value) => handlePreferenceChange('cuisine2', value)}><SelectTrigger><SelectValue placeholder="Cuisine 2..." /></SelectTrigger><SelectContent>{cuisineOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent></Select>
                </div><p className="text-xs text-muted-foreground mt-1">Select two for a fusion, or one for a traditional meal.</p>
              </div>
              <div><Label htmlFor="custom-request">Custom Requests</Label><Textarea id="custom-request" value={preferences.customRequest} onChange={(e) => handlePreferenceChange('customRequest', e.target.value)} placeholder="e.g., 'no nuts', 'low-carb and high-protein'" className="mt-1" /><p className="text-xs text-muted-foreground mt-1">Specify allergies, dislikes, or any other special instructions.</p></div>
            </div>
            <DialogFooter className="p-6 pt-4 border-t"><Button onClick={() => handleFinalGeneration()} disabled={!!loadingMood} className="w-full sm:w-auto">{loadingMood ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}Generate</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isMealSuggestionsOpen} onOpenChange={setIsMealSuggestionsOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
            <DialogHeader className="p-6 pb-2"><DialogTitle>Here are your meal ideas!</DialogTitle><DialogDescription>We've generated three options for you based on your preferences.</DialogDescription></DialogHeader>
            <div className="flex-1 flex flex-col overflow-hidden">
              {(generatedMeals && generatedMeals.length > 0) ? ( <Tabs defaultValue={generatedMeals[0]?.title} className="flex-1 flex flex-col overflow-hidden"><TabsList className="flex-wrap h-auto mx-6 justify-start md:justify-center">{generatedMeals.map((meal) => (<TabsTrigger key={meal.title} value={meal.title} className="flex-grow md:flex-grow-0">{meal.title}</TabsTrigger>))}</TabsList>{generatedMeals.map((meal) => (<TabsContent key={meal.title} value={meal.title} className="flex-1 overflow-y-auto mt-0"><Card className="border-0 shadow-none rounded-none"><CardHeader className="p-6">{meal.imageUrl && ( <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden mb-4"><Image src={meal.imageUrl} alt={meal.title} fill style={{objectFit: 'cover'}} data-ai-hint="food meal"/></div> )}<CardTitle className="text-xl md:text-2xl">{meal.title}</CardTitle><CardDescription>{meal.description}</CardDescription></CardHeader><CardContent className="px-6 grid gap-6"><div><h3 className="text-xl font-semibold mb-2">Ingredients</h3><ul className="list-disc list-inside space-y-1 text-muted-foreground">{meal.ingredients.map((item, index) => <li key={index}>{item}</li>)}</ul></div><div><h3 className="text-xl font-semibold mb-2">Recipe</h3><ol className="list-decimal list-inside space-y-2 text-muted-foreground">{meal.recipe.map((step, index) => <li key={index}>{step}</li>)}</ol></div><div><h3 className="text-xl font-semibold mb-2">Nutrition Facts</h3><Table><TableHeader><TableRow><TableHead>Nutrient</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>Calories</TableCell><TableCell className="text-right">{meal.nutrition.calories}</TableCell></TableRow><TableRow><TableCell>Protein</TableCell><TableCell className="text-right">{meal.nutrition.protein}</TableCell></TableRow><TableRow><TableCell>Carbohydrates</TableCell><TableCell className="text-right">{meal.nutrition.carbs}</TableCell></TableRow><TableRow><TableCell>Fat</TableCell><TableCell className="text-right">{meal.nutrition.fat}</TableCell></TableRow></TableBody></Table></div></CardContent><CardFooter className="p-6 flex flex-col sm:flex-row gap-2 bg-muted/50"><Button variant="outline" className="w-full sm:w-auto" onClick={() => openGroceryList(meal)}><ClipboardList className="mr-2 h-4 w-4" />Grocery List</Button><Button onClick={() => handleDownloadRecipe(meal)} className="w-full sm:w-auto"><Download className="mr-2 h-4 w-4" />Download Recipe</Button></CardFooter></Card></TabsContent>))}</Tabs> ) : ( <div className="flex flex-col items-center justify-center flex-1 min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div><p className="mt-4 text-muted-foreground">Whipping something up for you...</p></div> )}
            </div>
            <DialogFooter className="p-6 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"><Button onClick={() => setIsMealSuggestionsOpen(false)} variant="secondary">Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isMealPlanOpen} onOpenChange={setIsMealPlanOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
            <DialogHeader><DialogTitle>Your 7-Day Meal Plan</DialogTitle><DialogDescription>Here is a complete meal plan for the week. Select a day to see the meals, then click a meal to get its full recipe.</DialogDescription></DialogHeader>
            {generatedPlan ? ( <div className="flex-1 overflow-y-auto -mx-6 px-6"><Accordion type="single" collapsible defaultValue="Day 1" className="w-full">{Object.entries(generatedPlan.dailyPlans).map(([day, plan]) => (<AccordionItem value={day} key={day}><AccordionTrigger>{day}</AccordionTrigger><AccordionContent><div className="space-y-4"><MealPlanItem meal={plan.breakfast} mealType="Breakfast" onSelect={handleFetchMealDetails}/><MealPlanItem meal={plan.lunch} mealType="Lunch" onSelect={handleFetchMealDetails}/><MealPlanItem meal={plan.dinner} mealType="Dinner" onSelect={handleFetchMealDetails}/></div></AccordionContent></AccordionItem>))}</Accordion></div> ) : ( <div className="flex flex-col items-center justify-center flex-1 min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div><p className="mt-4 text-muted-foreground">Building your weekly plan...</p></div> )}
            <DialogFooter className="sm:justify-between gap-2 flex-col sm:flex-row">
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleFetchFullPlan} disabled={isFetchingFullPlan || !!detailedPlan || !generatedPlan}>{isFetchingFullPlan ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}{isFetchingFullPlan ? 'Preparing Recipes...' : 'Prepare for Download'}</Button>
                <Button onClick={handleDownloadFullPlan} disabled={!detailedPlan}><Download className="mr-2 h-4 w-4" />Download Full Plan</Button>
              </div>
              <Button onClick={() => setIsMealPlanOpen(false)} variant="secondary">Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

       <Dialog open={isMealDetailOpen} onOpenChange={setIsMealDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
             <DialogHeader className="p-6 pb-2 sr-only"><DialogTitle>{activeMeal ? activeMeal.title : 'Loading Recipe'}</DialogTitle></DialogHeader>
             {isFetchingDetails && !activeMeal && ( <div className="flex flex-col items-center justify-center flex-1 min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div><p className="mt-4 text-muted-foreground">Fetching recipe details...</p></div> )}
             {activeMeal && ( <>
                <div className="flex-1 overflow-y-auto"><Card className="border-0 shadow-none rounded-none"><CardHeader className="p-6"><div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden mb-4"><Image src={activeMeal.imageUrl || 'https://picsum.photos/seed/placeholder/600/400'} alt={activeMeal.title} fill style={{objectFit: 'cover'}} data-ai-hint="food meal"/></div><CardTitle className="text-xl md:text-2xl">{activeMeal.title}</CardTitle><CardDescription>{activeMeal.description}</CardDescription></CardHeader><CardContent className="px-6 grid gap-6"><div><h3 className="text-xl font-semibold mb-2">Ingredients</h3><ul className="list-disc list-inside space-y-1 text-muted-foreground">{activeMeal.ingredients.map((item, index) => (<li key={index}>{item}</li>))}</ul></div><div><h3 className="text-xl font-semibold mb-2">Recipe</h3><ol className="list-decimal list-inside space-y-2 text-muted-foreground">{activeMeal.recipe.map((step, index) => (<li key={index}>{step}</li>))}</ol></div><div><h3 className="text-xl font-semibold mb-2">Nutrition Facts</h3><Table><TableHeader><TableRow><TableHead>Nutrient</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>Calories</TableCell><TableCell className="text-right">{activeMeal.nutrition.calories}</TableCell></TableRow><TableRow><TableCell>Protein</TableCell><TableCell className="text-right">{activeMeal.nutrition.protein}</TableCell></TableRow><TableRow><TableCell>Carbohydrates</TableCell><TableCell className="text-right">{activeMeal.nutrition.carbs}</TableCell></TableRow><TableRow><TableCell>Fat</TableCell><TableCell className="text-right">{activeMeal.nutrition.fat}</TableCell></TableRow></TableBody></Table></div></CardContent></Card></div>
                <DialogFooter className="p-6 flex-col sm:flex-row gap-2 bg-muted/50">
                    <Button variant="outline" className="w-full sm:w-auto" onClick={() => openGroceryList(activeMeal)}><ClipboardList className="mr-2 h-4 w-4" />Grocery List</Button>
                    <Button onClick={() => handleDownloadRecipe(activeMeal)} className="w-full sm:w-auto"><Download className="mr-2 h-4 w-4" />Download Recipe</Button>
                    <DialogClose asChild><Button variant="secondary" className="w-full sm:w-auto mt-2 sm:mt-0">Close</Button></DialogClose>
                </DialogFooter>
             </> )}
          </DialogContent>
       </Dialog>

        <Dialog open={isGroceryListOpen} onOpenChange={setIsGroceryListOpen}>
            <DialogContent>
                <DialogHeader><DialogTitle>Grocery List: {activeMeal?.title}</DialogTitle><DialogDescription>We've compared the recipe with your pantry. Here's what you need.</DialogDescription></DialogHeader>
                 {isFetchingGroceryList ? ( <div className="flex items-center justify-center h-48"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> ) : ( <div className="space-y-2 py-4 max-h-60 overflow-y-auto">{groceryListItems.length > 0 ? groceryListItems.map((item, index) => ( <div key={index} className="flex items-center space-x-2"><Checkbox id={`item-${index}`} checked={checkedGroceryItems.has(item)} onCheckedChange={() => handleCheckboxChange(item)} /><Label htmlFor={`item-${index}`} className="text-sm">{item}</Label></div> )) : ( <p className="text-sm text-muted-foreground text-center">You have all the ingredients!</p> )}</div> )}
                <DialogFooter className="sm:justify-between gap-2 flex-col sm:flex-row">
                    <DropdownMenu><DropdownMenuTrigger asChild><Button className="w-full sm:w-auto" disabled={isFetchingGroceryList}><ShoppingCart className="mr-2 h-4 w-4" />Shop Ingredients Online<ChevronDown className="ml-2 h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem onClick={() => handleShopOnline('walmart')}>Walmart</DropdownMenuItem><DropdownMenuItem onClick={() => handleShopOnline('amazon')}>Amazon Fresh</DropdownMenuItem><DropdownMenuItem onClick={() => handleShopOnline('instacart')}>Instacart</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
                    <Button onClick={() => setIsGroceryListOpen(false)} variant="secondary" className="w-full sm:w-auto">Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={isTutorialOpen} onOpenChange={setIsTutorialOpen}>
            <DialogContent>
                <DialogHeader><DialogTitle>{tutorialContent[tutorialStep].title}</DialogTitle><DialogDescription>{tutorialContent[tutorialStep].description}</DialogDescription></DialogHeader>
                <DialogFooter className="justify-between">
                    <div>{tutorialStep > 0 && ( <Button variant="outline" onClick={() => setTutorialStep(tutorialStep - 1)}>Back</Button> )}</div>
                    <div className="flex gap-2"><Button variant="secondary" onClick={() => setIsTutorialOpen(false)}>End Tour</Button>{tutorialStep < tutorialContent.length - 1 ? ( <Button onClick={() => setTutorialStep(tutorialStep + 1)}>Next</Button> ) : ( <Button onClick={() => setIsTutorialOpen(false)}>Finish</Button> )}</div>
                </DialogFooter>
            </DialogContent>
        </Dialog>

         <AlertDialog open={isAlreadyInstalledAlertOpen} onOpenChange={setIsAlreadyInstalledAlertOpen}>
            <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Application Already Installed</AlertDialogTitle><AlertDialogDescription>MealGenna is already installed on this device and can be launched from your home screen or app drawer.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogAction onClick={() => setIsAlreadyInstalledAlertOpen(false)}>OK</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
        </AlertDialog>

      </div>
    </>
  );
}

const MealPlanItem = ({ meal, mealType, onSelect }: { meal: SimpleMeal, mealType: string, onSelect: (meal: SimpleMeal) => void }) => (
    <div>
      <h4 className="font-semibold">{mealType}</h4>
      <button onClick={() => onSelect(meal)} className="w-full text-left p-2 rounded-md hover:bg-muted transition-colors">
        <p className="text-sm font-medium text-primary underline">{meal.title}</p>
        <p className="text-sm text-muted-foreground">{meal.description}</p>
      </button>
    </div>
);

const MealTypeButton = ({ mealType, icon, onClick }: { mealType: string, icon: ReactNode, onClick: () => void }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center gap-2 p-4 border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors">
        {icon}
        <span className="text-sm font-medium capitalize">{mealType}</span>
    </button>
);

    

    

    


