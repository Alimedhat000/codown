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
      <div className="flex relative bg-surface text-text-primary flex-col h-screen  overflow-y-hidden ">
        {children}
      </div>
    </>
  );
};
