
'use server';

/**
 * @fileOverview An AI flow for suggesting meals based on ingredients, time, and mood.
 *
 * - suggestMeals - A function that generates multiple detailed meal suggestions.
 * - SuggestMealInput - The input type for the suggestMeals function.
 * - MealSuggestion - The type for a single meal suggestion output.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { MealSuggestionSchema } from './types';
import type { MealSuggestion } from './types';


// Define the input schema for the meal suggestion flow
const SuggestMealInputSchema = z.object({
  pantryItems: z.array(z.string()).describe('A list of items available in the user\'s pantry or fridge.'),
  mealTime: z.string().describe('The desired meal time (e.g., breakfast, lunch, dinner).'),
  mood: z.string().describe('The desired mood or style for the meal (e.g., Quick, Healthy, Hearty).'),
  diet: z.string().optional().describe('The dietary preference (e.g., Vegan, Vegetarian).'),
  cuisine: z.string().optional().describe('The cultural cuisine preference (e.g., Italian, Mexican).'),
  customRequest: z.string().optional().describe('Any special dietary requests, allergies, or specific meal instructions from the user (e.g., "no nuts", "gluten-free and vegan").'),
});
export type SuggestMealInput = z.infer<typeof SuggestMealInputSchema>;


// Define the output schema for the flow, which is an array of meal suggestions
const SuggestMealOutputSchema = z.object({
  meals: z.array(MealSuggestionSchema),
});


export async function suggestMeals(input: SuggestMealInput): Promise<MealSuggestion[]> {
  const result = await suggestMealsFlow(input);
  // Directly return the array of meals
  return result.meals;
}

// Define the main prompt for generating the meal details
const mealPrompt = ai.definePrompt({
  name: 'suggestMealPrompt',
  input: { schema: SuggestMealInputSchema },
  output: { schema: SuggestMealOutputSchema },
  prompt: `You are an expert chef who creates delicious and practical meal ideas based on ingredients a user already has.
A user wants a suggestion for {{mealTime}}. They are in a "{{mood}}" mood.

They have the following items available in their pantry:
{{#if pantryItems}}
  {{#each pantryItems}}
- {{{this}}}
  {{/each}}
{{else}}
The user has not provided any pantry items, so you can suggest anything.
{{/if}}

{{#if diet}}
The user follows a strict '{{diet}}' diet. All suggestions must conform to this diet.
{{/if}}

{{#if cuisine}}
The user would like meals inspired by '{{cuisine}}' cuisine.
{{/if}}

{{#if customRequest}}
The user has the following special request that you MUST follow: "{{customRequest}}". This is a top priority.
{{/if}}

Generate THREE (3) distinct meal suggestions that fit these criteria. Ensure the suggestions are unique and avoid repeating meals from previous requests.
For each suggestion, you MUST prioritize using the ingredients from the user's pantry list. The ingredient list for each recipe should consist primarily of items from the user's pantry.
You may include a very small number of common pantry staples that the user might have, such as oil, salt, pepper, or basic spices, but the core of the recipe must come from the provided list.
Do not suggest a meal that requires a main ingredient that is not on the user's list.

For each suggestion, provide a catchy title, a short description, a list of ingredients, a step-by-step recipe, and estimated nutritional information.
`,
});

// The flow that orchestrates the meal generation process
const suggestMealsFlow = ai.defineFlow(
  {
    name: 'suggestMealsFlow',
    inputSchema: SuggestMealInputSchema,
    outputSchema: SuggestMealOutputSchema,
  },
  async (input) => {
    // Step 1: Generate the meal details (recipe, nutrition, etc.)
    const { output } = await mealPrompt(input);
    if (!output || !output.meals || output.meals.length === 0) {
      throw new Error('Failed to generate meal details.');
    }

    // Step 2: Generate images for each meal in parallel
    const imagePromises = output.meals.map(async (meal) => {
      try {
        const { media } = await ai.generate({
          model: 'googleai/imagen-4.0-fast-generate-001',
          prompt: `A delicious, high-quality, photorealistic image of: ${meal.title}`,
        });
        if (media?.url) {
            meal.imageUrl = media.url;
        } else {
            meal.imageUrl = '';
        }
      } catch (error) {
        console.error(`Image generation failed for "${meal.title}", proceeding without image.`, error);
        meal.imageUrl = '';
      }
      return meal;
    });

    // Wait for all image generation to complete
    const mealsWithImages = await Promise.all(imagePromises);

    return { meals: mealsWithImages };
  }
);
