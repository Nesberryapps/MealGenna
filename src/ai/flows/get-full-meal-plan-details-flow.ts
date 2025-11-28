
'use server';

/**
 * @fileOverview An AI flow for getting the full details for an entire 7-day meal plan.
 *
 * - getFullMealPlanDetails - A function that generates recipes, ingredients, and nutrition for a full 7-day plan.
 * - MealPlan - The input type for the function.
 * - DetailedMealPlan - The output type, which is a fully detailed meal plan object.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { DailyPlanSchema, MealPlanSchema, MealSuggestionSchema } from './types';
import type { MealPlan } from './types';
import { getMealDetails } from './get-meal-details-flow';

// Define the output schema for a day with detailed meals
const DetailedDailyPlanSchema = z.object({
  breakfast: MealSuggestionSchema,
  lunch: MealSuggestionSchema,
  dinner: MealSuggestionSchema,
});

// Define the output schema for the full detailed meal plan
const DetailedMealPlanSchema = z.object({
  dailyPlans: z.object({
    'Day 1': DetailedDailyPlanSchema,
    'Day 2': DetailedDailyPlanSchema,
    'Day 3': DetailedDailyPlanSchema,
    'Day 4': DetailedDailyPlanSchema,
    'Day 5': DetailedDailyPlanSchema,
    'Day 6': DetailedDailyPlanSchema,
    'Day 7': DetailedDailyPlanSchema,
  }),
});
export type DetailedMealPlan = z.infer<typeof DetailedMealPlanSchema>;

// Input schema for the flow, which includes the plan and user preferences
const GetFullMealPlanDetailsInputSchema = z.object({
    plan: MealPlanSchema,
    diet: z.string().optional(),
    cuisine: z.string().optional(),
    customRequest: z.string().optional(),
});
export type GetFullMealPlanDetailsInput = z.infer<typeof GetFullMealPlanDetailsInputSchema>;


// Exported function that calls the flow
export async function getFullMealPlanDetails(input: GetFullMealPlanDetailsInput): Promise<DetailedMealPlan> {
  const result = await getFullMealPlanDetailsFlow(input);
  return result;
}


const getFullMealPlanDetailsFlow = ai.defineFlow(
  {
    name: 'getFullMealPlanDetailsFlow',
    inputSchema: GetFullMealPlanDetailsInputSchema,
    outputSchema: DetailedMealPlanSchema,
  },
  async ({ plan, diet, cuisine, customRequest }) => {
    const allMeals = Object.values(plan.dailyPlans).flatMap(day => [
        {...day.breakfast, type: 'breakfast'},
        {...day.lunch, type: 'lunch'},
        {...day.dinner, type: 'dinner'},
    ]);

    // Fetch details for all meals in parallel
    const detailedMealPromises = allMeals.map(meal => 
        getMealDetails({ title: meal.title, description: meal.description, diet, cuisine, customRequest })
    );

    const detailedMeals = await Promise.all(detailedMealPromises);
    
    // Reconstruct the plan with detailed meals
    const detailedPlan: DetailedMealPlan = { dailyPlans: {} as DetailedMealPlan['dailyPlans'] };
    let mealIndex = 0;

    for (let i = 1; i <= 7; i++) {
        const dayKey = `Day ${i}` as keyof DetailedMealPlan['dailyPlans'];
        detailedPlan.dailyPlans[dayKey] = {
            breakfast: detailedMeals[mealIndex++],
            lunch: detailedMeals[mealIndex++],
            dinner: detailedMeals[mealIndex++],
        };
    }
    
    return detailedPlan;
  }
);
