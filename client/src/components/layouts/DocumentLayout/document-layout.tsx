import React from 'react';

import { Head } from '../../ui/Seo';

type layoutProps = {
  title: string;
  children: React.ReactNode;
};

/**
 * Minimal document page shell: head metadata plus a titled main region wrapping children.
 */
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
