
'use server';
/**
 * @fileOverview Generates a meal idea based on user preferences, including a generated image.
 *
 * - generateMealIdea - A function that generates a meal idea.
 * - GenerateMealIdeaInput - The input type for the generateMealIdea function.
 * - GenerateMealIdeaOutput - The return type for the generateMealIdea function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMealIdeaInputSchema = z.object({
  mealType: z.string().describe('The type of meal (e.g., Breakfast, Lunch, Dinner).'),
  dietaryPreference: z
    .string()
    .describe('The dietary preference (e.g., No preference, Vegetarian, Vegan).'),
  flavorFusion1: z.string().describe('The first flavor for fusion.'),
  flavorFusion2: z.string().describe('The second flavor for fusion.'),
  customRequests: z
    .string()
    .optional()
    .describe('Any custom requests, allergies, or dislikes.'),
});
export type GenerateMealIdeaInput = z.infer<typeof GenerateMealIdeaInputSchema>;

const GenerateMealIdeaOutputSchema = z.object({
  title: z.string().describe('A creative title for the meal.'),
  description: z.string().describe('A brief, enticing description of the meal.'),
  ingredients: z.array(z.string()).describe('A list of ingredients for the meal.'),
  instructions: z.array(z.string()).describe('The cooking instructions for the meal.'),
  cookingTime: z.string().describe('The estimated cooking time.'),
  nutrition: z
    .object({
      calories: z.string(),
      protein: z.string(),
      fat: z.string(),
      carbs: z.string(),
    })
    .describe('Nutritional information for the meal.'),
});

// The final output type that the client will receive.
export type GenerateMealIdeaOutput = z.infer<typeof MealDetailsWithImageSchema>;

// An intermediate schema that includes the image search query.
const MealDetailsSchema = GenerateMealIdeaOutputSchema;

// The final schema for the flow output, which includes the final image URL.
const MealDetailsWithImageSchema = MealDetailsSchema.extend({
  imageDataUri: z.string().describe('A data URI for a generated image of the meal.'),
});

export async function generateMealIdea(
  input: GenerateMealIdeaInput
): Promise<GenerateMealIdeaOutput> {
  return generateMealIdeaFlow(input);
}

const mealDetailsPrompt = ai.definePrompt({
  name: 'generateMealDetailsPrompt',
  input: {schema: GenerateMealIdeaInputSchema},
  output: {
    schema: MealDetailsSchema,
  },
  prompt: `You are an expert chef. Generate a creative and delicious meal idea based on the user's preferences.

Meal Type: {{{mealType}}}
Dietary Preference: {{{dietaryPreference}}}
Flavor Fusion: {{{flavorFusion1}}} and {{{flavorFusion2}}}
Custom Requests: {{{customRequests}}}

Provide a creative title, a brief description, a list of ingredients, step-by-step cooking instructions, the estimated cooking time, and nutritional facts (calories, protein, fat, carbs).

Return your response as a valid JSON object that conforms to the output schema.
`,
});

const generateMealIdeaFlow = ai.defineFlow(
  {
    name: 'generateMealIdeaFlow',
    inputSchema: GenerateMealIdeaInputSchema,
    outputSchema: MealDetailsWithImageSchema,
  },
  async input => {
    const {output: mealDetails} = await mealDetailsPrompt(input);
    if (!mealDetails) {
      throw new Error('Failed to generate meal details.');
    }

    const imageGenPrompt = `A photorealistic image of a meal titled "${mealDetails.title}". Description: ${mealDetails.description}.`;

    const {media} = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: imageGenPrompt,
    });
    const imageDataUri = media.url;
    if (!imageDataUri) {
      throw new Error('Failed to generate an image for the meal.');
    }
    
    return {
      ...mealDetails,
      imageDataUri,
    };
  }
);
