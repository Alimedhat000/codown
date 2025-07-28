import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Form/Input';
import { paths } from '@/config/paths';
import type { RegisterSchemaType } from '@/lib/auth';
import { RegisterSchema } from '@/lib/auth';

interface RegisterFormProps {
  onSubmit: (data: RegisterSchemaType) => void | Promise<void>;
  isLoading?: boolean;
}

export default function RegisterForm({
  onSubmit,
  isLoading = false,
}: RegisterFormProps) {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterSchemaType>({
    resolver: zodResolver(RegisterSchema),
  });

  const handleFormSubmit = async (data: RegisterSchemaType) => {
    await onSubmit(data);
  };

  return (
    <div className="max-w-100 mx-auto">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <Input
          type="email"
          label="Email"
          placeholder="Enter your email"
          registration={register('email')}
          error={errors.email}
          autoComplete="email"
        />

        <Input
          type="text"
          label="Username"
          placeholder="Enter your username"
          registration={register('username')}
          error={errors.username}
          autoComplete="username"
        />

        <Input
          type="text"
          label="Full Name"
          placeholder="Enter your full name"
          registration={register('fullName')}
          error={errors.fullName}
          autoComplete="name"
        />

        <Input
          type="password"
          label="Password"
          placeholder="Enter your password"
          registration={register('password')}
          error={errors.password}
          autoComplete="new-password"
        />

        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading || isSubmitting}
          disabled={isLoading || isSubmitting}
        >
          {isLoading || isSubmitting ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>
      <div className="mt-8 flex text-muted-foreground-white items-center justify-center text-sm font-light">
        <span className="mr-2">{'Have an account?'}</span>
        <Link
          to={paths.auth.login.getHref(redirectTo)}
          className="underline hover:text-foreground font-medium"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
