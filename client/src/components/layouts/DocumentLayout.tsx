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
      <div className="flex flex-col min-h-screen">{children}</div>
    </>
  );
};
