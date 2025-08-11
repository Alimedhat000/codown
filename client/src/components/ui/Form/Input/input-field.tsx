import { type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { type UseFormRegisterReturn } from 'react-hook-form';
import { LuEye, LuEyeOff, LuTriangleAlert } from 'react-icons/lu';

import { cn } from '@/utils/cn';

import { FieldWrapper, FieldWrapperPassThroughProps } from '../field-wrapper';

import { inputVariants } from './variants';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
  FieldWrapperPassThroughProps &
  VariantProps<typeof inputVariants> & {
    className?: string;
    id?: string;
    registration: Partial<UseFormRegisterReturn>;
  };

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, variant, type, label, id, error, registration, ...props },
    ref,
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    return (
      <FieldWrapper label={label} error={error} id={id}>
        <div className="relative">
          <input
            aria-label={label}
            type={inputType}
            id={id}
            className={cn(
              inputVariants({ variant }),
              error && 'border-error focus-visible:ring-error pr-10',
              isPassword && 'pr-10',
              className,
            )}
            ref={ref}
            {...registration}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground-white"
              tabIndex={-1} // avoid focus trap
            >
              {showPassword ? <LuEyeOff size={16} /> : <LuEye size={16} />}
            </button>
          )}

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
