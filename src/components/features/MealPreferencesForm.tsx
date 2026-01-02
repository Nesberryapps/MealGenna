'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { WandSparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';

const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'];
const dietaryPreferences = [
  'No preference',
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Keto',
  'Paleo',
];
const flavorFusions = [
  'Surprise Me!',
  'Italian',
  'Mexican',
  'Chinese',
  'Indian',
  'Japanese',
  'Thai',
  'Mediterranean',
  'French',
  'American',
];

const formSchema = z.object({
  mealType: z.string(),
  dietaryPreference: z.string(),
  flavorFusion1: z.string(),
  flavorFusion2: z.string(),
  customRequests: z.string().optional(),
});

type MealPreferencesFormValues = z.infer<typeof formSchema>;

interface MealPreferencesFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MealPreferencesForm({ open, onOpenChange }: MealPreferencesFormProps) {
  const router = useRouter();
  const form = useForm<MealPreferencesFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mealType: 'Breakfast',
      dietaryPreference: 'No preference',
      flavorFusion1: 'Surprise Me!',
      flavorFusion2: 'Surprise Me!',
      customRequests: '',
    },
  });

  function onSubmit(values: MealPreferencesFormValues) {
    onOpenChange(false);
    const params = new URLSearchParams(values);
    router.push(`/meal-ideas?${params.toString()}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] grid-rows-[auto_minmax(0,1fr)_auto] p-0 max-h-[90dvh]">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Set Your Preferences</DialogTitle>
          <DialogDescription>
            Tell us what you&apos;d like. The more specific you are, the better the
            suggestions!
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="overflow-y-auto">
          <div className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="mealType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meal Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a meal type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mealTypes.map(type => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dietaryPreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dietary Preference</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a dietary preference" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dietaryPreferences.map(pref => (
                            <SelectItem key={pref} value={pref}>
                              {pref}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="flavorFusion1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Create a Flavor Fusion</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a flavor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {flavorFusions.map(flavor => (
                            <SelectItem key={flavor} value={flavor}>
                              {flavor}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="flavorFusion2"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select another flavor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {flavorFusions.map(flavor => (
                            <SelectItem key={flavor} value={flavor}>
                              {flavor}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select two for a fusion, or one for a traditional meal.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customRequests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Requests</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., 'no nuts', 'low-carb and high-protein'"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Specify allergies, dislikes, or any other special instructions.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <DialogFooter className="p-6 pt-0">
                    <Button type="submit" className="w-full">
                        <WandSparkles className="mr-2 h-4 w-4" />
                        Generate
                    </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}