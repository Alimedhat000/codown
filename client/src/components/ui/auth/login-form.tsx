import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Form/Input';
import { paths } from '@/config/paths';
import type { LoginSchemaType } from '@/lib/auth';
import { LoginSchema } from '@/lib/auth';

interface LoginFormProps {
  onSubmit: (data: LoginSchemaType) => void | Promise<void>;
  isLoading?: boolean;
}

export default function LoginForm({
  onSubmit,
  isLoading = false,
}: LoginFormProps) {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(LoginSchema),
  });

  const handleFormSubmit = async (data: LoginSchemaType) => {
    await onSubmit(data);
  };

  return (
    <div className="max-w-100 mx-auto">
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="flex flex-col gap-8  px-10"
      >
        <Input
          type="email"
          id="email"
          label="Email"
          placeholder="Enter your email"
          registration={register('email')}
          error={errors.email}
          autoComplete="email"
        />

        <Input
          type="password"
          id="password"
          label="Password"
          placeholder="Enter your password"
          registration={register('password')}
          error={errors.password}
          autoComplete="current-password"
        />

        <Button
          type="submit"
          className="w-1/2 mx-auto"
          isLoading={isLoading || isSubmitting}
          disabled={isLoading || isSubmitting}
          size={'lg'}
        >
          {isLoading || isSubmitting ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div className="mt-8 flex text-muted-foreground-white items-center justify-center text-sm font-light">
        <span className="mr-2">{'New to Co-Down?'}</span>
        <Link
          to={paths.auth.register.getHref(redirectTo)}
          className="underline hover:text-foreground font-medium"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
