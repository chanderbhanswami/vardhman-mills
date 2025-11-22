import { useState, useCallback, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import useApi from '../api/useApi';

export interface ForgotPasswordFormData {
  email: string;
}

export interface ForgotPasswordState {
  formData: ForgotPasswordFormData;
  errors: { email?: string; general?: string };
  isSubmitting: boolean;
  isFormValid: boolean;
  emailSent: boolean;
  canResend: boolean;
  resendCountdown: number;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_COOLDOWN = 60; // seconds

export const useForgotPassword = () => {
  const api = useApi();

  const [state, setState] = useState<ForgotPasswordState>({
    formData: { email: '' },
    errors: {},
    isSubmitting: false,
    isFormValid: false,
    emailSent: false,
    canResend: true,
    resendCountdown: 0,
  });

  // Validate email
  const validateEmail = useCallback((email: string): string | undefined => {
    if (!email.trim()) {
      return 'Email is required';
    }
    if (!EMAIL_REGEX.test(email)) {
      return 'Please enter a valid email address';
    }
    return undefined;
  }, []);

  // Update form data
  const updateFormData = useCallback((updates: Partial<ForgotPasswordFormData>) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...updates },
    }));
  }, []);

  // Update field
  const updateField = useCallback((field: keyof ForgotPasswordFormData, value: string) => {
    updateFormData({ [field]: value });
  }, [updateFormData]);

  // Validate form
  useEffect(() => {
    const emailError = validateEmail(state.formData.email);
    const errors = emailError ? { email: emailError } : {};
    
    setState(prev => ({
      ...prev,
      errors,
      isFormValid: Object.keys(errors).length === 0,
    }));
  }, [state.formData.email, validateEmail]);

  // Countdown timer for resend
  useEffect(() => {
    if (state.resendCountdown > 0) {
      const timer = setTimeout(() => {
        setState(prev => ({
          ...prev,
          resendCountdown: prev.resendCountdown - 1,
          canResend: prev.resendCountdown <= 1,
        }));
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [state.resendCountdown]);

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: async (formData: ForgotPasswordFormData) => {
      const emailError = validateEmail(formData.email);
      if (emailError) {
        throw new Error(emailError);
      }

      const response = await api.post<{
        message: string;
        success: boolean;
      }>('/auth/forgot-password', formData);

      if (!response) {
        throw new Error('Failed to send reset email');
      }

      return response;
    },
    onSuccess: (data) => {
      setState(prev => ({
        ...prev,
        isSubmitting: false,
        emailSent: true,
        canResend: false,
        resendCountdown: RESEND_COOLDOWN,
        errors: {},
      }));

      toast.success(data.message || 'Password reset email sent successfully');
    },
    onError: (error: Error) => {
      setState(prev => ({
        ...prev,
        isSubmitting: false,
        errors: { general: error.message },
      }));

      toast.error(error.message || 'Failed to send reset email');
    },
  });

  // Submit form
  const handleSubmit = useCallback((e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!state.isFormValid) {
      toast.error('Please fix form errors before submitting');
      return;
    }

    setState(prev => ({ ...prev, isSubmitting: true, errors: {} }));
    forgotPasswordMutation.mutate(state.formData);
  }, [state.isFormValid, state.formData, forgotPasswordMutation]);

  // Resend email
  const resendEmail = useCallback(() => {
    if (!state.canResend) {
      toast.error(`Please wait ${state.resendCountdown} seconds before resending`);
      return;
    }

    handleSubmit();
  }, [state.canResend, state.resendCountdown, handleSubmit]);

  // Reset form
  const resetForm = useCallback(() => {
    setState({
      formData: { email: '' },
      errors: {},
      isSubmitting: false,
      isFormValid: false,
      emailSent: false,
      canResend: true,
      resendCountdown: 0,
    });
  }, []);

  // Clear errors
  const clearErrors = useCallback(() => {
    setState(prev => ({ ...prev, errors: {} }));
  }, []);

  return {
    // State
    formData: state.formData,
    errors: state.errors,
    isSubmitting: state.isSubmitting || forgotPasswordMutation.isPending,
    isFormValid: state.isFormValid,
    emailSent: state.emailSent,
    canResend: state.canResend,
    resendCountdown: state.resendCountdown,

    // Actions
    updateField,
    updateFormData,
    handleSubmit,
    resendEmail,
    resetForm,
    clearErrors,

    // Utilities
    validateEmail,
  };
};

export default useForgotPassword;
