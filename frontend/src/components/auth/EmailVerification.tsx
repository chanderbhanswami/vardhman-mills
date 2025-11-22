/**
 * EmailVerification Component - Vardhman Mills Frontend
 * 
 * Component for handling email verification process including
 * sending verification emails and verifying tokens.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Clock,
  ArrowRight,
  Shield,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

// Types
interface VerificationState {
  status: 'idle' | 'sending' | 'sent' | 'verifying' | 'verified' | 'error';
  message: string;
  canResend: boolean;
  countdown: number;
}

interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isEmailVerified?: boolean;
}

interface EmailVerificationProps {
  className?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  redirectTo?: string;
}

/**
 * EmailVerification Component
 * 
 * Handles the complete email verification flow including:
 * - Sending verification emails
 * - Token verification
 * - Resend functionality with cooldown
 * - Success/error states
 */
export const EmailVerification: React.FC<EmailVerificationProps> = ({
  className = '',
  onSuccess,
  onError,
  redirectTo = '/dashboard'
}) => {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get token from URL params
  const token = searchParams?.get('token');
  const email = searchParams?.get('email') || session?.user?.email;
  
  const [verificationState, setVerificationState] = useState<VerificationState>({
    status: 'idle',
    message: '',
    canResend: true,
    countdown: 0
  });

  // Auto-verify if token is present in URL
  useEffect(() => {
    const autoVerify = async (verificationToken: string) => {
      setVerificationState({
        status: 'verifying',
        message: 'Verifying your email address...',
        canResend: false,
        countdown: 0
      });
  
      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: verificationToken }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          setVerificationState({
            status: 'verified',
            message: 'Email verified successfully! Redirecting...',
            canResend: false,
            countdown: 0
          });
          
          // Update session to reflect verified status
          await updateSession();
          
          toast.success('Email verified successfully!');
          onSuccess?.();
          
          // Redirect after a short delay
          setTimeout(() => {
            router.push(redirectTo);
          }, 2000);
        } else {
          throw new Error(data.message || 'Email verification failed');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Email verification failed';
        setVerificationState({
          status: 'error',
          message: errorMessage,
          canResend: true,
          countdown: 0
        });
        toast.error(errorMessage);
        onError?.(errorMessage);
      }
    };
    
    if (token) {
      autoVerify(token);
    }
  }, [token, updateSession, onSuccess, onError, router, redirectTo]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (verificationState.countdown > 0) {
      interval = setInterval(() => {
        setVerificationState(prev => ({
          ...prev,
          countdown: prev.countdown - 1,
          canResend: prev.countdown <= 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [verificationState.countdown]);

  /**
   * Send verification email
   */
  const sendVerificationEmail = async () => {
    if (!email) {
      toast.error('No email address found');
      return;
    }

    setVerificationState({
      status: 'sending',
      message: 'Sending verification email...',
      canResend: false,
      countdown: 60
    });

    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setVerificationState({
          status: 'sent',
          message: `Verification email sent to ${email}. Please check your inbox and spam folder.`,
          canResend: false,
          countdown: 60
        });
        toast.success('Verification email sent successfully!');
      } else {
        throw new Error(data.message || 'Failed to send verification email');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send verification email';
      setVerificationState({
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
   * Get status icon based on current state
   */
  const getStatusIcon = () => {
    switch (verificationState.status) {
      case 'sending':
      case 'verifying':
        return <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />;
      case 'sent':
        return <Mail className="w-8 h-8 text-blue-600" />;
      case 'verified':
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'error':
        return <XCircle className="w-8 h-8 text-red-600" />;
      default:
        return <Shield className="w-8 h-8 text-gray-400" />;
    }
  };

  /**
   * Get status color based on current state
   */
  const getStatusColor = () => {
    switch (verificationState.status) {
      case 'sending':
      case 'verifying':
      case 'sent':
        return 'blue';
      case 'verified':
        return 'green';
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  };

  const statusColor = getStatusColor();
  const isLoading = verificationState.status === 'sending' || verificationState.status === 'verifying';

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-2xl shadow-xl px-8 py-12">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ 
                scale: verificationState.status === 'verified' ? [1, 1.1, 1] : 1,
                rotate: verificationState.status === 'sending' || verificationState.status === 'verifying' ? 360 : 0
              }}
              transition={{ 
                scale: { duration: 0.6 },
                rotate: { duration: 2, repeat: Infinity, ease: "linear" }
              }}
              className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center bg-${statusColor}-100`}
            >
              {getStatusIcon()}
            </motion.div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {verificationState.status === 'verified' ? 'Email Verified!' : 'Verify Your Email'}
            </h2>
            
            <p className="text-gray-600">
              {email ? `We need to verify ${email}` : 'Please verify your email address to continue'}
            </p>
          </div>

          {/* Status Message */}
          <AnimatePresence mode="wait">
            {verificationState.message && (
              <motion.div
                key={verificationState.status}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className={`mb-6 p-4 rounded-xl bg-${statusColor}-50 border border-${statusColor}-200`}
              >
                <p className={`text-sm text-${statusColor}-800`}>
                  {verificationState.message}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Send/Resend Email Button */}
            {verificationState.status !== 'verified' && (
              <motion.button
                whileHover={{ scale: verificationState.canResend ? 1.02 : 1 }}
                whileTap={{ scale: verificationState.canResend ? 0.98 : 1 }}
                onClick={sendVerificationEmail}
                disabled={!verificationState.canResend || isLoading}
                className={`w-full flex items-center justify-center px-6 py-3 rounded-xl text-white font-medium transition-all ${
                  verificationState.canResend && !isLoading
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : verificationState.status === 'idle' ? (
                  <Mail className="w-5 h-5 mr-2" />
                ) : (
                  <RefreshCw className="w-5 h-5 mr-2" />
                )}
                
                {verificationState.countdown > 0 ? (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    Resend in {verificationState.countdown}s
                  </>
                ) : verificationState.status === 'idle' ? (
                  'Send Verification Email'
                ) : (
                  'Resend Verification Email'
                )}
              </motion.button>
            )}

            {/* Continue Button (after verification) */}
            {verificationState.status === 'verified' && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(redirectTo)}
                className="w-full flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                Continue to Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </motion.button>
            )}

            {/* Back to Login */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/auth/login')}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all"
            >
              Back to Login
            </motion.button>
          </div>

          {/* Help Text */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Didn&apos;t receive the email? Check your spam folder or contact support.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/**
 * Hook for managing email verification state
 */
export const useEmailVerification = () => {
  const { data: session, update: updateSession } = useSession();
  const [isVerifying, setIsVerifying] = useState(false);
  
  const sendVerification = async (email: string) => {
    setIsVerifying(true);
    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      return { success: true, message: 'Verification email sent' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send verification';
      return { success: false, message };
    } finally {
      setIsVerifying(false);
    }
  };
  
  const verifyEmail = async (token: string) => {
    setIsVerifying(true);
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      await updateSession();
      return { success: true, message: 'Email verified successfully' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Verification failed';
      return { success: false, message };
    } finally {
      setIsVerifying(false);
    }
  };
  
  return {
    sendVerification,
    verifyEmail,
    isVerifying,
    isEmailVerified: (session?.user as SessionUser)?.isEmailVerified || false
  };
};

export default EmailVerification;
