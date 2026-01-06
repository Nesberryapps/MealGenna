
'use client';

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Footer } from '@/components/features/Footer';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      <header className="py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
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

      <main className="flex-grow w-full max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p><strong>Last Updated: [Date]</strong></p>
            
            <p>Your privacy is important to us. It is MealGenna's policy to respect your privacy regarding any information we may collect from you across our website, and other sites we own and operate.</p>

            <h3 className="text-lg font-semibold text-foreground pt-4">1. Information We Collect</h3>
            <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.</p>
            <p>The information we collect may include: preferences, and usage data to improve our service.</p>

            <h3 className="text-lg font-semibold text-foreground pt-4">2. How We Use Your Information</h3>
            <p>We use the information we collect to provide, maintain, and improve our services, including to personalize your experience and to develop new features.</p>
            
            <h3 className="text-lg font-semibold text-foreground pt-4">3. Data Security</h3>
            <p>We retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.</p>

            <h3 className="text-lg font-semibold text-foreground pt-4">4. Your Rights</h3>
            <p>You are free to refuse our request for your personal information, with the understanding that we may be unable to provide you with some of your desired services.</p>

            <h3 className="text-lg font-semibold text-foreground pt-4">5. Contact Us</h3>
            <p>If you have any questions about how we handle user data and personal information, feel free to contact us.</p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
