'use server';
/**
 * @fileOverview Identifies ingredients from an image of food items.
 *
 * - identifyIngredientsFlow - A Genkit flow that identifies ingredients from an image.
 * - IdentifyIngredientsFromImageInput - The input type for the identifyIngredientsFromImage function.
 * - IdentifyIngredientsFromImageOutput - The return type for the identifyIngredientsFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const IdentifyIngredientsFromImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "An image of food ingredients, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type IdentifyIngredientsFromImageInput = z.infer<
  typeof IdentifyIngredientsFromImageInputSchema
>;

export const IdentifyIngredientsFromImageOutputSchema = z.object({
  ingredients: z
    .array(z.string())
    .describe('A list of identified ingredients from the image.'),
});
export type IdentifyIngredientsFromImageOutput = z.infer<
  typeof IdentifyIngredientsFromImageOutputSchema
>;


const prompt = ai.definePrompt({
  name: 'identifyIngredientsPrompt',
  input: {schema: IdentifyIngredientsFromImageInputSchema},
  output: {schema: IdentifyIngredientsFromImageOutputSchema},
  prompt: `You are an expert at identifying food ingredients from an image.
  
  Analyze the following image and list all the food ingredients you can identify. Be as specific as possible.
  
  Image: {{media url=imageDataUri}}
  
  Return your response in valid JSON format.`,
});

export const identifyIngredientsFlow = ai.defineFlow(
  {
    name: 'identifyIngredientsFlow',
    inputSchema: IdentifyIngredientsFromImageInputSchema,
    outputSchema: IdentifyIngredientsFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
