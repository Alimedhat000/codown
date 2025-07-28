import { cva } from 'class-variance-authority';

export const inputVariants = cva(
  'flex h-10 w-full rounded-md border border-muted-foreground bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus:border-ring  disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: '',
        bordered: 'border border-input rounded-md',
        ghost: 'border-none bg-transparent shadow-none',
        unstyled: 'border-none p-0 shadow-none focus-visible:ring-0',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);
