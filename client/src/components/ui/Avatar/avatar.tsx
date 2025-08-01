import * as AvatarPrimitive from '@radix-ui/react-avatar';
import * as React from 'react';

import { cn } from '@/utils/cn';

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      'relative flex select-none focus:outline-none focus:ring-0 h-10 w-10 shrink-0 overflow-hidden rounded-full',
      className,
    )}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image> & {
    delayMS?: number;
  }
>(({ className, delayMS = 1500, ...props }, ref) => {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, delayMS); // Stop loading after 1.5s no matter what

    return () => clearTimeout(timeout);
  }, [delayMS]);

  return (
    <>
      <AvatarPrimitive.Image
        ref={ref}
        className={cn(
          'h-full w-full select-none focus:outline-none focus:ring-0 rounded-full object-cover transition-opacity duration-500',
          isLoading ? 'opacity-0' : 'opacity-100',
          className,
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
        {...props}
      />
    </>
  );
});
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'flex h-full w-full items-center select-none focus:outline-none focus:ring-0 justify-center rounded-full bg-secondary text-sm mt-[1px]',
      className,
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };
