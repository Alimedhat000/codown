import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { z } from 'zod';

import { useAuth } from '@/context/auth';

import { api } from './api';

export const RegisterSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(8),
  fullName: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type RegisterSchemaType = z.infer<typeof RegisterSchema>;
export type LoginSchemaType = z.infer<typeof LoginSchema>;

export const RegisterUser = async (
  data: RegisterSchemaType,
): Promise<boolean> => {
  try {
    await api.post('/auth/register', data);
    return true;
  } catch (err) {
    console.error('Registration error:', err);
    return false;
  }
};

export const LoginUser = async (data: LoginSchemaType) => {
  try {
    const res = await api.post('/auth/login', data);
    return res.data;
  } catch (err) {
    console.error('Login error:', err);
    throw err;
  }
};

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isAuthenticated) {
      // console.log('redirecting to', location.pathname);
      navigate(`/login?redirectTo=${location.pathname}`, { replace: true });
    }
  }, [auth.isAuthenticated, location.pathname, navigate]);

  if (!auth.isAuthenticated) {
    // You may also show a loader or nothing until redirect happens
    return null;
  }

  return children;
};
