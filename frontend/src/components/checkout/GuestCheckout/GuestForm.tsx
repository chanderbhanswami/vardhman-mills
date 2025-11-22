'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'react-hot-toast';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface GuestFormData {
  // Contact Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  
  // Address Information
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  landmark?: string;
  
  // Additional Options
  subscribeToNewsletter?: boolean;
  acceptWhatsappUpdates?: boolean;
  acceptSmsUpdates?: boolean;
  createAccount?: boolean;
  password?: string;
  confirmPassword?: string;
  
  // Delivery Instructions
  deliveryInstructions?: string;
}

export interface GuestFormProps {
  /**
   * Initial data
   */
  initialData?: Partial<GuestFormData>;

  /**
   * Callback when form is submitted
   */
  onSubmit: (data: GuestFormData) => void | Promise<void>;

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
  [key: string]: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateIndianPhone = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

const validateName = (name: string): boolean => {
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  return name.length >= 2 && name.length <= 50 && nameRegex.test(name);
};

const validatePostalCode = (postalCode: string): boolean => {
  const postalCodeRegex = /^[1-9][0-9]{5}$/;
  return postalCodeRegex.test(postalCode);
};

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

export const GuestForm: React.FC<GuestFormProps> = ({
  initialData,
  onSubmit,
  onSwitchToLogin,
  onCancel,
  isLoading = false,
  showCreateAccount = true,
  className,
}) => {
  // State
  const [formData, setFormData] = useState<GuestFormData>({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    alternatePhone: initialData?.alternatePhone || '',
    addressLine1: initialData?.addressLine1 || '',
    addressLine2: initialData?.addressLine2 || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    postalCode: initialData?.postalCode || '',
    country: initialData?.country || 'India',
    landmark: initialData?.landmark || '',
    subscribeToNewsletter: initialData?.subscribeToNewsletter ?? true,
    acceptWhatsappUpdates: initialData?.acceptWhatsappUpdates ?? true,
    acceptSmsUpdates: initialData?.acceptSmsUpdates ?? false,
    createAccount: initialData?.createAccount ?? false,
    password: '',
    confirmPassword: '',
    deliveryInstructions: initialData?.deliveryInstructions || '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Load from session storage on mount
  useEffect(() => {
    const savedData = sessionStorage.getItem('guestCheckout_form');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    }
  }, []);

  // Save to session storage on change
  useEffect(() => {
    sessionStorage.setItem('guestCheckout_form', JSON.stringify(formData));
  }, [formData]);

  // Calculate password strength
  useEffect(() => {
    if (formData.createAccount && formData.password) {
      setPasswordStrength(calculatePasswordStrength(formData.password));
    } else {
      setPasswordStrength(0);
    }
  }, [formData.password, formData.createAccount]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, formData[name as keyof GuestFormData]);
  };

  // Validate individual field
  const validateField = (name: string, value: unknown) => {
    const newErrors: FormErrors = { ...errors };

    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value || !validateName(value as string)) {
          newErrors[name] = `Please enter a valid ${name === 'firstName' ? 'first' : 'last'} name`;
        } else {
          delete newErrors[name];
        }
        break;

      case 'email':
        if (!value || !validateEmail(value as string)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;

      case 'phone':
        if (!value || !validateIndianPhone(value as string)) {
          newErrors.phone = 'Please enter a valid 10-digit phone number';
        } else {
          delete newErrors.phone;
        }
        break;

      case 'alternatePhone':
        if (value && !validateIndianPhone(value as string)) {
          newErrors.alternatePhone = 'Please enter a valid 10-digit phone number';
        } else {
          delete newErrors.alternatePhone;
        }
        break;

      case 'addressLine1':
        if (!value || (value as string).length < 5) {
          newErrors.addressLine1 = 'Please enter a valid address (min 5 characters)';
        } else {
          delete newErrors.addressLine1;
        }
        break;

      case 'city':
        if (!value || (value as string).length < 2) {
          newErrors.city = 'Please enter a valid city name';
        } else {
          delete newErrors.city;
        }
        break;

      case 'state':
        if (!value) {
          newErrors.state = 'Please select a state';
        } else {
          delete newErrors.state;
        }
        break;

      case 'postalCode':
        if (!value || !validatePostalCode(value as string)) {
          newErrors.postalCode = 'Please enter a valid 6-digit PIN code';
        } else {
          delete newErrors.postalCode;
        }
        break;

      case 'password':
        if (formData.createAccount) {
          const validation = validatePassword(value as string);
          if (!validation.isValid) {
            newErrors.password = validation.message || 'Invalid password';
          } else {
            delete newErrors.password;
          }

          // Validate confirm password if it's already filled
          if (formData.confirmPassword && value !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
          } else if (formData.confirmPassword) {
            delete newErrors.confirmPassword;
          }
        }
        break;

      case 'confirmPassword':
        if (formData.createAccount) {
          if (value !== formData.password) {
            newErrors.confirmPassword = 'Passwords do not match';
          } else {
            delete newErrors.confirmPassword;
          }
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  // Validate entire form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Contact validation
    if (!formData.firstName || !validateName(formData.firstName)) {
      newErrors.firstName = 'Please enter a valid first name';
    }
    if (!formData.lastName || !validateName(formData.lastName)) {
      newErrors.lastName = 'Please enter a valid last name';
    }
    if (!formData.email || !validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone || !validateIndianPhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    if (formData.alternatePhone && !validateIndianPhone(formData.alternatePhone)) {
      newErrors.alternatePhone = 'Please enter a valid 10-digit phone number';
    }

    // Address validation
    if (!formData.addressLine1 || formData.addressLine1.length < 5) {
      newErrors.addressLine1 = 'Please enter a valid address';
    }
    if (!formData.city || formData.city.length < 2) {
      newErrors.city = 'Please enter a valid city name';
    }
    if (!formData.state) {
      newErrors.state = 'Please select a state';
    }
    if (!formData.postalCode || !validatePostalCode(formData.postalCode)) {
      newErrors.postalCode = 'Please enter a valid 6-digit PIN code';
    }

    // Account creation validation
    if (formData.createAccount) {
      const passwordValidation = validatePassword(formData.password || '');
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.message || 'Invalid password';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    if (!validateForm()) {
      toast.error('Please fix all errors before continuing');
      
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      const element = document.getElementsByName(firstErrorField)[0];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting guest form:', error);
      toast.error('Failed to save information. Please try again.');
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-lg shadow-md p-6 ${className}`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Guest Checkout</h2>
            <p className="text-sm text-gray-500 mt-1">
              Complete your order quickly without creating an account
            </p>
          </div>
          {onSwitchToLogin && (
            <Button
              type="button"
              variant="ghost"
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:text-blue-700"
            >
              Already have an account? Login
            </Button>
          )}
        </div>

        {/* Contact Information Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <UserIcon className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  touched.firstName && errors.firstName
                    ? 'border-red-500'
                    : touched.firstName
                    ? 'border-green-500'
                    : 'border-gray-300'
                }`}
                disabled={isLoading}
                required
              />
              {touched.firstName && errors.firstName && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <XCircleIcon className="h-3 w-3" />
                  {errors.firstName}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  touched.lastName && errors.lastName
                    ? 'border-red-500'
                    : touched.lastName
                    ? 'border-green-500'
                    : 'border-gray-300'
                }`}
                disabled={isLoading}
                required
              />
              {touched.lastName && errors.lastName && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <XCircleIcon className="h-3 w-3" />
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
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  touched.email && errors.email
                    ? 'border-red-500'
                    : touched.email
                    ? 'border-green-500'
                    : 'border-gray-300'
                }`}
                placeholder="you@example.com"
                disabled={isLoading}
                required
              />
            </div>
            {touched.email && errors.email && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <XCircleIcon className="h-3 w-3" />
                {errors.email}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Order confirmation will be sent to this email
            </p>
          </div>

          {/* Phone Numbers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    touched.phone && errors.phone
                      ? 'border-red-500'
                      : touched.phone
                      ? 'border-green-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="9876543210"
                  maxLength={10}
                  disabled={isLoading}
                  required
                />
              </div>
              {touched.phone && errors.phone && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <XCircleIcon className="h-3 w-3" />
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Alternate Phone */}
            <div>
              <label htmlFor="alternatePhone" className="block text-sm font-medium text-gray-700 mb-1">
                Alternate Phone (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="alternatePhone"
                  name="alternatePhone"
                  value={formData.alternatePhone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    touched.alternatePhone && errors.alternatePhone
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="9876543210"
                  maxLength={10}
                  disabled={isLoading}
                />
              </div>
              {touched.alternatePhone && errors.alternatePhone && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <XCircleIcon className="h-3 w-3" />
                  {errors.alternatePhone}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Delivery Address Section */}
        <div className="space-y-4 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <MapPinIcon className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Delivery Address</h3>
          </div>

          {/* Address Line 1 */}
          <div>
            <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 1 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="addressLine1"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                touched.addressLine1 && errors.addressLine1
                  ? 'border-red-500'
                  : touched.addressLine1
                  ? 'border-green-500'
                  : 'border-gray-300'
              }`}
              placeholder="House/Flat No., Building Name"
              disabled={isLoading}
              required
            />
            {touched.addressLine1 && errors.addressLine1 && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <XCircleIcon className="h-3 w-3" />
                {errors.addressLine1}
              </p>
            )}
          </div>

          {/* Address Line 2 */}
          <div>
            <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 2 (Optional)
            </label>
            <input
              type="text"
              id="addressLine2"
              name="addressLine2"
              value={formData.addressLine2}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Street, Area, Locality"
              disabled={isLoading}
            />
          </div>

          {/* Landmark */}
          <div>
            <label htmlFor="landmark" className="block text-sm font-medium text-gray-700 mb-1">
              Landmark (Optional)
            </label>
            <input
              type="text"
              id="landmark"
              name="landmark"
              value={formData.landmark}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Near famous place"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* City */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  touched.city && errors.city
                    ? 'border-red-500'
                    : touched.city
                    ? 'border-green-500'
                    : 'border-gray-300'
                }`}
                disabled={isLoading}
                required
              />
              {touched.city && errors.city && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <XCircleIcon className="h-3 w-3" />
                  {errors.city}
                </p>
              )}
            </div>

            {/* State */}
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  touched.state && errors.state
                    ? 'border-red-500'
                    : touched.state
                    ? 'border-green-500'
                    : 'border-gray-300'
                }`}
                disabled={isLoading}
                required
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map(state => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              {touched.state && errors.state && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <XCircleIcon className="h-3 w-3" />
                  {errors.state}
                </p>
              )}
            </div>

            {/* Postal Code */}
            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                PIN Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  touched.postalCode && errors.postalCode
                    ? 'border-red-500'
                    : touched.postalCode
                    ? 'border-green-500'
                    : 'border-gray-300'
                }`}
                placeholder="400001"
                maxLength={6}
                disabled={isLoading}
                required
              />
              {touched.postalCode && errors.postalCode && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <XCircleIcon className="h-3 w-3" />
                  {errors.postalCode}
                </p>
              )}
            </div>
          </div>

          {/* Delivery Instructions */}
          <div>
            <label htmlFor="deliveryInstructions" className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Instructions (Optional)
            </label>
            <textarea
              id="deliveryInstructions"
              name="deliveryInstructions"
              value={formData.deliveryInstructions}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Any special instructions for delivery..."
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Communication Preferences */}
        <div className="space-y-3 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Communication Preferences</h3>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="subscribeToNewsletter"
              checked={formData.subscribeToNewsletter}
              onChange={handleChange}
              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={isLoading}
            />
            <div className="flex-1">
              <span className="text-sm text-gray-700">
                Subscribe to newsletter for exclusive offers and updates
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="acceptWhatsappUpdates"
              checked={formData.acceptWhatsappUpdates}
              onChange={handleChange}
              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={isLoading}
            />
            <div className="flex-1">
              <span className="text-sm text-gray-700">
                Receive order updates on WhatsApp
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="acceptSmsUpdates"
              checked={formData.acceptSmsUpdates}
              onChange={handleChange}
              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={isLoading}
            />
            <div className="flex-1">
              <span className="text-sm text-gray-700">
                Receive order updates via SMS
              </span>
            </div>
          </label>
        </div>

        {/* Create Account Option */}
        {showCreateAccount && (
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="createAccount"
                checked={formData.createAccount}
                onChange={handleChange}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={isLoading}
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">
                  Create an account for faster checkout next time
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  Track your orders, save addresses, and get personalized recommendations
                </p>
              </div>
            </label>

            <AnimatePresence>
              {formData.createAccount && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 overflow-hidden"
                >
                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          touched.password && errors.password
                            ? 'border-red-500'
                            : touched.password
                            ? 'border-green-500'
                            : 'border-gray-300'
                        }`}
                        placeholder="Min 8 characters"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {touched.password && errors.password && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <XCircleIcon className="h-3 w-3" />
                        {errors.password}
                      </p>
                    )}

                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">Password Strength:</span>
                          <Badge variant="outline" size="sm">
                            {getPasswordStrengthLabel()}
                          </Badge>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <motion.div
                            className={`h-2 rounded-full ${getPasswordStrengthColor()}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${passwordStrength}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          touched.confirmPassword && errors.confirmPassword
                            ? 'border-red-500'
                            : touched.confirmPassword && formData.confirmPassword === formData.password
                            ? 'border-green-500'
                            : 'border-gray-300'
                        }`}
                        placeholder="Re-enter password"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {touched.confirmPassword && errors.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <XCircleIcon className="h-3 w-3" />
                        {errors.confirmPassword}
                      </p>
                    )}
                    {touched.confirmPassword && !errors.confirmPassword && formData.confirmPassword && (
                      <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                        <CheckCircleIcon className="h-3 w-3" />
                        Passwords match
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          <div className="flex-1" />
          <Button
            type="submit"
            variant="gradient"
            size="lg"
            disabled={isLoading}
            className="min-w-[200px]"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Processing...
              </span>
            ) : (
              'Continue to Payment'
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default GuestForm;
