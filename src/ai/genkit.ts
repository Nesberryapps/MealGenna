
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
      // We are specifying a version to ensure consistency.
      models: [
        'gemini-1.5-flash',
        'imagen-4.0-fast-generate-001'
      ],
    }),
  ],
});
