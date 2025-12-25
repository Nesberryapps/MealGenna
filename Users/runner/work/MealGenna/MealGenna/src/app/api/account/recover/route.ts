
import { NextResponse } from 'next/server';
import { admin } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const { link } = await admin.auth().generateSignInWithEmailLink(email, {
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}`,
    });

    // In a real app, you'd email this link to the user.
    // For this example, we're just sending it back.
    // NOTE: This is NOT secure for production.
    console.log(`Generated sign-in link for ${email}: ${link}`);

    // In a real app, you would use a service like SendGrid, Resend, etc.
    // to email the magic link to the user. For this example, we just
    // log it and return success. The actual link isn't sent to the client
    // to prevent it from being easily intercepted in this demo environment.
    
    return NextResponse.json({ success: true, message: 'Sign-in link generated. Check server logs.' });

  } catch (error: any) {
    console.error('Error generating sign-in link:', error);
    // Hide detailed error messages in production
    return NextResponse.json({ error: 'Could not generate sign-in link.' }, { status: 500 });
  }
}

