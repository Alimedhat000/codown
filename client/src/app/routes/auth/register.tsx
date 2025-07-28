import { useState } from 'react';
import { useNavigate } from 'react-router';

import { AuthLayout } from '@/components/layouts/AuthLayout';
import RegisterForm from '@/components/ui/auth/register-form';
import { paths } from '@/config/paths';
import { RegisterUser } from '@/lib/auth';
import { type RegisterSchemaType } from '@/lib/auth';

export default function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: RegisterSchemaType) => {
    setIsLoading(true);
    try {
      setError(null);
      const success = await RegisterUser(data);
      if (success) {
        navigate(paths.auth.login.getHref(), {
          replace: true,
        });
      } else {
        setError(
          'Registration failed. Please check your details and try again.',
        );
      }
    } catch (err: any) {
      console.log(err);
      const status = err.response?.status;

      switch (status) {
        case 400:
          setError('Some required fields are missing or invalid.');
          break;
        case 409:
          setError('An account with this email already exists.');
          break;
        case 429:
          setError('Too many registration attempts. Please try again later.');
          break;
        case 500:
          setError('A server error occurred. Please try again later.');
          break;
        default:
          setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Create Account" error={error}>
      <RegisterForm onSubmit={onSubmit} isLoading={isLoading} />
    </AuthLayout>
  );
}
