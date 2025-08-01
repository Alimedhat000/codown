import React from 'react';

import { Head } from '../ui/seo';

type layoutProps = {
  title: string;
  children: React.ReactNode;
};

export const DocumentLayout = ({ title, children }: layoutProps) => {
  return (
    <>
      <Head title={title} />
      <div className="flex flex-col min-h-screen">
        <div className="bg-surface text-text-primary h-screen">{children}</div>
      </div>
    </>
  );
};
