
'use client';

import { GoogleReCaptchaProvider } from 'react-google-recaptcha';
import React from 'react';

export function ReCaptchaProvider({ children }: { children: React.ReactNode }) {
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (!recaptchaSiteKey) {
    console.warn("reCAPTCHA Site Key is not configured. reCAPTCHA will be disabled.");
    return <>{children}</>;
  }

  return (
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaSiteKey}>
      {children}
    </GoogleReCaptchaProvider>
  );
}
