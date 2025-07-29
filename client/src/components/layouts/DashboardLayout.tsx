import React from 'react';

import { useAuth } from '@/context/auth';

import Header from '../ui/Header/header';
import { Head } from '../ui/seo';

type layoutProps = {
  title: string;
  children: React.ReactNode;
};

export const DashboardLayout = ({ children, title }: layoutProps) => {
  const { user, loading, logout } = useAuth();

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Head title={title} />
      <div className="flex flex-col min-h-screen">
        <Header username={user?.username} logout={logout} />
        <div className="flex flex-col pt-20 flex-1 min-h-full w-full items-center  bg-surface">
          <div className="w-1/2">{children}</div>
        </div>
      </div>
    </>
  );
};
