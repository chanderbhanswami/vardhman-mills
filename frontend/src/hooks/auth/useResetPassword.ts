import { useState, useCallback, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import useApi from '../api/useApi';

export interface ResetPasswordFormData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordState {
  formData: ResetPasswordFormData;
  errors: {
    token?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  };
  isSubmitting: boolean;
  isFormValid: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  resetSuccess: boolean;
  passwordStrength: {
    score: number;
    feedback: string[];
    requirements: {
      minLength: boolean;
      hasUpper: boolean;
      hasLower: boolean;
      hasNumber: boolean;
      hasSpecial: boolean;
    };
  };
}

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = {
  hasUpper: /[A-Z]/,
  hasLower: /[a-z]/,
  hasNumber: /\d/,
  hasSpecial: /[!@#$%^&*(),.?":{}|<>]/,
};

export const useResetPassword = (initialToken?: string) => {
  const api = useApi();

  const [state, setState] = useState<ResetPasswordState>({
    formData: {
      token: initialToken || '',
      password: '',
      confirmPassword: '',
    },
    errors: {},
    isSubmitting: false,
    isFormValid: false,
    showPassword: false,
    showConfirmPassword: false,
    resetSuccess: false,
    passwordStrength: {
      score: 0,
      feedback: [],
      requirements: {
        minLength: false,
        hasUpper: false,
        hasLower: false,
        hasNumber: false,
        hasSpecial: false,
      },
    },
  });

  // Calculate password strength
  const calculatePasswordStrength = useCallback((password: string) => {
    const requirements = {
      minLength: password.length >= PASSWORD_MIN_LENGTH,
      hasUpper: PASSWORD_REGEX.hasUpper.test(password),
      hasLower: PASSWORD_REGEX.hasLower.test(password),
      hasNumber: PASSWORD_REGEX.hasNumber.test(password),
      hasSpecial: PASSWORD_REGEX.hasSpecial.test(password),
    };

    const score = Object.values(requirements).filter(Boolean).length;
    const feedback: string[] = [];

    if (!requirements.minLength) {
      feedback.push(`At least ${PASSWORD_MIN_LENGTH} characters`);
    }
    if (!requirements.hasUpper) {
      feedback.push('One uppercase letter');
    }
    if (!requirements.hasLower) {
      feedback.push('One lowercase letter');
    }
    if (!requirements.hasNumber) {
      feedback.push('One number');
    }
    if (!requirements.hasSpecial) {
      feedback.push('One special character');
    }

    return {
      score,
      feedback,
      requirements,
    };
  }, []);

  // Validate token
  const validateToken = useCallback((token: string): string | undefined => {
    if (!token.trim()) {
      return 'Reset token is required';
    }
    return undefined;
  }, []);

  // Validate password
  const validatePassword = useCallback((password: string): string | undefined => {
    if (!password) {
      return 'Password is required';
    }

    const strength = calculatePasswordStrength(password);
    
    if (!strength.requirements.minLength) {
      return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
    }
    if (strength.score < 4) {
      return 'Password is too weak. ' + strength.feedback.join(', ');
    }

    return undefined;
  }, [calculatePasswordStrength]);

  // Validate confirm password
  const validateConfirmPassword = useCallback((confirmPassword: string, password: string): string | undefined => {
    if (!confirmPassword) {
      return 'Please confirm your password';
    }
    if (confirmPassword !== password) {
      return 'Passwords do not match';
    }
    return undefined;
  }, []);

  // Update form data
  const updateFormData = useCallback((updates: Partial<ResetPasswordFormData>) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...updates },
    }));
  }, []);

  // Update field
  const updateField = useCallback((field: keyof ResetPasswordFormData, value: string) => {
    updateFormData({ [field]: value });
  }, [updateFormData]);

  // Update password strength when password changes
  useEffect(() => {
    const strength = calculatePasswordStrength(state.formData.password);
    setState(prev => ({ ...prev, passwordStrength: strength }));
  }, [state.formData.password, calculatePasswordStrength]);

  // Validate form
  useEffect(() => {
    const errors: ResetPasswordState['errors'] = {};

    const tokenError = validateToken(state.formData.token);
    if (tokenError) errors.token = tokenError;

    const passwordError = validatePassword(state.formData.password);
    if (passwordError) errors.password = passwordError;

    const confirmPasswordError = validateConfirmPassword(
      state.formData.confirmPassword,
      state.formData.password
    );
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

    const isValid = Object.keys(errors).length === 0;
    
    setState(prev => ({
      ...prev,
      errors,
      isFormValid: isValid,
    }));
  }, [state.formData, validateToken, validatePassword, validateConfirmPassword]);

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (formData: ResetPasswordFormData) => {
      if (!state.isFormValid) {
        throw new Error('Please fix all form errors');
      }

      const response = await api.post<{
        message: string;
        success: boolean;
      }>('/auth/reset-password', {
        token: formData.token,
        password: formData.password,
      });

      if (!response) {
        throw new Error('Password reset failed');
      }

      return response;
    },
    onSuccess: (data) => {
      setState(prev => ({
        ...prev,
        isSubmitting: false,
        resetSuccess: true,
        errors: {},
      }));

      toast.success(data.message || 'Password reset successfully');
    },
    onError: (error: Error) => {
      setState(prev => ({
        ...prev,
        isSubmitting: false,
        errors: { general: error.message },
      }));

      toast.error(error.message || 'Password reset failed');
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
    resetPasswordMutation.mutate(state.formData);
  }, [state.isFormValid, state.formData, resetPasswordMutation]);

  // Toggle password visibility
  const togglePasswordVisibility = useCallback(() => {
    setState(prev => ({ ...prev, showPassword: !prev.showPassword }));
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setState(prev => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }));
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    setState(prev => ({
      ...prev,
      formData: {
        token: initialToken || '',
        password: '',
        confirmPassword: '',
      },
      errors: {},
      isSubmitting: false,
      showPassword: false,
      showConfirmPassword: false,
      resetSuccess: false,
    }));
  }, [initialToken]);

  // Clear errors
  const clearErrors = useCallback(() => {
    setState(prev => ({ ...prev, errors: {} }));
  }, []);

  // Get password strength color
  const getPasswordStrengthColor = useCallback(() => {
    const { score } = state.passwordStrength;
    if (score <= 1) return 'red';
    if (score <= 2) return 'orange';
    if (score <= 3) return 'yellow';
    if (score <= 4) return 'lightgreen';
    return 'green';
  }, [state.passwordStrength]);

  // Get password strength text
  const getPasswordStrengthText = useCallback(() => {
    const { score } = state.passwordStrength;
    if (score <= 1) return 'Very Weak';
    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Fair';
    if (score <= 4) return 'Good';
    return 'Strong';
  }, [state.passwordStrength]);

  return {
    // State
    formData: state.formData,
    errors: state.errors,
    isSubmitting: state.isSubmitting || resetPasswordMutation.isPending,
    isFormValid: state.isFormValid,
    showPassword: state.showPassword,
    showConfirmPassword: state.showConfirmPassword,
    resetSuccess: state.resetSuccess,
    passwordStrength: state.passwordStrength,

    // Actions
    updateField,
    updateFormData,
    handleSubmit,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    resetForm,
    clearErrors,

    // Utilities
    validateToken,
    validatePassword,
    validateConfirmPassword,
    calculatePasswordStrength,
    getPasswordStrengthColor,
    getPasswordStrengthText,
  };
};

export default useResetPassword;
