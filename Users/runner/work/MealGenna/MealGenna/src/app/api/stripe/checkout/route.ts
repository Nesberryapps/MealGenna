
import { NextResponse } from 'next/server';
import { stripe } from '../../../lib/stripe';
import { admin } from '../../../lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { priceId } = await req.json();

    if (!priceId) {
      return new NextResponse('Missing priceId', { status: 400 });
    }

    let userId: string | undefined;
    const token = req.headers.get('Authorization')?.split('Bearer ')[1];
    let userEmail: string | undefined;

    if (token) {
        const decodedToken = await admin.auth().verifyIdToken(token);
        userId = decodedToken.uid;
        userEmail = decodedToken.email;
    } else {
        // Create an anonymous user for guest checkouts
        const userRecord = await admin.auth().createUser({});
        userId = userRecord.uid;
        console.log(`Created anonymous user with UID: ${userId} for guest checkout.`);
    }
    
    if (!userId) {
        return new NextResponse('Could not determine user for checkout', { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${appUrl}/account?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/account`,
      // Stripe will collect the email on its page if not provided
      ...(userEmail && { customer_email: userEmail }),
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
