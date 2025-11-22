/**
 * OTPVerification Component - Vardhman Mills Frontend
 * 
 * General-purpose OTP verification component for multiple use cases:
 * - Email verification
 * - Phone verification  
 * - Two-factor authentication
 * - Password reset
 */

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
// import { useRouter } from 'next/navigation'; // Unused
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Smartphone,
  Mail,
  Lock,
  ArrowLeft,
  Send
} from 'lucide-react';
import toast from 'react-hot-toast';

// Types
interface OTPVerificationProps {
  /** Length of the OTP (default: 6) */
  length?: number;
  /** Type of OTP verification */
  type: 'email' | 'phone' | '2fa' | 'password-reset';
  /** Target (email or phone) for verification */
  target: string;
  /** Callback when OTP is successfully verified */
  onVerified: (otp: string) => void;
  /** Callback when verification fails */
  onError?: (error: string) => void;
  /** Callback when user wants to go back */
  onBack?: () => void;
  /** Custom verification API endpoint */
  verifyEndpoint?: string;
  /** Custom resend API endpoint */
  resendEndpoint?: string;
  /** Auto-submit when OTP is complete */
  autoSubmit?: boolean;
  /** Allow paste functionality */
  allowPaste?: boolean;
  /** Resend cooldown in seconds (default: 60) */
  resendCooldown?: number;
  /** Maximum verification attempts (default: 3) */
  maxAttempts?: number;
  /** Session token for verification */
  sessionToken?: string;
  /** Custom styling */
  className?: string;
  /** Show back button */
  showBackButton?: boolean;
}

interface OTPState {
  values: string[];
  isVerifying: boolean;
  isResending: boolean;
  resendCountdown: number;
  attempts: number;
  isBlocked: boolean;
  error: string | null;
}

/**
 * Individual OTP Input Component
 */
const OTPInput = React.forwardRef<HTMLInputElement, {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  index: number;
  isDisabled: boolean;
  hasError: boolean;
}>(({ value, onChange, onKeyDown, index, isDisabled, hasError }, ref) => {
  return (
    <motion.input
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: index * 0.1 }}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={1}
      value={value}
      onChange={(e) => {
        const val = e.target.value.replace(/[^0-9]/g, '');
        onChange(val);
      }}
      onKeyDown={onKeyDown}
      disabled={isDisabled}
      ref={ref}
      className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-xl transition-all focus:outline-none ${
        hasError
          ? 'border-red-400 bg-red-50 text-red-600'
          : value
          ? 'border-blue-500 bg-blue-50 text-blue-600'
          : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500'
      } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}`}
    />
  );
});

OTPInput.displayName = 'OTPInput';

/**
 * OTPVerification Component
 * 
 * Comprehensive OTP verification with multiple input types,
 * auto-focus, paste support, and resend functionality.
 */
export const OTPVerification: React.FC<OTPVerificationProps> = ({
  length = 6,
  type,
  target,
  onVerified,
  onError,
  onBack,
  verifyEndpoint = '/api/auth/verify-otp',
  resendEndpoint = '/api/auth/resend-otp',
  autoSubmit = true,
  allowPaste = true,
  resendCooldown = 60,
  maxAttempts = 3,
  sessionToken,
  className = '',
  showBackButton = true
}) => {
  // const router = useRouter(); // Removed unused
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [state, setState] = useState<OTPState>({
    values: new Array(length).fill(''),
    isVerifying: false,
    isResending: false,
    resendCountdown: 0,
    attempts: 0,
    isBlocked: false,
    error: null
  });

  /**
   * Handle OTP input change
   */
  const handleInputChange = (index: number, value: string) => {
    if (state.isBlocked || state.isVerifying) return;

    const newValues = [...state.values];
    newValues[index] = value;

    setState(prev => ({
      ...prev,
      values: newValues,
      error: null
    }));

    // Auto-focus next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (autoSubmit && newValues.every(v => v !== '') && newValues.join('').length === length) {
      verifyOTP(newValues.join(''));
    }
  };

  /**
   * Handle key down events
   */
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (state.isBlocked || state.isVerifying) return;

    if (e.key === 'Backspace') {
      if (!state.values[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newValues = [...state.values];
        newValues[index] = '';
        setState(prev => ({ ...prev, values: newValues, error: null }));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === 'Enter') {
      const otp = state.values.join('');
      if (otp.length === length) {
        verifyOTP(otp);
      }
    }
  };

  /**
   * Handle paste functionality
   */
  const handlePaste = (e: React.ClipboardEvent) => {
    if (!allowPaste || state.isBlocked || state.isVerifying) return;

    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
    
    if (pasteData.length === length) {
      const newValues = pasteData.split('');
      setState(prev => ({ ...prev, values: newValues, error: null }));
      
      // Focus last input
      inputRefs.current[length - 1]?.focus();

      // Auto-submit if enabled
      if (autoSubmit) {
        verifyOTP(pasteData);
      }
    } else {
      toast.error(`Please paste a ${length}-digit code`);
    }
  };

  /**
   * Verify OTP
   */
  const verifyOTP = useCallback(async (otp: string) => {
    if (state.isBlocked) return;

    setState(prev => ({ ...prev, isVerifying: true, error: null }));

    try {
      const response = await fetch(verifyEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          otp,
          type,
          target,
          sessionToken
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      // Success
      toast.success('OTP verified successfully!');
      onVerified(otp);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Verification failed';
      
      const newAttempts = state.attempts + 1;
      const isBlocked = newAttempts >= maxAttempts;

      setState(prev => ({
        ...prev,
        attempts: newAttempts,
        isBlocked,
        error: errorMessage,
        values: new Array(length).fill('') // Clear inputs on error
      }));

      if (isBlocked) {
        toast.error(`Maximum attempts reached. Please request a new code.`);
      } else {
        toast.error(`${errorMessage}. ${maxAttempts - newAttempts} attempts remaining.`);
      }

      onError?.(errorMessage);

      // Focus first input for retry
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);

    } finally {
      setState(prev => ({ ...prev, isVerifying: false }));
    }
  }, [state.isBlocked, state.attempts, verifyEndpoint, type, target, sessionToken, maxAttempts, length, onVerified, onError]);

  /**
   * Resend OTP
   */
  const resendOTP = async () => {
    if (state.isResending || state.resendCountdown > 0) return;

    setState(prev => ({ 
      ...prev, 
      isResending: true, 
      error: null,
      values: new Array(length).fill(''),
      attempts: 0,
      isBlocked: false
    }));

    try {
      const response = await fetch(resendEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type,
          target,
          sessionToken
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend code');
      }

      toast.success('New verification code sent!');
      
      // Start countdown
      setState(prev => ({ ...prev, resendCountdown: resendCooldown }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend code';
      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setState(prev => ({ ...prev, isResending: false }));
    }
  };

  /**
   * Manual verify button handler
   */
  const handleManualVerify = () => {
    const otp = state.values.join('');
    if (otp.length === length) {
      verifyOTP(otp);
    } else {
      toast.error(`Please enter the complete ${length}-digit code`);
    }
  };

  /**
   * Clear OTP and reset
   */
  const clearOTP = () => {
    setState(prev => ({
      ...prev,
      values: new Array(length).fill(''),
      error: null
    }));
    inputRefs.current[0]?.focus();
  };

  /**
   * Get type-specific configuration
   */
  const getTypeConfig = () => {
    switch (type) {
      case 'email':
        return {
          icon: Mail,
          title: 'Check your email',
          description: `We've sent a ${length}-digit verification code to`,
          actionText: 'verify your email address'
        };
      case 'phone':
        return {
          icon: Smartphone,
          title: 'Check your phone',
          description: `We've sent a ${length}-digit verification code to`,
          actionText: 'verify your phone number'
        };
      case '2fa':
        return {
          icon: Shield,
          title: 'Two-factor authentication',
          description: `Enter the ${length}-digit code from your authenticator app`,
          actionText: 'complete login'
        };
      case 'password-reset':
        return {
          icon: Lock,
          title: 'Reset your password',
          description: `We've sent a ${length}-digit verification code to`,
          actionText: 'reset your password'
        };
      default:
        return {
          icon: Shield,
          title: 'Verify your identity',
          description: `Enter the ${length}-digit verification code`,
          actionText: 'continue'
        };
    }
  };

  const config = getTypeConfig();
  const IconComponent = config.icon;

  // Countdown effect
  useEffect(() => {
    if (state.resendCountdown > 0) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, resendCountdown: prev.resendCountdown - 1 }));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.resendCountdown]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const isComplete = state.values.every(v => v !== '');
  const canResend = state.resendCountdown === 0 && !state.isResending;

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
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <IconComponent className="w-8 h-8 text-blue-600" />
          </motion.div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{config.title}</h2>
          <p className="text-gray-600 mb-2">
            {config.description}
            {(type === 'email' || type === 'phone' || type === 'password-reset') && (
              <span className="font-medium text-gray-900"> {target}</span>
            )}
          </p>
          <p className="text-sm text-gray-500">
            Enter the code to {config.actionText}
          </p>
        </div>

        {/* OTP Inputs */}
        <div className="mb-8">
          <div 
            className="flex justify-center space-x-3 mb-4"
            onPaste={handlePaste}
          >
            {state.values.map((value, index) => (
              <OTPInput
                key={index}
                value={value}
                onChange={(val) => handleInputChange(index, val)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                index={index}
                isDisabled={state.isBlocked || state.isVerifying}
                hasError={!!state.error}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
              />
            ))}
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {state.error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl"
              >
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <p className="text-sm text-red-800">{state.error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Attempts Warning */}
          {state.attempts > 0 && !state.isBlocked && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl"
            >
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                <p className="text-sm text-yellow-800">
                  {state.attempts} failed attempt{state.attempts > 1 ? 's' : ''}. 
                  {maxAttempts - state.attempts} remaining.
                </p>
              </div>
            </motion.div>
          )}

          {/* Manual Verify Button (if not auto-submit) */}
          {!autoSubmit && (
            <motion.button
              whileHover={{ scale: isComplete && !state.isVerifying ? 1.02 : 1 }}
              whileTap={{ scale: isComplete && !state.isVerifying ? 0.98 : 1 }}
              onClick={handleManualVerify}
              disabled={!isComplete || state.isVerifying || state.isBlocked}
              className={`w-full flex items-center justify-center px-6 py-3 rounded-xl text-white font-medium transition-all mb-4 ${
                isComplete && !state.isVerifying && !state.isBlocked
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {state.isVerifying ? (
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-5 h-5 mr-2" />
              )}
              {state.isVerifying ? 'Verifying...' : 'Verify Code'}
            </motion.button>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-4">
          {/* Resend Code */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Didn&apos;t receive the code?
            </p>
            
            {canResend ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resendOTP}
                disabled={state.isResending}
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                {state.isResending ? (
                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-1" />
                )}
                {state.isResending ? 'Sending...' : 'Resend code'}
              </motion.button>
            ) : (
              <div className="inline-flex items-center text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                <span>Resend in {state.resendCountdown}s</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            {showBackButton && onBack && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onBack}
                className="flex-1 flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={clearOTP}
              disabled={state.isVerifying}
              className="flex-1 flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Clear
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/**
 * Hook for OTP verification functionality
 */
export const useOTPVerification = (type: string, target: string) => {
  const [state, setState] = useState({
    isLoading: false,
    error: null as string | null,
    isVerified: false
  });

  const verify = async (otp: string, sessionToken?: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp, type, target, sessionToken })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      setState(prev => ({ ...prev, isVerified: true }));
      return { success: true, data };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Verification failed';
      setState(prev => ({ ...prev, error: errorMessage }));
      return { success: false, error: errorMessage };

    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const resend = async (sessionToken?: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, target, sessionToken })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend code');
      }

      return { success: true, data };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend code';
      setState(prev => ({ ...prev, error: errorMessage }));
      return { success: false, error: errorMessage };

    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return {
    ...state,
    verify,
    resend,
    clearError: () => setState(prev => ({ ...prev, error: null })),
    reset: () => setState({ isLoading: false, error: null, isVerified: false })
  };
};

// Export types
export type { OTPVerificationProps, OTPState };

export default OTPVerification;
