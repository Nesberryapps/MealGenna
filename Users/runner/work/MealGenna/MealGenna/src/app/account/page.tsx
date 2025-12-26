
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Loader2, LogOut, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Capacitor } from '@capacitor/core';
import { GoProModal } from '@/components/go-pro-modal';

export default function AccountPage() {
  const { toast } = useToast();
  const { user, credits, refreshCredits, isInitialized, signOut } = useAuth();
  
  const [isClient, setIsClient] = useState(false);
  const [isGoProModalOpen, setIsGoProModalOpen] = useState(false);

  useEffect(() => { setIsClient(true); }, []);
  
  const handleSignOut = async () => {
      await signOut();
      toast({ title: 'Signed Out', description: 'You have been signed out.' });
  }

  useEffect(() => {
    if (isClient) {
        const params = new URLSearchParams(window.location.search);
        if (params.get('payment_success') === 'true') {
          toast({
            title: "Payment Successful!",
            description: "Your credits have been added. It may take a moment for them to appear.",
          });
          if (refreshCredits) refreshCredits();
          // Remove query params from URL
          const newUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]);

  const isLoading = !isInitialized;

  const getStatusContent = () => {
      if (!isClient || isLoading) {
          return { text: 'Loading status...', badge: <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> };
      }
      if (Capacitor.getPlatform() !== 'web') {
           return { text: 'You are on the Mobile plan.', badge: <Badge variant="secondary" className="text-base">Mobile</Badge> };
      }
      if (!user) {
          return { text: 'Sign in to sync credits.', badge: <Badge variant="outline" className="text-base">Guest</Badge> };
      }
      const singleCredits = credits?.single || 0;
      const planCredits = credits?.['7-day-plan'] || 0;

      if (singleCredits > 0 || planCredits > 0) {
          return { text: 'You have active generation credits.', badge: <Badge variant="premium" className="text-base">Active</Badge> };
      }
      return { text: 'You are out of credits.', badge: <Badge variant="destructive" className="text-base">Free</Badge> };
  };

  const status = getStatusContent();

  return (
    <>
    <GoProModal isOpen={isGoProModalOpen} onClose={() => setIsGoProModalOpen(false)} />
    <div className="container py-12 md:py-20">
      <Card className="max-w-xl mx-auto relative">
         <Link href="/" className="absolute top-4 right-4">
              <Button variant="ghost" size="icon">
                  <X className="h-5 w-5 text-muted-foreground" />
                  <span className="sr-only">Close</span>
              </Button>
          </Link>
        <CardHeader>
          <CardTitle className="text-3xl">Your Account</CardTitle>
          <CardDescription>
            Manage your account and generation credits.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div>
              <p className="font-semibold">Account Status</p>
              <div className="text-sm text-muted-foreground">{status.text}</div>
            </div>
            {status.badge}
          </div>
          
          {isClient && Capacitor.getPlatform() === 'web' && (
             user ? (
                <div className="space-y-4">
                    <div className="text-sm text-center text-muted-foreground">Signed in as <span className="font-semibold text-primary">{user.email}</span></div>
                     <div className="p-4 border rounded-lg grid grid-cols-2 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold">{credits?.single ?? <Loader2 className="inline-block h-6 w-6 animate-spin" />}</div>
                            <p className="text-sm text-muted-foreground">Single Meal Credits</p>
                        </div>
                         <div className="text-center">
                            <div className="text-2xl font-bold">{credits?.['7-day-plan'] ?? <Loader2 className="inline-block h-6 w-6 animate-spin" />}</div>
                            <p className="text-sm text-muted-foreground">Meal Plan Credits</p>
                        </div>
                    </div>
                     <Button onClick={() => setIsGoProModalOpen(true)} className="w-full">
                        <Star className="mr-2 h-4 w-4" /> Get More With The App
                    </Button>
                    <Button onClick={handleSignOut} variant="outline" className="w-full">
                        <LogOut className="mr-2 h-4 w-4" /> Sign Out
                    </Button>
                </div>
            ) : (
                <div className="space-y-4 p-4 border rounded-lg text-center">
                    <h3 className="font-semibold">Get Started on Web</h3>
                    <p className="text-sm text-muted-foreground">
                        Sign in to sync your credits or get the app for unlimited generations.
                    </p>
                    {/* The login flow is now primarily handled via magic link on the main page. 
                        This button could open a login modal in the future. For now, it opens the app store modal. */}
                    <Button onClick={() => setIsGoProModalOpen(true)} className="w-full">
                       <Star className="mr-2 h-4 w-4" /> Get the App
                    </Button>
                </div>
            )
          )}
          
           <div className="p-6 rounded-lg bg-gradient-to-br from-primary/10 to-primary/20 text-center">
              <h3 className="text-xl font-bold">Enjoy MealGenna on Mobile</h3>
              <p className="text-muted-foreground mt-1 mb-4">Get unlimited ad-supported meal generations on our mobile app!</p>
              <div className="flex gap-4 justify-center">
              <Link href="https://play.google.com/store/apps/details?id=com.nesberry.mealgenna.pro" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-105">
                <img 
                  src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" 
                  alt="Get it on Google Play" 
                  className="h-12 w-auto"
                />
              </Link>
  
              <Link href="https://apps.apple.com/us/app/mealgenna-ai-meal-planner/id6755921708" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-105">
                <img 
                  src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" 
                  alt="Download on the App Store" 
                  className="h-12 w-auto"
                />
              </Link>
            </div>
            </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-4">
           <p className="text-sm text-muted-foreground">
            For the best experience and unlimited generations, download the MealGenna mobile app. One-time credit purchases on the web are no longer available.
          </p>
        </CardFooter>
      </Card>
    </div>
    </>
  );
}
