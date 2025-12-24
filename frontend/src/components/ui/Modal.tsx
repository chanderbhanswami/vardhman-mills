'use client';

import React, { forwardRef, useEffect, useCallback, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Modal variants
const modalVariants = cva(
  [
    'relative bg-background rounded-lg shadow-xl border',
    'flex flex-col max-h-[90vh] overflow-hidden'
  ],
  {
    variants: {
      size: {
        xs: 'max-w-xs w-full mx-4',
        sm: 'max-w-sm w-full mx-4',
        default: 'max-w-md w-full mx-4',
        lg: 'max-w-lg w-full mx-4',
        xl: 'max-w-xl w-full mx-4',
        '2xl': 'max-w-2xl w-full mx-4',
        '3xl': 'max-w-3xl w-full mx-4',
        '4xl': 'max-w-4xl w-full mx-4',
        '5xl': 'max-w-5xl w-full mx-4',
        '6xl': 'max-w-6xl w-full mx-4',
        '7xl': 'max-w-7xl w-full mx-4',
        full: 'max-w-full w-full h-full mx-0 my-0 rounded-none'
      },
      position: {
        center: '',
        top: 'mt-20',
        bottom: 'mb-20'
      }
    },
    defaultVariants: {
      size: 'default',
      position: 'center'
    }
  }
);

// Overlay variants
const overlayVariants = cva(
  'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
  {
    variants: {
      blur: {
        none: 'backdrop-blur-none',
        sm: 'backdrop-blur-sm',
        default: 'backdrop-blur-md',
        lg: 'backdrop-blur-lg'
      }
    },
    defaultVariants: {
      blur: 'default'
    }
  }
);

// Base Modal Props
export interface ModalProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof modalVariants> {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  blur?: VariantProps<typeof overlayVariants>['blur'];
  lockScroll?: boolean;
  focusTrap?: boolean;
  initialFocus?: React.RefObject<HTMLElement>;
  restoreFocus?: boolean;
}

// Modal Context
interface ModalContextValue {
  onClose?: () => void;
  modalId: string;
}

const ModalContext = React.createContext<ModalContextValue | null>(null);

export const useModal = () => {
  const context = React.useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a Modal component');
  }
  return context;
};

// Modal Overlay Component
export interface ModalOverlayProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof overlayVariants> {
  onClose?: () => void;
  closeOnClick?: boolean;
}

export const ModalOverlay = forwardRef<HTMLDivElement, ModalOverlayProps>(
  ({ className, blur, onClose, closeOnClick = true, onClick }, ref) => {
    const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      if (closeOnClick && e.target === e.currentTarget) {
        onClose?.();
      }
      onClick?.(e);
    }, [closeOnClick, onClose, onClick]);

    const motionProps = {
      ref,
      className: cn(overlayVariants({ blur }), className),
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      onClick: handleClick,
      role: "presentation" as const
    };

    return <motion.div {...motionProps} />;
  }
);

ModalOverlay.displayName = 'ModalOverlay';

// Modal Content Component
export interface ModalContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof modalVariants> {
  forceMount?: boolean;
}

export const ModalContent = forwardRef<HTMLDivElement, ModalContentProps>(
  ({ className, size, position, children }, ref) => {
    const motionProps = {
      ref,
      className: cn(modalVariants({ size, position }), className),
      initial: { opacity: 0, scale: 0.95, y: 20 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.95, y: 20 },
      transition: {
        type: 'spring' as const,
        duration: 0.3,
        stiffness: 300,
        damping: 30
      },
      role: "dialog" as const,
      "aria-modal": "true" as const
    };

    return (
      <motion.div {...motionProps}>
        {children}
      </motion.div>
    );
  }
);

ModalContent.displayName = 'ModalContent';

// Modal Header Component
export interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  showCloseButton?: boolean;
}

export const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className, children, showCloseButton = true, ...props }, ref) => {
    const { onClose, modalId } = useModal();

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between p-6 border-b border-border',
          className
        )}
        {...props}
      >
        <div className="flex-1 pr-4" id={`${modalId}-title`}>
          {children}
        </div>
        {showCloseButton && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors rounded-sm p-1 hover:bg-muted"
            aria-label="Close modal"
            title="Close modal"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  }
);

ModalHeader.displayName = 'ModalHeader';

// Modal Title Component
export const ModalTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    return (
      <h2
        ref={ref}
        className={cn('text-lg font-semibold text-foreground', className)}
        {...props}
      />
    );
  }
);

ModalTitle.displayName = 'ModalTitle';

// Modal Description Component
export const ModalDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('text-sm text-muted-foreground mt-1', className)}
        {...props}
      />
    );
  }
);

ModalDescription.displayName = 'ModalDescription';

// Modal Body Component
export const ModalBody = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex-1 p-6 overflow-y-auto', className)}
        {...props}
      />
    );
  }
);

ModalBody.displayName = 'ModalBody';

// Modal Footer Component
export const ModalFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-end gap-2 p-6 border-t border-border',
          className
        )}
        {...props}
      />
    );
  }
);

ModalFooter.displayName = 'ModalFooter';

// Main Modal Component
export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({
    open,
    onClose,
    children,
    closeOnOverlayClick = true,
    closeOnEscape = true,
    showCloseButton = false,
    size,
    position,
    blur,
    lockScroll = true,
    focusTrap = true,
    initialFocus,
    restoreFocus = true,
    className,
    ...props
  }, ref) => {
    const modalId = useId();
    const previousActiveElement = React.useRef<Element | null>(null);
    const modalRef = React.useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    // Handle SSR - only render portal after component mounts
    useEffect(() => {
      setMounted(true);
    }, []);

    React.useImperativeHandle(ref, () => modalRef.current!);

    // Handle escape key
    const handleEscape = useCallback((event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape && onClose) {
        event.preventDefault();
        onClose();
      }
    }, [closeOnEscape, onClose]);

    // Handle focus trap
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
      if (!focusTrap || !modalRef.current) return;

      if (event.key === 'Tab') {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      }
    }, [focusTrap]);

    // Lock body scroll
    useEffect(() => {
      if (open && lockScroll) {
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';

        return () => {
          document.body.style.overflow = originalStyle;
        };
      }
    }, [open, lockScroll]);

    // Handle focus management
    useEffect(() => {
      if (open) {
        previousActiveElement.current = document.activeElement;

        // Set initial focus
        setTimeout(() => {
          if (initialFocus?.current) {
            initialFocus.current.focus();
          } else if (modalRef.current) {
            const firstFocusable = modalRef.current.querySelector(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            ) as HTMLElement;
            firstFocusable?.focus();
          }
        }, 0);
      } else if (restoreFocus && previousActiveElement.current) {
        (previousActiveElement.current as HTMLElement).focus();
      }
    }, [open, initialFocus, restoreFocus]);

    // Add event listeners
    useEffect(() => {
      if (open) {
        document.addEventListener('keydown', handleEscape);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
          document.removeEventListener('keydown', handleEscape);
          document.removeEventListener('keydown', handleKeyDown);
        };
      }
    }, [open, handleEscape, handleKeyDown]);

    // Don't render on server or before mount
    if (!mounted) {
      return null;
    }

    const modalContent = (
      <ModalContext.Provider value={{ onClose, modalId }}>
        <AnimatePresence>
          {open && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center">
              <ModalOverlay
                blur={blur}
                onClose={closeOnOverlayClick ? onClose : undefined}
                closeOnClick={closeOnOverlayClick}
              />
              <ModalContent
                ref={modalRef}
                size={size}
                position={position}
                className={className}
                aria-labelledby={`${modalId}-title`}
                aria-describedby={`${modalId}-description`}
                {...props}
              >
                {showCloseButton && (
                  <div className="absolute top-4 right-4 z-10">
                    <button
                      type="button"
                      onClick={onClose}
                      className="text-muted-foreground hover:text-foreground transition-colors rounded-sm p-1 hover:bg-muted"
                      aria-label="Close modal"
                      title="Close modal"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                )}
                {children}
              </ModalContent>
            </div>
          )}
        </AnimatePresence>
      </ModalContext.Provider>
    );

    // Use portal to render at document.body level, escaping any stacking context
    return createPortal(modalContent, document.body);
  }
);

Modal.displayName = 'Modal';

// Preset Modal Components
export interface AlertModalProps extends Omit<ModalProps, 'children'> {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  variant?: 'default' | 'destructive' | 'warning';
}

export const AlertModal = forwardRef<HTMLDivElement, AlertModalProps>(
  ({
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    variant = 'default',
    onClose,
    ...props
  }, ref) => {
    const handleConfirm = useCallback(() => {
      onConfirm?.();
      onClose?.();
    }, [onConfirm, onClose]);

    const handleCancel = useCallback(() => {
      onCancel?.();
      onClose?.();
    }, [onCancel, onClose]);

    const confirmButtonClass = variant === 'destructive'
      ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
      : variant === 'warning'
        ? 'bg-yellow-500 text-white hover:bg-yellow-600'
        : 'bg-primary text-primary-foreground hover:bg-primary/90';

    return (
      <Modal ref={ref} onClose={onClose} {...props}>
        <ModalHeader showCloseButton={false}>
          <ModalTitle>{title}</ModalTitle>
          {description && <ModalDescription>{description}</ModalDescription>}
        </ModalHeader>
        <ModalFooter>
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-muted-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md transition-colors',
              confirmButtonClass
            )}
          >
            {confirmText}
          </button>
        </ModalFooter>
      </Modal>
    );
  }
);

AlertModal.displayName = 'AlertModal';

// Simple Modal with common structure
export interface SimpleModalProps extends Omit<ModalProps, 'children'> {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const SimpleModal = forwardRef<HTMLDivElement, SimpleModalProps>(
  ({ title, description, children, footer, ...props }, ref) => {
    return (
      <Modal ref={ref} {...props}>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          {description && <ModalDescription>{description}</ModalDescription>}
        </ModalHeader>
        <ModalBody>{children}</ModalBody>
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </Modal>
    );
  }
);

SimpleModal.displayName = 'SimpleModal';

export default Modal;
