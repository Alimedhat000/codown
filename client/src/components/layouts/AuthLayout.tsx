import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import { paths } from '@/config/paths';
import { useAuth } from '@/context/auth';

import { Alert } from '../ui/Alert';
import Header from '../ui/Header/header';
import { Head } from '../ui/seo';

type layoutProps = {
  title: string;
  children: React.ReactNode;
  error: string | null;
};

export const AuthLayout = ({ children, title, error }: layoutProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const redirectTo = searchParams.get('redirectTo');

  useEffect(() => {
    if (user) {
      navigate(redirectTo ? redirectTo : paths.app.dashboard.getHref(), {
        replace: true,
      });
    }
  }, [user, navigate, redirectTo]);

  return (
    <>
      <Head title={title} />
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex flex-col pt-20 flex-1 min-h-full w-full items-center  bg-surface">
          {error && (
            <Alert variant="error" className="-mt-10 mb-10">
              {error}
            </Alert>
          )}
          <div className="pb-10 text-3xl">{title}</div>
          <div className="w-1/2">{children}</div>
        </div>
      </div>
    </>
  );
};
