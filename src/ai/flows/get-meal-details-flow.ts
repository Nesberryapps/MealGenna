
'use server';

/**
 * @fileOverview An AI flow for getting the full details of a specific meal.
 *
 * - getMealDetails - A function that generates a recipe, ingredients, and nutrition for a given meal title.
 * - GetMealDetailsInput - The input type for the function.
 * - MealSuggestion - The output type, which is a fully detailed meal object.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { MealSuggestionSchema } from './types';
import type { MealSuggestion } from './types';


// Define the input schema for getting meal details
const GetMealDetailsInputSchema = z.object({
  title: z.string().describe('The title of the meal to get details for.'),
  description: z.string().describe('The description of the meal.'),
  diet: z.string().optional().describe('The dietary preference (e.g., Vegan, Vegetarian).'),
  cuisine: z.string().optional().describe('The cultural cuisine preference (e.g., Italian, Mexican).'),
  customRequest: z.string().optional().describe('Any special dietary requests, allergies, or specific meal instructions from the user (e.g., "no nuts", "gluten-free and vegan").'),
});
export type GetMealDetailsInput = z.infer<typeof GetMealDetailsInputSchema>;

// Exported function that calls the flow
export async function getMealDetails(input: GetMealDetailsInput): Promise<MealSuggestion> {
  const result = await getMealDetailsFlow(input);
  return result;
}

// The main prompt for generating the meal details
const mealDetailsPrompt = ai.definePrompt({
  name: 'getMealDetailsPrompt',
  model: 'googleai/gemini-2.5-pro-preview',
  input: { schema: GetMealDetailsInputSchema },
  output: { schema: MealSuggestionSchema },
  prompt: `You are an expert chef who creates delicious and practical meal recipes.
A user wants the full recipe and details for the following meal:

Title: "{{title}}"
Description: "{{description}}"

{{#if diet}}
The user follows a strict '{{diet}}' diet. The recipe must conform to this diet.
{{/if}}

{{#if cuisine}}
The recipe should be inspired by '{{cuisine}}' cuisine.
{{/if}}

{{#if customRequest}}
The user has the following special request that you MUST follow for this recipe: "{{customRequest}}". This is a top priority.
{{/if}}

Generate the full details for this meal. Provide a complete list of ingredients, a step-by-step recipe, and estimated nutritional information (calories, protein, carbs, fat).
Do not change the title or description provided.
`,
});

// The flow that orchestrates the meal detail generation and image creation
const getMealDetailsFlow = ai.defineFlow(
  {
    name: 'getMealDetailsFlow',
    inputSchema: GetMealDetailsInputSchema,
    outputSchema: MealSuggestionSchema,
  },
  async (input) => {
    // Step 1: Generate the meal details (recipe, ingredients, etc.)
    const { output: mealDetails } = await mealDetailsPrompt(input);
    if (!mealDetails) {
      throw new Error('Failed to generate meal details.');
    }

    // Step 2: Generate an image for the meal
    try {
      const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: `A delicious, high-quality, photorealistic image of: ${mealDetails.title}`,
      });
      if (media?.url) {
        mealDetails.imageUrl = media.url;
      } else {
        mealDetails.imageUrl = '';
      }
    } catch (error) {
      console.error(`Image generation failed for "${mealDetails.title}", proceeding without image.`, error);
      mealDetails.imageUrl = '';
    }

    return mealDetails;
  }
);
