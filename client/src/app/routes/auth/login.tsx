import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import { AuthLayout } from '@/components/layouts/authLayout';
import LoginForm from '@/components/ui/auth/login-form';
import { paths } from '@/config/paths';
import { useAuth } from '@/context/auth';
import { api } from '@/lib/api';
import { type LoginSchemaType } from '@/lib/auth';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const redirectTo = searchParams.get('redirectTo');

  const { login } = useAuth();

  const onSubmit = async (data: LoginSchemaType) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', data);
      const { accessToken, user } = res.data;
      login(accessToken, user);
      navigate(`${redirectTo ? `${redirectTo}` : paths.app.home.getHref()}`, {
        replace: true,
      });
    } catch (err: any) {
      console.error(err);
      const status = err.response?.status;
      switch (status) {
        case 400:
          setError('Missing or invalid login credentials.');
          break;
        case 401:
          setError('Invalid email or password. Please try again.');
          break;
        case 403:
          setError(
            'Your account does not have permission to access this resource.',
          );
          break;
        case 404:
          setError(
            'Login service is currently unavailable. Please try again later.',
          );
          break;
        case 429:
          setError(
            'Too many login attempts. Please wait a few minutes and try again.',
          );
          break;
        case 500:
          setError(
            'Something went wrong on our end. Please try again shortly.',
          );
          break;
        default:
          setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Log In" error={error} setError={setError}>
      <LoginForm onSubmit={onSubmit} isLoading={isLoading} />
    </AuthLayout>
  );
}
