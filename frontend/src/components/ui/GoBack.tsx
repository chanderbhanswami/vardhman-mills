'use client';

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { ChevronLeftIcon, ArrowLeftIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';

// GoBack variants
const goBackVariants = cva(
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
        sm: 'h-8 px-2 text-xs',
        default: 'h-9 px-3 text-sm',
        lg: 'h-10 px-4 text-base',
        xl: 'h-12 px-6 text-lg',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'ghost',
      size: 'default',
    },
  }
);

export interface GoBackProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof goBackVariants> {
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right' | 'only';
  text?: string;
  href?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  animated?: boolean;
  showText?: boolean;
}

export const GoBack = forwardRef<HTMLButtonElement, GoBackProps>(
  ({
    className,
    variant = 'ghost',
    size = 'default',
    icon,
    iconPosition = 'left',
    text = 'Go Back',
    href,
    onClick,
    animated = true,
    showText = true,
    children,
    ...props
  }, ref) => {
    const IconComponent = icon || <ChevronLeftIcon className="h-4 w-4" />;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (onClick) {
        onClick(event);
      } else if (href) {
        window.location.href = href;
      } else {
        window.history.back();
      }
    };

    const buttonContent = () => {
      if (iconPosition === 'only' || !showText) {
        return IconComponent;
      }

      if (iconPosition === 'right') {
        return (
          <>
            {children || text}
            {animated ? (
              <motion.div
                whileHover={{ x: 2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                {IconComponent}
              </motion.div>
            ) : (
              IconComponent
            )}
          </>
        );
      }

      // Default: left position
      return (
        <>
          {animated ? (
            <motion.div
              whileHover={{ x: -2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              {IconComponent}
            </motion.div>
          ) : (
            IconComponent
          )}
          {children || text}
        </>
      );
    };

    return (
      <button
        ref={ref}
        className={cn(
          goBackVariants({ variant, size }),
          animated && 'transition-all duration-200 hover:scale-105 active:scale-95',
          className
        )}
        onClick={handleClick}
        type="button"
        {...props}
      >
        {buttonContent()}
      </button>
    );
  }
);

GoBack.displayName = 'GoBack';

// Browser back button
export const BrowserBack = forwardRef<HTMLButtonElement, Omit<GoBackProps, 'onClick'>>(
  (props, ref) => {
    const handleBack = () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        // Fallback for when there's no history
        window.location.href = '/';
      }
    };

    return (
      <GoBack
        {...props}
        ref={ref}
        onClick={handleBack}
        icon={<ArrowLeftIcon className="h-4 w-4" />}
      />
    );
  }
);

BrowserBack.displayName = 'BrowserBack';

// Router back (for use with Next.js router)
export interface RouterBackProps extends Omit<GoBackProps, 'onClick'> {
  router?: {
    back: () => void;
    push: (href: string) => void;
  };
  fallbackUrl?: string;
}

export const RouterBack = forwardRef<HTMLButtonElement, RouterBackProps>(
  ({ router, fallbackUrl = '/', ...props }, ref) => {
    const handleBack = () => {
      if (router) {
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push(fallbackUrl);
        }
      } else {
        // Fallback to browser back
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = fallbackUrl;
        }
      }
    };

    return (
      <GoBack
        {...props}
        ref={ref}
        onClick={handleBack}
        icon={<ArrowUturnLeftIcon className="h-4 w-4" />}
      />
    );
  }
);

RouterBack.displayName = 'RouterBack';

// Simple back link
export interface BackLinkProps extends Omit<GoBackProps, 'variant'> {
  underline?: boolean;
}

export const BackLink = forwardRef<HTMLButtonElement, BackLinkProps>(
  ({ underline = true, className, ...props }, ref) => {
    return (
      <GoBack
        {...props}
        ref={ref}
        variant="link"
        className={cn(
          underline && 'underline-offset-4 hover:underline',
          className
        )}
      />
    );
  }
);

BackLink.displayName = 'BackLink';

// Breadcrumb back
export interface BreadcrumbBackProps extends GoBackProps {
  breadcrumbs?: Array<{ label: string; href?: string }>;
  separator?: React.ReactNode;
}

export const BreadcrumbBack: React.FC<BreadcrumbBackProps> = ({
  breadcrumbs = [],
  separator = '/',
  className,
  ...props
}) => {
  if (breadcrumbs.length === 0) {
    return <GoBack {...props} className={className} />;
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <GoBack
        {...props}
        iconPosition="only"
        showText={false}
        size="icon"
      />
      
      <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <span className="mx-1">{separator}</span>
            )}
            {crumb.href ? (
              <button
                type="button"
                onClick={() => window.location.href = crumb.href!}
                className="hover:text-foreground transition-colors"
              >
                {crumb.label}
              </button>
            ) : (
              <span className="text-foreground font-medium">
                {crumb.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>
    </div>
  );
};

BreadcrumbBack.displayName = 'BreadcrumbBack';

// Floating back button
export interface FloatingBackProps extends GoBackProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  offset?: string;
}

export const FloatingBack = forwardRef<HTMLButtonElement, FloatingBackProps>(
  ({
    position = 'top-left',
    // offset parameter reserved for future positioning features
    className,
    size = 'icon',
    variant = 'outline',
    ...props
  }, ref) => {
    const positionClasses = {
      'top-left': 'fixed top-4 left-4',
      'top-right': 'fixed top-4 right-4',
      'bottom-left': 'fixed bottom-4 left-4',
      'bottom-right': 'fixed bottom-4 right-4',
    };

    return (
      <GoBack
        {...props}
        ref={ref}
        size={size}
        variant={variant}
        iconPosition="only"
        showText={false}
        className={cn(
          positionClasses[position],
          'z-50 shadow-lg',
          className
        )}
      />
    );
  }
);

FloatingBack.displayName = 'FloatingBack';

// Back button with confirmation
export interface BackWithConfirmationProps extends GoBackProps {
  confirmationTitle?: string;
  confirmationMessage?: string;
  confirmText?: string;
  cancelText?: string;
  requireConfirmation?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const BackWithConfirmation = forwardRef<HTMLButtonElement, BackWithConfirmationProps>(
  ({
    confirmationTitle = 'Confirm Navigation',
    confirmationMessage = 'Are you sure you want to go back? Any unsaved changes will be lost.',
    confirmText = 'Go Back',
    cancelText = 'Cancel',
    requireConfirmation = true,
    onConfirm,
    onCancel,
    onClick: originalOnClick,
    ...props
  }, ref) => {
    const [showConfirmation, setShowConfirmation] = React.useState(false);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (requireConfirmation) {
        setShowConfirmation(true);
      } else {
        originalOnClick?.(event);
      }
    };

    const handleConfirm = () => {
      setShowConfirmation(false);
      onConfirm?.();
      // Trigger default back behavior
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = '/';
      }
    };

    const handleCancel = () => {
      setShowConfirmation(false);
      onCancel?.();
    };

    return (
      <>
        <GoBack
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
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
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

BackWithConfirmation.displayName = 'BackWithConfirmation';

export default GoBack;

