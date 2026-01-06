'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating meal ideas based on a list of ingredients.
 *
 * - generateMealIdeasFromIngredientsFlow - A Genkit flow that takes a list of ingredients and returns meal ideas.
 * - GenerateMealIdeasFromIngredientsInput - The input type for the generateMealIdeasFromIngredients function.
 * - GenerateMealIdeasFromIngredientsOutput - The return type for the generateMealIdeasFromIngredients function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GenerateMealIdeasFromIngredientsInputSchema = z.object({
  ingredients: z
    .array(z.string())
    .describe('A list of ingredients available to the user.'),
});
export type GenerateMealIdeasFromIngredientsInput = z.infer<
  typeof GenerateMealIdeasFromIngredientsInputSchema
>;

export const GenerateMealIdeasFromIngredientsOutputSchema = z.object({
  mealIdeas: z
    .array(z.string())
    .describe('A list of meal ideas based on the provided ingredients.'),
});
export type GenerateMealIdeasFromIngredientsOutput = z.infer<
  typeof GenerateMealIdeasFromIngredientsOutputSchema
>;

const prompt = ai.definePrompt({
  name: 'generateMealIdeasFromIngredientsPrompt',
  input: {schema: GenerateMealIdeasFromIngredientsInputSchema},
  output: {schema: GenerateMealIdeasFromIngredientsOutputSchema},
  prompt: `You are a helpful assistant that suggests meal ideas based on the ingredients a user has available.

  Here are the ingredients the user has:
  {{#each ingredients}}
  - {{this}}
  {{/each}}

  Please generate a list of meal ideas that can be made using these ingredients.
  The meal ideas should be simple and easy to make.
  Return the meal ideas as a numbered list.
  
  Return your response in valid JSON format.
  `,
});

export const generateMealIdeasFromIngredientsFlow = ai.defineFlow(
  {
    name: 'generateMealIdeasFromIngredientsFlow',
    inputSchema: GenerateMealIdeasFromIngredientsInputSchema,
    outputSchema: GenerateMealIdeasFromIngredientsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
