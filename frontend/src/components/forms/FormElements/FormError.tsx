/**
 * FormError Component
 * 
 * A reusable component for displaying form validation errors and error messages.
 * Supports multiple error display formats, animations, and accessibility features.
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExclamationTriangleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { Alert } from '@/components/ui/Alert';

// Types
export interface FormErrorProps {
  /** Error message(s) to display */
  error?: string | string[] | null;
  /** Field name for accessibility */
  fieldName?: string;
  /** Error display variant */
  variant?: 'default' | 'inline' | 'tooltip' | 'alert' | 'minimal';
  /** Size of the error display */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show an icon */
  showIcon?: boolean;
  /** Custom icon component */
  icon?: React.ComponentType<{ className?: string }>;
  /** Whether to animate the error appearance */
  animated?: boolean;
  /** Maximum number of errors to show */
  maxErrors?: number;
  /** Custom CSS classes */
  className?: string;
  /** Error severity level */
  severity?: 'error' | 'warning' | 'info';
  /** Whether to show error count when multiple errors */
  showCount?: boolean;
  /** Callback when error is dismissed (for dismissible variants) */
  onDismiss?: () => void;
  /** Whether the error is dismissible */
  dismissible?: boolean;
  /** Custom error formatting function */
  formatError?: (error: string, index?: number) => React.ReactNode;
  /** Position for tooltip variant */
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  /** Whether to truncate long error messages */
  truncate?: boolean;
  /** Maximum length for truncated messages */
  truncateLength?: number;
  /** ARIA properties */
  'aria-live'?: 'polite' | 'assertive' | 'off';
  /** Test ID for testing */
  'data-testid'?: string;
}

const FormError: React.FC<FormErrorProps> = ({
  error,
  fieldName,
  variant = 'default',
  size = 'md',
  showIcon = true,
  icon: CustomIcon,
  animated = true,
  maxErrors = 3,
  className,
  severity = 'error',
  showCount = false,
  onDismiss,
  dismissible = false,
  formatError,
  tooltipPosition = 'bottom',
  truncate = false,
  truncateLength = 100,
  'aria-live': ariaLive = 'polite',
  'data-testid': testId,
  ...props
}) => {
  // Normalize error to array
  const errors = React.useMemo(() => {
    if (!error) return [];
    if (Array.isArray(error)) return error.filter(Boolean);
    return [error].filter(Boolean);
  }, [error]);

  // Don't render if no errors
  if (errors.length === 0) return null;

  // Limit errors if maxErrors is set
  const displayErrors = maxErrors ? errors.slice(0, maxErrors) : errors;
  const hasMoreErrors = maxErrors && errors.length > maxErrors;

  // Get appropriate icon
  const getIcon = () => {
    if (CustomIcon) return CustomIcon;
    
    switch (severity) {
      case 'warning':
        return ExclamationTriangleIcon;
      case 'info':
        return InformationCircleIcon;
      case 'error':
      default:
        return XCircleIcon;
    }
  };

  const IconComponent = getIcon();

  // Format error message
  const formatErrorMessage = (errorText: string, index?: number) => {
    if (formatError) {
      return formatError(errorText, index);
    }

    if (truncate && errorText.length > truncateLength) {
      return (
        <span title={errorText}>
          {errorText.substring(0, truncateLength)}...
        </span>
      );
    }

    return errorText;
  };

  // Size classes
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  // Severity classes
  const severityClasses = {
    error: 'text-red-600 dark:text-red-400',
    warning: 'text-amber-600 dark:text-amber-400',
    info: 'text-blue-600 dark:text-blue-400'
  };

  // Icon size classes
  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  // Animation variants
  const animationVariants = {
    initial: { opacity: 0, y: -10, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.95 }
  };

  // Base classes
  const baseClasses = clsx(
    'flex items-start gap-2',
    sizeClasses[size],
    severityClasses[severity],
    className
  );

  // Render based on variant
  const renderContent = () => {
    const content = (
      <>
        {showIcon && (
          <IconComponent 
            className={clsx(
              'flex-shrink-0 mt-0.5',
              iconSizeClasses[size]
            )}
            aria-hidden="true"
          />
        )}
        <div className="flex-1 min-w-0">
          {displayErrors.length === 1 ? (
            // Single error
            <div className="font-medium">
              {formatErrorMessage(displayErrors[0], 0)}
            </div>
          ) : (
            // Multiple errors
            <div className="space-y-1">
              {showCount && (
                <div className="font-semibold text-xs uppercase tracking-wide">
                  {errors.length} Error{errors.length !== 1 ? 's' : ''}
                </div>
              )}
              <ul className="list-disc list-inside space-y-0.5">
                {displayErrors.map((err, index) => (
                  <li key={index} className="font-medium">
                    {formatErrorMessage(err, index)}
                  </li>
                ))}
              </ul>
              {hasMoreErrors && (
                <div className="text-xs opacity-75 font-medium">
                  +{errors.length - maxErrors} more error{errors.length - maxErrors !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          )}
        </div>
        {dismissible && onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className={clsx(
              'flex-shrink-0 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500',
              'transition-colors duration-200'
            )}
            aria-label="Dismiss error"
          >
            <XCircleIcon className={iconSizeClasses[size]} />
          </button>
        )}
      </>
    );

    // Wrap content based on variant
    switch (variant) {
      case 'alert':
        return (
          <Alert 
            variant={severity === 'error' ? 'destructive' : severity} 
            className={className}
          >
            <div className="flex items-start justify-between">
              {content}
              {dismissible && onDismiss && (
                <button
                  type="button"
                  onClick={onDismiss}
                  className="ml-2 flex-shrink-0 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5"
                  aria-label="Dismiss error"
                >
                  <XCircleIcon className={iconSizeClasses[size]} />
                </button>
              )}
            </div>
          </Alert>
        );

      case 'minimal':
        return (
          <div className={clsx('text-red-600 dark:text-red-400', sizeClasses[size], className)}>
            {displayErrors.join(', ')}
          </div>
        );

      case 'tooltip':
        return (
          <div className={clsx(
            'absolute z-50 px-3 py-2 bg-red-600 text-white rounded-md shadow-lg',
            'max-w-xs break-words',
            sizeClasses[size],
            {
              'bottom-full mb-2': tooltipPosition === 'top',
              'top-full mt-2': tooltipPosition === 'bottom',
              'right-full mr-2': tooltipPosition === 'left',
              'left-full ml-2': tooltipPosition === 'right',
            },
            className
          )}>
            <div className="flex items-start gap-2">
              {content}
            </div>
            {/* Tooltip arrow */}
            <div className={clsx(
              'absolute w-2 h-2 bg-red-600 transform rotate-45',
              {
                'top-full -mt-1 left-1/2 -translate-x-1/2': tooltipPosition === 'top',
                'bottom-full -mb-1 left-1/2 -translate-x-1/2': tooltipPosition === 'bottom',
                'top-1/2 -translate-y-1/2 left-full -ml-1': tooltipPosition === 'left',
                'top-1/2 -translate-y-1/2 right-full -mr-1': tooltipPosition === 'right',
              }
            )} />
          </div>
        );

      case 'inline':
        return (
          <span className={clsx(baseClasses, 'inline-flex')}>
            {content}
          </span>
        );

      case 'default':
      default:
        return (
          <div className={baseClasses}>
            {content}
          </div>
        );
    }
  };

  // Render with or without animation
  const errorComponent = (
    <div
      role="alert"
      {...(ariaLive !== 'off' ? { 'aria-live': ariaLive } : {})}
      aria-labelledby={fieldName ? `${fieldName}-error` : undefined}
      id={fieldName ? `${fieldName}-error` : undefined}
      data-testid={testId}
      {...props}
    >
      {renderContent()}
    </div>
  );

  if (!animated) {
    return errorComponent;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`error-${errors.join('-')}`}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={animationVariants}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {errorComponent}
      </motion.div>
    </AnimatePresence>
  );
};

// Named exports for different variants
export const InlineFormError: React.FC<Omit<FormErrorProps, 'variant'>> = (props) => (
  <FormError {...props} variant="inline" />
);

export const AlertFormError: React.FC<Omit<FormErrorProps, 'variant'>> = (props) => (
  <FormError {...props} variant="alert" />
);

export const TooltipFormError: React.FC<Omit<FormErrorProps, 'variant'>> = (props) => (
  <FormError {...props} variant="tooltip" />
);

export const MinimalFormError: React.FC<Omit<FormErrorProps, 'variant'>> = (props) => (
  <FormError {...props} variant="minimal" />
);

// Hook for form error state management
export const useFormError = (initialError?: string | string[] | null) => {
  const [error, setError] = React.useState<string | string[] | null>(initialError || null);
  const [isVisible, setIsVisible] = React.useState(false);

  const showError = React.useCallback((newError: string | string[] | null) => {
    setError(newError);
    setIsVisible(true);
  }, []);

  const hideError = React.useCallback(() => {
    setIsVisible(false);
    // Clear error after animation
    setTimeout(() => setError(null), 200);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
    setIsVisible(false);
  }, []);

  return {
    error: isVisible ? error : null,
    showError,
    hideError,
    clearError,
    hasError: Boolean(error),
    isVisible
  };
};

export default FormError;
