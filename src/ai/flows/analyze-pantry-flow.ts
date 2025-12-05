
'use server';

/**
 * @fileOverview An AI flow for analyzing images of pantries or refrigerators.
 *
 * - analyzePantry - A function that identifies food items from an image.
 * - AnalyzePantryInput - The input type for the analyzePantry function.
 * - AnalyzePantryOutput - The return type for the analyzePantry function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AnalyzePantryInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a pantry or refrigerator, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzePantryInput = z.infer<typeof AnalyzePantryInputSchema>;

const AnalyzePantryOutputSchema = z.object({
  items: z.array(z.string()).describe('A list of the identified food items.'),
});
export type AnalyzePantryOutput = z.infer<typeof AnalyzePantryOutputSchema>;


export async function analyzePantry(input: AnalyzePantryInput): Promise<AnalyzePantryOutput> {
  return analyzePantryFlow(input);
}


const prompt = ai.definePrompt({
  name: 'analyzePantryPrompt',
  model: 'googleai/gemini-2.5-flash',
  input: { schema: AnalyzePantryInputSchema },
  output: { schema: AnalyzePantryOutputSchema },
  prompt: `You are an expert at identifying food items from an image.
Analyze the provided image of a pantry or refrigerator.
Identify all the distinct food items you can see.
Return the items as a simple list of strings. Do not add quantities or descriptions, just the name of the item.

For example, if you see two apples and a carton of milk, you should return: ["apple", "milk"].

Image to analyze: {{media url=photoDataUri}}`,
});

const analyzePantryFlow = ai.defineFlow(
  {
    name: 'analyzePantryFlow',
    inputSchema: AnalyzePantryInputSchema,
    outputSchema: AnalyzePantryOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI model did not return a valid analysis.');
    }
    return output;
  }
);
