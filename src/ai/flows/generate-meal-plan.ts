'use server';
/**
 * @fileOverview Generates a 7-day meal plan.
 *
 * - generateMealPlan - A function that returns a full week's meal plan.
 */
import { ai, RecipeSchema as FullRecipeSchema } from '@/ai/genkit';
import { z } from 'genkit';


const RecipeSchema = FullRecipeSchema.extend({
  imageUrl: z.string().optional().describe('URL of an image of the finished dish.'),
});
type Recipe = z.infer<typeof RecipeSchema>;

const MealSchema = z.object({
  type: z.enum(['Breakfast', 'Lunch', 'Dinner']),
  recipe: RecipeSchema,
});

const DailyMealPlanSchema = z.object({
  day: z.string().describe("The day of the week (e.g., 'Monday')."),
  meals: z.array(MealSchema).length(3),
});

const MealPlanOutputSchema = z.array(DailyMealPlanSchema).length(7);
export type DailyMealPlan = z.infer<typeof DailyMealPlanSchema>;


const SingleDayMealPlanSchema = z.array(MealSchema).length(3);

export async function generateMealPlan(): Promise<DailyMealPlan[]> {
  const result = await generateMealPlanFlow();
  
  const imageGenerationPromises = result.flatMap(day => 
    day.meals.map(async (meal) => {
      if (meal.recipe.imagePrompt) {
        const { media } = await ai.generate({
            model: 'googleai/imagen-4.0-fast-generate-001',
            prompt: meal.recipe.imagePrompt,
        });
        meal.recipe.imageUrl = media?.url;
      }
    })
  );

  await Promise.all(imageGenerationPromises);
  
  return result;
}

const generateMealPlanFlow = ai.defineFlow(
  {
    name: 'generateMealPlanFlow',
    outputSchema: MealPlanOutputSchema,
  },
  async () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    const mealPlanPrompt = ai.definePrompt({
        name: 'generateFullMealPlanPrompt',
        output: { schema: MealPlanOutputSchema },
        prompt: `You are an expert meal planner and highly creative chef. Generate a diverse, exciting, and delicious 7-day meal plan.
    
    For each day of the week, provide a unique meal for Breakfast, Lunch, and Dinner.
    
    For each meal, provide a full recipe object with the following details:
    - A creative and enticing name.
    - A short, one-sentence description.
    - A simple, descriptive prompt for generating an image of the finished dish.
    - A list of all necessary ingredients.
    - Clear, step-by-step instructions.
    - The estimated total cooking time.
    - A summary of nutritional facts per serving (Calories, Protein, Carbs, Fat).
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
