'use client';

import React, { forwardRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  XCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Alert variants using class-variance-authority
const alertVariants = cva(
  'relative w-full rounded-lg border p-4 flex items-start gap-3 transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-primary-50 border-primary-200 text-primary-900',
        destructive: 'bg-red-50 border-red-200 text-red-900',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
        success: 'bg-green-50 border-green-200 text-green-900',
        info: 'bg-primary-50 border-primary-200 text-primary-900',
      },
      size: {
        sm: 'p-3 text-sm',
        md: 'p-4 text-base',
        lg: 'p-5 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const iconVariants = cva('flex-shrink-0', {
  variants: {
    size: {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

// Types
export interface AlertProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  description?: string | React.ReactNode;
  icon?: React.ReactNode | boolean;
  closable?: boolean;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
  animated?: boolean;
  showProgress?: boolean;
}

// Icon mapping
const iconMap = {
  default: InformationCircleIcon,
  destructive: XCircleIcon,
  warning: ExclamationTriangleIcon,
  success: CheckCircleIcon,
  info: InformationCircleIcon,
};

const iconColorMap = {
  default: 'text-primary-500',
  destructive: 'text-red-500',
  warning: 'text-yellow-500',
  success: 'text-green-500',
  info: 'text-primary-500',
};

// Alert Title Component
export const AlertTitle = forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h4
    ref={ref}
    className={cn('font-semibold leading-none tracking-tight mb-1', className)}
    {...props}
  >
    {children}
  </h4>
));
AlertTitle.displayName = 'AlertTitle';

// Alert Description Component
export const AlertDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm leading-relaxed opacity-90', className)}
    {...props}
  >
    {children}
  </p>
));
AlertDescription.displayName = 'AlertDescription';

// Progress Bar Component for auto-close
const ProgressBar: React.FC<{ 
  duration: number; 
  variant: 'default' | 'destructive' | 'warning' | 'success' | 'info';
}> = ({ duration, variant }) => {
  const progressColorMap = {
    default: 'bg-primary-400',
    destructive: 'bg-red-400',
    warning: 'bg-yellow-400',
    success: 'bg-green-400',
    info: 'bg-primary-400',
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 overflow-hidden">
      <motion.div
        className={cn('h-full', progressColorMap[variant])}
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
      />
    </div>
  );
};

// Main Alert Component
export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      title,
      description,
      icon = true,
      closable = false,
      onClose,
      autoClose = false,
      autoCloseDelay = 5000,
      animated = true,
      showProgress = false,
      children,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = useCallback(() => {
      if (animated) {
        setIsClosing(true);
        setTimeout(() => {
          setIsVisible(false);
          onClose?.();
        }, 200);
      } else {
        setIsVisible(false);
        onClose?.();
      }
    }, [animated, onClose]);

    // Auto close functionality
    useEffect(() => {
      if (autoClose && autoCloseDelay > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoCloseDelay);

        return () => clearTimeout(timer);
      }
    }, [autoClose, autoCloseDelay, handleClose]);

    if (!isVisible) return null;

    // Determine icon to display
    let IconComponent: React.ReactNode = null;
    
    if (icon === true && variant) {
      const IconClass = iconMap[variant];
      IconComponent = (
        <IconClass 
          className={cn(
            iconVariants({ size }),
            iconColorMap[variant]
          )} 
        />
      );
    } else if (React.isValidElement(icon)) {
      const iconElement = icon as React.ReactElement<{ className?: string }>;
      IconComponent = React.cloneElement(iconElement, {
        className: cn(
          iconVariants({ size }),
          iconElement.props?.className
        ),
      });
    }

    const alertContent = (
      <div
        ref={ref}
        role="alert"
        aria-live="polite"
        className={cn(
          alertVariants({ variant, size }),
          isClosing && animated && 'opacity-0 scale-95',
          className
        )}
        {...props}
      >
        {/* Icon */}
        {IconComponent}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <AlertTitle>{title}</AlertTitle>
          )}
          
          {description && (
            <AlertDescription>
              {description}
            </AlertDescription>
          )}
          
          {children && !description && (
            <div className="text-sm leading-relaxed opacity-90">
              {children}
            </div>
          )}
          
          {children && description && (
            <div className="mt-2">
              {children}
            </div>
          )}
        </div>

        {/* Close Button */}
        {closable && (
          <button
            type="button"
            onClick={handleClose}
            className={cn(
              'flex-shrink-0 rounded-md p-1 transition-colors',
              'hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2',
              variant === 'destructive' && 'focus:ring-red-500',
              variant === 'warning' && 'focus:ring-yellow-500',
              variant === 'success' && 'focus:ring-green-500',
              (variant === 'default' || variant === 'info') && 'focus:ring-blue-500'
            )}
            aria-label="Close alert"
          >
            <XMarkIcon className={cn(iconVariants({ size }), 'opacity-60')} />
          </button>
        )}

        {/* Progress Bar for auto-close */}
        {autoClose && showProgress && variant && (
          <ProgressBar duration={autoCloseDelay} variant={variant} />
        )}
      </div>
    );

    if (animated) {
      return (
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {alertContent}
          </motion.div>
        </AnimatePresence>
      );
    }

    return alertContent;
  }
);

Alert.displayName = 'Alert';

// Preset alert types for convenience
export const AlertSuccess: React.FC<Omit<AlertProps, 'variant'>> = (props) => (
  <Alert variant="success" {...props} />
);

export const AlertError: React.FC<Omit<AlertProps, 'variant'>> = (props) => (
  <Alert variant="destructive" {...props} />
);

export const AlertWarning: React.FC<Omit<AlertProps, 'variant'>> = (props) => (
  <Alert variant="warning" {...props} />
);

export const AlertInfo: React.FC<Omit<AlertProps, 'variant'>> = (props) => (
  <Alert variant="info" {...props} />
);

// Toast-style alerts that can be stacked
export interface ToastAlertProps extends AlertProps {
  id?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export const ToastAlert: React.FC<ToastAlertProps> = ({
  position = 'top-right',
  className,
  ...props
}) => {
  const positionClasses = {
    'top-right': 'fixed top-4 right-4 z-50',
    'top-left': 'fixed top-4 left-4 z-50',
    'bottom-right': 'fixed bottom-4 right-4 z-50',
    'bottom-left': 'fixed bottom-4 left-4 z-50',
    'top-center': 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50',
    'bottom-center': 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50',
  };

  return (
    <div className={positionClasses[position]}>
      <Alert
        className={cn('max-w-md shadow-lg', className)}
        closable
        autoClose
        showProgress
        {...props}
      />
    </div>
  );
};

// Default export
export default Alert;
