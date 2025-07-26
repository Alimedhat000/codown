import React from 'react';
import { HelmetProvider } from 'react-helmet-async';

import { AuthProvider } from '@/context/auth';

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <HelmetProvider>
      <AuthProvider>{children}</AuthProvider>
    </HelmetProvider>
  );
}
