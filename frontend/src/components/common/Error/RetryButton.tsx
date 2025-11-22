'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowPathIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export interface RetryButtonProps {
  onRetry: () => Promise<void> | void;
  className?: string;
  variant?: 'default' | 'minimal' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  showIcon?: boolean;
  children?: React.ReactNode;
  maxRetries?: number;
  retryDelay?: number;
  autoRetry?: boolean;
  onMaxRetriesReached?: () => void;
  loadingText?: string;
  successText?: string;
  errorText?: string;
}

type RetryState = 'idle' | 'loading' | 'success' | 'error';

const RetryButton: React.FC<RetryButtonProps> = ({
  onRetry,
  className = '',
  variant = 'default',
  size = 'md',
  disabled = false,
  showIcon = true,
  children = 'Retry',
  maxRetries = 3,
  retryDelay = 1000,
  autoRetry = false,
  onMaxRetriesReached,
  loadingText = 'Retrying...',
  successText = 'Success!',
  errorText = 'Retry failed',
}) => {
  const [state, setState] = useState<RetryState>('idle');
  const [retryCount, setRetryCount] = useState(0);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleRetry = async () => {
    if (disabled || state === 'loading' || retryCount >= maxRetries) {
      return;
    }

    setState('loading');
    setRetryCount(prev => prev + 1);

    try {
      await onRetry();
      setState('success');
      
      // Reset to idle after showing success
      setTimeout(() => {
        setState('idle');
        setRetryCount(0);
      }, 2000);
    } catch (error) {
      console.error('Retry failed:', error);
      setState('error');
      
      if (retryCount + 1 >= maxRetries) {
        onMaxRetriesReached?.();
        setTimeout(() => setState('idle'), 3000);
      } else if (autoRetry) {
        // Auto retry after delay
        const timeout = setTimeout(() => {
          setState('idle');
          handleRetry();
        }, retryDelay);
        setTimeoutId(timeout);
      } else {
        // Manual retry - reset to idle after delay
        setTimeout(() => setState('idle'), 2000);
      }
    }
  };

  React.useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const variantClasses = {
    default: {
      idle: 'bg-blue-600 hover:bg-blue-700 text-white',
      loading: 'bg-blue-600 text-white',
      success: 'bg-green-600 text-white',
      error: 'bg-red-600 text-white',
    },
    minimal: {
      idle: 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300',
      loading: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    },
    outline: {
      idle: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20',
      loading: 'border-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400',
      success: 'border-2 border-green-600 text-green-600 dark:border-green-400 dark:text-green-400',
      error: 'border-2 border-red-600 text-red-600 dark:border-red-400 dark:text-red-400',
    },
    ghost: {
      idle: 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20',
      loading: 'text-blue-600 dark:text-blue-400',
      success: 'text-green-600 dark:text-green-400',
      error: 'text-red-600 dark:text-red-400',
    },
  };

  const getIcon = () => {
    const iconClass = `${iconSizeClasses[size]} ${showIcon ? 'mr-2' : ''}`;
    
    switch (state) {
      case 'loading':
        return (
          <motion.div
            className={`${iconClass} border-2 border-current border-t-transparent rounded-full`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        );
      case 'success':
        return <CheckCircleIcon className={iconClass} />;
      case 'error':
        return <ExclamationCircleIcon className={iconClass} />;
      default:
        return (
          <motion.div
            animate={state === 'idle' ? { rotate: [0, 360] } : {}}
            transition={{ duration: 0.5 }}
          >
            <ArrowPathIcon className={iconClass} />
          </motion.div>
        );
    }
  };

  const getText = () => {
    switch (state) {
      case 'loading':
        return loadingText;
      case 'success':
        return successText;
      case 'error':
        return retryCount >= maxRetries ? 'Max retries reached' : errorText;
      default:
        return children;
    }
  };

  const isDisabled = disabled || state === 'loading' || (state === 'error' && retryCount >= maxRetries);

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
    loading: {
      scale: [1, 1.02, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
    success: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 0.3,
      },
    },
    error: {
      x: [-2, 2, -2, 0],
      transition: {
        duration: 0.4,
      },
    },
  };

  return (
    <motion.button
      onClick={handleRetry}
      disabled={isDisabled}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant][state]}
        inline-flex items-center justify-center
        font-medium rounded-lg
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        disabled:opacity-50 disabled:cursor-not-allowed
        relative overflow-hidden
        ${className}
      `}
      variants={buttonVariants}
      animate={state}
      whileHover={!isDisabled ? 'hover' : undefined}
      whileTap={!isDisabled ? 'tap' : undefined}
      aria-label={`Retry action (attempt ${retryCount + 1} of ${maxRetries})`}
    >
      {showIcon && getIcon()}
      
      <span className={`${state === 'loading' ? 'animate-pulse' : ''}`}>
        {getText()}
      </span>
      
      {retryCount > 0 && retryCount < maxRetries && (
        <span className="ml-2 text-xs opacity-75">
          ({retryCount}/{maxRetries})
        </span>
      )}
      
      {/* Progress indicator for auto retry */}
      {autoRetry && state === 'error' && retryCount < maxRetries && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-current opacity-30"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: retryDelay / 1000, ease: 'linear' }}
        />
      )}
      
      {/* Ripple effect on success */}
      {state === 'success' && (
        <motion.div
          className="absolute inset-0 bg-white rounded-lg"
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      )}
    </motion.button>
  );
};

export default RetryButton;