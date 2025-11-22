import { useState, useCallback, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import useAuth from './useAuth';
import useApi from '../api/useApi';

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  acceptTerms: boolean;
  acceptMarketing: boolean;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
}

export interface RegisterFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  acceptTerms?: string;
  dateOfBirth?: string;
  general?: string;
}

export interface RegisterState {
  formData: RegisterFormData;
  errors: RegisterFormErrors;
  isSubmitting: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  isFormValid: boolean;
  currentStep: 1 | 2 | 3; // Multi-step registration
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
  isEmailAvailable: boolean | null;
  isCheckingEmail: boolean;
  registrationSuccess: boolean;
  verificationEmailSent: boolean;
}

const initialFormData: RegisterFormData = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  acceptTerms: false,
  acceptMarketing: false,
  dateOfBirth: '',
  gender: undefined,
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\+]?[1-9][\d]{0,15}$/;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = {
  hasUpper: /[A-Z]/,
  hasLower: /[a-z]/,
  hasNumber: /\d/,
  hasSpecial: /[!@#$%^&*(),.?":{}|<>]/,
};

export const useRegister = () => {
  const api = useApi();
  const auth = useAuth();

  const [registerState, setRegisterState] = useState<RegisterState>({
    formData: initialFormData,
    errors: {},
    isSubmitting: false,
    showPassword: false,
    showConfirmPassword: false,
    isFormValid: false,
    currentStep: 1,
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
    isEmailAvailable: null,
    isCheckingEmail: false,
    registrationSuccess: false,
    verificationEmailSent: false,
  });

  // Update form data
  const updateFormData = useCallback((updates: Partial<RegisterFormData>) => {
    setRegisterState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...updates },
    }));
  }, []);

  // Update field value
  const updateField = useCallback((field: keyof RegisterFormData, value: string | boolean) => {
    updateFormData({ [field]: value });
  }, [updateFormData]);

  // Validate first name
  const validateFirstName = useCallback((firstName: string): string | undefined => {
    if (!firstName.trim()) {
      return 'First name is required';
    }
    if (firstName.trim().length < 2) {
      return 'First name must be at least 2 characters';
    }
    if (firstName.trim().length > 50) {
      return 'First name must be less than 50 characters';
    }
    if (!/^[a-zA-Z\s'-]+$/.test(firstName.trim())) {
      return 'First name can only contain letters, spaces, hyphens, and apostrophes';
    }
    return undefined;
  }, []);

  // Validate last name
  const validateLastName = useCallback((lastName: string): string | undefined => {
    if (!lastName.trim()) {
      return 'Last name is required';
    }
    if (lastName.trim().length < 2) {
      return 'Last name must be at least 2 characters';
    }
    if (lastName.trim().length > 50) {
      return 'Last name must be less than 50 characters';
    }
    if (!/^[a-zA-Z\s'-]+$/.test(lastName.trim())) {
      return 'Last name can only contain letters, spaces, hyphens, and apostrophes';
    }
    return undefined;
  }, []);

  // Validate email
  const validateEmail = useCallback((email: string): string | undefined => {
    if (!email.trim()) {
      return 'Email is required';
    }
    if (!EMAIL_REGEX.test(email)) {
      return 'Please enter a valid email address';
    }
    if (email.length > 254) {
      return 'Email address is too long';
    }
    return undefined;
  }, []);

  // Validate phone
  const validatePhone = useCallback((phone: string): string | undefined => {
    if (phone && !PHONE_REGEX.test(phone)) {
      return 'Please enter a valid phone number';
    }
    return undefined;
  }, []);

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

    // Check for common patterns
    if (password.toLowerCase().includes('password')) {
      return 'Password cannot contain the word "password"';
    }
    if (password.toLowerCase().includes('123456')) {
      return 'Password cannot contain common sequences like "123456"';
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

  // Validate date of birth
  const validateDateOfBirth = useCallback((dateOfBirth: string): string | undefined => {
    if (!dateOfBirth) return undefined;

    const date = new Date(dateOfBirth);
    const now = new Date();
    
    if (isNaN(date.getTime())) {
      return 'Please enter a valid date';
    }
    
    if (date >= now) {
      return 'Date of birth must be in the past';
    }
    
    const age = now.getFullYear() - date.getFullYear();
    if (age < 13) {
      return 'You must be at least 13 years old to register';
    }
    if (age > 150) {
      return 'Please enter a valid date of birth';
    }

    return undefined;
  }, []);

  // Validate terms acceptance
  const validateTerms = useCallback((acceptTerms: boolean): string | undefined => {
    if (!acceptTerms) {
      return 'You must accept the terms and conditions to register';
    }
    return undefined;
  }, []);

  // Validate step 1 (Personal Info)
  const validateStep1 = useCallback((): RegisterFormErrors => {
    const errors: RegisterFormErrors = {};
    
    const firstNameError = validateFirstName(registerState.formData.firstName);
    if (firstNameError) errors.firstName = firstNameError;
    
    const lastNameError = validateLastName(registerState.formData.lastName);
    if (lastNameError) errors.lastName = lastNameError;
    
    const emailError = validateEmail(registerState.formData.email);
    if (emailError) errors.email = emailError;
    
    if (registerState.isEmailAvailable === false) {
      errors.email = 'This email address is already registered';
    }

    return errors;
  }, [registerState.formData, registerState.isEmailAvailable, validateFirstName, validateLastName, validateEmail]);

  // Validate step 2 (Security)
  const validateStep2 = useCallback((): RegisterFormErrors => {
    const errors: RegisterFormErrors = {};
    
    const passwordError = validatePassword(registerState.formData.password);
    if (passwordError) errors.password = passwordError;
    
    const confirmPasswordError = validateConfirmPassword(
      registerState.formData.confirmPassword,
      registerState.formData.password
    );
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

    return errors;
  }, [registerState.formData, validatePassword, validateConfirmPassword]);

  // Validate step 3 (Additional Info)
  const validateStep3 = useCallback((): RegisterFormErrors => {
    const errors: RegisterFormErrors = {};
    
    const phoneError = validatePhone(registerState.formData.phone || '');
    if (phoneError) errors.phone = phoneError;
    
    const dateOfBirthError = validateDateOfBirth(registerState.formData.dateOfBirth || '');
    if (dateOfBirthError) errors.dateOfBirth = dateOfBirthError;
    
    const termsError = validateTerms(registerState.formData.acceptTerms);
    if (termsError) errors.acceptTerms = termsError;

    return errors;
  }, [registerState.formData, validatePhone, validateDateOfBirth, validateTerms]);

  // Validate entire form
  const validateForm = useCallback((): RegisterFormErrors => {
    return {
      ...validateStep1(),
      ...validateStep2(),
      ...validateStep3(),
    };
  }, [validateStep1, validateStep2, validateStep3]);

  // Update password strength when password changes
  useEffect(() => {
    const strength = calculatePasswordStrength(registerState.formData.password);
    setRegisterState(prev => ({ ...prev, passwordStrength: strength }));
  }, [registerState.formData.password, calculatePasswordStrength]);

  // Update form validity
  useEffect(() => {
    let errors: RegisterFormErrors = {};
    
    switch (registerState.currentStep) {
      case 1:
        errors = validateStep1();
        break;
      case 2:
        errors = validateStep2();
        break;
      case 3:
        errors = validateStep3();
        break;
    }
    
    const isValid = Object.keys(errors).length === 0;
    
    setRegisterState(prev => ({
      ...prev,
      errors,
      isFormValid: isValid,
    }));
  }, [registerState.formData, registerState.currentStep, registerState.isEmailAvailable, validateStep1, validateStep2, validateStep3]);

  // Check email availability mutation
  const checkEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      if (!email || !EMAIL_REGEX.test(email)) return { available: true };
      
      const response = await api.get<{ available: boolean }>(`/auth/check-email?email=${encodeURIComponent(email)}`);
      return response || { available: true };
    },
    onMutate: () => {
      setRegisterState(prev => ({ ...prev, isCheckingEmail: true }));
    },
    onSuccess: (data) => {
      setRegisterState(prev => ({
        ...prev,
        isEmailAvailable: data.available,
        isCheckingEmail: false,
      }));
    },
    onError: () => {
      setRegisterState(prev => ({
        ...prev,
        isEmailAvailable: null,
        isCheckingEmail: false,
      }));
    },
  });

  // Debounce email availability check
  useEffect(() => {
    if (!registerState.formData.email || !EMAIL_REGEX.test(registerState.formData.email)) {
      setRegisterState(prev => ({ ...prev, isEmailAvailable: null }));
      return;
    }

    const timeoutId = setTimeout(() => {
      checkEmailMutation.mutate(registerState.formData.email);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [registerState.formData.email, checkEmailMutation]);

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (formData: RegisterFormData) => {
      // Final validation
      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        throw new Error('Please fix all form errors before submitting');
      }

      if (registerState.isEmailAvailable === false) {
        throw new Error('Email address is already registered');
      }

      const response = await api.post<{
        message: string;
        user: {
          id: string;
          email: string;
          firstName: string;
          lastName: string;
        };
        verificationEmailSent: boolean;
      }>('/auth/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        acceptTerms: formData.acceptTerms,
        acceptMarketing: formData.acceptMarketing,
      });

      if (!response) {
        throw new Error('Registration failed');
      }

      return response;
    },
    onSuccess: (data) => {
      setRegisterState(prev => ({
        ...prev,
        isSubmitting: false,
        registrationSuccess: true,
        verificationEmailSent: data.verificationEmailSent,
        errors: {},
      }));

      toast.success(data.message || 'Registration successful! Please check your email to verify your account.');
    },
    onError: (error: Error) => {
      setRegisterState(prev => ({
        ...prev,
        isSubmitting: false,
        errors: { general: error.message },
      }));

      toast.error(error.message || 'Registration failed');
    },
  });

  // Navigation between steps
  const nextStep = useCallback(() => {
    if (registerState.currentStep < 3 && registerState.isFormValid) {
      setRegisterState(prev => ({ 
        ...prev, 
        currentStep: (prev.currentStep + 1) as 1 | 2 | 3 
      }));
    }
  }, [registerState.currentStep, registerState.isFormValid]);

  const previousStep = useCallback(() => {
    if (registerState.currentStep > 1) {
      setRegisterState(prev => ({ 
        ...prev, 
        currentStep: (prev.currentStep - 1) as 1 | 2 | 3 
      }));
    }
  }, [registerState.currentStep]);

  const goToStep = useCallback((step: 1 | 2 | 3) => {
    setRegisterState(prev => ({ ...prev, currentStep: step }));
  }, []);

  // Submit form
  const handleSubmit = useCallback((e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (registerState.currentStep !== 3) {
      nextStep();
      return;
    }

    if (!registerState.isFormValid) {
      toast.error('Please fix all form errors before submitting');
      return;
    }

    setRegisterState(prev => ({ ...prev, isSubmitting: true, errors: {} }));
    registerMutation.mutate(registerState.formData);
  }, [registerState.currentStep, registerState.isFormValid, registerState.formData, nextStep, registerMutation]);

  // Toggle password visibility
  const togglePasswordVisibility = useCallback(() => {
    setRegisterState(prev => ({ ...prev, showPassword: !prev.showPassword }));
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setRegisterState(prev => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }));
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    setRegisterState(prev => ({
      ...prev,
      formData: initialFormData,
      errors: {},
      currentStep: 1,
      showPassword: false,
      showConfirmPassword: false,
      isEmailAvailable: null,
      registrationSuccess: false,
      verificationEmailSent: false,
    }));
  }, []);

  // Clear errors
  const clearErrors = useCallback(() => {
    setRegisterState(prev => ({ ...prev, errors: {} }));
  }, []);

  // Get password strength color
  const getPasswordStrengthColor = useCallback(() => {
    const { score } = registerState.passwordStrength;
    if (score <= 1) return 'red';
    if (score <= 2) return 'orange';
    if (score <= 3) return 'yellow';
    if (score <= 4) return 'lightgreen';
    return 'green';
  }, [registerState.passwordStrength]);

  // Get password strength text
  const getPasswordStrengthText = useCallback(() => {
    const { score } = registerState.passwordStrength;
    if (score <= 1) return 'Very Weak';
    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Fair';
    if (score <= 4) return 'Good';
    return 'Strong';
  }, [registerState.passwordStrength]);

  // Check if field has error
  const hasFieldError = useCallback((field: keyof RegisterFormErrors) => {
    return !!registerState.errors[field];
  }, [registerState.errors]);

  // Get field error message
  const getFieldError = useCallback((field: keyof RegisterFormErrors) => {
    return registerState.errors[field];
  }, [registerState.errors]);

  return {
    // State
    formData: registerState.formData,
    errors: registerState.errors,
    isSubmitting: registerState.isSubmitting || registerMutation.isPending,
    showPassword: registerState.showPassword,
    showConfirmPassword: registerState.showConfirmPassword,
    isFormValid: registerState.isFormValid,
    currentStep: registerState.currentStep,
    passwordStrength: registerState.passwordStrength,
    isEmailAvailable: registerState.isEmailAvailable,
    isCheckingEmail: registerState.isCheckingEmail,
    registrationSuccess: registerState.registrationSuccess,
    verificationEmailSent: registerState.verificationEmailSent,
    
    // Actions
    updateField,
    updateFormData,
    handleSubmit,
    nextStep,
    previousStep,
    goToStep,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    resetForm,
    clearErrors,
    
    // Utilities
    validateFirstName,
    validateLastName,
    validateEmail,
    validatePassword,
    validatePhone,
    validateDateOfBirth,
    validateTerms,
    calculatePasswordStrength,
    getPasswordStrengthColor,
    getPasswordStrengthText,
    hasFieldError,
    getFieldError,
    
    // Auth state from useAuth
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
  };
};

export default useRegister;
