import React from 'react';
import {
  LuCircleAlert as AlertIcon,
  LuCircleCheck as CheckIcon,
  LuInfo as InfoIcon,
  LuX as X,
} from 'react-icons/lu';

import { cn } from '@/utils/cn';

interface AlertProps {
  variant?: 'error' | 'success' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

const alertVariants = {
  error: 'border-red-200 bg-red-50 text-red-800',
  success: 'border-green-200 bg-green-50 text-green-800',
  warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
};

const iconVariants = {
  error: AlertIcon,
  success: CheckIcon,
  warning: AlertIcon,
  info: InfoIcon,
};

const iconColors = {
  error: 'text-red-500',
  success: 'text-green-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
};

export function Alert({
  variant = 'info',
  title,
  children,
  onDismiss,
  className,
}: AlertProps) {
  const Icon = iconVariants[variant];

  return (
    <div
      className={cn(
        'relative rounded-md border p-4',
        alertVariants[variant],
        className,
      )}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={cn('h-5 w-5', iconColors[variant])} />
        </div>
        <div className="ml-3 flex-1">
          {title && <h3 className="text-sm font-medium mb-1">{title}</h3>}
          <div className="text-sm">{children}</div>
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className={cn(
                  'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                  variant === 'error' &&
                    'text-red-500 hover:bg-red-100 focus:ring-red-600',
                  variant === 'success' &&
                    'text-green-500 hover:bg-green-100 focus:ring-green-600',
                  variant === 'warning' &&
                    'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600',
                  variant === 'info' &&
                    'text-blue-500 hover:bg-blue-100 focus:ring-blue-600',
                )}
                onClick={onDismiss}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
