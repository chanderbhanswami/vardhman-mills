'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  HomeIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import type { UserAddress, AddressForm as AddressFormData, AddressType } from '@/types/address.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface AddressFormProps {
  /**
   * Existing address to edit (optional)
   */
  address?: UserAddress;

  /**
   * Callback when form is submitted
   */
  onSubmit: (data: AddressFormData) => void | Promise<void>;

  /**
   * Callback when form is cancelled
   */
  onCancel?: () => void;

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Form mode
   */
  mode?: 'create' | 'edit';

  /**
   * Show company field
   */
  showCompanyField?: boolean;

  /**
   * Show email field
   */
  showEmailField?: boolean;

  /**
   * Show delivery instructions
   */
  showInstructions?: boolean;

  /**
   * Show set as default checkbox
   */
  showDefaultCheckbox?: boolean;

  /**
   * Required fields
   */
  requiredFields?: Array<keyof AddressFormData>;

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

const ADDRESS_TYPES: Array<{ value: AddressType; label: string; icon: typeof HomeIcon }> = [
  { value: 'home', label: 'Home', icon: HomeIcon },
  { value: 'office', label: 'Office', icon: BuildingOfficeIcon },
  { value: 'apartment', label: 'Apartment', icon: BuildingOfficeIcon },
  { value: 'business', label: 'Business', icon: BuildingOfficeIcon },
  { value: 'po_box', label: 'P.O. Box', icon: MapPinIcon },
  { value: 'hotel', label: 'Hotel', icon: BuildingOfficeIcon },
  { value: 'other', label: 'Other', icon: MapPinIcon },
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

const DEFAULT_REQUIRED_FIELDS: Array<keyof AddressFormData> = [
  'type',
  'firstName',
  'lastName',
  'addressLine1',
  'city',
  'state',
  'postalCode',
  'country',
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate postal code format
 */
const validatePostalCode = (postalCode: string, country: string): boolean => {
  const patterns: Record<string, RegExp> = {
    IN: /^\d{6}$/,
    US: /^\d{5}(-\d{4})?$/,
    GB: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i,
    CA: /^[A-Z]\d[A-Z] ?\d[A-Z]\d$/i,
  };

  const pattern = patterns[country];
  if (!pattern) return true; // Skip validation for unknown countries

  return pattern.test(postalCode.trim());
};

/**
 * Validate phone number format
 */
const validatePhoneNumber = (phone: string, country: string): boolean => {
  const patterns: Record<string, RegExp> = {
    IN: /^[6-9]\d{9}$/,
    US: /^[2-9]\d{9}$/,
    GB: /^[1-9]\d{9,10}$/,
  };

  const pattern = patterns[country];
  if (!pattern) return phone.length >= 10; // Basic validation for unknown countries

  return pattern.test(phone.replace(/[\s\-\(\)]/g, ''));
};

/**
 * Validate email format
 */
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * AddressForm Component
 * 
 * Comprehensive form for creating or editing addresses.
 * Features:
 * - Address type selection with icons
 * - Contact information fields
 * - Address details with validation
 * - Postal code validation
 * - Phone number validation
 * - Email validation
 * - Optional company field
 * - Optional delivery instructions
 * - Optional special instructions
 * - Set as default checkbox
 * - Real-time validation
 * - Error messages
 * - Loading states
 * - Responsive design
 * - Autofill support
 * 
 * @example
 * ```tsx
 * <AddressForm
 *   address={existingAddress}
 *   onSubmit={handleSubmit}
 *   onCancel={handleCancel}
 *   isLoading={isSubmitting}
 *   mode="edit"
 * />
 * ```
 */
export const AddressForm: React.FC<AddressFormProps> = ({
  address,
  onSubmit,
  onCancel,
  isLoading = false,
  mode = 'create',
  showCompanyField = true,
  showEmailField = true,
  showInstructions = true,
  showDefaultCheckbox = true,
  requiredFields = DEFAULT_REQUIRED_FIELDS,
  className,
}) => {
  // Form state
  const [formData, setFormData] = useState<AddressFormData>({
    type: address?.type || 'home',
    label: address?.label || '',
    firstName: address?.firstName || '',
    lastName: address?.lastName || '',
    company: address?.company || '',
    phone: address?.phone || '',
    email: address?.email || '',
    addressLine1: address?.addressLine1 || '',
    addressLine2: address?.addressLine2 || '',
    city: address?.city || '',
    state: address?.state || '',
    postalCode: address?.postalCode || '',
    country: address?.country || 'India',
    landmark: address?.landmark || '',
    isDefault: address?.isDefault || false,
    deliveryInstructions: address?.deliveryInstructions || '',
    specialInstructions: address?.specialInstructions || '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isValidating, setIsValidating] = useState(false);

  // Update form when address prop changes
  useEffect(() => {
    if (address) {
      setFormData({
        type: address.type,
        label: address.label || '',
        firstName: address.firstName,
        lastName: address.lastName,
        company: address.company || '',
        phone: address.phone || '',
        email: address.email || '',
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 || '',
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        landmark: address.landmark || '',
        isDefault: address.isDefault,
        deliveryInstructions: address.deliveryInstructions || '',
        specialInstructions: address.specialInstructions || '',
      });
    }
  }, [address]);

  /**
   * Validate field
   */
  const validateField = (name: keyof AddressFormData, value: unknown): string => {
    // Check if field is required
    if (requiredFields.includes(name)) {
      if (!value || (typeof value === 'string' && !value.trim())) {
        return 'This field is required';
      }
    }

    // Specific field validations
    switch (name) {
      case 'email':
        if (value && typeof value === 'string' && !validateEmail(value)) {
          return 'Please enter a valid email address';
        }
        break;

      case 'phone':
        if (value && typeof value === 'string') {
          const cleanPhone = (value as string).replace(/[\s\-\(\)]/g, '');
          if (!validatePhoneNumber(cleanPhone, formData.country)) {
            return formData.country === 'India' 
              ? 'Please enter a valid 10-digit mobile number'
              : 'Please enter a valid phone number';
          }
        }
        break;

      case 'postalCode':
        if (value && typeof value === 'string' && !validatePostalCode(value as string, formData.country)) {
          return formData.country === 'India'
            ? 'Please enter a valid 6-digit PIN code'
            : 'Please enter a valid postal code';
        }
        break;

      case 'firstName':
      case 'lastName':
        if (value && typeof value === 'string' && (value as string).length < 2) {
          return 'Name must be at least 2 characters';
        }
        break;

      case 'addressLine1':
        if (value && typeof value === 'string' && (value as string).length < 5) {
          return 'Address must be at least 5 characters';
        }
        break;
    }

    return '';
  };

  /**
   * Validate entire form
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate all fields
    Object.keys(formData).forEach((key) => {
      const fieldName = key as keyof AddressFormData;
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle input change
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const fieldName = name as keyof AddressFormData;

    // Handle checkbox
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: '' }));
    }
  };

  /**
   * Handle field blur
   */
  const handleBlur = async (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    const fieldName = name as keyof AddressFormData;

    setTouched((prev) => ({ ...prev, [name]: true }));

    // For postal code, show loading state during validation
    if (fieldName === 'postalCode') {
      setIsValidating(true);
      // Simulate async validation (e.g., checking postal code validity with API)
      await new Promise(resolve => setTimeout(resolve, 300));
      setIsValidating(false);
    }

    // Validate field on blur
    const error = validateField(fieldName, formData[fieldName]);
    if (error) {
      setErrors((prev) => ({ ...prev, [fieldName]: error }));
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);

    // Validate form
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to save address');
    }
  };

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className={cn('space-y-6', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Address Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Address Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ADDRESS_TYPES.slice(0, 4).map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, type: type.value }))}
                className={cn(
                  'flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all',
                  formData.type === type.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                )}
              >
                <Icon className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional Label */}
      <div>
        <Input
          label="Label (Optional)"
          name="label"
          value={formData.label}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="e.g., Home, Mom's House, Office"
        />
        <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
          <InformationCircleIcon className="h-3 w-3" />
          Give this address a custom label
        </p>
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.firstName ? errors.firstName : undefined}
          required={requiredFields.includes('firstName')}
          placeholder="John"
        />
        <Input
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.lastName ? errors.lastName : undefined}
          required={requiredFields.includes('lastName')}
          placeholder="Doe"
        />
      </div>

      {/* Company Field */}
      {showCompanyField && (
        <div className="relative">
          <BuildingOfficeIcon className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
          <Input
            label="Company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.company ? errors.company : undefined}
            required={requiredFields.includes('company')}
            placeholder="Company Name (Optional)"
            className="pl-10"
          />
        </div>
      )}

      {/* Contact Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <PhoneIcon className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.phone ? errors.phone : undefined}
            required={requiredFields.includes('phone')}
            placeholder={formData.country === 'India' ? '9876543210' : 'Phone Number'}
            className="pl-10"
          />
          {formData.phone && !errors.phone && touched.phone && (
            <CheckCircleIcon className="absolute right-3 top-9 h-5 w-5 text-green-500" />
          )}
          {errors.phone && touched.phone && (
            <XCircleIcon className="absolute right-3 top-9 h-5 w-5 text-red-500" />
          )}
        </div>
        {showEmailField && (
          <div className="relative">
            <EnvelopeIcon className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email ? errors.email : undefined}
              required={requiredFields.includes('email')}
              placeholder="john.doe@example.com"
              className="pl-10"
            />
            {formData.email && !errors.email && touched.email && (
              <CheckCircleIcon className="absolute right-3 top-9 h-5 w-5 text-green-500" />
            )}
            {errors.email && touched.email && (
              <XCircleIcon className="absolute right-3 top-9 h-5 w-5 text-red-500" />
            )}
          </div>
        )}
      </div>

      {/* Address Line 1 */}
      <div className="relative">
        <MapPinIcon className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
        <Input
          label="Address Line 1"
          name="addressLine1"
          value={formData.addressLine1}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.addressLine1 ? errors.addressLine1 : undefined}
          required={requiredFields.includes('addressLine1')}
          placeholder="House No., Building Name, Street"
          className="pl-10"
        />
      </div>

      {/* Address Line 2 */}
      <Input
        label="Address Line 2 (Optional)"
        name="addressLine2"
        value={formData.addressLine2}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Apartment, Suite, Unit, Floor, etc."
      />

      {/* Landmark */}
      <div>
        <Input
          label="Landmark (Optional)"
          name="landmark"
          value={formData.landmark}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Nearby landmark for easy location"
        />
        <Card className="mt-2 p-2 bg-blue-50 border-blue-200">
          <p className="text-xs text-blue-700 flex items-center gap-1">
            <InformationCircleIcon className="h-3 w-3" />
            This helps delivery personnel find your address
          </p>
        </Card>
      </div>

      {/* City, State, Postal Code */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="City"
          name="city"
          value={formData.city}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.city ? errors.city : undefined}
          required={requiredFields.includes('city')}
          placeholder="City"
        />

        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
            State {requiredFields.includes('state') && <span className="text-red-500">*</span>}
          </label>
          <select
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            onBlur={handleBlur}
            className={cn(
              'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              errors.state && touched.state ? 'border-red-500' : 'border-gray-300'
            )}
          >
            <option value="">Select State</option>
            {INDIAN_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          {errors.state && touched.state && (
            <p className="mt-1 text-sm text-red-600">{errors.state}</p>
          )}
        </div>

        <Input
          label={formData.country === 'India' ? 'PIN Code' : 'Postal Code'}
          name="postalCode"
          value={formData.postalCode}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.postalCode ? errors.postalCode : undefined}
          required={requiredFields.includes('postalCode')}
          placeholder={formData.country === 'India' ? '123456' : 'Postal Code'}
          maxLength={formData.country === 'India' ? 6 : undefined}
        />
      </div>

      {/* Country */}
      <div>
        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
          Country {requiredFields.includes('country') && <span className="text-red-500">*</span>}
        </label>
        <select
          id="country"
          name="country"
          value={formData.country}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn(
            'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            errors.country && touched.country ? 'border-red-500' : 'border-gray-300'
          )}
        >
          <option value="India">India</option>
          <option value="United States">United States</option>
          <option value="United Kingdom">United Kingdom</option>
          <option value="Canada">Canada</option>
          <option value="Australia">Australia</option>
        </select>
        {errors.country && touched.country && (
          <p className="mt-1 text-sm text-red-600">{errors.country}</p>
        )}
      </div>

      {/* Delivery Instructions */}
      {showInstructions && (
        <>
          <div>
            <label htmlFor="deliveryInstructions" className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Instructions (Optional)
            </label>
            <textarea
              id="deliveryInstructions"
              name="deliveryInstructions"
              value={formData.deliveryInstructions}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="e.g., Ring the doorbell, Call before delivery, Leave with security"
            />
            <p className="mt-1 text-xs text-gray-500">
              Help delivery personnel deliver your order smoothly
            </p>
          </div>

          <div>
            <label htmlFor="specialInstructions" className="block text-sm font-medium text-gray-700 mb-1">
              Special Instructions (Optional)
            </label>
            <textarea
              id="specialInstructions"
              name="specialInstructions"
              value={formData.specialInstructions}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="Any other special instructions or notes"
            />
          </div>
        </>
      )}

      {/* Set as Default Checkbox */}
      {showDefaultCheckbox && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="isDefault"
            checked={formData.isDefault}
            onChange={handleChange}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700">Set as default address</span>
        </label>
      )}

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <AnimatePresence>
          {isValidating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Badge variant="default" className="mr-2">
                Validating...
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>
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
          loading={isLoading}
        >
          {mode === 'edit' ? 'Update Address' : 'Save Address'}
        </Button>
      </div>
    </motion.form>
  );
};

export default AddressForm;