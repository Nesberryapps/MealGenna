import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import { z } from 'zod';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});

export const RecipeSchema = z.object({
    name: z.string().describe('The name of the recipe.'),
    description: z.string().describe('A brief, appetizing description of the dish.'),
    imagePrompt: z.string().describe('A simple, descriptive prompt for generating an image of the finished dish, suitable for a text-to-image model.'),
    ingredients: z.array(z.string()).describe('A list of ingredients required for the recipe.'),
    instructions: z.array(z.string()).describe('A list of step-by-step cooking instructions.'),
    cookTime: z.string().describe('The estimated cooking time (e.g., "30 minutes").'),
    nutritionalFacts: z.object({
      calories: z.string().describe('Estimated calories per serving.'),
      protein: z.string().describe('Estimated protein in grams per serving.'),
      carbs: z.string().describe('Estimated carbohydrates in grams per serving.'),
      fat: z.string().describe('Estimated fat in grams per serving.'),
    }).describe('Estimated nutritional facts per serving.'),
  });