import React from 'react';

import { Head } from '../../ui/Seo';

type layoutProps = {
  /** Document title set via Head. */
  title: string;
  /** Full-height document workspace filling the shell. */
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
