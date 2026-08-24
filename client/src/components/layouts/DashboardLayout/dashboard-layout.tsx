import React from 'react';

import { useAuth } from '@/context/auth';

import Header from '../../ui/Header/header';
import { Head } from '../../ui/Seo';

type layoutProps = {
  /** Document title set via Head. */
  title: string;
  /** Routed page content rendered under the header. */
  children: React.ReactNode;
};

/**
 * Authenticated app shell: top Header with user menu plus routed outlet; sends still-loading or signed-out users to login.
 */
export const DashboardLayout = ({ children, title }: layoutProps) => {
  const { user, loading, logout } = useAuth();

  // Todo add a loading Component
  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Head title={title} />
      <div className="flex flex-col min-h-screen">
        <Header username={user?.username} logout={logout} />
        <div className="pt-10 px-8 flex-1 min-h-full w-full items-center  bg-surface">
          {children}
        </div>
      </div>
    </>
  );
};
