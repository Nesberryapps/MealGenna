
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { admin } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { priceId, userEmail } = await req.json();

    if (!priceId || !userEmail) {
      return new NextResponse('Missing priceId or userEmail', { status: 400 });
    }

    let userId: string;
    const token = req.headers.get('Authorization')?.split('Bearer ')[1];

    if (token) {
        // If a token is provided, verify it and use the UID
        const decodedToken = await admin.auth().verifyIdToken(token);
        userId = decodedToken.uid;
    } else {
        // If no token (guest checkout), find or create the user by email
        let userRecord;
        try {
            userRecord = await admin.auth().getUserByEmail(userEmail);
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                userRecord = await admin.auth().createUser({ email: userEmail });
                // Also send a magic link so they can sign in later
                const actionCodeSettings = { url: `${process.env.NEXT_PUBLIC_APP_URL}/account`, handleCodeInApp: true };
                const link = await admin.auth().generateSignInWithEmailLink(userEmail, actionCodeSettings);
                // In a real app, you would email this link to the user.
                console.log(`Generated sign-in link for new user ${userEmail}: ${link}`);
            } else {
                throw error; // Re-throw other errors
            }
        }
        userId = userRecord.uid;
    }
    
    // Safety check in case userId couldn't be determined
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
      customer_email: userEmail,
      metadata: {
        userId, // The resolved Firebase UID
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
