import React, { useEffect } from 'react';
import { LuCodeXml } from 'react-icons/lu';
import { Link, useNavigate, useSearchParams } from 'react-router';

import { paths } from '@/config/paths';
import { useAuth } from '@/context/auth';

import { Alert } from '../ui/Alert';
import { Head } from '../ui/seo';

type layoutProps = {
  title: string;
  children: React.ReactNode;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
};

export const AuthLayout = ({
  children,
  title,
  error,
  setError,
}: layoutProps) => {
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
        <header className="px-4 py-3 bg-header shadow">
          <Link
            to={paths.landing.getHref()}
            className="flex gap-2 items-center text-2xl"
          >
            <LuCodeXml className="text-[#4e44ff] text-3xl" />
            <span className="font-extrabold text-foreground">Co-Down</span>
          </Link>
        </header>

        <div className="flex flex-col pt-20 flex-1 min-h-full w-full items-center  bg-surface">
          {error && (
            <Alert
              variant="error"
              className="-mt-10 mb-10"
              onDismiss={() => setError(null)}
            >
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
