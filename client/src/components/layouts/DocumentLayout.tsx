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
      <div className="flex overflow-hidden relative bg-surface text-text-primary flex-col h-screen">
        {children}
      </div>
    </>
  );
};
