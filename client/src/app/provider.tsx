import React from 'react';
import { HelmetProvider } from 'react-helmet-async';

import { Spinner } from '@/components/ui/spinner';
import { AuthProvider } from '@/context/auth';

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense fallback={<Spinner size="xl" />}>
      <HelmetProvider>
        <AuthProvider>{children}</AuthProvider>
      </HelmetProvider>
    </React.Suspense>
  );
}
