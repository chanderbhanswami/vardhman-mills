'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
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

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  company?: string;
  taxId?: string;
  subscribeToNewsletter: boolean;
  acceptWhatsappUpdates: boolean;
  acceptSmsUpdates: boolean;
}

export interface ContactFormProps {
  /**
   * Initial data for editing
   */
  initialData?: Partial<ContactFormData>;

  /**
   * Callback when form is submitted
   */
  onSubmit: (data: ContactFormData) => void | Promise<void>;

  /**
   * Callback when form is cancelled
   */
  onCancel?: () => void;

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Show company field
   */
  showCompanyField?: boolean;

  /**
   * Show tax ID field
   */
  showTaxIdField?: boolean;

  /**
   * Show alternate phone
   */
  showAlternatePhone?: boolean;

  /**
   * Auto-fill from user session
   */
  autoFillFromUser?: boolean;

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
  company?: string;
  taxId?: string;
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate email address
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
 * Validate name (only letters, spaces, hyphens, apostrophes)
 */
const validateName = (name: string): boolean => {
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  return nameRegex.test(name) && name.length >= 2 && name.length <= 50;
};

/**
 * Validate GST number (Indian tax ID)
 */
const validateGSTIN = (gstin: string): boolean => {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gstin);
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * ContactForm Component
 * 
 * Comprehensive contact information form for checkout.
 * Features:
 * - Personal information fields (name, email, phone)
 * - Optional company and tax ID fields
 * - Alternate phone number
 * - Newsletter subscription
 * - WhatsApp and SMS updates opt-in
 * - Real-time validation with visual feedback
 * - Field-level validation indicators
 * - Responsive design
 * - Auto-save capability
 * - Loading states
 * 
 * @example
 * ```tsx
 * <ContactForm
 *   initialData={userData}
 *   onSubmit={handleSubmit}
 *   showCompanyField={true}
 *   showTaxIdField={true}
 * />
 * ```
 */
export const ContactForm: React.FC<ContactFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  showCompanyField = false,
  showTaxIdField = false,
  showAlternatePhone = true,
  autoFillFromUser = true,
  className,
}) => {
  // Form state
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    alternatePhone: initialData?.alternatePhone || '',
    company: initialData?.company || '',
    taxId: initialData?.taxId || '',
    subscribeToNewsletter: initialData?.subscribeToNewsletter ?? true,
    acceptWhatsappUpdates: initialData?.acceptWhatsappUpdates ?? true,
    acceptSmsUpdates: initialData?.acceptSmsUpdates ?? false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isValidating, setIsValidating] = useState(false);

  // Auto-fill from user session
  useEffect(() => {
    if (autoFillFromUser && !initialData) {
      // TODO: Fetch user data from session/context
      // For now, this is a placeholder
    }
  }, [autoFillFromUser, initialData]);

  // Validate field
  const validateField = (name: keyof ContactFormData, value: string): string | undefined => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) {
          return `${name === 'firstName' ? 'First' : 'Last'} name is required`;
        }
        if (!validateName(value)) {
          return 'Name should contain only letters';
        }
        break;

      case 'email':
        if (!value.trim()) {
          return 'Email is required';
        }
        if (!validateEmail(value)) {
          return 'Please enter a valid email address';
        }
        break;

      case 'phone':
        if (!value.trim()) {
          return 'Phone number is required';
        }
        if (!validateIndianPhone(value)) {
          return 'Please enter a valid 10-digit Indian phone number';
        }
        break;

      case 'alternatePhone':
        if (value.trim() && !validateIndianPhone(value)) {
          return 'Please enter a valid 10-digit Indian phone number';
        }
        break;

      case 'company':
        if (showCompanyField && value.trim() && value.length < 2) {
          return 'Company name is too short';
        }
        break;

      case 'taxId':
        if (showTaxIdField && value.trim() && !validateGSTIN(value)) {
          return 'Please enter a valid GSTIN (e.g., 22AAAAA0000A1Z5)';
        }
        break;
    }
    return undefined;
  };

  // Validate entire form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    newErrors.firstName = validateField('firstName', formData.firstName);
    newErrors.lastName = validateField('lastName', formData.lastName);
    newErrors.email = validateField('email', formData.email);
    newErrors.phone = validateField('phone', formData.phone);

    if (showAlternatePhone && formData.alternatePhone) {
      newErrors.alternatePhone = validateField('alternatePhone', formData.alternatePhone);
    }

    if (showCompanyField && formData.company) {
      newErrors.company = validateField('company', formData.company);
    }

    if (showTaxIdField && formData.taxId) {
      newErrors.taxId = validateField('taxId', formData.taxId);
    }

    setErrors(newErrors);

    return !Object.values(newErrors).some((error) => error !== undefined);
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Handle blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    if (typeof value === 'string') {
      const error = validateField(name as keyof ContactFormData, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      alternatePhone: true,
      company: true,
      taxId: true,
    });

    // Validate
    setIsValidating(true);
    const isValid = validateForm();
    setIsValidating(false);

    if (!isValid) {
      toast.error('Please fix all errors before continuing');
      return;
    }

    try {
      await onSubmit(formData);
      toast.success('Contact information saved');
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error('Failed to save contact information');
    }
  };

  // Get field validation state
  const getFieldState = (fieldName: keyof FormErrors): 'valid' | 'invalid' | 'neutral' => {
    if (!touched[fieldName]) return 'neutral';
    if (errors[fieldName]) return 'invalid';
    if (formData[fieldName as keyof ContactFormData]) return 'valid';
    return 'neutral';
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className={cn('space-y-6', className)}
    >
      <Card className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-primary-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
              <p className="text-sm text-gray-600">
                We&apos;ll use this information to contact you about your order
              </p>
            </div>
            {isValidating && (
              <Badge variant="secondary">Validating...</Badge>
            )}
          </div>

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
                    'pl-10 pr-10',
                    errors.firstName && touched.firstName && 'border-red-500',
                    !errors.firstName && touched.firstName && formData.firstName && 'border-green-500'
                  )}
                  disabled={isLoading}
                />
                {touched.firstName && formData.firstName && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {getFieldState('firstName') === 'valid' && (
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    )}
                    {getFieldState('firstName') === 'invalid' && (
                      <XCircleIcon className="h-5 w-5 text-red-500" />
                    )}
                  </div>
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
                    'pl-10 pr-10',
                    errors.lastName && touched.lastName && 'border-red-500',
                    !errors.lastName && touched.lastName && formData.lastName && 'border-green-500'
                  )}
                  disabled={isLoading}
                />
                {touched.lastName && formData.lastName && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {getFieldState('lastName') === 'valid' && (
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    )}
                    {getFieldState('lastName') === 'invalid' && (
                      <XCircleIcon className="h-5 w-5 text-red-500" />
                    )}
                  </div>
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
                  'pl-10 pr-10',
                  errors.email && touched.email && 'border-red-500',
                  !errors.email && touched.email && formData.email && 'border-green-500'
                )}
                disabled={isLoading}
              />
              {touched.email && formData.email && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {getFieldState('email') === 'valid' && (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  )}
                  {getFieldState('email') === 'invalid' && (
                    <XCircleIcon className="h-5 w-5 text-red-500" />
                  )}
                </div>
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
              Order confirmation will be sent to this email
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
                className={cn(
                  'pl-10 pr-10',
                  errors.phone && touched.phone && 'border-red-500',
                  !errors.phone && touched.phone && formData.phone && 'border-green-500'
                )}
                disabled={isLoading}
                maxLength={10}
              />
              {touched.phone && formData.phone && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {getFieldState('phone') === 'valid' && (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  )}
                  {getFieldState('phone') === 'invalid' && (
                    <XCircleIcon className="h-5 w-5 text-red-500" />
                  )}
                </div>
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
              We&apos;ll call or text you for delivery updates
            </p>
          </div>

          {/* Alternate Phone */}
          {showAlternatePhone && (
            <div>
              <label htmlFor="alternatePhone" className="block text-sm font-medium text-gray-700 mb-1">
                Alternate Phone Number (Optional)
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
                  placeholder="9876543210"
                  className={cn(
                    'pl-10 pr-10',
                    errors.alternatePhone && touched.alternatePhone && 'border-red-500',
                    !errors.alternatePhone && touched.alternatePhone && formData.alternatePhone && 'border-green-500'
                  )}
                  disabled={isLoading}
                  maxLength={10}
                />
                {touched.alternatePhone && formData.alternatePhone && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {getFieldState('alternatePhone') === 'valid' && (
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    )}
                    {getFieldState('alternatePhone') === 'invalid' && (
                      <XCircleIcon className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {errors.alternatePhone && touched.alternatePhone && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <ExclamationCircleIcon className="h-4 w-4" />
                  {errors.alternatePhone}
                </p>
              )}
            </div>
          )}

          {/* Company Field */}
          {showCompanyField && (
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                Company Name (Optional)
              </label>
              <Input
                id="company"
                name="company"
                type="text"
                value={formData.company}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Your Company Ltd."
                className={cn(
                  errors.company && touched.company && 'border-red-500'
                )}
                disabled={isLoading}
              />
              {errors.company && touched.company && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <ExclamationCircleIcon className="h-4 w-4" />
                  {errors.company}
                </p>
              )}
            </div>
          )}

          {/* Tax ID / GSTIN */}
          {showTaxIdField && (
            <div>
              <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-1">
                GSTIN (Optional)
              </label>
              <Input
                id="taxId"
                name="taxId"
                type="text"
                value={formData.taxId}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="22AAAAA0000A1Z5"
                className={cn(
                  'uppercase',
                  errors.taxId && touched.taxId && 'border-red-500',
                  !errors.taxId && touched.taxId && formData.taxId && 'border-green-500'
                )}
                disabled={isLoading}
                maxLength={15}
              />
              {errors.taxId && touched.taxId && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <ExclamationCircleIcon className="h-4 w-4" />
                  {errors.taxId}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                <InformationCircleIcon className="h-3 w-3" />
                Required for business orders to claim GST input credit
              </p>
            </div>
          )}

          {/* Communication Preferences */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Communication Preferences</h4>
            <div className="space-y-3">
              {/* Newsletter */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="subscribeToNewsletter"
                  checked={formData.subscribeToNewsletter}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  disabled={isLoading}
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    Subscribe to newsletter
                  </span>
                  <p className="text-xs text-gray-500">
                    Get exclusive deals, new product launches, and fashion tips
                  </p>
                </div>
              </label>

              {/* WhatsApp Updates */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="acceptWhatsappUpdates"
                  checked={formData.acceptWhatsappUpdates}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  disabled={isLoading}
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    Send order updates via WhatsApp
                  </span>
                  <p className="text-xs text-gray-500">
                    Receive real-time order status updates on WhatsApp
                  </p>
                </div>
              </label>

              {/* SMS Updates */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="acceptSmsUpdates"
                  checked={formData.acceptSmsUpdates}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  disabled={isLoading}
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    Send order updates via SMS
                  </span>
                  <p className="text-xs text-gray-500">
                    Receive important order updates via text messages
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center gap-3 justify-end">
        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isLoading || isValidating}
          className="min-w-[150px]"
        >
          {isLoading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"
              />
              Saving...
            </>
          ) : (
            'Continue'
          )}
        </Button>
      </div>
    </motion.form>
  );
};

export default ContactForm;