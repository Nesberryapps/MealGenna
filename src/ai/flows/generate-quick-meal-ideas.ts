
'use server';
/**
 * @fileOverview Generates quick meal ideas for users who are short on time.
 *
 * - generateQuickMealIdeas - A function that generates quick meal ideas.
 * - GenerateQuickMealIdeasInput - The input type for the generateQuickMealIdeas function.
 * - GenerateQuickMealIdeasOutput - The return type for the generateQuickMealIdeas function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuickMealIdeasInputSchema = z.object({
  ingredients: z
    .array(z.string())
    .describe('A list of ingredients available for the meal.'),
  timeAvailable: z
    .string()
    .describe(
      'The amount of time available to prepare the meal, e.g., 30 minutes.'
    ),
  dietaryPreferences: z
    .string()
    .optional()
    .describe('Any dietary preferences or restrictions, e.g., vegetarian, gluten-free.'),
});
export type GenerateQuickMealIdeasInput = z.infer<typeof GenerateQuickMealIdeasInputSchema>;

const GenerateQuickMealIdeasOutputSchema = z.object({
  mealIdeas: z.array(z.string()).describe('A list of quick meal ideas.'),
});
export type GenerateQuickMealIdeasOutput = z.infer<typeof GenerateQuickMealIdeasOutputSchema>;

export async function generateQuickMealIdeas(
  input: GenerateQuickMealIdeasInput
): Promise<GenerateQuickMealIdeasOutput> {
  return generateQuickMealIdeasFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuickMealIdeasPrompt',
  input: {schema: GenerateQuickMealIdeasInputSchema},
  output: {schema: GenerateQuickMealIdeasOutputSchema},
  prompt: `You are a chef specializing in quick and easy meals.

  Based on the ingredients available, the time available, and any dietary preferences, suggest a few quick meal ideas.

  Ingredients: {{{ingredients}}}
  Time Available: {{{timeAvailable}}}
  Dietary Preferences: {{{dietaryPreferences}}}

  Please provide a list of meal ideas that can be prepared quickly.
  Return the meal ideas as a list of strings.

  Return your response in valid JSON format.
  `,
});

const generateQuickMealIdeasFlow = ai.defineFlow(
  {
    name: 'generateQuickMealIdeasFlow',
    inputSchema: GenerateQuickMealIdeasInputSchema,
    outputSchema: GenerateQuickMealIdeasOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
