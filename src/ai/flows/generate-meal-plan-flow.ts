
'use server';

/**
 * @fileOverview An AI flow for generating a detailed 7-day meal plan summary.
 *
 * - generateMealPlan - A function that creates a full week's meal plan with recipes.
 * - GenerateMealPlanInput - The input type for the function.
 * - MealPlan - The output type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { DailyPlanSchema } from './types';
import type { MealPlan } from './types';

// Input schema for generating the meal plan
const GenerateMealPlanInputSchema = z.object({
  pantryItems: z.array(z.string()).optional().describe('An optional list of items available in the user\'s pantry or fridge.'),
  diet: z.string().optional().describe('The dietary preference (e.g., Vegan, Vegetarian).'),
  cuisine: z.string().optional().describe('The cultural cuisine preference (e.g., Italian, Mexican).'),
  customRequest: z.string().optional().describe('Any special dietary requests, allergies, or specific meal instructions from the user (e.g., "no nuts", "gluten-free and vegan").'),
});
export type GenerateMealPlanInput = z.infer<typeof GenerateMealPlanInputSchema>;


// Exported function that calls the flow
export async function generateMealPlan(input: GenerateMealPlanInput): Promise<MealPlan> {
  const result = await generateMealPlanFlow(input);
  return result;
}

// The main prompt for generating the meal plan
const mealPlanPrompt = ai.definePrompt({
  name: 'generateMealPlanPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: GenerateMealPlanInputSchema },
  output: { schema: z.object({ dailyPlans: z.object({ 'Day 1': DailyPlanSchema, 'Day 2': DailyPlanSchema, 'Day 3': DailyPlanSchema, 'Day 4': DailyPlanSchema, 'Day 5': DailyPlanSchema, 'Day 6': DailyPlanSchema, 'Day 7': DailyPlanSchema }) }) },
  prompt: `You are an expert nutritionist and chef who creates balanced and detailed 7-day meal plans.

A user wants a full 7-day meal plan summary. For every meal (breakfast, lunch, and dinner for all 7 days), you must provide ONLY:
1.  A catchy title.
2.  A short, enticing description.

Your goal is to create a diverse and interesting meal plan. Ensure the generated plan is unique and does not repeat meals from previous requests. You should try to incorporate items from the user's pantry where it makes sense, but you are free to suggest meals that may require purchasing several new ingredients. Focus on a good balance of using existing items and discovering new ideas.

{{#if pantryItems}}
The user has the following items available:
Pantry Items:
{{#each pantryItems}}
- {{{this}}}
{{/each}}
{{/if}}

{{#if diet}}
The user follows a strict '{{diet}}' diet. All meals must conform to this diet.
{{/if}}

{{#if cuisine}}
The user would like meals inspired by '{{cuisine}}' cuisine.
{{/if}}

{{#if customRequest}}
The user has the following special request that you MUST follow: "{{customRequest}}". This is a top priority.
{{/if}}

Generate a meal plan summary for a full 7 days according to the instructions.
The output must be structured with keys from "Day 1" to "Day 7", with each day containing objects for breakfast, lunch, and dinner.
Do NOT generate ingredients, recipes, or nutritional information. Only provide a title and description for each meal.`,
});

// The flow that orchestrates the meal plan generation
const generateMealPlanFlow = ai.defineFlow(
  {
    name: 'generateMealPlanFlow',
    inputSchema: GenerateMealPlanInputSchema,
    outputSchema: z.object({ dailyPlans: z.object({ 'Day 1': DailyPlanSchema, 'Day 2': DailyPlanSchema, 'Day 3': DailyPlanSchema, 'Day 4': DailyPlanSchema, 'Day 5': DailyPlanSchema, 'Day 6': DailyPlanSchema, 'Day 7': DailyPlanSchema }) }),
  },
  async (input) => {
    const { output } = await mealPlanPrompt(input);
    if (!output) {
      throw new Error('Failed to generate a meal plan.');
    }
    return output;
  }
);
