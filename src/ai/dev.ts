'use server';
import { config } from 'dotenv';
config();

// All we need to do is import the flows, and the dev server will pick them up.
import './flows/generate-meal-ideas-from-ingredients';
import './flows/generate-7-day-meal-plan';
import './flows/generate-quick-meal-ideas';
import './flows/generate-meal-idea';
import './flows/identify-ingredients-from-image';
