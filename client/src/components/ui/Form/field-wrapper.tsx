import * as React from 'react';
import { type FieldError } from 'react-hook-form';

import { Error } from './error';
import { Label } from './label';

type FieldWrapperProps = {
  /** Field label text; hidden when omitted. */
  label?: string;
  /** Control id tied to the label's htmlFor. */
  id?: string;
  className?: string;
  /** The form control wrapped by the label/error row. */
  children: React.ReactNode;
  /** Field error whose message renders beside the label. */
  error?: FieldError | undefined;
};

export type FieldWrapperPassThroughProps = Omit<
  FieldWrapperProps,
  'className' | 'children'
>;

/**
 * Composes label, form control and error message around a single field.
 */
export const FieldWrapper = ({
  label,
  id,
  error,
  children,
}: FieldWrapperProps) => {
  return (
    <div>
      <div className="flex justify-between items-start w-full pb-2">
        {label && <Label htmlFor={id}>{label}</Label>}
        {error?.message && <Error errorMessage={error.message} />}
      </div>
      {children}
    </div>
  );
};
