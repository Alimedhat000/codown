import * as React from 'react';
import { type FieldError } from 'react-hook-form';

import { Error } from './error';
import { Label } from './label';

type FieldWrapperProps = {
  label?: string;
  className?: string;
  children: React.ReactNode;
  error?: FieldError | undefined;
};

export type FieldWrapperPassThroughProps = Omit<
  FieldWrapperProps,
  'className' | 'children'
>;

export const FieldWrapper = ({ label, error, children }: FieldWrapperProps) => {
  return (
    <div>
      <div className="flex justify-between items-start w-full pb-2">
        {label && <Label>{label}</Label>}
        {error?.message && <Error errorMessage={error.message} />}
      </div>
      {children}
    </div>
  );
};
