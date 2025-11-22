/**
 * ResetPasswordForm Component - Vardhman Mills Frontend
 * 
 * Complete password reset form with token validation,
 * password strength checking, and secure submission.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader2,
  Shield,
  KeyRound,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { Container } from '@/components/ui/Container';

// Validation schema
const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number and special character'
    ),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Types
interface ResetPasswordFormProps {
  className?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onBack?: () => void;
  title?: string;
  subtitle?: string;
}

interface ResetPasswordState {
  isLoading: boolean;
  isValidating: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  tokenValid: boolean;
  tokenError: string | null;
  passwordStrength: number;
}

/**
 * Password strength calculation
 */
const calculatePasswordStrength = (password: string): number => {
  let strength = 0;
  
  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;
  if (/[a-z]/.test(password)) strength += 20;
  if (/[A-Z]/.test(password)) strength += 20;
  if (/\d/.test(password)) strength += 20;
  if (/[@$!%*?&]/.test(password)) strength += 10;
  
  return Math.min(strength, 100);
};

/**
 * Password strength indicator
 */
const PasswordStrengthIndicator: React.FC<{ 
  password: string;
  className?: string;
}> = ({ password, className = '' }) => {
  const strength = calculatePasswordStrength(password);
  
  const getStrengthConfig = () => {
    if (strength < 40) return { label: 'Weak', color: 'red', bgColor: 'bg-red-500' };
    if (strength < 70) return { label: 'Medium', color: 'yellow', bgColor: 'bg-yellow-500' };
    return { label: 'Strong', color: 'green', bgColor: 'bg-green-500' };
  };
  
  const { label, color, bgColor } = getStrengthConfig();
  
  if (!password) return null;

  // Create width class based on strength value
  const getWidthClass = (strength: number) => {
    if (strength >= 100) return 'w-full';
    if (strength >= 90) return 'w-11/12';
    if (strength >= 80) return 'w-4/5';
    if (strength >= 70) return 'w-3/5';
    if (strength >= 60) return 'w-3/5';
    if (strength >= 50) return 'w-1/2';
    if (strength >= 40) return 'w-2/5';
    if (strength >= 30) return 'w-1/3';
    if (strength >= 20) return 'w-1/4';
    if (strength >= 10) return 'w-1/5';
    return 'w-1/12';
  };

  return (
    <div className={`mt-2 ${className}`}>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-gray-600">Password strength</span>
        <span className={`font-medium text-${color}-600`}>{label}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5 relative">
        <div 
          className={`h-1.5 rounded-full transition-all duration-300 ${bgColor} ${getWidthClass(strength)}`}
        />
      </div>
    </div>
  );
};

/**
 * Password requirements checklist
 */
const PasswordRequirements: React.FC<{ 
  password: string;
  className?: string;
}> = ({ password, className = '' }) => {
  const requirements = [
    { label: 'At least 8 characters', test: password.length >= 8 },
    { label: 'One uppercase letter', test: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', test: /[a-z]/.test(password) },
    { label: 'One number', test: /\d/.test(password) },
    { label: 'One special character', test: /[@$!%*?&]/.test(password) }
  ];

  if (!password) return null;

  return (
    <div className={`mt-2 space-y-1 ${className}`}>
      {requirements.map((req, index) => (
        <div key={index} className="flex items-center text-xs">
          <CheckCircle 
            className={`w-3 h-3 mr-2 ${
              req.test ? 'text-green-500' : 'text-gray-300'
            }`} 
          />
          <span className={req.test ? 'text-green-700' : 'text-gray-500'}>
            {req.label}
          </span>
        </div>
      ))}
    </div>
  );
};

/**
 * ResetPasswordForm Component
 * 
 * Comprehensive password reset form with token validation,
 * strength checking, and secure submission.
 */
export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  className = '',
  onSuccess,
  onError,
  onBack,
  title = 'Reset Password',
  subtitle = 'Enter your new password below'
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get token from URL
  const token = searchParams?.get('token');
  const email = searchParams?.get('email');
  
  const [state, setState] = useState<ResetPasswordState>({
    isLoading: false,
    isValidating: true,
    showPassword: false,
    showConfirmPassword: false,
    tokenValid: false,
    tokenError: null,
    passwordStrength: 0
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setError,
    clearErrors
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange'
  });

  const watchedPassword = watch('password', '');

  /**
   * Validate reset token
   */
  const validateToken = async () => {
    if (!token) {
      setState(prev => ({
        ...prev,
        isValidating: false,
        tokenValid: false,
        tokenError: 'No reset token provided'
      }));
      return;
    }

    try {
      const response = await fetch('/api/auth/validate-reset-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Token validation failed');
      }

      setState(prev => ({
        ...prev,
        isValidating: false,
        tokenValid: true,
        tokenError: null
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Token validation failed';
      
      setState(prev => ({
        ...prev,
        isValidating: false,
        tokenValid: false,
        tokenError: errorMessage
      }));

      onError?.(errorMessage);
    }
  };

  /**
   * Handle form submission
   */
  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error('No reset token provided');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));
    clearErrors();

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          password: data.password
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Password reset failed');
      }

      toast.success('Password reset successfully! You can now sign in with your new password.');
      
      onSuccess?.();

      // Redirect to login page
      setTimeout(() => {
        router.push('/auth/login?message=password-reset');
      }, 2000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      
      // Handle specific error types
      if (errorMessage.includes('Token expired')) {
        setError('password', { message: 'Reset token has expired. Please request a new one.' });
      } else if (errorMessage.includes('Invalid token')) {
        setError('password', { message: 'Invalid reset token. Please request a new one.' });
      } else if (errorMessage.includes('Password too weak')) {
        setError('password', { message: 'Please choose a stronger password' });
      }

      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
    setState(prev => ({ 
      ...prev, 
      [field === 'password' ? 'showPassword' : 'showConfirmPassword']: 
        !prev[field === 'password' ? 'showPassword' : 'showConfirmPassword']
    }));
  };

  /**
   * Handle back navigation
   */
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/auth/forgot-password');
    }
  };

  // Validate token on mount
  useEffect(() => {
    validateToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Update password strength
  useEffect(() => {
    setState(prev => ({ 
      ...prev, 
      passwordStrength: calculatePasswordStrength(watchedPassword) 
    }));
  }, [watchedPassword]);

  // Show loading state during token validation
  if (state.isValidating) {
    return (
      <Container className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Validating Reset Token
          </h3>
          <p className="text-gray-600">Please wait while we verify your request</p>
        </motion.div>
      </Container>
    );
  }

  // Show error state for invalid token
  if (!state.tokenValid) {
    return (
      <Container className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <Card className="text-center p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Reset Link</h2>
            <p className="text-gray-600 mb-8">
              {state.tokenError || 'This password reset link is invalid or has expired.'}
            </p>
            
            <div className="space-y-4">
              <Button
                variant="default"
                className="w-full"
                onClick={() => router.push('/auth/forgot-password')}
              >
                Request New Reset Link
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/auth/login')}
              >
                Back to Login
              </Button>
            </div>
          </Card>
        </motion.div>
      </Container>
    );
  }

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <KeyRound className="w-8 h-8 text-blue-600" />
            </motion.div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-600 mb-2">{subtitle}</p>
            {email && (
              <p className="text-sm text-gray-500">
                For account: <strong>{email}</strong>
              </p>
            )}
          </div>

          {/* Reset Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <Input
                {...register('password')}
                type={state.showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Enter new password"
                disabled={state.isLoading}
                error={errors.password?.message}
                leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('password')}
                    disabled={state.isLoading}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {state.showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                }
              />
              
              <PasswordStrengthIndicator password={watchedPassword} />
              <PasswordRequirements password={watchedPassword} />
              
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-2 text-sm text-red-600 flex items-center"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <Input
                {...register('confirmPassword')}
                type={state.showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                placeholder="Confirm new password"
                disabled={state.isLoading}
                error={errors.confirmPassword?.message}
                leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                    disabled={state.isLoading}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {state.showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                }
              />
              <AnimatePresence>
                {errors.confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-2 text-sm text-red-600 flex items-center"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.confirmPassword.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Security Note */}
            <Alert variant="info" className="p-4">
              <Shield className="w-5 h-5" />
              <div>
                <p className="font-medium mb-1">Security Notice</p>
                <p className="text-sm">
                  Your new password will be securely encrypted and stored. 
                  After reset, you&apos;ll be signed out from all devices for security.
                </p>
              </div>
            </Alert>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={state.isLoading}
                className="flex-1"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>

              <Button
                type="submit"
                disabled={!isValid || state.isLoading}
                loading={state.isLoading}
                className="flex-1"
              >
                {state.isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Reset Password
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

/**
 * Hook for password reset functionality
 */
export const useResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetPassword = async (token: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password reset failed');
      }

      return { success: true, message: data.message };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    resetPassword,
    isLoading,
    error,
    clearError: () => setError(null)
  };
};

// Export types
export type { ResetPasswordFormProps, ResetPasswordState, ResetPasswordFormData };

export default ResetPasswordForm;