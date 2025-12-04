
'use server';

/**
 * @fileOverview An AI flow for generating a simplified grocery list.
 *
 * This flow takes a list of required ingredients for a recipe and a list
 * of ingredients the user already has in their pantry. It identifies
 * which ingredients are missing and simplifies their names for easy
 * online shopping.
 *
 * - generateGroceryList - The main function to generate the list.
 * - GroceryListInput - The input type for the flow.
 * - GroceryListOutput - The output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Input schema for the grocery list generation flow
const GroceryListInputSchema = z.object({
  pantryItems: z.array(z.string()).describe('A list of items the user has in their pantry.'),
  requiredItems: z.array(z.string()).describe('The full list of ingredients required for a recipe.'),
});
export type GroceryListInput = z.infer<typeof GroceryListInputSchema>;

// Output schema for the grocery list
const GroceryListOutputSchema = z.object({
  missingItems: z.array(z.string()).describe('A simplified list of missing ingredients needed for the recipe.'),
});
export type GroceryListOutput = z.infer<typeof GroceryListOutputSchema>;

// Exported function that calls the Genkit flow
export async function generateGroceryList(input: GroceryListInput): Promise<GroceryListOutput> {
  const result = await generateGroceryListFlow(input);
  return result;
}

// The prompt that instructs the AI how to process the ingredient lists
const groceryListPrompt = ai.definePrompt({
  name: 'generateGroceryListPrompt',
  input: { schema: GroceryListInputSchema },
  output: { schema: GroceryListOutputSchema },
  prompt: `You are an expert at creating simple, clean grocery lists.

A user has the following items in their pantry:
{{#if pantryItems}}
  {{#each pantryItems}}
- {{{this}}}
  {{/each}}
{{else}}
(Pantry is empty)
{{/if}}

A recipe requires the following ingredients:
{{#each requiredItems}}
- {{{this}}}
{{/each}}

Your task is to:
1. Identify which of the "required ingredients" are NOT in the user's "pantry items".
2. For each missing ingredient, simplify its name into a generic, searchable term. For example:
   - "1/2 cup of all-purpose flour" should become "all-purpose flour"
   - "a pinch of salt" should become "salt"
   - "2 tablespoons olive oil" should become "olive oil"
   - "one large yellow onion, diced" should become "yellow onion"

Return ONLY the simplified list of missing items. If all items are present in the pantry, return an empty list.`,
});

// The flow that orchestrates the grocery list generation
const generateGroceryListFlow = ai.defineFlow(
  {
    name: 'generateGroceryListFlow',
    inputSchema: GroceryListInputSchema,
    outputSchema: GroceryListOutputSchema,
  },
  async (input) => {
    // If there are no required items, return an empty list.
    if (!input.requiredItems || input.requiredItems.length === 0) {
      return { missingItems: [] };
    }

    const { output } = await groceryListPrompt(input);
    if (!output) {
      throw new Error('Failed to generate a grocery list.');
    }
    return output;
  }
);
