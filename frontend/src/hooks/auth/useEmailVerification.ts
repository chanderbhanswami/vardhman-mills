import { useState, useCallback, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import useApi from '../api/useApi';
import useAuth from './useAuth';

export interface EmailVerificationState {
  isVerifying: boolean;
  isVerified: boolean;
  isResending: boolean;
  verificationError: string | null;
  resendError: string | null;
  canResend: boolean;
  resendCountdown: number;
  resendAttempts: number;
}

const RESEND_COOLDOWN = 30; // seconds
const MAX_RESEND_ATTEMPTS = 5;

export const useEmailVerification = () => {
  const api = useApi();
  const auth = useAuth();

  const [state, setState] = useState<EmailVerificationState>({
    isVerifying: false,
    isVerified: false,
    isResending: false,
    verificationError: null,
    resendError: null,
    canResend: true,
    resendCountdown: 0,
    resendAttempts: 0,
  });

  // Load resend attempts from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const attempts = parseInt(localStorage.getItem('email_verification_attempts') || '0', 10);
      const lastResendStr = localStorage.getItem('email_verification_last_resend');
      const lastResend = lastResendStr ? new Date(lastResendStr) : null;
      
      if (lastResend) {
        const timeSinceResend = Date.now() - lastResend.getTime();
        const remainingCooldown = Math.max(0, RESEND_COOLDOWN * 1000 - timeSinceResend);
        
        setState(prev => ({
          ...prev,
          resendAttempts: attempts,
          canResend: remainingCooldown === 0 && attempts < MAX_RESEND_ATTEMPTS,
          resendCountdown: Math.ceil(remainingCooldown / 1000),
        }));
      } else {
        setState(prev => ({
          ...prev,
          resendAttempts: attempts,
          canResend: attempts < MAX_RESEND_ATTEMPTS,
        }));
      }
    }
  }, []);

  // Countdown timer for resend
  useEffect(() => {
    if (state.resendCountdown > 0) {
      const timer = setTimeout(() => {
        setState(prev => ({
          ...prev,
          resendCountdown: prev.resendCountdown - 1,
          canResend: prev.resendCountdown <= 1 && prev.resendAttempts < MAX_RESEND_ATTEMPTS,
        }));
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [state.resendCountdown, state.resendAttempts]);

  // Verify email mutation
  const verifyEmailMutation = useMutation({
    mutationFn: async (token: string) => {
      if (!token) {
        throw new Error('Verification token is required');
      }

      const response = await api.post<{
        message: string;
        success: boolean;
        user?: {
          id: string;
          email: string;
          isEmailVerified: boolean;
        };
      }>('/auth/verify-email', { token });

      if (!response || !response.success) {
        throw new Error(response?.message || 'Email verification failed');
      }

      return response;
    },
    onMutate: () => {
      setState(prev => ({
        ...prev,
        isVerifying: true,
        verificationError: null,
      }));
    },
    onSuccess: (data) => {
      setState(prev => ({
        ...prev,
        isVerifying: false,
        isVerified: true,
        verificationError: null,
      }));

      // Update auth state if user is logged in
      if (auth.user && data.user) {
        auth.refetchUser();
      }

      toast.success(data.message || 'Email verified successfully');
    },
    onError: (error: Error) => {
      setState(prev => ({
        ...prev,
        isVerifying: false,
        verificationError: error.message,
      }));

      toast.error(error.message || 'Email verification failed');
    },
  });

  // Resend verification email mutation
  const resendVerificationMutation = useMutation({
    mutationFn: async () => {
      if (state.resendAttempts >= MAX_RESEND_ATTEMPTS) {
        throw new Error('Maximum resend attempts reached. Please contact support.');
      }

      if (!state.canResend) {
        throw new Error(`Please wait ${state.resendCountdown} seconds before resending`);
      }

      const response = await api.post<{
        message: string;
        success: boolean;
      }>('/auth/resend-verification');

      if (!response || !response.success) {
        throw new Error(response?.message || 'Failed to resend verification email');
      }

      return response;
    },
    onMutate: () => {
      setState(prev => ({
        ...prev,
        isResending: true,
        resendError: null,
      }));
    },
    onSuccess: (data) => {
      const newAttempts = state.resendAttempts + 1;
      
      setState(prev => ({
        ...prev,
        isResending: false,
        resendError: null,
        resendAttempts: newAttempts,
        canResend: false,
        resendCountdown: RESEND_COOLDOWN,
      }));

      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('email_verification_attempts', newAttempts.toString());
        localStorage.setItem('email_verification_last_resend', new Date().toISOString());
      }

      toast.success(data.message || 'Verification email sent');
    },
    onError: (error: Error) => {
      setState(prev => ({
        ...prev,
        isResending: false,
        resendError: error.message,
      }));

      toast.error(error.message || 'Failed to resend verification email');
    },
  });

  // Verify email with token
  const verifyEmail = useCallback((token: string) => {
    verifyEmailMutation.mutate(token);
  }, [verifyEmailMutation]);

  // Resend verification email
  const resendVerification = useCallback(() => {
    if (!auth.isAuthenticated) {
      toast.error('Please log in to resend verification email');
      return;
    }

    if (state.resendAttempts >= MAX_RESEND_ATTEMPTS) {
      toast.error('Maximum resend attempts reached. Please contact support.');
      return;
    }

    if (!state.canResend) {
      toast.error(`Please wait ${state.resendCountdown} seconds before resending`);
      return;
    }

    resendVerificationMutation.mutate();
  }, [auth.isAuthenticated, state.resendAttempts, state.canResend, state.resendCountdown, resendVerificationMutation]);

  // Reset verification state
  const resetState = useCallback(() => {
    setState({
      isVerifying: false,
      isVerified: false,
      isResending: false,
      verificationError: null,
      resendError: null,
      canResend: true,
      resendCountdown: 0,
      resendAttempts: 0,
    });

    if (typeof window !== 'undefined') {
      localStorage.removeItem('email_verification_attempts');
      localStorage.removeItem('email_verification_last_resend');
    }
  }, []);

  // Clear errors
  const clearErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      verificationError: null,
      resendError: null,
    }));
  }, []);

  // Check if user needs verification
  const needsVerification = useCallback(() => {
    return auth.user && !auth.user.isEmailVerified;
  }, [auth.user]);

  // Get time until next resend allowed
  const getTimeUntilNextResend = useCallback(() => {
    if (state.canResend) return 0;
    return state.resendCountdown;
  }, [state.canResend, state.resendCountdown]);

  // Get remaining attempts
  const getRemainingAttempts = useCallback(() => {
    return MAX_RESEND_ATTEMPTS - state.resendAttempts;
  }, [state.resendAttempts]);

  // Format countdown
  const formatCountdown = useCallback(() => {
    if (state.resendCountdown <= 0) return '';
    
    const minutes = Math.floor(state.resendCountdown / 60);
    const seconds = state.resendCountdown % 60;
    
    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    return `${seconds}s`;
  }, [state.resendCountdown]);

  // Auto-verify from URL params (for email links)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token') || urlParams.get('verification_token');
      
      if (token && !state.isVerified && !state.isVerifying) {
        verifyEmail(token);
        
        // Clean URL after verification attempt
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, [state.isVerified, state.isVerifying, verifyEmail]);

  return {
    // State
    isVerifying: state.isVerifying || verifyEmailMutation.isPending,
    isVerified: state.isVerified,
    isResending: state.isResending || resendVerificationMutation.isPending,
    verificationError: state.verificationError,
    resendError: state.resendError,
    canResend: state.canResend,
    resendCountdown: state.resendCountdown,
    resendAttempts: state.resendAttempts,

    // Actions
    verifyEmail,
    resendVerification,
    resetState,
    clearErrors,

    // Utilities
    needsVerification,
    getTimeUntilNextResend,
    getRemainingAttempts,
    formatCountdown,

    // Auth state
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
    userNeedsVerification: needsVerification(),

    // Constants
    maxResendAttempts: MAX_RESEND_ATTEMPTS,
    resendCooldown: RESEND_COOLDOWN,
  };
};

export default useEmailVerification;
