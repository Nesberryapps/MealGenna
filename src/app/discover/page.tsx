'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { Shuffle, Info, Drumstick, CookingPot, Flame, Download, Loader2, ShoppingCart, CheckSquare } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { type Recipe } from '@/ai/flows/generate-recipes-from-pantry';
import { handleDownload } from '@/lib/pdf';
import { getDiscoverMeal } from '../actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const createShoppingUrl = (ingredients: string[]) => {
  if (ingredients.length === 0) {
    return 'https://www.walmart.com/search?q=groceries';
  }
  const query = ingredients.join(' ');
  return `https://www.walmart.com/search?q=${encodeURIComponent(query)}`;
};

function IngredientsList({ ingredients }: { ingredients: string[] }) {
    const [selectedIngredients, setSelectedIngredients] = useState<string[]>(ingredients);

    const handleCheckboxChange = (ingredient: string, checked: boolean) => {
        if (checked) {
            setSelectedIngredients(prev => [...prev, ingredient]);
        } else {
            setSelectedIngredients(prev => prev.filter(item => item !== ingredient));
        }
    };
    
    return (
        <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
                <Drumstick /> Ingredients
            </h3>
            <div className="space-y-2 pl-2 text-muted-foreground">
                {ingredients.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <Checkbox
                            id={`ingredient-${i}`}
                            defaultChecked={true}
                            onCheckedChange={(checked) => handleCheckboxChange(item, !!checked)}
                        />
                        <Label htmlFor={`ingredient-${i}`} className="font-normal">{item}</Label>
                    </div>
                ))}
            </div>
            <Button onClick={() => window.open(createShoppingUrl(selectedIngredients), '_blank')} variant="outline" className="w-full">
                <ShoppingCart className="mr-2" />
                Shop for {selectedIngredients.length} Ingredients
            </Button>
        </div>
    );
}

export default function DiscoverPage() {
  const [meal, setMeal] = useState<Recipe & { imageUrl?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const suggestMeal = () => {
    startTransition(async () => {
      const newMeal = await getDiscoverMeal();
      setMeal(newMeal);
    });
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline">Discover a New Meal</h1>
        <p className="text-muted-foreground mt-2">
          Feeling uninspired? Let us pick a meal for you!
        </p>
      </div>

      <div className="w-full">
        {isPending && !meal && (
           <Card className="w-full">
            <CardHeader>
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-5 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full aspect-video" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        )}
        {meal ? (
          <Card className="shadow-lg overflow-hidden">
             {meal.imageUrl ? (
              <div className="relative aspect-video w-full">
                <Image
                  src={meal.imageUrl}
                  alt={meal.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="relative aspect-video w-full bg-muted flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            <CardHeader>
              <CardTitle className="font-headline text-2xl">
                {meal.name}
              </CardTitle>
              <CardDescription>{meal.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="border-b-0">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2 text-primary">
                      <Info className="h-5 w-5" />
                      <span>View Recipe Details</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-6 pt-4">
                    
                    <IngredientsList ingredients={meal.ingredients} />

                    {/* Instructions */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <CookingPot /> Instructions
                      </h3>
                      <ol className="list-decimal list-inside space-y-2 pl-2">
                        {meal.instructions.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                      <p className="text-sm text-muted-foreground">
                        <strong>Cook Time:</strong> {meal.cookTime}
                      </p>
                    </div>

                    {/* Nutritional Facts */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Flame /> Nutritional Facts
                      </h3>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <p>
                          <strong>Calories:</strong>{' '}
                          {meal.nutritionalFacts.calories}
                        </p>
                        <p>
                          <strong>Protein:</strong>{' '}
                          {meal.nutritionalFacts.protein}
                        </p>
                        <p>
                          <strong>Carbs:</strong> {meal.nutritionalFacts.carbs}
                        </p>
                        <p>
                          <strong>Fat:</strong> {meal.nutritionalFacts.fat}
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
            <CardFooter className="flex-col sm:flex-row gap-2">
              <Button onClick={suggestMeal} className="w-full" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 animate-spin" /> : <Shuffle className="mr-2" />}
                Suggest Another
              </Button>
              <Button onClick={() => handleDownload(meal)} variant="outline" className="w-full">
                <Download className="mr-2" />
                Download PDF
              </Button>
            </CardFooter>
          </Card>
        ) : (
          !isPending && (
            <div className="text-center p-8 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">
                Click the button below to get your first meal suggestion.
              </p>
            </div>
          )
        )}
      </div>

      {!meal && (
        <Button onClick={suggestMeal} size="lg" disabled={isPending}>
           {isPending ? <Loader2 className="mr-2 animate-spin" /> : <Shuffle className="mr-2" />}
          Suggest a Meal
        </Button>
      )}
    </div>
  );
}
