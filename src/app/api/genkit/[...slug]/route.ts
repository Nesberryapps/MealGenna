/**
 * This file is the single point of entry for all Genkit flow requests.
 */
import {nextHandler} from '@genkit-ai/next';
import ai from '@/ai/genkit';

// Expose the Genkit API endpoint.
export const POST = nextHandler({ai});
