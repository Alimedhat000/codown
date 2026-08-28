import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { z } from 'zod';

import { useAuth } from '@/context/auth';

import { api } from './api';

/**
 * Zod schema validating registration input: valid email (max 254 chars),
 * username (3-50 chars, letters/digits/dots/dashes/underscores), password
 * (8-128 characters), and optional full name (max 100 chars). Mirrors the
 * server-side RegisterUserSchema bounds so users never hit a 400.
 */
export const RegisterSchema = z.object({
  email: z.string().email().max(254),
  username: z
    .string()
    .min(3)
    .max(50)
    .regex(
      /^[a-zA-Z0-9_.-]+$/,
      'Only letters, digits, dots, dashes and underscores allowed',
    ),
  password: z.string().min(8).max(128),
  fullName: z.string().max(100).optional(),
});

/**
 * Zod schema validating login credentials: valid email (max 254 chars) and a
 * password within the server-accepted length bounds.
 */
export const LoginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
});

export type RegisterSchemaType = z.infer<typeof RegisterSchema>;
export type LoginSchemaType = z.infer<typeof LoginSchema>;

/**
 * Registers a user by POSTing the data to /auth/register. Resolves true on
 * success, false on failure (the error is logged, not thrown).
 */
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

/**
 * Logs a user in by POSTing credentials to /auth/login and resolving with the
 * response payload (access/refresh tokens and user); rethrows on failure.
 */
export const LoginUser = async (data: LoginSchemaType) => {
  try {
    const res = await api.post('/auth/login', data);
    return res.data;
  } catch (err) {
    console.error('Login error:', err);
    throw err;
  }
};

/**
 * Route guard redirecting unauthenticated users away from protected children.
 */
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
