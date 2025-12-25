
import { NextResponse } from 'next/server';
import { admin } from '@/lib/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Verification token is required' }, { status: 400 });
    }

    // The token from the client is the entire sign-in URL.
    // We need to verify it's a valid link before using it.
    if (!admin.auth().isSignInWithEmailLink(token)) {
        return NextResponse.json({ error: 'Invalid sign-in link provided.' }, { status: 400 });
    }

    // The user's email is encoded in the link. We need to ask the user for it
    // but in this flow, we'll extract it from the temporary token for simplicity.
    // **NOTE**: This is not the recommended flow. The best practice is to ask the
    // user to enter their email again on the verification page.
    // We are grabbing it from the query param for this demo.
    const url = new URL(token);
    const email = url.searchParams.get('email');
    
    if (!email) {
        return NextResponse.json({ error: 'Email not found in sign-in link.' }, { status: 400 });
    }

    const { user } = await admin.auth().signInWithEmailLink(email, token);

    if (!user.uid) {
        return NextResponse.json({ error: 'Failed to authenticate user.' }, { status: 500 });
    }
    
    const db = getFirestore();
    const userCreditsRef = db.collection('user_credits').doc(user.uid);
    const userCreditsSnap = await userCreditsRef.get();

    let credits = { single: 1, '7-day-plan': 0 }; // Default for a new user
    if (userCreditsSnap.exists) {
        credits = userCreditsSnap.data() as typeof credits;
    } else {
        await userCreditsRef.set(credits);
    }
    
    const customToken = await admin.auth().createCustomToken(user.uid);

    return NextResponse.json({ 
        success: true, 
        email: user.email, 
        uid: user.uid,
        customToken, // Send this to the client to sign in with the Firebase SDK
        credits,
    });

  } catch (error: any) {
    console.error('Error verifying token:', error);
    // Provide a generic error message
    let message = 'Could not verify sign-in link.';
    if (error.code === 'auth/invalid-action-code') {
        message = 'Invalid or expired sign-in link. Please try again.';
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
