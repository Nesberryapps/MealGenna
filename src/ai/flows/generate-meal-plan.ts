'use server';
/**
 * @fileOverview Generates a 7-day meal plan with meal names.
 * Full recipes are generated on-demand.
 *
 * - generateMealPlan - A function that returns a full week's meal plan structure with names.
 * - generateRecipeDetails - A function to generate the full details for a single recipe.
 */
import { ai, RecipeSchema as FullRecipeSchema } from '@/ai/genkit';
import { z } from 'genkit';


const SimpleRecipeSchema = z.object({
    name: z.string().describe('The name of the recipe.'),
});

const MealSchema = z.object({
  type: z.enum(['Breakfast', 'Lunch', 'Dinner']),
  recipe: SimpleRecipeSchema,
});

const DailyMealPlanSchema = z.object({
  day: z.string().describe("The day of the week (e.g., 'Monday')."),
  meals: z.array(MealSchema).length(3),
});

const MealPlanOutputSchema = z.array(DailyMealPlanSchema).length(7);
export type DailyMealPlan = z.infer<typeof DailyMealPlanSchema>;
export type SimpleRecipe = z.infer<typeof SimpleRecipeSchema>;


// --- Flow to generate the basic 7-day plan with just names ---
export async function generateMealPlan(): Promise<DailyMealPlan[]> {
  const result = await generateMealPlanFlow();
  return result;
}

const generateMealPlanFlow = ai.defineFlow(
  {
    name: 'generateMealPlanFlow',
    outputSchema: MealPlanOutputSchema,
  },
  async () => {
    
    const mealPlanPrompt = ai.definePrompt({
        name: 'generateSimpleMealPlanPrompt',
        output: { schema: MealPlanOutputSchema },
        prompt: `You are an expert meal planner. Generate a diverse and exciting 7-day meal plan.
    
    For each day of the week, provide a unique meal name for Breakfast, Lunch, and Dinner.
    
    Only provide the name of the recipe for each meal. Do not include any other details.
    `,
        config: {
          temperature: 0.9,
        },
    });

    const { output } = await mealPlanPrompt();
    if (!output) {
      throw new Error('Failed to generate a meal plan.');
    }
    
    return output;
  }
);


// --- New flow to generate details for a single recipe ---

const RecipeDetailsSchema = FullRecipeSchema.extend({
  imageUrl: z.string().optional().describe('URL of an image of the finished dish.'),
});
export type Recipe = z.infer<typeof RecipeDetailsSchema>;

export async function generateRecipeDetails(recipeName: string): Promise<Recipe> {
    const result = await generateRecipeDetailsFlow(recipeName);
    return result;
}

const generateRecipeDetailsFlow = ai.defineFlow(
  {
    name: 'generateRecipeDetailsFlow',
    inputSchema: z.string(),
    outputSchema: RecipeDetailsSchema,
  },
  async (recipeName) => {
    const recipePrompt = ai.definePrompt({
        name: 'generateSingleRecipeDetailsPrompt',
        output: { schema: RecipeDetailsSchema },
        prompt: `You are an expert chef. Generate a full recipe for the following dish: ${recipeName}.

        Provide the following details:
        - The name of the recipe (it should be "${recipeName}").
        - A short, one-sentence description.
        - A simple, descriptive prompt for generating an image of the finished dish.
        - A list of all necessary ingredients.
        - Clear, step-by-step instructions.
        - The estimated total cooking time.
        - A summary of nutritional facts per serving (Calories, Protein, Carbs, Fat).
        `
    });

    const { output } = await recipePrompt();
    if (!output) {
        throw new Error(`Failed to generate details for ${recipeName}`);
    }

    // Generate image in parallel
    const imagePromise = ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: output.imagePrompt,
    });
    
    const imageResult = await imagePromise;
    
    return {
      ...output,
      imageUrl: imageResult.media?.url,
    };
  }
);
