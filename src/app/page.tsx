import { Logo } from '@/components/Logo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IngredientIdeator } from '@/components/features/IngredientIdeator';
import { QuickMealGenerator } from '@/components/features/QuickMealGenerator';
import { WeeklyMealPlanner } from '@/components/features/WeeklyMealPlanner';
import { UtensilsCrossed, Zap, CalendarDays } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      <header className="py-4 px-4 sm:px-6 lg:px-8 border-b border-border shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Logo />
          <h1 className="text-2xl font-bold text-foreground font-headline">MealGenius</h1>
        </div>
      </header>
      <main className="flex-grow w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="text-center my-8 md:my-12">
          <h2 className="text-4xl md:text-5xl font-black font-headline mb-4 tracking-tight">
            Your Personal Meal Assistant
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Never wonder what to cook again. Get instant meal ideas from ingredients you already have, find quick recipes, or plan your entire week with AI.
          </p>
        </div>

        <Tabs defaultValue="ingredients" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 max-w-2xl mx-auto bg-card border h-auto sm:h-12">
            <TabsTrigger value="ingredients" className="py-2.5 text-base sm:text-sm"><UtensilsCrossed className="mr-2" /> From Ingredients</TabsTrigger>
            <TabsTrigger value="quick-ideas" className="py-2.5 text-base sm:text-sm"><Zap className="mr-2" /> Quick Ideas</TabsTrigger>
            <TabsTrigger value="meal-plan" className="py-2.5 text-base sm:text-sm"><CalendarDays className="mr-2" /> 7-Day Plan</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ingredients" className="mt-8 focus-visible:ring-0 focus-visible:ring-offset-0">
            <IngredientIdeator />
          </TabsContent>
          <TabsContent value="quick-ideas" className="mt-8 focus-visible:ring-0 focus-visible:ring-offset-0">
            <QuickMealGenerator />
          </TabsContent>
          <TabsContent value="meal-plan" className="mt-8 focus-visible:ring-0 focus-visible:ring-offset-0">
            <WeeklyMealPlanner />
          </TabsContent>
        </Tabs>
      </main>
      <footer className="text-center py-6 px-4 text-sm text-muted-foreground border-t border-border">
        <p>&copy; {new Date().getFullYear()} MealGenius. All rights reserved.</p>
      </footer>
    </div>
  );
}
