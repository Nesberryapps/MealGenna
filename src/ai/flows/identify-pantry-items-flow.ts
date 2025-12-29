'use server';
/**
 * @fileOverview Identifies pantry items from an image.
 *
 * - identifyPantryItems - A function that identifies pantry items from an image.
 * - IdentifyPantryItemsInput - The input type for the identifyPantryItems function.
 * - IdentifyPantryItemsOutput - The return type for the identifyPantryItems function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyPantryItemsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a user's pantry, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type IdentifyPantryItemsInput = z.infer<
  typeof IdentifyPantryItemsInputSchema
>;

const IdentifyPantryItemsOutputSchema = z.object({
  items: z
    .array(z.string())
    .describe('A list of food items identified in the image.'),
});
export type IdentifyPantryItemsOutput = z.infer<
  typeof IdentifyPantryItemsOutputSchema
>;

export async function identifyPantryItems(
  input: IdentifyPantryItemsInput
): Promise<IdentifyPantryItemsOutput> {
  return identifyPantryItemsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyPantryItemsPrompt',
  input: {schema: IdentifyPantryItemsInputSchema},
  output: {schema: IdentifyPantryItemsOutputSchema},
  prompt: `You are an expert at identifying food items from an image.
Analyze the provided image and list all the food ingredients you can identify.
If you see items that are not food, do not include them in the list.
Be concise in your item names (e.g., "onion" instead of "one yellow onion").

Image: {{media url=photoDataUri}}`,
});

const identifyPantryItemsFlow = ai.defineFlow(
  {
    name: 'identifyPantryItemsFlow',
    inputSchema: IdentifyPantryItemsInputSchema,
    outputSchema: IdentifyPantryItemsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
