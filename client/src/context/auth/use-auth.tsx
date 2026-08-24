import { useContext } from 'react';

import { AuthContext } from './auth-context';

/**
 * Reads AuthContext; throws when called outside an AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
