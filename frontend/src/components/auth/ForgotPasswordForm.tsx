/**
 * ForgotPasswordForm Component - Vardhman Mills Frontend
 * 
 * Form component for initiating password reset process
 * Includes email validation and OTP sending functionality.
 * Enhanced with UI components for better consistency and maintainability.
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Mail,
  ArrowLeft,
  Send,
  CheckCircle,
  AlertCircle,
  Shield,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

// Import UI components for better consistency and maintainability
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Alert } from '../ui/Alert';
import { Container } from '../ui/Container';

// Validation schema
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase()
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Types
interface ForgotPasswordFormProps {
  className?: string;
  onSuccess?: (email: string) => void;
  onError?: (error: string) => void;
  redirectTo?: string;
}

interface ForgotPasswordState {
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
  canResend: boolean;
  countdown: number;
}

/**
 * ForgotPasswordForm Component
 * 
 * Provides a form for users to initiate password reset by entering their email.
 * Sends OTP to the provided email and handles the complete flow.
 */
export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  className = '',
  onSuccess,
  onError,
  redirectTo
}) => {
  const router = useRouter();
  const [state, setState] = useState<ForgotPasswordState>({
    status: 'idle',
    message: '',
    canResend: true,
    countdown: 0
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    getValues
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange'
  });



  // Countdown timer for resend functionality
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.countdown > 0) {
      interval = setInterval(() => {
        setState(prev => ({
          ...prev,
          countdown: prev.countdown - 1,
          canResend: prev.countdown <= 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.countdown]);

  /**
   * Handle form submission
   */
  const onSubmit = async (data: ForgotPasswordFormData) => {
    setState({
      status: 'loading',
      message: 'Sending reset instructions...',
      canResend: false,
      countdown: 60
    });

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          type: 'password_reset'
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setState({
          status: 'success',
          message: `Password reset instructions sent to ${data.email}. Please check your inbox and spam folder.`,
          canResend: false,
          countdown: 60
        });

        toast.success('Reset instructions sent successfully!');
        onSuccess?.(data.email);

        // Redirect to OTP verification page after a delay
        if (redirectTo) {
          setTimeout(() => {
            router.push(`${redirectTo}?email=${encodeURIComponent(data.email)}`);
          }, 2000);
        }
      } else {
        throw new Error(result.message || 'Failed to send reset instructions');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset instructions';
      
      setState({
        status: 'error',
        message: errorMessage,
        canResend: true,
        countdown: 0
      });

      toast.error(errorMessage);
      onError?.(errorMessage);
    }
  };

  /**
   * Handle resend functionality
   */
  const handleResend = async () => {
    const email = getValues('email');
    if (!email || !isValid) {
      toast.error('Please enter a valid email address');
      return;
    }

    await onSubmit({ email });
  };

  /**
   * Get status color based on current state
   */
  const getStatusColor = () => {
    switch (state.status) {
      case 'loading': return 'blue';
      case 'success': return 'green';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  /**
   * Get status icon
   */
  const getStatusIcon = () => {
    switch (state.status) {
      case 'loading':
        return <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Shield className="w-5 h-5 text-gray-400" />;
    }
  };

  const statusColor = getStatusColor();

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
              animate={{ 
                scale: state.status === 'success' ? [1, 1.1, 1] : 1,
              }}
              transition={{ duration: 0.6 }}
              className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center bg-${statusColor}-100`}
            >
              {getStatusIcon()}
            </motion.div>
            
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              {state.status === 'success' ? 'Check Your Email' : 'Forgot Password?'}
            </CardTitle>
            
            <CardDescription className="text-gray-600">
              {state.status === 'success' 
                ? "We've sent reset instructions to your email"
                : "Enter your email address and we'll send you reset instructions"
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">

            {/* Status Message */}
            <AnimatePresence mode="wait">
              {state.message && (
                <motion.div
                  key={state.status}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert
                    variant={state.status === 'success' ? 'success' : state.status === 'error' ? 'destructive' : 'default'}
                    icon={getStatusIcon()}
                    description={state.message}
                    className="mb-6"
                    animated
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
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
                  placeholder="Enter your email address"
                  leftIcon={<Mail className="h-5 w-5" />}
                  disabled={state.status === 'loading' || state.status === 'success'}
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

              {/* Submit Button */}
              {state.status !== 'success' && (
                <Button
                  type="submit"
                  size="lg"
                  fullWidth
                  disabled={!isValid || state.status === 'loading'}
                  loading={state.status === 'loading'}
                  loadingText="Sending..."
                  leftIcon={state.status === 'loading' ? undefined : <Send className="w-5 h-5" />}
                  animated
                  variant={isValid && state.status !== 'loading' ? 'default' : 'secondary'}
                >
                  Send Reset Instructions
                </Button>
              )}

              {/* Resend Button (shown after success) */}
              {state.status === 'success' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    type="button"
                    size="lg"
                    fullWidth
                    variant="outline"
                    disabled={!state.canResend}
                    onClick={handleResend}
                    leftIcon={state.canResend ? <Send className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    animated
                  >
                    {state.canResend ? 'Resend Instructions' : `Resend in ${state.countdown}s`}
                  </Button>
                </motion.div>
              )}
            </form>
          </CardContent>

          <CardFooter className="space-y-4">
            {/* Back to Login */}
            <Button
              variant="ghost"
              size="lg"
              fullWidth
              onClick={() => router.push('/auth/login')}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              animated
            >
              Back to Login
            </Button>

            {/* Help Text */}
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Remember your password?{' '}
                <button
                  onClick={() => router.push('/auth/login')}
                  className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </Container>
  );
};

/**
 * Hook for forgot password functionality
 */
export const useForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendResetInstructions = async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'password_reset' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset instructions');
      }

      return { success: true, message: 'Reset instructions sent successfully' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset instructions';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    sendResetInstructions,
    isLoading,
    error,
    clearError
  };
};

// Export types
export type { ForgotPasswordFormProps, ForgotPasswordState, ForgotPasswordFormData };

export default ForgotPasswordForm;
