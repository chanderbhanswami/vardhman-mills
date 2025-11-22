'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCardIcon,
  MapPinIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import type { Address } from '@/types/common.types';

export interface BillingFormData {
  billingAddress: Address;
  sameAsShipping: boolean;
  companyName?: string;
  taxId?: string;
}

interface GuestBillingProps {
  initialData?: Partial<BillingFormData>;
  shippingAddress?: Address;
  onSubmit: (data: BillingFormData) => void;
  onBack?: () => void;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  companyName?: string;
  taxId?: string;
}

const indianStates = [
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

export const GuestBilling: React.FC<GuestBillingProps> = ({
  initialData,
  shippingAddress,
  onSubmit,
  onBack,
}) => {
  const [formData, setFormData] = useState<BillingFormData>({
    sameAsShipping: initialData?.sameAsShipping ?? true,
    billingAddress: initialData?.billingAddress || {
      id: '',
      type: 'home',
      firstName: '',
      lastName: '',
      address: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      postalCode: '',
      country: 'India',
      phone: '',
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    companyName: initialData?.companyName || '',
    taxId: initialData?.taxId || '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [showBusinessInfo, setShowBusinessInfo] = useState(
    !!(initialData?.companyName || initialData?.taxId)
  );

  // Load from session storage on mount
  useEffect(() => {
    const savedData = sessionStorage.getItem('guestCheckout_billing');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
        setShowBusinessInfo(!!(parsed.companyName || parsed.taxId));
      } catch (error) {
        console.error('Failed to load billing data from session storage:', error);
      }
    }
  }, []);

  // Save to session storage on change
  useEffect(() => {
    sessionStorage.setItem('guestCheckout_billing', JSON.stringify(formData));
  }, [formData]);

  // Auto-fill billing address when same as shipping
  useEffect(() => {
    if (formData.sameAsShipping && shippingAddress) {
      setFormData((prev: BillingFormData) => ({
        ...prev,
        billingAddress: {
          ...shippingAddress,
          type: 'home',
        },
      }));
    }
  }, [formData.sameAsShipping, shippingAddress]);

  // Validation functions
  const validateName = (name: string): boolean => {
    const nameRegex = /^[a-zA-Z\s\-']+$/;
    return name.length >= 2 && name.length <= 50 && nameRegex.test(name);
  };

  const validateIndianPhone = (phone: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validatePostalCode = (postalCode: string): boolean => {
    const postalCodeRegex = /^[1-9][0-9]{5}$/;
    return postalCodeRegex.test(postalCode);
  };

  const validateGSTIN = (gstin: string): boolean => {
    if (!gstin) return true; // Optional field
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin);
  };

  const validateField = (
    name: string,
    value: string | boolean | undefined | Date | { lat: number; lng: number } | Address
  ): void => {
    const newErrors: FormErrors = { ...errors };

    if (name.startsWith('billingAddress.')) {
      const fieldName = name.split('.')[1] as keyof Address;
      const fieldValue = value as string | boolean;

      switch (fieldName) {
        case 'firstName':
        case 'lastName':
          if (typeof fieldValue === 'string' && (!fieldValue || !validateName(fieldValue))) {
            newErrors[fieldName] = `${
              fieldName === 'firstName' ? 'First' : 'Last'
            } name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes`;
          } else {
            delete newErrors[fieldName];
          }
          break;

        case 'addressLine1':
          if (typeof fieldValue === 'string' && (!fieldValue || fieldValue.length < 5)) {
            newErrors.addressLine1 = 'Street address must be at least 5 characters';
          } else if (typeof fieldValue === 'string' && fieldValue.length > 200) {
            newErrors.addressLine1 = 'Street address must not exceed 200 characters';
          } else {
            delete newErrors.addressLine1;
          }
          break;

        case 'addressLine2':
          if (typeof fieldValue === 'string' && fieldValue && fieldValue.length > 200) {
            newErrors.addressLine2 = 'Address line 2 must not exceed 200 characters';
          } else {
            delete newErrors.addressLine2;
          }
          break;

        case 'city':
          if (typeof fieldValue === 'string' && (!fieldValue || fieldValue.length < 2)) {
            newErrors.city = 'City must be at least 2 characters';
          } else if (typeof fieldValue === 'string' && fieldValue.length > 50) {
            newErrors.city = 'City must not exceed 50 characters';
          } else {
            delete newErrors.city;
          }
          break;

        case 'state':
          if (!fieldValue) {
            newErrors.state = 'Please select a state';
          } else {
            delete newErrors.state;
          }
          break;

        case 'postalCode':
          if (typeof fieldValue === 'string' && (!fieldValue || !validatePostalCode(fieldValue))) {
            newErrors.postalCode = 'Please enter a valid 6-digit Indian PIN code';
          } else {
            delete newErrors.postalCode;
          }
          break;

        case 'phone':
          if (typeof fieldValue === 'string' && (!fieldValue || !validateIndianPhone(fieldValue))) {
            newErrors.phone = 'Please enter a valid 10-digit Indian mobile number';
          } else {
            delete newErrors.phone;
          }
          break;
      }
    } else if (name === 'companyName') {
      if (typeof value === 'string' && value && value.length < 2) {
        newErrors.companyName = 'Company name must be at least 2 characters';
      } else if (typeof value === 'string' && value && value.length > 100) {
        newErrors.companyName = 'Company name must not exceed 100 characters';
      } else {
        delete newErrors.companyName;
      }
    } else if (name === 'taxId') {
      if (typeof value === 'string' && value && !validateGSTIN(value)) {
        newErrors.taxId = 'Please enter a valid GSTIN (15 characters)';
      } else {
        delete newErrors.taxId;
      }
    }

    setErrors(newErrors);
  };

  const validateForm = (): boolean => {
    // If same as shipping, no validation needed
    if (formData.sameAsShipping) {
      return true;
    }

    const newErrors: FormErrors = {};
    const { billingAddress } = formData;

    // Validate all required fields
    if (!billingAddress.firstName || !validateName(billingAddress.firstName)) {
      newErrors.firstName = 'Valid first name is required';
    }
    if (!billingAddress.lastName || !validateName(billingAddress.lastName)) {
      newErrors.lastName = 'Valid last name is required';
    }
    if (!billingAddress.addressLine1 || billingAddress.addressLine1.length < 5) {
      newErrors.addressLine1 = 'Valid street address is required';
    }
    if (!billingAddress.city || billingAddress.city.length < 2) {
      newErrors.city = 'Valid city is required';
    }
    if (!billingAddress.state) {
      newErrors.state = 'State is required';
    }
    if (!billingAddress.postalCode || !validatePostalCode(billingAddress.postalCode)) {
      newErrors.postalCode = 'Valid PIN code is required';
    }
    if (!billingAddress.phone || !validateIndianPhone(billingAddress.phone)) {
      newErrors.phone = 'Valid mobile number is required';
    }

    // Validate business info if provided
    if (formData.companyName && formData.companyName.length < 2) {
      newErrors.companyName = 'Valid company name is required';
    }
    if (formData.taxId && !validateGSTIN(formData.taxId)) {
      newErrors.taxId = 'Valid GSTIN is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddressChange = (field: keyof Address, value: string): void => {
    setFormData((prev: BillingFormData) => ({
      ...prev,
      billingAddress: {
        ...prev.billingAddress,
        [field]: value,
      },
    }));

    if (touched[`billingAddress.${field}`]) {
      validateField(`billingAddress.${field}`, value);
    }
  };

  const handleInputChange = (field: keyof BillingFormData, value: string | boolean): void => {
    setFormData((prev: BillingFormData) => ({
      ...prev,
      [field]: value,
    }));

    if (touched[field as string]) {
      validateField(field as string, value);
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    if (field.startsWith('billingAddress.')) {
      const addressField = field.split('.')[1] as keyof Address;
      validateField(field, formData.billingAddress[addressField] as string);
    } else {
      validateField(field, formData[field as keyof BillingFormData] as string | boolean);
    }
  };

  const handleSameAsShippingToggle = () => {
    const newValue = !formData.sameAsShipping;
    handleInputChange('sameAsShipping', newValue);

    if (newValue && shippingAddress) {
      setFormData((prev: BillingFormData) => ({
        ...prev,
        sameAsShipping: newValue,
        billingAddress: {
          ...shippingAddress,
          type: 'home',
        },
      }));
      setErrors({});
    }
  };

  const handleBusinessInfoToggle = () => {
    setShowBusinessInfo(!showBusinessInfo);
    if (showBusinessInfo) {
      handleInputChange('companyName', '');
      handleInputChange('taxId', '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);

    // Mark all fields as touched if not same as shipping
    if (!formData.sameAsShipping) {
      const allFields: Record<string, boolean> = {
        'billingAddress.firstName': true,
        'billingAddress.lastName': true,
        'billingAddress.addressLine1': true,
        'billingAddress.city': true,
        'billingAddress.state': true,
        'billingAddress.postalCode': true,
        'billingAddress.phone': true,
      };
      setTouched(allFields);
    }

    if (validateForm()) {
      try {
        await onSubmit(formData);
        toast.success('Billing information saved!');
      } catch {
        toast.error('Failed to save billing information. Please try again.');
      }
    } else {
      toast.error('Please fix all errors before continuing');
    }

    setIsValidating(false);
  };

  const isFieldValid = (field: string): boolean => {
    if (field.startsWith('billingAddress.')) {
      const addressField = field.split('.')[1] as keyof Address;
      return touched[field] && !errors[addressField as keyof FormErrors];
    }
    return touched[field] && !errors[field as keyof FormErrors];
  };

  const isFieldInvalid = (field: string): boolean => {
    if (field.startsWith('billingAddress.')) {
      const addressField = field.split('.')[1] as keyof Address;
      return touched[field] && !!errors[addressField as keyof FormErrors];
    }
    return touched[field] && !!errors[field as keyof FormErrors];
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <Card className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <CreditCardIcon className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">Billing Address</h3>
                  <Badge variant="secondary" size="sm">Required</Badge>
                </div>
                <p className="text-sm text-gray-600">Where should we send the invoice?</p>
              </div>
            </div>
            <MapPinIcon className="h-6 w-6 text-gray-400" />
          </div>

          {/* Same as Shipping Checkbox */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="sameAsShipping"
                type="checkbox"
                checked={formData.sameAsShipping}
                onChange={handleSameAsShippingToggle}
                className="sr-only peer"
                aria-label="Use same address as shipping address"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="sameAsShipping"
                  className="text-sm font-medium text-gray-900 cursor-pointer"
                >
                  Same as shipping address
                </label>
                {formData.sameAsShipping && (
                  <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                )}
              </div>
              <p className="mt-1 text-xs text-gray-600">
                Use the same address for billing and shipping
              </p>
            </div>
          </div>

          {/* Billing Address Form (Hidden if same as shipping) */}
          <AnimatePresence>
            {!formData.sameAsShipping && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Recipient Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        id="firstName"
                        type="text"
                        value={formData.billingAddress.firstName}
                        onChange={(e) => handleAddressChange('firstName', e.target.value)}
                        onBlur={() => handleBlur('billingAddress.firstName')}
                        className={cn(
                          'pr-10',
                          isFieldValid('billingAddress.firstName') && 'border-green-500',
                          isFieldInvalid('billingAddress.firstName') && 'border-red-500'
                        )}
                        placeholder="John"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        {isFieldValid('billingAddress.firstName') && (
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        )}
                        {isFieldInvalid('billingAddress.firstName') && (
                          <XCircleIcon className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>
                    {errors.firstName && touched['billingAddress.firstName'] && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-red-600 flex items-center gap-1"
                      >
                        <ExclamationCircleIcon className="h-4 w-4" />
                        {errors.firstName}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        id="lastName"
                        type="text"
                        value={formData.billingAddress.lastName}
                        onChange={(e) => handleAddressChange('lastName', e.target.value)}
                        onBlur={() => handleBlur('billingAddress.lastName')}
                        className={cn(
                          'pr-10',
                          isFieldValid('billingAddress.lastName') && 'border-green-500',
                          isFieldInvalid('billingAddress.lastName') && 'border-red-500'
                        )}
                        placeholder="Doe"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        {isFieldValid('billingAddress.lastName') && (
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        )}
                        {isFieldInvalid('billingAddress.lastName') && (
                          <XCircleIcon className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>
                    {errors.lastName && touched['billingAddress.lastName'] && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-red-600 flex items-center gap-1"
                      >
                        <ExclamationCircleIcon className="h-4 w-4" />
                        {errors.lastName}
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* Street Address */}
                <div>
                  <label
                    htmlFor="addressLine1"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      id="addressLine1"
                      type="text"
                      value={formData.billingAddress.addressLine1}
                      onChange={(e) => handleAddressChange('addressLine1', e.target.value)}
                      onBlur={() => handleBlur('billingAddress.addressLine1')}
                      className={cn(
                        'pr-10',
                        isFieldValid('billingAddress.addressLine1') && 'border-green-500',
                        isFieldInvalid('billingAddress.addressLine1') && 'border-red-500'
                      )}
                      placeholder="House number and street name"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      {isFieldValid('billingAddress.addressLine1') && (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      )}
                      {isFieldInvalid('billingAddress.addressLine1') && (
                        <XCircleIcon className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>
                  {errors.addressLine1 && touched['billingAddress.addressLine1'] && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-600 flex items-center gap-1"
                    >
                      <ExclamationCircleIcon className="h-4 w-4" />
                      {errors.addressLine1}
                    </motion.p>
                  )}
                </div>

                {/* Address Line 2 */}
                <div>
                  <label
                    htmlFor="addressLine2"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Apartment, Suite, etc. <span className="text-gray-500">(Optional)</span>
                  </label>
                  <Input
                    id="addressLine2"
                    type="text"
                    value={formData.billingAddress.addressLine2}
                    onChange={(e) => handleAddressChange('addressLine2', e.target.value)}
                    onBlur={() => handleBlur('billingAddress.addressLine2')}
                    className={cn(
                      isFieldInvalid('billingAddress.addressLine2') && 'border-red-500'
                    )}
                    placeholder="Apartment, suite, unit, building, floor, etc."
                  />
                  {errors.addressLine2 && touched['billingAddress.addressLine2'] && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-600 flex items-center gap-1"
                    >
                      <ExclamationCircleIcon className="h-4 w-4" />
                      {errors.addressLine2}
                    </motion.p>
                  )}
                </div>

                {/* City, State, Postal Code */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        id="city"
                        type="text"
                        value={formData.billingAddress.city}
                        onChange={(e) => handleAddressChange('city', e.target.value)}
                        onBlur={() => handleBlur('billingAddress.city')}
                        className={cn(
                          'pr-10',
                          isFieldValid('billingAddress.city') && 'border-green-500',
                          isFieldInvalid('billingAddress.city') && 'border-red-500'
                        )}
                        placeholder="Mumbai"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        {isFieldValid('billingAddress.city') && (
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        )}
                        {isFieldInvalid('billingAddress.city') && (
                          <XCircleIcon className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>
                    {errors.city && touched['billingAddress.city'] && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-red-600 flex items-center gap-1"
                      >
                        <ExclamationCircleIcon className="h-4 w-4" />
                        {errors.city}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="state"
                        value={formData.billingAddress.state}
                        onChange={(e) => handleAddressChange('state', e.target.value)}
                        onBlur={() => handleBlur('billingAddress.state')}
                        className={cn(
                          'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                          isFieldValid('billingAddress.state') && 'border-green-500',
                          isFieldInvalid('billingAddress.state') && 'border-red-500'
                        )}
                      >
                        <option value="">Select State</option>
                        {indianStates.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.state && touched['billingAddress.state'] && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-red-600 flex items-center gap-1"
                      >
                        <ExclamationCircleIcon className="h-4 w-4" />
                        {errors.state}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="postalCode"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      PIN Code <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        id="postalCode"
                        type="text"
                        value={formData.billingAddress.postalCode}
                        onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                        onBlur={() => handleBlur('billingAddress.postalCode')}
                        className={cn(
                          'pr-10',
                          isFieldValid('billingAddress.postalCode') && 'border-green-500',
                          isFieldInvalid('billingAddress.postalCode') && 'border-red-500'
                        )}
                        placeholder="400001"
                        maxLength={6}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        {isFieldValid('billingAddress.postalCode') && (
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        )}
                        {isFieldInvalid('billingAddress.postalCode') && (
                          <XCircleIcon className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>
                    {errors.postalCode && touched['billingAddress.postalCode'] && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-red-600 flex items-center gap-1"
                      >
                        <ExclamationCircleIcon className="h-4 w-4" />
                        {errors.postalCode}
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* Country and Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="country"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Country <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="country"
                      type="text"
                      value={formData.billingAddress.country}
                      readOnly
                      className="bg-gray-50"
                    />
                    <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                      <InformationCircleIcon className="h-4 w-4" />
                      Currently shipping to India only
                    </p>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <PhoneIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.billingAddress.phone}
                        onChange={(e) => handleAddressChange('phone', e.target.value)}
                        onBlur={() => handleBlur('billingAddress.phone')}
                        className={cn(
                          'pl-10 pr-10',
                          isFieldValid('billingAddress.phone') && 'border-green-500',
                          isFieldInvalid('billingAddress.phone') && 'border-red-500'
                        )}
                        placeholder="9876543210"
                        maxLength={10}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        {isFieldValid('billingAddress.phone') && (
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        )}
                        {isFieldInvalid('billingAddress.phone') && (
                          <XCircleIcon className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>
                    {errors.phone && touched['billingAddress.phone'] && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-red-600 flex items-center gap-1"
                      >
                        <ExclamationCircleIcon className="h-4 w-4" />
                        {errors.phone}
                      </motion.p>
                    )}
                    <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                      <InformationCircleIcon className="h-4 w-4" />
                      For billing inquiries
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Business Information */}
          <div className="pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="ghost"
              onClick={handleBusinessInfoToggle}
              className="mb-4 flex items-center gap-2"
            >
              <BuildingOfficeIcon className="h-5 w-5" />
              {showBusinessInfo ? 'Hide' : 'Add'} business information
              <Badge variant="info" size="sm">
                Optional
              </Badge>
            </Button>

            <AnimatePresence>
              {showBusinessInfo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div>
                    <label
                      htmlFor="companyName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Company Name <span className="text-gray-500">(Optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="companyName"
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        onBlur={() => handleBlur('companyName')}
                        className={cn(
                          'pl-10',
                          isFieldInvalid('companyName') && 'border-red-500'
                        )}
                        placeholder="Your Company Name"
                      />
                    </div>
                    {errors.companyName && touched.companyName && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-red-600 flex items-center gap-1"
                      >
                        <ExclamationCircleIcon className="h-4 w-4" />
                        {errors.companyName}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-1">
                      GSTIN <span className="text-gray-500">(Optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="taxId"
                        type="text"
                        value={formData.taxId}
                        onChange={(e) => handleInputChange('taxId', e.target.value.toUpperCase())}
                        onBlur={() => handleBlur('taxId')}
                        className={cn(
                          'pl-10',
                          isFieldInvalid('taxId') && 'border-red-500'
                        )}
                        placeholder="22AAAAA0000A1Z5"
                        maxLength={15}
                      />
                    </div>
                    {errors.taxId && touched.taxId && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-red-600 flex items-center gap-1"
                      >
                        <ExclamationCircleIcon className="h-4 w-4" />
                        {errors.taxId}
                      </motion.p>
                    )}
                    <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                      <InformationCircleIcon className="h-4 w-4" />
                      15-character Goods and Services Tax Identification Number
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        {onBack ? (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1 md:flex-none"
          >
            Back
          </Button>
        ) : (
          <div />
        )}

        <Button
          type="submit"
          variant="default"
          disabled={isValidating}
          className="flex-1 md:flex-none min-w-[200px]"
        >
          {isValidating ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving...
            </span>
          ) : (
            'Continue to Payment'
          )}
        </Button>
      </div>
    </motion.form>
  );
};
