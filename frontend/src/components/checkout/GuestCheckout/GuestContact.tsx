'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  LockClosedIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface GuestContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  subscribeToNewsletter?: boolean;
  acceptWhatsappUpdates?: boolean;
  acceptSmsUpdates?: boolean;
  createAccount?: boolean;
  password?: string;
  confirmPassword?: string;
}

export interface GuestContactProps {
  /**
   * Initial data
   */
  initialData?: Partial<GuestContactData>;

  /**
   * Callback when form is submitted
   */
  onSubmit: (data: GuestContactData) => void | Promise<void>;

  /**
   * Callback when user wants to login instead
   */
  onSwitchToLogin?: () => void;

  /**
   * Callback when cancel is clicked
   */
  onCancel?: () => void;

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Show create account option
   */
  showCreateAccount?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  password?: string;
  confirmPassword?: string;
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate email format
 */
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate Indian phone number
 */
const validateIndianPhone = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

/**
 * Validate name
 */
const validateName = (name: string): boolean => {
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  return name.length >= 2 && name.length <= 50 && nameRegex.test(name);
};

/**
 * Validate password strength
 */
const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/\d/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }
  return { isValid: true };
};

/**
 * Calculate password strength
 */
const calculatePasswordStrength = (password: string): number => {
  let strength = 0;
  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 20;
  if (/[a-z]/.test(password)) strength += 15;
  if (/[A-Z]/.test(password)) strength += 15;
  if (/\d/.test(password)) strength += 15;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 15;
  return Math.min(100, strength);
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * GuestContact Component
 * 
 * Guest checkout contact information form.
 * Features:
 * - Personal information collection (name, email, phone)
 * - Email and phone validation
 * - Alternate phone number (optional)
 * - Communication preferences
 * - Optional account creation
 * - Password strength indicator
 * - Real-time validation
 * - Responsive design
 * 
 * @example
 * ```tsx
 * <GuestContact
 *   onSubmit={handleSubmit}
 *   showCreateAccount={true}
 *   onSwitchToLogin={handleLogin}
 * />
 * ```
 */
export const GuestContact: React.FC<GuestContactProps> = ({
  initialData,
  onSubmit,
  onSwitchToLogin,
  onCancel,
  isLoading = false,
  showCreateAccount = true,
  className,
}) => {
  // State
  const [formData, setFormData] = useState<GuestContactData>({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    alternatePhone: initialData?.alternatePhone || '',
    subscribeToNewsletter: initialData?.subscribeToNewsletter ?? true,
    acceptWhatsappUpdates: initialData?.acceptWhatsappUpdates ?? true,
    acceptSmsUpdates: initialData?.acceptSmsUpdates ?? false,
    createAccount: initialData?.createAccount ?? false,
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Calculate password strength
  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(calculatePasswordStrength(formData.password));
    } else {
      setPasswordStrength(0);
    }
  }, [formData.password]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, formData[name as keyof GuestContactData]);
  };

  // Validate individual field
  const validateField = (name: string, value: unknown) => {
    let error = '';

    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value || typeof value !== 'string' || !value.trim()) {
          error = `${name === 'firstName' ? 'First' : 'Last'} name is required`;
        } else if (!validateName(value)) {
          error = 'Please enter a valid name (2-50 characters, letters only)';
        }
        break;

      case 'email':
        if (!value || typeof value !== 'string' || !value.trim()) {
          error = 'Email is required';
        } else if (!validateEmail(value)) {
          error = 'Please enter a valid email address';
        }
        break;

      case 'phone':
        if (!value || typeof value !== 'string' || !value.trim()) {
          error = 'Phone number is required';
        } else if (!validateIndianPhone(value)) {
          error = 'Please enter a valid 10-digit Indian mobile number';
        }
        break;

      case 'alternatePhone':
        if (value && typeof value === 'string' && value.trim()) {
          if (!validateIndianPhone(value)) {
            error = 'Please enter a valid 10-digit Indian mobile number';
          } else if (value === formData.phone) {
            error = 'Alternate phone must be different from primary phone';
          }
        }
        break;

      case 'password':
        if (formData.createAccount && value) {
          const validation = validatePassword(value as string);
          if (!validation.isValid) {
            error = validation.message || 'Invalid password';
          }
        }
        break;

      case 'confirmPassword':
        if (formData.createAccount && value !== formData.password) {
          error = 'Passwords do not match';
        }
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  // Validate entire form
  const validateForm = (): boolean => {
    const fieldsToValidate = ['firstName', 'lastName', 'email', 'phone'];
    
    if (formData.alternatePhone) {
      fieldsToValidate.push('alternatePhone');
    }

    if (formData.createAccount) {
      fieldsToValidate.push('password', 'confirmPassword');
    }

    let isValid = true;
    fieldsToValidate.forEach((field) => {
      const fieldValue = formData[field as keyof GuestContactData];
      if (!validateField(field, fieldValue)) {
        isValid = false;
      }
    });

    return isValid;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);

    // Mark all fields as touched
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      alternatePhone: true,
      password: true,
      confirmPassword: true,
    });

    if (!validateForm()) {
      setIsValidating(false);
      toast.error('Please fix all errors before submitting');
      return;
    }

    try {
      await onSubmit(formData);
      toast.success('Contact information saved');
    } catch (error) {
      console.error('Error submitting guest contact form:', error);
      toast.error('Failed to save contact information');
    } finally {
      setIsValidating(false);
    }
  };

  // Get password strength color
  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return 'bg-red-500';
    if (passwordStrength < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Get password strength label
  const getPasswordStrengthLabel = () => {
    if (passwordStrength < 40) return 'Weak';
    if (passwordStrength < 70) return 'Medium';
    return 'Strong';
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className={cn('space-y-6', className)}
    >
      {/* Guest Checkout Header */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">Guest Checkout</h3>
                  <Badge variant="secondary" size="sm">Fast</Badge>
                </div>
                <p className="text-sm text-gray-600">
                  No account needed. Just provide your contact details.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="h-5 w-5 text-green-600" />
              <span className="text-xs text-gray-600">Secure</span>
            </div>
          </div>

          {/* Login Option */}
          {onSwitchToLogin && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <InformationCircleIcon className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-700">Already have an account?</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onSwitchToLogin}
              >
                Login
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Contact Information */}
      <Card className="p-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 mb-4">Contact Information</h4>

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="John"
                  className={cn(
                    'pl-10',
                    errors.firstName && touched.firstName && 'border-red-500'
                  )}
                  disabled={isLoading || isValidating}
                />
                {!errors.firstName && touched.firstName && formData.firstName && (
                  <CheckCircleIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
                )}
              </div>
              {errors.firstName && touched.firstName && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <ExclamationCircleIcon className="h-4 w-4" />
                  {errors.firstName}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Doe"
                  className={cn(
                    'pl-10',
                    errors.lastName && touched.lastName && 'border-red-500'
                  )}
                  disabled={isLoading || isValidating}
                />
                {!errors.lastName && touched.lastName && formData.lastName && (
                  <CheckCircleIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
                )}
              </div>
              {errors.lastName && touched.lastName && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <ExclamationCircleIcon className="h-4 w-4" />
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="john.doe@example.com"
                className={cn(
                  'pl-10',
                  errors.email && touched.email && 'border-red-500'
                )}
                disabled={isLoading || isValidating}
              />
              {!errors.email && touched.email && formData.email && (
                <CheckCircleIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
              )}
            </div>
            {errors.email && touched.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <ExclamationCircleIcon className="h-4 w-4" />
                {errors.email}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
              <InformationCircleIcon className="h-3 w-3" />
              We&apos;ll send order confirmation and updates to this email
            </p>
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="9876543210"
                maxLength={10}
                className={cn(
                  'pl-10',
                  errors.phone && touched.phone && 'border-red-500'
                )}
                disabled={isLoading || isValidating}
              />
              {!errors.phone && touched.phone && formData.phone && (
                <CheckCircleIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
              )}
            </div>
            {errors.phone && touched.phone && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <ExclamationCircleIcon className="h-4 w-4" />
                {errors.phone}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
              <InformationCircleIcon className="h-3 w-3" />
              We&apos;ll call or text for delivery updates
            </p>
          </div>

          {/* Alternate Phone (Optional) */}
          <div>
            <label htmlFor="alternatePhone" className="block text-sm font-medium text-gray-700 mb-1">
              Alternate Phone Number <span className="text-gray-400">(Optional)</span>
            </label>
            <div className="relative">
              <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="alternatePhone"
                name="alternatePhone"
                type="tel"
                value={formData.alternatePhone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="9876543211"
                maxLength={10}
                className={cn(
                  'pl-10',
                  errors.alternatePhone && touched.alternatePhone && 'border-red-500'
                )}
                disabled={isLoading || isValidating}
              />
              {!errors.alternatePhone && touched.alternatePhone && formData.alternatePhone && (
                <CheckCircleIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
              )}
            </div>
            {errors.alternatePhone && touched.alternatePhone && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <ExclamationCircleIcon className="h-4 w-4" />
                {errors.alternatePhone}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Communication Preferences */}
      <Card className="p-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 mb-4">Communication Preferences</h4>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              name="subscribeToNewsletter"
              checked={formData.subscribeToNewsletter}
              onChange={handleChange}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              disabled={isLoading || isValidating}
              aria-label="Subscribe to newsletter"
            />
            <div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                Subscribe to our newsletter
              </span>
              <p className="text-xs text-gray-500 mt-1">
                Get exclusive offers, new product updates, and style inspiration
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              name="acceptWhatsappUpdates"
              checked={formData.acceptWhatsappUpdates}
              onChange={handleChange}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              disabled={isLoading || isValidating}
              aria-label="Accept WhatsApp updates"
            />
            <div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                Receive order updates via WhatsApp
              </span>
              <p className="text-xs text-gray-500 mt-1">
                Real-time updates about your order status
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              name="acceptSmsUpdates"
              checked={formData.acceptSmsUpdates}
              onChange={handleChange}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              disabled={isLoading || isValidating}
              aria-label="Accept SMS updates"
            />
            <div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                Receive order updates via SMS
              </span>
              <p className="text-xs text-gray-500 mt-1">
                Get text messages for important order updates
              </p>
            </div>
          </label>
        </div>
      </Card>

      {/* Create Account Option */}
      {showCreateAccount && (
        <Card className="p-6">
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                name="createAccount"
                checked={formData.createAccount}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                disabled={isLoading || isValidating}
                aria-label="Create an account"
              />
              <div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  Create an account for faster checkout next time
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  Save your information and track orders easily
                </p>
              </div>
            </label>

            {formData.createAccount && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 pt-4 border-t border-gray-200"
              >
                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter password"
                      className={cn(
                        'pl-10 pr-20',
                        errors.password && touched.password && 'border-red-500'
                      )}
                      disabled={isLoading || isValidating}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {errors.password && touched.password && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <ExclamationCircleIcon className="h-4 w-4" />
                      {errors.password}
                    </p>
                  )}

                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Password Strength:</span>
                        <span className={cn(
                          'text-xs font-medium',
                          passwordStrength < 40 ? 'text-red-600' : passwordStrength < 70 ? 'text-yellow-600' : 'text-green-600'
                        )}>
                          {getPasswordStrengthLabel()}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${passwordStrength}%` }}
                          transition={{ duration: 0.3 }}
                          className={cn('h-full', getPasswordStrengthColor())}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Use 8+ characters with uppercase, lowercase, numbers & symbols
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Confirm password"
                      className={cn(
                        'pl-10 pr-20',
                        errors.confirmPassword && touched.confirmPassword && 'border-red-500'
                      )}
                      disabled={isLoading || isValidating}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {showConfirmPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {errors.confirmPassword && touched.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <ExclamationCircleIcon className="h-4 w-4" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </Card>
      )}

      {/* Privacy Notice */}
      <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <InformationCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-900">
          Your information is secure and will only be used to process your order and communicate important updates.
          We respect your privacy.
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex items-center gap-3 justify-end">
        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            disabled={isLoading || isValidating}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isLoading || isValidating}
          className="min-w-[200px]"
        >
          {isLoading || isValidating ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"
              />
              Saving...
            </>
          ) : (
            'Continue to Shipping'
          )}
        </Button>
      </div>
    </motion.form>
  );
};

export default GuestContact;
