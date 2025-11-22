'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TruckIcon,
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  GiftIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  BoltIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import type { ShippingMethod } from '@/types/cart.types';
import type { Address } from '@/types/common.types';

export interface ShippingFormData {
  shippingAddress: Address;
  shippingMethod: string;
  deliveryInstructions?: string;
  giftWrap?: boolean;
  giftMessage?: string;
}

interface GuestShippingProps {
  initialData?: Partial<ShippingFormData>;
  onSubmit: (data: ShippingFormData) => void;
  onBack?: () => void;
  availableShippingMethods?: ShippingMethod[];
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
  shippingMethod?: string;
  deliveryInstructions?: string;
  giftMessage?: string;
}

const defaultShippingMethods: ShippingMethod[] = [
  {
    id: 'standard',
    name: 'Standard Shipping',
    description: 'Delivery in 5-7 business days',
    carrier: 'Standard',
    serviceType: 'ground',
    estimatedDays: { min: 5, max: 7 },
    price: { amount: 0, currency: 'INR', formatted: '₹0' },
    isFree: true,
    isExpress: false,
    trackingAvailable: true,
  },
  {
    id: 'express',
    name: 'Express Shipping',
    description: 'Delivery in 2-3 business days',
    carrier: 'Express',
    serviceType: 'air',
    estimatedDays: { min: 2, max: 3 },
    price: { amount: 150, currency: 'INR', formatted: '₹150' },
    isFree: false,
    isExpress: true,
    trackingAvailable: true,
  },
  {
    id: 'overnight',
    name: 'Overnight Shipping',
    description: 'Next business day delivery',
    carrier: 'Overnight',
    serviceType: 'overnight',
    estimatedDays: { min: 1, max: 1 },
    price: { amount: 300, currency: 'INR', formatted: '₹300' },
    isFree: false,
    isExpress: true,
    trackingAvailable: true,
  },
];

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

export const GuestShipping: React.FC<GuestShippingProps> = ({
  initialData,
  onSubmit,
  onBack,
  availableShippingMethods = defaultShippingMethods,
}) => {
  const [formData, setFormData] = useState<ShippingFormData>({
    shippingAddress: {
      id: '',
      type: 'home',
      firstName: initialData?.shippingAddress?.firstName || '',
      lastName: initialData?.shippingAddress?.lastName || '',
      address: initialData?.shippingAddress?.address || '',
      addressLine1: initialData?.shippingAddress?.addressLine1 || '',
      addressLine2: initialData?.shippingAddress?.addressLine2 || '',
      city: initialData?.shippingAddress?.city || '',
      state: initialData?.shippingAddress?.state || '',
      pincode: initialData?.shippingAddress?.pincode || '',
      postalCode: initialData?.shippingAddress?.postalCode || '',
      country: initialData?.shippingAddress?.country || 'India',
      phone: initialData?.shippingAddress?.phone || '',
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    shippingMethod: initialData?.shippingMethod || '',
    deliveryInstructions: initialData?.deliveryInstructions || '',
    giftWrap: initialData?.giftWrap || false,
    giftMessage: initialData?.giftMessage || '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [showGiftOptions, setShowGiftOptions] = useState(initialData?.giftWrap || false);

  // Load from session storage on mount
  useEffect(() => {
    const savedData = sessionStorage.getItem('guestCheckout_shipping');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
        setShowGiftOptions(parsed.giftWrap || false);
      } catch (error) {
        console.error('Failed to load shipping data from session storage:', error);
      }
    }
  }, []);

  // Save to session storage on change
  useEffect(() => {
    sessionStorage.setItem('guestCheckout_shipping', JSON.stringify(formData));
  }, [formData]);

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

  const validateField = (name: string, value: string | boolean | undefined | Date | {lat: number; lng: number} | Address): void => {
    const newErrors: FormErrors = { ...errors };

    if (name.startsWith('shippingAddress.')) {
      const fieldName = name.split('.')[1] as keyof Address;
      const fieldValue = value as string | boolean;

      switch (fieldName) {
        case 'firstName':
        case 'lastName':
          if (typeof fieldValue === 'string' && (!fieldValue || !validateName(fieldValue))) {
            newErrors[fieldName] = `${fieldName === 'firstName' ? 'First' : 'Last'} name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes`;
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
    } else if (name === 'shippingMethod') {
      if (!value) {
        newErrors.shippingMethod = 'Please select a shipping method';
      } else {
        delete newErrors.shippingMethod;
      }
    } else if (name === 'deliveryInstructions') {
      if (typeof value === 'string' && value && value.length > 500) {
        newErrors.deliveryInstructions = 'Delivery instructions must not exceed 500 characters';
      } else {
        delete newErrors.deliveryInstructions;
      }
    } else if (name === 'giftMessage') {
      if (typeof value === 'string' && value && value.length > 250) {
        newErrors.giftMessage = 'Gift message must not exceed 250 characters';
      } else {
        delete newErrors.giftMessage;
      }
    }

    setErrors(newErrors);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const { shippingAddress } = formData;

    // Validate all required fields
    if (!shippingAddress.firstName || !validateName(shippingAddress.firstName)) {
      newErrors.firstName = 'Valid first name is required';
    }
    if (!shippingAddress.lastName || !validateName(shippingAddress.lastName)) {
      newErrors.lastName = 'Valid last name is required';
    }
    if (!shippingAddress.addressLine1 || shippingAddress.addressLine1.length < 5) {
      newErrors.addressLine1 = 'Valid street address is required';
    }
    if (!shippingAddress.city || shippingAddress.city.length < 2) {
      newErrors.city = 'Valid city is required';
    }
    if (!shippingAddress.state) {
      newErrors.state = 'State is required';
    }
    if (!shippingAddress.postalCode || !validatePostalCode(shippingAddress.postalCode)) {
      newErrors.postalCode = 'Valid PIN code is required';
    }
    if (!shippingAddress.phone || !validateIndianPhone(shippingAddress.phone)) {
      newErrors.phone = 'Valid mobile number is required';
    }
    if (!formData.shippingMethod) {
      newErrors.shippingMethod = 'Shipping method is required';
    }
    if (formData.deliveryInstructions && formData.deliveryInstructions.length > 500) {
      newErrors.deliveryInstructions = 'Delivery instructions too long';
    }
    if (formData.giftWrap && formData.giftMessage && formData.giftMessage.length > 250) {
      newErrors.giftMessage = 'Gift message too long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddressChange = (field: keyof Address, value: string): void => {
    setFormData((prev) => ({
      ...prev,
      shippingAddress: {
        ...prev.shippingAddress,
        [field]: value,
      },
    }));

    if (touched[`shippingAddress.${field}`]) {
      validateField(`shippingAddress.${field}`, value);
    }
  };

  const handleInputChange = (field: keyof ShippingFormData, value: string | boolean): void => {
    setFormData((prev: ShippingFormData) => ({
      ...prev,
      [field]: value,
    }));

    if (touched[field as string]) {
      validateField(field as string, value);
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    
    if (field.startsWith('shippingAddress.')) {
      const addressField = field.split('.')[1] as keyof Address;
      validateField(field, formData.shippingAddress[addressField] as string);
    } else {
      validateField(field, formData[field as keyof ShippingFormData] as string | boolean);
    }
  };

  const handleShippingMethodSelect = (methodId: string) => {
    handleInputChange('shippingMethod', methodId);
    setTouched((prev) => ({ ...prev, shippingMethod: true }));
    validateField('shippingMethod', methodId);
  };

  const handleGiftWrapToggle = () => {
    const newGiftWrap = !formData.giftWrap;
    setShowGiftOptions(newGiftWrap);
    handleInputChange('giftWrap', newGiftWrap);
    
    if (!newGiftWrap) {
      handleInputChange('giftMessage', '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);

    // Mark all fields as touched
    const allFields: Record<string, boolean> = {
      'shippingAddress.firstName': true,
      'shippingAddress.lastName': true,
      'shippingAddress.addressLine1': true,
      'shippingAddress.city': true,
      'shippingAddress.state': true,
      'shippingAddress.postalCode': true,
      'shippingAddress.phone': true,
      shippingMethod: true,
    };
    setTouched(allFields);

    if (validateForm()) {
      try {
        await onSubmit(formData);
        toast.success('Shipping information saved!');
      } catch {
        toast.error('Failed to save shipping information. Please try again.');
      }
    } else {
      toast.error('Please fix all errors before continuing');
    }

    setIsValidating(false);
  };

  const getShippingMethodIcon = (methodId: string) => {
    switch (methodId) {
      case 'express':
        return <BoltIcon className="h-6 w-6" />;
      case 'overnight':
        return <SparklesIcon className="h-6 w-6" />;
      case 'standard':
      default:
        return <TruckIcon className="h-6 w-6" />;
    }
  };

  const calculateEstimatedDelivery = (days: { min: number; max: number }): string => {
    const today = new Date();
    const minDays = days.min;
    const maxDays = days.max;
    
    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() + minDays);
    
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + maxDays);

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    };

    if (minDays === maxDays) {
      return formatDate(minDate);
    }

    return `${formatDate(minDate)} - ${formatDate(maxDate)}`;
  };

  const isFieldValid = (field: string): boolean => {
    if (field.startsWith('shippingAddress.')) {
      const addressField = field.split('.')[1] as keyof Address;
      return touched[field] && !errors[addressField as keyof FormErrors];
    }
    return touched[field] && !errors[field as keyof FormErrors];
  };

  const isFieldInvalid = (field: string): boolean => {
    if (field.startsWith('shippingAddress.')) {
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
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <TruckIcon className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">Shipping Address</h3>
                  <Badge variant="secondary" size="sm">Required</Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Where should we deliver your order?
                </p>
              </div>
            </div>
            <MapPinIcon className="h-6 w-6 text-gray-400" />
          </div>

          {/* Recipient Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  id="firstName"
                  type="text"
                  value={formData.shippingAddress.firstName}
                  onChange={(e) => handleAddressChange('firstName', e.target.value)}
                  onBlur={() => handleBlur('shippingAddress.firstName')}
                  className={cn(
                    'pr-10',
                    isFieldValid('shippingAddress.firstName') && 'border-green-500',
                    isFieldInvalid('shippingAddress.firstName') && 'border-red-500'
                  )}
                  placeholder="John"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  {isFieldValid('shippingAddress.firstName') && (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  )}
                  {isFieldInvalid('shippingAddress.firstName') && (
                    <XCircleIcon className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
              {errors.firstName && touched['shippingAddress.firstName'] && (
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
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  id="lastName"
                  type="text"
                  value={formData.shippingAddress.lastName}
                  onChange={(e) => handleAddressChange('lastName', e.target.value)}
                  onBlur={() => handleBlur('shippingAddress.lastName')}
                  className={cn(
                    'pr-10',
                    isFieldValid('shippingAddress.lastName') && 'border-green-500',
                    isFieldInvalid('shippingAddress.lastName') && 'border-red-500'
                  )}
                  placeholder="Doe"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  {isFieldValid('shippingAddress.lastName') && (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  )}
                  {isFieldInvalid('shippingAddress.lastName') && (
                    <XCircleIcon className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
              {errors.lastName && touched['shippingAddress.lastName'] && (
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
            <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-1">
              Street Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                id="addressLine1"
                type="text"
                value={formData.shippingAddress.addressLine1}
                onChange={(e) => handleAddressChange('addressLine1', e.target.value)}
                onBlur={() => handleBlur('shippingAddress.addressLine1')}
                className={cn(
                  'pr-10',
                  isFieldValid('shippingAddress.addressLine1') && 'border-green-500',
                  isFieldInvalid('shippingAddress.addressLine1') && 'border-red-500'
                )}
                placeholder="House number and street name"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                {isFieldValid('shippingAddress.addressLine1') && (
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                )}
                {isFieldInvalid('shippingAddress.addressLine1') && (
                  <XCircleIcon className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>
            {errors.addressLine1 && touched['shippingAddress.addressLine1'] && (
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
            <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-1">
              Apartment, Suite, etc. <span className="text-gray-500">(Optional)</span>
            </label>
            <Input
              id="addressLine2"
              type="text"
              value={formData.shippingAddress.addressLine2}
              onChange={(e) => handleAddressChange('addressLine2', e.target.value)}
              onBlur={() => handleBlur('shippingAddress.addressLine2')}
              className={cn(
                isFieldInvalid('shippingAddress.addressLine2') && 'border-red-500'
              )}
              placeholder="Apartment, suite, unit, building, floor, etc."
            />
            {errors.addressLine2 && touched['shippingAddress.addressLine2'] && (
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
                  value={formData.shippingAddress.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  onBlur={() => handleBlur('shippingAddress.city')}
                  className={cn(
                    'pr-10',
                    isFieldValid('shippingAddress.city') && 'border-green-500',
                    isFieldInvalid('shippingAddress.city') && 'border-red-500'
                  )}
                  placeholder="Mumbai"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  {isFieldValid('shippingAddress.city') && (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  )}
                  {isFieldInvalid('shippingAddress.city') && (
                    <XCircleIcon className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
              {errors.city && touched['shippingAddress.city'] && (
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
                  value={formData.shippingAddress.state}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                  onBlur={() => handleBlur('shippingAddress.state')}
                  className={cn(
                    'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                    isFieldValid('shippingAddress.state') && 'border-green-500',
                    isFieldInvalid('shippingAddress.state') && 'border-red-500'
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
              {errors.state && touched['shippingAddress.state'] && (
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
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                PIN Code <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  id="postalCode"
                  type="text"
                  value={formData.shippingAddress.postalCode}
                  onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                  onBlur={() => handleBlur('shippingAddress.postalCode')}
                  className={cn(
                    'pr-10',
                    isFieldValid('shippingAddress.postalCode') && 'border-green-500',
                    isFieldInvalid('shippingAddress.postalCode') && 'border-red-500'
                  )}
                  placeholder="400001"
                  maxLength={6}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  {isFieldValid('shippingAddress.postalCode') && (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  )}
                  {isFieldInvalid('shippingAddress.postalCode') && (
                    <XCircleIcon className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
              {errors.postalCode && touched['shippingAddress.postalCode'] && (
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
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                Country <span className="text-red-500">*</span>
              </label>
              <Input
                id="country"
                type="text"
                value={formData.shippingAddress.country}
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
                  value={formData.shippingAddress.phone}
                  onChange={(e) => handleAddressChange('phone', e.target.value)}
                  onBlur={() => handleBlur('shippingAddress.phone')}
                  className={cn(
                    'pl-10 pr-10',
                    isFieldValid('shippingAddress.phone') && 'border-green-500',
                    isFieldInvalid('shippingAddress.phone') && 'border-red-500'
                  )}
                  placeholder="9876543210"
                  maxLength={10}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  {isFieldValid('shippingAddress.phone') && (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  )}
                  {isFieldInvalid('shippingAddress.phone') && (
                    <XCircleIcon className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
              {errors.phone && touched['shippingAddress.phone'] && (
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
                For delivery updates and coordination
              </p>
            </div>
          </div>

          {/* Shipping Methods */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <ClockIcon className="h-5 w-5 text-gray-600" />
              <h4 className="text-md font-semibold text-gray-900">Shipping Method</h4>
              <span className="text-red-500">*</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {availableShippingMethods.map((method) => (
                <motion.div
                  key={method.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleShippingMethodSelect(method.id)}
                  className={cn(
                    'relative p-4 border-2 rounded-lg cursor-pointer transition-all',
                    formData.shippingMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'flex-shrink-0 p-2 rounded-full',
                      formData.shippingMethod === method.id ? 'bg-blue-100' : 'bg-gray-100'
                    )}>
                      {getShippingMethodIcon(method.id)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-semibold text-gray-900">{method.name}</h5>
                        {method.isFree ? (
                          <Badge variant="success" size="sm">FREE</Badge>
                        ) : (
                          <span className="text-sm font-semibold text-gray-900">{method.price.formatted}</span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-600">{method.description}</p>
                      <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                        <ClockIcon className="h-3 w-3" />
                        <span>Estimated: {calculateEstimatedDelivery(method.estimatedDays)}</span>
                      </div>
                    </div>
                  </div>
                  {formData.shippingMethod === method.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2"
                    >
                      <CheckCircleIcon className="h-6 w-6 text-blue-600" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            {errors.shippingMethod && touched.shippingMethod && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-red-600 flex items-center gap-1"
              >
                <ExclamationCircleIcon className="h-4 w-4" />
                {errors.shippingMethod}
              </motion.p>
            )}
          </div>

          {/* Delivery Instructions */}
          <div>
            <label htmlFor="deliveryInstructions" className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Instructions <span className="text-gray-500">(Optional)</span>
            </label>
            <textarea
              id="deliveryInstructions"
              value={formData.deliveryInstructions}
              onChange={(e) => handleInputChange('deliveryInstructions', e.target.value)}
              onBlur={() => handleBlur('deliveryInstructions')}
              className={cn(
                'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none',
                isFieldInvalid('deliveryInstructions') && 'border-red-500'
              )}
              placeholder="E.g., Please call before delivery, Leave at door, etc."
              rows={3}
              maxLength={500}
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">
                Help us deliver your order smoothly
              </p>
              <span className="text-xs text-gray-500">
                {formData.deliveryInstructions?.length || 0}/500
              </span>
            </div>
            {errors.deliveryInstructions && touched.deliveryInstructions && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 text-sm text-red-600 flex items-center gap-1"
              >
                <ExclamationCircleIcon className="h-4 w-4" />
                {errors.deliveryInstructions}
              </motion.p>
            )}
          </div>

          {/* Gift Options */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GiftIcon className="h-5 w-5 text-purple-600" />
                <label htmlFor="giftWrap" className="text-sm font-medium text-gray-900">
                  Gift Wrap this order
                </label>
                <Badge variant="info" size="sm">+₹50</Badge>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="giftWrap"
                  checked={formData.giftWrap}
                  onChange={handleGiftWrapToggle}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <AnimatePresence>
              {showGiftOptions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-4"
                >
                  <label htmlFor="giftMessage" className="block text-sm font-medium text-gray-700 mb-1">
                    Gift Message <span className="text-gray-500">(Optional)</span>
                  </label>
                  <textarea
                    id="giftMessage"
                    value={formData.giftMessage}
                    onChange={(e) => handleInputChange('giftMessage', e.target.value)}
                    onBlur={() => handleBlur('giftMessage')}
                    className={cn(
                      'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none',
                      isFieldInvalid('giftMessage') && 'border-red-500'
                    )}
                    placeholder="Add a personal message for the recipient..."
                    rows={3}
                    maxLength={250}
                  />
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <InformationCircleIcon className="h-4 w-4" />
                      Your message will be printed on a beautiful card
                    </p>
                    <span className="text-xs text-gray-500">
                      {formData.giftMessage?.length || 0}/250
                    </span>
                  </div>
                  {errors.giftMessage && touched.giftMessage && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-600 flex items-center gap-1"
                    >
                      <ExclamationCircleIcon className="h-4 w-4" />
                      {errors.giftMessage}
                    </motion.p>
                  )}
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
            'Continue to Billing'
          )}
        </Button>
      </div>
    </motion.form>
  );
};
