'use client';

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Footer } from '@/components/features/Footer';

export default function TermsPage() {
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
            <CardTitle>Terms &amp; Conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p><strong>Last Updated: [Date]</strong></p>
            
            <p>By accessing the app MealGenna, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>

            <h3 className="text-lg font-semibold text-foreground pt-4">1. Use License</h3>
            <p>Permission is granted to temporarily download one copy of the materials (information or software) on MealGenna's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.</p>

            <h3 className="text-lg font-semibold text-foreground pt-4">2. Disclaimer</h3>
            <p>The materials on MealGenna's app are provided on an 'as is' basis. MealGenna makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
            
            <h3 className="text-lg font-semibold text-foreground pt-4">3. Limitations</h3>
            <p>In no event shall MealGenna or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on MealGenna's app.</p>

            <h3 className="text-lg font-semibold text-foreground pt-4">4. Governing Law</h3>
            <p>These terms and conditions are governed by and construed in accordance with the laws of [Your Jurisdiction] and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.</p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
