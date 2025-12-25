
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { admin } from '@/lib/firebase-admin';

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


    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${appUrl}/account?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/account`,
      customer_email: userEmail,
      metadata: {
        userId,
        priceId,
      },
    });

    if (!session.url) {
        return new NextResponse('Failed to create Stripe session', { status: 500 });
    }

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error('[STRIPE_CHECKOUT_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
