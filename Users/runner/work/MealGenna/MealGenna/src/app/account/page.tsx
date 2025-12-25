
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Loader2, LogOut, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { usePremium } from '@/hooks/use-premium';
import { PaywallModal } from '@/components/PaywallModal';
import { Capacitor } from '@capacitor/core';

export default function AccountPage() {
  const { toast } = useToast();
  const { user, isInitialized, beginRecovery, signOut, isRecovering, verifySignInLink } = useAuth();
  const { credits, isInitialized: premiumInitialized, refreshCredits } = usePremium();
  
  const [email, setEmail] = useState('');
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ variant: 'destructive', title: 'Email is required' });
      return;
    }
    const result = await beginRecovery(email);
    if (result.success) {
        toast({ title: 'Check your email!', description: result.message });
    } else {
        toast({ variant: 'destructive', title: 'Recovery Failed', description: result.message });
    }
    setEmail('');
  };
  
  const handleSignOut = async () => {
      await signOut();
      toast({ title: 'Signed Out', description: 'You have been signed out.' });
  }

  useEffect(() => {
    // This effect runs once on mount to check for a sign-in link
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
    
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment_success') === 'true') {
      toast({
        title: "Payment Successful!",
        description: "Your credits have been added. It may take a moment for them to appear.",
      });
      refreshCredits();
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLoading = !isInitialized || (user && !premiumInitialized);

  const getStatusContent = () => {
      if (isLoading) {
          return { text: 'Loading status...', badge: <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> };
      }
      if (isClient && Capacitor.getPlatform() !== 'web') {
           return { text: 'You are on the Mobile plan.', badge: <Badge variant="secondary" className="text-base">Mobile</Badge> };
      }
      if (!user) {
          return { text: 'Sign in to see your status.', badge: <Badge variant="outline" className="text-base">Guest</Badge> };
      }
      const singleCredits = credits?.single || 0;
      const planCredits = credits?.['7-day-plan'] || 0;

      if (singleCredits > 0 || planCredits > 0) {
          return { text: 'You have active generation credits.', badge: <Badge variant="premium" className="text-base">Active</Badge> };
      }
      return { text: 'You are on the Free plan.', badge: <Badge variant="secondary" className="text-base">Free</Badge> };
  };

  const status = getStatusContent();

  return (
    <div className="container py-12 md:py-20">
       {user && <PaywallModal isOpen={isPaywallOpen} onClose={() => setIsPaywallOpen(false)} />}
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
              <p className="text-sm text-muted-foreground">{status.text}</p>
            </div>
            {status.badge}
          </div>
          
          {isClient && Capacitor.getPlatform() === 'web' && (
             user ? (
                <div className="space-y-4">
                    <p className="text-sm text-center text-muted-foreground">Signed in as <span className="font-semibold text-primary">{user.email}</span></p>
                     <div className="p-4 border rounded-lg grid grid-cols-2 gap-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold">{credits?.single ?? <Loader2 className="inline-block h-6 w-6 animate-spin" />}</p>
                            <p className="text-sm text-muted-foreground">Single Meal Credits</p>
                        </div>
                         <div className="text-center">
                            <p className="text-2xl font-bold">{credits?.['7-day-plan'] ?? <Loader2 className="inline-block h-6 w-6 animate-spin" />}</p>
                            <p className="text-sm text-muted-foreground">Meal Plan Credits</p>
                        </div>
                    </div>
                     <Button onClick={() => setIsPaywallOpen(true)} className="w-full">
                        Purchase More Credits
                    </Button>
                    <Button onClick={handleSignOut} variant="outline" className="w-full">
                        <LogOut className="mr-2 h-4 w-4" /> Sign Out
                    </Button>
                </div>
            ) : (
                 <form onSubmit={handleSignIn} className="space-y-4 p-4 border rounded-lg">
                    <h3 className="font-semibold">Sign In for Web</h3>
                    <p className="text-sm text-muted-foreground">
                        Sign in with a magic link to track your purchased credits on the web. No password needed.
                    </p>
                    <div className="flex gap-2">
                        <Input 
                            type="email" 
                            placeholder="your@email.com" 
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            disabled={isRecovering}
                            required
                        />
                        <Button type="submit" disabled={isRecovering}>
                            {isRecovering ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                            <span className="sr-only">Send Link</span>
                        </Button>
                    </div>
                 </form>
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
  
              <Link href="https://apps.apple.com/us/app/mealgenna-pro/id6503874984" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-105">
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
            Get the full experience on our mobile apps. One-time purchases are only available on web.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
