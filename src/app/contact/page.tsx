'use client';

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Footer } from '@/components/features/Footer';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function ContactPage() {
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
            <h1 className="text-xl font-bold text-foreground">MealGenius</h1>
          </div>
          <div className="w-8"></div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <p className="text-muted-foreground">
                Have a question, feedback, or just want to say hello? Fill out the form below and we'll get back to you as soon as possible.
            </p>
            <form className="space-y-4">
                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" type="text" placeholder="Your Name" />
                </div>
                 <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="Your Email Address" />
                </div>
                 <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" placeholder="Your message..." />
                </div>
                <Button type="submit" className="w-full">Send Message</Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
