'use server';

import {
  generateRecipesFromPantry,
  GenerateRecipesFromPantryInput,
  type Recipe,
} from '@/ai/flows/generate-recipes-from-pantry';
import {
  identifyPantryItems,
  IdentifyPantryItemsInput,
} from '@/ai/flows/identify-pantry-items-flow';
import { generateDiscoverMeal } from '@/ai/flows/generate-discover-meal';
import { generateMealPlan } from '@/ai/flows/generate-meal-plan';
import { z } from 'zod';

const recipeRequestSchema = z.object({
  pantryItems: z.string().min(3, { message: 'Please list at least one item.' }),
  dietaryPreferences: z.string().optional(),
  cuisinePreferences: z.string().optional(),
});

export type RecipeResult = {
  recipes: (Recipe & { imageUrl?: string })[];
  error?: string;
  timestamp?: number;
};

export async function getRecipes(
  prevState: RecipeResult,
  formData: FormData
): Promise<RecipeResult> {
  const validatedFields = recipeRequestSchema.safeParse({
    pantryItems: formData.get('pantryItems'),
    dietaryPreferences: formData.get('dietaryPreferences'),
    cuisinePreferences: formData.get('cuisinePreferences'),
  });

  if (!validatedFields.success) {
    return {
      recipes: [],
      error: validatedFields.error.flatten().fieldErrors.pantryItems?.join(', '),
    };
  }

  try {
    const data = validatedFields.data;
    const input: GenerateRecipesFromPantryInput = {
      pantryItems: data.pantryItems,
      dietaryPreferences: data.dietaryPreferences === 'any' ? undefined : data.dietaryPreferences,
      cuisinePreferences: data.cuisinePreferences === 'any' ? undefined : data.cuisinePreferences,
    };
    const result = await generateRecipesFromPantry(input);

    return { recipes: result.recipes, timestamp: Date.now() };
  } catch (e) {
    console.error(e);
    return {
      recipes: [],
      error: 'Failed to generate recipes. Please try again later.',
    };
  }
}

export type IdentifyResult = {
  items: string[];
  error?: string;
};

export async function getIdentifiedItems(
  photoDataUri: string
): Promise<IdentifyResult> {
  if (!photoDataUri) {
    return {
      items: [],
      error: 'No photo provided.',
    };
  }

  try {
    const input: IdentifyPantryItemsInput = {
      photoDataUri,
    };
    const result = await identifyPantryItems(input);
    return { items: result.items };
  } catch (e) {
    console.error(e);
    return {
      items: [],
      error: 'Failed to identify items from the image. Please try again.',
    };
  }
}

export async function getDiscoverMeal(): Promise<Recipe & { imageUrl?: string; }> {
    const result = await generateDiscoverMeal();
    return result;
}

export type MealPlan = {
  [day: string]: {
    breakfast: Recipe & { imageUrl?: string };
    lunch: Recipe & { imageUrl?: string };
    dinner: Recipe & { imageUrl?: string };
  };
};

export async function getMealPlan(): Promise<MealPlan> {
    const result = await generateMealPlan();
    
    // Convert the array of daily plans into the MealPlan object structure
    const plan: MealPlan = {};
    result.forEach(dayPlan => {
        plan[dayPlan.day] = {
            breakfast: dayPlan.meals.find(m => m.type === 'Breakfast')!.recipe,
            lunch: dayPlan.meals.find(m => m.type === 'Lunch')!.recipe,
            dinner: dayPlan.meals.find(m => m.type === 'Dinner')!.recipe,
        };
    });

    return plan;
}
