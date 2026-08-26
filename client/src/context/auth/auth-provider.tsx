import { useEffect, useState } from 'react';

import { api, onSessionExpired, refreshAccessToken } from '@/lib/api';
import { type User } from '@/types/api';
import { setAccessToken as storeToken, clearAccessToken } from '@/utils/token';

import { AuthContext } from './auth-context';

/**
 * Session bootstrap: restores the session from the refresh cookie on mount,
 * exposes login/logout and mirrors the token into api defaults and module
 * storage. A failed bootstrap simply means signed out — it never calls the
 * authenticated logout endpoint.
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const markSignedOut = () => {
    setAccessToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
    clearAccessToken();
  };

  const login = (token: string, user: User) => {
    setAccessToken(token);
    setUser(user);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    storeToken(token);
  };

  const logout = async () => {
    // The server may already be unreachable or the session expired; local
    // cleanup happens either way.
    try {
      await api.post('/auth/logout');
    } catch {
      // session already dead server-side
    }
    markSignedOut();
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        // Shares the single-flight with the response interceptor, so a
        // bootstrap racing an in-flight refresh triggers only one request.
        const { accessToken, user } = await refreshAccessToken();
        login(accessToken, user);
      } catch {
        markSignedOut();
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
    return onSessionExpired(markSignedOut);
  }, []);

  if (loading) return null;

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        login,
        logout,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
