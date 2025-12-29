
'use server';

import {
  generateRecipesFromPantry,
  GenerateRecipesFromPantryInput,
} from '@/ai/flows/generate-recipes-from-pantry';
import {
  identifyPantryItems,
  IdentifyPantryItemsInput,
} from '@/ai/flows/identify-pantry-items-flow';
import { z } from 'zod';

const recipeRequestSchema = z.object({
  pantryItems: z.string().min(3, { message: 'Please list at least one item.' }),
  dietaryPreferences: z.string().optional(),
  cuisinePreferences: z.string().optional(),
});

export type RecipeResult = {
  recipes: string[];
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

    const recipeArray = result.recipes
      .split('\n')
      .map(recipe => recipe.trim().replace(/^\d+\.\s*/, ''))
      .filter(recipe => recipe.length > 0);

    return { recipes: recipeArray, timestamp: Date.now() };
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
