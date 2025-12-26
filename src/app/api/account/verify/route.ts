
import { NextResponse } from 'next/server';
import { admin } from '../../../../lib/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Verification token is required' }, { status: 400 });
    }

    if (!admin.auth().isSignInWithEmailLink(token)) {
        return NextResponse.json({ error: 'Invalid sign-in link provided.' }, { status: 400 });
    }

    const url = new URL(token);
    const email = url.searchParams.get('email');
    
    if (!email) {
        return NextResponse.json({ error: 'Email not found in sign-in link.' }, { status: 400 });
    }

    // This can fail if the link is expired or already used
    const userRecord = await admin.auth().getUserByEmail(email).catch(() => null);
    
    // If the user does not exist, signInWithEmailLink will create them.
    // If they do exist, it will sign them in.
    const uid = userRecord ? userRecord.uid : (await admin.auth().createUser({ email })).uid;
    
    const db = getFirestore();
    const userCreditsRef = db.collection('user_credits').doc(uid);
    const userCreditsSnap = await userCreditsRef.get();

    let credits = { single: 1, '7-day-plan': 0 }; 
    if (userCreditsSnap.exists) {
        credits = userCreditsSnap.data() as typeof credits;
    } else {
        await userCreditsRef.set(credits);
    }
    
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
    if (error.code === 'auth/invalid-action-code') {
        message = 'Invalid or expired sign-in link. Please try again.';
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
