
"use client";

import { useState, useEffect } from 'react';
import { Logo } from '@/components/Logo';
import { ActionCard } from '@/components/features/ActionCard';
import { Footer } from '@/components/features/Footer';
import { Button } from '@/components/ui/button';
import { Smartphone, Download, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      {/* Header */}
      <header className="py-4 px-4 sm:px-6 lg:px-8 border-b">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo />
            <h1 className="text-xl font-bold text-foreground">MealGenna</h1>
          </div>
          <div className="hidden sm:block">
             <Link href="#download">
                <Button>Get the App</Button>
             </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full">
        {/* Hero Section */}
        <section className="bg-muted/30 py-16 sm:py-24 px-4">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 text-left space-y-6">
                    <h2 className="text-4xl md:text-6xl font-black font-headline tracking-tight">
                        Instant Meal Ideas,<br/> <span className="text-primary">Zero Hassle.</span>
                    </h2>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                        Stop staring at the fridge. MealGenna uses AI to turn your ingredients into delicious recipes in seconds. 
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 pt-4" id="download">
                        <Button size="lg" className="h-14 px-8 text-lg w-full sm:w-auto gap-2" asChild>
                            <Link href="https://apps.apple.com" target="_blank">
                                <Download className="w-5 h-5" />
                                Download for iOS
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="h-14 px-8 text-lg w-full sm:w-auto gap-2" asChild>
                            <Link href="https://play.google.com" target="_blank">
                                <Smartphone className="w-5 h-5" />
                                Download for Android
                            </Link>
                        </Button>
                    </div>
                    <p className="text-sm text-muted-foreground pt-2">
                        * Unlimited free ideas available on the mobile app.
                    </p>
                </div>
                
                {/* Hero Image / App Preview */}
                <div className="flex-1 w-full max-w-sm md:max-w-md relative">
                    <div className="relative aspect-[9/19] rounded-[3rem] border-8 border-foreground/10 overflow-hidden shadow-2xl bg-background">
                         <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 flex flex-col p-6">
                            <div className="w-full h-48 rounded-2xl bg-muted animate-pulse mb-6 relative overflow-hidden">
                                <Image src="/ramen.jpg" alt="Ramen" fill className="object-cover opacity-80" />
                            </div>
                            <div className="space-y-3">
                                <div className="h-8 w-3/4 bg-foreground/10 rounded" />
                                <div className="h-4 w-full bg-foreground/5 rounded" />
                                <div className="h-4 w-5/6 bg-foreground/5 rounded" />
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 px-4 bg-background">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h3 className="text-3xl font-bold mb-4">Why MealGenna?</h3>
                    <p className="text-muted-foreground text-lg">Everything you need to master your meal prep.</p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="flex flex-col space-y-3 p-6 rounded-xl bg-card border shadow-sm">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <h4 className="text-xl font-bold">Smart Ingredient Scanner</h4>
                        <p className="text-muted-foreground">Snap a photo of your pantry or fridge, and let our AI suggest recipes based on what you already have.</p>
                    </div>

                    <div className="flex flex-col space-y-3 p-6 rounded-xl bg-card border shadow-sm">
                         <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <h4 className="text-xl font-bold">Customizable Preferences</h4>
                        <p className="text-muted-foreground">Vegetarian, Keto, or just picky? Tailor every suggestion to your dietary needs and taste buds.</p>
                    </div>

                    <div className="flex flex-col space-y-3 p-6 rounded-xl bg-card border shadow-sm">
                         <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <h4 className="text-xl font-bold">7-Day Meal Plans</h4>
                        <p className="text-muted-foreground">Get a full week of meals planned out for you instantly. Save time, money, and stress.</p>
                    </div>
                </div>
            </div>
        </section>

         {/* CTA Section */}
         <section className="py-20 px-4 bg-primary text-primary-foreground">
            <div className="max-w-3xl mx-auto text-center space-y-8">
                <h2 className="text-3xl md:text-5xl font-bold">Ready to cook smarter?</h2>
                <p className="text-xl opacity-90">Join thousands of users simplifying their daily cooking routine.</p>
                <Button size="lg" variant="secondary" className="h-14 px-10 text-lg font-semibold" asChild>
                     <Link href="https://apps.apple.com" target="_blank">
                        Download Now
                    </Link>
                </Button>
            </div>
         </section>

      </main>
      <Footer />
    </div>
  );
}
