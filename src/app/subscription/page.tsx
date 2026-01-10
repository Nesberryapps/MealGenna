
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/client';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Info, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Footer } from '@/components/features/Footer';
import { Logo } from '@/components/Logo';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { WebRedirectGuard } from '@/components/WebRedirectGuard';


type UserData = {
  subscriptionTier: 'free' | 'premium';
};

export default function SubscriptionPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


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

  const handleRestore = async () => {
     toast({
        title: "Action Unavailable",
        description: "This feature is currently being updated. Please try again later.",
        variant: "default",
      });
      return;
  }

  const isLoading = isUserLoading || isUserDataLoading;
  const isPremium = userData?.subscriptionTier === 'premium';

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
                        <CardTitle>Ad-Free Version</CardTitle>
                        <Badge variant={'secondary'}>
                            Coming Soon
                        </Badge>
                        </div>
                        <CardDescription>
                        Enjoy an uninterrupted experience.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Alert variant="default">
                            <Info className="h-4 w-4" />
                            <AlertTitle>Stay Tuned!</AlertTitle>
                            <AlertDescription>
                                We are working on an ad-free premium version. For now, all features are supported by ads.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            </div>
            )}
        </main>
        <Footer />
        </div>
    </WebRedirectGuard>
  );
}
