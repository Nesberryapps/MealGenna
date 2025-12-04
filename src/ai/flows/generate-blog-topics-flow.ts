
'use server';

/**
 * @fileOverview An AI flow for generating a list of health and wellness blog topics.
 *
 * - generateBlogTopics - A function that creates a list of blog topics with icon suggestions.
 * - BlogTopic - The type for a single topic output.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { Heart, Brain, Droplets, Lightbulb, Footprints, ShieldCheck, Smile, Wind } from 'lucide-react';

// Define the schema for a single topic, including an icon suggestion.
const BlogTopicSchema = z.object({
  topic: z.string().describe('A catchy, engaging blog post title related to health, wellness, nutrition, or mental health.'),
  icon: z.enum(['Heart', 'Brain', 'Droplets', 'Lightbulb', 'Footprints', 'ShieldCheck', 'Smile', 'Wind']).describe('The most relevant icon name from the provided list for this topic.'),
});
export type BlogTopic = z.infer<typeof BlogTopicSchema>;

// Define the output schema for the list of topics.
const BlogTopicsOutputSchema = z.object({
  topics: z.array(BlogTopicSchema),
});

// Exported function that calls the flow.
export async function generateBlogTopics(): Promise<BlogTopic[]> {
  const result = await generateBlogTopicsFlow();
  return result.topics;
}

// The prompt to generate blog topics.
const blogTopicsPrompt = ai.definePrompt({
  name: 'generateBlogTopicsPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  output: { schema: BlogTopicsOutputSchema },
  prompt: `You are a content strategist for a health and wellness blog called "MealGenna Insights".
Your audience appreciates content that is encouraging, easy to understand, and quick to read.

Generate a list of FOUR (4) unique and engaging blog post titles. The topics should be diverse and cover physical health, mental wellness, nutrition, or simple life improvement hacks.

For each topic, you must also suggest the most appropriate icon name from the following list:
- Heart (for love, health, exercise)
- Brain (for mental health, mindfulness, learning)
- Droplets (for hydration, purity, simplicity)
- Lightbulb (for new ideas, creativity, hacks)
- Footprints (for steps, walking, journey)
- ShieldCheck (for immunity, protection, safety)
- Smile (for happiness, positive thinking)
- Wind (for breathing, calm, stress relief)

Return the list of topics and their corresponding icon names. Do not generate the blog content itself, only the titles and icon suggestions.`,
});

// The flow that orchestrates the topic generation.
const generateBlogTopicsFlow = ai.defineFlow(
  {
    name: 'generateBlogTopicsFlow',
    outputSchema: BlogTopicsOutputSchema,
  },
  async () => {
    const { output } = await blogTopicsPrompt({});
    if (!output) {
      throw new Error('Failed to generate blog topics.');
    }
    return output;
  }
);
