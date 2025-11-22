/**
 * LoginForm Component - Vardhman Mills Frontend
 * 
 * Complete login form with email/password authentication,
 * social login options, and comprehensive validation.
 * 
 * Enhanced with UI components for better consistency and maintainability.
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, getSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';
import { GoogleLogin } from './GoogleLogin';
import { FacebookLogin } from './FacebookLogin';

// Import UI components for better consistency and maintainability
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Alert } from '../ui/Alert';
import { Checkbox } from '../ui/Checkbox';
import { Container, FlexContainer } from '../ui/Container';

// Validation schema - keeping all original validation rules
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase(),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional()
});

type LoginFormData = z.infer<typeof loginSchema>;

// Types - preserving all original interfaces
interface LoginFormProps {
  className?: string;
  onSuccess?: (user: { id: string; email: string; name?: string } | null) => void;
  onError?: (error: string) => void;
  redirectTo?: string;
  showSocialLogin?: boolean;
  showRememberMe?: boolean;
  showForgotPassword?: boolean;
  showRegisterLink?: boolean;
  title?: string;
  subtitle?: string;
}

interface LoginState {
  isLoading: boolean;
  showPassword: boolean;
  loginAttempts: number;
  isBlocked: boolean;
  blockExpiry?: Date;
}

/**
 * LoginForm Component
 * 
 * Comprehensive login form with multiple authentication methods,
 * validation, security features, and responsive design.
 * Enhanced with UI components while preserving all functionality.
 */
export const LoginForm: React.FC<LoginFormProps> = ({
  className = '',
  onSuccess,
  onError,
  redirectTo,
  showSocialLogin = true,
  showRememberMe = true,
  showForgotPassword = true,
  showRegisterLink = true,
  title = 'Welcome Back',
  subtitle = 'Sign in to your account to continue'
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get redirect URL from search params
  const callbackUrl = searchParams?.get('redirect') || redirectTo || '/dashboard';
  
  const [state, setState] = useState<LoginState>({
    isLoading: false,
    showPassword: false,
    loginAttempts: 0,
    isBlocked: false
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setError,
    clearErrors
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      rememberMe: false
    }
  });

  /**
   * Handle form submission - preserving all original logic
   */
  const onSubmit = async (data: LoginFormData) => {
    // Check if user is blocked
    if (state.isBlocked && state.blockExpiry && new Date() < state.blockExpiry) {
      const remainingTime = Math.ceil((state.blockExpiry.getTime() - new Date().getTime()) / 60000);
      toast.error(`Too many failed attempts. Try again in ${remainingTime} minutes.`);
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));
    clearErrors();

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.ok) {
        // Get updated session
        const session = await getSession();
        
        toast.success('Login successful! Welcome back.');
        onSuccess?.(session?.user as { id: string; email: string; name?: string } | null);

        // Handle remember me functionality
        if (data.rememberMe) {
          localStorage.setItem('rememberEmail', data.email);
        } else {
          localStorage.removeItem('rememberEmail');
        }

        // Reset login attempts on successful login
        setState(prev => ({ ...prev, loginAttempts: 0, isBlocked: false }));

        // Redirect to callback URL
        router.push(callbackUrl);
      }
    } catch (error) {
      console.error('Login error:', error);

      // Handle failed login attempts with progressive lockout
      const newAttempts = state.loginAttempts + 1;
      const maxAttempts = 5;
      const isBlocked = newAttempts >= maxAttempts;
      
      let blockExpiry: Date | undefined;
      if (isBlocked) {
        blockExpiry = new Date();
        blockExpiry.setMinutes(blockExpiry.getMinutes() + 15); // 15 minute lockout
      }

      let errorMessage = 'Invalid email or password. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Set form error
      setError('root', { 
        type: 'manual', 
        message: errorMessage 
      });

      setState(prev => ({ 
        ...prev, 
        loginAttempts: newAttempts,
        isBlocked,
        blockExpiry
      }));

      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = () => {
    setState(prev => ({ ...prev, showPassword: !prev.showPassword }));
  };

  /**
   * Handle social login success
   */
  const handleSocialSuccess = () => {
    onSuccess?.(null);
  };

  /**
   * Handle social login error
   */
  const handleSocialError = (error: string) => {
    toast.error(`Social login failed: ${error}`);
    onError?.(error);
  };

  // Load remembered email on mount
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberEmail');
    if (rememberedEmail) {
      // Set the email field value using react-hook-form setValue
      const form = document.getElementById('email') as HTMLInputElement;
      if (form) {
        form.value = rememberedEmail;
      }
    }
  }, []);

  return (
    <Container size="md" centered className={className}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card variant="elevated" size="lg" className="shadow-xl">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Shield className="w-8 h-8 text-blue-600" />
            </motion.div>
            
            <CardTitle className="text-3xl font-bold mb-2">{title}</CardTitle>
            <CardDescription className="text-gray-600">{subtitle}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Social Login Section */}
            {showSocialLogin && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <GoogleLogin
                    variant="outline"
                    size="md"
                    fullWidth
                    onSuccess={handleSocialSuccess}
                    onError={handleSocialError}
                    redirectTo={callbackUrl}
                  >
                    Google
                  </GoogleLogin>
                  <FacebookLogin
                    variant="outline"
                    size="md"
                    fullWidth
                    onSuccess={handleSocialSuccess}
                    onError={handleSocialError}
                    redirectTo={callbackUrl}
                  >
                    Facebook
                  </FacebookLogin>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Or continue with email</span>
                  </div>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <Input
                  {...register('email')}
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  leftIcon={<Mail className="h-5 w-5" />}
                  disabled={state.isLoading}
                  status={errors.email ? 'error' : 'default'}
                  className="w-full"
                />
                <AnimatePresence>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-sm text-red-600 flex items-center"
                    >
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.email.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  {...register('password')}
                  id="password"
                  type={state.showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  leftIcon={<Lock className="h-5 w-5" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      disabled={state.isLoading}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {state.showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  }
                  disabled={state.isLoading}
                  status={errors.password ? 'error' : 'default'}
                  className="w-full"
                />
                <AnimatePresence>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-sm text-red-600 flex items-center"
                    >
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.password.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Remember Me & Forgot Password */}
              <FlexContainer justify="between" align="center">
                {showRememberMe && (
                  <Checkbox
                    {...register('rememberMe')}
                    id="rememberMe"
                    disabled={state.isLoading}
                    label="Remember me"
                  />
                )}

                {showForgotPassword && (
                  <Link
                    href="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    Forgot password?
                  </Link>
                )}
              </FlexContainer>

              {/* Login Attempts Warning */}
              {state.loginAttempts > 0 && !state.isBlocked && (
                <Alert
                  variant="warning"
                  icon={<AlertCircle className="w-5 h-5" />}
                  description={
                    `${state.loginAttempts} failed attempt${state.loginAttempts > 1 ? 's' : ''}. 
                    ${5 - state.loginAttempts} remaining before temporary lockout.`
                  }
                  animated
                />
              )}

              {/* Blocked Warning */}
              {state.isBlocked && state.blockExpiry && (
                <Alert
                  variant="destructive"
                  icon={<AlertCircle className="w-5 h-5" />}
                  description={
                    `Account temporarily blocked due to too many failed attempts. 
                    Try again in ${Math.ceil((state.blockExpiry.getTime() - new Date().getTime()) / 60000)} minutes.`
                  }
                  animated
                />
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                fullWidth
                disabled={!isValid || state.isLoading || state.isBlocked}
                loading={state.isLoading}
                loadingText="Signing in..."
                leftIcon={!state.isLoading ? <LogIn className="w-5 h-5" /> : undefined}
                animated
                variant={isValid && !state.isLoading && !state.isBlocked ? 'default' : 'secondary'}
              >
                Sign In
              </Button>
            </form>
          </CardContent>

          {/* Register Link */}
          {showRegisterLink && (
            <CardFooter className="text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link
                  href="/register"
                  className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Create one now
                </Link>
              </p>
            </CardFooter>
          )}
        </Card>
      </motion.div>
    </Container>
  );
};

/**
 * Hook for login functionality - preserving all original functionality
 */
export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string, rememberMe?: boolean) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.ok) {
        // Handle remember me
        if (rememberMe) {
          localStorage.setItem('rememberEmail', email);
        } else {
          localStorage.removeItem('rememberEmail');
        }

        return { success: true, user: await getSession() };
      }

      throw new Error('Login failed');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    login,
    isLoading,
    error,
    clearError
  };
};

// Export types - preserving all original types
export type { LoginFormProps, LoginState, LoginFormData };

export default LoginForm;