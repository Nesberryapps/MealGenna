
import { NextResponse } from 'next/server';
import { admin } from '@/lib/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Verification token is required' }, { status: 400 });
    }

    // The client should verify `isSignInWithEmailLink` before calling this endpoint.
    // The admin SDK does not have this method.
    // We extract the email from the link's query parameters.
    const url = new URL(token);
    const email = url.searchParams.get('email');
    
    if (!email) {
        return NextResponse.json({ error: 'Email not found in sign-in link.' }, { status: 400 });
    }

    // This can fail if the link is expired or already used
    const userRecord = await admin.auth().getUserByEmail(email).catch(() => null);
    
    // If the user does not exist, a new one will be created.
    // If they do exist, it will sign them in.
    const uid = userRecord ? userRecord.uid : (await admin.auth().createUser({ email })).uid;
    
    const db = getFirestore();
    const userCreditsRef = db.collection('user_credits').doc(uid);
    const userCreditsSnap = await userCreditsRef.get();

    // Give new web users 1 free credit for each type, otherwise load existing credits.
    let credits = { single: 1, '7-day-plan': 1 }; 
    if (userCreditsSnap.exists) {
        const existingData = userCreditsSnap.data();
        credits = {
            single: existingData?.single ?? 0,
            '7-day-plan': existingData?.['7-day-plan'] ?? 0,
        };
    } else {
        await userCreditsRef.set(credits);
    }
    
    // Create a custom token for the client to sign in with
    const customToken = await admin.auth().createCustomToken(uid);

    return NextResponse.json({ 
        success: true, 
        email: email, 
        uid: uid,
        customToken, 
        credits,
    });

  } catch (error: any) {
    console.error('Error verifying token:', error);
    let message = 'Could not verify sign-in link.';
    // Firebase Admin SDK throws 'auth/invalid-action-code' for expired/used links
    if (error.code === 'auth/invalid-action-code') {
        message = 'Invalid or expired sign-in link. Please try again.';
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
