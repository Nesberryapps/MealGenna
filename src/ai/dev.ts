'use server';
import { config } from 'dotenv';
config();

// All we need to do is import the flows, and the dev server will pick them up.
import './flows/generate-meal-ideas-from-ingredients.ts';
import './flows/generate-7-day-meal-plan.ts';
import './flows/generate-quick-meal-ideas.ts';
import './flows/generate-meal-idea.ts';
import './flows/identify-ingredients-from-image.ts';
