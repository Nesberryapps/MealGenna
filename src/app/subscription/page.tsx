
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, ExternalLink, Star, Info } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Footer } from '@/components/features/Footer';
import { Logo } from '@/components/Logo';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"


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
  const [trialTimeLeft, setTrialTimeLeft] = useState<string>('');

  const userRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userData, isLoading: isUserDataLoading } = useDoc<UserData>(userRef);

  useEffect(() => {
    if (userData?.subscriptionTier === 'free' && userData.trialStartedAt) {
      const trialEndTime = userData.trialStartedAt.toDate().getTime() + 24 * 60 * 60 * 1000;
      
      const updateTimer = () => {
        const now = new Date().getTime();
        const timeLeft = trialEndTime - now;

        if (timeLeft <= 0) {
          setTrialTimeLeft('Expired');
        } else {
          const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
          setTrialTimeLeft(`${hours}h ${minutes}m left`);
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [userData]);


  const handleSubscribe = async () => {
    toast({ title: "Coming Soon!", description: "The ability to subscribe is not yet implemented." });
  };

  const handleRestore = async () => {
    toast({ title: "Coming Soon!", description: "The ability to restore purchases is not yet implemented." });
  }

  const isLoading = isUserLoading || isUserDataLoading;
  const isPremium = userData?.subscriptionTier === 'premium';
  const trialStarted = userData && (userData.trialGenerations || 0) > 0;

  const renderLoading = () => (
     <div className="space-y-4">
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-6 w-full" />
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-10 w-full mt-4" />
            </CardContent>
        </Card>
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

      <main className="flex-grow w-full max-w-md mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        {isLoading ? renderLoading() : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Your Plan</CardTitle>
                   <Badge variant={isPremium ? 'default' : 'secondary'}>
                    {isPremium ? 'Premium' : 'Free Trial'}
                   </Badge>
                </div>
                <CardDescription>
                  {isPremium ? 'You have full access to all features.' : 'You are currently on the free trial plan.'}
                </CardDescription>
              </CardHeader>
              {!isPremium && (
                <CardContent>
                   {trialStarted ? (
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertTitle>Trial Active</AlertTitle>
                            <AlertDescription>
                                {trialTimeLeft === 'Expired'
                                ? 'Your 24-hour free trial has expired.'
                                : `Your 24-hour free trial is active. You have ${trialTimeLeft} remaining.`
                                }
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <Alert variant="default">
                            <Info className="h-4 w-4" />
                            <AlertTitle>Start Your Trial</AlertTitle>
                            <AlertDescription>
                                Your 24-hour free trial will begin with your first meal generation.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
              )}
            </Card>

            {!isPremium && (
                <Card className="bg-gradient-to-br from-primary/20 to-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <Star className="text-primary" />
                    Upgrade to Premium
                    </CardTitle>
                    <CardDescription>Unlock the full power of MealGenna for just $5.99/month.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            <span>Unlimited meal generations.</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            <span>Access to the 7-Day Meal Planner.</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            <span>Download recipes as PDFs.</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            <span>Priority support.</span>
                        </li>
                    </ul>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={handleSubscribe}>
                        <Star className="mr-2" />
                        Subscribe Now
                    </Button>
                </CardFooter>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Manage Subscription</CardTitle>
                    <CardDescription>
                        {isPremium 
                            ? "You can manage or cancel your subscription through the App Store or Google Play."
                            : "Restore your previous purchases if you've reinstalled the app."
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    {isPremium && (
                        <>
                        <Button asChild className="w-full" variant="outline">
                            <a href="https://apps.apple.com/account/subscriptions" target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2"/>
                                Manage on App Store
                            </a>
                        </Button>
                        <Button asChild className="w-full" variant="outline">
                             <a href="https://play.google.com/store/account/subscriptions" target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2"/>
                                Manage on Google Play
                            </a>
                        </Button>
                        </>
                    )}
                     <Button onClick={handleRestore} variant="outline" className="w-full">
                        Restore Purchases
                    </Button>
                </CardContent>
            </Card>

          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
