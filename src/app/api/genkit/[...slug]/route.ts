/**
 * This file is the single point of entry for all Genkit flow requests.
 */
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { nextHandler } from '@genkit-ai/next';

import { generate7DayMealPlanFlow } from '@/ai/flows/generate-7-day-meal-plan';
import { generateMealIdeaFlow } from '@/ai/flows/generate-meal-idea';
import { generateMealIdeasFromIngredientsFlow } from '@/ai/flows/generate-meal-ideas-from-ingredients';
import { generateQuickMealIdeasFlow } from '@/ai/flows/generate-quick-meal-ideas';
import { identifyIngredientsFlow } from '@/ai/flows/identify-ingredients-from-image';

genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-pro',
});

// Expose the Genkit API endpoint.
export const POST = nextHandler({
    flows: [
        generate7DayMealPlanFlow,
        generateMealIdeaFlow,
        generateMealIdeasFromIngredientsFlow,
        generateQuickMealIdeasFlow,
        identifyIngredientsFlow,
    ]
});
