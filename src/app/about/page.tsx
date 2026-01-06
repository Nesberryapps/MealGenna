
'use client';

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Footer } from '@/components/features/Footer';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      <header className="py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/" legacyBehavior>
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

      <main className="flex-grow w-full max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>About MealGenna</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Welcome to MealGenna, your personal AI-powered meal assistant designed to make your life easier and your meals more delicious. Our mission is to take the stress out of meal planning and inspire creativity in the kitchen, no matter what ingredients you have on hand.
            </p>
            <p>
              At MealGenna, we believe that everyone deserves to enjoy home-cooked meals without the hassle of deciding what to make. Whether you're a busy professional, a parent juggling a hectic schedule, or a culinary enthusiast looking for new ideas, our app is here to help.
            </p>
            <h3 className="text-lg font-semibold text-foreground pt-4">Our Features</h3>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Ingredient Scanner:</strong> Use your phone's camera to scan ingredients in your fridge or pantry, and get instant meal suggestions.</li>
              <li><strong>Personalized Meal Ideas:</strong> Tell us your preferences, and we'll generate creative meal ideas complete with recipes, nutritional information, and a beautiful image of the dish.</li>
              <li><strong>7-Day Meal Planner:</strong> Plan your entire week with a customized meal plan that caters to your dietary needs and allergies.</li>
            </ul>
            <p className="pt-4">
              We are passionate about food and technology, and we're constantly working to improve MealGenna to better serve you. Thank you for joining us on this culinary journey!
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
