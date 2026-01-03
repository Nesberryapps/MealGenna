
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Footer } from '@/components/features/Footer';
import Link from 'next/link';
import { ArrowLeft, LogOut, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  const renderLoading = () => (
     <div className="flex flex-col min-h-dvh bg-background text-foreground">
        <main className="flex-grow w-full max-w-md mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
            <Card>
                <CardHeader className="items-center text-center">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="space-y-2 pt-4">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-4 w-52" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </main>
    </div>
  );

  if (isUserLoading || !user) {
    return renderLoading();
  }

  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
        <header className="py-4 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto flex items-center justify-start">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/">
                        <ArrowLeft />
                    </Link>
                </Button>
            </div>
      </header>
       <main className="flex-grow w-full max-w-md mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        <Card>
          <CardHeader className="items-center text-center">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
              <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="pt-4">
                <CardTitle>{user.displayName}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
             <Button asChild variant="default" className="w-full">
                 <Link href="/subscription">
                    <Star className="mr-2"/>
                    Manage Subscription
                 </Link>
            </Button>
            <Button onClick={handleSignOut} variant="destructive" className="w-full">
              <LogOut className="mr-2"/>
              Sign Out
            </Button>
             <Button asChild variant="outline" className="w-full">
                 <Link href="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
