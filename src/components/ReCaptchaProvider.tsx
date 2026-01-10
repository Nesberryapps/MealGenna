
'use client';

import GoogleReCaptchaProvider from 'react-google-recaptcha';
import React from 'react';

export function ReCaptchaProvider({ children }: { children: React.ReactNode }) {
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (!recaptchaSiteKey) {
    // In development, it's helpful to throw an error if the key is missing.
    // This is often due to the development server needing a restart after updating .env.
    if (process.env.NODE_ENV === 'development') {
        throw new Error(
        'reCAPTCHA Site Key is not configured. Please add NEXT_PUBLIC_RECAPTCHA_SITE_KEY to your .env.local file and restart the development server.'
        );
    }
    // In production, we'll just disable it silently.
    console.warn("reCAPTCHA Site Key is not configured. reCAPTCHA will be disabled.");
    return <>{children}</>;
  }

  return (
    <GoogleReCaptchaProvider sitekey={recaptchaSiteKey}>
      {children}
    </GoogleReCaptchaProvider>
  );
}
