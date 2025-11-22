'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addDays } from 'date-fns';
import {
  GiftIcon,
  UserIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  PaintBrushIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  CheckIcon,
  XMarkIcon,
  DocumentTextIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  MapPinIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  InformationCircleIcon,
  BuildingStorefrontIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { toast } from 'react-hot-toast';

// Local types for this component
type Currency = 'INR' | 'USD' | 'EUR';
type DeliveryMethod = 'email' | 'sms' | 'postal' | 'pickup';

// Form data interface
interface GiftCardFormData {
  type: 'digital' | 'physical' | 'hybrid';
  title: string;
  description?: string;
  denominationId?: string;
  customAmount?: number;
  currency: Currency;
  deliveryMethod: DeliveryMethod;
  recipientName?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  scheduledDelivery: boolean;
  deliveryDate?: Date;
  deliveryTime?: string;
  designId: string;
  customMessage?: string;
  senderName?: string;
  requiresPIN: boolean;
  pin?: string;
  neverExpires: boolean;
  expiryDate?: Date;
  allowPartialRedemption: boolean;
  allowReloading: boolean;
  allowTransfer: boolean;
  termsAccepted: boolean;
}

// Form validation schema
const giftCardSchema = z.object({
  // Basic Information
  type: z.enum(['digital', 'physical', 'hybrid']),
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().optional(),
  
  // Financial Details
  denominationId: z.string().optional(),
  customAmount: z.number().optional(),
  currency: z.enum(['INR', 'USD', 'EUR']),
  
  // Delivery & Scheduling
  deliveryMethod: z.enum(['email', 'sms', 'postal', 'pickup']),
  recipientName: z.string().optional(),
  recipientEmail: z.string().email().optional(),
  recipientPhone: z.string().optional(),
  scheduledDelivery: z.boolean(),
  deliveryDate: z.date().optional(),
  deliveryTime: z.string().optional(),
  
  // Design & Customization
  designId: z.string().min(1, 'Please select a design'),
  customMessage: z.string().max(500, 'Message is too long').optional(),
  senderName: z.string().optional(),
  
  // Security & Options
  requiresPIN: z.boolean(),
  pin: z.string().optional(),
  neverExpires: z.boolean(),
  expiryDate: z.date().optional(),
  
  // Advanced Options
  allowPartialRedemption: z.boolean(),
  allowReloading: z.boolean(),
  allowTransfer: z.boolean(),
  
  // Terms
  termsAccepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions'
  })
});

interface GiftCardFormProps {
  mode?: 'create' | 'edit';
  initialData?: Partial<GiftCardFormData>;
  onSubmit?: (data: GiftCardFormData) => Promise<void>;
  onCancel?: () => void;
  onSaveDraft?: (data: Partial<GiftCardFormData>) => Promise<void>;
  onPreview?: (data: Partial<GiftCardFormData>) => void;
  defaultCurrency?: Currency;
  defaultDeliveryMethod?: DeliveryMethod;
  availableDesigns?: Array<{
    id: string;
    name: string;
    category: string;
    preview: string;
    tags: string[];
  }>;
  availableDenominations?: Array<{
    id: string;
    amount: number;
    currency: Currency;
    bonus?: number;
  }>;
  className?: string;
}

// Available designs mock data
const defaultDesigns = [
  {
    id: 'birthday-1',
    name: 'Happy Birthday Balloons',
    category: 'birthday',
    preview: '/api/placeholder/300/200',
    tags: ['birthday', 'celebration', 'balloons']
  },
  {
    id: 'anniversary-1',
    name: 'Anniversary Hearts',
    category: 'anniversary',
    preview: '/api/placeholder/300/200',
    tags: ['anniversary', 'love', 'hearts']
  },
  {
    id: 'graduation-1',
    name: 'Graduation Cap',
    category: 'graduation',
    preview: '/api/placeholder/300/200',
    tags: ['graduation', 'education', 'achievement']
  },
  {
    id: 'holiday-1',
    name: 'Holiday Snowflakes',
    category: 'holiday',
    preview: '/api/placeholder/300/200',
    tags: ['holiday', 'winter', 'snowflakes']
  },
  {
    id: 'business-1',
    name: 'Professional Business',
    category: 'business',
    preview: '/api/placeholder/300/200',
    tags: ['business', 'professional', 'corporate']
  },
  {
    id: 'general-1',
    name: 'Thank You',
    category: 'general',
    preview: '/api/placeholder/300/200',
    tags: ['thank you', 'gratitude', 'appreciation']
  }
];

// Available denominations
const defaultDenominations = [
  { id: 'inr-500', amount: 500, currency: 'INR' as Currency },
  { id: 'inr-1000', amount: 1000, currency: 'INR' as Currency, bonus: 100 },
  { id: 'inr-2000', amount: 2000, currency: 'INR' as Currency, bonus: 250 },
  { id: 'inr-5000', amount: 5000, currency: 'INR' as Currency, bonus: 750 },
  { id: 'usd-25', amount: 25, currency: 'USD' as Currency },
  { id: 'usd-50', amount: 50, currency: 'USD' as Currency, bonus: 5 },
  { id: 'usd-100', amount: 100, currency: 'USD' as Currency, bonus: 15 },
  { id: 'eur-25', amount: 25, currency: 'EUR' as Currency },
  { id: 'eur-50', amount: 50, currency: 'EUR' as Currency, bonus: 5 },
  { id: 'eur-100', amount: 100, currency: 'EUR' as Currency, bonus: 10 }
];

// Utility functions
const formatCurrency = (amount: number, currency: Currency = 'INR'): string => {
  const config: Record<Currency, { locale: string; currency: string }> = {
    INR: { locale: 'en-IN', currency: 'INR' },
    USD: { locale: 'en-US', currency: 'USD' },
    EUR: { locale: 'en-EU', currency: 'EUR' }
  };
  
  const { locale, currency: curr } = config[currency];
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: curr,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

const generatePIN = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const validateStep = (step: number, values: Partial<GiftCardFormData>): boolean => {
  switch (step) {
    case 1: // Type & Amount
      return !!(values.type && (values.denominationId || values.customAmount));
    case 2: // Design
      return !!values.designId;
    case 3: // Delivery
      return !!(values.deliveryMethod && (!values.scheduledDelivery || values.deliveryDate));
    case 4: // Recipients (optional)
      return true;
    case 5: // Security
      return true;
    case 6: // Review
      return !!values.termsAccepted;
    default:
      return false;
  }
};

export const GiftCardForm: React.FC<GiftCardFormProps> = ({
  mode = 'create',
  initialData,
  onSubmit,
  onCancel,
  onSaveDraft,
  onPreview,
  defaultCurrency = 'INR',
  defaultDeliveryMethod = 'email',
  availableDesigns = defaultDesigns,
  availableDenominations = defaultDenominations,
  className
}) => {
  // Form setup
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty }
  } = useForm<GiftCardFormData>({
    resolver: zodResolver(giftCardSchema),
    defaultValues: {
      type: 'digital',
      title: '',
      description: '',
      currency: defaultCurrency,
      deliveryMethod: defaultDeliveryMethod,
      scheduledDelivery: false,
      neverExpires: true,
      requiresPIN: false,
      allowPartialRedemption: true,
      allowReloading: false,
      allowTransfer: true,
      termsAccepted: false,
      designId: '',
      ...initialData
    },
    mode: 'onChange'
  });

  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps] = useState(6);
  const [selectedDenomination, setSelectedDenomination] = useState<string>('');
  const [selectedDesignCategory, setSelectedDesignCategory] = useState<string>('all');
  const [previewMode, setPreviewMode] = useState(false);
  const [generatedPIN, setGeneratedPIN] = useState<string>('');
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Watch form values for preview
  const watchedValues = watch();

  // Handlers
  const handleSaveDraft = useCallback(async () => {
    if (onSaveDraft && isDirty) {
      setIsDraftSaving(true);
      try {
        await onSaveDraft(watchedValues);
        toast.success('Draft saved successfully');
      } catch (error) {
        console.error('Failed to save draft:', error);
        toast.error('Failed to save draft');
      } finally {
        setIsDraftSaving(false);
      }
    }
  }, [onSaveDraft, isDirty, watchedValues]);

  // Effects
  useEffect(() => {
    if (watchedValues.requiresPIN && !generatedPIN) {
      setGeneratedPIN(generatePIN());
    }
  }, [watchedValues.requiresPIN, generatedPIN]);

  useEffect(() => {
    if (onPreview && previewMode) {
      onPreview(watchedValues);
    }
  }, [watchedValues, onPreview, previewMode]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (isDirty && onSaveDraft) {
      const interval = setInterval(() => {
        handleSaveDraft();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isDirty, onSaveDraft, handleSaveDraft]);

  const onFormSubmit = useCallback(async (data: GiftCardFormData) => {
    try {
      if (onSubmit) {
        await onSubmit(data);
        toast.success(mode === 'create' ? 'Gift card created successfully' : 'Gift card updated successfully');
      }
    } catch (error) {
      console.error('Failed to save gift card:', error);
      toast.error('Failed to save gift card');
    }
  }, [onSubmit, mode]);

  // Get filtered designs
  const filteredDesigns = selectedDesignCategory === 'all' 
    ? availableDesigns 
    : availableDesigns.filter(design => design.category === selectedDesignCategory);

  // Get design categories
  const designCategories = ['all', ...Array.from(new Set(availableDesigns.map(d => d.category)))];

  // Step navigation
  const nextStep = () => {
    if (currentStep < totalSteps && validateStep(currentStep, watchedValues)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  };

  // Step validation
  const isStepValid = (step: number): boolean => validateStep(step, watchedValues);
  const canProceed = isStepValid(currentStep);

  return (
    <div className={clsx('max-w-4xl mx-auto bg-white rounded-lg shadow-lg', className)}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'create' ? 'Create Gift Card' : 'Edit Gift Card'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Preview Toggle */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center space-x-2"
            >
              {previewMode ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              <span>{previewMode ? 'Hide Preview' : 'Show Preview'}</span>
            </Button>

            {/* Save Draft */}
            {onSaveDraft && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                disabled={!isDirty || isDraftSaving}
                className="flex items-center space-x-2"
              >
                <DocumentTextIcon className="w-4 h-4" />
                <span>{isDraftSaving ? 'Saving...' : 'Save Draft'}</span>
              </Button>
            )}

            {/* Close */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="p-2"
            >
              <XMarkIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center space-x-2">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
              <React.Fragment key={step}>
                <button
                  type="button"
                  onClick={() => goToStep(step)}
                  className={clsx(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                    {
                      'bg-blue-600 text-white': step === currentStep,
                      'bg-green-600 text-white': step < currentStep && isStepValid(step),
                      'bg-gray-200 text-gray-600 hover:bg-gray-300': step > currentStep,
                      'bg-red-100 text-red-600': step < currentStep && !isStepValid(step)
                    }
                  )}
                >
                  {step < currentStep && isStepValid(step) ? (
                    <CheckIcon className="w-4 h-4" />
                  ) : (
                    step
                  )}
                </button>
                {step < totalSteps && (
                  <div className={clsx(
                    'flex-1 h-1 rounded-full',
                    step < currentStep ? 'bg-green-600' : 'bg-gray-200'
                  )} />
                )}
              </React.Fragment>
            ))}
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Type & Amount</span>
            <span>Design</span>
            <span>Delivery</span>
            <span>Recipients</span>
            <span>Security</span>
            <span>Review</span>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        <form ref={formRef} onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Type & Amount */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <GiftIcon className="w-5 h-5 mr-2 text-blue-600" />
                    Gift Card Type & Amount
                  </h3>

                  {/* Gift Card Type */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Gift Card Type
                    </label>
                    <Controller
                      name="type"
                      control={control}
                      render={({ field }) => (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            { value: 'digital', label: 'Digital', icon: DevicePhoneMobileIcon, description: 'Sent via email or SMS' },
                            { value: 'physical', label: 'Physical', icon: CreditCardIcon, description: 'Mailed to recipient' },
                            { value: 'hybrid', label: 'Hybrid', icon: GiftIcon, description: 'Digital + Physical card' }
                          ].map((type) => (
                            <div
                              key={type.value}
                              className={clsx(
                                'relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200',
                                field.value === type.value
                                  ? 'border-blue-600 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              )}
                              onClick={() => field.onChange(type.value)}
                            >
                              <div className="flex items-center space-x-3">
                                <type.icon className={clsx(
                                  'w-6 h-6',
                                  field.value === type.value ? 'text-blue-600' : 'text-gray-400'
                                )} />
                                <div>
                                  <h4 className="font-medium text-gray-900">{type.label}</h4>
                                  <p className="text-sm text-gray-500">{type.description}</p>
                                </div>
                              </div>
                              {field.value === type.value && (
                                <CheckCircleIcon className="absolute top-3 right-3 w-5 h-5 text-blue-600" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    />
                    {errors.type && (
                      <p className="mt-2 text-sm text-red-600">{errors.type.message}</p>
                    )}
                  </div>

                  {/* Title */}
                  <div className="mb-6">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Gift Card Title *
                    </label>
                    <Controller
                      name="title"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="e.g., Birthday Gift Card, Thank You Gift"
                          className="w-full"
                        />
                      )}
                    />
                    {errors.title && (
                      <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <Controller
                      name="description"
                      control={control}
                      render={({ field }) => (
                        <textarea
                          {...field}
                          rows={3}
                          placeholder="Brief description of the gift card..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      )}
                    />
                  </div>

                  {/* Currency Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Currency
                    </label>
                    <Controller
                      name="currency"
                      control={control}
                      render={({ field }) => (
                        <div className="flex space-x-4">
                          {(['INR', 'USD', 'EUR'] as Currency[]).map((currency) => (
                            <button
                              key={currency}
                              type="button"
                              onClick={() => field.onChange(currency)}
                              className={clsx(
                                'px-4 py-2 border rounded-md font-medium transition-colors',
                                field.value === currency
                                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
                              )}
                            >
                              {currency}
                            </button>
                          ))}
                        </div>
                      )}
                    />
                  </div>

                  {/* Amount Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Amount
                    </label>
                    
                    {/* Denomination Selection */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Choose from preset amounts:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {availableDenominations
                          .filter(denom => denom.currency === watchedValues.currency)
                          .map((denomination) => (
                            <button
                              key={denomination.id}
                              type="button"
                              onClick={() => {
                                setValue('denominationId', denomination.id);
                                setValue('customAmount', undefined);
                                setSelectedDenomination(denomination.id);
                              }}
                              className={clsx(
                                'p-3 border rounded-lg text-center transition-all duration-200',
                                selectedDenomination === denomination.id
                                  ? 'border-blue-600 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              )}
                            >
                              <div className="font-semibold text-lg">
                                {formatCurrency(denomination.amount, denomination.currency)}
                              </div>
                              {denomination.bonus && (
                                <div className="text-xs text-green-600 mt-1">
                                  +{formatCurrency(denomination.bonus, denomination.currency)} bonus
                                </div>
                              )}
                            </button>
                          ))}
                      </div>
                    </div>

                    {/* Custom Amount */}
                    <div className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-700">Or enter custom amount:</h4>
                      </div>
                      <Controller
                        name="customAmount"
                        control={control}
                        render={({ field }) => (
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              {...field}
                              type="number"
                              min="1"
                              step="1"
                              placeholder="Enter amount"
                              className="w-full pl-10 pr-16 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                              onChange={(e) => {
                                const value = e.target.value ? Number(e.target.value) : undefined;
                                field.onChange(value);
                                if (value) {
                                  setValue('denominationId', undefined);
                                  setSelectedDenomination('');
                                }
                              }}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 text-sm">{watchedValues.currency}</span>
                            </div>
                          </div>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Design Selection */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <PaintBrushIcon className="w-5 h-5 mr-2 text-blue-600" />
                    Choose Design
                  </h3>

                  {/* Design Categories */}
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {designCategories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setSelectedDesignCategory(category)}
                          className={clsx(
                            'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                            selectedDesignCategory === category
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          )}
                        >
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Design Selection */}
                  <Controller
                    name="designId"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredDesigns.map((design) => (
                          <div
                            key={design.id}
                            className={clsx(
                              'relative p-3 border-2 rounded-lg cursor-pointer transition-all duration-200',
                              field.value === design.id
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            )}
                            onClick={() => field.onChange(design.id)}
                          >
                            <div className="aspect-w-16 aspect-h-10 mb-3">
                              <Image
                                src={design.preview}
                                alt={design.name}
                                width={300}
                                height={200}
                                className="w-full h-32 object-cover rounded-md"
                              />
                            </div>
                            <h4 className="font-medium text-gray-900 text-sm">{design.name}</h4>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {design.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            {field.value === design.id && (
                              <CheckCircleIcon className="absolute top-2 right-2 w-5 h-5 text-blue-600 bg-white rounded-full" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  />
                  {errors.designId && (
                    <p className="mt-2 text-sm text-red-600">{errors.designId.message}</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 3: Delivery Options */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <EnvelopeIcon className="w-5 h-5 mr-2 text-blue-600" />
                    Delivery Options
                  </h3>

                  {/* Delivery Method */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Delivery Method
                    </label>
                    <Controller
                      name="deliveryMethod"
                      control={control}
                      render={({ field }) => (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { value: 'email', label: 'Email', icon: EnvelopeIcon, description: 'Instant delivery' },
                            { value: 'sms', label: 'SMS', icon: DevicePhoneMobileIcon, description: 'Text message' },
                            { value: 'postal', label: 'Postal Mail', icon: MapPinIcon, description: '3-5 business days' },
                            { value: 'pickup', label: 'In-Store Pickup', icon: BuildingStorefrontIcon, description: 'Visit our store' }
                          ].map((method) => (
                            <div
                              key={method.value}
                              className={clsx(
                                'relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200',
                                field.value === method.value
                                  ? 'border-blue-600 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              )}
                              onClick={() => field.onChange(method.value)}
                            >
                              <div className="flex items-center space-x-3">
                                <method.icon className={clsx(
                                  'w-6 h-6',
                                  field.value === method.value ? 'text-blue-600' : 'text-gray-400'
                                )} />
                                <div>
                                  <h4 className="font-medium text-gray-900">{method.label}</h4>
                                  <p className="text-sm text-gray-500">{method.description}</p>
                                </div>
                              </div>
                              {field.value === method.value && (
                                <CheckCircleIcon className="absolute top-3 right-3 w-5 h-5 text-blue-600" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    />
                  </div>

                  {/* Scheduled Delivery */}
                  <div className="mb-6">
                    <Controller
                      name="scheduledDelivery"
                      control={control}
                      render={({ field }) => (
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="scheduledDelivery"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="scheduledDelivery" className="text-sm font-medium text-gray-700">
                            Schedule delivery for a specific date and time
                          </label>
                        </div>
                      )}
                    />
                  </div>

                  {/* Delivery Date & Time */}
                  {watchedValues.scheduledDelivery && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Delivery Date
                        </label>
                        <Controller
                          name="deliveryDate"
                          control={control}
                          render={({ field }) => (
                            <Input
                              type="date"
                              placeholder="Delivery date"
                              value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                              onChange={(e) => field.onChange(new Date(e.target.value))}
                              min={format(new Date(), 'yyyy-MM-dd')}
                            />
                          )}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Delivery Time (Optional)
                        </label>
                        <Controller
                          name="deliveryTime"
                          control={control}
                          render={({ field }) => (
                            <Input
                              type="time"
                              placeholder="Delivery time"
                              {...field}
                            />
                          )}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 4: Recipient Information */}
            {currentStep === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <UserIcon className="w-5 h-5 mr-2 text-blue-600" />
                    Recipient Information
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    All fields are optional. You can leave these blank and share the gift card details manually.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Recipient Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Recipient Name
                      </label>
                      <Controller
                        name="recipientName"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="Recipient's name (optional)"
                          />
                        )}
                      />
                    </div>

                    {/* Sender Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name
                      </label>
                      <Controller
                        name="senderName"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="Your name (optional)"
                          />
                        )}
                      />
                    </div>

                    {/* Recipient Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Recipient Email
                      </label>
                      <Controller
                        name="recipientEmail"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="email"
                            placeholder="Recipient's email"
                          />
                        )}
                      />
                      {errors.recipientEmail && (
                        <p className="mt-2 text-sm text-red-600">{errors.recipientEmail.message}</p>
                      )}
                    </div>

                    {/* Recipient Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Recipient Phone
                      </label>
                      <Controller
                        name="recipientPhone"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="tel"
                            placeholder="Recipient's phone (optional)"
                          />
                        )}
                      />
                    </div>
                  </div>

                  {/* Custom Message */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Personal Message
                    </label>
                    <Controller
                      name="customMessage"
                      control={control}
                      render={({ field }) => (
                        <textarea
                          {...field}
                          rows={4}
                          placeholder="Write a personal message for the recipient..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      )}
                    />
                    {errors.customMessage && (
                      <p className="mt-2 text-sm text-red-600">{errors.customMessage.message}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Security & Options */}
            {currentStep === 5 && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <ShieldCheckIcon className="w-5 h-5 mr-2 text-blue-600" />
                    Security & Advanced Options
                  </h3>

                  {/* Security Options */}
                  <Card className="p-4 mb-6">
                    <h4 className="font-medium text-gray-900 mb-4">Security Settings</h4>
                    
                    {/* Require PIN */}
                    <div className="mb-4">
                      <Controller
                        name="requiresPIN"
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                id="requiresPIN"
                                checked={field.value}
                                onChange={field.onChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor="requiresPIN" className="text-sm font-medium text-gray-700">
                                Require PIN for redemption
                              </label>
                            </div>
                            {watchedValues.requiresPIN && generatedPIN && (
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">PIN:</span>
                                <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                                  {generatedPIN}
                                </code>
                                <button
                                  type="button"
                                  onClick={() => setGeneratedPIN(generatePIN())}
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  Regenerate
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      />
                    </div>

                    {/* Expiry Options */}
                    <div className="mb-4">
                      <Controller
                        name="neverExpires"
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              id="neverExpires"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="neverExpires" className="text-sm font-medium text-gray-700">
                              Never expires
                            </label>
                          </div>
                        )}
                      />
                    </div>

                    {/* Expiry Date */}
                    {!watchedValues.neverExpires && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date
                        </label>
                        <Controller
                          name="expiryDate"
                          control={control}
                          render={({ field }) => (
                            <Input
                              type="date"
                              value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                              onChange={(e) => field.onChange(new Date(e.target.value))}
                              min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                            />
                          )}
                        />
                      </div>
                    )}
                  </Card>

                  {/* Usage Options */}
                  <Card className="p-4">
                    <h4 className="font-medium text-gray-900 mb-4">Usage Options</h4>
                    
                    <div className="space-y-4">
                      {/* Allow Partial Redemption */}
                      <Controller
                        name="allowPartialRedemption"
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                id="allowPartialRedemption"
                                checked={field.value}
                                onChange={field.onChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <div>
                                <label htmlFor="allowPartialRedemption" className="text-sm font-medium text-gray-700">
                                  Allow partial redemption
                                </label>
                                <p className="text-xs text-gray-500">Card can be used multiple times until balance is zero</p>
                              </div>
                            </div>
                          </div>
                        )}
                      />

                      {/* Allow Reloading */}
                      <Controller
                        name="allowReloading"
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                id="allowReloading"
                                checked={field.value}
                                onChange={field.onChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <div>
                                <label htmlFor="allowReloading" className="text-sm font-medium text-gray-700">
                                  Allow reloading
                                </label>
                                <p className="text-xs text-gray-500">Additional funds can be added to this card</p>
                              </div>
                            </div>
                          </div>
                        )}
                      />

                      {/* Allow Transfer */}
                      <Controller
                        name="allowTransfer"
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                id="allowTransfer"
                                checked={field.value}
                                onChange={field.onChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <div>
                                <label htmlFor="allowTransfer" className="text-sm font-medium text-gray-700">
                                  Allow transfer
                                </label>
                                <p className="text-xs text-gray-500">Card can be transferred to another person</p>
                              </div>
                            </div>
                          </div>
                        )}
                      />
                    </div>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* Step 6: Review & Confirm */}
            {currentStep === 6 && (
              <motion.div
                key="step-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CheckCircleIcon className="w-5 h-5 mr-2 text-blue-600" />
                    Review & Confirm
                  </h3>

                  {/* Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Card className="p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Gift Card Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className="capitalize">{watchedValues.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Title:</span>
                          <span>{watchedValues.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount:</span>
                          <span className="font-medium">
                            {watchedValues.customAmount 
                              ? formatCurrency(watchedValues.customAmount, watchedValues.currency)
                              : selectedDenomination 
                                ? (() => {
                                    const denom = availableDenominations.find(d => d.id === selectedDenomination);
                                    return denom ? formatCurrency(denom.amount, denom.currency) : 'Not selected';
                                  })()
                                : 'Not selected'
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Currency:</span>
                          <span>{watchedValues.currency}</span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Delivery</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Method:</span>
                          <span className="capitalize">{watchedValues.deliveryMethod}</span>
                        </div>
                        {watchedValues.scheduledDelivery && watchedValues.deliveryDate && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Scheduled:</span>
                            <span>{format(watchedValues.deliveryDate, 'MMM dd, yyyy')}</span>
                          </div>
                        )}
                        {watchedValues.recipientEmail && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Recipient:</span>
                            <span>{watchedValues.recipientEmail}</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>

                  {/* Security Summary */}
                  {(watchedValues.requiresPIN || !watchedValues.neverExpires) && (
                    <Card className="p-4 mb-6">
                      <h4 className="font-medium text-gray-900 mb-3">Security & Options</h4>
                      <div className="space-y-2 text-sm">
                        {watchedValues.requiresPIN && (
                          <div className="flex items-center space-x-2">
                            <CheckIcon className="w-4 h-4 text-green-600" />
                            <span>PIN required for redemption</span>
                          </div>
                        )}
                        {!watchedValues.neverExpires && watchedValues.expiryDate && (
                          <div className="flex items-center space-x-2">
                            <InformationCircleIcon className="w-4 h-4 text-blue-600" />
                            <span>Expires on {format(watchedValues.expiryDate, 'MMM dd, yyyy')}</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  )}

                  {/* Terms & Conditions */}
                  <Card className="p-4">
                    <Controller
                      name="termsAccepted"
                      control={control}
                      render={({ field }) => (
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            id="termsAccepted"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                          />
                          <div>
                            <label htmlFor="termsAccepted" className="text-sm font-medium text-gray-700">
                              I accept the terms and conditions *
                            </label>
                            <p className="text-xs text-gray-500 mt-1">
                              By creating this gift card, you agree to our terms of service and privacy policy. 
                              Gift cards are non-refundable and subject to our standard terms and conditions.
                            </p>
                          </div>
                        </div>
                      )}
                    />
                    {errors.termsAccepted && (
                      <p className="mt-2 text-sm text-red-600">{errors.termsAccepted.message}</p>
                    )}
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center space-x-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            <div className="flex items-center space-x-3">
              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceed}
                  className="flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!canProceed || isSubmitting}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                >
                  <CheckIcon className="w-4 h-4" />
                  <span>
                    {isSubmitting 
                      ? 'Creating...' 
                      : mode === 'create' 
                        ? 'Create Gift Card' 
                        : 'Update Gift Card'
                    }
                  </span>
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GiftCardForm;