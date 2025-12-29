'use client';

import { useEffect, useRef, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Sparkles } from 'lucide-react';

import { getRecipes, type RecipeResult } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CUISINE_PREFERENCES, DIETARY_PREFERENCES } from '@/lib/data';

const formSchema = z.object({
  pantryItems: z.string().min(3, 'Please list at least one item.'),
  dietaryPreferences: z.string().optional(),
  cuisinePreferences: z.string().optional(),
});

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? (
        <Loader2 className="animate-spin" />
      ) : (
        <Sparkles className="mr-2" />
      )}
      Generate Recipes
    </Button>
  );
}

export function RecipeGeneratorForm() {
  const { toast } = useToast();
  const [state, formAction] = useActionState<RecipeResult, FormData>(getRecipes, {
    recipes: [],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pantryItems: '',
      dietaryPreferences: 'any',
      cuisinePreferences: 'any',
    },
  });

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.error,
      });
    }
  }, [state, toast]);

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl md:text-4xl text-center">
            What's in your pantry?
          </CardTitle>
          <CardDescription className="text-center">
            Enter the ingredients you have, and we'll whip up some recipe ideas for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              action={formAction}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="pantryItems"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pantry Items</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., chicken breast, tomatoes, rice, onion, garlic"
                        className="min-h-[120px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Separate items with commas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="dietaryPreferences"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dietary Preferences</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="any">Any</SelectItem>
                          {DIETARY_PREFERENCES.map(pref => (
                            <SelectItem key={pref.id} value={pref.label}>{pref.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Optional: Help us narrow down the results.</FormDescription>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cuisinePreferences"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cuisine Preferences</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="any">Any</SelectItem>
                          {CUISINE_PREFERENCES.map(pref => (
                            <SelectItem key={pref.id} value={pref.label}>{pref.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Optional: Craving a specific flavor?</FormDescription>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-center pt-4">
                <SubmitButton />
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {state.recipes && state.recipes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Recipe Ideas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 list-disc list-inside">
              {state.recipes.map((recipe, index) => (
                <li key={`${state.timestamp}-${index}`} className="text-foreground">
                  {recipe}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
