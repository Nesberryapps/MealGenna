
import 'server-only';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: Request) {
  // This ensures the key is only accessed on the server.
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    console.error('Stripe secret key is not set in environment variables.');
    return NextResponse.json({ error: 'Server configuration error: Stripe key missing.' }, { status: 500 });
  }

  const stripe = new Stripe(key, {
    // It's good practice to specify the API version.
    apiVersion: '2024-06-20',
  });

  const { planType } = await request.json();

  let amount: number;
  
  switch (planType) {
    case 'single':
      amount = 199; // $1.99
      break;
    case 'weekly':
      amount = 799; // $7.99
      break;
    default:
      return NextResponse.json({ error: 'Invalid plan type provided.' }, { status: 400 });
  }
  
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      // The receipt_email is now optional and will be collected by Stripe's payment form if needed.
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Stripe Payment Intent creation error:', error);
    // Provide a more generic error to the client for security.
    const errorMessage = error instanceof Error ? error.message : 'Could not create Stripe Payment Intent.';
    return NextResponse.json({ error: `An issue occurred while setting up the payment. ${errorMessage}` }, { status: 500 });
  }
}
