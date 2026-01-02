'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-meal-ideas-from-ingredients.ts';
import '@/ai/flows/generate-7-day-meal-plan.ts';
import '@/ai/flows/generate-quick-meal-ideas.ts';
import '@/ai/flows/generate-meal-idea.ts';
import '@/ai/flows/identify-ingredients-from-image.ts';
