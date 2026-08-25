import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Form';
import { paths } from '@/config/paths';
import type { RegisterSchemaType } from '@/lib/auth';
import { RegisterSchema } from '@/lib/auth';

interface RegisterFormProps {
  /** Called with validated form data on successful submit. */
  onSubmit: (data: RegisterSchemaType) => void | Promise<void>;
  /** Overrides pending UI while an outer operation runs. Defaults to false. */
  isLoading?: boolean;
}

/**
 * Registration form built on react-hook-form; validates input and delegates account creation to onSubmit.
 */
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
          id="email"
          label="Email"
          placeholder="Enter your email"
          maxLength={254}
          registration={register('email')}
          error={errors.email}
          autoComplete="email"
        />

        <Input
          type="text"
          label="Username"
          id="username"
          placeholder="Enter your username"
          maxLength={50}
          registration={register('username')}
          error={errors.username}
          autoComplete="username"
        />

        <Input
          type="text"
          label="Full Name"
          id="fullname"
          placeholder="Enter your full name"
          maxLength={100}
          registration={register('fullName')}
          error={errors.fullName}
          autoComplete="name"
        />

        <Input
          type="password"
          id="password"
          label="Password"
          placeholder="Enter your password"
          maxLength={128}
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
