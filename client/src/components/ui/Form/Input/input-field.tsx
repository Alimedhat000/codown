import { type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { type UseFormRegisterReturn } from 'react-hook-form';
import { LuTriangleAlert } from 'react-icons/lu';

import { cn } from '@/utils/cn';

import { FieldWrapper, FieldWrapperPassThroughProps } from '../field-wrapper';

import { inputVariants } from './variants';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
  FieldWrapperPassThroughProps &
  VariantProps<typeof inputVariants> & {
    className?: string;
    registration: Partial<UseFormRegisterReturn>;
  };

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, type, label, error, registration, ...props }, ref) => {
    return (
      <FieldWrapper label={label} error={error}>
        <div className="relative">
          <input
            type={type}
            className={cn(
              inputVariants({ variant }),
              error && 'border-error focus-visible:ring-error pr-10',
              className,
            )}
            ref={ref}
            {...registration}
            {...props}
          />
          {error && (
            <LuTriangleAlert
              className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-error"
              aria-hidden="true"
            />
          )}
        </div>
      </FieldWrapper>
    );
  },
);

Input.displayName = 'Input';

export { Input };
