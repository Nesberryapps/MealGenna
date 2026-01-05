'use client';

import React, { useMemo, useState, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

// Define a type for the Firebase services object
type FirebaseServices = {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
};

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // Initialize state with null services for the server render
  const [firebaseServices, setFirebaseServices] = useState<FirebaseServices>({
    firebaseApp: null,
    auth: null,
    firestore: null,
  });

  useEffect(() => {
    // This effect runs only once on the client after initial mount.
    // It initializes the real Firebase services and updates the state,
    // triggering a re-render with the full context.
    const services = initializeFirebase();
    setFirebaseServices(services);
  }, []);

  // The provider is now always rendered. On the server, it provides nulls.
  // On the client, it re-renders with the real services after the effect runs.
  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
