
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Capacitor } from '@capacitor/core';
import { Skeleton } from '@/components/ui/skeleton';

export function WebRedirectGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const platform = Capacitor.getPlatform();
    
    // If we are on the web (not native app), redirect to home
    if (platform === 'web') {
      router.replace('/');
    } else {
      // If we are native (ios/android), allow access
      setIsAuthorized(true);
    }
  }, [router]);

  if (!isAuthorized) {
    return (
        <div className="p-8 space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-64 w-full" />
        </div>
    );
  }

  return <>{children}</>;
}
