import * as Dialog from '@radix-ui/react-dialog';
import { ReactNode, ComponentProps } from 'react';
import { LuX as XIcon } from 'react-icons/lu';

import { cn } from '@/utils/cn';

// Base Modal Context Provider
type ModalContextProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
};

function Modal({ open, onOpenChange, children }: ModalContextProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog.Root>
  );
}

// Modal Trigger
type ModalTriggerProps = ComponentProps<typeof Dialog.Trigger> & {
  children: ReactNode;
  className?: string;
};

function ModalTrigger({ children, className, ...props }: ModalTriggerProps) {
  return (
    <Dialog.Trigger asChild className={className} {...props}>
      {children}
    </Dialog.Trigger>
  );
}

// Modal Portal (optional wrapper)
type ModalPortalProps = {
  children: ReactNode;
  container?: HTMLElement;
};

function ModalPortal({ children, container }: ModalPortalProps) {
  return <Dialog.Portal container={container}>{children}</Dialog.Portal>;
}

// Modal Overlay
type ModalOverlayProps = ComponentProps<typeof Dialog.Overlay> & {
  className?: string;
};

function ModalOverlay({ className, ...props }: ModalOverlayProps) {
  return (
    <Dialog.Overlay
      className={cn(
        'fixed inset-0 bg-black/50 backdrop-blur-sm z-100',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className,
      )}
      {...props}
    />
  );
}

// Modal Content
type ModalContentProps = ComponentProps<typeof Dialog.Content> & {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  position?:
    | 'center'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right';
  slideFrom?:
    | 'center'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right';
  animationType?: 'slide' | 'zoom' | 'fade' | 'none';
  children: ReactNode;
};

function ModalContent({
  className,
  size = 'md',
  position = 'center',
  slideFrom,
  animationType = 'slide',
  children,
  ...props
}: ModalContentProps) {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4',
  };

  const positionClasses = {
    center: 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
    top: 'left-1/2 top-4 -translate-x-1/2',
    bottom: 'left-1/2 bottom-4 -translate-x-1/2',
    left: 'left-4 top-1/2 -translate-y-1/2',
    right: 'right-4 top-1/2 -translate-y-1/2',
    'top-left': 'left-4 top-4',
    'top-right': 'right-4 top-4',
    'bottom-left': 'left-4 bottom-4',
    'bottom-right': 'right-4 bottom-4',
  };

  const slideDirection = slideFrom || position;

  const getAnimationClasses = () => {
    const baseClasses =
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0';

    if (animationType === 'none') return '';
    if (animationType === 'fade') return baseClasses;

    const slideClasses = {
      center:
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
      top: 'data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
      bottom:
        'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
      left: 'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
      right:
        'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
      'top-left':
        'data-[state=closed]:slide-out-to-top data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-top data-[state=open]:slide-in-from-left',
      'top-right':
        'data-[state=closed]:slide-out-to-top data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-top data-[state=open]:slide-in-from-right',
      'bottom-left':
        'data-[state=closed]:slide-out-to-bottom data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-bottom data-[state=open]:slide-in-from-left',
      'bottom-right':
        'data-[state=closed]:slide-out-to-bottom data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-bottom data-[state=open]:slide-in-from-right',
    };

    if (animationType === 'zoom') {
      return `${baseClasses} data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95`;
    }

    return `${baseClasses} ${slideClasses[slideDirection]}`;
  };

  return (
    <Dialog.Content
      className={cn(
        'fixed z-110 w-full',
        sizeClasses[size],
        positionClasses[position],
        'rounded-xl bg-white dark:bg-surface shadow-lg border border-surface-border',
        getAnimationClasses(),
        'duration-200',
        className,
      )}
      {...props}
    >
      {children}
    </Dialog.Content>
  );
}

// Modal Header
type ModalHeaderProps = {
  className?: string;
  children: ReactNode;
};

function ModalHeader({ className, children }: ModalHeaderProps) {
  return (
    <div
      className={cn('flex items-center justify-between p-6 pb-0', className)}
    >
      {children}
    </div>
  );
}

// Modal Title
type ModalTitleProps = ComponentProps<typeof Dialog.Title> & {
  className?: string;
  children: ReactNode;
};

function ModalTitle({ className, children, ...props }: ModalTitleProps) {
  return (
    <Dialog.Title
      className={cn(
        'text-lg font-semibold leading-none tracking-tight',
        className,
      )}
      {...props}
    >
      {children}
    </Dialog.Title>
  );
}

// Modal Description
type ModalDescriptionProps = ComponentProps<typeof Dialog.Description> & {
  className?: string;
  children: ReactNode;
};

function ModalDescription({
  className,
  children,
  ...props
}: ModalDescriptionProps) {
  return (
    <Dialog.Description
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    >
      {children}
    </Dialog.Description>
  );
}

// Modal Body
type ModalBodyProps = {
  className?: string;
  children: ReactNode;
};

function ModalBody({ className, children }: ModalBodyProps) {
  return <div className={cn('p-6', className)}>{children}</div>;
}

// Modal Footer
type ModalFooterProps = {
  className?: string;
  children: ReactNode;
};

function ModalFooter({ className, children }: ModalFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-end space-x-2 p-6 pt-0',
        className,
      )}
    >
      {children}
    </div>
  );
}

// Modal Close Button
type ModalCloseProps = ComponentProps<typeof Dialog.Close> & {
  className?: string;
  children?: ReactNode;
  showIcon?: boolean;
};

function ModalClose({
  className,
  children,
  showIcon = true,
  ...props
}: ModalCloseProps) {
  return (
    <Dialog.Close asChild {...props}>
      {children || (
        <button
          className={cn(
            'absolute right-4 top-4 rounded-sm opacity-70',
            'ring-offset-background transition-opacity',
            'hover:opacity-100 focus:outline-none',
            'disabled:pointer-events-none',
            className,
          )}
        >
          {showIcon && <XIcon className="h-4 w-4" />}
          <span className="sr-only">Close</span>
        </button>
      )}
    </Dialog.Close>
  );
}

// Convenience compound component with sensible defaults
type SimpleModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  position?:
    | 'center'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right';
  slideFrom?:
    | 'center'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right';
  animationType?: 'slide' | 'zoom' | 'fade' | 'none';
  showClose?: boolean;
  overlayClassName?: string;
  contentClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
};

function SimpleModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = 'md',
  position = 'top',
  slideFrom = 'top',
  animationType = 'slide',
  showClose = true,
  overlayClassName,
  contentClassName,
  headerClassName,
  bodyClassName,
}: SimpleModalProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalPortal>
        <ModalOverlay
          className={overlayClassName}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        />
        <ModalContent
          size={size}
          position={position}
          slideFrom={slideFrom}
          animationType={animationType}
          className={contentClassName}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          {(title || description || showClose) && (
            <ModalHeader className={headerClassName}>
              <div>
                {title && <ModalTitle>{title}</ModalTitle>}
                {description && (
                  <ModalDescription>{description}</ModalDescription>
                )}
              </div>
              {showClose && <ModalClose />}
            </ModalHeader>
          )}
          <ModalBody className={bodyClassName}>{children}</ModalBody>
        </ModalContent>
      </ModalPortal>
    </Modal>
  );
}

// Export all components
export {
  Modal,
  ModalTrigger,
  ModalPortal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  ModalClose,
  SimpleModal,
};
