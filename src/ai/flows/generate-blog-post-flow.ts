
'use server';

/**
 * @fileOverview An AI flow for generating short blog posts on health and wellness.
 *
 * - generateBlogPost - A function that creates a blog post on a given topic.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { BlogPostSchema } from './types';
import type { BlogPost } from './types';

// Input schema for generating a blog post
const GenerateBlogPostInputSchema = z.object({
  topic: z.string().describe('The topic for the blog post (e.g., "The Benefits of Hydration").'),
});

// Exported function that calls the flow
export async function generateBlogPost(topic: string): Promise<BlogPost> {
  const result = await generateBlogPostFlow({ topic });
  return result;
}

// The main prompt for generating the blog post
const blogPostPrompt = ai.definePrompt({
  name: 'generateBlogPostPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: { schema: GenerateBlogPostInputSchema },
  output: { schema: BlogPostSchema },
  prompt: `You are an expert content creator specializing in health and wellness for a blog called "MealGenna Insights".
Your audience appreciates content that is encouraging, easy to understand, and quick to read.

Write a short blog post about the following topic: "{{topic}}".

The post should be:
-   Incredibly concise (2-3 short paragraphs).
-   Written in a friendly, optimistic, and supportive tone.
-   Focused on providing a practical tip or an inspiring insight.
-   Formatted with a catchy title, the main content paragraphs, and a single-sentence summary.

Do not use markdown or complex formatting. Just generate the structured data.`,
});

// The flow that orchestrates the blog post generation
const generateBlogPostFlow = ai.defineFlow(
  {
    name: 'generateBlogPostFlow',
    inputSchema: GenerateBlogPostInputSchema,
    outputSchema: BlogPostSchema,
  },
  async (input) => {
    const { output } = await blogPostPrompt(input);
    if (!output) {
      throw new Error('Failed to generate a blog post.');
    }
    return output;
  }
);
