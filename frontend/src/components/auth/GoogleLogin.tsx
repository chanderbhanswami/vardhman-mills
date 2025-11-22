/**
 * GoogleLogin Component - Vardhman Mills Frontend
 * 
 * Google OAuth integration component with NextAuth.js
 * Provides secure Google login with error handling and loading states.
 */

'use client';

import React, { useState } from 'react';
import { signIn, getProviders } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// Types
interface GoogleLoginProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  redirectTo?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  showIcon?: boolean;
  children?: React.ReactNode;
}

interface GoogleLoginState {
  isLoading: boolean;
  error: string | null;
}

// Google Icon Component
const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

/**
 * GoogleLogin Component
 * 
 * Handles Google OAuth authentication with NextAuth.js
 * Includes loading states, error handling, and customizable styling
 */
export const GoogleLogin: React.FC<GoogleLoginProps> = ({
  className = '',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  redirectTo,
  onSuccess,
  onError,
  showIcon = true,
  children
}) => {
  const [state, setState] = useState<GoogleLoginState>({
    isLoading: false,
    error: null
  });

  /**
   * Handle Google login
   */
  const handleGoogleLogin = async () => {
    setState({ isLoading: true, error: null });

    try {
      // Check if Google provider is available
      const providers = await getProviders();
      const googleProvider = providers?.google;

      if (!googleProvider) {
        throw new Error('Google login is not configured');
      }

      // Initiate Google login
      const result = await signIn('google', {
        redirect: false,
        callbackUrl: redirectTo || '/dashboard'
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.ok) {
        toast.success('Successfully logged in with Google!');
        onSuccess?.();
        
        // Redirect if specified and no custom onSuccess handler
        if (redirectTo && !onSuccess) {
          window.location.href = redirectTo;
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google login failed';
      
      setState({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  /**
   * Get button styles based on variant and size
   */
  const getButtonStyles = () => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    // Size styles
    const sizeStyles = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg'
    };

    // Variant styles
    const variantStyles = {
      primary: 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-lg hover:shadow-xl focus:ring-gray-500',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300 focus:ring-gray-500',
      outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500'
    };

    const widthStyle = fullWidth ? 'w-full' : '';
    const disabledStyle = state.isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

    return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${disabledStyle}`;
  };

  /**
   * Get icon size based on button size
   */
  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'w-4 h-4';
      case 'lg': return 'w-6 h-6';
      default: return 'w-5 h-5';
    }
  };

  return (
    <div className={className}>
      <motion.button
        whileHover={!state.isLoading ? { scale: 1.02 } : {}}
        whileTap={!state.isLoading ? { scale: 0.98 } : {}}
        onClick={handleGoogleLogin}
        disabled={state.isLoading}
        className={getButtonStyles()}
        aria-label="Sign in with Google"
      >
        {state.isLoading ? (
          <Loader2 className={`${getIconSize()} animate-spin ${showIcon && children ? 'mr-2' : ''}`} />
        ) : showIcon ? (
          <GoogleIcon className={`${getIconSize()} ${children ? 'mr-2' : ''}`} />
        ) : null}
        
        {children || (state.isLoading ? 'Signing in...' : 'Continue with Google')}
      </motion.button>

      {/* Error Message */}
      {state.error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mt-3 flex items-center text-red-600 text-sm"
        >
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{state.error}</span>
        </motion.div>
      )}
    </div>
  );
};

/**
 * Compact Google Login Button
 */
export const GoogleLoginButton: React.FC<Omit<GoogleLoginProps, 'children'> & {
  text?: string;
}> = ({ 
  text = 'Google',
  ...props 
}) => (
  <GoogleLogin {...props}>
    {text}
  </GoogleLogin>
);

/**
 * Google Login Icon Only
 */
export const GoogleLoginIcon: React.FC<Omit<GoogleLoginProps, 'children' | 'showIcon'>> = (props) => (
  <GoogleLogin {...props} showIcon={true} className={`${props.className} !p-3`}>
    <span className="sr-only">Sign in with Google</span>
  </GoogleLogin>
);

/**
 * Hook for Google login functionality
 */
export const useGoogleLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginWithGoogle = async (options?: {
    redirectTo?: string;
    onSuccess?: () => void;
    onError?: (error: string) => void;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const providers = await getProviders();
      const googleProvider = providers?.google;

      if (!googleProvider) {
        throw new Error('Google login is not configured');
      }

      const result = await signIn('google', {
        redirect: false,
        callbackUrl: options?.redirectTo || '/dashboard'
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.ok) {
        toast.success('Successfully logged in with Google!');
        options?.onSuccess?.();
        return { success: true, error: null };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google login failed';
      setError(errorMessage);
      options?.onError?.(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    loginWithGoogle,
    isLoading,
    error,
    clearError
  };
};

/**
 * Google Login Card Component
 */
export const GoogleLoginCard: React.FC<{
  title?: string;
  description?: string;
  className?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}> = ({
  title = "Continue with Google",
  description = "Sign in to your account using Google",
  className = '',
  onSuccess,
  onError
}) => {
  return (
    <div className={`bg-white rounded-2xl shadow-xl p-6 border border-gray-100 ${className}`}>
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <GoogleIcon className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
      
      <GoogleLogin
        variant="primary"
        size="lg"
        fullWidth
        onSuccess={onSuccess}
        onError={onError}
      />
    </div>
  );
};

// Export types
export type { GoogleLoginProps, GoogleLoginState };

export { GoogleIcon };
export default GoogleLogin;
