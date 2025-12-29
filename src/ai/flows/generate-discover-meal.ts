'use server';
/**
 * @fileOverview Generates a single, random meal suggestion for the Discover page.
 *
 * - generateDiscoverMeal - A function that returns a single recipe idea.
 */

import { ai, RecipeSchema as FullRecipeSchema } from '@/ai/genkit';
import { z } from 'genkit';


// We can reuse the Recipe schema from the other flow
const RecipeSchema = FullRecipeSchema.extend({
  imageUrl: z.string().optional().describe('URL of an image of the finished dish.'),
});
type Recipe = z.infer<typeof RecipeSchema>;

export async function generateDiscoverMeal(): Promise<Recipe> {
  const result = await generateDiscoverMealFlow();
  return result;
}

const prompt = ai.definePrompt({
  name: 'generateDiscoverMealPrompt',
  output: { schema: RecipeSchema },
  prompt: `You are an expert and highly creative chef. Generate one unique, delicious, and easy-to-follow recipe idea. It can be for any meal type (breakfast, lunch, dinner, snack). Strive for maximum creativity and surprise, avoiding common or predictable recipes.

Provide the following details:
- A creative and enticing name.
- A short, one-sentence description that makes the dish sound delicious.
- A simple, descriptive prompt for generating an image of the finished dish, suitable for a text-to-image model.
- A list of all necessary ingredients.
- Clear, step-by-step instructions.
- The estimated total cooking time.
- A summary of nutritional facts per serving (Calories, Protein, Carbs, Fat).
`,
  config: {
    temperature: 1.0,
  },
});


const generateDiscoverMealFlow = ai.defineFlow(
  {
    name: 'generateDiscoverMealFlow',
    outputSchema: RecipeSchema,
  },
  async () => {
    const { output } = await prompt();
    if (!output) {
      throw new Error('Failed to generate a meal.');
    }
    
    // Generate image in parallel
    const imagePromise = ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: output.imagePrompt,
    });
    
    const [imageResult] = await Promise.all([imagePromise]);
    
    return {
      ...output,
      imageUrl: imageResult.media?.url,
    };
  }
);
