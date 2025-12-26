
import { NextResponse } from 'next/server';
import { admin } from '@/lib/firebase-admin';
import { stripe } from '@/lib/stripe';

// A map to convert price IDs to amounts in cents
const priceToAmountMap: { [key: string]: number } = {
  [process.env.NEXT_PUBLIC_STRIPE_SINGLE_PACK_PRICE_ID!]: 199,
  [process.env.NEXT_PUBLIC_STRIPE_PLAN_PACK_PRICE_ID!]: 799,
};

export async function POST(req: Request) {
  try {
    const { priceId, userId, userEmail } = await req.json();

    if (!priceId || !userId || !userEmail) {
      return new NextResponse('Missing priceId, userId, or userEmail', { status: 400 });
    }

    const token = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!token) {
        return new NextResponse('Unauthorized: No token provided', { status: 401 });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        if (decodedToken.uid !== userId) {
            return new NextResponse('Unauthorized: Token does not match user', { status: 403 });
        }
    } catch (error) {
        console.error("Error verifying Firebase ID token:", error);
        return new NextResponse('Unauthorized: Invalid token', { status: 403 });
    }

    const amount = priceToAmountMap[priceId];
    if (!amount) {
        return new NextResponse('Invalid priceId provided', { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId,
        priceId,
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });

  } catch (error) {
    console.error('[STRIPE_PAYMENT_INTENT_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
