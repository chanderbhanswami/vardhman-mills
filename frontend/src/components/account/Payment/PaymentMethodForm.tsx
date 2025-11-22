'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  WalletIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  LockClosedIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { cn } from '@/lib/utils';
import { useNotification } from '@/hooks/notification/useNotification';
import type { PaymentMethod, PaymentMethodType, PaymentProvider, CardBrand } from '@/types/payment.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface PaymentMethodFormProps {
  /** Initial payment method data (for edit mode) */
  initialData?: Partial<PaymentMethod>;
  
  /** Form mode */
  mode?: 'create' | 'edit';
  
  /** Save callback */
  onSave: (data: Partial<PaymentMethod>) => Promise<void>;
  
  /** Cancel callback */
  onCancel: () => void;
  
  /** Show set as default option */
  showSetDefault?: boolean;
  
  /** Read-only mode */
  readOnly?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

export interface FormState {
  // Common fields
  type: PaymentMethodType;
  provider: PaymentProvider;
  nickname: string;
  isDefault: boolean;
  isActive: boolean;
  
  // Card fields
  cardNumber: string;
  cardHolderName: string;
  cardExpiryMonth: string;
  cardExpiryYear: string;
  cardCvv: string;
  cardBrand?: CardBrand;
  cardType: 'credit' | 'debit' | 'prepaid';
  
  // Bank fields
  accountNumber: string;
  accountHolderName: string;
  ifscCode: string;
  bankName: string;
  accountType: 'savings' | 'current' | 'nri';
  branch: string;
  
  // UPI fields
  upiId: string;
  upiName: string;
  
  // Wallet fields
  walletId: string;
  walletPhone: string;
  walletEmail: string;
  walletProvider: string;
  
  // Validation
  termsAccepted: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PAYMENT_TYPES: Array<{ value: PaymentMethodType; label: string }> = [
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'net_banking', label: 'Net Banking' },
  { value: 'upi', label: 'UPI' },
  { value: 'digital_wallet', label: 'Digital Wallet' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
];

const CARD_PROVIDERS: PaymentProvider[] = ['visa', 'mastercard', 'amex', 'rupay'];
const BANK_PROVIDERS: PaymentProvider[] = ['sbi', 'hdfc', 'icici', 'axis', 'kotak'];
const UPI_PROVIDERS: PaymentProvider[] = ['googlepay', 'phonepe', 'paytm', 'amazon_pay'];
const WALLET_PROVIDERS: PaymentProvider[] = ['paytm', 'phonepe', 'amazon_pay', 'googlepay'];

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

const luhnCheck = (cardNumber: string): boolean => {
  const digits = cardNumber.replace(/\s/g, '');
  if (!/^\d+$/.test(digits)) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

const detectCardBrand = (number: string): CardBrand | undefined => {
  const cleaned = number.replace(/\s/g, '');
  
  if (/^4/.test(cleaned)) return 'visa';
  if (/^5[1-5]/.test(cleaned)) return 'mastercard';
  if (/^3[47]/.test(cleaned)) return 'amex';
  if (/^6(?:011|5)/.test(cleaned)) return 'discover';
  if (/^3(?:0[0-5]|[68])/.test(cleaned)) return 'diners';
  if (/^35/.test(cleaned)) return 'jcb';
  if (/^6/.test(cleaned)) return 'rupay';
  
  return undefined;
};

const formatCardNumber = (value: string): string => {
  const cleaned = value.replace(/\s/g, '');
  const groups = cleaned.match(/.{1,4}/g) || [];
  return groups.join(' ');
};

const validateIFSC = (code: string): boolean => {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(code);
};

const validateUPI = (id: string): boolean => {
  return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(id);
};

const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePhone = (phone: string): boolean => {
  const cleaned = phone.replace(/[^0-9]/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * PaymentMethodForm Component
 * 
 * Comprehensive payment method editing/creation form with features including:
 * - Support for all payment method types (card, bank, UPI, wallet, etc.)
 * - Real-time validation with visual feedback
 * - Card number formatting with Luhn algorithm
 * - Card brand auto-detection
 * - Expiry date validation
 * - CVV security handling
 * - Bank IFSC code validation
 * - UPI ID format validation
 * - Phone and email validation
 * - Nickname/alias field
 * - Set as default toggle
 * - Active/inactive status
 * - Terms acceptance
 * - Save and cancel actions
 * - Edit mode support
 * - Read-only mode
 * - Real-time error display
 * 
 * @example
 * ```tsx
 * <PaymentMethodForm
 *   mode="edit"
 *   initialData={existingMethod}
 *   onSave={handleSave}
 *   onCancel={handleCancel}
 * />
 * ```
 */
export const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({
  initialData,
  mode = 'create',
  onSave,
  onCancel,
  showSetDefault = true,
  readOnly = false,
  className,
}) => {
  // Hooks
  const toast = useNotification();

  // Initialize form state
  const [formState, setFormState] = useState<FormState>(() => ({
    type: initialData?.type || 'credit_card',
    provider: initialData?.provider || 'visa',
    nickname: initialData?.nickname || '',
    isDefault: initialData?.isDefault || false,
    isActive: initialData?.isActive !== false,
    
    // Card
    cardNumber: initialData?.cardDetails ? `•••• ${initialData.cardDetails.last4}` : '',
    cardHolderName: initialData?.cardDetails?.holderName || '',
    cardExpiryMonth: initialData?.cardDetails ? String(initialData.cardDetails.expiryMonth).padStart(2, '0') : '',
    cardExpiryYear: initialData?.cardDetails ? String(initialData.cardDetails.expiryYear) : '',
    cardCvv: '',
    cardBrand: initialData?.cardDetails?.brand,
    cardType: initialData?.cardDetails?.cardType || 'credit',
    
    // Bank
    accountNumber: initialData?.bankDetails ? `•••• ${initialData.bankDetails.accountNumber.slice(-4)}` : '',
    accountHolderName: initialData?.bankDetails?.accountHolderName || '',
    ifscCode: initialData?.bankDetails?.ifscCode || '',
    bankName: initialData?.bankDetails?.bankName || '',
    accountType: initialData?.bankDetails?.accountType || 'savings',
    branch: initialData?.bankDetails?.branchName || '',
    
    // UPI
    upiId: initialData?.walletDetails?.walletId || '',
    upiName: '',
    
    // Wallet
    walletId: initialData?.walletDetails?.walletId || '',
    walletPhone: initialData?.walletDetails?.phoneNumber || '',
    walletEmail: initialData?.walletDetails?.email || '',
    walletProvider: initialData?.provider || '',
    
    termsAccepted: mode === 'edit',
  }));

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Available providers based on type
  const availableProviders = useMemo(() => {
    switch (formState.type) {
      case 'credit_card':
      case 'debit_card':
        return CARD_PROVIDERS;
      case 'net_banking':
      case 'bank_transfer':
        return BANK_PROVIDERS;
      case 'upi':
        return UPI_PROVIDERS;
      case 'digital_wallet':
        return WALLET_PROVIDERS;
      default:
        return [];
    }
  }, [formState.type]);

  // Mark form as dirty on changes
  useEffect(() => {
    if (mode === 'create' || (mode === 'edit' && initialData)) {
      setIsDirty(true);
    }
  }, [formState, mode, initialData]);

  // Validation
  const validateField = useCallback((field: keyof FormState, value: string | boolean): string | null => {
    switch (field) {
      case 'nickname':
        if (!value || (typeof value === 'string' && !value.trim())) {
          return 'Nickname is required';
        }
        break;

      case 'cardNumber':
        if (formState.type === 'credit_card' || formState.type === 'debit_card') {
          if (!value) return 'Card number is required';
          if (!luhnCheck(value as string)) return 'Invalid card number';
        }
        break;

      case 'cardHolderName':
        if ((formState.type === 'credit_card' || formState.type === 'debit_card') && !value) {
          return 'Cardholder name is required';
        }
        break;

      case 'cardExpiryMonth':
        if ((formState.type === 'credit_card' || formState.type === 'debit_card') && !value) {
          return 'Expiry month is required';
        }
        break;

      case 'cardExpiryYear':
        if ((formState.type === 'credit_card' || formState.type === 'debit_card') && !value) {
          return 'Expiry year is required';
        }
        break;

      case 'cardCvv':
        if (mode === 'create' && (formState.type === 'credit_card' || formState.type === 'debit_card')) {
          if (!value) return 'CVV is required';
          const cvvStr = value as string;
          if (cvvStr.length < 3 || cvvStr.length > 4) return 'CVV must be 3 or 4 digits';
        }
        break;

      case 'accountNumber':
        if ((formState.type === 'net_banking' || formState.type === 'bank_transfer') && !value) {
          return 'Account number is required';
        }
        break;

      case 'accountHolderName':
        if ((formState.type === 'net_banking' || formState.type === 'bank_transfer') && !value) {
          return 'Account holder name is required';
        }
        break;

      case 'ifscCode':
        if (formState.type === 'net_banking' || formState.type === 'bank_transfer') {
          if (!value) return 'IFSC code is required';
          if (!validateIFSC(value as string)) return 'Invalid IFSC code';
        }
        break;

      case 'bankName':
        if ((formState.type === 'net_banking' || formState.type === 'bank_transfer') && !value) {
          return 'Bank name is required';
        }
        break;

      case 'upiId':
        if (formState.type === 'upi') {
          if (!value) return 'UPI ID is required';
          if (!validateUPI(value as string)) return 'Invalid UPI ID format (e.g., name@bank)';
        }
        break;

      case 'walletEmail':
        if (value && !validateEmail(value as string)) {
          return 'Invalid email address';
        }
        break;

      case 'walletPhone':
        if (formState.type === 'digital_wallet' && value && !validatePhone(value as string)) {
          return 'Invalid phone number';
        }
        break;

      case 'termsAccepted':
        if (mode === 'create' && !value) {
          return 'You must accept the terms and conditions';
        }
        break;
    }

    return null;
  }, [formState.type, mode]);

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationError[] = [];
    const fieldsToValidate: Array<keyof FormState> = ['nickname', 'termsAccepted'];

    // Add type-specific fields
    if (formState.type === 'credit_card' || formState.type === 'debit_card') {
      fieldsToValidate.push('cardNumber', 'cardHolderName', 'cardExpiryMonth', 'cardExpiryYear', 'cardCvv');
    } else if (formState.type === 'net_banking' || formState.type === 'bank_transfer') {
      fieldsToValidate.push('accountNumber', 'accountHolderName', 'ifscCode', 'bankName');
    } else if (formState.type === 'upi') {
      fieldsToValidate.push('upiId');
    } else if (formState.type === 'digital_wallet') {
      fieldsToValidate.push('walletId', 'walletEmail', 'walletPhone');
    }

    fieldsToValidate.forEach(field => {
      const value = formState[field];
      if (value !== undefined) {
        const error = validateField(field, value);
        if (error) {
          newErrors.push({ field, message: error });
        }
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  }, [formState, validateField]);

  // Handlers
  const handleFieldChange = useCallback(<K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setFormState(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    setIsDirty(true);

    // Special handling for card number
    if (field === 'cardNumber' && typeof value === 'string') {
      const formatted = formatCardNumber(value);
      const brand = detectCardBrand(formatted);
      setFormState(prev => ({
        ...prev,
        cardNumber: formatted,
        cardBrand: brand,
      }));
    }

    // Clear error for this field
    setErrors(prev => prev.filter(e => e.field !== field));
  }, []);

  const handleFieldBlur = useCallback((field: keyof FormState) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    const value = formState[field];
    if (value !== undefined) {
      const error = validateField(field, value);
      if (error) {
        setErrors(prev => {
          const filtered = prev.filter(e => e.field !== field);
          return [...filtered, { field, message: error }];
        });
      }
    }
  }, [formState, validateField]);

  const getFieldError = useCallback((field: string): string | undefined => {
    if (!touched[field]) return undefined;
    return errors.find(e => e.field === field)?.message;
  }, [errors, touched]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (readOnly) return;

    // Mark all fields as touched
    const allFields = Object.keys(formState) as Array<keyof FormState>;
    setTouched(Object.fromEntries(allFields.map(f => [f, true])));

    if (!validateForm()) {
      toast?.error('Please fix the errors in the form');
      return;
    }

    setIsSaving(true);
    try {
      const paymentMethodData: Partial<PaymentMethod> = {
        type: formState.type,
        provider: formState.provider,
        nickname: formState.nickname,
        isDefault: formState.isDefault,
        isActive: formState.isActive,
      };

      // Add type-specific details
      if (formState.type === 'credit_card' || formState.type === 'debit_card') {
        paymentMethodData.cardDetails = {
          last4: formState.cardNumber.replace(/\s/g, '').slice(-4),
          brand: formState.cardBrand || 'visa',
          expiryMonth: parseInt(formState.cardExpiryMonth),
          expiryYear: parseInt(formState.cardExpiryYear),
          holderName: formState.cardHolderName,
          cardType: formState.cardType,
          isInternational: false,
        };
      } else if (formState.type === 'net_banking' || formState.type === 'bank_transfer') {
        paymentMethodData.bankDetails = {
          accountNumber: formState.accountNumber,
          accountType: formState.accountType as 'savings' | 'current' | 'nri',
          bankName: formState.bankName,
          ifscCode: formState.ifscCode,
          accountHolderName: formState.accountHolderName,
          branchName: formState.branch,
        };
      } else if (formState.type === 'upi') {
        paymentMethodData.walletDetails = {
          walletId: formState.upiId,
          walletProvider: formState.provider,
        };
      } else if (formState.type === 'digital_wallet') {
        paymentMethodData.walletDetails = {
          walletId: formState.walletId || formState.walletPhone,
          walletProvider: formState.provider,
          phoneNumber: formState.walletPhone,
          email: formState.walletEmail,
        };
      }

      await onSave(paymentMethodData);
      toast?.success(`Payment method ${mode === 'edit' ? 'updated' : 'created'} successfully`);
      setIsDirty(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : `Failed to ${mode === 'edit' ? 'update' : 'create'} payment method`;
      toast?.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [formState, mode, onSave, readOnly, toast, validateForm]);

  const handleCancel = useCallback(() => {
    if (isDirty) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to cancel?');
      if (!confirmed) return;
    }
    onCancel();
  }, [isDirty, onCancel]);

  // Render component
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'edit' ? 'Edit' : 'Add'} Payment Method
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {readOnly ? 'View payment method details' : 'Enter your payment information securely'}
            </p>
          </div>
          {isDirty && !readOnly && (
            <Badge variant="warning" size="sm">
              Unsaved Changes
            </Badge>
          )}
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-6">
            {/* Payment Type (read-only in edit mode) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                {formState.type === 'credit_card' || formState.type === 'debit_card' ? (
                  <CreditCardIcon className="w-4 h-4 text-gray-600" />
                ) : formState.type === 'net_banking' || formState.type === 'bank_transfer' ? (
                  <BanknotesIcon className="w-4 h-4 text-gray-600" />
                ) : formState.type === 'upi' || formState.type === 'digital_wallet' ? (
                  <DevicePhoneMobileIcon className="w-4 h-4 text-gray-600" />
                ) : (
                  <WalletIcon className="w-4 h-4 text-gray-600" />
                )}
                Payment Type
              </label>
              {mode === 'edit' ? (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  <p className="font-medium text-gray-900">
                    {PAYMENT_TYPES.find(t => t.value === formState.type)?.label || formState.type}
                  </p>
                </div>
              ) : (
                <Select
                  value={formState.type}
                  onValueChange={(value) => handleFieldChange('type', value as PaymentMethodType)}
                  options={PAYMENT_TYPES}
                  disabled={readOnly}
                />
              )}
            </div>

            {/* Nickname */}
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
                Nickname <span className="text-red-500">*</span>
              </label>
              <Input
                id="nickname"
                type="text"
                value={formState.nickname}
                onChange={(e) => handleFieldChange('nickname', e.target.value)}
                onBlur={() => handleFieldBlur('nickname')}
                error={getFieldError('nickname')}
                placeholder="My Primary Card"
                disabled={readOnly}
              />
            </div>

            {/* Provider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provider
              </label>
              <Select
                value={formState.provider}
                onValueChange={(value) => handleFieldChange('provider', value as PaymentProvider)}
                options={availableProviders.map(p => ({ value: p, label: p.toUpperCase() }))}
                disabled={readOnly}
              />
            </div>

            {/* Card Fields */}
            {(formState.type === 'credit_card' || formState.type === 'debit_card') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      id="cardNumber"
                      type="text"
                      value={formState.cardNumber}
                      onChange={(e) => handleFieldChange('cardNumber', e.target.value)}
                      onBlur={() => handleFieldBlur('cardNumber')}
                      error={getFieldError('cardNumber')}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      disabled={readOnly || mode === 'edit'}
                    />
                    {formState.cardBrand && (
                      <Badge className="absolute right-3 top-1/2 -translate-y-1/2">
                        {formState.cardBrand.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="cardHolderName" className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="cardHolderName"
                    type="text"
                    value={formState.cardHolderName}
                    onChange={(e) => handleFieldChange('cardHolderName', e.target.value)}
                    onBlur={() => handleFieldBlur('cardHolderName')}
                    error={getFieldError('cardHolderName')}
                    placeholder="JOHN DOE"
                    disabled={readOnly}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Month <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formState.cardExpiryMonth}
                      onValueChange={(value) => handleFieldChange('cardExpiryMonth', String(value))}
                      options={Array.from({ length: 12 }, (_, i) => ({
                        value: String(i + 1).padStart(2, '0'),
                        label: String(i + 1).padStart(2, '0'),
                      }))}
                      placeholder="MM"
                      disabled={readOnly}
                    />
                    {getFieldError('cardExpiryMonth') && (
                      <p className="text-red-600 text-sm mt-1">{getFieldError('cardExpiryMonth')}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formState.cardExpiryYear}
                      onValueChange={(value) => handleFieldChange('cardExpiryYear', String(value))}
                      options={Array.from({ length: 20 }, (_, i) => {
                        const year = new Date().getFullYear() + i;
                        return { value: String(year), label: String(year) };
                      })}
                      placeholder="YYYY"
                      disabled={readOnly}
                    />
                    {getFieldError('cardExpiryYear') && (
                      <p className="text-red-600 text-sm mt-1">{getFieldError('cardExpiryYear')}</p>
                    )}
                  </div>

                  {mode === 'create' && (
                    <div>
                      <label htmlFor="cardCvv" className="block text-sm font-medium text-gray-700 mb-2">
                        CVV <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="cardCvv"
                        type="password"
                        value={formState.cardCvv}
                        onChange={(e) => handleFieldChange('cardCvv', e.target.value)}
                        onBlur={() => handleFieldBlur('cardCvv')}
                        error={getFieldError('cardCvv')}
                        placeholder="123"
                        maxLength={4}
                        disabled={readOnly}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Bank Fields */}
            {(formState.type === 'net_banking' || formState.type === 'bank_transfer') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Account Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="accountNumber"
                    type="text"
                    value={formState.accountNumber}
                    onChange={(e) => handleFieldChange('accountNumber', e.target.value)}
                    onBlur={() => handleFieldBlur('accountNumber')}
                    error={getFieldError('accountNumber')}
                    placeholder="Enter account number"
                    disabled={readOnly || mode === 'edit'}
                  />
                </div>

                <div>
                  <label htmlFor="accountHolderName" className="block text-sm font-medium text-gray-700 mb-2">
                    Account Holder Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="accountHolderName"
                    type="text"
                    value={formState.accountHolderName}
                    onChange={(e) => handleFieldChange('accountHolderName', e.target.value)}
                    onBlur={() => handleFieldBlur('accountHolderName')}
                    error={getFieldError('accountHolderName')}
                    placeholder="As per bank records"
                    disabled={readOnly}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="ifscCode" className="block text-sm font-medium text-gray-700 mb-2">
                      IFSC Code <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="ifscCode"
                      type="text"
                      value={formState.ifscCode}
                      onChange={(e) => handleFieldChange('ifscCode', e.target.value.toUpperCase())}
                      onBlur={() => handleFieldBlur('ifscCode')}
                      error={getFieldError('ifscCode')}
                      placeholder="SBIN0001234"
                      maxLength={11}
                      disabled={readOnly}
                    />
                  </div>

                  <div>
                    <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="bankName"
                      type="text"
                      value={formState.bankName}
                      onChange={(e) => handleFieldChange('bankName', e.target.value)}
                      onBlur={() => handleFieldBlur('bankName')}
                      error={getFieldError('bankName')}
                      placeholder="Bank name"
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <Select
                  value={formState.accountType}
                  onValueChange={(value) => handleFieldChange('accountType', value as 'savings' | 'current')}
                  options={[
                    { value: 'savings', label: 'Savings Account' },
                    { value: 'current', label: 'Current Account' },
                  ]}
                  label="Account Type"
                  disabled={readOnly}
                />

                <div>
                  <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-2">
                    Branch (Optional)
                  </label>
                  <Input
                    id="branch"
                    type="text"
                    value={formState.branch}
                    onChange={(e) => handleFieldChange('branch', e.target.value)}
                    placeholder="Branch name"
                    disabled={readOnly}
                  />
                </div>
              </motion.div>
            )}

            {/* UPI Fields */}
            {formState.type === 'upi' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="upiId" className="block text-sm font-medium text-gray-700 mb-2">
                    UPI ID <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="upiId"
                    type="text"
                    value={formState.upiId}
                    onChange={(e) => handleFieldChange('upiId', e.target.value)}
                    onBlur={() => handleFieldBlur('upiId')}
                    error={getFieldError('upiId')}
                    placeholder="yourname@upi"
                    disabled={readOnly || mode === 'edit'}
                  />
                </div>
              </motion.div>
            )}

            {/* Wallet Fields */}
            {formState.type === 'digital_wallet' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="walletId" className="block text-sm font-medium text-gray-700 mb-2">
                    Wallet ID
                  </label>
                  <Input
                    id="walletId"
                    type="text"
                    value={formState.walletId}
                    onChange={(e) => handleFieldChange('walletId', e.target.value)}
                    onBlur={() => handleFieldBlur('walletId')}
                    error={getFieldError('walletId')}
                    placeholder="Enter wallet ID"
                    disabled={readOnly || mode === 'edit'}
                  />
                </div>

                <div>
                  <label htmlFor="walletPhone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <Input
                    id="walletPhone"
                    type="tel"
                    value={formState.walletPhone}
                    onChange={(e) => handleFieldChange('walletPhone', e.target.value)}
                    onBlur={() => handleFieldBlur('walletPhone')}
                    error={getFieldError('walletPhone')}
                    placeholder="+91 9876543210"
                    disabled={readOnly}
                  />
                </div>

                <div>
                  <label htmlFor="walletEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <Input
                    id="walletEmail"
                    type="email"
                    value={formState.walletEmail}
                    onChange={(e) => handleFieldChange('walletEmail', e.target.value)}
                    onBlur={() => handleFieldBlur('walletEmail')}
                    error={getFieldError('walletEmail')}
                    placeholder="email@example.com"
                    disabled={readOnly}
                  />
                </div>
              </motion.div>
            )}

            {/* Options */}
            {!readOnly && (
              <div className="space-y-3 pt-4 border-t">
                {showSetDefault && (
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-900">Set as default</span>
                      <p className="text-sm text-gray-500">Use this as your primary payment method</p>
                    </div>
                    <Switch
                      checked={formState.isDefault}
                      onCheckedChange={(checked) => handleFieldChange('isDefault', checked)}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-900">Active</span>
                    <p className="text-sm text-gray-500">Enable this payment method for transactions</p>
                  </div>
                  <Switch
                    checked={formState.isActive}
                    onCheckedChange={(checked) => handleFieldChange('isActive', checked)}
                  />
                </div>

                {mode === 'create' && (
                  <div className="flex items-start gap-2">
                    <Switch
                      checked={formState.termsAccepted}
                      onCheckedChange={(checked) => handleFieldChange('termsAccepted', checked)}
                    />
                    <div>
                      <p className="text-sm text-gray-900">
                        I accept the <a href="/terms" className="text-primary-600 hover:underline">terms and conditions</a>
                      </p>
                      {getFieldError('termsAccepted') && (
                        <p className="text-red-600 text-xs mt-1">{getFieldError('termsAccepted')}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Security Notice */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <LockClosedIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                  Secure & Encrypted
                </p>
                <p className="text-sm text-blue-700 mt-1 flex items-start gap-2">
                  <ExclamationCircleIcon className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>All payment information is encrypted and stored securely. We comply with PCI-DSS standards.</span>
                </p>
                <p className="text-sm text-blue-700 mt-1 flex items-start gap-2">
                  <InformationCircleIcon className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Your card information is tokenized and never stored in plain text.</span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>

        {!readOnly && (
          <CardFooter>
            <div className="flex gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={isSaving || (mode === 'edit' && !isDirty)}
                loading={isSaving}
                className="flex-1"
              >
                {isSaving ? 'Saving...' : mode === 'edit' ? 'Update Payment Method' : 'Add Payment Method'}
              </Button>
            </div>
          </CardFooter>
        )}
      </form>
    </Card>
  );
};

export default PaymentMethodForm;
