'use server';
/**
 * @fileOverview Generates a 7-day meal plan based on user dietary preferences and allergies.
 *
 * - generate7DayMealPlan - A function that generates a 7-day meal plan.
 * - Generate7DayMealPlanInput - The input type for the generate7DayMealPlan function.
 * - Generate7DayMealPlanOutput - The return type for the generate7DayMealPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const Generate7DayMealPlanInputSchema = z.object({
  dietaryPreferences: z
    .string()
    .describe('The dietary preferences of the user (e.g., vegetarian, vegan, gluten-free).'),
  allergies: z
    .string()
    .describe('The allergies of the user (e.g., peanuts, dairy, shellfish).'),
  ingredients: z
    .string()
    .optional()
    .describe('A comma-separated list of ingredients the user has available.'),
});
export type Generate7DayMealPlanInput = z.infer<typeof Generate7DayMealPlanInputSchema>;

const Generate7DayMealPlanOutputSchema = z.object({
  mealPlan: z.string().describe('A 7-day meal plan, including breakfast, lunch, and dinner for each day, considering dietary preferences and allergies.'),
});
export type Generate7DayMealPlanOutput = z.infer<typeof Generate7DayMealPlanOutputSchema>;

export async function generate7DayMealPlan(
  input: Generate7DayMealPlanInput
): Promise<Generate7DayMealPlanOutput> {
  return generate7DayMealPlanFlow(input);
}

const generate7DayMealPlanPrompt = ai.definePrompt({
  name: 'generate7DayMealPlanPrompt',
  input: {schema: Generate7DayMealPlanInputSchema},
  output: {schema: Generate7DayMealPlanOutputSchema},
  prompt: `Generate a 7-day meal plan for a user with the following dietary preferences: {{{dietaryPreferences}}}, allergies: {{{allergies}}}, and available ingredients: {{{ingredients}}}. The meal plan should include breakfast, lunch, and dinner for each day. Ensure that the meal plan is safe and suitable for the user's needs.`,
});

const generate7DayMealPlanFlow = ai.defineFlow(
  {
    name: 'generate7DayMealPlanFlow',
    inputSchema: Generate7DayMealPlanInputSchema,
    outputSchema: Generate7DayMealPlanOutputSchema,
  },
  async input => {
    const {output} = await generate7DayMealPlanPrompt(input);
    return output!;
  }
);
