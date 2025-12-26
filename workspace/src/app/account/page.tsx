
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Star } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { Capacitor } from '@capacitor/core';
import { GoProModal } from '@/components/go-pro-modal';

export default function AccountPage() {
  const [isGoProModalOpen, setIsGoProModalOpen] = useState(false);

  const getStatusContent = () => {
      if (Capacitor.getPlatform() !== 'web') {
           return { text: 'You are on the Mobile plan.', badge: <Badge variant="secondary" className="text-base">Mobile</Badge> };
      }
      return { text: 'You are using the Web version.', badge: <Badge variant="outline" className="text-base">Web</Badge> };
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
            Manage your app experience.
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
          
          {Capacitor.getPlatform() === 'web' && (
            <div className="space-y-4 p-4 border rounded-lg text-center">
                <h3 className="font-semibold">Get Unlimited Generations</h3>
                <p className="text-sm text-muted-foreground">
                    Download the mobile app for unlimited, ad-supported meal generations and the full MealGenna experience.
                </p>
                <Button onClick={() => setIsGoProModalOpen(true)} className="w-full">
                   <Star className="mr-2 h-4 w-4" /> Get the Mobile App
                </Button>
            </div>
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
            The web version of MealGenna provides a free preview of our service. For the best experience and unlimited generations, please download the MealGenna mobile app.
          </p>
        </CardFooter>
      </Card>
    </div>
    </>
  );
}
