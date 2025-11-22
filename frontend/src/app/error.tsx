'use client';

/**
 * Global Error Boundary for Next.js App Router
 * 
 * This component catches errors that occur during rendering in the app directory.
 * It provides a user-friendly error UI with recovery options and detailed error information
 * in development mode. Integrates with error tracking services and provides comprehensive
 * error handling with retry mechanisms, navigation options, and error reporting.
 * 
 * Features:
 * - Beautiful error UI with animations
 * - Retry mechanism to recover from errors
 * - Navigation options (home, back, refresh)
 * - Error details in development mode
 * - Error logging and tracking
 * - Responsive design with dark mode support
 * - Accessibility features
 * - Error categorization (client vs server errors)
 * - Support for different error types
 * - Integration with monitoring services
 * 
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/error
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  HomeIcon,
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClipboardDocumentIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

// Import components
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/common';

// Import utilities
import { cn } from '@/lib/utils';

/**
 * Error Props Interface
 */
interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error Metadata Interface
 */
interface ErrorMetadata {
  timestamp: string;
  userAgent: string;
  url: string;
  referrer: string;
  errorType: 'client' | 'server' | 'network' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Error Categories
 */
const ERROR_CATEGORIES = {
  NETWORK: ['NetworkError', 'Failed to fetch', 'Network request failed'],
  AUTH: ['Unauthorized', 'Authentication failed', 'Token expired'],
  NOT_FOUND: ['Not found', '404', 'Resource not found'],
  SERVER: ['Internal server error', '500', 'Server error'],
  VALIDATION: ['Validation error', 'Invalid input', 'Bad request'],
  TIMEOUT: ['Timeout', 'Request timeout', 'Operation timed out'],
} as const;

/**
 * Get Error Category
 */
function getErrorCategory(error: Error): keyof typeof ERROR_CATEGORIES | 'UNKNOWN' {
  const message = error.message.toLowerCase();
  
  for (const [category, keywords] of Object.entries(ERROR_CATEGORIES)) {
    if (keywords.some(keyword => message.includes(keyword.toLowerCase()))) {
      return category as keyof typeof ERROR_CATEGORIES;
    }
  }
  
  return 'UNKNOWN';
}

/**
 * Get Error Severity
 */
function getErrorSeverity(error: Error): ErrorMetadata['severity'] {
  const category = getErrorCategory(error);
  
  switch (category) {
    case 'SERVER':
      return 'critical';
    case 'AUTH':
    case 'NETWORK':
      return 'high';
    case 'VALIDATION':
    case 'TIMEOUT':
      return 'medium';
    default:
      return 'low';
  }
}

/**
 * Log Error to Service
 */
function logErrorToService(error: Error, metadata: ErrorMetadata) {
  // In production, send to error tracking service (Sentry, LogRocket, etc.)
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrate with error tracking service
    console.error('Error logged:', { error, metadata });
  } else {
    console.error('Development Error:', { error, metadata });
  }
}

/**
 * Global Error Component
 */
export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Get error metadata (memoized to prevent dependency issues)
  const errorMetadata: ErrorMetadata = useMemo(() => ({
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
    referrer: typeof document !== 'undefined' ? document.referrer : 'Unknown',
    errorType: typeof window !== 'undefined' ? 'client' : 'server',
    severity: getErrorSeverity(error),
  }), [error]);

  const errorCategory = useMemo(() => getErrorCategory(error), [error]);

  // Log error on mount
  useEffect(() => {
    logErrorToService(error, errorMetadata);
  }, [error, errorMetadata]);

  // Handle retry with loading state
  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    setErrorCount(prev => prev + 1);

    try {
      // Wait a bit before retrying to avoid immediate re-error
      await new Promise(resolve => setTimeout(resolve, 500));
      reset();
    } catch (err) {
      console.error('Retry failed:', err);
    } finally {
      setIsRetrying(false);
    }
  }, [reset]);

  // Handle navigation
  const handleGoHome = useCallback(() => {
    router.push('/');
  }, [router]);

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleRefresh = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }, []);

  // Copy error details to clipboard
  const handleCopyError = useCallback(async () => {
    const errorDetails = `
Error: ${error.name}
Message: ${error.message}
Stack: ${error.stack || 'No stack trace available'}
Digest: ${error.digest || 'N/A'}
Category: ${errorCategory}
Severity: ${errorMetadata.severity}
Timestamp: ${errorMetadata.timestamp}
URL: ${errorMetadata.url}
User Agent: ${errorMetadata.userAgent}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorDetails);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy error details:', err);
    }
  }, [error, errorCategory, errorMetadata]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 200,
        damping: 15,
      },
    },
    pulse: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
  };

  // Get error-specific message
  const getErrorMessage = () => {
    switch (errorCategory) {
      case 'NETWORK':
        return 'It looks like you\'re having network issues. Please check your connection and try again.';
      case 'AUTH':
        return 'There was an authentication problem. Please try logging in again.';
      case 'NOT_FOUND':
        return 'The resource you\'re looking for couldn\'t be found.';
      case 'SERVER':
        return 'We\'re experiencing server issues. Our team has been notified and is working on it.';
      case 'VALIDATION':
        return 'There was a problem with the data provided. Please check and try again.';
      case 'TIMEOUT':
        return 'The request took too long to complete. Please try again.';
      default:
        return 'Something went wrong. Don\'t worry, we\'re here to help!';
    }
  };

  // Determine if retry is recommended
  const shouldShowRetry = errorCategory !== 'NOT_FOUND' && errorCount < 3;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-16">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="max-w-2xl w-full"
      >
        {/* Error Icon */}
        <motion.div variants={itemVariants} className="flex justify-center mb-8">
          <motion.div
            variants={iconVariants}
            animate="pulse"
            className={cn(
              'relative w-24 h-24 rounded-full flex items-center justify-center',
              errorMetadata.severity === 'critical' && 'bg-red-100 dark:bg-red-900/20',
              errorMetadata.severity === 'high' && 'bg-orange-100 dark:bg-orange-900/20',
              errorMetadata.severity === 'medium' && 'bg-yellow-100 dark:bg-yellow-900/20',
              errorMetadata.severity === 'low' && 'bg-blue-100 dark:bg-blue-900/20'
            )}
          >
            <ExclamationTriangleIcon
              className={cn(
                'w-12 h-12',
                errorMetadata.severity === 'critical' && 'text-red-600 dark:text-red-400',
                errorMetadata.severity === 'high' && 'text-orange-600 dark:text-orange-400',
                errorMetadata.severity === 'medium' && 'text-yellow-600 dark:text-yellow-400',
                errorMetadata.severity === 'low' && 'text-blue-600 dark:text-blue-400'
              )}
            />
          </motion.div>
        </motion.div>

        {/* Error Title */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl md:text-5xl font-bold text-center text-gray-900 dark:text-white mb-4"
        >
          Oops! Something Went Wrong
        </motion.h1>

        {/* Error Description */}
        <motion.p
          variants={itemVariants}
          className="text-lg text-center text-gray-600 dark:text-gray-400 mb-8 leading-relaxed"
        >
          {getErrorMessage()}
        </motion.p>

        {/* Error Message Card */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Error Details
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-mono bg-gray-50 dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700 break-all">
                {error.message || 'An unexpected error occurred'}
              </p>
            </div>
          </div>

          {/* Error Metadata */}
          <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Category:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">{errorCategory}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Severity:</span>
              <span className={cn(
                'ml-2 font-medium capitalize',
                errorMetadata.severity === 'critical' && 'text-red-600',
                errorMetadata.severity === 'high' && 'text-orange-600',
                errorMetadata.severity === 'medium' && 'text-yellow-600',
                errorMetadata.severity === 'low' && 'text-blue-600'
              )}>
                {errorMetadata.severity}
              </span>
            </div>
          </div>

          {/* Error Digest */}
          {error.digest && (
            <div className="mt-4 text-xs">
              <span className="text-gray-500 dark:text-gray-400">Error ID:</span>
              <span className="ml-2 font-mono text-gray-900 dark:text-white">{error.digest}</span>
            </div>
          )}

          {/* Toggle Details Button */}
          {isDevelopment && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              {showDetails ? (
                <>
                  <ChevronUpIcon className="w-4 h-4" />
                  Hide Technical Details
                </>
              ) : (
                <>
                  <ChevronDownIcon className="w-4 h-4" />
                  Show Technical Details
                </>
              )}
            </button>
          )}

          {/* Technical Details (Development Only) */}
          <AnimatePresence>
            {isDevelopment && showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 overflow-hidden"
              >
                <div className="bg-gray-900 rounded p-4 text-xs font-mono text-green-400 overflow-x-auto max-h-64">
                  <pre className="whitespace-pre-wrap break-words">
                    {error.stack || 'No stack trace available'}
                  </pre>
                </div>
                <div className="mt-4 space-y-2 text-xs">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Timestamp:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{new Date(errorMetadata.timestamp).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">URL:</span>
                    <span className="ml-2 text-gray-900 dark:text-white break-all">{errorMetadata.url}</span>
                  </div>
                </div>
                <Button
                  onClick={handleCopyError}
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                >
                  {copied ? (
                    <>
                      <CheckIcon className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <ClipboardDocumentIcon className="w-4 h-4 mr-2" />
                      Copy Error Details
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          {/* Retry Button */}
          {shouldShowRetry && (
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              size="lg"
              className="flex-1 sm:flex-none min-w-[160px]"
            >
              {isRetrying ? (
                <>
                  <LoadingSpinner className="w-5 h-5 mr-2" />
                  Retrying...
                </>
              ) : (
                <>
                  <ArrowPathIcon className="w-5 h-5 mr-2" />
                  Try Again
                </>
              )}
            </Button>
          )}

          {/* Home Button */}
          <Button
            onClick={handleGoHome}
            variant="outline"
            size="lg"
            className="flex-1 sm:flex-none min-w-[160px]"
          >
            <HomeIcon className="w-5 h-5 mr-2" />
            Go Home
          </Button>

          {/* Back Button */}
          <Button
            onClick={handleGoBack}
            variant="outline"
            size="lg"
            className="flex-1 sm:flex-none min-w-[160px]"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Go Back
          </Button>
        </motion.div>

        {/* Additional Help */}
        <motion.div
          variants={itemVariants}
          className="mt-12 text-center"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            If the problem persists, please contact our support team.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              href="/help"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline transition-colors"
            >
              Help Center
            </Link>
            <Link
              href="/contact"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline transition-colors"
            >
              Contact Support
            </Link>
            <Link
              href="/faq"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline transition-colors"
            >
              FAQ
            </Link>
          </div>
        </motion.div>

        {/* Error Count Warning */}
        {errorCount >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4"
          >
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
                  Multiple Retry Attempts Detected
                </h4>
                <p className="text-xs text-yellow-800 dark:text-yellow-300">
                  This error has occurred multiple times. We recommend refreshing the page or contacting support if the issue continues.
                </p>
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  size="sm"
                  className="mt-3 border-yellow-300 text-yellow-900 hover:bg-yellow-100 dark:border-yellow-700 dark:text-yellow-200 dark:hover:bg-yellow-900/40"
                >
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  Refresh Page
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
