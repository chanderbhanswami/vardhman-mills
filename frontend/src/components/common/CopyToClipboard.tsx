'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardIcon,
  CheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export interface CopyToClipboardProps {
  text: string;
  children?: React.ReactNode;
  className?: string;
  variant?: 'button' | 'icon' | 'text' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  successMessage?: string;
  errorMessage?: string;
  timeout?: number;
  onCopy?: (text: string, success: boolean) => void;
}

type CopyState = 'idle' | 'copying' | 'success' | 'error';

const CopyToClipboard: React.FC<CopyToClipboardProps> = ({
  text,
  children,
  className = '',
  variant = 'button',
  size = 'md',
  showText = true,
  successMessage = 'Copied!',
  errorMessage = 'Failed to copy',
  timeout = 2000,
  onCopy,
}) => {
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [showTooltip, setShowTooltip] = useState(false);

  const copyToClipboard = useCallback(async () => {
    if (!text) return;

    setCopyState('copying');

    try {
      // Modern Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        setCopyState('success');
        onCopy?.(text, true);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          setCopyState('success');
          onCopy?.(text, true);
        } else {
          throw new Error('Copy command failed');
        }
      }
    } catch (error) {
      console.error('Failed to copy text:', error);
      setCopyState('error');
      onCopy?.(text, false);
    }

    // Reset state after timeout
    setTimeout(() => {
      setCopyState('idle');
    }, timeout);
  }, [text, timeout, onCopy]);

  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-2',
    lg: 'text-lg px-4 py-3',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const getIcon = () => {
    switch (copyState) {
      case 'success':
        return <CheckIcon className={`${iconSizeClasses[size]} text-green-500`} />;
      case 'error':
        return <ExclamationTriangleIcon className={`${iconSizeClasses[size]} text-red-500`} />;
      default:
        return <ClipboardIcon className={iconSizeClasses[size]} />;
    }
  };

  const getButtonText = () => {
    switch (copyState) {
      case 'copying':
        return 'Copying...';
      case 'success':
        return successMessage;
      case 'error':
        return errorMessage;
      default:
        return 'Copy';
    }
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
    success: {
      scale: [1, 1.1, 1],
      transition: { duration: 0.3 }
    },
  };

  const tooltipVariants = {
    hidden: {
      opacity: 0,
      y: 10,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,
      },
    },
  };

  const renderButton = () => {
    const baseClasses = `
      inline-flex items-center justify-center gap-2
      transition-all duration-200 ease-in-out
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
      disabled:opacity-50 disabled:cursor-not-allowed
      ${className}
    `;

    const variantClasses = {
      button: `
        ${sizeClasses[size]}
        bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600
        text-gray-700 dark:text-gray-300
        border border-gray-300 dark:border-gray-600
        rounded-lg font-medium
      `,
      icon: `
        p-2 rounded-lg
        text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200
        hover:bg-gray-100 dark:hover:bg-gray-700
      `,
      text: `
        ${sizeClasses[size]}
        text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300
        hover:underline font-medium
      `,
      minimal: `
        p-1 rounded
        text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300
      `,
    };

    return (
      <motion.button
        variants={buttonVariants}
        initial="idle"
        whileHover="hover"
        whileTap="tap"
        animate={copyState === 'success' ? 'success' : 'idle'}
        onClick={copyToClipboard}
        disabled={copyState === 'copying'}
        className={`${baseClasses} ${variantClasses[variant]}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label={`Copy ${text} to clipboard`}
        title={`Copy to clipboard`}
      >
        {getIcon()}
        
        {(variant === 'button' || variant === 'text') && showText && (
          <span className={copyState === 'copying' ? 'animate-pulse' : ''}>
            {getButtonText()}
          </span>
        )}
        
        {/* Loading spinner for copying state */}
        {copyState === 'copying' && (
          <motion.div
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </motion.button>
    );
  };

  return (
    <div className="relative inline-block">
      {children ? (
        <div
          onClick={copyToClipboard}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              copyToClipboard();
            }
          }}
          aria-label={`Copy ${text} to clipboard`}
        >
          {children}
        </div>
      ) : (
        renderButton()
      )}

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && copyState === 'idle' && (variant === 'icon' || variant === 'minimal') && (
          <motion.div
            variants={tooltipVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 dark:bg-gray-700 rounded-md whitespace-nowrap z-50 pointer-events-none"
          >
            Copy to clipboard
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success/Error Toast */}
      <AnimatePresence>
        {(copyState === 'success' || copyState === 'error') && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`
              absolute top-full left-1/2 transform -translate-x-1/2 mt-2
              px-3 py-2 text-sm font-medium rounded-lg shadow-lg z-50
              ${copyState === 'success'
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-red-100 text-red-800 border border-red-200'
              }
            `}
          >
            <div className="flex items-center gap-2">
              {copyState === 'success' ? (
                <CheckIcon className="w-4 h-4" />
              ) : (
                <ExclamationTriangleIcon className="w-4 h-4" />
              )}
              {copyState === 'success' ? successMessage : errorMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CopyToClipboard;