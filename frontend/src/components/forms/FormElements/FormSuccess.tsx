/**
 * FormSuccess Component
 * 
 * A reusable component for displaying form success messages and positive feedback.
 * Supports multiple display formats, animations, and accessibility features.
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, CheckIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { Alert } from '@/components/ui/Alert';

// Types
export interface FormSuccessProps {
  /** Success message(s) to display */
  message?: string | string[] | null;
  /** Field name for accessibility */
  fieldName?: string;
  /** Success display variant */
  variant?: 'default' | 'inline' | 'alert' | 'minimal' | 'celebration';
  /** Size of the success display */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show an icon */
  showIcon?: boolean;
  /** Custom icon component */
  icon?: React.ComponentType<{ className?: string }>;
  /** Whether to animate the success appearance */
  animated?: boolean;
  /** Maximum number of messages to show */
  maxMessages?: number;
  /** Custom CSS classes */
  className?: string;
  /** Success type */
  type?: 'success' | 'info' | 'confirmation';
  /** Whether to show message count when multiple messages */
  showCount?: boolean;
  /** Callback when success is dismissed (for dismissible variants) */
  onDismiss?: () => void;
  /** Whether the success message is dismissible */
  dismissible?: boolean;
  /** Auto-dismiss timeout in milliseconds */
  autoHideTimeout?: number;
  /** Custom message formatting function */
  formatMessage?: (message: string, index?: number) => React.ReactNode;
  /** Whether to show celebration animation */
  celebration?: boolean;
  /** ARIA properties */
  'aria-live'?: 'polite' | 'assertive' | 'off';
  /** Test ID for testing */
  'data-testid'?: string;
  /** Additional actions to display */
  actions?: React.ReactNode;
}

const FormSuccess: React.FC<FormSuccessProps> = ({
  message,
  fieldName,
  variant = 'default',
  size = 'md',
  showIcon = true,
  icon: CustomIcon,
  animated = true,
  maxMessages = 3,
  className,
  type = 'success',
  showCount = false,
  onDismiss,
  dismissible = false,
  autoHideTimeout,
  formatMessage,
  celebration = false,
  'aria-live': ariaLive = 'polite',
  'data-testid': testId,
  actions,
  ...props
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  // Normalize message to array
  const messages = React.useMemo(() => {
    if (!message) return [];
    if (Array.isArray(message)) return message.filter(Boolean);
    return [message].filter(Boolean);
  }, [message]);

  // Auto-hide functionality
  React.useEffect(() => {
    if (autoHideTimeout && autoHideTimeout > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          onDismiss?.();
        }, 200); // Wait for animation to complete
      }, autoHideTimeout);

      return () => clearTimeout(timer);
    }
  }, [autoHideTimeout, onDismiss]);

  // Don't render if no messages or not visible
  if (messages.length === 0 || !isVisible) return null;

  // Limit messages if maxMessages is set
  const displayMessages = maxMessages ? messages.slice(0, maxMessages) : messages;
  const hasMoreMessages = maxMessages && messages.length > maxMessages;

  // Get appropriate icon
  const getIcon = () => {
    if (CustomIcon) return CustomIcon;
    
    switch (type) {
      case 'info':
        return InformationCircleIcon;
      case 'confirmation':
        return CheckIcon;
      case 'success':
      default:
        return CheckCircleIcon;
    }
  };

  const IconComponent = getIcon();

  // Format message
  const formatMessageText = (messageText: string, index?: number) => {
    if (formatMessage) {
      return formatMessage(messageText, index);
    }
    return messageText;
  };

  // Size classes
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  // Type classes
  const typeClasses = {
    success: 'text-green-600 dark:text-green-400',
    info: 'text-blue-600 dark:text-blue-400',
    confirmation: 'text-emerald-600 dark:text-emerald-400'
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

  // Celebration animation variants
  const celebrationVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: { 
      scale: [0, 1.2, 1], 
      rotate: [0, 10, -10, 0],
      transition: { 
        duration: 0.6, 
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
        times: [0, 0.6, 1]
      }
    },
    exit: { scale: 0, opacity: 0 }
  };

  // Handle dismiss
  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss?.();
    }, 200);
  };

  // Base classes
  const baseClasses = clsx(
    'flex items-start gap-2',
    sizeClasses[size],
    typeClasses[type],
    className
  );

  // Render content
  const renderContent = () => {
    const content = (
      <>
        {showIcon && (
          <motion.div
            className="flex-shrink-0 mt-0.5"
            variants={celebration ? celebrationVariants : undefined}
            initial={celebration ? "initial" : undefined}
            animate={celebration ? "animate" : undefined}
          >
            <IconComponent 
              className={clsx(iconSizeClasses[size])}
              aria-hidden="true"
            />
          </motion.div>
        )}
        <div className="flex-1 min-w-0">
          {displayMessages.length === 1 ? (
            // Single message
            <div className="font-medium">
              {formatMessageText(displayMessages[0], 0)}
            </div>
          ) : (
            // Multiple messages
            <div className="space-y-1">
              {showCount && (
                <div className="font-semibold text-xs uppercase tracking-wide">
                  {messages.length} Success{messages.length !== 1 ? 'es' : ''}
                </div>
              )}
              <ul className="list-disc list-inside space-y-0.5">
                {displayMessages.map((msg, index) => (
                  <li key={index} className="font-medium">
                    {formatMessageText(msg, index)}
                  </li>
                ))}
              </ul>
              {hasMoreMessages && (
                <div className="text-xs opacity-75 font-medium">
                  +{messages.length - maxMessages} more
                </div>
              )}
            </div>
          )}
          {actions && (
            <div className="mt-2">
              {actions}
            </div>
          )}
        </div>
        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            className={clsx(
              'flex-shrink-0 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500',
              'transition-colors duration-200'
            )}
            aria-label="Dismiss success message"
          >
            <CheckIcon className={iconSizeClasses[size]} />
          </button>
        )}
      </>
    );

    // Wrap content based on variant
    switch (variant) {
      case 'alert':
        return (
          <Alert variant="success" className={className}>
            <div className="flex items-start justify-between">
              {content}
            </div>
          </Alert>
        );

      case 'minimal':
        return (
          <div className={clsx('text-green-600 dark:text-green-400', sizeClasses[size], className)}>
            {displayMessages.join(', ')}
          </div>
        );

      case 'celebration':
        return (
          <motion.div 
            className={clsx(
              'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
              'border border-green-200 dark:border-green-700 rounded-lg p-4',
              'shadow-lg',
              baseClasses
            )}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
          >
            {content}
            {/* Confetti effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className={clsx(
                    'absolute w-2 h-2 rounded-full',
                    i % 3 === 0 ? 'bg-green-400' : i % 3 === 1 ? 'bg-emerald-400' : 'bg-yellow-400'
                  )}
                  initial={{ 
                    x: '50%', 
                    y: '50%', 
                    scale: 0,
                    opacity: 1
                  }}
                  animate={{ 
                    x: `${50 + (Math.random() - 0.5) * 200}%`,
                    y: `${50 + (Math.random() - 0.5) * 200}%`,
                    scale: [0, 1, 0],
                    opacity: [1, 1, 0]
                  }}
                  transition={{ 
                    duration: 1.5,
                    delay: i * 0.1,
                    ease: 'easeOut'
                  }}
                />
              ))}
            </div>
          </motion.div>
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
  const successComponent = (
    <div
      role="status"
      {...(ariaLive !== 'off' ? { 'aria-live': ariaLive } : {})}
      aria-labelledby={fieldName ? `${fieldName}-success` : undefined}
      id={fieldName ? `${fieldName}-success` : undefined}
      data-testid={testId}
      {...props}
    >
      {renderContent()}
    </div>
  );

  if (!animated || variant === 'celebration') {
    return successComponent;
  }

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key={`success-${messages.join('-')}`}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={animationVariants}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {successComponent}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Named exports for different variants
export const InlineFormSuccess: React.FC<Omit<FormSuccessProps, 'variant'>> = (props) => (
  <FormSuccess {...props} variant="inline" />
);

export const AlertFormSuccess: React.FC<Omit<FormSuccessProps, 'variant'>> = (props) => (
  <FormSuccess {...props} variant="alert" />
);

export const CelebrationFormSuccess: React.FC<Omit<FormSuccessProps, 'variant'>> = (props) => (
  <FormSuccess {...props} variant="celebration" celebration={true} />
);

export const MinimalFormSuccess: React.FC<Omit<FormSuccessProps, 'variant'>> = (props) => (
  <FormSuccess {...props} variant="minimal" />
);

// Hook for form success state management
export const useFormSuccess = (initialMessage?: string | string[] | null) => {
  const [message, setMessage] = React.useState<string | string[] | null>(initialMessage || null);
  const [isVisible, setIsVisible] = React.useState(false);

  const showSuccess = React.useCallback((newMessage: string | string[] | null, autoHide?: number) => {
    setMessage(newMessage);
    setIsVisible(true);
    
    if (autoHide && autoHide > 0) {
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => setMessage(null), 200);
      }, autoHide);
    }
  }, []);

  const hideSuccess = React.useCallback(() => {
    setIsVisible(false);
    setTimeout(() => setMessage(null), 200);
  }, []);

  const clearSuccess = React.useCallback(() => {
    setMessage(null);
    setIsVisible(false);
  }, []);

  return {
    message: isVisible ? message : null,
    showSuccess,
    hideSuccess,
    clearSuccess,
    hasSuccess: Boolean(message),
    isVisible
  };
};

export default FormSuccess;
