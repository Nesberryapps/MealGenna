
'use client';

import { useEffect, useState } from 'react';

// Guard is now permissive for both Web and Native to restore functionality
export function WebRedirectGuard({ children }: { children: React.ReactNode }) {
  // We allow access everywhere now.
  return <>{children}</>;
}
