
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';

export default function AccountPage() {
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This ensures that browser-specific logic runs only on the client
    setIsClient(true);
  }, []);
  
  const getStatusText = () => {
    if (!isClient) {
      return 'Loading status...';
    }
    return 'You are currently on the Free plan.';
  };

  return (
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
            Manage your app settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div>
              <p className="font-semibold">Account Status</p>
              <p className="text-sm text-muted-foreground">{getStatusText()}</p>
            </div>
            {isClient ? (
                <Badge variant="secondary" className="text-base">Free</Badge>
            ) : (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            )}
          </div>
           <div className="p-6 rounded-lg bg-gradient-to-br from-primary/10 to-primary/20 text-center">
              <h3 className="text-xl font-bold">Enjoy MealGenna</h3>
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
            Get the full experience on our mobile apps.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
