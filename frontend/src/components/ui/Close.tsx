'use client';

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { XMarkIcon } from '@heroicons/react/24/outline';

// Close variants
const closeVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        xs: 'h-6 w-6',
        sm: 'h-8 w-8',
        default: 'h-9 w-9',
        lg: 'h-10 w-10',
        xl: 'h-12 w-12',
      },
      shape: {
        square: 'rounded-md',
        circle: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'ghost',
      size: 'default',
      shape: 'circle',
    },
  }
);

export interface CloseProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof closeVariants> {
  asChild?: boolean;
  srText?: string;
  icon?: React.ReactNode;
}

export const Close = forwardRef<HTMLButtonElement, CloseProps>(
  ({
    className,
    variant = 'ghost',
    size = 'default',
    shape = 'circle',
    srText = 'Close',
    icon,
    children,
    ...props
  }, ref) => {
    const IconComponent = icon || <XMarkIcon className="h-4 w-4" />;

    return (
      <button
        className={cn(closeVariants({ variant, size, shape }), className)}
        ref={ref}
        type="button"
        aria-label={srText}
        {...props}
      >
        {children || IconComponent}
        <span className="sr-only">{srText}</span>
      </button>
    );
  }
);

Close.displayName = 'Close';

// Close with confirmation
export interface CloseWithConfirmationProps extends CloseProps {
  confirmationTitle?: string;
  confirmationMessage?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  requireConfirmation?: boolean;
}

export const CloseWithConfirmation = forwardRef<HTMLButtonElement, CloseWithConfirmationProps>(
  ({
    confirmationTitle = 'Confirm Close',
    confirmationMessage = 'Are you sure you want to close this?',
    confirmText = 'Close',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    requireConfirmation = true,
    onClick,
    ...props
  }, ref) => {
    const [showConfirmation, setShowConfirmation] = React.useState(false);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (requireConfirmation) {
        setShowConfirmation(true);
      } else {
        onClick?.(event);
        onConfirm?.();
      }
    };

    const handleConfirm = () => {
      setShowConfirmation(false);
      onConfirm?.();
    };

    const handleCancel = () => {
      setShowConfirmation(false);
      onCancel?.();
    };

    return (
      <>
        <Close
          {...props}
          ref={ref}
          onClick={handleClick}
        />
        
        {showConfirmation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="w-full max-w-lg p-6 bg-background border border-border rounded-lg shadow-lg">
              <h2 className="text-lg font-semibold mb-2">{confirmationTitle}</h2>
              <p className="text-sm text-muted-foreground mb-4">{confirmationMessage}</p>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 text-sm border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md"
                  onClick={handleCancel}
                >
                  {cancelText}
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md"
                  onClick={handleConfirm}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
);

CloseWithConfirmation.displayName = 'CloseWithConfirmation';

// Modal close button (positioned absolutely)
export interface ModalCloseProps extends CloseProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const ModalClose = forwardRef<HTMLButtonElement, ModalCloseProps>(
  ({
    position = 'top-right',
    className,
    ...props
  }, ref) => {
    const positionClasses = {
      'top-right': 'absolute top-4 right-4',
      'top-left': 'absolute top-4 left-4',
      'bottom-right': 'absolute bottom-4 right-4',
      'bottom-left': 'absolute bottom-4 left-4',
    };

    return (
      <Close
        {...props}
        ref={ref}
        className={cn(positionClasses[position], className)}
      />
    );
  }
);

ModalClose.displayName = 'ModalClose';

// Toast close button
export interface ToastCloseProps extends CloseProps {
  onDismiss?: () => void;
}

export const ToastClose = forwardRef<HTMLButtonElement, ToastCloseProps>(
  ({
    onDismiss,
    onClick,
    size = 'xs',
    variant = 'ghost',
    className,
    ...props
  }, ref) => {
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      onDismiss?.();
    };

    return (
      <Close
        {...props}
        ref={ref}
        size={size}
        variant={variant}
        onClick={handleClick}
        className={cn('ml-auto flex-shrink-0', className)}
        srText="Dismiss notification"
      />
    );
  }
);

ToastClose.displayName = 'ToastClose';

// Alert close button
export interface AlertCloseProps extends CloseProps {
  onDismiss?: () => void;
}

export const AlertClose = forwardRef<HTMLButtonElement, AlertCloseProps>(
  ({
    onDismiss,
    onClick,
    size = 'sm',
    variant = 'ghost',
    className,
    ...props
  }, ref) => {
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      onDismiss?.();
    };

    return (
      <Close
        {...props}
        ref={ref}
        size={size}
        variant={variant}
        onClick={handleClick}
        className={cn('absolute top-2 right-2', className)}
        srText="Dismiss alert"
      />
    );
  }
);

AlertClose.displayName = 'AlertClose';

// Tag close button
export interface TagCloseProps extends CloseProps {
  onRemove?: () => void;
}

export const TagClose = forwardRef<HTMLButtonElement, TagCloseProps>(
  ({
    onRemove,
    onClick,
    size = 'xs',
    variant = 'ghost',
    className,
    ...props
  }, ref) => {
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onClick?.(event);
      onRemove?.();
    };

    return (
      <Close
        {...props}
        ref={ref}
        size={size}
        variant={variant}
        onClick={handleClick}
        className={cn('ml-1 flex-shrink-0', className)}
        srText="Remove tag"
      />
    );
  }
);

TagClose.displayName = 'TagClose';

// Drawer/Sheet close button
export interface DrawerCloseProps extends CloseProps {
  onClose?: () => void;
}

export const DrawerClose = forwardRef<HTMLButtonElement, DrawerCloseProps>(
  ({
    onClose,
    onClick,
    className,
    ...props
  }, ref) => {
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      onClose?.();
    };

    return (
      <Close
        {...props}
        ref={ref}
        onClick={handleClick}
        className={cn('absolute top-4 right-4 z-10', className)}
        srText="Close drawer"
      />
    );
  }
);

DrawerClose.displayName = 'DrawerClose';

// Closable wrapper component
export interface ClosableProps {
  children: React.ReactNode;
  onClose?: () => void;
  closable?: boolean;
  closeProps?: CloseProps;
  closePosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  className?: string;
}

export const Closable: React.FC<ClosableProps> = ({
  children,
  onClose,
  closable = true,
  closeProps = {},
  closePosition = 'top-right',
  className,
}) => {
  if (!closable) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn('relative', className)}>
      {children}
      <ModalClose
        {...closeProps}
        position={closePosition}
        onClick={onClose}
      />
    </div>
  );
};

Closable.displayName = 'Closable';

export default Close;

