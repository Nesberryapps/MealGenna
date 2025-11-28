
/**
 * @fileOverview Shared schemas and types for AI meal generation flows.
 *
 * This file centralizes Zod schemas and TypeScript types that are used across
 * multiple AI flows to ensure consistency and prevent "use server" export errors.
 */

import { z } from 'zod';

// Schema for the nutritional facts
export const NutritionSchema = z.object({
  calories: z.string().describe('Estimated number of calories.'),
  protein: z.string().describe('Estimated grams of protein.'),
  carbs: z.string().describe('Estimated grams of carbohydrates.'),
  fat: z.string().describe('Estimated grams of fat.'),
});
export type Nutrition = z.infer<typeof NutritionSchema>;

// Schema for a single meal, often used in meal plans
export const SimpleMealSchema = z.object({
  title: z.string().describe('The name of the suggested meal.'),
  description: z.string().describe('A short, enticing paragraph about the meal.'),
  imageUrl: z.string().optional().describe('URL of a generated image for the meal.'),
});
export type SimpleMeal = z.infer<typeof SimpleMealSchema>;

// Schema for a full meal suggestion with all details
export const MealSuggestionSchema = z.object({
  title: z.string().describe('The name of the suggested meal.'),
  description: z.string().describe('A short, enticing paragraph about the meal.'),
  ingredients: z.array(z.string()).describe('The list of ingredients required for the recipe.'),
  recipe: z.array(z.string()).describe('The step-by-step recipe instructions.'),
  nutrition: NutritionSchema.describe('The nutritional information for the meal.'),
  imageUrl: z.string().optional().describe('URL of a generated image for the meal.'),
});
export type MealSuggestion = z.infer<typeof MealSuggestionSchema>;

// Schema for a single day's plan with simplified meals
export const DailyPlanSchema = z.object({
  breakfast: SimpleMealSchema,
  lunch: SimpleMealSchema,
  dinner: SimpleMealSchema,
});

// Schema for the full 7-day meal plan
export const MealPlanSchema = z.object({
  dailyPlans: z.object({
    'Day 1': DailyPlanSchema,
    'Day 2': DailyPlanSchema,
    'Day 3': DailyPlanSchema,
    'Day 4': DailyPlanSchema,
    'Day 5': DailyPlanSchema,
    'Day 6': DailyPlanSchema,
    'Day 7': DailyPlanSchema,
  }),
});
export type MealPlan = z.infer<typeof MealPlanSchema>;

// Schema for a blog post
export const BlogPostSchema = z.object({
  title: z.string().describe('A catchy, engaging title for the blog post.'),
  content: z.array(z.string()).describe('The content of the blog post, split into paragraphs for easy reading.'),
  summary: z.string().describe('A one-sentence summary or key takeaway from the article.'),
});
export type BlogPost = z.infer<typeof BlogPostSchema>;
