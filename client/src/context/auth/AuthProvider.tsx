import { useState, useEffect } from 'react';

import { api } from '@/lib/api';
import { type User } from '@/types/api';
import { setAccessToken as storeToken, clearAccessToken } from '@/utils/token';

import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const login = (token: string, user: User) => {
    setAccessToken(token);
    setUser(user);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    storeToken(token);
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setAccessToken(null);
    setUser(null);
    localStorage.setItem('wasLoggedOut', 'true');
    delete api.defaults.headers.common['Authorization'];
    clearAccessToken();
  };

  useEffect(() => {
    const refresh = async () => {
      if (localStorage.getItem('wasLoggedOut') === 'true') {
        localStorage.removeItem('wasLoggedOut');
        setLoading(false);
        return;
      }
      try {
        const res = await api.post('/auth/refresh');
        const { accessToken, user } = res.data;
        login(accessToken, user);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    refresh();
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
