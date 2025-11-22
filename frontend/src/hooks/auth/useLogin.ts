import { useState, useCallback, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import useAuth from './useAuth';
import useApi from '../api/useApi';

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
  twoFactorCode?: string;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
  twoFactorCode?: string;
  general?: string;
}

export interface LoginState {
  formData: LoginFormData;
  errors: LoginFormErrors;
  isSubmitting: boolean;
  requiresTwoFactor: boolean;
  loginAttempts: number;
  isLocked: boolean;
  lockTimeRemaining: number;
  showPassword: boolean;
  isFormValid: boolean;
  lastEmail: string;
}

const initialFormData: LoginFormData = {
  email: '',
  password: '',
  rememberMe: false,
  twoFactorCode: '',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export const useLogin = () => {
  const api = useApi();
  const auth = useAuth();

  const [loginState, setLoginState] = useState<LoginState>({
    formData: initialFormData,
    errors: {},
    isSubmitting: false,
    requiresTwoFactor: false,
    loginAttempts: 0,
    isLocked: false,
    lockTimeRemaining: 0,
    showPassword: false,
    isFormValid: false,
    lastEmail: '',
  });

  // Load saved data from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedEmail = localStorage.getItem('login_email');
        const savedRememberMe = localStorage.getItem('login_remember_me') === 'true';
        const loginAttempts = parseInt(localStorage.getItem('login_attempts') || '0', 10);
        const lockUntilStr = localStorage.getItem('login_lock_until');
        const lockUntil = lockUntilStr ? new Date(lockUntilStr) : null;
        
        const isLocked = lockUntil ? lockUntil > new Date() : false;
        const lockTimeRemaining = isLocked && lockUntil 
          ? lockUntil.getTime() - Date.now() 
          : 0;

        setLoginState(prev => ({
          ...prev,
          formData: {
            ...prev.formData,
            email: savedEmail || '',
            rememberMe: savedRememberMe,
          },
          loginAttempts,
          isLocked,
          lockTimeRemaining,
          lastEmail: savedEmail || '',
        }));
      } catch (error) {
        console.error('Error loading login state:', error);
      }
    }
  }, []);

  // Update form data
  const updateFormData = useCallback((updates: Partial<LoginFormData>) => {
    setLoginState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...updates },
      errors: { ...prev.errors },
    }));
  }, []);

  // Update field value
  const updateField = useCallback((field: keyof LoginFormData, value: string | boolean) => {
    updateFormData({ [field]: value });
  }, [updateFormData]);

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

  // Validate password
  const validatePassword = useCallback((password: string): string | undefined => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < PASSWORD_MIN_LENGTH) {
      return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
    }
    return undefined;
  }, []);

  // Validate two factor code
  const validateTwoFactorCode = useCallback((code: string): string | undefined => {
    if (loginState.requiresTwoFactor && !code.trim()) {
      return 'Two-factor authentication code is required';
    }
    if (code && !/^\d{6}$/.test(code)) {
      return 'Code must be 6 digits';
    }
    return undefined;
  }, [loginState.requiresTwoFactor]);

  // Validate entire form
  const validateForm = useCallback((): LoginFormErrors => {
    const errors: LoginFormErrors = {};

    const emailError = validateEmail(loginState.formData.email);
    if (emailError) errors.email = emailError;

    const passwordError = validatePassword(loginState.formData.password);
    if (passwordError) errors.password = passwordError;

    const twoFactorError = validateTwoFactorCode(loginState.formData.twoFactorCode || '');
    if (twoFactorError) errors.twoFactorCode = twoFactorError;

    return errors;
  }, [loginState.formData, validateEmail, validatePassword, validateTwoFactorCode]);

  // Update form validity
  useEffect(() => {
    const errors = validateForm();
    const isValid = Object.keys(errors).length === 0;
    
    setLoginState(prev => ({
      ...prev,
      errors,
      isFormValid: isValid && !prev.isLocked,
    }));
  }, [loginState.formData, loginState.isLocked, validateForm]);

  // Save login data to localStorage
  const saveLoginData = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        if (loginState.formData.rememberMe) {
          localStorage.setItem('login_email', loginState.formData.email);
          localStorage.setItem('login_remember_me', 'true');
        } else {
          localStorage.removeItem('login_email');
          localStorage.removeItem('login_remember_me');
        }
      } catch (error) {
        console.error('Error saving login data:', error);
      }
    }
  }, [loginState.formData.email, loginState.formData.rememberMe]);

  // Handle lockout
  const handleLockout = useCallback(() => {
    const lockUntil = new Date(Date.now() + LOCKOUT_DURATION);
    
    setLoginState(prev => ({
      ...prev,
      isLocked: true,
      lockTimeRemaining: LOCKOUT_DURATION,
      loginAttempts: MAX_ATTEMPTS,
    }));

    if (typeof window !== 'undefined') {
      localStorage.setItem('login_attempts', MAX_ATTEMPTS.toString());
      localStorage.setItem('login_lock_until', lockUntil.toISOString());
    }

    toast.error(`Too many failed login attempts. Account locked for 15 minutes.`);
  }, []);

  // Update lockout timer
  useEffect(() => {
    if (!loginState.isLocked || loginState.lockTimeRemaining <= 0) return;

    const timer = setInterval(() => {
      setLoginState(prev => {
        const remaining = Math.max(0, prev.lockTimeRemaining - 1000);
        
        if (remaining === 0) {
          // Unlock account
          if (typeof window !== 'undefined') {
            localStorage.removeItem('login_attempts');
            localStorage.removeItem('login_lock_until');
          }
          
          return {
            ...prev,
            isLocked: false,
            lockTimeRemaining: 0,
            loginAttempts: 0,
          };
        }
        
        return { ...prev, lockTimeRemaining: remaining };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loginState.isLocked, loginState.lockTimeRemaining]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (formData: LoginFormData) => {
      // Check if account is locked
      if (loginState.isLocked) {
        const remainingMinutes = Math.ceil(loginState.lockTimeRemaining / 60000);
        throw new Error(`Account is locked. Please try again in ${remainingMinutes} minute(s).`);
      }

      // Validate form
      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        throw new Error('Please fix the form errors before submitting');
      }

      const response = await api.post<{
        user: {
          id: string;
          email: string;
          firstName: string;
          lastName: string;
          role: string;
        };
        token: string;
        refreshToken: string;
        expiresIn: number;
        requiresTwoFactor?: boolean;
      }>('/auth/login', {
        email: formData.email,
        password: formData.password,
        twoFactorCode: formData.twoFactorCode,
        rememberMe: formData.rememberMe,
      });

      if (!response) {
        throw new Error('Login failed');
      }

      return response;
    },
    onSuccess: (data) => {
      if (data.requiresTwoFactor && !loginState.formData.twoFactorCode) {
        // Two-factor authentication required
        setLoginState(prev => ({
          ...prev,
          requiresTwoFactor: true,
          isSubmitting: false,
          errors: {},
        }));
        
        toast.success('Please enter your two-factor authentication code');
        return;
      }

      // Successful login
      setLoginState(prev => ({
        ...prev,
        isSubmitting: false,
        loginAttempts: 0,
        isLocked: false,
        lockTimeRemaining: 0,
        errors: {},
        requiresTwoFactor: false,
      }));

      // Save login data if remember me is checked
      saveLoginData();

      // Clear attempt tracking
      if (typeof window !== 'undefined') {
        localStorage.removeItem('login_attempts');
        localStorage.removeItem('login_lock_until');
      }

      // The auth hook will handle the actual authentication state
      toast.success('Login successful!');
    },
    onError: (error: Error) => {
      const newAttempts = loginState.loginAttempts + 1;
      
      setLoginState(prev => ({
        ...prev,
        isSubmitting: false,
        loginAttempts: newAttempts,
        errors: { general: error.message },
        requiresTwoFactor: false,
        formData: { ...prev.formData, twoFactorCode: '' },
      }));

      // Save attempt count
      if (typeof window !== 'undefined') {
        localStorage.setItem('login_attempts', newAttempts.toString());
      }

      // Check if should lock account
      if (newAttempts >= MAX_ATTEMPTS) {
        handleLockout();
      } else {
        const attemptsLeft = MAX_ATTEMPTS - newAttempts;
        toast.error(`${error.message} (${attemptsLeft} attempts remaining)`);
      }
    },
  });

  // Submit form
  const handleSubmit = useCallback((e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (loginState.isLocked) {
      toast.error('Account is locked. Please wait before trying again.');
      return;
    }

    if (!loginState.isFormValid) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    setLoginState(prev => ({ ...prev, isSubmitting: true, errors: {} }));
    loginMutation.mutate(loginState.formData);
  }, [loginState.isLocked, loginState.isFormValid, loginState.formData, loginMutation]);

  // Toggle password visibility
  const togglePasswordVisibility = useCallback(() => {
    setLoginState(prev => ({ ...prev, showPassword: !prev.showPassword }));
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    setLoginState(prev => ({
      ...prev,
      formData: { ...initialFormData, email: prev.lastEmail, rememberMe: prev.formData.rememberMe },
      errors: {},
      requiresTwoFactor: false,
      showPassword: false,
    }));
  }, []);

  // Reset two factor
  const resetTwoFactor = useCallback(() => {
    setLoginState(prev => ({
      ...prev,
      requiresTwoFactor: false,
      formData: { ...prev.formData, twoFactorCode: '' },
      errors: { ...prev.errors, twoFactorCode: undefined },
    }));
  }, []);

  // Clear errors
  const clearErrors = useCallback(() => {
    setLoginState(prev => ({ ...prev, errors: {} }));
  }, []);

  // Auto-fill demo credentials (for development)
  const fillDemoCredentials = useCallback(() => {
    updateFormData({
      email: 'demo@vardhmanmills.com',
      password: 'Demo123456!',
      rememberMe: false,
    });
    toast.success('Demo credentials filled');
  }, [updateFormData]);

  // Format lock time remaining
  const formatLockTimeRemaining = useCallback(() => {
    if (!loginState.isLocked || loginState.lockTimeRemaining <= 0) return '';
    
    const minutes = Math.floor(loginState.lockTimeRemaining / 60000);
    const seconds = Math.floor((loginState.lockTimeRemaining % 60000) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [loginState.isLocked, loginState.lockTimeRemaining]);

  // Check if field has error
  const hasFieldError = useCallback((field: keyof LoginFormErrors) => {
    return !!loginState.errors[field];
  }, [loginState.errors]);

  // Get field error message
  const getFieldError = useCallback((field: keyof LoginFormErrors) => {
    return loginState.errors[field];
  }, [loginState.errors]);

  // Handle social login
  const handleSocialLogin = useCallback((provider: 'google' | 'facebook' | 'apple') => {
    if (loginState.isLocked) {
      toast.error('Account is locked. Please wait before trying again.');
      return;
    }

    // Redirect to social login endpoint
    if (typeof window !== 'undefined') {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const redirectUrl = encodeURIComponent(window.location.origin + '/auth/callback');
      window.location.href = `${baseUrl}/auth/${provider}?redirect=${redirectUrl}`;
    }
  }, [loginState.isLocked]);

  return {
    // State
    formData: loginState.formData,
    errors: loginState.errors,
    isSubmitting: loginState.isSubmitting || loginMutation.isPending,
    requiresTwoFactor: loginState.requiresTwoFactor,
    loginAttempts: loginState.loginAttempts,
    isLocked: loginState.isLocked,
    lockTimeRemaining: loginState.lockTimeRemaining,
    showPassword: loginState.showPassword,
    isFormValid: loginState.isFormValid,
    
    // Actions
    updateField,
    updateFormData,
    handleSubmit,
    togglePasswordVisibility,
    resetForm,
    resetTwoFactor,
    clearErrors,
    fillDemoCredentials,
    handleSocialLogin,
    
    // Utilities
    validateEmail,
    validatePassword,
    validateTwoFactorCode,
    validateForm,
    formatLockTimeRemaining,
    hasFieldError,
    getFieldError,
    
    // Auth state from useAuth
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
  };
};

export default useLogin;
