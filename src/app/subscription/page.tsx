
'use client';

import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, ExternalLink, Star } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Footer } from '@/components/features/Footer';
import { Logo } from '@/components/Logo';
import { Separator } from '@/components/ui/separator';

type UserData = {
  subscriptionTier: 'free' | 'premium';
  trialGenerations?: number;
  trialStartedAt?: { toDate: () => Date };
};

export default function SubscriptionPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userData, isLoading: isUserDataLoading } = useDoc<UserData>(userRef);

  const isLoading = isUserLoading || isUserDataLoading;
  const trialGenerations = userData?.trialGenerations || 0;
  const maxTrialGenerations = 3;
  const progress = (trialGenerations / maxTrialGenerations) * 100;
  const isPremium = userData?.subscriptionTier === 'premium';
  
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
                   <div>
                        <div className="flex justify-between items-center mb-1">
                            <p className="text-sm text-muted-foreground">Trial Generations Used</p>
                            <p className="text-sm font-medium">{trialGenerations} / {maxTrialGenerations}</p>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>
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
                    <Button className="w-full">
                    <Star className="mr-2" />
                    Subscribe Now
                    </Button>
                </CardFooter>
                </Card>
            )}

            {isPremium && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Manage Subscription</CardTitle>
                        <CardDescription>
                            You can manage or cancel your subscription at any time through the App Store.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <a href="https://apps.apple.com/account/subscriptions" target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2"/>
                                Manage on App Store
                            </a>
                        </Button>
                    </CardContent>
                </Card>
            )}

          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
