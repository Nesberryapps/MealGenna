'use server';
import {genkit, type ModelAction} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {generate7DayMealPlanFlow} from './flows/generate-7-day-meal-plan';
import {generateMealIdeaFlow} from './flows/generate-meal-idea';
import {generateMealIdeasFromIngredientsFlow} from './flows/generate-meal-ideas-from-ingredients';
import {generateQuickMealIdeasFlow} from './flows/generate-quick-meal-ideas';
import {identifyIngredientsFlow} from './flows/identify-ingredients-from-image';

export const allFlows = [
  generate7DayMealPlanFlow,
  generateMealIdeaFlow,
  generateMealIdeasFromIngredientsFlow,
  generateQuickMealIdeasFlow,
  identifyIngredientsFlow,
] as ModelAction[];

export const ai = genkit({
  plugins: [googleAI()],
  flows: allFlows,
  logLevel: 'debug',
  enableTracing: true,
});

export default ai;
