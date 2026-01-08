
'use client';

import { useState, useEffect } from 'react';

export function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (!hasHydrated) {
    return null;
  }

  return <>{children}</>;
}
