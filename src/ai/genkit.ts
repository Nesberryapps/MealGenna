
/**
 * @fileoverview This file initializes the Genkit AI plugin.
 *
 * It is used to define and configure AI models, flows, and other Genkit
 * functionalities. This centralized setup allows other parts of the application
 * to use a consistent, pre-configured AI instance.
 *
 * The `ai` object exported from this file is the main entry point for all
 * AI-related operations.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      // The Gemini 2.5 Pro model is powerful and well-suited for complex generation tasks.
      // We are specifying a version to ensure consistency.
      models: ['googleai/gemini-2.5-pro-preview'],
    }),
  ],
});
