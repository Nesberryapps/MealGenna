
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, Star, Info, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Footer } from '@/components/features/Footer';
import { Logo } from '@/components/Logo';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Capacitor } from '@capacitor/core';
import type { Purchases, LOG_LEVEL, PurchasesPackage, CustomerInfo } from '@revenuecat/purchases-capacitor';
import { WebRedirectGuard } from '@/components/WebRedirectGuard';

type UserData = {
  subscriptionTier: 'free' | 'premium';
  trialGenerations?: number;
  trialStartedAt?: { toDate: () => Date };
};

export default function SubscriptionPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isFetchingPackages, setIsFetchingPackages] = useState(true);
  const [isRevenueCatReady, setIsRevenueCatReady] = useState(false);
  const [Purchases, setPurchases] = useState<typeof import('@revenuecat/purchases-capacitor').Purchases | null>(null);

  const userRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userData, isLoading: isUserDataLoading } = useDoc<UserData>(userRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    const initRevenueCat = async () => {
      if (!user || Capacitor.getPlatform() === 'web') {
        setIsFetchingPackages(false);
        return;
      };
      
      try {
        const RevenueCat = await import('@revenuecat/purchases-capacitor');
        const Purchases = RevenueCat.Purchases;
        setPurchases(Purchases);

        const platform = Capacitor.getPlatform();
        const apiKey = platform === 'ios' 
          ? process.env.NEXT_PUBLIC_REVENUECAT_API_KEY_APPLE 
          : process.env.NEXT_PUBLIC_REVENUECAT_API_KEY_GOOGLE;

        if (!apiKey) {
            console.error("RevenueCat API key is not set.");
            setIsFetchingPackages(false);
            return;
        }
        
        await Purchases.configure({ apiKey });

        await Purchases.logIn({ appUserID: user.uid });

        setIsRevenueCatReady(true);

        Purchases.addCustomerInfoUpdateListener(async (info: CustomerInfo) => {
            await updateSubscriptionStatus(info);
        });

        const offerings = await Purchases.getOfferings();
        if (offerings.current && offerings.current.availablePackages.length > 0) {
          setPackages(offerings.current.availablePackages);
        }
      } catch (e) {
        console.error('Error initializing RevenueCat or fetching offerings:', e);
        toast({
          title: "Error",
          description: "Could not load subscription options. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsFetchingPackages(false);
      }
    };

    if (user && !isUserLoading) {
        initRevenueCat();
    }
  }, [user, isUserLoading, toast]);

  const updateSubscriptionStatus = async (customerInfo: CustomerInfo) => {
    if (!userRef) return;
    const isPremium = typeof customerInfo.entitlements.active['premium'] !== "undefined";
    
    try {
        await updateDoc(userRef, {
            subscriptionTier: isPremium ? 'premium' : 'free'
        });
    } catch (error) {
        console.error("Error updating user subscription status in Firestore:", error);
    }
  };


  const handleSubscribe = async (pack: PurchasesPackage) => {
    if (!Purchases || !user) {
      toast({ title: "Please sign in to subscribe.", variant: "destructive" });
      return;
    }
    setIsPurchasing(true);
    try {
      const { customerInfo } = await Purchases.purchasePackage({ aPackage: pack });
      toast({
        title: "Purchase Successful!",
        description: "Welcome to MealGenna Premium!",
      });
      await updateSubscriptionStatus(customerInfo);
    } catch (e: any) {
      if (!e.userCancelled) {
        console.error('Purchase error:', e);
        toast({
          title: "Purchase Failed",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
     if (!Purchases) return;
     try {
      const { customerInfo } = await Purchases.restorePurchases();
      if (customerInfo.entitlements.active['premium']) {
        toast({
          title: 'Purchases Restored',
          description: 'Your premium access has been restored.',
        });
         await updateSubscriptionStatus(customerInfo);
      } else {
         toast({
            title: 'No Purchases Found',
            description: 'We could not find any previous purchases to restore.',
        });
      }
    } catch (e) {
      console.error('Restore error:', e);
       toast({
        title: 'Restore Failed',
        description: 'Could not restore purchases. Please contact support.',
        variant: 'destructive',
      });
    }
  }

  const isLoading = isUserLoading || isUserDataLoading;
  const isPremium = userData?.subscriptionTier === 'premium';
  
  const renderPackageCard = () => {
    if (Capacitor.getPlatform() === 'web') {
      return (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Subscriptions Unavailable</AlertTitle>
          <AlertDescription>
            Managing subscriptions is only available in the mobile app.
          </AlertDescription>
        </Alert>
      )
    }

    if (isFetchingPackages) {
        return (
             <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-full" />
                </CardFooter>
            </Card>
        );
    }

    if (isPremium) return null;

    if (packages.length === 0) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Upgrade to Premium</CardTitle>
                    <CardDescription>Subscription options are currently unavailable.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Please check back later or contact support if this issue persists.</p>
                </CardContent>
             </Card>
        )
    }

    return packages.map((pack) => (
        <Card key={pack.identifier} className="bg-gradient-to-br from-primary/20 to-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Star className="text-primary" />
                    {pack.product.title}
                </CardTitle>
                <CardDescription>{pack.product.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-center">
                    <span className="text-4xl font-bold">{pack.product.priceString}</span>
                    <span className="text-muted-foreground">/{pack.packageType.toLowerCase().replace('monthly', 'month')}</span>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-primary" /><span>Unlimited meal generations.</span></li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-primary" /><span>Access to the 7-Day Meal Planner.</span></li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-primary" /><span>Download recipes as PDFs.</span></li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-primary" /><span>Shop for ingredients online.</span></li>
                </ul>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={() => handleSubscribe(pack)} disabled={isPurchasing || isLoading}>
                    {isPurchasing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Star className="mr-2" />}
                    Subscribe Now
                </Button>
            </CardFooter>
        </Card>
    ));
  }


  const renderLoadingSkeleton = () => (
     <div className="space-y-4">
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
            </CardHeader>
        </Card>
        <Skeleton className="h-64 w-full" />
    </div>
  );

  return (
    <WebRedirectGuard>
        <div className="flex flex-col min-h-dvh bg-background text-foreground">
            <header className="py-4 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <Link href="/profile">
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
            {isLoading ? renderLoadingSkeleton() : (
            <div className="space-y-6">
                <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                    <CardTitle>Your Plan</CardTitle>
                    <Badge variant={isPremium ? 'default' : 'secondary'}>
                        {isPremium ? 'Premium' : 'Free'}
                    </Badge>
                    </div>
                    <CardDescription>
                    {isPremium ? 'You have full access to all features.' : 'Upgrade to premium to unlock all features.'}
                    </CardDescription>
                </CardHeader>
                {isPremium && (
                    <CardContent>
                        <Alert variant="default">
                            <Star className="h-4 w-4" />
                            <AlertTitle>Thank You!</AlertTitle>
                            <AlertDescription>
                                Your support helps us continue to improve MealGenna.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                )}
                </Card>

                {renderPackageCard()}

                {Capacitor.getPlatform() !== 'web' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Manage Subscription</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <Button onClick={handleRestore} variant="outline" className="w-full" disabled={isPurchasing}>
                            Restore Purchases
                        </Button>
                        {isPremium && (
                            <p className="text-xs text-center text-muted-foreground">You can manage your subscription through your device's app store settings.</p>
                        )}
                    </CardContent>
                </Card>
                )}

            </div>
            )}
        </main>
        <Footer />
        </div>
    </WebRedirectGuard>
  );
}
