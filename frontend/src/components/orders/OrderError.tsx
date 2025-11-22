'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  XCircleIcon,
  WifiIcon,
  ServerIcon,
  ShieldExclamationIcon,
  ClockIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

interface OrderErrorProps {
  error: Error | string | null;
  errorCode?: string;
  variant?: 'network' | 'server' | 'auth' | 'timeout' | 'notfound' | 'generic';
  title?: string;
  message?: string;
  showDetails?: boolean;
  showRetry?: boolean;
  showSupport?: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

interface ErrorType {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  defaultTitle: string;
  defaultMessage: string;
  suggestions: string[];
}

const errorTypes: Record<string, ErrorType> = {
  network: {
    icon: WifiIcon,
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-100',
    defaultTitle: 'Network Connection Error',
    defaultMessage: 'Unable to connect to the server. Please check your internet connection and try again.',
    suggestions: [
      'Check your internet connection',
      'Disable VPN if enabled',
      'Try refreshing the page',
      'Clear browser cache',
    ],
  },
  server: {
    icon: ServerIcon,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100',
    defaultTitle: 'Server Error',
    defaultMessage: 'Our servers are experiencing issues. Please try again in a few moments.',
    suggestions: [
      'Wait a few moments and retry',
      'Check our status page',
      'Contact support if issue persists',
    ],
  },
  auth: {
    icon: ShieldExclamationIcon,
    iconColor: 'text-yellow-600',
    iconBg: 'bg-yellow-100',
    defaultTitle: 'Authentication Error',
    defaultMessage: 'Your session has expired or you don\'t have permission to view this order.',
    suggestions: [
      'Sign in again to continue',
      'Verify you have the correct permissions',
      'Contact support for account issues',
    ],
  },
  timeout: {
    icon: ClockIcon,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
    defaultTitle: 'Request Timeout',
    defaultMessage: 'The request took too long to complete. Please try again.',
    suggestions: [
      'Check your internet speed',
      'Try again with a stable connection',
      'Contact support if issue continues',
    ],
  },
  notfound: {
    icon: XCircleIcon,
    iconColor: 'text-gray-600',
    iconBg: 'bg-gray-100',
    defaultTitle: 'Order Not Found',
    defaultMessage: 'The order you\'re looking for doesn\'t exist or has been removed.',
    suggestions: [
      'Verify the order number',
      'Check your order history',
      'Contact support for help',
    ],
  },
  generic: {
    icon: ExclamationTriangleIcon,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100',
    defaultTitle: 'Something Went Wrong',
    defaultMessage: 'An unexpected error occurred. Please try again or contact support.',
    suggestions: [
      'Refresh the page and try again',
      'Clear browser cache and cookies',
      'Try a different browser',
      'Contact support if issue persists',
    ],
  },
};

export const OrderError: React.FC<OrderErrorProps> = ({
  error,
  errorCode,
  variant = 'generic',
  title,
  message,
  showDetails = false,
  showRetry = true,
  showSupport = true,
  onRetry,
  onDismiss,
  className,
}) => {
  const router = useRouter();
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const errorType = errorTypes[variant];
  const Icon = errorType.icon;

  // Extract error message
  const errorMessage = error instanceof Error ? error.message : error;
  const errorStack = error instanceof Error ? error.stack : null;

  // Copy error details to clipboard
  const handleCopyError = async () => {
    const errorDetails = `
Error Type: ${variant}
Error Code: ${errorCode || 'N/A'}
Message: ${errorMessage || 'Unknown error'}
${errorStack ? `Stack: ${errorStack}` : ''}
Timestamp: ${new Date().toISOString()}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorDetails);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy error details:', err);
    }
  };

  // Navigate to support
  const handleContactSupport = () => {
    const supportUrl = `/help/contact?error=${encodeURIComponent(errorMessage || 'Unknown error')}&code=${errorCode || ''}`;
    router.push(supportUrl);
  };

  // Navigate to help docs
  const handleViewDocs = () => {
    router.push('/help/orders');
  };

  return (
    <Card className={cn('p-6 sm:p-8 relative overflow-hidden', className)}>
      {/* Dismiss Button */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Dismiss error"
        >
          <XCircleIcon className="h-5 w-5 text-gray-400" />
        </button>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className={cn(
              'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center',
              errorType.iconBg
            )}
          >
            <Icon className={cn('h-6 w-6', errorType.iconColor)} />
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-xl font-semibold text-gray-900">
                {title || errorType.defaultTitle}
              </h3>
              {errorCode && (
                <Badge variant="secondary" className="flex-shrink-0">
                  Error {errorCode}
                </Badge>
              )}
            </div>
            <p className="text-base text-gray-600 leading-relaxed">
              {message || errorMessage || errorType.defaultMessage}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mb-6">
          {showRetry && onRetry && (
            <Button
              variant="default"
              size="lg"
              onClick={onRetry}
              leftIcon={<ArrowPathIcon className="h-5 w-5" />}
            >
              Try Again
            </Button>
          )}

          {showSupport && (
            <>
              <Button
                variant="secondary"
                size="lg"
                onClick={handleContactSupport}
                leftIcon={<ChatBubbleLeftRightIcon className="h-5 w-5" />}
              >
                Contact Support
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={handleViewDocs}
                leftIcon={<DocumentTextIcon className="h-5 w-5" />}
              >
                View Help Docs
              </Button>
            </>
          )}
        </div>

        {/* Suggestions */}
        {errorType.suggestions.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h4 className="text-sm font-semibold text-blue-900 mb-3">
              Try these suggestions:
            </h4>
            <div className="space-y-2">
              {errorType.suggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-2 text-sm text-blue-800"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                  <span>{suggestion}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Error Details */}
        {(showDetails || errorStack) && (
          <div className="border-t pt-6">
            <button
              onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors mb-3"
            >
              {isDetailsExpanded ? (
                <ChevronUpIcon className="h-4 w-4" />
              ) : (
                <ChevronDownIcon className="h-4 w-4" />
              )}
              Technical Details
            </button>

            <AnimatePresence>
              {isDetailsExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    {/* Error Type */}
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Error Type</p>
                      <p className="text-sm text-gray-900 font-mono">{variant}</p>
                    </div>

                    {/* Error Code */}
                    {errorCode && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Error Code</p>
                        <p className="text-sm text-gray-900 font-mono">{errorCode}</p>
                      </div>
                    )}

                    {/* Error Message */}
                    {errorMessage && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Message</p>
                        <p className="text-sm text-gray-900 font-mono break-words">
                          {errorMessage}
                        </p>
                      </div>
                    )}

                    {/* Stack Trace */}
                    {errorStack && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Stack Trace</p>
                        <pre className="text-xs text-gray-700 font-mono overflow-x-auto whitespace-pre-wrap break-words bg-white p-3 rounded border border-gray-200 max-h-40 overflow-y-auto">
                          {errorStack}
                        </pre>
                      </div>
                    )}

                    {/* Timestamp */}
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Timestamp</p>
                      <p className="text-sm text-gray-900 font-mono">
                        {new Date().toISOString()}
                      </p>
                    </div>

                    {/* Copy Button */}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleCopyError}
                      className="w-full"
                    >
                      {isCopied ? 'Copied!' : 'Copy Error Details'}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Additional Help */}
        <div className="mt-6 pt-6 border-t text-center">
          <p className="text-sm text-gray-600">
            If this error persists, please{' '}
            <button
              onClick={handleContactSupport}
              className="text-blue-600 hover:text-blue-700 font-medium underline"
            >
              contact our support team
            </button>
            {' '}with the error details above.
          </p>
        </div>
      </motion.div>
    </Card>
  );
};

export default OrderError;
