import { createContext } from 'react';

import { type User } from '@/types/api';

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

/**
 * Context carrying the auth session: user, accessToken, isAuthenticated, loading, login and logout.
 */
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
