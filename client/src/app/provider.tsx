import React from 'react';
import { HelmetProvider } from 'react-helmet-async';

import { Spinner } from '@/components/ui/Spinner';
import { AuthProvider } from '@/context/auth';

/**
 * Composes global providers (Helmet, Auth) for the whole app.
 */
export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense fallback={<Spinner size="xl" />}>
      <HelmetProvider>
        <AuthProvider>{children}</AuthProvider>
      </HelmetProvider>
    </React.Suspense>
  );
}
