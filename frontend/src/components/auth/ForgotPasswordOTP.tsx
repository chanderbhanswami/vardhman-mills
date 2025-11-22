/**
 * ForgotPasswordOTP Component - Vardhman Mills Frontend
 * 
 * OTP verification component for password reset process.
 * Handles OTP input, verification, and resend functionality.
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  ArrowLeft, 
  Loader2, 
  Clock,
  Mail
} from 'lucide-react';
import toast from 'react-hot-toast';

// Types
interface ForgotPasswordOTPProps {
  className?: string;
  onSuccess?: (token: string) => void;
  onError?: (error: string) => void;
  onResend?: () => void;
  email?: string;
  otpLength?: number;
}

interface OTPState {
  status: 'idle' | 'verifying' | 'success' | 'error' | 'resending';
  message: string;
  canResend: boolean;
  countdown: number;
  attempts: number;
}

/**
 * ForgotPasswordOTP Component
 * 
 * Provides OTP verification interface for password reset process.
 * Features auto-focus, paste support, and resend functionality.
 */
export const ForgotPasswordOTP: React.FC<ForgotPasswordOTPProps> = ({
  className = '',
  onSuccess,
  onError,
  onResend,
  email: propEmail,
  otpLength = 6
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get email from props or URL params
  const email = propEmail || searchParams?.get('email') || '';
  
  const [otp, setOtp] = useState<string[]>(new Array(otpLength).fill(''));
  const [state, setState] = useState<OTPState>({
    status: 'idle',
    message: '',
    canResend: false,
    countdown: 60,
    attempts: 0
  });

  // Refs for OTP inputs
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize countdown on mount
  useEffect(() => {
    setState(prev => ({ ...prev, countdown: 60 }));
  }, []);

  // Countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.countdown > 0 && !state.canResend) {
      interval = setInterval(() => {
        setState(prev => ({
          ...prev,
          countdown: prev.countdown - 1,
          canResend: prev.countdown <= 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.countdown, state.canResend]);

  // Auto-submit when OTP is complete
  useEffect(() => {
    const otpString = otp.join('');
    if (otpString.length === otpLength && /^\d+$/.test(otpString)) {
      // Inline verification to avoid dependency issues
      if (!email) {
        toast.error('Email is required for OTP verification');
        return;
      }
  
      setState(prev => ({ 
        ...prev, 
        status: 'verifying', 
        message: 'Verifying OTP...' 
      }));
  
      (async () => {
        try {
          const response = await fetch('/api/auth/verify-otp', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              otp: otpString,
              type: 'password_reset'
            }),
          });
  
          const data = await response.json();
  
          if (response.ok) {
            setState(prev => ({ 
              ...prev, 
              status: 'success', 
              message: 'OTP verified successfully! Redirecting...' 
            }));
  
            toast.success('OTP verified successfully!');
            onSuccess?.(data.token || otpString);
  
            // Redirect to reset password page
            setTimeout(() => {
              router.push(`/auth/reset-password?token=${data.token}&email=${encodeURIComponent(email)}`);
            }, 1500);
          } else {
            throw new Error(data.message || 'Invalid OTP');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'OTP verification failed';
          
          setState(prev => ({ 
            ...prev, 
            status: 'error', 
            message: errorMessage,
            attempts: prev.attempts + 1
          }));
  
          // Clear OTP on error
          setOtp(new Array(otpLength).fill(''));
          inputRefs.current[0]?.focus();
  
          toast.error(errorMessage);
          onError?.(errorMessage);
        }
      })();
    }
  }, [otp, otpLength, email, onSuccess, onError, router]);

  /**
   * Handle OTP input change
   */
  const handleOTPChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value && index < otpLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  /**
   * Handle backspace and navigation
   */
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous input if current is empty
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < otpLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  /**
   * Handle paste functionality
   */
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '');
    
    if (pastedData.length <= otpLength) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i] || '';
      }
      setOtp(newOtp);
      
      // Focus on the next empty input or the last input
      const nextIndex = Math.min(pastedData.length, otpLength - 1);
      inputRefs.current[nextIndex]?.focus();
    }
  };



  /**
   * Resend OTP
   */
  const handleResendOTP = async () => {
    if (!email) {
      toast.error('Email is required');
      return;
    }

    setState(prev => ({ 
      ...prev, 
      status: 'resending', 
      message: 'Sending new OTP...',
      canResend: false,
      countdown: 60
    }));

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          type: 'password_reset'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setState(prev => ({ 
          ...prev, 
          status: 'idle', 
          message: 'New OTP sent to your email',
          countdown: 60
        }));

        // Clear current OTP
        setOtp(new Array(otpLength).fill(''));
        inputRefs.current[0]?.focus();

        toast.success('New OTP sent successfully!');
        onResend?.();
      } else {
        throw new Error(data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend OTP';
      
      setState(prev => ({ 
        ...prev, 
        status: 'error', 
        message: errorMessage,
        canResend: true,
        countdown: 0
      }));

      toast.error(errorMessage);
    }
  };

  /**
   * Get status color
   */
  const getStatusColor = () => {
    switch (state.status) {
      case 'verifying':
      case 'resending':
        return 'blue';
      case 'success':
        return 'green';
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  };

  /**
   * Get status icon
   */
  const getStatusIcon = () => {
    switch (state.status) {
      case 'verifying':
      case 'resending':
        return <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return <Shield className="w-6 h-6 text-gray-400" />;
    }
  };

  const statusColor = getStatusColor();
  const isLoading = state.status === 'verifying' || state.status === 'resending';

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-xl px-8 py-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ 
              scale: state.status === 'success' ? [1, 1.1, 1] : 1,
            }}
            transition={{ duration: 0.6 }}
            className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center bg-${statusColor}-100`}
          >
            {getStatusIcon()}
          </motion.div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {state.status === 'success' ? 'OTP Verified!' : 'Enter Verification Code'}
          </h2>
          
          <p className="text-gray-600">
            {email ? (
              <>
                We sent a 6-digit code to{' '}
                <span className="font-medium text-gray-900">{email}</span>
              </>
            ) : (
              'Enter the verification code sent to your email'
            )}
          </p>
        </div>

        {/* Status Message */}
        <AnimatePresence mode="wait">
          {state.message && (
            <motion.div
              key={state.status}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className={`mb-6 p-4 rounded-xl bg-${statusColor}-50 border border-${statusColor}-200`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 mr-3">
                  {getStatusIcon()}
                </div>
                <p className={`text-sm text-${statusColor}-800`}>
                  {state.message}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* OTP Input */}
        {state.status !== 'success' && (
          <div className="mb-8">
            <div className="flex justify-center space-x-3">
              {otp.map((digit, index) => (
                <motion.input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={isLoading}
                  className={`w-12 h-14 text-center text-lg font-semibold border-2 rounded-xl transition-all focus:outline-none ${
                    digit
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'
                  } ${
                    isLoading ? 'cursor-not-allowed bg-gray-100' : 'cursor-text'
                  } ${
                    state.status === 'error' && !digit
                      ? 'border-red-300 bg-red-50'
                      : ''
                  }`}
                  whileFocus={{ scale: 1.05 }}
                />
              ))}
            </div>
            
            {/* Attempts counter */}
            {state.attempts > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-sm text-red-600 mt-3"
              >
                {state.attempts} incorrect attempt{state.attempts > 1 ? 's' : ''}
              </motion.p>
            )}
          </div>
        )}

        {/* Resend Section */}
        {state.status !== 'success' && (
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 mb-4">
              Didn&apos;t receive the code?
            </p>
            
            <motion.button
              whileHover={{ scale: state.canResend ? 1.02 : 1 }}
              whileTap={{ scale: state.canResend ? 0.98 : 1 }}
              onClick={handleResendOTP}
              disabled={!state.canResend || isLoading}
              className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                state.canResend && !isLoading
                  ? 'text-blue-600 hover:bg-blue-50 border border-blue-200'
                  : 'text-gray-400 cursor-not-allowed border border-gray-200'
              }`}
            >
              {state.status === 'resending' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : state.canResend ? (
                <RefreshCw className="w-4 h-4 mr-2" />
              ) : (
                <Clock className="w-4 h-4 mr-2" />
              )}
              
              {state.canResend 
                ? 'Resend Code' 
                : `Resend in ${state.countdown}s`
              }
            </motion.button>
          </div>
        )}

        {/* Continue Button (after success) */}
        {state.status === 'success' && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={() => router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`)}
            className="w-full flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            Continue to Reset Password
          </motion.button>
        )}

        {/* Navigation */}
        <div className="flex flex-col space-y-4 mt-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/auth/forgot-password')}
            className="flex items-center justify-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Try Different Email
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/auth/login')}
            className="flex items-center justify-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Mail className="w-4 h-4 mr-2" />
            Back to Login
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

/**
 * Hook for OTP verification
 */
export const useForgotPasswordOTP = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyOTP = async (email: string, otp: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, type: 'password_reset' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }

      return { success: true, token: data.token };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'OTP verification failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async (email: string) => {
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
        throw new Error(data.message || 'Failed to resend OTP');
      }

      return { success: true, message: 'OTP sent successfully' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend OTP';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    verifyOTP,
    resendOTP,
    isLoading,
    error,
    clearError: () => setError(null)
  };
};

// Export types
export type { ForgotPasswordOTPProps, OTPState };

export default ForgotPasswordOTP;
