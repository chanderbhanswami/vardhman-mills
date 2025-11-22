'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  BugAntIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  showErrorDetails?: boolean;
  className?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const eventId = this.generateEventId();
    
    this.setState({
      error,
      errorInfo,
      eventId,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught an Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo);

    // In production, you might want to log to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo, eventId);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange, children } = this.props;
    const { hasError } = this.state;

    if (hasError && prevProps.children !== children && resetOnPropsChange) {
      this.resetErrorBoundary();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo, eventId: string) {
    // In a real application, you would send this to your error tracking service
    // Example: Sentry, LogRocket, Bugsnag, etc.
    const errorData = {
      eventId,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Replace this with your actual error reporting service
    console.log('Error logged to service:', errorData);
  }

  private resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    });
  };

  private handleRetry = () => {
    this.resetErrorBoundary();
  };

  private handleReload = () => {
    window.location.reload();
  };

  private copyErrorDetails = () => {
    const { error, errorInfo, eventId } = this.state;
    
    const errorDetails = {
      eventId,
      error: error?.stack || error?.message,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
      .then(() => {
        alert('Error details copied to clipboard');
      })
      .catch(() => {
        console.log('Failed to copy error details');
      });
  };

  render() {
    const { hasError, error, errorInfo, eventId } = this.state;
    const { children, fallback, showErrorDetails = false, className = '' } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <div className={`min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 ${className}`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center"
            >
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl font-semibold text-gray-900 dark:text-white mb-2"
            >
              Oops! Something went wrong
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 dark:text-gray-400 mb-6"
            >
              We&apos;re sorry, but something unexpected happened. Please try again.
            </motion.p>

            {showErrorDetails && error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ delay: 0.5 }}
                className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-left"
              >
                <div className="flex items-center mb-2">
                  <BugAntIcon className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Error Details
                  </span>
                </div>
                
                <div className="text-xs text-gray-600 dark:text-gray-400 font-mono break-all">
                  <strong>Error:</strong> {error.message}
                  <br />
                  {eventId && (
                    <>
                      <strong>Event ID:</strong> {eventId}
                      <br />
                    </>
                  )}
                  <strong>Component:</strong> {errorInfo?.componentStack?.split('\n')[1]?.trim()}
                </div>

                <button
                  onClick={this.copyErrorDetails}
                  className="mt-3 text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                >
                  <InformationCircleIcon className="w-3 h-3 mr-1" />
                  Copy details
                </button>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <motion.button
                onClick={this.handleRetry}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Try Again
              </motion.button>

              <motion.button
                onClick={this.handleReload}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Reload Page
              </motion.button>
            </motion.div>

            {process.env.NODE_ENV === 'development' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg"
              >
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  <strong>Development Mode:</strong> Check the console for detailed error information.
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;