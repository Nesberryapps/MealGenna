'use client';
export const ssr = false;

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Footer } from '@/components/features/Footer';
import Link from 'next/link';
import { ArrowLeft, LogOut, Bell, User as UserIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { getRedirectResult } from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { WebRedirectGuard } from '@/components/WebRedirectGuard';

export default function ProfilePage() {
  const [isClient, setIsClient] = useState(false);
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isUserLoading && !user) {
      router.push('/');
    }
  }, [isClient, user, isUserLoading, router]);
  
  // Handle redirect result for account linking on mobile
  useEffect(() => {
    if (isClient) {
      const handleRedirect = async () => {
          if (Capacitor.isNativePlatform() && auth && user?.isAnonymous) {
              try {
                  const result = await getRedirectResult(auth);
                  if (result) {
                      toast({
                          title: 'Account Linked',
                          description: 'Your account has been successfully linked.',
                      });
                  }
              } catch (error: any) {
                  if (error.code === 'auth/credential-already-in-use') {
                      toast({
                          title: 'Linking Failed',
                          description: 'This Google/Apple account is already linked to another user.',
                          variant: 'destructive',
                      });
                  } else if (error.code !== 'auth/no-auth-operation-for-redirect') {
                      console.error('Redirect link error', error);
                      toast({
                          title: 'Linking Failed',
                          description: 'Could not link your account. Please try again.',
                          variant: 'destructive',
                      });
                  }
              }
          }
      };
      handleRedirect();
    }
}, [isClient, auth, user, toast]);


  useEffect(() => {
    if (isClient && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted' && localStorage.getItem('mealgenna-notifications-enabled') === 'true') {
        setNotificationsEnabled(true);
      }
    }
  }, [isClient]);

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await auth.signOut();
      router.push('/');
      toast({
        title: 'Signed Out',
        description: 'You have been signed out.',
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleNotificationToggle = async (checked: boolean) => {
    if (!('Notification' in window)) {
      toast({
        variant: 'destructive',
        title: 'Unsupported Browser',
        description: 'Your browser does not support notifications.',
      });
      return;
    }

    if (checked) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        toast({
          title: 'Notifications Enabled',
          description: "You'll now receive mealtime reminders.",
        });
        localStorage.setItem('mealgenna-notifications-enabled', 'true');
      } else {
        setNotificationsEnabled(false);
        toast({
          variant: 'destructive',
          title: 'Permission Denied',
          description: 'You need to grant permission to receive notifications.',
        });
        localStorage.setItem('mealgenna-notifications-enabled', 'false');
      }
    } else {
      setNotificationsEnabled(false);
      localStorage.setItem('mealgenna-notifications-enabled', 'false');
      toast({
        title: 'Notifications Disabled',
        description: "You will no longer receive mealtime reminders.",
      });
    }
  };

  const renderLoading = () => (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      <main className="flex-grow w-full max-w-md mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        <Card>
          <CardHeader className="items-center text-center">
            <Skeleton className="h-24 w-24 rounded-.full" />
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

  if (!isClient || isUserLoading || !user) {
    return renderLoading();
  }

  return (
    <WebRedirectGuard>
        <div className="flex flex-col min-h-dvh bg-background text-foreground">
        <header className="py-4 px-4 sm:px-6 lg:p-8">
            <div className="max-w-md mx-auto flex items-center justify-start">
            <Link href="/">
                <Button variant="ghost" size="icon">
                <ArrowLeft />
                </Button>
            </Link>
            </div>
        </header>
        <main className="flex-grow w-full max-w-md mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
            <Card>
            <CardHeader className="items-center text-center">
                <Avatar className="h-24 w-24">
                <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                <AvatarFallback>
                    {user.isAnonymous ? <UserIcon /> : user.displayName?.charAt(0).toUpperCase()}
                </AvatarFallback>
                </Avatar>
                <div className="pt-4">
                <CardTitle>{user.isAnonymous ? 'Guest User' : user.displayName || 'User'}</CardTitle>
                <CardDescription>{user.isAnonymous ? 'You are using a temporary guest account.' : user.email}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <Label htmlFor="notifications" className="font-medium">
                    Mealtime Notifications
                    </Label>
                </div>
                <Switch
                    id="notifications"
                    checked={notificationsEnabled}
                    onCheckedChange={handleNotificationToggle}
                />
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                            <LogOut className="mr-2" />
                            Sign Out
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {user.isAnonymous 
                                ? "Signing out as a guest is permanent. To save your meal history, please create a permanent account first." 
                                : "You will be signed out on this device."
                            }
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSignOut}>Sign Out</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
            </Card>
        </main>
        <Footer />
        </div>
    </WebRedirectGuard>
  );
}
