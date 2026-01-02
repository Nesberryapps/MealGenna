'use server';
/**
 * @fileOverview Generates a meal idea based on user preferences.
 *
 * - generateMealIdea - A function that generates a meal idea.
 * - GenerateMealIdeaInput - The input type for the generateMealIdea function.
 * - GenerateMealIdeaOutput - The return type for the generateMealIdea function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMealIdeaInputSchema = z.object({
  mealType: z.string().describe('The type of meal (e.g., Breakfast, Lunch, Dinner).'),
  dietaryPreference: z
    .string()
    .describe('The dietary preference (e.g., No preference, Vegetarian, Vegan).'),
  flavorFusion1: z.string().describe('The first flavor for fusion.'),
  flavorFusion2: z.string().describe('The second flavor for fusion.'),
  customRequests: z
    .string()
    .optional()
    .describe('Any custom requests, allergies, or dislikes.'),
});
export type GenerateMealIdeaInput = z.infer<typeof GenerateMealIdeaInputSchema>;

const GenerateMealIdeaOutputSchema = z.object({
  mealIdea: z
    .string()
    .describe('A single meal idea with a title and a short description.'),
});
export type GenerateMealIdeaOutput = z.infer<typeof GenerateMealIdeaOutputSchema>;

export async function generateMealIdea(
  input: GenerateMealIdeaInput
): Promise<GenerateMealIdeaOutput> {
  return generateMealIdeaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMealIdeaPrompt',
  input: {schema: GenerateMealIdeaInputSchema},
  output: {schema: GenerateMealIdeaOutputSchema},
  prompt: `You are an expert chef. Generate a creative and delicious meal idea based on the user's preferences.

Meal Type: {{{mealType}}}
Dietary Preference: {{{dietaryPreference}}}
Flavor Fusion: {{{flavorFusion1}}} and {{{flavorFusion2}}}
Custom Requests: {{{customRequests}}}

The output should be a single meal idea with a creative title and a brief, enticing description.
`,
});

const generateMealIdeaFlow = ai.defineFlow(
  {
    name: 'generateMealIdeaFlow',
    inputSchema: GenerateMealIdeaInputSchema,
    outputSchema: GenerateMealIdeaOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
