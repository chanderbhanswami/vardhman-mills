/**
 * SocialLogin Component - Vardhman Mills Frontend
 * 
 * Unified social authentication component supporting multiple
 * OAuth providers with consistent styling and error handling.
 */

'use client';

import React, { useState } from 'react';
import { signIn, getProviders } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chrome,
  Github,
  Twitter,
  Linkedin,
  AlertCircle,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';
import { GoogleLogin } from './GoogleLogin';
import { FacebookLogin } from './FacebookLogin';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';

// Types
interface SocialLoginProps {
  className?: string;
  onSuccess?: (provider: string) => void;
  onError?: (error: string, provider: string) => void;
  redirectTo?: string;
  showProviders?: ('google' | 'facebook' | 'github' | 'twitter' | 'linkedin')[];
  layout?: 'horizontal' | 'vertical' | 'grid';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'filled' | 'outline' | 'ghost';
  showLabels?: boolean;
  title?: string;
  subtitle?: string;
}

interface SocialLoginState {
  isLoading: Record<string, boolean>;
  availableProviders: string[];
  error: string | null;
}

// Provider configurations
const PROVIDER_CONFIGS = {
  google: {
    name: 'Google',
    icon: Chrome,
    bgColor: 'bg-red-500',
    hoverColor: 'hover:bg-red-600',
    textColor: 'text-red-600'
  },
  facebook: {
    name: 'Facebook',
    icon: Chrome, // Use Chrome icon as placeholder
    bgColor: 'bg-blue-600',
    hoverColor: 'hover:bg-blue-700',
    textColor: 'text-blue-600'
  },
  github: {
    name: 'GitHub',
    icon: Github,
    bgColor: 'bg-gray-900',
    hoverColor: 'hover:bg-black',
    textColor: 'text-gray-900'
  },
  twitter: {
    name: 'Twitter',
    icon: Twitter,
    bgColor: 'bg-blue-400',
    hoverColor: 'hover:bg-blue-500',
    textColor: 'text-blue-400'
  },
  linkedin: {
    name: 'LinkedIn',
    icon: Linkedin,
    bgColor: 'bg-blue-700',
    hoverColor: 'hover:bg-blue-800',
    textColor: 'text-blue-700'
  }
};

/**
 * Generic social provider button
 */
const SocialProviderButton: React.FC<{
  provider: string;
  config: typeof PROVIDER_CONFIGS.google;
  isLoading: boolean;
  size: string;
  variant: string;
  showLabel: boolean;
  onClick: () => void;
}> = ({ config, isLoading, size, variant, showLabel, onClick }) => {
  const Icon = config.icon;
  
  const getVariant = () => {
    switch (variant) {
      case 'filled': return 'default';
      case 'outline': return 'outline';
      case 'ghost': return 'ghost';
      default: return 'outline';
    }
  };

  const getSize = () => {
    switch (size) {
      case 'sm': return 'sm';
      case 'lg': return 'lg';
      default: return 'md';
    }
  };

  return (
    <Button
      variant={getVariant()}
      size={getSize()}
      onClick={onClick}
      disabled={isLoading}
      loading={isLoading}
      className="w-full"
    >
      {!isLoading && <Icon className="w-5 h-5 mr-2" />}
      {showLabel && config.name}
    </Button>
  );
};

/**
 * SocialLogin Component
 * 
 * Unified social authentication with multiple providers,
 * flexible layouts, and comprehensive error handling.
 */
export const SocialLogin: React.FC<SocialLoginProps> = ({
  className = '',
  onSuccess,
  onError,
  redirectTo = '/dashboard',
  showProviders = ['google', 'facebook', 'github'],
  layout = 'vertical',
  size = 'md',
  variant = 'outline',
  showLabels = true,
  title = 'Continue with Social',
  subtitle = 'Choose your preferred sign-in method'
}) => {
  const [state, setState] = useState<SocialLoginState>({
    isLoading: {},
    availableProviders: [],
    error: null
  });

  /**
   * Handle social login
   */
  const handleSocialLogin = async (provider: string) => {
    setState(prev => ({
      ...prev,
      isLoading: { ...prev.isLoading, [provider]: true },
      error: null
    }));

    try {
      const result = await signIn(provider, {
        redirect: false,
        callbackUrl: redirectTo
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.ok) {
        toast.success(`Successfully signed in with ${provider}!`);
        onSuccess?.(provider);
        
        // Redirect to intended page
        window.location.href = result.url || redirectTo;
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `${provider} login failed`;
      
      setState(prev => ({
        ...prev,
        error: errorMessage
      }));
      
      toast.error(`${provider} login failed: ${errorMessage}`);
      onError?.(errorMessage, provider);

    } finally {
      setState(prev => ({
        ...prev,
        isLoading: { ...prev.isLoading, [provider]: false }
      }));
    }
  };

  /**
   * Check available providers
   */
  const checkAvailableProviders = async () => {
    try {
      const providers = await getProviders();
      const availableProviderIds = Object.keys(providers || {});
      
      setState(prev => ({
        ...prev,
        availableProviders: availableProviderIds
      }));
    } catch (error) {
      console.error('Failed to get providers:', error);
    }
  };

  // Check providers on mount
  React.useEffect(() => {
    checkAvailableProviders();
  }, []);

  // Filter providers that are both requested and available
  const enabledProviders = showProviders.filter(provider => 
    state.availableProviders.includes(provider) || 
    ['google', 'facebook'].includes(provider) // Always show Google and Facebook
  );

  // Layout classes
  const layoutClasses = {
    horizontal: 'flex flex-row space-x-4',
    vertical: 'flex flex-col space-y-4',
    grid: `grid ${
      enabledProviders.length <= 2 ? 'grid-cols-2' : 
      enabledProviders.length === 3 ? 'grid-cols-3' : 'grid-cols-2'
    } gap-4`
  };

  return (
    <Card className={`social-login ${className}`}>
      {/* Header */}
      {(title || subtitle) && (
        <div className="text-center mb-6">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600">{subtitle}</p>
          )}
        </div>
      )}

      {/* Social Providers */}
      <div className={layoutClasses[layout]}>
        {/* Custom Google and Facebook components */}
        {enabledProviders.includes('google') && (
          <GoogleLogin
            variant={variant === 'filled' ? 'primary' : 'outline'}
            size={size}
            fullWidth={layout !== 'horizontal'}
            onSuccess={() => onSuccess?.('google')}
            onError={(error) => onError?.(error, 'google')}
            redirectTo={redirectTo}
          >
            {showLabels ? 'Google' : null}
          </GoogleLogin>
        )}

        {enabledProviders.includes('facebook') && (
          <FacebookLogin
            variant={variant === 'filled' ? 'primary' : 'outline'}
            size={size}
            fullWidth={layout !== 'horizontal'}
            onSuccess={() => onSuccess?.('facebook')}
            onError={(error) => onError?.(error, 'facebook')}
            redirectTo={redirectTo}
          >
            {showLabels ? 'Facebook' : null}
          </FacebookLogin>
        )}

        {/* Other providers */}
        {enabledProviders
          .filter(provider => !['google', 'facebook'].includes(provider))
          .map(provider => {
            const config = PROVIDER_CONFIGS[provider as keyof typeof PROVIDER_CONFIGS];
            if (!config) return null;

            return (
              <SocialProviderButton
                key={provider}
                provider={provider}
                config={config}
                isLoading={state.isLoading[provider] || false}
                size={size}
                variant={variant}
                showLabel={showLabels}
                onClick={() => handleSocialLogin(provider)}
              />
            );
          })}
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {state.error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4"
          >
            <Alert variant="destructive">
              <AlertCircle className="w-5 h-5" />
              <p>{state.error}</p>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Security Notice */}
      <Alert variant="info" className="mt-6">
        <Shield className="w-5 h-5" />
        <div>
          <p className="font-medium mb-1">Secure Authentication</p>
          <p className="text-sm">
            We use industry-standard OAuth protocols to protect your information. 
            We never store your social media passwords.
          </p>
        </div>
            </Alert>
    </Card>
  );
};

/**
 * Simplified social login with just icons
 */
export const SocialLoginIcons: React.FC<{
  providers?: string[];
  onSuccess?: (provider: string) => void;
  onError?: (error: string, provider: string) => void;
  className?: string;
}> = ({ 
  providers = ['google', 'facebook', 'github'], 
  onSuccess, 
  onError, 
  className = '' 
}) => {
  return (
    <SocialLogin
      className={className}
      showProviders={providers as ('google' | 'facebook' | 'github' | 'twitter' | 'linkedin')[]}
      layout="horizontal"
      size="sm"
      variant="outline"
      showLabels={false}
      title=""
      subtitle=""
      onSuccess={onSuccess}
      onError={onError}
    />
  );
};

/**
 * Social login divider
 */
export const SocialLoginDivider: React.FC<{
  text?: string;
  className?: string;
}> = ({ text = 'Or continue with', className = '' }) => {
  return (
    <div className={`relative my-6 ${className}`}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-4 bg-white text-gray-500">{text}</span>
      </div>
    </div>
  );
};

/**
 * Hook for social login functionality
 */
export const useSocialLogin = () => {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const loginWithProvider = async (provider: string, redirectTo?: string) => {
    setIsLoading(prev => ({ ...prev, [provider]: true }));
    setError(null);

    try {
      const result = await signIn(provider, {
        redirect: false,
        callbackUrl: redirectTo || '/dashboard'
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      return { success: true, url: result?.url };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };

    } finally {
      setIsLoading(prev => ({ ...prev, [provider]: false }));
    }
  };

  return {
    loginWithProvider,
    isLoading,
    error,
    clearError: () => setError(null)
  };
};

// Export types
export type { SocialLoginProps, SocialLoginState };

export default SocialLogin;
