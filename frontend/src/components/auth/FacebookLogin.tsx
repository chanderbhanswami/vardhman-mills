/**
 * FacebookLogin Component - Vardhman Mills Frontend
 * 
 * Facebook OAuth integration component with NextAuth.js
 * Provides secure Facebook login with error handling and loading states.
 */

'use client';

import React, { useState } from 'react';
import { signIn, getProviders } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Facebook, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// Types
interface FacebookLoginProps {
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

interface FacebookLoginState {
  isLoading: boolean;
  error: string | null;
}

/**
 * FacebookLogin Component
 * 
 * Handles Facebook OAuth authentication with NextAuth.js
 * Includes loading states, error handling, and customizable styling
 */
export const FacebookLogin: React.FC<FacebookLoginProps> = ({
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
  const [state, setState] = useState<FacebookLoginState>({
    isLoading: false,
    error: null
  });

  /**
   * Handle Facebook login
   */
  const handleFacebookLogin = async () => {
    setState({ isLoading: true, error: null });

    try {
      // Check if Facebook provider is available
      const providers = await getProviders();
      const facebookProvider = providers?.facebook;

      if (!facebookProvider) {
        throw new Error('Facebook login is not configured');
      }

      // Initiate Facebook login
      const result = await signIn('facebook', {
        redirect: false,
        callbackUrl: redirectTo || '/dashboard'
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.ok) {
        toast.success('Successfully logged in with Facebook!');
        onSuccess?.();
        
        // Redirect if specified and no custom onSuccess handler
        if (redirectTo && !onSuccess) {
          window.location.href = redirectTo;
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Facebook login failed';
      
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
      primary: 'bg-[#1877F2] hover:bg-[#166FE5] text-white shadow-lg hover:shadow-xl focus:ring-blue-500',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300 focus:ring-gray-500',
      outline: 'border-2 border-[#1877F2] text-[#1877F2] hover:bg-[#1877F2] hover:text-white focus:ring-blue-500'
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
        onClick={handleFacebookLogin}
        disabled={state.isLoading}
        className={getButtonStyles()}
        aria-label="Sign in with Facebook"
      >
        {state.isLoading ? (
          <Loader2 className={`${getIconSize()} animate-spin ${showIcon && children ? 'mr-2' : ''}`} />
        ) : showIcon ? (
          <Facebook className={`${getIconSize()} ${children ? 'mr-2' : ''}`} />
        ) : null}
        
        {children || (state.isLoading ? 'Signing in...' : 'Continue with Facebook')}
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
 * Compact Facebook Login Button
 */
export const FacebookLoginButton: React.FC<Omit<FacebookLoginProps, 'children'> & {
  text?: string;
}> = ({ 
  text = 'Facebook',
  ...props 
}) => (
  <FacebookLogin {...props}>
    {text}
  </FacebookLogin>
);

/**
 * Facebook Login Icon Only
 */
export const FacebookLoginIcon: React.FC<Omit<FacebookLoginProps, 'children' | 'showIcon'>> = (props) => (
  <FacebookLogin {...props} showIcon={true} className={`${props.className} !p-3`}>
    <span className="sr-only">Sign in with Facebook</span>
  </FacebookLogin>
);

/**
 * Hook for Facebook login functionality
 */
export const useFacebookLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginWithFacebook = async (options?: {
    redirectTo?: string;
    onSuccess?: () => void;
    onError?: (error: string) => void;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const providers = await getProviders();
      const facebookProvider = providers?.facebook;

      if (!facebookProvider) {
        throw new Error('Facebook login is not configured');
      }

      const result = await signIn('facebook', {
        redirect: false,
        callbackUrl: options?.redirectTo || '/dashboard'
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.ok) {
        toast.success('Successfully logged in with Facebook!');
        options?.onSuccess?.();
        return { success: true, error: null };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Facebook login failed';
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
    loginWithFacebook,
    isLoading,
    error,
    clearError
  };
};

/**
 * Facebook Login Card Component
 */
export const FacebookLoginCard: React.FC<{
  title?: string;
  description?: string;
  className?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}> = ({
  title = "Continue with Facebook",
  description = "Sign in to your account using Facebook",
  className = '',
  onSuccess,
  onError
}) => {
  return (
    <div className={`bg-white rounded-2xl shadow-xl p-6 border border-gray-100 ${className}`}>
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-[#1877F2] rounded-xl flex items-center justify-center mx-auto mb-4">
          <Facebook className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
      
      <FacebookLogin
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
export type { FacebookLoginProps, FacebookLoginState };

export default FacebookLogin;
