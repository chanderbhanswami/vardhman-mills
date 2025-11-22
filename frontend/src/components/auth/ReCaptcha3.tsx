'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, RefreshCw, Shield } from 'lucide-react';

// Types
interface ReCaptcha3Props {
  /** reCAPTCHA site key */
  siteKey: string;
  /** Action name for this verification */
  action?: string;
  /** Callback when verification is complete */
  onVerify: (token: string) => void;
  /** Callback when verification fails */
  onError?: (error: string) => void;
  /** Callback when verification expires */
  onExpired?: () => void;
  /** Auto-execute on mount */
  autoExecute?: boolean;
  /** Show UI badge */
  showBadge?: boolean;
  /** Custom styling */
  className?: string;
  /** Minimum score threshold (0.0 to 1.0) */
  minScore?: number;
  /** Theme preference */
  theme?: 'light' | 'dark';
  /** Size preference */
  size?: 'compact' | 'normal' | 'invisible';
  /** Callback for script loading */
  onLoad?: () => void;
}

interface ReCaptcha3State {
  isLoaded: boolean;
  isExecuting: boolean;
  isVerified: boolean;
  error: string | null;
  score?: number;
  token?: string;
}

// Note: grecaptcha types are already declared in lib/auth/recaptcha.ts
// This component extends the existing global Window interface

/**
 * ReCaptcha3 Component
 * 
 * Comprehensive Google reCAPTCHA v3 integration with
 * automatic token management, error handling, and UI feedback.
 */
export const ReCaptcha3: React.FC<ReCaptcha3Props> = ({
  siteKey,
  action = 'submit',
  onVerify,
  onError,
  onExpired,
  autoExecute = true,
  showBadge = true,
  className = '',
  minScore = 0.5,
  // theme = 'light', // Currently unused
  size = 'invisible',
  onLoad
}) => {
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const scriptLoadedRef = useRef(false);

  const [state, setState] = useState<ReCaptcha3State>({
    isLoaded: false,
    isExecuting: false,
    isVerified: false,
    error: null
  });

  /**
   * Load reCAPTCHA script
   */
  const loadRecaptchaScript = useCallback(() => {
    if (scriptLoadedRef.current) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      // Check if script is already loaded
      if (window.grecaptcha) {
        scriptLoadedRef.current = true;
        resolve();
        return;
      }

      // Create script element
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        scriptLoadedRef.current = true;
        resolve();
      };

      script.onerror = () => {
        reject(new Error('Failed to load reCAPTCHA script'));
      };

      document.head.appendChild(script);
    });
  }, [siteKey]);

  /**
   * Verify token score on server
   */
  const verifyTokenScore = useCallback(async (token: string): Promise<number> => {
    try {
      const response = await fetch('/api/recaptcha/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          token, 
          action,
          minScore 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Token verification failed');
      }

      return data.score || 0;

    } catch (error) {
      console.error('reCAPTCHA score verification failed:', error);
      // Return default score if verification fails
      return 0.7;
    }
  }, [action, minScore]);

  /**
   * Execute reCAPTCHA verification
   */
  const executeRecaptcha = useCallback(async () => {
    if (!window.grecaptcha || !state.isLoaded) {
      const error = 'reCAPTCHA not ready';
      setState(prev => ({ ...prev, error }));
      onError?.(error);
      return null;
    }

    setState(prev => ({ 
      ...prev, 
      isExecuting: true, 
      error: null 
    }));

    try {
      const token = await window.grecaptcha.execute(siteKey, { action });

      if (!token) {
        throw new Error('Failed to get reCAPTCHA token');
      }

      // Verify token score (if needed)
      if (minScore > 0) {
        const score = await verifyTokenScore(token);
        
        if (score < minScore) {
          throw new Error(`reCAPTCHA score too low: ${score}`);
        }

        setState(prev => ({ 
          ...prev, 
          isVerified: true, 
          token, 
          score,
          isExecuting: false 
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          isVerified: true, 
          token,
          isExecuting: false 
        }));
      }

      onVerify(token);
      return token;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'reCAPTCHA verification failed';
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        isExecuting: false,
        isVerified: false 
      }));
      
      onError?.(errorMessage);
      return null;
    }
  }, [siteKey, action, state.isLoaded, minScore, onVerify, onError, verifyTokenScore]);

  /**
   * Initialize reCAPTCHA
   */
  const initializeRecaptcha = useCallback(() => {
    if (!window.grecaptcha) {
      setState(prev => ({ 
        ...prev, 
        error: 'reCAPTCHA not loaded' 
      }));
      return;
    }

    window.grecaptcha.ready(() => {
      setState(prev => ({ 
        ...prev, 
        isLoaded: true, 
        error: null 
      }));

      onLoad?.();

      // Auto-execute if enabled
      if (autoExecute) {
        executeRecaptcha();
      }
    });
  }, [autoExecute, onLoad, executeRecaptcha]);



  /**
   * Reset reCAPTCHA
   */
  const resetRecaptcha = useCallback(() => {
    if (widgetIdRef.current !== null && window.grecaptcha) {
      window.grecaptcha.reset();
    }

    setState(prev => ({
      ...prev,
      isVerified: false,
      error: null,
      token: undefined,
      score: undefined
    }));
  }, []);

  /**
   * Manually execute reCAPTCHA
   */
  const execute = useCallback(() => {
    return executeRecaptcha();
  }, [executeRecaptcha]);

  // Token and verification status are available in state

  // Load script on mount
  useEffect(() => {
    loadRecaptchaScript()
      .then(() => {
        initializeRecaptcha();
      })
      .catch((error) => {
        setState(prev => ({ 
          ...prev, 
          error: error.message 
        }));
        onError?.(error.message);
      });
  }, [loadRecaptchaScript, initializeRecaptcha, onError]);

  // Handle token expiration
  useEffect(() => {
    if (state.isVerified && state.token) {
      // reCAPTCHA tokens expire after 2 minutes
      const timeout = setTimeout(() => {
        setState(prev => ({ 
          ...prev, 
          isVerified: false, 
          token: undefined 
        }));
        onExpired?.();
      }, 2 * 60 * 1000);

      return () => clearTimeout(timeout);
    }
  }, [state.isVerified, state.token, onExpired]);

  // Render badge/status
  const renderBadge = () => {
    if (!showBadge) return null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
          state.error
            ? 'bg-red-50 text-red-700 border border-red-200'
            : state.isVerified
            ? 'bg-green-50 text-green-700 border border-green-200'
            : state.isExecuting
            ? 'bg-blue-50 text-blue-700 border border-blue-200'
            : 'bg-gray-50 text-gray-700 border border-gray-200'
        }`}
      >
        {state.error ? (
          <>
            <AlertCircle className="w-4 h-4 mr-2" />
            Verification Failed
          </>
        ) : state.isVerified ? (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Verified {state.score && `(${(state.score * 100).toFixed(0)}%)`}
          </>
        ) : state.isExecuting ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Verifying...
          </>
        ) : (
          <>
            <Shield className="w-4 h-4 mr-2" />
            Protected by reCAPTCHA
          </>
        )}
      </motion.div>
    );
  };

  return (
    <div className={`recaptcha-container ${className}`}>
      {/* Hidden reCAPTCHA element */}
      <div
        ref={recaptchaRef}
        className={size === 'invisible' ? 'hidden' : ''}
      />

      {/* Status Badge */}
      {renderBadge()}

      {/* Error Message */}
      {state.error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <div className="flex-1">
              <p className="text-sm text-red-800 font-medium">
                reCAPTCHA Error
              </p>
              <p className="text-sm text-red-600 mt-1">
                {state.error}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={execute}
              disabled={state.isExecuting}
              className="ml-2 px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              Retry
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Manual Execute Button (for testing) */}
      {process.env.NODE_ENV === 'development' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg"
        >
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Development Controls
          </h4>
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={execute}
              disabled={state.isExecuting || !state.isLoaded}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Execute
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetRecaptcha}
              className="px-3 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Reset
            </motion.button>
          </div>
          {state.isVerified && (
            <div className="mt-2 text-xs text-gray-600">
              <p>Token: {state.token?.substring(0, 20)}...</p>
              {state.score && <p>Score: {state.score}</p>}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

/**
 * Hook for using reCAPTCHA v3
 */
export const useReCaptcha3 = (siteKey: string, action: string = 'submit') => {
  const [state, setState] = useState<ReCaptcha3State>({
    isLoaded: false,
    isExecuting: false,
    isVerified: false,
    error: null
  });

  const execute = useCallback(async (): Promise<string | null> => {
    if (!window.grecaptcha) {
      const error = 'reCAPTCHA not loaded';
      setState(prev => ({ ...prev, error }));
      return null;
    }

    setState(prev => ({ ...prev, isExecuting: true, error: null }));

    try {
      const token = await window.grecaptcha.execute(siteKey, { action });
      
      setState(prev => ({ 
        ...prev, 
        isVerified: true, 
        token,
        isExecuting: false 
      }));
      
      return token;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'reCAPTCHA failed';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        isExecuting: false 
      }));
      return null;
    }
  }, [siteKey, action]);

  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      isVerified: false,
      error: null,
      token: undefined
    }));
  }, []);

  return {
    ...state,
    execute,
    reset
  };
};

/**
 * Higher-order component for forms with reCAPTCHA
 */
export const withReCaptcha3 = <P extends object>(
  Component: React.ComponentType<P & { recaptchaToken?: string }>,
  siteKey: string,
  action: string = 'submit'
) => {
  const WrappedComponent: React.FC<P> = (props) => {
    const { execute } = useReCaptcha3(siteKey, action);
    const [recaptchaToken, setRecaptchaToken] = useState<string>();

    const handleExecute = useCallback(async () => {
      const token = await execute();
      if (token) {
        setRecaptchaToken(token);
      }
    }, [execute]);

    // Auto-execute on mount
    useEffect(() => {
      handleExecute();
    }, [handleExecute]);

    return (
      <Component
        {...props}
        recaptchaToken={recaptchaToken}
      />
    );
  };

  WrappedComponent.displayName = `withReCaptcha3(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

// Export types
export type { ReCaptcha3Props, ReCaptcha3State };

export default ReCaptcha3;
