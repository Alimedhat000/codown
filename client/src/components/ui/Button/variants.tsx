import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors  disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none',
  {
    variants: {
      variant: {
        default:
          'bg-accent focus-visible:ring-1 focus-visible:ring-ring text-primary-foreground shadow hover:bg-accent/90 border border-accent-border',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm  hover:bg-destructive/90 border border-destructive-border',
        outline:
          'border transition-all border-surface-border hover:border-muted-foreground ',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-surface hover:text-accent-foreground',
        link: 'text-primary-foreground underline-offset-4 visited:text-primary hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);
