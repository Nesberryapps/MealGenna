'use client';

import { FirebaseProvider } from '@/firebase/client';
import { NotificationsManager } from '@/components/features/NotificationsManager';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseProvider>
      {children}
      <NotificationsManager />
    </FirebaseProvider>
  );
}
