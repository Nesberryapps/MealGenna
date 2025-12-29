'use server';
/**
 * @fileOverview Generates recipe ideas based on pantry items and user preferences.
 *
 * - generateRecipesFromPantry - A function that generates recipe ideas.
 * - GenerateRecipesFromPantryInput - The input type for the generateRecipesFromPantry function.
 * - GenerateRecipesFromPantryOutput - The return type for the generateRecipesFromPantry function.
 */

import {ai, RecipeSchema as FullRecipeSchema} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRecipesFromPantryInputSchema = z.object({
  pantryItems: z
    .string()
    .describe('A comma-separated list of items currently in the user\'s pantry.'),
  dietaryPreferences: z
    .string()
    .optional()
    .describe('The user\'s dietary preferences, such as vegetarian, vegan, or gluten-free.'),
  cuisinePreferences: z
    .string()
    .optional()
    .describe('The user\'s preferred cuisines, such as Italian, Mexican, or Asian.'),
});
export type GenerateRecipesFromPantryInput = z.infer<
  typeof GenerateRecipesFromPantryInputSchema
>;

const RecipeSchema = FullRecipeSchema.extend({
    imageUrl: z.string().optional().describe('URL of an image of the finished dish.'),
});

const GenerateRecipesFromPantryOutputSchema = z.object({
  recipes: z.array(RecipeSchema).describe('An array of generated recipe objects.'),
});

export type Recipe = z.infer<typeof RecipeSchema>;
export type GenerateRecipesFromPantryOutput = z.infer<
  typeof GenerateRecipesFromPantryOutputSchema
>;

export async function generateRecipesFromPantry(
  input: GenerateRecipesFromPantryInput
): Promise<GenerateRecipesFromPantryOutput> {
  const result = await generateRecipesFromPantryFlow(input);
  
  const imageGenerationPromises = result.recipes.map(async (recipe) => {
    const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: recipe.imagePrompt,
    });
    recipe.imageUrl = media?.url;
    return recipe;
  });

  const recipesWithImages = await Promise.all(imageGenerationPromises);
  return { recipes: recipesWithImages };
}

const prompt = ai.definePrompt({
  name: 'generateRecipesFromPantryPrompt',
  input: {schema: GenerateRecipesFromPantryInputSchema},
  output: {schema: GenerateRecipesFromPantryOutputSchema},
  prompt: `You are an expert and highly creative chef who crafts unique, delicious, and easy-to-follow recipes. Given a list of pantry items and optional user preferences, generate 3 diverse and appealing recipe ideas. Strive for creativity and avoid common or predictable recipes.

For each recipe, provide the following details:
- A creative and enticing name.
- A short, one-sentence description that makes the dish sound delicious.
- A simple, descriptive prompt for generating an image of the finished dish.
- A list of all necessary ingredients.
- Clear, step-by-step instructions.
- The estimated total cooking time.
- A summary of nutritional facts per serving (Calories, Protein, Carbs, Fat).

Pantry Items: {{{pantryItems}}}
Dietary Preferences: {{{dietaryPreferences}}}
Cuisine Preferences: {{{cuisinePreferences}}}
`,
  config: {
    temperature: 0.9,
  },
});

const generateRecipesFromPantryFlow = ai.defineFlow(
  {
    name: 'generateRecipesFromPantryFlow',
    inputSchema: GenerateRecipesFromPantryInputSchema,
    outputSchema: GenerateRecipesFromPantryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
