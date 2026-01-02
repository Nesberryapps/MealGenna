"use client";

import { useState, useTransition, useRef, type KeyboardEvent } from 'react';
import { generateMealIdeasFromIngredients, type GenerateMealIdeasFromIngredientsOutput } from '@/ai/flows/generate-meal-ideas-from-ingredients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, ScanLine, LoaderCircle, Sparkles, AlertTriangle, ChefHat } from 'lucide-react';

const MOCK_INGREDIENTS = ['Chicken Breast', 'Broccoli', 'Tomatoes', 'Onion', 'Garlic', 'Olive Oil', 'Pasta', 'Cheese', 'Bell Peppers', 'Mushrooms'];

export function IngredientIdeator() {
  const [ingredients, setIngredients] = useState<string[]>(['Tomatoes', 'Basil', 'Garlic']);
  const [inputValue, setInputValue] = useState("");
  const [result, setResult] = useState<GenerateMealIdeasFromIngredientsOutput | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddIngredient = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !ingredients.find(i => i.toLowerCase() === trimmed.toLowerCase())) {
      setIngredients([...ingredients, trimmed]);
      setInputValue("");
    }
  };

  const handleRemoveIngredient = (ingredientToRemove: string) => {
    setIngredients(ingredients.filter(i => i !== ingredientToRemove));
  };
  
  const handleInputKeydown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddIngredient();
    }
  };

  const handleScan = () => {
    const randomIngredient = MOCK_INGREDIENTS[Math.floor(Math.random() * MOCK_INGREDIENTS.length)];
    if (!ingredients.find(i => i.toLowerCase() === randomIngredient.toLowerCase())) {
      setIngredients([...ingredients, randomIngredient]);
       toast({
        title: "Ingredient Scanned",
        description: `Added "${randomIngredient}" to your list.`,
      });
    }
  };

  const handleGenerate = () => {
    if (ingredients.length === 0) {
      toast({
        variant: "destructive",
        title: "No Ingredients",
        description: "Please add some ingredients first.",
      });
      return;
    }

    startTransition(async () => {
      try {
        const response = await generateMealIdeasFromIngredients({ ingredients });
        setResult(response);
      } catch (e) {
        setResult(null);
        toast({
            variant: "destructive",
            title: "Error Generating Ideas",
            description: "Something went wrong. Please try again later.",
        });
      }
    });
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">What's in your kitchen?</CardTitle>
        <CardDescription>Add ingredients you have on hand to get instant meal ideas from our AI chef.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Input 
            ref={inputRef}
            type="text" 
            placeholder="e.g., Chicken, Rice, Spinach"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleInputKeydown}
            disabled={isPending}
            aria-label="Add an ingredient"
          />
          <Button onClick={handleAddIngredient} disabled={isPending || !inputValue.trim()} aria-label="Add Ingredient"><Plus /></Button>
          <Button variant="outline" onClick={handleScan} disabled={isPending} aria-label="Scan Ingredient"><ScanLine /></Button>
        </div>
        
        <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Your Ingredients:</h4>
            {ingredients.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                {ingredients.map(ingredient => (
                    <Badge key={ingredient} variant="secondary" className="text-base py-1 pl-3 pr-2 flex items-center gap-2">
                    {ingredient}
                    <button onClick={() => handleRemoveIngredient(ingredient)} disabled={isPending} className="rounded-full hover:bg-muted-foreground/20 p-0.5 focus:outline-none focus:ring-2 focus:ring-ring" aria-label={`Remove ${ingredient}`}>
                        <Trash2 className="h-3 w-3" />
                    </button>
                    </Badge>
                ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground italic">Add some ingredients to get started, or try the scanner!</p>
            )}
        </div>

        {isPending && (
          <div className="flex items-center justify-center gap-2 text-primary pt-4">
            <LoaderCircle className="h-6 w-6 animate-spin" />
            <p className="text-lg">Our AI chef is thinking...</p>
          </div>
        )}

        {result && result.mealIdeas.length > 0 && !isPending && (
            <div className="pt-4">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><ChefHat /> Here are some ideas!</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.mealIdeas.map((idea, index) => (
                        <Card key={index} className="bg-background/50">
                            <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4">
                                <Sparkles className="w-5 h-5 text-accent flex-shrink-0" />
                                <CardTitle className="text-lg leading-tight">{idea}</CardTitle>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>
        )}
        
        {result && result.mealIdeas.length === 0 && !isPending && (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>No Ideas Found</AlertTitle>
                <AlertDescription>
                    We couldn't generate any meal ideas with the provided ingredients. Try adding more items.
                </AlertDescription>
            </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleGenerate} disabled={isPending || ingredients.length === 0} className="w-full text-lg py-6 bg-accent text-accent-foreground hover:bg-accent/90">
            {isPending ? "Generating..." : "Generate Meal Ideas"}
        </Button>
      </CardFooter>
    </Card>
  );
}
