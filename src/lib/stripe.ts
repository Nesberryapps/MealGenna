import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  // Use the latest API version or remove this line entirely
  apiVersion: '2024-06-20', 
  typescript: true,
});