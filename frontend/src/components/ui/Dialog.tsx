'use client';

import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Dialog variants
const dialogVariants = cva(
  'fixed inset-0 z-50 flex items-center justify-center p-4',
  {
    variants: {
      size: {
        sm: '[&_.dialog-content]:max-w-md',
        md: '[&_.dialog-content]:max-w-lg', 
        lg: '[&_.dialog-content]:max-w-2xl',
        xl: '[&_.dialog-content]:max-w-4xl',
        full: '[&_.dialog-content]:max-w-full [&_.dialog-content]:h-full',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

// Types
export interface DialogProps extends VariantProps<typeof dialogVariants> {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
  animated?: boolean;
}

// Dialog Overlay
export const DialogOverlay = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    onClick?: () => void;
  }
>(({ className, onClick, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'fixed inset-0 bg-black/50 backdrop-blur-sm',
      className
    )}
    onClick={onClick}
    {...props}
  />
));
DialogOverlay.displayName = 'DialogOverlay';

// Dialog Content
export const DialogContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'dialog-content relative bg-white rounded-lg shadow-xl border max-h-[90vh] overflow-y-auto',
      'w-full mx-4',
      className
    )}
    {...props}
  >
    {children}
  </div>
));
DialogContent.displayName = 'DialogContent';

// Dialog Header
export const DialogHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6 pb-0', className)}
    {...props}
  />
));
DialogHeader.displayName = 'DialogHeader';

// Dialog Title
export const DialogTitle = forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
DialogTitle.displayName = 'DialogTitle';

// Dialog Description
export const DialogDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-gray-600', className)}
    {...props}
  />
));
DialogDescription.displayName = 'DialogDescription';

// Dialog Body
export const DialogBody = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('p-6', className)}
    {...props}
  />
));
DialogBody.displayName = 'DialogBody';

// Dialog Footer
export const DialogFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-0', className)}
    {...props}
  />
));
DialogFooter.displayName = 'DialogFooter';

// Main Dialog Component
export const Dialog: React.FC<DialogProps> = ({
  open,
  onClose,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
  overlayClassName,
  contentClassName,
  animated = true,
}) => {
  // Handle escape key
  React.useEffect(() => {
    if (!closeOnEscape) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, closeOnEscape, onClose]);

  // Prevent body scroll when dialog is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  if (!open) return null;

  const handleOverlayClick = () => {
    if (closeOnOverlayClick) {
      onClose();
    }
  };

  const dialogContent = (
    <div className={cn(dialogVariants({ size }), className)}>
      <DialogOverlay 
        onClick={handleOverlayClick}
        className={overlayClassName}
      />
      <DialogContent 
        className={contentClassName}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            aria-label="Close dialog"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
        {children}
      </DialogContent>
    </div>
  );

  if (animated) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="contents"
          >
            {dialogContent}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return dialogContent;
};

// Preset Dialog Components
export const AlertDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}> = ({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
}) => (
  <Dialog open={open} onClose={onClose} size="sm">
    <DialogHeader>
      <DialogTitle>{title}</DialogTitle>
      {description && <DialogDescription>{description}</DialogDescription>}
    </DialogHeader>
    <DialogFooter>
      <button
        onClick={onClose}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        {cancelText}
      </button>
      <button
        onClick={() => {
          onConfirm?.();
          onClose();
        }}
        className={cn(
          'px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2',
          variant === 'destructive'
            ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
            : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
        )}
      >
        {confirmText}
      </button>
    </DialogFooter>
  </Dialog>
);

export const SimpleDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: DialogProps['size'];
}> = ({ open, onClose, title, children, size }) => (
  <Dialog open={open} onClose={onClose} size={size}>
    {title && (
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
    )}
    <DialogBody>{children}</DialogBody>
  </Dialog>
);

export default Dialog;
