'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export interface ErrorMessageProps {
  message: string;
  title?: string;
  type?: 'error' | 'warning' | 'info' | 'success';
  variant?: 'default' | 'minimal' | 'bordered' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  dismissible?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
  className?: string;
  onDismiss?: () => void;
  onRetry?: () => void;
  actions?: React.ReactNode;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  type = 'error',
  variant = 'default',
  size = 'md',
  showIcon = true,
  dismissible = false,
  autoHide = false,
  autoHideDelay = 5000,
  className = '',
  onDismiss,
  actions,
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  const handleDismiss = React.useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss?.();
    }, 300); // Wait for exit animation
  }, [onDismiss]);

  React.useEffect(() => {
    if (autoHide && autoHideDelay > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDelay, handleDismiss]);

  const getIcon = () => {
    const iconClass = sizeClasses[size].icon;
    
    switch (type) {
      case 'error':
        return <ExclamationCircleIcon className={`${iconClass} text-red-500`} />;
      case 'warning':
        return <ExclamationTriangleIcon className={`${iconClass} text-yellow-500`} />;
      case 'info':
        return <InformationCircleIcon className={`${iconClass} text-blue-500`} />;
      case 'success':
        return <CheckCircleIcon className={`${iconClass} text-green-500`} />;
      default:
        return <ExclamationCircleIcon className={`${iconClass} text-red-500`} />;
    }
  };

  const sizeClasses = {
    sm: {
      container: 'p-3 text-sm',
      icon: 'w-4 h-4',
      dismiss: 'w-4 h-4',
    },
    md: {
      container: 'p-4 text-base',
      icon: 'w-5 h-5',
      dismiss: 'w-5 h-5',
    },
    lg: {
      container: 'p-5 text-lg',
      icon: 'w-6 h-6',
      dismiss: 'w-6 h-6',
    },
  };

  const typeClasses = {
    error: {
      default: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
      minimal: 'text-red-600 dark:text-red-400',
      bordered: 'border-red-300 text-red-700 dark:border-red-600 dark:text-red-300',
      filled: 'bg-red-500 text-white',
    },
    warning: {
      default: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
      minimal: 'text-yellow-600 dark:text-yellow-400',
      bordered: 'border-yellow-300 text-yellow-700 dark:border-yellow-600 dark:text-yellow-300',
      filled: 'bg-yellow-500 text-white',
    },
    info: {
      default: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
      minimal: 'text-blue-600 dark:text-blue-400',
      bordered: 'border-blue-300 text-blue-700 dark:border-blue-600 dark:text-blue-300',
      filled: 'bg-blue-500 text-white',
    },
    success: {
      default: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
      minimal: 'text-green-600 dark:text-green-400',
      bordered: 'border-green-300 text-green-700 dark:border-green-600 dark:text-green-300',
      filled: 'bg-green-500 text-white',
    },
  };

  const variantClasses = {
    default: 'border rounded-lg',
    minimal: '',
    bordered: 'border-2 rounded-lg bg-transparent',
    filled: 'rounded-lg',
  };

  const messageVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: -10,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut' as const,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: {
        duration: 0.2,
        ease: 'easeIn' as const,
      },
    },
  };

  const progressVariants = {
    initial: { scaleX: 1 },
    animate: {
      scaleX: 0,
      transition: {
        duration: autoHideDelay / 1000,
        ease: 'linear' as const,
      },
    },
  };

  const containerClasses = `
    ${sizeClasses[size].container}
    ${variantClasses[variant]}
    ${typeClasses[type][variant]}
    flex items-start space-x-3
    ${className}
  `;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={messageVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={containerClasses}
          role="alert"
          aria-live="polite"
        >
          {showIcon && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring' as const, stiffness: 200 }}
              className="flex-shrink-0 mt-0.5"
            >
              {getIcon()}
            </motion.div>
          )}
          
          <div className="flex-1 min-w-0">
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="font-medium leading-relaxed"
            >
              {message}
            </motion.p>
            
            {actions && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-3"
              >
                {actions}
              </motion.div>
            )}
          </div>
          
          {dismissible && (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              onClick={handleDismiss}
              className={`
                flex-shrink-0 ml-2 mt-0.5
                ${variant === 'filled' ? 'text-white hover:text-gray-200' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'}
                transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
                rounded-md p-1
              `}
              aria-label="Dismiss message"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <XMarkIcon className={sizeClasses[size].dismiss} />
            </motion.button>
          )}
          
          {/* Auto-hide progress bar */}
          {autoHide && autoHideDelay > 0 && (
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-current opacity-20 rounded-b-lg"
              variants={progressVariants}
              initial="initial"
              animate="animate"
              style={{ transformOrigin: 'left' }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorMessage;