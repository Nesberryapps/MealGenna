'use server';
/**
 * @fileOverview Generates recipe ideas based on pantry items and user preferences.
 *
 * - generateRecipesFromPantry - A function that generates recipe ideas.
 * - GenerateRecipesFromPantryInput - The input type for the generateRecipesFromPantry function.
 * - GenerateRecipesFromPantryOutput - The return type for the generateRecipesFromPantry function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRecipesFromPantryInputSchema = z.object({
  pantryItems: z
    .string()
    .describe('A comma-separated list of items currently in the user\'s pantry.'),
  dietaryPreferences: z
    .string()
    .optional()
    .describe('The user\'s dietary preferences, such as vegetarian, vegan, or gluten-free.'),
  cuisinePreferences: z
    .string()
    .optional()
    .describe('The user\'s preferred cuisines, such as Italian, Mexican, or Asian.'),
});
export type GenerateRecipesFromPantryInput = z.infer<
  typeof GenerateRecipesFromPantryInputSchema
>;

const GenerateRecipesFromPantryOutputSchema = z.object({
  recipes: z
    .string()
    .describe(
      'A list of recipe ideas based on the pantry items and user preferences.'
    ),
});
export type GenerateRecipesFromPantryOutput = z.infer<
  typeof GenerateRecipesFromPantryOutputSchema
>;

export async function generateRecipesFromPantry(
  input: GenerateRecipesFromPantryInput
): Promise<GenerateRecipesFromPantryOutput> {
  return generateRecipesFromPantryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRecipesFromPantryPrompt',
  input: {schema: GenerateRecipesFromPantryInputSchema},
  output: {schema: GenerateRecipesFromPantryOutputSchema},
  prompt: `You are a recipe idea generator. Given the following pantry items and user preferences, generate a list of recipe ideas.\n\nPantry Items: {{{pantryItems}}}\nDietary Preferences: {{{dietaryPreferences}}}\nCuisine Preferences: {{{cuisinePreferences}}}\n\nRecipe Ideas:`,
});

const generateRecipesFromPantryFlow = ai.defineFlow(
  {
    name: 'generateRecipesFromPantryFlow',
    inputSchema: GenerateRecipesFromPantryInputSchema,
    outputSchema: GenerateRecipesFromPantryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
